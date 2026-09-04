// =============================================================================
// SCALES.SIN M4L — recipe composition parity (Phase 8, Task 8.4)
//
// The whole point of Task 8.4 is that the DEVICE and the PLUGIN compose the
// same material. A JS port that merely "works" is not enough: if the two
// surfaces sample differently, the same artist at the same index gives
// different chords, which is precisely the cross-surface divergence the vocab
// plan exists to prevent.
//
// So the load-bearing case here is a GOLDEN VECTOR captured from the C++
// (Source/Engine/Evolve.cpp composeFromRecipe, run 2026-08-16 against this same
// vocab). If the BigInt mix ever drifts from the C++'s uint64 arithmetic — the
// realistic failure mode, since JS Number silently loses precision past 2^53 —
// these vectors diverge and this file fails.
//
// Run: node test_recipes.js
// =============================================================================

const path = require('path');
const { composeFromRecipe, sameLoopDegrees, drawFromRecipe } = require('./recipes.js');
const { loadVocabularySync } = require('./vocab_loader.js');

let failures = 0;
function check(name, cond, detail) {
    if (cond) { console.log(`PASS  ${name}`); }
    else { console.log(`FAIL  ${name}${detail ? '\n        ' + detail : ''}`); failures += 1; }
}

const vocab = loadVocabularySync(path.join(__dirname, '../../artist_vocab.json'));
const styles = vocab.styleTemplates;

// ── GOLDEN VECTORS — captured from the C++ engine, 2026-09-04 ────────────────
// Re-captured for Phase 4 (SCALES_VOCAB_EXPANSION_PLAN Task 4.3): raising
// frank_ocean and gospel to 5 recipes each shifts `progressionIndex %
// recipes.length` for every index even though neither artist's pool changed
// — see recipes.js's ROOT MOTION / composeFromRecipe comments and the GOLDEN
// VECTOR HAZARD note above. Re-captured via the [.oracle] dump
// (tools/recapture_recipe_vectors.sh), never re-derived from this file.
// Any divergence here means the two surfaces have stopped agreeing.
const GOLDEN = {
    frank_ocean: [
        ['bVI', 'im'],
        ['bVIImaj7', 'IImaj7'],
        ['bVIImaj7', 'im', 'Imaj7'],
        ['bVII', 'vim'],
        ['vim9', 'IImaj7', 'viim9'],
        ['Imaj7', 'vm', 'bVI', 'im'],
        ['Imaj7', 'bVIImaj7'],
        ['viim7', 'bVIImaj7', 'bII'],
        ['iim', 'bIII', 'vm'],
        ['IImaj7', 'iiim9', 'vim9'],
        ['Imaj7', 'im'],
        ['IV', 'Imaj7'],
    ],
    gospel: [
        ['V7/I/bass', 'IV', 'IVsus2'],
        ['IVsus2', 'I'],
        ['im', 'im7', 'I'],
        ['bVII', 'Isus4'],
        ['Iadd9', 'bVII', 'Vsus4'],
        ['V7/I/bass', 'IVsus2', 'IV'],
        ['Isus4', 'Vsus4', 'IV', 'I'],
        ['IV', 'im', 'immaj7'],
        ['bIVmaj7', 'iim7', 'IVsus2'],
        ['bVII', 'I', 'Iadd9'],
        ['IV', 'IVsus2', 'bVII'],
        ['IV', 'IVsus2'],
    ],
};

for (const [artist, expected] of Object.entries(GOLDEN)) {
    const tpl = styles[artist];
    if (!tpl) { check(`${artist} exists in the vocab`, false); continue; }
    let ok = true;
    let detail = '';
    for (let i = 0; i < expected.length; ++i) {
        const got = composeFromRecipe(tpl, i);
        if (JSON.stringify(got) !== JSON.stringify(expected[i])) {
            ok = false;
            detail += `\n        idx ${i}: got [${got}] want [${expected[i]}]`;
        }
    }
    check(`${artist}: composes byte-identically to the C++ engine`, ok, detail);
}

// ── determinism ──────────────────────────────────────────────────────────────
{
    let ok = true;
    for (const artist of Object.keys(styles)) {
        const tpl = styles[artist];
        if (!tpl.recipes || tpl.recipes.length === 0) continue;
        for (let i = 0; i < 8; ++i) {
            if (JSON.stringify(composeFromRecipe(tpl, i))
                !== JSON.stringify(composeFromRecipe(tpl, i))) { ok = false; }
        }
    }
    check('same index always yields the same progression', ok);
}

// ── variety: a lookup table gives exactly N and repeats ─────────────────────
{
    let worst = null;
    for (const artist of Object.keys(styles)) {
        const tpl = styles[artist];
        if (!tpl.recipes || tpl.recipes.length === 0) continue;   // dilla
        const seen = new Set();
        for (let i = 0; i < 12; ++i) seen.add(composeFromRecipe(tpl, i).join(' '));
        if (worst === null || seen.size < worst.n) worst = { artist, n: seen.size };
    }
    check('every recipe style gives >= 6 distinct in 12 presses', worst && worst.n >= 6,
          worst ? `worst: ${worst.artist} with ${worst.n}` : 'no recipe styles found');
}

