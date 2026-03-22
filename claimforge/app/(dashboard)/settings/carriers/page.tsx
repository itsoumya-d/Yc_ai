'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';
import {
  Plus,
  X,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Zap,
  Copy,
  ExternalLink,
  Shield,
  RefreshCw,
} from 'lucide-react';
import {
  getCarrierConnections,
  addCarrierConnection,
  testCarrierConnection,
  removeCarrierConnection,
  type CarrierConnection,
} from '@/lib/actions/carriers';
import { CARRIER_REGISTRY } from '@/lib/carriers/acord-adapter';

// ── Carrier Options ─────────────────────────────────────────────────────────

const CARRIER_OPTIONS = [
  ...Object.entries(CARRIER_REGISTRY).map(([key, val]) => ({
    id: key,
    name: val.name,
    code: val.code,
  })),
  { id: 'custom', name: 'Custom Carrier', code: 'CUSTOM' },
];

// ── Status Config ───────────────────────────────────────────────────────────

type ConnectionStatus = 'connected' | 'pending' | 'error';

function getConnectionStatus(conn: CarrierConnection): ConnectionStatus {
  if (!conn.is_active) return 'error';
  if (conn.sync_errors > 0 && conn.claims_synced === 0) return 'error';
  if (conn.last_synced_at) return 'connected';
  return 'pending';
}

const STATUS_BADGE: Record<ConnectionStatus, { label: string; color: string; Icon: React.ElementType }> = {
  connected: { label: 'Connected', color: 'bg-verified-green-muted text-verified-green', Icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'bg-warning-muted text-warning', Icon: Clock },
  error: { label: 'Error', color: 'bg-fraud-red-muted text-fraud-red', Icon: AlertCircle },
};

// ── Page Component ──────────────────────────────────────────────────────────

