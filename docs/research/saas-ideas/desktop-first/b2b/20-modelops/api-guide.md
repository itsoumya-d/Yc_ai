# API Guide -- ModelOps

## API Integration Overview

ModelOps integrates with multiple external APIs for GPU provisioning, model storage, experiment interoperability, and code management. This guide covers each integration with pricing, authentication, code snippets, and cost projections.

| API | Purpose | Required | Free Tier |
|-----|---------|----------|-----------|
| Lambda Labs | GPU cloud instances | At least one GPU provider | No |
| RunPod | GPU cloud instances (alternative) | At least one GPU provider | No |
| Modal | Serverless GPU functions | Optional | $30/mo credits |
| AWS S3 / Cloudflare R2 | Model artifact storage | Yes | R2: 10GB free |
| Weights & Biases | Experiment tracking export/import | Optional | 100GB free |
| Hugging Face Hub | Model sharing, dataset access | Optional | Free |
| Docker | Container management | Yes (for cloud training) | Free |
| GitHub | Code versioning, CI integration | Optional | Free |

---

## 1. Lambda Labs Cloud API

### Purpose
Provision dedicated GPU cloud instances for ML training. Lambda Labs provides bare-metal GPU servers with pre-installed CUDA, PyTorch, and other ML frameworks.

### Pricing

| GPU | VRAM | Price/Hour | Best For |
|-----|------|------------|----------|
| A100 40GB | 40 GB | $1.10/hr | Standard training, fine-tuning |
| A100 80GB | 80 GB | $1.40/hr | Large model training, big batch sizes |
| H100 80GB | 80 GB | $2.49/hr | Fastest training, large language models |
| A10 24GB | 24 GB | $0.60/hr | Smaller models, inference testing |
| 8x A100 40GB | 320 GB | $8.80/hr | Distributed training, very large models |
| 8x H100 80GB | 640 GB | $19.92/hr | Maximum scale training |

*Prices as of early 2025. Check lambda.cloud for current pricing.*

### Authentication

1. Create account at cloud.lambdalabs.com
2. Navigate to API Keys in dashboard
3. Generate API key
4. In ModelOps: Settings > Cloud Credentials > Lambda Labs > paste API key
5. Key is stored in OS keychain (macOS Keychain / Windows Credential Manager)

### Code Snippets

**List available instances:**
```typescript
// Electron main process
const response = await fetch('https://cloud.lambdalabs.com/api/v1/instance-types', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
const { data } = await response.json();
// Returns: { "gpu_1x_a100": { price_cents_per_hour: 110, ... }, ... }
```

**Launch instance:**
```typescript
const response = await fetch('https://cloud.lambdalabs.com/api/v1/instance-operations/launch', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    region_name: 'us-east-1',
    instance_type_name: 'gpu_1x_a100',
    ssh_key_names: ['modelops-key'],
    name: `modelops-exp-${experimentId}`
  })
});
```

**Terminate instance:**
```typescript
const response = await fetch('https://cloud.lambdalabs.com/api/v1/instance-operations/terminate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    instance_ids: [instanceId]
  })
});
```

### Cost Projection (ModelOps Usage)

| Scenario | Monthly GPU Hours | Monthly Cost |
|----------|-------------------|--------------|
| Solo researcher (light) | 20 hrs A100 | ~$22 |
| Solo researcher (heavy) | 100 hrs A100 | ~$110 |
| Small team (5 engineers) | 500 hrs mixed | ~$400 |
| Large team (15 engineers) | 2,000 hrs mixed | ~$1,800 |

### Alternatives
- **RunPod:** Lower prices on some GPU types, spot instance support
- **Modal:** Serverless (pay per second, no idle cost), better for short jobs
- **Google Cloud (Vertex AI):** Enterprise-grade, but complex pricing and vendor lock-in
- **AWS SageMaker:** Deep AWS integration, but expensive and complex

---

## 2. RunPod API

### Purpose
Alternative GPU cloud provider with competitive pricing, spot instances for cost savings, and serverless GPU functions. RunPod offers a wider variety of GPU types including consumer GPUs (RTX 4090) at lower price points.

### Pricing

| GPU | VRAM | On-Demand/Hour | Spot/Hour | Best For |
|-----|------|----------------|-----------|----------|
| RTX 4090 | 24 GB | $0.44/hr | $0.34/hr | Budget training, inference |
| A40 | 48 GB | $0.79/hr | $0.59/hr | Mid-range training |
| A100 80GB | 80 GB | $1.64/hr | $1.24/hr | Standard large training |
| H100 80GB | 80 GB | $2.69/hr | $1.99/hr | Fastest training |
| RTX A6000 | 48 GB | $0.79/hr | $0.59/hr | Professional workstation GPU |

