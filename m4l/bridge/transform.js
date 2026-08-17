// =============================================================================
// SCALES.SIN — DERIVATION LAYER (JS port of Source/Engine/Transform.cpp)
//
// The plugin's C++ engine gained an operator layer on 2026-07-25: negative
// harmony, tritone substitution and modal interchange, plus generateVaried,
// which stops an artist repeating once their authored progressions run out
// (J Dilla has 3, so Generate looped after three presses).
//
// The M4L device runs the JS engine, not the C++ one, so without this port the
// device would ship the old lookup-only behaviour while the plugin ships the
// new one — two products with different musical brains. Wes, 2026-07-25: "the
// library we built needs to be accessible to be shipped."
//
// PARITY CONTRACT: this file mirrors Source/Engine/Transform.cpp. The axis
// convention, the shape table (including the rootless/9th shapes) and the
// ranking scores are the same numbers. If one side changes, change both — the
// C++ tests in Tests/test_Transform.cpp are the shared ground truth, asserted
// against Tests/fixtures/harmony_operators.json.
//
// Negative harmony's axis derivation and why the reference doc's section 3.2 is
// wrong: Scales.sin Plugin/Source/Engine/NEGATIVE_HARMONY_AXIS.md
// =============================================================================
'use strict';

const pc = n => ((n % 12) + 12) % 12;

const NOTE_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const FLAT_ROOTS = new Set([1, 3, 6, 8, 10]);
const noteName = p => (FLAT_ROOTS.has(pc(p)) ? NOTE_FLAT : NOTE_SHARP)[pc(p)];

const OPS = {
    VOCAB:             'VOCAB',
    NEGATIVE_HARMONY:  'NEGATIVE HARMONY',
    TRITONE_SUB:       'TRITONE SUB',
    MODAL_INTERCHANGE: 'MODAL INTERCHANGE',
};

// Chord shapes a derived pitch-class set can be named as. Mirrors kShapes in
// Transform.cpp — INCLUDING the rootless/9th entries. Those matter: the artist
// vocab voices chords rootlessly (frank_ocean's Cm9 is {0,3,10,14}), and a
// table of only root-position shapes fails to name the reflection of one, which
// silently demoted negative harmony on ordinary input.
//
// Interval lists MUST be sorted ascending — the matcher sorts before comparing.
const SHAPES = [
    { name: 'maj7', suffix: 'maj7', ivs: [0, 4, 7, 11] },
    { name: 'min7', suffix: 'm7',   ivs: [0, 3, 7, 10] },
    { name: 'dom7', suffix: '7',    ivs: [0, 4, 7, 10] },
    { name: 'min6', suffix: 'm6',   ivs: [0, 3, 7,  9] },
    { name: 'maj6', suffix: '6',    ivs: [0, 4, 7,  9] },
    { name: 'min9', suffix: 'm9',   ivs: [0, 2, 3, 10] },
    { name: 'maj9', suffix: 'maj9', ivs: [0, 2, 4, 11] },
    { name: 'dom9', suffix: '9',    ivs: [0, 2, 4, 10] },
    { name: 'min9', suffix: 'm9',   ivs: [0, 2, 3,  7] },
    { name: 'maj',  suffix: '',     ivs: [0, 4, 7] },
    { name: 'min',  suffix: 'm',    ivs: [0, 3, 7] },
];

const sortedUnique = xs => [...new Set(xs)].sort((a, b) => a - b);

function pitchClassesOf (chord) {
    return sortedUnique((chord.intervals || []).map(iv => pc(chord.root + iv)));
}

function intervalsFrom (pcs, rootPc) {
    return pcs.map(p => pc(p - rootPc)).sort((a, b) => a - b);
}

function isDominantShape (chord) {
    const ivs = intervalsFrom(pitchClassesOf(chord), pc(chord.root));
    return ivs.includes(4) && ivs.includes(10);
}

// Name a pitch-class set, preferring a given root. Returns null when no shape
// matches exactly — the caller then keeps the raw intervals rather than forcing
// a wrong name onto them.
function nameSet (pcs, preferRootPc) {
    const order = [];
    if (pcs.includes(pc(preferRootPc))) order.push(pc(preferRootPc));
    for (const p of pcs) if (!order.includes(p)) order.push(p);

    for (const root of order) {
        const ivs = intervalsFrom(pcs, root);
        for (const s of SHAPES) {
            if (ivs.length !== s.ivs.length) continue;
            if (ivs.every((v, i) => v === s.ivs[i]))
                return { root, quality: s.name, suffix: s.suffix, intervals: ivs };
        }
    }
    return null;
}

