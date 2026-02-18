const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('ffmpeg-static')

ffmpeg.setFfmpegPath(ffmpegPath)

function processVideo({ videoPath, audioPath, cropRect, duration, outputPath, onProgress }) {
    const { x, y, w, h } = cropRect

    return new Promise((resolve, reject) => {
        const command = ffmpeg()
            .input(videoPath)
            .input(audioPath)
            .videoFilters(`crop=${w}:${h}:${x}:${y},scale=1080:-2`)
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions([
                '-preset fast',
                '-crf 18',
                '-movflags +faststart',
                `-t ${duration}`,
                '-shortest',
            ])
            .on('progress', (info) => {
                if (onProgress && info.percent) {
                    onProgress(info.percent / 100)
                }
            })
            .on('end', resolve)
            .on('error', reject)
            .save(outputPath)
    })
}

module.exports = { processVideo }
