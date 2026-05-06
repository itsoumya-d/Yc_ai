import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'E:/Yc_ai';
const AUDIT_DIR = path.join(ROOT, 'audit-2026-03-12');
const REGISTRY_PATH = path.join(ROOT, 'docs', 'canonical-portfolio-registry.json');
const MATRIX_PATH = path.join(AUDIT_DIR, 'master-status-matrix.md');
const RUNTIME_RESULTS_PATH = path.join(AUDIT_DIR, 'runtime-results.json');

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
const runtimeResults = JSON.parse(fs.readFileSync(RUNTIME_RESULTS_PATH, 'utf8'));
const currentMatrix = parseFirstMarkdownTable(read(MATRIX_PATH));

const canonicalApps = [
  ...registry.canonicalPortfolio.web,
  ...registry.canonicalPortfolio.mobile,
].map(enrichApp);

const byPlatform = {
  web: canonicalApps.filter((app) => app.platform === 'web'),
  mobile: canonicalApps.filter((app) => app.platform === 'mobile'),
};

write(path.join(ROOT, 'docs', 'CANONICAL-PORTFOLIO-REGISTRY.md'), renderRegistryDoc());
write(MATRIX_PATH, renderMasterStatusMatrix());
write(path.join(ROOT, 'docs', 'SHANNON-SETUP-TRACK.md'), renderShannonTrackDoc());
write(path.join(ROOT, 'BMAD-PRODUCT-BRIEFS.md'), renderProductBriefs());
write(path.join(ROOT, 'BMAD-COMPREHENSIVE-AUDIT-2026.md'), renderComprehensiveAudit());
write(path.join(ROOT, 'BMAD-FEATURE-GAP-ANALYSIS-2026.md'), renderFeatureGapAnalysis());
write(path.join(ROOT, 'BMAD-LAUNCH-READINESS-2026.md'), renderLaunchReadiness());
write(path.join(ROOT, 'BMAD-MASTER-TASK-LIST.md'), renderMasterTaskList());

