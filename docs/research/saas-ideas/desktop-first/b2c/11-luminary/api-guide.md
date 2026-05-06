# Luminary -- API Guide

> Every external API and library used in Luminary, with pricing, setup, authentication, code snippets, and cost projections.

---

## API Overview

| API / Library | Purpose | Pricing | Auth Method |
|---|---|---|---|
| **OpenAI API** | Music theory chat, arrangement suggestions, production tips | Pay-per-token | API Key |
| **Spotify Web API** | Reference track analysis, genre classification | Free (with rate limits) | OAuth 2.0 |
| **ACRCloud** | Audio fingerprinting, key/BPM detection | Freemium | API Key |
| **Magenta.js** | On-device melody/harmony generation | Free (open source) | None |
| **Essentia.js** | Audio feature extraction | Free (open source) | None |
| **Ableton Link SDK** | DAW tempo/phase synchronization | Free | None |
| **MIDI.js** | MIDI file read/write | Free (open source) | None |
| **Cloudinary** | Waveform image generation | Freemium | API Key |

---

## 1. OpenAI API

### Purpose in Luminary
The backbone of Luminary's intelligent suggestion system. Used for:
- Music theory explanations and chord progression reasoning
- Arrangement and song structure suggestions
- Mixing and mastering production tips
- Natural language Q&A about music production

### Pricing (as of 2025)

| Model | Input Cost | Output Cost | Best For |
|---|---|---|---|
| **GPT-4o** | $2.50 / 1M tokens | $10.00 / 1M tokens | Complex music theory reasoning, arrangement analysis |
| **GPT-4o-mini** | $0.15 / 1M tokens | $0.60 / 1M tokens | Simple production tips, EQ/compression suggestions |

### Setup

1. Create an account at https://platform.openai.com
2. Generate an API key in the dashboard
3. Store the key in a Vercel environment variable (never in the Electron app)
4. Proxy all requests through Vercel API routes to protect the key

### Authentication

```typescript
// Vercel API route: /api/ai/suggest.ts
// The API key lives on the server, never in the Electron app

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### Code Snippet: Chord Progression Suggestion

```typescript
// Vercel API route: /api/ai/chord-suggestion.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChordRequest {
  key: string;
  scale: string;
  genre: string;
  mood: string;
  existingChords: string[];
  experienceLevel: string;
}

