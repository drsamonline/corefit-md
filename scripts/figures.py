#!/usr/bin/env python3
"""Generate the offline demonstration figures.

These are drawn here rather than taken from the source videos: the clips are
other people's footage, and a still frame of a presenter is a poor form guide.
An animated figure is a few kilobytes, stays sharp at any size, loops forever,
honours prefers-reduced-motion, and needs no network at all.

    python3 scripts/figures.py
"""
import os

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs", "play", "assets", "demo")

BONE = "#e7f3ed"
DIM = "#7fa79a"
SIGNAL = "#ff7a45"
MAT = "#2b4c43"

STYLE = """
  .f{fill:none;stroke:%(bone)s;stroke-width:7;stroke-linecap:round;stroke-linejoin:round}
  .l{fill:none;stroke:%(bone)s;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
  .ghost{fill:none;stroke:%(dim)s;stroke-width:3;stroke-linecap:round;stroke-dasharray:3 7;opacity:.55}
  .head{fill:%(bone)s;stroke:none}
  .mat{stroke:%(mat)s;stroke-width:3;stroke-linecap:round}
  .joint{fill:#0d2b24;stroke:%(signal)s;stroke-width:2.2}
  .glow{fill:none;stroke:%(signal)s;stroke-width:3;stroke-linecap:round;opacity:.85}
  g[data-o]{transform-box:view-box}
  @media (prefers-reduced-motion: reduce){ *{animation:none !important} }
""" % {"bone": BONE, "dim": DIM, "signal": SIGNAL, "mat": MAT}


def svg(title, body, extra_css=""):
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="320" height="180" '
        'role="img" aria-label="%s">\n'
        '<title>%s</title>\n'
        '<style>%s%s</style>\n'
        '<line class="mat" x1="28" y1="%s" x2="292" y2="%s"/>\n'
        '%s\n</svg>\n'
    ) % (title, title, STYLE, extra_css, body[0], body[0], body[1])


FILES = {}

# ---------------------------------------------------------------- plank
FILES["plank.svg"] = svg(
    "Forearm plank: elbows under shoulders, one straight line from head to heels",
    ("142", """
  <g class="breathe">
    <line class="f" x1="124" y1="127" x2="180" y2="110"/>
    <line class="l" x1="124" y1="127" x2="90" y2="133"/>
    <line class="l" x1="90" y1="133" x2="54" y2="138"/>
    <line class="l" x1="180" y1="110" x2="177" y2="141"/>
    <line class="l" x1="177" y1="141" x2="204" y2="141"/>
    <circle class="head" cx="200" cy="101" r="10"/>
    <circle class="joint" cx="124" cy="127" r="3.4"/>
    <circle class="joint" cx="180" cy="110" r="3.4"/>
    <line class="ghost" x1="56" y1="139" x2="196" y2="102"/>
  </g>
  <path class="glow" d="M132 132 q10 -5 20 -3">
    <animate attributeName="opacity" values=".2;.95;.2" dur="3.2s" repeatCount="indefinite"/>
  </path>
"""),
    """
  .breathe{animation:breathe 3.2s ease-in-out infinite}
  @keyframes breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.8px)}}
  .breathe{transform-box:view-box}
""")

# ---------------------------------------------------------------- dead bug
FILES["deadbug.svg"] = svg(
    "Dead bug: opposite arm and leg lower slowly while the low back stays flat",
    ("132", """
  <line class="f" x1="82" y1="124" x2="156" y2="124"/>
  <circle class="head" cx="64" cy="119" r="10"/>
  <circle class="joint" cx="156" cy="124" r="3.4"/>
  <line class="l" x1="82" y1="128" x2="120" y2="131"/>
  <g data-o="1" style="transform-origin:88px 122px" class="armUp">
    <line class="l" x1="88" y1="122" x2="96" y2="86"/>
  </g>
  <g data-o="1" style="transform-origin:156px 124px" class="legSet">
    <line class="l" x1="156" y1="124" x2="180" y2="94"/>
    <line class="l" x1="180" y1="94" x2="208" y2="94"/>
    <circle class="joint" cx="180" cy="94" r="3"/>
  </g>
  <g data-o="1" style="transform-origin:156px 124px" class="legSet2">
    <line class="l" x1="156" y1="124" x2="178" y2="98"/>
    <line class="l" x1="178" y1="98" x2="204" y2="100"/>
  </g>
"""),
    """
  .armUp{animation:arm 4.4s ease-in-out infinite}
  @keyframes arm{0%,22%{transform:rotate(0)}46%,66%{transform:rotate(-58deg)}88%,100%{transform:rotate(0)}}
  .legSet{animation:leg 4.4s ease-in-out infinite}
  .legSet2{animation:leg2 4.4s ease-in-out infinite}
  @keyframes leg{0%,22%{transform:rotate(0)}46%,66%{transform:rotate(46deg)}88%,100%{transform:rotate(0)}}
  @keyframes leg2{0%,22%{transform:rotate(0)}46%,66%{transform:rotate(-10deg)}88%,100%{transform:rotate(0)}}
""")

