import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // File system
  selectDirectory: () => ipcRenderer.invoke('fs:selectDirectory'),
  selectFile: (filters?: Electron.FileFilter[]) => ipcRenderer.invoke('fs:selectFile', filters),
  saveFile: (defaultPath?: string) => ipcRenderer.invoke('fs:saveFile', defaultPath),

  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
  getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),

  // Shell
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  openPath: (path: string) => ipcRenderer.invoke('shell:openPath', path),

  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
});
