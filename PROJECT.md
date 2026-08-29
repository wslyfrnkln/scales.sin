# Scales.sin

<!-- judo:status:start -->
## Status
_Auto-stamped by closeout · 2026-07-27 · juniper_

- **Last session:** 2026-07-27 — Unified the plugin and M4L device onto one vocabulary: removed the shadowing dangelo built-in, promoted its 2 unique progressions into artist_vocab.json (107 -> 109), MAX_SHADOWED tightened to 0; Rule-conformance tests on both engines (Tests/test_StyleRules.cpp, m4l/bridge/test_rules.js) read the PROSE rules as source of truth, not the constraints table — found 3 real bugs (Vespers rootless never fired, Haze mistranslated, Maiden false-positive) and 3 flaws in my own test logic; SCALES_RHYTHM_FORM_RULES_PLAN Phases 0-4 shipped: per-style harmonic rhythm (Rhythm.h), sections + repeat modes (Form.h), executable StyleConstraints replacing dead prose rules, anticipation param; Fixed a real shipping bug in MidiRender: onset was clamped only against 0.0, not against noteOff - kMinNoteBeats — 638 malformed notes per 2000 seeds at DEFAULT settings; UI: platter now forwards drag (MIDI clip drag was silently swallowed by SpinningDisc), knob labels moved above the knob onto clear board, LCD position DERIVED from the crop formula so art and overlay can't drift apart again; Git: created private repo wslyfrnkln/scales.sin-plugin and pushed 55+ local-only commits; App repo pushed too
- **Next:** Verify in Ableton: MIDI clip drag out of the platter, FORM/REPEAT audible, knob labels legible on all 5 skins — none of tonight's UI or drag work has been heard or touched in a live session
- **Blocked:** Iadd9 still renders Cmaj9 (needs a true add9 with no 7th) and immaj7 loses its seventh (needs a minorMajor BaseQuality) — both bounded by counted assertions, not fixed
- **Active plan:** none — SCALES_M4L_MVP_PLAN archived (`.planning/archive/SCALES_M4L_MVP_PLAN.md`)
<!-- judo:status:end -->

**Last Updated:** 2026-03-27 05:00
**Status:** Phase 1 — Core Theory Engine | Health: green
**Type:** PWA
**Version:** 0.1 (Pre-Release)
**Company:** SinAudio
**Domain:** sinaudio.co
**Repo:** github.com/wslyfrnkln/scales.sin
**Stack:** Vanilla JS, PWA, Tone.js, iOS (planned)

---

## Brief Description

Music theory PWA combining a scale visualization tool (guitar fretboard + piano) with a chord voice leading exercise tool. Installable on iOS without an App Store account. Phase 3 target is a native SwiftUI rebuild.

---

## Development Roadmap

### Phase 1 — PWA Product
**Goal:** Unify two HTML tools into a branded, installable PWA

**Deliverable:** Installable PWA with both tools rebranded and QA'd across browser + iPhone

- [x] PWA home screen + nav (`index.html`)
- [x] PWA manifest (`manifest.json`)
- [x] Service worker — offline support (`sw.js`)
- [x] PWA icons (192 + 512, SVG)
- [x] Scale viz rebranded + piano view (`scales.sin.html`, renamed from `scale_viz_v5.html`)
- [x] Chord voice leading rebranded + minor scale (`chord_voice_leading.html`)
- [x] Browser QA
- [ ] iPhone install test

### Phase 2 — Content Expansion
**Goal:** Broaden scale and chord coverage, add audio playback

**Deliverable:** Updated PWA with audio, additional scales, bass view, and chord progression builder

- [ ] Audio playback via Web Audio API (click note → hear it)
- [ ] Harmonic Minor + Melodic Minor in voice leading tool
- [ ] Pentatonic scales in scale viz
- [ ] Bass guitar view (4-string, standard tuning)
- [x] Chord progression builder (chord_progressions.html — STYLE_TEMPLATES, EXTENDED_CHORD_TYPES, style filter bar)

