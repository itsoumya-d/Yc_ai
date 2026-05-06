# VaultEdit -- Feature Roadmap

## Roadmap Overview

| Phase | Timeline | Focus | Key Deliverable |
|---|---|---|---|
| **MVP** | Months 1-6 | Core transcript-based editing + AI essentials | Ship v1.0 -- usable editor that saves creators 70% of editing time |
| **Post-MVP** | Months 7-12 | NL commands, multi-platform, thumbnails | Expand from "faster editor" to "complete creator toolkit" |
| **Year 2+** | Months 13-24 | Collaboration, AI B-roll, analytics | Platform with network effects and ecosystem lock-in |

---

## Phase 1: MVP (Months 1-6)

### F1. AI Transcription-Based Editing

**The core innovation.** Users edit video by editing a transcript. Delete words from the transcript and the corresponding video segments are cut. Select a paragraph and apply effects. The transcript IS the editing interface.

| Detail | Specification |
|---|---|
| **Priority** | P0 -- Critical |
| **Timeline** | Months 1-3 |
| **Dependencies** | Whisper API integration, video engine timeline sync |

**Capabilities:**

- Import video file (MP4, MOV, MKV, AVI, WebM) and auto-extract audio
- Send audio to Whisper API for word-level transcription with timestamps
- Display transcript in a scrollable, editable text view alongside the video preview
- Clicking a word in the transcript seeks the video to that timestamp
- Selecting and deleting words/sentences/paragraphs removes the corresponding video segments (non-destructive -- edit decision list, not destructive file modification)
- Undo/redo support for all transcript edits (Cmd+Z / Ctrl+Z)
- Filler word highlighting: automatically detect and highlight "um," "uh," "like," "you know," "basically," "actually," "so," and other configurable filler words
- One-click filler word removal: select all highlighted fillers and remove with a single action
- Speaker diarization: identify different speakers and label transcript sections (for interview/podcast content)
- Transcript export: download as SRT, VTT, TXT, or JSON
- Manual transcript correction: click any word to edit the transcription if Whisper made an error
- Confidence indicators: color-code words by transcription confidence so creators know which words to double-check

**User Stories:**

- As a creator, I want to import my raw footage and see a transcript within 60 seconds so I can start editing immediately.
- As a creator, I want to delete all my "ums" and "uhs" with one click so I sound more polished.
- As a creator, I want to rearrange paragraphs in the transcript to restructure my video without touching a timeline.
- As a podcast host, I want to see which speaker said what so I can edit each person's audio independently.

**Edge Cases:**

- Video with no speech (music video, b-roll montage): show empty transcript with option to switch to timeline-only mode
- Multiple languages in one video: detect language switches and transcribe each segment in the correct language
- Very long videos (2+ hours): paginate transcript, lazy-load sections, maintain responsive UI
- Poor audio quality: show confidence warnings, suggest manual review of low-confidence sections
- Background music overlapping speech: pre-process audio with vocal isolation before transcription

---

### F2. Auto Silence & Dead Air Removal

| Detail | Specification |
|---|---|
| **Priority** | P0 -- Critical |
| **Timeline** | Months 2-3 |
| **Dependencies** | Audio processing engine (Rust) |

**Capabilities:**

- Analyze audio waveform to detect silence segments (configurable threshold: -30dB to -50dB)
- Configurable minimum silence duration to remove (default: 0.8 seconds, range: 0.3-5.0 seconds)
- Preview all detected silences before removal (highlighted in the transcript and waveform)
- One-click removal of all detected silences
- Selective removal: choose which silences to keep (intentional dramatic pauses vs. awkward gaps)
- "Tighten" mode: reduce silences to a configurable duration (e.g., shorten all pauses to 0.3 seconds) rather than removing entirely
- Audio-only analysis: does not remove segments where the speaker is gesturing/reacting silently on camera (visual activity detection)
- Breath removal: optionally detect and remove loud breaths between sentences
- Preview before/after: split-screen or A/B playback to hear the difference

**User Stories:**

- As a creator, I want dead air automatically detected and removed so my videos feel more dynamic without manual scrubbing.
- As a creator, I want to keep intentional pauses but remove awkward gaps so my pacing feels natural.
- As a creator, I want to preview silence removal before applying it so I can ensure nothing important is cut.

---

### F3. Smart Jump Cuts

| Detail | Specification |
|---|---|
| **Priority** | P1 -- High |
| **Timeline** | Months 3-4 |
| **Dependencies** | Scene detection, silence removal |

**Capabilities:**

