# Backlog — everything next that needs no server

Every item below is buildable inside this repository with no backend, no account and no
third-party service. The constraint is deliberate: `corefit-md` is a static folder, and it
stays one. Where an item depends on a browser capability, the capability is named so you can
check support rather than take my word for it.

**Status** — `shipped` already in `docs/play/` · `next` worth doing now · `later` real but not soon · `idea` speculative
**Effort** — `S` an afternoon · `M` a day or two · `L` a week or more
**Impact** — `high` changes how the app is used · `med` noticeable · `low` polish

---

## 01 · Playback and video

| # | Enhancement | Why it matters | Effort | Impact | Status |
|---|---|---|---|---|---|
| 1.1 | Clip window per exercise (start/end) | The whole premise: a set opens on the demonstration | S | high | shipped |
| 1.2 | In-window looping with a watchdog | A 50 s set keeps showing the movement instead of the end card | S | high | shipped |
| 1.3 | Preload the next clip during rest (`cueVideoById`) | Removes the black frame and start stall at every set | S | high | shipped |
| 1.4 | Backup video ID with automatic failover | One deleted or region-blocked video does not break the session | S | med | shipped |
| 1.5 | Poster + deep link when an embed is blocked | The timer never notices; you still get to the demo | S | med | shipped |
| 1.6 | Playback speed 0.75× / 1× / 1.25× | Learning pace without pausing every two seconds | S | low | shipped |
| 1.7 | Native MP4 path with media fragments | `clip.mp4#t=30,55` — no YouTube, no ads, no autoplay policy | M | high | shipped (needs files) |
| 1.8 | **Animated SVG figure per move** as the offline fallback | A dead clip, a blocked embed or airplane mode still shows the movement | M | high | shipped |
| 1.9 | **Automatic fallback triggers** — error, offline, or *Figures* mode | The timer never stops for a video problem | S | high | shipped |
| 1.10 | **Clip window clamped to the real video duration** | A 25 s clip with a 0:30 start used to sit on a black frame | S | high | shipped |
| 1.11 | **Sources and credits sheet**, channel credited under the player | Embedded work credited, never copied | S | med | shipped |
| 1.12 | **Clips / Figures-only switch in the library** | A visible way to force the offline layer and check the figures | S | high | shipped |
| 1.13 | **Library sheet opens without a video** — figure, native link, and a search for a better clip | Tapping a card used to open a black rectangle when the embed was blocked | S | high | shipped |
| 1.14 | **Two-tone figure illustration** — far limbs dimmed, moving limb in signal, ground shadow, motion arc | The first pass read as stick figures; this reads as an illustration | M | high | shipped |
| 1.15 | **Drag handles on a scrubber** for the clip window | Typing seconds is guesswork; dragging is judgement | M | high | next |
| 1.16 | **Frame-step ◀ ▶ buttons** in the clip editor | Finding the exact frame the demo starts on | S | med | next |
| 1.17 | **Per-side clip windows** for unilateral moves | Bird Dog's left and right demos may sit at different times | S | med | next |
| 1.18 | **Offline video from the user's own files** — file picker → IndexedDB → `blob:` URL | Real offline video with no hosting: the file never leaves the device | L | high | next |
| 1.19 | **Picture-in-picture** (`requestPictureInPicture`) | Float the demo over the plan list or another tab | M | med | later |
| 1.20 | **Thumbnail from the clip's own frame** (`mq1.jpg`, or canvas capture for MP4) | The library card currently shows the video's poster, not the demo | S | low | later |
| 1.21 | **Cue-aware audio track** — Web Speech reads the step list across the set | Screen-off sessions become possible without video | M | med | later |
| 1.22 | **Orientation lock** during a session (`screen.orientation.lock`) | Stops the layout flipping mid-plank | S | low | idea |
| 1.23 | **Clip health check** on first run — probe each video, warn on failure | Catches a dead embed before you are on the floor | S | med | idea |

## 02 · Session engine

