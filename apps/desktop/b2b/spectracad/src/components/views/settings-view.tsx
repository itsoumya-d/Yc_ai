import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, saveSettings } from '@/lib/storage';
import type { SpectraCADSettings } from '@/lib/storage';
import {
  Settings,
  Paintbrush,
  Grid3X3,
  Shield,
  BookOpen,
  Sparkles,
  Keyboard,
  User,
  Info,
  Key,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from 'lucide-react';

const sections = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'editor', label: 'Editor', icon: Paintbrush },
  { id: 'grid', label: 'Grid & Snap', icon: Grid3X3 },
  { id: 'drc', label: 'Design Rules', icon: Shield },
  { id: 'library', label: 'Component Library', icon: BookOpen },
  { id: 'ai', label: 'AI Assistant', icon: Sparkles },
  { id: 'keyboard', label: 'Keyboard', icon: Keyboard },
  { id: 'account', label: 'Account', icon: User },
  { id: 'about', label: 'About', icon: Info },
];

export function SettingsView() {
  const { setTheme, setOpenaiApiKey, setGridSize } = useAppStore();
  const [activeSection, setActiveSection] = useState('general');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [settings, setLocalSettings] = useState<SpectraCADSettings>(getSettings);

  useEffect(() => {
    setLocalSettings(getSettings());
  }, []);

  const updateSetting = useCallback(
    <K extends keyof SpectraCADSettings>(key: K, value: SpectraCADSettings[K]) => {
      setLocalSettings((prev) => {
        const next = { ...prev, [key]: value };
        saveSettings({ [key]: value });

        // Sync to global store where applicable
        if (key === 'theme') {
          setTheme(value as 'dark' | 'light' | 'system');
          if (value === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
          } else {
            document.documentElement.setAttribute('data-theme', value as string);
          }
        }
        if (key === 'openaiApiKey') setOpenaiApiKey(value as string);
        if (key === 'defaultGridSize') setGridSize(value as number);

        return next;
      });
    },
    [setTheme, setOpenaiApiKey, setGridSize],
  );

  return (
    <div className="flex h-full">
      {/* Section Nav */}
      <div className="w-56 border-r border-border-default bg-bg-surface p-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs transition-colors',
                activeSection === section.id
                  ? 'bg-bg-surface-hover text-text-primary'
                  : 'text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeSection === 'general' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="font-heading text-lg font-semibold text-text-primary">General Preferences</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-primary">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => updateSetting('theme', e.target.value as 'dark' | 'light' | 'system')}
                  className="mt-1 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 py-2 text-xs text-text-primary"
                >
                  <option value="dark">Dark (Default)</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-text-primary">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                  className="mt-1 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 py-2 text-xs text-text-primary"
                >
                  <option value="en">English</option>
                  <option value="ja">Japanese</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese (Simplified)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-text-primary">Units</label>
                <select
                  value={settings.units}
                  onChange={(e) => updateSetting('units', e.target.value as 'mm' | 'mils' | 'inches')}
                  className="mt-1 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 py-2 text-xs text-text-primary"
                >
                  <option value="mm">Metric (mm)</option>
                  <option value="mils">Imperial (mils)</option>
                  <option value="inches">Inches</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-text-primary">Auto-save</label>
                <select
                  value={settings.autoSaveInterval}
                  onChange={(e) => updateSetting('autoSaveInterval', Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 py-2 text-xs text-text-primary"
                >
                  <option value={2}>Every 2 minutes</option>
                  <option value={5}>Every 5 minutes</option>
                  <option value={10}>Every 10 minutes</option>
                  <option value={0}>Disabled</option>
                </select>
              </div>

              <div className="flex items-center justify-between rounded-md border border-border-default bg-bg-surface-raised px-4 py-3">
                <div>
                  <div className="text-xs font-medium text-text-primary">Check for updates automatically</div>
                  <div className="text-[10px] text-text-tertiary">Receive the latest features and bug fixes</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoUpdateCheck}
                  onChange={(e) => updateSetting('autoUpdateCheck', e.target.checked)}
                  className="h-4 w-4 rounded border-border-default"
                  style={{ accentColor: '#00C853' }}
                />
              </div>

              <div className="border-t border-border-subtle pt-4">
                <h3 className="mb-3 text-xs font-medium text-text-primary">Project Storage</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={settings.projectStoragePath}
                    readOnly
                    className="flex-1 rounded-md border border-border-default bg-bg-surface-raised px-3 py-2 font-mono text-xs text-text-secondary"
                  />
                  <button className="rounded-md border border-border-default px-3 py-2 text-xs text-text-secondary hover:bg-bg-surface-hover">
                    Browse
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-md border border-border-default bg-bg-surface-raised px-4 py-3">
                  <div>
                    <div className="text-xs font-medium text-text-primary">Cloud sync</div>
                    <div className="text-[10px] text-text-tertiary">Sync projects to Supabase cloud storage</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.cloudSync}
                    onChange={(e) => updateSetting('cloudSync', e.target.checked)}
                    className="h-4 w-4 rounded border-border-default"
                    style={{ accentColor: '#00C853' }}
                  />
                </div>
              </div>

              <div className="border-t border-border-subtle pt-4">
                <h3 className="mb-3 text-xs font-medium text-text-primary">Telemetry</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-text-secondary">
                    <input
                      type="checkbox"
                      checked={settings.sendUsageData}
                      onChange={(e) => updateSetting('sendUsageData', e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-border-default"
                      style={{ accentColor: '#00C853' }}
                    />
                    Send anonymous usage data
                  </label>
                  <label className="flex items-center gap-2 text-xs text-text-secondary">
                    <input
                      type="checkbox"
                      checked={settings.sendCrashReports}
                      onChange={(e) => updateSetting('sendCrashReports', e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-border-default"
                      style={{ accentColor: '#00C853' }}
                    />
                    Send crash reports
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'ai' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="font-heading text-lg font-semibold text-text-primary">AI Assistant</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-primary">OpenAI API Key</label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type={apiKeyVisible ? 'text' : 'password'}
                      placeholder="sk-..."
                      value={settings.openaiApiKey}
                      onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                      className="w-full rounded-md border border-border-default bg-bg-surface-raised py-2 pl-9 pr-10 font-mono text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
                    />
                    <button
                      onClick={() => setApiKeyVisible(!apiKeyVisible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                    >
                      {apiKeyVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <button className="flex items-center gap-1.5 rounded-md border border-border-default px-3 py-2 text-xs text-text-secondary hover:bg-bg-surface-hover">
                    <Check className="h-3 w-3" />
                    Test
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-primary">Default Model</label>
                <select
                  value={settings.aiModel}
                  onChange={(e) => updateSetting('aiModel', e.target.value)}
                  className="mt-1 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 py-2 text-xs text-text-primary"
                >
                  <option value="gpt-4o">GPT-4o (Recommended)</option>
                  <option value="gpt-4o-mini">GPT-4o-mini (Faster, cheaper)</option>
                  <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                </select>
              </div>

              <div className="flex items-center justify-between rounded-md border border-border-default bg-bg-surface-raised px-4 py-3">
                <div>
                  <div className="text-xs font-medium text-text-primary">Send design context to AI</div>
                  <div className="text-[10px] text-text-tertiary">Include current schematic data for context-aware suggestions</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.sendDesignContext}
                  onChange={(e) => updateSetting('sendDesignContext', e.target.checked)}
                  className="h-4 w-4 rounded border-border-default"
                  style={{ accentColor: '#00C853' }}
                />
              </div>

              <div className="rounded-md border border-warning/30 bg-warning/5 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                  <div className="text-xs text-text-secondary">
                    Design data sent to AI is processed by OpenAI. Do not use with confidential designs without organizational approval.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'grid' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="font-heading text-lg font-semibold text-text-primary">Grid & Snap</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-primary">Default Grid Size</label>
                <select
                  value={settings.defaultGridSize}
                  onChange={(e) => updateSetting('defaultGridSize', Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 py-2 text-xs text-text-primary"
                >
                  <option value={0.1}>0.1mm</option>
                  <option value={0.25}>0.25mm</option>
                  <option value={0.5}>0.5mm (Default)</option>
                  <option value={1.0}>1.0mm</option>
                  <option value={1.27}>1.27mm (50 mil)</option>
                  <option value={2.54}>2.54mm (100 mil)</option>
                </select>
              </div>

              <div className="flex items-center justify-between rounded-md border border-border-default bg-bg-surface-raised px-4 py-3">
                <span className="text-xs text-text-primary">Snap to grid</span>
                <input
                  type="checkbox"
                  checked={settings.snapToGrid}
                  onChange={(e) => updateSetting('snapToGrid', e.target.checked)}
                  className="h-4 w-4 rounded border-border-default"
                  style={{ accentColor: '#00C853' }}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border-default bg-bg-surface-raised px-4 py-3">
                <span className="text-xs text-text-primary">Snap to pins</span>
                <input
                  type="checkbox"
                  checked={settings.snapToPins}
                  onChange={(e) => updateSetting('snapToPins', e.target.checked)}
                  className="h-4 w-4 rounded border-border-default"
                  style={{ accentColor: '#00C853' }}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border-default bg-bg-surface-raised px-4 py-3">
                <span className="text-xs text-text-primary">Angular constraint (45/90 degrees)</span>
                <input
                  type="checkbox"
                  checked={settings.angularConstraint}
                  onChange={(e) => updateSetting('angularConstraint', e.target.checked)}
                  className="h-4 w-4 rounded border-border-default"
                  style={{ accentColor: '#00C853' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-primary">Grid Display</label>
                <select
                  value={settings.gridDisplay}
                  onChange={(e) => updateSetting('gridDisplay', e.target.value as 'dots' | 'lines' | 'cross' | 'hidden')}
                  className="mt-1 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 py-2 text-xs text-text-primary"
                >
                  <option value="dots">Dots (Default)</option>
                  <option value="lines">Lines</option>
                  <option value="cross">Cross</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'drc' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="font-heading text-lg font-semibold text-text-primary">Design Rules</h2>

            <div>
              <label className="text-xs font-medium text-text-primary">Manufacturer Preset</label>
              <select
                value={settings.drcPreset}
                onChange={(e) => updateSetting('drcPreset', e.target.value)}
                className="mt-1 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 py-2 text-xs text-text-primary"
              >
                <option>JLCPCB Standard</option>
                <option>PCBWay</option>
                <option>OSHPark</option>
                <option>Custom</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {([
                { key: 'minTraceWidth' as const, label: 'Min Trace Width' },
                { key: 'minClearance' as const, label: 'Min Clearance' },
                { key: 'minViaDrill' as const, label: 'Min Via Drill' },
                { key: 'minViaPad' as const, label: 'Min Via Pad' },
                { key: 'minHoleToHole' as const, label: 'Min Hole-to-Hole' },
                { key: 'minEdgeClearance' as const, label: 'Min Edge Clearance' },
                { key: 'minSilkToMask' as const, label: 'Min Silk-to-Mask' },
                { key: 'minAnnularRing' as const, label: 'Min Annular Ring' },
              ] as const).map((rule) => (
                <div key={rule.key}>
                  <label className="text-[10px] text-text-tertiary">{rule.label}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings[rule.key]}
                    onChange={(e) => updateSetting(rule.key, Number(e.target.value))}
                    className="mt-0.5 w-full rounded-md border border-border-default bg-bg-surface-raised px-3 py-1.5 font-mono text-xs text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'about' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="font-heading text-lg font-semibold text-text-primary">About SpectraCAD</h2>

            <div className="rounded-lg border border-border-default bg-bg-surface-raised p-6">
              <div className="mb-4 font-heading text-2xl font-semibold bg-gradient-to-r from-primary to-copper bg-clip-text text-transparent">
                SpectraCAD
              </div>
              <div className="space-y-2 text-xs text-text-secondary">
                <div>Version: 0.1.0 (Build 2024.1)</div>
                <div>Electron: 34.2.0</div>
                <div>Chromium: 124.0.6367.207</div>
                <div>Node.js: 20.14.0</div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button className="rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-hover">
                  Check for Updates
                </button>
                <button className="rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface-hover">
                  Licenses
                </button>
              </div>
            </div>
          </div>
        )}

        {!['general', 'ai', 'grid', 'drc', 'about'].includes(activeSection) && (
          <div className="max-w-2xl">
            <h2 className="font-heading text-lg font-semibold text-text-primary">
              {sections.find((s) => s.id === activeSection)?.label}
            </h2>
            <p className="mt-2 text-xs text-text-tertiary">Settings for this section coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
