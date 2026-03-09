// =============================================================================
// SCALES.SIN — VOICING VOCABULARY
// Single source of truth for chord types, intervals, extension map,
// grip shapes, voicing rules, and style templates.
//
// Usage:
//   import { CHORD_INTERVALS, EXTENSION_MAP, STYLE_TEMPLATES, loadVocabulary }
//     from './voicing_vocabulary.js'
//
// Javelin write target: voicing_vocabulary.json
//   - Fetched at runtime and merged into the built-in vocab
//   - Javelin appends new chord_types, extension_map entries, style_templates
// =============================================================================

// ── Chord intervals (semitones from root) ─────────────────────────────────────
// Base 7th chord types — used by scales.sin.html voicing engine
export const CHORD_INTERVALS = {
    maj7:        [0, 4, 7, 11],
    min7:        [0, 3, 7, 10],
    dom7:        [0, 4, 7, 10],
    min7b5:      [0, 3, 6, 10],
    dim7:        [0, 3, 6, 9],
    minmaj7:     [0, 3, 7, 11],
    maj7sharp5:  [0, 4, 8, 11],
    // Extended types
    min9:        [0, 3, 7, 10, 14],
    maj9:        [0, 4, 7, 11, 14],
    dom9:        [0, 4, 7, 10, 14],
    dom9sus4:    [0, 5, 7, 10, 14],
    dom13sus4:   [0, 5, 7, 10, 21],
    dom7sharp9:  [0, 4, 7, 10, 15],  // "Hendrix chord" — D'Angelo signature
    dom13b9:     [0, 4, 7, 10, 13, 21],
    min11:       [0, 3, 10, 14, 17],  // root+5 omitted, b3 kept (per research)
    maj6_9:      [0, 4, 9, 14],       // R-3-6-9 (no 7, no 5)
    dom7sus4:    [0, 5, 10],
};

// ── Triad intervals ───────────────────────────────────────────────────────────
export const TRIAD_INTERVALS = {
    maj: [0, 4, 7],
    min: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
};

// ── Chord types for progression builder ───────────────────────────────────────
// Superset including all extended types needed by chord_progressions.html
export const CHORD_TYPES = {
    'maj':       { intervals: [0,4,7],        suffix: '',         name: 'maj' },
    'min':       { intervals: [0,3,7],        suffix: 'm',        name: 'min' },
    'maj7':      { intervals: [0,4,7,11],     suffix: 'maj7',     name: 'maj7' },
    'min7':      { intervals: [0,3,7,10],     suffix: 'm7',       name: 'min7' },
    '7':         { intervals: [0,4,7,10],     suffix: '7',        name: '7' },
    'dim':       { intervals: [0,3,6],        suffix: 'dim',      name: 'dim' },
    'dim7':      { intervals: [0,3,6,9],      suffix: 'dim7',     name: 'dim7' },
    'aug':       { intervals: [0,4,8],        suffix: 'aug',      name: 'aug' },
    'min7b5':    { intervals: [0,3,6,10],     suffix: 'm7b5',     name: 'min7b5' },
    'sus2':      { intervals: [0,2,7],        suffix: 'sus2',     name: 'sus2' },
    'sus4':      { intervals: [0,5,7],        suffix: 'sus4',     name: 'sus4' },
    '9':         { intervals: [0,4,7,10,14],  suffix: '9',        name: '9' },
    'maj9':      { intervals: [0,4,7,11,14],  suffix: 'maj9',     name: 'maj9' },
    'min9':      { intervals: [0,3,7,10,14],  suffix: 'min9',     name: 'min9' },
    '6':         { intervals: [0,4,7,9],      suffix: '6',        name: '6' },
    'min6':      { intervals: [0,3,7,9],      suffix: 'm6',       name: 'min6' },
    // Extended types from research
    'min11':     { intervals: [0,3,10,14,17], suffix: 'm11',      name: 'min11' },
    'dom13sus4': { intervals: [0,5,7,10,21],  suffix: '13sus4',   name: 'dom13sus4' },
    '7sharp9':   { intervals: [0,4,7,10,15],  suffix: '7#9',      name: '7sharp9' },
    '7flat9':    { intervals: [0,4,7,10,13],  suffix: '7b9',      name: '7flat9' },
    'add9':      { intervals: [0,4,7,14],     suffix: 'add9',     name: 'add9' },
    'maj6_9':    { intervals: [0,4,9,14],     suffix: '6/9',      name: 'maj6_9' },
};

