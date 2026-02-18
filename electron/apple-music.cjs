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

function escapeAppleScript(str) {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

async function playFrom(songName, artistName, startSeconds) {
    const name = escapeAppleScript(songName)
    const artist = escapeAppleScript(artistName)

    const script = `
tell application "Music"
    set matchedTracks to (every track whose name contains "${name}" and artist contains "${artist}")
    if (count of matchedTracks) is 0 then
        set matchedTracks to (every track whose name contains "${name}")
    end if
    if (count of matchedTracks) is 0 then
        error "SONG_NOT_IN_LIBRARY"
    end if
    set targetTrack to item 1 of matchedTracks
    play targetTrack
    delay 0.5
    set player position to ${startSeconds}
    delay 0.3
    set player position to ${startSeconds}
end tell`

    return runAppleScript(script)
}

async function stop() {
    return runAppleScript('tell application "Music" to stop')
}

module.exports = { playFrom, stop }
