// =============================================================================
// SCALES.SIN — PIANO RENDERER
// Piano-specific: voicing calculation + SVG keyboard draw.
// Imports shared theory from music_theory.js.
// =============================================================================

import {
    CHORD_INTERVALS,
    CYCLE_PATTERNS,
    getChordRoot,
} from './music_theory.js';

// ── Piano voicing types ───────────────────────────────────────────────────────
//
// Each voicing is an array of chord tone indices (0=R, 1=3, 2=5, 3=7)
// ordered from bottom (lowest pitch) to top.
//
// Shell:      3rd + 7th only — no root, no 5th. Minimum jazz voicing.
// Close:      R-3-5-7 stacked in register (root position only for Phase 1).
// Rootless A: 3-5-7-9 (3rd on bottom). Standard jazz piano, omits root.
// Rootless B: 7-9-3-5 (7th on bottom). Inverted rootless, voiced higher.
//
// Voicing label → array of chord tone indices bottom-to-top:

export const PIANO_VOICING_TYPES = {
    shell:      { tones: [1, 3],       label: 'Shell (3-7)',        needsNinth: false },
    close:      { tones: [0, 1, 2, 3], label: 'Close (R-3-5-7)',   needsNinth: false },
    rootlessA:  { tones: [1, 2, 3, 4], label: 'Rootless A (3-7-9)', needsNinth: true  },
    rootlessB:  { tones: [3, 4, 1, 2], label: 'Rootless B (7-9-3)', needsNinth: true  },
};

// ── Ninth intervals (major 9th = 14 semitones from root) ─────────────────────

const NINTH_INTERVALS = {
    maj7:   14,  // major 9th
    min7:   14,  // major 9th (natural 9)
    dom7:   14,  // major 9th
    min7b5: 13,  // minor 9th (b9 is most common on m7b5)
};

// ── Voicing calculation ───────────────────────────────────────────────────────

/**
 * Build a piano voicing for one chord.
 *
 * rootMidi     — MIDI pitch of the root in the target octave (e.g. 48 = C3)
 * chordType    — 'maj7' | 'min7' | 'dom7' | 'min7b5'
 * voicingType  — key of PIANO_VOICING_TYPES
 *
 * Returns: { notes: [{ midi, chordTone }], avgMidi, voicingType }
 * chordTone: 0=R, 1=3, 2=5, 3=7, 4=9
 */
export function buildPianoVoicing(rootMidi, chordType, voicingType) {
    const intervals = CHORD_INTERVALS[chordType];
    const ninth     = NINTH_INTERVALS[chordType];
    const spec      = PIANO_VOICING_TYPES[voicingType];

    // All intervals including 9th: index 0=R, 1=3rd, 2=5th, 3=7th, 4=9th
    const allIntervals = [...intervals, ninth];

    // Build pitches bottom-to-top
    let notes = spec.tones.map(toneIdx => ({
        midi: rootMidi + allIntervals[toneIdx],
        chordTone: toneIdx,
    }));

    // Ensure strict ascending order — if a note is ≤ previous, raise it an octave
    for (let i = 1; i < notes.length; i++) {
        while (notes[i].midi <= notes[i - 1].midi) {
            notes[i] = { ...notes[i], midi: notes[i].midi + 12 };
        }
    }

    const avgMidi = notes.reduce((s, n) => s + n.midi, 0) / notes.length;
    return { notes, avgMidi, voicingType };
}

/**
 * Find the lowest playable voicing (all notes in C3–B5 = MIDI 48–83).
 */
export function findLowestPianoVoicing(rootMidi, chordType, voicingType) {
    const candidates = [];
    for (let octave = -1; octave <= 2; octave++) {
        const v = buildPianoVoicing(rootMidi + octave * 12, chordType, voicingType);
        if (v.notes[0].midi >= 48 && v.notes[v.notes.length - 1].midi <= 83) {
            candidates.push(v);
        }
    }
    if (!candidates.length) return buildPianoVoicing(rootMidi, chordType, voicingType);
    return candidates.sort((a, b) => a.avgMidi - b.avgMidi)[0];
}

