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

async function playFromPosition(songName, artistName, startSeconds) {
    const name = escapeAppleScript(songName)
    const artist = escapeAppleScript(artistName)
    const position = Math.round(startSeconds)

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
    repeat 30 times
        if player state is playing then exit repeat
        delay 0.1
    end repeat
    repeat 10 times
        set player position to ${position}
        delay 0.3
        set curPos to player position as integer
        if curPos >= ${Math.max(0, position - 2)} then exit repeat
    end repeat
    return (player position as integer) as string
end tell`

    const actualPos = await runAppleScript(script)
    console.log('[apple-music] Requested position:', position, 'Actual position:', actualPos)
    return parseInt(actualPos, 10)
}

async function stop() {
    return runAppleScript('tell application "Music" to stop')
}

module.exports = { playFromPosition, stop }
