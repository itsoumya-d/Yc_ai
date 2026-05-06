const fs = require('fs');
const langs = ['es','hi','zh','ar','pt','fr','de','ja','ko'];

langs.forEach(lang => {
  const file = 'C:/Users/Soumya Debnath/Yc_ai/sitesync/locales/' + lang + '.json';
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  // home additions
  data.home = data.home || {};
  Object.assign(data.home, {
    statusActive: 'Active',
    statusOnHold: 'On Hold',
    statusDone: 'Done',
    openCountLabel: '{{count}} open',
    photosCountLabel: '{{count}} photos',
    issuesCountLabel: '{{count}} issues',
    crewCountLabel: '{{count}} crew',
    dueLabel: 'Due {{date}}',
    siteCountLabel: '{{count}} sites'
  });

  // photos additions
  data.photos = data.photos || {};
  Object.assign(data.photos, {
    thisWeek: 'this week',
    thisWeekCount: '{{count}} this week',
    captureCamera: 'Camera requires a physical device!',
    captureCategory: 'Category: {{label}}',
    filterAll: 'All'
  });

  // reports additions
  data.reports = data.reports || {};
  Object.assign(data.reports, {
    filterAll: 'All',
    totalLabel: '{{count}} total',
    pagesLabel: '{{count}} pages',
    shareReport: 'Share this report?',
    downloadPdf: 'Download PDF?',
    generateConfirm: 'Generate {{type}}?',
    reportShared: 'Shared',
    reportNotShared: 'Not shared'
  });

  // safety additions
  data.safety = data.safety || {};
  Object.assign(data.safety, {
    incidentNearMiss: 'Near Miss',
    incidentHazard: 'Hazard',
    incidentObservation: 'Observation',
    severityHigh: 'High',
    severityMedium: 'Medium',
    severityLow: 'Low',
    resolvedLabel: 'Resolved',
    runInspection: 'Run Inspection'
  });

  // team additions
  data.team = data.team || {};
  Object.assign(data.team, {
    onsiteToday: '{{count}} on site today',
    noTeamMembers: 'No team members',
    inviteToCollaborate: 'Invite team members to collaborate on sites',
    inviteActionLabel: 'Invite Member',
    inviteTitle: 'Invite Team Member',
    inviteBody: 'Enter the email address of the team member you want to invite.',
    callMember: 'Call {{name}}?',
    messageMember: 'Message {{name}}?',
    callTitle: 'Call',
    messageTitle: 'Message',
    sitesAssignedLabel: '{{count}} site(s) assigned',
    roleSiteManager: 'Site Manager',
    roleForeman: 'Foreman',
    roleWorker: 'Worker',
    roleInspector: 'Inspector'
  });

  // common additions
  data.common = data.common || {};
  Object.assign(data.common, {
    tryAgain: 'Try Again',
    noResults: 'No results found',
    next: 'Next',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    share: 'Share',
    copy: 'Copy',
    copied: 'Copied!'
  });

  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  console.log('Updated SiteSync ' + lang);
});