// ── the anti-plagiarism guarantee ────────────────────────────────────────────
{
    const violations = [];
    for (const artist of Object.keys(styles)) {
        const tpl = styles[artist];
        if (!tpl.recipes || tpl.recipes.length === 0) continue;   // dilla replays, by design
        for (let i = 0; i < 40; ++i) {
            const got = composeFromRecipe(tpl, i);
            if (got.length === 0) continue;
            for (const prog of (tpl.progressions || [])) {
                if (sameLoopDegrees(got, prog.degrees || [])) {
                    violations.push(`${artist} idx ${i} == "${prog.label}"`);
                    break;
                }
            }
        }
    }
    check('never reproduces an authored progression (rotation-invariant)',
          violations.length === 0, violations.slice(0, 4).join('\n        '));
}

// ── dilla is excluded, deliberately ─────────────────────────────────────────
check('dilla carries no recipes (loop-point path owns him)',
      !styles.dilla.recipes || styles.dilla.recipes.length === 0);

// ── cycle fallback must not emit a one-chord "progression" ─────────────────
// glasper's recipe index 1 (the "never completes a cycle at all" pool per
// recipes.js's ROOT MOTION comment) is targeted via idx % recipes.length ==
// 1. Phase 4 (Task 4.2) appended two new recipes to glasper (indices 3-4),
// changing recipes.length from 3 to 5 — 37 % 3 == 1 no longer holds (37 % 5
// == 2), so the index is re-derived here (36 % 5 == 1) to keep exercising
// the same recipe rather than silently drifting onto an unrelated one.
{
    const got = composeFromRecipe(styles.glasper, 36);
    check('cycle recipes never fall back to a one-chord progression',
          got.length === 0 || got.length >= 2,
          `glasper idx 36 produced [${got}]`);
}

// ── pool-width rule, the property that makes plagiarism rare by construction ─
{
    let ok = true;
    let detail = '';
    for (const [artist, tpl] of Object.entries(styles)) {
        for (const r of (tpl.recipes || [])) {
            if (r.degreePool.length < r.lengthMax + 2) {
                ok = false;
                detail += `\n        ${artist}: pool ${r.degreePool.length} < lengthMax+2 (${r.lengthMax + 2})`;
            }
        }
    }
    check('|degreePool| >= lengthMax + 2 for every recipe', ok, detail);
}

// ── no back-to-back repeats (sampling is without replacement) ───────────────
{
    let ok = true;
    for (const [artist, tpl] of Object.entries(styles)) {
        if (!tpl.recipes || tpl.recipes.length === 0) continue;
        for (let i = 0; i < 20; ++i) {
            const got = composeFromRecipe(tpl, i);
            for (let k = 1; k < got.length; ++k) if (got[k] === got[k - 1]) ok = false;
        }
    }
    check('no chord repeats back-to-back within a drawn progression', ok);
}

// ── rootMotion is honoured, not merely authored ─────────────────────────────
// The regression this guards: `rootMotion` sat in the vocab while the sampler
// read only degreePool and the length bounds, so Glasper index 0 emitted
// bIIImaj9 -> bImaj13#11 -> bVImaj7 (a tritone, then a fourth) under a recipe
// whose sourceRule says "move by thirds, not by fourths/fifths". The field
// read as a guarantee and enforced nothing.
{
    const MAJOR = [0, 2, 4, 5, 7, 9, 11];
    const MINOR = [0, 2, 3, 5, 7, 8, 10];
    const ROMAN = { I: 0, II: 1, III: 2, IV: 3, V: 4, VI: 5, VII: 6,
                    i: 0, ii: 1, iii: 2, iv: 3, v: 4, vi: 5, vii: 6 };
    const rootPc = (deg, mode) => {
        const scale = (mode === 'minor') ? MINOR : MAJOR;
        let prefix = '';
        let rest = deg || '';
        if (rest.startsWith('b')) { prefix = 'b'; rest = rest.slice(1); }
        else if (rest.startsWith('#')) { prefix = '#'; rest = rest.slice(1); }
        const m = rest.match(/^(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)/);
        if (!m) return 0;
        let iv = scale[ROMAN[m[1]] ?? 0] ?? 0;
        if (prefix === 'b') iv = (iv - 1 + 12) % 12;
        if (prefix === '#') iv = (iv + 1) % 12;
        return ((iv % 12) + 12) % 12;
    };

    const violations = [];
    for (const [artist, tpl] of Object.entries(styles)) {
        const recipes = tpl.recipes || [];
        if (recipes.length === 0) continue;
        for (let i = 0; i < 60; ++i) {
            const recipe = recipes[((i % recipes.length) + recipes.length) % recipes.length];
            if (recipe.kind !== 'cycle' || !Array.isArray(recipe.rootMotion)
                || recipe.rootMotion.length === 0) continue;
            const allowed = new Set(recipe.rootMotion.map(v => (((v | 0) % 12) + 12) % 12));
            const mode = 'major';   // the fixed reference scale — see recipes.js
            const got = composeFromRecipe(tpl, i);
            for (let k = 1; k < got.length; ++k) {
                const step = ((rootPc(got[k], mode) - rootPc(got[k - 1], mode)) % 12 + 12) % 12;
                if (!allowed.has(step)) {
                    violations.push(`${artist} idx ${i}: ${got.join(' -> ')} steps by ${step}`);
                    break;
                }
            }
        }
    }
    check('cycle recipes move only by their declared rootMotion',
          violations.length === 0, violations.slice(0, 4).join('\n        '));
}

console.log(`\n${failures === 0 ? 'ALL TESTS PASS' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
