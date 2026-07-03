// =============================================================================
// SCALES.SIN M4L — node.script ENTRY POINT
//
// Import mechanics (Task 1.1, validated against Max's bundled Node v22.18.0):
// both ESM `import` and CJS `require()` of the ESM engine resolve; CJS chosen
// because node.script loads its entry via CommonJS and max-api convention is
// require(). (Deliberate exception to the ESM-only house rule — platform
// constraint of Node for Max.)
//
// Outlet protocol (consumed by the Max patch, Tasks 2.2/3.3/4.1):
//   ['progression'|'bridge_result', 'chord', <index>, <midiNote>...]  one per chord
//   ['progression'|'bridge_result', 'symbols', <symbol>...]           one per response
//   ['error', <message>]                                              named failure path
// =============================================================================

const path = require('path');
const { loadVocabularySync } = require('./vocab_loader.js');
const { resolveProgression } = require('./degree_resolver.js');
const { voicedChordToMidiNotes } = require('./midi_convert.js');
const { suggestChords } = require('../../chord_suggestion_engine.js');

// Vocab loads once at process start (node.script boots one process per device).
const vocab = loadVocabularySync(path.join(__dirname, '../../artist_vocab.json'));

// ── Pure logic paths (Max-independent — exercised by test_bridge.js) ──────────

/** Button 1: artist progression → [{symbol, degree, notes[]}] */
function doGenerate(artistKey, tonic, modeStr) {
    const chords = resolveProgression(String(artistKey), Number(tonic), String(modeStr), vocab);
    return chords.map(c => ({ symbol: c.symbol, degree: c.degree, notes: voicedChordToMidiNotes(c) }));
}

/** Button 2: bridge chord A → chord B via the engine's suggestChords() export */
function doBridge(rootA, qualityA, rootB, qualityB, artistKey) {
    const chords = suggestChords(
        Number(rootA), String(qualityA), Number(rootB), String(qualityB),
        String(artistKey), vocab) ?? [];
    return chords.map(c => ({ symbol: c.symbol, degree: c.degree, notes: voicedChordToMidiNotes(c) }));
}

module.exports = { doGenerate, doBridge, vocab };

// ── Max wiring (only resolvable inside a running node.script process) ─────────

let Max = null;
try { Max = require('max-api'); } catch (e) { /* standalone run — pure paths above still work */ }

if (Max) {
    const outletChords = (tag, result) => {
        result.forEach((c, i) => Max.outlet(tag, 'chord', i, ...c.notes));
        Max.outlet(tag, 'symbols', ...result.map(c => c.symbol));
    };

    Max.addHandler('generate', (artistKey, tonic, modeStr) => {
        try {
            outletChords('progression', doGenerate(artistKey, tonic, modeStr));
        } catch (e) {
            Max.outlet('error', e.message); // reader: Max patch error route → console/readout
        }
    });

    Max.addHandler('bridge', (rootA, qualityA, rootB, qualityB, artistKey) => {
        try {
            outletChords('bridge_result', doBridge(rootA, qualityA, rootB, qualityB, artistKey));
        } catch (e) {
            Max.outlet('error', e.message);
        }
    });

    Max.post('[scales.sin] bridge ready — handlers: generate, bridge');
}
