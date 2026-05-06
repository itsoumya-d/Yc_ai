# PatternForge -- API Guide

## APIs & Services Overview

| Service | Purpose | Type | Cost Model |
|---|---|---|---|
| OpenAI API | NL understanding, design intent, chat | Cloud API | Per-token |
| Replicate / Modal | GPU inference for 3D generation | Cloud GPU | Per-second / per-inference |
| Three.js | Client-side 3D rendering | Library (local) | Free (MIT) |
| OpenCascade.js | WASM solid modeling | Library (local) | Free (LGPL) |
| OpenSCAD | Parametric design engine | Library (local) | Free (GPL) |
| Cloudflare R2 | STL file storage, design assets | Cloud storage | Per-GB stored |
| Supabase | Auth, database, realtime | Cloud BaaS | Tiered |
| Printables API | Community design integration | Cloud API | Free |

---

## 1. OpenAI API

### Purpose

Natural language understanding for design intent extraction, conversational design modification, and structured parameter output. This is the "brain" that translates human descriptions into machine-readable design specifications.

### Setup

**1. Get API Key:**
- Sign up at https://platform.openai.com
- Navigate to API Keys section
- Create a new secret key
- Store securely using Electron's `safeStorage` API

**2. Install SDK:**
```bash
pnpm add openai
```

**3. Initialize Client:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: await getStoredApiKey('openai'), // From Electron safeStorage
});
```

### Usage in PatternForge

**Design Intent Extraction (Primary Use):**

```typescript
const systemPrompt = `You are a 3D printing design interpreter. Given a natural language
description, output a JSON object with design parameters.

Output format:
{
  "shape_type": "box|cylinder|sphere|custom|...",
  "operations": [
    {"type": "extrude|revolve|sweep|boolean_subtract|fillet|chamfer|...", "params": {...}}
  ],
  "dimensions": {"width": number_mm, "height": number_mm, "depth": number_mm},
  "features": [{"type": "hole|slot|fillet|pattern|text|...", "params": {...}}],
  "material_hint": "PLA|PETG|ABS|TPU",
  "print_orientation": "default|on_side|upside_down",
  "openscad_script": "// OpenSCAD code to generate this design"
}

Rules:
- All dimensions in millimeters
- Minimum wall thickness: 0.8mm for FDM
- If dimensions are ambiguous, ask for clarification
- Always include an OpenSCAD script that generates the design
- Consider printability in all design decisions`;

async function extractDesignIntent(userPrompt: string): Promise<DesignParameters> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3, // Low temperature for precise parameters
    max_tokens: 2000,
  });

  return JSON.parse(response.choices[0].message.content) as DesignParameters;
}
```

**Conversational Modification:**

```typescript
async function modifyDesign(
  conversationHistory: Message[],
  currentParams: DesignParameters,
  userModification: string
): Promise<DesignParameters> {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    {
      role: 'user',
      content: `Current design parameters: ${JSON.stringify(currentParams)}

User modification request: ${userModification}

Output the COMPLETE updated design parameters JSON, incorporating this modification.`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 2000,
  });

  return JSON.parse(response.choices[0].message.content) as DesignParameters;
}
```

**Clarification Questions (When Input is Ambiguous):**

```typescript
// Use GPT-4o-mini for fast clarification checks
async function checkAmbiguity(userPrompt: string): Promise<ClarificationResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Analyze this 3D printing design request. If any critical dimensions,
features, or requirements are ambiguous, return questions to ask. If the request
is clear enough to proceed, return empty questions array.

