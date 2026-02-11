import { cn, getSeverityColor, getSeverityLabel } from '@/lib/utils';
import type { SeverityLevel } from '@/types/database';
import { Camera, X, Zap, FlashlightOff, RotateCcw, Check } from 'lucide-react';
import { useState } from 'react';

const detectedHazards: { id: string; title: string; severity: SeverityLevel; regulation: string; confidence: number }[] = [
  { id: '1', title: 'Missing safety guard on press', severity: 'critical', regulation: '29 CFR 1910.212', confidence: 94 },
  { id: '2', title: 'Worker without safety glasses', severity: 'major', regulation: '29 CFR 1910.133', confidence: 87 },
];

export function ScannerView() {
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  function handleCapture() {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowResults(true);
    }, 2000);
  }

  return (
    <div className="flex h-full flex-col bg-black">
      {/* Camera Viewport */}
      <div className="relative flex-1">
        {/* Simulated camera view */}
        <div className="flex h-full items-center justify-center bg-charcoal/50">
          <div className="flex flex-col items-center gap-3 text-text-secondary">
            <Camera className="h-16 w-16" />
            <span className="text-sm">Point camera at workspace</span>
          </div>
        </div>

        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-safety-yellow/30 border-t-safety-yellow" />
              <span className="text-sm font-medium text-safety-yellow">Analyzing hazards...</span>
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
        <div className="bg-bg-surface px-4 pb-8 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="snap-heading text-base text-text-primary">{detectedHazards.length} Hazards Detected</h2>
            <button onClick={() => setShowResults(false)} className="text-xs text-info">Scan Again</button>
          </div>
          {detectedHazards.map((h) => (
            <div key={h.id} className="rounded-xl bg-bg-card overflow-hidden">
              <div className={cn('h-1', `bg-severity-${h.severity}`)} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-text-primary">{h.title}</div>
                    <div className="mt-1 snap-code text-xs text-info">{h.regulation}</div>
                  </div>
                  <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase', getSeverityColor(h.severity))}>
                    {getSeverityLabel(h.severity)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-text-secondary">Confidence: {h.confidence}%</span>
                  <button className="flex items-center gap-1 rounded-md bg-compliant-bg px-2 py-1 text-[10px] font-medium text-compliant">
                    <Check className="h-3 w-3" /> Log Violation
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center bg-bg-surface py-6">
          <button
            onClick={handleCapture}
            disabled={isScanning}
            className={cn(
              'flex h-18 w-18 items-center justify-center rounded-full border-4 border-white/30',
              isScanning ? 'bg-safety-yellow/50' : 'bg-safety-yellow',
            )}
          >
            <Camera className="h-8 w-8 text-text-inverse" />
          </button>
        </div>
      )}
    </div>
  );
}
