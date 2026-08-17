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

// Executable style constraints — mirrors applyStyleConstraints in
// Source/Engine/ChordEngine.cpp (parity contract in constraints.js).
const { applyStyleConstraints } = require('./constraints.js');

// Phase 8 recipe composition — the JS twin of Evolve.cpp's composeFromRecipe.
const { composeFromRecipe } = require('./recipes.js');

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

// ── mirrors Source/Engine/DegreeParser.cpp:251-272 degreeStringToExtension() ──
// kept in sync manually, do not diverge.
//
// The JS may use a regex here (this file already does elsewhere); the
// no-std::regex rule is a C++-only constraint. What must match EXACTLY is the
// accept-set and the two carve-outs:
//   - the `/` remainder is excluded from the extension (slash-bass is not an
//     extension), and
//   - a trailing bare "m" belongs to the roman-quality spelling ("im"), not an
//     authored extension — but "m" PREFIXING A DIGIT ("im11") is kept verbatim
//     so the resolver can match the vocabulary's m-family suffixes.
function degreeStringToExtension(degreeStr) {
    if (!degreeStr) return '';

    let i = 0;
    if (degreeStr[i] === 'b' || degreeStr[i] === '#') i += 1;
    while (i < degreeStr.length && /[IViv]/.test(degreeStr[i])) i += 1;

    let end = degreeStr.indexOf('/', i);
    if (end === -1) end = degreeStr.length;

    const extension = degreeStr.slice(i, end);

    // C++ line 270: bare "m" is quality spelling, not an extension.
    if (extension === 'm') return '';
    return extension;
}

// ── mirrors Source/Engine/ChordEngine.cpp:300-349 — the Step 0 helpers ────────
// kept in sync manually, do not diverge.

// C++:300-306 — "m11" -> "min11" so it matches the vocab's m-family suffixes.
function normalizeAuthoredExtension(extension) {
    if (extension.length >= 2 && extension[0] === 'm' && /[0-9]/.test(extension[1])) {
        return 'min' + extension.slice(1);
    }
    return extension;
}

// C++:319-325 — a degree carrying only the bare spelling of its own base
// quality ("V7" -> "7") is not authoring an extension at all; it is the plain
// functional chord the BaseQuality bucket already names. Without this carve-out
// Step 0 exact-matches the vocab's own plain-7 entry and silently defeats every
// artist rule keyed on chord_colors (e.g. glasper's "no leading tone").
function isBareQualitySpelling(baseQuality, extension) {
    if (baseQuality === 'dom') return extension === '7';
    if (baseQuality === 'maj') return extension === 'maj7';
    if (baseQuality === 'min') return extension === 'm7' || extension === 'min7';
    return false;   // 6ths have no bare vocab spelling to compare against
}

// C++:327-336 — chord_types keys spell sharps as "sharp" ("7sharp9").
function sharpKey(extension) {
    return extension.split('#').join('sharp');
}

// C++:338-349 — which alterations a token names, as a bitmask.
function alterationMask(extension) {
    let mask = 0;
    if (extension.includes('#5') || extension.includes('b5')) mask |= 1 << 0;
    if (extension.includes('#9') || extension.includes('b9')) mask |= 1 << 1;
    if (extension.includes('#11')) mask |= 1 << 2;
    if (extension.includes('b13')) mask |= 1 << 3;
    if (extension.includes('alt')) mask |= 1 << 4;
    return mask;
}

// Render mode (Task 0.7b). FIDELITY resolves the AUTHORED degree token first;
// LEGACY_COLORS is the pre-fidelity behaviour where chord_colors always won.
const RENDER_MODE = { FIDELITY: 'fidelity', LEGACY_COLORS: 'legacyColors' };

