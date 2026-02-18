const path = require('path')
const fs = require('fs')
const os = require('os')
const appleMusic = require('./apple-music.cjs')
const { captureAudio } = require('./audio-capture.cjs')
const { createFrameEncoder, mergeVideoAudio } = require('./ffmpeg-processor.cjs')

function register(ipcMain, getWindow, dialog) {
    let cancelled = false
    let activeCaptureInterval = null

    ipcMain.handle('cancel-export', () => {
        cancelled = true
        if (activeCaptureInterval) {
            clearInterval(activeCaptureInterval)
            activeCaptureInterval = null
        }
        appleMusic.stop().catch(() => {})
    })

    ipcMain.handle('export-video', async (_, params) => {
        const win = getWindow()
        const { songName, artistName, startSeconds, endSeconds, containerRect } = params
        const duration = endSeconds - startSeconds
        const bufferTime = 1.5
        const fps = 30
        cancelled = false

        const tmpDir = path.join(os.tmpdir(), `toilet-selection-${Date.now()}`)
        fs.mkdirSync(tmpDir, { recursive: true })

        const videoPath = path.join(tmpDir, 'video.mp4')
        const audioPath = path.join(tmpDir, 'audio.m4a')
        const outputPath = path.join(tmpDir, 'output.mp4')

        const sendProgress = (stage, percent) => {
            if (!cancelled) {
                win.webContents.send('export-progress', { stage, percent })
            }
        }

        try {
            sendProgress('preparing', 5)

            const captureRect = {
                x: Math.round(containerRect.x),
                y: Math.round(containerRect.y),
                width: Math.round(containerRect.width),
                height: Math.round(containerRect.height),
            }
            console.log('[export] Capture rect (CSS):', captureRect)

            if (cancelled) throw new Error('Cancelled')

            sendProgress('playing', 10)
            console.log('[export] Playing + seeking Apple Music:', songName, 'to', Math.round(startSeconds), 's')
            const actualPos = await appleMusic.playFromPosition(songName, artistName, startSeconds)
            console.log('[export] Apple Music confirmed at position:', actualPos)

            if (cancelled) throw new Error('Cancelled')

            sendProgress('recording', 20)
            console.log('[export] Starting audio capture + frame encoder...')

            const audioCapturePromise = captureAudio(duration + bufferTime, audioPath)
                .catch((err) => {
                    console.warn('[export] Audio capture error (non-fatal):', err.message)
                    return null
                })

            const encoder = createFrameEncoder({ fps, outputPath: videoPath })

            const recordStartTime = Date.now()
            const totalRecordMs = duration * 1000
            let frameCount = 0

            activeCaptureInterval = setInterval(async () => {
                if (cancelled || !encoder.stdin.writable) return
                try {
                    const image = await win.webContents.capturePage(captureRect)
                    const jpeg = image.toJPEG(92)
                    if (encoder.stdin.writable) {
                        encoder.stdin.write(jpeg)
                        frameCount++
                    }
                } catch {}

                const elapsed = Date.now() - recordStartTime
                const pct = 20 + (elapsed / totalRecordMs) * 50
                sendProgress('recording', Math.min(pct, 70))
            }, 1000 / fps)

            await sleep(totalRecordMs)

            clearInterval(activeCaptureInterval)
            activeCaptureInterval = null
            console.log('[export] Frame capture done:', frameCount, 'frames captured')

            encoder.stdin.end()
            await encoder.promise
            console.log('[export] Frame encoding complete')

            if (cancelled) throw new Error('Cancelled')

            await appleMusic.stop()
            console.log('[export] Apple Music stopped')

            sendProgress('processing', 75)

            await audioCapturePromise
            console.log('[export] Audio capture finished')

            if (fs.existsSync(audioPath)) {
                console.log('[export] Merging video + audio...')
                await mergeVideoAudio({ videoPath, audioPath, duration, outputPath })
                console.log('[export] Merge complete')
            } else {
                console.warn('[export] No audio file, using video only')
                fs.copyFileSync(videoPath, outputPath)
            }

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
            if (activeCaptureInterval) {
                clearInterval(activeCaptureInterval)
                activeCaptureInterval = null
            }
            appleMusic.stop().catch(() => {})

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
    } catch {}
}

module.exports = { register }
