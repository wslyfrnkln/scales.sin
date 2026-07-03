// =============================================================================
// SCALES.SIN M4L — MIDI CONVERSION
// VoicedChord {root: pitch class 0-11, intervals: semitones from root} → MIDI
// note numbers. MVP uses a fixed base octave (60 = C4 region, brainstorm edge
// case #4); voice-leading spread is post-MVP (D-05).
// =============================================================================

function voicedChordToMidiNotes(voicedChord, baseOctave = 60) {
    const root = voicedChord?.root ?? 0;
    return (voicedChord?.intervals ?? [])
        .map(iv => baseOctave + root + iv)
        // Enforce the MIDI invariant at runtime, not just in tests: corrupted
        // vocab data (NaN root, out-of-spec interval) must never reach
        // Max.outlet. Dropped notes are the degradation; reader is the patch,
        // which simply receives fewer notes for that chord.
        .filter(n => Number.isInteger(n) && n >= 0 && n <= 127);
}

module.exports = { voicedChordToMidiNotes };