# ---------------------------------------------------------------- bird dog
FILES["birddog.svg"] = svg(
    "Bird dog: opposite arm and leg reach long while the hips stay level",
    ("142", """
  <line class="f" x1="122" y1="112" x2="200" y2="112"/>
  <circle class="head" cx="215" cy="103" r="9.5"/>
  <line class="l" x1="200" y1="112" x2="206" y2="141"/>
  <line class="l" x1="122" y1="112" x2="116" y2="141"/>
  <circle class="joint" cx="122" cy="112" r="3.4"/>
  <circle class="joint" cx="200" cy="112" r="3.4"/>
  <g data-o="1" style="transform-origin:200px 112px" class="armR">
    <line class="l" x1="200" y1="112" x2="212" y2="140"/>
  </g>
  <g data-o="1" style="transform-origin:122px 112px" class="legR">
    <line class="l" x1="122" y1="112" x2="112" y2="140"/>
  </g>
  <line class="ghost" x1="118" y1="110" x2="206" y2="110"/>
"""),
    """
  .armR{animation:armR 4s ease-in-out infinite}
  .legR{animation:legR 4s ease-in-out infinite}
  @keyframes armR{0%,18%{transform:rotate(0)}44%,62%{transform:rotate(-88deg)}86%,100%{transform:rotate(0)}}
  @keyframes legR{0%,18%{transform:rotate(0)}44%,62%{transform:rotate(88deg)}86%,100%{transform:rotate(0)}}
""")

# ---------------------------------------------------------------- bicycle
FILES["bicycle.svg"] = svg(
    "Bicycle crunch: rotate from the ribs, alternate elbow toward the opposite knee",
    ("132", """
  <line class="f" x1="88" y1="113" x2="162" y2="124"/>
  <circle class="head" cx="68" cy="104" r="10"/>
  <circle class="joint" cx="162" cy="124" r="3.4"/>
  <g data-o="1" style="transform-origin:90px 114px" class="elbow">
    <line class="l" x1="90" y1="114" x2="100" y2="94"/>
  </g>
  <g data-o="1" style="transform-origin:162px 124px" class="legA">
    <line class="l" x1="162" y1="124" x2="190" y2="98"/>
    <line class="l" x1="190" y1="98" x2="218" y2="112"/>
    <circle class="joint" cx="190" cy="98" r="3"/>
  </g>
  <g data-o="1" style="transform-origin:162px 124px" class="legB">
    <line class="l" x1="162" y1="124" x2="144" y2="98"/>
    <line class="l" x1="144" y1="98" x2="154" y2="74"/>
    <circle class="joint" cx="144" cy="98" r="3"/>
  </g>
"""),
    """
  .legA{animation:legA 3.4s ease-in-out infinite}
  .legB{animation:legB 3.4s ease-in-out infinite}
  .elbow{animation:elbow 3.4s ease-in-out infinite}
  @keyframes legA{0%,100%{transform:rotate(0)}50%{transform:rotate(-26deg)}}
  @keyframes legB{0%,100%{transform:rotate(26deg)}50%{transform:rotate(0)}}
  @keyframes elbow{0%,100%{transform:rotate(0)}50%{transform:rotate(12deg)}}
""")

# ---------------------------------------------------------------- hollow
FILES["hollow.svg"] = svg(
    "Hollow body hold: ribs down, low back flat, a shallow banana not a deep arch",
    ("134", """
  <g data-o="1" style="transform-origin:168px 126px" class="rock">
    <line class="f" x1="88" y1="112" x2="168" y2="126"/>
    <circle class="head" cx="76" cy="108" r="10"/>
    <line class="l" x1="88" y1="112" x2="46" y2="96"/>
    <line class="l" x1="168" y1="126" x2="224" y2="108"/>
    <circle class="joint" cx="168" cy="126" r="3.4"/>
    <line class="ghost" x1="60" y1="104" x2="214" y2="112"/>
  </g>
  <path class="glow" d="M150 130 q12 -4 24 -2">
    <animate attributeName="opacity" values=".25;1;.25" dur="2.6s" repeatCount="indefinite"/>
  </path>
"""),
    """
  .rock{animation:rock 4s ease-in-out infinite}
  @keyframes rock{0%,100%{transform:rotate(2.4deg)}50%{transform:rotate(-2.4deg)}}
""")

