# Skills -- ModelOps

## Skills Overview

Building ModelOps requires a rare intersection of desktop application engineering, machine learning infrastructure expertise, developer tool UX design, and B2B go-to-market knowledge. This document maps every skill required, its importance, and recommended learning paths.

---

## Technical Skills

### 1. Electron Desktop Development

**Importance:** Critical -- the entire application is an Electron desktop app
**Required Level:** Expert

| Skill | Detail |
|-------|--------|
| Electron main process | Node.js runtime for system operations: file system access, process spawning, OS integration |
| Electron renderer process | Chromium-based UI rendering with React |
| IPC (Inter-Process Communication) | Secure communication between main and renderer via contextBridge and preload scripts |
| Context isolation | Secure separation between web content and Node.js APIs |
| Native menus and dialogs | OS-native file pickers, context menus, notification center integration |
| Auto-updater | electron-updater for distributing updates via GitHub Releases or custom server |
| Code signing | macOS notarization (Apple Developer account), Windows Authenticode signing |
| Crash reporting | Electron crashReporter integration for error telemetry |
| Performance optimization | Reducing memory footprint, startup time, IPC overhead |
| Multi-window management | Detachable panels (training monitor, notebook) as separate Electron windows |

**Key Challenges:**
- Memory management: ML tools display large datasets and real-time charts, Electron apps can become memory-heavy
- Startup time: Cold start must be under 3 seconds to feel native
- Process management: Spawning and managing Python subprocesses from Node.js requires careful lifecycle management
- Security: Preload scripts and context isolation must be implemented correctly to prevent code injection

### 2. React and Frontend Architecture

**Importance:** Critical -- all UI is built with React
**Required Level:** Expert

| Skill | Detail |
|-------|--------|
| React 18+ features | Concurrent rendering, Suspense boundaries, useTransition for non-blocking updates |
| State management (Zustand) | Global UI state: selected project, active tab, pipeline editor state, theme |
| Server state (TanStack Query) | Supabase data fetching with caching, optimistic updates, background refetching |
| Component architecture | Compound components, render props, composition patterns for IDE-style layouts |
| Performance optimization | React.memo, useMemo, useCallback, virtualized lists for large experiment tables |
| Custom hooks | useExperiment, usePipeline, useGPUStatus, useTrainingLogs, useWebSocket |
| Error boundaries | Graceful error handling per panel (pipeline crash should not kill experiment view) |
| Code splitting | Lazy-load heavy components (notebook renderer, chart library) for faster startup |

### 3. React Flow (Visual Pipeline Editor)

**Importance:** Critical -- core differentiating feature
**Required Level:** Expert

| Skill | Detail |
|-------|--------|
| Custom node components | Building colored, typed pipeline nodes with input/output ports |
| Custom edge rendering | Animated edges with data type labels, deletion handles |
| Node/edge validation | Type checking between connected ports (DataFrame port to DataFrame input) |
| Graph serialization | Converting React Flow state to/from YAML for pipeline persistence |
| Minimap and controls | Navigation aids for large pipelines |
| Drag and drop | Dragging nodes from palette onto canvas with proper positioning |
| Viewport management | Pan, zoom, fit-to-view, centering on specific nodes |
| Performance at scale | Handling 100+ node pipelines with smooth rendering (virtualization) |
| Undo/redo system | Command pattern for pipeline edit history |
| Subflows/groups | Grouping nodes into reusable pipeline fragments |

### 4. Python Subprocess Management

**Importance:** Critical -- all ML execution depends on Python
**Required Level:** Advanced

| Skill | Detail |
|-------|--------|
| child_process.spawn | Launching Python scripts from Node.js with stdout/stderr streaming |
| Process lifecycle | Graceful shutdown (SIGTERM), forced kill (SIGKILL), checkpoint save on termination |
| Environment detection | Finding Python installations (system, pyenv, conda, venv) on macOS/Windows/Linux |
| Virtual environment management | Creating, activating, installing packages in isolated Python environments |
| Dependency resolution | Parsing requirements.txt, pyproject.toml, conda environment.yml |
| Stream parsing | Real-time parsing of training logs from stdout for metric extraction |
| Error handling | Detecting Python crashes, import errors, CUDA out-of-memory errors from stderr |
| Cross-platform | Handling path differences (Windows backslashes, macOS .app bundles) |

### 5. Jupyter Kernel Protocol (ZMQ)

**Importance:** High -- enables integrated notebooks
**Required Level:** Advanced

