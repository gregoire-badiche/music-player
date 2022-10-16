const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('deezer', {
    suggest: (text) => ipcRenderer.invoke('deezer:suggest', text),
    onready: (callback) => ipcRenderer.on('deezer:authentificated', callback)
})

// ipcRenderer.on('deezer:authentificated', () => {
//     console.log('authhhhh');
// })

// console.log('testiing');