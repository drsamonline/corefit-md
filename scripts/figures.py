#!/usr/bin/env python3
"""Generate the offline demonstration figures.

Drawn here rather than cut from the source videos: the clips are other people's
footage, and a still frame of a presenter is a poor form guide. These are a few
kilobytes each, stay sharp at any size, loop forever, honour
prefers-reduced-motion, and need no network at all.

Drawing rules, so the set reads as one family:
  • two-tone body — near limbs in bone, far limbs dimmed, which is what gives
    the pose depth at a glance
  • the limb that is actually moving is drawn in signal orange
  • a soft ground shadow, a dashed reference line, and a dashed motion arrow
  • consistent scale: the figure is ~115 px tall inside a 320×180 frame

    python3 scripts/figures.py
"""
import os

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs", "play", "assets", "demo")

BONE = "#eaf5ef"      # near limbs
DIM = "#6f9488"       # far limbs
SIGNAL = "#ff7a45"    # the limb in motion
MAT = "#2f5e52"
SHADOW = "#000000"

STYLE = """
  .near{fill:none;stroke:%(bone)s;stroke-width:7.5;stroke-linecap:round;stroke-linejoin:round}
  .far{fill:none;stroke:%(dim)s;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;opacity:.85}
  .move{fill:none;stroke:%(signal)s;stroke-width:7.5;stroke-linecap:round;stroke-linejoin:round}
  .torso{fill:%(bone)s;stroke:none}
  .torsofar{fill:%(dim)s;stroke:none;opacity:.9}
  .head{fill:%(bone)s;stroke:none}
  .headfar{fill:%(dim)s;stroke:none;opacity:.9}
  .mat{stroke:%(mat)s;stroke-width:2.5;stroke-linecap:round}
  .shadow{fill:%(shadow)s;opacity:.32}
  .ref{fill:none;stroke:%(dim)s;stroke-width:2.4;stroke-linecap:round;stroke-dasharray:4 7;opacity:.75}
  .arc{fill:none;stroke:%(signal)s;stroke-width:2.4;stroke-linecap:round;stroke-dasharray:5 6;opacity:.8}
  .glow{fill:none;stroke:%(signal)s;stroke-width:3;stroke-linecap:round;opacity:.8}
  g[data-o]{transform-box:view-box}
  @media (prefers-reduced-motion: reduce){ *{animation:none !important} }
""" % {"bone": BONE, "dim": DIM, "signal": SIGNAL, "mat": MAT, "shadow": SHADOW}

MARKER = """
  <defs>
    <marker id="a" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M1 1 L8 5 L1 9" fill="none" stroke="%s" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
    <radialGradient id="pool" cx="50%%" cy="50%%" r="50%%">
      <stop offset="0" stop-color="%s" stop-opacity=".16"/>
      <stop offset="1" stop-color="%s" stop-opacity="0"/>
    </radialGradient>
  </defs>
""" % (SIGNAL, SIGNAL, SIGNAL)


def svg(title, mat_y, body, extra_css="", pool=None):
    """pool = (cx, cy, rx, ry) for the soft light behind the figure."""
    glow = ""
    if pool:
        cx, cy, rx, ry = pool
        glow = '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="url(#pool)"/>\n' % (cx, cy, rx, ry)
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="320" height="180" '
        'role="img" aria-label="%s">\n'
        '<title>%s</title>\n'
        '%s\n'
        '<style>%s%s</style>\n'
        '%s'
        '<line class="mat" x1="26" y1="%s" x2="294" y2="%s"/>\n'
        '<g transform="translate(160 %s) scale(1.1) translate(-160 -%s)">\n%s\n</g>\n</svg>\n'
    ) % (title, title, MARKER, STYLE, extra_css, glow, mat_y, mat_y, mat_y, mat_y, body)


FILES = {}