| Skill | Detail |
|-------|--------|
| ZeroMQ (ZMQ) messaging | Understanding the Jupyter wire protocol over ZMQ sockets |
| Kernel management | Starting, stopping, restarting, and interrupting IPython kernels |
| Shell channel | Sending execute_request messages and handling execute_reply |
| IOPub channel | Receiving stream outputs, display_data, execute_result |
| Stdin channel | Handling input_request for interactive Python input() calls |
| Rich output rendering | Displaying HTML, images, LaTeX, widgets from kernel outputs |
| Tab completion | Sending complete_request for code auto-completion |
| Kernel introspection | Variable inspection, object info requests for hover documentation |
| Multi-kernel support | Managing multiple kernels for different notebooks/pipelines |

### 6. Docker API

**Importance:** High -- reproducible training environments
**Required Level:** Intermediate-Advanced

| Skill | Detail |
|-------|--------|
| Docker SDK (dockerode for Node.js) | Programmatic container management from Electron main process |
| Dockerfile construction | Building ML training images with CUDA, Python, framework dependencies |
| Image layer optimization | Multi-stage builds, caching pip installs, minimizing image size |
| Container lifecycle | Create, start, attach (logs), stop, remove containers |
| Volume management | Mounting local data directories into training containers |
| Registry operations | Push/pull images to Docker Hub or private registries |
| GPU passthrough | NVIDIA Container Toolkit (nvidia-docker) for GPU access inside containers |
| Resource limits | Setting CPU, memory, and GPU memory limits per training container |

### 7. GPU Cloud APIs

**Importance:** Critical -- core value proposition
**Required Level:** Advanced

| Skill | Detail |
|-------|--------|
| Lambda Labs Cloud API | REST API for provisioning GPU instances (A100, H100) |
| RunPod API | REST API for on-demand and spot GPU instances |
| Modal Python SDK | Serverless GPU function execution (per-second billing) |
| SSH tunneling | Establishing SSH connections to remote GPU instances for log streaming |
| WebSocket real-time streaming | Streaming training logs from cloud GPU to desktop IDE |
| Cost calculation | Real-time cost tracking based on instance type, duration, and provider pricing |
| Multi-provider orchestration | Fallback logic when primary provider is unavailable |
| Spot instance management | Handling preemption, automatic checkpointing, job migration |

### 8. WebSocket for Real-Time Training Logs

**Importance:** High -- live training monitoring
**Required Level:** Intermediate

| Skill | Detail |
|-------|--------|
| WebSocket protocol | Bidirectional communication between cloud GPU and desktop IDE |
| Connection management | Auto-reconnect with exponential backoff on disconnection |
| Message framing | Structured log messages (timestamp, level, content, metrics) |
| Buffering and replay | Buffer messages during disconnection, replay on reconnect |
| Heartbeat mechanism | Keep-alive pings to detect dead connections |
| Multiplexing | Multiple training runs streaming to a single WebSocket connection |
| Backpressure handling | Flow control when logs arrive faster than UI can render |

### 9. S3-Compatible Object Storage

**Importance:** High -- model artifact storage
**Required Level:** Intermediate

| Skill | Detail |
|-------|--------|
| AWS SDK v3 (JavaScript) | S3 client operations from Electron main process |
| Multipart upload | Uploading large model files (multi-GB) with progress tracking and resume |
| Presigned URLs | Generating temporary download URLs for model artifacts |
| Lifecycle policies | Automatic cleanup of old checkpoints, retention for production models |
| Cross-region replication | Multi-region storage for global teams |
| R2 compatibility | Using Cloudflare R2 with S3-compatible API (zero egress fees) |
| Encryption | Server-side encryption (SSE-S3, SSE-KMS) for model artifacts |

---

## Machine Learning Domain Skills

### 10. ML Pipeline Architecture

**Importance:** Critical -- must understand what users are building
**Required Level:** Advanced

| Skill | Detail |
|-------|--------|
| Data preprocessing | Normalization, encoding, imputation, feature scaling, text tokenization |
| Feature engineering | Feature selection, dimensionality reduction, feature crosses, embeddings |
| Training loops | Batch iteration, loss computation, backpropagation, optimizer steps |
| Evaluation methodology | Train/val/test splits, cross-validation, stratification, leakage prevention |
| Metrics | Accuracy, precision, recall, F1, AUC-ROC, MSE, BLEU, perplexity (per task type) |
| Overfitting detection | Comparing train vs val curves, early stopping, regularization |
| Data augmentation | Image transforms (flip, rotate, crop, color jitter), text augmentation, mixup |

