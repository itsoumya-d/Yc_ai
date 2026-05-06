import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'E:/Yc_ai';
const OUTPUT_DIR = path.join(ROOT, 'audit-2026-03-12');
const APPS_DIR = path.join(OUTPUT_DIR, 'apps');
const RUNTIME_RESULTS_PATH = path.join(OUTPUT_DIR, 'runtime-results.json');
const PRIOR_PORTFOLIO_REPORT = path.join(ROOT, 'LAUNCH-READINESS-REPORT.md');
const PRIOR_AUDIT_DIR = path.join(ROOT, 'audit-2026-03');

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  'android',
  'ios',
  '.expo',
  '.turbo',
]);

const SOURCE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.sql',
  '.md',
  '.css',
  '.mjs',
  '.cjs',
]);

const POLICY_LINKS = {
  expo: [
    '[Expo SDK 55](https://expo.dev/changelog/sdk-55)',
    '[Expo SDK](https://expo.dev/sdk)',
  ],
  apple: [
    '[App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)',
    '[App Review Prep](https://developer.apple.com/app-store/review/)',
  ],
  googlePlay: [
    '[Target API Requirements](https://support.google.com/googleplay/android-developer/answer/11926878)',
    '[Play Console Help](https://support.google.com/googleplay/android-developer/)',
  ],
};

