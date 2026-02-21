// =============================================================================
// SCALES.SIN — MUSIC THEORY GROUND TRUTH
// =============================================================================
// Sources:
//   [1] Kostka, Payne & Almen — "Tonal Harmony" 7th ed. (McGraw-Hill, 2012)
//       Ch. 2 (scales), Ch. 6 (diatonic triads), Ch. 8 (diatonic 7th chords),
//       Ch. 18 (natural minor), Ch. 6 (modes)
//   [2] Aldwell, Schachter & Cadwallader — "Harmony and Voice Leading" 4th ed.
//       (Cengage, 2011) Ch. 2, 3, 18 (natural minor)
//
// Enharmonic spelling rule:
//   Canonical note names are determined by key signature. Each diatonic note
//   must use a distinct letter name. Keys with >= 1 flat use flat spellings.
//   Enharmonic pairs (C#/Db, F#/Gb, etc.) are both included for completeness.
//
// DO NOT EDIT — this file is ground truth. Any changes must be sourced.
// =============================================================================

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE_INTERVALS  = [0, 2, 3, 5, 7, 8, 10];

const MAJOR_SEVENTH_QUALITIES = ['Maj7', 'm7', 'm7', 'Maj7', '7', 'm7', 'm7b5'];
const MAJOR_TRIAD_QUALITIES   = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
const MAJOR_ROMAN_NUMERALS    = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

const MINOR_SEVENTH_QUALITIES = ['m7', 'm7b5', 'Maj7', 'm7', 'm7', 'Maj7', '7'];
const MINOR_TRIAD_QUALITIES   = ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'];
const MINOR_ROMAN_NUMERALS    = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

// ---------------------------------------------------------------------------
// ALL 12 MAJOR SCALES
// ---------------------------------------------------------------------------
const MAJOR_SCALES_GROUND_TRUTH = {
  //  rootMidi: MIDI pitch class (C=0, C#=1, D=2 ... B=11)
  C:  { rootMidi: 0,  notes: ['C','D','E','F','G','A','B'],              keySignature: 0  },
  G:  { rootMidi: 7,  notes: ['G','A','B','C','D','E','F#'],             keySignature: 1  },
  D:  { rootMidi: 2,  notes: ['D','E','F#','G','A','B','C#'],            keySignature: 2  },
  A:  { rootMidi: 9,  notes: ['A','B','C#','D','E','F#','G#'],           keySignature: 3  },
  E:  { rootMidi: 4,  notes: ['E','F#','G#','A','B','C#','D#'],          keySignature: 4  },
  B:  { rootMidi: 11, notes: ['B','C#','D#','E','F#','G#','A#'],         keySignature: 5  },
  'F#': { rootMidi: 6,  notes: ['F#','G#','A#','B','C#','D#','E#'],      keySignature: 6  },
  Gb: { rootMidi: 6,  notes: ['Gb','Ab','Bb','Cb','Db','Eb','F'],        keySignature: -6 },
  'C#': { rootMidi: 1,  notes: ['C#','D#','E#','F#','G#','A#','B#'],     keySignature: 7  },
  Db: { rootMidi: 1,  notes: ['Db','Eb','F','Gb','Ab','Bb','C'],         keySignature: -5 },
  Ab: { rootMidi: 8,  notes: ['Ab','Bb','C','Db','Eb','F','G'],          keySignature: -4 },
  Eb: { rootMidi: 3,  notes: ['Eb','F','G','Ab','Bb','C','D'],           keySignature: -3 },
  Bb: { rootMidi: 10, notes: ['Bb','C','D','Eb','F','G','A'],            keySignature: -2 },
  F:  { rootMidi: 5,  notes: ['F','G','A','Bb','C','D','E'],             keySignature: -1 },
};

// ---------------------------------------------------------------------------
// ALL 12 NATURAL MINOR SCALES
// ---------------------------------------------------------------------------
const MINOR_SCALES_GROUND_TRUTH = {
  A:  { rootMidi: 9,  relativeMajor: 'C',  notes: ['A','B','C','D','E','F','G'],             keySignature: 0  },
  E:  { rootMidi: 4,  relativeMajor: 'G',  notes: ['E','F#','G','A','B','C','D'],            keySignature: 1  },
  B:  { rootMidi: 11, relativeMajor: 'D',  notes: ['B','C#','D','E','F#','G','A'],           keySignature: 2  },
  'F#': { rootMidi: 6,  relativeMajor: 'A',  notes: ['F#','G#','A','B','C#','D','E'],        keySignature: 3  },
  'C#': { rootMidi: 1,  relativeMajor: 'E',  notes: ['C#','D#','E','F#','G#','A','B'],       keySignature: 4  },
  'G#': { rootMidi: 8,  relativeMajor: 'B',  notes: ['G#','A#','B','C#','D#','E','F#'],      keySignature: 5  },
  Eb: { rootMidi: 3,  relativeMajor: 'Gb', notes: ['Eb','F','Gb','Ab','Bb','Cb','Db'],       keySignature: -6 },
  Bb: { rootMidi: 10, relativeMajor: 'Db', notes: ['Bb','C','Db','Eb','F','Gb','Ab'],        keySignature: -5 },
  F:  { rootMidi: 5,  relativeMajor: 'Ab', notes: ['F','G','Ab','Bb','C','Db','Eb'],         keySignature: -4 },
  C:  { rootMidi: 0,  relativeMajor: 'Eb', notes: ['C','D','Eb','F','G','Ab','Bb'],          keySignature: -3 },
  G:  { rootMidi: 7,  relativeMajor: 'Bb', notes: ['G','A','Bb','C','D','Eb','F'],           keySignature: -2 },
  D:  { rootMidi: 2,  relativeMajor: 'F',  notes: ['D','E','F','G','A','Bb','C'],            keySignature: -1 },
};

// ---------------------------------------------------------------------------
// 7 MODES (derived from C major, intervals relative to mode root)
// ---------------------------------------------------------------------------
const MODES_GROUND_TRUTH = {
  Ionian:     { degree: 1, intervals: [0,2,4,5,7,9,11], tonicSeventh: 'Maj7', seventhQualities: ['Maj7','m7','m7','Maj7','7','m7','m7b5'],    romans: ['I','ii','iii','IV','V','vi','vii°']     },
  Dorian:     { degree: 2, intervals: [0,2,3,5,7,9,10], tonicSeventh: 'm7',   seventhQualities: ['m7','m7','Maj7','7','m7','m7b5','Maj7'],     romans: ['i','ii','III','IV','v','vi°','VII']      },
  Phrygian:   { degree: 3, intervals: [0,1,3,5,7,8,10], tonicSeventh: 'm7',   seventhQualities: ['m7','Maj7','7','m7','m7b5','Maj7','m7'],     romans: ['i','bII','III','iv','v°','VI','vii']     },
  Lydian:     { degree: 4, intervals: [0,2,4,6,7,9,11], tonicSeventh: 'Maj7', seventhQualities: ['Maj7','7','m7','m7b5','Maj7','m7','m7'],     romans: ['I','II','iii','#iv°','V','vi','vii']     },
  Mixolydian: { degree: 5, intervals: [0,2,4,5,7,9,10], tonicSeventh: '7',    seventhQualities: ['7','m7','m7b5','Maj7','m7','m7','Maj7'],     romans: ['I','ii','iii°','IV','v','vi','VII']      },
  Aeolian:    { degree: 6, intervals: [0,2,3,5,7,8,10], tonicSeventh: 'm7',   seventhQualities: ['m7','m7b5','Maj7','m7','m7','Maj7','7'],     romans: ['i','ii°','III','iv','v','VI','VII']      },
  Locrian:    { degree: 7, intervals: [0,1,3,5,6,8,10], tonicSeventh: 'm7b5', seventhQualities: ['m7b5','Maj7','m7','m7','Maj7','7','m7'],     romans: ['i°','II','iii','iv','V','VI','vii']      },
};

// ---------------------------------------------------------------------------
// ENHARMONIC SPELLINGS — pitch class → { sharp, flat }
// ---------------------------------------------------------------------------
const ENHARMONIC_SPELLINGS = [
  { pc: 0,  sharp: 'C',  flat: 'C'  },
  { pc: 1,  sharp: 'C#', flat: 'Db' },
  { pc: 2,  sharp: 'D',  flat: 'D'  },
  { pc: 3,  sharp: 'D#', flat: 'Eb' },
  { pc: 4,  sharp: 'E',  flat: 'E'  },
  { pc: 5,  sharp: 'F',  flat: 'F'  },
  { pc: 6,  sharp: 'F#', flat: 'Gb' },
  { pc: 7,  sharp: 'G',  flat: 'G'  },
  { pc: 8,  sharp: 'G#', flat: 'Ab' },
  { pc: 9,  sharp: 'A',  flat: 'A'  },
  { pc: 10, sharp: 'A#', flat: 'Bb' },
  { pc: 11, sharp: 'B',  flat: 'B'  },
];

// Pitch classes that use flat spelling (matches app's FLAT_KEYS)
const FLAT_KEY_PITCH_CLASSES = [5, 10, 3, 8, 1, 6]; // F Bb Eb Ab Db Gb

// Chord interval structures (semitones above root)
const CHORD_INTERVALS = {
  'Maj7':  [0, 4, 7, 11],
  'm7':    [0, 3, 7, 10],
  '7':     [0, 4, 7, 10],
  'm7b5':  [0, 3, 6, 10],
  'maj':   [0, 4, 7],
  'min':   [0, 3, 7],
  'dim':   [0, 3, 6],
};

