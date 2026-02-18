const { app, BrowserWindow, ipcMain, dialog, desktopCapturer } = require('electron')
const path = require('path')

let mainWindow
const isDev = !app.isPackaged

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    })

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173')
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }
}

app.whenReady().then(() => {
    createWindow()
    const handlers = require('./ipc-handlers.cjs')
    handlers.register(ipcMain, () => mainWindow, dialog, desktopCapturer)
})

app.on('window-all-closed', () => app.quit())
