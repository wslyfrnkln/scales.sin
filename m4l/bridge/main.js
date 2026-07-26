// =============================================================================
// SCALES.SIN M4L — node.script ENTRY POINT
//
// Import mechanics (Task 1.1, validated against Max's bundled Node v22.18.0):
// both ESM `import` and CJS `require()` of the ESM engine resolve; CJS chosen
// because node.script loads its entry via CommonJS and max-api convention is
// require(). (Deliberate exception to the ESM-only house rule — platform
// constraint of Node for Max.)
//
// Message protocol (Max patch → Node):
//   'set_artist <i>' 'set_key <i>' 'set_mode <i>' 'set_rootA <i>' 'set_qualA <i>'
//   'set_rootB <i>' 'set_qualB <i>'   — live.menu index state updates
//   'generate' / 'bridge'             — buttons, use stored state
//   'generate <artist> <key> <mode>' / 'bridge <rA> <qA> <rB> <qB> <artist>'
//                                     — explicit form (indices OR names) for testing
// Outlet protocol (Node → Max patch):
//   ['symbols', <symbol>...]          one per response, immediate (readout)
//   ['play', <chordIdx>, <note>...]   timed — one per chord, CHORD_MS apart
//   ['error', <message>]              named failure path
// =============================================================================

// ── Boot diagnostics — answers "did node.script ever spawn us?" when the Max
// console isn't reachable. Appends one line per boot / fatal to a log next to
// this file; reader: whoever is debugging a silent device (tail bridge/boot.log).
const fs = require('fs');
const BOOT_LOG = require('path').join(__dirname, 'boot.log');
const bootLog = msg => { try { fs.appendFileSync(BOOT_LOG, `${new Date().toISOString()} ${msg}\n`); } catch (_) { /* diagnostics never crash the bridge */ } };
bootLog(`boot pid=${process.pid} node=${process.version}`);
process.on('uncaughtException', e => { bootLog(`FATAL ${e.stack || e.message}`); throw e; });

const path = require('path');
// Deployed bridge/ carries its own copy of the engine + vocab (deploy_m4l.sh);
// the repo layout keeps them at the app root — resolve locally first, fall back.
const dep = rel => fs.existsSync(path.join(__dirname, rel)) ? `./${rel}` : `../../${rel}`;
const { loadVocabularySync } = require('./vocab_loader.js');
const { generateVaried } = require('./transform.js');
const { resolveProgression } = require('./degree_resolver.js');
const { voicedChordToMidiNotes } = require('./midi_convert.js');
const { suggestChords } = require(dep('chord_suggestion_engine.js'));

// Vocab loads once at process start (node.script boots one process per device).
const vocab = loadVocabularySync(path.join(__dirname, dep('artist_vocab.json')));

// ── Index maps — order MUST match the live.menu items in Scales.sin-m4l.amxd ──
const ARTISTS = ['frank_ocean', 'dangelo', 'leon_thomas', 'glasper', 'badu', 'paak',
    'stevie_wonder', 'herbie_hancock', 'thundercat', 'gospel', 'dilla', 'kendrick',
    'mac_miller', 'joe_pass', 'ama_lou'];
const MODES = ['major', 'minor'];
const QUALITIES = ['min7', 'maj7', '7'];

// Coerce a live.menu index (number / numeric string) or an explicit name string.
const isIdx = v => typeof v === 'number' || /^\d+$/.test(String(v));
const artistOf = a => isIdx(a) ? (ARTISTS[Number(a)] ?? ARTISTS[0]) : String(a);
const modeOf = m => isIdx(m) ? (MODES[Number(m)] ?? MODES[0]) : String(m);
const qualityOf = q => isIdx(q) ? (QUALITIES[Number(q)] ?? QUALITIES[0]) : String(q);

// ── Pure logic paths (Max-independent — exercised by test_bridge.js) ──────────

/** Button 1: artist progression → [{symbol, degree, notes[]}] */
// Generate press counter, per artist. Resets when the artist changes so press
// #5 on a freshly selected artist does not pick candidate 5 of their 2.
let generateIndex = 0;
let lastGenerateArtist = null;

// What produced the last Generate — authored progression label, plus the
// operator name when the result came from a derived tier. Sent to the readout.
let lastStrategy = '';

