# Screens -- ModelOps

## Screen Inventory

| # | Screen | Purpose | Priority |
|---|--------|---------|----------|
| 1 | Welcome / Project Setup | Onboarding, project creation | P0 |
| 2 | Pipeline Editor | Visual ML pipeline construction | P0 |
| 3 | Experiment Dashboard | View, compare, and manage experiments | P0 |
| 4 | Training Monitor | Live training metrics and GPU stats | P0 |
| 5 | Notebook View | Jupyter-style interactive notebooks | P1 |
| 6 | Model Registry | Versioned models and deployment status | P1 |
| 7 | Dataset Manager | Dataset versions, schemas, statistics | P1 |
| 8 | GPU Manager | Cloud GPU instances, costs, scheduling | P1 |
| 9 | Deploy Manager | Endpoints, A/B tests, traffic splitting | P2 |
| 10 | Team Dashboard | Team activity, members, permissions | P2 |
| 11 | Settings | Cloud credentials, Python environments, preferences | P0 |

---

## Global Navigation Structure

### Application Layout

```
+--------+-----------------------------------------------------+
| SIDE   |                    TAB BAR                          |
| BAR    | [Pipeline] [Experiments] [Training] [Notebook] ... |
| (56px) +-----------------------------------------------------+
|        |                                                     |
| Logo   |                                                     |
|        |              MAIN CONTENT AREA                      |
| Nav    |                                                     |
| Icons  |         (content of selected tab/screen)            |
|        |                                                     |
|        |                                                     |
|        |                                                     |
|        +-----------------------------------------------------+
|        |                  STATUS BAR                          |
|        | [GPU: idle] [Python 3.11] [Project: my-model] [Sync]|
+--------+-----------------------------------------------------+
```

### Sidebar Navigation Icons (Top to Bottom)

1. **Explorer** (folder icon) -- File tree for project files
2. **Pipeline** (workflow icon) -- Pipeline editor canvas
3. **Experiments** (flask icon) -- Experiment dashboard
4. **Training** (play-circle icon) -- Active training monitor
5. **Notebooks** (book icon) -- Jupyter notebooks
6. **Models** (box icon) -- Model registry
7. **Datasets** (database icon) -- Dataset manager
8. **GPU** (cpu icon) -- GPU instance manager
9. **Deploy** (rocket icon) -- Deployment manager
10. **Team** (people icon) -- Team dashboard (Pro+ plans)

### Sidebar Navigation Icons (Bottom)

11. **Settings** (gear icon) -- Application settings
12. **Account** (user icon) -- User profile and plan

### Status Bar Elements (Left to Right)

- GPU status indicator (idle / training / error)
- Active Python environment name and version
- Current project name
- Supabase sync status (synced / syncing / offline)
- Notification bell with unread count

---

## Screen 1: Welcome / Project Setup

### Purpose
First screen users see on launch. Handles onboarding, project creation, and recent project access.

### Layout

```
+------------------------------------------------------------------+
|                                                                    |
|                    ModelOps Logo (centered)                        |
|               "Ship ML models, not infrastructure"                 |
|                                                                    |
|  +---------------------------+  +-------------------------------+  |
|  |    Recent Projects        |  |    Create New Project         |  |
|  |                           |  |                               |  |
|  |  > sentiment-analysis     |  |  Project Name: [___________]  |
|  |    Last opened: 2h ago    |  |                               |  |
|  |                           |  |  Framework:                   |  |
|  |  > image-classifier       |  |  ( ) PyTorch                  |  |
|  |    Last opened: 3d ago    |  |  ( ) TensorFlow               |  |
|  |                           |  |  ( ) JAX                      |  |
|  |  > llm-finetuning         |  |  ( ) Custom                   |  |
|  |    Last opened: 1w ago    |  |                               |  |
|  |                           |  |  Template:                    |  |
|  |  [Open Other Project]     |  |  [v] Image Classification    |  |
|  |                           |  |                               |  |
|  +---------------------------+  |  Python Environment:          |  |
|                                 |  [v] System Python 3.11       |  |
|  +---------------------------+  |                               |  |
|  |  Clone from Git           |  |  [  Create Project  ]         |  |
|  |  [_____repo_url_____]     |  |                               |  |
|  |  [  Clone & Open  ]       |  +-------------------------------+  |
|  +---------------------------+                                     |
|                                                                    |
|  +---------------------------+                                     |
|  |  Import from W&B / MLflow |                                     |
|  |  [  Import Experiments  ] |                                     |
|  +---------------------------+                                     |
+------------------------------------------------------------------+
```

### UI Elements

