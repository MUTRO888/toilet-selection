const { spawn } = require('child_process')

function getFFmpegPath() {
    try {
        const staticPath = require('ffmpeg-static')
        return staticPath
    } catch {
        return 'ffmpeg'
    }
}

function createFrameEncoder({ fps, outputPath }) {
    const ffmpegPath = getFFmpegPath()
    const args = [
        '-y',
        '-f', 'image2pipe',
        '-framerate', String(fps),
        '-i', 'pipe:0',
        '-vf', 'scale=1080:-2',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'fast',
        '-crf', '18',
        outputPath,
    ]

    console.log('[ffmpeg] Frame encoder:', ffmpegPath, args.join(' '))
    const proc = spawn(ffmpegPath, args)

    let stderr = ''
    proc.stderr.on('data', (chunk) => {
        stderr += chunk.toString()
    })

    const promise = new Promise((resolve, reject) => {
        proc.on('close', (code) => {
            if (code === 0) {
                resolve()
            } else {
                console.error('[ffmpeg] Frame encoder stderr:\n', stderr)
                reject(new Error(`Frame encoder exited with code ${code}`))
            }
        })
        proc.on('error', reject)
    })

    return { stdin: proc.stdin, promise }
}

function mergeVideoAudio({ videoPath, audioPath, duration, outputPath, onProgress }) {
    const ffmpegPath = getFFmpegPath()
    const args = [
        '-y',
        '-i', videoPath,
        '-i', audioPath,
        '-c', 'copy',
        '-movflags', '+faststart',
        '-t', String(duration),
        '-shortest',
        outputPath,
    ]

    console.log('[ffmpeg] Merge:', ffmpegPath, args.join(' '))

    return new Promise((resolve, reject) => {
        const proc = spawn(ffmpegPath, args)

        let stderr = ''
        proc.stderr.on('data', (chunk) => {
            stderr += chunk.toString()
        })

        proc.on('close', (code) => {
            if (code === 0) {
                resolve()
            } else {
                console.error('[ffmpeg] Merge stderr:\n', stderr)
                reject(new Error(`Merge exited with code ${code}`))
            }
        })

        proc.on('error', reject)
    })
}

module.exports = { createFrameEncoder, mergeVideoAudio }
