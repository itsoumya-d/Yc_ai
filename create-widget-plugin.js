const fs = require('fs');
const path = require('path');

const apps = [
  { dir: 'mortal', name: 'Mortal', bundleId: 'com.mortal.app', groupId: 'group.com.mortal.app' },
  { dir: 'stockpulse', name: 'StockPulse', bundleId: 'com.stockpulse.app', groupId: 'group.com.stockpulse.app' },
  { dir: 'routeai', name: 'RouteAI', bundleId: 'com.routeai.app', groupId: 'group.com.routeai.app' },
  { dir: 'inspector-ai', name: 'InspectorAI', bundleId: 'com.inspectorai.app', groupId: 'group.com.inspectorai.app' },
  { dir: 'sitesync', name: 'SiteSync', bundleId: 'com.sitesync.app', groupId: 'group.com.sitesync.app' },
  { dir: 'govpass', name: 'GovPass', bundleId: 'com.govpass.app', groupId: 'group.com.govpass.app' },
  { dir: 'claimback', name: 'ClaimBack', bundleId: 'com.claimback.app', groupId: 'group.com.claimback.app' },
  { dir: 'aura-check', name: 'AuraCheck', bundleId: 'com.auracheck.app', groupId: 'group.com.auracheck.app' },
  { dir: 'fieldlens', name: 'FieldLens', bundleId: 'com.fieldlens.app', groupId: 'group.com.fieldlens.app' },
  { dir: 'compliancesnap-expo', name: 'ComplianceSnap', bundleId: 'com.compliancesnap.app', groupId: 'group.com.compliancesnap.app' },
];

const pluginTemplate = (app) => `// Expo config plugin: adds iOS WidgetKit extension for ${app.name}
// Run \`expo prebuild\` to generate native files, then EAS Build will include the widget.
const { withXcodeProject, withEntitlementsPlist, IOSConfig } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const WIDGET_NAME = '${app.name}Widget';
const BUNDLE_ID = '${app.bundleId}.widget';
const APP_GROUP = '${app.groupId}';

/**
 * Copies Swift widget source files into the generated iOS project and
 * registers them as a new WidgetKit extension target.
 */
const withWidgetExtension = (config) => {
  // 1. Copy Swift files into ios/{WidgetName}/ during prebuild
  config = withXcodeProject(config, async (cfg) => {
    const xcodeProject = cfg.modResults;
    const iosDir = cfg.modRequest.platformProjectRoot;
    const widgetDir = path.join(iosDir, WIDGET_NAME);
    const srcDir = path.join(cfg.modRequest.projectRoot, 'widgets', 'ios');

    fs.mkdirSync(widgetDir, { recursive: true });

    // Copy Swift source
    const swiftSrc = path.join(srcDir, WIDGET_NAME + '.swift');
    if (fs.existsSync(swiftSrc)) {
      fs.copyFileSync(swiftSrc, path.join(widgetDir, WIDGET_NAME + '.swift'));
    }

    // Write Info.plist for widget extension
    const infoPlist = \`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
  </dict>
</dict>
</plist>\`;
    fs.writeFileSync(path.join(widgetDir, 'Info.plist'), infoPlist, 'utf8');

    // Add widget target to Xcode project
    try {
      const widgetTarget = xcodeProject.addTarget(
        WIDGET_NAME,
        'app_extension',
        WIDGET_NAME,
        BUNDLE_ID
      );

      // Add build phase
      xcodeProject.addBuildPhase(
        [WIDGET_NAME + '.swift'],
        'PBXSourcesBuildPhase',
        'Sources',
        widgetTarget.uuid
      );

      // Link WidgetKit framework
      xcodeProject.addFramework('WidgetKit.framework', { target: widgetTarget.uuid });
      xcodeProject.addFramework('SwiftUI.framework', { target: widgetTarget.uuid });

      // Build settings
      const configurations = xcodeProject.pbxXCBuildConfigurationSection();
      Object.entries(configurations).forEach(([key, config]) => {
        if (config.buildSettings && config.buildSettings.PRODUCT_NAME === WIDGET_NAME) {
          config.buildSettings.SWIFT_VERSION = '5.0';
          config.buildSettings.TARGETED_DEVICE_FAMILY = '"1,2"';
          config.buildSettings.INFOPLIST_FILE = WIDGET_NAME + '/Info.plist';
        }
      });
    } catch (e) {
      console.warn('[withWidget] Xcode target setup warning:', e.message);
    }

    return cfg;
  });

  // 2. Add App Groups entitlement to main app
  config = withEntitlementsPlist(config, (cfg) => {
    if (!cfg.modResults['com.apple.security.application-groups']) {
      cfg.modResults['com.apple.security.application-groups'] = [];
    }
    const groups = cfg.modResults['com.apple.security.application-groups'];
    if (!groups.includes(APP_GROUP)) groups.push(APP_GROUP);
    return cfg;
  });

  return config;
};

module.exports = withWidgetExtension;
`;

apps.forEach(app => {
  const basePath = 'E:/Yc_ai/' + app.dir;
  if (!fs.existsSync(basePath)) { console.log('SKIP:', app.dir); return; }

  const pluginsDir = basePath + '/plugins';
  fs.mkdirSync(pluginsDir, { recursive: true });
  fs.writeFileSync(pluginsDir + '/withWidget.js', pluginTemplate(app), 'utf8');
  console.log('Created plugin:', app.dir + '/plugins/withWidget.js');

  // Update app.json to include the plugin
  const appJsonPath = basePath + '/app.json';
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    if (appJson.expo && appJson.expo.plugins) {
      if (!appJson.expo.plugins.includes('./plugins/withWidget')) {
        appJson.expo.plugins.push('./plugins/withWidget');
        fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
        console.log('Updated app.json:', app.dir);
      }
    }
  }
});

console.log('Done! Plugins created for all 10 apps.');
