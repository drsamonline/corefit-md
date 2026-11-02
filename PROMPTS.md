# Generating the offline assets

Everything in `docs/play/assets/demo/` today is a hand-drawn SVG figure. This file is the
brief for replacing or supplementing them with generated stills and video loops, stamped
with the CoreFit MD watermark.

The app is already wired for it: drop files into `docs/play/assets/media/`, run one script,
and the app prefers them over the figures everywhere — workout stage, library thumbnails,
clip sheet — with no code change and no network.

---

## What to generate, and in what order

| Asset | Spec | Why |
|---|---|---|
| **Still, 16:9** | 1920×1080, JPEG or WebP | The safe minimum. Always works, tiny, no motion artefacts |
| **Loop, 16:9** | 4–6 s, silent, H.264 MP4 or WebM, ≤ 2 MB | The eye-candy version. Autoplays muted in the card |
| Animated WebP *(optional)* | 960×540, ≤ 800 KB | Sits between the two: motion, but one file and no codec risk |

Generate the stills first. A still you are happy with is also the first frame of the video —
every video model below takes an image as input, which is the only reliable way to keep the
demonstrator looking like the same person across ten clips.

**The hard part is not any single image. It is consistency across ten.** A plank from one
model and a bird dog from another will read as two different people in two different rooms.
Three ways to hold it together, best first:

1. **One reference image, reused.** Generate the plank first, keep it, and feed it as the
   reference/subject image for the other nine. Every model listed below supports this in some
   form: Midjourney `--cref <url> --cw 100`, Flux/SDXL with an IP-Adapter or a reference-only
   control, Kling/Runway/Veo "start frame" input.
2. **Character sheet first.** One prompt that produces the same person in three poses on a
   neutral background, then crop and use those crops as references. Slower, but it fixes the
   wardrobe and the body once.
3. **Drop the human.** A matte 3D mannequin is trivially consistent, never uncanny, and reads
   form *better* than a photo — see the Plan B style block. If consistency fights you, use this.

---

## The style block

Paste this, unchanged, into every prompt. It is what makes ten images look like one set.

```
STYLE:
Editorial fitness photograph, one adult demonstrator on a charcoal yoga mat,
seamless matte backdrop in deep green-black (#0A1613), soft key light from the
upper left with a subtle cool rim light behind the subject, 50 mm lens at eye
level, f/2.8, cool neutral colour grade with warm natural skin, fine film grain,
no props, no text, no logos, 16:9, full body in frame with a 15 percent margin,
subject centred, nothing important within 8 percent of any edge.
```

```
CHARACTER:
a lean South Asian man in his early thirties, short black hair, light stubble,
fitted charcoal-grey t-shirt, dark shorts, barefoot.
```

Why those edges: the player overlays a clip badge top-left and a credit line bottom-right.
Anything you need to see must sit inside the middle 84 percent.

**Plan B — matte mannequin style** (swap in for STYLE when consistency or hands fight you):

```
STYLE (3D):
Clean 3D render of a matte clay mannequin with no facial features, smooth
off-white surface with a soft warm bounce light, charcoal yoga mat on a dark
green-black seamless floor, studio softbox from the upper left, gentle contact
shadow, subtle ambient occlusion, physically based shading, 50 mm equivalent,
16:9, full body in frame with a 15 percent margin, subject centred, no text.
```

---

## The ten prompts

Each entry: the still prompt, the motion prompt for image-to-video, and **the cues the
result must show** — the last part is the acceptance test. A generated clip that looks
beautiful and shows a sagging plank is worse than the SVG.

---

### 1 · Forearm Plank

**Still**
```
[STYLE] [CHARACTER] holding a forearm plank: forearms flat on the mat with the
elbows directly under the shoulders, hands in loose fists, toes tucked, hips
lifted so that head, hips and heels form one straight line, no sag in the lower
back and no pike at the hips, chin slightly tucked and gaze on the mat two feet
ahead, glutes and quads visibly engaged. Camera at mat level, three-quarter side
view so the straight line of the body is legible.
```

**Motion**
```
Animate this still. The plank holds; a single slow breath moves the ribcage and
the hips settle about one centimetre and return. No limb movement, no weight
shift, no camera movement. Seamless 5-second loop.
```

**Must show:** one straight line head→hips→heels · elbows under shoulders, not behind ·
flat lower back · no shoulder shrug.

---

### 2 · Dead Bug

