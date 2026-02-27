import { create } from 'zustand';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';
export type IssuePriority = 'critical' | 'high' | 'medium' | 'low';
export type PhotoPhase = 'foundation' | 'framing' | 'mechanical' | 'drywall' | 'finishing' | 'other';

export interface SitePhoto {
  id: string;
  projectId: string;
  uri: string;
  caption: string;
  phase: PhotoPhase;
  location: string;
  timestamp: string;
  gpsTag?: string;
  issueId?: string;
}

export interface SiteIssue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  assignedTo: string;
  reportedBy: string;
  createdAt: string;
  dueDate?: string;
  photoId?: string;
  category: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  trade: string;
  checkedIn: boolean;
  checkInTime?: string;
}

export interface SiteProject {
  id: string;
  name: string;
  address: string;
  client: string;
  status: ProjectStatus;
  completionPct: number;
  startDate: string;
  expectedEnd: string;
  budget: number;
  spent: number;
  phase: PhotoPhase;
  superintendent: string;
  crew: CrewMember[];
  photos: SitePhoto[];
  issues: SiteIssue[];
  weatherToday: string;
  temperature: string;
}

export interface SiteStore {
  projects: SiteProject[];
  activeProjectId: string | null;
  setActiveProject: (id: string) => void;
  addPhoto: (projectId: string, photo: SitePhoto) => void;
  addIssue: (projectId: string, issue: SiteIssue) => void;
  updateIssueStatus: (projectId: string, issueId: string, status: IssueStatus) => void;
  toggleCrewCheckIn: (projectId: string, memberId: string) => void;
}

const CREW_MEMBERS: CrewMember[] = [
  { id: 'c1', name: 'Marcus Johnson', role: 'Lead Carpenter', trade: 'Carpentry', checkedIn: true, checkInTime: '7:02 AM' },
  { id: 'c2', name: 'Rosa Hernandez', role: 'Electrician', trade: 'Electrical', checkedIn: true, checkInTime: '7:15 AM' },
  { id: 'c3', name: 'Dave Park', role: 'Plumber', trade: 'Plumbing', checkedIn: true, checkInTime: '6:58 AM' },
  { id: 'c4', name: 'Tom Webb', role: 'HVAC Tech', trade: 'HVAC', checkedIn: false },
  { id: 'c5', name: 'Linda Smith', role: 'Drywaller', trade: 'Drywall', checkedIn: true, checkInTime: '7:30 AM' },
];

const DEMO_ISSUES: SiteIssue[] = [
  {
    id: 'i1', projectId: 'p1', title: 'Concrete crack in NE corner', description: 'Hairline crack observed in foundation slab, northeast corner of Unit 4A. Requires structural review.',
    priority: 'critical', status: 'open', assignedTo: 'Structural Engineer', reportedBy: 'Marcus Johnson',
    createdAt: 'Jan 23', dueDate: 'Jan 25', category: 'Structural',
  },
  {
    id: 'i2', projectId: 'p1', title: 'Electrical conduit misalignment', description: 'EMT conduit on 2nd floor corridor is 1.5" off spec — conflicts with HVAC duct routing.',
    priority: 'high', status: 'in_progress', assignedTo: 'Rosa Hernandez', reportedBy: 'Dave Park',
    createdAt: 'Jan 24', dueDate: 'Jan 27', category: 'Electrical',
  },
  {
    id: 'i3', projectId: 'p1', title: 'Drywall tape bubbling — Unit 3B', description: 'Tape joint in bathroom ceiling has moisture-related bubbling. Assess for water intrusion source.',
    priority: 'medium', status: 'open', assignedTo: 'Linda Smith', reportedBy: 'Linda Smith',
    createdAt: 'Jan 25', category: 'Drywall',
  },
  {
    id: 'i4', projectId: 'p1', title: 'Window header rough sill gap', description: 'Unit 5C master bedroom window: rough sill has 3/8" gap exceeding spec tolerance.',
    priority: 'low', status: 'resolved', assignedTo: 'Marcus Johnson', reportedBy: 'Marcus Johnson',
    createdAt: 'Jan 20', category: 'Carpentry',
  },
];