// Pure, indexed form: same (artist, tonic, mode, index) always gives the same
// chords. The counter-advancing doGenerate wraps this. Split out so callers
// that need reproducibility — tests, and any future session-recall path —
// can address a specific press index instead of depending on call order.
function generateAt(artist, tonic, mode, index) {
    const artistKey = artistOf(artist);

    const template = (vocab.styleTemplates ?? {})[artistKey];
    const authored = (template && Array.isArray(template.progressions))
        ? template.progressions.length : 0;

    // generateVaried, not a bare resolveProgression: the latter replays the
    // artist's authored progressions and then repeats (J Dilla has 3). Tier 0
    // is those progressions verbatim; tier 1+ puts them through the derivation
    // operators in the selected key, so the artist keeps producing new material
    // without leaving their idiom. Mirrors the plugin's C++ path exactly —
    // see m4l/bridge/test_transform.js for the parity assertions.
    const varied = generateVaried(
        (aKey, t, m, slot) => {
            const chords = resolveProgression(aKey, t, m, vocab, slot);
            const label = (template && template.progressions[slot])
                ? (template.progressions[slot].label || '') : '';
            return { chords, label };
        },
        authored, artistKey, Number(tonic), modeOf(mode), index);

    return {
        chords: varied.chords.map(c => ({
            symbol: c.symbol, degree: c.degree, notes: voicedChordToMidiNotes(c),
        })),
        label: varied.label,
    };
}

function doGenerate(artist, tonic, mode) {
    const artistKey = artistOf(artist);
    if (artistKey !== lastGenerateArtist) {
        generateIndex = 0;
        lastGenerateArtist = artistKey;
    }
    const r = generateAt(artist, tonic, mode, generateIndex);
    generateIndex += 1;
    lastStrategy = r.label;
    return r.chords;
}

/** Button 2: bridge chord A → chord B via the engine's suggestChords() export */
function doBridge(rootA, qualA, rootB, qualB, artist) {
    const chords = suggestChords(
        Number(rootA), qualityOf(qualA), Number(rootB), qualityOf(qualB),
        artistOf(artist), vocab) ?? [];
    return chords.map(c => ({ symbol: c.symbol, degree: c.degree, notes: voicedChordToMidiNotes(c) }));
}

module.exports = { doGenerate, generateAt, doBridge, vocab, ARTISTS, MODES, QUALITIES,
                   getLastStrategy: () => lastStrategy };

// ── Max wiring (only resolvable inside a running node.script process) ─────────

let Max = null;
try { Max = require('max-api'); } catch (e) { /* standalone run — pure paths above still work */ }

if (Max) {
    // UI state — updated by the patch's live.menu set_* messages. Defaults match
    // each menu's initial index (0), except rootB (5 = F) for a sensible first bridge.
    const state = { artist: 0, key: 0, mode: 0, rootA: 0, qualA: 0, rootB: 5, qualB: 0 };
    for (const k of Object.keys(state)) {
        Max.addHandler(`set_${k}`, v => { state[k] = Number(v) || 0; });
    }

    // Chord sequencing lives here, not in the patch (simplest testable option per
    // brainstorm Discretion): symbols outlet immediately, then one timed 'play'
    // message per chord, CHORD_MS apart. Patch side is just iter → makenote → noteout.
    const CHORD_MS = 600;
    const outletResult = result => {
        Max.outlet('symbols', ...result.map(c => c.symbol));
        result.forEach((c, i) => setTimeout(() => Max.outlet('play', i, ...c.notes), i * CHORD_MS));
    };

    Max.addHandler('generate', (artist, key, mode) => {
        try {
            const noArgs = artist === undefined;
            outletResult(noArgs
                ? doGenerate(state.artist, state.key, state.mode)
                : doGenerate(artist, key, mode));
        } catch (e) {
            Max.outlet('error', e.message); // reader: Max patch error route → readout + console
        }
    });

    Max.addHandler('bridge', (rootA, qualA, rootB, qualB, artist) => {
        try {
            const noArgs = rootA === undefined;
            outletResult(noArgs
                ? doBridge(state.rootA, state.qualA, state.rootB, state.qualB, state.artist)
                : doBridge(rootA, qualA, rootB, qualB, artist));
        } catch (e) {
            Max.outlet('error', e.message);
        }
    });

    Max.post('[scales.sin] bridge ready — handlers: generate, bridge, set_*');
}