Output JSON: { "is_clear": boolean, "questions": string[], "assumptions": string[] }`,
      },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 500,
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### Pricing

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Use Case |
|---|---|---|---|
| GPT-4o | $2.50 | $10.00 | Complex design intent, initial generation |
| GPT-4o-mini | $0.15 | $0.60 | Clarification, simple modifications, ambiguity check |

**Estimated Cost per Design Generation:**
- Initial generation (GPT-4o): ~500 input tokens + ~1500 output tokens = ~$0.016
- Each modification turn (GPT-4o): ~800 input tokens + ~1500 output tokens = ~$0.017
- Clarification check (GPT-4o-mini): ~200 input tokens + ~200 output tokens = ~$0.00015
- Average session (1 generation + 3 modifications): ~$0.07

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| Anthropic Claude API | Strong structured output, good reasoning | Less ecosystem tooling |
| Google Gemini API | Multimodal (image input), competitive pricing | Less reliable structured JSON output |
| Local LLM (Llama 3) | Zero API cost, privacy, offline | Requires GPU, lower quality for specialized tasks |
| Custom fine-tuned model | Optimized for design domain, lower cost at scale | High upfront training cost ($5K-50K) |

### Authentication

- API key stored in Electron `safeStorage` (OS keychain)
- Key entered during onboarding or in Settings
- Never sent to PatternForge servers -- direct client-to-OpenAI communication
- Rate limiting handled client-side with exponential backoff

---

## 2. Replicate / Modal (GPU Cloud)

### Purpose

GPU-accelerated inference for complex 3D generation tasks that cannot run locally: image-to-3D conversion, complex mesh generation, and custom fine-tuned model inference.

### Modal Setup

**1. Create Account:**
- Sign up at https://modal.com
- Install CLI: `pip install modal`
- Authenticate: `modal token new`

**2. Define GPU Function:**

```python
# modal_functions.py
import modal

app = modal.App("patternforge")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("torch", "trimesh", "numpy", "open3d")
    .pip_install("triposr")  # Example 3D generation model
)

@app.function(
    image=image,
    gpu=modal.gpu.A10G(),
    timeout=120,
    retries=2,
)
def generate_3d_from_image(image_bytes: bytes, params: dict) -> bytes:
    """Generate a 3D mesh from an input image."""
    import trimesh
    from triposr import TripoSR

    model = TripoSR.from_pretrained("stabilityai/TripoSR")
    mesh = model.generate(image_bytes, **params)

    # Post-process for printability
    mesh = ensure_manifold(mesh)
    mesh = enforce_min_wall_thickness(mesh, min_thickness=0.8)

    # Export as STL bytes
    return mesh.export(file_type='stl')


@app.function(
    image=image,
    gpu=modal.gpu.A10G(),
    timeout=60,
)
def generate_complex_mesh(design_params: dict) -> bytes:
    """Generate complex mesh from design parameters using custom model."""
    import trimesh

    # Load custom fine-tuned model
    model = load_custom_model("patternforge-gen-v1")
    mesh = model.generate(design_params)

    return mesh.export(file_type='stl')