| Element | Type | Behavior |
|---------|------|----------|
| Recent Projects list | Clickable list items | Click to open project, hover shows full path, right-click for "Remove from recent" |
| Project Name input | Text field | Validates: no special characters, max 64 chars, auto-slugify for directory name |
| Framework selector | Radio buttons | Pre-selects PyTorch (most common), affects template options and base Docker image |
| Template dropdown | Select menu | Options change based on framework selection |
| Python Environment | Select menu | Auto-detects installed Python versions, conda envs, venvs in project dir |
| Create Project button | Primary button | Disabled until name is entered, creates directory structure and opens project |
| Clone from Git | Text input + button | Validates git URL, shows clone progress, opens project on completion |
| Import from W&B/MLflow | Button | Opens import wizard dialog |

### States

| State | Appearance |
|-------|------------|
| **First launch** | No recent projects, "Create your first project" callout highlighted |
| **Returning user** | Recent projects populated, last project pre-selected |
| **Creating project** | Button shows spinner, "Creating project..." text |
| **Cloning repo** | Progress bar with clone percentage, cancel button |
| **Error** | Red toast notification with error message (e.g., "Directory already exists") |

### Accessibility
- All form fields have visible labels and aria-labels
- Tab order follows visual layout (left column then right column)
- Recent projects navigable with arrow keys
- Keyboard shortcut: Ctrl+N for new project, Ctrl+O for open project

---

## Screen 2: Pipeline Editor

### Purpose
The core screen where users visually construct ML training pipelines by dragging nodes onto a canvas and connecting them.

### Layout

```
+--------+-------------------------------------------+------------------+
| SIDE   |              PIPELINE CANVAS               |   NODE CONFIG    |
| BAR    |                                            |   PANEL          |
|        |  +--------+     +----------+               |                  |
|        |  | CSV    |---->| Normalize|----+          | Node: Normalize  |
|        |  | Loader |     |          |    |          | Type: Transform  |
|        |  +--------+     +----------+    |          |                  |
|        |                                 |          | Method:          |
| NODE   |  +--------+     +----------+    |          | [v] Standard     |
| PALET  |  | Image  |---->|   Data   |    |          |                  |
| TE     |  | Folder |     |   Split  |----+---+      | Columns:         |
|        |  +--------+     +----------+    |   |      | [x] feature_1    |
|        |                                 v   v      | [x] feature_2    |
|        |                         +----------+       | [ ] target       |
|        |                         |  PyTorch |       |                  |
|        |                         |  Train   |       | Code:            |
|        |                         +----+-----+       | +==============+ |
|        |                              |             | | def transform| |
|        |                         +----v-----+       | |   (self, x): | |
|        |                         | Evaluate |       | |   return ... | |
|        |                         +----+-----+       | +==============+ |
|        |                              |             |                  |
|        |                         +----v-----+       | [Apply] [Reset]  |
|        |                         |  Export  |       |                  |
|        |                         |  Model   |       |                  |
|        |                         +----------+       |                  |
|        |                                            |                  |
|        |  [Minimap]          [Zoom: 100%] [Fit All] |                  |
+--------+-------------------------------------------+------------------+
|        | PIPELINE TOOLBAR                                              |
|        | [Run Local] [Run on Cloud GPU v] [Validate] [Export YAML]     |
+--------+--------------------------------------------------------------+
```

### UI Elements

| Element | Type | Behavior |
|---------|------|----------|
| Node Palette | Sidebar panel | Draggable node cards grouped by category (Data, Transform, Train, Evaluate, Deploy) |
| Canvas | React Flow viewport | Infinite canvas with pan (drag/scroll), zoom (Ctrl+scroll), grid background |
| Pipeline Node | React Flow custom node | Color-coded by type, shows name/icon, expandable on double-click |
| Edge | React Flow edge | Animated dashed line, deletable on click, shows data type on hover |
| Node Config Panel | Side panel (resizable) | Opens when node is selected, shows config form + code editor |
| Minimap | React Flow minimap | Bottom-left corner, shows full pipeline overview, clickable for navigation |
| Zoom controls | Button group | Zoom in/out buttons, fit-all button, zoom percentage display |
| Run Local button | Primary button | Execute pipeline on local Python environment |
| Run on Cloud GPU | Split button | Primary action + dropdown to select GPU type and provider |
| Validate button | Secondary button | Check pipeline for errors without executing |
| Export YAML button | Secondary button | Save pipeline definition as .yaml file |

### States

