import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getSettings, getFacilities, getViolations, getInspections, getCorrectiveActions } from '@/lib/storage';
import { TabBar } from '@/components/layout/tab-bar';
import { DashboardView } from '@/components/views/dashboard-view';
import { InspectionsView } from '@/components/views/inspections-view';
import { ScannerView } from '@/components/views/scanner-view';
import { ReportsView } from '@/components/views/reports-view';
import { MoreView } from '@/components/views/more-view';

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

export function App() {
  const {
    currentTab,
    setTheme, setOrganizationName, setUserName, setUserRole,
    setFacilities, setViolations, setInspections, setCorrectiveActions,
  } = useAppStore();
  const showTabBar = currentTab !== 'scanner';

  useEffect(() => {
    // Load settings
    const s = getSettings();
    setTheme(s.theme);
    setOrganizationName(s.organizationName);
    setUserName(s.userName);
    setUserRole(s.userRole);

    // Apply theme
    if (s.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', s.theme);
    }

    // Load all data from localStorage
    const facilities = getFacilities();
    if (facilities.length > 0) setFacilities(facilities);

    const violations = getViolations();
    if (violations.length > 0) setViolations(violations);

    const inspections = getInspections();
    if (inspections.length > 0) setInspections(inspections);

    const actions = getCorrectiveActions();
    if (actions.length > 0) setCorrectiveActions(actions);
  }, [setTheme, setOrganizationName, setUserName, setUserRole, setFacilities, setViolations, setInspections, setCorrectiveActions]);

  return (
    <div className="flex h-screen flex-col bg-bg-root">
      <div className="flex-1 overflow-hidden">
        {renderTab(currentTab)}
      </div>
      {showTabBar && <TabBar />}
    </div>
  );
}
