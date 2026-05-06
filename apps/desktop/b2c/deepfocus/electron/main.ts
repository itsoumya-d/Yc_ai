import { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage } from 'electron';
import { join } from 'path';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 500,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env['VITE_DEV_SERVER_URL']) {
    void mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL']);
  } else {
    void mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }
}

function createTray() {
  // Create a simple tray icon (16x16 transparent)
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('DeepFocus');

  updateTrayMenu('idle', '');

  tray.on('click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

function updateTrayMenu(status: string, time: string) {
  if (!tray) return;

  const statusLabel = status === 'focus'
    ? `Focusing — ${time}`
    : status === 'break'
      ? `Break — ${time}`
      : 'Idle';

  const contextMenu = Menu.buildFromTemplate([
    { label: `DeepFocus: ${statusLabel}`, enabled: false },
    { type: 'separator' },
    {
      label: 'Show Window',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip(`DeepFocus: ${statusLabel}`);
}

// IPC handlers
ipcMain.on('show-notification', (_event, title: string, body: string) => {
  if (Notification.isSupported()) {
    const notification = new Notification({ title, body });
    notification.show();
  }
});

ipcMain.on('update-tray', (_event, status: string, time: string) => {
  updateTrayMenu(status, time);
});

void app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
