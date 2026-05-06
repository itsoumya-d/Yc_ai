import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: () => ipcRenderer.invoke('dialog:saveFile'),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  platform: process.platform,
});