const APPS = [
  {
    name: 'invoiceai',
    title: 'InvoiceAI',
    platform: 'web',
    canonicalPath: 'E:/Yc_ai/invoiceai',
    docPath: 'E:/Yc_ai/saas-ideas/web-first/b2c/24-invoiceai',
    category: 'AI invoicing and payment collection for freelancers',
    benchmark: {
      competitors: [
        { name: 'FreshBooks', url: 'https://www.freshbooks.com/' },
        { name: 'Wave', url: 'https://www.waveapps.com/' },
        { name: 'Zoho Invoice', url: 'https://www.zoho.com/invoice/' },
      ],
      painPoints: [
        'Manual invoice drafting takes too long',
        'Late payment follow-up is awkward and inconsistent',
        'Freelancers lack forward-looking cash visibility',
      ],
      lessons: [
        'Keep AI drafting editable and paired with strong invoice previews',
        'Make payment links frictionless and reminder schedules transparent',
      ],
    },
  },
  {
    name: 'petos',
    title: 'PetOS',
    platform: 'web',
    canonicalPath: 'E:/Yc_ai/petos',
    docPath: 'E:/Yc_ai/saas-ideas/web-first/b2c/25-petos',
    category: 'Pet health management and care marketplace',
    benchmark: {
      competitors: [
        { name: 'PetDesk', url: 'https://petdesk.com/' },
        { name: 'Airvet', url: 'https://airvet.com/' },
        { name: 'Rover', url: 'https://www.rover.com/' },
      ],
      painPoints: [
        'Pet owners struggle to centralize records, appointments, and care tasks',
        'Booking veterinary and pet-care services lacks trust signals and continuity',
        'Medication and health-tracking workflows are often fragmented',
      ],
      lessons: [
        'Blend health records with booking workflows instead of splitting them into separate journeys',
        'Use strong provider profiles, reminders, and progress summaries to reduce missed care actions',
      ],
    },
  },
  {
    name: 'storythread',
    title: 'StoryThread',
    platform: 'web',
    canonicalPath: 'E:/Yc_ai/storythread',
    docPath: 'E:/Yc_ai/saas-ideas/web-first/b2c/22-storythread',
    category: 'Collaborative writing and story development',
    benchmark: {
      competitors: [
        { name: 'Wattpad', url: 'https://www.wattpad.com/' },
        { name: 'Reedsy Book Editor', url: 'https://reedsy.com/write-a-book' },
        { name: 'Sudowrite', url: 'https://www.sudowrite.com/' },
      ],
      painPoints: [
        'Writers lose momentum when drafting, collaboration, and publishing live in separate tools',
        'AI writing tools can feel generic without strong structure and worldbuilding support',
        'Readers and co-authors need lightweight access without complex permissions',
      ],
      lessons: [
        'Make collaboration, chapter navigation, and AI assistance feel native to the editor flow',
        'Support public sharing and private drafting with clear role boundaries',
      ],
    },
  },
  {
    name: 'proposalpilot',
    title: 'ProposalPilot',
    platform: 'web',
    canonicalPath: 'E:/Yc_ai/proposalpilot',
    docPath: 'E:/Yc_ai/saas-ideas/web-first/b2b/26-proposalpilot',
    category: 'AI proposal generation and sales enablement',
    benchmark: {
      competitors: [
        { name: 'PandaDoc', url: 'https://www.pandadoc.com/' },
        { name: 'Proposify', url: 'https://www.proposify.com/' },
        { name: 'Qwilr', url: 'https://qwilr.com/' },
      ],
      painPoints: [
        'Proposal creation is repetitive and error-prone',
        'Sales teams struggle to keep branding, pricing, and approvals consistent',
        'Tracking engagement after a proposal is sent is often weak',
      ],
      lessons: [
        'Pair reusable templates with AI drafting, versioning, and approval-safe data models',
        'Treat proposal analytics and follow-up prompts as first-class product surfaces',
      ],
    },
  },
  {
    name: 'boardbrief',
    title: 'BoardBrief',
    platform: 'web',
    canonicalPath: 'E:/Yc_ai/boardbrief',
    docPath: 'E:/Yc_ai/saas-ideas/web-first/b2b/29-boardbrief',
    category: 'Board deck preparation and governance workflows',
    benchmark: {
      competitors: [
        { name: 'Boardable', url: 'https://boardable.com/' },
        { name: 'Diligent Boards', url: 'https://www.diligent.com/products/board-management-software' },
        { name: 'Carta', url: 'https://carta.com/' },
      ],
      painPoints: [
        'Founders spend days stitching together board materials from disconnected systems',
        'Governance portals often feel secure but slow and unpleasant to use',
        'Minutes, action items, and board materials drift out of sync',
      ],
      lessons: [
        'Unify deck generation, board portal access, and follow-up workflows',
        'Performance and permissions matter as much as document completeness in board software',
      ],
    },
  },
  {
    name: 'neighbordao',
    title: 'NeighborDAO',
    platform: 'web',
    canonicalPath: 'E:/Yc_ai/neighbordao',
    docPath: 'E:/Yc_ai/saas-ideas/web-first/b2c/23-neighbordao',
    category: 'Community governance and neighborhood coordination',
    benchmark: {
      competitors: [
        { name: 'Nextdoor', url: 'https://nextdoor.com/' },
        { name: 'Snapshot', url: 'https://snapshot.box/' },
        { name: 'Commonplace', url: 'https://www.commonplace.is/' },
      ],
      painPoints: [
        'Neighborhood coordination tools rarely combine participation, scheduling, and purchasing cleanly',
        'Governance flows can become noisy or exclusionary without clear structures',
        'Members need trust, transparency, and low-friction participation',
      ],
      lessons: [
        'Use transparent proposal, RSVP, and booking flows with clear member context',
        'Pair governance features with everyday utility to sustain engagement',
      ],
    },
  },
  {
    name: 'skillbridge',
    title: 'SkillBridge',
    platform: 'web',
    canonicalPath: 'E:/Yc_ai/skillbridge',
    docPath: 'E:/Yc_ai/saas-ideas/web-first/b2c/21-skillbridge',
    category: 'Career transition, learning, and job matching',
    benchmark: {
      competitors: [
        { name: 'LinkedIn', url: 'https://www.linkedin.com/' },
        { name: 'Coursera', url: 'https://www.coursera.org/' },
        { name: 'Indeed', url: 'https://www.indeed.com/' },
      ],
      painPoints: [
        'Users struggle to turn skills into credible job matches and tailored applications',
        'Learning products and job boards rarely share state',
        'Career-change users need confidence-building feedback, not just search filters',
      ],
      lessons: [
        'Bridge learning plans, role comparisons, and applications inside one guided flow',
        'Use concrete skill-gap summaries and previewable artifacts like resumes and applications',
      ],
    },
  },
  {
    name: 'complibot',
    title: 'CompliBot',
    platform: 'web',
    canonicalPath: 'E:/Yc_ai/complibot',
    docPath: 'E:/Yc_ai/saas-ideas/web-first/b2b/27-complibot',
    category: 'Compliance automation and policy management',
    benchmark: {
      competitors: [
        { name: 'Vanta', url: 'https://www.vanta.com/' },
        { name: 'Drata', url: 'https://drata.com/' },
        { name: 'Secureframe', url: 'https://secureframe.com/' },
      ],
      painPoints: [
        'Compliance work is repetitive, evidence-heavy, and easy to let drift',
        'Framework views often bury actual remediation tasks and policy ownership',
        'Automation loses value when integrations and approvals are partial',
      ],
      lessons: [
        'Expose framework progress, policy editing, and evidence gaps in one place',
        'Keep control ownership, audit evidence, and integrations visibly connected',
      ],
    },
  },
  {
    name: 'dealroom',
    title: 'DealRoom',
    platform: 'web',
    canonicalPath: 'E:/Yc_ai/dealroom',
    docPath: 'E:/Yc_ai/saas-ideas/web-first/b2b/28-dealroom',
    category: 'Sales intelligence and deal execution',
    benchmark: {
      competitors: [
        { name: 'Gong', url: 'https://www.gong.io/' },
        { name: 'Apollo', url: 'https://www.apollo.io/' },
        { name: 'HubSpot Sales Hub', url: 'https://www.hubspot.com/products/sales' },
      ],
      painPoints: [
        'Revenue teams juggle CRM updates, email composition, and opportunity context across tools',
        'Deal hygiene decays quickly without clear next actions and visibility',
        'AI-generated outreach only works when grounded in live opportunity data',
      ],
      lessons: [
        'Keep email composition, deal context, and analytics together around the active opportunity',
        'Prioritize crisp workflows for follow-ups, stage changes, and stakeholder context',
      ],
    },
  },
  {
    name: 'claimforge',
    title: 'ClaimForge',
    platform: 'web',
    canonicalPath: 'E:/Yc_ai/claimforge',
    docPath: 'E:/Yc_ai/saas-ideas/web-first/b2b/30-claimforge',
    category: 'Whistleblower and claims evidence analysis',
    benchmark: {
      competitors: [
        { name: 'NAVEX', url: 'https://www.navex.com/' },
        { name: 'Case IQ', url: 'https://caseiq.com/' },
        { name: 'EQS Integrity Line', url: 'https://www.integrityline.com/' },
      ],
      painPoints: [
        'Investigations require fast evidence triage and defensible chain-of-custody behavior',
        'Case tools often make timeline, entity, and exhibit review too fragmented',
        'Trust and confidentiality expectations are much higher than standard SaaS flows',
      ],
      lessons: [
        'Link documents, entities, evidence, and timelines tightly around each case',
        'Security, auditability, and review ergonomics should shape every UI decision',
      ],
    },
  },
  {
    name: 'fieldlens',
    title: 'FieldLens',
    platform: 'mobile',
    canonicalPath: 'E:/Yc_ai/fieldlens',
    docPath: 'E:/Yc_ai/saas-ideas/mobile-first/b2c/01-fieldlens',
    category: 'AR-assisted workflows for tradespeople',
    benchmark: {
      competitors: [
        { name: 'magicplan', url: 'https://www.magicplan.app/' },
        { name: 'Canvas', url: 'https://canvas.io/' },
        { name: 'Fieldwire', url: 'https://www.fieldwire.com/' },
      ],
      painPoints: [
        'Field workers need capture, annotation, and measurements to work in harsh conditions',
        'Mobile-first tools fail when offline behavior and camera flows are weak',
        'AR features are only valuable when they shorten the job, not just look impressive',
      ],
      lessons: [
        'Optimize capture speed, offline resilience, and markups before polishing advanced AR',
        'Keep annotations, measurements, and job records synchronized with minimal taps',
      ],
    },
  },
  {
    name: 'mortal',
    title: 'Mortal',
    platform: 'mobile',
    canonicalPath: 'E:/Yc_ai/mortal',
    docPath: 'E:/Yc_ai/saas-ideas/mobile-first/b2c/02-mortal',
    category: 'End-of-life planning and digital vault',
    benchmark: {
      competitors: [
        { name: 'Everplans', url: 'https://www.everplans.com/' },
        { name: 'Cake', url: 'https://www.joincake.com/' },
        { name: 'GoodTrust', url: 'https://mygoodtrust.com/' },
      ],
      painPoints: [
        'Users need emotional safety, security trust, and clear progress through sensitive tasks',
        'Vague contact permissions and document handling break confidence quickly',
        'Mobile biometrics and notification workflows need to feel calm and reliable',
      ],
      lessons: [
        'Design every step with trust cues, plain language, and low-pressure progress',
        'Connect document security, trusted contacts, and check-in flows without mock data',
      ],
    },
  },
  {
    name: 'claimback',
    title: 'Claimback',
    platform: 'mobile',
    canonicalPath: 'E:/Yc_ai/claimback',
    docPath: 'E:/Yc_ai/saas-ideas/mobile-first/b2c/03-claimback',
    category: 'Consumer dispute automation and bill recovery',
    benchmark: {
      competitors: [
        { name: 'DoNotPay', url: 'https://donotpay.com/' },
        { name: 'Rocket Money', url: 'https://www.rocketmoney.com/' },
        { name: 'BillShark', url: 'https://www.billshark.com/' },
      ],
      painPoints: [
        'Users need confidence that a claim flow is legitimate and worth the effort',
        'Dispute apps lose trust when document capture and status tracking are vague',
        'Submission readiness, negotiation updates, and expected outcomes must be explicit',
      ],
      lessons: [
        'Keep claim intake, evidence upload, and timeline visibility extremely clear',
        'Use progress, language, and notifications to reduce abandonment in stressful flows',
      ],
    },
  },
  {
    name: 'aura-check',
    title: 'Aura Check',
    platform: 'mobile',
    canonicalPath: 'E:/Yc_ai/aura-check',
    docPath: 'E:/Yc_ai/saas-ideas/mobile-first/b2c/04-aura-check',
    category: 'Skin health tracking and check-ins',
    benchmark: {
      competitors: [
        { name: 'SkinVision', url: 'https://www.skinvision.com/' },
        { name: 'Miiskin', url: 'https://miiskin.com/' },
        { name: 'First Derm', url: 'https://www.firstderm.com/' },
      ],
      painPoints: [
        'Health apps must balance reassurance with clear medical disclaimers and next steps',
        'Camera capture quality and longitudinal comparisons make or break trust',
        'Users need habit-forming reminders without panic-inducing language',
      ],
      lessons: [
        'Prioritize image capture guidance, comparison views, and conservative claims',
        'Combine reminders, trend views, and escalation guidance around actual user concerns',
      ],
    },
  },
  {
    name: 'govpass',
    title: 'GovPass',
    platform: 'mobile',
    canonicalPath: 'E:/Yc_ai/govpass',
    docPath: 'E:/Yc_ai/saas-ideas/mobile-first/b2c/05-govpass',
    category: 'Government form guidance and completion support',
    benchmark: {
      competitors: [
        { name: 'ID.me', url: 'https://www.id.me/' },
        { name: 'USAHello', url: 'https://usahello.org/' },
        { name: 'TurboTax', url: 'https://turbotax.intuit.com/' },
      ],
      painPoints: [
        'Government forms are intimidating, hard to decode, and frequently abandoned',
        'Users need clear language, save-and-return support, and trust in data handling',
        'Error handling and document requirements need to be explicit before submission',
      ],
      lessons: [
        'Break complex forms into guided steps with plain-language explanations',
        'Show document requirements, validation, and next steps early and often',
      ],
    },
  },
  {
    name: 'sitesync',
    title: 'SiteSync',
    platform: 'mobile',
    canonicalPath: 'E:/Yc_ai/sitesync',
    docPath: 'E:/Yc_ai/saas-ideas/mobile-first/b2b/06-sitesync',
    category: 'Construction photo documentation and site coordination',
    benchmark: {
      competitors: [
        { name: 'Procore', url: 'https://www.procore.com/' },
        { name: 'Raken', url: 'https://www.rakenapp.com/' },
        { name: 'OpenSpace', url: 'https://www.openspace.ai/' },
      ],
      painPoints: [
        'Construction teams need fast mobile capture, offline support, and accurate context',
        'Documentation loses value when photos, tasks, and site locations drift apart',
        'Supervisors need confidence in timelines, sync, and accountability',
      ],
      lessons: [
        'Keep capture, annotation, sync status, and job context tightly connected',
        'Use strong offline and retry states because field connectivity is unreliable',
      ],
    },
  },
  {
    name: 'routeai',
    title: 'RouteAI',
    platform: 'mobile',
    canonicalPath: 'E:/Yc_ai/routeai',
    docPath: 'E:/Yc_ai/saas-ideas/mobile-first/b2b/07-routeai',
    category: 'Route optimization and field dispatch',
    benchmark: {
      competitors: [
        { name: 'Circuit', url: 'https://getcircuit.com/' },
        { name: 'Routific', url: 'https://routific.com/' },
        { name: 'Onfleet', url: 'https://onfleet.com/' },
      ],
      painPoints: [
        'Dispatch tools must handle route changes, driver clarity, and ETAs without lag',
        'Users abandon planners that hide the why behind route recommendations',
        'Offline maps and sync failures create real-world operational damage',
      ],
      lessons: [
        'Expose route rationale, stop status, and change management clearly on mobile',
        'Make map, list, and dispatch actions feel instant and resilient to poor networks',
      ],
    },
  },
  {
    name: 'inspector-ai',
    title: 'Inspector AI',
    platform: 'mobile',
    canonicalPath: 'E:/Yc_ai/inspector-ai',
    docPath: 'E:/Yc_ai/saas-ideas/mobile-first/b2b/08-inspector-ai',
    category: 'Property inspection and defect reporting',
    benchmark: {
      competitors: [
        { name: 'Spectora', url: 'https://spectora.com/' },
        { name: 'HappyCo', url: 'https://happy.co/' },
        { name: 'zInspector', url: 'https://zinspector.com/' },
      ],
      painPoints: [
        'Inspectors need structured capture, clear defect evidence, and fast report generation',
        'Photo-heavy flows can bog down without strong upload and organization behavior',
        'Clients need readable reports, not just raw checklists',
      ],
      lessons: [
        'Keep inspection templates, media capture, and issue summaries tightly linked',
        'Support trust with timestamps, annotations, and export-ready reporting',
      ],
    },
  },
  {
    name: 'stockpulse',
    title: 'StockPulse',
    platform: 'mobile',
    canonicalPath: 'E:/Yc_ai/stockpulse',
    docPath: 'E:/Yc_ai/saas-ideas/mobile-first/b2b/09-stockpulse',
    category: 'Inventory management and stock monitoring',
    benchmark: {
      competitors: [
        { name: 'Sortly', url: 'https://www.sortly.com/' },
        { name: 'Zoho Inventory', url: 'https://www.zoho.com/inventory/' },
        { name: 'inFlow', url: 'https://www.inflowinventory.com/' },
      ],
      painPoints: [
        'Inventory tools fail when scans, counts, and alerts are too slow on mobile',
        'Warehouse and field teams need clarity around low-stock actions and sync status',
        'Stock systems lose credibility when adjustments are hard to audit',
      ],
      lessons: [
        'Optimize scanning, quick adjustments, and audit trails for real-world speed',
        'Use clear thresholds, alerts, and history around inventory changes',
      ],
    },
  },
  {
    name: 'compliancesnap-expo',
    title: 'ComplianceSnap',
    platform: 'mobile',
    canonicalPath: 'E:/Yc_ai/compliancesnap-expo',
    docPath: 'E:/Yc_ai/saas-ideas/mobile-first/b2b/10-compliancesnap',
    category: 'Field safety compliance and audit capture',
    benchmark: {
      competitors: [
        { name: 'SafetyCulture', url: 'https://safetyculture.com/' },
        { name: 'EHS Insight', url: 'https://www.ehsinsight.com/' },
        { name: 'KPA Flex', url: 'https://kpa.io/software/flex/' },
      ],
      painPoints: [
        'Safety apps need fast capture, evidence quality, and action follow-through',
        'Compliance teams need clear audit trails, corrective actions, and reporting',
        'Mobile field tools fail when inspections, records, and remediation are disconnected',
      ],
      lessons: [
        'Unify inspections, records, corrective actions, and reports in one mobile loop',
        'Trust depends on auditability, offline resilience, and strong permissions',
      ],
    },
  },
];

