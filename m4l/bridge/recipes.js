// =============================================================================
// SCALES.SIN M4L — RECIPE COMPOSITION (Phase 8, Task 8.4)
//
// The JS twin of Source/Engine/Evolve.cpp's composeFromRecipe /
// drawFromRecipe / reproducesAuthored — kept in sync manually, do not diverge.
// C++ line references are tagged per function.
//
// WHY THIS EXISTS. Generate used to return progressions[index % count] on BOTH
// surfaces: a lookup table that replayed the artist's catalogue and then
// repeated. Phase 8 replaced it with composition from each style's `recipes`
// (a degree pool, length bounds, a cadence policy, and the rule line it
// encodes). This file is the device's half — without it the M4L device and the
// plugin would resolve the same artist to different material, which is exactly
// the cross-surface divergence the vocab plan exists to prevent.
//
// DETERMINISM WITHOUT AN RNG OBJECT (C++: drawFromRecipe). A splitmix64-style
// mix over (progressionIndex, attempt) means the same index always yields the
// same progression, on every machine and every run. JS has no 64-bit integer
// arithmetic in Number, so the mix runs on BigInt and is masked to 64 bits at
// every step — a Number-based port would silently lose precision past 2^53 and
// drift from the C++ after a few presses.
//
// dilla carries NO recipes by deliberate decision (Wes, 2026-08-16): his
// technique is harmony-as-sample-loop-point, which a degree pool cannot
// express. An empty recipes array is the signal to fall through to the
// authored-progression path, not an error.
// =============================================================================

const MASK64 = (1n << 64n) - 1n;

// C++: the `mix` lambda inside drawFromRecipe (splitmix64 finaliser).
function mix64(x) {
    x = (x + 0x9E3779B97F4A7C15n) & MASK64;
    x = ((x ^ (x >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
    x = ((x ^ (x >> 27n)) * 0x94D049BB133111EBn) & MASK64;
    return (x ^ (x >> 31n)) & MASK64;
}

// C++: sameLoopDegrees. Rotation-invariant — a progression starting on a
// different chord of the same cycle IS the same loop, and anything less strict
// lets a one-rotation reproduction through, which is precisely the shape a
// permuting sampler produces.
function sameLoopDegrees(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length || a.length === 0) return false;
    for (let r = 0; r < a.length; ++r) {
        let match = true;
        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[(i + r) % b.length]) { match = false; break; }
        }
        if (match) return true;
    }
    return false;
}

// C++: reproducesAuthored.
function reproducesAuthored(template, candidate) {
    for (const prog of (template.progressions || [])) {
        if (sameLoopDegrees(candidate, prog.degrees || [])) return true;
    }
    return false;
}

// C++: drawFromRecipe. Samples WITHOUT replacement — a progression repeating
// the same degree back-to-back reads as a stutter, not a technique. The
// authoring rule (|degreePool| >= lengthMax + 2) guarantees room to draw.
function drawFromRecipe(recipe, progressionIndex, attempt) {
    const idx = BigInt.asUintN(64, BigInt(progressionIndex >>> 0));
    const att = BigInt.asUintN(64, BigInt(attempt >>> 0));
    let state = mix64((idx * 0x100000001B3n + att) & MASK64);
    const next = () => { state = mix64(state); return state; };

    const lengthMin = Math.max(1, recipe.lengthMin | 0);
    const lengthMax = Math.max(lengthMin, recipe.lengthMax | 0);
    const span = lengthMax - lengthMin + 1;
    const len = lengthMin + Number(next() % BigInt(span > 0 ? span : 1));

    const pool = [...(recipe.degreePool || [])];
    const out = [];
    for (let i = 0; i < len && pool.length > 0; ++i) {
        const pick = Number(next() % BigInt(pool.length));
        out.push(pool[pick]);
        pool.splice(pick, 1);
    }
    return out;
}

// C++: composeFromRecipe.
//
// THE RUNTIME REJECT IS REQUIRED — pool widening cannot reach zero, because a
// style's own degrees necessarily stay in its own pool. Measured across the
// authored corpus: 126 of 1,417,284 reachable ordered samples (0.0089%) spell
// an authored progression. Only a runtime check closes that, and only a runtime
// check makes the guarantee testable rather than probabilistic.
//
// Bounded attempts, then the honest fallback: return the last draw rather than
// loop forever or return nothing. At that hit rate 8 failures is effectively
// impossible; if it happened, a slightly-familiar progression beats silence.
const MAX_ATTEMPTS = 8;

function composeFromRecipe(template, progressionIndex) {
    const recipes = template && template.recipes;
    if (!Array.isArray(recipes) || recipes.length === 0) return [];

    const count = recipes.length;
    let idx = progressionIndex % count;
    if (idx < 0) idx += count;
    const recipe = recipes[idx];

    let candidate = [];
    for (let attempt = 0; attempt < MAX_ATTEMPTS; ++attempt) {
        candidate = drawFromRecipe(recipe, progressionIndex, attempt);
        if (candidate.length === 0) break;
        if (!reproducesAuthored(template, candidate)) return candidate;
    }
    return candidate;
}

module.exports = {
    composeFromRecipe,
    drawFromRecipe,
    reproducesAuthored,
    sameLoopDegrees,
    MAX_ATTEMPTS,
};
