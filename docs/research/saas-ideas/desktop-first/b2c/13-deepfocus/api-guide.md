# DeepFocus -- API Guide

## API Overview

DeepFocus integrates with several third-party APIs and services to power its AI features, calendar scheduling, communication platform sync, audio, biometrics, and real-time collaboration. This document covers setup, authentication, pricing, code examples, error handling, and cost projections for each integration.

---

## 1. OpenAI API

**Purpose:** Task classification, session planning, productivity insight generation, and break activity suggestions.

### Use Cases in DeepFocus

| Use Case                     | Model        | Avg Input Tokens | Avg Output Tokens | Cost Per Call     |
| ---------------------------- | ------------ | ---------------- | ----------------- | ----------------- |
| Task classification          | gpt-4o-mini  | 120              | 80                | ~$0.0003          |
| Session plan generation      | gpt-4o-mini  | 200              | 300               | ~$0.00075         |
| Weekly insight report        | gpt-4o-mini  | 400              | 400               | ~$0.0012          |
| Break activity suggestion    | gpt-4o-mini  | 80               | 70                | ~$0.000225        |
| Daily recap generation       | gpt-4o-mini  | 300              | 200               | ~$0.00075         |

### Pricing (as of 2025)

| Model        | Input (per 1M tokens) | Output (per 1M tokens) | Notes                        |
| ------------ | --------------------- | ---------------------- | ---------------------------- |
| gpt-4o-mini  | $0.15                 | $0.60                  | Best cost-to-quality for classification tasks |
| gpt-4o       | $2.50                 | $10.00                 | Fallback for complex planning; avoid at scale |

### Setup

1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Generate an API key under API Keys settings
3. Store the API key securely using Electron's `safeStorage` API (OS keychain)
4. Set usage limits and alerts in the OpenAI dashboard

### Authentication

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: await safeStorage.decryptString(encryptedApiKey),
});
```

### Code Example: Task Classification

```typescript
async function classifyTask(
  taskDescription: string,
  userWorkType: string,
  timeOfDay: string,
  energyLevel: string
): Promise<TaskClassification> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a productivity assistant. Classify work tasks and suggest optimal focus session parameters. Return valid JSON only.`,
      },
      {
        role: 'user',
        content: `Classify this task and suggest focus parameters:
Task: "${taskDescription}"
User work type: ${userWorkType}
Time of day: ${timeOfDay}
Energy level: ${energyLevel}

Return JSON: { "category": string, "suggested_duration_minutes": number, "suggested_break_minutes": number, "soundscape": string, "blocking_level": "strict"|"moderate"|"light", "productive_apps": string[] }`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 200,
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### Error Handling

| Error Code | Meaning                | Handling Strategy                              |
| ---------- | ---------------------- | ---------------------------------------------- |
| 401        | Invalid API key        | Prompt user to re-enter API key in settings    |
| 429        | Rate limit exceeded    | Exponential backoff (1s, 2s, 4s, 8s), max 3 retries |
| 500        | OpenAI server error    | Retry once, then fall back to default classification |
| Timeout    | Request took too long  | 10-second timeout, fall back to cached/default |

### Alternatives

| Alternative          | Pros                                    | Cons                                   |
| -------------------- | --------------------------------------- | -------------------------------------- |
| Anthropic Claude API | Strong reasoning, competitive pricing   | Less established for classification    |
| Google Gemini API    | Free tier available, fast               | Less reliable JSON output              |
| Local LLM (Ollama)  | Free, fully private, no network needed  | Requires 8GB+ RAM, slower on CPU      |
| Rule-based fallback  | Zero cost, instant, always available    | No NLP capability, requires manual rules |

### Cost Projections

| Users (MAU) | Avg Calls/User/Day | Monthly API Cost | Notes                        |
| ----------- | ------------------- | ---------------- | ---------------------------- |
| 1,000       | 5                   | ~$45             | Early stage, manageable      |
| 10,000      | 5                   | ~$450            | Still small, cache aggressively |
| 100,000     | 4                   | ~$3,600          | Implement response caching   |
| 500,000     | 3                   | ~$13,500         | Consider local model fallback|

---

## 2. Google Calendar API

**Purpose:** Read calendar events to identify available focus windows, auto-create "Focus Block" calendar events, and provide buffer time before meetings.

### Pricing

**Free.** Google Calendar API is free to use within the standard quotas (1,000,000 queries/day per project).

### Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Google Calendar API
3. Create OAuth 2.0 credentials (Desktop app type for Electron)
4. Configure consent screen (External, limited scopes)
5. Request scopes: `calendar.readonly` (read events), `calendar.events` (create focus blocks)

### Authentication (OAuth 2.0)

```typescript
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'http://localhost:3847/callback' // Local redirect for Electron
);