// ── mirrors Source/Engine/ChordEngine.cpp:617-700 Step 0 ─────────────────────
// Returns a voicing {intervals, voicing_label, source} when the authored
// extension resolves, or null to fall through to resolveVoicing().
function resolveAuthoredExtension(artistKey, baseQuality, authoredExtension, vocab, mode) {
    if (mode !== RENDER_MODE.FIDELITY) return null;
    if (!authoredExtension) return null;
    if (isBareQualitySpelling(baseQuality, authoredExtension)) return null;

    // C++:641-651 — a style whose chord_colors names a SUSPENDED target is
    // stating a CONSTRAINT, not a preference ("Replace V7 with 13sus4 — no
    // leading tone"). Authored "9"/"13" are GENERIC extension degrees: they say
    // how far the stack extends, not that a third is wanted, and both resolve to
    // intervals carrying a major 3rd. Defer those to Step 1 so the sus wins. An
    // authored token that is itself sus, or that names an alteration, still goes
    // through Step 0 untouched.
    const template = (vocab.styleTemplates ?? {})[artistKey];
    const colors = template?.chordColors ?? template?.chord_colors ?? {};
    const styleColor = colors[baseQuality] ?? '';
    const styleWantsSus = styleColor.includes('sus');
    const authoredIsSus = authoredExtension.includes('sus');
    if (styleWantsSus && !authoredIsSus && alterationMask(authoredExtension) === 0) return null;

    const extKey = { min: 'min', maj: 'maj', dom: '7' }[baseQuality] ?? baseQuality;
    const extensionMap = vocab.extensionMap ?? vocab.extension_map ?? {};
    const entries = extensionMap[extKey] ?? [];
    const chordTypes = vocab.chordTypes ?? vocab.chord_types ?? {};

    const candidates = [authoredExtension, normalizeAuthoredExtension(authoredExtension)];

    // Exact suffix match in extension_map (Array.find -> FIRST match, C++:668).
    for (const wanted of candidates) {
        for (const e of entries) {
            if (e.suffix === wanted && Array.isArray(e.intervals) && e.intervals.length > 0) {
                return {
                    intervals: [...e.intervals],
                    voicing_label: e.label || e.suffix,
                    voicing_suffix: e.suffix,
                    source: e.source ?? '',
                };
            }
        }
    }

    // chord_types, direct then with '#' -> 'sharp' (C++:681-694).
    for (const wanted of candidates) {
        for (const key of [wanted, sharpKey(wanted)]) {
            const ct = chordTypes[key];
            if (ct && Array.isArray(ct.intervals) && ct.intervals.length > 0) {
                return {
                    intervals: [...ct.intervals],
                    voicing_label: ct.name || key,
                    voicing_suffix: key,
                    source: '',
                };
            }
        }
    }

    // Alteration OVERLAP (C++:697-714) — the entry sharing the MOST alterations
    // with the authored token wins. Deliberately NOT a containment test: the
    // C++ scores popcount(authoredMask & entryMask) and keeps the highest, so an
    // entry naming a subset of the token's alterations still qualifies. A first
    // port of this wrote a containment filter instead and let frank_ocean's
    // "V7#5b9" resolve to an altered dominant carrying intervals 4 AND 10 — the
    // leading tone that style's rule explicitly bans (caught by test_rules.js's
    // "no dominant keeps its leading tone", which the C++ twin passes).
    //
    // `> bestScore` starting from 0 means a zero-overlap entry never wins, and
    // FIRST-best wins ties — both match the C++ loop exactly.
    const authoredMask = alterationMask(authoredExtension);
    if (authoredMask !== 0) {
        let best = null;
        let bestScore = 0;
        for (const e of entries) {
            if (!Array.isArray(e.intervals) || e.intervals.length === 0) continue;
            let score = 0;
            for (let bits = authoredMask & alterationMask(e.suffix ?? ''); bits !== 0; bits >>= 1) {
                score += (bits & 1);
            }
            if (score > bestScore) { best = e; bestScore = score; }
        }
        if (best) {
            return {
                intervals: [...best.intervals],
                voicing_label: best.label || best.suffix,
                voicing_suffix: best.suffix,
                source: best.source ?? '',
            };
        }
    }

    return null;
}

// Task 0.7c — the symbol for a Step-0-resolved chord. Prefers the resolved
// voicing's own voicing_label so the Max display names the chord actually
// played; falls back to the chord_colors path when the voicing carries no
// label of its own.
// The symbol is built from the voicing's SUFFIX ("7sus4", "min9"), never from
// its `voicing_label` — labels are authored prose ("Dominant 7sus4 —
// suspended, avoids tritone") and an unanchored replace() chain mangles them:
// 'min' inside "Dominant" yields "Domant", and 'dom' inside a lowercase
// "dominant replacement" yields "ant". Reachable authored degrees V7sus4 and
// V9sus4 hit exactly those entries, so Max was sent symbols like
// "GDomant 7sus4 — suspended, avoids tritone". Suffixes are compact chord
// tokens, and the conversion below is anchored to the leading quality token so
// it can only ever rewrite a real prefix.
function suffixToDisplay(suffix) {
    return String(suffix)
        .replace(/^min/, 'm')
        .replace(/^dom/, '');
}

