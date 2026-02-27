import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import {
  getSettings, getFacilities, getViolations, getInspections, getCorrectiveActions,
  saveFacility, saveViolation, saveInspection, saveCorrectiveAction,
} from '@/lib/storage';
import { TabBar } from '@/components/layout/tab-bar';
import { DashboardView } from '@/components/views/dashboard-view';
import { InspectionsView } from '@/components/views/inspections-view';
import { ScannerView } from '@/components/views/scanner-view';
import { ViolationsView } from '@/components/views/violations-view';
import { ReportsView } from '@/components/views/reports-view';
import { MoreView } from '@/components/views/more-view';
import type { Facility, Violation, Inspection, CorrectiveAction } from '@/types/database';

// Seed data shown on first launch
const SEED_FACILITIES: Facility[] = [
  { id: 'f1', name: 'Plant A', location: 'Detroit, MI', score: 85, violations_open: 3, last_inspection: '2 days ago' },
  { id: 'f2', name: 'Plant B', location: 'Cleveland, OH', score: 72, violations_open: 7, last_inspection: '1 week ago' },
  { id: 'f3', name: 'Warehouse C', location: 'Pittsburgh, PA', score: 92, violations_open: 1, last_inspection: 'Today' },
];

const SEED_VIOLATIONS: Violation[] = [
  { id: 'v1', title: 'Missing machine guard on lathe', severity: 'critical', regulation: '29 CFR 1910.212', location: 'Plant A — Machine Shop', status: 'pending', detected_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'v2', title: 'Electrical panel access blocked by equipment', severity: 'major', regulation: '29 CFR 1910.303', location: 'Plant A — Electrical Room', status: 'in-progress', detected_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'v3', title: 'Fire exit partially obstructed by pallets', severity: 'major', regulation: '29 CFR 1910.37', location: 'Plant B — South Wing', status: 'pending', detected_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'v4', title: 'Worker without safety glasses in mandatory zone', severity: 'major', regulation: '29 CFR 1910.133', location: 'Plant B — Assembly Line', status: 'overdue', detected_at: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: 'v5', title: 'Frayed extension cord in active use', severity: 'minor', regulation: '29 CFR 1910.305', location: 'Warehouse C — Bay 4', status: 'completed', detected_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'v6', title: 'Forklift operating with horn malfunction', severity: 'observation', regulation: '29 CFR 1910.178', location: 'Warehouse C — Loading Dock', status: 'in-progress', detected_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'v7', title: 'Chemical storage labels missing on 3 containers', severity: 'minor', regulation: '29 CFR 1910.1200', location: 'Plant A — Storage Room', status: 'pending', detected_at: new Date(Date.now() - 4 * 86400000).toISOString() },
];

const SEED_INSPECTIONS: Inspection[] = [
  { id: 'i1', facility: 'Plant A', type: 'General Safety Walk', status: 'completed', violations_found: 3, score: 85, date: new Date(Date.now() - 2 * 86400000).toISOString(), inspector: 'Sarah Mitchell' },
  { id: 'i2', facility: 'Plant B', type: 'Machine Guarding Audit', status: 'in-progress', violations_found: 7, score: 72, date: new Date(Date.now() - 7 * 86400000).toISOString(), inspector: 'James Carter' },
  { id: 'i3', facility: 'Warehouse C', type: 'Fire Safety Inspection', status: 'completed', violations_found: 1, score: 92, date: new Date().toISOString(), inspector: 'Sarah Mitchell' },
];

const SEED_ACTIONS: CorrectiveAction[] = [
  { id: 'a1', violation_title: 'Missing machine guard on lathe', severity: 'critical', assigned_to: 'James Carter', due_date: '2025-02-25', status: 'pending' },
  { id: 'a2', violation_title: 'Fire exit partially obstructed', severity: 'major', assigned_to: 'Lisa Park', due_date: '2025-02-22', status: 'overdue' },
  { id: 'a3', violation_title: 'Worker without safety glasses', severity: 'major', assigned_to: 'Tom Davis', due_date: '2025-02-28', status: 'in-progress' },
  { id: 'a4', violation_title: 'Electrical panel blocked', severity: 'major', assigned_to: 'Sarah Mitchell', due_date: '2025-03-01', status: 'in-progress' },
];

function renderTab(tab: string) {
  switch (tab) {
    case 'dashboard': return <DashboardView />;
    case 'inspections': return <InspectionsView />;
    case 'scanner': return <ScannerView />;
    case 'violations': return <ViolationsView />;
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
    const s = getSettings();
    setTheme(s.theme);
    setOrganizationName(s.organizationName);
    setUserName(s.userName);
    setUserRole(s.userRole);

    if (s.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', s.theme);
    }

    // Load from localStorage, seed if empty
    const storedFacilities = getFacilities();
    if (storedFacilities.length > 0) {
      setFacilities(storedFacilities);
    } else {
      setFacilities(SEED_FACILITIES);
      SEED_FACILITIES.forEach(saveFacility);
    }

    const storedViolations = getViolations();
    if (storedViolations.length > 0) {
      setViolations(storedViolations);
    } else {
      setViolations(SEED_VIOLATIONS);
      SEED_VIOLATIONS.forEach(saveViolation);
    }

    const storedInspections = getInspections();
    if (storedInspections.length > 0) {
      setInspections(storedInspections);
    } else {
      setInspections(SEED_INSPECTIONS);
      SEED_INSPECTIONS.forEach(saveInspection);
    }

    const storedActions = getCorrectiveActions();
    if (storedActions.length > 0) {
      setCorrectiveActions(storedActions);
    } else {
      setCorrectiveActions(SEED_ACTIONS);
      SEED_ACTIONS.forEach(saveCorrectiveAction);
    }
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