*Spot instances can be preempted. ModelOps auto-checkpoints before preemption.*

### Authentication

1. Create account at runpod.io
2. Navigate to Settings > API Keys
3. Generate API key with "GPU Cloud" permission
4. In ModelOps: Settings > Cloud Credentials > RunPod > paste API key

### Code Snippets

**Create GPU pod:**
```typescript
const response = await fetch('https://api.runpod.io/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    query: `
      mutation {
        podFindAndDeployOnDemand(
          input: {
            name: "modelops-exp-${experimentId}"
            imageName: "modelops/pytorch:2.2-cuda12.1"
            gpuTypeId: "NVIDIA A100 80GB"
            gpuCount: 1
            volumeInGb: 50
            containerDiskInGb: 20
            dockerArgs: "${trainingCommand}"
          }
        ) {
          id
          gpuCount
          costPerHr
          machine { gpuDisplayName }
        }
      }
    `
  })
});
```

**Get pod status:**
```typescript
const response = await fetch('https://api.runpod.io/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    query: `
      query {
        pod(input: { podId: "${podId}" }) {
          id
          desiredStatus
          runtime { uptimeInSeconds gpus { gpuUtilPercent memoryUtilPercent } }
          costPerHr
        }
      }
    `
  })
});
```

**Terminate pod:**
```typescript
const response = await fetch('https://api.runpod.io/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    query: `mutation { podTerminate(input: { podId: "${podId}" }) }`
  })
});
```

### Cost Projection

| Scenario | GPU Choice | Monthly Hours | Monthly Cost |
|----------|-----------|---------------|--------------|
| Budget training | RTX 4090 spot | 50 hrs | ~$17 |
| Standard training | A100 spot | 100 hrs | ~$124 |
| Heavy training | H100 on-demand | 200 hrs | ~$538 |
| Team (mixed) | Mixed spot | 500 hrs | ~$350 |

### Alternatives
- **Lambda Labs:** Simpler API, but fewer GPU options
- **Vast.ai:** Community GPU marketplace, cheapest prices but less reliability
- **CoreWeave:** Enterprise-grade Kubernetes-based GPU cloud

---

## 3. Modal

### Purpose
Serverless GPU functions -- run training code on GPU without managing instances. Pay per second of actual GPU usage with zero idle cost. Ideal for short training jobs, hyperparameter sweeps, and burst workloads.

### Pricing

| GPU | Price/Second | Price/Hour Equiv. | Best For |
|-----|-------------|-------------------|----------|
| T4 | $0.000164/sec | $0.59/hr | Inference, small training |
| A10G | $0.000306/sec | $1.10/hr | Mid-range training |
| A100 40GB | $0.001036/sec | $3.73/hr | Standard training |
| A100 80GB | $0.001400/sec | $5.04/hr | Large model training |
| H100 | $0.002222/sec | $8.00/hr | Maximum performance |

*Per-second billing means no cost during data loading, checkpointing, or idle time.*

### Authentication

1. Install Modal CLI: `pip install modal`
2. Run `modal token new` to authenticate
3. Modal stores token in `~/.modal/token`
4. In ModelOps: Settings > Cloud Credentials > Modal > auto-detect token or paste manually

### Code Snippets

ModelOps generates Modal Python scripts for serverless GPU execution:

**Training function wrapper:**
```python
# Generated by ModelOps for serverless GPU training
import modal

app = modal.App("modelops-training")
image = modal.Image.debian_slim().pip_install(
    "torch==2.2.0",
    "torchvision",
    "modelops-sdk"
)

@app.function(
    gpu=modal.gpu.A100(count=1, size="80GB"),
    timeout=3600,  # 1 hour max
    image=image,
    volumes={"/data": modal.Volume.from_name("training-data")}
)
def train(config: dict):
    import torch
    from modelops import log_metric, save_model

    # User's training code is injected here
    model = build_model(config)
    for epoch in range(config["epochs"]):
        loss = train_epoch(model, dataloader)
        log_metric("loss", loss, step=epoch)

    save_model(model, f"v{config['version']}")
    return {"final_loss": loss}
```

