# Luminary -- Features

> Comprehensive feature breakdown organized by development phase, with user stories, edge cases, and timeline.

---

## Feature Philosophy

Luminary's features follow three guiding principles:

1. **Assist, don't replace**: Every feature helps the producer make better decisions -- it never takes decisions away from them.
2. **Explain, don't just suggest**: Every AI output includes a brief explanation of the music theory or engineering principle behind it.
3. **Integrate, don't isolate**: Features produce outputs (MIDI, settings, audio) that flow directly back into the producer's DAW.

---

## Phase 1: MVP (Months 1-6)

### 1.1 AI Chord Progression Generator

**Description**: An interactive chord exploration tool that suggests harmonically valid chord progressions based on key, genre, mood, and existing musical context.

**Core Functionality**:
- Select a key and scale (e.g., C major, A minor, D dorian)
- Choose a mood or vibe (uplifting, melancholic, dreamy, aggressive, chill)
- Choose a genre template (lo-fi hip-hop, future bass, indie pop, techno)
- Receive 3-5 chord progression suggestions ranked by relevance
- Each suggestion includes: chord names, Roman numeral analysis, voicing (MIDI notes), audio preview
- Interactive chord wheel (circle of fifths) for visual exploration
- Click any chord to hear it, drag to reorder, right-click for inversions/extensions

**User Story**:
> As a bedroom producer stuck on a 4-bar loop, I want Luminary to suggest chord progressions that match the vibe I am going for, so I can break out of my creative block and build a full arrangement.

**Edge Cases**:
- User is working in an uncommon mode (Lydian, Phrygian) -- system must handle all 7 modes plus pentatonic/blues scales
- User wants to modulate between keys mid-progression -- provide modulation suggestions (pivot chords, chromatic mediants)
- User wants jazz voicings vs pop voicings -- offer voicing complexity settings (triads, 7ths, 9ths, extensions)
- User pastes in existing chords -- analyze and suggest continuations rather than replacements

**Output**: MIDI file (.mid) exportable to DAW, or copy chord names to clipboard.

**Acceptance Criteria**:
- [ ] Generate harmonically valid chord progressions in all 7 modes plus pentatonic and blues scales
- [ ] Return 3-5 ranked suggestions within 3 seconds of parameter selection
- [ ] Each suggestion includes chord names, Roman numeral analysis, MIDI voicing, and audio preview
- [ ] Interactive chord wheel renders at 60 FPS with click, drag, and right-click interactions
- [ ] MIDI export produces a valid .mid file importable by Ableton, FL Studio, and Logic Pro
- [ ] Modulation suggestions offered when user requests key change mid-progression
- [ ] Voicing complexity settings (triads through extensions) alter output correctly
- [ ] Existing chord paste-and-analyze flow returns continuation suggestions within 2 seconds

**Error Handling Table**:

| Condition | User Message | Retry | Fallback |
|---|---|---|---|
| Audio context initialization failure | "Unable to initialize audio engine. Please restart Luminary." | Auto-retry 2x on launch | Offer silent mode with visual-only previews |
| Magenta.js model load failure | "Chord model is loading -- please wait a moment." | Retry with exponential backoff (3 attempts) | Serve rule-based chord suggestions from local lookup table |
| Unsupported scale/mode selected | "This scale is not yet supported. Try one of the 7 standard modes." | N/A | Default to closest supported mode (e.g., Lydian dominant to Lydian) |
| MIDI export write failure (disk full/permissions) | "Could not save MIDI file. Check disk space and folder permissions." | Prompt user to choose a different save location | Copy chord names to clipboard as text fallback |
| Clipboard write failure | "Clipboard access denied. Please grant clipboard permissions in system settings." | Retry once | Display chord names in a copyable modal dialog |
| Electron renderer crash during chord preview | "Something went wrong with audio preview. Reloading component." | Auto-reload renderer process | Disable audio preview, keep visual chord display functional |
| Memory pressure from large chord history | "Freeing memory -- older chord sessions will be unloaded." | N/A | Evict oldest chord sessions from memory, keep on disk |

**Data Validation Rules**:

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|---|---|---|---|---|---|
| Key selection | Enum | Yes | N/A | One of: C, C#, D, D#, E, F, F#, G, G#, A, A#, B | Reject invalid values |
| Scale/Mode | Enum | Yes | N/A | One of: major, minor, dorian, phrygian, lydian, mixolydian, locrian, pentatonic, blues | Default to major if unrecognized |
| Mood | Enum | No | N/A | One of: uplifting, melancholic, dreamy, aggressive, chill | Default to empty (no mood filter) |
| Genre template | String | No | 1-50 chars | Alphanumeric + spaces + hyphens | Trim whitespace, strip special characters |
| Number of suggestions | Integer | No | 1 / 10 | Digits only | Clamp to range, default 5 |
| Voicing complexity | Enum | No | N/A | One of: triads, 7ths, 9ths, extensions | Default to triads |
| Pasted chord input | String | No | 1-500 chars | Letters, numbers, #, b, m, maj, dim, aug, sus, /, spaces | Strip HTML/scripts, validate each chord token |
| MIDI export filename | String | Yes (on export) | 1-255 chars | Valid OS filename characters | Strip path traversal sequences, sanitize for cross-platform filenames |