export async function POST(req: Request) {
  const body: ChordRequest = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a music theory expert and production mentor.
          Provide chord progression suggestions as JSON arrays.
          Each chord should include: name, romanNumeral, quality,
          midiNotes (array of MIDI note numbers), and a brief
          explanation of its harmonic function.
          Keep explanations at a ${body.experienceLevel} level.`,
      },
      {
        role: 'user',
        content: `I'm working on a ${body.genre} track in ${body.key}
          ${body.scale} and want a ${body.mood} vibe.
          My current chords are: ${body.existingChords.join(' -> ')}.
          Suggest 3 possible next chord progressions (4 chords each)
          that continue naturally from what I have.`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
    max_tokens: 1000,
  });

  return Response.json(JSON.parse(response.choices[0].message.content));
}
```

### Code Snippet: Mix Analysis Feedback

```typescript
// Vercel API route: /api/ai/mix-feedback.ts

export async function POST(req: Request) {
  const { analysisData } = await req.json();
  // analysisData includes: spectral data, LUFS, stereo width, genre

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Cost-effective for mixing tips
    messages: [
      {
        role: 'system',
        content: `You are an experienced mixing engineer. Analyze the
          provided audio analysis data and give specific, actionable
          mixing suggestions. Include: frequency (Hz), suggested
          adjustment (cut/boost in dB), and which instrument likely
          needs the adjustment. Be concise and practical.`,
      },
      {
        role: 'user',
        content: `Here is my mix analysis for a ${analysisData.genre} track:
          - LUFS: ${analysisData.lufs}
          - Frequency peaks: ${JSON.stringify(analysisData.peaks)}
          - Stereo width: ${analysisData.stereoWidth}
          - Dynamic range: ${analysisData.dynamicRange}dB

          What are the top 3 issues and how should I fix them?`,
      },
    ],
    temperature: 0.5,
    max_tokens: 800,
  });

  return Response.json({ feedback: response.choices[0].message.content });
}
```

### Cost Projections

| Scenario | Model | Requests/day | Avg Tokens/req | Monthly Cost |
|---|---|---|---|---|
| **Free tier (5 suggestions/day)** | GPT-4o-mini | 5 | 500 in + 300 out | ~$0.004/user/mo |
| **Creator tier (unlimited)** | Mix of 4o and 4o-mini | 30 | 600 in + 400 out | ~$0.15/user/mo |
| **Pro tier (priority)** | GPT-4o primary | 50 | 800 in + 500 out | ~$0.50/user/mo |
| **10K free users** | GPT-4o-mini | 50K total | -- | ~$40/mo |
| **5K Creator users** | Mix | 150K total | -- | ~$750/mo |
| **1K Pro users** | GPT-4o | 50K total | -- | ~$500/mo |
| **Total (16K users)** | -- | 250K total | -- | ~$1,290/mo |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Anthropic Claude** | Excellent reasoning, longer context | Slightly higher cost for equivalent quality |
| **Google Gemini** | Multimodal (audio input possible) | Less proven for structured music theory output |
| **Mistral** | Lower cost, self-hostable | Smaller model, less music domain knowledge |
| **Local LLM (Llama)** | Zero cost, privacy | Requires significant compute, lower quality |

---

## 2. Spotify Web API

### Purpose in Luminary
- Reference track analysis (audio features: energy, valence, danceability, tempo)
- Genre classification for user's reference tracks
- Track metadata for "compare to a professional track" feature

### Pricing

**Free** with rate limits:
- Rate limit: ~180 requests/minute per app
- Requires Spotify account (free tier works)
- No commercial audio streaming (analysis metadata only)

### Setup

1. Create a Spotify Developer account at https://developer.spotify.com
2. Register an application in the Dashboard
3. Obtain Client ID and Client Secret
4. Use Client Credentials flow (no user login needed for track analysis)

### Authentication

```typescript
// Server-side token exchange (Vercel)

async function getSpotifyToken(): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}
```

### Code Snippet: Get Audio Features

```typescript
async function getAudioFeatures(trackId: string) {
  const token = await getSpotifyToken();

  const response = await fetch(
    `https://api.spotify.com/v1/audio-features/${trackId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const features = await response.json();

  return {
    tempo: features.tempo,           // BPM
    key: features.key,               // Pitch class (0=C, 1=C#, ...)
    mode: features.mode,             // 0=minor, 1=major
    energy: features.energy,         // 0.0 to 1.0
    valence: features.valence,       // 0.0 (sad) to 1.0 (happy)
    danceability: features.danceability,
    instrumentalness: features.instrumentalness,
    loudness: features.loudness,     // dB
    timeSignature: features.time_signature,
  };
}
```

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Last.fm API** | Free, genre tags, similar artists | No audio features (tempo, key, energy) |
| **MusicBrainz** | Open database, extensive metadata | No audio analysis features |
| **AcousticBrainz** | Audio features, open source | Discontinued (data still available) |

---

## 3. ACRCloud

### Purpose in Luminary
- Audio fingerprinting: identify songs from audio input
- Key and BPM detection (as backup/cross-reference for Essentia.js)
- Music recognition for sampling workflow

### Pricing

| Plan | Price | Requests/Month | Features |
|---|---|---|---|
| **Free** | $0 | 500 | Audio recognition, basic metadata |
| **Basic** | $25/mo | 5,000 | Audio recognition, music metadata, key/BPM |
| **Standard** | $100/mo | 25,000 | Everything + humming recognition |
| **Enterprise** | Custom | Unlimited | Custom models, SLA |

### Setup

1. Register at https://www.acrcloud.com
2. Create a project in the console
3. Obtain Access Key, Access Secret, and Host URL
4. Use REST API from Vercel backend

### Authentication

```typescript
// ACRCloud uses HMAC-SHA1 signed requests

