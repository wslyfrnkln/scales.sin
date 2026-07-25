#!/usr/bin/env python3
"""
Scales.sin M4L — .amxd device builder.

Generates ScalesChords.amxd programmatically: a Max for Live MIDI Effect whose
patcher JSON is authored here (native live.* UI per D-03) and wrapped in the
unfrozen .amxd envelope reverse-engineered from Ableton's stock
"Max MIDI Effect.amxd":  ampf|4|'mmmm' + meta|4|0 + ptch|len|<patcher JSON + NUL>

The patch is deliberately dumb — all logic lives in bridge/main.js (Node for
Max). Menus send set_* state messages; buttons send bare generate/bridge; Node
outlets 'symbols' (readout), timed 'play' (→ iter → makenote → noteout), and
'error'.

Menu item ORDER must match the index maps in bridge/main.js (ARTISTS, MODES,
QUALITIES) — indices are the contract, display text is cosmetic.

Usage: python3 build_amxd.py   (writes ScalesChords.amxd next to this file)
"""
import json
import struct
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "ScalesChords.amxd"

# ── Menu items (index contract with bridge/main.js) ──────────────────────────
KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
MODES = ["Major", "Minor"]
ARTISTS = ["Frank Ocean", "D'Angelo", "Leon Thomas", "Robert Glasper",
           "Erykah Badu", "Anderson .Paak", "Stevie Wonder", "Herbie Hancock",
           "Thundercat", "Gospel", "J Dilla", "Kendrick", "Mac Miller",
           "Joe Pass", "Ama Lou"]
QUALITIES = ["m7", "maj7", "dom7"]

boxes = []
lines = []



# ── SIN.AUDIO DESIGN LANGUAGE ────────────────────────────────────────────────
# Wes, 2026-07-25: the M4L device should be "a more compact but same design
# idea" as the plugin. M4L cannot host the photographic chassis plate (no image
# fill on live.* objects, and a device is ~170px tall), so the identity carries
# through COLOUR and TYPE instead of artwork: the plugin's Dusk theme — sand
# panel, deep-teal display, terracotta accent — plus the same etched-label
# treatment and the SINAUDIO wordmark.
#
# Values mirror Scales.sin Plugin/Source/UI/LookAndFeel.cpp ThemeId::Dusk.
def rgba(hex_str, a=1.0):
    """'e9e4dc' -> [r, g, b, a] floats, the form Max wants."""
    h = hex_str.lstrip('#')
    return [int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)] + [a]

DUSK_PANEL     = rgba('e9e4dc')          # sand chassis
DUSK_PANEL_DK  = rgba('d8d2c8')          # chassis shadow
DUSK_LCD       = rgba('10333a')          # deep teal display
DUSK_LCD_INK   = rgba('8fd8c8')          # jade readout
DUSK_TEXT      = rgba('22262b')          # panel ink
DUSK_LABEL     = rgba('8a8378')          # etched legend
DUSK_ACCENT    = rgba('d35e36')          # terracotta

def box(oid, **kw):
    b = {"id": f"obj-{oid}"}
    b.update(kw)
    boxes.append({"box": b})
    return f"obj-{oid}"


def line(src, out, dst, inl):
    lines.append({"patchline": {"source": [src, out], "destination": [dst, inl]}})


def newobj(oid, text, x, y, w, n_in, n_out, outlettype=None):
    return box(oid, maxclass="newobj", text=text, numinlets=n_in, numoutlets=n_out,
               outlettype=outlettype if outlettype is not None else [""] * n_out,
               patching_rect=[x, y, w, 22.0])


def live_menu(oid, longname, items, px, py, pw, x, y):
    return box(oid, maxclass="live.menu", numinlets=1, numoutlets=3,
               outlettype=["", "", "float"], parameter_enable=1,
               patching_rect=[x, y, 100.0, 15.0],
               presentation=1, presentation_rect=[px, py, pw, 15.0],
               fontname="Arial Bold", fontsize=9.0,
               # Recessed, not a white chip — same reasoning as the plugin's
               # inset panels ("i dont like the white bubbles").
               bgcolor=DUSK_PANEL_DK, bgcolor2=DUSK_PANEL_DK,
               textcolor=DUSK_TEXT, arrowcolor=DUSK_LABEL,
               bordercolor=[0.0, 0.0, 0.0, 0.22],
               saved_attribute_attributes={"valueof": {
                   "parameter_enum": items,
                   "parameter_longname": longname,
                   "parameter_mmax": len(items) - 1,
                   "parameter_shortname": longname,
                   "parameter_type": 2}})


def live_button(oid, longname, px, py, x, y):
    return box(oid, maxclass="live.button", numinlets=1, numoutlets=1,
               outlettype=["bang"], parameter_enable=1,
               patching_rect=[x, y, 24.0, 24.0],
               presentation=1, presentation_rect=[px, py, 24.0, 24.0],
               bgcolor=DUSK_ACCENT, bgoncolor=DUSK_ACCENT,
               saved_attribute_attributes={"valueof": {
                   "parameter_enum": ["off", "on"],
                   "parameter_longname": longname,
                   "parameter_mmax": 1,
                   "parameter_shortname": longname,
                   "parameter_type": 2}})



