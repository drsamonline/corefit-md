#!/usr/bin/env python3
"""Generate this repository's badges as local SVG files.

An offline-first app should not depend on an image service to describe itself.
These are drawn here, committed, and referenced by relative path — they render
on GitHub Pages, in the README, and from `file://` with no network at all.

Every value below is a claim about this repository, so it has to stay true:
  live      — the Pages site is published
  offline   — the app shell, timer and history work with no connection
              (video does not; it is an embed)
  deps      — no runtime dependency of any kind
  backend   — no server, no account, no database
  langs     — English, Hindi, Gujarati
  licence   — MIT

    python3 scripts/badges.py
"""
import os

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs", "assets")

INK = "#0f1417"
CREAM = "#f2f3f0"
COBALT = "#2f4fd8"
WARM = "#a8452a"

BADGES = [
    ("live", "live", "online", COBALT),
    ("offline", "offline", "UI + history", INK),
    ("deps", "deps", "0 runtime", INK),
    ("backend", "backend", "none", WARM),
    ("langs", "langs", "EN · HI · GU", COBALT),
    ("licence", "licence", "MIT", WARM),
]

CH = 6.6  # approximate advance width at 11px in a monospace-ish sans


def badge(label, value, colour):
    lw = int(len(label) * CH) + 16
    vw = int(len(value) * CH) + 16
    total = lw + vw
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="22" role="img" '
        'aria-label="%s: %s">'
        '<title>%s: %s</title>'
        '<linearGradient id="s" x2="0" y2="100%%"><stop offset="0" stop-color="#fff" stop-opacity=".10"/>'
        '<stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>'
        '<clipPath id="r"><rect width="%d" height="22" rx="4" fill="#fff"/></clipPath>'
        '<g clip-path="url(#r)">'
        '<rect width="%d" height="22" fill="%s"/>'
        '<rect x="%d" width="%d" height="22" fill="%s"/>'
        '<rect width="%d" height="22" fill="url(#s)"/>'
        "</g>"
        '<g fill="%s" font-family="ui-sans-serif,Segoe UI,Helvetica,Arial,sans-serif" font-size="11" '
        'text-anchor="middle">'
        '<text x="%d" y="15">%s</text>'
        '<text x="%d" y="15">%s</text>'
        "</g></svg>"
    ) % (total, label, value, label, value, total, lw, INK, lw, vw, colour, total,
         CREAM, lw // 2, label, lw + vw // 2, value)


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, label, value, colour in BADGES:
        path = os.path.join(OUT, "badge-%s.svg" % name)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(badge(label, value, colour))
        print("wrote", path)


if __name__ == "__main__":
    main()
