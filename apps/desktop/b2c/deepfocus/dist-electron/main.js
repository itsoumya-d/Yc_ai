import { ipcMain as c, Notification as r, app as l, BrowserWindow as p, nativeImage as f, Tray as h, Menu as w } from "electron";
import { join as s } from "path";
let e = null, n = null;
function u() {
  e = new p({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 500,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: s(__dirname, "preload.js"),
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), process.env.VITE_DEV_SERVER_URL ? e.loadURL(process.env.VITE_DEV_SERVER_URL) : e.loadFile(s(__dirname, "../dist/index.html"));
}
function _() {
  const t = f.createEmpty();
  n = new h(t), n.setToolTip("DeepFocus"), d("idle", ""), n.on("click", () => {
    e == null || e.show(), e == null || e.focus();
  });
}
function d(t, o) {
  if (!n) return;
  const i = t === "focus" ? `Focusing — ${o}` : t === "break" ? `Break — ${o}` : "Idle", a = w.buildFromTemplate([
    { label: `DeepFocus: ${i}`, enabled: !1 },
    { type: "separator" },
    {
      label: "Show Window",
      click: () => {
        e == null || e.show(), e == null || e.focus();
      }
    },
    { type: "separator" },
    { label: "Quit", click: () => l.quit() }
  ]);
  n.setContextMenu(a), n.setToolTip(`DeepFocus: ${i}`);
}
c.on("show-notification", (t, o, i) => {
  r.isSupported() && new r({ title: o, body: i }).show();
});
c.on("update-tray", (t, o, i) => {
  d(o, i);
});
l.whenReady().then(() => {
  u(), _();
});
l.on("window-all-closed", () => {
  process.platform !== "darwin" && l.quit();
});
l.on("activate", () => {
  p.getAllWindows().length === 0 && u();
});