// ── Extension map ─────────────────────────────────────────────────────────────
// Voicings shown when "Extensions" toggle is active in scales.sin.html.
//
// Research rules (from RESEARCH_Scales.sin_2026-03-08-voicing-quality.md):
//   - Omit perfect 5th (interval 7) from multi-note voicings
//   - Maj13: also omit natural 11 (interval 17) — clashes with maj3
//   - m11: omit root + 5, keep b3 to distinguish from sus4
//   - Never omit 3rd or 7th
export const EXTENSION_MAP = {
    // Maj7 extensions: omit 5 (7) from all multi-note voicings.
    // Maj13: also omit natural 11 (17) — clashes with maj3.
    'Maj7': [
        { suffix: '9',    intervals: [0, 4, 11, 14] },        // R-3-7-9 (5 omitted)
        { suffix: '6/9',  intervals: [0, 4, 9, 14] },         // R-3-6-9 (no 7, no 5)
        { suffix: 'add9', intervals: [0, 4, 14] },             // R-3-9 (no 7, no 5)
        { suffix: '13',   intervals: [0, 4, 11, 21] },        // R-3-7-13 (5 + natural 11 omitted)
    ],
    // m7 extensions: omit 5 (7).
    // m11: also omit root (0) — keep b3 to distinguish from sus4.
    'm7': [
        { suffix: '9',        intervals: [0, 3, 10, 14] },    // R-b3-b7-9 (5 omitted)
        { suffix: '11',       intervals: [3, 10, 14, 17] },   // b3-b7-9-11 (root+5 omitted; b3 keeps sus4 apart)
        { suffix: '6/9',      intervals: [0, 3, 9, 14] },     // R-b3-6-9 (no 7, no 5)
        { suffix: '9(add13)', intervals: [0, 3, 10, 14, 21] },// R-b3-b7-9-13 (5 omitted)
    ],
    // dom7 extensions: omit 5 (7).
    '7': [
        { suffix: '9',    intervals: [0, 4, 10, 14] },        // R-3-b7-9 (5 omitted)
        { suffix: '13',   intervals: [0, 4, 10, 21] },        // R-3-b7-13 (5 omitted)
        { suffix: '#11',  intervals: [0, 4, 10, 14, 18] },    // R-3-b7-9-#11 (5 omitted; Lydian dominant)
        { suffix: 'sus4', intervals: [0, 5, 10] },
    ],
    // m7b5: already has b5 (6), no standard 5 to omit. Keep as-is.
    'm7♭5': [
        { suffix: '9',    intervals: [0, 3, 6, 10, 14] },
        { suffix: '11',   intervals: [0, 3, 6, 10, 14, 17] },
        { suffix: '♭13',  intervals: [0, 3, 6, 10, 14, 20] },
        { suffix: '',     intervals: [0, 3, 6, 10] },
    ],
    // dim7: symmetric chord, no perfect 5 present. Keep as-is.
    'dim7': [
        { suffix: '9',    intervals: [0, 3, 6, 9, 14] },
        { suffix: 'Maj7', intervals: [0, 3, 6, 11] },
        { suffix: '',     intervals: [0, 3, 6, 9] },
        { suffix: '11',   intervals: [0, 3, 6, 9, 14, 17] },
    ],
    // mMaj7 extensions: omit 5 (7).
    'mMaj7': [
        { suffix: '9',    intervals: [0, 3, 11, 14] },        // R-b3-Maj7-9 (5 omitted)
        { suffix: '',     intervals: [0, 3, 7, 11] },         // base chord — keep 5 (4-note, playable)
        { suffix: '11',   intervals: [0, 3, 11, 14, 17] },   // R-b3-Maj7-9-11 (5 omitted)
        { suffix: '13',   intervals: [0, 3, 11, 14, 21] },   // R-b3-Maj7-9-13 (5 omitted)
    ],
    // Maj7#5: augmented 5th (8) replaces perfect 5th — keep as-is.
    'Maj7♯5': [
        { suffix: '9',      intervals: [0, 4, 8, 11, 14] },
        { suffix: '',       intervals: [0, 4, 8, 11] },
        { suffix: '#11',    intervals: [0, 4, 8, 11, 14, 18] },
        { suffix: '(add9)', intervals: [0, 4, 8, 14] },
    ],
};

