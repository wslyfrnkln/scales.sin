// =============================================================================
// SCALES.SIN — STYLE CONSTRAINTS (JS port of applyStyleConstraints in
// Source/Engine/ChordEngine.cpp)
//
// The plugin's C++ engine gained an executable constraint layer on 2026-07-26:
// the 118 prose style rules, hand-translated into machine-checkable enums, so a
// style finally BEHAVES differently rather than merely holding different
// authored progressions.
//
// The M4L device runs the JS engine, not the C++ one, so without this port the
// device would ship the old behaviour while the plugin ships the new one — two
// products with different musical brains. Same reasoning as transform.js.
//
// PARITY CONTRACT: this file mirrors applyStyleConstraints. The "plain chord"
// gate, the sus exclusion, and the three constraint families are the same
// logic. If one side changes, change both.
//
// NOTE ON SCOPE: tritone substitution is deliberately NOT here, even though
// joe_pass's rules ask for it. It already exists as a derivation OPERATOR
// (transform.js TRITONE_SUB). Doing it in both places substituted every
// dominant up front and left the operator nothing to do — measured in the C++
// build as joe_pass losing all tier-2 variety.
// =============================================================================
'use strict';

const DOMINANT_SUB = { NONE: 'none', SUS13: 'sus13', TRITONE: 'tritone' };
const MINOR_MODE   = { AEOLIAN: 'aeolian', DORIAN: 'dorian' };
const VOICING      = { CLOSED: 'closed', ROOTLESS: 'rootless', QUARTAL: 'quartal' };

const has = (chord, iv) => (chord.intervals || []).includes(iv);

/**
 * Apply a style's hard constraints to an already-resolved chord, in place.
 *
 * @param chord       { root, intervals, symbol, ... }
 * @param constraints the style's `constraints` object from artist_vocab.json
 */
function applyStyleConstraints (chord, constraints) {
    if (!constraints || !chord || !Array.isArray(chord.intervals)) return chord;

    // ONLY shape chords the artist's own vocabulary has NOT already shaped.
    //
    // A sus chord (4th, no 3rd) is already a deliberate voicing decision — it is
    // literally what several of these styles' rules ask for. An extended chord
    // (9ths and above) came from the extension map or the vocab. Both are left
    // alone: the constraint layer gives an opinion where the engine had none, it
    // does not overrule the artist's own vocabulary.
    //
    // In the C++ build, skipping this gate stripped the root from frank_ocean's
    // B7sus4 (leaving a rootless voicing with no root) and added a 6th to
    // dangelo's authored Cm9. Two shipped tests caught it.
    const hasThird = has(chord, 3) || has(chord, 4);
    const isSus    = has(chord, 5) && !hasThird;

    const plain = chord.intervals.length <= 4
               && has(chord, 0)
               && hasThird && !isSus
               && !has(chord, 14) && !has(chord, 15) && !has(chord, 17)
               && !has(chord, 21) && !has(chord, 9);
    if (!plain) return chord;

    // --- Selection: dominant substitution -----------------------------------
    const isDominant = has(chord, 4) && has(chord, 10);
    if (isDominant && constraints.dominantSubstitution === DOMINANT_SUB.SUS13) {
        // "Replace V7 with 13sus4 or sus2 — no leading tone, no resolution
        //  urge. This is the single biggest difference from bebop." (glasper)
        chord.intervals = [0, 5, 7, 10, 21];
        chord.symbol = (chord.symbol || '') + 'sus13';
    }

    // --- Selection: default minor mode ---------------------------------------
    const isMinor = has(chord, 3) && !has(chord, 4);
    if (isMinor && constraints.defaultMinorMode === MINOR_MODE.DORIAN
        && !has(chord, 9) && !has(chord, 21)) {
        // "Default minor mode is Dorian (natural 6th)."
        chord.intervals = [...chord.intervals, 21].sort((a, b) => a - b);
    }

    // --- Voicing shape -------------------------------------------------------
    if (constraints.voicingShape === VOICING.ROOTLESS && chord.intervals.length > 3) {
        // "Rootless cluster voicings: omit root" (glasper); "shell voicings"
        // (dangelo). The bass layer supplies the root — which is why the symbol
        // still names the full chord.
        chord.intervals = chord.intervals.filter(iv => iv !== 0);
    } else if (constraints.voicingShape === VOICING.QUARTAL && chord.intervals.length >= 3) {
        // "Sus chord removes tritone from dominant — chords sit as static
        //  groove-locked color" (herbie_hancock).
        chord.intervals = [0, 5, 10, 15];
    }

    return chord;
}

module.exports = { applyStyleConstraints, DOMINANT_SUB, MINOR_MODE, VOICING };