**Launch from ModelOps (Node.js):**
```typescript
// ModelOps calls Modal via Python subprocess
const child = spawn('python', ['-m', 'modal', 'run', scriptPath], {
  env: { ...process.env, MODAL_TOKEN_ID: tokenId, MODAL_TOKEN_SECRET: tokenSecret }
});

child.stdout.on('data', (data) => {
  // Parse training logs and metrics from stdout
  const logLine = data.toString();
  websocket.send(JSON.stringify({ type: 'log', content: logLine }));
});
```

### Cost Projection

| Scenario | Actual GPU Seconds/Month | Monthly Cost |
|----------|-------------------------|--------------|
| Hyperparameter sweep (100 trials, 5 min each) | 30,000 sec A10G | ~$9 |
| Fine-tuning (10 runs, 30 min each) | 18,000 sec A100 | ~$19 |
| Large training (5 runs, 4 hrs each) | 72,000 sec A100 | ~$75 |
| Team burst (500 short jobs) | 150,000 sec mixed | ~$120 |

### Alternatives
- **Lambda Labs / RunPod:** Dedicated instances, better for long-running jobs
- **AWS Lambda:** Not GPU-capable, not suitable for ML training
- **Google Cloud Functions:** Limited GPU support, complex setup

---

## 4. AWS S3 / Cloudflare R2

### Purpose
Object storage for model artifacts (weights, checkpoints, evaluation reports), dataset snapshots, and training logs. R2 is the recommended default due to zero egress fees.

### Pricing Comparison

| Feature | AWS S3 (Standard) | Cloudflare R2 |
|---------|-------------------|---------------|
| Storage | $0.023/GB/mo | $0.015/GB/mo |
| PUT requests | $0.005/1,000 | $0.0045/1,000 |
| GET requests | $0.0004/1,000 | $0.0036/1,000 |
| Egress | $0.09/GB | **Free** |
| Free tier | 5 GB storage | 10 GB storage |

**Recommendation:** Use Cloudflare R2 as default. Model files are downloaded frequently (to local machine for testing, to deployment servers). Zero egress fees save significant cost at scale.

### Authentication

**AWS S3:**
1. Create IAM user in AWS Console with S3 permissions
2. Generate Access Key ID and Secret Access Key
3. In ModelOps: Settings > Storage > S3 > enter credentials, bucket name, region

**Cloudflare R2:**
1. Create R2 bucket in Cloudflare dashboard
2. Generate API token with R2 read/write permissions
3. In ModelOps: Settings > Storage > R2 > enter Account ID, Access Key, Secret Key, bucket name

### Code Snippets

**Upload model artifact (S3-compatible, works for both S3 and R2):**
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';

const s3 = new S3Client({
  region: 'auto',  // 'auto' for R2, specific region for S3
  endpoint: r2Endpoint,  // 'https://<account>.r2.cloudflarestorage.com' for R2
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  }
});

async function uploadModel(modelPath: string, modelId: string, version: string) {
  const key = `${teamId}/models/${modelId}/${version}/model.pt`;

  await s3.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: createReadStream(modelPath),
    ContentType: 'application/octet-stream',
    Metadata: {
      'x-modelops-experiment': experimentId,
      'x-modelops-framework': 'pytorch'
    }
  }));

  return `s3://${bucketName}/${key}`;
}
```

**Download model (with progress):**
```typescript
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

async function downloadModel(key: string, destPath: string, onProgress: (pct: number) => void) {
  const response = await s3.send(new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  }));

  const totalBytes = response.ContentLength || 0;
  let downloadedBytes = 0;

  const body = response.Body as NodeJS.ReadableStream;
  body.on('data', (chunk: Buffer) => {
    downloadedBytes += chunk.length;
    onProgress(Math.round((downloadedBytes / totalBytes) * 100));
  });

  await pipeline(body, createWriteStream(destPath));
}
```

**Multipart upload for large models (>100MB):**
```typescript
import { Upload } from '@aws-sdk/lib-storage';

