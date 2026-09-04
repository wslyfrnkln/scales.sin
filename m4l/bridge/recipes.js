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

// GOLDEN VECTOR HAZARD (2026-09-04, U-02 recon)
// test_recipes.js:34-51 pins hand-captured C++ vectors for frank_ocean and
// gospel only; no capture tool exists. Any change to those two artists'
// degreePool, lengthMin, lengthMax, or rootMotion invalidates them; they must
// be RE-CAPTURED FROM THE C++ ENGINE (Phase 3's [oracle] dump), never
// re-derived from this file, because a JS-derived vector makes the test
// self-certifying and destroys the only cross-language parity assertion in
// the project.

const MASK64 = (1n << 64n) - 1n;

// ── ROOT MOTION (cycle recipes) ──────────────────────────────────────────────
//
// `rootMotion` was authored on every `kind: "cycle"` recipe and then read by
// nobody: the sampler drew from degreePool on length bounds alone, so Glasper
// index 0 could emit bIIImaj9 -> bImaj13#11 -> bVImaj7 — a tritone and a
// fourth — under a recipe whose own sourceRule says "move by thirds, not by
// fourths/fifths". An authored constraint that silently licenses its own
// violation is worse than no constraint, because the rule line reads as a
// guarantee.
//
// MEASURED, against this vocab (all three cycle recipes, both modes):
// requiring EVERY consecutive step to match rootMotion is not satisfiable at
// the authored lengthMax. A major-third cycle closes after exactly 3 roots
// (0-4-8), so a 4th chord must revisit a pitch class — which the existing
// no-replacement rule forbids. glasper 0 has 3 valid chains at length 3 and
// zero at length 4; glasper 1 and joe_pass 3 have pools that never complete a
// cycle at all (their pitch classes skip a step).
//
// So enforcement is BEST-EFFORT-LONGEST, not all-or-nothing: extend the chain
// while the pool can honour rootMotion and stop when it cannot, rather than
// return nothing. A short, RULE-TRUE cycle is the honest output — it is what
// the technique actually is. Falling back to an unconstrained draw would just
// reinstate the violation this fixes.
//
// Mirrors degree_resolver.js's degreeStringToRoot; root motion is measured in
// pitch classes, so it is tonic-invariant and the tonic is irrelevant here.
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];
const ROMAN_MAP = { I: 0, II: 1, III: 2, IV: 3, V: 4, VI: 5, VII: 6,
                    i: 0, ii: 1, iii: 2, iv: 3, v: 4, vi: 5, vii: 6 };

function degreeRootPc(degreeStr, mode) {
    if (!degreeStr) return 0;
    const scale = (mode === 'minor') ? MINOR_SCALE : MAJOR_SCALE;

    let prefix = '';
    let rest = degreeStr;
    if (rest.startsWith('b')) { prefix = 'b'; rest = rest.slice(1); }
    else if (rest.startsWith('#')) { prefix = '#'; rest = rest.slice(1); }

    const romanMatch = rest.match(/^(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)/);
    if (!romanMatch) return 0;

    let interval = scale[ROMAN_MAP[romanMatch[1]] ?? 0] ?? 0;
    if (prefix === 'b') interval = (interval - 1 + 12) % 12;
    if (prefix === '#') interval = (interval + 1) % 12;
    return ((interval % 12) + 12) % 12;
}

// True when `recipe` declares root motion this sampler must honour.
function hasRootMotion(recipe) {
    return recipe
        && recipe.kind === 'cycle'
        && Array.isArray(recipe.rootMotion)
        && recipe.rootMotion.length > 0;
}

function allowedSteps(recipe) {
    return new Set(recipe.rootMotion.map(v => (((v | 0) % 12) + 12) % 12));
}

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

    // Non-cycle recipes keep the original draw EXACTLY — same RNG call
    // sequence, same result. The golden vectors captured from the C++ engine
    // cover this path, and rootMotion is a cycle-only field.
    if (!hasRootMotion(recipe)) {
        for (let i = 0; i < len && pool.length > 0; ++i) {
            const pick = Number(next() % BigInt(pool.length));
            out.push(pool[pick]);
            pool.splice(pick, 1);
        }
        return out;
    }

    // MAJOR is the reference scale, deliberately. Composition happens before a
    // mode exists: `mode` is a runtime control the player turns, and
    // composeFromRecipe is handed only (template, index) — so the cycle has to
    // be checked against one fixed reading of the degree tokens. Major is that
    // reading. The pools are spelled with flats (bI, bIII, bVI), which are
    // flats relative to the MAJOR scale, and measured against this vocab it is
    // the only reading under which the authored rootMotion is satisfiable at
    // all — resolving these same pools against the minor scale yields zero
    // valid chains for every cycle recipe. Degrees are transposition- and
    // mode-stable tokens; the resolver applies the player's mode afterwards.
    const steps = allowedSteps(recipe);
    const mode = 'major';
    let prevPc = null;

    for (let i = 0; i < len && pool.length > 0; ++i) {
        // After the first chord, only degrees reachable by a declared root
        // motion are eligible. Draw from that eligible set — never from the
        // full pool followed by a reject, which would let the RNG walk into a
        // dead end and emit the violating chord anyway.
        const eligible = (prevPc === null)
            ? pool.map((_, k) => k)
            : pool.reduce((acc, deg, k) => {
                const step = ((degreeRootPc(deg, mode) - prevPc) % 12 + 12) % 12;
                if (steps.has(step)) acc.push(k);
                return acc;
              }, []);

        // The cycle has closed on this pool — stop rather than break the rule.
        if (eligible.length === 0) break;

        const pick = eligible[Number(next() % BigInt(eligible.length))];
        out.push(pool[pick]);
        prevPc = degreeRootPc(pool[pick], mode);
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

    // A rootMotion-constrained draw stops early when the cycle closes on the
    // remaining pool, so it can bottom out at a single chord — which is not a
    // progression. Re-roll for a usable one; the attempt loop already exists
    // for the analogous plagiarism reject, and a different attempt seeds a
    // different starting degree, which is exactly what changes how far the
    // cycle runs. `best` keeps the longest draw seen so we degrade to the
    // closest usable cycle; a single chord is not a progression, so let the
    // resolver fall back instead of returning one.
    const wantsCycle = hasRootMotion(recipe);
    let candidate = [];
    let best = [];
    for (let attempt = 0; attempt < MAX_ATTEMPTS; ++attempt) {
        candidate = drawFromRecipe(recipe, progressionIndex, attempt);
        if (candidate.length === 0) break;
        if (candidate.length > best.length) best = candidate;
        if (wantsCycle && candidate.length < 2) continue;
        if (!reproducesAuthored(template, candidate)) return candidate;
    }
    return wantsCycle ? (best.length >= 2 ? best : []) : candidate;
}

module.exports = {
    composeFromRecipe,
    drawFromRecipe,
    reproducesAuthored,
    sameLoopDegrees,
    MAX_ATTEMPTS,
};