/**
 * Find the highest playable voicing within range.
 */
export function findHighestPianoVoicing(rootMidi, chordType, voicingType) {
    const candidates = [];
    for (let octave = -1; octave <= 2; octave++) {
        const v = buildPianoVoicing(rootMidi + octave * 12, chordType, voicingType);
        if (v.notes[0].midi >= 48 && v.notes[v.notes.length - 1].midi <= 83) {
            candidates.push(v);
        }
    }
    if (!candidates.length) return buildPianoVoicing(rootMidi, chordType, voicingType);
    return candidates.sort((a, b) => b.avgMidi - a.avgMidi)[0];
}

/**
 * Find the voice-led voicing — minimise total semitone movement from prevVoicing.
 * Uses Manhattan distance across all note positions (Tymoczko approach).
 */
export function findVoiceledPianoVoicing(rootMidi, chordType, voicingType, prevVoicing, direction) {
    const candidates = [];

    for (let octave = -2; octave <= 3; octave++) {
        const v = buildPianoVoicing(rootMidi + octave * 12, chordType, voicingType);
        if (v.notes[0].midi < 36 || v.notes[v.notes.length - 1].midi > 88) continue;

        // Only compare notes that exist in both voicings (same count)
        const len = Math.min(v.notes.length, prevVoicing.notes.length);
        let totalMovement = 0, maxMove = 0;
        for (let i = 0; i < len; i++) {
            const m = Math.abs(v.notes[i].midi - prevVoicing.notes[i].midi);
            totalMovement += m;
            maxMove = Math.max(maxMove, m);
        }

        const pitchDiff = v.avgMidi - prevVoicing.avgMidi;
        let score = totalMovement * 10;
        if (maxMove > 7) score += (maxMove - 7) * 30;
        if (direction === 'up') {
            if (pitchDiff < -3) score += 30;
            else if (pitchDiff > 0) score -= 2;
        } else {
            if (pitchDiff > 3) score += 30;
            else if (pitchDiff < 0) score -= 2;
        }

        candidates.push({ voicing: v, score });
    }

    if (!candidates.length) return buildPianoVoicing(rootMidi, chordType, voicingType);
    return candidates.sort((a, b) => a.score - b.score)[0].voicing;
}

// ── Row generation ────────────────────────────────────────────────────────────

/**
 * Generate a voice-led piano row.
 *
 * voicingType  — key of PIANO_VOICING_TYPES (e.g. 'shell', 'close')
 * All other args mirror fretboard generateRow signature.
 */
export function generatePianoRow(keyRoot, voicingType, intervalKey, direction, scaleIntervals, chordQualityTypes, chordQualities) {
    const baseCycle = CYCLE_PATTERNS[intervalKey][direction];

    // Pre-compute lowest/highest for start-chord selection
    const allChords = baseCycle.map(degree => {
        const chordRoot = getChordRoot(keyRoot, degree, scaleIntervals);
        const chordType = chordQualityTypes[degree];
        const quality   = chordQualities[degree];
        const rootMidi  = 48 + chordRoot;

        const lowest  = findLowestPianoVoicing(rootMidi, chordType, voicingType);
        const highest = findHighestPianoVoicing(rootMidi, chordType, voicingType);

        return {
            degree, degreeLabel: degree + 1,
            root: chordRoot, chordType, quality, rootMidi,
            lowestVoicing: lowest, highestVoicing: highest,
            lowestAvgMidi:  lowest  ? lowest.avgMidi  : 999,
            highestAvgMidi: highest ? highest.avgMidi : 0,
        };
    });

    const startIdx = direction === 'up'
        ? allChords.reduce((mi, c, i, a) => c.lowestAvgMidi  < a[mi].lowestAvgMidi  ? i : mi, 0)
        : allChords.reduce((mi, c, i, a) => c.highestAvgMidi > a[mi].highestAvgMidi ? i : mi, 0);

    // 10 full cycles for infinite scroll
    const orderedChords = [];
    for (let loop = 0; loop < 10; loop++) {
        for (let i = 0; i < allChords.length; i++) {
            const idx = (startIdx + i) % allChords.length;
            orderedChords.push({ ...allChords[idx], isTonic: allChords[idx].degree === 0 });
        }
    }

    const row = [];
    let prevVoicing = null;

    for (let i = 0; i < orderedChords.length; i++) {
        const chord = orderedChords[i];
        let voicing;

        if (i === 0) {
            voicing = direction === 'up'
                ? findLowestPianoVoicing(chord.rootMidi, chord.chordType, voicingType)
                : findHighestPianoVoicing(chord.rootMidi, chord.chordType, voicingType);
        } else {
            voicing = findVoiceledPianoVoicing(chord.rootMidi, chord.chordType, voicingType, prevVoicing, direction);
        }

        if (!voicing) continue;
        row.push({ voicing, root: chord.root, quality: chord.quality, voicingType, degreeLabel: chord.degreeLabel, isTonic: chord.isTonic });
        prevVoicing = voicing;
    }

    return row;
}