// Generate auth URL for user consent
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
  ],
});

// After user consents, exchange code for tokens
const { tokens } = await oauth2Client.getToken(authorizationCode);
oauth2Client.setCredentials(tokens);
```

### Code Example: Find Available Focus Windows

```typescript
async function getAvailableFocusWindows(
  date: Date,
  minDurationMinutes: number = 30
): Promise<FocusWindow[]> {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const startOfDay = new Date(date);
  startOfDay.setHours(8, 0, 0, 0); // Work day starts at 8 AM
  const endOfDay = new Date(date);
  endOfDay.setHours(18, 0, 0, 0); // Work day ends at 6 PM

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = response.data.items || [];
  const focusWindows: FocusWindow[] = [];

  let currentStart = startOfDay;
  for (const event of events) {
    const eventStart = new Date(event.start?.dateTime || event.start?.date!);
    const gap = (eventStart.getTime() - currentStart.getTime()) / 60000;

    if (gap >= minDurationMinutes) {
      focusWindows.push({
        start: new Date(currentStart),
        end: new Date(eventStart.getTime() - 10 * 60000), // 10-min buffer
        durationMinutes: gap - 10,
      });
    }
    currentStart = new Date(event.end?.dateTime || event.end?.date!);
  }

  // Check gap after last event
  const finalGap = (endOfDay.getTime() - currentStart.getTime()) / 60000;
  if (finalGap >= minDurationMinutes) {
    focusWindows.push({
      start: new Date(currentStart),
      end: endOfDay,
      durationMinutes: finalGap,
    });
  }

  return focusWindows;
}
```

### Code Example: Create Focus Block Event

```typescript
async function createFocusBlock(
  start: Date,
  durationMinutes: number,
  taskName: string
): Promise<string> {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const end = new Date(start.getTime() + durationMinutes * 60000);

  const event = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: `Focus: ${taskName}`,
      description: 'Auto-scheduled by DeepFocus. Do not disturb.',
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      colorId: '7', // Peacock (blue-green)
      reminders: { useDefault: false },
      transparency: 'opaque', // Shows as "busy"
    },
  });

  return event.data.id!;
}
```

### Error Handling

| Error                  | Handling                                          |
| ---------------------- | ------------------------------------------------- |
| 401 Unauthorized       | Refresh access token using refresh token          |
| 403 Forbidden          | Re-prompt user for calendar permissions           |
| 404 Calendar not found | Fall back to primary calendar                     |
| 429 Rate limited       | Back off and retry (rare with calendar API)       |
| Network error          | Queue calendar operations, sync when online       |

### Alternatives

| Alternative          | Pros                         | Cons                              |
| -------------------- | ---------------------------- | --------------------------------- |
| Microsoft Graph API  | Outlook/Teams calendar       | More complex OAuth, corporate focus |
| CalDAV (direct)      | Works with any CalDAV server | Complex protocol, no auth standard |
| Apple Calendar (EventKit) | Native macOS integration | macOS only, requires native module |

---

## 3. Slack API

**Purpose:** Automatically set Do Not Disturb (DND) status during focus sessions and provide a custom status message indicating when the user will be available.

### Pricing

**Free.** Slack API has no per-call charges. Rate limits apply (Tier 2: 20 requests/minute for most endpoints).

### Setup

1. Create a Slack App at [api.slack.com/apps](https://api.slack.com/apps)
2. Add OAuth scopes: `dnd:write`, `users.profile:write`, `users:read`
3. Install app to workspace (user must authorize)
4. Store OAuth access token securely via Electron `safeStorage`

### Authentication (OAuth 2.0)

```typescript
// User authorizes app, receives OAuth token
const SLACK_TOKEN = await safeStorage.decryptString(encryptedSlackToken);

