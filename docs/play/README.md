# CoreFit MD — v2

A five-minute, video-guided morning core routine. Built as a small static app: no
framework, no build step, no backend. Open `index.html` and it runs.

The rule the whole thing is built around: **a set never starts on an intro.** Every
exercise clip opens at its demonstration mark (0:30 by default) and loops only inside
its own window.

---

## Running it

| How | What works |
|---|---|
| `python3 -m http.server 8080` in this folder, then open `localhost:8080` | Everything, including the service worker and install-to-home-screen |
| Any static host (Netlify, GitHub Pages, nginx) | Everything |
| Double-click `index.html` (`file://`) | The full app, except the service worker and PWA install. Data still persists where the browser allows local storage on `file://` |

`?lang=hi` or `?lang=gu` opens the app in that language directly.

---

## Structure

```
index.html                  markup only — no inline logic
manifest.webmanifest        PWA manifest
sw.js                       service worker: precaches the shell, stale-while-revalidate
assets/
  css/app.css               the entire design system (light + dark, big-text, landscape)
  fonts/                    3 self-hosted variable woff2 files + fonts.css  (~130 KB total)
  i18n/strings.js           en / hi / gu string tables (146 keys each)
  js/
    config.js               constants: storage keys, programme weeks, defaults, screening list
    data.js                 the five exercises, warm-up and cool-down cue clocks
    store.js                every localStorage read/write, stats, streaks, import/export
    i18n.js                 translation lookup + DOM binding
    video.js                clip player: YouTube or native MP4, one interface
    session.js              schedule builder + drift-free timer engine
    ui.js                   all rendering
    main.js                 controller: wiring, session lifecycle, audio, haptics
icons/                      192, 512 and maskable app icons
```

Load order matters only for `config.js` first; everything else attaches to one
`window.CF` namespace. No bundler, no transpiler, no dependencies.

---

## The video model

Each exercise carries a clip window:

```js
{ videoId: 'ASdvN_XEl_c', clip: { start: 30, end: 55 } }
```

- The YouTube player is created with `start=30` **and** re-seeked to 30 on `onReady`,
  so the first frame is the demonstration.
- A watchdog compares `getCurrentTime()` against the window end on every tick and
  seeks back, so a 50-second set keeps showing the movement instead of drifting into
  the outro or the end card.
- One `YT.Player` instance is reused for the whole session. During each rest interval
  the *next* exercise is `cueVideoById`-preloaded, which removes the black frame and
  the start stall at the top of the next set.
- If an embed fails, the player tries one backup video ID, then falls back to a poster
  with a deep link to the exact second.
- A native `<video>` path exists for self-hosted files: set a clip's `file` and it
  plays `clip.mp4#t=30,55` with no YouTube involved.

Every window is editable per exercise in the Library — tap a card, scrub, hit **now**
on either field to capture the playhead, save. Stored on the device.

---

## What is implemented

**Playback** — 0:30 in-point, per-exercise windows, in-window looping, preload during
rest, backup-ID failover, poster fallback, playback speed, mute, MP4 path.

**Session** — warm-up and cool-down blocks, six-week progression (45→60 s work, with a
deload week), per-side splitting for unilateral moves, rep-counting mode, drift-free
clock, pause, skip, restart, ±10 s, proportional segment rail, session-remaining
readout, backgrounded-tab re-anchor, resume-after-interruption.

**Feedback** — audio cues for the final three seconds, voice prompts, haptics, screen
wake lock, keyboard control (space / ← / → / esc).

**Logging** — streaks with a one-day grace, best streak, monthly calendar, 7-day bars,
30-day consistency, weekly goal, per-session duration and move count, post-session RPE
and pain flag and note.

**Clinical** — contraindication screening on first run, modified plan when flagged,
a "stop if it hurts" gate before each session, per-exercise easier/harder variations
surfaced in the library and in the cue line.

**Data** — CSV export, full JSON backup and restore, printable one-page summary.

**Interface** — three languages (English, Hindi, Gujarati) with locale-aware dates,
light and dark themes, large-text mode, audio-only mode, landscape layout, reduced-motion
support, PWA install, offline app shell.

---

## What is not implemented, and why

These were on the register and cannot be honestly delivered by a static page with no
backend. They are not stubs — the code does not pretend to do them.

- **Cloud sync / multi-device history.** Needs an account system and a server.
- **Apple Health / Google Fit write.** No web API exists for either.
- **Scheduled push reminders.** The service worker can show a notification while the
  app is open or installed-and-running; it cannot wake itself at 07:00 without a push
  server. The reminder setting is honest about this in its subtitle.
- **Offline video.** YouTube embeds cannot be cached. Offline video requires
  self-hosted MP4s, which is why the MP4 path exists.
- **Clinic / multi-patient mode.** A different product.

## Known limits

- **0:30 is a default, not a verified timestamp.** I have not watched each of the five
  source videos to confirm where its demonstration actually begins. Open the Library,
  preview each clip, and correct the in-point — it is a two-tap job per exercise and
  worth doing once.
- Everything is stored in this browser's local storage. Clearing site data erases it.
  Use **Backup as JSON**.
- Video needs a connection; the timer, history and UI do not.
