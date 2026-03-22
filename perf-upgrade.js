/**
 * Performance upgrade script: P5-01
 * Adds to all 10 web apps:
 *   - experimental.ppr: 'incremental'
 *   - reactCompiler: true
 *   - experimental.optimizePackageImports (lucide-react, framer-motion, recharts, @radix-ui/*)
 */
const fs = require('fs');

const webApps = [
  'skillbridge', 'storythread', 'neighbordao', 'invoiceai', 'petos',
  'proposalpilot', 'complibot', 'dealroom', 'boardbrief', 'claimforge',
];

webApps.forEach(app => {
  const path = `E:/Yc_ai/${app}/next.config.ts`;
  if (!fs.existsSync(path)) { console.log('SKIP:', app); return; }

  let c = fs.readFileSync(path, 'utf8');
  const hasCRLF = c.includes('\r\n');
  const NL = hasCRLF ? '\r\n' : '\n';

  let changed = false;

  // 1. Add reactCompiler: true if missing
  if (!c.includes('reactCompiler')) {
    c = c.replace(
      /const nextConfig: NextConfig = \{/,
      `const nextConfig: NextConfig = {${NL}  reactCompiler: true,`
    );
    changed = true;
  }

  // 2. Add experimental block with ppr + optimizePackageImports if missing
  if (!c.includes('experimental')) {
    // Insert before the images block
    c = c.replace(
      /  \/\/ Image optimization/,
      `  experimental: {${NL}    ppr: 'incremental',${NL}    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],${NL}  },${NL}${NL}  // Image optimization`
    );
    changed = true;
  } else if (c.includes('experimental') && !c.includes('ppr')) {
    // experimental block exists but no ppr — inject ppr + optimizePackageImports
    c = c.replace(
      /experimental:\s*\{/,
      `experimental: {${NL}    ppr: 'incremental',${NL}    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],`
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(path, c, 'utf8');
    console.log('Updated next.config.ts:', app);
  } else {
    console.log('No changes needed:', app);
  }
});

console.log('Done!');