**Still**
```
[STYLE] [CHARACTER] lying flat on his back on the mat performing a dead bug.
BOTH arms point straight up to the ceiling, wrists directly above the shoulders,
hands in loose fists. BOTH knees are bent to 90 degrees and stacked over the hips
with the shins parallel to the floor. Only ONE arm and the OPPOSITE leg move: the
right arm lowers back over the head toward the floor and the left leg extends out
and down, neither touching it. The other arm stays vertical and the other knee
stays at 90 degrees. Lower back pressed flat into the mat with no gap, ribs down,
head resting, neutral neck. Camera three-quarter overhead from the feet end.
```

**Motion**
```
Animate this still. The right arm and the left leg lower together toward the
floor over two seconds, pause, then return to the start; the lower back stays
glued to the mat and the pelvis does not rock. Seamless 5-second loop.
```

**Must show:** both arms up at rest · 90/90 hip and knee · only the opposite pair
moving · flat lumbar spine.

**Failed first time because:** one arm rested on the floor. Keep both arms vertical —
only one moves.

---

### 3 · Bird Dog

**Still**
```
[STYLE] [CHARACTER] on all fours in a tabletop position on the mat performing a
bird dog. FOUR points of contact at the base: both knees on the mat under the hips
and both hands on the mat under the shoulders — the non-working knee stays down on
the mat for the whole pose, he is NOT kneeling up and NOT in a lunge. From that
base the right arm reaches forward and the left leg reaches back until both are
level with the torso, the hips stay square to the floor with no rotation and no
arch in the lower back, gaze down, neck long. Camera three-quarter side view, low.
```

**Motion**
```
Animate this still. The arm and the opposite leg extend out to level over two
seconds, hold for one second, then return under the body; the hips stay level and
do not rotate at any point. Seamless 5-second loop.
```

**Must show:** four-point base — both knees down · hips level · both limbs at torso
height · no lumbar arch.

**Failed first time because:** it rendered as a half-kneel. Say "both knees on the mat"
and "not kneeling up".

---

### 4 · Bicycle Crunch

**Still**
```
[STYLE] [CHARACTER] lying supine performing a bicycle crunch: shoulders lifted off
the mat with the torso curled, hands resting lightly behind the head with the
elbows wide, the right elbow rotating toward the left knee while the right leg
extends long and low above the floor, the left knee bent toward the chest, chin
off the chest and neck neutral. Camera three-quarter overhead from the side so the
rotation through the ribs is visible rather than the neck.
```

**Motion**
```
Animate this still. The torso rotates so the right elbow travels toward the left
knee while the legs swap — one bends in, the other extends out — then the pattern
reverses. Two slow alternating repetitions, smooth, never rushed, no bouncing.
Seamless 5-second loop.
```

**Must show:** rotation from the ribcage, not the neck · elbows wide, not pulled forward ·
extended leg low but off the floor · shoulders off the mat.

---

### 5 · Hollow Body Hold

**Still**
```
[STYLE] [CHARACTER] lying on his back on the mat in a hollow body hold. The HIPS
AND GLUTES STAY ON THE FLOOR — this is not a boat pose and not a V-sit. The lower
back is pressed into the mat, the ribs are pulled down, the arms are extended
overhead past the ears and lifted just off the floor, and the legs are straight
and lifted only a few centimetres above the mat. The body makes a shallow, long
curve hugging the floor, with the shoulder blades and the heels as the only high
points. Chin tucked, neck long. Camera low three-quarter side view, close to the
mat, so the shallow curve and the contact with the floor are unmistakable.
```

**Motion**
```
Animate this still. The hollow holds; the body rocks back and forward by a few
degrees around the hips, driven by the abs, with the ribs staying down and the
lower back staying close to the mat. Small, controlled. Seamless 5-second loop.
```

**Must show:** hips on the floor · shallow curve, not a V · arms by the ears ·
legs only just off the mat.

**Failed first time because:** it rendered as a boat pose with the hips high.
Say "hips on the floor" and "not a V-sit" explicitly.

---

### 6 · Warm-up

**Still**
```
[STYLE] [CHARACTER] standing tall on the mat at the start of a warm-up: feet hip
width, knees soft, arms sweeping overhead with the palms facing each other,
shoulders relaxed down and back, chest open, gaze forward, easy posture rather
than a stretch at end range. Camera straight on, eye level, full body.
```

**Motion**
```
Animate this still. The arms sweep from overhead down to the sides and back up in
one slow continuous arc while the ribcage lifts and settles with the breath; the
feet stay planted. Seamless 5-second loop.
```

