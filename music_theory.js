// =============================================================================
// SCALES.SIN — MUSIC THEORY ENGINE
// Shared module for chord_voice_leading.html and scale_viz_v5.html
// Import via: <script type="module"> … import { … } from './music_theory.js'
// Must be served over HTTP (not file://) — ES module requirement.
// =============================================================================

// ── Note names ───────────────────────────────────────────────────────────────

export const NOTE_NAMES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export const NOTE_NAMES_FLAT  = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

/** Root MIDI pitch classes that use flat spellings (F Bb Eb Ab Db Gb) */
export const FLAT_KEYS = [5, 10, 3, 8, 1, 6];

export function getNoteName(noteIndex, useFlats) {
    const idx = ((noteIndex % 12) + 12) % 12;
    return useFlats ? NOTE_NAMES_FLAT[idx] : NOTE_NAMES_SHARP[idx];
}

// ── Scale intervals ───────────────────────────────────────────────────────────

export const SCALE_INTERVALS_MAJOR = [0, 2, 4, 5, 7, 9, 11];
export const SCALE_INTERVALS_MINOR = [0, 2, 3, 5, 7, 8, 10];

// ── Chord qualities ───────────────────────────────────────────────────────────

export const CHORD_QUALITIES_MAJOR      = ['Maj7', 'm7', 'm7', 'Maj7', '7', 'm7', 'm7♭5'];
export const CHORD_QUALITY_TYPES_MAJOR  = ['maj7', 'min7', 'min7', 'maj7', 'dom7', 'min7', 'min7b5'];

export const CHORD_QUALITIES_MINOR      = ['m7', 'm7♭5', 'Maj7', 'm7', 'm7', 'Maj7', '7'];
export const CHORD_QUALITY_TYPES_MINOR  = ['min7', 'min7b5', 'maj7', 'min7', 'min7', 'maj7', 'dom7'];

// ── Triad qualities ───────────────────────────────────────────────────────────

export const TRIAD_QUALITIES_MAJOR      = ['', 'm', 'm', '', '', 'm', '°'];
export const TRIAD_QUALITY_TYPES_MAJOR  = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];

export const TRIAD_QUALITIES_MINOR      = ['m', '°', '', 'm', 'm', '', ''];
export const TRIAD_QUALITY_TYPES_MINOR  = ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'];

// ── Chord intervals (semitones from root) ─────────────────────────────────────

export const CHORD_INTERVALS = {
    maj7:    [0, 4, 7, 11],
    min7:    [0, 3, 7, 10],
    dom7:    [0, 4, 7, 10],
    min7b5:  [0, 3, 6, 10],
};

export const TRIAD_INTERVALS = {
    maj: [0, 4, 7],
    min: [0, 3, 7],
    dim: [0, 3, 6],
};

// ── Drop voicing inversion tables ─────────────────────────────────────────────
//
// Each array is indexed by string position (0 = bass), value = chord tone index
// (0 = R, 1 = 3rd, 2 = 5th, 3 = 7th).
//
// Drop 2: 2nd voice from top dropped one octave. Adjacent string sets.
// Drop 3: 3rd voice from top dropped one octave. Non-adjacent string sets
//         (one string is muted between bass and upper voices).

export const DROP2_INVERSIONS = {
    root: [0, 2, 3, 1],   // R-5-7-3
    '1st': [1, 3, 0, 2],  // 3-7-R-5
    '2nd': [2, 0, 1, 3],  // 5-R-3-7
    '3rd': [3, 1, 2, 0],  // 7-3-5-R
};

export const DROP3_INVERSIONS = {
    root:  [2, 0, 3, 1],  // 5-R-7-3  (5th dropped to bass)
    '1st': [3, 1, 0, 2],  // 7-3-R-5  (7th dropped to bass)
    '2nd': [0, 2, 1, 3],  // R-5-3-7  (Root dropped to bass)
    '3rd': [1, 3, 2, 0],  // 3-7-5-R  (3rd dropped to bass)
};

// Triad inversions (close voicing on 3 adjacent strings)
export const TRIAD_INVERSIONS = {
    root:  [0, 1, 2],  // R-3-5
    '1st': [1, 2, 0],  // 3-5-R
    '2nd': [2, 0, 1],  // 5-R-3
};

// ── Cycle patterns ────────────────────────────────────────────────────────────
//
// Scale degree sequences (0-indexed) for each interval direction.
// down = descending by interval, up = ascending by interval.

export const CYCLE_PATTERNS = {
    '4': {
        down: [0, 3, 6, 2, 5, 1, 4],  // Down by 4ths: I-IV-vii-iii-vi-ii-V
        up:   [0, 4, 1, 5, 2, 6, 3],  // Up by 5ths:   I-V-ii-vi-iii-vii-IV
    },
    '5': {
        down: [0, 4, 1, 5, 2, 6, 3],  // Down by 5ths
        up:   [0, 3, 6, 2, 5, 1, 4],  // Up by 4ths
    },
    '3': {
        down: [0, 5, 3, 1, 6, 4, 2],  // Down by 3rds: I-vi-IV-ii-vii-V-iii
        up:   [0, 2, 4, 6, 1, 3, 5],  // Up by 3rds:   I-iii-V-vii-ii-IV-vi
    },
    '6': {
        down: [0, 2, 4, 6, 1, 3, 5],  // Down by 6ths
        up:   [0, 5, 3, 1, 6, 4, 2],  // Up by 6ths
    },
    '2': {
        down: [0, 6, 5, 4, 3, 2, 1],  // Down by 2nds
        up:   [0, 1, 2, 3, 4, 5, 6],  // Up by 2nds
    },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the MIDI pitch class of scale degree `scaleDegree` above `keyRoot`. */
export function getChordRoot(keyRoot, scaleDegree, scaleIntervals) {
    return (keyRoot + scaleIntervals[scaleDegree]) % 12;
}

/** Format a 7th chord name with superscript quality suffix. */
export function formatChordName(noteName, quality) {
    const map = {
        'Maj7': '<sup>Maj7</sup>',
        'm7':   '<sup>m7</sup>',
        '7':    '<sup>7</sup>',
        'm7♭5': '<sup>m7♭5</sup>',
    };
    return noteName + (map[quality] || quality);
}

/** Format a triad name (no superscript needed for simple triad suffix). */
export function formatTriadName(noteName, quality) {
    return noteName + quality;
}

/** Convert a 1-indexed scale degree number to Roman numeral label. */
export function toRoman(num) {
    const romans = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    return romans[num - 1] || num;
}

/** Human-readable inversion label. */
export function getInversionLabel(inv) {
    return { root: 'Root', '1st': '1st', '2nd': '2nd', '3rd': '3rd' }[inv];
}