// Build the output chord. The OPERATOR'S OWN INTERVALS ALWAYS WIN — an earlier
// C++ draft substituted the artist's vocab voicing here, which changes the pitch
// classes and broke the involution (reflecting twice no longer returned the
// original). A derived chord is a computed set; a stylistic voicing over it is a
// different chord.
function materialise (rootPc, quality, suffix, intervals, registerAnchor) {
    let root = pc(rootPc);
    while (root < registerAnchor - 6) root += 12;
    while (root > registerAnchor + 6) root -= 12;
    return {
        root,
        intervals: intervals.slice(),
        symbol: noteName(root) + suffix,
        degree: '',
        matchType: 'derived',
        flag: '',
    };
}

function minimumInputChords (op) {
    return op === OPS.VOCAB ? 2 : 1;
}

// Rank the operators best-first. Deterministic: identical input yields an
// identical order, which is what makes a given press index reproducible.
//
// The metric only has to be ORDERED, not correct — pressing again advances to
// the next operator, so a bad ranking costs one press rather than a wrong
// answer. VOCAB scores highest for ordinary input so the FIRST press is still
// the artist's authored voice.
function rankOperators (chords, tonicPc, mode) {
    const n = chords.length;
    const scored = [];

    scored.push({ op: OPS.VOCAB, score: n >= 2 ? 3.0 : 0.0, order: 0 });

    const dominants = chords.filter(isDominantShape).length;
    scored.push({ op: OPS.TRITONE_SUB,
                  score: dominants > 0 ? 2.0 + dominants : 0.0, order: 2 });

    scored.push({ op: OPS.NEGATIVE_HARMONY,
                  score: n >= 2 ? 2.5 : (n === 1 ? 1.5 : 0.0), order: 1 });

    // Modal interchange only earns a slot when it would actually change
    // something — count the chords whose third would flip. An earlier draft used
    // a loose proxy that counted almost every chord, which scored this above
    // VOCAB and stole the first press from the artist's authored voice (caught
    // by the parity test's "VOCAB leads for ordinary input" case).
    const changed = chords.filter(c => {
        const ivs = intervalsFrom(pitchClassesOf(c), pc(c.root));
        return ivs.includes(3) || ivs.includes(4);   // has a third to flip
    }).length;
    scored.push({ op: OPS.MODAL_INTERCHANGE,
                  score: changed > 0 ? 2.0 + 0.25 * changed : 0.0, order: 3 });

    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => (b.score - a.score) || (a.order - b.order))
        .map(s => s.op);
}