import crypto from 'crypto';

function signACRCloudRequest(
  accessKey: string,
  accessSecret: string,
  timestamp: number
): string {
  const stringToSign = `POST\n/v1/identify\n${accessKey}\naudio\n1\n${timestamp}`;
  return crypto
    .createHmac('sha1', accessSecret)
    .update(stringToSign)
    .digest('base64');
}
```

### Code Snippet: Identify Audio

```typescript
async function identifyAudio(audioBuffer: Buffer) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signACRCloudRequest(
    process.env.ACRCLOUD_ACCESS_KEY!,
    process.env.ACRCLOUD_ACCESS_SECRET!,
    timestamp
  );

  const formData = new FormData();
  formData.append('sample', new Blob([audioBuffer]), 'audio.wav');
  formData.append('access_key', process.env.ACRCLOUD_ACCESS_KEY!);
  formData.append('sample_bytes', audioBuffer.length.toString());
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('data_type', 'audio');
  formData.append('signature_version', '1');

  const response = await fetch(
    `https://${process.env.ACRCLOUD_HOST}/v1/identify`,
    { method: 'POST', body: formData }
  );

  const result = await response.json();
  return {
    title: result.metadata?.music?.[0]?.title,
    artist: result.metadata?.music?.[0]?.artists?.[0]?.name,
    bpm: result.metadata?.music?.[0]?.tempo,
    key: result.metadata?.music?.[0]?.key,
  };
}
```

### Cost Projections

| Scenario | Plan | Monthly Cost |
|---|---|---|
| MVP (< 500 recognitions/mo) | Free | $0 |
| Growth (5K recognitions/mo) | Basic | $25/mo |
| Scale (25K recognitions/mo) | Standard | $100/mo |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Shazam (Apple)** | Best recognition accuracy | No public API |
| **Audd.io** | Simple REST API, affordable | Smaller database |
| **Essentia.js (local)** | Free, no API calls | No fingerprinting, only audio features |

---

## 4. Magenta.js

### Purpose in Luminary
On-device AI music generation. Runs entirely in the Electron renderer process (TensorFlow.js backend). Zero network latency, works offline.

### Pricing

**Free** -- Open source (Apache 2.0 license), maintained by Google.

### Setup

```bash
npm install @magenta/music
```

No API keys, no server-side infrastructure, no usage limits.

### Code Snippet: Generate Melody

```typescript
import * as mm from '@magenta/music';

// Initialize MelodyRNN model
const melodyRnn = new mm.MusicRNN(
  'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn'
);

await melodyRnn.initialize();

// Seed sequence (starting notes)
const seed: mm.INoteSequence = {
  quantizationInfo: { stepsPerQuarter: 4 },
  notes: [
    { pitch: 60, quantizedStartStep: 0, quantizedEndStep: 2 }, // C4
    { pitch: 64, quantizedStartStep: 2, quantizedEndStep: 4 }, // E4
    { pitch: 67, quantizedStartStep: 4, quantizedEndStep: 6 }, // G4
  ],
  totalQuantizedSteps: 8,
};

// Generate continuation
const generated = await melodyRnn.continueSequence(
  seed,
  32,   // Number of steps to generate
  1.2,  // Temperature (higher = more random)
  ['Am'] // Chord conditioning (optional)
);

// Convert to MIDI notes for display/export
const notes = generated.notes.map((note) => ({
  pitch: note.pitch,
  startTime: note.quantizedStartStep,
  endTime: note.quantizedEndStep,
  velocity: 80,
}));
```

### Code Snippet: Generate Drum Pattern

```typescript
import * as mm from '@magenta/music';

const drumsRnn = new mm.MusicRNN(
  'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn'
);

await drumsRnn.initialize();

