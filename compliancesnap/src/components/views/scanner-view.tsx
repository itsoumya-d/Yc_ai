import { cn, getSeverityColor, getSeverityLabel } from '@/lib/utils';
import { Camera, X, Zap, Upload, Check, ChevronDown, ChevronUp, AlertTriangle, ImageIcon, RotateCcw } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { analyzeWorkplaceImage, fileToBase64, getMockAnalysisResult, type ComplianceAnalysisResult } from '@/lib/actions/ai';
import { useAppStore } from '@/stores/app-store';
import { generateId, saveViolation, saveInspection } from '@/lib/storage';
import type { Violation, Inspection } from '@/types/database';

type ScanMode = 'idle' | 'analyzing' | 'results' | 'error';

const OPENAI_KEY = (import.meta as Record<string, unknown> & { env: Record<string, string> }).env?.VITE_OPENAI_API_KEY;

export function ScannerView() {
  const { addViolation, addInspection, organizationName, userName } = useAppStore();

  const [mode, setMode] = useState<ScanMode>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ComplianceAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedHazard, setExpandedHazard] = useState<string | null>(null);
  const [loggedIds, setLoggedIds] = useState<Set<string>>(new Set());
  const [facility, setFacility] = useState('');
  const [showFacilityInput, setShowFacilityInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (JPEG, PNG, WEBP).');
      setMode('error');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Image is too large (max 20MB). Please compress and try again.');
      setMode('error');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setMode('analyzing');
    setAnalysisResult(null);
    setLoggedIds(new Set());

    try {
      let result: ComplianceAnalysisResult;
      if (OPENAI_KEY) {
        const base64 = await fileToBase64(file);
        result = await analyzeWorkplaceImage(base64, OPENAI_KEY);
      } else {
        await new Promise((r) => setTimeout(r, 1800));
        result = getMockAnalysisResult();
      }
      setAnalysisResult(result);
      setMode('results');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setErrorMsg(message);
      setMode('error');
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleLogViolation = useCallback((hazardId: string) => {
    if (!analysisResult) return;
    const hazard = analysisResult.hazards.find((h) => h.id === hazardId);
    if (!hazard) return;

    const violation: Violation = {
      id: generateId(),
      title: hazard.title,
      severity: hazard.severity,
      regulation: hazard.regulation,
      location: facility || organizationName || 'Unknown location',
      status: 'pending',
      detected_at: new Date().toISOString(),
    };
    addViolation(violation);
    saveViolation(violation);
    setLoggedIds((prev) => new Set([...prev, hazardId]));
  }, [analysisResult, facility, organizationName, addViolation]);

  const handleLogAllViolations = useCallback(() => {
    if (!analysisResult) return;

    const inspection: Inspection = {
      id: generateId(),
      facility: facility || organizationName || 'New Facility',
      type: 'AI Photo Scan',
      status: 'completed',
      violations_found: analysisResult.hazards.length,
      score: analysisResult.compliance_score,
      date: new Date().toLocaleString(),
      inspector: userName || 'You',
    };
    addInspection(inspection);
    saveInspection(inspection);

    analysisResult.hazards.forEach((hazard) => {
      if (!loggedIds.has(hazard.id)) {
        const violation: Violation = {
          id: generateId(),
          title: hazard.title,
          severity: hazard.severity,
          regulation: hazard.regulation,
          location: facility || organizationName || 'Unknown location',
          status: 'pending',
          detected_at: new Date().toISOString(),
        };
        addViolation(violation);
        saveViolation(violation);
      }
    });
    setLoggedIds(new Set(analysisResult.hazards.map((h) => h.id)));
  }, [analysisResult, facility, organizationName, userName, loggedIds, addViolation, addInspection]);

  const handleReset = useCallback(() => {
    setMode('idle');
    setPreviewUrl(null);
    setAnalysisResult(null);
    setErrorMsg(null);
    setLoggedIds(new Set());
    setFacility('');
    setShowFacilityInput(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }, []);

  const criticalCount = analysisResult?.hazards.filter((h) => h.severity === 'critical').length ?? 0;
  const allLogged = analysisResult ? loggedIds.size === analysisResult.hazards.length : false;

  return (
    <div className="flex h-full flex-col bg-black">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileInputChange} />

      <div className="relative flex-1 overflow-hidden">
        {previewUrl ? (
          <img src={previewUrl} alt="Workspace scan" className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full flex-col items-center justify-center gap-4 bg-charcoal/30 px-6 text-center"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-safety-yellow/50">
              <Camera className="h-10 w-10 text-safety-yellow/70" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Take or upload a photo</p>
              <p className="mt-1 text-xs text-white/50">AI detects safety violations and OSHA regulations</p>
            </div>
          </div>
        )}

        {mode === 'analyzing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60">
            <div className="relative h-16 w-16">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-safety-yellow/20 border-t-safety-yellow" />
              <Zap className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-safety-yellow" />
            </div>
            <p className="text-sm font-semibold text-safety-yellow">Analyzing for hazards...</p>
          </div>
        )}

        {mode === 'idle' && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5">
            <Zap className="h-4 w-4 text-safety-yellow" />
            <span className="text-xs font-medium text-white">{OPENAI_KEY ? 'AI Vision Ready' : 'Demo Mode'}</span>
          </div>
        )}

        {previewUrl && (
          <button onClick={handleReset} className="absolute right-4 top-12 flex h-10 w-10 items-center justify-center rounded-full bg-black/50">
            <X className="h-5 w-5 text-white" />
          </button>
        )}
      </div>

      {mode === 'idle' && (
        <div className="bg-bg-surface px-4 pb-8 pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center gap-2 rounded-2xl bg-safety-yellow py-4 text-text-inverse"
            >
              <Camera className="h-7 w-7" />
              <span className="text-sm font-semibold">Take Photo</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border-default bg-bg-card py-4 text-text-primary"
            >
              <Upload className="h-7 w-7 text-text-secondary" />
              <span className="text-sm font-semibold">Upload Image</span>
            </button>
          </div>
          <p className="text-center text-[11px] text-text-secondary">
            Detects OSHA violations, PPE compliance, machine guarding & more
          </p>
        </div>
      )}

      {mode === 'error' && (
        <div className="bg-bg-surface px-4 pb-8 pt-4 space-y-3">
          <div className="rounded-xl border border-severity-critical/30 bg-severity-critical/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-severity-critical" />
              <div>
                <p className="text-sm font-medium text-text-primary">Analysis failed</p>
                <p className="mt-1 text-xs text-text-secondary">{errorMsg}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-safety-yellow py-3 text-sm font-semibold text-text-inverse"
          >
            <RotateCcw className="h-4 w-4" /> Try Again
          </button>
        </div>
      )}

      {mode === 'results' && analysisResult && (
        <div className="max-h-[55vh] overflow-auto bg-bg-surface">
          <div className="sticky top-0 z-10 bg-bg-surface px-4 py-3 border-b border-border-default">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-text-primary">
                  {analysisResult.hazards.length} hazard{analysisResult.hazards.length !== 1 ? 's' : ''} detected
                </span>
                {criticalCount > 0 && (
                  <span className="ml-2 rounded-md bg-severity-critical/15 px-1.5 py-0.5 text-[10px] font-bold text-severity-critical">
                    {criticalCount} CRITICAL
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span>Risk: <strong className="text-text-primary">{analysisResult.overall_risk_score}</strong></span>
                <span>Score: <strong className="text-text-primary">{analysisResult.compliance_score}%</strong></span>
              </div>
            </div>
            {analysisResult.summary && (
              <p className="mt-1 text-[11px] text-text-secondary line-clamp-2">{analysisResult.summary}</p>
            )}
            {showFacilityInput ? (
              <input
                type="text"
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                placeholder="Enter facility name..."
                className="mt-2 h-8 w-full rounded-lg bg-bg-card px-3 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-safety-yellow/50"
                autoFocus
              />
            ) : (
              <button onClick={() => setShowFacilityInput(true)} className="mt-1.5 text-[11px] text-info underline">
                + Add facility name
              </button>
            )}
          </div>

          <div className="px-4 pb-4 pt-3 space-y-2">
            {analysisResult.hazards.map((h) => {
              const isExpanded = expandedHazard === h.id;
              const isLogged = loggedIds.has(h.id);
              return (
                <div key={h.id} className="rounded-xl bg-bg-card overflow-hidden">
                  <div className={cn('h-1', `bg-severity-${h.severity}`)} />
                  <div className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase', getSeverityColor(h.severity))}>
                            {getSeverityLabel(h.severity)}
                          </span>
                          <span className="text-[10px] text-text-secondary">{h.confidence}% confidence</span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-text-primary">{h.title}</p>
                        <p className="snap-code text-[11px] text-info">{h.regulation}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        {isLogged ? (
                          <span className="flex items-center gap-1 rounded-md bg-compliant-bg px-2 py-1 text-[10px] font-medium text-compliant">
                            <Check className="h-3 w-3" /> Logged
                          </span>
                        ) : (
                          <button
                            onClick={() => handleLogViolation(h.id)}
                            className="flex items-center gap-1 rounded-md border border-safety-yellow/30 bg-safety-yellow/10 px-2 py-1 text-[10px] font-medium text-safety-yellow"
                          >
                            + Log
                          </button>
                        )}
                        <button onClick={() => setExpandedHazard(isExpanded ? null : h.id)} className="text-text-secondary">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 border-t border-border-default pt-3">
                        {h.description && <p className="text-xs text-text-secondary">{h.description}</p>}
                        {h.location && (
                          <p className="text-[11px] text-text-secondary">
                            <span className="font-medium text-text-primary">Location:</span> {h.location}
                          </p>
                        )}
                        {h.recommendations.length > 0 && (
                          <div>
                            <p className="mb-1 text-[11px] font-medium text-text-primary">Corrective Actions:</p>
                            <ul className="space-y-0.5">
                              {h.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[11px] text-text-secondary">
                                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-safety-yellow" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex gap-2 pt-1">
              {!allLogged && analysisResult.hazards.length > 0 && (
                <button
                  onClick={handleLogAllViolations}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-safety-yellow py-3 text-sm font-semibold text-text-inverse"
                >
                  <Check className="h-4 w-4" /> Log All
                </button>
              )}
              <button
                onClick={handleReset}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-xl border border-border-default bg-bg-card py-3 text-sm text-text-secondary',
                  allLogged || analysisResult.hazards.length === 0 ? 'flex-1' : 'px-4',
                )}
              >
                <ImageIcon className="h-4 w-4" />
                {allLogged || analysisResult.hazards.length === 0 ? 'Scan Another' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
