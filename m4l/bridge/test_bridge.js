// =============================================================================
// SCALES.SIN M4L — STANDALONE BRIDGE TEST (Task 1.4 / Phase 1 verify)
// Exercises main.js's pure logic paths (NOT the max-api wiring) under plain
// Node — run with Max's bundled binary to match the node.script runtime.
// =============================================================================

const { doGenerate, generateAt, doBridge } = require('./main.js');

let failures = 0;
const check = (label, cond) => {
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);
    if (!cond) failures++;
};

const midiOk = notes => Array.isArray(notes) && notes.length > 0
    && notes.every(n => Number.isInteger(n) && n >= 0 && n <= 127);

// ── generate: frank_ocean, Eb (3), minor ──────────────────────────────────────
const gen = doGenerate('frank_ocean', 3, 'minor');
console.log('generate:', JSON.stringify(gen));
// LENGTH IS SAMPLED, NOT FIXED (Phase 8, 2026-08-16). This asserted exactly 4
// — the authored "Nikes" length — when generate replayed a catalogue entry
// verbatim. Recipes draw a length within the recipe's own lengthMin..lengthMax,
// so a hardcoded 4 is a stale assumption. The real invariant is a non-empty
// progression of plausible length; the per-chord shape checks below still bind.
check('generate returns a non-empty progression', gen.length >= 2 && gen.length <= 11);
check('generate: every chord has MIDI-range notes', gen.every(c => midiOk(c.notes)));
check('generate: every chord has a symbol', gen.every(c => typeof c.symbol === 'string' && c.symbol.length > 0));

// ── bridge: Cmaj7 (0) → Fmin7 (5), dangelo ────────────────────────────────────
const br = doBridge(0, 'maj7', 5, 'min7', 'dangelo');
console.log('bridge:', JSON.stringify(br));
check('bridge returns at least 1 chord', br.length >= 1);
check('bridge: every chord has MIDI-range notes', br.every(c => midiOk(c.notes)));
check('bridge: every chord has a symbol', br.every(c => typeof c.symbol === 'string' && c.symbol.length > 0));

// ── index coercion: menu indices must resolve identically to explicit names ───
// Compared at the SAME press index: doGenerate advances a counter (so an artist
// with 3 authored progressions keeps producing new ones), which means two bare
// calls legitimately differ. generateAt is the pure indexed form.
const genByName = generateAt('frank_ocean', 3, 'minor', 0).chords;
const genByIdx  = generateAt(0, 3, 1, 0).chords;   // frank_ocean=0, Eb=3, minor=1
check('generate: index form === name form', JSON.stringify(genByIdx) === JSON.stringify(genByName));
const brByIdx = doBridge(0, 1, 5, 0, 1);         // maj7=1, min7=0, dangelo=1
check('bridge: index form === name form', JSON.stringify(brByIdx) === JSON.stringify(br));

console.log(failures === 0 ? 'ALL TESTS PASS' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
