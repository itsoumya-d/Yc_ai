# Deployment Guide — Luminary

## Overview

Luminary is an AI-powered desktop writing application built with Electron that provides intelligent writing assistance, grammar correction, style suggestions, and content generation. The application bundles local LLM models for offline inference, integrates licensed font libraries for document rendering, and connects to a Supabase backend for cloud sync and user management.

This guide covers the complete deployment pipeline from local development builds through production distribution across macOS, Windows, and Linux, with special attention to LLM model bundling, font licensing compliance, and auto-update strategies.

## Prerequisites

### Development Environment
- Node.js 20 LTS or later
- npm 10+ or yarn 1.22+
- Python 3.10+ (required for native module compilation)
- Git with LFS enabled (for model files)

### Platform-Specific Requirements
- **macOS**: Xcode Command Line Tools, Apple Developer ID certificate
- **Windows**: Visual Studio Build Tools 2022, Microsoft Partner Center account, EV Code Signing certificate
- **Linux**: dpkg, rpm-build, snapcraft (for Snap Store publishing)

### Accounts and Certificates
- Apple Developer Program membership ($99/year) for macOS notarization
- Microsoft Partner Center account for Windows Store submission
- EV Code Signing certificate from DigiCert, Sectigo, or GlobalSign
- GitHub repository with Actions enabled for CI/CD
- Supabase project (production instance)
- Sentry account for crash reporting
- PostHog account for product analytics

### Model and Font Assets
- Local LLM model files (GGUF format, stored in Git LFS)
- Font license agreements for all bundled typefaces
- Font file inventory with license type annotations

## Build Configuration

### electron-builder.yml

```yaml
appId: com.luminary.desktop
productName: Luminary
directories:
  output: dist
  buildResources: build

files:
  - "dist-electron/**/*"
  - "dist/**/*"
  - "node_modules/**/*"
  - "models/**/*"
  - "fonts/**/*"

extraResources:
  - from: "models/"
    to: "models/"
    filter:
      - "**/*.gguf"
      - "**/*.json"
  - from: "fonts/"
    to: "fonts/"
    filter:
      - "**/*.ttf"
      - "**/*.otf"
      - "**/*.woff2"
      - "LICENSE*"

asar: true
asarUnpack:
  - "node_modules/node-llama-cpp/**"
  - "node_modules/sharp/**"

mac:
  category: public.app-category.productivity
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  notarize:
    teamId: ${env.APPLE_TEAM_ID}
  target:
    - target: dmg
      arch:
        - x64
        - arm64
    - target: zip
      arch:
        - x64
        - arm64
  icon: build/icon.icns
  darkModeSupport: true
  minimumSystemVersion: "12.0"

dmg:
  sign: false
  contents:
    - x: 410
      y: 150
      type: link
      path: /Applications
    - x: 130
      y: 150
      type: file

win:
  target:
    - target: nsis
      arch:
        - x64
        - arm64
    - target: msi
  icon: build/icon.ico
  signingHashAlgorithms:
    - sha256
  certificateSubjectName: "Luminary Software Inc."
  publisherName: "Luminary Software Inc."

nsis:
  oneClick: false
  perMachine: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  installerIcon: build/installerIcon.ico
  uninstallerIcon: build/uninstallerIcon.ico
  installerSidebar: build/installerSidebar.bmp
  license: LICENSE.txt
  differentialPackage: true

msi:
  oneClick: false
  perMachine: true

linux:
  target:
    - target: AppImage
    - target: deb
    - target: rpm
  icon: build/icons
  category: Office
  desktop:
    StartupWMClass: luminary
  synopsis: AI-Powered Writing Assistant
  description: >
    Luminary is an intelligent writing application with local AI models
    for grammar correction, style suggestions, and content generation.

appImage:
  artifactName: "Luminary-${version}-${arch}.AppImage"

deb:
  depends:
    - libgtk-3-0
    - libnotify4
    - libnss3
    - libxss1
    - libxtst6
    - xdg-utils
  afterInstall: build/linux/after-install.sh

rpm:
  depends:
    - gtk3
    - libnotify
    - nss
    - libXScrnSaver
    - libXtst
    - xdg-utils

publish:
  provider: github
  owner: luminary-app
  repo: luminary-desktop
  releaseType: release
```

