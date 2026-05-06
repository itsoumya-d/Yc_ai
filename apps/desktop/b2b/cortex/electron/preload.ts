import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  platform: process.platform,

  // Database operations
  loadCSV: (filePath: string) => ipcRenderer.invoke('load-csv', filePath),
  loadSQLite: (filePath: string) => ipcRenderer.invoke('load-sqlite', filePath),
  executeSQL: (sql: string) => ipcRenderer.invoke('execute-sql', sql),
  getSchema: () => ipcRenderer.invoke('get-schema'),
  dropTable: (tableName: string) => ipcRenderer.invoke('drop-table', tableName),
});