### Phase 3 — Native iOS App
**Goal:** Port PWA to native SwiftUI app

**Deliverable:** App Store submission with all Phase 1-2 features as native SwiftUI

- [ ] Architecture design (each tool = SwiftUI View)
- [ ] SwiftUI fretboard component (replaces SVG)
- [ ] SwiftUI piano keyboard component
- [ ] Voice leading engine ported from JS to Swift
- [ ] App Store submission

### Phase 4 — Scales.sin Suite
**Goal:** Expand into a full music theory learning suite

**Deliverable:** Ear training, interval recognition, rhythm trainer, and circle of fifths

- [ ] Ear training tool
- [ ] Interval recognition
- [ ] Rhythm/groove trainer
- [ ] Circle of fifths interactive visualization

---

## Notes

- Original tools built in Opus 4.6 (complex SVG + voicing algorithms).
- Phase 3 native iOS rebuild should use Opus 4.6.
- PWA does not require Apple Developer account — distribute via URL.
- Domain: sinaudio.co (purchased 2026-02-20 via Cloudflare).
- Naming convention: `[Name].sin` for all SinAudio tools.

---

## Design System

### Colors
| Variable | Value | Use |
|----------|-------|-----|
| `--bg-primary` | `#1a1814` | Page background |
| `--bg-secondary` | `#242018` | Section background |
| `--bg-card` | `#2a2520` | Card/panel background |
| `--text-primary` | `#f5f0e8` | Primary text |
| `--text-secondary` | `#a89f94` | Secondary text |

### Scale Degree Colors
| Degree | Color | Hex |
|--------|-------|-----|
| 1 (Root) | Red | `#e85d4c` |
| 2 | Orange | `#e89a4c` |
| 3 | Gold | `#c9a227` |
| 4 | Green | `#7db87d` |
| 5 | Blue | `#4a90a4` |
| 6 | Purple | `#8a6aa4` |
| 7 | Magenta | `#a4586a` |

### Fonts
| Role | Font |
|------|------|
| Headings | Instrument Serif |
| Labels, data, code | JetBrains Mono |
| Body, UI | DM Sans |

## Blockers
<!-- No active blockers -->

## Decisions
<!-- No decisions logged yet -->

## Next Session
<!-- Auto-generated by /checkpoint -->

## Change Log

| Date | Change |
|------|--------|
| 2026-03-02 | Standardized to PROJECT.md template |
| 2026-02-26 | Refactored to PROJECT.md |
| 2026-02-20 | Phase 1 complete — all 9 files pulled from Javelin, piano view + natural minor added |
| 2026-02-20 | Phase 1b in progress — Javelin working on renderPiano() + minor toggle |
| 2026-02-20 | Project initialized, PWA strategy decided, Javelin build brief written |

---


## Notion Tasks
- [x] Audio playback via Web Audio API

## Model Usage

| Date | Model | Task | Est. Tokens |
|------|-------|------|-------------|
| 2026-03-09 | claude-sonnet-4-6 | artist attribution on Extended voicing cards (ext-label + ext-source, guitar + piano) | ~7,000 |
| 2026-03-09 | claude-sonnet-4-6 | voicing_vocabulary.js/json architecture, chord_progressions style templates, test suite Vocabulary Integrity group, wireVocabularyMerge(), sw.js v5, Javelin vocab deploy | ~85,000 |
| 2026-03-08 | claude-sonnet-4-6 | Piano Rootless A/B, voicing toggle fix, persistence fix, VL algorithm, file rename | ~30,000 |
| 2026-03-02 | claude-sonnet-4-6 | PROJECT.md template standardization | ~400 |
| 2026-02-26 | claude-sonnet-4-6 | PROJECT.md refactor | ~300 |
| 2026-02-20 | claude-sonnet-4-6 | Onboarding prompt, sync monitoring | ~2,000 |
| 2026-02-20 | claude-haiku-4-5 | Codebase exploration (subagent) | ~500 |
| 2026-02-20 | claude-sonnet-4-6 | Project assessment + planning | ~2,000 |