### entitlements.mac.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.disable-library-validation</key>
  <true/>
  <key>com.apple.security.network.client</key>
  <true/>
  <key>com.apple.security.files.user-selected.read-write</key>
  <true/>
  <key>com.apple.security.files.downloads.read-write</key>
  <true/>
</dict>
</plist>
```

### package.json Scripts

```json
{
  "scripts": {
    "build": "vite build && electron-builder build",
    "build:mac": "vite build && electron-builder build --mac",
    "build:win": "vite build && electron-builder build --win",
    "build:linux": "vite build && electron-builder build --linux",
    "build:all": "vite build && electron-builder build --mac --win --linux",
    "publish": "vite build && electron-builder build --publish always",
    "publish:mac": "vite build && electron-builder build --mac --publish always",
    "publish:win": "vite build && electron-builder build --win --publish always",
    "publish:linux": "vite build && electron-builder build --linux --publish always",
    "models:download": "node scripts/download-models.js",
    "models:validate": "node scripts/validate-models.js",
    "fonts:audit": "node scripts/audit-font-licenses.js",
    "postinstall": "electron-builder install-app-deps"
  }
}
```

## Local LLM Model Bundling

### Model Selection and Preparation

Luminary bundles quantized LLM models in GGUF format for offline inference. Models are stored in Git LFS and included as extra resources in the application bundle.

#### Model inventory

```
models/
  grammar/
    grammar-check-7b-q4_k_m.gguf    # ~4.0 GB - Grammar correction
    grammar-check-3b-q4_k_m.gguf    # ~1.8 GB - Lightweight grammar
  style/
    style-suggest-3b-q4_k_m.gguf    # ~1.8 GB - Style suggestions
  generation/
    content-gen-7b-q4_k_m.gguf      # ~4.0 GB - Content generation
    content-gen-3b-q4_k_m.gguf      # ~1.8 GB - Lightweight generation
  config/
    model-registry.json              # Model metadata and checksums
```

#### model-registry.json

```json
{
  "models": [
    {
      "id": "grammar-7b",
      "file": "grammar/grammar-check-7b-q4_k_m.gguf",
      "size": 4294967296,
      "sha256": "abc123...",
      "minRam": 8192,
      "recommended": true,
      "capabilities": ["grammar", "spelling", "punctuation"]
    },
    {
      "id": "grammar-3b",
      "file": "grammar/grammar-check-3b-q4_k_m.gguf",
      "size": 1932735283,
      "sha256": "def456...",
      "minRam": 4096,
      "recommended": false,
      "capabilities": ["grammar", "spelling"]
    }
  ]
}
```

### Model Download Strategy

For initial distribution, smaller models (3B parameter) are bundled with the installer. Larger models are downloaded on first launch or on-demand to keep installer size manageable.

```javascript
// scripts/download-models.js
const BUNDLED_MODELS = ['grammar-3b', 'style-3b'];
const OPTIONAL_MODELS = ['grammar-7b', 'content-gen-7b', 'content-gen-3b'];
```

### Runtime Model Loading

```javascript
// main/model-manager.ts
import { app } from 'electron';
import path from 'path';

export function getModelsPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'models');
  }
  return path.join(__dirname, '..', 'models');
}