| State | Appearance |
|-------|------------|
| **Empty canvas** | Centered prompt: "Drag nodes from the palette to start building your pipeline" |
| **Designing** | Nodes on canvas, edges connecting them, node palette visible |
| **Node selected** | Node highlighted with blue border, config panel slides open from right |
| **Pipeline running** | Nodes animate sequentially (pulse when active), progress indicator on each node |
| **Node completed** | Green checkmark badge on completed nodes |
| **Node failed** | Red X badge with error tooltip, pipeline halts at failed node |
| **Validation error** | Red border on invalid nodes, error list in bottom panel |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | Open node palette search |
| `Delete` / `Backspace` | Delete selected node or edge |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+D` | Duplicate selected node |
| `Ctrl+A` | Select all nodes |
| `Space` (hold) | Pan mode |
| `Ctrl+Enter` | Run pipeline |
| `Ctrl+S` | Save pipeline |
| `Ctrl+E` | Export pipeline as YAML |

---

## Screen 3: Experiment Dashboard

### Purpose
View all experiments, compare metrics, and manage experiment lifecycle.

### Layout

```
+--------+------------------------------------------------------------------+
| SIDE   |  EXPERIMENT DASHBOARD                                            |
| BAR    |                                                                  |
|        |  [Search experiments...] [Filter: All v] [Sort: Recent v] [+New] |
|        |                                                                  |
|        |  +-----------+------------+----------+-------+------+---------+  |
|        |  | Name      | Status     | Accuracy | Loss  | GPU  | Cost    |  |
|        |  +-----------+------------+----------+-------+------+---------+  |
|        |  | [x] exp-7 | Completed  | 0.943    | 0.182 | A100 | $4.20   |  |
|        |  | [x] exp-6 | Completed  | 0.938    | 0.195 | A100 | $3.80   |  |
|        |  | [ ] exp-5 | Failed     | --       | --    | A10G | $0.50   |  |
|        |  | [ ] exp-4 | Completed  | 0.921    | 0.234 | 4090 | $1.20   |  |
|        |  | [ ] exp-3 | Completed  | 0.915    | 0.251 | A10G | $0.90   |  |
|        |  | [ ] exp-2 | Completed  | 0.892    | 0.310 | A10G | $0.80   |  |
|        |  | [ ] exp-1 | Completed  | 0.845    | 0.421 | CPU  | $0.00   |  |
|        |  +-----------+------------+----------+-------+------+---------+  |
|        |                                                                  |
|        |  [Compare Selected (2)]  [Delete Selected]  [Export CSV]         |
|        |                                                                  |
|        |  +----------------------------+  +----------------------------+  |
|        |  |  COMPARISON CHART           |  |  PARALLEL COORDINATES      |  |
|        |  |                             |  |                            |  |
|        |  |  Loss Curve                 |  |  lr  bs  epochs  accuracy  |  |
|        |  |  ----exp-7                  |  |  |   |    |       |        |  |
|        |  |  ----exp-6                  |  |  |---+----+-------+        |  |
|        |  |                             |  |  |   |    |       |        |  |
|        |  +----------------------------+  +----------------------------+  |
+--------+------------------------------------------------------------------+
```

### UI Elements

| Element | Type | Behavior |
|---------|------|----------|
| Search bar | Text input with icon | Filter experiments by name, tag, or hyperparameter value |
| Filter dropdown | Select menu | Options: All, Running, Completed, Failed, Tagged |
| Sort dropdown | Select menu | Options: Recent, Best Accuracy, Lowest Loss, Cheapest, Most Expensive |
| Experiment table | TanStack Table | Sortable columns, row selection with checkboxes, click row to expand details |
| Status badge | Colored pill | Green=Completed, Blue=Running, Red=Failed, Yellow=Queued |
| Compare button | Primary button | Enabled when 2-5 experiments selected, opens comparison view |
| Comparison chart | Recharts line chart | Overlay loss/accuracy curves for selected experiments |
| Parallel coordinates | Custom visualization | Each axis is a hyperparameter, lines are experiments, highlight best runs |
| Experiment detail panel | Expandable row | Click to expand: full hyperparameters, all metrics, artifacts, code diff, notes |

### States

| State | Appearance |
|-------|------------|
| **No experiments** | Empty state: "Run your first experiment from the Pipeline Editor" with link |
| **Loading** | Skeleton rows in table while fetching from Supabase |
| **Filtered (no results)** | "No experiments match your filters" with clear filters button |
| **Comparison mode** | Top half shows table, bottom half shows comparison charts |
| **Experiment selected** | Row highlighted, detail panel expanded below row |

---

## Screen 4: Training Monitor

### Purpose
Real-time dashboard for active training runs with live metrics, GPU statistics, and log streaming.

### Layout

```
+--------+------------------------------------------------------------------+
| SIDE   |  TRAINING MONITOR                                                |
| BAR    |                                                                  |
|        |  Active Runs (2)    Queued (1)    Completed Today (5)            |
|        |                                                                  |
|        |  +--------------------------------------------------------------+|
|        |  | exp-8: resnet50-finetune              [Pause] [Stop]         ||
|        |  | GPU: A100 80GB  |  ETA: 23 min  |  Cost: $1.45 so far      ||
|        |  +--------------------------------------------------------------+|
|        |                                                                  |
|        |  +----------------------------+  +----------------------------+  |
|        |  |  LOSS CURVE (live)          |  |  GPU UTILIZATION            |  |
|        |  |                             |  |                             |  |
|        |  |  Train: 0.182 (epoch 15/20) |  |  GPU%:  [========== ] 94%  |  |
|        |  |  Val:   0.195               |  |  Mem:   [=======   ] 72%   |  |
|        |  |                             |  |  Temp:  67C                 |  |
|        |  |  [chart with live updates]  |  |  Power: 285W / 400W        |  |
|        |  +----------------------------+  +----------------------------+  |
|        |                                                                  |
|        |  +----------------------------+  +----------------------------+  |
|        |  |  THROUGHPUT                  |  |  METRICS                    |  |
|        |  |                             |  |                             |  |
|        |  |  Samples/sec: 1,245         |  |  Accuracy: 0.943            |  |
|        |  |  Batches/sec: 9.8           |  |  F1 Score: 0.938            |  |
|        |  |  Epoch: 15/20               |  |  Precision: 0.941           |  |
|        |  |  Step: 14,580 / 19,440      |  |  Recall: 0.935              |  |
|        |  +----------------------------+  +----------------------------+  |
|        |                                                                  |
|        |  +--------------------------------------------------------------+|
|        |  |  TRAINING LOG                                    [Search]    ||
|        |  |  [2024-01-15 14:23:01] Epoch 15/20, Step 14580              ||
|        |  |  [2024-01-15 14:23:01] Train Loss: 0.1823, Acc: 0.9432     ||
|        |  |  [2024-01-15 14:22:55] Val Loss: 0.1952, Acc: 0.9381       ||
|        |  |  [2024-01-15 14:22:50] Saving checkpoint epoch_15.pt        ||
|        |  |  ...                                                         ||
|        |  +--------------------------------------------------------------+|
+--------+------------------------------------------------------------------+
```

### UI Elements

| Element | Type | Behavior |
|---------|------|----------|
| Run selector | Tab bar / cards | Switch between active training runs |
| Loss curve | Recharts live chart | Updates every 5 seconds with new data points, train + val overlaid |
| GPU utilization | Progress bars + chart | Real-time GPU%, memory%, temperature, power draw |
| Throughput metrics | Stat cards | Samples/sec, batches/sec, epoch progress, step counter |
| Metric cards | Stat cards | Current best metrics (accuracy, F1, etc.), updates on each validation |
| Training log | xterm.js terminal | Scrollable log output, searchable, auto-scroll (toggleable) |
| Pause button | Icon button | Checkpoint current state and pause training (resume later) |
| Stop button | Danger icon button | Terminate training, save final checkpoint |
| ETA display | Text with timer | Estimated time remaining based on throughput and remaining epochs |
| Cost tracker | Text with dollar icon | Running cost total based on GPU hourly rate |

### States

| State | Appearance |
|-------|------------|
| **No active training** | Empty state: "Start a training run from the Pipeline Editor" |
| **Training running** | Live charts updating, log scrolling, GPU metrics active |
| **Training paused** | Charts frozen, "Paused" badge on run card, Resume button shown |
| **Training completed** | Green "Completed" badge, final metrics highlighted, "View in Experiments" link |
| **Training failed** | Red "Failed" badge, error highlighted in log, suggested fixes shown |
| **Reconnecting** | Yellow "Reconnecting..." banner, charts frozen, retry counter shown |

---

## Screen 5: Notebook View

### Purpose
Jupyter-style interactive notebook for data exploration, prototyping, and documentation.

### Layout

```
+--------+------------------------------------------------------------------+
| SIDE   |  NOTEBOOK: exploration.ipynb                                     |
| BAR    |  [+ Code] [+ Markdown] [Run All] [Restart Kernel] [Clear Outputs]|
|        |                                                                  |
|        |  +--------------------------------------------------------------+|
|  FILE  |  | [1] import pandas as pd                                      ||
|  TREE  |  |     import torch                                             ||
|        |  |     from modelops import log_metric                          ||
|        |  |                                                   [Run] 0.2s ||
|        |  +--------------------------------------------------------------+|
|        |                                                                  |
|        |  +--------------------------------------------------------------+|
|        |  | [2] df = pd.read_csv("data/train.csv")                       ||
|        |  |     df.head()                                                ||
|        |  |                                                   [Run] 1.1s ||
|        |  |  +----------------------------------------------------------+||
|        |  |  | Output:                                                   |||
|        |  |  | |  id  | feature_1 | feature_2 | target |                |||
|        |  |  | |  0   | 0.234     | 1.456     | 1      |                |||
|        |  |  | |  1   | 0.567     | 2.345     | 0      |                |||
|        |  |  +----------------------------------------------------------+||
|        |  +--------------------------------------------------------------+|
|        |                                                                  |
|        |  +--------------------------------------------------------------+|
|        |  | [*] # Training loop (running...)                             ||
|        |  |     for epoch in range(20):                                  ||
|        |  |         train_loss = train(model, dataloader)                ||
|        |  |         log_metric("loss", train_loss)                       ||
|        |  |                                              [Interrupt] ... ||
|        |  +--------------------------------------------------------------+|
|        |                                                                  |
|        |  +-------------------------------+                               |
|        |  | VARIABLE INSPECTOR            |                               |
|        |  | df: DataFrame (10000, 5)      |                               |
|        |  | model: ResNet50 (25.6M params) |                               |
|        |  | train_loss: float = 0.234      |                               |
|        |  +-------------------------------+                               |
+--------+------------------------------------------------------------------+
|        | Kernel: Python 3.11  |  idle  |  Memory: 2.1 GB                  |
+--------+------------------------------------------------------------------+
```

### UI Elements

| Element | Type | Behavior |
|---------|------|----------|
| Cell | Code block with Monaco Editor | Editable code with syntax highlighting, line numbers |
| Cell toolbar | Button group per cell | Run, Move Up, Move Down, Delete, Cell Type toggle |
| Output area | Rendered output below cell | Supports text, HTML, images, interactive charts, LaTeX |
| Variable inspector | Side panel (collapsible) | Shows all variables in kernel scope with types and shapes |
| Kernel indicator | Status bar item | Shows kernel state: idle, busy, dead, starting |
| Add cell buttons | Floating buttons between cells | "+ Code" and "+ Markdown" appear on hover between cells |
| Cell number | Left gutter | [1], [2], etc. for executed cells, [ ] for unexecuted, [*] for running |
| Execution timer | Cell corner | Shows elapsed time for running cell, final time for completed cell |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift+Enter` | Run cell and advance to next |
| `Ctrl+Enter` | Run cell and stay |
| `Alt+Enter` | Run cell and insert new cell below |
| `Ctrl+Shift+Minus` | Split cell at cursor |
| `A` (command mode) | Insert cell above |
| `B` (command mode) | Insert cell below |
| `DD` (command mode) | Delete cell |
| `M` (command mode) | Change cell to Markdown |
| `Y` (command mode) | Change cell to Code |
| `Ctrl+Shift+P` | Open command palette |