// =============================================================================
// A. HARMONIC MINOR SCALES — All 12 Roots
// =============================================================================
// Source: Kostka/Payne/Almen "Tonal Harmony" 7th ed., Ch. 18 pp. 329–334;
//         Aldwell/Schachter/Cadwallader "Harmony and Voice Leading" 4th ed.,
//         Ch. 20 pp. 383–388;
//         Benward/Saker "Music in Theory and Practice" Vol. I, 9th ed., Ch. 6.
//
// Interval pattern: [0, 2, 3, 5, 7, 8, 11]
//   = natural minor with raised scale degree 7 (leading tone restored)
//   = W H W W H A2 H  (A2 = augmented second between ^6 and ^7)
//
// Enharmonic spelling rule for raised 7th:
//   The raised 7th uses the same letter name as the natural minor ^7, with an
//   added accidental. In keys where the natural ^7 is already sharp, the raised
//   ^7 becomes double-sharp (x). This is standard in tonal harmony texts.
//   Example: G# harmonic minor — natural ^7 is F# → raised ^7 is F## (F-double-sharp)
//
// Diatonic 7th chord qualities (per Kostka/Payne Ch. 18):
//   ^1: i(mMaj7)   — minor triad + major 7th
//   ^2: ii°(m7b5)  — half-diminished (diminished triad + minor 7th)
//   ^3: III+(Maj7#5)— augmented triad + major 7th (raised 5th due to raised ^7)
//   ^4: iv(m7)     — minor triad + minor 7th
//   ^5: V(7)       — dominant 7th (raised ^7 creates major triad + minor 7th)
//   ^6: VI(Maj7)   — major triad + major 7th
//   ^7: vii°(dim7) — diminished triad + diminished 7th (fully diminished)
//
// Triad qualities:
//   ^1: i(min)   ^2: ii°(dim)  ^3: III+(aug)  ^4: iv(min)
//   ^5: V(maj)   ^6: VI(maj)   ^7: vii°(dim)
//
// Roman numerals: i, ii°, III+, iv, V, VI, vii°
// =============================================================================

const HARMONIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 11];

const HARMONIC_MINOR_SEVENTH_QUALITIES = ['mMaj7', 'm7b5', 'Maj7#5', 'm7', '7', 'Maj7', 'dim7'];
const HARMONIC_MINOR_TRIAD_QUALITIES   = ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'];
const HARMONIC_MINOR_ROMAN_NUMERALS    = ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'];

// Additional chord interval structures needed for harmonic minor
// (extend CHORD_INTERVALS below in the updated export)
// 'mMaj7':  [0, 3, 7, 11]  — minor triad + major 7th
// 'Maj7#5': [0, 4, 8, 11]  — augmented triad + major 7th
// 'dim7':   [0, 3, 6, 9]   — fully diminished 7th

const HARMONIC_MINOR_SCALES_GROUND_TRUTH = {
  // ─── Sharp-side keys ──────────────────────────────────────────────────────
  // A harmonic minor (relative: C major, 0 sharps/flats)
  //   Natural minor: A B C D E F G
  //   Raised ^7: G → G# (semitone 11 from A)
  //   Augmented 2nd: F–G# (^6–^7)
  A: {
    rootMidi: 9,
    keySignature: 0,
    relativeMajor: 'C',
    notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G#'],
    raisedDegree7: 'G#',   // natural minor ^7 was G; raised to G#
    intervals: [0, 2, 3, 5, 7, 8, 11],
    seventhQualities: ['mMaj7', 'm7b5', 'Maj7#5', 'm7', '7', 'Maj7', 'dim7'],
    triadQualities:   ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
    romanNumerals:    ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    // Chords: Am(Maj7), Bm7b5, CMaj7#5, Dm7, E7, FMaj7, G#dim7
  },

  // E harmonic minor (relative: G major, 1 sharp)
  //   Natural minor: E F# G A B C D
  //   Raised ^7: D → D# (semitone 11 from E)
  E: {
    rootMidi: 4,
    keySignature: 1,
    relativeMajor: 'G',
    notes: ['E', 'F#', 'G', 'A', 'B', 'C', 'D#'],
    raisedDegree7: 'D#',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    seventhQualities: ['mMaj7', 'm7b5', 'Maj7#5', 'm7', '7', 'Maj7', 'dim7'],
    triadQualities:   ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
    romanNumerals:    ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    // Chords: Em(Maj7), F#m7b5, GMaj7#5, Am7, B7, CMaj7, D#dim7
  },

  // B harmonic minor (relative: D major, 2 sharps)
  //   Natural minor: B C# D E F# G A
  //   Raised ^7: A → A# (semitone 11 from B)
  B: {
    rootMidi: 11,
    keySignature: 2,
    relativeMajor: 'D',
    notes: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A#'],
    raisedDegree7: 'A#',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    seventhQualities: ['mMaj7', 'm7b5', 'Maj7#5', 'm7', '7', 'Maj7', 'dim7'],
    triadQualities:   ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
    romanNumerals:    ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    // Chords: Bm(Maj7), C#m7b5, DMaj7#5, Em7, F#7, GMaj7, A#dim7
  },

  // F# harmonic minor (relative: A major, 3 sharps)
  //   Natural minor: F# G# A B C# D E
  //   Raised ^7: E → E# (semitone 11 from F#)
  'F#': {
    rootMidi: 6,
    keySignature: 3,
    relativeMajor: 'A',
    notes: ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E#'],
    raisedDegree7: 'E#',  // E# = enharmonic F, but must use E-letter to spell scale correctly
    intervals: [0, 2, 3, 5, 7, 8, 11],
    seventhQualities: ['mMaj7', 'm7b5', 'Maj7#5', 'm7', '7', 'Maj7', 'dim7'],
    triadQualities:   ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
    romanNumerals:    ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    // Chords: F#m(Maj7), G#m7b5, AMaj7#5, Bm7, C#7, DMaj7, E#dim7
  },

  // C# harmonic minor (relative: E major, 4 sharps)
  //   Natural minor: C# D# E F# G# A B
  //   Raised ^7: B → B# (semitone 11 from C#)
  'C#': {
    rootMidi: 1,
    keySignature: 4,
    relativeMajor: 'E',
    notes: ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B#'],
    raisedDegree7: 'B#',  // B# = enharmonic C, but B-letter required
    intervals: [0, 2, 3, 5, 7, 8, 11],
    seventhQualities: ['mMaj7', 'm7b5', 'Maj7#5', 'm7', '7', 'Maj7', 'dim7'],
    triadQualities:   ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
    romanNumerals:    ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    // Chords: C#m(Maj7), D#m7b5, EMaj7#5, F#m7, G#7, AMaj7, B#dim7
  },

  // G# harmonic minor (relative: B major, 5 sharps)
  //   Natural minor: G# A# B C# D# E F#
  //   Raised ^7: F# → F## (double sharp — same letter F, raised again)
  //   Note: F## is the canonical spelling per Kostka/Payne. Enharmonic G is incorrect here.
  'G#': {
    rootMidi: 8,
    keySignature: 5,
    relativeMajor: 'B',
    notes: ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F##'],
    raisedDegree7: 'F##',  // double-sharp: natural ^7 was F#, raised = F##
    intervals: [0, 2, 3, 5, 7, 8, 11],
    seventhQualities: ['mMaj7', 'm7b5', 'Maj7#5', 'm7', '7', 'Maj7', 'dim7'],
    triadQualities:   ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
    romanNumerals:    ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    // Chords: G#m(Maj7), A#m7b5, BMaj7#5, C#m7, D#7, EMaj7, F##dim7
  },

  // ─── Flat-side keys ───────────────────────────────────────────────────────
  // D harmonic minor (relative: F major, 1 flat)
  //   Natural minor: D E F G A Bb C
  //   Raised ^7: C → C# (semitone 11 from D)
  D: {
    rootMidi: 2,
    keySignature: -1,
    relativeMajor: 'F',
    notes: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C#'],
    raisedDegree7: 'C#',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    seventhQualities: ['mMaj7', 'm7b5', 'Maj7#5', 'm7', '7', 'Maj7', 'dim7'],
    triadQualities:   ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
    romanNumerals:    ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    // Chords: Dm(Maj7), Em7b5, FMaj7#5, Gm7, A7, BbMaj7, C#dim7
  },

  // G harmonic minor (relative: Bb major, 2 flats)
  //   Natural minor: G A Bb C D Eb F
  //   Raised ^7: F → F# (semitone 11 from G)
  G: {
    rootMidi: 7,
    keySignature: -2,
    relativeMajor: 'Bb',
    notes: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F#'],
    raisedDegree7: 'F#',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    seventhQualities: ['mMaj7', 'm7b5', 'Maj7#5', 'm7', '7', 'Maj7', 'dim7'],
    triadQualities:   ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
    romanNumerals:    ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    // Chords: Gm(Maj7), Am7b5, BbMaj7#5, Cm7, D7, EbMaj7, F#dim7
  },

  // C harmonic minor (relative: Eb major, 3 flats)
  //   Natural minor: C D Eb F G Ab Bb
  //   Raised ^7: Bb → B (natural, semitone 11 from C)
  C: {
    rootMidi: 0,
    keySignature: -3,
    relativeMajor: 'Eb',
    notes: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'B'],
    raisedDegree7: 'B',   // Bb raised to B natural
    intervals: [0, 2, 3, 5, 7, 8, 11],
    seventhQualities: ['mMaj7', 'm7b5', 'Maj7#5', 'm7', '7', 'Maj7', 'dim7'],
    triadQualities:   ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
    romanNumerals:    ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    // Chords: Cm(Maj7), Dm7b5, EbMaj7#5, Fm7, G7, AbMaj7, Bdim7
  },

  // F harmonic minor (relative: Ab major, 4 flats)
  //   Natural minor: F G Ab Bb C Db Eb
  //   Raised ^7: Eb → E (natural, semitone 11 from F)
  F: {
    rootMidi: 5,
    keySignature: -4,
    relativeMajor: 'Ab',
    notes: ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'E'],
    raisedDegree7: 'E',   // Eb raised to E natural
    intervals: [0, 2, 3, 5, 7, 8, 11],
    seventhQualities: ['mMaj7', 'm7b5', 'Maj7#5', 'm7', '7', 'Maj7', 'dim7'],
    triadQualities:   ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
    romanNumerals:    ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    // Chords: Fm(Maj7), Gm7b5, AbMaj7#5, Bbm7, C7, DbMaj7, Edim7
  },

  // Bb harmonic minor (relative: Db major, 5 flats)
  //   Natural minor: Bb C Db Eb F Gb Ab
  //   Raised ^7: Ab → A (natural, semitone 11 from Bb)
  Bb: {
    rootMidi: 10,
    keySignature: -5,
    relativeMajor: 'Db',
    notes: ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'A'],
    raisedDegree7: 'A',   // Ab raised to A natural
    intervals: [0, 2, 3, 5, 7, 8, 11],
    seventhQualities: ['mMaj7', 'm7b5', 'Maj7#5', 'm7', '7', 'Maj7', 'dim7'],
    triadQualities:   ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
    romanNumerals:    ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    // Chords: Bbm(Maj7), Cm7b5, DbMaj7#5, Ebm7, F7, GbMaj7, Adim7
  },

  // Eb harmonic minor (relative: Gb major, 6 flats)
  //   Natural minor: Eb F Gb Ab Bb Cb Db
  //   Raised ^7: Db → D (natural, semitone 11 from Eb)
  //   Note: Cb is the correct ^6 here (= enharmonic B), per the Gb major key signature
  Eb: {
    rootMidi: 3,
    keySignature: -6,
    relativeMajor: 'Gb',
    notes: ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'D'],
    raisedDegree7: 'D',   // Db raised to D natural
    intervals: [0, 2, 3, 5, 7, 8, 11],
    seventhQualities: ['mMaj7', 'm7b5', 'Maj7#5', 'm7', '7', 'Maj7', 'dim7'],
    triadQualities:   ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
    romanNumerals:    ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    // Chords: Ebm(Maj7), Fm7b5, GbMaj7#5, Abm7, Bb7, CbMaj7, Ddim7
  },
};

