const path = require('path')
const fs = require('fs')
const os = require('os')
const appleMusic = require('./apple-music.cjs')
const { captureAudio } = require('./audio-capture.cjs')
const { processVideo } = require('./ffmpeg-processor.cjs')

function register(ipcMain, getWindow, dialog, desktopCapturer) {
    let recordedBufferResolve = null
    let cancelled = false
    let activeProgressInterval = null

    ipcMain.handle('recorded-buffer', (_, buffer) => {
        console.log('[export] Received buffer, type:', typeof buffer, 'constructor:', buffer?.constructor?.name, 'byteLength:', buffer?.byteLength ?? buffer?.length ?? 'N/A')
        if (recordedBufferResolve) {
            let buf
            if (Buffer.isBuffer(buffer)) {
                buf = buffer
            } else if (buffer instanceof Uint8Array || buffer instanceof ArrayBuffer) {
                buf = Buffer.from(buffer)
            } else {
                buf = Buffer.from(new Uint8Array(buffer))
            }
            console.log('[export] Converted buffer size:', buf.length, 'first bytes:', buf.slice(0, 4).toString('hex'))
            recordedBufferResolve(buf)
            recordedBufferResolve = null
        }
    })

    ipcMain.handle('cancel-export', () => {
        cancelled = true
        if (activeProgressInterval) {
            clearInterval(activeProgressInterval)
            activeProgressInterval = null
        }
        appleMusic.stop().catch(() => {})
    })

    ipcMain.handle('export-video', async (_, params) => {
        const win = getWindow()
        const { songName, artistName, startSeconds, endSeconds, containerRect } = params
        const duration = endSeconds - startSeconds
        const bufferTime = 1.5
        cancelled = false

        const tmpDir = path.join(os.tmpdir(), `toilet-selection-${Date.now()}`)
        fs.mkdirSync(tmpDir, { recursive: true })

        const videoPath = path.join(tmpDir, 'video.webm')
        const audioPath = path.join(tmpDir, 'audio.m4a')
        const outputPath = path.join(tmpDir, 'output.mp4')

        const sendProgress = (stage, percent) => {
            if (!cancelled) {
                win.webContents.send('export-progress', { stage, percent })
            }
        }

        try {
            sendProgress('preparing', 5)
            console.log('[export] Step 1: Getting window sources...')

            const sources = await desktopCapturer.getSources({ types: ['window'] })
            const windowSource = sources.find(s => s.name === win.getTitle()) || sources[0]
            console.log('[export] Step 2: Found source:', windowSource?.name, windowSource?.id)

            if (cancelled) throw new Error('Cancelled')

            sendProgress('starting', 10)
            win.webContents.send('start-recording', { sourceId: windowSource.id })
            console.log('[export] Step 3: Sent start-recording to renderer')

            await sleep(800)
            if (cancelled) throw new Error('Cancelled')

            console.log('[export] Step 4: Starting audio capture...')
            const audioCapturePromise = captureAudio(duration + bufferTime, audioPath)
                .catch((err) => {
                    console.warn('[export] Audio capture error (non-fatal):', err.message)
                    return null
                })

            await sleep(300)
            if (cancelled) throw new Error('Cancelled')

            sendProgress('playing', 15)
            console.log('[export] Step 5: Playing Apple Music:', songName, artistName, startSeconds)

            await appleMusic.playFrom(songName, artistName, startSeconds)
            console.log('[export] Step 6: Apple Music playing')

            await sleep(1000)
            if (cancelled) throw new Error('Cancelled')

            sendProgress('recording', 20)
            console.log('[export] Step 7: Recording for', duration + bufferTime, 'seconds...')

            const totalRecordTime = (duration + bufferTime) * 1000
            const recordStartTime = Date.now()
            activeProgressInterval = setInterval(() => {
                if (cancelled) return
                const elapsed = Date.now() - recordStartTime
                const pct = 20 + (elapsed / totalRecordTime) * 55
                sendProgress('recording', Math.min(pct, 75))
            }, 500)

            await sleep(totalRecordTime)

            clearInterval(activeProgressInterval)
            activeProgressInterval = null

            if (cancelled) throw new Error('Cancelled')

            await appleMusic.stop()
            console.log('[export] Step 8: Apple Music stopped')

            win.webContents.send('stop-recording')

            const webmBuffer = await new Promise((resolve) => {
                recordedBufferResolve = resolve
                setTimeout(() => {
                    if (recordedBufferResolve) {
                        recordedBufferResolve = null
                        resolve(null)
                    }
                }, 10000)
            })

            if (!webmBuffer) {
                throw new Error('Failed to receive recorded video buffer')
            }

            const alignedBuffer = alignEBMLHeader(webmBuffer)
            fs.writeFileSync(videoPath, alignedBuffer)
            console.log('[export] Step 9: Video buffer written, size:', alignedBuffer.length, 'bytes, first bytes:', alignedBuffer.slice(0, 4).toString('hex'))

            await audioCapturePromise
            console.log('[export] Step 10: Audio capture finished')

            if (cancelled) throw new Error('Cancelled')

            sendProgress('processing', 75)

            const dpr = containerRect.dpr || 2
            const cropRect = {
                x: Math.round(containerRect.x * dpr),
                y: Math.round(containerRect.y * dpr),
                w: Math.round(containerRect.width * dpr),
                h: Math.round(containerRect.height * dpr),
            }

            await processVideo({
                videoPath,
                audioPath,
                cropRect,
                duration,
                outputPath,
                onProgress: (pct) => {
                    sendProgress('processing', 75 + pct * 20)
                },
            })
            console.log('[export] Step 11: FFmpeg processing done')

            sendProgress('saving', 95)

            const safeName = (songName || 'toilet-selection').replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_')
            const { filePath } = await dialog.showSaveDialog(win, {
                defaultPath: `toilet-selection-${safeName}.mp4`,
                filters: [{ name: 'MP4 Video', extensions: ['mp4'] }],
            })

            if (filePath) {
                fs.copyFileSync(outputPath, filePath)
            }

            cleanup(tmpDir)
            sendProgress('done', 100)
            return { success: true }

        } catch (err) {
            if (activeProgressInterval) {
                clearInterval(activeProgressInterval)
                activeProgressInterval = null
            }
            appleMusic.stop().catch(() => {})
            win.webContents.send('stop-recording')

            console.error('[export-video] Error:', err.message)
            cleanup(tmpDir)

            if (err.message === 'Cancelled') {
                sendProgress('idle', 0)
                return { success: false, error: 'Cancelled' }
            }

            sendProgress('error', 0)
            return { success: false, error: err.message }
        }
    })
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function cleanup(dir) {
    try {
        fs.rmSync(dir, { recursive: true, force: true })
    } catch {
        // best-effort cleanup
    }
}

function alignEBMLHeader(buf) {
    // WebM/EBML magic: 0x1A 0x45 0xDF 0xA3
    const ebmlMagic = Buffer.from([0x1a, 0x45, 0xdf, 0xa3])
    if (buf.slice(0, 4).equals(ebmlMagic)) return buf

    const idx = buf.indexOf(ebmlMagic)
    if (idx > 0 && idx < 16) {
        console.log('[export] Stripping', idx, 'garbage bytes before EBML header')
        return buf.slice(idx)
    }
    return buf
}

module.exports = { register }