// ── Grip shapes (for voicing detection in progression builder) ─────────────────
export const GRIP_SHAPES = {
    'maj7': [0, 4, 7, 11],
    'min7': [0, 3, 7, 10],
    'dim7': [0, 3, 6, 9],
    '7':    [0, 4, 7, 10],
    'maj':  [0, 4, 7],
    'min':  [0, 3, 7],
};

// ── Voicing quality rules (from research) ─────────────────────────────────────
export const VOICING_RULES = {
    drop2: {
        stringSets: [
            { name: '5432', avoidBelow: 3, avoidAbove: 14 },  // PRIMARY
            { name: '6543', avoidBelow: 5, avoidAbove: 12 },
            { name: '4321', avoidBelow: 3, avoidAbove: 12 },
        ],
        maxSpan: 5,
    },
    drop3: {
        stringSets: [
            { name: '6432', avoidBelow: 4, avoidAbove: 12 },
            { name: '5321', avoidBelow: 3, avoidAbove: 13 },
        ],
        maxSpan: 6,
    },
    triad: {
        stringSets: [
            { name: '5432', avoidBelow: 2, avoidAbove: 14 },
            { name: '4321', avoidBelow: 2, avoidAbove: 14 },
            { name: '5421', avoidBelow: 2, avoidAbove: 14 },
        ],
        maxSpan: 4,
    },
};

// ── Style templates (from harmonic research) ──────────────────────────────────
// Source: RESEARCH_Music_2026-03-08-harmonic-language.md
// Joe Pass, Stevie Wonder, D'Angelo, Leon Thomas III
export const STYLE_TEMPLATES = {
    pass: {
        name: 'Joe Pass',
        description: 'Bebop voice-leading. Always ii before V. Full cadential resolution. Drop 2/3 rootless voicings.',
        chordColors: { min: 'min9', maj: 'maj9', dom: 'dom13b9' },
        progressions: [
            { label: 'ii–V–I (major)',    degrees: ['ii9', 'V13b9', 'Imaj9'] },
            { label: 'ii–V–i (minor)',    degrees: ['iim7b5', 'V7alt', 'imMaj7'] },
            { label: 'Chromatic descent', degrees: ['bVI13sus4', 'VI13sus4', 'V13sus4', 'IV13sus4'] },
        ],
        rules: [
            'Always include ii chord before V',
            'Use tritone sub (bII7) for V7 on repeat',
            'Dominant voicings add b9 or #11',
            'Always fully cadential — no unresolved suspended dominants',
        ],
    },
    wonder: {
        name: 'Stevie Wonder',
        description: 'Modal (Dorian/Mixolydian). Chromatic passing 9th chords. IV→IVm borrowed chord. V9sus4 replaces bare V7.',
        chordColors: { min: 'min9', maj: 'maj9', dom: 'dom9sus4' },
        progressions: [
            { label: 'Dorian vamp',       degrees: ['im9', 'IVmaj7', 'im9', 'bVIImaj9'] },
            { label: "Isn't She Lovely",  degrees: ['vim7', 'II9', 'V9sus4', 'Imaj7'] },
            { label: 'Chromatic 9ths',    degrees: ['IV9', 'bIII9', 'bII9', 'II9'] },
        ],
        rules: [
            'Root in Dorian or Mixolydian',
            'Replace V7 with V9sus4 — never bare dominant 7th in cadence',
            'Insert bVII major as passing chord from IV to I',
            'On chorus/bridge, substitute VIm with VI major (parallel major borrow)',
        ],
    },
    dangelo: {
        name: "D'Angelo",
        description: 'Neo-soul. 2–3 chord cyclic loops, no functional resolution. m9 as default minor. 13sus4 or 7#9 as dominant.',
        chordColors: { min: 'min9', maj: 'maj9', dom: 'dom13sus4' },
        progressions: [
            { label: 'Neo-soul loop',  degrees: ['im9', 'bVIImaj9', 'IV13sus4'] },
            { label: 'Brown Sugar',    degrees: ['im7', 'IV7', 'vim7', 'bII7#9'] },
            { label: 'Untitled',       degrees: ['Iadd9', 'V7sus4', 'IV6', 'bVII9'] },
        ],
        rules: [
            '2–3 chords max — cyclic, no resolution',
            'Default minor chord: m9 with #9 color available',
            "Default dominant: 13sus4 or 7#9 (not plain 7th)",
            "If progression repeats more than 4 bars, it's correct",
        ],
    },
    thomas: {
        name: 'Leon Thomas',
        description: 'Contemporary R&B. Four-chord functional loop. m9 minor, maj7/maj9 major, 13sus4 dominant resolves conventionally.',
        chordColors: { min: 'min9', maj: 'maj9', dom: 'dom13sus4' },
        progressions: [
            { label: 'Thomas loop',       degrees: ['im9', 'IVm9', 'bVImaj9', 'V13sus4'] },
            { label: 'MUTT',              degrees: ['im7', 'IVm7', 'bVImaj', 'VImaj'] },
            { label: "Vibes Don't Lie",   degrees: ['im7', 'IVm7', 'bVImaj7', 'V7'] },
        ],
        rules: [
            'im7 → IVm7 → bVImaj7 → V7 or V13sus4 (four-chord functional loop)',
            'Default minor chord: m9',
            'Default major chord: maj7',
            'Dominant 13sus4 preferred over plain V7',
        ],
    },
};