// =============================================================================
// B. MELODIC MINOR ASCENDING (Jazz Minor) — All 12 Roots
// =============================================================================
// Source: Kostka/Payne/Almen "Tonal Harmony" 7th ed., Ch. 18 pp. 335–338;
//         Aldwell/Schachter/Cadwallader 4th ed., Ch. 20 pp. 389–392;
//         Benward/Saker Vol. I, Ch. 6 pp. 108–110.
//
// Classical theory: ascending form raises ^6 and ^7; descending = natural minor.
// Jazz theory: ascending form used exclusively in both directions ("jazz minor").
// This file provides the ascending/jazz form only, as requested.
//
// Interval pattern: [0, 2, 3, 5, 7, 9, 11]
//   = natural minor with BOTH ^6 and ^7 raised
//   = W H W W W W H
//   = identical to major scale except for b3
//
// Enharmonic spelling: raised ^6 and ^7 use the same letter names as the
//   natural minor ^6 and ^7, with added accidentals. The b3 uses the same
//   letter as the major scale's ^3 but lowered.
//
// Diatonic 7th chord qualities (Kostka/Payne Ch. 18; Mark Levine "The Jazz
//   Theory Book" Ch. 3 for jazz context):
//   ^1: i(mMaj7)    — minor triad + major 7th (characteristic jazz minor sound)
//   ^2: ii(m7)      — minor triad + minor 7th
//   ^3: III(Maj7#5) — augmented triad + major 7th (raised 5th from ^3 to ^7)
//   ^4: IV(7)       — dominant 7th (Lydian dominant when combined with #4 in mode)
//   ^5: V(7)        — dominant 7th
//   ^6: vi°(m7b5)   — half-diminished
//   ^7: vii°(m7b5)  — half-diminished (not fully diminished — ^7 is only b7 above ^6+1)
//
// Triad qualities: i(min), ii(min), III(aug), IV(maj), V(maj), vi°(dim), vii°(dim)
// Roman numerals: i, ii, III, IV, V, vi°, vii°
// =============================================================================

const MELODIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 9, 11];

const MELODIC_MINOR_SEVENTH_QUALITIES = ['mMaj7', 'm7', 'Maj7#5', '7', '7', 'm7b5', 'm7b5'];
const MELODIC_MINOR_TRIAD_QUALITIES   = ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'];
const MELODIC_MINOR_ROMAN_NUMERALS    = ['i', 'ii', 'III', 'IV', 'V', 'vi°', 'vii°'];

