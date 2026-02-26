import { create } from 'zustand';

export type Trade = 'electrical' | 'plumbing' | 'hvac' | 'carpentry' | 'general';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'flagged';

export interface TaskStep {
  id: string;
  instruction: string;
  requiresPhoto: boolean;
  photoUri?: string;
  completed: boolean;
  aiNote?: string;
}

export interface FieldTask {
  id: string;
  title: string;
  trade: Trade;
  difficulty: 1 | 2 | 3; // 1=easy, 2=medium, 3=hard
  estimatedMinutes: number;
  status: TaskStatus;
  steps: TaskStep[];
  aiScore?: number;
  aiFindings?: string;
  completedAt?: string;
  tags: string[];
}

export interface AiCapture {
  id: string;
  taskId: string;
  photoUri: string;
  timestamp: string;
  trade: Trade;
  findings: string;
  score: number; // 0-100 quality score
  issues: string[];
  recommendation: string;
}

interface FieldLensStore {
  tasks: FieldTask[];
  captures: AiCapture[];
  streak: number;
  selectedTrade: Trade | 'all';
  setSelectedTrade: (t: Trade | 'all') => void;
  completeStep: (taskId: string, stepId: string) => void;
  completeTask: (taskId: string, score: number) => void;
  addCapture: (capture: AiCapture) => void;
}

const DEMO_TASKS: FieldTask[] = [
  {
    id: 't1',
    title: 'GFCI Outlet Installation',
    trade: 'electrical',
    difficulty: 2,
    estimatedMinutes: 25,
    status: 'in_progress',
    tags: ['outlets', 'safety', 'kitchen'],
    steps: [
      { id: 's1', instruction: 'Turn off circuit breaker and verify with voltage tester', requiresPhoto: false, completed: true },
      { id: 's2', instruction: 'Remove old outlet and take photo of current wiring', requiresPhoto: true, completed: true, photoUri: 'demo_wiring.jpg' },
      { id: 's3', instruction: 'Connect LINE terminals (black to brass, white to silver)', requiresPhoto: false, completed: false },
      { id: 's4', instruction: 'Connect ground wire to green screw', requiresPhoto: false, completed: false },
      { id: 's5', instruction: 'Test GFCI function with test button', requiresPhoto: true, completed: false },
    ],
  },
  {
    id: 't2',
    title: 'P-Trap Replacement',
    trade: 'plumbing',
    difficulty: 1,
    estimatedMinutes: 15,
    status: 'pending',
    tags: ['sink', 'drain', 'under-cabinet'],
    steps: [
      { id: 's1', instruction: 'Place bucket under P-trap and photograph leak source', requiresPhoto: true, completed: false },
      { id: 's2', instruction: 'Unscrew slip nuts on both sides of P-trap', requiresPhoto: false, completed: false },
      { id: 's3', instruction: 'Install new P-trap with slip nuts hand-tight first', requiresPhoto: false, completed: false },
      { id: 's4', instruction: 'Tighten 1/4 turn with pliers and test for leaks', requiresPhoto: true, completed: false },
    ],
  },
  {
    id: 't3',
    title: 'Air Filter Replacement (HVAC)',
    trade: 'hvac',
    difficulty: 1,
    estimatedMinutes: 10,
    status: 'completed',
    aiScore: 96,
    aiFindings: 'Excellent installation. Filter properly seated with airflow arrow aligned correctly.',
    completedAt: '2h ago',
    tags: ['maintenance', 'filter', 'air-quality'],
    steps: [
      { id: 's1', instruction: 'Locate air handler and note filter size', requiresPhoto: true, completed: true },
      { id: 's2', instruction: 'Remove old filter and photograph for condition report', requiresPhoto: true, completed: true },
      { id: 's3', instruction: 'Install new MERV-13 filter with arrow pointing toward blower', requiresPhoto: true, completed: true },
    ],
  },
  {
    id: 't4',
    title: 'Door Frame Repair',
    trade: 'carpentry',
    difficulty: 2,
    estimatedMinutes: 40,
    status: 'pending',
    tags: ['door', 'frame', 'wood', 'repair'],
    steps: [
      { id: 's1', instruction: 'Photograph damaged area and measure extent of rot', requiresPhoto: true, completed: false },
      { id: 's2', instruction: 'Remove damaged wood with chisel and wood saw', requiresPhoto: false, completed: false },
      { id: 's3', instruction: 'Apply wood epoxy filler and shape to match profile', requiresPhoto: false, completed: false },
      { id: 's4', instruction: 'Sand when cured and photograph finished repair', requiresPhoto: true, completed: false },
    ],
  },
  {
    id: 't5',
    title: 'Condensate Drain Cleaning',
    trade: 'hvac',
    difficulty: 1,
    estimatedMinutes: 20,
    status: 'flagged',
    aiFindings: 'Significant algae buildup detected. Secondary drain pan has water — suggests primary drain blocked.',
    tags: ['hvac', 'drain', 'maintenance', 'algae'],
    steps: [
      { id: 's1', instruction: 'Photograph drain pan and measure standing water depth', requiresPhoto: true, completed: true },
      { id: 's2', instruction: 'Flush with 1 cup bleach solution', requiresPhoto: false, completed: false },
      { id: 's3', instruction: 'Use wet vac on exterior drain port', requiresPhoto: false, completed: false },
      { id: 's4', instruction: 'Verify flow and photograph clear drain', requiresPhoto: true, completed: false },
    ],
  },
];

const DEMO_CAPTURES: AiCapture[] = [
  {
    id: 'c1',
    taskId: 't3',
    photoUri: 'demo_filter.jpg',
    timestamp: '2h ago',
    trade: 'hvac',
    findings: 'Old filter extremely clogged (MERV rating degraded). New filter correctly installed with proper airflow direction.',
    score: 96,
    issues: [],
    recommendation: 'Schedule next filter replacement in 3 months based on usage patterns.',
  },
];

export const useFieldLensStore = create<FieldLensStore>((set) => ({
  tasks: DEMO_TASKS,
  captures: DEMO_CAPTURES,
  streak: 7,
  selectedTrade: 'all',

  setSelectedTrade: (t) => set({ selectedTrade: t }),

  completeStep: (taskId, stepId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, steps: t.steps.map((s) => s.id === stepId ? { ...s, completed: true } : s) }
          : t
      ),
    })),

  completeTask: (taskId, score) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'completed' as const, aiScore: score, completedAt: 'just now' } : t
      ),
    })),

  addCapture: (capture) =>
    set((state) => ({ captures: [capture, ...state.captures] })),
}));
