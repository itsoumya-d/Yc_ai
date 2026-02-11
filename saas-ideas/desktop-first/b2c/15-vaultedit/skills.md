# VaultEdit -- Required Skills & Expertise

## Skills Overview

Building VaultEdit requires a rare intersection of deep systems programming (video codecs, GPU rendering), modern frontend development (Electron, React), AI/ML integration (Whisper, LLMs), and domain expertise in video editing workflows and the YouTube creator economy. This document maps every skill required, its importance, where it applies, and how to acquire it.

---

## Technical Skills

### T1. Electron Desktop Development

| Detail | Value |
|---|---|
| **Importance** | Critical |
| **Team Members** | Frontend Engineer, Full-Stack Engineer |
| **Where Used** | Application shell, IPC communication, file system access, auto-updates, native menu bar, system tray, GPU process management |

**Core Competencies:**

- Electron main process vs. renderer process architecture
- IPC (Inter-Process Communication) patterns: `ipcMain`, `ipcRenderer`, `contextBridge`
- Preload scripts and context isolation (security-critical for desktop apps)
- Native Node.js module integration (N-API bindings for Rust video engine)
- Auto-update system with `electron-updater` (differential updates to minimize download size)
- Code signing and notarization (macOS: Apple Developer ID, Windows: EV certificate)
- Electron-builder configuration for multi-platform packaging (DMG, NSIS, AppImage)
- Memory management in Electron (avoiding renderer process bloat with large video data)
- Crash reporting and diagnostics collection
- Deep OS integration: file associations (.vaultedit project files), protocol handlers, drag-and-drop from Finder/Explorer

**Learning Resources:**

- Electron official documentation: https://www.electronjs.org/docs
- "Electron in Action" by Steve Kinney (Manning)
- Electron Fiddle for rapid prototyping
- Study the VS Code codebase (open source Electron app with panel layout similar to VaultEdit)
- Study the Figma desktop app architecture (Electron + high-performance rendering)

---

### T2. React & Modern Frontend

| Detail | Value |
|---|---|
| **Importance** | Critical |
| **Team Members** | Frontend Engineer |
| **Where Used** | All UI screens, state management, component library, panel layout system |

**Core Competencies:**

- React 19 features: Server Components (for template library), Suspense, transitions, use() hook
- Zustand state management: multiple stores (project state, editor state, UI state, AI state), middleware, persistence
- Complex component architecture: compound components for timeline, virtualized lists for transcript
- Performance optimization: React.memo, useMemo, useCallback, React DevTools profiling, avoiding unnecessary re-renders in a 60fps editor
- Canvas integration: using refs and useEffect for WebGL/Canvas 2D rendering within React components
- Drag-and-drop: @dnd-kit for file import, timeline rearrangement, panel resizing
- Accessibility: WAI-ARIA patterns, focus management, keyboard navigation, screen reader testing
- Responsive panel layout: CSS Grid/Flexbox with drag-to-resize dividers
- Custom hooks for video editor patterns: usePlayback, useTimeline, useTranscript, useUndoRedo

**Learning Resources:**

- React documentation: https://react.dev
- Zustand documentation and examples: https://zustand-demo.pmnd.rs/
- "Patterns.dev" for React design patterns
- Study Figma's React architecture for inspiration on editor-style UIs
- TanStack ecosystem documentation (Query, Virtual, Table)

---

### T3. FFmpeg & Video Processing

| Detail | Value |
|---|---|
| **Importance** | Critical |
| **Team Members** | Systems Engineer, Video Engine Developer |
| **Where Used** | Video import, transcoding, export, audio extraction, format conversion, hardware-accelerated encoding |

**Core Competencies:**

