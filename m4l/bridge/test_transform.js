#!/usr/bin/env node
// =============================================================================
// PARITY TEST — the JS derivation layer must agree with the C++ one.
//
// The plugin (C++) and the M4L device (JS) must not develop different musical
// brains. This asserts the JS port against the SAME ground truth the C++ tests
// use: Scales.sin Plugin/Tests/fixtures/harmony_operators.json, which was
// hand-transcribed from NEGATIVE_HARMONY_AXIS.md and machine-verified.
//
// Run: node m4l/bridge/test_transform.js
// =============================================================================
'use strict';

const fs   = require('fs');
const path = require('path');
const T    = require('./transform.js');

const FIXTURE = path.resolve(__dirname, '../../../Scales.sin Plugin/Tests/fixtures/harmony_operators.json');

let passed = 0, failed = 0;
const fail = (name, detail) => { failed++; console.log(`  FAIL  ${name}\n        ${detail}`); };
const pass = name => { passed++; console.log(`  ok    ${name}`); };

function chordFromPcs (rootPc, pcs) {
    return { root: 60 + T.pc(rootPc), intervals: pcs.map(p => T.pc(p - rootPc)).sort((a, b) => a - b) };
}
const sounded = c => [...new Set(c.intervals.map(iv => T.pc(c.root + iv)))].sort((a, b) => a - b);
const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

if (!fs.existsSync(FIXTURE)) {
    console.log(`SKIP: fixture not found at ${FIXTURE}`);
    process.exit(0);
}
const fx = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));

console.log('\nNEGATIVE HARMONY — triads');
for (const row of fx.negative_harmony_triads) {
    const inCh = chordFromPcs(row.in.rootPc, row.in.pitchClasses);
    const r = T.transformSection([inCh], T.OPS.NEGATIVE_HARMONY, row.tonic, row.mode);
    const got = r.chords.length === 1 ? sounded(r.chords[0]) : [];
    const want = [...row.out.pitchClasses].sort((a, b) => a - b);
    eq(got, want) ? pass(`${row.in.name} -> ${row.out.name}`)
                  : fail(`${row.in.name} -> ${row.out.name}`,
                         `want [${want}] got [${got}]`);
}

console.log('\nNEGATIVE HARMONY — sevenths');
for (const row of fx.negative_harmony_sevenths) {
    const inCh = chordFromPcs(row.in.rootPc, row.in.pitchClasses);
    const r = T.transformSection([inCh], T.OPS.NEGATIVE_HARMONY, row.tonic, row.mode);
    const got = r.chords.length === 1 ? sounded(r.chords[0]) : [];
    const want = [...row.out.pitchClasses].sort((a, b) => a - b);
    eq(got, want) ? pass(`${row.in.name} -> ${row.out.name}`)
                  : fail(`${row.in.name} -> ${row.out.name}`,
                         `want [${want}] got [${got}]`);

    // The min6 row declares interval 9 essential — the whole reason 6th chords
    // had to become expressible at all.
    if (row.out.essentialIntervals && r.chords.length === 1) {
        const root = T.pc(r.chords[0].root);
        for (const e of row.out.essentialIntervals) {
            got.some(p => T.pc(p - root) === e)
                ? pass(`  essential interval ${e} present`)
                : fail(`  essential interval ${e}`, `absent from [${got}]`);
        }
    }
}

console.log('\nNEGATIVE HARMONY — involution (reflect twice == identity)');
for (const c of fx.negative_harmony_involution[0].cases) {
    const pcs  = [...c.pitchClasses].sort((a, b) => a - b);
    const one  = T.transformSection([chordFromPcs(pcs[0], pcs)], T.OPS.NEGATIVE_HARMONY, 0, 'major');
    const two  = T.transformSection(one.chords, T.OPS.NEGATIVE_HARMONY, 0, 'major');
    const got  = two.chords.length === 1 ? sounded(two.chords[0]) : [];
    eq(got, pcs) ? pass(`[${pcs}] round-trips`)
                 : fail(`[${pcs}] round-trip`, `got [${got}]`);
}

console.log('\nTRITONE SUBSTITUTION');
for (const row of fx.tritone_substitution) {
    const inCh = chordFromPcs(row.in.rootPc, row.in.pitchClasses);
    const r = T.transformSection([inCh], T.OPS.TRITONE_SUB, 0, 'major');
    const got = r.chords.length === 1 ? sounded(r.chords[0]) : [];
    const want = [...(row.unchanged ? row.in.pitchClasses : row.out.pitchClasses)].sort((a, b) => a - b);
    eq(got, want) ? pass(`${row.in.name} -> ${row.out.name}${row.unchanged ? ' (passthrough)' : ''}`)
                  : fail(`${row.in.name} -> ${row.out.name}`, `want [${want}] got [${got}]`);
}

console.log('\nCONTRACT');
{
    const four = [
        chordFromPcs(0, [0, 4, 7, 11]),
        chordFromPcs(9, [0, 4, 7, 9]),
        chordFromPcs(2, [0, 2, 5, 9]),
        chordFromPcs(7, [2, 5, 7, 11]),
    ];
    for (const op of [T.OPS.NEGATIVE_HARMONY, T.OPS.TRITONE_SUB, T.OPS.MODAL_INTERCHANGE]) {
        const r = T.transformSection(four, op, 0, 'major');
        const complete = r.chords.length === four.length;
        (complete || (r.rejectedCount > 0 && r.reason))
            ? pass(`${op} never silently truncates`)
            : fail(`${op} truncation`, `${r.chords.length}/4 with no reason`);
    }

    const empty = T.transformSection([], T.OPS.NEGATIVE_HARMONY, 0, 'major');
    empty.reason === 'input-too-short'
        ? pass('below minimum input reports rather than guesses')
        : fail('minimum input', `reason='${empty.reason}'`);

    const a = T.rankOperators(four, 0, 'major');
    const b = T.rankOperators(four, 0, 'major');
    eq(a.map(String), b.map(String)) ? pass('ranking is deterministic')
                                     : fail('ranking determinism', `${a} vs ${b}`);
    a[0] === T.OPS.VOCAB ? pass('VOCAB leads for ordinary input')
                         : fail('VOCAB first', `got ${a[0]}`);
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