# ------------------------------------------------------------------ plank
FILES["plank.svg"] = svg(
    "Forearm plank: elbows under shoulders, one straight line from head to heels", 140, """
  <ellipse class="shadow" cx="122" cy="142" rx="86" ry="4"/>
  <g class="breathe">
    <path class="torso" d="M120 127 L176 111 L180 121 L124 137 Z"/>
    <line class="far" x1="118" y1="130" x2="84" y2="135"/>
    <line class="far" x1="84" y1="135" x2="50" y2="140"/>
    <line class="near" x1="121" y1="127" x2="86" y2="132"/>
    <line class="near" x1="86" y1="132" x2="52" y2="137"/>
    <line class="far" x1="174" y1="114" x2="169" y2="140"/>
    <line class="far" x1="169" y1="140" x2="192" y2="140"/>
    <line class="near" x1="178" y1="113" x2="174" y2="139"/>
    <line class="near" x1="174" y1="139" x2="200" y2="139"/>
    <line class="near" x1="180" y1="110" x2="190" y2="105" stroke-width="5"/>
    <circle class="head" cx="199" cy="101" r="8.5"/>
    <line class="ref" x1="56" y1="138" x2="196" y2="103"/>
  </g>
  <path class="glow" d="M130 133 q12 -5 24 -3">
    <animate attributeName="opacity" values=".15;.9;.15" dur="3.4s" repeatCount="indefinite"/>
  </path>
""",
    """
  .breathe{animation:breathe 3.4s ease-in-out infinite;transform-box:view-box}
  @keyframes breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
""",
    pool=(150, 118, 130, 56))

# ------------------------------------------------------------------ dead bug
FILES["deadbug.svg"] = svg(
    "Dead bug: the opposite arm and leg lower slowly while the low back stays flat", 130, """
  <ellipse class="shadow" cx="130" cy="132" rx="80" ry="3.5"/>
  <path class="torso" d="M78 118 L152 120 L152 128 L78 126 Z"/>
  <line class="far" x1="82" y1="119" x2="88" y2="88"/>
  <line class="far" x1="148" y1="126" x2="172" y2="100"/>
  <line class="far" x1="172" y1="100" x2="198" y2="100"/>
  <line class="near" x1="78" y1="124" x2="120" y2="128"/>
  <g data-o="1" style="transform-origin:86px 119px" class="armUp">
    <line class="move" x1="86" y1="119" x2="94" y2="84"/>
  </g>
  <g data-o="1" style="transform-origin:152px 123px" class="legOut">
    <line class="move" x1="152" y1="123" x2="178" y2="94"/>
    <line class="move" x1="178" y1="94" x2="206" y2="94"/>
  </g>
  <line class="near" x1="78" y1="121" x2="68" y2="117" stroke-width="5"/>
  <circle class="head" cx="58" cy="115" r="8.5"/>
  <path class="arc" d="M104 82 q14 -8 26 -2" marker-end="url(#a)">
    <animate attributeName="opacity" values="0;.9;0" dur="4.4s" repeatCount="indefinite"/>
  </path>
""",
    """
  .armUp{animation:arm 4.4s ease-in-out infinite}
  .legOut{animation:leg 4.4s ease-in-out infinite}
  @keyframes arm{0%,22%{transform:rotate(0)}46%,66%{transform:rotate(-56deg)}88%,100%{transform:rotate(0)}}
  @keyframes leg{0%,22%{transform:rotate(0)}46%,66%{transform:rotate(44deg)}88%,100%{transform:rotate(0)}}
""",
    pool=(140, 110, 120, 52))