export async function validateModelIntegrity(modelId: string): Promise<boolean> {
  const registry = loadModelRegistry();
  const model = registry.models.find(m => m.id === modelId);
  if (!model) return false;

  const filePath = path.join(getModelsPath(), model.file);
  const hash = await computeSha256(filePath);
  return hash === model.sha256;
}
```

### Platform-Specific Model Considerations

- **macOS ARM64**: Models leverage Metal acceleration via llama.cpp. Ensure the Metal framework is available.
- **macOS x64**: Falls back to CPU inference with AVX2 optimizations.
- **Windows**: CUDA acceleration if NVIDIA GPU is available, otherwise CPU with AVX2.
- **Linux**: Vulkan acceleration where available, CPU fallback with AVX2/AVX-512.

## Font Licensing

### Font License Compliance

All fonts bundled with Luminary must have licenses that permit desktop application distribution. Maintain a font inventory file that tracks each font and its license type.

#### fonts/FONT_INVENTORY.json

```json
{
  "fonts": [
    {
      "family": "Inter",
      "files": ["Inter-Regular.ttf", "Inter-Bold.ttf", "Inter-Italic.ttf"],
      "license": "OFL-1.1",
      "source": "https://github.com/rsms/inter",
      "bundlingPermitted": true
    },
    {
      "family": "JetBrains Mono",
      "files": ["JetBrainsMono-Regular.ttf"],
      "license": "OFL-1.1",
      "source": "https://github.com/JetBrains/JetBrainsMono",
      "bundlingPermitted": true
    },
    {
      "family": "Literata",
      "files": ["Literata-Regular.ttf", "Literata-Bold.ttf", "Literata-Italic.ttf"],
      "license": "OFL-1.1",
      "source": "https://github.com/googlefonts/literata",
      "bundlingPermitted": true
    }
  ]
}
```

### Font License Audit Script

```javascript
// scripts/audit-font-licenses.js
const PERMITTED_LICENSES = ['OFL-1.1', 'Apache-2.0', 'MIT', 'CC0-1.0'];

async function auditFonts() {
  const inventory = require('../fonts/FONT_INVENTORY.json');
  const violations = [];

  for (const font of inventory.fonts) {
    if (!PERMITTED_LICENSES.includes(font.license)) {
      violations.push(`${font.family}: License ${font.license} not in permitted list`);
    }
    if (!font.bundlingPermitted) {
      violations.push(`${font.family}: Bundling not explicitly permitted`);
    }
    // Verify font files exist
    for (const file of font.files) {
      if (!fs.existsSync(path.join('fonts', file))) {
        violations.push(`${font.family}: Missing file ${file}`);
      }
    }
  }

  if (violations.length > 0) {
    console.error('Font license violations found:');
    violations.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }
  console.log('All font licenses validated successfully.');
}
```

## macOS Deployment

### Code Signing and Notarization

#### Certificate Setup

1. Create a Developer ID Application certificate in the Apple Developer portal.
2. Export the certificate as a .p12 file.
3. Store the certificate in CI/CD secrets:
   - `APPLE_CERTIFICATE_BASE64`: Base64-encoded .p12 file
   - `APPLE_CERTIFICATE_PASSWORD`: Password for the .p12 file
   - `APPLE_TEAM_ID`: Your Apple Developer Team ID
   - `APPLE_ID`: Apple ID email for notarization
   - `APPLE_APP_SPECIFIC_PASSWORD`: App-specific password for notarization

#### Hardened Runtime Configuration

The hardened runtime entitlements are critical for Luminary because the LLM inference engine requires JIT compilation and unsigned executable memory. These entitlements must be declared in `build/entitlements.mac.plist` (shown above).

#### Notarization Process

electron-builder handles notarization automatically when configured. The process:

1. Build the application bundle (.app)
2. Sign with Developer ID Application certificate
3. Submit to Apple notarization service
4. Wait for approval (typically 2-15 minutes)
5. Staple the notarization ticket to the .app bundle
6. Package into DMG

#### Universal Binary Considerations

Luminary ships universal binaries (x64 + arm64) for macOS. The native LLM inference module (node-llama-cpp) must be compiled for both architectures.

```bash
# Build for both architectures
npm run build:mac -- --arch=universal
```

### macOS Distribution Channels

1. **Direct Download (DMG)**: Primary distribution via website and GitHub Releases.
2. **Homebrew Cask**: Submit a cask formula for Homebrew users.
3. **Mac App Store** (optional): Requires additional sandbox entitlements and App Store review.

## Windows Deployment

### Code Signing (Authenticode)

#### EV Code Signing Certificate

An Extended Validation (EV) certificate is strongly recommended for Windows distribution. EV certificates provide immediate SmartScreen reputation, preventing the "Windows protected your PC" warning.

#### Certificate Types
- **EV Certificate (recommended)**: Immediate SmartScreen trust, hardware token required
- **Standard OV Certificate**: Builds SmartScreen reputation over time, software-based

#### SignTool Integration

electron-builder integrates with Windows SignTool automatically. Configure the signing certificate:

```yaml
# electron-builder.yml (Windows signing)
win:
  signingHashAlgorithms:
    - sha256
  certificateFile: ${env.WIN_CERT_FILE}
  certificatePassword: ${env.WIN_CERT_PASSWORD}