---

## Screen 6: Model Registry

### Purpose
Central catalog of all trained models with versioning, metadata, and deployment status tracking.

### Layout

```
+--------+------------------------------------------------------------------+
| SIDE   |  MODEL REGISTRY                                [+ Register Model] |
| BAR    |                                                                  |
|        |  [Search models...] [Filter: All v] [Sort: Recent v]             |
|        |                                                                  |
|        |  +--------------------------------------------------------------+|
|        |  | MODEL CARD: sentiment-bert                                   ||
|        |  |                                                              ||
|        |  | Latest: v2.3.0  |  Status: Production  |  Size: 438 MB      ||
|        |  |                                                              ||
|        |  | Versions:                                                    ||
|        |  | v2.3.0  Production  Acc: 0.943  F1: 0.938  2024-01-15       ||
|        |  | v2.2.0  Retired     Acc: 0.938  F1: 0.932  2024-01-10       ||
|        |  | v2.1.0  Retired     Acc: 0.921  F1: 0.918  2024-01-05       ||
|        |  | v2.0.0  Retired     Acc: 0.892  F1: 0.885  2023-12-20       ||
|        |  |                                                              ||
|        |  | [Deploy v2.3.0] [Download] [Compare Versions] [View Card]    ||
|        |  +--------------------------------------------------------------+|
|        |                                                                  |
|        |  +--------------------------------------------------------------+|
|        |  | MODEL CARD: image-resnet                                     ||
|        |  |                                                              ||
|        |  | Latest: v1.1.0  |  Status: Staging  |  Size: 102 MB         ||
|        |  | ...                                                          ||
|        |  +--------------------------------------------------------------+|
+--------+------------------------------------------------------------------+
```

