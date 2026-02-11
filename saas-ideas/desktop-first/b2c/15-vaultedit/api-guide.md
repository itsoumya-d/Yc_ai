# VaultEdit -- API Integration Guide

## API Overview

VaultEdit integrates with multiple external APIs for AI processing, media storage, stock footage, and platform publishing. All external API calls are routed through VaultEdit's own API gateway (Vercel Edge Functions) to protect API keys, enforce rate limits, track usage, and manage costs.

```
Desktop App  -->  VaultEdit API Gateway (Vercel)  -->  External APIs
                  - Auth validation                     - OpenAI (Whisper, GPT-4o)
                  - Rate limiting                       - YouTube Data API
                  - Usage tracking                      - Pexels / Pixabay
                  - Cost allocation                     - Cloudflare R2
                  - Error handling                      - Music APIs
```

---

## 1. OpenAI Whisper API -- Transcription

### Overview

| Detail | Value |
|---|---|
| **Purpose** | Transcribe video audio into text with word-level timestamps |
| **Provider** | OpenAI |
| **Endpoint** | `https://api.openai.com/v1/audio/transcriptions` |
| **Model** | `whisper-1` (based on Whisper large-v3) |
| **Pricing** | $0.006 per minute of audio |
| **Auth** | API key (Bearer token) |
| **Rate Limit** | 50 requests/minute (default), upgradeable |
| **Max File Size** | 25 MB per request |
| **Supported Formats** | mp3, mp4, mpeg, mpga, m4a, wav, webm |

### Setup

1. Create an OpenAI account at https://platform.openai.com
2. Generate an API key in Settings > API Keys
3. Store the key in VaultEdit's server-side environment variables (never in the client)
4. Set up usage limits in the OpenAI dashboard to prevent runaway costs

### Code Example

```typescript
// server-side: api/transcribe.ts (Vercel Edge Function)
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudio(audioBuffer: Buffer, language?: string) {
  const file = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });

  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: file,
    response_format: 'verbose_json',
    timestamp_granularities: ['word', 'segment'],
    language: language, // optional: 'en', 'es', 'ja', etc.
  });

  return {
    text: response.text,
    words: response.words, // [{word: "Hello", start: 0.0, end: 0.42}, ...]
    segments: response.segments,
    language: response.language,
    duration: response.duration,
  };
}
```

### Audio Preprocessing (Client-Side)

```typescript
// Before sending to Whisper, extract and prepare audio
// Using FFmpeg via the Rust video engine

// 1. Extract audio from video
// ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 output.wav

// 2. Split long audio into 25MB chunks (roughly 25 minutes of 16kHz mono WAV)
// Each chunk overlaps by 5 seconds for transcript stitching

// 3. Send each chunk to Whisper API
// 4. Stitch results together, deduplicating overlap regions
```

### Chunking Strategy for Long Videos

```typescript
const MAX_CHUNK_DURATION = 1500; // 25 minutes in seconds
const OVERLAP_DURATION = 5; // 5-second overlap for stitching

function createChunks(totalDuration: number): Array<{start: number, end: number}> {
  const chunks = [];
  let start = 0;
  while (start < totalDuration) {
    const end = Math.min(start + MAX_CHUNK_DURATION, totalDuration);
    chunks.push({ start, end });
    start = end - OVERLAP_DURATION;
  }
  return chunks;
}
```

### Error Handling

| Error | Cause | Recovery |
|---|---|---|
| 413 Payload Too Large | Audio file exceeds 25MB | Split into smaller chunks |
| 429 Rate Limited | Too many requests | Exponential backoff, retry after delay |
| 500 Server Error | OpenAI service issue | Retry 3 times with backoff, then offer offline mode |
| Poor transcription | Background noise, accents | Suggest manual correction, offer re-transcription with language hint |
| Hallucination | Whisper generates text not in audio | Detect via confidence scores, flag low-confidence sections |

### Cost Projections

| Usage Level | Minutes/Month | Cost/Month |
|---|---|---|
| Light creator (4 videos/mo, 10 min each) | 40 min | $0.24 |
| Regular creator (8 videos/mo, 15 min each) | 120 min | $0.72 |
| Heavy creator (12 videos/mo, 30 min each) | 360 min | $2.16 |
| Per 1,000 users (avg 120 min/mo) | 120,000 min | $720 |
| Per 10,000 users | 1,200,000 min | $7,200 |

### Alternatives

