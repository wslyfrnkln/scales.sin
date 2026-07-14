// =============================================================================
// SCALES.SIN M4L — DEGREE RESOLVER ("Generate progression" path, D-07 button 1)
//
// Turns an artist's raw Roman-numeral progression (vocab.styleTemplates[artist]
// .progressions[0].degrees) into playable VoicedChord objects matching the
// engine's native output shape.
//
// The engine's degreeStringToRoot / degreeStringToBaseQuality / buildSymbol are
// private (unexported); they are mirrored verbatim below, comment-tagged with
// source line numbers. resolveVoicing IS exported and imported as-is (D-01:
// the engine stays unmodified).
// =============================================================================

// Deployed bridge/ carries its own copy (deploy_m4l.sh); repo layout falls back.
const { resolveVoicing } = require(
    require('fs').existsSync(require('path').join(__dirname, 'chord_suggestion_engine.js'))
        ? './chord_suggestion_engine.js' : '../../chord_suggestion_engine.js');

// ── mirrors chord_suggestion_engine.js:11-25 — kept in sync manually, do not diverge ─
const NOTE_NAMES_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTE_NAMES_FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const FLAT_ROOTS = new Set([1, 3, 5, 8, 10]); // Db Eb F Ab Bb

function noteName(pcVal, useFlats) {
    const idx = ((pcVal % 12) + 12) % 12;
    return (useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP)[idx];
}

function pc(n) { return ((n % 12) + 12) % 12; }

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

// ── mirrors chord_suggestion_engine.js:290-314 — kept in sync manually, do not diverge ─
function degreeStringToRoot(degreeStr, tonic, mode) {
    if (!degreeStr) return tonic;
    const scale = mode === 'major' ? MAJOR_SCALE : MINOR_SCALE;

    // Parse prefix: b or #
    let prefix = '';
    let rest = degreeStr;
    if (rest.startsWith('b')) { prefix = 'b'; rest = rest.slice(1); }
    else if (rest.startsWith('#')) { prefix = '#'; rest = rest.slice(1); }

    // Extract roman numeral (1-4 chars)
    const romanMatch = rest.match(/^(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)/);
    if (!romanMatch) return tonic;

    const romanStr = romanMatch[1];
    const romanMap = { I:0, II:1, III:2, IV:3, V:4, VI:5, VII:6,
                       i:0, ii:1, iii:2, iv:3, v:4, vi:5, vii:6 };
    const degIdx = romanMap[romanStr] ?? 0;
    let interval = scale[degIdx] ?? 0;

    if (prefix === 'b') interval = (interval - 1 + 12) % 12;
    if (prefix === '#') interval = (interval + 1) % 12;

    return pc(tonic + interval);
}

// ── mirrors chord_suggestion_engine.js:320-331 — kept in sync manually, do not diverge ─
function degreeStringToBaseQuality(degreeStr) {
    if (!degreeStr) return 'maj';
    // lowercase roman = minor; uppercase = major unless quality suffix says otherwise
    const isLower = /^b?[ivx]+/.test(degreeStr); // starts with lowercase roman
    const hasDom = /7(?!maj)|9|13|sus/.test(degreeStr) && !/maj7/.test(degreeStr);
    const hasMaj = /maj|M(?=[0-9])/.test(degreeStr);
    const hasMin = /m(?=[0-9])|min/.test(degreeStr) || isLower;

    if (hasDom && !hasMaj) return 'dom';
    if (hasMin || isLower) return 'min';
    return 'maj';
}

// ── mirrors chord_suggestion_engine.js:630-651 buildSymbol() — kept in sync manually, do not diverge ─
function buildSymbol(root, baseQuality, vocab, artistKey) {
    const useFlats = FLAT_ROOTS.has(root);
    const rootName = noteName(root, useFlats);

    // Try to get the artist's preferred suffix for this quality
    const template = (vocab.styleTemplates ?? {})[artistKey];
    const colors = template?.chordColors ?? template?.chord_colors ?? {};
    const preferredSuffix = colors[baseQuality];

    if (preferredSuffix) {
        // Convert suffix to display form
        const display = preferredSuffix
            .replace('min', 'm')
            .replace('maj', 'maj')
            .replace('dom', '');
        return rootName + display;
    }

    // Fallback symbol
    const fallbackSuffix = { min: 'm7', maj: 'maj7', dom: '7' };
    return rootName + (fallbackSuffix[baseQuality] ?? '');
}

/**
 * resolveProgression(artistKey, tonic, mode, vocab)
 * MVP: resolves the artist's FIRST progression (progressions[0]).
 * Returns VoicedChord[] in the engine's native shape.
 * Throws on unknown artist / empty progressions — the reader is main.js's
 * handler try/catch, which outlets the message as a Max 'error' message.
 */
function resolveProgression(artistKey, tonic, mode, vocab) {
    const template = (vocab.styleTemplates ?? {})[artistKey];
    if (!template || !Array.isArray(template.progressions) || template.progressions.length === 0) {
        throw new Error(`no progressions for artist '${artistKey}'`);
    }
    const prog = template.progressions[0];
    return (prog.degrees ?? []).map(degStr => {
        const root = degreeStringToRoot(degStr, tonic, mode);
        const bq = degreeStringToBaseQuality(degStr);
        const voicing = resolveVoicing(artistKey, bq, vocab);
        const symbol = buildSymbol(root, bq, vocab, artistKey);
        return {
            symbol,
            root,
            intervals: voicing.intervals,
            voicing_label: voicing.voicing_label,
            source: voicing.source,
            artist: artistKey,
            match_type: 'vocab',
            degree: degStr,
        };
    });
}

module.exports = { resolveProgression };

// Self-test (Task 1.3 acceptance): frank_ocean progressions[0] "Nikes" has 4 degrees.
if (require.main === module) {
    const path = require('path');
    const { loadVocabularySync } = require('./vocab_loader.js');
    const vocab = loadVocabularySync(path.join(__dirname, '../../artist_vocab.json'));
    const chords = resolveProgression('frank_ocean', 3, 'minor', vocab); // Eb minor
    console.log(JSON.stringify(chords, null, 1));
    const ok = chords.length === 4 && chords.every(c =>
        Number.isInteger(c.root) && c.root >= 0 && c.root <= 11
        && Array.isArray(c.intervals) && c.intervals.length > 0
        && typeof c.symbol === 'string' && c.symbol.length > 0);
    console.log(ok ? 'SELF-TEST PASS' : 'SELF-TEST FAIL');
    process.exit(ok ? 0 : 1);
}