const MELODIC_MINOR_SCALES_GROUND_TRUTH = {
  // ─── Sharp-side keys ──────────────────────────────────────────────────────
  // A melodic minor ascending
  //   Natural minor: A B C D E F G
  //   Raised ^6: F → F# | Raised ^7: G → G#
  A: {
    rootMidi: 9,
    keySignature: 0,
    notes: ['A', 'B', 'C', 'D', 'E', 'F#', 'G#'],
    raisedDegree6: 'F#',
    raisedDegree7: 'G#',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    seventhQualities: ['mMaj7', 'm7', 'Maj7#5', '7', '7', 'm7b5', 'm7b5'],
    triadQualities:   ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
    romanNumerals:    ['i', 'ii', 'III', 'IV', 'V', 'vi°', 'vii°'],
    // Chords: Am(Maj7), Bm7, CMaj7#5, D7, E7, F#m7b5, G#m7b5
  },

  // E melodic minor ascending
  //   Natural minor: E F# G A B C D
  //   Raised ^6: C → C# | Raised ^7: D → D#
  E: {
    rootMidi: 4,
    keySignature: 1,
    notes: ['E', 'F#', 'G', 'A', 'B', 'C#', 'D#'],
    raisedDegree6: 'C#',
    raisedDegree7: 'D#',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    seventhQualities: ['mMaj7', 'm7', 'Maj7#5', '7', '7', 'm7b5', 'm7b5'],
    triadQualities:   ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
    romanNumerals:    ['i', 'ii', 'III', 'IV', 'V', 'vi°', 'vii°'],
    // Chords: Em(Maj7), F#m7, GMaj7#5, A7, B7, C#m7b5, D#m7b5
  },

  // B melodic minor ascending
  //   Natural minor: B C# D E F# G A
  //   Raised ^6: G → G# | Raised ^7: A → A#
  B: {
    rootMidi: 11,
    keySignature: 2,
    notes: ['B', 'C#', 'D', 'E', 'F#', 'G#', 'A#'],
    raisedDegree6: 'G#',
    raisedDegree7: 'A#',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    seventhQualities: ['mMaj7', 'm7', 'Maj7#5', '7', '7', 'm7b5', 'm7b5'],
    triadQualities:   ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
    romanNumerals:    ['i', 'ii', 'III', 'IV', 'V', 'vi°', 'vii°'],
    // Chords: Bm(Maj7), C#m7, DMaj7#5, E7, F#7, G#m7b5, A#m7b5
  },

  // F# melodic minor ascending
  //   Natural minor: F# G# A B C# D E
  //   Raised ^6: D → D# | Raised ^7: E → E#
  'F#': {
    rootMidi: 6,
    keySignature: 3,
    notes: ['F#', 'G#', 'A', 'B', 'C#', 'D#', 'E#'],
    raisedDegree6: 'D#',
    raisedDegree7: 'E#',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    seventhQualities: ['mMaj7', 'm7', 'Maj7#5', '7', '7', 'm7b5', 'm7b5'],
    triadQualities:   ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
    romanNumerals:    ['i', 'ii', 'III', 'IV', 'V', 'vi°', 'vii°'],
    // Chords: F#m(Maj7), G#m7, AMaj7#5, B7, C#7, D#m7b5, E#m7b5
  },

  // C# melodic minor ascending
  //   Natural minor: C# D# E F# G# A B
  //   Raised ^6: A → A# | Raised ^7: B → B#
  'C#': {
    rootMidi: 1,
    keySignature: 4,
    notes: ['C#', 'D#', 'E', 'F#', 'G#', 'A#', 'B#'],
    raisedDegree6: 'A#',
    raisedDegree7: 'B#',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    seventhQualities: ['mMaj7', 'm7', 'Maj7#5', '7', '7', 'm7b5', 'm7b5'],
    triadQualities:   ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
    romanNumerals:    ['i', 'ii', 'III', 'IV', 'V', 'vi°', 'vii°'],
    // Chords: C#m(Maj7), D#m7, EMaj7#5, F#7, G#7, A#m7b5, B#m7b5
  },

  // G# melodic minor ascending
  //   Natural minor: G# A# B C# D# E F#
  //   Raised ^6: E → E# | Raised ^7: F# → F##
  'G#': {
    rootMidi: 8,
    keySignature: 5,
    notes: ['G#', 'A#', 'B', 'C#', 'D#', 'E#', 'F##'],
    raisedDegree6: 'E#',
    raisedDegree7: 'F##',  // double-sharp: same as harmonic minor case
    intervals: [0, 2, 3, 5, 7, 9, 11],
    seventhQualities: ['mMaj7', 'm7', 'Maj7#5', '7', '7', 'm7b5', 'm7b5'],
    triadQualities:   ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
    romanNumerals:    ['i', 'ii', 'III', 'IV', 'V', 'vi°', 'vii°'],
    // Chords: G#m(Maj7), A#m7, BMaj7#5, C#7, D#7, E#m7b5, F##m7b5
  },

  // ─── Flat-side keys ───────────────────────────────────────────────────────
  // D melodic minor ascending
  //   Natural minor: D E F G A Bb C
  //   Raised ^6: Bb → B | Raised ^7: C → C#
  D: {
    rootMidi: 2,
    keySignature: -1,
    notes: ['D', 'E', 'F', 'G', 'A', 'B', 'C#'],
    raisedDegree6: 'B',   // Bb raised to B natural
    raisedDegree7: 'C#',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    seventhQualities: ['mMaj7', 'm7', 'Maj7#5', '7', '7', 'm7b5', 'm7b5'],
    triadQualities:   ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
    romanNumerals:    ['i', 'ii', 'III', 'IV', 'V', 'vi°', 'vii°'],
    // Chords: Dm(Maj7), Em7, FMaj7#5, G7, A7, Bm7b5, C#m7b5
  },

  // G melodic minor ascending
  //   Natural minor: G A Bb C D Eb F
  //   Raised ^6: Eb → E | Raised ^7: F → F#
  G: {
    rootMidi: 7,
    keySignature: -2,
    notes: ['G', 'A', 'Bb', 'C', 'D', 'E', 'F#'],
    raisedDegree6: 'E',   // Eb raised to E natural
    raisedDegree7: 'F#',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    seventhQualities: ['mMaj7', 'm7', 'Maj7#5', '7', '7', 'm7b5', 'm7b5'],
    triadQualities:   ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
    romanNumerals:    ['i', 'ii', 'III', 'IV', 'V', 'vi°', 'vii°'],
    // Chords: Gm(Maj7), Am7, BbMaj7#5, C7, D7, Em7b5, F#m7b5
  },

  // C melodic minor ascending
  //   Natural minor: C D Eb F G Ab Bb
  //   Raised ^6: Ab → A | Raised ^7: Bb → B
  C: {
    rootMidi: 0,
    keySignature: -3,
    notes: ['C', 'D', 'Eb', 'F', 'G', 'A', 'B'],
    raisedDegree6: 'A',   // Ab raised to A natural
    raisedDegree7: 'B',   // Bb raised to B natural
    intervals: [0, 2, 3, 5, 7, 9, 11],
    seventhQualities: ['mMaj7', 'm7', 'Maj7#5', '7', '7', 'm7b5', 'm7b5'],
    triadQualities:   ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
    romanNumerals:    ['i', 'ii', 'III', 'IV', 'V', 'vi°', 'vii°'],
    // Chords: Cm(Maj7), Dm7, EbMaj7#5, F7, G7, Am7b5, Bm7b5
  },

  // F melodic minor ascending
  //   Natural minor: F G Ab Bb C Db Eb
  //   Raised ^6: Db → D | Raised ^7: Eb → E
  F: {
    rootMidi: 5,
    keySignature: -4,
    notes: ['F', 'G', 'Ab', 'Bb', 'C', 'D', 'E'],
    raisedDegree6: 'D',   // Db raised to D natural
    raisedDegree7: 'E',   // Eb raised to E natural
    intervals: [0, 2, 3, 5, 7, 9, 11],
    seventhQualities: ['mMaj7', 'm7', 'Maj7#5', '7', '7', 'm7b5', 'm7b5'],
    triadQualities:   ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
    romanNumerals:    ['i', 'ii', 'III', 'IV', 'V', 'vi°', 'vii°'],
    // Chords: Fm(Maj7), Gm7, AbMaj7#5, Bb7, C7, Dm7b5, Em7b5
  },

  // Bb melodic minor ascending
  //   Natural minor: Bb C Db Eb F Gb Ab
  //   Raised ^6: Gb → G | Raised ^7: Ab → A
  Bb: {
    rootMidi: 10,
    keySignature: -5,
    notes: ['Bb', 'C', 'Db', 'Eb', 'F', 'G', 'A'],
    raisedDegree6: 'G',   // Gb raised to G natural
    raisedDegree7: 'A',   // Ab raised to A natural
    intervals: [0, 2, 3, 5, 7, 9, 11],
    seventhQualities: ['mMaj7', 'm7', 'Maj7#5', '7', '7', 'm7b5', 'm7b5'],
    triadQualities:   ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
    romanNumerals:    ['i', 'ii', 'III', 'IV', 'V', 'vi°', 'vii°'],
    // Chords: Bbm(Maj7), Cm7, DbMaj7#5, Eb7, F7, Gm7b5, Am7b5
  },

  // Eb melodic minor ascending
  //   Natural minor: Eb F Gb Ab Bb Cb Db
  //   Raised ^6: Cb → C | Raised ^7: Db → D
  Eb: {
    rootMidi: 3,
    keySignature: -6,
    notes: ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'C', 'D'],
    raisedDegree6: 'C',   // Cb raised to C natural
    raisedDegree7: 'D',   // Db raised to D natural
    intervals: [0, 2, 3, 5, 7, 9, 11],
    seventhQualities: ['mMaj7', 'm7', 'Maj7#5', '7', '7', 'm7b5', 'm7b5'],
    triadQualities:   ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
    romanNumerals:    ['i', 'ii', 'III', 'IV', 'V', 'vi°', 'vii°'],
    // Chords: Ebm(Maj7), Fm7, GbMaj7#5, Ab7, Bb7, Cm7b5, Dm7b5
  },
};

// =============================================================================
// C. WHOLE TONE SCALES — All 12 Roots (2 unique collections)
// =============================================================================
// Source: Benward/Saker "Music in Theory and Practice" Vol. I, 9th ed., Ch. 7
//         pp. 131–133; Aldwell/Schachter 4th ed., Ch. 32 (20th-century scales).
//         Also: Schoenberg "Harmonielehre" (Theory of Harmony), Ch. on symmetric
//         scales; Persichetti "Twentieth-Century Harmony" Ch. 2.
//
// Interval pattern: [0, 2, 4, 6, 8, 10] — 6 notes (hexatonic)
//   All adjacent intervals are whole steps (2 semitones).
//   The scale divides the octave into 6 equal parts.
//
// SYMMETRY NOTE: Only 2 distinct whole tone scales exist as pitch-class sets.
//   Every root within the same collection produces the same 6 pitch classes.
//   Starting on a different note of the same collection merely rotates it.
//
//   Collection 1 (WT1): {C, D, E, F#, G#, A#}  — pitch classes {0,2,4,6,8,10}
//     Roots: C, D, E, F#/Gb, G#/Ab, A#/Bb (all rotate to same 6 PCs)
//
//   Collection 2 (WT2): {C#, D#, F, G, A, B}   — pitch classes {1,3,5,7,9,11}
//     Roots: C#/Db, D#/Eb, F, G, A, B (all rotate to same 6 PCs)
//
// Enharmonic spelling: No standard key signature applies. Conventional notation
//   uses 4 sharps (C D E F# G# A#) for WT1 and a mixed spelling for WT2 that
//   avoids excessive accidentals. When rooting on a flat key (Gb, Ab, Bb),
//   the flat spelling of that root is used but the remaining notes may mix.
//   Per Benward/Saker, common practice uses sharps ascending within the scale.
//
// Chord qualities: All triads built on whole-tone scale degrees are AUGMENTED.
//   All 7th chords are dominant 7th with raised 5th (7#5 = augmented dominant).
//   No leading tone exists; no diminished or minor triads possible.
//   (Debussy used this scale specifically to avoid tonal gravity.)
// =============================================================================

const WHOLE_TONE_INTERVALS = [0, 2, 4, 6, 8, 10];

// Only 2 unique collections — label which collection each root belongs to
const WHOLE_TONE_COLLECTION_1_PCS = [0, 2, 4, 6, 8, 10]; // C D E F# G# A#
const WHOLE_TONE_COLLECTION_2_PCS = [1, 3, 5, 7, 9, 11]; // C# D# F G A B

// Chord qualities for whole tone (all are the same — scale is fully symmetric)
// All triads: aug. All 7th chords: 7#5 (dominant with augmented fifth).
const WHOLE_TONE_TRIAD_QUALITY   = 'aug';  // same for every degree
const WHOLE_TONE_SEVENTH_QUALITY = '7#5';  // same for every degree