| Provider | Pricing | Advantage | Disadvantage |
|---|---|---|---|
| **Deepgram** | $0.0043/min (Pay-as-you-go) | Faster, streaming support, better diarization | Slightly lower accuracy on some accents |
| **AssemblyAI** | $0.0065/min | Best speaker diarization, content safety detection | Slightly more expensive |
| **Google Speech-to-Text** | $0.006/min (standard) | Good multilingual, reliable | More complex API, GCP dependency |
| **Local Whisper.cpp** | Free (CPU/GPU cost) | Offline, private, no API costs | Slower, requires user's hardware, no streaming |

**Recommendation:** Start with OpenAI Whisper for simplicity. Add Deepgram as an alternative at scale (30%+ cost savings). Offer local Whisper.cpp as an offline/privacy option.

---

## 2. OpenAI GPT-4o -- Edit Intelligence

### Overview

| Detail | Value |
|---|---|
| **Purpose** | Parse natural language editing commands into structured edit operations |
| **Provider** | OpenAI |
| **Endpoint** | `https://api.openai.com/v1/chat/completions` |
| **Model** | `gpt-4o` |
| **Pricing** | $2.50/1M input tokens, $10.00/1M output tokens |
| **Auth** | API key (Bearer token) |
| **Rate Limit** | 500 RPM, 30,000 TPM (Tier 1) |
| **Context Window** | 128K tokens |

### Setup

1. Use the same OpenAI account and API key as Whisper
2. Configure function calling schemas for edit operations
3. Set up prompt templates for common editing commands
4. Implement response validation to catch malformed edit plans

### Code Example

```typescript
// server-side: api/ai-command.ts

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are VaultEdit's AI editing assistant. You receive a video transcript with word-level timestamps and a user's editing command. You output a JSON array of edit operations.

Available operations:
- { "action": "cut", "start_ms": number, "end_ms": number, "reason": string }
- { "action": "zoom", "start_ms": number, "end_ms": number, "scale": number, "reason": string }
- { "action": "speed", "start_ms": number, "end_ms": number, "rate": number, "reason": string }
- { "action": "caption", "start_ms": number, "end_ms": number, "text": string, "style": string }
- { "action": "chapter", "timestamp_ms": number, "title": string }
- { "action": "transition", "timestamp_ms": number, "type": string, "duration_ms": number }

Rules:
1. All timestamps must be in milliseconds and must exist within the transcript's time range.
2. Never remove content the user did not ask to remove.
3. For ambiguous commands, ask for clarification by returning { "action": "clarify", "question": string }.
4. Include a "reason" field explaining why each operation is applied.
5. Return valid JSON only. No markdown formatting.`;

interface EditCommand {
  transcript: TranscriptWord[];
  command: string;
  projectMetadata: ProjectMetadata;
}