**Must show:** relaxed shoulders · full-body frame · nothing at end range.

---

### 7 · Cool-down

**Still**
```
[STYLE] [CHARACTER] in child's pose on the mat: kneeling with the hips back over
the heels, torso folded forward, forehead resting on the mat, arms extended
forward with the palms down, shoulders softening, back long and rounded, feet
together. Camera low three-quarter side view, calm and still.
```

**Motion**
```
Animate this still. Only breathing: the back rises and widens on the inhale and
settles on a longer exhale. No other movement, no camera movement. Seamless
6-second loop.
```

**Must show:** hips over heels · forehead down · long rounded back · stillness.

---

### 8 · Side Plank

**Still**
```
[STYLE] [CHARACTER] holding a side plank on the right forearm: elbow directly
under the shoulder, forearm along the mat, hips lifted so that head, hips and
ankles form one straight line, feet stacked, the top arm reaching straight up to
the ceiling, ribs stacked and not rotated forward, neck long. Camera straight on
from the front so the vertical line of the body and the stacked hips read.
```

**Motion**
```
Animate this still. The side plank holds; the hips lift two centimetres and settle
once, the top arm stays vertical, the body never rotates. Seamless 5-second loop.
```

**Must show:** elbow under shoulder · hips lifted, no sag · feet stacked · no forward roll.

---

### 9 · Glute Bridge

**Still**
```
[STYLE] [CHARACTER] in a glute bridge on the mat: lying supine with the knees bent
and the heels under the knees, hips lifted until the shoulders, hips and knees
form a straight line, shins vertical, ribs down and lower back long, arms resting
along the floor with the palms down, chin slightly tucked. Camera low three-quarter
side view so the straight line from shoulder to knee is obvious.
```

**Motion**
```
Animate this still. The hips lower to just above the mat and press back up to the
top position once, driven by the glutes; the ribs stay down and the lower back
does not arch at the top. Seamless 5-second loop.
```

**Must show:** shins vertical, knees at 90° · shoulders-hips-knees in line · no lumbar arch
at the top · heels down.

---

### 10 · Superman

**Still**
```
[STYLE] [CHARACTER] lying prone on the mat performing a superman: face down, arms
extended forward past the head, legs long, the arms, chest and legs lifted a few
centimetres off the mat, neck long with the gaze on the floor and the chin
slightly tucked, glutes engaged. Camera low three-quarter side view so the lift
off the mat is visible.
```

**Motion**
```
Animate this still. The arms, chest and legs lift a few centimetres, hold for one
second, then lower with control; the neck never cranes upward. Seamless 5-second
loop.
```

**Must show:** neck long, no craning · limbs lifted, not thrown · glutes engaged · hips still
on the mat.

---

## Negative prompt

Append to every image generation:

```
NEGATIVE:
text, letters, watermark, logo, signature, UI, extra limbs, extra fingers, fused
fingers, distorted hands, twisted spine, sagging hips, hyperextended joints,
deformed feet, cartoon, anime, oversaturated, harsh flash, busy background,
mirrors, other people, gym equipment, weights, shoes, sports bra visible
through clothing, motion blur, low resolution, jpeg artefacts
```

Append to every video generation:

```
NEGATIVE:
camera movement, zoom, pan, dolly, cuts, transitions, flicker, morphing limbs,
changing face, changing clothing, background shifting, text, watermark, captions
```

---

## Model notes, honestly

- **Midjourney** — best stills out of the box; use `--ar 16:9 --style raw`, and `--cref <url> --cw 100` to hold the person. It does not do video.
- **Flux / SDXL (local or hosted)** — best consistency control via reference images and IP-Adapter; slower to tune, more repeatable once tuned.
- **Kling / Runway / Veo / Sora** — image-to-video, which is what you want. Give them the approved still, keep the camera locked, ask for a loop. Anatomy drifts over 5 seconds; short is safer than clever.
- **Any of them** — generate at 16:9, never 9:16, and check the cues in the checklist below before accepting a clip. Regenerating a bad plank is cheap; shipping one is not.

---

## Watermark

Two ways, in order of preference:

**1 · Burn it in after generation (recommended).** Generated text is unreliable and the model
will not place a mark consistently. Stamp it yourself:

