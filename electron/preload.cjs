const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    exportVideo: (params) => ipcRenderer.invoke('export-video', params),
    cancelExport: () => ipcRenderer.invoke('cancel-export'),
    onExportProgress: (cb) => {
        ipcRenderer.on('export-progress', (_, data) => cb(data))
    },
})
