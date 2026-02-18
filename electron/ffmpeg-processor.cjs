const { spawn } = require('child_process')
const path = require('path')

function getFFmpegPath() {
    try {
        const staticPath = require('ffmpeg-static')
        console.log('[ffmpeg] ffmpeg-static path:', staticPath)
        return staticPath
    } catch {
        console.log('[ffmpeg] ffmpeg-static not found, using system ffmpeg')
        return 'ffmpeg'
    }
}

function processVideo({ videoPath, audioPath, cropRect, duration, outputPath, onProgress }) {
    const { x, y, w, h } = cropRect
    const ffmpegPath = getFFmpegPath()

    const args = [
        '-y',
        '-i', videoPath,
        '-i', audioPath,
        '-filter:v', `crop=${w}:${h}:${x}:${y},scale=1080:-2`,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'fast',
        '-crf', '18',
        '-movflags', '+faststart',
        '-t', String(duration),
        '-shortest',
        outputPath,
    ]

    console.log('[ffmpeg] Running:', ffmpegPath, args.join(' '))

    return new Promise((resolve, reject) => {
        const proc = spawn(ffmpegPath, args)

        let stderr = ''
        proc.stderr.on('data', (chunk) => {
            const text = chunk.toString()
            stderr += text

            const match = text.match(/time=(\d+):(\d+):(\d+\.\d+)/)
            if (match && onProgress && duration > 0) {
                const secs = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3])
                onProgress(Math.min(secs / duration, 1))
            }
        })

        proc.on('close', (code) => {
            if (code === 0) {
                resolve()
            } else {
                console.error('[ffmpeg] Full stderr output:\n', stderr)
                reject(new Error(`ffmpeg exited with code ${code}`))
            }
        })

        proc.on('error', (err) => {
            reject(new Error(`ffmpeg spawn error: ${err.message}`))
        })
    })
}

module.exports = { processVideo }
