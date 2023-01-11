const { contextBridge, ipcRenderer } = require('electron')

var isDeezerReady = false;

ipcRenderer.on('deezer:authentificated', (_event, _value) => {
    isDeezerReady = true;
})

contextBridge.exposeInMainWorld('deezer', {
    suggest: (text) => ipcRenderer.invoke('deezer:suggest', text),
    query: (text) => ipcRenderer.invoke('deezer:query', text),
    track: (trackID, trackToken) => ipcRenderer.invoke('deezer:track', trackID, trackToken),
    onready: (callback) => {
        if(isDeezerReady) {
            callback()
        } else {
            ipcRenderer.on('deezer:authentificated', callback);
        }
    }
})

contextBridge.exposeInMainWorld('back', {
    resizeWindow: (h) => ipcRenderer.invoke('main:forceHeightResize', h)
})