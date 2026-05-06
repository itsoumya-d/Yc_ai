import { contextBridge as r, ipcRenderer as t } from "electron";
r.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  sendNotification: (e, o) => {
    t.send("show-notification", e, o);
  },
  updateTray: (e, o) => {
    t.send("update-tray", e, o);
  }
});
