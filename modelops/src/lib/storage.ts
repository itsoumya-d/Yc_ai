import type { Project, ProjectFramework } from '@/types/database';

// ── Settings ──

export interface ModelOpsSettings {
  theme: 'dark' | 'light' | 'system';
  defaultProjectDir: string;
  autoSaveInterval: number; // seconds, 0 = manual
  sendUsageData: boolean;
  // Cloud credentials (keys stored as masked placeholders — real implementation uses OS keychain)
  lambdaLabsKey: string;
  runpodKey: string;
  modalToken: string;
  huggingfaceToken: string;
  openaiApiKey: string;
  // S3/R2 Storage
  s3AccessKey: string;
  s3SecretKey: string;
  s3Bucket: string;
  s3Region: string;
  // Python
  defaultPythonEnv: string;
}

const DEFAULT_SETTINGS: ModelOpsSettings = {
  theme: 'dark',
  defaultProjectDir: '~/Projects/ml',
  autoSaveInterval: 30,
  sendUsageData: false,
  lambdaLabsKey: '',
  runpodKey: '',
  modalToken: '',
  huggingfaceToken: '',
  openaiApiKey: '',
  s3AccessKey: '',
  s3SecretKey: '',
  s3Bucket: 'modelops-artifacts',
  s3Region: 'us-east-1',
  defaultPythonEnv: 'System Python',
};

const SETTINGS_KEY = 'modelops_settings';
const PROJECTS_KEY = 'modelops_projects';

export function getSettings(): ModelOpsSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: Partial<ModelOpsSettings>): void {
  const current = getSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
}

// ── Projects ──

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function createNewProject(
  name: string,
  framework: ProjectFramework = 'pytorch',
  description: string | null = null,
  localPath: string | null = null,
): Project {
  return {
    id: generateId(),
    org_id: 'local',
    name,
    description,
    framework,
    python_version: '3.11',
    requirements_txt: null,
    local_path: localPath,
    git_repo_url: null,
    git_branch: 'main',
    tags: [],
    experiment_count: 0,
    model_count: 0,
    total_gpu_cost_usd: 0,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return '1 week ago';
  if (diffWeeks < 5) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return '1 month ago';
  return `${diffMonths} months ago`;
}
