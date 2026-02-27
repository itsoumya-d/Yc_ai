import { create } from 'zustand';

export interface Stop {
  id: string;
  jobId: string;
  orderIndex: number;
  customerName: string;
  address: string;
  serviceType: string;
  estimatedDuration: number; // minutes
  scheduledTime: string;
  status: 'pending' | 'en_route' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  latitude?: number;
  longitude?: number;
  startedAt?: string;
  completedAt?: string;
}

interface RouteStore {
  todayStops: Stop[];
  activeStopId: string | null;
  currentJobTimer: number; // seconds elapsed
  timerRunning: boolean;
  routeDate: string | null;
  setStops: (stops: Stop[]) => void;
  setActiveStop: (id: string | null) => void;
  updateStopStatus: (id: string, status: Stop['status'], timestamps?: { startedAt?: string; completedAt?: string }) => void;
  setTimerRunning: (running: boolean) => void;
  incrementTimer: () => void;
  resetTimer: () => void;
  setRouteDate: (date: string) => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
  todayStops: [],
  activeStopId: null,
  currentJobTimer: 0,
  timerRunning: false,
  routeDate: null,

  setStops: (stops) => set({ todayStops: stops }),

  setActiveStop: (id) =>
    set({ activeStopId: id, currentJobTimer: 0, timerRunning: false }),

  updateStopStatus: (id, status, timestamps) =>
    set((s) => ({
      todayStops: s.todayStops.map((stop) =>
        stop.id === id ? { ...stop, status, ...timestamps } : stop
      ),
    })),

  setTimerRunning: (running) => set({ timerRunning: running }),

  incrementTimer: () =>
    set((s) => ({ currentJobTimer: s.currentJobTimer + 1 })),

  resetTimer: () => set({ currentJobTimer: 0, timerRunning: false }),

  setRouteDate: (date) => set({ routeDate: date }),
}));

// Derived selectors
export function selectActiveStop(stops: Stop[], activeStopId: string | null): Stop | undefined {
  return stops.find((s) => s.id === activeStopId);
}

export function selectNextPendingStop(stops: Stop[]): Stop | undefined {
  return stops
    .filter((s) => s.status === 'pending' || s.status === 'en_route')
    .sort((a, b) => a.orderIndex - b.orderIndex)[0];
}

export function selectCompletedCount(stops: Stop[]): number {
  return stops.filter((s) => s.status === 'completed').length;
}

export function selectTotalEstimatedHours(stops: Stop[]): number {
  return stops.reduce((acc, s) => acc + s.estimatedDuration, 0) / 60;
}