const seed: mm.INoteSequence = {
  quantizationInfo: { stepsPerQuarter: 4 },
  notes: [
    { pitch: 36, quantizedStartStep: 0, quantizedEndStep: 1 }, // Kick
    { pitch: 42, quantizedStartStep: 2, quantizedEndStep: 3 }, // Closed HH
    { pitch: 38, quantizedStartStep: 4, quantizedEndStep: 5 }, // Snare
    { pitch: 42, quantizedStartStep: 6, quantizedEndStep: 7 }, // Closed HH
  ],
  totalQuantizedSteps: 8,
};

const pattern = await drumsRnn.continueSequence(seed, 32, 1.0);
```

### Available Models

| Model | Purpose | Size | Latency |
|---|---|---|---|
| **MelodyRNN** | Single-voice melody generation | ~2MB | <100ms |
| **ImprovRNN** | Melody generation with chord conditioning | ~2MB | <100ms |
| **DrumsRNN** | Drum pattern generation | ~1.5MB | <50ms |
| **MusicVAE** | Melody interpolation and variation | ~20MB | <200ms |
| **GrooVAE** | Drum humanization (add groove/swing) | ~15MB | <150ms |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Tone.js Pattern** | Simple pattern generation, no ML | Not AI-powered, rule-based only |
| **ONNX Runtime** | Run custom models locally | Need to train/find models, more setup |
| **Replicate API** | Cloud-based music generation | Adds latency, costs money, requires internet |

---

## 5. Essentia.js

### Purpose in Luminary
Professional-grade audio feature extraction running on-device via WebAssembly. A JavaScript/WASM port of the C++ Essentia library used in academic music research.

### Pricing

**Free** -- Open source (AGPL license for non-commercial, contact for commercial).

### Setup

```bash
npm install essentia.js
```

### Code Snippet: Key and BPM Detection

```typescript
import { EssentiaWASM, Essentia } from 'essentia.js';

// Initialize Essentia
const essentia = new Essentia(EssentiaWASM);

async function analyzeAudio(audioBuffer: Float32Array, sampleRate: number) {
  // Key detection
  const keyResult = essentia.KeyExtractor(audioBuffer);
  const key = keyResult.key;       // e.g., "A"
  const scale = keyResult.scale;   // e.g., "minor"
  const confidence = keyResult.strength; // 0.0 to 1.0

  // BPM detection
  const bpmResult = essentia.RhythmExtractor2013(audioBuffer);
  const bpm = bpmResult.bpm;       // e.g., 128.3
  const beats = bpmResult.ticks;   // Array of beat timestamps

  // Loudness
  const loudness = essentia.LoudnessEBUR128(audioBuffer, sampleRate);
  const lufs = loudness.integratedLoudness;

  // Spectral analysis
  const spectrum = essentia.Spectrum(audioBuffer);
  const centroid = essentia.SpectralCentroidTime(audioBuffer, sampleRate);

  return {
    key: `${key} ${scale}`,
    keyConfidence: confidence,
    bpm,
    beats,
    lufs,
    spectralCentroid: centroid.spectralCentroid,
  };
}
```

### Available Algorithms

| Algorithm | Output | Use Case |
|---|---|---|
| `KeyExtractor` | Key + scale + confidence | Auto-detect project key |
| `RhythmExtractor2013` | BPM + beat positions | Auto-detect project tempo |
| `LoudnessEBUR128` | Integrated LUFS, momentary, short-term | Mastering analysis |
| `Spectrum` | Frequency magnitude array | Spectrum visualization |
| `SpectralCentroidTime` | Spectral centroid (Hz) | Brightness analysis |
| `SpectralRolloff` | Rolloff frequency | High frequency content |
| `OnsetDetection` | Onset timestamps | Beat/transient detection |
| `MFCC` | Mel-frequency cepstral coefficients | Timbre analysis, genre classification |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Meyda.js** | Simpler API, lightweight | Fewer features, less accurate |
| **aubio (WASM)** | Good BPM detection | Smaller feature set than Essentia |
| **Web Audio AnalyserNode** | Built-in, no library needed | Only FFT, no high-level features (key, BPM) |

---

## 6. Ableton Link SDK

### Purpose in Luminary
Tempo and phase synchronization between Luminary and the user's DAW over a local network. Allows Luminary's playback to lock perfectly to the DAW's transport.

### Pricing

**Free** -- Open source (GPL-2.0 license). Maintained by Ableton.

### Setup

Ableton Link is a C++ library that needs to be compiled as a native Node.js addon for use in Electron's main process.

```bash
# Build link as a native Node module
npm install abletonlink
```

### Code Snippet: Tempo Sync

```typescript
// Electron main process

