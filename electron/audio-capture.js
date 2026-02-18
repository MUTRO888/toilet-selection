const { spawn } = require('child_process')
const path = require('path')

function captureAudio(duration, outputPath) {
    const binaryPath = path.join(__dirname, '..', 'swift', 'audio-capture')

    return new Promise((resolve, reject) => {
        const proc = spawn(binaryPath, [
            '--app-name', 'Music',
            '--duration', String(duration),
            '--output', outputPath,
        ])

        let stderr = ''
        proc.stderr.on('data', (chunk) => {
            stderr += chunk.toString()
        })

        proc.on('close', (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject(new Error(`Audio capture exited with code ${code}: ${stderr}`))
            }
        })

        proc.on('error', reject)
    })
}

module.exports = { captureAudio }
