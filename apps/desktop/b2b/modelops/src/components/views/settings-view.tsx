import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { getSettings, saveSettings } from '@/lib/storage';
import type { ModelOpsSettings } from '@/lib/storage';
import {
  Settings,
  Key,
  Terminal,
  Cpu,
  HardDrive,
  Bell,
  Keyboard,
  User,
  Users,
  CreditCard,
  Info,
  Check,
  Eye,
  EyeOff,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';

type SettingsSection = 'general' | 'cloud' | 'python' | 'gpu' | 'storage' | 'notifications' | 'keyboard' | 'account' | 'team' | 'billing' | 'about';

const settingsSections: { id: SettingsSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'cloud', label: 'Cloud Creds', icon: Key },
  { id: 'python', label: 'Python Envs', icon: Terminal },
  { id: 'gpu', label: 'GPU Defaults', icon: Cpu },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'keyboard', label: 'Keyboard', icon: Keyboard },
  { id: 'account', label: 'Account', icon: User },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'about', label: 'About', icon: Info },
];

const pythonEnvs = [
  { name: 'System Python', version: '3.11.7', path: '/usr/local/bin/python3' },
  { name: 'modelops-env', version: '3.11.7', path: '~/.venvs/modelops-env' },
  { name: 'conda: ml-base', version: '3.10.12', path: '~/miniconda3/envs/ml-base' },
];

interface CredentialConfig {
  key: keyof ModelOpsSettings;
  label: string;
}

const credentialFields: CredentialConfig[] = [
  { key: 'lambdaLabsKey', label: 'Lambda Labs API Key' },
  { key: 'runpodKey', label: 'RunPod API Key' },
  { key: 'modalToken', label: 'Modal Token' },
  { key: 'huggingfaceToken', label: 'HuggingFace Token' },
  { key: 'openaiApiKey', label: 'OpenAI API Key' },
];