def panel(oid, px, py, pw, ph, color, rounded=0.0):
    """A filled presentation rectangle — the device's own surface."""
    return box(oid, maxclass="panel", numinlets=1, numoutlets=0,
               patching_rect=[700.0, 600.0 + oid * 4, pw, ph],
               presentation=1, presentation_rect=[px, py, pw, ph],
               bgcolor=color, bgcolor2=color, bordercolor=[0.0, 0.0, 0.0, 0.18],
               border=1, rounded=rounded, mode=0)

def label(oid, text, px, py, pw=56.0):
    # Etched legend: small, letterspaced, low-contrast — reads as printed ON the
    # panel rather than as a floating UI chip, matching the plugin's
    # etchedLabel treatment.
    return box(oid, maxclass="live.comment", numinlets=1, numoutlets=0,
               patching_rect=[700.0, 20.0 + oid * 24, pw, 18.0],
               presentation=1, presentation_rect=[px, py, pw, 15.0],
               text=text, textjustification=0,
               fontname="Arial Bold", fontsize=8.0,
               textcolor=DUSK_LABEL)


# ── MIDI passthrough ──────────────────────────────────────────────────────────
midiin = newobj(1, "midiin", 40, 20, 40, 1, 1, ["int"])
midiout = newobj(2, "midiout", 40, 700, 47, 1, 0)
line(midiin, 0, midiout, 0)

# ── Node process boot ─────────────────────────────────────────────────────────
# scales_entry.js is a flat shim next to the .amxd — node.script cannot resolve
# subdirectory-relative script args (proven by probe 2026-07-03: bridge/main.js
# as the arg silently never spawns). @autostart 1 boots the process on device
# load; no loadbang chain needed (also probe-proven).
node = newobj(5, "node.script scales_entry.js @autostart 1 @watch 0", 300, 104, 260, 1, 2)
status = newobj(6, "print node-status", 480, 150, 110, 1, 0)
line(node, 1, status, 0)

# ── Response routing ──────────────────────────────────────────────────────────
route = newobj(7, "route symbols play error", 300, 190, 150, 1, 4)
line(node, 0, route, 0)

set_sym = newobj(8, "prepend set", 300, 230, 74, 1, 1)
display = box(15, maxclass="message", text="—", numinlets=2, numoutlets=1,
              outlettype=[""], patching_rect=[300.0, 400.0, 348.0, 22.0],
              presentation=1, presentation_rect=[6.0, 92.0, 348.0, 22.0])
line(route, 0, set_sym, 0)
line(set_sym, 0, display, 1)  # right inlet = set without output... prepend set already forms 'set …'; send to LEFT inlet
lines.pop()
line(set_sym, 0, display, 0)

zl = newobj(9, "zl slice 1", 400, 230, 66, 2, 2)
it = newobj(10, "iter", 420, 270, 40, 1, 1)
mk = newobj(11, "makenote 100 500", 420, 310, 110, 3, 2, ["int", "int"])
no = newobj(12, "noteout", 420, 350, 50, 3, 0)
line(route, 1, zl, 0)
line(zl, 1, it, 0)
line(it, 0, mk, 0)
line(mk, 0, no, 0)
line(mk, 1, no, 1)

set_err = newobj(13, "prepend set", 560, 230, 74, 1, 1)
perr = newobj(14, "print scales-error", 560, 310, 110, 1, 0)
line(route, 2, set_err, 0)
line(set_err, 0, display, 0)
line(route, 2, perr, 0)

# ── UI: menus → set_* prepends → node; buttons → bare messages → node ─────────
UI = [  # (menu_id, prep_id, longname, items, pres_x, pres_y, pres_w, set_msg)
    (20, 21, "Key",    KEYS,      6.0, 16.0,  56.0, "set_key"),
    (22, 23, "Mode",   MODES,     68.0, 16.0, 56.0, "set_mode"),
    (24, 25, "Artist", ARTISTS,   130.0, 16.0, 120.0, "set_artist"),
    (28, 29, "Root A", KEYS,      6.0, 58.0,  56.0, "set_rootA"),
    (30, 31, "Qual A", QUALITIES, 68.0, 58.0, 56.0, "set_qualA"),
    (32, 33, "Root B", KEYS,      130.0, 58.0, 56.0, "set_rootB"),
    (34, 35, "Qual B", QUALITIES, 192.0, 58.0, 56.0, "set_qualB"),
]
for i, (mid, pid, longname, items, px, py, pw, setmsg) in enumerate(UI):
    m = live_menu(mid, longname, items, px, py, pw, 40 + i * 130, 480)
    p = newobj(pid, f"prepend {setmsg}", 40 + i * 130, 520, 100, 1, 1)
    line(m, 0, p, 0)
    line(p, 0, node, 0)

gen_btn = live_button(26, "Generate", 260.0, 12.0, 40, 560)
gen_msg = box(27, maxclass="message", text="generate", numinlets=2, numoutlets=1,
              outlettype=[""], patching_rect=[40.0, 600.0, 60.0, 22.0])