import AbletonLink from 'abletonlink';

const link = new AbletonLink();
link.enable();
link.setTempo(128);

// Listen for tempo changes from DAW
link.on('tempo', (bpm: number) => {
  // Send to renderer via IPC
  mainWindow.webContents.send('link:tempo', bpm);
});

// Listen for beat events
link.on('beat', (beat: number, phase: number) => {
  mainWindow.webContents.send('link:beat', { beat, phase });
});

// Set Luminary's tempo (syncs to all Link-enabled apps)
function setTempo(bpm: number) {
  link.setTempo(bpm);
}

// Get current number of connected peers
function getPeerCount(): number {
  return link.getNumPeers();
}
```

### Compatible DAWs

| DAW | Link Support |
|---|---|
| Ableton Live | Native (built-in) |
| Bitwig Studio | Native |
| Logic Pro | Via third-party bridge |
| FL Studio | Via third-party bridge |
| Reaper | Via plugin |
| Traktor | Native |
| Serato | Native |

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **MIDI Clock** | Universal DAW support | Less accurate, jitter-prone |
| **OSC Protocol** | Flexible, custom messages | No standardized tempo sync |
| **ReWire** | Deep audio/MIDI routing | Discontinued by Propellerhead |

---

## 7. MIDI.js

### Purpose in Luminary
Read and write standard MIDI files (.mid) for import and export of chord progressions, melodies, and drum patterns.

### Pricing

**Free** -- Open source (MIT license).

### Setup

```bash
npm install midi-file
npm install midi-writer-js
```

### Code Snippet: Write MIDI File

```typescript
import MidiWriter from 'midi-writer-js';

function exportChordProgression(
  chords: { notes: number[]; duration: string }[],
  bpm: number
): Buffer {
  const track = new MidiWriter.Track();
  track.setTempo(bpm);

  for (const chord of chords) {
    track.addEvent(
      new MidiWriter.NoteEvent({
        pitch: chord.notes,
        duration: chord.duration,  // '1' = whole, '2' = half, '4' = quarter
        velocity: 80,
      })
    );
  }

  const writer = new MidiWriter.Writer([track]);
  return Buffer.from(writer.buildFile());
}

// Usage
const chords = [
  { notes: [57, 60, 64], duration: '1' },  // Am
  { notes: [62, 65, 69], duration: '1' },  // Dm
  { notes: [55, 59, 62], duration: '1' },  // G
  { notes: [60, 64, 67], duration: '1' },  // C
];

const midiBuffer = exportChordProgression(chords, 128);
```

### Code Snippet: Read MIDI File

```typescript
import { parseMidi } from 'midi-file';
import fs from 'fs';