async function processEditCommand(input: EditCommand) {
  const transcriptContext = formatTranscriptForContext(input.transcript);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Transcript:\n${transcriptContext}\n\nCommand: ${input.command}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1, // Low temperature for consistent, precise edits
    max_tokens: 4096,
  });

  const editPlan = JSON.parse(response.choices[0].message.content);
  return validateEditPlan(editPlan, input.transcript);
}
```

### Context Management

```typescript
// For long transcripts, include only relevant sections
function formatTranscriptForContext(
  words: TranscriptWord[],
  maxTokens: number = 8000
): string {
  // Estimate: ~1.3 tokens per word with timestamps
  const maxWords = Math.floor(maxTokens / 1.3);

  if (words.length <= maxWords) {
    return words
      .map((w) => `[${w.start_ms}] ${w.word}`)
      .join(' ');
  }

  // For long transcripts, include first 1000 words, last 1000 words,
  // and a summary of the middle
  const head = words.slice(0, 1000);
  const tail = words.slice(-1000);
  const middleSummary = `[... ${words.length - 2000} words omitted ...]`;

  return [
    head.map((w) => `[${w.start_ms}] ${w.word}`).join(' '),
    middleSummary,
    tail.map((w) => `[${w.start_ms}] ${w.word}`).join(' '),
  ].join('\n');
}
```

### Error Handling

| Error | Cause | Recovery |
|---|---|---|
| Invalid JSON response | Model generated malformed JSON | Retry with stricter prompt, parse with error-tolerant JSON parser |
| Timestamps out of range | Model hallucinated timestamps | Validate all timestamps against transcript bounds, snap to nearest valid timestamp |
| 429 Rate Limited | Too many requests | Queue commands, exponential backoff |
| Overly destructive plan | Model misunderstood command | Show preview before applying, require user confirmation |
| Clarification needed | Ambiguous command | Display AI's clarification question to user |

### Cost Projections

| Usage Level | Commands/Month | Avg Tokens/Command | Cost/Month |
|---|---|---|---|
| Light creator | 20 commands | ~2K input + 500 output | $0.20 |
| Regular creator | 80 commands | ~3K input + 800 output | $1.24 |
| Heavy creator | 200 commands | ~4K input + 1K output | $4.00 |
| Per 1,000 users (avg 80 cmd/mo) | 80,000 commands | ~3K input + 800 output | $1,240 |

### Alternatives

| Provider | Model | Advantage | Disadvantage |
|---|---|---|---|
| **Anthropic Claude** | Claude 3.5 Sonnet | Better instruction following, lower hallucination | Slightly slower |
| **Google Gemini** | Gemini 1.5 Pro | Huge context window (1M tokens) | Less mature function calling |
| **Open Source** | Llama 3, Mixtral | Free, self-hosted, private | Requires GPU infrastructure, lower quality |

---

## 3. FFmpeg -- Video Processing

### Overview

| Detail | Value |
|---|---|
| **Purpose** | Video decoding, encoding, transcoding, filtering, and effects |
| **Type** | Open source library/CLI |
| **License** | LGPL 2.1 (dynamically linked for commercial use) |
| **Pricing** | Free |
| **Integration** | Native binding via Rust (`ffmpeg-next` crate) + WASM (`ffmpeg.wasm`) |

### Setup (Native via Rust)

```toml
# Cargo.toml
[dependencies]
ffmpeg-next = "7.0"
```

```rust
// Rust: Initialize FFmpeg
use ffmpeg_next as ffmpeg;

fn init() {
    ffmpeg::init().expect("Failed to initialize FFmpeg");
    // Register all codecs, formats, and filters
}
```

### Setup (WASM for Renderer Process)

```typescript
// For lightweight operations in the renderer process
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();
await ffmpeg.load();
```

### Key Commands / Operations

```bash
# 1. Probe media file (get metadata)
ffprobe -v quiet -print_format json -show_format -show_streams input.mp4

# 2. Extract audio for transcription
ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 audio.wav

# 3. Generate thumbnail strip (for timeline)
ffmpeg -i input.mp4 -vf "fps=1/2,scale=160:-1" thumb_%04d.jpg

# 4. YouTube-optimized export (H.264)
ffmpeg -i input.mp4 \
  -c:v libx264 -preset slow -crf 18 \
  -c:a aac -b:a 320k \
  -movflags +faststart \
  -pix_fmt yuv420p \
  -vf "scale=3840:2160" \
  output_4k.mp4

# 5. YouTube Shorts / TikTok (vertical crop)
ffmpeg -i input.mp4 \
  -vf "crop=ih*9/16:ih,scale=1080:1920" \
  -c:v libx264 -preset medium -crf 20 \
  -c:a aac -b:a 256k \
  -t 60 \
  shorts_output.mp4

# 6. Burn-in captions
ffmpeg -i input.mp4 \
  -vf "subtitles=captions.srt:force_style='FontName=Inter,FontSize=28,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2,Bold=1'" \
  output_captioned.mp4

# 7. Audio normalization (LUFS targeting)
ffmpeg -i input.mp4 \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" \
  -c:v copy \
  output_normalized.mp4

# 8. Hardware-accelerated encode (macOS VideoToolbox)
ffmpeg -i input.mp4 \
  -c:v h264_videotoolbox -b:v 10M \
  -c:a aac -b:a 320k \
  output_hw.mp4

# 9. Hardware-accelerated encode (NVIDIA NVENC)
ffmpeg -i input.mp4 \
  -c:v h264_nvenc -preset p7 -rc vbr -cq 18 \
  -c:a aac -b:a 320k \
  output_nvenc.mp4

