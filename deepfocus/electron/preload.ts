import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  sendNotification: (title: string, body: string) => {
    ipcRenderer.send('show-notification', title, body);
  },
  updateTray: (status: string, time: string) => {
    ipcRenderer.send('update-tray', status, time);
  },
});