function importMidiFile(filePath: string) {
  const buffer = fs.readFileSync(filePath);
  const midi = parseMidi(buffer);

  const notes = [];
  for (const track of midi.tracks) {
    let currentTick = 0;
    for (const event of track) {
      currentTick += event.deltaTime;
      if (event.type === 'noteOn' && event.velocity > 0) {
        notes.push({
          pitch: event.noteNumber,
          velocity: event.velocity,
          channel: event.channel,
          tick: currentTick,
        });
      }
    }
  }

  return {
    format: midi.header.format,
    ticksPerBeat: midi.header.ticksPerBeat,
    trackCount: midi.header.numTracks,
    notes,
  };
}
```

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **Tone.js Midi** | Integrated with Tone.js | Smaller feature set |
| **JZZ.js** | Full MIDI stack (I/O + files) | Heavier dependency |
| **Web MIDI API** | Native browser, real-time I/O | Cannot read/write files |

---

## 8. Cloudinary

### Purpose in Luminary
Generate waveform images for sample previews in the Sample Browser. Cloudinary can generate waveform visualizations from audio files via URL transformation.

### Pricing

| Plan | Price | Credits/Month | Storage |
|---|---|---|---|
| **Free** | $0 | 25 credits | 25GB |
| **Plus** | $89/mo | 225 credits | 100GB |
| **Advanced** | $224/mo | 600 credits | 250GB |

One credit = 1 transformation or ~1GB bandwidth.

### Setup

1. Create account at https://cloudinary.com
2. Obtain Cloud Name, API Key, API Secret
3. Upload audio files to Cloudinary or use fetch URLs

### Code Snippet: Generate Waveform Image

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getWaveformUrl(audioPublicId: string): string {
  return cloudinary.url(audioPublicId, {
    resource_type: 'video', // Cloudinary treats audio as video
    format: 'png',
    transformation: [
      {
        flags: 'waveform',
        color: '#6C2BD9',
        background: '#0D0D1A',
        height: 80,
        width: 400,
      },
    ],
  });
}

// Returns URL like:
// https://res.cloudinary.com/luminary/video/upload/fl_waveform,co_rgb:6C2BD9,b_rgb:0D0D1A,h_80,w_400/sample_kick.png
```

### Alternatives

| Alternative | Pros | Cons |
|---|---|---|
| **WaveSurfer.js** | Client-side, real-time, interactive | Client CPU cost, not pre-rendered |
| **Canvas API (custom)** | Full control, no dependency | Need to build from scratch |
| **FFmpeg (server-side)** | Powerful, flexible | Server infrastructure needed |

---

## Total API Cost Projections

### At 1,000 Users (Month 3-6)

| API | Usage | Monthly Cost |
|---|---|---|
| OpenAI | 30K requests | $50 |
| Spotify | 5K requests | $0 (free) |
| ACRCloud | 500 recognitions | $0 (free tier) |
| Magenta.js | Unlimited (on-device) | $0 |
| Essentia.js | Unlimited (on-device) | $0 |
| Ableton Link | N/A | $0 |
| Cloudinary | 1K waveforms | $0 (free tier) |
| **Total** | -- | **~$50/mo** |

### At 10,000 Users (Month 9-12)

| API | Usage | Monthly Cost |
|---|---|---|
| OpenAI | 250K requests | $1,290 |
| Spotify | 50K requests | $0 (free) |
| ACRCloud | 5K recognitions | $25 |
| Magenta.js | Unlimited (on-device) | $0 |
| Essentia.js | Unlimited (on-device) | $0 |
| Cloudinary | 10K waveforms | $0 (free tier) |
| **Total** | -- | **~$1,315/mo** |

### At 50,000 Users (Month 18-24)

| API | Usage | Monthly Cost |
|---|---|---|
| OpenAI | 1.5M requests | $6,500 |
| Spotify | 200K requests | $0 (free, may need extended quota) |
| ACRCloud | 25K recognitions | $100 |
| Magenta.js | Unlimited (on-device) | $0 |
| Essentia.js | Unlimited (on-device) | $0 |
| Cloudinary | 50K waveforms | $89 |
| **Total** | -- | **~$6,689/mo** |

### Cost Optimization Strategies

1. **On-device first**: Magenta.js and Essentia.js handle the most frequent operations at zero cost
2. **Model routing**: Use GPT-4o-mini for simple suggestions, GPT-4o only for complex theory reasoning
3. **Response caching**: Cache common suggestions (popular chord progressions in common keys)
4. **Batch processing**: Aggregate audio analysis requests rather than sending one-at-a-time
5. **Token optimization**: Structured prompts that minimize input tokens while maximizing output quality
6. **Local LLM fallback**: For basic suggestions, consider running a small local model (Phi-3, Llama) to reduce API calls

---

*The API strategy is designed around a simple principle: process on-device whenever possible, call the cloud only when AI reasoning is required.*