const WHOLE_TONE_SCALES_GROUND_TRUTH = {
  // ─── Collection 1: pitch classes {0,2,4,6,8,10} ──────────────────────────
  // Spelling notes for WT1:
  //   The "natural" spelling from C uses sharps: C D E F# G# A#
  //   Other roots rotate this same set of notes.
  //   Enharmonic roots (F#/Gb, G#/Ab, A#/Bb) shown with their canonical flat
  //   spelling as the root, remaining notes spelled to avoid double-accidentals.

  C: {
    collection: 1,
    rootMidi: 0,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['C', 'D', 'E', 'F#', 'G#', 'A#'],
    // Rotating WT1 to start on C. All adjacent intervals = W (whole step).
    // Note: F# preferred over Gb, G# preferred over Ab, A# preferred over Bb
    //       when spelling from a natural-note root in WT1. (Benward/Saker p.131)
    symmetryNote: 'Same 6 PCs as D, E, F#/Gb, G#/Ab, A#/Bb whole tone scales',
  },

  D: {
    collection: 1,
    rootMidi: 2,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['D', 'E', 'F#', 'G#', 'A#', 'C'],
    // Rotating WT1 to start on D.
    symmetryNote: 'Same 6 PCs as C, E, F#/Gb, G#/Ab, A#/Bb whole tone scales',
  },

  E: {
    collection: 1,
    rootMidi: 4,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['E', 'F#', 'G#', 'A#', 'C', 'D'],
    // Rotating WT1 to start on E. C and D are the "wrap-around" notes.
    symmetryNote: 'Same 6 PCs as C, D, F#/Gb, G#/Ab, A#/Bb whole tone scales',
  },

  'F#': {
    collection: 1,
    rootMidi: 6,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['F#', 'G#', 'A#', 'C', 'D', 'E'],
    enharmonicRoot: 'Gb',  // F# and Gb are the same pitch; use sharp form here
    symmetryNote: 'Same 6 PCs as C, D, E, G#/Ab, A#/Bb whole tone scales',
  },

  Gb: {
    collection: 1,
    rootMidi: 6,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['Gb', 'Ab', 'Bb', 'C', 'D', 'E'],
    // Spelling from Gb root: Gb Ab Bb — then C D E as naturals to avoid Cb/Fb
    // This mixes flat and natural spellings, which is standard for whole-tone
    // scales when rooted on flat notes. (Persichetti p. 43)
    enharmonicRoot: 'F#',
    symmetryNote: 'Same 6 PCs as C, D, E, F#, G#/Ab, A#/Bb whole tone scales',
  },

  'G#': {
    collection: 1,
    rootMidi: 8,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['G#', 'A#', 'C', 'D', 'E', 'F#'],
    enharmonicRoot: 'Ab',
    symmetryNote: 'Same 6 PCs as C, D, E, F#/Gb, A#/Bb whole tone scales',
  },

  Ab: {
    collection: 1,
    rootMidi: 8,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['Ab', 'Bb', 'C', 'D', 'E', 'F#'],
    // Ab Bb (flats), then C D E F# (mixed). F# avoids Gb; E avoids Fb.
    enharmonicRoot: 'G#',
    symmetryNote: 'Same 6 PCs as C, D, E, F#/Gb, G#, A#/Bb whole tone scales',
  },

  'A#': {
    collection: 1,
    rootMidi: 10,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['A#', 'C', 'D', 'E', 'F#', 'G#'],
    enharmonicRoot: 'Bb',
    symmetryNote: 'Same 6 PCs as C, D, E, F#/Gb, G#/Ab whole tone scales',
  },

  Bb: {
    collection: 1,
    rootMidi: 10,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['Bb', 'C', 'D', 'E', 'F#', 'G#'],
    // Bb C D (flat/naturals), then E F# G# (sharps to avoid Fb/Gb/Ab double-flat issues)
    enharmonicRoot: 'A#',
    symmetryNote: 'Same 6 PCs as C, D, E, F#/Gb, G#/Ab whole tone scales',
  },

  // ─── Collection 2: pitch classes {1,3,5,7,9,11} ──────────────────────────
  // Spelling notes for WT2:
  //   The "natural" spelling from C# uses: C# D# F G A B
  //   Note that F (not E#) is used — the scale crosses the E–F semitone gap,
  //   so E# would create a misleading notation. Conventional spelling uses F.
  //   Similarly B (not Cb) at the top. (Benward/Saker p.132)

  'C#': {
    collection: 2,
    rootMidi: 1,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['C#', 'D#', 'F', 'G', 'A', 'B'],
    // C# D# (sharps), F G A B (naturals). F = enharmonic E#; using F avoids confusion.
    enharmonicRoot: 'Db',
    symmetryNote: 'Same 6 PCs as Db/C#, D#/Eb, F, G, A, B whole tone scales',
  },

  Db: {
    collection: 2,
    rootMidi: 1,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['Db', 'Eb', 'F', 'G', 'A', 'B'],
    // Db Eb (flats), F G A B (naturals). Clean spelling with no awkward accidentals.
    enharmonicRoot: 'C#',
    symmetryNote: 'Same 6 PCs as C#/Db, D#/Eb, F, G, A, B whole tone scales',
  },

  'D#': {
    collection: 2,
    rootMidi: 3,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['D#', 'F', 'G', 'A', 'B', 'C#'],
    enharmonicRoot: 'Eb',
    symmetryNote: 'Same 6 PCs as Db/C#, Eb/D#, F, G, A, B whole tone scales',
  },

  Eb: {
    collection: 2,
    rootMidi: 3,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['Eb', 'F', 'G', 'A', 'B', 'Db'],
    // Eb F G A B (natural/mixed), Db instead of C# at the wrap — uses flat convention
    // consistent with Eb root. B is enharmonic Cb; B-natural preferred to avoid Cb.
    enharmonicRoot: 'D#',
    symmetryNote: 'Same 6 PCs as Db/C#, D#/Eb, F, G, A, B whole tone scales',
  },

  F: {
    collection: 2,
    rootMidi: 5,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['F', 'G', 'A', 'B', 'Db', 'Eb'],
    // F G A B (naturals), then Db Eb (flats). B preferred over Cb.
    symmetryNote: 'Same 6 PCs as Db/C#, D#/Eb, F, G, A, B whole tone scales',
  },

  G: {
    collection: 2,
    rootMidi: 7,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['G', 'A', 'B', 'Db', 'Eb', 'F'],
    // G A B (naturals), Db Eb (flats), F (natural). B preferred over Cb.
    symmetryNote: 'Same 6 PCs as Db/C#, D#/Eb, F, G, A, B whole tone scales',
  },

  A: {
    collection: 2,
    rootMidi: 9,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['A', 'B', 'Db', 'Eb', 'F', 'G'],
    // A B (naturals), Db Eb (flats), F G (naturals).
    symmetryNote: 'Same 6 PCs as Db/C#, D#/Eb, F, G, A, B whole tone scales',
  },

  B: {
    collection: 2,
    rootMidi: 11,
    intervals: [0, 2, 4, 6, 8, 10],
    notes: ['B', 'Db', 'Eb', 'F', 'G', 'A'],
    // B (natural), Db Eb (flats), F G A (naturals).
    symmetryNote: 'Same 6 PCs as Db/C#, D#/Eb, F, G, A, B whole tone scales',
  },
};

// =============================================================================
// D. DIMINISHED / OCTATONIC SCALES — All 12 Roots, Both Forms
// =============================================================================
// Source: Benward/Saker "Music in Theory and Practice" Vol. II, 9th ed., Ch. 3
//         pp. 52–56; Persichetti "Twentieth-Century Harmony" Ch. 2 pp. 46–50;
//         Aldwell/Schachter 4th ed., Ch. 32.
//         Also: Messiaen "Techniques of My Musical Language" (Mode of Limited
//         Transposition #2 = octatonic scale).
//
// Two forms of the diminished scale:
//
//   1. HALF-WHOLE (HW): starts with a half step, then alternates H-W
//      Interval pattern: [0, 1, 3, 4, 6, 7, 9, 10] — 8 notes
//      = H W H W H W H W
//      Usage: typically used over diminished 7th chords (vii°7, rootless dom7b9)
//
//   2. WHOLE-HALF (WH): starts with a whole step, then alternates W-H
//      Interval pattern: [0, 2, 3, 5, 6, 8, 9, 11] — 8 notes
//      = W H W H W H W H
//      Usage: also called "diminished scale" in jazz; used over dom7b9 chords
//
//   The two forms are rotations of each other: the WH starting on any note
//   is the HW starting on the note a whole step above (and vice versa).
//
// SYMMETRY: Only 3 unique octatonic scales exist as pitch-class sets.
//   The scale is symmetric at the minor third — transposing by 3 semitones
//   returns the same pitch-class set.
//
//   Group 1 (HW roots): C, Eb, F#/Gb, A   — same 8 PCs: {0,1,3,4,6,7,9,10}
//   Group 2 (HW roots): C#/Db, E, G, Bb   — same 8 PCs: {1,2,4,5,7,8,10,11}
//   Group 3 (HW roots): D, F, Ab/G#, B    — same 8 PCs: {0,2,3,5,6,8,9,11}
//
//   (For WH form, groups shift: C WH = same PCs as C HW but starting W step up)
//
// Enharmonic spelling: Diminished scales have no tonal key center in the
//   traditional sense. Conventional spelling avoids repeated letter names
//   across the 8 notes. The most common convention (used by Persichetti and
//   most jazz texts) is to use alternating sharps/naturals or flats/naturals
//   based on the starting note's side of the circle of fifths.
//   When a root has an enharmonic equivalent (C#/Db, F#/Gb, G#/Ab), both
//   spellings are provided.
// =============================================================================

const HALF_WHOLE_DIM_INTERVALS  = [0, 1, 3, 4, 6, 7, 9, 10];
const WHOLE_HALF_DIM_INTERVALS  = [0, 2, 3, 5, 6, 8, 9, 11];

// Group membership for the 3 unique octatonic collections
// (referenced by HW form root)
const OCTATONIC_GROUPS = {
  1: { hwRoots: ['C', 'Eb', 'F#', 'Gb', 'A'],        pitchClasses: [0,1,3,4,6,7,9,10]  },
  2: { hwRoots: ['C#', 'Db', 'E', 'G', 'Bb'],        pitchClasses: [1,2,4,5,7,8,10,11] },
  3: { hwRoots: ['D', 'F', 'G#', 'Ab', 'B'],         pitchClasses: [0,2,3,5,6,8,9,11]  },
};

