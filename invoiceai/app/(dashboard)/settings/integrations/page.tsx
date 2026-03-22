'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  X,
  RefreshCw,
  ExternalLink,
  Plug,
  ArrowDownUp,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import {
  getIntegrations,
  getSyncHistory,
  initiateQuickBooksConnect,
  initiateXeroConnect,
  disconnectIntegration,
  syncInvoices,
  updateSyncSettings,
} from '@/lib/actions/integrations';
import type { AccountingIntegration, SyncLog } from '@/lib/actions/integrations';

// ── Field Mapping Definitions ───────────────────────────────────────────────

const QBO_FIELD_MAP = [
  { invoiceAI: 'invoice_number', target: 'DocNumber', note: 'Invoice reference number' },
  { invoiceAI: 'issue_date', target: 'TxnDate', note: 'Transaction date' },
  { invoiceAI: 'due_date', target: 'DueDate', note: 'Payment due date' },
  { invoiceAI: 'client.name', target: 'CustomerRef', note: 'Linked QBO customer' },
  { invoiceAI: 'items[].description', target: 'Line[].Description', note: 'Line item description' },
  { invoiceAI: 'items[].quantity', target: 'Line[].SalesItemLineDetail.Qty', note: 'Quantity' },
  { invoiceAI: 'items[].unit_price', target: 'Line[].SalesItemLineDetail.UnitPrice', note: 'Unit price' },
  { invoiceAI: 'currency', target: 'CurrencyRef', note: 'Invoice currency' },
  { invoiceAI: 'notes', target: 'CustomerMemo', note: 'Customer-facing memo' },
  { invoiceAI: 'payments[].amount', target: 'Payment.TotalAmt', note: 'Payment amount' },
];

const XERO_FIELD_MAP = [
  { invoiceAI: 'invoice_number', target: 'InvoiceNumber', note: 'Invoice reference' },
  { invoiceAI: 'issue_date', target: 'Date', note: 'Invoice date' },
  { invoiceAI: 'due_date', target: 'DueDate', note: 'Payment due date' },
  { invoiceAI: 'client.name', target: 'Contact.Name', note: 'Linked Xero contact' },
  { invoiceAI: 'items[].description', target: 'LineItems[].Description', note: 'Line description' },
  { invoiceAI: 'items[].quantity', target: 'LineItems[].Quantity', note: 'Quantity' },
  { invoiceAI: 'items[].unit_price', target: 'LineItems[].UnitAmount', note: 'Unit amount' },
  { invoiceAI: 'currency', target: 'CurrencyCode', note: 'Invoice currency' },
  { invoiceAI: 'status', target: 'Status', note: 'DRAFT/AUTHORISED/PAID' },
  { invoiceAI: 'payments[].amount', target: 'Payments[].Amount', note: 'Payment amount' },
];

// ── Other Integrations (non-accounting) ─────────────────────────────────────

const OTHER_INTEGRATIONS = [
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Payments',
    description: 'Accept credit card and ACH payments directly from your invoices.',
    logoColor: '#635BFF',
    logoLetter: 'S',
    connected: true,
    connectedLabel: 'Managed via Billing settings',
    docsUrl: 'https://stripe.com',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'Automation',
    description: 'Connect InvoiceAI to 5,000+ apps via triggers and actions.',
    logoColor: '#FF4A00',
    logoLetter: 'Z',
    connected: false,
    docsUrl: 'https://zapier.com',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Notifications',
    description: 'Get Slack notifications when invoices are paid, viewed, or overdue.',
    logoColor: '#611F69',
    logoLetter: 'SL',
    connected: false,
    docsUrl: 'https://slack.com',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    description: 'Sync clients and invoice data with Salesforce CRM.',
    logoColor: '#00A1E0',
    logoLetter: 'SF',
    connected: false,
    docsUrl: 'https://salesforce.com',
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const syncStatusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={14} className="text-green-600" />,
  failed: <XCircle size={14} className="text-red-600" />,
  partial: <AlertTriangle size={14} className="text-amber-600" />,
  started: <RefreshCw size={14} className="text-blue-600 animate-spin" />,
};

