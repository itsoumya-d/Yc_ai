export {};
declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      sendNotification?: (title: string, body: string) => void;
      updateTray?: (status: string, time: string) => void;
    };
  }
}
