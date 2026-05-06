import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0D1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// App lifecycle
app.whenReady().then(() => {
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

// IPC Handlers

// File system operations
ipcMain.handle('fs:selectDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: 'Select Project Directory',
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('fs:selectFile', async (_event, filters?: Electron.FileFilter[]) => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: filters || [
      { name: 'SpectraCAD Projects', extensions: ['scad'] },
      { name: 'KiCad Schematics', extensions: ['kicad_sch'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('fs:saveFile', async (_event, defaultPath?: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath,
    filters: [
      { name: 'SpectraCAD Projects', extensions: ['scad'] },
      { name: 'Gerber Files', extensions: ['zip'] },
    ],
  });
  return result.canceled ? null : result.filePath;
});

// App info
ipcMain.handle('app:getVersion', () => app.getVersion());
ipcMain.handle('app:getPlatform', () => process.platform);
ipcMain.handle('app:getPath', (_event, name: string) => {
  return app.getPath(name as Parameters<typeof app.getPath>[0]);
});

// Shell operations
ipcMain.handle('shell:openExternal', (_event, url: string) => {
  return shell.openExternal(url);
});

ipcMain.handle('shell:openPath', (_event, filePath: string) => {
  return shell.openPath(filePath);
});

// Window controls
ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.handle('window:close', () => mainWindow?.close());
ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized());