- Auto-generate jump cuts at natural break points (sentence boundaries, topic shifts, pauses)
- Configurable jump cut style: hard cut, slight zoom (2-5%), position shift
- "YouTube style" preset: slight zoom-in on each cut to create energy (popular technique)
- Smooth cuts: apply short cross-dissolve (0.1-0.3s) between jump cuts to reduce jarring transitions
- Smart framing: when zooming on jump cuts, keep the speaker's face centered using face detection
- Jump cut density control: slider from "minimal" (only remove dead air) to "aggressive" (fast-paced, high-energy)
- A/B preview: toggle jump cuts on/off to compare pacing

**User Stories:**

- As a talking-head creator, I want automatic jump cuts at natural pause points so my video feels engaging without manual cutting.
- As a creator, I want the zoom-in jump cut style that popular YouTubers use without manually keyframing every cut.

---

### F4. Auto Captions

| Detail | Specification |
|---|---|
| **Priority** | P0 -- Critical |
| **Timeline** | Months 3-5 |
| **Dependencies** | Whisper transcription |

**Capabilities:**

- Generate word-level captions from the Whisper transcript
- SRT/VTT export for YouTube's built-in caption system
- Burned-in captions: render captions directly onto the video (required for Shorts, TikTok, Reels)
- Caption styles: 10+ pre-built styles (YouTube standard, bold highlight, karaoke/word-by-word, minimal, cinematic)
- Customizable: font, size, color, background, position, animation, shadow, outline
- Word-by-word highlight: current spoken word highlighted in a different color (the TikTok/Hormozi style)
- Emoji insertion: optionally add relevant emojis next to key words
- Profanity filter: auto-bleep and censor/blur caption text for family-friendly content
- Multi-language captions: generate captions in additional languages via AI translation
- Caption timing fine-tuning: manually adjust word timing by dragging in the timeline
- Safe zone preview: show platform-specific safe zones (YouTube end screen area, TikTok UI overlay zones)

**User Stories:**

- As a creator, I want burned-in captions with the word-by-word highlight style so my Shorts get more views.
- As a creator, I want to export SRT files for YouTube's caption system so my long-form videos are accessible.
- As a creator, I want to preview how captions look on different platforms so text is not hidden behind UI elements.

---

### F5. Basic Color Correction Presets

| Detail | Specification |
|---|---|
| **Priority** | P1 -- High |
| **Timeline** | Months 4-5 |
| **Dependencies** | Video engine GPU rendering |

**Capabilities:**

- 20+ one-click color presets optimized for common YouTube scenarios (talking head, outdoor, product review, gaming, cooking)
- Basic manual adjustments: exposure, contrast, saturation, temperature, tint, highlights, shadows
- LUT (Look-Up Table) import: apply .cube LUT files from popular color grading packs
- Auto white balance: one-click white balance correction
- Color match: match the color grade of the current video to a reference frame (for consistency across videos)
- Before/after split view: drag a divider to compare original vs. color-corrected footage
- Preset saving: save custom color grades as reusable presets

**User Stories:**

- As a creator, I want to apply a professional-looking color grade with one click so my videos look polished without learning color science.
- As a creator, I want to match my color grading across videos so my channel has a consistent look.

---

### F6. YouTube-Optimized Export

| Detail | Specification |
|---|---|
| **Priority** | P0 -- Critical |
| **Timeline** | Months 4-6 |
| **Dependencies** | Video engine encoding |

**Capabilities:**