line(gen_btn, 0, gen_msg, 0)
line(gen_msg, 0, node, 0)

br_btn = live_button(36, "Bridge", 260.0, 56.0, 170, 560)
br_msg = box(37, maxclass="message", text="bridge", numinlets=2, numoutlets=1,
             outlettype=[""], patching_rect=[170.0, 600.0, 48.0, 22.0])
line(br_btn, 0, br_msg, 0)
line(br_msg, 0, node, 0)

# ── Labels (presentation only) ────────────────────────────────────────────────
# ── Device surface (drawn first so controls layer on top) ────────────────────
panel(60, 0.0, 0.0, 380.0, 169.0, DUSK_PANEL)          # sand chassis
panel(61, 0.0, 84.0, 380.0, 40.0, DUSK_LCD, 4.0)       # deep-teal display band

label(40, "Key", 6.0, 2.0)
label(41, "Mode", 68.0, 2.0)
label(42, "Artist", 130.0, 2.0)
label(43, "Generate", 288.0, 16.0, 60.0)
label(44, "Root A", 6.0, 44.0)
label(45, "Qual A", 68.0, 44.0)
label(46, "Root B", 130.0, 44.0)
label(47, "Qual B", 192.0, 44.0)
label(48, "Bridge", 288.0, 60.0, 60.0)
label(49, "SCALES.SIN", 254.0, 128.0, 100.0)
label(50, "SINAUDIO", 254.0, 142.0, 100.0)

# ── Patcher (skeleton values copied from Ableton's stock Max MIDI Effect) ─────
patcher = {
    "patcher": {
        "fileversion": 1,
        "appversion": {"major": 8, "minor": 1, "revision": 2,
                       "architecture": "x64", "modernui": 1},
        "classnamespace": "box",
        "rect": [65.0, 129.0, 980.0, 780.0],
        "openrect": [0.0, 0.0, 380.0, 169.0],
        "bglocked": 0,
        "openinpresentation": 1,
        "default_fontsize": 10.0,
        "default_fontface": 0,
        "default_fontname": "Arial Bold",
        "gridonopen": 1,
        "gridsize": [8.0, 8.0],
        "gridsnaponopen": 1,
        "objectsnaponopen": 1,
        "statusbarvisible": 2,
        "toolbarvisible": 1,
        "lefttoolbarpinned": 0,
        "toptoolbarpinned": 0,
        "righttoolbarpinned": 0,
        "bottomtoolbarpinned": 0,
        "toolbars_unpinned_last_save": 0,
        "tallnewobj": 0,
        "boxanimatetime": 500,
        "enablehscroll": 1,
        "enablevscroll": 1,
        "devicewidth": 380.0,
        "description": "",
        "digest": "",
        "tags": "",
        "style": "",
        "subpatcher_template": "",
        "title": "Scales.sin Chords",
        "boxes": boxes,
        "lines": lines,
        "dependency_cache": [],
        "latency": 0,
        "project": {
            "version": 1,
            "creationdate": 3590052786,
            "modificationdate": 3590052786,
            "viewrect": [0.0, 0.0, 300.0, 500.0],
            "autoorganize": 1,
            "hideprojectwindow": 1,
            "showdependencies": 1,
            "autolocalize": 0,
            "contents": {"patchers": {}},
            "layout": {},
            "searchpath": {},
            "detailsvisible": 0,
            "amxdtype": 1835887981,
            "readonly": 0,
            "devpathtype": 0,
            "devpath": ".",
            "sortmode": 0,
            "viewmode": 0,
        },
        "autosave": 0,
    }
}


def lint(p):
    """Structural checks: unique ids, line endpoints exist, port indices in range."""
    errs = []
    info = {}
    for b in p["patcher"]["boxes"]:
        bb = b["box"]
        if bb["id"] in info:
            errs.append(f"duplicate id {bb['id']}")
        info[bb["id"]] = (bb.get("numinlets", 1), bb.get("numoutlets", 0))
    for l in p["patcher"]["lines"]:
        pl = l["patchline"]
        (src, out), (dst, inl) = pl["source"], pl["destination"]
        if src not in info:
            errs.append(f"line from unknown {src}")
        elif out >= info[src][1]:
            errs.append(f"{src} outlet {out} >= numoutlets {info[src][1]}")
        if dst not in info:
            errs.append(f"line to unknown {dst}")
        elif inl >= info[dst][0]:
            errs.append(f"{dst} inlet {inl} >= numinlets {info[dst][0]}")
    return errs


def pack_amxd(patcher_dict):
    js = json.dumps(patcher_dict, indent=1).encode() + b"\x00"
    out = b"ampf" + struct.pack("<I", 4) + b"mmmm"
    out += b"meta" + struct.pack("<I", 4) + struct.pack("<I", 0)
    out += b"ptch" + struct.pack("<I", len(js)) + js
    return out


if __name__ == "__main__":
    errors = lint(patcher)
    if errors:
        for e in errors:
            print("LINT FAIL:", e)
        sys.exit(1)
    print(f"lint: OK ({len(boxes)} boxes, {len(lines)} lines)")
    OUT.write_bytes(pack_amxd(patcher))
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")
