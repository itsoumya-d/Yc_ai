import Link from 'next/link';

const frameworkData: Record<string, {
  name: string; description: string; controls: number; passing: number; failing: number; partial: number; na: number;
  score: number; color: string; categories: { name: string; controls: { id: string; title: string; status: 'pass' | 'fail' | 'partial' | 'na'; description: string; evidence_count: number }[] }[];
}> = {
  soc2: {
    name: 'SOC 2 Type II',
    description: 'Service Organization Control 2 — security, availability, processing integrity, confidentiality, and privacy.',
    controls: 116, passing: 95, failing: 8, partial: 10, na: 3, score: 82, color: '#7C3AED',
    categories: [
      {
        name: 'CC1 — Control Environment',
        controls: [
          { id: 'cc1.1', title: 'COSO Principles', status: 'pass', description: 'Entity demonstrates a commitment to integrity and ethical values', evidence_count: 4 },
          { id: 'cc1.2', title: 'Board Independence', status: 'pass', description: 'Board of directors demonstrates independence from management', evidence_count: 3 },
          { id: 'cc1.3', title: 'Management Structure', status: 'partial', description: 'Structures, reporting lines, and authorities established', evidence_count: 2 },
        ],
      },
      {
        name: 'CC6 — Logical and Physical Access',
        controls: [
          { id: 'cc6.1', title: 'Logical Access Controls', status: 'fail', description: 'Logical access security software, infrastructure, and architectures', evidence_count: 1 },
          { id: 'cc6.2', title: 'User Authentication', status: 'pass', description: 'New internal and external users are registered and authorized', evidence_count: 5 },
          { id: 'cc6.3', title: 'Access Removal', status: 'pass', description: 'Internal and external users who no longer need access are removed', evidence_count: 3 },
          { id: 'cc6.6', title: 'External Threats', status: 'partial', description: 'Logical access security measures to protect against threats from outside system boundaries', evidence_count: 2 },
          { id: 'cc6.7', title: 'Data Transmission', status: 'pass', description: 'Transmission, movement, and removal of information are restricted', evidence_count: 4 },
        ],
      },
      {
        name: 'CC7 — System Operations',
        controls: [
          { id: 'cc7.1', title: 'Vulnerability Management', status: 'pass', description: 'Infrastructure vulnerability management process', evidence_count: 6 },
          { id: 'cc7.2', title: 'Malware Protection', status: 'pass', description: 'Detection and monitoring of malware threats', evidence_count: 3 },
          { id: 'cc7.3', title: 'Infrastructure Monitoring', status: 'fail', description: 'Infrastructure changes are identified and evaluated', evidence_count: 0 },
        ],
      },
    ],
  },
};

const fallback = frameworkData['soc2'];

const statusConfig = {
  pass: { label: 'Pass', class: 'control-pass', icon: '✓' },
  fail: { label: 'Fail', class: 'control-fail', icon: '✗' },
  partial: { label: 'Partial', class: 'control-partial', icon: '~' },
  na: { label: 'N/A', class: 'control-na', icon: '—' },
};

export default async function FrameworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fw = frameworkData[slug] ?? fallback;

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/frameworks" style={{ fontSize: 13, color: 'var(--color-trust-600)', textDecoration: 'none' }}>← Frameworks</Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 6 }}>{fw.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 540 }}>{fw.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/audit-room" style={{ padding: '10px 18px', borderRadius: 9, fontWeight: 600, fontSize: 14, border: '1.5px solid var(--border-default)', background: '#fff', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Audit Room
          </Link>
          <button style={{ padding: '10px 18px', borderRadius: 9, fontWeight: 600, fontSize: 14, background: 'var(--color-trust-600)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Export Report
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total', value: fw.controls, color: 'var(--color-trust-600)' },
          { label: 'Passing', value: fw.passing, color: 'var(--status-pass)' },
          { label: 'Failing', value: fw.failing, color: 'var(--status-fail)' },
          { label: 'Partial', value: fw.partial, color: 'var(--status-partial)' },
          { label: 'Score', value: `${fw.score}%`, color: fw.color },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 800, fontSize: 26, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--border-subtle)', marginBottom: 28 }}>
        <div style={{ display: 'flex', height: 16, borderRadius: 8, overflow: 'hidden', gap: 1 }}>
          <div style={{ width: `${(fw.passing / fw.controls) * 100}%`, background: 'var(--status-pass)', transition: 'width 600ms' }} />
          <div style={{ width: `${(fw.partial / fw.controls) * 100}%`, background: 'var(--status-partial)', transition: 'width 600ms' }} />
          <div style={{ width: `${(fw.failing / fw.controls) * 100}%`, background: 'var(--status-fail)', transition: 'width 600ms' }} />
          <div style={{ flex: 1, background: 'var(--border-subtle)' }} />
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 12 }}>
          <span style={{ color: 'var(--status-pass)' }}>✓ {fw.passing} passing</span>
          <span style={{ color: 'var(--status-partial)' }}>~ {fw.partial} partial</span>
          <span style={{ color: 'var(--status-fail)' }}>✗ {fw.failing} failing</span>
          <span style={{ color: 'var(--text-muted)' }}>— {fw.na} N/A</span>
        </div>
      </div>

      {/* Controls by category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {fw.categories.map(cat => (
          <div key={cat.name} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-page)' }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-mono)' }}>{cat.name}</h3>
            </div>
            <div>
              {cat.controls.map((ctrl, i) => {
                const cfg = statusConfig[ctrl.status];
                return (
                  <div key={ctrl.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: i < cat.controls.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', width: 60, flexShrink: 0 }}>{ctrl.id.toUpperCase()}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{ctrl.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{ctrl.description}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {ctrl.evidence_count} evidence
                    </div>
                    <span className={cfg.class} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, flexShrink: 0 }}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <Link href={`/controls/${ctrl.id}`} style={{ fontSize: 13, color: 'var(--color-trust-600)', textDecoration: 'none', fontWeight: 600, flexShrink: 0 }}>Edit →</Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