```

For cloud-based EV signing (e.g., Azure Trusted Signing or DigiCert KeyLocker):

```yaml
win:
  azureSignOptions:
    endpoint: https://eus.codesigning.azure.net
    certificateProfileName: LuminaryProfile
```

### Windows Distribution Channels

1. **NSIS Installer**: Primary distribution for consumer users. Supports per-user and per-machine installation.
2. **MSI Installer**: Enterprise distribution, compatible with Group Policy deployment.
3. **Microsoft Store** (optional): Requires MSIX packaging and Store submission.
4. **Winget**: Submit a manifest to the Windows Package Manager community repository.

### Windows-Specific Model Path Handling

```javascript
// Windows long path support for model files
import { app } from 'electron';

function getWindowsModelsPath(): string {
  const basePath = path.join(app.getPath('userData'), 'models');
  // Use extended-length path prefix for paths > 260 chars
  if (process.platform === 'win32' && basePath.length > 200) {
    return `\\\\?\\${basePath}`;
  }
  return basePath;
}
```

## Linux Deployment

### Package Formats

#### AppImage (Universal)
- Self-contained, runs on most Linux distributions
- No installation required, single executable file
- Largest file size due to bundled dependencies
- Best for direct download distribution

#### .deb (Debian/Ubuntu)
- Native package format for Debian-based distributions
- Integrates with system package manager
- Handles dependencies automatically
- Post-install script registers MIME types and desktop entry

#### .rpm (Fedora/RHEL)
- Native package format for Red Hat-based distributions
- Integrates with DNF/YUM package manager
- Handles dependencies automatically

#### Snap (Optional)
- Sandboxed distribution via Snap Store
- Automatic updates managed by snapd
- Requires snapcraft.yaml configuration

### Linux-Specific Considerations

- **GPU acceleration**: Vulkan support for LLM inference on AMD/Intel GPUs
- **Wayland vs X11**: Test on both display servers
- **Font rendering**: Ensure bundled fonts render correctly with fontconfig
- **AppArmor/SELinux**: Test with security modules enabled
- **Sandboxing**: Electron sandbox may conflict with some Linux security policies

```yaml
# snapcraft.yaml
name: luminary
version: '1.0.0'
summary: AI-Powered Writing Assistant
description: |
  Luminary is an intelligent writing application with local AI models
  for grammar correction, style suggestions, and content generation.
base: core22
grade: stable
confinement: strict

apps:
  luminary:
    command: luminary
    extensions: [gnome]
    plugs:
      - home
      - network
      - opengl
      - desktop

parts:
  luminary:
    plugin: dump
    source: dist/luminary-linux-x64/