---

### 1.2 Melody Suggestion Engine

**Description**: AI-powered melody generation that creates melodic ideas constrained to the user's selected key, tempo, and chord progression.

**Core Functionality**:
- Generate 4-8 bar melodic phrases using Magenta.js (on-device, zero latency)
- Constrain melodies to the current key/scale and chord tones
- Control parameters: note density, range (octave), rhythmic complexity, contour (ascending/descending/wave)
- Preview melodies with built-in synth sounds (piano, pluck, pad)
- "Variations" button: generate 5 variations of a melody the user likes
- Drag-and-drop MIDI export directly from the melody display

**User Story**:
> As a producer who has chords and drums but no topline, I want Luminary to generate melody ideas that fit my chords, so I can find a hook and finish my track.

**Edge Cases**:
- Generated melody clashes with chord tones on strong beats -- implement chord-tone priority system
- User wants a melody in a specific rhythmic style (syncopated, straight, triplet feel) -- provide rhythm template selector
- Melody range exceeds vocalist's comfortable range -- add range constraints (e.g., C3 to C5)
- User wants to edit individual notes of a generated melody -- provide a simple piano roll editor

**Output**: MIDI file (.mid), on-screen piano roll display.

**Acceptance Criteria**:
- [ ] Generate 4-8 bar melodic phrases within 2 seconds using on-device Magenta.js (zero network dependency)
- [ ] All generated notes fall within the selected key/scale with chord-tone priority on strong beats
- [ ] Parameter controls (density, range, rhythmic complexity, contour) produce audibly distinct output variations
- [ ] "Variations" button produces 5 variations within 3 seconds, each melodically distinct from the source
- [ ] Piano roll editor supports click-to-add, click-to-delete, and drag-to-move note operations
- [ ] Drag-and-drop MIDI export recognized by Ableton Live, FL Studio, and Logic Pro
- [ ] Preview audio latency under 50ms from built-in synth sounds (piano, pluck, pad)
- [ ] Memory usage for Magenta.js model stays below 512MB resident during melody generation

**Error Handling Table**:

| Condition | User Message | Retry | Fallback |
|---|---|---|---|
| Magenta.js WASM module fails to load | "AI melody engine could not start. Attempting reload." | Auto-retry 3x with 2-second delay | Offer simple random-note-in-scale generator as basic fallback |
| Generated melody conflicts with chord tones on strong beats | "Refining melody to better match your chords." | Auto-regenerate with tighter chord-tone constraints | Snap conflicting notes to nearest chord tone silently |
| Piano roll edit causes invalid MIDI state | "Edit could not be applied. Undoing last change." | N/A | Auto-undo to last valid state |
| Built-in synth audio glitch/pop | "Audio glitch detected. Reinitializing audio context." | Reinitialize Web Audio context once | Mute preview, allow MIDI export without preview |
| Drag-and-drop MIDI transfer fails (OS IPC error) | "Drag export failed. Use 'Save As' to export the MIDI file." | N/A | Open native file save dialog |
| Electron process memory exceeds 2GB threshold | "Luminary is using a lot of memory. Closing inactive melody sessions." | N/A | Garbage-collect oldest melody buffers, alert user to save work |
| Range constraint produces zero valid notes | "No notes available in this octave range for your scale. Expanding range." | Auto-expand range by 1 octave | Return melody in default C3-C5 range with warning |

**Data Validation Rules**:

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|---|---|---|---|---|---|
| Key/Scale | Enum | Yes | N/A | Valid key + scale combination | Reject invalid combinations |
| Note density | Float | No | 0.1 / 1.0 | Decimal between 0.1 and 1.0 | Clamp to range, default 0.5 |
| Octave range (low) | Integer | No | 0 / 8 (MIDI octave) | Single digit | Clamp, default 3 |
| Octave range (high) | Integer | No | 0 / 8 (MIDI octave) | Single digit, must be >= low range | Clamp, default 5 |
| Rhythmic complexity | Float | No | 0.0 / 1.0 | Decimal | Clamp, default 0.5 |
| Contour | Enum | No | N/A | One of: ascending, descending, wave, random | Default to random |
| Melody length (bars) | Integer | No | 1 / 16 | Digits only | Clamp to 4-8 for MVP, default 4 |
| Synth preset | Enum | No | N/A | One of: piano, pluck, pad | Default to piano |
| Variation count | Integer | No | 1 / 10 | Digits only | Clamp, default 5 |

---

### 1.3 Key and BPM Detection

**Description**: Automatic detection of key signature and tempo from imported audio files or live audio input.

**Core Functionality**:
- Drag-and-drop any audio file (WAV, MP3, AIFF, FLAC) for analysis
- Detect key signature with confidence percentage (e.g., "A minor -- 87% confidence, could also be C major")
- Detect BPM with sub-decimal accuracy (e.g., 128.3 BPM)
- Detect time signature (4/4, 3/4, 6/8)
- Display results prominently in the workspace header
- "Lock" detected values to use across all other features (chord lab, melody gen)