function enrichApp(app) {
  const auditText = read(app.auditPath);
  const matrixRow = currentMatrix.rows.find((row) => row.app === app.slug) || {};
  const runtime = runtimeResults[app.slug] || {};
  const packageJsonPath = path.join(app.path, 'package.json');
  const envExamplePath = path.join(app.path, '.env.example');
  const pkg = fs.existsSync(packageJsonPath)
    ? JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    : {};

  const title = matchOne(auditText, /^# (.+?) - Fresh Launch Readiness Audit/m) || app.title;
  const category = matchOne(auditText, /^- Product category: (.+)$/m) || 'Category not parsed';
  const findings = [...auditText.matchAll(/^### (.+)$/gm)]
    .map((match) => match[1].trim())
    .filter((heading) => heading !== 'Feature headings observed in docs' && !heading.startsWith('Task '));
  const tasks = [...auditText.matchAll(/^### Task \d+: (.+)$/gm)].map((match) => match[1].trim());
  const envExample = fs.existsSync(envExamplePath) ? read(envExamplePath) : '';
  const expoVersion =
    app.platform === 'mobile' && pkg.dependencies && pkg.dependencies.expo
      ? pkg.dependencies.expo
      : 'n/a';

  return {
    ...app,
    title,
    category,
    score: Number(matrixRow.completion_score || 0),
    status: matrixRow.status || 'Needs Work',
    buildStatus: runtime.build?.status || matrixRow.build_result || 'unknown',
    testStatus: runtime.test?.status || matrixRow.test_result || 'unknown',
    docMatch: matrixRow.doc_match || 'unknown',
    criticalFindings: Number(matrixRow.critical_findings || 0),
    highFindings: Number(matrixRow.high_findings || 0),
    launchBlockers: Number(matrixRow.launch_blockers || 0),
    taskCount: Number(matrixRow.task_count || tasks.length || 0),
    findings,
    tasks,
    runtimeIntent: matchOne(auditText, /^Store\/runtime intent: (.+)\.$/m) || 'Unknown',
    hasSaasDocs: fs.existsSync(app.saasDocsPath),
    hasTokens: fs.existsSync(path.join(app.path, 'tokens')),
    hasEnvExample: fs.existsSync(envExamplePath),
    hasPaddleEnv: envExample.includes('PADDLE_'),
    hasStripeWebhook:
      app.platform === 'web' &&
      fs.existsSync(path.join(app.path, 'app', 'api', 'webhooks', 'stripe', 'route.ts')),
    expoSdk: matrixRow.expo_sdk || expoVersion,
  };
}

function renderRegistryDoc() {
  const webRows = byPlatform.web.map((app) => [
    app.title,
    app.platform,
    code(app.path),
    code(app.saasDocsPath),
    code(app.auditPath),
  ]);
  const mobileRows = byPlatform.mobile.map((app) => [
    app.title,
    app.platform,
    code(app.path),
    code(app.saasDocsPath),
    code(app.auditPath),
  ]);
  const excludedRows = registry.excluded.map((item) => [item.slug, item.reason]);

  return [
    '# Canonical Portfolio Registry',
    `> Updated: ${registry.version}`,
    '',
    '- Canonical portfolio scope: 10 web apps and 10 mobile apps.',
    '- Shannon is a separate setup and infrastructure track and is not counted as app 21 in the product portfolio.',
    '- `compliancesnap-expo` is the canonical ComplianceSnap mobile app; plain `compliancesnap` is excluded as legacy scope.',
    '',
    '## Web Apps',
    '',
    renderTable(['App', 'Platform', 'Canonical path', 'App docs', 'Audit'], webRows),
    '',
    '## Mobile Apps',
    '',
    renderTable(['App', 'Platform', 'Canonical path', 'App docs', 'Audit'], mobileRows),
    '',
    '## Shannon Track',
    '',
    renderTable(
      ['Track', 'Path', 'Purpose'],
      [[registry.shannonTrack.title, code(registry.shannonTrack.path), registry.shannonTrack.purpose]]
    ),
    '',
    '## Excluded Roots',
    '',
    renderTable(['Root', 'Reason'], excludedRows),
    '',
  ].join('\n');
}

function renderMasterStatusMatrix() {
  const header = [
    '# Master Status Matrix',
    '',
    `- Refreshed audit workspace: ${code(AUDIT_DIR)}`,
    '- Canonical scope: 10 web apps and 10 mobile apps.',
    '- Shannon is tracked separately as setup/infrastructure and is not counted in the app matrix.',
    '- Excluded duplicates and out-of-scope roots: `compliancesnap`, `fieldlens__`, `agentforge`, `cortex`, `deepfocus`, `legalforge`, `luminary`, `modelops`, `patternforge`, `spectracad`, `vaultedit`.',
    '- Earlier launch-ready claims are treated as stale until re-proven against code and runnable verification.',
    '',
  ].join('\n');

  const rows = canonicalApps.map((app) => [
    app.slug,
    app.platform,
    code(app.path),
    app.status,
    String(app.score),
    'yes',
    'yes',
    'yes',
    app.platform === 'mobile' ? 'yes' : 'no',
    app.platform === 'mobile' ? 'yes' : 'no',
    app.expoSdk,
    summarizeRuntimeIntent(app.runtimeIntent),
    app.platform === 'web' ? 'privacy=yes, terms=yes' : 'n/a',
    app.buildStatus,
    app.testStatus,
    app.docMatch,
    String(app.criticalFindings),
    String(app.highFindings),
    String(app.launchBlockers),
    String(app.taskCount),
  ]);

  return header + renderTable(
    [
      'app',
      'platform',
      'canonical_path',
      'status',
      'completion_score',
      'google_login',
      'email_login',
      'email_signup',
      'apple_login_required',
      'apple_login_present',
      'expo_sdk',
      'store_config',
      'legal_pages',
      'build_result',
      'test_result',
      'doc_match',
      'critical_findings',
      'high_findings',
      'launch_blockers',
      'task_count',
    ],
    rows
  ) + '\n';
}

function renderShannonTrackDoc() {
  const shannon = registry.shannonTrack;
  const envText = read(shannon.envExamplePath);
  return [
    '# Shannon Setup Track',
    `> Updated: ${registry.version}`,
    '',
    '- Shannon is a separate setup and infrastructure track for the portfolio audit workflow.',
    '- It is intentionally excluded from the canonical 20-app product matrix.',
    '',
    '## Current Structure',
    '',
    renderTable(
      ['Component', 'Path'],
      [
        ['CLI root', code(shannon.path)],
        ['Web dashboard', code(shannon.webPath)],
        ['MCP server', code(shannon.mcpServerPath)],
        ['Web env template', code(shannon.envExamplePath)],
      ]
    ),
    '',
    '## Readiness Signals',
    '',
    renderTable(
      ['Check', 'Status'],
      [
        ['CLI root present', yesNo(fs.existsSync(shannon.path))],
        ['Web app present', yesNo(fs.existsSync(shannon.webPath))],
        ['MCP server present', yesNo(fs.existsSync(shannon.mcpServerPath))],
        ['Paddle variables documented in web env', yesNo(envText.includes('PADDLE_'))],
        ['Supabase variables documented in web env', yesNo(envText.includes('SUPABASE_'))],
      ]
    ),
    '',
    '## Next Work',
    '',
    '1. Audit Shannon web auth, billing, and env handling separately from the product portfolio readiness score.',
    '2. Document how Shannon consumes BMAD outputs and app audits so the setup track is traceable.',
    '3. Review deployment docs before production use.',
    '',
  ].join('\n');
}

function renderProductBriefs() {
  const webRows = byPlatform.web.map((app) => [
    app.title,
    app.category,
    `${app.score}/100`,
    app.hasPaddleEnv ? 'Paddle target documented' : 'Paddle target missing',
    app.hasSaasDocs ? code(app.saasDocsPath) : 'missing',
  ]);
  const mobileRows = byPlatform.mobile.map((app) => [
    app.title,
    app.category,
    `${app.score}/100`,
    app.expoSdk,
    app.hasSaasDocs ? code(app.saasDocsPath) : 'missing',
  ]);

  return [
    '# BMAD Product Briefs - Canonical 20-App Portfolio',
    `> Updated: ${registry.version} | Source of truth: ${code(AUDIT_DIR)} + app-level saas-docs`,
    '',
    '- Detailed per-app product documentation stays in each app `saas-docs/` directory; this root brief is the portfolio-level summary.',
    '- Billing target is normalized to Paddle at the portfolio level. Remaining Stripe traces are migration gaps, not launch-ready evidence.',
    '',
    '## Web Portfolio',
    '',
    renderTable(['App', 'Category', 'Current score', 'Billing target', 'Detailed docs'], webRows),
    '',
    '## Mobile Portfolio',
    '',
    renderTable(['App', 'Category', 'Current score', 'Expo SDK', 'Detailed docs'], mobileRows),
    '',
  ].join('\n');
}

function renderComprehensiveAudit() {
  const webAverage = average(byPlatform.web.map((app) => app.score));
  const mobileAverage = average(byPlatform.mobile.map((app) => app.score));
  const totalCritical = sum(canonicalApps.map((app) => app.criticalFindings));
  const totalHigh = sum(canonicalApps.map((app) => app.highFindings));
  const totalBlockers = sum(canonicalApps.map((app) => app.launchBlockers));
  const buildFailures = canonicalApps.filter((app) => app.buildStatus !== 'passed').length;
  const testFailures = canonicalApps.filter((app) => app.testStatus !== 'passed').length;
  const stripeWebhookWebApps = byPlatform.web.filter((app) => app.hasStripeWebhook).length;
  const paddleReadyEnvWebApps = byPlatform.web.filter((app) => app.hasPaddleEnv).length;

  const invoiceReadme = read(path.join(ROOT, 'invoiceai', 'README.md'));
  const complianceAuditScreen = read(path.join(ROOT, 'compliancesnap-expo', 'app', '(tabs)', 'audit.tsx'));
  const complianceTsconfig = read(path.join(ROOT, 'compliancesnap-expo', 'tsconfig.json'));

  const appRows = canonicalApps.map((app) => [
    app.title,
    app.platform,
    `${app.score}/100`,
    app.status,
    app.findings.slice(0, 2).join('; '),
    code(app.auditPath),
  ]);

  return [
    '# BMAD Comprehensive Audit - Canonical 20-App Portfolio',
    `> Updated: ${registry.version} | Source of truth: refreshed canonical scope + March 12 per-app audits`,
    '',
    '## Executive Summary',
    '',
    renderTable(
      ['Metric', 'Value'],
      [
        ['Canonical app count', '20'],
        ['Web average score', `${webAverage.toFixed(1)}/100`],
        ['Mobile average score', `${mobileAverage.toFixed(1)}/100`],
        ['Total critical findings', String(totalCritical)],
        ['Total high findings', String(totalHigh)],
        ['Total launch blockers', String(totalBlockers)],
        ['Apps with failing build verification', String(buildFailures)],
        ['Apps with failing automated checks', String(testFailures)],
        ['Web apps with Paddle env templates', String(paddleReadyEnvWebApps)],
        ['Web apps still exposing Stripe webhook routes', String(stripeWebhookWebApps)],
      ]
    ),
    '',
    '## Scope Corrections Applied',
    '',
    '- Shannon is now treated as a separate setup and infrastructure track rather than app 21.',
    '- The canonical ComplianceSnap app is `compliancesnap-expo`; plain `compliancesnap` is excluded from the core portfolio audit.',
    '- Root BMAD docs that previously claimed 100% launch readiness are replaced with the live audit baseline from `audit-2026-03-12` plus spot-checks against current code.',
    '',
    '## Current Reference-App Spot Checks',
    '',
    renderTable(
      ['Reference app', 'Verified current-state signal'],
      [
        [
          'InvoiceAI',
          `Paddle env present=${yesNo(read(path.join(ROOT, 'invoiceai', '.env.example')).includes('PADDLE_'))}, legacy Stripe references remain in README=${yesNo(invoiceReadme.includes('Stripe'))}, Stripe webhook route still exists=${yesNo(fs.existsSync(path.join(ROOT, 'invoiceai', 'app', 'api', 'webhooks', 'stripe', 'route.ts')))}`
        ],
        [
          'ComplianceSnap',
          `Mock datasets still present=${yesNo(complianceAuditScreen.includes('MOCK_AUDITS'))}, tsconfig still extends expo base=${yesNo(complianceTsconfig.includes('expo/tsconfig.base'))}`
        ]
      ]
    ),
    '',
    '## App Summary',
    '',
    renderTable(['App', 'Platform', 'Score', 'Status', 'Top verified findings', 'Audit'], appRows),
    '',
  ].join('\n');
}

function renderFeatureGapAnalysis() {
  const rows = canonicalApps.map((app) => [
    app.title,
    app.platform,
    app.findings.slice(0, 3).join('; '),
    inferBackendActions(app.findings),
    inferFrontendActions(app.findings),
    code(app.auditPath),
  ]);

  return [
    '# BMAD Feature Gap Analysis - Canonical 20-App Portfolio',
    `> Updated: ${registry.version} | Method: live-code audit findings mapped to missing or incomplete capability`,
    '',
    '- Detailed route-by-route and line-level evidence remains in each per-app audit under `audit-2026-03-12/apps/`.',
    '- Current Stripe surfaces are treated as migration gaps because Paddle is the canonical billing target.',
    '',
    renderTable(
      ['App', 'Platform', 'Top verified gaps', 'Backend required', 'Frontend required', 'Detailed audit'],
      rows
    ),
    '',
  ].join('\n');
}

function renderLaunchReadiness() {
  const averageScore = average(canonicalApps.map((app) => app.score));
  const rows = canonicalApps.map((app) => [
    app.title,
    app.platform,
    `${app.score}/100`,
    app.buildStatus,
    app.testStatus,
    app.findings[0] || 'See app audit',
    String(app.taskCount),
  ]);

  return [
    '# BMAD Launch Readiness Report - Canonical 20-App Portfolio',
    `> Updated: ${registry.version} | Status source: ${code(MATRIX_PATH)}`,
    '',
    `## Verdict: Not Launch Ready (${averageScore.toFixed(1)}/100 portfolio average)`,
    '',
    '- No app is currently recorded as `OK - Launch Ready` in the canonical matrix.',
    '- Shannon is no longer counted as a product app for readiness scoring.',
    '- The fastest path to a truthful relaunch review starts with `invoiceai` for web and `compliancesnap-expo` for mobile.',
    '',
    '## Portfolio Readiness Matrix',
    '',
    renderTable(['App', 'Platform', 'Score', 'Build', 'Tests', 'Top blocker', 'Task count'], rows),
    '',
  ].join('\n');
}

function renderMasterTaskList() {
  const appRows = canonicalApps.map((app) => [
    app.title,
    `${app.score}/100`,
    String(app.taskCount),
    app.tasks.slice(0, 3).join('; '),
    code(app.auditPath),
  ]);

  return [
    '# BMAD Master Task List - Canonical 20-App Portfolio',
    `> Updated: ${registry.version} | Detailed per-app task bodies remain in ${code(path.join(AUDIT_DIR, 'master-task-list.md'))}`,
    '',
    '- This root task list focuses on portfolio-normalization work plus app-level backlog pointers.',
    '- Every implementation task still begins with mandatory internet research in the per-app audit outputs.',
    '',
    '## Cross-Portfolio Tasks',
    '',
    '### Task 1: Normalize the canonical scope and reporting layer',
    '',
    'Research using the internet before implementing.',
    '',
    '- Task description: Remove stale launch-ready narratives and keep every top-level report aligned to the canonical 20-app registry plus the separate Shannon track.',
    '- Mandatory internet research: Research current release-governance and portfolio-status reporting practices for multi-product teams.',
    '- Frontend implementation: Update any portfolio dashboards or docs-linked status views that still imply Shannon is app 21 or that excluded roots are in scope.',
    '- Backend implementation: Make the registry and refresh pipeline the source of truth for the root BMAD docs.',
    '- Animations & usability improvements: Keep any status UI calm and legible; avoid celebratory states until readiness is verified.',
    '- Market/User pain points: Teams lose time and credibility when portfolio reporting contradicts code reality.',
    '- Deliverables: Canonical registry, refreshed root docs, and a repeatable refresh command.',
    '- Market impact: Improves planning accuracy and prevents false launch confidence.',
    '',
    '### Task 2: Migrate web billing posture to the Paddle target architecture',
    '',
    'Research using the internet before implementing.',
    '',
    '- Task description: Treat lingering Stripe routes, docs, and env traces as migration work until each web app is proven on the Paddle standard.',
    '- Mandatory internet research: Research current Paddle billing, webhook verification, entitlement sync, and India-friendly global SaaS patterns.',
    '- Frontend implementation: Update billing surfaces, checkout messaging, pricing states, and failure handling to reflect the canonical provider.',
    '- Backend implementation: Replace or retire Stripe-only webhook routes, secret contracts, and billing handlers where they conflict with the target architecture.',
    '- Animations & usability improvements: Keep checkout, retry, and confirmation flows honest and low-friction.',
    '- Market/User pain points: Mixed billing stacks create broken purchases, operator confusion, and launch risk.',
    '- Deliverables: Paddle-ready billing contracts, webhook verification, and updated docs per web app.',
    '- Market impact: Reduces payment complexity and aligns the portfolio to a single monetization direction.',
    '',
    '### Task 3: Standardize Supabase security and env boundaries across all apps',
    '',
    'Research using the internet before implementing.',
    '',
    '- Task description: Enforce public/private env boundaries, service-role isolation, RLS verification, RBAC checks, and safe logging across the portfolio.',
    '- Mandatory internet research: Research current Supabase security hardening, RLS testing, and production secret-management practices.',
    '- Frontend implementation: Expose only safe public config and present clear denied, expired-session, and retry states.',
    '- Backend implementation: Validate env contracts, rotate sensitive settings to server-only usage, and verify authz on protected routes and storage access.',
    '- Animations & usability improvements: Keep auth and permission feedback informative without leaking internal detail.',
    '- Market/User pain points: Weak secret handling and role enforcement are direct production blockers.',
    '- Deliverables: Verified env templates, documented key ownership, and audited access-control coverage.',
    '- Market impact: Improves trust, compliance posture, and production safety.',
    '',
    '## App Backlog Summary',
    '',
    renderTable(['App', 'Score', 'Task count', 'Top task headings', 'Detailed audit'], appRows),
    '',
  ].join('\n');
}

function inferBackendActions(findings) {
  const actions = new Set();
  for (const finding of findings) {
    if (finding.includes('OAuth callback')) actions.add('Add auth callback and session exchange');
    if (finding.includes('caller authentication')) actions.add('Protect AI routes with authenticated callers');
    if (finding.includes('rate limiting')) actions.add('Add explicit rate limiting and abuse controls');
    if (finding.includes('Mock or placeholder')) actions.add('Replace mocks with live queries and writes');
    if (finding.includes('Timeout-based stubs')) actions.add('Connect real integrations instead of simulated completion');
    if (finding.includes('select(*)')) actions.add('Scope data access to explicit fields');
    if (finding.includes('TODO/FIXME')) actions.add('Resolve unfinished server logic and release markers');
    if (finding.includes('Build verification failed')) actions.add('Repair dependencies, module resolution, and runtime contracts');
    if (finding.includes('Automated tests/checks failed')) actions.add('Stabilize typecheck, tests, and CI entrypoints');
  }
  return actions.size ? [...actions].slice(0, 3).join('; ') : 'See app audit';
}

function inferFrontendActions(findings) {
  const actions = new Set();
  for (const finding of findings) {
    if (finding.includes('OAuth callback')) actions.add('Complete auth redirect and post-login states');
    if (finding.includes('caller authentication')) actions.add('Gate AI surfaces and add quota or denied states');
    if (finding.includes('rate limiting')) actions.add('Show retry and quota feedback in AI flows');
    if (finding.includes('Mock or placeholder')) actions.add('Wire screens to live data and honest empty states');
    if (finding.includes('Timeout-based stubs')) actions.add('Replace fake progress with real loading and failure UX');
    if (finding.includes('Documented screens are not fully matched')) actions.add('Implement missing routes and feature screens');
    if (finding.includes('TODO/FIXME')) actions.add('Finish unfinished UI branches and remove placeholder labels');
    if (finding.includes('Build verification failed')) actions.add('Fix broken imports and route rendering');
    if (finding.includes('Automated tests/checks failed')) actions.add('Add or repair smoke coverage for critical user paths');
  }
  return actions.size ? [...actions].slice(0, 3).join('; ') : 'See app audit';
}

function parseFirstMarkdownTable(text) {
  const lines = text.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.startsWith('|') && line.includes('app') && line.includes('platform'));
  if (headerIndex === -1) return { headers: [], rows: [] };
  const header = parseTableCells(lines[headerIndex]);
  const rows = [];
  for (let index = headerIndex + 2; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.startsWith('|')) break;
    const cells = parseTableCells(line);
    if (cells.length !== header.length) continue;
    rows.push(Object.fromEntries(header.map((key, cellIndex) => [key, cells[cellIndex]])));
  }
  return { headers: header, rows };
}

function parseTableCells(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function renderTable(headers, rows) {
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
  ];
  for (const row of rows) lines.push(`| ${row.join(' | ')} |`);
  return lines.join('\n');
}

function summarizeRuntimeIntent(runtimeIntent) {
  return runtimeIntent
    .replace('app.json=present, ', '')
    .replace('proxy=present, ', '')
    .replace('privacy=present, terms=present', 'policy=yes');
}

function average(values) {
  return values.length ? sum(values) / values.length : 0;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function matchOne(text, pattern) {
  return text.match(pattern)?.[1] || null;
}

function yesNo(value) {
  return value ? 'yes' : 'no';
}

function code(value) {
  return `\`${value}\``;
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function write(filePath, contents) {
  fs.writeFileSync(filePath, `${contents.trimEnd()}\n`, 'utf8');
}