export function SettingsView() {
  const { setTheme, setOpenaiApiKey } = useAppStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>('cloud');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [settings, setLocalSettings] = useState<ModelOpsSettings>(getSettings);

  useEffect(() => {
    setLocalSettings(getSettings());
  }, []);

  const updateSetting = useCallback(
    <K extends keyof ModelOpsSettings>(key: K, value: ModelOpsSettings[K]) => {
      setLocalSettings((prev) => {
        const next = { ...prev, [key]: value };
        saveSettings({ [key]: value });

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

        return next;
      });
    },
    [setTheme, setOpenaiApiKey],
  );

  const toggleKeyVisibility = (label: string) => {
    setShowKeys((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex h-full">
      {/* Settings Nav (Left Panel) */}
      <div className="w-48 overflow-auto border-r border-border-default bg-bg-surface p-3">
        <h3 className="mb-3 font-heading text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Settings
        </h3>
        <div className="space-y-0.5">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                  activeSection === section.id
                    ? 'bg-bg-surface-active text-text-primary'
                    : 'text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeSection === 'general' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">General Settings</h3>
              <p className="mt-0.5 text-xs text-text-tertiary">Configure application preferences</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => updateSetting('theme', e.target.value as 'dark' | 'light' | 'system')}
                  className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="dark">Dark (Default)</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Default Project Directory</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.defaultProjectDir}
                    readOnly
                    className="flex-1 rounded-md border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary"
                  />
                  <button className="rounded-md border border-border-default px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                    <FolderOpen className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Auto-save Interval</label>
                <select
                  value={settings.autoSaveInterval}
                  onChange={(e) => updateSetting('autoSaveInterval', Number(e.target.value))}
                  className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value={30}>Every 30 seconds</option>
                  <option value={60}>Every 1 minute</option>
                  <option value={300}>Every 5 minutes</option>
                  <option value={0}>Manual only</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-text-secondary">Send anonymous usage data</div>
                  <div className="text-[10px] text-text-tertiary">Help improve ModelOps by sharing crash reports and usage statistics</div>
                </div>
                <button
                  onClick={() => updateSetting('sendUsageData', !settings.sendUsageData)}
                  className={cn(
                    'h-5 w-9 rounded-full p-0.5 transition-colors',
                    settings.sendUsageData ? 'bg-primary' : 'bg-bg-surface-hover',
                  )}
                >
                  <div className={cn(
                    'h-4 w-4 rounded-full transition-transform',
                    settings.sendUsageData ? 'translate-x-4 bg-white' : 'translate-x-0 bg-text-tertiary',
                  )} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'cloud' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Cloud Credentials</h3>
              <p className="mt-0.5 text-xs text-text-tertiary">API keys for GPU providers and cloud services. Stored securely in your OS keychain.</p>
            </div>

            <div className="space-y-4">
              {credentialFields.map((cred) => {
                const value = settings[cred.key] as string;
                const configured = value.length > 0;
                return (
                  <div key={cred.label} className="rounded-lg border border-border-default bg-bg-surface p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-primary">{cred.label}</span>
                        {configured && (
                          <span className="flex items-center gap-1 text-[10px] text-success">
                            <Check className="h-3 w-3" /> Connected
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {configured && (
                          <button
                            onClick={() => updateSetting(cred.key, '' as never)}
                            className="rounded px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type={showKeys[cred.label] ? 'text' : 'password'}
                        placeholder="Paste API key..."
                        value={value}
                        onChange={(e) => updateSetting(cred.key, e.target.value as never)}
                        className="flex-1 rounded border border-border-subtle bg-bg-root px-3 py-1.5 font-mono text-xs text-text-secondary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                      />
                      <button
                        onClick={() => toggleKeyVisibility(cred.label)}
                        className="rounded p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary"
                      >
                        {showKeys[cred.label] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* S3/R2 Storage */}
            <div className="rounded-lg border border-border-default bg-bg-surface p-3 space-y-3">
              <span className="text-xs font-medium text-text-primary">Artifact Storage (S3 / R2)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] text-text-tertiary">Access Key</label>
                  <input
                    type="password"
                    value={settings.s3AccessKey}
                    onChange={(e) => updateSetting('s3AccessKey', e.target.value)}
                    placeholder="AKIA..."
                    className="w-full rounded border border-border-default bg-bg-root px-2.5 py-1.5 font-mono text-xs text-text-secondary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-text-tertiary">Secret Key</label>
                  <input
                    type="password"
                    value={settings.s3SecretKey}
                    onChange={(e) => updateSetting('s3SecretKey', e.target.value)}
                    placeholder="Secret..."
                    className="w-full rounded border border-border-default bg-bg-root px-2.5 py-1.5 font-mono text-xs text-text-secondary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-text-tertiary">Bucket</label>
                  <input
                    type="text"
                    value={settings.s3Bucket}
                    onChange={(e) => updateSetting('s3Bucket', e.target.value)}
                    className="w-full rounded border border-border-default bg-bg-root px-2.5 py-1.5 font-mono text-xs text-text-secondary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-text-tertiary">Region</label>
                  <select
                    value={settings.s3Region}
                    onChange={(e) => updateSetting('s3Region', e.target.value)}
                    className="w-full rounded border border-border-default bg-bg-root px-2.5 py-1.5 text-xs text-text-secondary"
                  >
                    <option>us-east-1</option>
                    <option>us-west-2</option>
                    <option>eu-west-1</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                  Test Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'python' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Python Environments</h3>
              <p className="mt-0.5 text-xs text-text-tertiary">Manage Python interpreters and virtual environments</p>
            </div>

            <div className="space-y-2">
              {pythonEnvs.map((env) => {
                const isDefault = settings.defaultPythonEnv === env.name;
                return (
                  <div key={env.name} className={cn(
                    'flex items-center justify-between rounded-lg border p-3',
                    isDefault ? 'border-primary bg-primary/5' : 'border-border-default bg-bg-surface',
                  )}>
                    <div className="flex items-center gap-3">
                      <Terminal className="h-4 w-4 text-text-tertiary" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-text-primary">{env.name}</span>
                          {isDefault && (
                            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-medium text-primary">Default</span>
                          )}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] text-text-tertiary">{env.path}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-secondary">Python {env.version}</span>
                      {!isDefault && (
                        <button
                          onClick={() => updateSetting('defaultPythonEnv', env.name)}
                          className="rounded px-2 py-1 text-xs text-text-tertiary transition-colors hover:text-text-secondary"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
              <RefreshCw className="h-3 w-3" />
              Detect Environments
            </button>
          </div>
        )}

        {activeSection === 'about' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">About ModelOps</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-text-tertiary">Version</span>
                <span className="font-mono text-text-primary">0.1.0-alpha</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-tertiary">Electron</span>
                <span className="font-mono text-text-primary">34.x</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-tertiary">React</span>
                <span className="font-mono text-text-primary">19.x</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-tertiary">Node.js</span>
                <span className="font-mono text-text-primary">22.x</span>
              </div>
            </div>
            <p className="text-xs text-text-tertiary">
              Ship ML models, not infrastructure. ModelOps is an IDE for the full machine learning lifecycle.
            </p>
          </div>
        )}

        {/* Placeholder for other sections */}
        {!['general', 'cloud', 'python', 'about'].includes(activeSection) && (
          <div className="max-w-xl">
            <h3 className="text-sm font-semibold text-text-primary capitalize">{activeSection} Settings</h3>
            <p className="mt-2 text-xs text-text-tertiary">Configure {activeSection} preferences and options.</p>
            <div className="mt-6 rounded-lg border border-border-default bg-bg-surface p-8 text-center">
              <p className="text-xs text-text-tertiary">Settings panel coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
