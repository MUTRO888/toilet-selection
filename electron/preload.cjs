const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    exportVideo: (params) => ipcRenderer.invoke('export-video', params),
    cancelExport: () => ipcRenderer.invoke('cancel-export'),
    onStartRecording: (cb) => {
        ipcRenderer.on('start-recording', (_, data) => cb(data))
    },
    onStopRecording: (cb) => {
        ipcRenderer.on('stop-recording', () => cb())
    },
    onExportProgress: (cb) => {
        ipcRenderer.on('export-progress', (_, data) => cb(data))
    },
    sendRecordedBuffer: (buffer) => ipcRenderer.invoke('recorded-buffer', new Uint8Array(buffer)),
})