async function uploadLargeModel(modelPath: string, key: string, onProgress: (pct: number) => void) {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: createReadStream(modelPath)
    },
    partSize: 64 * 1024 * 1024,  // 64MB parts
    queueSize: 4  // parallel uploads
  });

  upload.on('httpUploadProgress', (progress) => {
    if (progress.loaded && progress.total) {
      onProgress(Math.round((progress.loaded / progress.total) * 100));
    }
  });

  await upload.done();
}
```

### Cost Projection

| Scenario | Storage | Uploads/mo | Downloads/mo | S3 Cost | R2 Cost |
|----------|---------|------------|--------------|---------|---------|
| Solo (10 models) | 5 GB | 100 | 500 | ~$2.20 | ~$0.08 |
| Small team | 50 GB | 1,000 | 5,000 | ~$6.50 | ~$0.75 |
| Large team | 500 GB | 10,000 | 50,000 | ~$60 | ~$7.55 |
| Enterprise | 5 TB | 100,000 | 500,000 | ~$570 | ~$76 |

*R2's free egress is the major differentiator at scale.*

### Alternatives
- **Google Cloud Storage:** Good GCP integration, similar pricing to S3
- **Azure Blob Storage:** Good Azure integration, competitive pricing
- **MinIO:** Self-hosted S3-compatible storage (for on-premise Enterprise deployments)
- **Backblaze B2:** Cheapest storage ($0.006/GB), S3-compatible, but limited features

---

## 5. Weights & Biases API

### Purpose
Interoperability with the most popular experiment tracking platform. ModelOps can import existing W&B experiments and export ModelOps experiments to W&B for users transitioning between tools or using both.

### Pricing

| Tier | Price | Limits |
|------|-------|--------|
| **Free** | $0 | 100 GB storage, unlimited experiments, personal use |
| **Team** | $50/seat/mo | Unlimited storage, team features, access controls |
| **Enterprise** | Custom | SSO, audit logs, on-premise option |

### Authentication

1. Create account at wandb.ai
2. Navigate to Settings > API Keys
3. Copy API key
4. In ModelOps: Settings > Integrations > Weights & Biases > paste API key

### Code Snippets

**Import experiments from W&B:**
```typescript
// Fetch W&B runs and convert to ModelOps experiment format
async function importFromWandB(projectName: string, apiKey: string) {
  const response = await fetch('https://api.wandb.ai/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      query: `{
        project(name: "${projectName}", entityName: "${entity}") {
          runs(first: 100) {
            edges {
              node {
                id
                name
                state
                config
                summaryMetrics
                createdAt
                heartbeatAt
                history(samples: 500)
              }
            }
          }
        }
      }`
    })
  });

  const { data } = await response.json();
  const runs = data.project.runs.edges.map(e => e.node);

  // Convert to ModelOps experiment format
  return runs.map(run => ({
    name: run.name,
    status: mapWandbState(run.state),
    hyperparameters: JSON.parse(run.config),
    metrics: JSON.parse(run.summaryMetrics),
    history: JSON.parse(run.history),
    created_at: run.createdAt
  }));
}
```

**Export ModelOps experiment to W&B:**
```python
# Generated Python script for W&B export
import wandb

def export_to_wandb(experiment_data: dict):
    wandb.init(
        project=experiment_data["project"],
        name=experiment_data["name"],
        config=experiment_data["hyperparameters"]
    )

    for step, metrics in enumerate(experiment_data["history"]):
        wandb.log(metrics, step=step)

    wandb.finish()
```

### Alternatives
- **MLflow:** Open-source, self-hosted experiment tracking
- **Neptune.ai:** Similar SaaS experiment tracking ($49/mo)
- **Comet ML:** Experiment tracking with model management ($99/mo)
- **ModelOps native tracking:** Built-in experiment tracking (no external dependency needed)

---

## 6. Hugging Face Hub API

### Purpose
Access pre-trained models and datasets from the Hugging Face Hub. Users can download models for fine-tuning, access datasets for training, and publish trained models back to the Hub.

### Pricing

| Feature | Free | Pro ($9/mo) |
|---------|------|-------------|
| Model downloads | Unlimited | Unlimited |
| Dataset access | Unlimited | Unlimited |
| Private models | Limited | Unlimited |
| Inference API | Rate limited | Higher limits |
| Storage | 100 GB | 1 TB |

### Authentication

1. Create account at huggingface.co
2. Navigate to Settings > Access Tokens
3. Generate token with "Read" permission (or "Write" for publishing)
4. In ModelOps: Settings > Integrations > Hugging Face > paste token

### Code Snippets

**List datasets:**
```typescript
async function searchDatasets(query: string, token: string) {
  const response = await fetch(
    `https://huggingface.co/api/datasets?search=${encodeURIComponent(query)}&limit=20`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const datasets = await response.json();
  return datasets.map(d => ({
    id: d.id,
    description: d.description,
    downloads: d.downloads,
    tags: d.tags
  }));
}
```

**Download model for fine-tuning:**
```python
# Generated by ModelOps pipeline node
from huggingface_hub import snapshot_download