const slackClient = new WebClient(SLACK_TOKEN);
```

### Code Example: Set DND During Session

```typescript
import { WebClient } from '@slack/web-api';

async function startSlackDND(sessionDurationMinutes: number): Promise<void> {
  const slack = new WebClient(SLACK_TOKEN);

  // Set DND for session duration
  await slack.dnd.setSnooze({
    num_minutes: sessionDurationMinutes,
  });

  // Set custom status
  await slack.users.profile.set({
    profile: JSON.stringify({
      status_text: `Focusing until ${getEndTime(sessionDurationMinutes)}`,
      status_emoji: ':brain:',
      status_expiration: Math.floor(Date.now() / 1000) + sessionDurationMinutes * 60,
    }),
  });
}

async function endSlackDND(): Promise<void> {
  const slack = new WebClient(SLACK_TOKEN);

  // End DND snooze
  await slack.dnd.endSnooze();

  // Clear status
  await slack.users.profile.set({
    profile: JSON.stringify({
      status_text: '',
      status_emoji: '',
      status_expiration: 0,
    }),
  });
}
```

### Error Handling

| Error              | Handling                                          |
| ------------------ | ------------------------------------------------- |
| `not_authed`       | Re-prompt user to reconnect Slack                 |
| `token_revoked`    | Clear stored token, show reconnect flow           |
| `ratelimited`      | Wait `Retry-After` header seconds, retry          |
| `account_inactive` | Notify user, disable Slack integration            |
| Network error      | Queue status change, apply when back online       |

### Alternatives

| Alternative           | Pros                                | Cons                          |
| --------------------- | ----------------------------------- | ----------------------------- |
| Microsoft Teams (Graph API) | Enterprise-friendly            | More complex auth, heavier SDK|
| Discord API           | Developer community reach           | Not a work tool for most      |
| Generic webhook       | Works with any platform             | No standardized DND control   |

---

## 4. Spotify API

**Purpose:** Alternative to built-in soundscapes. Allow users to play focus-friendly Spotify playlists during sessions instead of procedural audio.

### Pricing

**Free.** Spotify Web API is free. Requires Spotify Premium for playback control (free tier only allows metadata access).

### Setup

1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Set redirect URI for Electron: `http://localhost:3848/callback`
3. Request scopes: `user-modify-playback-state`, `user-read-playback-state`, `user-read-currently-playing`, `playlist-read-private`
4. OAuth 2.0 Authorization Code Flow with PKCE (recommended for desktop apps)

### Authentication (OAuth 2.0 with PKCE)

```typescript
import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  redirectUri: 'http://localhost:3848/callback',
});

// Generate auth URL with PKCE
const scopes = [
  'user-modify-playback-state',
  'user-read-playback-state',
  'playlist-read-private',
];
const authUrl = spotifyApi.createAuthorizeURL(scopes, state);
```

### Code Example: Play Focus Playlist

```typescript
async function playFocusPlaylist(playlistId?: string): Promise<void> {
  // Default DeepFocus-curated playlist if none specified
  const targetPlaylist = playlistId || 'spotify:playlist:DEEPFOCUS_DEFAULT_ID';

  await spotifyApi.play({
    context_uri: targetPlaylist,
  });

  // Set lower volume for background listening
  await spotifyApi.setVolume(35);
}

async function pauseOnSessionEnd(): Promise<void> {
  const playbackState = await spotifyApi.getMyCurrentPlaybackState();
  if (playbackState.body.is_playing) {
    await spotifyApi.pause();
  }
}

async function getFocusPlaylists(): Promise<Playlist[]> {
  // Search for focus/concentration playlists
  const results = await spotifyApi.searchPlaylists('deep focus concentration', {
    limit: 20,
  });

  return results.body.playlists?.items || [];
}
```

### Error Handling

| Error                      | Handling                                          |
| -------------------------- | ------------------------------------------------- |
| 401 Token expired          | Use refresh token to get new access token         |
| 403 Premium required       | Notify user that playback control requires Premium|
| 404 No active device       | Prompt user to open Spotify on their device       |
| `PLAYER_COMMAND_FAILED`    | Retry once, then notify user                      |
| Network error              | Fall back to built-in soundscapes gracefully      |

### Alternatives

