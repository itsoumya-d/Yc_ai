const fs = require('fs');

const apps = [
  { dir: 'mortal', groupId: 'group.com.mortal.app', key: 'mortal_life_percentage', fn: 'updateLifePercentage', paramType: 'number', paramName: 'percentage', comment: 'Call this after calculating life percentage to update the iOS widget.' },
  { dir: 'stockpulse', groupId: 'group.com.stockpulse.app', key: 'stockpulse_low_stock_count', fn: 'updateLowStockCount', paramType: 'number', paramName: 'count', comment: 'Call this after fetching inventory to update the iOS widget.' },
  { dir: 'routeai', groupId: 'group.com.routeai.app', key: 'routeai_stops_today', fn: 'updateStopsToday', paramType: 'number', paramName: 'count', comment: "Call this after loading today's route to update the iOS widget." },
  { dir: 'inspector-ai', groupId: 'group.com.inspectorai.app', key: 'inspectorai_inspections_today', fn: 'updateInspectionsToday', paramType: 'number', paramName: 'count', comment: "Call this after loading today's inspections to update the iOS widget." },
  { dir: 'sitesync', groupId: 'group.com.sitesync.app', key: 'sitesync_active_sites', fn: 'updateActiveSites', paramType: 'number', paramName: 'count', comment: 'Call this after fetching project sites to update the iOS widget.' },
  { dir: 'govpass', groupId: 'group.com.govpass.app', key: 'govpass_days_until_expiry', fn: 'updateDaysUntilExpiry', paramType: 'number', paramName: 'days', comment: 'Call this after computing next document expiry to update the iOS widget.' },
  { dir: 'claimback', groupId: 'group.com.claimback.app', key: 'claimback_active_claims', fn: 'updateActiveClaims', paramType: 'number', paramName: 'count', comment: 'Call this after fetching claims to update the iOS widget.' },
  { dir: 'aura-check', groupId: 'group.com.auracheck.app', key: 'auracheck_wellness_score', fn: 'updateWellnessScore', paramType: 'number', paramName: 'score', comment: 'Call this after computing wellness score to update the iOS widget.' },
  { dir: 'fieldlens', groupId: 'group.com.fieldlens.app', key: 'fieldlens_open_jobs', fn: 'updateOpenJobs', paramType: 'number', paramName: 'count', comment: 'Call this after loading jobs to update the iOS widget.' },
  { dir: 'compliancesnap-expo', groupId: 'group.com.compliancesnap.app', key: 'compliancesnap_violations_today', fn: 'updateViolationsToday', paramType: 'number', paramName: 'count', comment: 'Call this after fetching compliance violations to update the iOS widget.' },
];

apps.forEach(app => {
  const basePath = 'E:/Yc_ai/' + app.dir;
  if (!fs.existsSync(basePath)) { console.log('SKIP:', app.dir); return; }

  const libContent = `import { Platform, NativeModules } from 'react-native';

// ${app.comment}
// On iOS: writes to App Group UserDefaults so the WidgetKit extension can read it.
// On Android: (future) updates RemoteViews via AppWidget manager.
export async function ${app.fn}(${app.paramName}: ${app.paramType}): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    // Uses the native SharedUserDefaults module (available after expo prebuild)
    // If not available (Expo Go), fails silently
    const SharedUserDefaults = NativeModules.SharedUserDefaults;
    if (SharedUserDefaults?.setInteger) {
      await SharedUserDefaults.setInteger(${app.paramName}, '${app.key}', '${app.groupId}');
    }
  } catch {
    // Widget update is non-critical — fail silently in Expo Go
  }
}
`;

  fs.writeFileSync(basePath + '/lib/widget.ts', libContent, 'utf8');
  console.log('Created lib/widget.ts:', app.dir);
});
console.log('Done!');