### UI Elements

| Element | Type | Behavior |
|---------|------|----------|
| Model card | Expandable card | Shows model name, latest version, status badge, key metrics |
| Version table | Nested table in card | All versions with metrics, status, date, click to expand |
| Status badge | Colored pill | Draft=Gray, Validated=Blue, Staging=Yellow, Production=Green, Retired=Red |
| Deploy button | Primary button | Opens deployment wizard (select environment, configure endpoint) |
| Download button | Secondary button | Download model weights to local machine |
| Compare versions | Secondary button | Side-by-side metric comparison for selected versions |
| Model card view | Button | Opens detailed model card with architecture, training info, evaluation |
| Register Model button | Action button | Manually register a model from a file or external source |

---

## Screen 7: Dataset Manager

### Purpose
Manage dataset versions, explore schemas, view statistics, and track which datasets were used in which experiments.

### Layout

```
+--------+------------------------------------------------------------------+
| SIDE   |  DATASET MANAGER                                  [+ Add Dataset] |
| BAR    |                                                                  |
|        |  +------------------+  +--------------------------------------+  |
|        |  | DATASETS         |  | DATASET DETAIL: train_v3             |  |
|        |  |                  |  |                                      |  |
|        |  | > train_v3       |  | Rows: 50,000  |  Cols: 12  |  2.3GB |  |
|        |  |   train_v2       |  |                                      |  |
|        |  |   train_v1       |  | SCHEMA                               |  |
|        |  |                  |  | +----------+--------+--------+       |  |
|        |  | > validation     |  | | Column   | Type   | Nulls  |       |  |
|        |  |                  |  | +----------+--------+--------+       |  |
|        |  | > test           |  | | user_id  | int64  | 0%     |       |  |
|        |  |                  |  | | text     | string | 0.2%   |       |  |
|        |  | > augmented      |  | | label    | int32  | 0%     |       |  |
|        |  |                  |  | | score    | float  | 1.5%   |       |  |
|        |  +------------------+  | +----------+--------+--------+       |  |
|        |                        |                                      |  |
|        |                        | STATISTICS                           |  |
|        |                        | [Distribution Charts per Column]     |  |
|        |                        |                                      |  |
|        |                        | LINEAGE                              |  |
|        |                        | Used in: exp-5, exp-6, exp-7, exp-8 |  |
|        |                        |                                      |  |
|        |                        | [Diff with v2] [Preview Data] [Export]|  |
|        |                        +--------------------------------------+  |
+--------+------------------------------------------------------------------+
```