const DIMINISHED_SCALES_GROUND_TRUTH = {

  // =========================================================================
  // HALF-WHOLE DIMINISHED (H-W-H-W-H-W-H-W)
  // =========================================================================
  // Spelling convention: from sharp-side roots use sharps/naturals;
  // from flat-side roots use flats/naturals. Avoid repeated letter names.
  // Note: some enharmonic spellings are unavoidable at the octave boundary.

  halfWhole: {
    intervals: [0, 1, 3, 4, 6, 7, 9, 10],

    // ─── Group 1: PCs {0,1,3,4,6,7,9,10} — roots C, Eb, F#/Gb, A ────────
    C: {
      group: 1, rootMidi: 0,
      notes: ['C', 'Db', 'Eb', 'E', 'F#', 'G', 'A', 'Bb'],
      // C(0) Db(1) Eb(3) E(4) F#(6) G(7) A(9) Bb(10)
      // Each letter used once: C Db Eb E F# G A Bb ✓
    },
    Eb: {
      group: 1, rootMidi: 3,
      notes: ['Eb', 'E', 'F#', 'G', 'A', 'Bb', 'C', 'Db'],
      // Rotation of C HW dim starting on Eb
    },
    'F#': {
      group: 1, rootMidi: 6,
      notes: ['F#', 'G', 'A', 'Bb', 'C', 'Db', 'Eb', 'E'],
      // Rotation of C HW dim starting on F#
    },
    Gb: {
      group: 1, rootMidi: 6,
      notes: ['Gb', 'G', 'A', 'Bb', 'C', 'Db', 'Eb', 'E'],
      // Gb enharmonic spelling of F#. Same 8 PCs.
      enharmonicOf: 'F#',
    },
    A: {
      group: 1, rootMidi: 9,
      notes: ['A', 'Bb', 'C', 'Db', 'Eb', 'E', 'F#', 'G'],
      // Rotation of C HW dim starting on A
    },

    // ─── Group 2: PCs {1,2,4,5,7,8,10,11} — roots C#/Db, E, G, Bb ───────
    'C#': {
      group: 2, rootMidi: 1,
      notes: ['C#', 'D', 'E', 'F', 'G', 'Ab', 'Bb', 'B'],
      // C#(1) D(2) E(4) F(5) G(7) Ab(8) Bb(10) B(11)
    },
    Db: {
      group: 2, rootMidi: 1,
      notes: ['Db', 'D', 'E', 'F', 'G', 'Ab', 'Bb', 'B'],
      enharmonicOf: 'C#',
    },
    E: {
      group: 2, rootMidi: 4,
      notes: ['E', 'F', 'G', 'Ab', 'Bb', 'B', 'C#', 'D'],
      // Rotation of C# HW dim starting on E
    },
    G: {
      group: 2, rootMidi: 7,
      notes: ['G', 'Ab', 'Bb', 'B', 'C#', 'D', 'E', 'F'],
      // Rotation of C# HW dim starting on G
    },
    Bb: {
      group: 2, rootMidi: 10,
      notes: ['Bb', 'B', 'C#', 'D', 'E', 'F', 'G', 'Ab'],
      // Rotation of C# HW dim starting on Bb
    },

    // ─── Group 3: PCs {0,2,3,5,6,8,9,11} — roots D, F, G#/Ab, B ─────────
    D: {
      group: 3, rootMidi: 2,
      notes: ['D', 'Eb', 'F', 'Gb', 'Ab', 'A', 'B', 'C'],
      // D(2) Eb(3) F(5) Gb(6) Ab(8) A(9) B(11) C(0)
      // Note: Gb preferred over F# here because Ab follows (flat context)
    },
    F: {
      group: 3, rootMidi: 5,
      notes: ['F', 'Gb', 'Ab', 'A', 'B', 'C', 'D', 'Eb'],
      // Rotation of D HW dim starting on F
    },
    'G#': {
      group: 3, rootMidi: 8,
      notes: ['G#', 'A', 'B', 'C', 'D', 'Eb', 'F', 'Gb'],
      // Rotation of D HW dim starting on G#
    },
    Ab: {
      group: 3, rootMidi: 8,
      notes: ['Ab', 'A', 'B', 'C', 'D', 'Eb', 'F', 'Gb'],
      enharmonicOf: 'G#',
    },
    B: {
      group: 3, rootMidi: 11,
      notes: ['B', 'C', 'D', 'Eb', 'F', 'Gb', 'Ab', 'A'],
      // Rotation of D HW dim starting on B
    },
  },

  // =========================================================================
  // WHOLE-HALF DIMINISHED (W-H-W-H-W-H-W-H)
  // =========================================================================
  // The WH form starting on note X has the same pitch-class set as the
  // HW form starting a whole step BELOW X.
  // Example: C WH = {C,D,Eb,F,F#,Ab,A,B} = same PCs as Bb HW.
  //
  // Group membership for WH form (based on PCs):
  //   WH roots C, Eb, F#/Gb, A   → PCs {0,2,3,5,6,8,9,11}  (= Group 3 PCs)
  //   WH roots C#/Db, E, G, Bb   → PCs {0,1,3,4,6,7,9,10}  (= Group 1 PCs)
  //   WH roots D, F, Ab/G#, B    → PCs {1,2,4,5,7,8,10,11} (= Group 2 PCs)

  wholeHalf: {
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],

    // ─── WH Group A: PCs {0,2,3,5,6,8,9,11} ─────────────────────────────
    C: {
      group: 'A', rootMidi: 0,
      notes: ['C', 'D', 'Eb', 'F', 'F#', 'Ab', 'A', 'B'],
      // C(0) D(2) Eb(3) F(5) F#(6) Ab(8) A(9) B(11)
      // Note: F# and Ab in same scale — unavoidable in WH diminished
    },
    Eb: {
      group: 'A', rootMidi: 3,
      notes: ['Eb', 'F', 'F#', 'Ab', 'A', 'B', 'C', 'D'],
    },
    'F#': {
      group: 'A', rootMidi: 6,
      notes: ['F#', 'Ab', 'A', 'B', 'C', 'D', 'Eb', 'F'],
    },
    Gb: {
      group: 'A', rootMidi: 6,
      notes: ['Gb', 'Ab', 'A', 'B', 'C', 'D', 'Eb', 'F'],
      enharmonicOf: 'F#',
    },
    A: {
      group: 'A', rootMidi: 9,
      notes: ['A', 'B', 'C', 'D', 'Eb', 'F', 'F#', 'Ab'],
    },

    // ─── WH Group B: PCs {0,1,3,4,6,7,9,10} ─────────────────────────────
    'C#': {
      group: 'B', rootMidi: 1,
      notes: ['C#', 'D#', 'E', 'F#', 'G', 'A', 'Bb', 'B'],
      // C#(1) D#(3-1=wait... let me recount)
      // WH from C#: C#(0) +2=D#(2rel=3abs) +1=E(3rel=4abs) +2=F#(5rel=6abs)
      //             +1=G(6rel=7abs) +2=A(8rel=9abs) +1=Bb(9rel=10abs) +2=B#...
      // Correct: C#=1, +2=D#(pc3), +1=E(pc4), +2=F#(pc6), +1=G(pc7), +2=A(pc9), +1=Bb(pc10), +2=B(pc12→0... no, pc11+1=12=0)
      // Wait: 1+2=3(D#), 3+1=4(E), 4+2=6(F#), 6+1=7(G), 7+2=9(A), 9+1=10(Bb), 10+2=12=0(C)...
      // Hmm that gives 8 notes ending on C not B. Let me recount WH intervals: [0,2,3,5,6,8,9,11]
      // From C#(pc1): 1+0=1(C#), 1+2=3(D#), 1+3=4(E), 1+5=6(F#), 1+6=7(G), 1+8=9(A), 1+9=10(Bb), 1+11=12→0(B#/C)
      // The 8th note at interval 11 above C# = B#(enharmonic C) — but convention spells as B#
      // However most texts spell this as: C# D# E F# G A Bb B (using B not B#)
      // B = pc11, not pc0. Interval from C#(pc1) to B(pc11) = 10 semitones, not 11.
      // Correct intervals [0,2,3,5,6,8,9,11] from C#: offsets are 0,2,3,5,6,8,9,11
      // pc1+11 = pc12 = pc0 = C/B# — so 8th note IS B# (= C enharmonic)
      // Standard jazz convention: use B# or just say the scale wraps. Texts often write "B"
      // accepting the enharmonic ambiguity. We use B# here for theoretical accuracy.
      notes: ['C#', 'D#', 'E', 'F#', 'G', 'A', 'Bb', 'B#'],
      // B# = enharmonic C; represents pc0 as the leading-tone approach to C#
    },
    Db: {
      group: 'B', rootMidi: 1,
      notes: ['Db', 'Eb', 'E', 'Gb', 'G', 'A', 'Bb', 'C'],
      // From Db(pc1): +11 semitones = pc12=pc0 = C (using flat convention: C not B#)
      enharmonicOf: 'C#',
    },
    E: {
      group: 'B', rootMidi: 4,
      notes: ['E', 'F#', 'G', 'A', 'Bb', 'C', 'Db', 'D#'],
      // E(4)+11=15→pc3=D# (or Eb). D# used since E is a sharp-side root.
      // From E: [0,2,3,5,6,8,9,11] → pcs [4,6,7,9,10,0,1,3] = E F# G A Bb C Db D#
    },
    G: {
      group: 'B', rootMidi: 7,
      notes: ['G', 'A', 'Bb', 'C', 'Db', 'Eb', 'E', 'F#'],
      // From G(7): [0,2,3,5,6,8,9,11] → pcs [7,9,10,0,1,3,4,6] = G A Bb C Db Eb E F#
    },
    Bb: {
      group: 'B', rootMidi: 10,
      notes: ['Bb', 'C', 'Db', 'Eb', 'E', 'F#', 'G', 'A'],
      // From Bb(10): [0,2,3,5,6,8,9,11] → pcs [10,0,1,3,4,6,7,9] = Bb C Db Eb E F# G A
    },

    // ─── WH Group C: PCs {1,2,4,5,7,8,10,11} ────────────────────────────
    D: {
      group: 'C', rootMidi: 2,
      notes: ['D', 'E', 'F', 'G', 'Ab', 'Bb', 'B', 'C#'],
      // From D(2): [0,2,3,5,6,8,9,11] → pcs [2,4,5,7,8,10,11,1] = D E F G Ab Bb B C#
    },
    F: {
      group: 'C', rootMidi: 5,
      notes: ['F', 'G', 'Ab', 'Bb', 'B', 'C#', 'D', 'E'],
      // From F(5): [0,2,3,5,6,8,9,11] → pcs [5,7,8,10,11,1,2,4] = F G Ab Bb B C# D E
    },
    'G#': {
      group: 'C', rootMidi: 8,
      notes: ['G#', 'A#', 'B', 'C#', 'D', 'E', 'F', 'G'],
      // From G#(8): [0,2,3,5,6,8,9,11] → pcs [8,10,11,1,2,4,5,7] = G# A#/Bb B C# D E F G
      // Using sharps from G# root: A# preferred over Bb
    },
    Ab: {
      group: 'C', rootMidi: 8,
      notes: ['Ab', 'Bb', 'B', 'Db', 'D', 'E', 'F', 'G'],
      // From Ab(8): same pcs, flat convention. Db preferred over C#.
      enharmonicOf: 'G#',
    },
    B: {
      group: 'C', rootMidi: 11,
      notes: ['B', 'C#', 'D', 'E', 'F', 'G', 'Ab', 'A#'],
      // From B(11): [0,2,3,5,6,8,9,11] → pcs [11,1,2,4,5,7,8,10] = B C# D E F G Ab A#/Bb
      // A# used (enharmonic Bb) since B is a sharp-side root
    },
  },
};

