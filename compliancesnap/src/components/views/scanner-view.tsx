import { cn, getSeverityColor, getSeverityLabel } from '@/lib/utils';
import type { SeverityLevel, Violation } from '@/types/database';
import { Camera, X, Zap, FlashlightOff, RotateCcw, Check, Plus, MapPin } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { generateId, saveViolation } from '@/lib/storage';

const HAZARD_POOLS: Array<{ title: string; severity: SeverityLevel; regulation: string; location: string }[]> = [
  [
    { title: 'Missing machine guard on lathe', severity: 'critical', regulation: '29 CFR 1910.212', location: 'Plant A — Machine Shop' },
    { title: 'Electrical panel access blocked', severity: 'major', regulation: '29 CFR 1910.303', location: 'Plant A — Electrical Room' },
    { title: 'No safety signage near chemicals', severity: 'minor', regulation: '29 CFR 1910.1200', location: 'Plant A — Storage' },
  ],
  [
    { title: 'Worker without hard hat in restricted zone', severity: 'major', regulation: '29 CFR 1926.100', location: 'Site B — Construction' },
    { title: 'Unguarded floor opening', severity: 'critical', regulation: '29 CFR 1910.23', location: 'Warehouse C — Level 2' },
    { title: 'Frayed extension cord in active use', severity: 'minor', regulation: '29 CFR 1910.305', location: 'Warehouse C — Bay 4' },
  ],
  [
    { title: 'Forklift operating with horn malfunction', severity: 'observation', regulation: '29 CFR 1910.178', location: 'Warehouse C — Loading Dock' },
    { title: 'Fire exit partially obstructed', severity: 'major', regulation: '29 CFR 1910.37', location: 'Plant A — South Wing' },
    { title: 'Eye wash station label missing', severity: 'observation', regulation: '29 CFR 1910.151', location: 'Plant B — Lab Area' },
  ],
];

function getRandomHazards() {
  const pool = HAZARD_POOLS[Math.floor(Math.random() * HAZARD_POOLS.length)];
  const count = Math.floor(Math.random() * 2) + 1;
  return pool.slice(0, count).map((h, i) => ({
    ...h,
    id: String(i + 1),
    confidence: Math.floor(Math.random() * 15) + 82,
  }));
}

type DetectedHazard = ReturnType<typeof getRandomHazards>[number];