### UI Elements

| Element | Type | Behavior |
|---------|------|----------|
| Dataset tree | Tree view | Hierarchical list of datasets with versions, click to select |
| Schema table | Table | Column name, data type, null percentage, unique count |
| Distribution charts | Recharts histograms | One chart per numerical column showing value distribution |
| Data preview | Scrollable table | First 100 rows of the dataset, paginated |
| Version diff | Side-by-side view | Schema changes, row count changes, distribution shifts between versions |
| Lineage section | Link list | Shows which experiments used this dataset version |
| Export button | Button | Export dataset to local file (CSV, Parquet, JSON) |
| Add Dataset | Action button | Register a new dataset from local file or remote URL |

---

## Screen 8: GPU Manager

### Purpose
Manage cloud GPU instances across providers, monitor costs, and schedule training jobs.

### Layout

```
+--------+------------------------------------------------------------------+
| SIDE   |  GPU MANAGER                                                     |
| BAR    |                                                                  |
|        |  +--------------------------------------------------------------+|
|        |  | ACTIVE INSTANCES                               [+ Launch GPU] ||
|        |  |                                                              ||
|        |  | Provider  | GPU      | Status  | Uptime | Cost   | Action   ||
|        |  | Lambda    | A100 80G | Running | 2h 15m | $2.48  | [Stop]   ||
|        |  | RunPod    | A10G     | Idle    | 0h 45m | $0.56  | [Stop]   ||
|        |  +--------------------------------------------------------------+|
|        |                                                                  |
|        |  +----------------------------+  +----------------------------+  |
|        |  | COST THIS MONTH             |  | GPU AVAILABILITY            |  |
|        |  |                             |  |                             |  |
|        |  | Total: $234.56              |  | Lambda Labs:                |  |
|        |  | Budget: $500.00             |  |   A100 80G: 3 available     |  |
|        |  | [==========        ] 47%    |  |   H100: 0 available         |  |
|        |  |                             |  |                             |  |
|        |  | Daily trend chart           |  | RunPod:                     |  |
|        |  |                             |  |   A100 80G: 12 available    |  |
|        |  |                             |  |   RTX 4090: 25 available    |  |
|        |  +----------------------------+  +----------------------------+  |
|        |                                                                  |
|        |  +--------------------------------------------------------------+|
|        |  | SCHEDULED JOBS                                               ||
|        |  |                                                              ||
|        |  | Job             | GPU    | Scheduled     | Status            ||
|        |  | lr-sweep-batch  | A100   | Today 18:00   | Queued            ||
|        |  | nightly-retrain | A10G   | Daily 02:00   | Recurring         ||
|        |  +--------------------------------------------------------------+|
+--------+------------------------------------------------------------------+
```