| # | Enhancement | Why | Effort | Impact | Status |
|---|---|---|---|---|---|
| 2.1 | Drift-free deadline clock | Tab throttling never skews the timer | S | high | shipped |
| 2.2 | Warm-up and cool-down blocks with rotating cues | Five minutes of core out of bed deserves preparation | M | high | shipped |
| 2.3 | Six-week progression driven by sessions logged | The routine gets harder without you managing it | M | med | shipped |
| 2.4 | Per-side splitting for unilateral moves | Bird Dog now runs left then right with a cue | M | med | shipped |
| 2.5 | Rep-counting mode per exercise | Dead bug and bicycle are counted, not held | M | med | shipped |
| 2.6 | Pause · skip · restart · ±10 s | Covers every mid-set interruption | S | high | shipped |
| 2.7 | Resume an interrupted session | A phone call no longer loses the session | M | med | shipped |
| 2.8 | **Circuit builder** — drag to reorder, add or drop moves, saved as a template | The five moves are a starting point, not a religion | L | high | next |
| 2.9 | **Session presets** — 3-minute, full, travel, no-floor | One tap for the context you are actually in | M | high | next |
| 2.10 | **Tempo trainer** — WebAudio metronome for slow eccentrics | Turns "slow down" from advice into a signal | M | med | later |
| 2.11 | **Shuffle mode** — same slots, randomised moves | Variety without a plan | S | low | later |
| 2.12 | **Auto-pause on tab hide** (setting) | Some people want the clock to stop, not re-anchor | S | low | later |
| 2.13 | **Readiness check** — sleep/energy 1–5 scales the session | A bad night should shorten the session, not break the streak | M | med | later |
| 2.14 | **Breathing pacer overlay** (4-2-6) on the cool-down | The one place a visual pacer genuinely helps | S | med | idea |

## 03 · Progress and data

| # | Enhancement | Why | Effort | Impact | Status |
|---|---|---|---|---|---|
| 3.1 | Month calendar + 7-day bars | Answers "am I actually doing this?" | S | high | shipped |
| 3.2 | Streak with a one-day grace, best streak, minutes, consistency | Rest days should not erase three weeks | S | high | shipped |
| 3.3 | Weekly goal alongside the daily streak | 3×/week is a kinder target than 7 | S | med | shipped |
| 3.4 | CSV export, JSON backup and restore | The only migration path a serverless app has | S | high | shipped |
| 3.5 | Printable one-page summary | A handout for a patient file | M | med | shipped |
| 3.6 | **IndexedDB store instead of `localStorage`** | Lifts the ~5 MB ceiling and stores per-set detail | M | high | next |
| 3.7 | **Per-set logging** — which move, how long, skipped or not | Tells you which move to regress | M | high | next |
| 3.8 | **Year heat-map** (SVG or canvas) | The month grid hides long-run consistency | M | med | next |
| 3.9 | **Personal records per exercise** — longest hold, most reps | Progress you can see when the scale says nothing | M | med | later |
| 3.10 | **Body metrics log** (weight, waist) with a small chart | Local-only, no device APIs needed | M | med | later |
| 3.11 | **Import: merge or replace** | Restoring on a device with existing history currently overwrites | S | med | next |
| 3.12 | **Storage panel** — bytes used, last backup date, clear data | Answers "where is my data" without a settings hunt | S | med | next |
| 3.13 | **Session summary card** (canvas image) | The streak card exists; the session card does not | S | low | later |
| 3.14 | **Undo** for destructive actions | Discard-session and clear-data are irreversible today | S | med | next |

## 04 · Clinical

| # | Enhancement | Why | Effort | Impact | Status |
|---|---|---|---|---|---|
| 4.1 | Contraindication screening on first run | Low-back pain, disc pathology, pregnancy, recent surgery all change "core work" | M | high | shipped |
| 4.2 | Modified plan when flagged, with the easier variation in the cue line | Screening that does not change anything is theatre | S | high | shipped |
| 4.3 | Post-session RPE and a pain flag | The cheapest real effort signal, and a pattern detector | S | med | shipped |
| 4.4 | **Pain body-map** — tap where it hurt | A stored region beats a yes/no | S | med | next |
| 4.5 | **Auto-regression** — two pain flags on one move switches it to the easier variation | Closes the loop between logging and the next session | M | high | next |
| 4.6 | **Deload trigger from RPE trend** — three sessions at 9+ starts week 4 early | Uses data you already collect | M | med | later |
| 4.7 | **Return-from-injury ramp** — a four-week linear rebuild | The most requested pattern in rehab adherence | M | high | later |
| 4.8 | **Condition-specific plans** — pregnancy-safe, post-abdominal-surgery, osteoporosis | Screening flags the condition; a plan should follow | L | high | later |
| 4.9 | **Patient handout** — plan + screening answers + last 8 weeks, printable | Already 80% built in the print summary | M | med | later |

