# Luminary -- Skills Required

> Technical, domain, design, and business skills needed to build and grow an AI music production companion.

---

## Skill Categories Overview

Building Luminary requires a rare intersection of four skill domains:

```
+-------------------+     +-------------------+
|   TECHNICAL       |     |   DOMAIN          |
|                   |     |                   |
|   Electron, React |     |   Music Theory    |
|   Web Audio API   |     |   Audio Eng.      |
|   MIDI Protocol   |     |   DAW Workflows   |
|   ML/AI           |     |   Genre Knowledge |
+-------------------+     +-------------------+
         \                       /
          \                     /
           +-------------------+
           |   LUMINARY        |
           |   (Intersection)  |
           +-------------------+
          /                     \
         /                       \
+-------------------+     +-------------------+
|   DESIGN          |     |   BUSINESS        |
|                   |     |                   |
|   DAW-style UI    |     |   Creator Economy |
|   Waveform Viz    |     |   Community Mktg  |
|   Dark Mode       |     |   Music Industry  |
|   Audio Widgets   |     |   B2C SaaS        |
+-------------------+     +-------------------+
```

---

## 1. Technical Skills

### 1.1 Electron Development

| Skill | Depth Required | Why |
|---|---|---|
| Electron main/renderer process architecture | Expert | Core application framework; IPC between system-level features and UI |
| Electron Forge (build, package, sign, distribute) | Advanced | App distribution for macOS and Windows, auto-update system |
| Native Node.js modules in Electron | Intermediate | MIDI device access, Ableton Link SDK binding, file system operations |
| Electron security best practices | Advanced | Context isolation, sandboxed preload scripts, secure IPC patterns |
| Auto-update (electron-updater) | Intermediate | Seamless updates without disrupting active sessions |
| Code signing (macOS notarization, Windows signing) | Intermediate | Required for distribution outside app stores |
| System tray integration | Basic | Background running, quick access, notification badges |
| Multi-window management | Intermediate | Side panel mode, detached windows, multi-monitor support |

**Learning Resources**:
- Electron official documentation: https://www.electronjs.org/docs
- "Electron in Action" by Steve Kinney (Manning)
- Electron Forge documentation: https://www.electronforge.io/
- GitHub Electron examples repository

---

### 1.2 React (Desktop Context)

| Skill | Depth Required | Why |
|---|---|---|
| React 18+ (hooks, suspense, concurrent features) | Expert | Entire UI layer built in React |
| Zustand state management | Advanced | Real-time audio state, suggestion queue, project data |
| Canvas API / React Canvas | Advanced | Piano roll, waveform display, spectrum analyzer rendering |
| React performance optimization | Expert | 60fps rendering with real-time audio visualization |
| Radix UI primitives | Intermediate | Accessible knobs, sliders, dropdowns, modals |
| Tailwind CSS (dense layouts) | Advanced | DAW-style compact UI with minimal CSS overhead |
| React Router (in-app navigation) | Intermediate | Screen navigation within Electron |
| useRef / imperative handles | Advanced | Direct DOM manipulation for audio visualization elements |

**Key Considerations**:
- React's virtual DOM adds overhead for real-time visualizations -- use Canvas/WebGL for waveforms and spectrum displays, React for structural UI
- Zustand is preferred over Redux for audio state because it supports mutable state patterns needed for audio buffers
- Frequent re-renders from audio data (60fps) must be isolated to visualization components using React.memo and useMemo

---

### 1.3 Web Audio API & Audio Processing

| Skill | Depth Required | Why |
|---|---|---|
| AudioContext lifecycle management | Expert | Single audio context shared across all features |
| AnalyserNode (FFT, time-domain data) | Expert | Real-time spectrum display, waveform rendering |
| GainNode, BiquadFilterNode | Advanced | Volume control, EQ preview |
| Audio worklets (AudioWorkletNode) | Advanced | Custom DSP processing, loudness metering |
| OfflineAudioContext | Intermediate | Non-real-time audio analysis for import |
| MediaStream API | Intermediate | Audio input capture for live analysis |
| Audio buffer management | Advanced | Memory-efficient handling of large audio files |