const DEMO_PHOTOS: SitePhoto[] = [
  { id: 'ph1', projectId: 'p1', uri: 'mock', caption: 'Foundation pour complete — Grid B4', phase: 'foundation', location: 'NE Corner', timestamp: 'Jan 20, 9:14 AM', gpsTag: '37.7749, -122.4194' },
  { id: 'ph2', projectId: 'p1', uri: 'mock', caption: 'Exterior framing 2nd floor progress', phase: 'framing', location: 'West Elevation', timestamp: 'Jan 22, 2:30 PM', gpsTag: '37.7749, -122.4194' },
  { id: 'ph3', projectId: 'p1', uri: 'mock', caption: 'MEP rough-in inspection — Unit 3', phase: 'mechanical', location: 'Unit 3B', timestamp: 'Jan 24, 11:00 AM', gpsTag: '37.7749, -122.4194' },
];

const DEMO_PROJECTS: SiteProject[] = [
  {
    id: 'p1', name: 'Oakridge Residences Phase 2', address: '1450 Oak Street, San Francisco CA',
    client: 'Meridian Development Group', status: 'active', completionPct: 42,
    startDate: 'Nov 15, 2024', expectedEnd: 'Aug 30, 2025',
    budget: 4200000, spent: 1890000, phase: 'mechanical',
    superintendent: 'Carlos Rivera',
    crew: CREW_MEMBERS, photos: DEMO_PHOTOS, issues: DEMO_ISSUES,
    weatherToday: 'Partly Cloudy', temperature: '62°F',
  },
  {
    id: 'p2', name: 'Harbor View Commercial Build', address: '200 Embarcadero, Oakland CA',
    client: 'Pacific Coast Properties', status: 'planning', completionPct: 8,
    startDate: 'Feb 1, 2025', expectedEnd: 'Dec 15, 2025',
    budget: 7800000, spent: 620000, phase: 'foundation',
    superintendent: 'Alex Kim',
    crew: [], photos: [], issues: [],
    weatherToday: 'Sunny', temperature: '68°F',
  },
  {
    id: 'p3', name: 'Sunset Hills Renovation', address: '890 Sunset Blvd, San Jose CA',
    client: 'Singh Family Trust', status: 'active', completionPct: 73,
    startDate: 'Sep 10, 2024', expectedEnd: 'Mar 15, 2025',
    budget: 850000, spent: 621000, phase: 'finishing',
    superintendent: 'Maria Torres',
    crew: [], photos: [], issues: [],
    weatherToday: 'Clear', temperature: '71°F',
  },
];

export const useSiteStore = create<SiteStore>(set => ({
  projects: DEMO_PROJECTS,
  activeProjectId: 'p1',
  setActiveProject: id => set({ activeProjectId: id }),
  addPhoto: (projectId, photo) => set(state => ({
    projects: state.projects.map(p =>
      p.id === projectId ? { ...p, photos: [...p.photos, photo] } : p
    ),
  })),
  addIssue: (projectId, issue) => set(state => ({
    projects: state.projects.map(p =>
      p.id === projectId ? { ...p, issues: [...p.issues, issue] } : p
    ),
  })),
  updateIssueStatus: (projectId, issueId, status) => set(state => ({
    projects: state.projects.map(p =>
      p.id === projectId ? {
        ...p,
        issues: p.issues.map(i => i.id === issueId ? { ...i, status } : i),
      } : p
    ),
  })),
  toggleCrewCheckIn: (projectId, memberId) => set(state => ({
    projects: state.projects.map(p =>
      p.id === projectId ? {
        ...p,
        crew: p.crew.map(m =>
          m.id === memberId ? {
            ...m,
            checkedIn: !m.checkedIn,
            checkInTime: !m.checkedIn ? new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : undefined,
          } : m
        ),
      } : p
    ),
  })),
}));