- FFmpeg CLI mastery: transcoding, filtering, concatenation, stream mapping, subtitle embedding
- FFmpeg as a library: libavformat, libavcodec, libavfilter, libswscale, libswresample
- Container formats: MP4 (ISOBMFF), MKV (Matroska), MOV (QuickTime), WebM
- Video codecs: H.264 (AVC), H.265 (HEVC), VP9, AV1 -- understanding of encoding parameters, quality vs. file size tradeoffs
- Audio codecs: AAC, Opus, MP3, FLAC -- understanding of bitrate, sample rate, channel layout
- Hardware-accelerated encoding: NVENC (NVIDIA), VideoToolbox (macOS), QSV (Intel), AMF (AMD)
- Filter graph construction: complex filter chains for effects, overlays, scaling, color correction
- Demuxing and remuxing: extracting streams, combining streams, format conversion without re-encoding
- Seeking and frame-accurate cutting: keyframe alignment, smart rendering (re-encode only cut points)
- FFmpeg.wasm: running FFmpeg in WebAssembly for lightweight operations in the renderer process
- Performance profiling: measuring encode/decode speed, identifying bottlenecks, optimizing filter chains

**Key FFmpeg Commands for VaultEdit:**

```bash
# Extract audio for transcription
ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 output.wav

# Export YouTube-optimized
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 320k
       -movflags +faststart -pix_fmt yuv420p output.mp4

# Burn-in captions
ffmpeg -i input.mp4 -vf "subtitles=captions.srt:force_style='FontSize=24'"
       output.mp4

# Generate thumbnail strip
ffmpeg -i input.mp4 -vf "fps=1/10,scale=160:-1,tile=10x1" thumbstrip.png

# Hardware-accelerated encode (macOS)
ffmpeg -i input.mp4 -c:v h264_videotoolbox -b:v 10M output.mp4
```

**Learning Resources:**

- FFmpeg official documentation: https://ffmpeg.org/documentation.html
- "FFmpeg Basics" by Frantisek Korbel
- FFmpeg Wiki: https://trac.ffmpeg.org/wiki
- The `ffmpeg-next` Rust crate documentation
- Werner Robitza's FFmpeg encoding guides

---

### T4. WebGL & GPU-Accelerated Rendering

| Detail | Value |
|---|---|
| **Importance** | High |
| **Team Members** | Graphics Engineer, Video Engine Developer |
| **Where Used** | Real-time video preview, effects rendering, timeline thumbnail strip, waveform visualization |

**Core Competencies:**

- WebGL 2.0: shaders (vertex, fragment), textures, framebuffers, blending
- GLSL shader programming: color correction shaders, compositing shaders, transition effects
- Video texture upload: efficiently uploading decoded video frames to GPU textures (avoiding CPU-GPU copies)
- Compositing pipeline: layering video, captions, overlays, and effects in a single render pass
- Performance: maintaining 30fps+ preview with effects applied, frame timing, GPU profiling
- Canvas 2D API: for timeline rendering (waveforms, thumbnail strips, markers)
- OffscreenCanvas: for background rendering without blocking the main thread
- GPU memory management: texture atlas, frame cache, memory budget

**Learning Resources:**

- WebGL2 Fundamentals: https://webgl2fundamentals.org
- "WebGL Programming Guide" by Kouichi Matsuda
- Three.js source code (for understanding WebGL abstraction patterns)
- GPU Gems series (NVIDIA) for advanced rendering techniques
- Chrome DevTools GPU profiling

---

### T5. Whisper AI & Speech Recognition

| Detail | Value |
|---|---|
| **Importance** | Critical |
| **Team Members** | AI/ML Engineer |
| **Where Used** | Video transcription, word-level timestamps, speaker diarization, language detection |

**Core Competencies:**

- OpenAI Whisper API: request formatting, response parsing, word-level timestamp extraction
- Whisper model architecture: understanding of encoder-decoder transformer for audio
- Audio preprocessing: optimal format for Whisper (16kHz, mono, WAV/FLAC), chunking long audio
- Timestamp alignment: converting Whisper word timestamps to frame-accurate video positions
- Speaker diarization: using pyannote.audio or similar for identifying different speakers
- Error handling: dealing with hallucinations, repeated text, low-confidence segments
- Local Whisper: running Whisper.cpp or faster-whisper for offline mode
- Alternatives: Deepgram (streaming, faster), AssemblyAI (better diarization), Google Speech-to-Text
- Cost optimization: batching requests, caching transcriptions, audio compression before upload