export default function CarriersSettingsPage() {
  const t = useTranslations('settings');

  const [connections, setConnections] = useState<CarrierConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { success: boolean; message: string }>>({});
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadConnections = useCallback(async () => {
    const result = await getCarrierConnections();
    if (result.data) setConnections(result.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  async function handleTest(carrierId: string) {
    setTestingId(carrierId);
    setTestResult((prev) => ({ ...prev, [carrierId]: undefined as unknown as { success: boolean; message: string } }));
    const result = await testCarrierConnection(carrierId);
    if (result.data) {
      setTestResult((prev) => ({ ...prev, [carrierId]: { success: result.data!.success, message: result.data!.message } }));
    } else {
      setTestResult((prev) => ({ ...prev, [carrierId]: { success: false, message: result.error ?? 'Test failed' } }));
    }
    setTestingId(null);
    await loadConnections();
  }

  async function handleRemove(carrierId: string) {
    if (!confirm('Remove this carrier connection? All submission history will be preserved.')) return;
    setRemovingId(carrierId);
    const result = await removeCarrierConnection(carrierId);
    if (!result.error) {
      setConnections((prev) => prev.filter((c) => c.id !== carrierId));
    }
    setRemovingId(null);
  }

  function copyWebhookUrl(conn: CarrierConnection) {
    const url = `${window.location.origin}/api/webhooks/carrier`;
    navigator.clipboard.writeText(url);
  }

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/carrier` : '/api/webhooks/carrier';

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Carrier Connections" subtitle="Manage insurance carrier API integrations">
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Add Carrier
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
          </div>
        ) : connections.length === 0 ? (
          <div className="mx-auto max-w-md text-center py-20">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-muted">
              <Wifi className="h-7 w-7 text-primary-light" />
            </div>
            <h3 className="text-sm font-medium text-text-primary">No carriers connected</h3>
            <p className="mt-1 text-xs text-text-secondary">
              Connect to insurance carriers to submit claims via ACORD XML and track responses in real time.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              Add First Carrier
            </button>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl">
            {/* Sync Overview */}
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary mb-1">Total Carriers</div>
                <div className="text-xl font-semibold text-text-primary">{connections.length}</div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary mb-1">Active</div>
                <div className="text-xl font-semibold text-verified-green">
                  {connections.filter((c) => getConnectionStatus(c) === 'connected').length}
                </div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary mb-1">Claims Synced</div>
                <div className="text-xl font-semibold text-text-primary">
                  {connections.reduce((sum, c) => sum + c.claims_synced, 0)}
                </div>
              </div>
              <div className="rounded-xl border border-border-default bg-bg-surface p-4">
                <div className="text-[10px] text-text-tertiary mb-1">Sync Errors</div>
                <div className="text-xl font-semibold text-fraud-red">
                  {connections.reduce((sum, c) => sum + c.sync_errors, 0)}
                </div>
              </div>
            </div>

            {/* Carrier List */}
            <div className="space-y-3">
              {connections.map((conn) => {
                const status = getConnectionStatus(conn);
                const badge = STATUS_BADGE[status];
                const test = testResult[conn.id];

                return (
                  <motion.div
                    key={conn.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border-default bg-bg-surface p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl',
                          status === 'connected' ? 'bg-verified-green-muted' : status === 'error' ? 'bg-fraud-red-muted' : 'bg-warning-muted',
                        )}>
                          {status === 'connected' ? (
                            <Wifi className="h-5 w-5 text-verified-green" />
                          ) : status === 'error' ? (
                            <WifiOff className="h-5 w-5 text-fraud-red" />
                          ) : (
                            <Clock className="h-5 w-5 text-warning" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-text-primary">{conn.carrier_name}</h3>
                            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', badge.color)}>
                              <badge.Icon className="h-3 w-3" />
                              {badge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="font-mono text-[10px] text-text-tertiary">Code: {conn.carrier_code}</span>
                            {conn.last_synced_at && (
                              <span className="text-[10px] text-text-tertiary">
                                Last sync: {new Date(conn.last_synced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTest(conn.id)}
                          disabled={testingId === conn.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-raised disabled:opacity-50"
                        >
                          {testingId === conn.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Zap className="h-3.5 w-3.5" />
                          )}
                          Test
                        </button>
                        <button
                          onClick={() => handleRemove(conn.id)}
                          disabled={removingId === conn.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-fraud-red/20 px-3 py-1.5 text-xs text-fraud-red transition-colors hover:bg-fraud-red-muted disabled:opacity-50"
                        >
                          {removingId === conn.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Sync Stats */}
                    <div className="mt-4 flex items-center gap-6 border-t border-border-muted pt-3">
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <CheckCircle2 className="h-3.5 w-3.5 text-verified-green" />
                        {conn.claims_synced} claims synced
                      </div>
                      {conn.sync_errors > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-fraud-red">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {conn.sync_errors} errors
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Webhook: {webhookUrl}
                        <button
                          onClick={() => copyWebhookUrl(conn)}
                          className="ml-0.5 rounded p-0.5 hover:bg-bg-surface-raised"
                          title="Copy webhook URL"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Test Result */}
                    <AnimatePresence>
                      {test && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className={cn(
                            'mt-3 rounded-lg border p-3 text-xs',
                            test.success
                              ? 'border-verified-green/20 bg-verified-green-muted text-verified-green'
                              : 'border-fraud-red/20 bg-fraud-red-muted text-fraud-red',
                          )}>
                            {test.success ? <CheckCircle2 className="mb-1 h-4 w-4" /> : <AlertCircle className="mb-1 h-4 w-4" />}
                            {test.message}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Security Notice */}
            <div className="rounded-lg border border-accent bg-accent-muted p-4">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Encryption Notice</div>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    All carrier API keys are encrypted at rest. Webhook signatures are verified using HMAC-SHA256. Carrier communications use ACORD XML standards for interoperability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Carrier Modal */}
      <AnimatePresence>
        {showAddModal && <AddCarrierModal onClose={() => setShowAddModal(false)} onAdded={loadConnections} />}
      </AnimatePresence>
    </div>
  );
}

// ── Add Carrier Modal ───────────────────────────────────────────────────────

function AddCarrierModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => Promise<void> }) {
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [customName, setCustomName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCarrier) {
      setError('Select a carrier');
      return;
    }

    setSubmitting(true);
    setError('');

    const carrierCode = selectedCarrier === 'custom'
      ? `custom_${customName.toLowerCase().replace(/\s+/g, '_')}`
      : selectedCarrier;

    const result = await addCarrierConnection(carrierCode, {
      apiKey: apiKey || undefined,
      apiSecret: apiSecret || undefined,
      baseUrl: baseUrl || undefined,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    await onAdded();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border-default bg-bg-surface p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="legal-heading text-base text-text-primary">Add Carrier Connection</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-surface-raised">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Carrier Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Insurance Carrier</label>
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="">Select a carrier...</option>
              {CARRIER_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Name */}
          {selectedCarrier === 'custom' && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Custom Carrier Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Regional Mutual Insurance"
                className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                required
              />
            </div>
          )}

          {/* API Key */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Carrier API key (optional)"
              className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 font-mono text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          {/* API Secret */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">API Secret</label>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Carrier API secret (optional)"
              className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 font-mono text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          {/* Base URL */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">API Base URL</label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.carrier.com/v1"
              className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-text-tertiary">
              Leave blank for manual/offline submission mode. ACORD XML will be generated but not auto-submitted.
            </p>
          </div>

          {/* Webhook URL (read-only) */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Webhook URL (for carrier configuration)</label>
            <div className="flex items-center gap-2">
              <div className="h-9 flex-1 overflow-hidden rounded-lg border border-border-muted bg-bg-surface px-3 flex items-center text-xs font-mono text-text-tertiary">
                {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/carrier` : '/api/webhooks/carrier'}
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/carrier`)}
                className="rounded-lg border border-border-default px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-surface-raised"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-fraud-red/20 bg-fraud-red-muted px-3 py-2 text-xs text-fraud-red">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border-default px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedCarrier}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4" />
                  Connect Carrier
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