**User Story**:
> As a producer sampling a record, I want to instantly know its key and BPM so I can match it with my own production without guessing.

**Edge Cases**:
- Track has a key change mid-song -- detect and display all keys with timestamps
- Track has tempo automation (gradual BPM change) -- show average BPM and flag tempo variation
- Atonal or highly chromatic music -- display "ambiguous key" with top 3 candidates
- Very short audio clip (< 5 seconds) -- warn about low confidence, still attempt detection
- Audio with heavy distortion or noise -- apply pre-processing filters before analysis

**Output**: Key, BPM, and time signature values displayed in UI and stored in project metadata.

**Acceptance Criteria**:
- [ ] Accept drag-and-drop import for WAV, MP3, AIFF, and FLAC files up to 2GB
- [ ] Key detection accuracy >= 95% on tonal music (validated against a 500-track test set)
- [ ] BPM detection accuracy within +/- 0.5 BPM for steady-tempo tracks
- [ ] Time signature detection correctly identifies 4/4, 3/4, and 6/8
- [ ] Analysis completes within 10 seconds for files under 10 minutes, within 30 seconds for files up to 1 hour
- [ ] Confidence percentage displayed alongside key detection result
- [ ] Key-change detection identifies at least 90% of modulations with correct timestamps
- [ ] "Lock" function propagates detected key/BPM to chord lab and melody generator within 1 UI frame
- [ ] All analysis runs on-device via Essentia.js WASM with zero network dependency

**Error Handling Table**:

| Condition | User Message | Retry | Fallback |
|---|---|---|---|
| Unsupported audio format imported | "This file format is not supported. Please import WAV, MP3, AIFF, or FLAC." | N/A | Suggest converting with FFmpeg instructions or a built-in converter |
| Corrupted audio file (cannot decode) | "This audio file appears to be corrupted and cannot be analyzed." | N/A | Offer to re-import or try a different file |
| Audio file too short (< 5 seconds) | "Very short audio clip detected. Results may be less accurate." | N/A | Attempt analysis with low-confidence flag |
| Essentia.js WASM crash during analysis | "Audio analysis engine encountered an error. Retrying." | Auto-retry once with fresh WASM instance | Show "Analysis unavailable" with manual key/BPM entry fields |
| Audio file exceeds 2GB | "File too large for analysis. Maximum supported size is 2GB." | N/A | Offer to analyze only the first 10 minutes of the file |
| System sleep during active analysis | "Analysis was interrupted by system sleep. Restarting." | Auto-restart analysis from beginning | N/A |
| Atonal/highly chromatic content | "Key detection is ambiguous. Showing top 3 candidates." | N/A | Display multiple candidates with confidence scores for user selection |
| Disk read error during file import | "Could not read the audio file. Check that the file is accessible." | Retry once | Prompt user to re-select or copy file to a different location |