```

## Auto-Update System

### electron-updater Configuration

```typescript
// main/updater.ts
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import { BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';

autoUpdater.logger = log;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Update channels: stable, beta, alpha
autoUpdater.channel = getUpdateChannel();

function getUpdateChannel(): string {
  const settings = loadSettings();
  return settings.updateChannel || 'stable';
}

export function initAutoUpdater(mainWindow: BrowserWindow): void {
  // Check for updates on launch (with 30-second delay)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(err => {
      log.error('Update check failed:', err);
    });
  }, 30000);

  // Check for updates every 4 hours
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(err => {
      log.error('Periodic update check failed:', err);
    });
  }, 4 * 60 * 60 * 1000);

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes,
      releaseDate: info.releaseDate,
    });
  });

  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update-download-progress', {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('update-downloaded', {
      version: info.version,
    });
  });

  autoUpdater.on('error', (error) => {
    mainWindow.webContents.send('update-error', {
      message: error.message,
    });
  });

  ipcMain.handle('update:download', () => autoUpdater.downloadUpdate());
  ipcMain.handle('update:install', () => autoUpdater.quitAndInstall());
  ipcMain.handle('update:check', () => autoUpdater.checkForUpdates());
}
```

### Differential Updates

electron-updater supports differential (delta) updates to minimize download sizes. Configure in electron-builder:

```yaml
nsis:
  differentialPackage: true