const syncStatusColor: Record<string, string> = {
  completed: 'text-green-700 bg-green-50',
  failed: 'text-red-700 bg-red-50',
  partial: 'text-amber-700 bg-amber-50',
  started: 'text-blue-700 bg-blue-50',
};

const directionIcons: Record<string, React.ReactNode> = {
  push: <ArrowUp size={12} />,
  pull: <ArrowDown size={12} />,
  bidirectional: <ArrowDownUp size={12} />,
};

// ── Component ───────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // State
  const [integrations, setIntegrations] = useState<AccountingIntegration[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [expandedMapping, setExpandedMapping] = useState<string | null>(null);
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // API key section (existing feature, preserved)
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);
  const apiKey = 'iai_live_sk_7x9kQmNpRvLz3wYdF2aEtBuCjHoX5g';
  const webhookUrl = 'https://app.invoiceai.co/api/webhooks/inbound';

  // Other integrations toggle state
  const [otherConnections, setOtherConnections] = useState<Record<string, boolean>>(
    Object.fromEntries(OTHER_INTEGRATIONS.map((i) => [i.id, i.connected]))
  );
  const [otherConnecting, setOtherConnecting] = useState<string | null>(null);

  const copyText = (text: string, which: 'api' | 'webhook') => {
    navigator.clipboard.writeText(text);
    if (which === 'api') {
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    } else {
      setWebhookCopied(true);
      setTimeout(() => setWebhookCopied(false), 2000);
    }
  };

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    const [intResult, historyResult] = await Promise.all([
      getIntegrations(),
      getSyncHistory(),
    ]);
    if (intResult.success && intResult.data) setIntegrations(intResult.data);
    if (historyResult.success && historyResult.data) setSyncLogs(historyResult.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle redirect from OAuth callback
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected) {
      toast({
        title: `${connected === 'quickbooks' ? 'QuickBooks' : 'Xero'} connected successfully`,
        variant: 'success',
      });
      loadData();
      // Clean URL
      window.history.replaceState({}, '', '/settings/integrations');
    }
    if (error) {
      toast({
        title: 'Connection failed',
        description: decodeURIComponent(error),
        variant: 'destructive',
      });
      window.history.replaceState({}, '', '/settings/integrations');
    }
  }, [searchParams, toast, loadData]);

  // Helpers to find integration by provider
  const getIntegration = (provider: string) =>
    integrations.find((i) => i.provider === provider);

  const qbo = getIntegration('quickbooks');
  const xeroInt = getIntegration('xero');

  // ── Connect handlers ──────────────────────────────────────────────────────

  const handleConnect = async (provider: 'quickbooks' | 'xero') => {
    setConnecting(provider);
    try {
      const result =
        provider === 'quickbooks'
          ? await initiateQuickBooksConnect()
          : await initiateXeroConnect();

      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast({
          title: 'Connection error',
          description: result.error ?? 'Could not initiate connection',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Connection failed', variant: 'destructive' });
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (provider: 'quickbooks' | 'xero') => {
    if (!confirm(`Disconnect ${provider === 'quickbooks' ? 'QuickBooks' : 'Xero'}? Sync will stop.`)) return;
    setDisconnecting(provider);
    try {
      const result = await disconnectIntegration(provider);
      if (result.success) {
        toast({ title: 'Disconnected successfully', variant: 'success' });
        loadData();
      } else {
        toast({
          title: 'Disconnect failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Disconnect failed', variant: 'destructive' });
    } finally {
      setDisconnecting(null);
    }
  };

  // ── Sync handler ──────────────────────────────────────────────────────────

  const handleSyncNow = async (provider: 'quickbooks' | 'xero') => {
    setSyncing(provider);
    try {
      const result = await syncInvoices(provider);
      if (result.success && result.data) {
        toast({
          title: 'Sync complete',
          description: `${result.data.itemsSynced} items synced${result.data.itemsFailed > 0 ? `, ${result.data.itemsFailed} failed` : ''}`,
          variant: result.data.itemsFailed > 0 ? 'default' : 'success',
        });
      } else {
        toast({
          title: 'Sync failed',
          description: result.error,
          variant: 'destructive',
        });
      }
      loadData();
    } catch {
      toast({ title: 'Sync failed', variant: 'destructive' });
    } finally {
      setSyncing(null);
    }
  };

  // ── Setting change handlers ───────────────────────────────────────────────

  const handleSettingChange = async (
    provider: 'quickbooks' | 'xero',
    key: 'auto_sync' | 'sync_frequency' | 'sync_direction',
    value: string | boolean
  ) => {
    const result = await updateSyncSettings(provider, { [key]: value });
    if (result.success) {
      loadData();
    } else {
      toast({
        title: 'Failed to update setting',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleOtherToggle = async (id: string) => {
    setOtherConnecting(id);
    await new Promise((r) => setTimeout(r, 900));
    setOtherConnections((prev) => ({ ...prev, [id]: !prev[id] }));
    setOtherConnecting(null);
  };

  // ── Rendering helpers ─────────────────────────────────────────────────────

  const renderAccountingCard = (
    provider: 'quickbooks' | 'xero',
    name: string,
    logoColor: string,
    logoLetter: string,
    description: string,
    docsUrl: string,
    integration: AccountingIntegration | undefined
  ) => {
    const isConnected = !!integration;
    const isConnecting_ = connecting === provider;
    const isDisconnecting = disconnecting === provider;
    const isSyncing = syncing === provider;
    const fieldMap = provider === 'quickbooks' ? QBO_FIELD_MAP : XERO_FIELD_MAP;
    const isMappingExpanded = expandedMapping === provider;

    return (
      <div
        key={provider}
        className={`rounded-xl border-2 transition-all ${
          isConnected
            ? 'border-green-200 bg-green-50/30'
            : 'border-[var(--border)] bg-[var(--card)]'
        }`}
      >
        {/* Header */}
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: logoColor }}
            >
              {logoLetter}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-[var(--foreground)]">{name}</h3>
                <span className="text-xs bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-0.5 rounded-full">
                  Accounting
                </span>
                {isConnected && (
                  <span className="flex items-center gap-1 text-xs text-green-700 font-semibold">
                    <Check size={11} />
                    Connected
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mt-1 leading-relaxed">
                {description}
              </p>
              {isConnected && (
                <div className="flex items-center gap-4 mt-2 text-xs text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    Last synced: {relativeTime(integration.last_synced_at)}
                  </span>
                  {integration.realm_id && (
                    <span className="font-mono text-green-600">
                      Realm: {integration.realm_id}
                    </span>
                  )}
                  {integration.tenant_id && (
                    <span className="font-mono text-green-600">
                      Tenant: {integration.tenant_id.slice(0, 8)}...
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4">
            {isConnected ? (
              <>
                <button
                  onClick={() => handleSyncNow(provider)}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[var(--primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  <RefreshCw
                    size={12}
                    className={isSyncing ? 'animate-spin' : ''}
                  />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  onClick={() => handleDisconnect(provider)}
                  disabled={isDisconnecting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  {isDisconnecting ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <X size={12} />
                  )}
                  {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </>
            ) : (
              <button
                onClick={() => handleConnect(provider)}
                disabled={isConnecting_}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[var(--primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {isConnecting_ ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Plug size={12} />
                )}
                {isConnecting_ ? 'Connecting...' : `Connect ${name}`}
              </button>
            )}
            <a
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <ExternalLink size={11} />
              Docs
            </a>
          </div>
        </div>

        {/* Sync settings (only when connected) */}
        {isConnected && (
          <div className="border-t border-[var(--border)] p-5 space-y-4">
            <h4 className="text-sm font-semibold text-[var(--foreground)]">
              Sync Settings
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Auto-sync toggle */}
              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Auto-sync
                </label>
                <button
                  type="button"
                  onClick={() =>
                    handleSettingChange(
                      provider,
                      'auto_sync',
                      !integration.auto_sync
                    )
                  }
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    integration.auto_sync
                      ? 'bg-[var(--primary)]'
                      : 'bg-[var(--border)]'
                  }`}
                  role="switch"
                  aria-checked={integration.auto_sync}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                      integration.auto_sync
                        ? 'translate-x-5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Sync frequency */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                  Frequency
                </label>
                <select
                  value={integration.sync_frequency}
                  onChange={(e) =>
                    handleSettingChange(provider, 'sync_frequency', e.target.value)
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              {/* Sync direction */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                  Direction
                </label>
                <select
                  value={integration.sync_direction}
                  onChange={(e) =>
                    handleSettingChange(provider, 'sync_direction', e.target.value)
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="push">Push (InvoiceAI to {name})</option>
                  <option value="pull">Pull ({name} to InvoiceAI)</option>
                  <option value="bidirectional">Bidirectional</option>
                </select>
              </div>
            </div>

            {/* Field mapping toggle */}
            <button
              onClick={() =>
                setExpandedMapping(isMappingExpanded ? null : provider)
              }
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] hover:opacity-80 transition-opacity"
            >
              {isMappingExpanded ? (
                <ChevronUp size={13} />
              ) : (
                <ChevronDown size={13} />
              )}
              {isMappingExpanded ? 'Hide' : 'View'} field mapping
            </button>

            {/* Field mapping table */}
            {isMappingExpanded && (
              <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                      <th className="text-left px-3 py-2 font-medium text-[var(--muted-foreground)]">
                        InvoiceAI Field
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--muted-foreground)]">
                        {name} Field
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--muted-foreground)]">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldMap.map((row) => (
                      <tr
                        key={row.invoiceAI}
                        className="border-b last:border-0 border-[var(--border)]"
                      >
                        <td className="px-3 py-2 font-mono text-[var(--foreground)]">
                          {row.invoiceAI}
                        </td>
                        <td className="px-3 py-2 font-mono text-[var(--primary)]">
                          {row.target}
                        </td>
                        <td className="px-3 py-2 text-[var(--muted-foreground)]">
                          {row.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Categories for other integrations ─────────────────────────────────────

  const otherCategories = [
    'All',
    ...Array.from(new Set(OTHER_INTEGRATIONS.map((i) => i.category))),
  ];
  const filteredOther =
    activeCategory === 'All'
      ? OTHER_INTEGRATIONS
      : OTHER_INTEGRATIONS.filter((i) => i.category === activeCategory);

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/settings"
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
            Integrations
          </h1>
          <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
            Connect InvoiceAI with accounting software and other tools.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── Accounting Integrations ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-[var(--primary)]" />
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Accounting Sync
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border-2 border-[var(--border)] bg-[var(--card)] p-5 animate-pulse"
                >
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--muted)]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[var(--muted)] rounded w-32" />
                      <div className="h-3 bg-[var(--muted)] rounded w-full" />
                      <div className="h-3 bg-[var(--muted)] rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderAccountingCard(
                'quickbooks',
                'QuickBooks Online',
                '#2CA01C',
                'QB',
                'Sync invoices, clients, and payments automatically to QuickBooks Online.',
                'https://quickbooks.intuit.com',
                qbo
              )}
              {renderAccountingCard(
                'xero',
                'Xero',
                '#1AB4D7',
                'X',
                'Push invoices and reconcile payments with your Xero accounting file.',
                'https://xero.com',
                xeroInt
              )}
            </div>
          )}
        </div>

        {/* ── Sync History ────────────────────────────────────────────────── */}
        {syncLogs.length > 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <button
              onClick={() => setExpandedHistory(!expandedHistory)}
              className="w-full p-5 flex items-center justify-between text-left"
            >
              <div>
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  Sync History
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                  Last {syncLogs.length} sync operations
                </p>
              </div>
              {expandedHistory ? (
                <ChevronUp size={16} className="text-[var(--muted-foreground)]" />
              ) : (
                <ChevronDown size={16} className="text-[var(--muted-foreground)]" />
              )}
            </button>

            {expandedHistory && (
              <div className="border-t border-[var(--border)] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {[
                        'Provider',
                        'Direction',
                        'Status',
                        'Items',
                        'Errors',
                        'Started',
                        'Duration',
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left text-xs font-medium text-[var(--muted-foreground)] px-4 py-2.5"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {syncLogs.map((log) => {
                      const duration =
                        log.completed_at && log.started_at
                          ? Math.round(
                              (new Date(log.completed_at).getTime() -
                                new Date(log.started_at).getTime()) /
                                1000
                            )
                          : null;
                      return (
                        <tr
                          key={log.id}
                          className="border-b last:border-0 border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors"
                        >
                          <td className="px-4 py-2.5 text-sm capitalize text-[var(--foreground)]">
                            {log.provider === 'quickbooks'
                              ? 'QuickBooks'
                              : 'Xero'}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                              {directionIcons[log.direction]}
                              {log.direction}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${syncStatusColor[log.status] ?? ''}`}
                            >
                              {syncStatusIcon[log.status]}
                              {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-[var(--foreground)]">
                            {log.items_synced}
                          </td>
                          <td className="px-4 py-2.5 text-sm">
                            {log.items_failed > 0 ? (
                              <span
                                className="text-red-600 cursor-help"
                                title={log.error_message ?? ''}
                              >
                                {log.items_failed}
                              </span>
                            ) : (
                              <span className="text-[var(--muted-foreground)]">
                                0
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-[var(--muted-foreground)]">
                            {formatDate(log.started_at)}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-[var(--muted-foreground)]">
                            {duration !== null ? `${duration}s` : '...'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Other Integrations ──────────────────────────────────────────── */}
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">
            Other Integrations
          </h2>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            {otherCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredOther.map((integration) => {
              const isConnected = otherConnections[integration.id];
              const isConnecting_ = otherConnecting === integration.id;

              return (
                <div
                  key={integration.id}
                  className={`rounded-xl border-2 p-5 transition-all ${
                    isConnected
                      ? 'border-green-200 bg-green-50/30'
                      : 'border-[var(--border)] bg-[var(--card)]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: integration.logoColor }}
                    >
                      {integration.logoLetter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[var(--foreground)]">
                          {integration.name}
                        </h3>
                        <span className="text-xs bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-0.5 rounded-full">
                          {integration.category}
                        </span>
                        {isConnected && (
                          <span className="flex items-center gap-1 text-xs text-green-700 font-semibold">
                            <Check size={11} />
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1 leading-relaxed">
                        {integration.description}
                      </p>
                      {isConnected && integration.connectedLabel && (
                        <p className="text-xs text-green-600 mt-1 font-mono">
                          {integration.connectedLabel}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleOtherToggle(integration.id)}
                      disabled={isConnecting_}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 ${
                        isConnected
                          ? 'border border-red-200 text-red-600 hover:bg-red-50'
                          : 'bg-[var(--primary)] text-white hover:opacity-90'
                      }`}
                    >
                      {isConnecting_ ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : isConnected ? (
                        <X size={12} />
                      ) : (
                        <Plug size={12} />
                      )}
                      {isConnecting_
                        ? 'Connecting...'
                        : isConnected
                          ? 'Disconnect'
                          : 'Connect'}
                    </button>
                    <a
                      href={integration.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      <ExternalLink size={11} />
                      Docs
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── API Keys ────────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="p-5 border-b border-[var(--border)]">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              API Keys
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
              Use these to build custom integrations with the InvoiceAI API.
            </p>
          </div>
          <div className="p-5 space-y-4">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Live API Key
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
                  <code className="text-sm text-[var(--foreground)] font-mono flex-1 truncate">
                    {showApiKey ? apiKey : `iai_live_sk_${'•'.repeat(24)}`}
                  </code>
                </div>
                <button
                  onClick={() => setShowApiKey((v) => !v)}
                  className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  onClick={() => copyText(apiKey, 'api')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    apiKeyCopied
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {apiKeyCopied ? <Check size={13} /> : <Copy size={13} />}
                  {apiKeyCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                Keep this secret. Do not share it in client-side code or public
                repositories.
              </p>
            </div>

            {/* Webhook */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Inbound Webhook URL
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
                  <code className="text-sm text-[var(--foreground)] font-mono flex-1 truncate">
                    {webhookUrl}
                  </code>
                </div>
                <button
                  onClick={() => copyText(webhookUrl, 'webhook')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    webhookCopied
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {webhookCopied ? <Check size={13} /> : <Copy size={13} />}
                  {webhookCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                Use this URL to receive payment events from Stripe or other
                providers.
              </p>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] text-[var(--foreground)] text-sm font-medium rounded-lg hover:bg-[var(--muted)] transition-colors">
              <RefreshCw size={13} />
              Regenerate API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
