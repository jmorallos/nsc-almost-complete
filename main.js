import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './src/database/db.js';
import { registerAllIpc } from './src/ipc/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow = null;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        minHeight: 800,
        minWidth: 600,
        titleBarStyle: 'hidden',
        ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
        titleBarOverlay: {
            color: '#062b6e',
        },
        frame: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
        },
    });

    const devUrl = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173/';
    mainWindow.loadURL(devUrl);
};

app.whenReady().then(() => {
    initDatabase(app.getPath('userData'));
    registerAllIpc();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