# ------------------------------------------------------------------ bird dog
FILES["birddog.svg"] = svg(
    "Bird dog: opposite arm and leg reach long while the hips stay level", 140, """
  <ellipse class="shadow" cx="160" cy="142" rx="78" ry="3.5"/>
  <path class="torso" d="M118 106 L198 106 L198 118 L118 118 Z"/>
  <line class="far" x1="196" y1="114" x2="200" y2="140"/>
  <line class="far" x1="120" y1="114" x2="114" y2="140"/>
  <line class="near" x1="198" y1="112" x2="204" y2="140"/>
  <line class="near" x1="118" y1="112" x2="112" y2="140"/>
  <g data-o="1" style="transform-origin:197px 110px" class="armR">
    <line class="move" x1="197" y1="110" x2="210" y2="138"/>
  </g>
  <g data-o="1" style="transform-origin:119px 110px" class="legR">
    <line class="move" x1="119" y1="110" x2="110" y2="138"/>
  </g>
  <line class="near" x1="198" y1="108" x2="208" y2="104" stroke-width="5"/>
  <circle class="head" cx="217" cy="101" r="8.5"/>
  <line class="ref" x1="116" y1="106" x2="204" y2="106"/>
  <path class="arc" d="M214 126 q16 -4 22 -18" marker-end="url(#a)">
    <animate attributeName="opacity" values="0;.9;0" dur="4s" repeatCount="indefinite"/>
  </path>
""",
    """
  .armR{animation:armR 4s ease-in-out infinite}
  .legR{animation:legR 4s ease-in-out infinite}
  @keyframes armR{0%,18%{transform:rotate(0)}44%,62%{transform:rotate(-86deg)}86%,100%{transform:rotate(0)}}
  @keyframes legR{0%,18%{transform:rotate(0)}44%,62%{transform:rotate(86deg)}86%,100%{transform:rotate(0)}}
""",
    pool=(160, 112, 120, 50))

# ------------------------------------------------------------------ bicycle
FILES["bicycle.svg"] = svg(
    "Bicycle crunch: rotate from the ribs and alternate elbow toward the opposite knee", 130, """
  <ellipse class="shadow" cx="126" cy="132" rx="78" ry="3.5"/>
  <path class="torso" d="M84 104 L158 116 L156 124 L82 112 Z"/>
  <line class="far" x1="86" y1="106" x2="100" y2="88"/>
  <line class="far" x1="156" y1="122" x2="140" y2="96"/>
  <line class="far" x1="140" y1="96" x2="150" y2="72"/>
  <g data-o="1" style="transform-origin:88px 108px" class="elbow">
    <line class="near" x1="88" y1="108" x2="102" y2="88"/>
  </g>
  <g data-o="1" style="transform-origin:158px 120px" class="legA">
    <line class="move" x1="158" y1="120" x2="188" y2="94"/>
    <line class="move" x1="188" y1="94" x2="216" y2="108"/>
  </g>
  <line class="near" x1="84" y1="108" x2="74" y2="104" stroke-width="5"/>
  <circle class="head" cx="64" cy="101" r="8.5"/>
  <path class="arc" d="M198 118 q16 -2 22 -12" marker-end="url(#a)">
    <animate attributeName="opacity" values="0;.9;0" dur="3.4s" repeatCount="indefinite"/>
  </path>
""",
    """
  .legA{animation:legA 3.4s ease-in-out infinite}
  .elbow{animation:elbow 3.4s ease-in-out infinite}
  @keyframes legA{0%,100%{transform:rotate(0)}50%{transform:rotate(-24deg)}}
  @keyframes elbow{0%,100%{transform:rotate(0)}50%{transform:rotate(11deg)}}
""",
    pool=(140, 108, 120, 50))

# ------------------------------------------------------------------ hollow
FILES["hollow.svg"] = svg(
    "Hollow body hold: ribs down, low back flat — a shallow banana, not a deep arch", 132, """
  <ellipse class="shadow" cx="150" cy="134" rx="82" ry="3.5"/>
  <g data-o="1" style="transform-origin:166px 124px" class="rock">
    <path class="torso" d="M96 108 L166 120 L164 128 L94 116 Z"/>
    <line class="far" x1="96" y1="112" x2="54" y2="97"/>
    <line class="far" x1="166" y1="126" x2="196" y2="119"/>
    <line class="far" x1="196" y1="119" x2="224" y2="109"/>
    <line class="near" x1="96" y1="110" x2="50" y2="94"/>
    <line class="near" x1="164" y1="124" x2="196" y2="117"/>
    <line class="near" x1="196" y1="117" x2="226" y2="107"/>
    <line class="near" x1="96" y1="112" x2="86" y2="108" stroke-width="5"/>
    <circle class="head" cx="76" cy="105" r="8.5"/>
    <line class="ref" x1="58" y1="104" x2="214" y2="110"/>
  </g>
  <path class="glow" d="M148 128 q14 -5 28 -2">
    <animate attributeName="opacity" values=".2;1;.2" dur="2.8s" repeatCount="indefinite"/>
  </path>
""",
    """
  .rock{animation:rock 4s ease-in-out infinite}
  @keyframes rock{0%,100%{transform:rotate(2.2deg)}50%{transform:rotate(-2.2deg)}}
""",
    pool=(146, 116, 120, 48))