// ── SVG piano keyboard rendering ──────────────────────────────────────────────
//
// Draws a 2-octave keyboard window centered on the voicing.
// White keys: C D E F G A B = 7 per octave
// Black keys: C# D# F# G# A# = 5 per octave
//
// Display range: 2 octaves starting from the C below the lowest note.

const CHORD_TONE_COLORS = {
    0: '#e85d4c',  // Root — red
    1: '#4a90a4',  // 3rd  — blue
    2: '#7db87d',  // 5th  — green
    3: '#c9a227',  // 7th  — gold
    4: '#8a6aa4',  // 9th  — purple
};

// White key offsets within an octave (semitone → white key index 0-6, or null for black key)
const SEMITONE_TO_WHITE = [0, null, 1, null, 2, 3, null, 4, null, 5, null, 6];
// Whether a semitone is a black key
const IS_BLACK = [false, true, false, true, false, false, true, false, true, false, true, false];

const SVG_WIDTH  = 140;
const SVG_HEIGHT = 120;
const WHITE_KEY_W = 14;
const WHITE_KEY_H = 72;
const BLACK_KEY_W = 9;
const BLACK_KEY_H = 44;
const TOP_MARGIN  = 24;  // space for chord tone labels above keys
const NUM_OCTAVES = 2;
const NUM_WHITE   = 7 * NUM_OCTAVES;  // 14 white keys

// Black key x-offset within a white key group (semitone → offset from left of that white key group)
const BLACK_OFFSETS = { 1: 9, 3: 9, 6: 9, 8: 9, 10: 9 };

/**
 * Render an SVG piano keyboard showing the given voicing.
 *
 * voicing   — { notes: [{ midi, chordTone }] }
 * startC    — MIDI number of the lowest C to display (e.g. 48 = C3)
 */