// Apply one operator. Never silently truncates: an operator that cannot express
// a chord reports it via rejectedCount + reason.
function transformSection (chords, op, tonicPc, mode) {
    const result = { chords: [], rejectedCount: 0, reason: '', opLabel: op };

    if (chords.length < minimumInputChords(op)) {
        result.reason = 'input-too-short';
        return result;
    }
    if (op === OPS.VOCAB) {
        result.chords = chords.slice();
        return result;
    }

    const anchor = chords[0].root;

    for (const c of chords) {
        const pcs = pitchClassesOf(c);
        let outPcs = [];
        let preferRoot = pc(c.root);

        if (op === OPS.NEGATIVE_HARMONY) {
            // Reflect about (2T + 7). Involution: applying it twice returns the
            // original set — the property the reference doc's own section 3.5
            // requires, and the one that falsified its section 3.2 table.
            const axis = 2 * pc(tonicPc) + 7;
            outPcs = sortedUnique(pcs.map(p => pc(axis - p)));
            preferRoot = pc(axis - pc(c.root));
        } else if (op === OPS.TRITONE_SUB) {
            if (!isDominantShape(c)) { result.chords.push(c); continue; }
            const newRoot = pc(c.root + 6);
            outPcs = sortedUnique([0, 4, 7, 10].map(iv => pc(newRoot + iv)));
            preferRoot = newRoot;
        } else if (op === OPS.MODAL_INTERCHANGE) {
            // Borrow the parallel mode: flip the third, keeping root and any
            // 7th/9th colour. A chord already matching the parallel form passes
            // through unchanged and is NOT counted as rejected.
            const ivs = intervalsFrom(pcs, pc(c.root));
            const isMin = ivs.includes(3);
            const flipped = ivs.map(v => (v === 3 ? 4 : v === 4 ? 3 : v));
            if (flipped.every((v, i) => v === ivs[i])) { result.chords.push(c); continue; }
            outPcs = sortedUnique(flipped.map(iv => pc(c.root + iv)));
            preferRoot = pc(c.root);
            void isMin;
        }

        if (outPcs.length === 0) {
            result.rejectedCount += 1;
            if (!result.reason) result.reason = 'empty-transform';
            continue;
        }

        const named = nameSet(outPcs, preferRoot);
        if (named) {
            result.chords.push(materialise(named.root, named.quality, named.suffix,
                                           named.intervals, anchor));
        } else {
            // Keep the harmony rather than dropping it, but REPORT it.
            result.chords.push({
                root: pc(preferRoot),
                intervals: intervalsFrom(outPcs, pc(preferRoot)),
                symbol: noteName(preferRoot),
                degree: '', matchType: 'derived', flag: '',
            });
            result.rejectedCount += 1;
            if (!result.reason) result.reason = 'unnameable-set';
        }
    }

    if (result.chords.length === 0 && !result.reason) result.reason = 'no-output';
    return result;
}

// generateVaried — two-tier Generate.
//
//   tier 0   the artist's authored progressions, verbatim (unchanged behaviour)
//   tier 1+  those same progressions through the derivation operators
//
// So N authored progressions and K applicable operators give N*(K+1) results,
// all bounded by that artist's material and the selected key. This is the fix
// for "generate in JDilla is giving me the same 3 chord progressions".
//
// resolveProgression(artistKey, tonicPc, mode, index, labelSlot) -> chord array,
// supplied by the caller so this module stays independent of the vocab loader.
// `index` is the resolve index (the full press index when recipes drive
// generation); `labelSlot` is always index % authoredCount, for label lookup.
function generateVaried (resolveProgression, authoredCount, artistKey,
                         tonicPc, mode, index, recipeDriven = false) {
    if (authoredCount <= 0) return { chords: [], label: '' };
    if (index < 0) index = 0;

    const tier = Math.floor(index / authoredCount);
    const slot = index % authoredCount;

    // PASS THE FULL INDEX WHEN RECIPES DRIVE GENERATION (Phase 8, Task 8.4 —
    // mirrors the identical fix in Source/Engine/Transform.cpp).
    //
    // `slot` collapses the press counter modulo the AUTHORED count, which was
    // right when resolveProgression was a lookup table over exactly that many
    // progressions. Under recipes it is a VARIETY CAP: gospel authored 6, so
    // every press mapped onto 6 slots and the sampler could never be asked for
    // a 7th distinct progression however wide its pools were. Measured C++-side
    // before the fix: 6 distinct in 12 presses, against 11 from the composer
    // alone.
    //
    // `slot` is still correct for the authored-label lookup and the tier walk —
    // both of those genuinely are per-authored-progression. So the callback gets
    // BOTH: the resolve index (uncapped under recipes) and the label slot, which
    // always stays in range of the authored progressions.
    const base = resolveProgression(artistKey, tonicPc, mode,
                                    recipeDriven ? index : slot, slot);
    if (!base || base.chords.length === 0) return { chords: [], label: '' };

    if (tier === 0) return { chords: base.chords, label: base.label };

    const ranked = rankOperators(base.chords, tonicPc, mode)
        .filter(op => op !== OPS.VOCAB);
    if (ranked.length === 0) return { chords: base.chords, label: base.label };

    const op = ranked[(tier - 1) % ranked.length];
    const t = transformSection(base.chords, op, tonicPc, mode);

    if (t.chords.length === 0 || t.rejectedCount > 0)
        return { chords: base.chords, label: base.label };

    return { chords: t.chords, label: `${base.label} / ${t.opLabel}` };
}

module.exports = {
    OPS, pc, noteName,
    pitchClassesOf, intervalsFrom, isDominantShape, nameSet,
    minimumInputChords, rankOperators, transformSection, generateVaried,
};
