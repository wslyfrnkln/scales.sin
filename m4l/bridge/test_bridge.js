// =============================================================================
// SCALES.SIN M4L — STANDALONE BRIDGE TEST (Task 1.4 / Phase 1 verify)
// Exercises main.js's pure logic paths (NOT the max-api wiring) under plain
// Node — run with Max's bundled binary to match the node.script runtime.
// =============================================================================

const { doGenerate, doBridge } = require('./main.js');

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
check('generate returns 4 chords (Nikes progression)', gen.length === 4);
check('generate: every chord has MIDI-range notes', gen.every(c => midiOk(c.notes)));
check('generate: every chord has a symbol', gen.every(c => typeof c.symbol === 'string' && c.symbol.length > 0));

// ── bridge: Cmaj7 (0) → Fmin7 (5), dangelo ────────────────────────────────────
const br = doBridge(0, 'maj7', 5, 'min7', 'dangelo');
console.log('bridge:', JSON.stringify(br));
check('bridge returns at least 1 chord', br.length >= 1);
check('bridge: every chord has MIDI-range notes', br.every(c => midiOk(c.notes)));
check('bridge: every chord has a symbol', br.every(c => typeof c.symbol === 'string' && c.symbol.length > 0));

console.log(failures === 0 ? 'ALL TESTS PASS' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