export function ScannerView() {
  const { addViolation } = useAppStore();
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hazards, setHazards] = useState<DetectedHazard[]>([]);
  const [logged, setLogged] = useState<Set<string>>(new Set());

  const handleCapture = useCallback(() => {
    setIsScanning(true);
    setLogged(new Set());
    setTimeout(() => {
      setHazards(getRandomHazards());
      setIsScanning(false);
      setShowResults(true);
    }, 2200);
  }, []);

  const handleLogViolation = useCallback((h: DetectedHazard) => {
    const violation: Violation = {
      id: generateId(),
      title: h.title,
      severity: h.severity,
      regulation: h.regulation,
      location: h.location,
      status: 'pending',
      detected_at: new Date().toISOString(),
    };
    addViolation(violation);
    saveViolation(violation);
    setLogged((prev) => new Set([...prev, h.id]));
  }, [addViolation]);

  const handleScanAgain = useCallback(() => {
    setShowResults(false);
    setHazards([]);
    setLogged(new Set());
  }, []);

  return (
    <div className="flex h-full flex-col bg-black">
      {/* Camera Viewport */}
      <div className="relative flex-1">
        <div className="flex h-full items-center justify-center bg-charcoal/40">
          {!showResults && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="h-48 w-48 rounded-2xl border-2 border-dashed border-white/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-white/40" />
                </div>
                {/* Corner guides */}
                <div className="absolute -left-0.5 -top-0.5 h-6 w-6 rounded-tl-2xl border-l-2 border-t-2 border-safety-yellow" />
                <div className="absolute -right-0.5 -top-0.5 h-6 w-6 rounded-tr-2xl border-r-2 border-t-2 border-safety-yellow" />
                <div className="absolute -bottom-0.5 -left-0.5 h-6 w-6 rounded-bl-2xl border-b-2 border-l-2 border-safety-yellow" />
                <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-br-2xl border-b-2 border-r-2 border-safety-yellow" />
              </div>
              <span className="text-sm text-white/60">Point camera at workspace</span>
            </div>
          )}
        </div>

        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-safety-yellow/20 border-t-safety-yellow" />
                <Zap className="absolute inset-0 m-auto h-6 w-6 text-safety-yellow" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-safety-yellow">Analyzing workspace…</p>
                <p className="mt-1 text-xs text-white/60">AI Vision scanning for hazards</p>
              </div>
            </div>
          </div>
        )}

        {/* Top controls */}
        <div className="absolute left-4 right-4 top-12 flex items-center justify-between">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40">
            <X className="h-5 w-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40">
              <FlashlightOff className="h-5 w-5 text-white" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40">
              <RotateCcw className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* AI indicator */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5">
          <Zap className="h-4 w-4 text-safety-yellow" />
          <span className="text-xs font-medium text-white">AI Vision Active</span>
        </div>
      </div>

      {/* Results panel or capture button */}
      {showResults ? (
        <div className="max-h-[55%] overflow-auto bg-bg-surface px-4 pb-8 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="snap-heading text-base text-text-primary">
                {hazards.length} Hazard{hazards.length !== 1 ? 's' : ''} Detected
              </h2>
              <p className="text-xs text-text-secondary">{logged.size} of {hazards.length} logged</p>
            </div>
            <button onClick={handleScanAgain} className="rounded-lg bg-bg-card px-3 py-1.5 text-xs text-info">
              Scan Again
            </button>
          </div>

          {hazards.map((h) => (
            <div key={h.id} className="rounded-xl bg-bg-card overflow-hidden">
              <div className={cn('h-1', `bg-severity-${h.severity}`)} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary">{h.title}</div>
                    <div className="mt-1 snap-code text-xs text-info">{h.regulation}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
                      <MapPin className="h-3 w-3" />
                      {h.location}
                    </div>
                  </div>
                  <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase', getSeverityColor(h.severity))}>
                    {getSeverityLabel(h.severity)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border-default pt-3">
                  <span className="text-[10px] text-text-secondary">Confidence: {h.confidence}%</span>
                  {logged.has(h.id) ? (
                    <span className="flex items-center gap-1 rounded-md bg-compliant-bg px-2 py-1 text-[10px] font-medium text-compliant">
                      <Check className="h-3 w-3" /> Logged
                    </span>
                  ) : (
                    <button
                      onClick={() => handleLogViolation(h)}
                      className="flex items-center gap-1 rounded-md bg-severity-critical/20 px-2 py-1 text-[10px] font-medium text-severity-critical"
                    >
                      <Plus className="h-3 w-3" /> Log Violation
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {logged.size === hazards.length && hazards.length > 0 && (
            <div className="rounded-xl bg-compliant-bg p-4 text-center">
              <Check className="mx-auto mb-1 h-5 w-5 text-compliant" />
              <p className="text-xs font-medium text-compliant">All violations logged successfully</p>
              <p className="mt-0.5 text-[10px] text-text-secondary">View them in the Dashboard</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 bg-bg-surface py-6">
          <button
            onClick={handleCapture}
            disabled={isScanning}
            style={{ height: 72, width: 72 }}
            className={cn(
              'flex items-center justify-center rounded-full border-4 border-white/30 transition-opacity',
              isScanning ? 'opacity-50' : 'bg-safety-yellow',
            )}
          >
            <Camera className="h-8 w-8 text-text-inverse" />
          </button>
          <p className="text-xs text-text-secondary">Tap to scan for hazards</p>
        </div>
      )}
    </div>
  );
}