function buildSymbolFromVoicing(root, voicing, baseQuality, vocab, artistKey) {
    const suffix = voicing?.voicing_suffix;
    if (!suffix) return buildSymbol(root, baseQuality, vocab, artistKey);

    const useFlats = FLAT_ROOTS.has(root);
    const rootName = noteName(root, useFlats);
    return rootName + suffixToDisplay(suffix);
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
// NOTE ON THE TWO "MODE"s: `mode` here is the KEY mode ('major'|'minor') and
// predates this change; `renderMode` is Task 0.7b's fidelity switch. They are
// deliberately separate parameters with separate names — collapsing them would
// be a silent API break for every existing caller.
function resolveProgression(artistKey, tonic, mode, vocab, index = 0,
                            renderMode = RENDER_MODE.FIDELITY) {
    const template = (vocab.styleTemplates ?? {})[artistKey];
    if (!template || !Array.isArray(template.progressions) || template.progressions.length === 0) {
        throw new Error(`no progressions for artist '${artistKey}'`);
    }
    // Round-robin over the artist's authored progressions. This was
    // progressions[0] unconditionally, so the M4L device replayed ONE
    // progression forever — a harder version of the plugin's "same 3
    // progressions" report. The caller supplies a monotonic press counter;
    // generateVaried in transform.js layers derived variation on top.
    const count = template.progressions.length;
    const slot = ((Math.trunc(index) % count) + count) % count;
    const prog = template.progressions[slot];

    // PHASE 8 (Task 8.4): COMPOSE, don't look up. When the style carries
    // recipes, the degree sequence is SAMPLED from the technique's pool rather
    // than replayed from the catalogue — mirroring the C++
    // generateProgression's recipe branch so both surfaces resolve the same
    // artist to the same kind of material. Falls back to the authored degrees
    // when the style has no recipes (dilla, deliberately) or a draw degenerates.
    const composed = composeFromRecipe(template, Math.trunc(index));
    const degrees = (composed.length > 0) ? composed : (prog.degrees ?? []);

    return degrees.map(degStr => {
        const root = degreeStringToRoot(degStr, tonic, mode);
        const bq = degreeStringToBaseQuality(degStr);

        // Step 0 (Task 0.7b): the AUTHORED degree token wins; chord_colors is
        // the fallback for unextended degrees. Falls through to resolveVoicing
        // on no hit, which is the pre-fidelity behaviour verbatim.
        const ext = degreeStringToExtension(degStr);
        const authored = resolveAuthoredExtension(artistKey, bq, ext, vocab, renderMode);
        const voicing = authored ?? resolveVoicing(artistKey, bq, vocab);

        // Task 0.7c: when Step 0 produced the voicing, the symbol must name the
        // chord actually PLAYED, not the style's chord_colors suffix — otherwise
        // Max displays "13sus4" while an altered dominant sounds. This is the JS
        // twin of the C++ display/play mismatch.
        const symbol = authored
            ? buildSymbolFromVoicing(root, authored, bq, vocab, artistKey)
            : buildSymbol(root, bq, vocab, artistKey);
        const chord = {
            symbol,
            root,
            intervals: [...voicing.intervals],
            voicing_label: voicing.voicing_label,
            source: voicing.source,
            artist: artistKey,
            match_type: 'vocab',
            degree: degStr,
        };

        // Executable style constraints (Phase 4) — the same layer the plugin's
        // buildVoicedChord applies, so the device and the plugin resolve the
        // same degree to the same chord. This is the single funnel every chord
        // passes through on the JS side, which is why it binds here.
        applyStyleConstraints(chord, template.constraints);
        return chord;
    });
}

module.exports = { resolveProgression, RENDER_MODE, degreeStringToExtension };

// Self-test (Task 1.3 acceptance): frank_ocean progressions[0] "Nikes" has 4 degrees.
if (require.main === module) {
    const path = require('path');
    const { loadVocabularySync } = require('./vocab_loader.js');
    const vocab = loadVocabularySync(path.join(__dirname, '../../artist_vocab.json'));
    const chords = resolveProgression('frank_ocean', 3, 'minor', vocab); // Eb minor
    console.log(JSON.stringify(chords, null, 1));
    // LENGTH IS NO LONGER FIXED (Phase 8, 2026-08-16). This asserted
    // `chords.length === 4` — the authored "Nikes" length — back when
    // resolveProgression replayed a catalogue entry verbatim. Recipes SAMPLE a
    // length within the recipe's own lengthMin..lengthMax bounds, so a fixed 4
    // is a stale assumption rather than an invariant. What actually has to hold
    // is that the composer produced a non-empty progression of well-formed
    // chords, which is what this now checks.
    const ok = chords.length > 0 && chords.every(c =>
        Number.isInteger(c.root) && c.root >= 0 && c.root <= 11
        && Array.isArray(c.intervals) && c.intervals.length > 0
        && typeof c.symbol === 'string' && c.symbol.length > 0);
    console.log(ok ? 'SELF-TEST PASS' : 'SELF-TEST FAIL');
    process.exit(ok ? 0 : 1);
}