# 10. Concatenate segments (after transcript-based cuts)
ffmpeg -f concat -safe 0 -i segments.txt -c copy output_cut.mp4
# segments.txt contains: file 'segment_001.mp4'\nfile 'segment_002.mp4'\n...
```

### Codec Reference

| Codec | FFmpeg Encoder | Quality | Speed | File Size | Use Case |
|---|---|---|---|---|---|
| H.264 | libx264 | Good | Medium | Medium | Maximum compatibility (default) |
| H.265 | libx265 | Better | Slow | Smaller | Quality-sensitive, newer devices |
| VP9 | libvpx-vp9 | Better | Very Slow | Smaller | YouTube's preferred (re-encoding benefit) |
| AV1 | libaom-av1 | Best | Extremely Slow | Smallest | Future-proof, best quality/size |
| ProRes | prores_ks | Lossless | Fast | Very Large | Intermediate/editing codec |

### Error Handling

| Error | Cause | Recovery |
|---|---|---|
| Unknown codec | Rare/proprietary codec in source file | Suggest re-encoding source, list supported codecs |
| Corrupt file | Incomplete download or damaged media | Run `ffmpeg -err_detect ignore_err` for partial recovery |
| Out of disk space | Export path has insufficient space | Check space before render, warn user |
| GPU encoder unavailable | No compatible GPU or driver issue | Fall back to CPU encoding, warn about slower speed |
| Segment concat glitch | Audio/video stream mismatch at cut points | Re-encode cut points (smart render) |

---

## 4. YouTube Data API v3 -- Direct Upload & Metadata

### Overview

| Detail | Value |
|---|---|
| **Purpose** | Upload videos, set metadata, manage thumbnails, read analytics |
| **Provider** | Google |
| **Endpoint** | `https://www.googleapis.com/youtube/v3/` |
| **Pricing** | Free (10,000 units/day default quota) |
| **Auth** | OAuth 2.0 (user grants access to their YouTube channel) |
| **Rate Limit** | 10,000 quota units/day (upload = 1600 units) |

### Setup

1. Create a Google Cloud project at https://console.cloud.google.com
2. Enable the YouTube Data API v3
3. Create OAuth 2.0 credentials (Desktop application type)
4. Configure consent screen with youtube.upload and youtube.readonly scopes
5. Store client ID and secret server-side

### Code Example

```typescript
// OAuth flow for YouTube access
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/callback' // Electron redirect URI
);

// Generate auth URL for user consent
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
  ],
});

// After user grants access, upload video
async function uploadToYouTube(
  accessToken: string,
  videoPath: string,
  metadata: VideoMetadata
) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        categoryId: metadata.categoryId,
        defaultLanguage: 'en',
      },
      status: {
        privacyStatus: metadata.privacy, // 'public', 'unlisted', 'private'
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  return response.data;
}

// Set custom thumbnail
async function setThumbnail(
  accessToken: string,
  videoId: string,
  thumbnailPath: string
) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  await youtube.thumbnails.set({
    videoId: videoId,
    media: {
      body: fs.createReadStream(thumbnailPath),
    },
  });
}
```

### Quota Units

| Operation | Quota Cost | Daily Limit (10K units) |
|---|---|---|
| Video upload | 1,600 units | ~6 uploads/day |
| Thumbnail set | 50 units | ~200/day |
| Video update (metadata) | 50 units | ~200/day |
| Video list | 1 unit | ~10,000/day |
| Channel list | 1 unit | ~10,000/day |

### Error Handling

| Error | Cause | Recovery |
|---|---|---|
| 403 quotaExceeded | Daily quota exhausted | Wait until quota resets (midnight PT), request quota increase |
| 401 Unauthorized | Token expired | Refresh token, re-authenticate if refresh fails |
| 400 invalidMetadata | Bad title, description, or tags | Validate metadata before upload |
| Upload interrupted | Network issue during upload | Implement resumable uploads (YouTube supports this natively) |

---

## 5. Pexels API -- Stock B-Roll Footage

### Overview

| Detail | Value |
|---|---|
| **Purpose** | Search and download royalty-free stock video for B-roll |
| **Provider** | Pexels |
| **Endpoint** | `https://api.pexels.com/videos/search` |
| **Pricing** | Free (200 requests/hour, 20,000 requests/month) |
| **Auth** | API key (header) |
| **License** | Free for commercial use, no attribution required |

### Setup

1. Create a Pexels account at https://www.pexels.com/api/
2. Request an API key (instant approval)
3. Store the key server-side

### Code Example