// =============================================================================
// E. PENTATONIC SCALES — All 12 Roots, Major and Minor Forms
// =============================================================================
// Source: Kostka/Payne/Almen "Tonal Harmony" 7th ed., Appendix (pentatonic);
//         Benward/Saker "Music in Theory and Practice" Vol. I, Ch. 7 pp. 128–131;
//         Aldwell/Schachter 4th ed., Ch. 2 (scale overview).
//
// MAJOR PENTATONIC: [0, 2, 4, 7, 9]
//   = Scale degrees 1, 2, 3, 5, 6 of the parent major scale
//   = Omits the 4th and 7th (the tritone-creating degrees)
//   = W W m3 W m3
//   Notes come directly from the major scale; enharmonic spelling is identical
//   to the major scale for that root.
//
// MINOR PENTATONIC: [0, 3, 5, 7, 10]
//   = Scale degrees 1, b3, 4, 5, b7 of the natural minor scale
//   = Omits the 2nd and b6 (the more dissonant degrees)
//   = m3 W W m3 W
//   Notes come directly from the natural minor scale; enharmonic spelling
//   matches the natural minor scale for that root.
//
//   Relationship: Minor pentatonic on root X = major pentatonic on the
//   relative major (X + 3 semitones). They share the same pitch-class set.
//   Example: A minor pentatonic = C major pentatonic (both = {A,C,D,E,G}).
//
// Note on "blues scale": not included here; the blues scale is an extension
// of the minor pentatonic with an added b5 passing tone. A separate constant
// could be added for that if needed.
// =============================================================================

const MAJOR_PENTATONIC_INTERVALS = [0, 2, 4, 7, 9];
const MINOR_PENTATONIC_INTERVALS = [0, 3, 5, 7, 10];