## 05 · Accessibility and device

| # | Enhancement | Why | Effort | Impact | Status |
|---|---|---|---|---|---|
| 5.1 | Large-text mode, reduced-motion support | Honours what the OS already knows about the reader | S | med | shipped |
| 5.2 | Audio, voice and haptic toggles; audio-only mode | Silent flat, noisy gym, sleeping partner: three setups | S | med | shipped |
| 5.3 | Screen wake lock | The display dimming mid-plank is how these apps fail | S | high | shipped |
| 5.4 | Keyboard control (space · ← · → · esc) | Useful when mirrored to a laptop | S | low | shipped |
| 5.5 | Phase signalled by text, icon and colour | Survives colour-blindness and direct sunlight | S | med | shipped |
| 5.6 | **`aria-live` timer announcements at 10 s intervals** | A screen reader user currently gets nothing useful mid-set | M | high | next |
| 5.7 | **High-contrast theme** (AAA) | A third palette alongside light and dark | S | med | next |
| 5.8 | **Voice control** — Web Speech recognition: "pause", "next" | Hands are on the floor, not the phone | L | med | later |
| 5.9 | **One-handed reach layout** — primary controls in the lower third | Already close; make it a real mode | S | low | later |
| 5.10 | **Distinct haptic pattern for the final 3 seconds** | Currently one buzz for everything | S | low | later |
| 5.11 | **Text-scale slider** beyond the on/off large-text toggle | Presbyopia is a spectrum | S | low | later |

## 06 · Interface and language

| # | Enhancement | Why | Effort | Impact | Status |
|---|---|---|---|---|---|
| 6.1 | English · Hindi · Gujarati with locale-aware dates | A habit sticks better in a first language | M | high | shipped |
| 6.2 | Manual theme override (auto / light / dark) with no flash of the wrong one | The OS preference is not always the right answer | S | med | shipped |
| 6.3 | Hash deep links (`#progress`, `?lang=hi`) | Lets the landing page drive the real app | S | med | shipped |
| 6.4 | **Translate the exercise steps** (names and cues are done; the four form steps are English) | The only English left in the Hindi build | M | high | next |
| 6.5 | **More languages** — Marathi, Bengali, Tamil | Same string table, 146 keys | M | med | later |
| 6.6 | **Devanagari / Gujarati numerals** as an option | १२:३० instead of 12:30 | S | low | later |
| 6.7 | **First-run tour** — three cards, dismissible | The 0:30 rule is invisible until you open a clip | S | med | next |
| 6.8 | **Empty states with an action** | The progress tab is a grid of nothing on day one | S | low | next |
| 6.9 | **Back-button support for sheets** | Escape closes them; the browser back button does not | S | low | later |

## 07 · Offline and PWA

| # | Enhancement | Why | Effort | Impact | Status |
|---|---|---|---|---|---|
| 7.1 | Service worker shell cache, HTML network-first | Offline UI and history, without hiding releases | M | high | shipped |
| 7.2 | Manifest, maskable icons, standalone display | Installs to the home screen | S | high | shipped |
| 7.3 | **`beforeinstallprompt` card** — an in-app install button | Most people never find the browser menu | S | med | next |
| 7.4 | **`navigator.storage.persist()`** — ask not to be evicted | Local storage is the whole product; eviction is data loss | S | high | next |
| 7.5 | **Update toast** — "a new version is available · reload" | The worker updates silently today | S | med | next |
| 7.6 | **Manifest shortcuts** — long-press the icon → Start session | One gesture from home screen to workout | S | low | later |
| 7.7 | **Share target** — receive a video URL from the OS share sheet | Add an exercise from wherever you found the video | M | med | later |
| 7.8 | **Background pre-cache of the next release** (`periodicsync`) | Limited support; nice where it exists | M | low | idea |

## 08 · Code and quality

