'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Check,
  Copy,
  Trash2,
  Plug,
  Globe,
  KeyRound,
  Upload,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  getSsoConfig,
  saveSsoConfig,
  verifyDomain,
  testSsoConnection,
  deleteSsoConfig,
  type SsoConfig,
  type SaveSsoConfigInput,
} from '@/lib/actions/sso';

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

type SsoStatus = 'active' | 'inactive' | 'pending';

function getStatus(config: SsoConfig | null): SsoStatus {
  if (!config) return 'inactive';
  if (config.is_active && config.domain_verified) return 'active';
  if (config.is_active && !config.domain_verified) return 'pending';
  return 'inactive';
}

const STATUS_STYLES: Record<SsoStatus, { bg: string; text: string; icon: typeof ShieldCheck; label: string }> = {
  active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: ShieldCheck, label: 'Active' },
  pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: Clock, label: 'Pending Verification' },
  inactive: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: ShieldAlert, label: 'Inactive' },
};

function StatusBadge({ status }: { status: SsoStatus }) {
  const s = STATUS_STYLES[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <Icon className="h-3.5 w-3.5" />
      {s.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Toggle switch component
// ---------------------------------------------------------------------------

function Toggle({
  checked,
  onChange,
  disabled,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-4 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 ${
          checked ? 'bg-gold-500' : 'bg-gray-300 dark:bg-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          } mt-0.5`}
        />
      </button>
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      </div>
      {children}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function SsoSettingsPage() {
  const { toast } = useToast();

  // Remote state
  const [config, setConfig] = useState<SsoConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [enabled, setEnabled] = useState(false);
  const [providerType, setProviderType] = useState<'saml' | 'oidc'>('saml');
  const [requireSso, setRequireSso] = useState(false);

  // SAML fields
  const [samlMetadataUrl, setSamlMetadataUrl] = useState('');
  const [samlEntityId, setSamlEntityId] = useState('');
  const [samlSsoUrl, setSamlSsoUrl] = useState('');
  const [samlCertificate, setSamlCertificate] = useState('');

  // OIDC fields
  const [oidcDiscoveryUrl, setOidcDiscoveryUrl] = useState('');
  const [oidcIssuer, setOidcIssuer] = useState('');
  const [oidcAuthEndpoint, setOidcAuthEndpoint] = useState('');
  const [oidcTokenEndpoint, setOidcTokenEndpoint] = useState('');
  const [oidcClientId, setOidcClientId] = useState('');
  const [oidcClientSecret, setOidcClientSecret] = useState('');

  // Domain
  const [domain, setDomain] = useState('');

  // Action states
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; details?: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // SAML manual mode toggle
  const [samlManualMode, setSamlManualMode] = useState(false);

  // OIDC manual mode toggle
  const [oidcManualMode, setOidcManualMode] = useState(false);

  // ---------------------------------------------------------------------------
  // Load config
  // ---------------------------------------------------------------------------

  const loadConfig = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getSsoConfig();
    if (error) {
      // If it's an admin access error, show it; otherwise just means no config yet
      if (!error.includes('admin')) {
        // Config doesn't exist yet — that's fine
      } else {
        toast({ title: 'Access denied', description: error, variant: 'destructive' });
      }
    }
    if (data) {
      setConfig(data);
      setEnabled(data.is_active);
      setProviderType(data.provider_type);
      setRequireSso(data.require_sso);
      setDomain(data.domain || '');
      // SAML
      setSamlMetadataUrl(data.saml_metadata_url || '');
      setSamlEntityId(data.saml_entity_id || '');
      setSamlSsoUrl(data.saml_sso_url || '');
      setSamlCertificate(data.saml_certificate || '');
      setSamlManualMode(!data.saml_metadata_url && !!(data.saml_entity_id || data.saml_sso_url));
      // OIDC
      setOidcDiscoveryUrl(data.oidc_discovery_url || '');
      setOidcIssuer(data.oidc_issuer || '');
      setOidcAuthEndpoint(data.oidc_auth_endpoint || '');
      setOidcTokenEndpoint(data.oidc_token_endpoint || '');
      setOidcClientId(data.oidc_client_id || '');
      setOidcClientSecret(''); // Never show encrypted secret
      setOidcManualMode(!data.oidc_discovery_url && !!(data.oidc_issuer || data.oidc_auth_endpoint));
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------

  const handleSave = async () => {
    setSaving(true);
    setTestResult(null);

    const input: SaveSsoConfigInput = {
      provider_type: providerType,
      is_active: enabled,
      require_sso: requireSso,
      domain: domain || undefined,
    };

    if (providerType === 'saml') {
      if (samlManualMode) {
        input.saml_entity_id = samlEntityId;
        input.saml_sso_url = samlSsoUrl;
        input.saml_certificate = samlCertificate;
      } else {
        input.saml_metadata_url = samlMetadataUrl;
      }
    } else {
      if (oidcManualMode) {
        input.oidc_issuer = oidcIssuer;
        input.oidc_auth_endpoint = oidcAuthEndpoint;
        input.oidc_token_endpoint = oidcTokenEndpoint;
      } else {
        input.oidc_discovery_url = oidcDiscoveryUrl;
      }
      input.oidc_client_id = oidcClientId;
      if (oidcClientSecret) {
        input.oidc_client_secret = oidcClientSecret;
      }
    }

    const { data, error } = await saveSsoConfig(input);
    setSaving(false);

    if (error) {
      toast({ title: 'Failed to save SSO configuration', description: error, variant: 'destructive' });
      return;
    }

    if (data) setConfig(data);
    toast({ title: 'SSO configuration saved', variant: 'success' });
  };

  // ---------------------------------------------------------------------------
  // Test connection
  // ---------------------------------------------------------------------------

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    const result = await testSsoConnection();
    setTesting(false);
    setTestResult({ success: result.success, details: result.details || result.error || undefined });

    if (result.success) {
      toast({ title: 'Connection test passed', description: result.details, variant: 'success' });
    } else {
      toast({ title: 'Connection test failed', description: result.error || 'Unknown error', variant: 'destructive' });
    }
  };

  // ---------------------------------------------------------------------------
  // Verify domain
  // ---------------------------------------------------------------------------

  const handleVerifyDomain = async () => {
    if (!domain.trim()) {
      toast({ title: 'Enter a domain first', variant: 'destructive' });
      return;
    }
    setVerifying(true);

    const result = await verifyDomain(domain.trim());
    setVerifying(false);

    if (result.verified) {
      toast({ title: 'Domain verified successfully', variant: 'success' });
      setConfig((prev) => prev ? { ...prev, domain_verified: true } : prev);
    } else {
      toast({
        title: 'Domain verification failed',
        description: result.error || 'TXT record not found',
        variant: 'destructive',
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await deleteSsoConfig();
    setDeleting(false);

    if (error) {
      toast({ title: 'Failed to remove SSO configuration', description: error, variant: 'destructive' });
      return;
    }

    setConfig(null);
    setEnabled(false);
    setProviderType('saml');
    setRequireSso(false);
    setDomain('');
    setSamlMetadataUrl('');
    setSamlEntityId('');
    setSamlSsoUrl('');
    setSamlCertificate('');
    setOidcDiscoveryUrl('');
    setOidcIssuer('');
    setOidcAuthEndpoint('');
    setOidcTokenEndpoint('');
    setOidcClientId('');
    setOidcClientSecret('');
    setTestResult(null);
    setShowDeleteConfirm(false);
    toast({ title: 'SSO configuration removed' });
  };

  // ---------------------------------------------------------------------------
  // Copy to clipboard
  // ---------------------------------------------------------------------------

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  // ---------------------------------------------------------------------------
  // Certificate file upload
  // ---------------------------------------------------------------------------

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024) {
      toast({ title: 'Certificate file must be under 50KB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSamlCertificate(reader.result as string);
    };
    reader.readAsText(file);
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const status = getStatus(config);
  const verificationToken = config?.domain_verification_token || '';

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-navy-800 dark:text-gold-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Single Sign-On (SSO)
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1 ml-10">
            Configure SAML 2.0 or OIDC for your organization. Requires a Business plan.
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Enable SSO toggle */}
      <Section title="SSO Status">
        <Toggle
          checked={enabled}
          onChange={setEnabled}
          label="Enable SSO for this organization"
          description="When enabled, members can sign in using your identity provider."
        />
      </Section>

      <AnimatePresence mode="wait">
        {enabled && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Provider type */}
            <Section title="Identity Provider" description="Select your SSO protocol.">
              <div className="grid grid-cols-2 gap-3">
                {(['saml', 'oidc'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setProviderType(type)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                      providerType === type
                        ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        providerType === type
                          ? 'bg-gold-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {type === 'saml' ? <Shield className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {type === 'saml' ? 'SAML 2.0' : 'OpenID Connect'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {type === 'saml' ? 'Okta, OneLogin, ADFS' : 'Azure AD, Auth0, Google'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Section>

            {/* SAML configuration */}
            {providerType === 'saml' && (
              <Section
                title="SAML 2.0 Configuration"
                description="Enter your IdP metadata URL, or configure manually."
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setSamlManualMode(false)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        !samlManualMode
                          ? 'bg-navy-800 text-white dark:bg-gold-500 dark:text-navy-900'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Metadata URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setSamlManualMode(true)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        samlManualMode
                          ? 'bg-navy-800 text-white dark:bg-gold-500 dark:text-navy-900'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Manual Configuration
                    </button>
                  </div>

                  {!samlManualMode ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        IdP Metadata URL
                      </label>
                      <Input
                        value={samlMetadataUrl}
                        onChange={(e) => setSamlMetadataUrl(e.target.value)}
                        placeholder="https://idp.example.com/metadata.xml"
                        type="url"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Your identity provider should provide this URL. It auto-configures Entity ID, SSO URL, and certificate.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Entity ID (Issuer)
                        </label>
                        <Input
                          value={samlEntityId}
                          onChange={(e) => setSamlEntityId(e.target.value)}
                          placeholder="https://idp.example.com/entity"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          SSO URL (Login Endpoint)
                        </label>
                        <Input
                          value={samlSsoUrl}
                          onChange={(e) => setSamlSsoUrl(e.target.value)}
                          placeholder="https://idp.example.com/sso/saml"
                          type="url"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          X.509 Certificate
                        </label>
                        <div className="space-y-2">
                          <textarea
                            value={samlCertificate}
                            onChange={(e) => setSamlCertificate(e.target.value)}
                            placeholder="-----BEGIN CERTIFICATE-----&#10;MIIDp...&#10;-----END CERTIFICATE-----"
                            rows={4}
                            className="flex w-full rounded-lg border border-[var(--input)] bg-background px-3 py-2 text-sm text-foreground font-mono placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1 transition-colors duration-200"
                          />
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                              <Upload className="h-3.5 w-3.5" />
                              Upload .pem / .crt
                              <input
                                type="file"
                                accept=".pem,.crt,.cer,.cert"
                                onChange={handleCertUpload}
                                className="hidden"
                              />
                            </label>
                            {samlCertificate && (
                              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Certificate loaded
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* SP Info (read-only for IdP config) */}
                  <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">
                      <Info className="h-4 w-4" />
                      Service Provider Details (for your IdP)
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-blue-600 dark:text-blue-400">ACS URL:</span>
                        <code className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded font-mono">
                          {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/saml/callback` : '/api/auth/saml/callback'}
                        </code>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-blue-600 dark:text-blue-400">Entity ID:</span>
                        <code className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded font-mono">
                          {typeof window !== 'undefined' ? window.location.origin : 'https://boardbrief.app'}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* OIDC configuration */}
            {providerType === 'oidc' && (
              <Section
                title="OpenID Connect Configuration"
                description="Enter your OIDC discovery URL, or configure manually."
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setOidcManualMode(false)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        !oidcManualMode
                          ? 'bg-navy-800 text-white dark:bg-gold-500 dark:text-navy-900'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Discovery URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setOidcManualMode(true)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        oidcManualMode
                          ? 'bg-navy-800 text-white dark:bg-gold-500 dark:text-navy-900'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Manual Configuration
                    </button>
                  </div>

                  {!oidcManualMode ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Discovery URL
                      </label>
                      <Input
                        value={oidcDiscoveryUrl}
                        onChange={(e) => setOidcDiscoveryUrl(e.target.value)}
                        placeholder="https://login.microsoftonline.com/{tenant}/.well-known/openid-configuration"
                        type="url"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Also known as the well-known endpoint. Auto-discovers issuer, authorization, and token endpoints.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Issuer URL
                        </label>
                        <Input
                          value={oidcIssuer}
                          onChange={(e) => setOidcIssuer(e.target.value)}
                          placeholder="https://login.microsoftonline.com/{tenant}/v2.0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Authorization Endpoint
                        </label>
                        <Input
                          value={oidcAuthEndpoint}
                          onChange={(e) => setOidcAuthEndpoint(e.target.value)}
                          placeholder="https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize"
                          type="url"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Token Endpoint
                        </label>
                        <Input
                          value={oidcTokenEndpoint}
                          onChange={(e) => setOidcTokenEndpoint(e.target.value)}
                          placeholder="https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
                          type="url"
                        />
                      </div>
                    </>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Client Credentials
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Client ID
                        </label>
                        <Input
                          value={oidcClientId}
                          onChange={(e) => setOidcClientId(e.target.value)}
                          placeholder="your-client-id"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Client Secret
                        </label>
                        <Input
                          value={oidcClientSecret}
                          onChange={(e) => setOidcClientSecret(e.target.value)}
                          placeholder={config?.oidc_client_secret_encrypted ? '********** (encrypted, enter new value to update)' : 'your-client-secret'}
                          type="password"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Encrypted at rest. Leave blank to keep the existing value.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Redirect URI info */}
                  <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">
                      <Info className="h-4 w-4" />
                      Redirect URI (for your IdP)
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <code className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded font-mono flex-1 truncate">
                        {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/oidc/callback` : '/api/auth/oidc/callback'}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`${window.location.origin}/api/auth/oidc/callback`)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* Domain verification */}
            <Section
              title="Domain Verification"
              description="Verify your email domain to enable SSO login for all users with this domain."
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Organization Domain
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="example.com"
                    />
                    <Button
                      onClick={handleVerifyDomain}
                      disabled={verifying || !domain.trim()}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4" />
                          Verify
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Domain verification status */}
                {config?.domain_verified ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Domain verified: {config.domain}
                    </span>
                  </div>
                ) : verificationToken ? (
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      Add this DNS TXT record to verify domain ownership
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 p-2 bg-amber-100 dark:bg-amber-800/40 rounded-lg">
                        <div className="text-xs">
                          <div className="text-amber-600 dark:text-amber-400 font-medium mb-0.5">Type: TXT</div>
                          <div className="text-amber-600 dark:text-amber-400 font-medium mb-0.5">Host: @</div>
                          <code className="font-mono text-amber-800 dark:text-amber-200 break-all">
                            _boardbrief-verify={verificationToken}
                          </code>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`_boardbrief-verify=${verificationToken}`)}
                          className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 p-1.5 flex-shrink-0"
                          title="Copy TXT record value"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        DNS changes can take up to 48 hours to propagate. Click Verify once the record is live.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <Info className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Save your configuration to generate a domain verification token.
                    </span>
                  </div>
                )}
              </div>
            </Section>

            {/* Require SSO */}
            <Section
              title="Enforcement"
              description="Control how members authenticate."
            >
              <Toggle
                checked={requireSso}
                onChange={setRequireSso}
                disabled={!config?.domain_verified}
                label="Require SSO for all users"
                description={
                  config?.domain_verified
                    ? 'When enabled, all users with your verified domain must sign in through your identity provider. Password login will be disabled for them.'
                    : 'You must verify your domain before enabling SSO enforcement.'
                }
              />
              {requireSso && !config?.domain_verified && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Enforcement requires a verified domain.
                </div>
              )}
            </Section>

            {/* Test connection */}
            {config && (
              <Section title="Connection Test" description="Validate that your IdP is reachable and correctly configured.">
                <div className="space-y-3">
                  <Button
                    onClick={handleTest}
                    disabled={testing}
                    variant="outline"
                    className="gap-2"
                  >
                    {testing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Plug className="h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>

                  <AnimatePresence>
                    {testResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            testResult.success
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          }`}
                        >
                          {testResult.success ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="text-sm">
                            <p
                              className={`font-medium ${
                                testResult.success
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-red-700 dark:text-red-300'
                              }`}
                            >
                              {testResult.success ? 'Connection successful' : 'Connection failed'}
                            </p>
                            {testResult.details && (
                              <p
                                className={`mt-1 ${
                                  testResult.success
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}
                              >
                                {testResult.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Section>
            )}

            {/* Danger zone */}
            {config && (
              <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-red-700 dark:text-red-400">Remove SSO Configuration</h3>
                    <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                      This will permanently delete your SSO configuration and revert all users to password authentication.
                    </p>
                  </div>
                  {!showDeleteConfirm ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="whitespace-nowrap"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save button — always visible when enabled */}
      {enabled && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-gray-200 dark:border-gray-700 py-4 -mx-6 px-6 flex items-center justify-end gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gold-500 text-navy-900 hover:bg-gold-400 min-w-[140px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