**Learning Resources:**

- OpenAI Whisper API documentation: https://platform.openai.com/docs/guides/speech-to-text
- Whisper paper: "Robust Speech Recognition via Large-Scale Weak Supervision"
- Whisper.cpp repository: https://github.com/ggerganov/whisper.cpp
- pyannote.audio documentation for speaker diarization

---

### T6. LLM Integration (GPT-4o)

| Detail | Value |
|---|---|
| **Importance** | Critical |
| **Team Members** | AI/ML Engineer, Backend Engineer |
| **Where Used** | Natural language edit commands, scene analysis, chapter generation, highlight identification |

**Core Competencies:**

- OpenAI API: chat completions, function calling, structured outputs (JSON mode)
- Prompt engineering: crafting system prompts that reliably translate edit commands into structured operations
- Function calling: defining edit operation schemas that GPT-4o can populate
- Context management: fitting transcript + project metadata + edit history within token limits
- Streaming responses: displaying AI responses as they generate (for perceived speed)
- Error handling: malformed responses, hallucinated timestamps, impossible operations
- Cost optimization: prompt caching, shorter context windows, selective context inclusion
- Fine-tuning: eventually fine-tuning a model on VaultEdit-specific edit command data
- Evaluation: building test suites for AI command accuracy, regression testing

**Example System Prompt Pattern:**

```
You are VaultEdit's editing AI. Given a transcript with timestamps and an
editing command, output a JSON array of edit operations.

Available operations:
- cut(start_ms, end_ms): Remove a segment
- zoom(start_ms, end_ms, scale): Apply zoom effect
- speed(start_ms, end_ms, rate): Change playback speed
- caption(start_ms, end_ms, text, style): Add caption
- chapter(timestamp_ms, title): Add chapter marker

Rules:
- All timestamps in milliseconds
- Never cut more than the user requested
- Always explain your reasoning before the operation list
```

**Learning Resources:**

- OpenAI API documentation: https://platform.openai.com/docs
- "Prompt Engineering Guide": https://www.promptingguide.ai
- Anthropic's research on constitutional AI (for safety in edit commands)
- LangChain and LangSmith for LLM application development patterns

---

### T7. Rust Systems Programming

| Detail | Value |
|---|---|
| **Importance** | High |
| **Team Members** | Systems Engineer, Video Engine Developer |
| **Where Used** | Video engine core, audio processing, GPU acceleration layer, performance-critical paths |

**Core Competencies:**

- Rust ownership model, borrowing, lifetimes -- essential for managing large video buffers safely
- Async Rust with Tokio: concurrent video/audio processing pipelines
- FFI (Foreign Function Interface): calling C libraries (FFmpeg) from Rust safely
- N-API bindings: exposing Rust functions to Node.js/Electron via `napi-rs`
- Error handling: Result/Option patterns, custom error types, error propagation
- Performance optimization: zero-copy operations, SIMD intrinsics for audio processing, memory-mapped files
- Unsafe Rust: necessary for GPU API bindings and FFmpeg C interop, must be minimized and audited
- Testing: unit tests, integration tests, benchmark tests (criterion.rs)
- Cross-compilation: building for macOS (x86_64, ARM64), Windows (x86_64), Linux (x86_64)

**Learning Resources:**

