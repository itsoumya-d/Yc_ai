# Deployment Guide — PatternForge

## Overview

PatternForge is a desktop sewing pattern design application built with Electron that enables users to create, customize, and export professional sewing patterns. The application features a vector-based pattern editor, PDF/SVG export engine for print-ready output, and manages large asset libraries including pattern templates, fabric swatches, and measurement databases. It connects to a Supabase backend for cloud sync, pattern sharing, and user account management.

This guide covers the complete deployment pipeline from development builds through production distribution across macOS, Windows, and Linux, with special focus on the PDF/SVG export engine bundling, large asset management, and print-accurate output configuration.

## Prerequisites

### Development Environment
- Node.js 20 LTS or later
- npm 10+ or yarn 1.22+
- Python 3.10+ (for native module compilation)
- Git with LFS enabled (for large pattern assets)

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

### Export Engine Dependencies
- Puppeteer (bundled Chromium for PDF rendering)
- Sharp (image processing for pattern thumbnails)
- PDFKit or pdf-lib for programmatic PDF generation
- svg.js for SVG manipulation

## Build Configuration

### electron-builder.yml

```yaml
appId: com.patternforge.desktop
productName: PatternForge
directories:
  output: dist
  buildResources: build

files:
  - "dist-electron/**/*"
  - "dist/**/*"
  - "node_modules/**/*"

extraResources:
  - from: "assets/templates/"
    to: "templates/"
    filter:
      - "**/*.json"
      - "**/*.svg"
  - from: "assets/fabrics/"
    to: "fabrics/"
    filter:
      - "**/*.jpg"
      - "**/*.png"
      - "**/*.json"
  - from: "assets/measurements/"
    to: "measurements/"
    filter:
      - "**/*.json"
  - from: "assets/fonts/"
    to: "fonts/"
    filter:
      - "**/*.ttf"
      - "**/*.otf"

asar: true
asarUnpack:
  - "node_modules/sharp/**"
  - "node_modules/canvas/**"
  - "node_modules/puppeteer-core/**"

mac:
  category: public.app-category.graphics-design
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
    - target: msi
  icon: build/icon.ico
  signingHashAlgorithms:
    - sha256
  certificateSubjectName: "PatternForge Inc."
  publisherName: "PatternForge Inc."

nsis:
  oneClick: false
  perMachine: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  installerIcon: build/installerIcon.ico
  uninstallerIcon: build/uninstallerIcon.ico
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
  category: Graphics
  desktop:
    StartupWMClass: patternforge
    MimeType: application/x-patternforge
  synopsis: Sewing Pattern Design Application
  description: >
    PatternForge is a professional sewing pattern design tool with
    vector editing, PDF/SVG export, and cloud pattern sharing.

appImage:
  artifactName: "PatternForge-${version}-${arch}.AppImage"

deb:
  depends:
    - libgtk-3-0
    - libnotify4
    - libnss3
    - libxss1
    - libxtst6
    - xdg-utils
    - libcairo2
    - libpango-1.0-0
  afterInstall: build/linux/after-install.sh

rpm:
  depends:
    - gtk3
    - libnotify
    - nss
    - libXScrnSaver
    - libXtst
    - xdg-utils
    - cairo
    - pango

publish:
  provider: github
  owner: patternforge-app
  repo: patternforge-desktop
  releaseType: release
```

### entitlements.mac.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
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
  <key>com.apple.security.print</key>
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
    "assets:download": "node scripts/download-assets.js",
    "assets:validate": "node scripts/validate-assets.js",
    "assets:optimize": "node scripts/optimize-assets.js",
    "postinstall": "electron-builder install-app-deps"
  }
}
```

## PDF/SVG Export Engine

### Export Architecture

PatternForge uses a multi-layer export pipeline to produce print-ready sewing patterns:

1. **Vector Canvas**: Internal SVG-based pattern representation at precise measurements
2. **SVG Export**: Direct SVG output with measurement annotations and seam allowances
3. **PDF Generation**: Multi-page PDF output with tiled printing support for home printers
4. **Print Layout Engine**: Automatic tiling of large patterns across standard paper sizes

### PDF Generation Pipeline

```typescript
// main/export/pdf-generator.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { app } from 'electron';
import path from 'path';

interface ExportOptions {
  paperSize: 'letter' | 'a4' | 'a3' | 'a0' | 'custom';
  customWidth?: number;  // in mm
  customHeight?: number; // in mm
  scale: number;         // 1.0 = full size
  seamAllowance: number; // in mm
  includeGrainline: boolean;
  includeNotches: boolean;
  tileForHomePrinting: boolean;
  tileOverlap: number;   // in mm, overlap for alignment
  colorMode: 'color' | 'grayscale' | 'blackwhite';
  dpi: number;           // 150, 300, or 600
}