### UI Elements

| Element | Type | Behavior |
|---------|------|----------|
| Active instances table | Table | All running GPU instances with provider, type, status, uptime, cost |
| Stop button | Danger button | Terminate GPU instance (confirmation dialog) |
| Launch GPU button | Action button | Opens GPU provisioning dialog (provider, type, duration) |
| Cost widget | Card with progress bar | Monthly cost vs budget, daily trend chart |
| Availability panel | Live status cards | Real-time GPU availability per provider, auto-refreshed |
| Scheduled jobs table | Table | Upcoming and recurring training jobs, edit/cancel actions |
| Budget alert | Banner notification | Shown when cost exceeds 80% of monthly budget |

---

## Screen 9: Deploy Manager

### Purpose
Deploy models to API endpoints, configure A/B tests, and manage traffic splitting.

### Layout

```
+--------+------------------------------------------------------------------+
| SIDE   |  DEPLOY MANAGER                                  [+ New Endpoint] |
| BAR    |                                                                  |
|        |  +--------------------------------------------------------------+|
|        |  | ENDPOINTS                                                    ||
|        |  |                                                              ||
|        |  | sentiment-api (Production)                                   ||
|        |  |   URL: https://api.modelops.dev/v1/sentiment                 ||
|        |  |   Models: v2.3.0 (90%) | v2.4.0-beta (10%)                  ||
|        |  |   Requests: 12,345/day  |  Latency: 45ms p99                ||
|        |  |   [Manage] [View Logs] [Edit Traffic]                        ||
|        |  |                                                              ||
|        |  | image-classify-api (Staging)                                  ||
|        |  |   URL: https://staging.modelops.dev/v1/classify              ||
|        |  |   Models: v1.1.0 (100%)                                      ||
|        |  |   Requests: 234/day  |  Latency: 120ms p99                  ||
|        |  |   [Promote to Prod] [View Logs]                              ||
|        |  +--------------------------------------------------------------+|
|        |                                                                  |
|        |  +--------------------------------------------------------------+|
|        |  | A/B TEST: sentiment-v2.4.0-beta                              ||
|        |  |                                                              ||
|        |  | Control (v2.3.0): Acc 0.943, Latency 42ms, 11,110 requests   ||
|        |  | Variant (v2.4.0): Acc 0.951, Latency 48ms,  1,235 requests   ||
|        |  |                                                              ||
|        |  | Statistical significance: 87% (need 95% to declare winner)   ||
|        |  | Estimated time to significance: ~3 days                      ||
|        |  |                                                              ||
|        |  | [Increase Traffic to Variant] [End Test] [View Details]       ||
|        |  +--------------------------------------------------------------+|
+--------+------------------------------------------------------------------+
```

---

## Screen 10: Team Dashboard

### Purpose
Manage team members, view team activity, and monitor collaborative work.

### Layout

```
+--------+------------------------------------------------------------------+
| SIDE   |  TEAM DASHBOARD                                  [+ Invite Member]|
| BAR    |                                                                  |
|        |  +--------------------------------------------------------------+|
|        |  | MEMBERS (8)                                                  ||
|        |  |                                                              ||
|        |  | Name          | Role   | Last Active | Experiments | Cost    ||
|        |  | Alice Chen    | Owner  | Now         | 45          | $890    ||
|        |  | Bob Kumar     | Admin  | 2h ago      | 32          | $650    ||
|        |  | Carol Smith   | Member | 1d ago      | 28          | $420    ||
|        |  | David Lee     | Member | 3h ago      | 21          | $380    ||
|        |  | Eve Johnson   | Member | Now         | 18          | $310    ||
|        |  | Frank Wilson  | Member | 5h ago      | 15          | $280    ||
|        |  | Grace Park    | Viewer | 1w ago      | 0           | $0      ||
|        |  | Hiro Tanaka   | Member | 4h ago      | 12          | $200    ||
|        |  +--------------------------------------------------------------+|
|        |                                                                  |
|        |  +--------------------------------------------------------------+|
|        |  | RECENT ACTIVITY                                              ||
|        |  |                                                              ||
|        |  | 14:23  Alice deployed sentiment-bert v2.3.0 to production    ||
|        |  | 14:15  Eve started training experiment exp-42 on A100        ||
|        |  | 13:50  Bob registered model image-resnet v1.1.0              ||
|        |  | 13:30  David commented on exp-38: "Data leak in val set"     ||
|        |  | 12:45  Carol completed hyperparameter sweep (24 trials)      ||
|        |  +--------------------------------------------------------------+|
+--------+------------------------------------------------------------------+
```

