#!/usr/bin/env python3
"""Stamp the CoreFit MD watermark onto generated stills and video loops.

The watermark is a pixel operation, not a wish — asking a generator to place text
reliably does not work, so generate clean frames and stamp them here.

    python3 scripts/watermark.py docs/play/assets/media/plank.jpg
    python3 scripts/watermark.py docs/play/assets/media/          # whole folder
    python3 scripts/watermark.py file.mp4 --position bl --width 0.09
    python3 scripts/watermark.py file.jpg --dry-run               # writes a preview

Images  → Pillow (always available).
Video   → ffmpeg (must be on PATH; `brew install ffmpeg` / `apt install ffmpeg`).

Default mark: "COREFIT MD", bottom right, 7% of the frame width, 60% opacity,
on a soft dark pill so it stays legible over a light or a dark frame.
"""
import argparse
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp"}
VIDEO_EXT = {".mp4", ".mov", ".webm", ".m4v"}

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
]


def load_font(size):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def build_mark(text, mark_w, opacity):
    """A white wordmark on a soft dark pill, sized to `mark_w` pixels wide."""
    pad_x = max(8, int(mark_w * 0.10))
    pad_y = max(5, int(mark_w * 0.055))
    font = load_font(max(11, int(mark_w * 0.115)))

    probe = Image.new("RGBA", (10, 10))
    box = ImageDraw.Draw(probe).textbbox((0, 0), text, font=font)
    tw, th = box[2] - box[0], box[3] - box[1]

    w, h = tw + pad_x * 2, th + pad_y * 2
    mark = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(mark)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=h // 2, fill=(6, 16, 13, int(255 * 0.42 * opacity / 0.6)))
    d.text((pad_x - box[0], pad_y - box[1]), text, font=font, fill=(255, 255, 255, int(255 * opacity)))
    return mark


def offset(size, mark_size, position, margin):
    W, H = size
    w, h = mark_size
    if position == "br":
        return W - w - margin, H - h - margin
    if position == "bl":
        return margin, H - h - margin
    if position == "tr":
        return W - w - margin, margin
    return margin, margin


def stamp_image(path, args):
    img = Image.open(path)
    frames = getattr(img, "n_frames", 1)
    out = []

    for i in range(frames):
        if frames > 1:
            img.seek(i)
        frame = img.convert("RGBA")
        mark = build_mark(args.text, int(frame.width * args.width), args.opacity)
        pos = offset(frame.size, mark.size, args.position, int(frame.width * args.margin))
        layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        layer.paste(mark, pos, mark)
        out.append(Image.alpha_composite(frame, layer).convert("RGB" if path.lower().endswith((".jpg", ".jpeg")) else "RGBA"))

    if args.dry_run:
        preview = path.rsplit(".", 1)[0] + "-watermark-preview.png"
        out[0].save(preview)
        print("preview →", preview)
        return

    if frames > 1:
        out[0].save(path, save_all=True, append_images=out[1:], duration=img.info.get("duration", 80),
                    loop=img.info.get("loop", 0))
    else:
        out[0].save(path, quality=92, optimize=True)
    print("stamped", path)


def stamp_video(path, args):
    if not shutil.which("ffmpeg"):
        print("ffmpeg not found — skipping", path, "(install ffmpeg for video watermarking)", file=sys.stderr)
        return

    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                            "-show_entries", "stream=width,height", "-of", "csv=p=0", path],
                           capture_output=True, text=True)
    try:
        W, H = [int(x) for x in probe.stdout.strip().split(",")[:2]]
    except ValueError:
        print("could not read dimensions of", path, file=sys.stderr)
        return

    mark = build_mark(args.text, int(W * args.width), args.opacity)
    margin = int(W * args.margin)
    x, y = offset((W, H), mark.size, args.position, margin)

    with tempfile.TemporaryDirectory() as tmp:
        wm_path = os.path.join(tmp, "wm.png")
        mark.save(wm_path)
        out_path = os.path.join(tmp, "out" + os.path.splitext(path)[1])
        cmd = ["ffmpeg", "-y", "-i", path, "-i", wm_path,
               "-filter_complex", "[0:v][1:v]overlay=%d:%d:format=auto" % (x, y),
               "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p",
               "-c:a", "copy", out_path]
        if args.dry_run:
            cmd[-1] = out_path
            print("would run:", " ".join(cmd))
            return
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print("ffmpeg failed on", path, "\n", r.stderr[-500:], file=sys.stderr)
            return
        shutil.move(out_path, path)
    print("stamped", path)


def main():
    ap = argparse.ArgumentParser(description="Stamp the CoreFit MD watermark.")
    ap.add_argument("path", help="a file, or a folder of stills and video")
    ap.add_argument("--text", default="COREFIT MD")
    ap.add_argument("--width", type=float, default=0.07, help="mark width as a fraction of frame width")
    ap.add_argument("--opacity", type=float, default=0.6)
    ap.add_argument("--margin", type=float, default=0.035, help="margin as a fraction of frame width")
    ap.add_argument("--position", choices=["br", "bl", "tr", "tl"], default="br")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    targets = []
    if os.path.isdir(args.path):
        for name in sorted(os.listdir(args.path)):
            ext = os.path.splitext(name)[1].lower()
            if ext in IMAGE_EXT or ext in VIDEO_EXT:
                targets.append(os.path.join(args.path, name))
    elif os.path.exists(args.path):
        targets.append(args.path)
    else:
        sys.exit("no such file or folder: " + args.path)

    if not targets:
        sys.exit("nothing to stamp in " + args.path)

    for path in targets:
        ext = os.path.splitext(path)[1].lower()
        if ext in IMAGE_EXT:
            stamp_image(path, args)
        elif ext in VIDEO_EXT:
            stamp_video(path, args)
    print("done —", len(targets), "file(s)")


if __name__ == "__main__":
    main()