# ------------------------------------------------------------------ warm-up
FILES["warmup.svg"] = svg(
    "Warm-up: stand tall, roll the shoulders back, then cat-cow and glute bridges", 142, """
  <ellipse class="shadow" cx="152" cy="143" rx="34" ry="3.5"/>
  <path class="torso" d="M145 78 L159 78 L161 112 L143 112 Z"/>
  <line class="far" x1="147" y1="112" x2="142" y2="128"/>
  <line class="far" x1="142" y1="128" x2="140" y2="141"/>
  <line class="near" x1="156" y1="112" x2="162" y2="128"/>
  <line class="near" x1="162" y1="128" x2="164" y2="141"/>
  <g data-o="1" style="transform-origin:152px 80px" class="arms">
    <line class="far" x1="150" y1="80" x2="124" y2="66"/>
    <line class="move" x1="155" y1="80" x2="182" y2="66"/>
  </g>
  <line class="near" x1="152" y1="78" x2="152" y2="68" stroke-width="5"/>
  <circle class="head" cx="152" cy="58" r="8.5"/>
  <path class="arc" d="M188 74 q10 12 2 22" marker-end="url(#a)">
    <animate attributeName="opacity" values="0;.85;0" dur="4s" repeatCount="indefinite"/>
  </path>
""",
    """
  .arms{animation:arms 4s ease-in-out infinite}
  @keyframes arms{0%,100%{transform:rotate(0)}50%{transform:rotate(74deg)}}
""",
    pool=(152, 96, 96, 62))

# ------------------------------------------------------------------ cool-down
FILES["cooldown.svg"] = svg(
    "Cool-down: child's pose and slow breathing — exhale longer than you inhale", 134, """
  <ellipse class="shadow" cx="140" cy="136" rx="70" ry="3.5"/>
  <g class="breath">
    <path class="torso" d="M108 114 L152 106 L156 118 L110 126 Z"/>
    <line class="far" x1="112" y1="120" x2="76" y2="131"/>
    <line class="near" x1="110" y1="117" x2="72" y2="130"/>
    <line class="far" x1="152" y1="116" x2="170" y2="132"/>
    <line class="far" x1="170" y1="132" x2="196" y2="132"/>
    <line class="near" x1="150" y1="110" x2="172" y2="131"/>
    <line class="near" x1="172" y1="131" x2="200" y2="131"/>
    <line class="near" x1="108" y1="114" x2="98" y2="120" stroke-width="5"/>
    <circle class="head" cx="88" cy="123" r="8.5"/>
  </g>
  <circle class="glow" cx="118" cy="110" r="4" fill="none">
    <animate attributeName="r" values="3;15;3" dur="4.6s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values=".7;0;.7" dur="4.6s" repeatCount="indefinite"/>
  </circle>
""",
    """
  .breath{animation:breath 4.6s ease-in-out infinite;transform-box:view-box;transform-origin:150px 130px}
  @keyframes breath{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
""",
    pool=(132, 112, 100, 48))

# ------------------------------------------------------------------ side plank
FILES["sideplank.svg"] = svg(
    "Side plank: elbow under shoulder, hips lifted, one line from head to feet", 142, """
  <ellipse class="shadow" cx="140" cy="144" rx="76" ry="3.5"/>
  <g class="bob">
    <path class="torso" d="M126 114 L192 100 L194 110 L128 124 Z"/>
    <line class="far" x1="128" y1="120" x2="86" y2="134"/>
    <line class="near" x1="126" y1="116" x2="84" y2="131"/>
    <line class="far" x1="190" y1="104" x2="186" y2="140"/>
    <line class="far" x1="186" y1="140" x2="208" y2="140"/>
    <line class="near" x1="192" y1="106" x2="190" y2="139"/>
    <line class="near" x1="190" y1="139" x2="212" y2="139"/>
    <g data-o="1" style="transform-origin:192px 104px" class="upArm">
      <line class="move" x1="192" y1="104" x2="198" y2="70"/>
    </g>
    <line class="near" x1="192" y1="102" x2="202" y2="98" stroke-width="5"/>
    <circle class="head" cx="211" cy="95" r="8.5"/>
    <line class="ref" x1="88" y1="132" x2="206" y2="96"/>
  </g>
  <path class="arc" d="M206 78 q10 4 8 14" marker-end="url(#a)">
    <animate attributeName="opacity" values="0;.85;0" dur="3.6s" repeatCount="indefinite"/>
  </path>
""",
    """
  .bob{animation:bob 3.6s ease-in-out infinite;transform-box:view-box}
  .upArm{animation:upArm 3.6s ease-in-out infinite}
  @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.4px)}}
  @keyframes upArm{0%,100%{transform:rotate(0)}50%{transform:rotate(-5deg)}}
""",
    pool=(150, 110, 116, 50))