model_path = snapshot_download(
    repo_id="bert-base-uncased",
    cache_dir="/project/.cache/models",
    token=hf_token
)
```

**Publish trained model:**
```python
from huggingface_hub import HfApi

api = HfApi(token=hf_token)
api.upload_folder(
    folder_path="./trained_model",
    repo_id=f"{username}/my-finetuned-bert",
    repo_type="model",
    commit_message=f"Trained with ModelOps exp-{experiment_id}"
)
```

### Alternatives
- **PyTorch Hub:** PyTorch-specific model hub (limited selection)
- **TensorFlow Hub:** TensorFlow-specific model hub
- **Model Zoo:** ONNX model collection
- **Papers with Code:** Model benchmarks and links (not a hub, but a discovery tool)

---

## 7. Docker API

### Purpose
Build and manage Docker containers for reproducible training environments. Every cloud training run in ModelOps executes inside a Docker container to ensure consistency.

### Pricing

| Feature | Docker Desktop | Docker Engine |
|---------|---------------|---------------|
| Cost | Free (personal) / $5/mo (Pro) | Free (open source) |
| Platform | macOS, Windows | Linux (cloud GPU instances) |
| GPU Support | Limited | Full (nvidia-container-toolkit) |

### Authentication

Docker runs locally -- no API key required. ModelOps communicates with the Docker daemon via the Docker socket.

### Code Snippets

**Build training image (via dockerode):**
```typescript
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function buildTrainingImage(projectPath: string, experimentId: string) {
  // Generate Dockerfile
  const dockerfile = `
FROM modelops/pytorch:2.2-cuda12.1
WORKDIR /training
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "train.py"]
  `;

  // Write Dockerfile to project
  await writeFile(`${projectPath}/Dockerfile`, dockerfile);

  // Build image
  const stream = await docker.buildImage({
    context: projectPath,
    src: ['Dockerfile', 'requirements.txt', 'train.py', 'config.yaml']
  }, {
    t: `modelops/training:${experimentId}`,
    buildargs: { EXPERIMENT_ID: experimentId }
  });

  // Stream build logs to UI
  await new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err, output) => {
      if (err) reject(err);
      else resolve(output);
    }, (event) => {
      websocket.send(JSON.stringify({ type: 'docker_build', log: event.stream }));
    });
  });
}
```

**Push image to registry:**
```typescript
async function pushImage(imageTag: string, registryAuth: object) {
  const image = docker.getImage(imageTag);
  const stream = await image.push({ authconfig: registryAuth });

  await new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err, output) => {
      if (err) reject(err);
      else resolve(output);
    });
  });
}
```

### Alternatives
- **Podman:** Docker-compatible, rootless container engine
- **Singularity/Apptainer:** HPC-focused container runtime (common in academic clusters)
- **Nix:** Reproducible builds without containers (emerging in ML community)

---

## 8. GitHub API

### Purpose
Code versioning for training scripts, CI/CD integration for automated retraining pipelines, and issue tracking for experiment-related bugs.

### Pricing

| Feature | Free | Team ($4/seat/mo) | Enterprise ($21/seat/mo) |
|---------|------|-------------------|--------------------------|
| Public repos | Unlimited | Unlimited | Unlimited |
| Private repos | Unlimited | Unlimited | Unlimited |
| Actions minutes | 2,000/mo | 3,000/mo | 50,000/mo |
| Storage | 500 MB | 2 GB | 50 GB |

### Authentication

1. In GitHub: Settings > Developer Settings > Personal Access Tokens > Generate new token
2. Permissions needed: `repo` (full access) + `actions` (CI/CD)
3. In ModelOps: Settings > Integrations > GitHub > paste token

### Code Snippets

**Snapshot training code at experiment start:**
```typescript
import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: githubToken });