---

## Screen 11: Settings

### Purpose
Configure cloud credentials, Python environments, application preferences, and account settings.

### Layout

```
+--------+------------------------------------------------------------------+
| SIDE   |  SETTINGS                                                        |
| BAR    |                                                                  |
|        |  +------------------+  +--------------------------------------+  |
|        |  | SETTINGS NAV     |  | CLOUD CREDENTIALS                    |  |
|        |  |                  |  |                                      |  |
|        |  | > General        |  | Lambda Labs API Key                  |  |
|        |  |   Cloud Creds    |  | [**************4f2a]  [Edit] [Test]  |  |
|        |  |   Python Envs    |  |                                      |  |
|        |  |   GPU Defaults   |  | RunPod API Key                       |  |
|        |  |   Storage        |  | [**************8b3c]  [Edit] [Test]  |  |
|        |  |   Notifications  |  |                                      |  |
|        |  |   Keyboard       |  | Modal Token                          |  |
|        |  |   Account        |  | [Not configured]     [Add]           |  |
|        |  |   Team           |  |                                      |  |
|        |  |   Billing        |  | AWS S3 / Cloudflare R2               |  |
|        |  |   About          |  | Access Key: [*****]  [Edit]          |  |
|        |  |                  |  | Secret Key: [*****]  [Edit]          |  |
|        |  |                  |  | Bucket: [modelops-artifacts]         |  |
|        |  |                  |  | Region: [us-east-1 v]                |  |
|        |  |                  |  |                                      |  |
|        |  +------------------+  | [Test Connection]  [Save]            |  |
|        |                        +--------------------------------------+  |
+--------+------------------------------------------------------------------+
```

### Settings Sections

| Section | Content |
|---------|---------|
| **General** | Theme (dark only for now), language, telemetry opt-out, auto-save interval, default project directory |
| **Cloud Credentials** | API keys for Lambda Labs, RunPod, Modal, S3/R2, HuggingFace. Stored in OS keychain. Test connection buttons. |
| **Python Environments** | Detected Python installations, manage virtual environments, default Python version per project, conda environment management |
| **GPU Defaults** | Default GPU provider priority, preferred instance types, auto-shutdown timeout, max spend per experiment |
| **Storage** | S3/R2 configuration, artifact retention policy, cache size management, export/import settings |
| **Notifications** | Alert preferences (training complete, failure, cost threshold), notification channels (in-app, email, Slack webhook) |
| **Keyboard Shortcuts** | Full shortcut list with customization, import/export keymap profiles |
| **Account** | Email, password change, two-factor authentication, API token for CI/CD integration |
| **Team** | Team name, invite management, role assignments, team settings |
| **Billing** | Current plan, usage metrics, upgrade/downgrade, payment method, invoice history |
| **About** | Version number, changelog link, license information, open source credits |

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| **Color contrast** | All text meets 4.5:1 ratio against dark backgrounds. Status colors have text labels (not color-only). |
| **Keyboard navigation** | Full keyboard access to all features. Visible focus indicators on all interactive elements. |
| **Screen reader** | ARIA labels on all icons, charts, and interactive elements. Live regions for training status updates. |
| **Focus management** | Focus trapped in modals. Focus restored after dialog close. Logical tab order throughout. |
| **Motion** | Reduced motion mode disables chart animations and pipeline node transitions. |
| **Text scaling** | UI responds to system font size preferences up to 200%. |
| **Error identification** | Form errors identified by text (not just red color). Error messages are descriptive and actionable. |
| **Landmarks** | ARIA landmarks for navigation, main content, and complementary panels. |

### Keyboard Navigation Map

| Context | Keys | Action |
|---------|------|--------|
| Global | `Ctrl+1-9` | Switch to sidebar tab (1=Explorer, 2=Pipeline, etc.) |
| Global | `Ctrl+P` | Open command palette |
| Global | `Ctrl+,` | Open settings |
| Global | `Ctrl+Shift+E` | Focus file explorer |
| Pipeline | Arrow keys | Navigate between nodes |
| Pipeline | Enter | Open selected node config |
| Pipeline | Tab | Cycle through node ports |
| Table | Arrow keys | Navigate cells |
| Table | Space | Toggle row selection |
| Table | Enter | Expand/collapse row detail |
