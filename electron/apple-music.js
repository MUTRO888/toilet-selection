const { execFile } = require('child_process')

function runAppleScript(script) {
    return new Promise((resolve, reject) => {
        execFile('osascript', ['-e', script], (err, stdout, stderr) => {
            if (err) {
                reject(new Error(stderr || err.message))
                return
            }
            resolve(stdout.trim())
        })
    })
}

async function playFrom(songName, artistName, startSeconds) {
    const script = `
tell application "Music"
    set matchedTracks to (every track whose name contains "${songName}" and artist contains "${artistName}")
    if (count of matchedTracks) is 0 then
        error "SONG_NOT_IN_LIBRARY"
    end if
    set targetTrack to item 1 of matchedTracks
    play targetTrack
    set player position to ${startSeconds}
end tell`

    return runAppleScript(script)
}

async function stop() {
    return runAppleScript('tell application "Music" to stop')
}

module.exports = { playFrom, stop }
