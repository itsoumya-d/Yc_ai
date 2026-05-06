import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0C0A09',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env['VITE_DEV_SERVER_URL']) {
    mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL']);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (mainWindow === null) createWindow(); });

ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: '3D Models', extensions: ['stl', 'obj', '3mf', 'step'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('save-file', async () => {
  const result = await dialog.showSaveDialog({
    filters: [
      { name: 'STL File', extensions: ['stl'] },
      { name: 'OBJ File', extensions: ['obj'] },
      { name: '3MF File', extensions: ['3mf'] },
    ],
  });
  return result.canceled ? null : result.filePath;
});

ipcMain.handle('get-version', () => app.getVersion());
ipcMain.handle('get-platform', () => process.platform);
