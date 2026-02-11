export interface ElectronAPI {
  openFile: () => Promise<string | null>;
  saveFile: () => Promise<string | null>;
  getVersion: () => Promise<string>;
  platform: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