| Alternative          | Pros                              | Cons                             |
| -------------------- | --------------------------------- | -------------------------------- |
| Apple Music API      | Strong macOS integration          | Apple ecosystem only, complex auth|
| YouTube Music        | Huge library                      | No official playback control API |
| Built-in Tone.js     | Free, private, no dependency      | Less variety than a music library|
| SoundCloud API       | Indie music, creative commons     | Limited focus-specific content   |

---

## 5. Apple HealthKit (via Electron)

**Purpose:** Read heart rate and heart rate variability (HRV) data from Apple Watch to detect physiological flow state during focus sessions.

### Pricing

**Free.** HealthKit is a framework provided by Apple at no cost. Requires macOS and a paired Apple Watch.

### Setup

1. Add HealthKit entitlement to Electron app (macOS only)
2. Request authorization for specific health data types
3. Use native Node module or Swift bridge to access HealthKit from Electron main process
4. Required data types: `HKQuantityTypeIdentifierHeartRate`, `HKQuantityTypeIdentifierHeartRateVariabilitySDNN`

### Architecture

```
Electron Main Process
  |
  +-- Native Module (node-addon-api or Swift bridge)
       |
       +-- HealthKit Framework (macOS)
            |
            +-- Apple Watch (Bluetooth)
                 |
                 +-- Heart Rate Sensor
                 +-- HRV Sensor
```

### Code Example: Read Heart Rate During Session

```typescript
// In Electron main process (via native module)
import { healthKit } from './native/healthkit-bridge';

async function startBiometricMonitoring(
  sessionId: string
): Promise<void> {
  // Request authorization (one-time)
  const authorized = await healthKit.requestAuthorization([
    'heartRate',
    'heartRateVariability',
  ]);

  if (!authorized) {
    console.log('HealthKit authorization denied');
    return;
  }

  // Start observing heart rate changes
  healthKit.observeHeartRate((sample: HeartRateSample) => {
    const { bpm, timestamp } = sample;

    // Send to renderer process for flow state analysis
    mainWindow.webContents.send('biometric:heartrate', {
      sessionId,
      bpm,
      timestamp,
    });
  });
}

// In renderer process: flow state detection
function detectFlowState(samples: HeartRateSample[]): boolean {
  if (samples.length < 10) return false;

  const recentSamples = samples.slice(-10);
  const avgBpm = recentSamples.reduce((sum, s) => sum + s.bpm, 0) / 10;
  const variance = recentSamples.reduce(
    (sum, s) => sum + Math.pow(s.bpm - avgBpm, 2),
    0
  ) / 10;
  const stdDev = Math.sqrt(variance);

  // Flow state indicators: steady, moderate heart rate with low variability
  return avgBpm >= 60 && avgBpm <= 85 && stdDev < 3.0;
}
```

### Error Handling

| Error                           | Handling                                       |
| ------------------------------- | ---------------------------------------------- |
| HealthKit not available         | Feature disabled, no biometric section in UI   |
| Authorization denied            | Show explanation, provide link to System Settings|
| No Apple Watch paired           | Notify user, suggest pairing instructions      |
| Stale data (no recent samples)  | Fall back to software-only flow detection      |
| Platform not macOS              | Feature hidden entirely on Windows/Linux       |

### Alternatives

| Alternative              | Pros                              | Cons                            |
| ------------------------ | --------------------------------- | ------------------------------- |
| Fitbit Web API           | Cross-platform, REST-based        | Polling delay, not real-time    |
| Garmin Connect IQ        | Detailed fitness data             | Complex SDK, niche audience     |
| Polar API                | Accurate HRV                      | Small user base                 |
| Webcam-based HR detection| No hardware needed                | Less accurate, privacy concerns |

---

## 6. Tone.js

**Purpose:** Procedural ambient soundscape generation. Creates infinite, non-repeating focus audio directly in the browser/Electron renderer.

### Pricing

**Free and open source.** MIT licensed. No API calls, no usage limits, no external dependencies at runtime.

### Setup

```bash
pnpm add tone
```

No API keys, no authentication. Tone.js runs entirely client-side.

### Code Example: Procedural Rain Soundscape