### 11. Deep Learning Frameworks

**Importance:** Critical -- must integrate with user code
**Required Level:** Advanced

| Skill | Detail |
|-------|--------|
| PyTorch | nn.Module, DataLoader, Optimizer, loss functions, training loop patterns, TorchScript |
| TensorFlow/Keras | Model API, tf.data pipelines, callbacks, SavedModel format |
| JAX | Functional paradigm, jit compilation, vmap, pmap for parallelism |
| Hugging Face Transformers | Pre-trained models, tokenizers, Trainer API, model hub integration |
| ONNX | Model format conversion for cross-framework compatibility |
| Framework detection | Auto-detecting which framework a user's code uses |

### 12. Experiment Tracking Methodology

**Importance:** High -- core feature domain knowledge
**Required Level:** Advanced

| Skill | Detail |
|-------|--------|
| Hyperparameter management | Distinguishing hyperparameters from model architecture decisions |
| Metric logging best practices | When to log (per-step, per-epoch, per-validation), what to log |
| Experiment reproducibility | Random seeds, deterministic training, environment snapshotting |
| Comparison methodologies | Fair comparison (same data split, same evaluation), statistical significance |
| Artifact tracking | What to save (checkpoints, plots, configs), when to prune |
| Experiment organization | Naming conventions, tagging strategies, project structure |

### 13. Hyperparameter Optimization

**Importance:** Medium-High -- post-MVP feature
**Required Level:** Intermediate-Advanced

| Skill | Detail |
|-------|--------|
| Grid search | Exhaustive search over defined parameter grid |
| Random search | Uniform sampling from parameter ranges (often better than grid) |
| Bayesian optimization | Gaussian process-based sequential optimization (Optuna/BO) |
| Early stopping strategies | Median pruning, Hyperband, successive halving |
| Search space definition | Continuous, discrete, categorical, conditional parameters |
| Multi-objective optimization | Optimizing accuracy AND latency simultaneously (Pareto front) |

### 14. Model Deployment

**Importance:** Medium-High -- post-MVP feature
**Required Level:** Intermediate

| Skill | Detail |
|-------|--------|
| TorchServe | PyTorch model serving with REST/gRPC endpoints |
| Triton Inference Server | NVIDIA's multi-framework model serving platform |
| ONNX Runtime | Optimized inference for ONNX-exported models |
| Model optimization | Quantization (FP16, INT8), pruning, operator fusion |
| Containerized serving | Docker containers for model serving with auto-scaling |
| A/B testing | Traffic splitting, canary deployments, shadow testing |
| Latency optimization | Batching, caching, model warmup, hardware selection for inference |

### 15. GPU Computing

**Importance:** High -- users are GPU-intensive
**Required Level:** Intermediate

| Skill | Detail |
|-------|--------|
| CUDA basics | Understanding GPU memory hierarchy, kernel execution, streams |
| Memory management | Estimating model memory footprint, gradient checkpointing, mixed precision |
| Multi-GPU training | DataParallel, DistributedDataParallel, model parallelism, pipeline parallelism |
| GPU monitoring | nvidia-smi metrics parsing, GPU utilization, memory usage, temperature |
| Instance selection | Matching model size and batch size to appropriate GPU type and memory |
| Cost optimization | Spot instances, reserved capacity, provider comparison, right-sizing |

---

## Design Skills

### 16. IDE / Developer Tool UX

**Importance:** Critical -- ModelOps is an IDE
**Required Level:** Expert

| Skill | Detail |
|-------|--------|
| IDE layout patterns | Sidebar + tab bar + content area + status bar, resizable panels, split views |
| Information density | Displaying maximum data without overwhelming (experiment tables, metric dashboards) |
| Command palette | Fuzzy-search action finder (Ctrl+P), the primary power-user navigation pattern |
| Keyboard-first design | Every action should be achievable via keyboard shortcuts |
| Progressive disclosure | Show basic info by default, reveal details on hover/click/expand |
| Panel management | Drag to resize, collapse, detach, maximize panels |
| Tab management | Multiple open files/views with close, reorder, split capabilities |
| Terminal integration | Embedded terminal for command-line access (xterm.js styling) |
| Tree views | File explorer, dataset explorer, model registry navigation |
| Context menus | Right-click menus with relevant actions per element |

### 17. Data Visualization