```typescript
async function searchStockVideo(query: string, perPage: number = 10) {
  const response = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
    {
      headers: {
        Authorization: process.env.PEXELS_API_KEY!,
      },
    }
  );

  const data = await response.json();

  return data.videos.map((video: any) => ({
    id: video.id,
    duration: video.duration,
    thumbnail: video.image,
    videoFiles: video.video_files
      .filter((f: any) => f.quality === 'hd' || f.quality === 'sd')
      .map((f: any) => ({
        quality: f.quality,
        width: f.width,
        height: f.height,
        url: f.link,
        fileType: f.file_type,
      })),
  }));
}
```

### Alternatives

| Provider | Pricing | Videos Available | Advantage |
|---|---|---|---|
| **Pixabay** | Free (100 req/min) | 50,000+ | More relaxed rate limits |
| **Coverr** | Free | 10,000+ | Curated for creator/marketing use |
| **Storyblocks** | $20/mo (subscription) | 1M+ | Much larger library, higher quality |
| **Shutterstock** | $29-199/mo | 25M+ | Largest library, premium quality |

---

## 6. Epidemic Sound / Artlist API -- Royalty-Free Music

### Overview

| Detail | Value |
|---|---|
| **Purpose** | Royalty-free background music for videos |
| **Provider** | Epidemic Sound or Artlist (partnership required) |
| **Integration Type** | Partner API (requires business agreement) |
| **Pricing** | Revenue share or per-user licensing fee |

### Integration Approach

Neither Epidemic Sound nor Artlist offers a public API. Integration requires a business partnership.

**Partnership Strategy:**

1. Contact Epidemic Sound's partnership team (they have an existing integration program for editing tools)
2. Negotiate a licensing model: per-user fee ($1-3/user/month) or revenue share (10-20% of subscription)
3. Integrate their SDK for search, preview, and licensed download within VaultEdit

**MVP Alternative:**

Until partnership is established, use free music sources:

| Source | Tracks | License | API |
|---|---|---|---|
| YouTube Audio Library | 1,500+ | Free for YouTube | No public API (manual download) |
| Free Music Archive | 150,000+ | Creative Commons | REST API available |
| Pixabay Music | 10,000+ | Free commercial use | Included in Pixabay API |
| Uppbeat | 5,000+ | Free tier (3 downloads/mo) | No public API |

### Code Example (Pixabay Music as MVP)

```typescript
async function searchMusic(query: string, genre?: string) {
  const params = new URLSearchParams({
    key: process.env.PIXABAY_API_KEY!,
    q: query,
    ...(genre && { genre }),
  });

  const response = await fetch(
    `https://pixabay.com/api/music/?${params.toString()}`
  );
  const data = await response.json();

  return data.hits.map((track: any) => ({
    id: track.id,
    title: track.title,
    duration: track.duration,
    previewUrl: track.audio,
    downloadUrl: track.audio, // Full track for Pixabay
    tags: track.tags,
  }));
}
```

---

## 7. Cloudflare R2 -- Template & Asset Storage

### Overview

| Detail | Value |
|---|---|
| **Purpose** | Store and serve templates, presets, brand kit assets, stock footage thumbnails |
| **Provider** | Cloudflare |
| **Pricing** | $0.015/GB/month storage, $0 egress (zero egress fees) |
| **Auth** | S3-compatible API (access key + secret) |
| **CDN** | Automatic global CDN via Cloudflare's network |
| **S3 Compatibility** | Full S3 API compatibility (use AWS SDK) |

### Setup

1. Create a Cloudflare account at https://dash.cloudflare.com
2. Navigate to R2 Storage and create a bucket (e.g., `vaultedit-assets`)
3. Generate R2 API tokens (S3 Auth) for server-side access
4. Configure CORS for direct browser downloads (template previews)
5. Set up a custom domain for CDN access (e.g., `assets.vaultedit.com`)

### Code Example

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Upload a template
async function uploadTemplate(
  key: string,
  data: Buffer,
  contentType: string
) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: 'vaultedit-assets',
      Key: `templates/${key}`,
      Body: data,
      ContentType: contentType,
    })
  );
}

// Generate a signed download URL (for premium assets)
async function getDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: 'vaultedit-assets',
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 3600 }); // 1 hour
}
```

### Bucket Structure