const PAPER_SIZES = {
  letter: { width: 215.9, height: 279.4 },
  a4: { width: 210, height: 297 },
  a3: { width: 297, height: 420 },
  a0: { width: 841, height: 1189 },
};

export async function generatePatternPDF(
  pattern: PatternData,
  options: ExportOptions
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  if (options.tileForHomePrinting) {
    await generateTiledPages(pdfDoc, pattern, options, font);
  } else {
    await generateFullSizePage(pdfDoc, pattern, options, font);
  }

  // Add metadata
  pdfDoc.setTitle(`${pattern.name} - Sewing Pattern`);
  pdfDoc.setAuthor('PatternForge');
  pdfDoc.setCreator('PatternForge Desktop');
  pdfDoc.setProducer('pdf-lib');

  return Buffer.from(await pdfDoc.save());
}

async function generateTiledPages(
  pdfDoc: PDFDocument,
  pattern: PatternData,
  options: ExportOptions,
  font: any
): Promise<void> {
  const paper = PAPER_SIZES[options.paperSize] || {
    width: options.customWidth!,
    height: options.customHeight!,
  };

  // Calculate margins (15mm) and printable area
  const margin = 15;
  const printableWidth = paper.width - (2 * margin);
  const printableHeight = paper.height - (2 * margin);

  // Calculate tile grid
  const effectiveWidth = printableWidth - options.tileOverlap;
  const effectiveHeight = printableHeight - options.tileOverlap;
  const cols = Math.ceil(pattern.width / effectiveWidth);
  const rows = Math.ceil(pattern.height / effectiveHeight);

  // Generate assembly guide as first page
  await generateAssemblyGuide(pdfDoc, pattern, cols, rows, font);

  // Generate individual tiles
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      await generateTile(pdfDoc, pattern, options, row, col, font);
    }
  }
}
```

### SVG Export Engine

```typescript
// main/export/svg-exporter.ts
interface SVGExportOptions {
  includeSeamAllowance: boolean;
  seamAllowanceWidth: number; // mm
  includeGrainline: boolean;
  includeNotches: boolean;
  includeLabels: boolean;
  units: 'mm' | 'cm' | 'inches';
  strokeWidth: number;
}

export function exportPatternSVG(
  pattern: PatternData,
  options: SVGExportOptions
): string {
  const svg = createSVGDocument(pattern.width, pattern.height, options.units);

  // Add pattern pieces
  for (const piece of pattern.pieces) {
    addPatternPiece(svg, piece, options);
  }

  // Add measurement annotations
  if (options.includeLabels) {
    addMeasurementAnnotations(svg, pattern, options.units);
  }

  // Add seam allowance outlines
  if (options.includeSeamAllowance) {
    addSeamAllowances(svg, pattern, options.seamAllowanceWidth);
  }

  // Add grainline indicators
  if (options.includeGrainline) {
    addGrainlines(svg, pattern);
  }

  return svg.toString();
}
```

### Print Accuracy Calibration

```typescript
// main/export/calibration.ts
export function generateCalibrationPage(): Buffer {
  // Generate a PDF with known measurement squares
  // Users print this page and verify measurements to ensure
  // their printer is producing accurate-scale output
  const squares = [
    { size: 25.4, label: '1 inch / 25.4mm' },
    { size: 50, label: '50mm' },
    { size: 100, label: '100mm / 10cm' },
  ];
  // ... generate calibration PDF
}
```

## Large Asset Bundling

### Asset Structure

```
assets/
  templates/
    basic/
      bodice-block.json      # ~50 KB each
      skirt-block.json
      sleeve-block.json
      pants-block.json
    advanced/
      princess-seam.json
      raglan-sleeve.json
  fabrics/
    swatches/
      cotton-plain.jpg        # ~200 KB each
      cotton-print.jpg
      silk-charmeuse.jpg
      denim-medium.jpg
    metadata/
      fabric-properties.json  # Stretch, drape, weight data
  measurements/
    standard-sizes/
      us-womens.json
      us-mens.json
      eu-womens.json
      eu-mens.json
      childrens.json
    custom/
      (user-created measurement sets)
  fonts/
    pattern-labels/
      SourceSansPro-Regular.ttf
      SourceSansPro-Bold.ttf
```

### Asset Download Strategy

Core assets are bundled with the installer. Extended asset packs (premium templates, additional fabric swatches) are downloaded on-demand from the CDN:

```typescript
// main/asset-manager.ts
import { app, net } from 'electron';
import path from 'path';
import fs from 'fs-extra';

