export interface ElectronAPI {
  selectDirectory: () => Promise<string | null>;
  selectFile: (filters?: Array<{ name: string; extensions: string[] }>) => Promise<string | null>;
  saveFile: (defaultPath?: string) => Promise<string | null>;
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  getPath: (name: string) => Promise<string>;
  openExternal: (url: string) => Promise<void>;
  openPath: (path: string) => Promise<string>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