# ------------------------------------------------------------------ glute bridge
FILES["glutebridge.svg"] = svg(
    "Glute bridge: heels down, lift the hips, squeeze the glutes, lower slowly", 134, """
  <ellipse class="shadow" cx="150" cy="136" rx="76" ry="3.5"/>
  <g data-o="1" style="transform-origin:92px 126px" class="hips">
    <path class="torso" d="M92 121 L150 103 L152 114 L94 131 Z"/>
    <line class="far" x1="150" y1="110" x2="186" y2="102"/>
    <line class="far" x1="186" y1="102" x2="192" y2="130"/>
    <line class="move" x1="150" y1="107" x2="188" y2="99"/>
    <line class="move" x1="188" y1="99" x2="196" y2="130"/>
    <line class="near" x1="94" y1="126" x2="122" y2="131"/>
  </g>
  <line class="near" x1="92" y1="126" x2="82" y2="124" stroke-width="5"/>
  <circle class="head" cx="72" cy="123" r="8.5"/>
  <path class="arc" d="M164 88 q14 -3 20 7" marker-end="url(#a)">
    <animate attributeName="opacity" values="0;.85;0" dur="3.6s" repeatCount="indefinite"/>
  </path>
""",
    """
  .hips{animation:hips 3.6s ease-in-out infinite}
  @keyframes hips{0%,100%{transform:rotate(3deg)}50%{transform:rotate(-4deg)}}
""",
    pool=(136, 112, 110, 46))

# ------------------------------------------------------------------ superman
FILES["superman.svg"] = svg(
    "Superman: lie face down, lift the opposite arm and leg, keep the neck long", 134, """
  <ellipse class="shadow" cx="146" cy="136" rx="86" ry="3.5"/>
  <path class="torso" d="M96 114 L176 114 L176 124 L96 124 Z"/>
  <g data-o="1" style="transform-origin:100px 119px" class="armS">
    <line class="far" x1="98" y1="122" x2="64" y2="126"/>
    <line class="move" x1="100" y1="116" x2="60" y2="120"/>
  </g>
  <g data-o="1" style="transform-origin:172px 119px" class="legS">
    <line class="far" x1="174" y1="122" x2="216" y2="126"/>
    <line class="move" x1="172" y1="116" x2="218" y2="120"/>
  </g>
  <line class="near" x1="96" y1="116" x2="86" y2="114" stroke-width="5"/>
  <circle class="head" cx="76" cy="113" r="8.5"/>
  <path class="arc" d="M56 112 q-6 -10 2 -16" marker-end="url(#a)">
    <animate attributeName="opacity" values="0;.85;0" dur="3.8s" repeatCount="indefinite"/>
  </path>
""",
    """
  .armS{animation:armS 3.8s ease-in-out infinite}
  .legS{animation:legS 3.8s ease-in-out infinite}
  @keyframes armS{0%,100%{transform:rotate(0)}50%{transform:rotate(15deg)}}
  @keyframes legS{0%,100%{transform:rotate(0)}50%{transform:rotate(-15deg)}}
""",
    pool=(146, 116, 116, 44))


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, content in FILES.items():
        path = os.path.join(OUT, name)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)
        print("wrote", path, len(content), "bytes")


if __name__ == "__main__":
    main()