async function createExperimentSnapshot(experimentId: string) {
  // Get current commit SHA
  const { data: ref } = await octokit.rest.git.getRef({
    owner, repo,
    ref: 'heads/main'
  });

  // Create lightweight tag for experiment
  await octokit.rest.git.createRef({
    owner, repo,
    ref: `refs/tags/experiment/${experimentId}`,
    sha: ref.object.sha
  });

  return ref.object.sha;
}
```

**Trigger retraining via GitHub Actions:**
```typescript
async function triggerRetraining(pipelineId: string, config: object) {
  await octokit.rest.actions.createWorkflowDispatch({
    owner, repo,
    workflow_id: 'retrain.yml',
    ref: 'main',
    inputs: {
      pipeline_id: pipelineId,
      config: JSON.stringify(config),
      triggered_by: 'modelops-auto'
    }
  });
}
```

**GitHub Actions workflow (generated by ModelOps):**
```yaml
# .github/workflows/retrain.yml
name: ModelOps Retraining
on:
  workflow_dispatch:
    inputs:
      pipeline_id:
        description: 'Pipeline ID to execute'
        required: true
      config:
        description: 'Training configuration JSON'
        required: true

jobs:
  train:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run training
        env:
          MODELOPS_API_KEY: ${{ secrets.MODELOPS_API_KEY }}
          PIPELINE_ID: ${{ inputs.pipeline_id }}
          CONFIG: ${{ inputs.config }}
        run: python -m modelops.run --pipeline $PIPELINE_ID --config "$CONFIG"
```

### Alternatives
- **GitLab:** Self-hosted option, built-in CI/CD, ML experiment tracking features
- **Bitbucket:** Atlassian integration, Pipelines CI/CD
- **Azure DevOps:** Enterprise Git + CI/CD + project management

---

## Cost Summary by Usage Profile

### Solo ML Engineer (Free/Pro Tier)

| Service | Monthly Usage | Monthly Cost |
|---------|---------------|--------------|
| Lambda Labs (A100) | 40 hrs | $44.00 |
| Cloudflare R2 | 10 GB storage | $0.15 |
| Hugging Face | Free tier | $0.00 |
| Docker | Free (personal) | $0.00 |
| GitHub | Free tier | $0.00 |
| **Total Infrastructure** | | **~$44** |
| ModelOps Pro | 1 seat | $39.00 |
| **Total** | | **~$83/mo** |

### Small ML Team (5 engineers, Team Tier)

| Service | Monthly Usage | Monthly Cost |
|---------|---------------|--------------|
| Lambda + RunPod (mixed) | 300 hrs | $270.00 |
| Cloudflare R2 | 100 GB storage | $1.50 |
| Weights & Biases | Free tier | $0.00 |
| Hugging Face | Free tier | $0.00 |
| Docker | Free | $0.00 |
| GitHub Team | 5 seats | $20.00 |
| **Total Infrastructure** | | **~$292** |
| ModelOps Team | 5 seats | $395.00 |
| **Total** | | **~$687/mo** |

### Enterprise ML Team (20 engineers)

| Service | Monthly Usage | Monthly Cost |
|---------|---------------|--------------|
| Multi-cloud GPU | 2,000 hrs | $1,600.00 |
| Cloudflare R2 | 1 TB storage | $15.00 |
| Weights & Biases Team | 20 seats | $1,000.00 |
| Hugging Face Pro | 5 accounts | $45.00 |
| GitHub Enterprise | 20 seats | $420.00 |
| **Total Infrastructure** | | **~$3,080** |
| ModelOps Enterprise | 20 seats | $2,980.00 |
| **Total** | | **~$6,060/mo** |

---

## API Rate Limits and Error Handling

| API | Rate Limit | ModelOps Handling |
|-----|-----------|-------------------|
| Lambda Labs | 100 req/min | Request queue with backoff |
| RunPod | 200 req/min (GraphQL) | Request batching |
| Modal | No explicit limit (function-based) | Concurrent function limits |
| S3/R2 | 5,500 GET/sec, 3,500 PUT/sec | Multipart for large files |
| W&B | 200 req/min | Batch metric uploads |
| HuggingFace | 1,000 req/hr (free), higher (pro) | Caching for model info |
| Docker | Local (no limit) | N/A |
| GitHub | 5,000 req/hr (authenticated) | Conditional requests (ETag) |

### Error Handling Strategy

1. **Transient errors (5xx, timeouts):** Retry with exponential backoff (1s, 2s, 4s, max 30s), up to 5 retries
2. **Rate limiting (429):** Respect Retry-After header, queue subsequent requests
3. **Auth errors (401/403):** Prompt user to re-enter credentials, clear cached token
4. **Not found (404):** Show user-friendly error ("GPU instance not found, it may have been terminated")
5. **Validation errors (400):** Parse error message, show specific field-level errors in UI
6. **Network errors:** Detect offline state, queue operations, sync when reconnected