const BUNDLED_ASSETS = [
  'templates/basic/**',
  'fabrics/swatches/*.jpg',
  'fabrics/metadata/**',
  'measurements/standard-sizes/**',
  'fonts/**',
];

const CDN_BASE = 'https://cdn.patternforge.com/assets';

interface AssetPack {
  id: string;
  name: string;
  version: string;
  size: number;
  files: string[];
  sha256: string;
}

export async function downloadAssetPack(pack: AssetPack): Promise<void> {
  const destDir = path.join(app.getPath('userData'), 'assets', pack.id);
  await fs.ensureDir(destDir);

  const url = `${CDN_BASE}/${pack.id}/${pack.version}.tar.gz`;
  const tempFile = path.join(app.getPath('temp'), `${pack.id}.tar.gz`);

  await downloadFile(url, tempFile);
  await verifyChecksum(tempFile, pack.sha256);
  await extractTarGz(tempFile, destDir);
  await fs.remove(tempFile);
}

export function getAssetPath(relativePath: string): string {
  // Check user data directory first (downloaded/updated assets)
  const userPath = path.join(app.getPath('userData'), 'assets', relativePath);
  if (fs.existsSync(userPath)) return userPath;

  // Fall back to bundled assets
  if (app.isPackaged) {
    return path.join(process.resourcesPath, relativePath);
  }
  return path.join(__dirname, '..', 'assets', relativePath);
}
```

### Asset Optimization Pipeline

Before bundling, assets are optimized to reduce installer size:

```javascript
// scripts/optimize-assets.js
const sharp = require('sharp');
const { optimize } = require('svgo');

