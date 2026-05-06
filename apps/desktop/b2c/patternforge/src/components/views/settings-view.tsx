import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, saveSettings } from '@/lib/storage';
import { cn } from '@/lib/utils';
import type { MaterialType, QualityPreset } from '@/types/database';
import { Settings, Printer, Key, Palette, Cpu, Check } from 'lucide-react';

const sections = [
  { id: 'printer', label: 'Printer Profile', icon: Printer },
  { id: 'generation', label: 'Generation', icon: Cpu },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export function SettingsView() {
  const { openaiApiKey, setOpenaiApiKey, theme, setTheme } = useAppStore();

  const [activeSection, setActiveSection] = useState('printer');
  const [printerModel, setPrinterModel] = useState('bambu-x1c');
  const [buildX, setBuildX] = useState(256);
  const [buildY, setBuildY] = useState(256);
  const [buildZ, setBuildZ] = useState(256);
  const [nozzle, setNozzle] = useState(0.4);
  const [defaultQuality, setDefaultQuality] = useState<QualityPreset>('standard');
  const [defaultMaterial, setDefaultMaterial] = useState<MaterialType>('pla');
  const [autoValidate, setAutoValidate] = useState(true);
  const [viewportBg, setViewportBg] = useState('#171412');
  const [localApiKey, setLocalApiKey] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const s = getSettings();
    setPrinterModel(s.printerModel);
    setBuildX(s.buildVolume.x);
    setBuildY(s.buildVolume.y);
    setBuildZ(s.buildVolume.z);
    setNozzle(s.nozzleDiameter);
    setDefaultQuality(s.defaultQuality);
    setDefaultMaterial(s.defaultMaterial);
    setAutoValidate(s.autoValidate);
    setViewportBg(s.viewportBackground);
    setLocalApiKey(s.openaiApiKey);
  }, []);

  const showSave = useCallback((msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(''), 2000);
  }, []);

  const handleSavePrinter = useCallback(() => {
    saveSettings({ printerModel, buildVolume: { x: buildX, y: buildY, z: buildZ }, nozzleDiameter: nozzle });
    showSave('Printer profile saved');
  }, [printerModel, buildX, buildY, buildZ, nozzle, showSave]);

  const handleSaveApiKey = useCallback(() => {
    setOpenaiApiKey(localApiKey);
    saveSettings({ openaiApiKey: localApiKey });
    showSave('API key saved');
  }, [localApiKey, setOpenaiApiKey, showSave]);

  const handleThemeChange = useCallback((t: 'dark' | 'light' | 'system') => {
    setTheme(t);
    saveSettings({ theme: t });
    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', t);
    }
    showSave('Theme updated');
  }, [setTheme, showSave]);

  return (
    <div className="flex h-full">
      <div className="w-56 border-r border-border-default bg-bg-surface p-4">
        <div className="mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary-DEFAULT" />
          <h2 className="text-sm font-medium text-text-primary">Settings</h2>
        </div>
        <nav className="space-y-0.5">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors',
                activeSection === s.id
                  ? 'bg-primary-muted text-primary-DEFAULT'
                  : 'text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary',
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {saveMsg && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md bg-status-success px-3 py-2 text-xs font-medium text-white">
            <Check className="h-3.5 w-3.5" /> {saveMsg}
          </div>
        )}

        {activeSection === 'printer' && (
          <section>
            <h3 className="forge-heading mb-4 text-sm text-text-primary">Printer Profile</h3>
            <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Printer Model</label>
                <select
                  value={printerModel}
                  onChange={(e) => setPrinterModel(e.target.value)}
                  className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                >
                  <option value="bambu-x1c">Bambu Lab X1-Carbon</option>
                  <option value="prusa-mk4">Prusa MK4</option>
                  <option value="ender-3-v3">Creality Ender 3 V3</option>
                  <option value="elegoo-mars-4">Elegoo Mars 4</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-text-tertiary">Build X (mm)</label>
                  <input type="number" value={buildX} onChange={(e) => setBuildX(Number(e.target.value))} className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-tertiary">Build Y (mm)</label>
                  <input type="number" value={buildY} onChange={(e) => setBuildY(Number(e.target.value))} className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-tertiary">Build Z (mm)</label>
                  <input type="number" value={buildZ} onChange={(e) => setBuildZ(Number(e.target.value))} className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Nozzle Diameter</label>
                <select
                  value={nozzle}
                  onChange={(e) => setNozzle(Number(e.target.value))}
                  className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                >
                  <option value={0.2}>0.2mm (Fine)</option>
                  <option value={0.4}>0.4mm (Standard)</option>
                  <option value={0.6}>0.6mm (Fast)</option>
                  <option value={0.8}>0.8mm (Extra Fast)</option>
                </select>
              </div>
              <button onClick={handleSavePrinter} className="rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">
                Save Profile
              </button>
            </div>
          </section>
        )}

        {activeSection === 'generation' && (
          <section>
            <h3 className="forge-heading mb-4 text-sm text-text-primary">Generation</h3>
            <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Default Quality</label>
                <select
                  value={defaultQuality}
                  onChange={(e) => { const v = e.target.value as QualityPreset; setDefaultQuality(v); saveSettings({ defaultQuality: v }); }}
                  className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                >
                  <option value="draft">Draft (fastest generation)</option>
                  <option value="standard">Standard (balanced speed &amp; detail)</option>
                  <option value="high">High (more detail)</option>
                  <option value="ultra">Ultra (maximum detail)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">Default Material</label>
                <select
                  value={defaultMaterial}
                  onChange={(e) => { const v = e.target.value as MaterialType; setDefaultMaterial(v); saveSettings({ defaultMaterial: v }); }}
                  className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary-DEFAULT focus:outline-none"
                >
                  <option value="pla">PLA</option>
                  <option value="abs">ABS</option>
                  <option value="petg">PETG</option>
                  <option value="tpu">TPU</option>
                  <option value="resin">Resin</option>
                  <option value="nylon">Nylon</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-text-primary">Auto-validate printability</div>
                  <div className="text-[10px] text-text-tertiary">Run checks after each generation</div>
                </div>
                <button
                  onClick={() => { const v = !autoValidate; setAutoValidate(v); saveSettings({ autoValidate: v }); }}
                  className={cn('h-5 w-9 rounded-full p-0.5 transition-colors', autoValidate ? 'bg-primary-DEFAULT' : 'bg-border-default')}
                >
                  <div className={cn('h-4 w-4 rounded-full bg-white transition-transform', autoValidate ? 'translate-x-4' : 'translate-x-0')} />
                </button>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'api' && (
          <section>
            <h3 className="forge-heading mb-4 text-sm text-text-primary">API Keys</h3>
            <div className="max-w-lg space-y-4 rounded-lg border border-border-default bg-bg-surface p-5">
              <div>
                <label className="mb-1 block text-xs text-text-tertiary">OpenAI API Key</label>
                <input
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="h-9 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-DEFAULT focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-text-tertiary">Used for AI-powered 3D model generation from text descriptions.</p>
              </div>
              <button onClick={handleSaveApiKey} className="rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">
                Save API Key
              </button>
            </div>
          </section>
        )}

        {activeSection === 'appearance' && (
          <section>
            <h3 className="forge-heading mb-4 text-sm text-text-primary">Appearance</h3>
            <div className="max-w-lg rounded-lg border border-border-default bg-bg-surface p-5 space-y-4">
              <div>
                <div className="mb-2 text-xs font-medium text-text-primary">Theme</div>
                <div className="flex gap-2">
                  {(['dark', 'light', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleThemeChange(t)}
                      className={cn(
                        'rounded-md px-4 py-2 text-xs capitalize',
                        theme === t
                          ? 'bg-primary-muted text-primary-DEFAULT'
                          : 'border border-border-default text-text-secondary hover:bg-bg-surface-raised',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-text-primary">Viewport Background</div>
                <div className="flex gap-2">
                  {[
                    { label: 'Dark', color: '#171412' },
                    { label: 'Midnight', color: '#0F0D1A' },
                    { label: 'Charcoal', color: '#1C1917' },
                  ].map((bg) => (
                    <button
                      key={bg.label}
                      onClick={() => { setViewportBg(bg.color); saveSettings({ viewportBackground: bg.color }); }}
                      className={cn(
                        'flex items-center gap-2 rounded-md border px-3 py-2 text-xs',
                        viewportBg === bg.color ? 'border-primary-DEFAULT text-text-primary' : 'border-border-default text-text-secondary hover:bg-bg-surface-raised',
                      )}
                    >
                      <div className="h-4 w-4 rounded border border-border-default" style={{ background: bg.color }} />
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
