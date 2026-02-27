import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import {
  getSettings,
  getFacilities as lsGetFacilities,
  getViolations as lsGetViolations,
  getInspections as lsGetInspections,
  getCorrectiveActions as lsGetActions,
} from '@/lib/storage';
import {
  fetchFacilities,
  fetchViolations,
  fetchInspections,
  fetchCorrectiveActions,
  fetchUserProfile,
} from '@/lib/data-service';
import { AuthScreen } from '@/components/auth/auth-screen';
import { TabBar } from '@/components/layout/tab-bar';
import { DashboardView } from '@/components/views/dashboard-view';
import { InspectionsView } from '@/components/views/inspections-view';
import { ScannerView } from '@/components/views/scanner-view';
import { ReportsView } from '@/components/views/reports-view';
import { MoreView } from '@/components/views/more-view';
import { Shield, Loader2 } from 'lucide-react';

function renderTab(tab: string) {
  switch (tab) {
    case 'dashboard': return <DashboardView />;
    case 'inspections': return <InspectionsView />;
    case 'scanner': return <ScannerView />;
    case 'reports': return <ReportsView />;
    case 'more': return <MoreView />;
    default: return <DashboardView />;
  }
}

function applyTheme(theme: 'dark' | 'light' | 'system') {
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function App() {
  const { user, loading: authLoading, setAuth } = useAuthStore();
  const {
    currentTab,
    setTheme, setOrganizationName, setUserName, setUserRole,
    setFacilities, setViolations, setInspections, setCorrectiveActions,
    setOnline,
  } = useAppStore();

  const showTabBar = currentTab !== 'scanner';

  // ── Auth listener ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session?.user ?? null, session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session?.user ?? null, session);
    });

    return () => subscription.unsubscribe();
  }, [setAuth]);

  // ── Online / offline listener ──────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  // ── Load data ──────────────────────────────────────────────────────
  const loadLocalSettings = useCallback(() => {
    const s = getSettings();
    setTheme(s.theme);
    setOrganizationName(s.organizationName);
    setUserName(s.userName);
    setUserRole(s.userRole);
    applyTheme(s.theme);
  }, [setTheme, setOrganizationName, setUserName, setUserRole]);

  const loadLocalData = useCallback(() => {
    const facilities = lsGetFacilities();
    if (facilities.length > 0) setFacilities(facilities);
    const violations = lsGetViolations();
    if (violations.length > 0) setViolations(violations);
    const inspections = lsGetInspections();
    if (inspections.length > 0) setInspections(inspections);
    const actions = lsGetActions();
    if (actions.length > 0) setCorrectiveActions(actions);
  }, [setFacilities, setViolations, setInspections, setCorrectiveActions]);

  const loadData = useCallback(async () => {
    if (user) {
      // Authenticated → fetch from Supabase (with localStorage fallback inside)
      const [facilities, violations, inspections, actions, profile] = await Promise.all([
        fetchFacilities(user.id),
        fetchViolations(user.id),
        fetchInspections(user.id),
        fetchCorrectiveActions(user.id),
        fetchUserProfile(user.id),
      ]);

      setFacilities(facilities);
      setViolations(violations);
      setInspections(inspections);
      setCorrectiveActions(actions);

      if (profile) {
        setOrganizationName(profile.organizationName || 'My Organization');
        setUserName(profile.fullName || user.email || '');
        setUserRole(profile.role || 'inspector');
        setTheme(profile.theme || 'dark');
        applyTheme(profile.theme || 'dark');
      } else {
        loadLocalSettings();
      }
    } else {
      loadLocalSettings();
      loadLocalData();
    }
  }, [user, setFacilities, setViolations, setInspections, setCorrectiveActions, setOrganizationName, setUserName, setUserRole, setTheme, loadLocalSettings, loadLocalData]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);

  // ── Loading splash ─────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-bg-root">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-safety-yellow shadow-lg">
          <Shield className="h-8 w-8 text-text-inverse" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  // ── Auth gate ──────────────────────────────────────────────────────
  if (!user) {
    return <AuthScreen />;
  }

  // ── Main app ───────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col bg-bg-root">
      <div className="flex-1 overflow-hidden">
        {renderTab(currentTab)}
      </div>
      {showTabBar && <TabBar />}
    </div>
  );
}