| # | Enhancement | Why | Effort | Impact | Status |
|---|---|---|---|---|---|
| 8.1 | **A test harness with no framework** — `node test/run.js` asserting on `store` and `session` pure functions | Streak maths and schedule building deserve tests | M | high | next |
| 8.2 | **`node --check` over every file** in one script, wired to a git pre-commit hook | Catches a syntax error before it reaches Pages | S | med | next |
| 8.3 | **A build stamp in the footer** | "Am I on the new one?" answerable from the page | S | low | shipped |
| 8.4 | **Screenshot script** committed (`scripts/shot.sh`) | The README image is reproducible, not hand-made | S | low | shipped |
| 8.5 | **Optional GitHub Action** running 8.1 and 8.2 on push | CI, not a backend — the app still needs no server | S | med | later |
| 8.6 | **Documented data schema** with a version field per key | Migration is currently implicit | S | med | later |

## 09 · Workout content

Software features are only half of it. These are the training-side additions, all of which
need nothing but data and a figure.

| # | Addition | Why | Effort | Impact | Status |
|---|---|---|---|---|---|
| 9.1 | **Three extra moves with their own figures** — side plank, glute bridge, superman | Anti-rotation, hip extension and spinal extension, which the core five leave out | S | high | shipped |
| 9.2 | **A/B day rotation** — anti-extension day, anti-rotation day, lateral day | Three planes beat five variations of the same one | M | high | next |
| 9.3 | **Swap a move in place** — long-press a plan row, pick a replacement | The cheapest version of a circuit builder | M | high | next |
| 9.4 | **Mobility interludes** — 20 s hip flexor, thoracic opener between sets | Desk-worker mornings need the front of the hip opened | S | med | later |
| 9.5 | **Load and leverage ladder** per move — knee push-up → full → feet elevated | Progression stated in the cue, not left to guesswork | S | med | later |
| 9.6 | **Tempo prescriptions** — 3-1-3 for dead bug, 5 s holds for hollow | Tempo is free difficulty | S | med | later |
| 9.7 | **Bilateral-to-unilateral progression** — bird dog → bird dog hold → bird dog with reach | A stated ladder rather than a jump | S | med | later |
| 9.8 | **Formats** — EMOM core, ladder (10-8-6), AMRAP-lite, tabata | Same moves, four different sessions | M | med | later |
| 9.9 | **Deload week as a real session** — half the volume, all of the cues | The programme already knows week 4 is a deload | S | med | later |
| 9.10 | **Posterior-chain day** — superman, bird dog, glute bridge, dead bug | Balances a flexion-heavy week | S | med | later |
| 9.11 | **Warm-up variants** — standing, supine, desk-chair | The right warm-up depends on where you are | S | low | idea |
| 9.12 | **Bracing ladder** — breathe → brace → brace-and-breathe, taught in week 1 | Most people never learn to brace; everything else depends on it | M | high | idea |
| 9.13 | **Seated / travel session** — chair-based, no floor, hotel-room floor | The habit survives travel | M | med | idea |
| 9.14 | **Return-to-training ramp** — four weeks, 60% → 100% volume | Pairs with the clinical section | M | high | idea |

---

## Explicitly out of scope — these need a backend

Listed so the boundary is visible rather than rediscovered later. None of these are stubs;
nothing in the code pretends to do them.

| Want | Why it cannot be done here |
|---|---|
| Cloud sync across devices | Needs an account system and a server. The JSON backup file is the honest substitute. |
| Multi-patient / clinic mode | Needs a database, access control and a privacy posture this project does not have. |
| Apple Health / Google Fit | No web API writes to either. Health Connect is Android-native; Apple's is native-only. |
| Scheduled push reminders | A service worker cannot wake itself. Notifications fire while the app is open or installed-and-running; a true 07:00 push needs a push server. |
| Shared/team leaderboards | Needs identity and a shared store. |
| Server-side video hosting | Self-hosting MP4s means paying for bandwidth. Item 1.11 gets you offline video from the user's own files without it. |
| Analytics on drop-off | Deliberately refused: no third-party scripts, no telemetry. |

---

## If you only do three

1. **1.11 offline video from local files** — it turns the one network dependency into an option, and IndexedDB makes it possible with no server.
2. **3.6 + 3.7 IndexedDB and per-set logging** — everything clinical downstream (4.5, 4.6) depends on knowing which move failed.
3. **8.1 a test harness** — the streak grace logic and the schedule builder are the two places a silent bug would cost a user their history.