```

This generates `.blockmap` files alongside installers, enabling clients to download only changed blocks.

### Model Update Management

LLM models are updated independently of the application binary. A separate model update check runs alongside app updates:

```typescript
// main/model-updater.ts
export async function checkModelUpdates(): Promise<ModelUpdate[]> {
  const registry = await fetchRemoteModelRegistry();
  const local = loadLocalModelRegistry();
  const updates: ModelUpdate[] = [];

  for (const remoteModel of registry.models) {
    const localModel = local.models.find(m => m.id === remoteModel.id);
    if (!localModel || localModel.sha256 !== remoteModel.sha256) {
      updates.push({
        modelId: remoteModel.id,
        currentVersion: localModel?.version,
        newVersion: remoteModel.version,
        downloadSize: remoteModel.size,
      });
    }
  }
  return updates;
}
```

## CI/CD Pipeline (GitHub Actions)

### Multi-Platform Build Workflow

```yaml
# .github/workflows/build-and-release.yml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  build-macos:
    runs-on: macos-14
    strategy:
      matrix:
        arch: [x64, arm64]
    steps:
      - uses: actions/checkout@v4
        with:
          lfs: true

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Download bundled models
        run: npm run models:download -- --bundled-only

      - name: Validate model integrity
        run: npm run models:validate

      - name: Audit font licenses
        run: npm run fonts:audit

      - name: Import signing certificate
        env:
          APPLE_CERTIFICATE_BASE64: ${{ secrets.APPLE_CERTIFICATE_BASE64 }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
        run: |
          echo "$APPLE_CERTIFICATE_BASE64" | base64 --decode > certificate.p12
          security create-keychain -p actions build.keychain
          security default-keychain -s build.keychain
          security unlock-keychain -p actions build.keychain
          security import certificate.p12 -k build.keychain -P "$APPLE_CERTIFICATE_PASSWORD" -T /usr/bin/codesign
          security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k actions build.keychain

      - name: Build and publish
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        run: npm run publish:mac -- --arch=${{ matrix.arch }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: macos-${{ matrix.arch }}
          path: dist/*.dmg

  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
        with:
          lfs: true

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Download bundled models
        run: npm run models:download -- --bundled-only

      - name: Validate model integrity
        run: npm run models:validate

      - name: Audit font licenses
        run: npm run fonts:audit

      - name: Build and publish
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          WIN_CERT_FILE: ${{ secrets.WIN_CERT_FILE }}
          WIN_CERT_PASSWORD: ${{ secrets.WIN_CERT_PASSWORD }}
        run: npm run publish:win

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: windows
          path: |
            dist/*.exe
            dist/*.msi

  build-linux:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
        with:
          lfs: true

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Download bundled models
        run: npm run models:download -- --bundled-only

      - name: Validate model integrity
        run: npm run models:validate

      - name: Audit font licenses
        run: npm run fonts:audit

      - name: Build and publish
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run publish:linux

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: linux
          path: |
            dist/*.AppImage
            dist/*.deb
            dist/*.rpm

  create-release:
    needs: [build-macos, build-windows, build-linux]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: artifacts

      - name: Generate release notes
        id: notes
        run: |
          echo "## What's New" > RELEASE_NOTES.md
          git log --pretty=format:"- %s" $(git describe --tags --abbrev=0 HEAD^)..HEAD >> RELEASE_NOTES.md

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          body_path: RELEASE_NOTES.md
          files: artifacts/**/*
          draft: false
          prerelease: ${{ contains(github.ref, 'beta') || contains(github.ref, 'alpha') }}
```

### Version Bumping Strategy

Follow semantic versioning with pre-release channels:

```bash
# Stable releases
npm version patch   # 1.0.0 -> 1.0.1
npm version minor   # 1.0.1 -> 1.1.0
npm version major   # 1.1.0 -> 2.0.0

# Beta releases
npm version prerelease --preid=beta   # 2.0.0 -> 2.0.1-beta.0

# Alpha releases
npm version prerelease --preid=alpha  # 2.0.0 -> 2.0.1-alpha.0
```

## Supabase Backend Deployment

### Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase project
supabase init

# Create a new migration
supabase migration new create_users_and_documents

# Apply migrations to production
supabase db push --db-url $PRODUCTION_DATABASE_URL

# Verify migration status
supabase migration list --db-url $PRODUCTION_DATABASE_URL
```

### Migration File Structure

```
supabase/
  migrations/
    20240101000000_create_users_table.sql
    20240101000001_create_documents_table.sql
    20240101000002_create_writing_sessions.sql
    20240101000003_create_model_preferences.sql
    20240101000004_add_rls_policies.sql
  seed.sql
```

### Row Level Security (RLS)

```sql
-- Example RLS policy for documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);
```

### Production Configuration

```typescript
// config/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Desktop apps don't use URL-based auth
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'luminary-desktop',
    },
  },
});
```

### Edge Functions

```bash
# Deploy edge functions for server-side processing
supabase functions deploy process-document
supabase functions deploy sync-preferences
supabase functions deploy generate-share-link
```

## Monitoring

### Sentry Integration (Crash Reporting)

```typescript
// main/sentry.ts — Main process
import * as Sentry from '@sentry/electron/main';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  release: `luminary@${app.getVersion()}`,
  environment: process.env.NODE_ENV || 'production',
  beforeSend(event) {
    // Strip PII from crash reports
    if (event.user) {
      delete event.user.ip_address;
      delete event.user.email;
    }
    return event;
  },
  integrations: [
    Sentry.electronMinidumpIntegration(),
  ],
});

// renderer/sentry.ts — Renderer process
import * as Sentry from '@sentry/electron/renderer';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.1,
});
```

### PostHog Analytics

```typescript
// renderer/analytics.ts
import posthog from 'posthog-js';

posthog.init(process.env.VITE_POSTHOG_KEY!, {
  api_host: 'https://app.posthog.com',
  autocapture: false,  // Manual event tracking only for desktop
  capture_pageview: false,
  persistence: 'localStorage',
  disable_session_recording: true,
});

export function trackEvent(event: string, properties?: Record<string, any>) {
  posthog.capture(event, {
    ...properties,
    platform: process.platform,
    arch: process.arch,
    appVersion: APP_VERSION,
    electronVersion: process.versions.electron,
  });
}
```

### Custom Update Telemetry

```typescript
// main/telemetry.ts
export function trackUpdateEvent(event: string, data: Record<string, any>) {
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    appVersion: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
    ...data,
  };

  // Send to PostHog via main process
  fetch('https://app.posthog.com/capture/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: POSTHOG_KEY,
      event: `update_${event}`,
      properties: payload,
    }),
  }).catch(() => { /* Silent fail for telemetry */ });
}
```

## Rollback Strategy

### Application Rollback

1. **Previous versions on GitHub Releases**: All past versions remain available as downloadable assets. Users can manually download and install any previous version.

2. **Auto-update rollback on crash detection**: If the app crashes repeatedly after an update (3 crashes within 5 minutes), prompt the user to roll back:

```typescript
// main/crash-recovery.ts
const CRASH_THRESHOLD = 3;
const CRASH_WINDOW_MS = 5 * 60 * 1000;

export function initCrashRecovery() {
  const crashes = store.get('recentCrashes', []) as number[];
  const now = Date.now();
  const recentCrashes = crashes.filter(t => now - t < CRASH_WINDOW_MS);

  if (recentCrashes.length >= CRASH_THRESHOLD) {
    dialog.showMessageBoxSync({
      type: 'warning',
      title: 'Stability Issue Detected',
      message: 'Luminary has crashed multiple times. Would you like to roll back to the previous version?',
      buttons: ['Roll Back', 'Continue'],
      defaultId: 0,
    });
  }

  store.set('recentCrashes', [...recentCrashes, now]);
}
```

3. **Model rollback**: If a model update causes inference issues, revert to the previous model version stored in the local cache.

### Database Migration Rollback

```bash
# Revert the last migration
supabase migration repair --status reverted <migration_version>

# Or apply a down migration manually
psql $PRODUCTION_DATABASE_URL -f supabase/migrations/down/20240101000004_revert_rls_policies.sql
```

### Staged Rollout

Implement a staged rollout for updates to catch issues early:

1. **Alpha channel** (internal testers): Immediate availability
2. **Beta channel** (opt-in users): 24-48 hours after alpha
3. **Stable channel** (all users): 1 week after beta, unless issues detected

## Security Considerations

### Data at Rest
- User documents encrypted with AES-256-GCM using keys derived from user credentials
- LLM model files integrity-verified via SHA-256 checksums
- Supabase handles server-side encryption

### Data in Transit
- All API calls over HTTPS with TLS 1.3
- Certificate pinning for Supabase endpoints
- Electron's `webRequest` API to enforce HTTPS

### Application Security
- Context isolation enabled in all renderer processes
- Node integration disabled in renderer
- Content Security Policy (CSP) headers configured
- Preload scripts with strict IPC channel whitelisting

```typescript
// main/window.ts
const mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    preload: path.join(__dirname, 'preload.js'),
    webSecurity: true,
  },
});
```

## Appendix

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_SENTRY_DSN` | Sentry DSN for crash reporting | Yes |
| `VITE_POSTHOG_KEY` | PostHog project API key | Yes |
| `APPLE_CERTIFICATE_BASE64` | Base64 macOS signing cert | CI only |
| `APPLE_CERTIFICATE_PASSWORD` | macOS cert password | CI only |
| `APPLE_TEAM_ID` | Apple Developer Team ID | CI only |
| `APPLE_ID` | Apple ID for notarization | CI only |
| `APPLE_APP_SPECIFIC_PASSWORD` | Apple app-specific password | CI only |
| `WIN_CERT_FILE` | Windows signing cert path | CI only |
| `WIN_CERT_PASSWORD` | Windows cert password | CI only |
| `GH_TOKEN` | GitHub token for releases | CI only |

### Installer Size Budget

| Component | Approximate Size |
|-----------|-----------------|
| Electron runtime | ~180 MB |
| Application code | ~15 MB |
| Bundled models (3B) | ~3.6 GB |
| Fonts | ~5 MB |
| Node native modules | ~25 MB |
| **Total (with bundled models)** | **~3.8 GB** |
| **Total (without models)** | **~225 MB** |

### Troubleshooting

| Issue | Resolution |
|-------|-----------|
| macOS notarization fails | Verify Apple credentials, check entitlements, ensure hardened runtime |
| Windows SmartScreen warning | Use EV certificate or wait for reputation to build with OV cert |
| Linux AppImage won't launch | Check FUSE support: `sudo apt install libfuse2` |
| Model loading fails | Verify SHA-256 checksums, ensure sufficient RAM, check file permissions |
| Font rendering issues on Linux | Install fontconfig: `sudo apt install fontconfig` |
| Auto-update fails | Check GitHub Release assets, verify GH_TOKEN permissions |