function exists(targetPath) {
  return fs.existsSync(targetPath);
}

function readText(targetPath) {
  try {
    return fs.readFileSync(targetPath, 'utf8');
  } catch {
    return '';
  }
}

function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function normalize(targetPath) {
  return targetPath.replaceAll('\\', '/');
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.git')) continue;
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(fullPath));
      continue;
    }
    if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

function safeJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function splitLines(text) {
  return text.split(/\r?\n/);
}

function countLines(text) {
  return splitLines(text).length;
}

function stripAnsi(text) {
  return String(text ?? '').replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '');
}

function rel(root, target) {
  return normalize(path.relative(root, target));
}

function routeFromAppRelative(relativePath, platform) {
  const normalized = normalize(relativePath);
  const parts = normalized.split('/');
  const cleaned = [];
  for (const part of parts) {
    if (part.startsWith('(') && part.endsWith(')')) continue;
    cleaned.push(part);
  }
  if (platform === 'web') {
    if (cleaned.at(-1) === 'page.tsx') cleaned.pop();
    if (cleaned.at(-1) === 'route.ts') cleaned.pop();
  } else {
    const last = cleaned.at(-1) ?? '';
    cleaned[cleaned.length - 1] = last.replace(/\.(tsx|ts|jsx|js)$/, '');
    if (cleaned.at(-1) === 'index') cleaned.pop();
  }
  const route = `/${cleaned.join('/')}`.replace(/\/+/g, '/');
  return route === '/' ? '/' : route.replace(/\/$/, '');
}

function collectWebRoutes(appRoot, files) {
  const routes = [];
  for (const appRootDir of ['app', 'src/app']) {
    const baseDir = path.join(appRoot, appRootDir);
    if (!exists(baseDir)) continue;
    for (const file of files) {
      const normalized = normalize(file);
      if (!normalized.startsWith(normalize(baseDir))) continue;
      const fileName = path.basename(file);
      const kind =
        fileName === 'page.tsx'
          ? 'page'
          : fileName === 'route.ts'
            ? 'api'
            : fileName === 'loading.tsx'
              ? 'loading'
              : fileName === 'error.tsx'
                ? 'error'
                : fileName === 'not-found.tsx'
                  ? 'not-found'
                  : fileName === 'global-error.tsx'
                    ? 'global-error'
                    : null;
      if (!kind) continue;
      const relativePath = rel(baseDir, file);
      routes.push({
        file: normalize(file),
        relativePath,
        route: routeFromAppRelative(relativePath, 'web'),
        kind,
      });
    }
  }
  return routes.sort((a, b) => a.route.localeCompare(b.route) || a.kind.localeCompare(b.kind));
}

function collectMobileRoutes(appRoot, files) {
  const baseDir = path.join(appRoot, 'app');
  if (!exists(baseDir)) return [];
  const routes = [];
  for (const file of files) {
    if (!normalize(file).startsWith(normalize(baseDir))) continue;
    const fileName = path.basename(file);
    if (!/\.(tsx|ts|jsx|js)$/.test(fileName)) continue;
    if (fileName === '_layout.tsx' || fileName === '_layout.ts' || fileName === '+html.tsx') continue;
    const relativePath = rel(baseDir, file);
    routes.push({
      file: normalize(file),
      relativePath,
      route: routeFromAppRelative(relativePath, 'mobile'),
      kind: 'screen',
    });
  }
  return routes.sort((a, b) => a.route.localeCompare(b.route));
}

function parseDocRoutes(text) {
  const routes = new Set();
  if (!text) return [];
  const explicitRouteRegex = /\*\*Route:\*\*\s*`([^`]+)`/g;
  for (const match of text.matchAll(explicitRouteRegex)) {
    routes.add(match[1].trim());
  }
  const genericRouteRegex = /(^|\s)(\/[^\s`|)]+)/gm;
  for (const match of text.matchAll(genericRouteRegex)) {
    const candidate = match[2].trim().replace(/[)\].,;:]+$/, '');
    if (candidate.length > 1 && !candidate.startsWith('/Users')) {
      routes.add(candidate);
    }
  }
  return [...routes].sort();
}

function parseFeatureHeadings(text) {
  if (!text) return [];
  const headings = [];
  const regex = /^###\s+(.+)$/gm;
  for (const match of text.matchAll(regex)) {
    headings.push(match[1].trim());
  }
  return headings;
}

function findMatches(files, regex, maxResults = 10) {
  const matches = [];
  for (const file of files) {
    const text = readText(file);
    const lines = splitLines(text);
    for (let index = 0; index < lines.length; index += 1) {
      if (!regex.test(lines[index])) continue;
      matches.push({
        file: normalize(file),
        line: index + 1,
        text: lines[index].trim(),
      });
      if (matches.length >= maxResults) {
        return matches;
      }
    }
  }
  return matches;
}

function hasPattern(files, regex) {
  return findMatches(files, regex, 1).length > 0;
}

function findFirstFile(appRoot, candidates) {
  for (const candidate of candidates) {
    const target = path.join(appRoot, candidate);
    if (exists(target)) return target;
  }
  return null;
}

function summarizeModules(appRoot, files) {
  const buckets = new Map();
  for (const file of files) {
    const relative = rel(appRoot, file);
    const top = relative.split('/')[0];
    buckets.set(top, (buckets.get(top) ?? 0) + 1);
  }
  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([bucket, count]) => `- \`${bucket}\`: ${count} source files`)
    .join('\n');
}

function collectDocFiles(docPath) {
  const docs = {};
  for (const fileName of [
    'README.md',
    'tech-stack.md',
    'features.md',
    'screens.md',
    'api-guide.md',
    'theme.md',
    'skills.md',
    'revenue-model.md',
  ]) {
    const filePath = path.join(docPath, fileName);
    docs[fileName] = readText(filePath);
  }
  return docs;
}