```

**3. Call from Electron App:**

```typescript
// Client-side call to Modal endpoint
async function generateFromImage(imageBuffer: Buffer): Promise<Buffer> {
  const response = await fetch('https://patternforge--generate-3d-from-image.modal.run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Authorization': `Bearer ${modalApiKey}`,
    },
    body: imageBuffer,
  });

  if (!response.ok) {
    throw new Error(`GPU generation failed: ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
```

### Replicate Setup (Alternative)

**1. Create Account:**
- Sign up at https://replicate.com
- Get API token from Account Settings

**2. Install SDK:**
```bash
pnpm add replicate
```

**3. Run 3D Generation Model:**

```typescript
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: await getStoredApiKey('replicate'),
});

async function generateFromImage(imageUrl: string): Promise<string> {
  const output = await replicate.run(
    'stability-ai/triposr:version-hash',
    {
      input: {
        image: imageUrl,
        output_format: 'stl',
        resolution: 256,
      },
    }
  );

  // output is a URL to the generated STL file
  return output as string;
}
```

### Pricing

**Modal:**

| Resource | Cost | Notes |
|---|---|---|
| A10G GPU | $0.000361/sec (~$1.30/hr) | Primary inference GPU |
| A100 GPU | $0.001036/sec (~$3.73/hr) | Complex generations |
| CPU | $0.000024/sec | Pre/post processing |
| Memory | $0.000003/GB/sec | Mesh data in memory |
| Cold start | ~5-15 seconds | First request after idle |

**Estimated cost per generation:**
- Simple mesh (10s on A10G): ~$0.004
- Complex mesh (30s on A10G): ~$0.011
- Image-to-3D (45s on A10G): ~$0.016

**Replicate:**

| Model Category | Cost | Notes |
|---|---|---|
| TripoSR | ~$0.02-0.05/run | Varies by resolution |
| Custom models | $0.001-0.01/sec on GPU | Depends on model size |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| RunPod | Lower GPU prices, more GPU options | Less serverless (need to manage instances) |
| Lambda Labs | Competitive pricing | Less auto-scaling |
| Self-hosted (Vast.ai) | Cheapest at scale | Operational overhead, less reliable |
| AWS SageMaker | Enterprise features | Complex setup, higher cost |

---

## 3. Three.js

### Purpose

Client-side real-time 3D rendering for the design viewport. Renders generated meshes, grid, axes, dimension annotations, and all interactive 3D elements.

### Setup

```bash
pnpm add three @types/three @react-three/fiber @react-three/drei
```

### Usage

**Viewport Component (React Three Fiber):**

```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';

function DesignViewport({ mesh, printBed, settings }: ViewportProps) {
  return (
    <Canvas
      camera={{ position: [150, 100, 150], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#111827' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 7]} intensity={0.8} castShadow />
      <hemisphereLight
        skyColor="#B0D4FF"
        groundColor="#3B2F2F"
        intensity={0.3}
      />

      {/* Grid */}
      <Grid
        args={[300, 300]}
        cellSize={10}
        cellColor="#374151"
        sectionSize={50}
        sectionColor="#4B5563"
        fadeDistance={400}
        position={[0, 0, 0]}
      />

      {/* Design Mesh */}
      {mesh && (
        <mesh geometry={mesh.geometry}>
          <meshStandardMaterial
            color="#D1D5DB"
            roughness={0.7}
            metalness={0}
          />
        </mesh>
      )}

      {/* Print Bed Outline */}
      {printBed.visible && (
        <PrintBedOutline
          width={printBed.width}
          depth={printBed.depth}
          height={printBed.height}
        />
      )}

      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.1}
        minDistance={10}
        maxDistance={1000}
      />

      {/* Axis Gizmo */}
      <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
        <GizmoViewport
          axisColors={['#EF4444', '#22C55E', '#3B82F6']}
          labelColor="white"
        />
      </GizmoHelper>
    </Canvas>
  );
}
```

**Loading STL Files:**

```typescript
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';

async function loadSTL(buffer: ArrayBuffer): Promise<THREE.BufferGeometry> {
  const loader = new STLLoader();
  const geometry = loader.parse(buffer);

  // Center geometry
  geometry.computeBoundingBox();
  const center = new THREE.Vector3();
  geometry.boundingBox!.getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);

  // Compute normals for proper lighting
  geometry.computeVertexNormals();

  return geometry;
}
```

### Pricing

| Item | Cost |
|---|---|
| Three.js library | Free (MIT license) |
| React Three Fiber | Free (MIT license) |
| Drei helpers | Free (MIT license) |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| Babylon.js | Full-featured, TypeScript-first, PBR | Heavier bundle, less React integration |
| PlayCanvas | Excellent performance, editor | More game-oriented |
| model-viewer | Simple, Google-backed | Too limited for CAD-style interaction |
| Raw WebGL/WebGPU | Maximum performance | Enormous development effort |

---

## 4. OpenCascade.js (WASM)

### Purpose

Solid modeling kernel running in the browser via WebAssembly. Performs boolean operations (union, subtract, intersect), fillets, chamfers, sweeps, lofts, and B-Rep to mesh conversion. This is the engine that turns parametric instructions into actual 3D geometry.

### Setup

```bash
pnpm add opencascade.js
```

### Usage

**Initialize in Web Worker:**

```typescript
// worker/opencascade-worker.ts
import initOpenCascade, { OpenCascadeInstance } from 'opencascade.js';

let oc: OpenCascadeInstance;

async function init() {
  oc = await initOpenCascade();
  postMessage({ type: 'ready' });
}

// Handle messages from main thread
self.onmessage = async (event) => {
  const { type, params, id } = event.data;

  switch (type) {
    case 'generate': {
      const result = await generateDesign(params);
      postMessage({ type: 'result', id, mesh: result });
      break;
    }
    case 'boolean': {
      const result = await booleanOperation(params);
      postMessage({ type: 'result', id, mesh: result });
      break;
    }
    case 'fillet': {
      const result = await addFillet(params);
      postMessage({ type: 'result', id, mesh: result });
      break;
    }
  }
};

init();
```

**Boolean Operations Example:**

```typescript
function createBoxWithHole(
  oc: OpenCascadeInstance,
  boxW: number, boxH: number, boxD: number,
  holeRadius: number, holeDepth: number
) {
  // Create box
  const box = new oc.BRepPrimAPI_MakeBox_3(boxW, boxH, boxD).Shape();

  // Create cylinder for hole
  const axis = new oc.gp_Ax2_3(
    new oc.gp_Pnt_3(boxW / 2, boxH / 2, 0),
    new oc.gp_Dir_4(0, 0, 1)
  );
  const hole = new oc.BRepPrimAPI_MakeCylinder_2(axis, holeRadius, holeDepth).Shape();

  // Boolean subtract hole from box
  const result = new oc.BRepAlgoAPI_Cut_3(box, hole, new oc.Message_ProgressRange_1());

  return result.Shape();
}
```

**Tessellation (B-Rep to Mesh):**

```typescript
function tessellate(oc: OpenCascadeInstance, shape: any): Float32Array {
  const deflection = 0.1; // Mesh quality (lower = smoother)
  new oc.BRepMesh_IncrementalMesh_2(shape, deflection, false, 0.5, true);

  const vertices: number[] = [];
  const explorer = new oc.TopExp_Explorer_2(shape, oc.TopAbs_ShapeEnum.TopAbs_FACE);

  while (explorer.More()) {
    const face = oc.TopoDS.Face_1(explorer.Current());
    const location = new oc.TopLoc_Location_1();
    const triangulation = oc.BRep_Tool.Triangulation(face, location);

    if (!triangulation.IsNull()) {
      for (let i = 1; i <= triangulation.get().NbTriangles(); i++) {
        const triangle = triangulation.get().Triangle(i);
        for (let j = 1; j <= 3; j++) {
          const node = triangulation.get().Node(triangle.Value(j));
          vertices.push(node.X(), node.Y(), node.Z());
        }
      }
    }

    explorer.Next();
  }

  return new Float32Array(vertices);
}
```

### Pricing

| Item | Cost |
|---|---|
| OpenCascade.js | Free (LGPL-2.1 license) |
| Note | LGPL requires dynamic linking -- WASM module loaded at runtime satisfies this |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| JSCAD | Pure JavaScript, easy to use | Less capable than OpenCascade for complex operations |
| Manifold (WASM) | Fast boolean operations, MIT license | Mesh-only (no B-Rep), fewer operations |
| CGAL.js | Powerful computational geometry | Heavier, more complex API |
| replicad | TypeScript wrapper around OpenCascade.js | Younger project, thinner community |

---

## 5. OpenSCAD

### Purpose

Parametric 3D design language. PatternForge's AI generates OpenSCAD scripts from natural language, which are then executed to produce solid geometry. OpenSCAD's declarative, code-based approach makes it ideal for AI-generated parametric designs.

### Setup

**Option A: Node.js Child Process (Recommended for MVP)**

```bash
# Install OpenSCAD system-wide (bundled with Electron app)
# macOS: brew install openscad
# Windows: Download from openscad.org
# Linux: apt install openscad
```

**Option B: WASM Build (Future -- for fully in-browser execution)**

```bash
# OpenSCAD WASM builds are experimental
# Monitor: https://github.com/nickcoutsos/openscad-wasm
```

### Usage

**Generate OpenSCAD Script via AI, Execute Locally:**

```typescript
import { execFile } from 'child_process';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

async function executeOpenSCAD(script: string): Promise<Buffer> {
  const tempDir = app.getPath('temp');
  const scadPath = join(tempDir, 'design.scad');
  const stlPath = join(tempDir, 'design.stl');

  // Write OpenSCAD script to temp file
  await writeFile(scadPath, script, 'utf-8');

  // Execute OpenSCAD CLI
  return new Promise((resolve, reject) => {
    execFile(
      getOpenSCADPath(), // Path to bundled OpenSCAD binary
      ['-o', stlPath, scadPath],
      { timeout: 30000 },
      async (error) => {
        if (error) {
          reject(new Error(`OpenSCAD execution failed: ${error.message}`));
          return;
        }
        const stlBuffer = await readFile(stlPath);
        resolve(stlBuffer);
      }
    );
  });
}
```

**Example AI-Generated OpenSCAD Script:**

```openscad
// Phone Stand with Cable Management
// Generated by PatternForge AI

// Parameters (editable)
phone_width = 75;        // mm
phone_thickness = 9;     // mm
stand_height = 80;       // mm
base_width = 100;        // mm
base_depth = 80;         // mm
base_thickness = 5;      // mm
viewing_angle = 65;      // degrees
cable_slot_width = 15;   // mm
cable_slot_height = 10;  // mm
wall_thickness = 3;      // mm
fillet_radius = 3;       // mm

module phone_stand() {
    difference() {
        union() {
            // Base plate
            minkowski() {
                cube([base_width - 2*fillet_radius,
                      base_depth - 2*fillet_radius,
                      base_thickness - 1]);
                cylinder(r=fillet_radius, h=1, $fn=32);
            }

            // Phone support
            translate([base_width/2 - phone_width/2 - wall_thickness,
                      base_depth - wall_thickness*2,
                      base_thickness])
            rotate([90 - viewing_angle, 0, 0])
            difference() {
                cube([phone_width + wall_thickness*2,
                      wall_thickness,
                      stand_height]);
                translate([wall_thickness, -0.1, wall_thickness])
                cube([phone_width, wall_thickness + 0.2,
                      stand_height - wall_thickness]);
            }
        }

        // Cable management slot
        translate([base_width/2 - cable_slot_width/2,
                  base_depth - wall_thickness*3,
                  -0.1])
        cube([cable_slot_width, wall_thickness*4,
              cable_slot_height + base_thickness + 0.2]);
    }
}

phone_stand();
```

### Pricing

| Item | Cost |
|---|---|
| OpenSCAD | Free (GPL-2.0 license) |
| Note | Bundled binary must comply with GPL (source code of OpenSCAD must remain available, but PatternForge's proprietary code that calls it is not affected) |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| CadQuery (Python) | More expressive, Python-based | Requires Python runtime |
| ImplicitCAD | Haskell-based, CSG-focused | Smaller community, less mature |
| libfive | SDF-based, smooth shapes | Different paradigm, harder AI integration |
| Direct OpenCascade.js | No subprocess, fully in-browser | More complex code generation for AI |

---

## 6. Cloudflare R2

### Purpose

Object storage for STL files, design thumbnails, and user-generated assets. Chosen over AWS S3 specifically for zero egress fees, which is critical when users download large STL files (5-50MB each).

### Setup

**1. Create R2 Bucket:**
- Cloudflare Dashboard > R2 > Create Bucket
- Bucket name: `patternforge-designs`
- Location hint: Automatic (nearest region)

**2. Create API Token:**
- Cloudflare Dashboard > R2 > Manage R2 API Tokens
- Permissions: Object Read & Write
- Save Access Key ID and Secret Access Key

**3. Install SDK:**
```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Usage

**Upload STL File:**

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function uploadSTL(
  userId: string,
  designId: string,
  stlBuffer: Buffer
): Promise<string> {
  const key = `users/${userId}/designs/${designId}/model.stl`;

  await r2Client.send(new PutObjectCommand({
    Bucket: 'patternforge-designs',
    Key: key,
    Body: stlBuffer,
    ContentType: 'application/sla',
    Metadata: {
      'design-id': designId,
      'user-id': userId,
    },
  }));

  return `https://assets.patternforge.com/${key}`;
}
```

**Generate Pre-signed Download URL:**

```typescript
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function getDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: 'patternforge-designs',
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 3600 }); // 1 hour
}
```

### Pricing

| Resource | Cost | Notes |
|---|---|---|
| Storage | $0.015/GB/month | First 10GB free |
| Class A operations (PUT, POST, LIST) | $4.50/million | First 1M free/month |
| Class B operations (GET) | $0.36/million | First 10M free/month |
| Egress (data transfer out) | **$0.00 (free)** | Unlimited free egress |

**Cost Projection:**

| Users | Storage | Writes/mo | Reads/mo | Monthly Cost |
|---|---|---|---|---|
| 1K | ~50GB | ~10K | ~50K | ~$0.75 |
| 10K | ~500GB | ~100K | ~500K | ~$7.50 |
| 50K | ~2.5TB | ~500K | ~2.5M | ~$37.50 |
| 100K | ~5TB | ~1M | ~5M | ~$75.00 |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| AWS S3 | Most mature, most features | Egress fees ($0.09/GB) add up fast with large STL downloads |
| Backblaze B2 | Cheap storage ($0.005/GB) | Less CDN integration |
| Supabase Storage | Integrated with Supabase | Less control, higher cost at scale |
| Self-hosted MinIO | Full control | Operational overhead |

---

## 7. Supabase

### Purpose

Backend-as-a-Service providing authentication, PostgreSQL database, and realtime subscriptions. Handles user accounts, design metadata, usage tracking, subscription management, and community features.

### Setup

**1. Create Project:**
- Sign up at https://supabase.com
- Create new project
- Note: Project URL and Anon Key

**2. Install SDK:**
```bash
pnpm add @supabase/supabase-js
```

**3. Initialize Client:**

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types'; // Generated types

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

### Usage

**Authentication:**

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
});

// OAuth (Google)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

**Design CRUD:**

```typescript
// Save design
async function saveDesign(design: DesignInsert): Promise<Design> {
  const { data, error } = await supabase
    .from('designs')
    .insert(design)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get user's designs
async function getUserDesigns(userId: string): Promise<Design[]> {
  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Search designs (marketplace)
async function searchDesigns(query: string, category?: string): Promise<Design[]> {
  let queryBuilder = supabase
    .from('designs')
    .select('*, users(display_name, avatar_url)')
    .eq('is_public', true)
    .textSearch('description', query);

  if (category) {
    queryBuilder = queryBuilder.contains('tags', [category]);
  }

  const { data, error } = await queryBuilder
    .order('download_count', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}
```

**Usage Tracking:**

```typescript
// Increment monthly generation count
async function trackGeneration(userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from('users')
    .select('subscription_tier, designs_generated_this_month')
    .eq('id', userId)
    .single();

  const limits = { free: 3, maker: Infinity, pro: Infinity };
  const limit = limits[user.subscription_tier as keyof typeof limits];

  if (user.designs_generated_this_month >= limit) {
    return false; // Limit reached
  }

  await supabase
    .from('users')
    .update({
      designs_generated_this_month: user.designs_generated_this_month + 1,
    })
    .eq('id', userId);

  return true;
}
```

### Pricing

| Plan | Price | Includes |
|---|---|---|
| Free | $0/month | 50K MAU, 500MB DB, 1GB storage, 2GB bandwidth |
| Pro | $25/month | 100K MAU, 8GB DB, 100GB storage, 250GB bandwidth |
| Team | $599/month | Unlimited MAU, 16GB DB, unlimited storage |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| Firebase | Google ecosystem, real-time DB | NoSQL only, vendor lock-in |
| Appwrite | Self-hostable, open source | Smaller community |
| PocketBase | Single binary, Go-based, embeddable | Less mature, fewer features |
| Custom (Express + PostgreSQL) | Full control | Significant development overhead |

---

## 8. Printables API / Thingiverse API

### Purpose

Community platform integration for browsing, importing, and sharing 3D designs. Allows users to import community designs for remixing and publish PatternForge designs to established platforms.

### Printables API

**Note:** Printables (by Prusa Research) has a GraphQL API.

```typescript
// Printables GraphQL query example
const SEARCH_MODELS = `
  query SearchModels($query: String!, $limit: Int) {
    searchModels(query: $query, limit: $limit) {
      items {
        id
        name
        description
        downloadCount
        likeCount
        datePublished
        images { url }
        stls { url name size }
        user { name avatar }
      }
    }
  }
`;

async function searchPrintables(query: string) {
  const response = await fetch('https://api.printables.com/graphql/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PRINTABLES_API_TOKEN}`,
    },
    body: JSON.stringify({
      query: SEARCH_MODELS,
      variables: { query, limit: 20 },
    }),
  });

  return response.json();
}
```

### Thingiverse API

**Note:** Thingiverse API (v2) requires an application token.

```typescript
const THINGIVERSE_BASE = 'https://api.thingiverse.com';

async function searchThingiverse(query: string) {
  const response = await fetch(
    `${THINGIVERSE_BASE}/search/${encodeURIComponent(query)}?access_token=${THINGIVERSE_TOKEN}`,
    { method: 'GET' }
  );

  return response.json();
}
```

### Pricing

| Platform | API Cost | Notes |
|---|---|---|
| Printables | Free (rate limited) | Requires application approval |
| Thingiverse | Free (rate limited) | API v2, requires app registration |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| Thangs API | Growing platform, 3D search by geometry | Younger platform |
| MyMiniFactory | Curated quality | Smaller library |
| Cults3D | European market | Limited API |
| Custom marketplace | Full control | Cold start problem |

---

## Cost Projections Summary

### Per-User Monthly Costs

| Service | Free User | Maker ($12.99) | Pro ($24.99) |
|---|---|---|---|
| OpenAI API | $0.21 (3 designs x $0.07) | $1.40 (20 designs avg) | $2.80 (40 designs avg) |
| Modal GPU | $0.00 (no GPU features) | $0.10 (basic GPU tasks) | $0.50 (image-to-3D, batch) |
| Cloudflare R2 | $0.001 | $0.005 | $0.01 |
| Supabase (amortized) | $0.001 | $0.003 | $0.005 |
| **Total per user** | **~$0.21** | **~$1.51** | **~$3.32** |
| **Gross margin** | N/A (free) | **88.4%** | **86.7%** |

### Monthly Infrastructure Costs by Scale

| Users | OpenAI | GPU Cloud | R2 | Supabase | Total | Revenue |
|---|---|---|---|---|---|---|
| 1K | $350 | $100 | $1 | $25 | $476 | $3,500 |
| 10K | $3,500 | $1,000 | $8 | $25 | $4,533 | $35,000 |
| 50K | $17,500 | $5,000 | $38 | $599 | $23,137 | $175,000 |
| 100K | $35,000 | $10,000 | $75 | $599 | $45,674 | $350,000 |

**Key Insight:** Infrastructure costs scale roughly linearly with users and represent 10-15% of revenue at scale, yielding strong gross margins (85%+).

---

*Last updated: February 2026*