export function createPianoSVG(voicing, startC) {
    // Build a lookup: midi → chordTone for pressed keys
    const pressed = {};
    voicing.notes.forEach(n => { pressed[n.midi] = n.chordTone; });

    const endMidi = startC + NUM_OCTAVES * 12;  // exclusive upper bound

    let svg = `<svg viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">`;

    // ── White keys ──
    let whiteIdx = 0;
    for (let midi = startC; midi < endMidi; midi++) {
        const semitone = midi % 12;
        if (IS_BLACK[semitone]) continue;

        const x = whiteIdx * WHITE_KEY_W;
        const y = TOP_MARGIN;
        const isPressed = pressed[midi] !== undefined;
        const tone = pressed[midi];
        const fill = isPressed ? CHORD_TONE_COLORS[tone] : '#f5f0e8';
        const stroke = '#8a8078';

        svg += `<rect x="${x}" y="${y}" width="${WHITE_KEY_W - 1}" height="${WHITE_KEY_H}" fill="${fill}" stroke="${stroke}" stroke-width="0.75" rx="2"/>`;

        if (isPressed) {
            // Chord tone label at bottom of key
            const label = ['R', '3', '5', '7', '9'][tone];
            svg += `<text x="${x + (WHITE_KEY_W - 1) / 2}" y="${y + WHITE_KEY_H - 6}" font-family="JetBrains Mono, monospace" font-size="7" fill="white" text-anchor="middle" font-weight="600">${label}</text>`;
            // Dot above keys
            svg += `<circle cx="${x + (WHITE_KEY_W - 1) / 2}" cy="${TOP_MARGIN - 8}" r="5" fill="${CHORD_TONE_COLORS[tone]}"/>`;
            svg += `<text x="${x + (WHITE_KEY_W - 1) / 2}" y="${TOP_MARGIN - 5.5}" font-family="JetBrains Mono, monospace" font-size="5" fill="white" text-anchor="middle" font-weight="600">${label}</text>`;
        }

        whiteIdx++;
    }

    // ── Black keys (drawn on top) ──
    whiteIdx = 0;
    for (let midi = startC; midi < endMidi; midi++) {
        const semitone = midi % 12;
        if (!IS_BLACK[semitone]) {
            whiteIdx++;
            continue;
        }

        // Black key sits between previous white key and current white key
        const x = (whiteIdx - 1) * WHITE_KEY_W + WHITE_KEY_W - BLACK_KEY_W / 2 - 1;
        const y = TOP_MARGIN;
        const isPressed = pressed[midi] !== undefined;
        const tone = pressed[midi];
        const fill = isPressed ? CHORD_TONE_COLORS[tone] : '#2a2520';
        const stroke = '#1a1814';

        svg += `<rect x="${x}" y="${y}" width="${BLACK_KEY_W}" height="${BLACK_KEY_H}" fill="${fill}" stroke="${stroke}" stroke-width="0.5" rx="2"/>`;

        if (isPressed) {
            const label = ['R', '3', '5', '7', '9'][tone];
            svg += `<text x="${x + BLACK_KEY_W / 2}" y="${y + BLACK_KEY_H - 5}" font-family="JetBrains Mono, monospace" font-size="6" fill="white" text-anchor="middle" font-weight="600">${label}</text>`;
            svg += `<circle cx="${x + BLACK_KEY_W / 2}" cy="${TOP_MARGIN - 8}" r="5" fill="${CHORD_TONE_COLORS[tone]}"/>`;
            svg += `<text x="${x + BLACK_KEY_W / 2}" y="${TOP_MARGIN - 5.5}" font-family="JetBrains Mono, monospace" font-size="5" fill="white" text-anchor="middle" font-weight="600">${label}</text>`;
        }
    }

    // ── Octave label ──
    const octaveNum = Math.floor(startC / 12) - 1;
    svg += `<text x="2" y="${TOP_MARGIN + WHITE_KEY_H + 12}" font-family="JetBrains Mono, monospace" font-size="7" fill="#a89f94">C${octaveNum}</text>`;
    svg += `<text x="${7 * WHITE_KEY_W + 2}" y="${TOP_MARGIN + WHITE_KEY_H + 12}" font-family="JetBrains Mono, monospace" font-size="7" fill="#a89f94">C${octaveNum + 1}</text>`;

    svg += '</svg>';
    return svg;
}

/**
 * Choose the display start C (lowest C in the 2-octave window) for a voicing.
 * Centers the window on the voicing's lowest note.
 */
export function getDisplayStartC(voicing) {
    const lowestMidi = Math.min(...voicing.notes.map(n => n.midi));
    // Find the C at or below the lowest note
    const lowestC = lowestMidi - (lowestMidi % 12);
    // Clamp so display stays in a sensible range (C2=36 to C5=60 as start)
    return Math.max(36, Math.min(60, lowestC));
}
