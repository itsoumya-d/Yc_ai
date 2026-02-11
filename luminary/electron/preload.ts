import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  platform: process.platform,
});