function collectAuthSignals(app, files) {
  const google = hasPattern(files, /provider:\s*['"]google['"]|signInWithGoogle|Continue with Google|Google OAuth/i);
  const apple = hasPattern(files, /provider:\s*['"]apple['"]|signInWithApple|Sign in with Apple|Continue with Apple|expo-apple-authentication/i);
  const emailLogin = hasPattern(files, /signInWithPassword|signInWithEmail|magic link|login/i);
  const emailSignup = hasPattern(files, /signUp\(|signUpWithEmail|Create Account|signup/i);
  const nativeApple = hasPattern(files, /signInWithIdToken|AppleAuthentication\.signInAsync|expo-apple-authentication/i);
  return {
    google,
    apple,
    emailLogin,
    emailSignup,
    nativeApple,
    appleRequired: app.platform === 'mobile',
  };
}

function loadRuntimeResults() {
  const parsed = safeJson(RUNTIME_RESULTS_PATH);
  return parsed && typeof parsed === 'object' ? parsed : {};
}

function getPriorAuditSummary(app) {
  const platformDir = app.platform === 'web' ? 'web' : 'mobile';
  const priorFile = path.join(PRIOR_AUDIT_DIR, platformDir, `${app.name.replace('-expo', '')}-audit.md`);
  const text = readText(priorFile);
  const launchText = readText(PRIOR_PORTFOLIO_REPORT);
  const scoreMatch = text.match(/Completion Score:\s*(\d+)\s*\/\s*100/i);
  const statusMatch = text.match(/Status:\s*(.+)/i);
  const portfolioMarkedReady = launchText.includes(app.title) && launchText.includes('100%');
  return {
    hasPriorAudit: Boolean(text),
    priorScore: scoreMatch ? Number(scoreMatch[1]) : null,
    priorStatus: statusMatch ? statusMatch[1].trim() : null,
    portfolioMarkedReady,
  };
}

function detectStoreConfig(appRoot, platform) {
  if (platform === 'web') {
    return {
      legalPages: {
        privacy: exists(path.join(appRoot, 'app', 'privacy', 'page.tsx')) || exists(path.join(appRoot, 'src', 'app', 'privacy', 'page.tsx')),
        terms: exists(path.join(appRoot, 'app', 'terms', 'page.tsx')) || exists(path.join(appRoot, 'src', 'app', 'terms', 'page.tsx')),
      },
      hasEnvExample: exists(path.join(appRoot, '.env.example')),
      hasProxy: exists(path.join(appRoot, 'proxy.ts')),
      hasAuthCallback:
        exists(path.join(appRoot, 'app', 'auth', 'callback', 'route.ts')) ||
        exists(path.join(appRoot, 'app', 'auth', 'callback', 'page.tsx')) ||
        exists(path.join(appRoot, 'src', 'app', 'auth', 'callback', 'route.ts')) ||
        exists(path.join(appRoot, 'src', 'app', 'auth', 'callback', 'page.tsx')),
      hasMigrations: exists(path.join(appRoot, 'supabase', 'migrations')),
    };
  }

  const appJson = safeJson(path.join(appRoot, 'app.json')) ?? {};
  const expoConfig = appJson.expo ?? {};
  return {
    hasAppJson: exists(path.join(appRoot, 'app.json')),
    hasEas: exists(path.join(appRoot, 'eas.json')),
    hasMigrations: exists(path.join(appRoot, 'supabase', 'migrations')),
    hasIosBundleId: Boolean(expoConfig.ios?.bundleIdentifier),
    hasAndroidPackage: Boolean(expoConfig.android?.package),
    hasIcon: Boolean(expoConfig.icon),
    hasSplash: Boolean(expoConfig.splash),
    versionCode: expoConfig.android?.versionCode ?? null,
    buildNumber: expoConfig.ios?.buildNumber ?? null,
    scheme: expoConfig.scheme ?? null,
  };
}

function collectPackageSignals(appRoot) {
  const pkg = safeJson(path.join(appRoot, 'package.json')) ?? {};
  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  return {
    version: pkg.version ?? '0.0.0',
    scripts: pkg.scripts ?? {},
    nextVersion: deps.next ?? null,
    reactVersion: deps.react ?? null,
    expoVersion: deps.expo ?? null,
    hasNotificationsPkg: Boolean(deps['expo-notifications']),
    hasApplePkg: Boolean(deps['expo-apple-authentication']),
    hasSupabase: Boolean(deps['@supabase/supabase-js'] || deps['@supabase/ssr']),
  };
}

function normalizeRuntimeEntry(entry) {
  if (!entry || typeof entry !== 'object') return {};
  const normalized = JSON.parse(JSON.stringify(entry));
  const failurePattern = /PluginError|ConfigError|Build error occurred|Module not found|error TS\d+|Failed Suites|FAIL\s|Cannot determine the project's Expo SDK version/i;
  for (const key of ['build', 'test']) {
    const details = stripAnsi(normalized[key]?.details ?? '');
    if (normalized[key]) normalized[key].details = details;
    if (normalized[key]?.status === 'passed' && failurePattern.test(details)) {
      normalized[key].status = 'failed';
    }
  }
  return normalized;
}

function addFinding(findings, severity, title, detail, taskKey, evidence = [], deduction = 0) {
  findings.push({
    severity,
    title,
    detail,
    taskKey,
    evidence,
    deduction,
  });
}

function collectFindings(app, context) {
  const findings = [];
  const { appRoot, files, auth, storeConfig, packageSignals, runtime, routes, docRoutes, prior } = context;

  const missingDocRoutes = docRoutes.filter((route) => !routes.pageRoutes.has(route) && !routes.screenRoutes.has(route));
  const mockMatches = findMatches(files, /\bMOCK_[A-Z0-9_]+|mock data|placeholder data/i, 8);
  const todoMatches = findMatches(files, /\bTODO\b|\bFIXME\b/i, 8);
  const selectStarMatches = findMatches(files, /\.select\(\s*['"]\*['"]\s*\)/, 12);
  const setTimeoutMatches = findMatches(files, /\bsetTimeout\s*\(/, 8);
  const portalTokenMatches = findMatches(files, /portal_token\s+IS\s+NOT\s+NULL/i, 4);
  const aiRoutePath = findFirstFile(appRoot, ['app/api/ai/generate/route.ts', 'src/app/api/ai/generate/route.ts']);
  const aiRouteText = aiRoutePath ? readText(aiRoutePath) : '';

  if (!auth.google) {
    addFinding(findings, 'critical', 'Google login is missing or not provable from live code', 'The required Google social login path is not clearly implemented in the current source tree.', 'auth-coverage', [], 12);
  }
  if (!auth.emailLogin) {
    addFinding(findings, 'critical', 'Standard email login is missing or not provable', 'Launch readiness requires a working email/password or email-based login path, and the current code does not prove that flow exists.', 'auth-coverage', [], 12);
  }
  if (!auth.emailSignup) {
    addFinding(findings, 'critical', 'Standard signup is missing or not provable', 'The current source does not clearly provide a complete standard signup flow.', 'auth-coverage', [], 12);
  }
  if (auth.appleRequired && !auth.apple) {
    addFinding(findings, 'critical', 'Apple login is missing for an iOS-targeted app', 'The app targets Apple distribution but a Sign in with Apple path is not clearly implemented.', 'apple-auth', [], 12);
  }
  if (auth.apple && auth.appleRequired && !auth.nativeApple) {
    addFinding(findings, 'high', 'Apple login appears present but not natively validated', 'The code references Apple auth, but native Sign in with Apple or ID-token verification is not clearly proven in the implementation.', 'apple-auth', findMatches(files, /provider:\s*['"]apple['"]|signInWithApple/i, 3), 7);
  }

  if (app.platform === 'web') {
    if (!storeConfig.hasProxy) {
      addFinding(findings, 'high', 'Request proxy/session refresh file is missing', 'Next.js request proxy handling is not present, which weakens session refresh and central request enforcement.', 'web-session-gate', [], 7);
    }
    if (!storeConfig.hasAuthCallback) {
      addFinding(findings, 'high', 'OAuth callback route is missing', 'Social auth flows need a callback/code-exchange route to complete reliably in production.', 'auth-coverage', [], 7);
    }
    if (!storeConfig.legalPages.privacy || !storeConfig.legalPages.terms) {
      addFinding(findings, 'high', 'Legal surface is incomplete', 'Privacy and Terms pages are expected for launch readiness and are not both clearly implemented.', 'legal-surface', [], 8);
    }
    if (!storeConfig.hasMigrations) {
      addFinding(findings, 'high', 'Supabase migrations are missing', 'Database schema and launch verification are incomplete without checked-in migrations.', 'schema-and-rls', [], 8);
    }
    if (aiRoutePath && !/getUser\(\)|auth\.getUser\(\)/.test(aiRouteText)) {
      addFinding(findings, 'critical', 'AI generation endpoint lacks caller authentication', 'The live AI streaming route accepts requests without a proven authenticated user check, which is a direct launch blocker for credit protection and abuse prevention.', 'ai-endpoint-hardening', [{ file: normalize(aiRoutePath), line: 1, text: 'POST handler lacks a proven auth guard before OpenAI usage.' }], 15);
    }
    if (aiRoutePath && !/aiRateLimit|checkRateLimit|getRateLimitHeaders/.test(aiRouteText)) {
      addFinding(findings, 'high', 'AI generation endpoint lacks explicit rate limiting', 'The live AI streaming route does not show route-local throttling, which is risky for a paid model endpoint.', 'ai-endpoint-hardening', [{ file: normalize(aiRoutePath), line: 1, text: 'POST handler streams OpenAI output without visible AI throttle.' }], 7);
    }
    if (portalTokenMatches.length > 0) {
      addFinding(findings, 'critical', 'Portal-token RLS looks overly permissive', 'The schema appears to allow invoice reads whenever a portal token exists instead of matching a supplied token, which is a serious data-exposure risk.', 'schema-and-rls', portalTokenMatches, 15);
    }
    if (!packageSignals.scripts.build) {
      addFinding(findings, 'high', 'Production build script is missing', 'A launch-ready web app should expose a reproducible build command.', 'runtime-verification', [], 8);
    }
  } else {
    if (!packageSignals.expoVersion || !String(packageSignals.expoVersion).includes('55')) {
      addFinding(findings, 'high', 'Expo SDK 55 is not clearly in use', 'The package manifest does not clearly show Expo SDK 55, which is a required target in this audit.', 'expo-55-upgrade', [], 8);
    }
    if (!storeConfig.hasAppJson) {
      addFinding(findings, 'critical', 'app.json is missing', 'Store submission and environment-level Expo verification depend on app.json or an equivalent config file.', 'store-readiness', [], 15);
    }
    if (!storeConfig.hasEas) {
      addFinding(findings, 'high', 'EAS build config is missing', 'App Store and Play Store readiness is incomplete without a checked-in EAS profile set.', 'store-readiness', [], 8);
    }
    if (!storeConfig.hasIosBundleId || !storeConfig.hasAndroidPackage) {
      addFinding(findings, 'high', 'Store identifiers are incomplete', 'The Expo config does not clearly define both iOS bundle identifier and Android package name.', 'store-readiness', [], 8);
    }
    if (!storeConfig.hasMigrations) {
      addFinding(findings, 'high', 'Supabase migrations are missing', 'The mobile app lacks checked-in schema migrations, which blocks backend readiness verification.', 'schema-and-rls', [], 8);
    }
    if (!packageSignals.hasNotificationsPkg) {
      addFinding(findings, 'medium', 'Notifications package is missing', 'Notification support is common in the mobile docs and competitive set, but the dependency is not present.', 'mobile-notifications', [], 4);
    }
  }

  if (missingDocRoutes.length > 0) {
    addFinding(findings, missingDocRoutes.length > 4 ? 'high' : 'medium', 'Documented screens are not fully matched in live routes', `The docs describe ${docRoutes.length} route(s), but ${missingDocRoutes.length} route(s) were not mapped to a live page or screen implementation.`, 'doc-to-code-gap', missingDocRoutes.slice(0, 5).map((route) => ({ file: 'documentation', line: 0, text: route })), missingDocRoutes.length > 4 ? 8 : 4);
  }
  if (mockMatches.length > 0) {
    addFinding(findings, 'high', 'Mock or placeholder data is still present in production code paths', 'The fresh source scan still contains mock-data patterns, which means at least part of the product behavior is not fully backed by real data.', 'replace-mock-data', mockMatches, 8);
  }
  if (setTimeoutMatches.length > 0) {
    addFinding(findings, 'medium', 'Timeout-based stubs are present', 'The app still contains timeout-driven placeholders that often indicate simulated completion instead of real integration.', 'replace-stubs', setTimeoutMatches, 4);
  }
  if (selectStarMatches.length >= 5) {
    addFinding(findings, 'medium', 'Broad select(*) queries remain in the data layer', 'Several data reads still use wildcard selection, which weakens payload discipline and makes least-privilege review harder.', 'query-hardening', selectStarMatches.slice(0, 5), 4);
  }
  if (todoMatches.length > 0) {
    addFinding(findings, 'medium', 'Open TODO/FIXME markers remain in the shipped code', 'There are still explicit unfinished-code markers in the repository, which should be resolved or converted to tracked issues before launch.', 'cleanup-and-hardening', todoMatches, 4);
  }
  if (!packageSignals.scripts.test) {
    addFinding(findings, 'medium', 'Automated test entrypoint is missing', 'The package manifest does not expose a test command, which weakens reproducible verification.', 'test-coverage', [], 4);
  }
  if (!runtime.build || runtime.build.status !== 'passed') {
    addFinding(findings, runtime.build?.status === 'failed' ? 'high' : 'medium', runtime.build?.status === 'failed' ? 'Build verification failed' : 'Build verification is still missing', runtime.build?.status === 'failed' ? `The recorded runtime build check failed: ${runtime.build.details ?? 'see runtime results'}` : 'The current audit does not yet have a passing build artifact recorded for this app, so launch readiness cannot be claimed.', 'runtime-verification', [], runtime.build?.status === 'failed' ? 8 : 4);
  }
  if (!runtime.test || runtime.test.status !== 'passed') {
    addFinding(findings, runtime.test?.status === 'failed' ? 'high' : 'medium', runtime.test?.status === 'failed' ? 'Automated tests/checks failed' : 'Automated tests/checks are still missing', runtime.test?.status === 'failed' ? `The recorded runtime test or typecheck failed: ${runtime.test.details ?? 'see runtime results'}` : 'This app does not yet have a recorded passing automated verification step in this audit run.', 'test-coverage', [], runtime.test?.status === 'failed' ? 8 : 4);
  }
  if (prior.portfolioMarkedReady && findings.length > 0) {
    addFinding(findings, 'medium', 'Fresh audit contradicts the earlier portfolio readiness report', 'The March 2026 portfolio report marked this app as launch-ready, but the live-code re-audit still found unresolved gaps.', 'audit-reconciliation', [], 2);
  }

  return findings;
}

function scoreFromFindings(findings) {
  const deduction = findings.reduce((sum, finding) => sum + (finding.deduction ?? 0), 0);
  return Math.max(0, 100 - deduction);
}

function toStatus(score, findings) {
  const hasCriticalOrHigh = findings.some((finding) => finding.severity === 'critical' || finding.severity === 'high');
  if (score === 100 && !hasCriticalOrHigh) return 'OK - Launch Ready';
  return 'Needs Work';
}

function severityCounts(findings) {
  return {
    critical: findings.filter((finding) => finding.severity === 'critical').length,
    high: findings.filter((finding) => finding.severity === 'high').length,
    medium: findings.filter((finding) => finding.severity === 'medium').length,
    low: findings.filter((finding) => finding.severity === 'low').length,
  };
}

function buildTaskTemplates(app) {
  return {
    'auth-coverage': {
      name: `Close authentication coverage gaps for ${app.title}`,
      description: 'Complete and verify Google login, standard login, standard signup, and any missing OAuth callbacks or backend session wiring.',
      research: 'Research using the internet before implementing. Review current authentication UX and security patterns from leading apps in the category, plus current Apple and Google platform expectations.',
      frontend: 'Implement or finish login, signup, OAuth entry points, loading/error states, and post-auth redirects across all documented screens.',
      backend: 'Wire provider callbacks, session exchange, validation, account linking, and row-level access rules end to end.',
      animation: 'Polish auth feedback states, success transitions, and error handling to reduce drop-off.',
      painPoints: 'Users abandon auth when forms are unclear, redirects fail, or social login is inconsistent across platforms.',
      deliverables: 'Working auth flows, connected backend session handling, QA checklist, and regression coverage.',
      impact: 'Improves first-run conversion, lowers abandonment, and removes a core launch blocker.',
    },
    'apple-auth': {
      name: `Harden Sign in with Apple readiness for ${app.title}`,
      description: 'Ensure Apple login is present, policy-compliant, and backed by secure token validation for iOS distribution.',
      research: 'Research using the internet before implementing. Review current Apple review guidance and leading iOS apps that pair Google and Apple sign-in cleanly.',
      frontend: 'Expose clear Apple entry points in login/signup, with consistent loading and error states.',
      backend: 'Validate Apple identity tokens, connect users to backend auth sessions, and verify callback/deep-link behavior.',
      animation: 'Keep login transitions minimal and trustworthy; avoid distracting motion in secure identity flows.',
      painPoints: 'Users lose trust quickly when Apple login behaves differently from other providers.',
      deliverables: 'Native Apple auth flow, backend verification, and iOS-ready QA evidence.',
      impact: 'Reduces App Store review risk and improves conversion for privacy-conscious users.',
    },
    'ai-endpoint-hardening': {
      name: `Secure AI endpoints for ${app.title}`,
      description: 'Add missing authentication, rate limiting, abuse controls, and failure handling around AI-powered routes.',
      research: 'Research using the internet before implementing. Review current AI product safeguards, cost-control patterns, and UX expectations for streaming assistants.',
      frontend: 'Show auth-required, quota, retry, and degraded-service states in AI surfaces.',
      backend: 'Add authenticated callers, throttling, logging, and validation before any model invocation.',
      animation: 'Use lightweight progress and retry feedback without hiding failure states.',
      painPoints: 'Unprotected AI endpoints create cost risk and inconsistent user trust.',
      deliverables: 'Protected AI routes, rate-limit telemetry, and verified client feedback states.',
      impact: 'Protects margin, reduces abuse, and stabilizes a visible product differentiator.',
    },
    'schema-and-rls': {
      name: `Complete schema and access-control verification for ${app.title}`,
      description: 'Close migration, RLS, or backend data-access gaps and ensure code and schema align.',
      research: 'Research using the internet before implementing. Review current Supabase and production database hardening patterns for apps with similar data sensitivity.',
      frontend: 'Reflect permission-denied, empty, and sync states cleanly where backend rules affect the UI.',
      backend: 'Add or repair migrations, validation, indexes, and RLS policies; remove overly permissive access patterns.',
      animation: 'Keep protected-state messaging calm and informative instead of abrupt.',
      painPoints: 'Data leaks, schema drift, and confusing access errors are severe launch blockers.',
      deliverables: 'Verified migrations, tightened policies, and updated data contracts.',
      impact: 'Improves security posture, operational confidence, and auditability.',
    },
    'doc-to-code-gap': {
      name: `Close documented screen and feature gaps for ${app.title}`,
      description: 'Implement or reconcile routes and flows that are described in product docs but not proven in the live code.',
      research: 'Research using the internet before implementing. Benchmark best-in-class navigation, onboarding, dashboard, and edge-state patterns for this product category.',
      frontend: 'Build the missing screens, empty/loading/error states, and navigation hooks described in the spec.',
      backend: 'Add any missing data, APIs, or actions required to make those screens real and connected.',
      animation: 'Apply purposeful page transitions, skeletons, and completion feedback that fit the product tone.',
      painPoints: 'Users feel misled when advertised or expected flows are absent at launch.',
      deliverables: 'Doc-matched routes, working feature paths, and acceptance coverage.',
      impact: 'Closes expectation gaps and raises completion toward a true launch-ready surface.',
    },
    'replace-mock-data': {
      name: `Replace mock data with production data wiring in ${app.title}`,
      description: 'Remove mock or placeholder datasets from active flows and connect them to live backend state.',
      research: 'Research using the internet before implementing. Review how leading products preserve perceived speed while replacing placeholders with trustworthy live data.',
      frontend: 'Swap mock collections for real fetch/store state with resilient loading and empty states.',
      backend: 'Provide live queries, writes, validation, and test data seeding where needed.',
      animation: 'Use skeletons and optimistic feedback rather than fake completed states.',
      painPoints: 'Mock data destroys trust the moment a user notices it.',
      deliverables: 'Real data integrations, migration-safe seed strategy, and QA proof.',
      impact: 'Improves credibility, retention, and supportability.',
    },
    'replace-stubs': {
      name: `Remove stubbed behaviors from ${app.title}`,
      description: 'Replace timeout-driven or simulated behaviors with real integrations and state transitions.',
      research: 'Research using the internet before implementing. Review current UX expectations for purchase, upload, sync, and action-confirmation flows in comparable apps.',
      frontend: 'Swap simulated completion logic for true async state handling and recovery UX.',
      backend: 'Connect the real service integrations or API calls that the stub currently imitates.',
      animation: 'Preserve smooth progress feedback while accurately reflecting real operation state.',
      painPoints: 'Stubbed flows mislead users and hide integration risk until launch.',
      deliverables: 'Real end-to-end behavior and clearly bounded failure states.',
      impact: 'Reduces false confidence and eliminates last-mile launch surprises.',
    },
    'query-hardening': {
      name: `Harden broad data queries in ${app.title}`,
      description: 'Replace wildcard reads with explicit selects and tighten payload shape and permissions.',
      research: 'Research using the internet before implementing. Review current data minimization and performance practices for Supabase-backed apps.',
      frontend: 'Adjust consumers to accept explicit typed payloads and clear fallback states.',
      backend: 'Scope queries, reduce overfetching, and align returned fields with UI needs.',
      animation: 'Keep list loading and refresh transitions responsive after payload tightening.',
      painPoints: 'Overfetching slows mobile and web surfaces and makes security review harder.',
      deliverables: 'Explicit field queries, stable types, and verified behavior parity.',
      impact: 'Improves performance, privacy posture, and maintenance safety.',
    },
    'cleanup-and-hardening': {
      name: `Resolve open implementation markers in ${app.title}`,
      description: 'Convert TODO/FIXME code markers into completed work or intentionally deferred tracked items.',
      research: 'Research using the internet before implementing. Review launch-readiness checklists and best practices for converting temporary scaffolding into production-safe behavior.',
      frontend: 'Remove unfinished UI branches and clarify any intentionally deferred surfaces.',
      backend: 'Finish or isolate incomplete logic, logging, and validation paths.',
      animation: 'Ensure no unfinished state transitions remain visible to users.',
      painPoints: 'Open implementation markers often map directly to real defects at launch.',
      deliverables: 'Clean code paths, resolved notes, and release-safe backlog decisions.',
      impact: 'Reduces regressions and improves confidence in the shipped surface.',
    },
    'test-coverage': {
      name: `Increase automated verification for ${app.title}`,
      description: 'Add or repair build, test, typecheck, and smoke-test coverage for critical paths.',
      research: 'Research using the internet before implementing. Study current testing mixes used by strong web and mobile teams in this product category.',
      frontend: 'Add component and end-to-end checks around auth, onboarding, core workflow, and edge states.',
      backend: 'Add integration and validation tests for actions, APIs, and permission boundaries.',
      animation: 'Include visual or interaction checks where motion affects usability or trust.',
      painPoints: 'Unverified launches create hidden breakage across auth, billing, and onboarding.',
      deliverables: 'Reliable build/test commands, coverage around critical flows, and CI-ready scripts.',
      impact: 'Raises release confidence and shortens future audit cycles.',
    },
    'runtime-verification': {
      name: `Complete runtime launch verification for ${app.title}`,
      description: 'Run and stabilize production-style build, smoke, and runtime validation for the documented critical paths.',
      research: 'Research using the internet before implementing. Review current build and deployment expectations for the framework and store/deployment target.',
      frontend: 'Fix runtime regressions, broken routes, and environment-gated UI failures.',
      backend: 'Resolve env, callback, API, and integration issues blocking true end-to-end verification.',
      animation: 'Verify loading, error, and retry flows under realistic runtime conditions.',
      painPoints: 'A codebase can look complete while failing at build or first-run runtime.',
      deliverables: 'Passing build evidence, smoke-test notes, and updated readiness status.',
      impact: 'Turns static readiness into deployable confidence.',
    },
    'store-readiness': {
      name: `Finish store submission readiness for ${app.title}`,
      description: 'Complete Expo/App Store/Play Store config, identifiers, assets, and build profiles.',
      research: 'Research using the internet before implementing. Review the current App Store and Google Play submission requirements, metadata expectations, and Expo build guidance.',
      frontend: 'Ensure icons, splash assets, permission copy, and submission-facing metadata are production quality.',
      backend: 'Confirm deep links, auth redirect URIs, and notification tokens match store config.',
      animation: 'Verify cold-start, splash, and onboarding motion feels polished on device.',
      painPoints: 'Incomplete app identifiers and build profiles block launch even when features exist.',
      deliverables: 'Complete Expo config, EAS profiles, identifiers, and submission checklist.',
      impact: 'Removes the final operational blockers to store release.',
    },
    'mobile-notifications': {
      name: `Strengthen mobile notification readiness for ${app.title}`,
      description: 'Add or complete push/local notification capability where the product and competitive set depend on timely follow-up.',
      research: 'Research using the internet before implementing. Review notification best practices, permission timing, and retention-friendly notification design in comparable apps.',
      frontend: 'Add permission prompts, settings, and notification-driven entry states.',
      backend: 'Store tokens, send relevant events, and validate delivery or retry flows.',
      animation: 'Keep notification-to-screen transitions clear and lightweight.',
      painPoints: 'Users miss important reminders and progress prompts when notification support is weak.',
      deliverables: 'Notification capability, settings coverage, and device-level validation.',
      impact: 'Improves retention, completion, and operational responsiveness.',
    },
    'legal-surface': {
      name: `Complete legal and policy surfaces for ${app.title}`,
      description: 'Add or finish privacy, terms, and related user-facing legal entry points required for launch.',
      research: 'Research using the internet before implementing. Review current launch expectations for privacy, terms, and account-management disclosures in similar products.',
      frontend: 'Expose clearly linked legal pages from auth, settings, and footer/navigation surfaces.',
      backend: 'Ensure policy links and account actions align with actual retention, export, and deletion behavior.',
      animation: 'Keep legal surfaces simple and readable without distracting motion.',
      painPoints: 'Users and store reviewers expect obvious access to privacy and terms before trust-sensitive actions.',
      deliverables: 'Complete legal pages and connected account-management references.',
      impact: 'Reduces review risk and improves user trust.',
    },
    'web-session-gate': {
      name: `Harden session and request gating for ${app.title}`,
      description: 'Ensure centralized session refresh, request classification, and protection for auth-sensitive routes.',
      research: 'Research using the internet before implementing. Review current framework guidance for centralized auth/session request handling.',
      frontend: 'Validate redirects and session-dependent UI surfaces after gating changes.',
      backend: 'Connect proxy/session refresh, protected routes, and rate limiting consistently.',
      animation: 'Preserve smooth protected-route transitions and error fallbacks.',
      painPoints: 'Session drift creates broken dashboards, auth loops, and confusing public/private boundaries.',
      deliverables: 'Reliable route protection and session continuity under real navigation.',
      impact: 'Improves security and reduces broken authenticated journeys.',
    },
    'audit-reconciliation': {
      name: `Reconcile stale readiness reporting for ${app.title}`,
      description: "Update the project's readiness narrative so stakeholders are not relying on outdated launch claims.",
      research: 'Research using the internet before implementing. Review current release-governance best practices for audit traceability and status communication.',
      frontend: 'No direct feature work unless the stale reporting masked a UI gap.',
      backend: 'No direct backend change unless the stale reporting masked a backend gap.',
      animation: 'Not applicable beyond keeping any status UI calm and clear.',
      painPoints: 'Teams lose time and trust when portfolio reports say an app is done but live evidence disagrees.',
      deliverables: 'Updated audit trail, corrected status reporting, and aligned acceptance criteria.',
      impact: 'Improves planning accuracy and reduces false launch confidence.',
    },
    'expo-55-upgrade': {
      name: `Upgrade ${app.title} to Expo SDK 55 readiness`,
      description: 'Bring the app onto Expo SDK 55 and verify any router, native module, and store-build implications.',
      research: 'Research using the internet before implementing. Review official Expo SDK 55 migration notes and known package compatibility changes.',
      frontend: 'Fix router, screen, and styling regressions introduced by the SDK shift.',
      backend: 'Verify auth callbacks, notifications, and native capability bindings still match backend expectations.',
      animation: 'Regression-test transitions and splash behavior after the upgrade.',
      painPoints: 'Stale Expo versions slow store readiness and create native build surprises.',
      deliverables: 'SDK 55-compatible app, verified build config, and migration notes.',
      impact: 'Keeps the app aligned with current tooling and submission expectations.',
    },
  };
}

function tasksFromFindings(app, findings) {
  const templates = buildTaskTemplates(app);
  const seen = new Set();
  const tasks = [];
  for (const finding of findings) {
    if (seen.has(finding.taskKey)) continue;
    seen.add(finding.taskKey);
    const template = templates[finding.taskKey];
    if (!template) continue;
    tasks.push(template);
  }
  return tasks;
}

function renderTaskMarkdown(task, index) {
  return [
    `### Task ${index}: ${task.name}`,
    '',
    'Research using the internet before implementing.',
    '',
    `- Task description: ${task.description}`,
    `- Mandatory internet research: ${task.research}`,
    `- Frontend implementation: ${task.frontend}`,
    `- Backend implementation: ${task.backend}`,
    `- Animations & usability improvements: ${task.animation}`,
    `- Market/User pain points: ${task.painPoints}`,
    `- Deliverables: ${task.deliverables}`,
    `- Market impact: ${task.impact}`,
    '',
  ].join('\n');
}

function formatEvidence(evidence) {
  if (!evidence || evidence.length === 0) return '- No direct line-level evidence captured for this issue.';
  return evidence
    .map((item) =>
      item.line > 0
        ? `- \`${item.file}:${item.line}\` - ${item.text}`
        : `- \`${item.file}\` - ${item.text}`
    )
    .join('\n');
}

function renderAppReport(app, context) {
  const { files, docs, routes, auth, storeConfig, packageSignals, findings, score, status, prior, runtime, tasks } = context;

  const severity = severityCounts(findings);
  const routeRows = context.docRoutes.slice(0, 18).map((docRoute) => {
    const live = routes.pageRoutes.has(docRoute) || routes.screenRoutes.has(docRoute);
    return `| \`${docRoute}\` | ${live ? 'yes' : 'no'} | ${live ? 'Mapped to live route tree' : 'Not found in live route scan'} |`;
  });
  const linesOfCode = files.reduce((sum, file) => sum + countLines(readText(file)), 0);
  const featureHeadings = parseFeatureHeadings(docs['features.md']).slice(0, 10);

  return [
    `# ${app.title} - Fresh Launch Readiness Audit`,
    '',
    '- Audit date: 2026-03-12',
    `- Platform: ${app.platform}`,
    `- Canonical path: \`${app.canonicalPath}\``,
    `- Product category: ${app.category}`,
    `- Status: ${status === 'OK - Launch Ready' ? 'STATUS: OK - Launch Ready' : `Completion Score: ${score} / 100`}`,
    '',
    '## App Inventory',
    '',
    `- Source files scanned: ${files.length}`,
    `- Approximate source lines scanned: ${linesOfCode}`,
    `- Document set loaded: ${Object.keys(docs).length} files from \`${app.docPath}\``,
    `- Live page/screen routes found: ${app.platform === 'web' ? routes.pageList.length : routes.screenList.length}`,
    `- Live API routes found: ${app.platform === 'web' ? routes.apiList.length : 0}`,
    `- Build result: ${runtime.build?.status ?? 'not_run'}${runtime.build?.details ? ` - ${runtime.build.details}` : ''}`,
    `- Test result: ${runtime.test?.status ?? 'not_run'}${runtime.test?.details ? ` - ${runtime.test.details}` : ''}`,
    '',
    '## Doc-to-Code Page And Feature Map',
    '',
    `- Documented routes discovered from \`screens.md\`: ${context.docRoutes.length}`,
    `- Missing documented routes in live code: ${context.missingDocRoutes.length}`,
    '',
    '| Documented route | Live route found | Notes |',
    '| --- | --- | --- |',
    ...(routeRows.length > 0 ? routeRows : ['| n/a | n/a | No document routes parsed |']),
    '',
    ...(featureHeadings.length > 0
      ? ['### Feature headings observed in docs', '', ...featureHeadings.map((feature) => `- ${feature}`), '']
      : []),
    '## Module Intent Summary',
    '',
    `The codebase for ${app.title} is organized around a ${app.platform === 'web' ? 'route-driven web application' : 'screen-driven Expo application'} with the following dominant module buckets:`,
    '',
    summarizeModules(app.canonicalPath, files),
    '',
    `Auth intent from live code: Google=${auth.google ? 'present' : 'missing/unproven'}, Email login=${auth.emailLogin ? 'present' : 'missing/unproven'}, Email signup=${auth.emailSignup ? 'present' : 'missing/unproven'}, Apple=${auth.apple ? 'present' : 'missing/unproven'}.`,
    '',
    `Store/runtime intent: ${app.platform === 'web'
      ? `proxy=${storeConfig.hasProxy ? 'present' : 'missing'}, OAuth callback=${storeConfig.hasAuthCallback ? 'present' : 'missing'}, privacy=${storeConfig.legalPages.privacy ? 'present' : 'missing'}, terms=${storeConfig.legalPages.terms ? 'present' : 'missing'}`
      : `app.json=${storeConfig.hasAppJson ? 'present' : 'missing'}, eas.json=${storeConfig.hasEas ? 'present' : 'missing'}, iOS bundle id=${storeConfig.hasIosBundleId ? 'present' : 'missing'}, Android package=${storeConfig.hasAndroidPackage ? 'present' : 'missing'}, Expo=${packageSignals.expoVersion ?? 'unknown'}`
    }.`,
    '',
    '## Critical Line-Level Appendix',
    '',
    ...(findings.length > 0
      ? findings.map((finding) => [
          `### ${finding.severity.toUpperCase()}: ${finding.title}`,
          '',
          `${finding.detail}`,
          '',
          formatEvidence(finding.evidence),
          '',
        ].join('\n'))
      : ['- No critical or high-signal findings were produced by the live-code scan.']),
    '',
    '## Frontend Audit',
    '',
    `- Route/screen surface appears ${context.missingDocRoutes.length === 0 ? 'aligned' : 'partially aligned'} with the documentation.`,
    `- UX state coverage is ${findings.some((finding) => finding.taskKey === 'doc-to-code-gap') ? 'not yet complete' : 'reasonably complete based on route evidence'}, but runtime proof is still ${runtime.build?.status === 'passed' ? 'partially available' : 'missing'}.`,
    '- Design-system and interaction quality require follow-up wherever the findings list flags mock data, missing screens, or stubbed flows.',
    '',
    '## Backend Audit',
    '',
    `- Backend readiness is ${storeConfig.hasMigrations || app.platform === 'web' ? 'partially provable' : 'not fully provable'} from the checked-in schema/config state.`,
    '- Data validation and access control require follow-up wherever auth coverage, AI endpoint hardening, or RLS findings remain open.',
    `- Supabase integration is ${packageSignals.hasSupabase ? 'present in package metadata' : 'not clearly present'} in the live project.`,
    '',
    '## Integration Audit',
    '',
    `- Frontend/backend integration cannot be considered launch-ready while build status is \`${runtime.build?.status ?? 'not_run'}\` and test status is \`${runtime.test?.status ?? 'not_run'}\`.`,
    `- The audit found ${severity.critical} critical and ${severity.high} high issue(s) that still interrupt full end-to-end confidence.`,
    '',
    '## Research And Benchmarking',
    '',
    `Benchmark set for ${app.title}:`,
    ...app.benchmark.competitors.map((competitor) => `- [${competitor.name}](${competitor.url})`),
    '',
    'Observed market pain points:',
    ...app.benchmark.painPoints.map((painPoint) => `- ${painPoint}`),
    '',
    'Applied lessons for this audit:',
    ...app.benchmark.lessons.map((lesson) => `- ${lesson}`),
    '',
    `Current official launch-policy references used during this audit: ${[...POLICY_LINKS.expo, ...POLICY_LINKS.apple, ...POLICY_LINKS.googlePlay].join(', ')}.`,
    '',
    '## Launch-Readiness Verdict',
    '',
    `- Fresh score: ${score} / 100`,
    `- Current status: ${status}`,
    `- Critical findings: ${severity.critical}`,
    `- High findings: ${severity.high}`,
    `- Medium findings: ${severity.medium}`,
    `- Low findings: ${severity.low}`,
    `- Earlier portfolio report marked app ready: ${prior.portfolioMarkedReady ? 'yes' : 'no'}`,
    prior.hasPriorAudit ? `- Prior app-level audit score/status: ${prior.priorScore ?? 'n/a'} / 100, ${prior.priorStatus ?? 'n/a'}` : '- Prior app-level audit score/status: none found',
    '',
    status === 'OK - Launch Ready' ? 'STATUS: OK - Launch Ready' : `Completion Score: ${score} / 100`,
    '',
    '## Task List',
    '',
    ...(tasks.length > 0 ? tasks.map((task, index) => renderTaskMarkdown(task, index + 1)) : ['No additional tasks were generated because the live audit found no unresolved gaps.']),
    '',
  ].join('\n');
}

function buildMatrixRow(app, context) {
  const severity = severityCounts(context.findings);
  return {
    app: app.name,
    platform: app.platform,
    canonical_path: app.canonicalPath,
    status: context.status,
    completion_score: context.score,
    google_login: context.auth.google ? 'yes' : 'no',
    email_login: context.auth.emailLogin ? 'yes' : 'no',
    email_signup: context.auth.emailSignup ? 'yes' : 'no',
    apple_login_required: context.auth.appleRequired ? 'yes' : 'no',
    apple_login_present: context.auth.apple ? 'yes' : 'no',
    expo_sdk: context.packageSignals.expoVersion ?? 'n/a',
    store_config:
      app.platform === 'web'
        ? `proxy=${context.storeConfig.hasProxy ? 'yes' : 'no'}, callback=${context.storeConfig.hasAuthCallback ? 'yes' : 'no'}`
        : `app.json=${context.storeConfig.hasAppJson ? 'yes' : 'no'}, eas=${context.storeConfig.hasEas ? 'yes' : 'no'}, iosId=${context.storeConfig.hasIosBundleId ? 'yes' : 'no'}, androidPkg=${context.storeConfig.hasAndroidPackage ? 'yes' : 'no'}`,
    legal_pages:
      app.platform === 'web'
        ? `privacy=${context.storeConfig.legalPages.privacy ? 'yes' : 'no'}, terms=${context.storeConfig.legalPages.terms ? 'yes' : 'no'}`
        : 'n/a',
    build_result: context.runtime.build?.status ?? 'not_run',
    test_result: context.runtime.test?.status ?? 'not_run',
    doc_match: `${Math.max(0, context.docRoutes.length - context.missingDocRoutes.length)}/${context.docRoutes.length || 0}`,
    critical_findings: severity.critical,
    high_findings: severity.high,
    launch_blockers: severity.critical + severity.high,
    task_count: context.tasks.length,
  };
}

function renderMatrix(rows) {
  const header = [
    '| app | platform | canonical_path | status | completion_score | google_login | email_login | email_signup | apple_login_required | apple_login_present | expo_sdk | store_config | legal_pages | build_result | test_result | doc_match | critical_findings | high_findings | launch_blockers | task_count |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ];
  const body = rows.map((row) => `| ${row.app} | ${row.platform} | \`${row.canonical_path}\` | ${row.status} | ${row.completion_score} | ${row.google_login} | ${row.email_login} | ${row.email_signup} | ${row.apple_login_required} | ${row.apple_login_present} | ${row.expo_sdk} | ${row.store_config} | ${row.legal_pages} | ${row.build_result} | ${row.test_result} | ${row.doc_match} | ${row.critical_findings} | ${row.high_findings} | ${row.launch_blockers} | ${row.task_count} |`);
  return [
    '# Master Status Matrix',
    '',
    '- Fresh audit workspace: `E:/Yc_ai/audit-2026-03-12`',
    '- Canonical scope: 10 web apps and 10 mobile apps',
    '- Excluded duplicates/noise: `compliancesnap`, `fieldlens__`, hidden worktrees, build outputs, `node_modules`',
    '- Earlier March 2026 portfolio readiness claims were treated as prior evidence only and re-verified against live code.',
    '',
    ...header,
    ...body,
    '',
  ].join('\n');
}

function renderMasterTaskList(appContexts) {
  const sections = [
    '# Master Task List',
    '',
    'This master list only includes apps that are not currently `OK - Launch Ready` in the fresh audit run.',
    '',
  ];
  for (const { app, context } of appContexts) {
    if (context.status === 'OK - Launch Ready') continue;
    sections.push(`## ${app.title}`);
    sections.push('');
    if (context.tasks.length === 0) {
      sections.push('No tasks were generated.');
      sections.push('');
      continue;
    }
    context.tasks.forEach((task, index) => {
      sections.push(renderTaskMarkdown(task, index + 1));
    });
  }
  return sections.join('\n');
}

function main() {
  ensureDir(OUTPUT_DIR);
  ensureDir(APPS_DIR);

  const runtimeResults = loadRuntimeResults();
  const rows = [];
  const appContexts = [];

  for (const app of APPS) {
    const appRoot = app.canonicalPath;
    const files = walk(appRoot);
    const docs = collectDocFiles(app.docPath);
    const packageSignals = collectPackageSignals(appRoot);
    const routes =
      app.platform === 'web'
        ? (() => {
            const webRoutes = collectWebRoutes(appRoot, files);
            return {
              pageList: webRoutes.filter((route) => route.kind === 'page'),
              apiList: webRoutes.filter((route) => route.kind === 'api'),
              pageRoutes: new Set(webRoutes.filter((route) => route.kind === 'page').map((route) => route.route)),
              screenList: [],
              screenRoutes: new Set(),
            };
          })()
        : (() => {
            const mobileRoutes = collectMobileRoutes(appRoot, files);
            return {
              pageList: [],
              apiList: [],
              pageRoutes: new Set(),
              screenList: mobileRoutes,
              screenRoutes: new Set(mobileRoutes.map((route) => route.route)),
            };
          })();

    const docRoutes = parseDocRoutes(docs['screens.md']);
    const storeConfig = detectStoreConfig(appRoot, app.platform);
    const auth = collectAuthSignals(app, files);
    const prior = getPriorAuditSummary(app);
    const runtime = normalizeRuntimeEntry(runtimeResults[app.name] ?? {});
    const missingDocRoutes = docRoutes.filter((route) => !routes.pageRoutes.has(route) && !routes.screenRoutes.has(route));
    const baseContext = { appRoot, files, docs, routes, docRoutes, missingDocRoutes, auth, storeConfig, packageSignals, prior, runtime };
    const findings = collectFindings(app, baseContext);
    const score = scoreFromFindings(findings);
    const status = toStatus(score, findings);
    const tasks = tasksFromFindings(app, findings);
    const finalContext = { ...baseContext, findings, score, status, tasks, runtime };

    fs.writeFileSync(path.join(APPS_DIR, `${app.name}-audit.md`), renderAppReport(app, finalContext), 'utf8');
    rows.push(buildMatrixRow(app, finalContext));
    appContexts.push({ app, context: finalContext });
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'master-status-matrix.md'), renderMatrix(rows), 'utf8');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'master-task-list.md'), renderMasterTaskList(appContexts), 'utf8');
}

main();


