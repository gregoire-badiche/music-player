'use strict';

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const DeezerConnection = require('./deezer/main')

class Window {
    constructor(app) {
        this.isReady = false;
        app.whenReady().then(() => {
            // Creates window on startup
            this.createWindow();

            this.isReady = true;

            app.on('activate', () => {
                // Recreates window when the icon is clicked
                this.createWindow();
            })
        })
    }

    createWindow() {
        // Create the browser window.
        this.window = new BrowserWindow({
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            },
            // frame: false,
            // transparent: true

        })

        console.log('creating window');

        // and load the index.html of the app.
        this.window.loadFile(path.join(__dirname, 'app', 'index.html'))

        if(this.whenReadyPromiseResolve != undefined) this.whenReadyPromiseResolve();
    }

    emit(channel, message) {
        this.window.webContents.send(channel, message);
    }

    resize(w, h) {
        this.window.setSize(w, h);
    }

    forceHeightResize(h) {
        this.window.setMaximumSize(5000, h)
        this.window.setMinimumSize(350, h)
    }

    whenReady() {
        if (this.isReady) {
            return new Promise((resolve, reject) => {
                resolve();
            })
        } else {
            return new Promise((resolve, reject) => {
                this.whenReadyPromiseResolve = resolve;
            })
        }
    }
}

const win =  new Window(app);

const conn = new DeezerConnection();

conn.auth().then(d => {
    ipcMain.handle('deezer:suggest', async (_event, text) => {
        const res = await d.suggest(text);
        return res;
    });
    ipcMain.handle('deezer:query', async (_event, text) => {
        const res = await d.query(text);
        return res;
    });
    ipcMain.handle('deezer:track', async (_event, trackID, trackToken) => {
        return await d.track(trackID, trackToken);
    });
    ipcMain.handle('main:forceHeightResize', (_event, height) => {
        win.forceHeightResize(height);
    })
    win.whenReady().then(() => {
        win.emit('deezer:authentificated', '');
        // win.forceHeightResize(160)
    })
})


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})