const PENTATONIC_SCALES_GROUND_TRUTH = {
  // Each entry has:
  //   majorNotes: [deg1, deg2, deg3, deg5, deg6] from parent major scale
  //   minorNotes: [deg1, b3, deg4, deg5, b7]     from parent natural minor scale
  //   relativeMajor: root of major pentatonic with same PCs as this minor pentatonic
  //   relativeMinor: root of minor pentatonic with same PCs as this major pentatonic

  C: {
    rootMidi: 9,
    majorNotes: ['C', 'D', 'E', 'G', 'A'],
    // From C major scale [C,D,E,F,G,A,B] → degrees 1,2,3,5,6 = C D E G A
    minorNotes: ['C', 'Eb', 'F', 'G', 'Bb'],
    // From C natural minor [C,D,Eb,F,G,Ab,Bb] → degrees 1,b3,4,5,b7 = C Eb F G Bb
    relativeMajorOfMinor: 'Eb',  // Eb major pentatonic has same PCs as C minor pentatonic
    relativeMinorOfMajor: 'A',   // A minor pentatonic has same PCs as C major pentatonic
  },

  'C#': {
    rootMidi: 1,
    majorNotes: ['C#', 'D#', 'E#', 'G#', 'A#'],
    // From C# major scale [C#,D#,E#,F#,G#,A#,B#] → degrees 1,2,3,5,6 = C# D# E# G# A#
    // E# and B# are the standard spellings in C# major (Kostka/Payne p. 34)
    minorNotes: ['C#', 'E', 'F#', 'G#', 'B'],
    // From C# natural minor [C#,D#,E,F#,G#,A,B] → degrees 1,b3,4,5,b7 = C# E F# G# B
    relativeMajorOfMinor: 'E',
    relativeMinorOfMajor: 'A#',
  },

  Db: {
    rootMidi: 1,
    majorNotes: ['Db', 'Eb', 'F', 'Ab', 'Bb'],
    // From Db major scale [Db,Eb,F,Gb,Ab,Bb,C] → degrees 1,2,3,5,6 = Db Eb F Ab Bb
    minorNotes: ['Db', 'Fb', 'Gb', 'Ab', 'Cb'],
    // From Db natural minor [Db,Eb,Fb,Gb,Ab,Bbb,Cb] — rare key; enharmonic = C# minor
    // Db minor is the enharmonic equivalent of C# minor. Texts often use C# minor instead.
    // Provided here for completeness: Db Fb Gb Ab Cb (Fb=enharmonic E, Cb=enharmonic B)
    enharmonicOf: 'C#',
    relativeMajorOfMinor: 'Fb', // = enharmonic E
    relativeMinorOfMajor: 'Bb',
  },

  D: {
    rootMidi: 2,
    majorNotes: ['D', 'E', 'F#', 'A', 'B'],
    // From D major scale [D,E,F#,G,A,B,C#] → degrees 1,2,3,5,6 = D E F# A B
    minorNotes: ['D', 'F', 'G', 'A', 'C'],
    // From D natural minor [D,E,F,G,A,Bb,C] → degrees 1,b3,4,5,b7 = D F G A C
    relativeMajorOfMinor: 'F',
    relativeMinorOfMajor: 'B',
  },

  'D#': {
    rootMidi: 3,
    majorNotes: ['D#', 'E#', 'F##', 'A#', 'B#'],
    // From D# major scale — extremely rare (enharmonic Eb major preferred).
    // Provided for completeness: D# major has F## and C## which are double-sharps.
    // Degrees 1,2,3,5,6 = D# E# F## A# B#
    minorNotes: ['D#', 'F#', 'G#', 'A#', 'C#'],
    // From D# natural minor [D#,E#,F#,G#,A#,B,C#] → degrees 1,b3,4,5,b7 = D# F# G# A# C#
    enharmonicOf: 'Eb',
    relativeMajorOfMinor: 'F#',
    relativeMinorOfMajor: 'B#',
  },

  Eb: {
    rootMidi: 3,
    majorNotes: ['Eb', 'F', 'G', 'Bb', 'C'],
    // From Eb major scale [Eb,F,G,Ab,Bb,C,D] → degrees 1,2,3,5,6 = Eb F G Bb C
    minorNotes: ['Eb', 'Gb', 'Ab', 'Bb', 'Db'],
    // From Eb natural minor [Eb,F,Gb,Ab,Bb,Cb,Db] → degrees 1,b3,4,5,b7 = Eb Gb Ab Bb Db
    relativeMajorOfMinor: 'Gb',
    relativeMinorOfMajor: 'C',
  },

  E: {
    rootMidi: 4,
    majorNotes: ['E', 'F#', 'G#', 'B', 'C#'],
    // From E major scale [E,F#,G#,A,B,C#,D#] → degrees 1,2,3,5,6 = E F# G# B C#
    minorNotes: ['E', 'G', 'A', 'B', 'D'],
    // From E natural minor [E,F#,G,A,B,C,D] → degrees 1,b3,4,5,b7 = E G A B D
    relativeMajorOfMinor: 'G',
    relativeMinorOfMajor: 'C#',
  },

  F: {
    rootMidi: 5,
    majorNotes: ['F', 'G', 'A', 'C', 'D'],
    // From F major scale [F,G,A,Bb,C,D,E] → degrees 1,2,3,5,6 = F G A C D
    minorNotes: ['F', 'Ab', 'Bb', 'C', 'Eb'],
    // From F natural minor [F,G,Ab,Bb,C,Db,Eb] → degrees 1,b3,4,5,b7 = F Ab Bb C Eb
    relativeMajorOfMinor: 'Ab',
    relativeMinorOfMajor: 'D',
  },

  'F#': {
    rootMidi: 6,
    majorNotes: ['F#', 'G#', 'A#', 'C#', 'D#'],
    // From F# major scale [F#,G#,A#,B,C#,D#,E#] → degrees 1,2,3,5,6 = F# G# A# C# D#
    minorNotes: ['F#', 'A', 'B', 'C#', 'E'],
    // From F# natural minor [F#,G#,A,B,C#,D,E] → degrees 1,b3,4,5,b7 = F# A B C# E
    relativeMajorOfMinor: 'A',
    relativeMinorOfMajor: 'D#',
  },

  Gb: {
    rootMidi: 6,
    majorNotes: ['Gb', 'Ab', 'Bb', 'Db', 'Eb'],
    // From Gb major scale [Gb,Ab,Bb,Cb,Db,Eb,F] → degrees 1,2,3,5,6 = Gb Ab Bb Db Eb
    minorNotes: ['Gb', 'A', 'B', 'Db', 'E'],
    // From Gb natural minor — rare (enharmonic F# minor preferred).
    // Gb minor: [Gb,Ab,A,B,Db,D,E] — uses many enharmonic notes. Provided for completeness.
    // Degrees 1,b3,4,5,b7 = Gb A(=Bbb) B(=Cb) Db E(=Fb)
    // Most texts would use F# minor pentatonic instead.
    enharmonicOf: 'F#',
    relativeMajorOfMinor: 'A', // = enharmonic Bbb
    relativeMinorOfMajor: 'Eb',
  },

  G: {
    rootMidi: 7,
    majorNotes: ['G', 'A', 'B', 'D', 'E'],
    // From G major scale [G,A,B,C,D,E,F#] → degrees 1,2,3,5,6 = G A B D E
    minorNotes: ['G', 'Bb', 'C', 'D', 'F'],
    // From G natural minor [G,A,Bb,C,D,Eb,F] → degrees 1,b3,4,5,b7 = G Bb C D F
    relativeMajorOfMinor: 'Bb',
    relativeMinorOfMajor: 'E',
  },

  'G#': {
    rootMidi: 8,
    majorNotes: ['G#', 'A#', 'B#', 'D#', 'E#'],
    // From G# major scale — very rare (enharmonic Ab major preferred).
    // Degrees 1,2,3,5,6 = G# A# B# D# E# (B# and E# are standard spellings here)
    minorNotes: ['G#', 'B', 'C#', 'D#', 'F#'],
    // From G# natural minor [G#,A#,B,C#,D#,E,F#] → degrees 1,b3,4,5,b7 = G# B C# D# F#
    enharmonicOf: 'Ab',
    relativeMajorOfMinor: 'B',
    relativeMinorOfMajor: 'E#',
  },

  Ab: {
    rootMidi: 8,
    majorNotes: ['Ab', 'Bb', 'C', 'Eb', 'F'],
    // From Ab major scale [Ab,Bb,C,Db,Eb,F,G] → degrees 1,2,3,5,6 = Ab Bb C Eb F
    minorNotes: ['Ab', 'Cb', 'Db', 'Eb', 'Gb'],
    // From Ab natural minor [Ab,Bb,Cb,Db,Eb,Fb,Gb] → degrees 1,b3,4,5,b7 = Ab Cb Db Eb Gb
    // Cb = enharmonic B; Fb = enharmonic E (Fb not in pentatonic, only Cb here)
    relativeMajorOfMinor: 'Cb', // = enharmonic B
    relativeMinorOfMajor: 'F',
  },

  A: {
    rootMidi: 9,
    majorNotes: ['A', 'B', 'C#', 'E', 'F#'],
    // From A major scale [A,B,C#,D,E,F#,G#] → degrees 1,2,3,5,6 = A B C# E F#
    minorNotes: ['A', 'C', 'D', 'E', 'G'],
    // From A natural minor [A,B,C,D,E,F,G] → degrees 1,b3,4,5,b7 = A C D E G
    relativeMajorOfMinor: 'C',
    relativeMinorOfMajor: 'F#',
  },

  'A#': {
    rootMidi: 10,
    majorNotes: ['A#', 'B#', 'C##', 'E#', 'F##'],
    // From A# major scale — extremely rare (enharmonic Bb major preferred).
    // Degrees 1,2,3,5,6 = A# B# C## E# F## (double-sharps required)
    minorNotes: ['A#', 'C#', 'D#', 'E#', 'G#'],
    // From A# natural minor [A#,B#,C#,D#,E#,F#,G#] → degrees 1,b3,4,5,b7 = A# C# D# E# G#
    enharmonicOf: 'Bb',
    relativeMajorOfMinor: 'C#',
    relativeMinorOfMajor: 'F##',
  },

  Bb: {
    rootMidi: 10,
    majorNotes: ['Bb', 'C', 'D', 'F', 'G'],
    // From Bb major scale [Bb,C,D,Eb,F,G,A] → degrees 1,2,3,5,6 = Bb C D F G
    minorNotes: ['Bb', 'Db', 'Eb', 'F', 'Ab'],
    // From Bb natural minor [Bb,C,Db,Eb,F,Gb,Ab] → degrees 1,b3,4,5,b7 = Bb Db Eb F Ab
    relativeMajorOfMinor: 'Db',
    relativeMinorOfMajor: 'G',
  },

  B: {
    rootMidi: 11,
    majorNotes: ['B', 'C#', 'D#', 'F#', 'G#'],
    // From B major scale [B,C#,D#,E,F#,G#,A#] → degrees 1,2,3,5,6 = B C# D# F# G#
    minorNotes: ['B', 'D', 'E', 'F#', 'A'],
    // From B natural minor [B,C#,D,E,F#,G,A] → degrees 1,b3,4,5,b7 = B D E F# A
    relativeMajorOfMinor: 'D',
    relativeMinorOfMajor: 'G#',
  },
};

// =============================================================================
// UPDATED CHORD INTERVAL STRUCTURES (extended for new scale types)
// =============================================================================
// Extended from original CHORD_INTERVALS to include harmonic/melodic minor types.

const CHORD_INTERVALS_EXTENDED = {
  // Original (diatonic major/minor)
  'Maj7':    [0, 4, 7, 11],   // major triad + major 7th
  'm7':      [0, 3, 7, 10],   // minor triad + minor 7th
  '7':       [0, 4, 7, 10],   // dominant 7th (major triad + minor 7th)
  'm7b5':    [0, 3, 6, 10],   // half-diminished (diminished triad + minor 7th)
  'maj':     [0, 4, 7],       // major triad
  'min':     [0, 3, 7],       // minor triad
  'dim':     [0, 3, 6],       // diminished triad

  // Harmonic/melodic minor additions
  'mMaj7':   [0, 3, 7, 11],   // minor triad + major 7th (tonic of harm./mel. minor)
  'Maj7#5':  [0, 4, 8, 11],   // augmented triad + major 7th (III+ chord in harm. minor)
  'dim7':    [0, 3, 6, 9],    // fully diminished 7th (vii° in harmonic minor)
  'aug':     [0, 4, 8],       // augmented triad

  // Whole tone additions
  '7#5':     [0, 4, 8, 10],   // dominant 7th with augmented 5th (whole-tone chord)
};

// =============================================================================
// Export for use in test runner
// =============================================================================
if (typeof module !== 'undefined') {
  module.exports = {
    // Original exports (preserved)
    MAJOR_SCALE_INTERVALS, MINOR_SCALE_INTERVALS,
    MAJOR_SEVENTH_QUALITIES, MAJOR_TRIAD_QUALITIES, MAJOR_ROMAN_NUMERALS,
    MINOR_SEVENTH_QUALITIES, MINOR_TRIAD_QUALITIES, MINOR_ROMAN_NUMERALS,
    MAJOR_SCALES_GROUND_TRUTH, MINOR_SCALES_GROUND_TRUTH,
    MODES_GROUND_TRUTH, ENHARMONIC_SPELLINGS, FLAT_KEY_PITCH_CLASSES,
    CHORD_INTERVALS,

    // New scale types (A–E)
    HARMONIC_MINOR_INTERVALS,
    HARMONIC_MINOR_SEVENTH_QUALITIES,
    HARMONIC_MINOR_TRIAD_QUALITIES,
    HARMONIC_MINOR_ROMAN_NUMERALS,
    HARMONIC_MINOR_SCALES_GROUND_TRUTH,

    MELODIC_MINOR_INTERVALS,
    MELODIC_MINOR_SEVENTH_QUALITIES,
    MELODIC_MINOR_TRIAD_QUALITIES,
    MELODIC_MINOR_ROMAN_NUMERALS,
    MELODIC_MINOR_SCALES_GROUND_TRUTH,

    WHOLE_TONE_INTERVALS,
    WHOLE_TONE_COLLECTION_1_PCS,
    WHOLE_TONE_COLLECTION_2_PCS,
    WHOLE_TONE_TRIAD_QUALITY,
    WHOLE_TONE_SEVENTH_QUALITY,
    WHOLE_TONE_SCALES_GROUND_TRUTH,

    HALF_WHOLE_DIM_INTERVALS,
    WHOLE_HALF_DIM_INTERVALS,
    OCTATONIC_GROUPS,
    DIMINISHED_SCALES_GROUND_TRUTH,

    MAJOR_PENTATONIC_INTERVALS,
    MINOR_PENTATONIC_INTERVALS,
    PENTATONIC_SCALES_GROUND_TRUTH,

    CHORD_INTERVALS_EXTENDED,
  };
}