// ── loadVocabulary() — runtime merge from Javelin's JSON ──────────────────────
// Fetches voicing_vocabulary.json and deep-merges into the built-in vocab.
// The JSON can add new chord_types, extend extension_map, add style_templates.
// Returns merged { chordTypes, extensionMap, styleTemplates }.
export async function loadVocabulary() {
    const base = {
        chordTypes:     { ...CHORD_TYPES },
        extensionMap:   {},
        styleTemplates: {},
    };

    // Deep-copy extension map (arrays need real copy)
    for (const [k, v] of Object.entries(EXTENSION_MAP)) {
        base.extensionMap[k] = [...v];
    }
    // Deep-copy style templates
    for (const [k, v] of Object.entries(STYLE_TEMPLATES)) {
        base.styleTemplates[k] = { ...v, progressions: [...v.progressions], rules: [...v.rules] };
    }

    try {
        const res = await fetch('./voicing_vocabulary.json');
        if (!res.ok) return base;
        const data = await res.json();

        // Merge chord_types
        if (data.chord_types) {
            Object.assign(base.chordTypes, data.chord_types);
        }

        // Merge extension_map — append new suffix entries, don't replace existing
        if (data.extension_map) {
            for (const [quality, exts] of Object.entries(data.extension_map)) {
                if (base.extensionMap[quality]) {
                    const existingSuffixes = new Set(base.extensionMap[quality].map(e => e.suffix));
                    const newExts = exts.filter(e => !existingSuffixes.has(e.suffix));
                    base.extensionMap[quality] = [...base.extensionMap[quality], ...newExts];
                } else {
                    base.extensionMap[quality] = exts;
                }
            }
        }

        // Merge style_templates — append new progressions, don't replace templates
        if (data.style_templates) {
            for (const [key, tmpl] of Object.entries(data.style_templates)) {
                if (base.styleTemplates[key]) {
                    const existingLabels = new Set(base.styleTemplates[key].progressions.map(p => p.label));
                    const newProgs = (tmpl.progressions || []).filter(p => !existingLabels.has(p.label));
                    base.styleTemplates[key] = {
                        ...base.styleTemplates[key],
                        ...tmpl,
                        progressions: [...base.styleTemplates[key].progressions, ...newProgs],
                        rules: base.styleTemplates[key].rules, // never overwrite rules from JSON
                    };
                } else {
                    base.styleTemplates[key] = tmpl;
                }
            }
        }
    } catch (e) {
        // JSON unavailable — use built-in vocab only
        console.info('[VocabLoader] voicing_vocabulary.json not available, using built-in vocab.');
    }

    return base;
}
