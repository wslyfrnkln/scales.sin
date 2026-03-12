# Scales.sin — Project Tracker

SinAudio | sinaudio.co | Est. 2026-02-20
**Updated:** 2026-03-06

---

## Overview

Music theory tools for producers. PWA (vanilla HTML/CSS/JS, zero deps), future native iOS app.

**Repo:** github.com/wslyfrnkln/scales.sin (public)
**Live:** wslyfrnkln.github.io/scales.sin/
**Domain:** sinaudio.co (Cloudflare, $26/yr)

---

## Roadmap

### Phase 1 — PWA Product ✅
_Unify tools into a branded, installable PWA_

- [x] index.html — home screen + nav
- [x] manifest.json + sw.js — offline PWA
- [x] Icons — 192px + 512px (SVG + PNG)
- [x] Scale Visualizer — guitar fretboard + 2-octave piano, 7 scales/modes
- [x] Voice Leading — smart voicing, major + natural minor
- [x] Git repo + deploy key on Javelin
- [x] GitHub Pages enabled (source files moved to root)
- [ ] Browser QA (console errors, Safari/iOS)
- [ ] iOS home screen install test

### Phase 2 — Content Expansion (In Progress)
_Expand chord/scale coverage, add new tools_

- [x] **Chord Progressions page** — CSS piano keyboard (3 octave, C3-C6)
- [x] 4-bar chord card system with manual root/type selection
- [x] Grip detection — all valid grip decompositions per chord with cycling
- [x] Bass note (blue) + grip shape (orange) keyboard highlighting
- [x] Grip repeats across all octaves on keyboard
- [x] Theory-based suggestion engine:
  - Harmonic tendencies (Kostka/Payne common-practice)
  - Secondary dominants + ii-V setups
  - Tritone substitutions
  - Modal interchange (parallel minor/major borrowing)
  - Harmonic minor (V7, vii°7)
  - Auto-extends to 9ths (min9, maj9, dom9)
  - Grip reharmonizations (existing grip over new bass)
  - Scoring: tendency strength, root motion (P4/P5), common tones, variety
- [x] Dynamic suggest button (adapts to empty slot count)
- [ ] Audio playback via Web Audio API
- [ ] Harmonic Minor + Melodic Minor in voice leading
- [ ] Pentatonic scales in scale viz
- [ ] Bass guitar view (4-string)
- [ ] Loop Breaker mode (suggest substitutions for stuck 2-bar loops)
- [ ] **Style-aware progression generation** — click style prog button → keep bar 1 as tonic anchor → resolve degrees against keyRoot → fill bars 2–4 → renderCards(). Needs: degree resolver (bVImaj9 → semitone + CHORD_TYPES key), suffix→CHORD_TYPES mapping, click handler on .style-prog-btn

### Phase 3 — Native iOS App
_SwiftUI rebuild for App Store_

- [ ] Architecture design (each tool = SwiftUI View)
- [ ] SwiftUI fretboard + piano keyboard components
- [ ] Voice leading engine ported to Swift
- [ ] App Store submission
- Model recommendation: claude-opus-4-6

### Phase 4 — Scales.sin Suite
_Full music theory toolkit_

- [ ] Ear training tool
- [ ] Interval recognition
- [ ] Rhythm/groove trainer
- [ ] Circle of fifths interactive

---

## File Structure

```
Scales.sin App/
├── index.html                  ← PWA home screen (3 tool cards)
├── scale_viz_v5.html           ← Scale Visualizer (guitar + piano)
├── chord_voice_leading.html    ← Voice Leading trainer
├── chord_progressions.html     ← Chord Progressions + grip system
├── music_theory_ground_truth.js← Theory reference (60KB, 444 tests)
├── test_theory.html            ← Theory validation suite
├── manifest.json               ← PWA manifest
├── sw.js                       ← Service worker (cache v3)
├── Assets/Icons/               ← PWA icons (192+512, SVG+PNG)
├── PROJECT_TRACKER.md          ← This file
└── JAVELIN_PROMPT.txt          ← Original build brief
```

---

## Design System

**Colors:**
- BG: `#1a1814` / `#242018` / `#2a2520`
- Text: `#f5f0e8` / `#a89f94`
- Accent: `#e85d4c`
- Scale degrees: red → orange → gold → green → blue → purple → magenta
- Chord Progressions: grip=orange (`--deg-2`), bass=blue (`--deg-5`)

**Fonts:** Instrument Serif (headings) | JetBrains Mono (labels) | DM Sans (body)

---

## Change Log

| Date | Change |
|------|--------|
| 2026-03-06 | Chord Progressions page: CSS keyboard, 4-bar cards, grip system, theory-based suggestions |
| 2026-03-06 | GitHub Pages enabled, source files moved to repo root |
| 2026-02-21 | Git deploy key, SVG icon fix, SW cache v2, PNG assets |
| 2026-02-20 | Phase 1 complete: PWA shell, scale viz + piano, voice leading + minor |
| 2026-02-20 | Project initialized, PWA strategy decided |

---

## Model Usage

| Date | Model | Task |
|------|-------|------|
| 2026-03-06 | claude-opus-4-6 (Javelin) | Chord Progressions page, CSS keyboard, grip system, theory engine |
| 2026-02-21 | claude-sonnet-4-6 (Javelin) | Git deploy, icon fix, SW cache |
| 2026-02-20 | claude-sonnet-4-6 | Project assessment, planning, onboarding |
| 2026-02-20 | claude-haiku-4-5 | Codebase exploration (subagent) |