# ---------------------------------------------------------------- warm-up
FILES["warmup.svg"] = svg(
    "Warm-up: stand tall, roll the shoulders, then cat-cow and glute bridges",
    ("142", """
  <line class="f" x1="150" y1="112" x2="150" y2="76"/>
  <circle class="head" cx="150" cy="58" r="10"/>
  <line class="l" x1="150" y1="112" x2="138" y2="140"/>
  <line class="l" x1="150" y1="112" x2="162" y2="140"/>
  <g data-o="1" style="transform-origin:150px 78px" class="arms">
    <line class="l" x1="150" y1="78" x2="122" y2="62"/>
    <line class="l" x1="150" y1="78" x2="178" y2="62"/>
    <circle class="joint" cx="150" cy="78" r="3.2"/>
  </g>
"""),
    """
  .arms{animation:arms 4s ease-in-out infinite}
  @keyframes arms{0%,100%{transform:rotate(0)}50%{transform:rotate(78deg)}}
""")

# ---------------------------------------------------------------- cool-down
FILES["cooldown.svg"] = svg(
    "Cool-down: child's pose and slow breathing, exhale longer than you inhale",
    ("134", """
  <g class="breath">
    <line class="f" x1="152" y1="112" x2="110" y2="120"/>
    <circle class="head" cx="94" cy="124" r="9.5"/>
    <line class="l" x1="110" y1="120" x2="70" y2="132"/>
    <line class="l" x1="152" y1="112" x2="172" y2="132"/>
    <line class="l" x1="172" y1="132" x2="200" y2="132"/>
    <circle class="joint" cx="152" cy="112" r="3.2"/>
  </g>
  <circle class="glow" cx="120" cy="112" r="4" fill="none">
    <animate attributeName="r" values="3;16;3" dur="4.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values=".7;0;.7" dur="4.5s" repeatCount="indefinite"/>
  </circle>
"""),
    """
  .breath{animation:breath 4.5s ease-in-out infinite;transform-box:view-box;transform-origin:150px 128px}
  @keyframes breath{0%,100%{transform:scale(1)}50%{transform:scale(1.018)}}
""")

# ---------------------------------------------------------------- extras
FILES["sideplank.svg"] = svg(
    "Side plank: elbow under shoulder, hips lifted, one straight line",
    ("142", """
  <g class="breathe2">
    <line class="f" x1="130" y1="120" x2="196" y2="104"/>
    <line class="l" x1="130" y1="120" x2="86" y2="134"/>
    <line class="l" x1="196" y1="104" x2="192" y2="140"/>
    <circle class="head" cx="212" cy="99" r="9.5"/>
    <line class="l" x1="196" y1="104" x2="200" y2="70"/>
    <circle class="joint" cx="130" cy="120" r="3.4"/>
    <circle class="joint" cx="196" cy="104" r="3.4"/>
    <line class="ghost" x1="88" y1="135" x2="208" y2="100"/>
  </g>
"""),
    """
  .breathe2{animation:breathe2 3.4s ease-in-out infinite;transform-box:view-box}
  @keyframes breathe2{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
""")

FILES["glutebridge.svg"] = svg(
    "Glute bridge: heels down, lift the hips, squeeze, lower slowly",
    ("134", """
  <line class="f" x1="96" y1="120" x2="150" y2="118"/>
  <circle class="head" cx="78" cy="118" r="9.5"/>
  <line class="l" x1="96" y1="120" x2="72" y2="130"/>
  <g data-o="1" style="transform-origin:150px 118px" class="hips">
    <line class="l" x1="150" y1="118" x2="186" y2="104"/>
    <line class="l" x1="186" y1="104" x2="204" y2="130"/>
    <circle class="joint" cx="186" cy="104" r="3.2"/>
  </g>
"""),
    """
  .hips{animation:hips 3.6s ease-in-out infinite}
  @keyframes hips{0%,100%{transform:rotate(6deg)}50%{transform:rotate(-12deg)}}
""")

FILES["superman.svg"] = svg(
    "Superman: lie face down, lift the opposite arm and leg, keep the neck long",
    ("134", """
  <line class="f" x1="96" y1="120" x2="186" y2="120"/>
  <circle class="head" cx="78" cy="116" r="9.5"/>
  <g data-o="1" style="transform-origin:100px 120px" class="armS">
    <line class="l" x1="100" y1="120" x2="64" y2="124"/>
  </g>
  <g data-o="1" style="transform-origin:182px 120px" class="legS">
    <line class="l" x1="182" y1="120" x2="224" y2="124"/>
  </g>
  <circle class="joint" cx="182" cy="120" r="3.2"/>
"""),
    """
  .armS{animation:armS 3.8s ease-in-out infinite}
  .legS{animation:legS 3.8s ease-in-out infinite}
  @keyframes armS{0%,100%{transform:rotate(0)}50%{transform:rotate(11deg)}}
  @keyframes legS{0%,100%{transform:rotate(0)}50%{transform:rotate(-11deg)}}
""")


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, content in FILES.items():
        path = os.path.join(OUT, name)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)
        print("wrote", path, len(content), "bytes")


if __name__ == "__main__":
    main()
