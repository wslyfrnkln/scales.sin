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

// ── GOLDEN VECTORS — captured from the C++ engine, 2026-08-16 ────────────────
// Any divergence here means the two surfaces have stopped agreeing.
const GOLDEN = {
    frank_ocean: [
        ['bVI', 'im'],
        ['bVIImaj7', 'IImaj7'],
        ['bVIImaj7', 'im', 'Imaj7'],
        ['vm', 'Imaj7'],
        ['IV', 'Imaj7'],
        ['viim7', 'im', 'bII', 'bVIImaj7'],
    ],
    gospel: [
        ['V7/I/bass', 'IV', 'IVsus2'],
        ['IVsus2', 'I'],
        ['im', 'im7', 'I'],
        ['IVsus2', 'bVII'],
        ['Vsus4', 'Isus4', 'IV'],
        ['IV', 'im7', 'immaj7', 'im'],
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

console.log(`\n${failures === 0 ? 'ALL TESTS PASS' : failures + ' FAILURES'}`);
process.exit(failures === 0 ? 0 : 1);