```typescript
import * as Tone from 'tone';

class RainSoundscape {
  private noise: Tone.Noise;
  private filter: Tone.AutoFilter;
  private reverb: Tone.Reverb;
  private masterGain: Tone.Gain;
  private dropletSynth: Tone.Synth;
  private dropletLoop: Tone.Loop;

  constructor() {
    // Base rain: filtered noise
    this.masterGain = new Tone.Gain(0.6).toDestination();
    this.reverb = new Tone.Reverb({ decay: 4, wet: 0.5 }).connect(this.masterGain);
    this.filter = new Tone.AutoFilter({
      frequency: 0.08,
      baseFrequency: 400,
      octaves: 3,
    }).connect(this.reverb);

    this.noise = new Tone.Noise('pink').connect(this.filter);

    // Individual droplet accents
    this.dropletSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
      volume: -20,
    }).connect(this.reverb);

    // Stochastic droplet events
    this.dropletLoop = new Tone.Loop((time) => {
      if (Math.random() > 0.6) {
        const freq = 2000 + Math.random() * 4000;
        this.dropletSynth.triggerAttackRelease(freq, '32n', time);
      }
    }, '8n');
  }

  async start(): Promise<void> {
    await Tone.start();
    this.noise.start();
    this.filter.start();
    this.dropletLoop.start();
    Tone.getTransport().start();
  }

  stop(): void {
    this.noise.stop();
    this.dropletLoop.stop();
    Tone.getTransport().stop();
  }

  setVolume(value: number): void {
    // value: 0 to 1
    this.masterGain.gain.rampTo(value, 0.5);
  }
}
```

### Code Example: Crossfade Between Soundscapes

```typescript
class SoundscapeEngine {
  private activeSoundscape: Soundscape | null = null;
  private crossfadeDuration = 3; // seconds

  async crossfadeTo(newSoundscape: Soundscape): Promise<void> {
    if (this.activeSoundscape) {
      // Fade out current
      this.activeSoundscape.fadeOut(this.crossfadeDuration);
    }

    // Fade in new
    await newSoundscape.start();
    newSoundscape.fadeIn(this.crossfadeDuration);

    // Clean up old after crossfade
    setTimeout(() => {
      this.activeSoundscape?.stop();
      this.activeSoundscape?.dispose();
      this.activeSoundscape = newSoundscape;
    }, this.crossfadeDuration * 1000);
  }
}
```

### Performance Considerations

| Concern                     | Mitigation                                      |
| --------------------------- | ----------------------------------------------- |
| CPU usage during long sessions | Use AudioWorklet for custom processing         |
| Memory leaks from audio nodes | Dispose all nodes on soundscape change          |
| Main thread blocking        | All synthesis runs in audio thread by default    |
| Low-end device support      | "Lite" mode with simpler synthesis (fewer layers)|

### Alternatives

| Alternative          | Pros                              | Cons                             |
| -------------------- | --------------------------------- | -------------------------------- |
| Howler.js            | Simpler API, good for playback    | No procedural generation         |
| Web Audio API (raw)  | Full control, no dependencies     | Verbose, complex scheduling      |
| Pre-recorded loops   | Zero CPU, predictable quality     | Repetitive, larger file size     |
| FMOD / Wwise         | Professional game audio engines   | Overkill, licensing costs        |

---

## 7. Supabase Realtime

**Purpose:** Power live co-focus rooms where users can see each other's presence and session status in real time.

### Pricing

| Tier    | Price     | Concurrent Connections | Messages/Month  |
| ------- | --------- | ---------------------- | --------------- |
| Free    | $0        | 200                    | 2M              |
| Pro     | $25/mo    | 500                    | 5M              |
| Team    | $599/mo   | 10,000                 | Unlimited       |

### Setup

Supabase Realtime is included with every Supabase project. No additional setup beyond the standard Supabase client.

```bash
pnpm add @supabase/supabase-js
```

### Authentication

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

### Code Example: Co-Focus Room with Presence

