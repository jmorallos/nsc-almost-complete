import {app, BrowserWindow} from "electron";

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        minHeight: 800,
        minWidth: 600,
        titleBarStyle: "hidden",
        ...(process.platform !== 'darwin' ? { titleBarOverlay: true} : {}),
        titleBarOverlay: {
            color: "#062b6e",
        },
        
        frame: false,
        webPreferences: {
            nodeIntegration: false
        },
    })

    win.loadURL("http://localhost:5173/");
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});


app.on('window-all-closed', () => {
    if (process.platform  !== 'darwin') {
        app.quit();
    }
});
