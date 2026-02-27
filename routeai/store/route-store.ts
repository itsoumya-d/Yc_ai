import { create } from "zustand";

export interface Part {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface Job {
  id: string;
  stopNumber: number;
  customer: string;
  address: string;
  serviceType: string;
  status: "upcoming" | "current" | "completed" | "skipped";
  timeWindow: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  parts?: Part[];
  notes?: string;
  rating: number;
  earnings: number;
  lat: number;
  lng: number;
}

interface RouteStore {
  jobs: Job[];
  currentJobId: string | null;
  startJob: (id: string) => void;
  completeJob: (id: string, data: Partial<Job>) => void;
  skipJob: (id: string) => void;
  reorderJobs: (ids: string[]) => void;
}

const DEMO_JOBS: Job[] = [
  { id: "j1", stopNumber: 1, customer: "Margaret Sullivan", address: "2847 Oak Ridge Dr, Austin TX 78703", serviceType: "HVAC Maintenance", status: "completed", timeWindow: "7:00 AM - 9:00 AM", estimatedMinutes: 60, actualMinutes: 55, rating: 5, earnings: 95, lat: 30.2672, lng: -97.7431 },
  { id: "j2", stopNumber: 2, customer: "Robert Chen", address: "1492 Maple Street, Austin TX 78704", serviceType: "Electrical Inspection", status: "completed", timeWindow: "9:00 AM - 11:00 AM", estimatedMinutes: 90, actualMinutes: 85, rating: 4, earnings: 120, lat: 30.2512, lng: -97.7598 },
  { id: "j3", stopNumber: 3, customer: "Diana Flores", address: "558 Riverside Ave, Austin TX 78705", serviceType: "Plumbing Repair", status: "completed", timeWindow: "11:00 AM - 1:00 PM", estimatedMinutes: 75, actualMinutes: 80, rating: 5, earnings: 125, lat: 30.2748, lng: -97.7392 },
  { id: "j4", stopNumber: 4, customer: "James Whitmore", address: "3201 Lamar Blvd, Austin TX 78705", serviceType: "AC Filter Replacement", status: "current", timeWindow: "1:00 PM - 2:00 PM", estimatedMinutes: 30, rating: 0, earnings: 45, lat: 30.2891, lng: -97.7523 },
  { id: "j5", stopNumber: 5, customer: "Patricia Huang", address: "774 Congress Ave, Austin TX 78701", serviceType: "Water Heater Service", status: "upcoming", timeWindow: "2:00 PM - 4:00 PM", estimatedMinutes: 90, rating: 0, earnings: 140, lat: 30.2649, lng: -97.7404 },
  { id: "j6", stopNumber: 6, customer: "Thomas Bradley", address: "1135 South First St, Austin TX 78704", serviceType: "Furnace Tune-Up", status: "upcoming", timeWindow: "3:00 PM - 5:00 PM", estimatedMinutes: 60, rating: 0, earnings: 85, lat: 30.2556, lng: -97.7634 },
  { id: "j7", stopNumber: 7, customer: "Linda Okafor", address: "2900 E Cesar Chavez, Austin TX 78702", serviceType: "Duct Cleaning", status: "upcoming", timeWindow: "4:00 PM - 6:00 PM", estimatedMinutes: 120, rating: 0, earnings: 175, lat: 30.2603, lng: -97.7299 },
  { id: "j8", stopNumber: 8, customer: "Michael Torres", address: "4455 Airport Blvd, Austin TX 78751", serviceType: "HVAC Installation", status: "upcoming", timeWindow: "5:00 PM - 7:00 PM", estimatedMinutes: 150, rating: 0, earnings: 340, lat: 30.3076, lng: -97.7186 },
];

export const useRouteStore = create<RouteStore>((set) => ({
  jobs: DEMO_JOBS,
  currentJobId: "j4",

  startJob: (id) =>
    set((s) => ({
      jobs: s.jobs.map((j) =>
        j.id === id ? { ...j, status: "current" as const }
        : j.status === "current" ? { ...j, status: "upcoming" as const } : j
      ),
      currentJobId: id,
    })),

  completeJob: (id, data) =>
    set((s) => {
      const updated = s.jobs.map((j) =>
        j.id === id ? { ...j, ...data, status: "completed" as const } : j
      );
      const next = updated.find((j) => j.status === "upcoming");
      return {
        jobs: next ? updated.map((j) => j.id === next.id ? { ...j, status: "current" as const } : j) : updated,
        currentJobId: next ? next.id : null,
      };
    }),

  skipJob: (id) =>
    set((s) => ({
      jobs: s.jobs.map((j) => j.id === id ? { ...j, status: "skipped" as const } : j),
    })),

  reorderJobs: (ids) =>
    set((s) => {
      const map = new Map(s.jobs.map((j) => [j.id, j]));
      const reordered = ids
        .map((id, i) => { const j = map.get(id); return j ? { ...j, stopNumber: i + 1 } : null; })
        .filter(Boolean) as Job[];
      return { jobs: reordered };
    }),
}));
