'use strict';

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const DeezerConnection = require('./deezer/requests')

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
            }

        })

        // and load the index.html of the app.
        this.window.loadFile(path.join(__dirname, 'app', 'index.html'))

        if(this.whenReadyPromiseResolve != undefined) this.whenReadyPromiseResolve();
    }

    emit(channel, message) {
        console.log(channel, message);
        this.window.webContents.send(channel, message);
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
    console.log(d.credentials);
    ipcMain.handle('deezer:suggest', async (event, text) => {
        const res = await d.suggest(text);
        return res;
    });
    ipcMain.handle('deezer:query', async (event, text) => {
        const res = await d.query(text);
        return res;
    });
    ipcMain.handle('deezer:track', async (event, trackID, trackToken) => {
        console.log(trackID, trackToken);
        return await d.track(trackID, trackToken);
    });
    win.whenReady().then(() => {
        win.emit('deezer:authentificated', '');
        console.log(Date.now(), 'emitted')
    })
})


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})