**Learning Resources**:
- MDN Web Audio API guide: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- "Web Audio API" by Boris Smus (O'Reilly)
- Web Audio API specification: https://www.w3.org/TR/webaudio/

---

### 1.4 MIDI Protocol

| Skill | Depth Required | Why |
|---|---|---|
| MIDI 1.0 message format | Advanced | Note on/off, CC, program change, pitch bend parsing |
| Web MIDI API | Advanced | Browser-native MIDI device access in Electron |
| MIDI file format (.mid) | Expert | Read/write standard MIDI files for import/export |
| Virtual MIDI ports | Advanced | Send generated MIDI directly to DAW without physical cables |
| MIDI clock synchronization | Intermediate | Tempo sync with external hardware/DAWs |
| MIDI 2.0 (future) | Basic | Awareness of upcoming protocol for higher resolution |

**Key Libraries**:
- Web MIDI API (browser native)
- MIDI.js for file I/O
- JZZ.js for advanced MIDI routing

---

### 1.5 Audio Signal Processing (DSP)

| Skill | Depth Required | Why |
|---|---|---|
| Fast Fourier Transform (FFT) | Advanced | Spectrum analysis, key detection, onset detection |
| Spectral analysis (centroid, rolloff, flux) | Intermediate | Mix quality assessment, genre classification |
| Windowing functions (Hann, Hamming, Blackman) | Intermediate | FFT preprocessing for clean spectral data |
| Loudness metering (LUFS, RMS, peak) | Advanced | Mastering analysis, mix level feedback |
| Onset detection algorithms | Intermediate | Beat detection, transient identification |
| Pitch detection (autocorrelation, YIN) | Intermediate | Note recognition from audio input |
| Chromagram / pitch class profiles | Advanced | Key detection from audio |

**Learning Resources**:
- "DAFX: Digital Audio Effects" by Udo Zolzer
- "Understanding Digital Signal Processing" by Richard Lyons
- Essentia.js documentation and examples
- Julius O. Smith's online DSP courses (Stanford CCRMA)

---

### 1.6 Tone.js

| Skill | Depth Required | Why |
|---|---|---|
| Synth/PolySynth | Advanced | Preview chord and melody suggestions with sound |
| Transport (sequencing, scheduling) | Advanced | Precise playback timing for generated patterns |
| Effects (reverb, delay, chorus) | Intermediate | Enhance preview sounds for better demo experience |
| Meter / FFT / Waveform | Advanced | Level metering and visualization |
| Player (sample playback) | Intermediate | Sample browser preview |
| Clock synchronization | Intermediate | Sync Tone.js transport to Ableton Link |

---

### 1.7 Machine Learning & AI

| Skill | Depth Required | Why |
|---|---|---|
| OpenAI API (Chat Completions, structured output) | Advanced | Music theory chat, arrangement suggestions, production tips |
| Prompt engineering for music domain | Expert | Crafting prompts that produce musically valid, context-aware suggestions |
| TensorFlow.js / Magenta.js | Advanced | On-device melody/harmony generation models |
| Audio feature extraction (Essentia.js) | Advanced | Key/BPM detection, spectral analysis |
| Model evaluation for music tasks | Intermediate | Measuring suggestion quality, A/B testing models |
| Fine-tuning strategies | Intermediate | Adapting models to user-specific styles (Year 2+) |
| ONNX Runtime (on-device inference) | Basic | Future: custom audio models running locally |

---

### 1.8 Real-Time Audio Streaming

| Skill | Depth Required | Why |
|---|---|---|
| Ableton Link protocol | Advanced | Tempo/phase sync with DAWs over local network |
| OSC (Open Sound Control) | Intermediate | Alternative DAW communication protocol |
| Low-latency audio routing | Advanced | Minimizing round-trip delay for live suggestion playback |
| Audio buffer ring patterns | Intermediate | Continuous real-time audio capture without gaps |

---

## 2. Domain Skills (Music)

### 2.1 Music Theory

| Skill | Depth Required | Why |
|---|---|---|
| Harmony (chords, progressions, voice leading) | Expert | Core of the chord lab and suggestion engine |
| Scales and modes (major, minor, dorian, mixolydian, etc.) | Expert | Key detection, melody constraints, suggestion context |
| Rhythm and meter | Advanced | Time signature detection, rhythmic pattern generation |
| Song form and arrangement | Advanced | Arrangement view, structure suggestions |
| Counterpoint basics | Intermediate | Multi-voice melody generation |
| Jazz harmony (extensions, substitutions, reharmonization) | Intermediate | Advanced chord suggestions, genre-specific voicings |
| Modal interchange / borrowed chords | Advanced | Creative chord suggestions beyond diatonic harmony |
| Modulation and key changes | Intermediate | Suggesting key changes for arrangement variety |

**Learning Resources**:
- "Tonal Harmony" by Stefan Kostka (textbook standard)
- "The Jazz Theory Book" by Mark Levine
- musictheory.net (interactive lessons)
- 12tone YouTube channel (approachable theory breakdowns)
- Adam Neely YouTube channel (advanced theory concepts)

---

### 2.2 DAW Workflows

| Skill | Depth Required | Why |
|---|---|---|
| Ableton Live workflow | Expert | Most popular DAW among target users; Link integration |
| FL Studio workflow | Advanced | Second most popular DAW; unique pattern-based workflow |
| Logic Pro workflow | Advanced | macOS-exclusive DAW with large user base |
| Bitwig Studio | Intermediate | Growing DAW with strong MIDI/modulation capabilities |
| Reaper | Basic | Power-user DAW, important for completeness |
| MIDI routing in DAWs | Advanced | Understanding how users receive generated MIDI |
| Audio routing (sends, buses, groups) | Advanced | Context for mixing suggestions |
| Automation and modulation | Intermediate | Arrangement and mix suggestion context |

---

### 2.3 Audio Engineering

| Skill | Depth Required | Why |
|---|---|---|
| Equalization (parametric, shelving, filters) | Expert | Mix feedback: identify and suggest EQ corrections |
| Compression (ratio, threshold, attack, release) | Expert | Mix feedback: dynamic range suggestions |
| Spatial processing (reverb, delay, stereo width) | Advanced | Mix and arrangement suggestions |
| Mastering chain (EQ, compression, limiting, dithering) | Advanced | Mastering assistant feature |
| Loudness standards (LUFS for streaming, broadcast) | Expert | Mastering target recommendations |
| Gain staging | Advanced | Mix level optimization suggestions |
| Frequency masking identification | Advanced | Detect when instruments compete for frequency space |
| Reference track analysis | Intermediate | Compare user's mix to professional references |

---

### 2.4 Music Genres & Production Techniques

| Genre Cluster | Key Techniques to Know |
|---|---|
| **Lo-fi Hip-Hop** | Vinyl noise, tape saturation, sidechain, jazz chords, swing quantize |
| **Trap / Hip-Hop** | 808 tuning, hi-hat rolls, triplet patterns, vocal chops |
| **House / Techno** | Four-on-the-floor, sidechain pumping, filter sweeps, build-ups |
| **Future Bass** | Supersaws, vocal chops, heavy sidechain, wide stereo image |
| **Pop** | Toplining, layered vocals, pre-chorus lift, commercial loudness |
| **R&B / Soul** | Extended chords (9ths, 11ths), neo-soul keys, vocal processing |
| **Ambient / Chillout** | Long reverbs, pad design, granular synthesis, slow modulation |
| **Drum & Bass** | Breakbeats, reese bass, Amen break manipulation, fast hi-hats |
| **Synthwave** | Analog synth emulation, gated reverb, arpeggiation, retro aesthetics |
| **Indie / Alternative** | Guitar textures, live drum feel, dynamic contrast, lo-fi aesthetic |

---

## 3. Design Skills

### 3.1 DAW-Style Dark UI Design

| Skill | Depth Required | Why |
|---|---|---|
| Dark mode design patterns | Expert | Music production is exclusively dark-mode |
| Dense information layout | Expert | Producers expect information-rich interfaces |
| Panel-based layouts (docking, splitting, resizing) | Advanced | DAW convention for workspace organization |
| Professional audio software UI conventions | Advanced | Users expect familiar patterns from Ableton, FL Studio, Logic |
| Micro-interactions for creative tools | Advanced | Hover states, click feedback, drag interactions |
| Responsive desktop layouts (not mobile) | Intermediate | Side panel mode (narrow) vs standalone mode (wide) |

---

### 3.2 Waveform & Audio Visualization

| Skill | Depth Required | Why |
|---|---|---|
| Canvas API for waveform rendering | Expert | Real-time waveform display at 60fps |
| WebGL for spectrum visualization | Advanced | GPU-accelerated FFT display for smooth rendering |
| SVG for static music notation | Intermediate | Chord diagrams, scale visualizations |
| D3.js for data visualization | Intermediate | Energy curves, mix analysis charts |
| Animation (requestAnimationFrame) | Advanced | Smooth real-time audio visualization |
| Color mapping for frequency data | Intermediate | Spectrograms, heat maps for mix analysis |

---

### 3.3 Interactive Music Widgets

| Widget | Design Skill |
|---|---|
| **Knob (rotary encoder)** | Custom SVG/Canvas control with drag rotation, value display, double-click reset |
| **Fader (linear slider)** | Vertical/horizontal slider with value tooltip, fine-adjustment mode (shift+drag) |
| **Piano keyboard** | Interactive key display with press/release animations, multi-octave scrolling |
| **Chord wheel** | Circle of fifths with interactive segments, glow effects, connection lines |
| **Piano roll** | Grid-based note editor with zoom, scroll, note resize, velocity color coding |
| **Meter (level)** | Segmented LED-style meter with peak hold, clip indicator |
| **Transport bar** | Play/stop/record/loop buttons with BPM display and time counter |
| **Waveform scrubber** | Waveform display with playhead, selection range, zoom controls |

---

### 3.4 Design System Construction

| Skill | Depth Required | Why |
|---|---|---|
| Design token architecture | Advanced | Consistent colors, spacing, typography across 12+ screens |
| Component library design | Advanced | Reusable, composable components for dense UI |
| Figma (prototyping) | Advanced | Design iteration before development |
| Motion design principles | Intermediate | Subtle animations that enhance creative flow |
| Iconography for audio concepts | Intermediate | Custom icons for music-specific actions |

---

## 4. Business Skills

### 4.1 Creator Economy Marketing

| Skill | Depth Required | Why |
|---|---|---|
| YouTube content strategy | Expert | #1 channel for reaching bedroom producers |
| TikTok / Instagram Reels | Advanced | Short-form production tips, before/after demos |
| Reddit community engagement | Advanced | r/WeAreTheMusicMakers, r/edmproduction, r/makinghiphop |
| Discord community building | Advanced | Producer communities are centered on Discord |
| Influencer partnerships (music YouTubers) | Intermediate | Andrew Huang, Disclosure, Kenny Beats audiences |
| SEO for music production content | Intermediate | "How to make lo-fi beats" keyword ecosystem |

---

### 4.2 Producer Community Understanding

| Skill | Depth Required | Why |
|---|---|---|
| Understanding producer pain points | Expert | Product decisions must be grounded in real workflows |
| Music production forums and communities | Advanced | Direct user research channels |
| Plugin/tool purchasing behavior | Advanced | Pricing, bundling, and monetization decisions |
| Music education market dynamics | Intermediate | Luminary sits between tool and tutor |
| Music distribution ecosystem (DistroKid, TuneCore) | Basic | Understanding downstream user needs |

---

### 4.3 Music Education Partnerships

| Skill | Depth Required | Why |
|---|---|---|
| Online course platform partnerships | Intermediate | Skillshare, Udemy, Coursera for music production |
| Music school outreach | Intermediate | Berklee Online, Point Blank, ICON Collective |
| Certification programs | Basic | "Luminary Certified Producer" as a potential program |
| Educational content creation | Intermediate | Learning Center content within the app |

---

### 4.4 B2C SaaS Operations

| Skill | Depth Required | Why |
|---|---|---|
| Subscription billing (Stripe) | Advanced | Free / Creator / Pro tier management |
| User onboarding optimization | Advanced | First-time experience conversion |
| Churn analysis and prevention | Advanced | Retention is critical for subscription revenue |
| Product-led growth | Advanced | Free tier as top of funnel |
| Customer support (Intercom / Zendesk) | Intermediate | Producer-facing support channels |
| Analytics (PostHog, Mixpanel) | Advanced | Feature usage, suggestion quality metrics |

---

## 5. Unique Skills for This Project

These are skills specific to Luminary that are rare to find combined:

### 5.1 Music-Aware Prompt Engineering

The ability to craft OpenAI prompts that produce musically valid, context-aware suggestions. This requires understanding both LLM behavior and music theory deeply.

**Example prompt structure**:
```
System: You are a music theory expert and production mentor. The user is
working on a {genre} track in {key} at {bpm} BPM. Their current chord
progression is {chords}. They are at an {experience_level} level.

Provide chord suggestions that:
1. Are diatonic to {key} or use common borrowed chords
2. Create smooth voice leading from the last chord ({last_chord})
3. Match the emotional quality of {genre}
4. Include Roman numeral analysis
5. Explain the harmonic function in 1-2 sentences
```

### 5.2 Real-Time Audio-to-AI Pipeline

Building a system that captures audio, extracts features (key, BPM, spectrum), constructs an AI prompt with those features, gets a response, and presents it to the user -- all within 2 seconds. This requires understanding the entire chain from DSP to API calls to UI rendering.

### 5.3 MIDI-First Creative UI Design

Designing interfaces where MIDI data (notes, chords, rhythms) is the primary content type. This is different from traditional web UI design -- the interface must feel like an instrument, not a form.

---

## Skill Gap Analysis (Typical Founding Team)

| Skill Area | Likely Available | Likely Gap |
|---|---|---|
| React/TypeScript | Available | N/A |
| Electron | Moderate gap | Deep Electron expertise (build, distribute, sign) |
| Web Audio API | Significant gap | DSP fundamentals, real-time audio processing |
| Music Theory | Significant gap | Formal harmony, arrangement, jazz extensions |
| MIDI Protocol | Moderate gap | File format, virtual ports, DAW routing |
| Audio Engineering | Significant gap | Mixing/mastering knowledge for AI suggestion validation |
| DAW-Style UI Design | Moderate gap | Audio widget design, dense layout patterns |
| ML/AI (Music) | Moderate gap | Magenta.js, audio feature extraction, music-domain prompts |
| Creator Economy Marketing | Moderate gap | YouTube/TikTok content strategy for producers |

### Recommendations for Filling Gaps

1. **Hire a music theory consultant** (part-time) to validate AI suggestions and build the theory knowledge base
2. **Partner with a producer/YouTuber** for domain expertise and early marketing
3. **Invest in Web Audio API training** for the engineering team (Stanford CCRMA online courses)
4. **Study existing DAW UIs** deeply -- screenshot every screen of Ableton, FL Studio, and Logic to build a UI pattern library
5. **Build a relationship with the Magenta team** (Google) for ML guidance and potential model customization

---

## Recommended Learning Path (for a full-stack developer joining the team)

### Month 1: Foundations
- Complete Electron official tutorial (build a desktop app from scratch)
- Complete MDN Web Audio API tutorial
- Study MIDI 1.0 specification (focus on note messages and file format)
- Take a basic music theory course (musictheory.net, free)

### Month 2: Audio Depth
- Build a simple spectrum analyzer with Web Audio API AnalyserNode
- Build a MIDI file reader/writer using MIDI.js
- Learn Tone.js by building a simple step sequencer
- Study Ableton Live's UI patterns (watch production tutorials)

### Month 3: AI & Integration
- Build a prototype that sends audio features to OpenAI and gets production tips
- Integrate Magenta.js MelodyRNN into an Electron app
- Set up Essentia.js for key/BPM detection
- Build a basic chord wheel component in React + Canvas

### Month 4: Production Readiness
- Study Electron Forge for packaging and distribution
- Learn code signing for macOS (Apple Developer account) and Windows
- Set up PostHog analytics in Electron
- Practice DAW integration by building a simple Ableton Link demo

---

*The rarest skill for Luminary: someone who can explain why a Dm7 resolves to G7 and also write the TypeScript to generate it as MIDI in an Electron app.*
