const path = require('path')
const fs = require('fs')
const os = require('os')
const appleMusic = require('./apple-music')
const { captureAudio } = require('./audio-capture')
const { processVideo } = require('./ffmpeg-processor')

function register(ipcMain, getWindow, dialog, desktopCapturer) {
    let recordedBufferResolve = null

    ipcMain.handle('recorded-buffer', (_, buffer) => {
        if (recordedBufferResolve) {
            recordedBufferResolve(Buffer.from(buffer))
            recordedBufferResolve = null
        }
    })

    ipcMain.handle('export-video', async (_, params) => {
        const win = getWindow()
        const { songName, artistName, startSeconds, endSeconds, containerRect } = params
        const duration = endSeconds - startSeconds
        const bufferTime = 1.5

        const tmpDir = path.join(os.tmpdir(), `toilet-selection-${Date.now()}`)
        fs.mkdirSync(tmpDir, { recursive: true })

        const videoPath = path.join(tmpDir, 'video.webm')
        const audioPath = path.join(tmpDir, 'audio.m4a')
        const outputPath = path.join(tmpDir, 'output.mp4')

        const sendProgress = (stage, percent) => {
            win.webContents.send('export-progress', { stage, percent })
        }

        try {
            sendProgress('preparing', 5)

            const sources = await desktopCapturer.getSources({ types: ['window'] })
            const windowSource = sources.find(s => s.name === win.getTitle()) || sources[0]

            sendProgress('starting', 10)

            win.webContents.send('start-recording', { sourceId: windowSource.id })

            await sleep(800)

            const audioCapturePromise = captureAudio(duration + bufferTime, audioPath)

            await sleep(300)

            sendProgress('playing', 15)

            await appleMusic.playFrom(songName, artistName, startSeconds)

            await sleep(1000)

            sendProgress('recording', 20)

            const totalRecordTime = (duration + bufferTime) * 1000
            const progressInterval = setInterval(() => {
                const elapsed = Date.now() - recordStartTime
                const pct = 20 + (elapsed / totalRecordTime) * 55
                sendProgress('recording', Math.min(pct, 75))
            }, 500)
            const recordStartTime = Date.now()

            await sleep(totalRecordTime)

            clearInterval(progressInterval)

            await appleMusic.stop()

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

            fs.writeFileSync(videoPath, webmBuffer)

            await audioCapturePromise

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
            cleanup(tmpDir)
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

module.exports = { register }
