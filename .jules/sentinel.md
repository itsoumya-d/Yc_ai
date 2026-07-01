## 2024-05-18 - [Electron Sandbox Enabled]
**Vulnerability:** Electron apps explicitly disabling the sandbox (sandbox: false).
**Learning:** Even with contextIsolation and nodeIntegration set correctly, disabling the sandbox removes a critical OS-level security layer in Electron apps.
**Prevention:** Ensure all Electron apps have sandbox: true or leave it default (true).