```
vaultedit-assets/
  templates/
    captions/         -- Caption style presets (.json)
    transitions/      -- Transition effect configs (.json + preview .webm)
    color/            -- LUT files (.cube) and color preset configs
    intros/           -- Intro video templates (.mp4 + config .json)
    outros/           -- Outro video templates
    lower-thirds/     -- Lower third overlay templates
  music/
    previews/         -- 30-second preview clips (.mp3)
    thumbnails/       -- Album art for music tracks
  sfx/
    previews/         -- Sound effect preview clips
  stock/
    thumbnails/       -- Thumbnail images for stock video results
  brand-kits/
    {user_id}/        -- Per-user brand kit assets (logos, fonts, colors)
```

### Cost Projections

| Scale | Storage | Monthly Cost | Notes |
|---|---|---|---|
| MVP (100 templates) | 2 GB | $0.03 | Minimal |
| Growth (1,000 templates) | 20 GB | $0.30 | Still negligible |
| Scale (10,000 templates + user brand kits) | 500 GB | $7.50 | Very affordable |
| 100K users with brand kits | 5 TB | $75.00 | Zero egress cost is the key advantage |

### Alternatives

| Provider | Storage Cost | Egress Cost | Advantage |
|---|---|---|---|
| **AWS S3** | $0.023/GB | $0.09/GB | Largest ecosystem, most mature |
| **Google Cloud Storage** | $0.020/GB | $0.12/GB | Good integration with Google APIs |
| **Backblaze B2** | $0.006/GB | $0.01/GB | Cheapest storage |
| **Cloudflare R2** | $0.015/GB | $0.00/GB | Zero egress -- best for CDN-heavy workloads |

**Recommendation:** Cloudflare R2 is the clear winner for VaultEdit. Template and asset files are downloaded frequently by many users (CDN-heavy pattern). Zero egress fees mean costs stay predictable regardless of user count.

---

## Cost Summary -- All APIs

### Per-User Monthly Cost (Average Creator)

| API | Usage | Cost/User/Month |
|---|---|---|
| OpenAI Whisper | 120 min transcription | $0.72 |
| OpenAI GPT-4o | 80 AI commands | $1.24 |
| YouTube Data API | 4 uploads + metadata | Free |
| Pexels | 20 searches | Free |
| Cloudflare R2 | 50 MB brand kit storage | $0.001 |
| **Total API cost per user** | | **~$1.96** |

### At Scale (10,000 Users)

| API | Monthly Cost |
|---|---|
| OpenAI Whisper | $7,200 |
| OpenAI GPT-4o | $12,400 |
| YouTube Data API | Free |
| Pexels | Free |
| Cloudflare R2 | $75 |
| Vercel (API gateway) | $200 |
| Supabase (backend) | $75 |
| **Total infrastructure** | **~$19,950** |
| **Revenue (10K users at $28 avg)** | **$280,000** |
| **Gross margin** | **~93%** |

### Cost Optimization Strategies

1. **Cache transcriptions**: Never re-transcribe the same audio. Store transcripts in Supabase.
2. **Batch AI commands**: Group multiple simple commands into a single GPT-4o call.
3. **Local Whisper fallback**: Offer local transcription for users with capable hardware (saves API costs entirely).
4. **Prompt caching**: Use OpenAI's prompt caching to reduce input token costs for repeated system prompts (50% savings).
5. **Switch to Deepgram at scale**: 28% cheaper than Whisper at high volume with comparable quality.
6. **Fine-tune a smaller model**: At 50K+ users, fine-tune GPT-4o-mini on VaultEdit-specific commands (90% cost reduction for common commands).

---

## Authentication Architecture

All API calls flow through VaultEdit's API gateway. Users never interact with external APIs directly.

```
Desktop App
  |
  +-- JWT token (Supabase Auth)
  |
  v
VaultEdit API Gateway (Vercel Edge)
  |
  +-- Validate JWT
  +-- Check subscription tier (Free/Creator/Pro)
  +-- Check usage quota
  +-- Route to appropriate API
  |
  +-- OpenAI APIs (server-side key)
  +-- YouTube API (user's OAuth token, stored encrypted in Supabase)
  +-- Pexels API (server-side key)
  +-- R2 (server-side key, signed URLs for downloads)
```

### Rate Limiting (Per User)

| Tier | Transcription | AI Commands | YouTube Uploads | Stock Searches |
|---|---|---|---|---|
| Free | 30 min/month | 10/month | Not available | 50/month |
| Creator | Unlimited | Unlimited | Unlimited | Unlimited |
| Pro | Unlimited | Unlimited (priority) | Unlimited | Unlimited |

---

*Every API integration is proxied through our gateway. Users never see API keys, rate limits, or cost complexity.*
