# AgentForge Desktop - Deployment Guide

> AI Agent Builder Platform - Enterprise Deployment Documentation
> Version: 2.0 | Last Updated: 2026-02-07

---

## Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Electron Builder Configuration](#electron-builder-configuration)
4. [Platform-Specific Builds](#platform-specific-builds)
   - [macOS Build and Notarization](#macos-build-and-notarization)
   - [Windows Build and Code Signing](#windows-build-and-code-signing)
   - [Linux Packaging](#linux-packaging)
5. [Auto-Update Configuration](#auto-update-configuration)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Enterprise Distribution](#enterprise-distribution)
   - [MSI Packaging for Windows](#msi-packaging-for-windows)
   - [PKG Packaging for macOS](#pkg-packaging-for-macos)
   - [MDM Compatibility](#mdm-compatibility)
8. [SSO/SAML Configuration Deployment](#ssosaml-configuration-deployment)
9. [Multi-Tenant Backend Deployment](#multi-tenant-backend-deployment)
10. [On-Premise Deployment](#on-premise-deployment)
11. [Sandboxed Agent Execution](#sandboxed-agent-execution)
12. [Docker-Based Agent Runtime](#docker-based-agent-runtime)
13. [Security Hardening](#security-hardening)
14. [Monitoring and Logging](#monitoring-and-logging)
15. [Troubleshooting](#troubleshooting)

---

## Overview

AgentForge is an enterprise-grade AI agent builder platform distributed as an Electron desktop application. It enables teams to design, test, deploy, and monitor autonomous AI agents through a visual interface. This guide covers end-to-end deployment for both the desktop client and supporting backend infrastructure.

Key architectural components:
- **Electron Desktop Client** - Visual agent builder, debugging tools, and monitoring dashboard
- **Agent Runtime Engine** - Docker-based sandboxed execution environment for running agents
- **Backend API** - Multi-tenant REST/GraphQL API for agent orchestration and state management
- **Agent Registry** - Centralized repository for agent definitions, templates, and shared components

---

## System Requirements

### Desktop Client (Minimum)

| Component       | Requirement                          |
|-----------------|--------------------------------------|
| OS              | macOS 12+, Windows 10 (1903+), Ubuntu 20.04+ / Fedora 36+ |
| CPU             | x86_64 or ARM64, 4 cores minimum     |
| RAM             | 8 GB (16 GB recommended)            |
| Disk            | 2 GB for application, 10 GB+ for agent runtimes |
| Network         | Broadband internet (offline mode available) |
| Docker          | Docker Desktop 4.x+ (for local agent execution) |
| Node.js         | Bundled with Electron (v20 LTS)      |

### Backend Infrastructure (Production)

| Component       | Requirement                          |
|-----------------|--------------------------------------|
| Kubernetes      | v1.28+ cluster with 3+ nodes         |
| PostgreSQL      | v15+ with logical replication         |
| Redis           | v7+ cluster mode                      |
| Docker Registry | Harbor or AWS ECR                     |
| Object Storage  | S3-compatible (MinIO for on-prem)     |
| Load Balancer   | NGINX Ingress or AWS ALB              |

---

## Electron Builder Configuration

### Base Configuration

The `electron-builder.yml` file at the project root defines all build targets:

```yaml
# electron-builder.yml
appId: com.agentforge.desktop
productName: AgentForge
copyright: "Copyright 2026 AgentForge Inc."

directories:
  buildResources: build
  output: dist

files:
  - "dist-electron/**/*"
  - "dist/**/*"
  - "node_modules/**/*"
  - "!node_modules/**/*.map"
  - "!node_modules/**/test/**"
  - "!node_modules/**/docs/**"

extraResources:
  - from: "resources/agent-templates/"
    to: "agent-templates"
    filter:
      - "**/*"
  - from: "resources/docker-configs/"
    to: "docker-configs"
    filter:
      - "**/*"

asar: true
asarUnpack:
  - "node_modules/node-pty/**"
  - "node_modules/ssh2/**"
  - "resources/**"

compression: maximum

electronDownload:
  mirror: "https://artifacts.agentforge.com/electron/"

afterSign: scripts/notarize.js

publish:
  provider: generic
  url: "https://updates.agentforge.com/releases/"
  channel: stable
```

### Package.json Build Scripts

```json
{
  "scripts": {
    "build": "tsc && vite build && electron-builder build",
    "build:mac": "tsc && vite build && electron-builder build --mac",
    "build:win": "tsc && vite build && electron-builder build --win",
    "build:linux": "tsc && vite build && electron-builder build --linux",
    "build:all": "tsc && vite build && electron-builder build -mwl",
    "build:enterprise": "cross-env ENTERPRISE=true npm run build:all",
    "release": "tsc && vite build && electron-builder build --publish always"
  }
}
```

---

## Platform-Specific Builds

### macOS Build and Notarization

#### Build Configuration

```yaml
# electron-builder.yml (macOS section)
mac:
  category: public.app-category.developer-tools
  icon: build/icon.icns
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.inherit.plist
  target:
    - target: dmg
      arch:
        - x64
        - arm64
    - target: zip
      arch:
        - x64
        - arm64
    - target: pkg
      arch:
        - universal

dmg:
  sign: false
  contents:
    - x: 130
      y: 220
    - x: 410
      y: 220
      type: link
      path: /Applications

pkg:
  installLocation: /Applications
  allowCurrentUserHome: false
  allowRootDirectory: false
  isRelocatable: false
  overwriteAction: upgrade
```

#### Entitlements Configuration

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.allow-dyld-environment-variables</key>
  <true/>
  <key>com.apple.security.network.client</key>
  <true/>
  <key>com.apple.security.network.server</key>
  <true/>
  <key>com.apple.security.files.user-selected.read-write</key>
  <true/>
  <key>com.apple.security.automation.apple-events</key>
  <true/>
</dict>
</plist>
```

#### Notarization Script

```javascript
// scripts/notarize.js
const { notarize } = require('@electron/notarize');
const path = require('path');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') return;

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log(`Notarizing ${appPath}...`);

  await notarize({
    tool: 'notarytool',
    appPath,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });

  console.log('Notarization complete.');
};
```

#### Required Environment Variables

```bash
export CSC_LINK="path/to/developer-id-application.p12"
export CSC_KEY_PASSWORD="certificate-password"
export APPLE_ID="dev@agentforge.com"
export APPLE_APP_SPECIFIC_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="ABCDEF1234"
```

### Windows Build and Code Signing

#### Build Configuration

```yaml
# electron-builder.yml (Windows section)
win:
  icon: build/icon.ico
  target:
    - target: nsis
      arch:
        - x64
        - arm64
    - target: msi
      arch:
        - x64
  signingHashAlgorithms:
    - sha256
  sign: scripts/custom-sign.js
  certificateSubjectName: "AgentForge Inc."
  publisherName: "AgentForge Inc."
  rfc3161TimeStampServer: "http://timestamp.digicert.com"

nsis:
  oneClick: false
  perMachine: true
  allowToChangeInstallationDirectory: true
  deleteAppDataOnUninstall: false
  createDesktopShortcut: true
  createStartMenuShortcut: true
  menuCategory: "AgentForge"
  installerIcon: build/installer-icon.ico
  uninstallerIcon: build/uninstaller-icon.ico
  license: build/license.rtf
  include: build/nsis/installer.nsh

msi:
  perMachine: true
  runAfterFinish: false
  createDesktopShortcut: true
  createStartMenuShortcut: true
```

#### Custom Signing Script (Azure Key Vault / HSM)

```javascript
// scripts/custom-sign.js
const { execSync } = require('child_process');

exports.default = async function sign(configuration) {
  const filePath = configuration.path;

  if (!process.env.AZURE_KEY_VAULT_URL) {
    console.warn('Skipping signing - no Azure Key Vault configured');
    return;
  }

  const command = [
    'AzureSignTool sign',
    `-kvu "${process.env.AZURE_KEY_VAULT_URL}"`,
    `-kvt "${process.env.AZURE_TENANT_ID}"`,
    `-kvi "${process.env.AZURE_CLIENT_ID}"`,
    `-kvs "${process.env.AZURE_CLIENT_SECRET}"`,
    `-kvc "${process.env.AZURE_CERT_NAME}"`,
    '-tr http://timestamp.digicert.com',
    '-td sha256',
    `"${filePath}"`,
  ].join(' ');

  execSync(command, { stdio: 'inherit' });
};
```

### Linux Packaging

```yaml
# electron-builder.yml (Linux section)
linux:
  icon: build/icons
  category: Development
  synopsis: "AI Agent Builder Platform"
  description: "Build, deploy, and monitor AI agents with a visual interface"
  desktop:
    Name: AgentForge
    Comment: "AI Agent Builder Platform"
    Categories: Development;IDE;
    Keywords: "ai;agent;automation;llm;"
  target:
    - target: AppImage
      arch:
        - x64
        - arm64
    - target: deb
      arch:
        - x64
        - arm64
    - target: rpm
      arch:
        - x64

deb:
  depends:
    - libgtk-3-0
    - libnotify4
    - libnss3
    - libxss1
    - libxtst6
    - libsecret-1-0
    - docker-ce | docker.io
  afterInstall: build/linux/postinst.sh
  afterRemove: build/linux/postrm.sh
  fpm:
    - "--deb-systemd=build/linux/agentforge-agent-runtime.service"

rpm:
  depends:
    - gtk3
    - libnotify
    - nss
    - libXScrnSaver
    - libXtst
    - libsecret
    - docker-ce
  fpm:
    - "--rpm-systemd=build/linux/agentforge-agent-runtime.service"

appImage:
  artifactName: "AgentForge-${version}-${arch}.AppImage"
```

---

## Auto-Update Configuration

### Electron Updater Setup

```typescript
// src/main/updater.ts
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';
import log from 'electron-log';

export class AppUpdater {
  private mainWindow: BrowserWindow;
  private updateChannel: string;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.updateChannel = this.resolveChannel();

    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.channel = this.updateChannel;

    // Enterprise update server configuration
    if (process.env.AGENTFORGE_UPDATE_SERVER) {
      autoUpdater.setFeedURL({
        provider: 'generic',
        url: process.env.AGENTFORGE_UPDATE_SERVER,
        channel: this.updateChannel,
      });
    }

    this.setupEventHandlers();
  }

  private resolveChannel(): string {
    const envChannel = process.env.AGENTFORGE_UPDATE_CHANNEL;
    if (envChannel && ['stable', 'beta', 'alpha'].includes(envChannel)) {
      return envChannel;
    }
    return 'stable';
  }

  private setupEventHandlers(): void {
    autoUpdater.on('checking-for-update', () => {
      this.mainWindow.webContents.send('updater:checking');
    });

    autoUpdater.on('update-available', (info) => {
      this.mainWindow.webContents.send('updater:available', info);
    });

    autoUpdater.on('update-not-available', () => {
      this.mainWindow.webContents.send('updater:not-available');
    });

    autoUpdater.on('download-progress', (progress) => {
      this.mainWindow.webContents.send('updater:progress', progress);
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.mainWindow.webContents.send('updater:downloaded', info);
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: `Version ${info.version} has been downloaded. Restart to apply.`,
        buttons: ['Restart Now', 'Later'],
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });

    autoUpdater.on('error', (error) => {
      log.error('Update error:', error);
      this.mainWindow.webContents.send('updater:error', error.message);
    });
  }

  async checkForUpdates(): Promise<UpdateCheckResult | null> {
    try {
      return await autoUpdater.checkForUpdates();
    } catch (error) {
      log.error('Failed to check for updates:', error);
      return null;
    }
  }

  downloadUpdate(): void {
    autoUpdater.downloadUpdate();
  }
}
```

### Differential Updates

```yaml
# electron-builder.yml (publish and differential updates)
publish:
  provider: generic
  url: "https://updates.agentforge.com/releases/"
  channel: stable

nsis:
  differentialPackage: true

mac:
  electronUpdaterCompatibility: ">=2.16"
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/build-and-release.yml
name: Build and Release

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      channel:
        description: 'Release channel'
        required: true
        default: 'stable'
        type: choice
        options:
          - stable
          - beta
          - alpha

env:
  NODE_VERSION: '20'
  ELECTRON_CACHE: ~/.cache/electron
  ELECTRON_BUILDER_CACHE: ~/.cache/electron-builder

jobs:
  build-macos:
    runs-on: macos-14
    strategy:
      matrix:
        arch: [x64, arm64]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Build Electron (macOS)
        run: npx electron-builder --mac --${{ matrix.arch }}
        env:
          CSC_LINK: ${{ secrets.MAC_CERTIFICATE_BASE64 }}
          CSC_KEY_PASSWORD: ${{ secrets.MAC_CERTIFICATE_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - uses: actions/upload-artifact@v4
        with:
          name: macos-${{ matrix.arch }}
          path: |
            dist/*.dmg
            dist/*.zip
            dist/*.pkg

  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Build Electron (Windows)
        run: npx electron-builder --win
        env:
          AZURE_KEY_VAULT_URL: ${{ secrets.AZURE_KEY_VAULT_URL }}
          AZURE_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
          AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
          AZURE_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
          AZURE_CERT_NAME: ${{ secrets.AZURE_CERT_NAME }}

      - uses: actions/upload-artifact@v4
        with:
          name: windows-x64
          path: |
            dist/*.exe
            dist/*.msi

  build-linux:
    runs-on: ubuntu-22.04
    strategy:
      matrix:
        arch: [x64, arm64]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Build Electron (Linux)
        run: npx electron-builder --linux --${{ matrix.arch }}

      - uses: actions/upload-artifact@v4
        with:
          name: linux-${{ matrix.arch }}
          path: |
            dist/*.AppImage
            dist/*.deb
            dist/*.rpm

  publish-release:
    needs: [build-macos, build-windows, build-linux]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          path: artifacts

      - name: Publish to update server
        run: |
          for file in artifacts/**/*; do
            curl -X PUT \
              -H "Authorization: Bearer ${{ secrets.UPDATE_SERVER_TOKEN }}" \
              -F "file=@${file}" \
              "https://updates.agentforge.com/api/upload?channel=${{ github.event.inputs.channel || 'stable' }}"
          done
```

---

## Enterprise Distribution

### MSI Packaging for Windows

#### Advanced MSI Configuration with WiX

```xml
<!-- build/win/agentforge.wxs -->
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*"
           Name="AgentForge"
           Language="1033"
           Version="!(bind.FileVersion.AgentForge.exe)"
           Manufacturer="AgentForge Inc."
           UpgradeCode="A1B2C3D4-E5F6-7890-ABCD-EF1234567890">

    <Package InstallerVersion="500"
             Compressed="yes"
             InstallScope="perMachine"
             Platform="x64" />

    <MajorUpgrade DowngradeErrorMessage="A newer version is already installed." />
    <MediaTemplate EmbedCab="yes" />

    <!-- Enterprise Properties -->
    <Property Id="AGENTFORGE_LICENSE_KEY" Secure="yes" />
    <Property Id="AGENTFORGE_API_URL" Secure="yes" />
    <Property Id="AGENTFORGE_SSO_PROVIDER" Secure="yes" />
    <Property Id="AGENTFORGE_UPDATE_SERVER" Secure="yes" />

    <!-- Feature Tree -->
    <Feature Id="Core" Title="AgentForge Core" Level="1">
      <ComponentGroupRef Id="ApplicationFiles" />
      <ComponentGroupRef Id="RegistryEntries" />
    </Feature>

    <Feature Id="DockerRuntime" Title="Agent Runtime (Docker)" Level="1">
      <ComponentGroupRef Id="DockerConfigs" />
    </Feature>

    <Feature Id="AgentTemplates" Title="Agent Templates" Level="1">
      <ComponentGroupRef Id="TemplateFiles" />
    </Feature>
  </Product>
</Wix>
```

#### Silent MSI Installation

```powershell
# Enterprise silent installation with configuration
msiexec /i AgentForge-2.0.0-x64.msi /qn /l*v install.log ^
  AGENTFORGE_LICENSE_KEY="ENT-XXXX-XXXX-XXXX" ^
  AGENTFORGE_API_URL="https://api.company.agentforge.com" ^
  AGENTFORGE_SSO_PROVIDER="okta" ^
  AGENTFORGE_UPDATE_SERVER="https://updates.internal.company.com/agentforge/"

# Verify installation
reg query "HKLM\SOFTWARE\AgentForge" /v Version
```

#### Group Policy Administrative Template

```xml
<!-- build/win/agentforge.admx -->
<?xml version="1.0" encoding="utf-8"?>
<policyDefinitions revision="1.0" schemaVersion="1.0">
  <policyNamespaces>
    <target prefix="agentforge" namespace="AgentForge.Policies" />
  </policyNamespaces>
  <resources minRequiredRevision="1.0" />

  <policies>
    <policy name="UpdateServer"
            class="Machine"
            displayName="$(string.UpdateServer)"
            explainText="$(string.UpdateServer_Help)"
            key="SOFTWARE\Policies\AgentForge"
            valueName="UpdateServer">
      <parentCategory ref="AgentForgeCategory" />
      <supportedOn ref="SUPPORTED_Win10" />
      <elements>
        <text id="UpdateServerURL" valueName="UpdateServer" required="true" />
      </elements>
    </policy>

    <policy name="DisableAutoUpdate"
            class="Machine"
            displayName="$(string.DisableAutoUpdate)"
            key="SOFTWARE\Policies\AgentForge"
            valueName="DisableAutoUpdate">
      <parentCategory ref="AgentForgeCategory" />
      <enabledValue><decimal value="1" /></enabledValue>
      <disabledValue><decimal value="0" /></disabledValue>
    </policy>

    <policy name="DockerRuntimeMode"
            class="Machine"
            displayName="$(string.DockerRuntimeMode)"
            key="SOFTWARE\Policies\AgentForge"
            valueName="DockerRuntimeMode">
      <parentCategory ref="AgentForgeCategory" />
      <elements>
        <enum id="RuntimeMode" valueName="DockerRuntimeMode">
          <item displayName="$(string.RuntimeMode_Local)"><value><decimal value="0" /></value></item>
          <item displayName="$(string.RuntimeMode_Remote)"><value><decimal value="1" /></value></item>
          <item displayName="$(string.RuntimeMode_Disabled)"><value><decimal value="2" /></value></item>
        </enum>
      </elements>
    </policy>
  </policies>
</policyDefinitions>
```

### PKG Packaging for macOS

```bash
#!/bin/bash
# scripts/build-enterprise-pkg.sh

PRODUCT_NAME="AgentForge"
VERSION=$(node -p "require('./package.json').version")
IDENTIFIER="com.agentforge.desktop"

# Build the component package
pkgbuild \
  --root "dist/mac-universal/${PRODUCT_NAME}.app" \
  --install-location "/Applications/${PRODUCT_NAME}.app" \
  --identifier "${IDENTIFIER}" \
  --version "${VERSION}" \
  --scripts "build/macos/scripts" \
  --component-plist "build/macos/component.plist" \
  "dist/${PRODUCT_NAME}-component.pkg"

# Build the distribution package with choices
productbuild \
  --distribution "build/macos/distribution.xml" \
  --package-path "dist" \
  --resources "build/macos/resources" \
  --sign "Developer ID Installer: AgentForge Inc. (TEAMID)" \
  "dist/${PRODUCT_NAME}-${VERSION}-enterprise.pkg"

# Notarize the PKG
xcrun notarytool submit "dist/${PRODUCT_NAME}-${VERSION}-enterprise.pkg" \
  --apple-id "${APPLE_ID}" \
  --password "${APPLE_APP_SPECIFIC_PASSWORD}" \
  --team-id "${APPLE_TEAM_ID}" \
  --wait

xcrun stapler staple "dist/${PRODUCT_NAME}-${VERSION}-enterprise.pkg"
```

### MDM Compatibility

#### Jamf Pro Configuration Profile

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>PayloadType</key>
      <string>com.agentforge.desktop</string>
      <key>PayloadIdentifier</key>
      <string>com.agentforge.desktop.config</string>
      <key>PayloadUUID</key>
      <string>A1B2C3D4-E5F6-7890-ABCD-EF1234567890</string>
      <key>PayloadVersion</key>
      <integer>1</integer>

      <!-- AgentForge Configuration -->
      <key>LicenseKey</key>
      <string>ENT-XXXX-XXXX-XXXX</string>
      <key>ApiUrl</key>
      <string>https://api.company.agentforge.com</string>
      <key>SSOProvider</key>
      <string>okta</string>
      <key>SSOMetadataUrl</key>
      <string>https://company.okta.com/app/metadata</string>
      <key>UpdateServer</key>
      <string>https://updates.internal.company.com/agentforge/</string>
      <key>DockerRuntimeMode</key>
      <string>remote</string>
      <key>RemoteDockerHost</key>
      <string>docker.internal.company.com:2376</string>
      <key>DisableTelemetry</key>
      <true/>
      <key>AllowedAgentCapabilities</key>
      <array>
        <string>http_requests</string>
        <string>file_read</string>
        <string>database_query</string>
      </array>
    </dict>
  </array>
  <key>PayloadDisplayName</key>
  <string>AgentForge Enterprise Configuration</string>
  <key>PayloadIdentifier</key>
  <string>com.agentforge.desktop.profile</string>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>B2C3D4E5-F6A7-8901-BCDE-F12345678901</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>
```

#### Microsoft Intune Deployment

```powershell
# Intune Win32 app detection script
# scripts/intune-detection.ps1

$appPath = "C:\Program Files\AgentForge\AgentForge.exe"
$requiredVersion = [Version]"2.0.0"

if (Test-Path $appPath) {
    $fileVersion = [Version](Get-Item $appPath).VersionInfo.FileVersion
    if ($fileVersion -ge $requiredVersion) {
        Write-Host "AgentForge $fileVersion is installed"
        exit 0
    }
}
exit 1
```

---

## SSO/SAML Configuration Deployment

### SSO Integration Architecture

```typescript
// src/main/auth/sso-manager.ts
import { BrowserWindow, session } from 'electron';
import { SamlStrategy } from './strategies/saml';
import { OidcStrategy } from './strategies/oidc';

interface SSOConfig {
  provider: 'okta' | 'azure-ad' | 'onelogin' | 'custom-saml';
  metadataUrl?: string;
  entityId: string;
  assertionConsumerServiceUrl: string;
  singleLogoutServiceUrl?: string;
  certificate?: string;
  oidcDiscoveryUrl?: string;
  clientId?: string;
  clientSecret?: string;
  scopes?: string[];
  tenantId?: string;
}

export class SSOManager {
  private config: SSOConfig;
  private authWindow: BrowserWindow | null = null;

  constructor(config: SSOConfig) {
    this.config = config;
  }

  async authenticate(): Promise<AuthResult> {
    switch (this.config.provider) {
      case 'okta':
      case 'azure-ad':
      case 'onelogin':
        return this.authenticateOidc();
      case 'custom-saml':
        return this.authenticateSaml();
      default:
        throw new Error(`Unsupported SSO provider: ${this.config.provider}`);
    }
  }

  private async authenticateOidc(): Promise<AuthResult> {
    const strategy = new OidcStrategy({
      discoveryUrl: this.config.oidcDiscoveryUrl!,
      clientId: this.config.clientId!,
      scopes: this.config.scopes || ['openid', 'profile', 'email'],
    });

    this.authWindow = new BrowserWindow({
      width: 600,
      height: 700,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: 'persist:sso',
      },
    });

    return strategy.execute(this.authWindow);
  }

  private async authenticateSaml(): Promise<AuthResult> {
    const strategy = new SamlStrategy({
      metadataUrl: this.config.metadataUrl!,
      entityId: this.config.entityId,
      acsUrl: this.config.assertionConsumerServiceUrl,
      certificate: this.config.certificate,
    });

    this.authWindow = new BrowserWindow({
      width: 600,
      height: 700,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: 'persist:sso',
      },
    });

    return strategy.execute(this.authWindow);
  }
}
```

### Enterprise SSO Configuration File

```yaml
# config/sso-enterprise.yml
# Deployed via MDM or placed at:
# macOS: ~/Library/Application Support/AgentForge/sso-config.yml
# Windows: %APPDATA%\AgentForge\sso-config.yml
# Linux: ~/.config/AgentForge/sso-config.yml

sso:
  enabled: true
  provider: okta
  enforce: true  # Disable password-based login

  okta:
    domain: company.okta.com
    client_id: "0oa1b2c3d4e5f6g7h8i9"
    issuer: "https://company.okta.com/oauth2/default"
    scopes:
      - openid
      - profile
      - email
      - groups
    redirect_uri: "agentforge://auth/callback"

  attribute_mapping:
    user_id: sub
    email: email
    display_name: name
    groups: groups
    role: custom:agentforge_role

  role_mapping:
    "AgentForge-Admins": admin
    "AgentForge-Builders": builder
    "AgentForge-Viewers": viewer

  session:
    max_duration_hours: 12
    refresh_enabled: true
    idle_timeout_minutes: 60
```

---

## Multi-Tenant Backend Deployment

### Kubernetes Deployment

```yaml
# k8s/agentforge-api/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agentforge-api
  namespace: agentforge
  labels:
    app: agentforge-api
    tier: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agentforge-api
  template:
    metadata:
      labels:
        app: agentforge-api
    spec:
      serviceAccountName: agentforge-api
      containers:
        - name: api
          image: registry.agentforge.com/agentforge-api:2.0.0
          ports:
            - containerPort: 8080
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: agentforge-db
                  key: url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: agentforge-redis
                  key: url
            - name: TENANT_ISOLATION_MODE
              value: "schema"
            - name: AGENT_RUNTIME_MODE
              value: "kubernetes"
            - name: DOCKER_REGISTRY
              value: "registry.agentforge.com"
          resources:
            requests:
              cpu: "500m"
              memory: "1Gi"
            limits:
              cpu: "2000m"
              memory: "4Gi"
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health/live
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: agentforge-api
  namespace: agentforge
spec:
  selector:
    app: agentforge-api
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP
```

### Tenant Isolation Strategy

```yaml
# k8s/agentforge-api/tenant-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: tenant-config
  namespace: agentforge
data:
  tenant-isolation.yml: |
    isolation:
      mode: schema  # Options: schema, database, namespace

      schema:
        prefix: "tenant_"
        migration_on_create: true
        pool_per_tenant: false
        max_pool_size: 20

      agent_runtime:
        isolation: namespace
        resource_quotas:
          cpu: "4"
          memory: "8Gi"
          pods: "20"
        network_policies: true

      data:
        encryption_at_rest: true
        key_per_tenant: true
        backup_per_tenant: true
```

---

## On-Premise Deployment

### Docker Compose (Single-Node)

```yaml
# docker-compose.on-prem.yml
version: '3.9'

services:
  agentforge-api:
    image: registry.agentforge.com/agentforge-api:2.0.0
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: "postgresql://agentforge:${DB_PASSWORD}@postgres:5432/agentforge"
      REDIS_URL: "redis://redis:6379"
      TENANT_ISOLATION_MODE: "schema"
      AGENT_RUNTIME_MODE: "docker"
      DOCKER_HOST: "unix:///var/run/docker.sock"
      LICENSE_KEY: "${AGENTFORGE_LICENSE_KEY}"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - agent-data:/data/agents
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  agentforge-web:
    image: registry.agentforge.com/agentforge-web:2.0.0
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./certs:/etc/ssl/certs/agentforge
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - agentforge-api
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: agentforge
      POSTGRES_USER: agentforge
      POSTGRES_PASSWORD: "${DB_PASSWORD}"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U agentforge"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass "${REDIS_PASSWORD}"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  update-server:
    image: registry.agentforge.com/agentforge-update-server:2.0.0
    ports:
      - "8090:8090"
    volumes:
      - update-files:/data/releases
    environment:
      STORAGE_PATH: /data/releases
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
  agent-data:
  update-files:
```

---

## Sandboxed Agent Execution

### Agent Sandbox Architecture

AgentForge agents execute in isolated sandboxes to prevent unauthorized system access. Each agent runs inside a dedicated Docker container with restricted capabilities.

```typescript
// src/main/agent-runtime/sandbox-manager.ts
import Docker from 'dockerode';
import { AgentDefinition, SandboxConfig } from '../types';

export class SandboxManager {
  private docker: Docker;

  constructor(dockerConfig?: Docker.DockerOptions) {
    this.docker = new Docker(dockerConfig || { socketPath: '/var/run/docker.sock' });
  }

  async createSandbox(agent: AgentDefinition): Promise<SandboxInstance> {
    const config: SandboxConfig = {
      image: `agentforge/runtime:${agent.runtimeVersion}`,
      memory: agent.resourceLimits?.memory || 512 * 1024 * 1024, // 512MB default
      cpus: agent.resourceLimits?.cpus || 0.5,
      networkMode: agent.capabilities.includes('network') ? 'bridge' : 'none',
      readOnlyRootfs: true,
      noNewPrivileges: true,
      capDrop: ['ALL'],
      capAdd: agent.capabilities.includes('file_write') ? ['DAC_OVERRIDE'] : [],
      seccompProfile: 'agentforge-default.json',
      tmpfsSize: '100m',
    };

    const container = await this.docker.createContainer({
      Image: config.image,
      HostConfig: {
        Memory: config.memory,
        NanoCpus: config.cpus * 1e9,
        NetworkMode: config.networkMode,
        ReadonlyRootfs: config.readOnlyRootfs,
        SecurityOpt: [
          'no-new-privileges:true',
          `seccomp=${config.seccompProfile}`,
        ],
        CapDrop: config.capDrop,
        CapAdd: config.capAdd,
        Tmpfs: { '/tmp': `rw,noexec,nosuid,size=${config.tmpfsSize}` },
        PidsLimit: 100,
        Ulimits: [
          { Name: 'nofile', Soft: 1024, Hard: 2048 },
          { Name: 'nproc', Soft: 50, Hard: 100 },
        ],
      },
      Env: [
        `AGENT_ID=${agent.id}`,
        `AGENT_TOKEN=${agent.executionToken}`,
        `API_ENDPOINT=${process.env.AGENTFORGE_API_URL}`,
      ],
      Labels: {
        'agentforge.agent-id': agent.id,
        'agentforge.tenant-id': agent.tenantId,
        'agentforge.sandbox': 'true',
      },
    });

    await container.start();
    return new SandboxInstance(container, agent);
  }
}
```

### Seccomp Profile for Agent Sandboxes

```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": ["SCMP_ARCH_X86_64", "SCMP_ARCH_AARCH64"],
  "syscalls": [
    {
      "names": [
        "read", "write", "close", "fstat", "lseek", "mmap",
        "mprotect", "munmap", "brk", "rt_sigaction", "rt_sigprocmask",
        "ioctl", "access", "pipe", "select", "sched_yield",
        "mremap", "nanosleep", "getpid", "socket", "connect",
        "sendto", "recvfrom", "bind", "listen", "accept",
        "clone", "exit", "exit_group", "wait4", "futex",
        "epoll_create1", "epoll_ctl", "epoll_wait", "eventfd2",
        "openat", "readlinkat", "newfstatat", "getrandom"
      ],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

---

## Docker-Based Agent Runtime

### Runtime Image Build

```dockerfile
# docker/agent-runtime/Dockerfile
FROM node:20-alpine AS base

RUN apk add --no-cache \
    python3 \
    py3-pip \
    curl \
    ca-certificates \
    && addgroup -g 1001 agent \
    && adduser -u 1001 -G agent -s /bin/sh -D agent

# Install agent runtime dependencies
COPY package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --production

# Copy agent runtime engine
COPY dist/ /app/dist/
COPY resources/agent-stdlib/ /app/stdlib/

# Security: Run as non-root
USER agent

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001

ENTRYPOINT ["node", "dist/agent-runner.js"]
```

### Runtime Orchestration

```yaml
# k8s/agent-runtime/runtime-controller.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-runtime-controller
  namespace: agentforge
spec:
  replicas: 2
  selector:
    matchLabels:
      app: agent-runtime-controller
  template:
    spec:
      containers:
        - name: controller
          image: registry.agentforge.com/agent-runtime-controller:2.0.0
          env:
            - name: MAX_CONCURRENT_AGENTS
              value: "50"
            - name: AGENT_TIMEOUT_SECONDS
              value: "300"
            - name: SANDBOX_IMAGE
              value: "registry.agentforge.com/agent-runtime:2.0.0"
            - name: RESOURCE_LIMIT_CPU
              value: "500m"
            - name: RESOURCE_LIMIT_MEMORY
              value: "512Mi"
          volumeMounts:
            - name: docker-sock
              mountPath: /var/run/docker.sock
      volumes:
        - name: docker-sock
          hostPath:
            path: /var/run/docker.sock
```

---

## Security Hardening

### Electron Security Configuration

```typescript
// src/main/security.ts
import { app, session, BrowserWindow } from 'electron';

export function applySecurityHardening(mainWindow: BrowserWindow): void {
  // Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';",
          "script-src 'self';",
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' data: https:;",
          "connect-src 'self' https://*.agentforge.com wss://*.agentforge.com;",
          "font-src 'self';",
          "frame-src 'none';",
        ].join(' '),
      },
    });
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });

  // Block new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Disable remote module
  app.on('remote-require', (event) => event.preventDefault());
  app.on('remote-get-builtin', (event) => event.preventDefault());
  app.on('remote-get-global', (event) => event.preventDefault());
  app.on('remote-get-current-window', (event) => event.preventDefault());
  app.on('remote-get-current-web-contents', (event) => event.preventDefault());
}
```

---

## Monitoring and Logging

### Application Logging

```typescript
// src/main/logging.ts
import log from 'electron-log';
import { app } from 'electron';
import path from 'path';

export function configureLogging(): void {
  log.transports.file.resolvePathFn = () => {
    return path.join(app.getPath('logs'), 'agentforge.log');
  };

  log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB
  log.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} [{level}] {text}';

  // Enterprise: forward logs to centralized logging
  if (process.env.AGENTFORGE_LOG_ENDPOINT) {
    log.transports.remote = {
      level: 'warn',
      url: process.env.AGENTFORGE_LOG_ENDPOINT,
    } as any;
  }
}
```

### Health Check Endpoint

```typescript
// src/backend/health.ts
export const healthCheck = async (req: Request, res: Response) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    dockerRuntime: await checkDockerRuntime(),
    agentRegistry: await checkAgentRegistry(),
  };

  const healthy = Object.values(checks).every((c) => c.status === 'ok');

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
};
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Resolution |
|-------|-------|------------|
| Agent fails to start | Docker not running | Ensure Docker Desktop is running and accessible |
| SSO redirect loop | Incorrect callback URL | Verify `redirect_uri` matches IdP configuration |
| Sandbox timeout | Insufficient resources | Increase container memory/CPU limits |
| Update fails on macOS | Notarization issue | Re-run notarization and staple the binary |
| MSI install fails silently | Missing prerequisites | Check `install.log` for dependency errors |
| Agent network access denied | Sandbox network mode set to `none` | Add `network` capability to agent definition |

### Diagnostic Commands

```bash
# Check agent runtime status
docker ps --filter "label=agentforge.sandbox=true"

# View agent container logs
docker logs <container-id> --tail 100

# Verify Electron app configuration
# macOS
defaults read com.agentforge.desktop

# Windows
reg query "HKCU\Software\AgentForge" /s

# Check update server connectivity
curl -I https://updates.agentforge.com/releases/latest.yml

# Verify Docker socket access
docker info --format '{{.ServerVersion}}'
```

### Log File Locations

| Platform | Path |
|----------|------|
| macOS    | `~/Library/Logs/AgentForge/agentforge.log` |
| Windows  | `%APPDATA%\AgentForge\logs\agentforge.log` |
| Linux    | `~/.config/AgentForge/logs/agentforge.log` |

---

## Appendix: Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENTFORGE_API_URL` | Backend API endpoint | `https://api.agentforge.com` |
| `AGENTFORGE_LICENSE_KEY` | Enterprise license key | (none) |
| `AGENTFORGE_UPDATE_SERVER` | Custom update server URL | `https://updates.agentforge.com` |
| `AGENTFORGE_UPDATE_CHANNEL` | Update channel (stable/beta/alpha) | `stable` |
| `AGENTFORGE_SSO_PROVIDER` | SSO provider name | (none) |
| `AGENTFORGE_LOG_ENDPOINT` | Remote logging endpoint | (none) |
| `AGENTFORGE_DOCKER_HOST` | Remote Docker host for agent runtime | `unix:///var/run/docker.sock` |
| `AGENTFORGE_MAX_AGENTS` | Maximum concurrent agent sandboxes | `10` |
| `AGENTFORGE_TELEMETRY` | Enable/disable telemetry | `true` |