```typescript
interface FocusPresence {
  userId: string;
  displayName: string;
  status: 'focusing' | 'on_break' | 'idle';
  taskName: string;
  sessionStartedAt: string;
  focusScore: number;
}

function joinFocusRoom(roomId: string, userPresence: FocusPresence) {
  const channel = supabase.channel(`room:${roomId}`, {
    config: {
      presence: { key: userPresence.userId },
    },
  });

  // Track presence
  channel.on('presence', { event: 'sync' }, () => {
    const presenceState = channel.presenceState<FocusPresence>();
    updateRoomUI(presenceState);
  });

  channel.on('presence', { event: 'join' }, ({ newPresences }) => {
    showToast(`${newPresences[0].displayName} joined the room`);
  });

  channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
    showToast(`${leftPresences[0].displayName} left the room`);
  });

  // Subscribe and track
  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track(userPresence);
    }
  });

  return channel;
}

// Update presence when session state changes
async function updatePresenceStatus(
  channel: RealtimeChannel,
  newStatus: FocusPresence
) {
  await channel.track(newStatus);
}
```

### Error Handling

| Error                     | Handling                                       |
| ------------------------- | ---------------------------------------------- |
| Connection lost           | Auto-reconnect with exponential backoff        |
| Channel subscription fail | Retry 3 times, then show "Room unavailable"    |
| Presence sync delay       | Show "Syncing..." indicator, resolve on update |
| Max connections reached   | Show "Room full" message, suggest another room |

### Alternatives

| Alternative          | Pros                              | Cons                             |
| -------------------- | --------------------------------- | -------------------------------- |
| Socket.io            | Battle-tested, large community    | Self-hosted, more infrastructure |
| Ably                 | Managed realtime, global edge     | $25/mo minimum for production    |
| Pusher               | Easy setup, good docs             | Per-message pricing gets expensive|
| Liveblocks           | React-native, presence built-in   | Focused on collaborative editing |
| PartyKit             | Edge-native, fun to use           | Newer, smaller community         |

---

## Cost Projections Summary

### Monthly API Costs by Growth Stage

| Stage         | Users (MAU) | OpenAI   | Google Cal | Slack  | Spotify | Supabase | Tone.js | Total       |
| ------------- | ----------- | -------- | ---------- | ------ | ------- | -------- | ------- | ----------- |
| Pre-launch    | 100         | $5       | $0         | $0     | $0      | $0       | $0      | ~$5         |
| Early         | 1,000       | $45      | $0         | $0     | $0      | $0       | $0      | ~$45        |
| Growing       | 10,000      | $450     | $0         | $0     | $0      | $25      | $0      | ~$475       |
| Scaling       | 100,000     | $3,600   | $0         | $0     | $0      | $599     | $0      | ~$4,200     |
| At scale      | 500,000     | $13,500  | $0         | $0     | $0      | $2,000+  | $0      | ~$15,500    |

### Cost Optimization Strategies

| Strategy                                  | Impact                                      |
| ----------------------------------------- | ------------------------------------------- |
| Cache OpenAI responses for common tasks   | 40-60% reduction in API calls               |
| Use local TensorFlow.js for classification| Eliminates OpenAI calls for repeat patterns |
| Batch insight generation (daily, not per-session) | 80% fewer OpenAI calls for insights  |
| Supabase row-level security (RLS)         | Prevents unnecessary data transfer          |
| Lazy-load API integrations                | Zero cost for features user hasn't enabled  |
| Rate limit AI features on free tier       | Control costs from non-paying users         |

---

## API Key Management

### Storage

All API keys and OAuth tokens are stored using Electron's `safeStorage` API, which encrypts data using the OS-level credential store:
- macOS: Keychain
- Windows: DPAPI (Data Protection API)
- Linux: libsecret / GNOME Keyring

### Key Rotation

| Service        | Rotation Strategy                              |
| -------------- | ---------------------------------------------- |
| OpenAI         | Rotate every 90 days via dashboard             |
| Google OAuth   | Refresh tokens auto-rotate on use              |
| Slack OAuth    | Tokens are long-lived, revocable by user       |
| Spotify OAuth  | Access tokens expire hourly, refresh automatic |
| Supabase       | Anon key is public; use RLS for security       |

### Security Best Practices

1. Never ship API keys in the Electron app bundle
2. Use environment variables for development, `safeStorage` for production
3. Implement server-side proxy for OpenAI calls if needed (Supabase Edge Function)
4. All OAuth flows use PKCE for desktop app security
5. Token refresh happens silently in background
6. Failed auth prompts user to re-authenticate, never retries with stale credentials