- One-click export presets: YouTube (1080p, 1440p, 4K), YouTube Shorts (1080x1920), TikTok, Instagram Reels, Instagram Feed
- Codec selection: H.264 (widest compatibility), H.265 (smaller files), VP9 (YouTube's preferred), AV1 (best quality/size ratio)
- Bitrate optimization: auto-calculate optimal bitrate based on resolution, duration, and content type
- Audio normalization: auto-normalize to -14 LUFS (YouTube's target loudness)
- Render queue: queue multiple exports (same video to different platforms/formats)
- Background rendering: continue editing other projects while exporting
- Hardware acceleration: use GPU encoding (NVENC, VideoToolbox, QSV) when available
- Estimated file size preview before export
- Export history: log of all exports with file paths and settings

**User Stories:**

- As a creator, I want to export my video in the exact format YouTube recommends so I get the best quality after YouTube's re-encoding.
- As a creator, I want to export the same video for YouTube, TikTok, and Instagram Reels in one batch so I can publish everywhere quickly.

---

### F7. Project Management

| Detail | Specification |
|---|---|
| **Priority** | P1 -- High |
| **Timeline** | Months 1-6 (incremental) |
| **Dependencies** | Supabase backend |

**Capabilities:**

- Project library: grid/list view of all projects with thumbnails, duration, last edited date
- Project metadata: name, description, tags, status (draft, in-progress, exported, published)
- Auto-save: save project state every 30 seconds and on every significant edit
- Project duplication: clone a project to create variations
- Project archive: hide completed projects without deleting
- Storage management: show disk space used by each project, option to delete render cache
- Recent projects: quick access to last 5 opened projects
- Import/export project files: share project files (without media) for collaboration

---

## Phase 2: Post-MVP (Months 7-12)

### F8. Natural Language Editing Commands

| Detail | Specification |
|---|---|
| **Priority** | P0 -- Critical for Phase 2 |
| **Timeline** | Months 7-9 |
| **Dependencies** | GPT-4o integration, edit plan execution engine |

**Capabilities:**

- AI command panel: a chat-like interface where creators type editing instructions in plain English
- Command interpretation: GPT-4o parses the command and generates a structured edit plan
- Edit plan preview: show the creator exactly what changes will be made before applying
- Accept/reject/modify: creators can accept the full plan, reject it, or modify individual operations
- Command history: log of all AI commands with the ability to undo any command's effects
- Context awareness: AI understands the full transcript, scene structure, and current edit state

**Example Commands:**

| Command | Action |
|---|---|
| "Remove all ums and uhs" | Detect filler words in transcript, generate cuts for each |
| "Add a zoom-in when I mention the product name" | Find product name mentions, add 120% zoom keyframes |
| "Make this section faster" | Increase playback speed by 1.2x for the selected section |
| "Add chapter markers based on topic changes" | Analyze transcript for topic shifts, insert YouTube chapter markers |
| "Create a 60-second highlight reel for TikTok" | Identify most engaging segments, compile into 9:16 vertical format |
| "Match the pacing of my intro to this reference video" | Analyze reference video's cut rhythm and apply similar pacing |
| "Add b-roll of a city skyline during the transition" | Search stock library, insert matching b-roll clip |
| "Lower the background music when I'm speaking" | Apply audio ducking to music track during speech segments |

**Edge Cases:**

- Ambiguous commands: ask clarifying questions before executing ("Which product name? I found 3 different ones.")
- Destructive commands: require explicit confirmation ("This will remove 4 minutes of footage. Preview?")
- Impossible commands: explain why the command cannot be executed and suggest alternatives
- Compound commands: break into steps and execute sequentially with approval between steps

---

### F9. Auto Chapter Markers for YouTube

| Detail | Specification |
|---|---|
| **Priority** | P1 -- High |
| **Timeline** | Months 7-8 |
| **Dependencies** | GPT-4o, transcript analysis |

**Capabilities:**

- Analyze transcript to identify topic boundaries and generate chapter titles
- Generate timestamps in YouTube's required format (00:00, 02:15, 05:30, etc.)
- Copy chapter list to clipboard for pasting into YouTube description
- Optional: direct upload to YouTube via YouTube Data API
- Manual override: add, remove, or rename chapters
- Chapter preview: show chapter boundaries on the timeline with labels
- SEO optimization: generate chapter titles that are searchable and descriptive

---

### F10. Thumbnail Generator

| Detail | Specification |
|---|---|
| **Priority** | P1 -- High |
| **Timeline** | Months 8-10 |
| **Dependencies** | Canvas rendering, image export |

**Capabilities:**

- Auto-extract the best frames from the video (highest visual interest, clear faces, good lighting)
- Thumbnail templates: 20+ YouTube-optimized templates with text, backgrounds, and styling
- Text overlay editor: add titles, subtitles, and callout text with YouTube-proven fonts and styles
- Background removal: AI-powered background removal for the subject (for the classic "creator + dramatic background" thumbnail style)
- Face enhancement: auto-brighten and sharpen faces in thumbnails
- Emotion amplification: suggest frames where the creator's facial expression is most expressive
- A/B variant generation: create 2-3 thumbnail variants for testing
- Export at YouTube's optimal resolution (1280x720 minimum, 1920x1080 recommended)
- Thumbnail safe zone preview: ensure text and faces are not obscured by YouTube's UI overlay

---

### F11. Multi-Format Export

| Detail | Specification |
|---|---|
| **Priority** | P0 -- Critical for Phase 2 |
| **Timeline** | Months 8-10 |
| **Dependencies** | Video engine crop/resize, caption positioning |

**Capabilities:**

- One-click repurpose: convert a landscape YouTube video to vertical Shorts/TikTok/Reels
- Smart crop: AI detects the speaker/subject and keeps them centered during crop
- Platform-specific caption repositioning: move captions to platform-optimal positions
- Duration optimization: auto-trim to platform limits (60s for Shorts, 90s for Reels, 3 min for TikTok)
- Batch export: render all format variants in a single operation
- Platform presets with format specifications:

| Platform | Resolution | Aspect | Max Duration | Codec |
|---|---|---|---|---|
| YouTube | 3840x2160 | 16:9 | Unlimited | H.264/VP9 |
| YouTube Shorts | 1080x1920 | 9:16 | 60s | H.264 |
| TikTok | 1080x1920 | 9:16 | 3 min | H.264 |
| Instagram Reels | 1080x1920 | 9:16 | 90s | H.264 |
| Instagram Feed | 1080x1080 | 1:1 | 60s | H.264 |
| Twitter/X | 1920x1080 | 16:9 | 2:20 | H.264 |

---

### F12. A/B Thumbnail Testing Integration

| Detail | Specification |
|---|---|
| **Priority** | P2 -- Medium |
| **Timeline** | Months 10-12 |
| **Dependencies** | YouTube Data API, thumbnail generator |

**Capabilities:**

- Upload multiple thumbnail variants to YouTube via API
- Schedule automatic thumbnail rotation (e.g., swap every 24 hours)
- Track CTR (click-through rate) for each variant via YouTube Analytics API
- Declare a winner after statistical significance is reached
- Dashboard showing test results with confidence intervals

---

### F13. Auto Highlight Reel Generation

| Detail | Specification |
|---|---|
| **Priority** | P1 -- High |
| **Timeline** | Months 10-12 |
| **Dependencies** | GPT-4o, scene detection, audio energy analysis |

**Capabilities:**

- Analyze full video to identify the most engaging moments (based on speech energy, topic importance, visual interest)
- Generate a 30-60 second highlight reel automatically
- Optimize for vertical format (YouTube Shorts, TikTok)
- Add transitions between highlight segments
- Add captions automatically
- User can review and adjust segment selection before export
- Multiple highlight styles: "trailer" (dramatic), "best moments" (funny), "key takeaways" (educational)

---

## Phase 3: Year 2+ (Months 13-24)

### F14. AI B-Roll Library

| Detail | Specification |
|---|---|
| **Priority** | P1 -- High |
| **Timeline** | Months 13-16 |
| **Dependencies** | Pexels/Pixabay API, AI image generation |

**Capabilities:**

- Context-aware b-roll suggestions: AI reads the transcript and suggests relevant stock footage at natural insertion points
- Stock footage search: search Pexels, Pixabay, and premium libraries from within VaultEdit
- AI-generated b-roll: generate custom b-roll using AI image/video generation for niche topics where stock footage does not exist
- B-roll timing: automatically match b-roll duration to the speech segment it covers
- Ken Burns effect: auto-apply subtle pan/zoom to static images used as b-roll
- Favorites and usage history: save frequently used b-roll for quick access

---

### F15. Real-Time Collaboration

| Detail | Specification |
|---|---|
| **Priority** | P1 -- High |
| **Timeline** | Months 14-18 |
| **Dependencies** | Supabase Realtime, CRDT implementation |

**Capabilities:**

- Share project with team members via link
- Role-based access: editor, reviewer (comment-only), viewer
- Real-time cursor presence: see where collaborators are in the transcript/timeline
- Comment system: leave timestamped comments on specific transcript sections
- Suggestion mode: propose edits that the project owner can accept/reject
- Activity log: full history of who changed what and when
- Conflict resolution: CRDT-based merge for concurrent edits to the same project

---

### F16. Brand Kit

| Detail | Specification |
|---|---|
| **Priority** | P1 -- High |
| **Timeline** | Months 15-18 |
| **Dependencies** | Template system, asset management |

**Capabilities:**

- Define brand colors, fonts, and logo for automatic application
- Custom intro/outro templates: auto-prepend/append branded segments to every video
- Lower third templates: consistent name/title cards
- Transition presets: branded transitions between segments
- Watermark management: add/remove channel watermark
- Caption styling presets: branded caption appearance
- One-click brand application: apply full brand kit to any project

---

### F17. Sponsor Segment Tools

| Detail | Specification |
|---|---|
| **Priority** | P2 -- Medium |
| **Timeline** | Months 16-19 |
| **Dependencies** | Transcript analysis, template system |

**Capabilities:**

- Sponsor segment detection: identify ad reads in the transcript
- Sponsor segment templates: pre-built visual treatments for sponsor segments (card overlays, product displays)
- Timing optimization: AI suggests optimal placement for sponsor segments based on retention data
- Disclosure compliance: auto-add "#ad" or "Paid promotion" disclosures as required
- Sponsor segment analytics: track sponsor segment retention vs. rest of video

---

### F18. Analytics Integration

| Detail | Specification |
|---|---|
| **Priority** | P2 -- Medium |
| **Timeline** | Months 18-22 |
| **Dependencies** | YouTube Analytics API, data visualization |

**Capabilities:**

- Import YouTube Analytics data for published videos
- Overlay retention graph on the video timeline
- Correlate editing decisions with viewer retention (e.g., "videos where you used jump cuts at intro had 15% better retention")
- Identify drop-off points and suggest fixes ("viewers tend to leave at 3:42 -- this is a 5-second pause, consider cutting it")
- A/B analysis: compare edit styles across videos and their performance
- Editing recommendations based on channel performance data

---

### F19. AI Voice Cloning for Fixes

| Detail | Specification |
|---|---|
| **Priority** | P2 -- Medium |
| **Timeline** | Months 20-24 |
| **Dependencies** | Voice cloning API, ethical guidelines |

**Capabilities:**

- Clone the creator's voice from existing footage (requires consent and verification)
- Fix mispronunciations: type the correct word and the AI re-generates the audio in the creator's voice
- Insert missing words: add words the creator forgot to say
- Re-record individual sentences without re-filming
- Strict ethical safeguards: only the account owner's voice can be cloned, clear disclosure system, cannot clone other speakers

---

## Development Timeline Summary

```
Month 1  |====| Project setup, Electron shell, video import
Month 2  |====| Whisper integration, transcript UI, basic playback
Month 3  |====| Transcript editing -> video cuts, silence detection
Month 4  |====| Auto captions, smart jump cuts, color presets
Month 5  |====| Export engine, platform presets, audio normalization
Month 6  |====| Polish, beta testing, project management, v1.0 launch
         |    |
Month 7  |====| AI command panel (GPT-4o integration)
Month 8  |====| Chapter markers, thumbnail generator begins
Month 9  |====| NL command refinement, thumbnail generator
Month 10 |====| Multi-format export, highlight reel generator
Month 11 |====| A/B thumbnail testing, highlight reel polish
Month 12 |====| Polish, performance optimization, v2.0 launch
         |    |
Month 13 |====| AI b-roll library, stock footage integration
Month 14 |====| Real-time collaboration infrastructure
Month 15 |====| Brand kit system, collaboration continues
Month 16 |====| Sponsor segment tools, collaboration launch
Month 17 |====| Collaboration refinement, brand kit polish
Month 18 |====| Analytics integration begins
Month 19 |====| Analytics dashboard, editing recommendations
Month 20 |====| Voice cloning research, analytics polish
Month 21 |====| Voice cloning implementation, safety measures
Month 22 |====| Analytics correlation features, v3.0 prep
Month 23 |====| Template marketplace launch
Month 24 |====| v3.0 launch, ecosystem features
```

---

## Feature Prioritization Matrix

| Feature | Impact | Effort | Priority | Phase |
|---|---|---|---|---|
| Transcript-based editing | Very High | High | P0 | MVP |
| Auto silence removal | Very High | Medium | P0 | MVP |
| Auto captions | Very High | Medium | P0 | MVP |
| YouTube-optimized export | High | Medium | P0 | MVP |
| Smart jump cuts | High | Medium | P1 | MVP |
| Color presets | Medium | Low | P1 | MVP |
| Project management | Medium | Medium | P1 | MVP |
| NL editing commands | Very High | Very High | P0 | Post-MVP |
| Multi-format export | High | Medium | P0 | Post-MVP |
| Chapter markers | High | Low | P1 | Post-MVP |
| Thumbnail generator | High | High | P1 | Post-MVP |
| Highlight reel | High | High | P1 | Post-MVP |
| A/B thumbnail testing | Medium | Medium | P2 | Post-MVP |
| AI b-roll library | High | Very High | P1 | Year 2 |
| Real-time collaboration | High | Very High | P1 | Year 2 |
| Brand kit | Medium | Medium | P1 | Year 2 |
| Sponsor segment tools | Medium | Medium | P2 | Year 2 |
| Analytics integration | Medium | High | P2 | Year 2 |
| Voice cloning | Medium | Very High | P2 | Year 2 |

---

*Every feature is measured by one question: does this save the creator time?*