**Importance:** High -- training metrics are visual
**Required Level:** Advanced

| Skill | Detail |
|-------|--------|
| Line charts | Loss curves, accuracy progression over training steps/epochs |
| Scatter plots | Hyperparameter vs metric relationships |
| Heatmaps | Confusion matrices, correlation matrices |
| Bar charts | Feature importance, metric comparison across experiments |
| Parallel coordinates | Multi-dimensional hyperparameter exploration |
| Box plots | Distribution comparison across dataset versions |
| Real-time chart updates | Smooth animation of incoming data points during live training |
| Interactive tooltips | Hover to see exact values, click to drill into data point |
| Chart responsiveness | Charts that resize with panel dimensions |
| Accessible charts | Color-blind safe palettes, screen reader descriptions, data tables as fallback |

### 18. Node-Based Pipeline UX

**Importance:** Critical -- primary interaction model
**Required Level:** Advanced

| Skill | Detail |
|-------|--------|
| Node design | Clear visual hierarchy: icon, name, status, input/output ports |
| Edge routing | Smooth bezier curves that avoid overlapping other nodes |
| Port typing | Visual differentiation of port types (data, model, config) via color and shape |
| Node grouping | Collapsible groups for complex pipeline sections |
| Error indication | Red borders, warning icons, tooltips on invalid nodes |
| Execution animation | Pulsing/glowing effect on currently executing node |
| Canvas navigation | Smooth pan and zoom with trackpad and mouse support |
| Node search | Quick-add nodes by typing name (auto-complete from palette) |
| Layout algorithms | Auto-layout for imported pipelines (dagre/ELK layout engines) |

### 19. Terminal / Log Viewer Design

**Importance:** Medium-High -- training logs are critical for debugging
**Required Level:** Intermediate

| Skill | Detail |
|-------|--------|
| Monospace rendering | JetBrains Mono or similar for log readability |
| ANSI color support | Rendering colored log output from Python training scripts |
| Search and filter | Ctrl+F search within logs, filter by log level (INFO, WARNING, ERROR) |
| Auto-scroll with pause | Auto-scroll to latest output, pause on user scroll-up, resume button |
| Line wrapping options | Wrap or horizontal scroll for long lines |
| Log level highlighting | Color-coded backgrounds for ERROR (red), WARNING (yellow), INFO (default) |
| Timestamp formatting | Consistent timestamp display, relative time option |
| Copy behavior | Click to select line, Ctrl+C to copy, right-click "Copy All" |

---

## Business Skills

### 20. ML Team Workflows

**Importance:** Critical -- must understand customer workflows deeply
**Required Level:** Expert

| Skill | Detail |
|-------|--------|
| ML development lifecycle | Research -> prototype -> experiment -> evaluate -> deploy -> monitor |
| Team dynamics | Roles (researcher, ML engineer, data engineer, ML ops), handoff points |
| Collaboration patterns | Shared experiments, model handoff, code review for ML, data versioning |
| Pain points | Infrastructure overhead, experiment reproducibility, deployment complexity |
| Existing tool landscape | How teams currently use W&B, MLflow, DVC, notebooks, cloud consoles |
| Migration path | Helping teams transition from existing tools to ModelOps gradually |

### 21. Enterprise Procurement for Developer Tools

**Importance:** High -- B2B sales to engineering organizations
**Required Level:** Intermediate-Advanced

| Skill | Detail |
|-------|--------|
| Bottom-up adoption | Individual engineers adopt free tier, champion paid upgrade to management |
| Developer champion programs | Identify and nurture internal advocates at target companies |
| Security questionnaires | SOC 2 compliance, data handling documentation, security review preparation |
| Procurement process | Understanding RFP/RFI, vendor evaluation criteria, budget cycles |
| Contract negotiation | Enterprise license agreements, SLAs, custom terms |
| ROI calculation | Quantifying time saved per engineer, cost reduction from GPU optimization |
| POC management | Structured proof-of-concept programs with success criteria |

### 22. MLOps Community Engagement

**Importance:** High -- primary distribution channel
**Required Level:** Advanced

| Skill | Detail |
|-------|--------|
| MLOps Community Slack | Active participation in the 30K+ member MLOps Community Slack |
| Reddit (r/MachineLearning, r/MLOps) | Community posts, answering questions, sharing insights |
| Twitter/X ML community | Engaging with ML influencers, sharing product updates, ML tips |
| Papers with Code | Listing integrations, contributing benchmarks |
| Hacker News | Launch posts, Show HN submissions for milestones |
| Discord communities | ML-focused Discord servers (Hugging Face, PyTorch, etc.) |

