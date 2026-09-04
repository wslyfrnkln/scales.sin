#!/usr/bin/env node
// =============================================================================
// PARITY TEST — the JS constraint layer must agree with the C++ one.
//
// The plugin (C++) and the M4L device (JS) must not develop different musical
// brains. The expected values below are the MEASURED output of the C++ build's
// "REPORT — V7 across all 15 styles" case (2026-07-26), so this is a real
// cross-language assertion rather than a restatement of the JS code.
//
// Run: node m4l/bridge/test_constraints.js
// =============================================================================
'use strict';

const fs   = require('fs');
const path = require('path');
const { applyStyleConstraints } = require('./constraints.js');

let passed = 0, failed = 0;
const fail = (name, detail) => { failed++; console.log(`  FAIL  ${name}\n        ${detail}`); };
const pass = name => { passed++; console.log(`  ok    ${name}`); };
const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// The vocab is the source of truth for each style's constraints.
const VOCAB = path.resolve(__dirname, '../../artist_vocab.json');
if (!fs.existsSync(VOCAB)) {
    console.log(`SKIP: vocab not found at ${VOCAB}`);
    process.exit(0);
}
const vocab = JSON.parse(fs.readFileSync(VOCAB, 'utf8'));
const styles = vocab.style_templates;

console.log('\nCONSTRAINTS PRESENT');
{
    const keys = Object.keys(styles);
    keys.length === 19 ? pass('19 styles') : fail('style count', `got ${keys.length}`);  // Phase 6, 2026-09-04: 15 -> 19
    const missing = keys.filter(k => !styles[k].constraints);
    missing.length === 0 ? pass('every style has a constraints block')
                         : fail('constraints block', `missing: ${missing}`);

    // The layer would be inert if every style agreed.
    const subs = new Set(keys.map(k => styles[k].constraints.dominantSubstitution));
    const shapes = new Set(keys.map(k => styles[k].constraints.voicingShape));
    subs.size > 1 ? pass('styles disagree on dominant substitution')
                  : fail('dominantSubstitution', 'all styles identical');
    shapes.size > 1 ? pass('styles disagree on voicing shape')
                    : fail('voicingShape', 'all styles identical');
}

console.log('\nSUS13 — no leading tone (glasper rule)');
{
    // A plain G7: root, major 3rd, 5th, b7.
    const chord = { root: 67, intervals: [0, 4, 7, 10], symbol: 'G7' };
    applyStyleConstraints(chord, styles.glasper.constraints);
    // C++ measured: glasper G13sus4 — the sus13 substitution fires after the
    // rootless shape and legitimately owns the whole chord.
    !chord.intervals.includes(4) ? pass('major 3rd (leading tone) removed')
                                 : fail('leading tone', `[${chord.intervals}]`);
    chord.intervals.includes(5) ? pass('suspended 4th present')
                                : fail('sus4', `[${chord.intervals}]`);
    chord.intervals.includes(10) ? pass('dominant 7th retained')
                                 : fail('b7', `[${chord.intervals}]`);
}

console.log('\nROOTLESS (joe_pass rule)');
{
    const chord = { root: 67, intervals: [0, 4, 7, 10], symbol: 'G7' };
    applyStyleConstraints(chord, styles.joe_pass.constraints);
    // C++ measured: joe_pass G7 [ 4 7 10 ] — 3rd, 5th, 7th; guide tones intact.
    eq(chord.intervals, [4, 7, 10]) ? pass('G7 -> [4 7 10] (matches C++)')
                                    : fail('rootless G7', `want [4,7,10] got [${chord.intervals}]`);
    chord.symbol === 'G7' ? pass('symbol still names the full chord')
                          : fail('symbol', `got ${chord.symbol}`);
}

console.log('\nTHE GATE — authored voicings are never reshaped');
{
    // A sus chord is already a deliberate decision. In C++ this exact case
    // (frank_ocean B7sus4) was stripped to a rootless voicing with NO root
    // before the gate existed.
    const sus = { root: 71, intervals: [0, 5, 7, 10], symbol: 'B7sus4' };
    applyStyleConstraints(sus, styles.joe_pass.constraints);
    eq(sus.intervals, [0, 5, 7, 10]) ? pass('sus chord left untouched')
                                     : fail('sus untouched', `got [${sus.intervals}]`);

    // An extended chord came from the extension map / vocab, so no SELECTION
    // constraint may touch its pitch content — dangelo's Cm9 must not gain a
    // Dorian 6th. (C++ test_StyleConstraints asserts exactly this.) The rootless
    // shape is not a selection constraint: it runs before the gate and drops the
    // root, which the bass layer supplies.
    const ext = { root: 60, intervals: [0, 3, 10, 14], symbol: 'Cm9' };
    applyStyleConstraints(ext, styles.dangelo.constraints);
    !ext.intervals.includes(21) ? pass('extended chord gains no Dorian 6th')
                                : fail('ext 6th', `got [${ext.intervals}]`);
    eq(ext.intervals, [3, 10, 14]) ? pass('rootless shape still drops the root')
                                   : fail('ext rootless', `want [3,10,14] got [${ext.intervals}]`);
}

console.log('\nCONTRACT');
{
    // No constraints object -> no change. Unmapped means "no opinion".
    const c = { root: 60, intervals: [0, 4, 7], symbol: 'C' };
    applyStyleConstraints(c, null);
    eq(c.intervals, [0, 4, 7]) ? pass('missing constraints is a no-op')
                               : fail('no-op', `got [${c.intervals}]`);

    // Idempotent: applying twice must not compound.
    const d = { root: 67, intervals: [0, 4, 7, 10], symbol: 'G7' };
    applyStyleConstraints(d, styles.glasper.constraints);
    const once = [...d.intervals];
    applyStyleConstraints(d, styles.glasper.constraints);
    eq(d.intervals, once) ? pass('applying twice does not compound')
                          : fail('idempotence', `[${once}] -> [${d.intervals}]`);
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