```bash
# one file
python3 scripts/watermark.py docs/play/assets/media/plank.mp4

# the whole folder, images and video, in place
python3 scripts/watermark.py docs/play/assets/media/

# preview where it lands without writing anything
python3 scripts/watermark.py docs/play/assets/media/plank.jpg --dry-run
```

The script places the mark bottom-right at 7% of the frame width, 60% opacity, over a soft
dark gradient so it stays legible on a light or dark frame. Images are stamped with Pillow;
video with `ffmpeg` (it must be installed for video — images work without it). Pass
`--text "your text"` or `--image your-logo.png` to use your own lockup, and `--position` to
move it.

**2 · Ask the generator for it.** Only if you accept that it will be inconsistent:

```
Place a small, subtle wordmark reading "COREFIT MD" in the bottom right corner, 7
percent of the frame width, white at 60 percent opacity, aligned to a 5 percent
safe margin, crisp and not stylised, as a permanent watermark.
```

Even then, run the script afterwards — a real watermark is a pixel operation, not a wish.

---

## Dropping them in

File names are fixed. Put the files in `docs/play/assets/media/`:

```
docs/play/assets/media/
  plank.mp4        ← video wins if present
  plank.webp       ← else this
  plank.jpg        ← else this
  deadbug.mp4
  birddog.mp4
  bicycle.mp4
  hollow.mp4
  warmup.mp4
  cooldown.mp4
  sideplank.mp4
  glutebridge.mp4
  superman.mp4
```

Then regenerate the manifest and commit:

```bash
python3 scripts/media_manifest.py
git add docs/play/assets/media && git commit -m "offline media" && git push
```

`media_manifest.py` scans the folder and writes `media.js` (a plain script, so it loads from
`file://` as well as a server). The app reads it at boot; any id listed there is used instead of the SVG figure in the workout stage, the clip
sheet and the library. Anything missing falls back to the figure, so you can add these one at
a time — the app never breaks on a partial set.

Precedence per exercise: `mp4` → `webm` → `webp` → `jpg`/`png` → SVG figure.

Two practical notes:

- **Keep each loop under 2 MB.** Ten of them load on the library screen. If a file is bigger,
  re-encode at 720p, 24 fps, CRF 28.
- **The service worker caches same-origin files on first use**, so the second session is
  offline-safe — but the first load of a new clip still needs a connection. If you want them
  precached, add the file names to `SHELL` in `docs/play/sw.js`.

---

## Acceptance checklist

Look at each generated asset and answer honestly. A "no" means regenerate, not ship.

- [ ] Does the body show the cue the exercise is named for? (The "Must show" line above.)
- [ ] Is the spine where it should be — flat for plank and dead bug, neutral for bird dog?
- [ ] Are the hands and feet anatomically plausible? (Zoom in. This is where AI fails.)
- [ ] Is the demonstrator the same person, wardrobe and room as the other nine?
- [ ] Is the frame 16:9 with nothing important in the outer 8 percent?
- [ ] Does the loop return to the exact starting pose with no jump cut?
- [ ] Is the watermark legible on both a light and a dark region of the frame?
- [ ] Under 2 MB for video, under 300 KB for a still?

---

## What was actually generated

Four stills are in the repo, made with this brief through the Apify image actor
(`fayoussef/bulk-ai-image-generator`, Gemini image model, billed to the Apify account):

| Asset | Verdict |
|---|---|
| `plank.jpg` | pass — elbows under shoulders, one straight line, no sag |
| `bicycle.jpg` | pass — rib rotation, opposite elbow to knee |
| `sideplank.jpg` | pass — elbow under shoulder, hips lifted, feet stacked |
| `glutebridge.jpg` | pass — shins vertical, shoulder-hip-knee in line |
| dead bug | **rejected** — one arm rested on the floor instead of both reaching up |
| bird dog | **rejected** — performed from a half-kneel, not from all fours |
| hollow hold | **rejected** — read as a boat pose, hips well off the mat |
| warm-up, cool-down, superman | not generated — the account hit its billing-cycle cap mid-run |

The rejected three and the three missing ones keep their SVG figures, which is exactly the
fallback the app is built around. Re-run the prompts for those six when the billing cycle
resets; the acceptance checklist above is what caught them.

## Licence note

Assets you generate are yours to license — that is the whole point of this route, and it is
what the embedded YouTube clips can never be. Keep the prompt text and the generator's terms
with the repo if you plan to publish the app; a `MEDIA-LICENCE.md` listing "generated with
<model>, <date>, prompt in PROMPTS.md" is enough to answer the question later.