### 23. Conference Presence

**Importance:** Medium-High -- brand building and direct sales
**Required Level:** Intermediate

| Skill | Detail |
|-------|--------|
| NeurIPS | Premier ML research conference, 15K+ attendees, sponsor/booth opportunity |
| ICML | Top ML conference, strong industry presence |
| MLSys | Systems for ML conference, highly relevant to MLOps tooling |
| KDD | Data mining and ML applications, enterprise attendees |
| MLOps World | Dedicated MLOps conference, directly targeted audience |
| Local meetups | ML meetups in SF, NYC, London, Berlin for grassroots community building |

---

## Learning Resources

### Electron Development

| Resource | Type | URL |
|----------|------|-----|
| Electron docs | Official docs | electronjs.org/docs |
| Electron Fiddle | Learning tool | electronjs.org/fiddle |
| Building Desktop Apps with Electron (book) | Book | O'Reilly |
| VS Code source code | Open source reference | github.com/microsoft/vscode |

### React Flow (Pipeline Editor)

| Resource | Type | URL |
|----------|------|-----|
| React Flow docs | Official docs | reactflow.dev |
| React Flow examples | Code examples | reactflow.dev/examples |
| Building node-based editors (blog) | Tutorial | reactflow.dev/blog |

### ML/MLOps

| Resource | Type | URL |
|----------|------|-----|
| MLOps Community Slack | Community | mlops.community |
| Designing Machine Learning Systems (book) | Book | Chip Huyen (O'Reilly) |
| Made with ML | Course | madewithml.com |
| Full Stack Deep Learning | Course | fullstackdeeplearning.com |
| MLOps Principles | Guide | ml-ops.org |

### GPU Computing

| Resource | Type | URL |
|----------|------|-----|
| NVIDIA CUDA Programming Guide | Official docs | docs.nvidia.com/cuda |
| Lambda Labs blog | Tutorials | lambdalabs.com/blog |
| RunPod docs | Official docs | docs.runpod.io |
| Modal docs | Official docs | modal.com/docs |

### Developer Tool Design

| Resource | Type | URL |
|----------|------|-----|
| VS Code UX guidelines | Design reference | code.visualstudio.com/api/ux-guidelines |
| JetBrains UI guidelines | Design reference | jetbrains.design |
| Figma developer tool plugins | Design patterns | figma.com |

---

## Unique / Rare Skill Combinations

ModelOps requires several skill combinations that are unusually rare in the market:

### 1. Electron + ML Infrastructure

Very few engineers have experience building both desktop applications and machine learning infrastructure. Most ML engineers work in Python/Jupyter/cloud environments, while desktop app engineers focus on TypeScript/Electron/native development. ModelOps requires bridging both worlds.

**How to build this:** Pair an Electron-experienced frontend engineer with an ML infrastructure engineer. Cross-train over 3-6 months.

### 2. React Flow + ML Pipeline Domain Knowledge

Building a visual pipeline editor that accurately represents ML workflows requires understanding both the React Flow library at a deep level and the nuances of ML pipeline design (data flow types, training loop semantics, evaluation methodology).

**How to build this:** Start with React Flow examples, then prototype with real ML engineers to validate pipeline abstractions.

### 3. Jupyter Kernel Protocol + Desktop Integration

The Jupyter wire protocol (ZMQ-based) is complex and poorly documented outside the Jupyter project itself. Integrating it into an Electron app requires understanding both the protocol and Electron's process model.

**How to build this:** Study the Jupyter kernel gateway source code, prototype a minimal kernel client in Node.js, then integrate into Electron IPC.

### 4. GPU Cloud API Orchestration + Cost Optimization

Managing GPU instances across multiple cloud providers (Lambda, RunPod, Modal) with real-time cost tracking requires understanding each provider's API quirks, pricing models, and availability patterns.

**How to build this:** Build integrations sequentially (start with Lambda Labs, add RunPod, then Modal). Create abstraction layer that normalizes provider differences.

### 5. IDE UX Design + Data Visualization

Designing an IDE-style interface that also incorporates rich data visualization (training curves, confusion matrices, parallel coordinates) requires expertise in both developer tool design patterns and data viz principles.

**How to build this:** Study VS Code and JetBrains IDEs for layout patterns, study Observable and Weights & Biases for ML-specific data viz patterns.