async function optimizeAssets() {
  // Compress fabric swatch images
  const swatches = glob.sync('assets/fabrics/swatches/*.jpg');
  for (const swatch of swatches) {
    await sharp(swatch)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toFile(swatch.replace('.jpg', '.optimized.jpg'));
  }

  // Optimize SVG templates
  const svgFiles = glob.sync('assets/templates/**/*.svg');
  for (const svgFile of svgFiles) {
    const svg = fs.readFileSync(svgFile, 'utf-8');
    const result = optimize(svg, {
      plugins: ['preset-default', 'removeDimensions'],
    });
    fs.writeFileSync(svgFile, result.data);
  }

  console.log(`Optimized ${swatches.length} images and ${svgFiles.length} SVGs`);
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

#### Hardened Runtime

The hardened runtime entitlements allow PatternForge to use unsigned executable memory (needed by the canvas native module for pattern rendering) and access user-selected files for pattern import/export.

#### Notarization Process

electron-builder handles notarization automatically when configured:

1. Build the .app bundle
2. Sign with Developer ID Application certificate
3. Submit to Apple notarization service (2-15 minutes)
4. Staple the notarization ticket
5. Package into DMG

#### Universal Binary

PatternForge ships universal binaries for macOS. The native canvas and sharp modules must compile for both x64 and arm64:

```bash
npm run build:mac -- --arch=universal
```

### macOS Distribution

1. **Direct Download (DMG)**: Primary distribution via website and GitHub Releases
2. **Homebrew Cask**: Community cask formula for Homebrew users
3. **Mac App Store** (optional): Requires sandbox entitlements

### macOS Print Integration

```typescript
// main/print-manager.ts (macOS)
import { BrowserWindow } from 'electron';

export async function printPattern(
  window: BrowserWindow,
  pdfBuffer: Buffer
): Promise<void> {
  // Use Electron's built-in printing with macOS native print dialog
  const printWindow = new BrowserWindow({ show: false });
  const tempPath = path.join(app.getPath('temp'), 'print-preview.pdf');
  await fs.writeFile(tempPath, pdfBuffer);
  await printWindow.loadFile(tempPath);

  printWindow.webContents.print({
    silent: false,
    printBackground: true,
    margins: { marginType: 'custom', top: 0, bottom: 0, left: 0, right: 0 },
    scaleFactor: 100, // Critical: must be 100% for accurate pattern sizing
  });
}
```

## Windows Deployment

### Code Signing (Authenticode)

#### EV Code Signing Certificate

An EV certificate provides immediate SmartScreen trust. This is critical for PatternForge since sewing enthusiasts are often less technical and may be deterred by SmartScreen warnings.

#### Certificate Types
- **EV Certificate (recommended)**: Immediate SmartScreen trust, hardware token required
- **Standard OV Certificate**: Builds reputation over time

#### SignTool Configuration

```yaml
# electron-builder.yml (Windows signing section)
win:
  signingHashAlgorithms:
    - sha256
  certificateFile: ${env.WIN_CERT_FILE}
  certificatePassword: ${env.WIN_CERT_PASSWORD}
```

### Windows Distribution

1. **NSIS Installer**: Primary consumer distribution with per-user install option
2. **MSI Installer**: Enterprise/school distribution, Group Policy compatible
3. **Microsoft Store** (optional): MSIX packaging for Store submission
4. **Winget**: Community manifest for Windows Package Manager

### Windows File Association

Register `.pforge` file extension on Windows:

```yaml
# In electron-builder.yml
nsis:
  fileAssociations:
    - ext: pforge
      name: PatternForge Pattern
      description: PatternForge Sewing Pattern
      icon: build/file-icon.ico
      role: Editor
```

### Windows Print Driver Compatibility

```typescript
// main/print-manager.ts (Windows-specific)
export function getAvailablePrinters(): PrinterInfo[] {
  const printers = BrowserWindow.getAllWindows()[0]
    .webContents.getPrintersAsync();

  return printers.map(p => ({
    name: p.name,
    isDefault: p.isDefault,
    status: p.status,
    // Filter for printers that support accurate scaling
    supportsAccurateScale: !p.name.includes('XPS') && !p.name.includes('PDF'),
  }));
}
```

## Linux Deployment

### Package Formats

#### AppImage (Universal)
- Self-contained executable for all distributions
- No installation required
- Best for direct download distribution

#### .deb (Debian/Ubuntu)
- Native package for Debian-based systems
- Automatic dependency resolution
- Integrates with system package manager

#### .rpm (Fedora/RHEL)
- Native package for Red Hat-based systems
- DNF/YUM dependency management

### Linux-Specific Dependencies

PatternForge requires the Cairo graphics library for pattern rendering on Linux:

```yaml
# In electron-builder.yml
deb:
  depends:
    - libgtk-3-0
    - libcairo2
    - libpango-1.0-0
    - librsvg2-2
    - libcups2  # For printing support
```

### Linux Print Integration

```typescript
// main/print-manager.ts (Linux)
import { exec } from 'child_process';

export async function printWithCUPS(pdfPath: string, printer?: string): Promise<void> {
  const printerFlag = printer ? `-d "${printer}"` : '';
  // Use lp command for CUPS printing with no scaling
  const command = `lp ${printerFlag} -o fit-to-page=false -o scaling=100 "${pdfPath}"`;

  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
```

## Auto-Update System

### electron-updater Configuration

```typescript
// main/updater.ts
import { autoUpdater } from 'electron-updater';
import { BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';

autoUpdater.logger = log;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.channel = getUpdateChannel();

function getUpdateChannel(): string {
  const settings = loadSettings();
  return settings.updateChannel || 'stable';
}

export function initAutoUpdater(mainWindow: BrowserWindow): void {
  // Check for updates 30 seconds after launch
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(err => {
      log.error('Update check failed:', err);
    });
  }, 30000);

  // Periodic checks every 6 hours
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(err => {
      log.error('Periodic update check failed:', err);
    });
  }, 6 * 60 * 60 * 1000);

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

```yaml
# electron-builder.yml
nsis:
  differentialPackage: true
```

### Asset Pack Updates

Asset packs (templates, fabrics) update independently of the application:

```typescript
// main/asset-updater.ts
export async function checkAssetUpdates(): Promise<AssetUpdate[]> {
  const manifest = await fetchRemoteAssetManifest();
  const local = loadLocalAssetManifest();
  const updates: AssetUpdate[] = [];

  for (const pack of manifest.packs) {
    const localPack = local.packs.find(p => p.id === pack.id);
    if (!localPack || localPack.version !== pack.version) {
      updates.push({
        packId: pack.id,
        name: pack.name,
        currentVersion: localPack?.version || 'none',
        newVersion: pack.version,
        downloadSize: pack.size,
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

      - name: Optimize assets
        run: npm run assets:optimize

      - name: Validate assets
        run: npm run assets:validate

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

      - name: Optimize assets
        run: npm run assets:optimize

      - name: Validate assets
        run: npm run assets:validate

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

      - name: Install system dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libcairo2-dev libpango1.0-dev libjpeg-dev librsvg2-dev

      - name: Install dependencies
        run: npm ci

      - name: Optimize assets
        run: npm run assets:optimize

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

### Version Strategy

```bash
# Stable releases
npm version patch   # 1.0.0 -> 1.0.1
npm version minor   # 1.0.1 -> 1.1.0
npm version major   # 1.1.0 -> 2.0.0

# Pre-release channels
npm version prerelease --preid=beta   # 2.0.0 -> 2.0.1-beta.0
npm version prerelease --preid=alpha  # 2.0.0 -> 2.0.1-alpha.0
```

## Supabase Backend Deployment

### Database Migrations

```bash
# Initialize Supabase project
supabase init

# Create migrations
supabase migration new create_users_table
supabase migration new create_patterns_table
supabase migration new create_measurements_table

# Apply to production
supabase db push --db-url $PRODUCTION_DATABASE_URL
```

### Migration File Structure

```
supabase/
  migrations/
    20240101000000_create_users_table.sql
    20240101000001_create_patterns_table.sql
    20240101000002_create_measurements_table.sql
    20240101000003_create_pattern_shares.sql
    20240101000004_create_fabric_library.sql
    20240101000005_add_rls_policies.sql
  seed.sql
```

### Row Level Security

```sql
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own patterns"
  ON patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared patterns"
  ON patterns FOR SELECT
  USING (is_public = true OR id IN (
    SELECT pattern_id FROM pattern_shares WHERE shared_with = auth.uid()
  ));

CREATE POLICY "Users can insert own patterns"
  ON patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patterns"
  ON patterns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own patterns"
  ON patterns FOR DELETE
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
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-client-info': 'patternforge-desktop',
    },
  },
});
```

### Storage Configuration for Pattern Files

```sql
-- Create storage bucket for pattern files and thumbnails
INSERT INTO storage.buckets (id, name, public) VALUES ('patterns', 'patterns', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);

-- RLS policies for pattern storage
CREATE POLICY "Users can upload own patterns"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'patterns' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read own patterns"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'patterns' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Monitoring

### Sentry Integration

```typescript
// main/sentry.ts
import * as Sentry from '@sentry/electron/main';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  release: `patternforge@${app.getVersion()}`,
  environment: process.env.NODE_ENV || 'production',
  beforeSend(event) {
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

// renderer/sentry.ts
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
  autocapture: false,
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
  });
}

// Track export events
export function trackExport(format: 'pdf' | 'svg', options: ExportOptions) {
  trackEvent('pattern_exported', {
    format,
    paperSize: options.paperSize,
    tiled: options.tileForHomePrinting,
    dpi: options.dpi,
    piecesCount: options.piecesCount,
  });
}
```

## Rollback Strategy

### Application Rollback

1. **GitHub Releases**: All previous versions remain available as downloadable assets.

2. **Crash-based rollback detection**:

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
      message: 'PatternForge has crashed multiple times. Would you like to roll back to the previous version?',
      buttons: ['Roll Back', 'Continue'],
      defaultId: 0,
    });
  }

  store.set('recentCrashes', [...recentCrashes, now]);
}
```

3. **Asset pack rollback**: Revert to previous asset versions if new assets cause rendering issues.

### Database Migration Rollback

```bash
supabase migration repair --status reverted <migration_version>
```

### Staged Rollout

1. **Alpha channel**: Internal testers, immediate availability
2. **Beta channel**: Opt-in users, 24-48 hours after alpha
3. **Stable channel**: All users, 1 week after beta

## Security Considerations

### Application Security
- Context isolation enabled in all renderer processes
- Node integration disabled in renderer
- Content Security Policy headers configured
- Preload scripts with strict IPC channel whitelisting

```typescript
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

### Data Protection
- User patterns encrypted at rest in local storage
- Cloud sync over HTTPS with TLS 1.3
- Supabase RLS policies enforce data isolation
- No telemetry includes pattern content or personal measurements

### File Access Security
- File dialogs restricted to supported file types (.pforge, .pdf, .svg)
- Path traversal prevention in file import/export
- Temporary files cleaned up after export operations

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
| Bundled templates | ~5 MB |
| Fabric swatches | ~20 MB |
| Fonts | ~3 MB |
| Native modules (canvas, sharp) | ~30 MB |
| **Total** | **~253 MB** |

### Troubleshooting

| Issue | Resolution |
|-------|-----------|
| PDF scaling inaccurate | Run calibration page, check printer scaling settings (must be 100%) |
| SVG export missing fonts | Ensure font files are bundled and paths resolve correctly |
| Canvas rendering blank on Linux | Install Cairo: `sudo apt install libcairo2-dev` |
| macOS notarization fails | Verify Apple credentials, check entitlements |
| Windows SmartScreen warning | Use EV certificate or wait for OV reputation |
| Large pattern export OOM | Increase Node memory: `--max-old-space-size=4096` |
| Print dialog not appearing | Check system print service is running |