- "The Rust Programming Language" (The Book): https://doc.rust-lang.org/book/
- "Rust for Rustaceans" by Jon Gjengset (intermediate/advanced)
- "Programming Rust" by Blandy, Orendorff, and Tindall (O'Reilly)
- Tokio documentation: https://tokio.rs
- napi-rs documentation: https://napi.rs

---

### T8. WebAssembly

| Detail | Value |
|---|---|
| **Importance** | Medium |
| **Team Members** | Systems Engineer |
| **Where Used** | Lightweight video operations in renderer process, potential future web version |

**Core Competencies:**

- Compiling Rust to WASM (wasm-pack, wasm-bindgen)
- FFmpeg.wasm for browser-side video operations
- SharedArrayBuffer for sharing video frame data between WASM and JavaScript
- WASM performance profiling and optimization
- WASM vs. native module tradeoffs (when to use each)

**Learning Resources:**

- Rust and WebAssembly book: https://rustwasm.github.io/docs/book/
- wasm-pack documentation: https://rustwasm.github.io/wasm-pack/
- FFmpeg.wasm repository: https://github.com/ffmpegwasm/ffmpeg.wasm

---

### T9. Audio Processing

| Detail | Value |
|---|---|
| **Importance** | High |
| **Team Members** | Systems Engineer, Audio Developer |
| **Where Used** | Silence detection, loudness normalization, audio ducking, waveform visualization, noise reduction |

**Core Competencies:**

- Digital audio fundamentals: sample rate, bit depth, channels, PCM encoding
- Loudness measurement: LUFS (Loudness Units Full Scale), true peak, loudness range
- Audio normalization: targeting -14 LUFS for YouTube (EBU R128 / ITU-R BS.1770)
- Silence detection: energy-based analysis, configurable threshold and duration
- Audio ducking: detecting speech segments and reducing music volume during speech
- Waveform generation: downsampling audio data for visual representation
- Noise reduction: spectral gating, adaptive noise floor estimation
- Audio mixing: multi-track mixing with volume, pan, and effects per track
- FFT (Fast Fourier Transform): frequency domain analysis for noise detection and audio effects

**Learning Resources:**

- "Designing Audio Effect Plugins in C++" by Will Pirkle (concepts transfer to Rust)
- EBU R128 loudness recommendation specification
- YouTube's recommended audio specifications
- The `dasp` Rust crate for digital audio signal processing

---

## Domain Knowledge

### D1. Video Editing Workflows

| Detail | Value |
|---|---|
| **Importance** | Critical |
| **Team Members** | Product Manager, Designer, All Engineers |
| **Where Used** | Feature design, UX decisions, AI command interpretation |

**Core Competencies:**

- Non-linear editing (NLE) concepts: timeline, tracks, clips, transitions, effects, keyframes
- Edit decision list (EDL): non-destructive editing model, how edits are stored vs. applied
- Editing terminology: cut, trim, split, ripple edit, roll edit, slip edit, slide edit
- Common YouTube editing patterns: jump cuts, talking head editing, b-roll insertion, reaction videos, tutorials
- Audio editing in video: voiceover, music bed, sound design, audio sync
- Color correction vs. color grading: technical correction vs. creative look
- Proxy editing: editing with low-resolution proxies, relinking to full-resolution for export
- Render pipeline: decode -> process -> encode, the distinction between preview render and export render

**Learning Resources:**

- Use Premiere Pro, DaVinci Resolve, and Descript for at least 20 hours each
- Watch YouTube creator vlogs about their editing process (Ali Abdaal, Peter McKinnon, MKBHD)
- "In the Blink of an Eye" by Walter Murch (theory of editing)
- YouTube Creator Academy free courses

---

### D2. YouTube Algorithm & Platform Optimization

| Detail | Value |
|---|---|
| **Importance** | High |
| **Team Members** | Product Manager, AI/ML Engineer |
| **Where Used** | Chapter generation, thumbnail optimization, retention-based editing suggestions |

**Core Competencies:**

- YouTube recommendation algorithm: how watch time, CTR, retention curves, and session time influence recommendations
- Retention optimization: how editing pace, b-roll, jump cuts, and visual variety affect viewer retention
- Chapter markers: YouTube's requirements (must start at 0:00, minimum 3 chapters, 10+ seconds each)
- Thumbnail best practices: face close-ups, high contrast, 3 words max, emotion, curiosity gap
- YouTube SEO: title optimization, description keywords, tags, hashtags
- YouTube Analytics API: accessing retention data, CTR, impressions, traffic sources
- Shorts vs. long-form: different algorithm, different optimization strategies
- Content categories: how editing style differs for education, entertainment, gaming, vlog, tutorial

**Learning Resources:**

- YouTube Creator Academy
- Creator Insider YouTube channel (official YouTube updates)
- VidIQ and TubeBuddy tools (understand what creators use)
- "YouTube Secrets" by Sean Cannell and Benji Travis
- YouTube Data API documentation

---

### D3. Color Science Basics

| Detail | Value |
|---|---|
| **Importance** | Medium |
| **Team Members** | Video Engine Developer, Designer |
| **Where Used** | Color correction presets, LUT support, color matching between clips |

**Core Competencies:**

- Color spaces: Rec. 709 (SDR), Rec. 2020 (HDR), sRGB, DCI-P3
- Color models: RGB, HSL, YCbCr (how video stores color vs. how humans perceive color)
- White balance: color temperature (Kelvin), tint correction
- LUTs (Look-Up Tables): 1D vs. 3D LUTs, .cube format, applying LUTs in a rendering pipeline
- Dynamic range: SDR vs. HDR, log encoding, tone mapping
- Histogram and vectorscope: tools for analyzing color distribution in video frames
- Color management in video pipelines: maintaining color accuracy from import to export

**Learning Resources:**

- "Color Correction Handbook" by Alexis Van Hurkman
- DaVinci Resolve's color science documentation
- "Color and Mastering for Digital Cinema" by Glenn Kennel
- YouTube tutorials by Casey Faris on color grading

---

### D4. Content Creation Lifecycle

| Detail | Value |
|---|---|
| **Importance** | High |
| **Team Members** | Product Manager, Designer |
| **Where Used** | Feature prioritization, workflow design, understanding creator pain points |

**Core Competencies:**

- Full lifecycle: ideation -> scripting -> filming -> editing -> thumbnail -> upload -> optimization -> analytics
- Creator types: talking head, tutorials, vlogs, gaming, reactions, podcasts, short-form, animation
- Creator tech stacks: cameras, microphones, lighting, editing software, scheduling tools
- Creator economics: AdSense revenue, sponsorships, merchandise, memberships, Patreon
- Creator burnout: causes (editing time is #1), solutions, sustainable content schedules
- Multi-platform publishing: repurposing content for YouTube, TikTok, Instagram, Twitter, LinkedIn
- Content teams: roles (editor, thumbnail designer, scriptwriter), workflows, handoff points

**Learning Resources:**

- Interview 20+ YouTube creators of different sizes and genres
- Follow creator-focused newsletters (Colin and Samir, Roberto Blake)
- Use creator tools: Notion templates for content planning, Canva for thumbnails, TubeBuddy for SEO
- Attend VidCon, Playlist Live, or Creator Economy conferences

---

## Design Skills

### DS1. Video Editor UX Conventions

| Detail | Value |
|---|---|
| **Importance** | Critical |
| **Team Members** | Product Designer |
| **Where Used** | All editor screens, panel layout, interaction patterns |

**Core Competencies:**

- Timeline interaction patterns: click-to-seek, drag-to-scrub, scroll-to-zoom, selection ranges
- Panel layout conventions: preview top-left, timeline bottom, inspector right (industry standard)
- Playback controls: transport bar conventions, JKL keyboard shortcuts, frame stepping
- Waveform rendering: audio level visualization, scrolling, zoom levels
- Thumbnail strip: video frame preview on timeline track, density at different zoom levels
- Context menus: right-click operations for clips, tracks, markers
- Modal vs. non-modal editing: when to use dialogs vs. inline editing
- Undo/redo UX: edit history panel, step-through, branching undo

**Learning Resources:**

- Deep study of Premiere Pro, DaVinci Resolve, Final Cut Pro, Descript, and CapCut UIs
- "Designing for the Digital Age" by Kim Goodwin (complex application design)
- Figma community files for video editor UI kits

---

### DS2. Dark UI Design for Video Work

| Detail | Value |
|---|---|
| **Importance** | High |
| **Team Members** | Product Designer |
| **Where Used** | Entire application theme, every screen |

**Core Competencies:**

- Dark theme design principles: reduced eye strain during long editing sessions, accurate color perception
- Contrast management: ensuring readability without bright whites that distract from video content
- Surface hierarchy in dark themes: subtle luminance differences between panel levels
- Accent color usage: how to make interactive elements stand out on dark backgrounds
- Focus states: visible focus indicators that work on dark backgrounds
- Text rendering: font weight considerations on dark backgrounds (light text appears thinner)
- Icon design for dark backgrounds: outline vs. filled styles, luminance requirements
- Video preview framing: dark surround enhances perceived contrast and color accuracy of video content

**Learning Resources:**

- Material Design dark theme guidelines
- Apple Human Interface Guidelines (dark mode section)
- Study DaVinci Resolve's UI (best-in-class dark video editing UI)
- "Refactoring UI" by Adam Wathan and Steve Schoger

---

### DS3. Waveform & Timeline Rendering

| Detail | Value |
|---|---|
| **Importance** | High |
| **Team Members** | Frontend Engineer, Designer |
| **Where Used** | Audio waveform display, timeline track visualization, thumbnail strip |

**Core Competencies:**

- Audio waveform rendering: min/max per pixel, RMS display, peak display
- Canvas 2D performance: efficient waveform drawing at 60fps during scrolling/zooming
- Thumbnail strip generation: extracting frames at intervals, scaling, caching
- Timeline zoom: logarithmic vs. linear zoom, smooth zoom animation, anchor point (zoom to cursor)
- Playhead rendering: vertical line with frame-accurate positioning, smooth movement during playback
- Selection rendering: highlighted range with handles for adjustment
- Marker rendering: flags, labels, color-coded markers on the timeline

---

## Business Skills

### B1. Creator Economy Partnerships

| Detail | Value |
|---|---|
| **Importance** | High |
| **Team Members** | CEO, Marketing Lead |
| **Where Used** | User acquisition, product validation, community building |

**Core Competencies:**

- Identifying and approaching YouTube creators for partnerships (beta testing, tutorials, endorsements)
- Creator partnership structures: paid sponsorships, affiliate programs, equity partnerships, free lifetime accounts
- Authenticity requirements: creators will not promote products they do not genuinely use
- Creator manager relationships: working with talent managers and MCNs (Multi-Channel Networks)
- Community building: Discord servers, Reddit communities, creator forums
- Creator events: VidCon, Playlist Live, Creator Economy Expo -- networking and demo opportunities

---

### B2. YouTube Creator Community Marketing

| Detail | Value |
|---|---|
| **Importance** | High |
| **Team Members** | CEO, Marketing Lead |
| **Where Used** | User acquisition, brand building, product awareness |

**Core Competencies:**

- YouTube as a marketing channel: creating tutorial and demo content that serves as both education and acquisition
- "Show, don't tell" marketing: screen recordings demonstrating VaultEdit's speed advantage vs. manual editing
- Creator-to-creator referrals: leveraging the creator network effect (creators recommend tools to other creators)
- Content creator conference presence: demos, workshops, sponsor booths
- Community-led growth: building a community of power users who create tutorials and templates
- ProductHunt launch strategy: timing, preparation, community mobilization

---

### B3. Creator Tool Ecosystem

| Detail | Value |
|---|---|
| **Importance** | Medium |
| **Team Members** | CEO, Product Manager |
| **Where Used** | Integration strategy, partnership opportunities, competitive positioning |

**Core Competencies:**

- Understanding the full creator tool stack: filming (cameras, lighting), editing (VaultEdit), thumbnails (Canva, Photoshop), SEO (VidIQ, TubeBuddy), scheduling (Hootsuite, Buffer), analytics (Social Blade, YouTube Studio)
- Integration opportunities: connect VaultEdit with tools creators already use
- API ecosystem: YouTube Data API, TikTok API, Instagram API -- understanding capabilities and limitations
- Competitive intelligence: monitoring Descript, CapCut, Opus Clip, and new entrants
- Pricing benchmarks: understanding what creators pay for their tool stack and willingness to add another subscription

---

## Unique & Rare Skills

These skills are uncommon and will differentiate VaultEdit's engineering team:

### U1. Video Codec Internals

Understanding how H.264/H.265/VP9/AV1 codecs actually work at the bitstream level. This knowledge is critical for implementing smart rendering (only re-encoding frames at cut points), optimizing export speed, and troubleshooting codec-specific issues.

**Where to Learn:** "H.264 and MPEG-4 Video Compression" by Iain Richardson, ITU-T H.264 specification, x264 and x265 source code.

### U2. Real-Time Video Compositing

Combining multiple visual layers (video, captions, overlays, effects) into a single output at 30fps+ using GPU shaders. This is the core of the preview renderer and requires deep understanding of GPU rendering pipelines.

**Where to Learn:** Game engine rendering pipeline documentation (Unreal, Unity), OBS Studio source code, Natron (open-source compositing software).

### U3. Transcript-to-Video Synchronization

Maintaining frame-accurate sync between a text transcript and video timeline as edits are made. This requires custom data structures (interval trees, segment trees) and careful handling of non-destructive edits that can split, merge, and reorder segments.

**Where to Learn:** No standard resources exist. Study Descript's approach (reverse engineering via their product), implement from first principles using computational geometry concepts.

### U4. AI Edit Command Parsing

Translating natural language editing instructions into precise, frame-accurate edit operations. This requires prompt engineering expertise combined with deep video editing domain knowledge. The challenge is handling ambiguity, partial instructions, and context-dependent commands.

**Where to Learn:** Build and iterate. Start with simple commands (remove silence) and progressively handle more complex ones (match pacing to reference video). Evaluate against a test suite of 500+ real creator commands.

---

## Team Skill Matrix

| Skill | Founding Eng 1 (Systems) | Founding Eng 2 (AI/ML) | Founding Eng 3 (Frontend) | Designer | CEO/Product |
|---|---|---|---|---|---|
| Electron | - | - | Expert | - | - |
| React | - | - | Expert | Familiar | - |
| FFmpeg | Expert | - | Familiar | - | - |
| Rust | Expert | Familiar | - | - | - |
| WebGL/GPU | Expert | - | Familiar | - | - |
| Whisper/STT | Familiar | Expert | - | - | - |
| LLM/GPT-4o | - | Expert | Familiar | - | - |
| Audio Processing | Expert | Familiar | - | - | - |
| Video Editing UX | Familiar | - | Familiar | Expert | Familiar |
| YouTube/Creator | - | Familiar | - | Familiar | Expert |
| Dark UI Design | - | - | Familiar | Expert | - |
| Business/Growth | - | - | - | - | Expert |

---

## Hiring Priority

| Priority | Role | Key Skills | When to Hire |
|---|---|---|---|
| 1 | Founding Engineer (Systems/Video) | Rust, FFmpeg, GPU rendering, audio processing | Day 1 |
| 2 | Founding Engineer (AI/ML) | Whisper, GPT-4o, prompt engineering, ML pipelines | Day 1 |
| 3 | Founding Engineer (Frontend/Electron) | Electron, React, Canvas/WebGL, complex UI | Day 1 |
| 4 | Product Designer | Video editor UX, dark UI, information-dense interfaces | Month 1-2 |
| 5 | CEO/Product Lead | YouTube creator domain, community building, growth | Day 1 (founder) |
| 6 | DevOps/Infrastructure | CI/CD, code signing, auto-updates, monitoring | Month 4-6 |
| 7 | Growth Marketing | Creator partnerships, YouTube marketing, community | Month 6-8 |
| 8 | Customer Success | Creator support, bug triage, feedback collection | Month 6-8 |

---

*The rarest skill in building VaultEdit is not any single technology -- it is the ability to think like a video editor while engineering like a systems programmer.*