**Data Validation Rules**:

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|---|---|---|---|---|---|
| Audio file path | String (file path) | Yes | 1-4096 chars | Valid OS file path | Resolve symlinks, validate file extension, reject path traversal |
| Audio file size | Integer (bytes) | Yes (auto) | 1 byte / 2GB | N/A | Reject files exceeding 2GB before loading into memory |
| Audio duration | Float (seconds) | Yes (auto) | 0.1 / 7200 | N/A | Warn below 5 seconds, truncate analysis beyond 2 hours |
| Manual key override | Enum | No | N/A | Valid key name (A-G with optional # or b) | Reject invalid key names |
| Manual BPM override | Float | No | 20.0 / 400.0 | Decimal number | Clamp to range |
| Manual time signature | String | No | N/A | Pattern: digits/digits (e.g., 4/4, 3/4, 6/8) | Validate numerator and denominator against supported signatures |
| Confidence threshold for lock | Float | No | 0.0 / 1.0 | Decimal | Default to 0.7, warn if locking below threshold |

---

### 1.4 Basic Mixing Tips

**Description**: AI-powered mixing feedback that analyzes the frequency spectrum, dynamics, and stereo field of imported audio and provides actionable suggestions.

**Core Functionality**:
- Import a stereo mix (or stems) for analysis
- Frequency spectrum analysis with visual display (real-time or static)
- Identify common issues: muddy low-mids, harsh high-mids, insufficient sub-bass, excessive sibilance
- Provide specific EQ suggestions (e.g., "Cut 3dB at 300Hz on the bass to reduce muddiness")
- Dynamic range assessment (is the track over-compressed?)
- Stereo width analysis (is the mix too narrow or too wide?)
- Loudness metering (LUFS) with genre-appropriate targets
- Side-by-side comparison with a reference track (optional)

**User Story**:
> As a self-taught producer, I want Luminary to tell me what's wrong with my mix and how to fix it, so I can get closer to a professional sound without years of ear training.

**Edge Cases**:
- User uploads a single stem instead of a full mix -- adjust analysis scope and provide stem-specific tips
- Genre-specific mixing standards differ wildly (lo-fi intentionally has vinyl hiss, trap has exaggerated sub-bass) -- adjust tips based on detected/selected genre
- User's monitoring environment is poor (laptop speakers) -- suggest headphone mixing and include caveat about monitoring
- Very quiet or very loud source material -- normalize before analysis

**Output**: Visual spectrum display, text-based mixing suggestions with severity indicators, optional PDF report.

**Acceptance Criteria**:
- [ ] Accept stereo mix or individual stems in WAV, MP3, AIFF, FLAC formats
- [ ] Frequency spectrum visualization renders in real-time at 30+ FPS during playback
- [ ] Identify at least 5 common mixing issues (muddy low-mids, harsh high-mids, insufficient sub-bass, excessive sibilance, over-compression) with 80%+ accuracy
- [ ] Provide specific, actionable EQ suggestions with frequency, gain, and Q values (e.g., "Cut 3dB at 300Hz, Q=2.0")
- [ ] LUFS loudness measurement accurate within +/- 0.5 LUFS of reference metering tools
- [ ] Stereo width analysis correctly identifies mono-compatible issues
- [ ] Reference track comparison normalizes loudness before spectral comparison
- [ ] Genre-appropriate mixing targets adjust when user selects or system detects genre
- [ ] PDF report generation completes within 5 seconds for a single-track analysis

**Error Handling Table**:

| Condition | User Message | Retry | Fallback |
|---|---|---|---|
| Audio file decode failure | "Could not decode this audio file. It may be corrupted or in an unsupported format." | N/A | Suggest re-exporting from DAW in WAV format |
| Spectrum analysis Web Audio API error | "Audio analysis engine error. Reinitializing." | Reinitialize audio context once | Display static spectrum snapshot instead of real-time |
| Reference track not provided for comparison | "No reference track loaded. Analysis will use genre-typical targets instead." | N/A | Use built-in genre reference profiles |
| Very quiet source material (< -40 LUFS) | "Audio is very quiet. Normalizing for analysis. Results reflect the original level." | N/A | Auto-normalize before analysis, flag original level |
| Very loud/clipped source material | "Clipping detected in audio. Mix suggestions will address this." | N/A | Prioritize dynamic range suggestions |
| PDF export fails (disk/permissions) | "Could not save PDF report. Check disk space and permissions." | Prompt for alternate save location | Display report in-app as scrollable view |
| GPU not available for spectrum rendering | "Hardware-accelerated rendering unavailable. Using software renderer." | N/A | Fall back to Canvas 2D rendering at reduced frame rate |
| Single stem uploaded instead of full mix | "Single stem detected. Analysis will be stem-specific." | N/A | Adjust analysis scope to stem-appropriate checks |

**Data Validation Rules**:

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|---|---|---|---|---|---|
| Audio file path | String (file path) | Yes | 1-4096 chars | Valid OS file path | Resolve symlinks, validate extension, reject path traversal |
| Audio file format | Enum | Yes (auto-detected) | N/A | WAV, MP3, AIFF, FLAC | Reject unsupported formats with message |
| Genre selection | Enum | No | N/A | Predefined genre list | Default to "general" if unrecognized |
| Reference track path | String (file path) | No | 1-4096 chars | Valid OS file path | Same sanitization as audio file path |
| LUFS target | Float | No | -24.0 / -6.0 | Decimal | Clamp to range, default -14.0 (streaming) |
| EQ suggestion severity filter | Enum | No | N/A | One of: all, critical, major, minor | Default to all |
| Report filename | String | No | 1-255 chars | Valid OS filename | Strip path traversal, ensure .pdf extension |
| Stereo width analysis range | Enum | No | N/A | One of: full, low, mid, high | Default to full |

---

### 1.5 MIDI Export

**Description**: Universal MIDI export for all generated musical content (chords, melodies, drum patterns).

**Core Functionality**:
- One-click export of any generated content as a .mid file
- Drag-and-drop from Luminary directly into DAW (Ableton, FL Studio, Logic)
- Export options: single clip, full arrangement, individual tracks
- MIDI channel assignment for multi-track exports
- Velocity and timing humanization options (slight random variations to avoid robotic feel)
- Copy-to-clipboard for chord names (text format for producers who prefer manual input)

**User Story**:
> As a producer who uses Ableton Live, I want to export Luminary's chord and melody suggestions as MIDI clips so I can drag them directly into my session and start building around them.

**Edge Cases**:
- DAW uses a different MIDI PPQ (pulses per quarter note) -- export at standard 480 PPQ, let DAW handle conversion
- User wants to export a polyrhythmic pattern -- ensure correct time signature encoding in MIDI file
- Large MIDI file with many notes -- implement streaming export to avoid memory issues
- User's DAW does not support drag-and-drop MIDI -- provide a "Save As" file dialog fallback

**Acceptance Criteria**:
- [ ] One-click export produces a valid .mid file (standard MIDI format 0 or 1) for all generated content types
- [ ] Drag-and-drop from Luminary into Ableton Live, FL Studio, and Logic Pro succeeds on macOS and Windows
- [ ] Export at standard 480 PPQ; DAW correctly interprets timing
- [ ] Multi-track export correctly assigns distinct MIDI channels per track (up to 16 channels)
- [ ] Velocity humanization varies note velocities by +/- 5-15% (configurable) without exceeding MIDI 0-127 range
- [ ] Timing humanization shifts note positions by +/- 10-30ms (configurable) without creating negative timestamps
- [ ] Export completes within 1 second for files containing up to 10,000 MIDI events
- [ ] Clipboard copy of chord names produces correctly formatted plain text (e.g., "Cmaj7 | Dm7 | G7 | Cmaj7")

**Error Handling Table**:

| Condition | User Message | Retry | Fallback |
|---|---|---|---|
| No content to export (empty session) | "Nothing to export. Generate chords or melodies first." | N/A | Highlight the chord/melody generator as next step |
| MIDI file write failure (disk full) | "Not enough disk space to save the MIDI file. Free some space and try again." | Prompt to choose alternate location | Copy MIDI data to clipboard as text representation |
| Drag-and-drop IPC failure between Electron and OS | "Drag export did not complete. Try using File > Save As instead." | N/A | Open native save dialog |
| MIDI file exceeds reasonable size (>10MB, runaway generation) | "MIDI file is unusually large. Check for duplicate or excessive note data." | N/A | Offer to truncate or simplify before export |
| Polyrhythmic time signature encoding error | "Time signature encoding may not be compatible with all DAWs. Exporting in 4/4 as fallback." | N/A | Export with 4/4 time signature, include note about original time sig |
| DAW rejects imported MIDI file | "If your DAW cannot open this file, try the 'Save As' option with Format 0 (single track)." | N/A | Offer Format 0 vs Format 1 selection |
| Electron app loses focus during drag-and-drop | "Drag operation cancelled. Please try again." | N/A | N/A |

**Data Validation Rules**:

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|---|---|---|---|---|---|
| Export format | Enum | Yes | N/A | One of: single_clip, full_arrangement, individual_tracks | Default to single_clip |
| MIDI channel | Integer | No | 1 / 16 | Digits only | Clamp to range, default auto-assign |
| Velocity humanization amount | Float (%) | No | 0 / 30 | Decimal percentage | Clamp to range, default 10% |
| Timing humanization amount | Integer (ms) | No | 0 / 50 | Digits only | Clamp to range, default 15ms |
| PPQ (pulses per quarter note) | Integer | No | 24 / 960 | Digits only | Default 480, warn if non-standard |
| Export filename | String | Yes | 1-255 chars | Valid OS filename characters | Strip path traversal, ensure .mid extension |
| Export directory | String (path) | Yes | 1-4096 chars | Valid OS directory path | Validate exists and is writable |

---

### 1.6 Project Analyzer

**Description**: An AI-powered analysis of the user's current project that provides high-level feedback on arrangement, energy flow, and completeness.

**Core Functionality**:
- Analyze the overall song structure (intro, verse, chorus, bridge, outro)
- Identify missing sections ("Your track has no bridge -- consider adding one for contrast")
- Energy curve visualization (how the track builds and releases tension over time)
- Repetition detector ("Section A repeats 8 times without variation -- consider adding a new element at bar 17")
- Checklist of common arrangement patterns for the detected genre
- "Finish your track" prompt system -- progressive suggestions to guide from loop to complete song

**User Story**:
> As a producer stuck in an 8-bar loop, I want Luminary to analyze my arrangement and tell me what's missing, so I have a clear roadmap to finish the track.

**Edge Cases**:
- Track is intentionally minimal/ambient with little variation -- recognize genre conventions
- Track is very long (10+ minutes, DJ mix format) -- adjust arrangement expectations
- Multiple audio/MIDI files imported with no clear structure -- ask user to define sections or auto-detect via energy analysis
- User disagrees with arrangement suggestions -- allow "dismiss" with feedback to improve future suggestions

**Acceptance Criteria**:
- [ ] Correctly identify at least 4 standard song sections (intro, verse, chorus, outro) with 80%+ accuracy on pop/electronic genres
- [ ] Energy curve visualization renders within 5 seconds for tracks up to 10 minutes
- [ ] Repetition detector flags loops repeating more than 4x without variation
- [ ] "Finish your track" suggestions provide at least 3 actionable next steps based on current arrangement state
- [ ] Missing section identification provides genre-appropriate suggestions (e.g., bridge for pop, breakdown for EDM)
- [ ] Genre detection for arrangement expectations accurate for top 10 supported genres
- [ ] Dismiss feedback stored locally and applied to future suggestions within the same project
- [ ] Analysis works on imported audio and on MIDI-only projects

**Error Handling Table**:

| Condition | User Message | Retry | Fallback |
|---|---|---|---|
| No audio or MIDI imported for analysis | "Import audio or create MIDI content to analyze your arrangement." | N/A | Show empty arrangement template for the selected genre |
| OpenAI API unavailable (for NLP-based suggestions) | "AI suggestions are temporarily unavailable. Showing rule-based analysis." | Retry in 30 seconds, up to 3 times | Fall back to on-device rule-based arrangement analysis |
| Track too short for meaningful analysis (< 30 seconds) | "Track is very short for arrangement analysis. Limited suggestions available." | N/A | Provide basic structural suggestions only |
| Very long track (10+ minutes) | "Analyzing a long track -- this may take a moment." | N/A | Show progress bar, process in chunks |
| Energy analysis fails on purely percussive content | "Energy analysis is optimized for melodic content. Results may be approximate for percussion-only tracks." | N/A | Use amplitude-based energy curve as fallback |
| Multiple conflicting file imports with no clear structure | "Could not detect arrangement structure. Please define sections manually or import a more structured project." | N/A | Show manual section marker tool |
| Renderer out-of-memory during visualization | "Simplifying visualization to reduce memory usage." | N/A | Render low-resolution energy curve, disable waveform overlay |

**Data Validation Rules**:

| Field | Type | Required | Min/Max | Pattern | Sanitization |
|---|---|---|---|---|---|
| Project audio files | Array of file paths | Yes (at least one) | 1 / 50 files | Valid OS file paths | Validate each path, reject duplicates |
| Genre for arrangement analysis | Enum | No | N/A | Supported genre list | Default to auto-detect |
| Section marker (manual) | Object {label, startTime, endTime} | No | label: 1-50 chars; times: 0-max duration | Label: alphanumeric; Times: positive floats | Validate no overlapping sections, sanitize label text |
| Repetition threshold | Integer (count) | No | 2 / 32 | Digits only | Default to 4 |
| Energy curve resolution | Enum | No | N/A | One of: low, medium, high | Default to medium |
| Dismiss feedback text | String | No | 0-500 chars | Free text | Strip HTML/scripts, trim whitespace |

---

### MVP Feature Dependency Graph

```
                    ┌─────────────────────┐
                    │ 1.3 Key & BPM       │
                    │     Detection        │
                    └──────┬──────┬───────┘
                           │      │
              ┌────────────▼─┐  ┌─▼───────────────┐
              │ 1.1 Chord    │  │ 1.2 Melody       │
              │  Progression │  │  Suggestion       │
              │  Generator   │  │  Engine           │
              └──────┬───────┘  └──┬───────────────┘
                     │             │
                     ▼             ▼
              ┌────────────────────────────┐
              │      1.5 MIDI Export       │
              │  (consumes output from     │
              │   1.1, 1.2, and 1.6)      │
              └────────────┬───────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 │                 ▼
  ┌──────────────┐         │     ┌───────────────────┐
  │ 1.4 Basic    │         │     │ 1.6 Project       │
  │  Mixing Tips │◄────────┘     │  Analyzer         │
  │ (standalone  │               │ (uses 1.3 key/BPM │
  │  audio input)│               │  + audio/MIDI)    │
  └──────────────┘               └───────────────────┘
```

**Dependency Notes**:
- **1.3 Key & BPM Detection** is foundational -- its outputs (key, scale, BPM) are consumed by 1.1 (chord generator) and 1.2 (melody engine) to constrain suggestions
- **1.1 and 1.2** are independent of each other but both depend on 1.3 for key/scale context
- **1.5 MIDI Export** depends on 1.1, 1.2, and 1.6 as content sources but can be developed in parallel with stub data
- **1.4 Basic Mixing Tips** is fully independent -- it operates on imported audio with no dependency on other MVP features
- **1.6 Project Analyzer** benefits from 1.3 (key/BPM metadata) but can analyze raw audio independently
- **Critical path**: 1.3 -> 1.1/1.2 (parallel) -> 1.5 -> 1.6

---

## Phase 2: Post-MVP (Months 7-12)

### 2.1 Real-Time DAW Integration

**Description**: Live connection to the user's DAW via Ableton Link (tempo sync) and MIDI (note/control data).

**Core Functionality**:
- **Ableton Link**: Automatic tempo and phase synchronization -- Luminary's playback locks to the DAW's transport
- **Virtual MIDI ports**: Send generated MIDI directly into DAW tracks without file export
- **MIDI input monitoring**: Listen to what the user is playing in real-time and provide live suggestions
- **Session state awareness**: Detect when the user starts/stops playback, changes tempo, or switches tracks
- Compatible DAWs: Ableton Live, FL Studio, Logic Pro, Bitwig, Reaper

**User Story**:
> As an Ableton Live user, I want Luminary to sync with my session in real-time so I can hear AI-generated chord progressions playing in tempo with my track without manually exporting MIDI.

**Edge Cases**:
- Multiple DAWs open simultaneously -- allow user to select which DAW to sync with
- DAW and Luminary on different machines (networked studio) -- Ableton Link works over local network
- MIDI feedback loops (Luminary sends MIDI to DAW, DAW echoes back) -- implement MIDI loop detection and filtering
- DAW crashes or disconnects mid-session -- graceful degradation to offline mode

---

### 2.2 AI Mastering Assistant

**Description**: Guided mastering workflow that analyzes a final mix and provides step-by-step mastering suggestions with real-time preview.

**Core Functionality**:
- Import final stereo mix for mastering analysis
- LUFS loudness targeting by genre (streaming -14 LUFS, club -8 LUFS, etc.)
- EQ curve suggestions with visual overlay on spectrum display
- Stereo imaging recommendations (widen highs, narrow lows)
- Compression/limiting suggestions with ratio, threshold, attack, release values
- A/B comparison: "before" vs "after" predicted result
- Reference track comparison: match loudness and spectral balance to a professional reference

**User Story**:
> As a bedroom producer releasing music on Spotify, I want Luminary to guide me through mastering my track so it sounds competitive on streaming platforms without paying $50-100 per track for professional mastering.

---

### 2.3 Sample Recommendation Engine

**Description**: AI-powered sample search and recommendation based on the current project's genre, key, tempo, and sonic characteristics.

**Core Functionality**:
- Search curated sample library by genre, instrument, mood, key, BPM
- AI recommendations based on current project context ("You need a warmer kick -- here are 5 options")
- Audio preview with tempo-sync to current project
- One-click import into project
- Favorites and collections for organizing samples
- Integration with user's local sample folders (scan and catalog)

---

### 2.4 Genre-Specific Production Templates

**Description**: Pre-built project templates for popular genres with AI-generated starting points.

**Core Functionality**:
- Templates for 20+ genres: lo-fi hip-hop, future bass, trap, house, techno, indie pop, R&B, ambient, drill, drum & bass, synthwave, etc.
- Each template includes: suggested BPM, key, chord progression, drum pattern, arrangement structure, recommended instruments/sounds
- "Remix" mode: apply a different genre's production techniques to your current project
- Community-submitted templates (moderated)

---

### 2.5 Collaboration Features

**Description**: Share projects, suggestions, and feedback with other Luminary users.

**Core Functionality**:
- Share a project snapshot (arrangement + mix analysis) via link
- Invite collaborators to view/comment on your project
- "Ask the community" button: post a specific production question with audio context
- Producer matchmaking: find collaborators by genre, skill level, DAW preference

---

## Phase 3: Year 2+ (Months 13-24+)

### 3.1 AI Stem Separation

**Description**: Separate any audio file into individual stems (drums, bass, vocals, other) using on-device ML models.

**Core Functionality**:
- Drag-and-drop any audio file for stem separation
- 4-stem separation: drums, bass, vocals, other (instruments)
- 6-stem separation (advanced): drums, bass, vocals, piano, guitar, other
- Preview individual stems with solo/mute controls
- Export stems as individual WAV files
- Use separated stems for remixing, sampling, or analysis

---

### 3.2 Custom AI Model Training

**Description**: Train a personalized AI model on the user's own music to generate suggestions that match their unique style.

**Core Functionality**:
- Upload 10-50 of your own tracks for style analysis
- AI learns your harmonic preferences, melodic patterns, rhythm tendencies, arrangement structures
- "My Style" mode: all suggestions are filtered through your personal model
- Style evolution tracking: see how your production style has changed over time
- Privacy-first: model training happens on-device, no audio leaves the user's machine

---

### 3.3 VST Plugin Version

**Description**: Package Luminary's core features as a VST3/AU plugin that runs directly inside the DAW.

**Core Functionality**:
- All chord, melody, and mixing features accessible within the DAW
- No separate application window needed
- Direct track/bus analysis without audio export
- Plugin format: VST3 (Windows/macOS), AU (macOS), AAX (Pro Tools)
- Built with JUCE framework for native audio plugin development

---

### 3.4 Mobile Companion App

**Description**: iOS/Android app for capturing ideas on the go and syncing with the desktop app.

**Core Functionality**:
- Hum or whistle a melody idea -- AI transcribes to MIDI
- Tap a rhythm -- AI generates a drum pattern
- Browse chord progressions and save to desktop project
- Record audio memos with auto key/BPM detection
- Sync with desktop app via Supabase

---

### 3.5 Sample Marketplace

**Description**: Producer-to-producer marketplace for selling sample packs, presets, and templates.

**Core Functionality**:
- Upload and sell sample packs directly within Luminary
- AI-powered quality review and categorization
- Revenue split: 70% creator / 30% Luminary
- Buyer features: preview, key/BPM filtering, AI recommendations
- Creator features: analytics dashboard, earnings tracking, promotional tools

---

## User Stories Summary

| Story ID | User | Action | Goal | Phase |
|---|---|---|---|---|
| US-01 | Stuck producer | Get chord suggestions | Break creative block | MVP |
| US-02 | Producer without topline | Generate melodies | Find a hook | MVP |
| US-03 | Producer sampling records | Detect key/BPM | Match samples to production | MVP |
| US-04 | Self-taught mixer | Get mixing feedback | Improve mix quality | MVP |
| US-05 | Loop-stuck producer | Analyze arrangement | Finish the track | MVP |
| US-06 | Ableton user | Sync with DAW | Seamless workflow | Post-MVP |
| US-07 | Self-releasing artist | Master a track | Streaming-ready quality | Post-MVP |
| US-08 | Genre explorer | Use genre templates | Learn new styles | Post-MVP |
| US-09 | Remix artist | Separate stems | Create remixes | Year 2+ |
| US-10 | Experienced producer | Train personal model | AI that knows my style | Year 2+ |
| US-11 | Mobile songwriter | Capture ideas on phone | Never lose inspiration | Year 2+ |
| US-12 | Sample creator | Sell sample packs | Monetize production skills | Year 2+ |

---

## Edge Cases & Failure Modes

### Global Edge Cases

| Scenario | Handling |
|---|---|
| **No internet connection** | On-device features (Magenta.js, Essentia.js) work fully offline. Cloud features show "Offline" badge and queue requests for when connection resumes. |
| **Very large audio file (1GB+)** | Chunk-based processing with progress indicator. Warn user about processing time. |
| **Corrupted audio file** | Graceful error message with file format validation before analysis. |
| **Non-Western music theory** | V2 addition: support for Arabic maqam, Indian raga, gamelan scales. MVP focuses on Western tonal harmony. |
| **User disagrees with all suggestions** | Track rejection patterns, adjust suggestion algorithm, offer "tell me what you want" freeform input. |
| **API rate limits exceeded** | Queue suggestions, show estimated wait time, encourage on-device features. |
| **Electron memory leak** | Implement audio context pooling, garbage collection for large audio buffers, memory usage monitoring. |
| **Multiple monitors** | Support window undocking, multi-monitor layouts, remember window position per monitor. |

---

## Development Timeline

### Month 1-2: Foundation

| Week | Deliverable |
|---|---|
| 1-2 | Electron app scaffold, React setup, Tailwind + dark theme, basic window management |
| 3-4 | Supabase integration (auth, database), user onboarding flow |
| 5-6 | Web Audio API integration, Essentia.js setup, basic audio file import |
| 7-8 | Magenta.js integration, basic melody generation proof-of-concept |

### Month 3-4: Core Features

| Week | Deliverable |
|---|---|
| 9-10 | Chord Lab UI (chord wheel, progression display), chord generation logic |
| 11-12 | Melody Generator UI (piano roll, parameter controls), Magenta.js integration |
| 13-14 | Key/BPM detection feature complete, project metadata system |
| 15-16 | MIDI export system, drag-and-drop to DAW, file save dialog |

### Month 5-6: Polish & Beta

| Week | Deliverable |
|---|---|
| 17-18 | Mixing tips feature (spectrum analysis, EQ suggestions, loudness metering) |
| 19-20 | Project analyzer (arrangement detection, energy curve, completion suggestions) |
| 21-22 | OpenAI integration for music theory chat and production tips |
| 23-24 | Beta testing with 50 producers, bug fixes, performance optimization |

### Month 7-9: Post-MVP Features

| Week | Deliverable |
|---|---|
| 25-28 | Ableton Link integration, virtual MIDI ports |
| 29-32 | AI mastering assistant, reference track comparison |
| 33-36 | Sample recommendation engine, genre templates |

### Month 10-12: Growth Features

| Week | Deliverable |
|---|---|
| 37-40 | Collaboration features, project sharing |
| 41-44 | Advanced mixing tools, stem-specific analysis |
| 45-48 | Community features, learning center, feedback system |

---

## Feature Priority Matrix

| Feature | Impact | Effort | Priority | Phase |
|---|---|---|---|---|
| Chord Progression Generator | High | Medium | P0 | MVP |
| Melody Suggestion Engine | High | Medium | P0 | MVP |
| Key/BPM Detection | High | Low | P0 | MVP |
| Basic Mixing Tips | High | Medium | P0 | MVP |
| MIDI Export | High | Low | P0 | MVP |
| Project Analyzer | Medium | Medium | P1 | MVP |
| DAW Integration (Ableton Link) | Very High | High | P0 | Post-MVP |
| AI Mastering Assistant | High | High | P1 | Post-MVP |
| Sample Recommendation | Medium | Medium | P1 | Post-MVP |
| Genre Templates | Medium | Low | P2 | Post-MVP |
| Collaboration | Medium | High | P2 | Post-MVP |
| Stem Separation | High | Very High | P1 | Year 2+ |
| Custom AI Training | Very High | Very High | P0 | Year 2+ |
| VST Plugin | High | Very High | P1 | Year 2+ |
| Mobile Companion | Medium | High | P2 | Year 2+ |
| Sample Marketplace | Medium | High | P2 | Year 2+ |

---

## Success Metrics Per Feature

| Feature | Primary Metric | Target |
|---|---|---|
| Chord Generator | Suggestion acceptance rate | > 35% |
| Melody Engine | MIDI exports per session | > 2 |
| Key/BPM Detection | Detection accuracy | > 95% |
| Mixing Tips | Tips acted upon rate | > 25% |
| MIDI Export | Exports per active user/week | > 5 |
| Project Analyzer | Track completion rate increase | +15% |
| DAW Integration | Users with active Link connection | > 60% of Pro users |
| Mastering Assistant | Tracks mastered per user/month | > 3 |

---

*Every feature in Luminary is designed to get one more track finished. That is the north star.*
