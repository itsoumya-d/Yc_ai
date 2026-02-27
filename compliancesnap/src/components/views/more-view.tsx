import { useCallback, useState } from 'react';
import { cn, getStatusColor, getSeverityColor, getSeverityLabel } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { signOut } from '@/lib/auth';
import { updateUserProfile } from '@/lib/data-service';
import { saveSettings } from '@/lib/storage';
import {
  Settings, Users, Building2, BookOpen, ClipboardCheck,
  ChevronRight, User, Bell, Shield, HelpCircle, LogOut, Loader2,
} from 'lucide-react';

const menuItems = [
  { icon: ClipboardCheck, label: 'Corrective Actions', badgeKey: 'actions' as const },
  { icon: Building2, label: 'Facilities', badgeKey: 'facilities' as const },
  { icon: Users, label: 'Team', badgeKey: null },
  { icon: BookOpen, label: 'Regulations', badgeKey: null },
  { icon: Bell, label: 'Notifications', badgeKey: null },
  { icon: Settings, label: 'Settings', badgeKey: null },
  { icon: HelpCircle, label: 'Help & Support', badgeKey: null },
];

export function MoreView() {
  const { correctiveActions, facilities, userName, userRole, organizationName, theme, setTheme } = useAppStore();
  const { user } = useAuthStore();
  const [signingOut, setSigningOut] = useState(false);

  const activeActions = correctiveActions.filter((a) => a.status !== 'completed');

  const getBadge = (key: string | null): string => {
    if (key === 'actions') {
      const count = activeActions.length;
      return count > 0 ? String(count) : '';
    }
    if (key === 'facilities') {
      return facilities.length > 0 ? String(facilities.length) : '';
    }
    return '';
  };

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      // Even if sign-out fails, auth state listener will clear state
    } finally {
      setSigningOut(false);
    }
  }, []);

  const handleToggleTheme = useCallback(async () => {
    const next: 'dark' | 'light' | 'system' = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    setTheme(next);
    saveSettings({ theme: next });
    if (next === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', next);
    }
    if (user) {
      await updateUserProfile(user.id, { theme: next });
    }
  }, [theme, setTheme, user]);

  return (
    <div className="flex h-full flex-col">
      <div className="bg-bg-surface px-4 pb-4 pt-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-safety-yellow">
            <User className="h-6 w-6 text-text-inverse" />
          </div>
          <div className="flex-1">
            <div className="snap-heading text-base text-text-primary">{userName}</div>
            <div className="text-xs text-text-secondary">{userRole} {'\u2022'} {organizationName}</div>
            {user && <div className="text-[10px] text-text-secondary/60 mt-0.5">{user.email}</div>}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4 space-y-4">
        {/* Quick Actions */}
        <div className="rounded-xl bg-bg-card overflow-hidden">
          {menuItems.map((item, i) => {
            const badge = getBadge(item.badgeKey);
            return (
              <button
                key={item.label}
                onClick={item.label === 'Settings' ? handleToggleTheme : undefined}
                className={cn('flex w-full items-center justify-between px-4 py-3.5', i > 0 && 'border-t border-border-default')}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-text-secondary" />
                  <span className="text-sm text-text-primary">
                    {item.label}
                    {item.label === 'Settings' && (
                      <span className="ml-2 text-[10px] text-text-secondary">({theme})</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-severity-critical px-1.5 text-[10px] font-semibold text-white">
                      {badge}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-text-secondary" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Sign Out */}
        {user && (
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-bg-card p-4 text-severity-critical transition-colors active:bg-severity-critical-bg"
          >
            {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            <span className="text-sm font-medium">{signingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        )}

        {/* Corrective Actions Preview */}
        {activeActions.length > 0 && (
          <div>
            <h2 className="mb-2 snap-heading text-sm text-text-primary">Active Corrective Actions</h2>
            <div className="space-y-2">
              {activeActions.map((a) => (
                <div key={a.id} className="rounded-xl bg-bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-text-primary">{a.violation_title}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
                        <span>{a.assigned_to}</span>
                        <span>Due: {a.due_date}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn('rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase', getSeverityColor(a.severity))}>
                        {getSeverityLabel(a.severity)}
                      </span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', getStatusColor(a.status))}>
                        {a.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* App info */}
        <div className="rounded-xl bg-bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 text-safety-yellow" />
            <span className="snap-heading text-sm text-text-primary">ComplianceSnap</span>
          </div>
          <p className="mt-1 text-xs text-text-secondary">Version 1.0.0 {'\u2022'} AI Safety Inspector</p>
          {user && (
            <p className="mt-0.5 text-[10px] text-compliant">Syncing with cloud</p>
          )}
        </div>
      </div>
    </div>
  );
}
