// ModelOps Database Types

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';
export type ProjectFramework = 'pytorch' | 'tensorflow' | 'jax' | 'custom';
export type PipelineStatus = 'draft' | 'valid' | 'invalid';
export type NodeType = 'csv_loader' | 'image_loader' | 'hf_dataset' | 'data_split' | 'normalize' | 'augment' | 'custom_transform' | 'pytorch_train' | 'tensorflow_train' | 'evaluate' | 'export_model';
export type ExperimentStatus = 'draft' | 'queued' | 'running' | 'completed' | 'failed' | 'canceled';
export type RunStatus = 'queued' | 'provisioning' | 'running' | 'completed' | 'failed' | 'canceled' | 'paused';
export type ModelStatus = 'draft' | 'validated' | 'staging' | 'production' | 'retired';
export type ModelFormat = 'pytorch' | 'onnx' | 'safetensors' | 'tensorflow_savedmodel' | 'torchscript' | 'other';
export type GpuProvider = 'lambda_labs' | 'runpod' | 'modal' | 'local';
export type GpuInstanceStatus = 'provisioning' | 'running' | 'idle' | 'stopping' | 'terminated' | 'error';
export type MetricType = 'scalar' | 'image' | 'histogram' | 'text';
export type ArtifactType = 'checkpoint' | 'model_weights' | 'confusion_matrix' | 'plot' | 'evaluation_report' | 'sample_predictions' | 'log_file' | 'other';
export type DeploymentStatus = 'provisioning' | 'active' | 'stopped' | 'failed' | 'scaling';
export type SubscriptionTier = 'free' | 'pro' | 'team' | 'enterprise';

export interface Org {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  default_gpu_provider: GpuProvider;
  monthly_gpu_budget_usd: number | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  preferences: Record<string, unknown>;
  default_python_env: string | null;
  notification_settings: {
    training_complete: boolean;
    training_failed: boolean;
    cost_alert: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  invited_by: string | null;
  joined_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  framework: ProjectFramework;
  python_version: string;
  requirements_txt: string | null;
  local_path: string | null;
  git_repo_url: string | null;
  git_branch: string | null;
  tags: string[];
  experiment_count: number;
  model_count: number;
  total_gpu_cost_usd: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pipeline {
  id: string;
  project_id: string;
  org_id: string;
  name: string;
  description: string | null;
  status: PipelineStatus;
  pipeline_yaml: string | null;
  graph_data: Record<string, unknown>;
  template_name: string | null;
  validation_errors: Array<{ node_id: string; message: string }>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineNode {
  id: string;
  pipeline_id: string;
  org_id: string;
  node_type: NodeType;
  label: string;
  position_x: number;
  position_y: number;
  config: Record<string, unknown>;
  code: string | null;
  upstream_node_ids: string[];
  downstream_node_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface Experiment {
  id: string;
  project_id: string;
  org_id: string;
  pipeline_id: string | null;
  name: string;
  description: string | null;
  status: ExperimentStatus;
  tags: string[];
  notes: string | null;
  hyperparameters: Record<string, unknown>;
  final_metrics: Record<string, number>;
  code_snapshot: string | null;
  git_commit_sha: string | null;
  git_diff: string | null;
  python_packages: Array<{ name: string; version: string }>;
  environment: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Run {
  id: string;
  experiment_id: string;
  project_id: string;
  org_id: string;
  name: string | null;
  status: RunStatus;
  gpu_instance_id: string | null;
  gpu_type: string | null;
  gpu_provider: GpuProvider | null;
  hyperparameters: Record<string, unknown>;
  config: Record<string, unknown>;
  total_epochs: number | null;
  current_epoch: number;
  total_steps: number | null;
  current_step: number;
  best_metric_name: string | null;
  best_metric_value: number | null;
  training_throughput: { samples_per_sec?: number; batches_per_sec?: number };
  gpu_utilization: { gpu_pct?: number; memory_pct?: number; temp_c?: number };
  duration_seconds: number | null;
  cost_usd: number;
  error_message: string | null;
  checkpoint_path: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Metric {
  id: string;
  run_id: string;
  org_id: string;
  name: string;
  value: number;
  step: number;
  epoch: number | null;
  metric_type: MetricType;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Artifact {
  id: string;
  run_id: string;
  org_id: string;
  name: string;
  artifact_type: ArtifactType;
  storage_url: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  checksum: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Model {
  id: string;
  project_id: string;
  org_id: string;
  name: string;
  description: string | null;
  task_type: string | null;
  current_version_id: string | null;
  status: ModelStatus;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModelVersion {
  id: string;
  model_id: string;
  org_id: string;
  run_id: string | null;
  version: string;
  format: ModelFormat;
  storage_url: string;
  file_size_bytes: number | null;
  parameter_count: number | null;
  architecture: string | null;
  training_dataset: string | null;
  metrics: Record<string, number>;
  hyperparameters: Record<string, unknown>;
  model_card: Record<string, unknown>;
  status: ModelStatus;
  promoted_by: string | null;
  promoted_at: string | null;
  created_at: string;
}

export interface GpuInstance {
  id: string;
  org_id: string;
  provider: GpuProvider;
  instance_type: string;
  gpu_model: string;
  gpu_memory_gb: number | null;
  gpu_count: number;
  status: GpuInstanceStatus;
  provider_instance_id: string | null;
  hourly_cost_usd: number;
  total_cost_usd: number;
  is_spot: boolean;
  auto_shutdown: boolean;
  auto_shutdown_idle_minutes: number;
  current_run_id: string | null;
  ip_address: string | null;
  ssh_host: string | null;
  started_at: string | null;
  stopped_at: string | null;
  launched_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deployment {
  id: string;
  project_id: string;
  org_id: string;
  model_version_id: string;
  name: string;
  environment: string;
  status: DeploymentStatus;
  endpoint_url: string | null;
  min_replicas: number;
  max_replicas: number;
  target_latency_ms: number | null;
  traffic_split: Record<string, number>;
  request_count: number;
  avg_latency_ms: number | null;
  error_rate: number | null;
  deployed_by: string | null;
  deployed_at: string | null;
  stopped_at: string | null;
  created_at: string;
  updated_at: string;
}
