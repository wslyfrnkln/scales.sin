// =============================================================================
// SCALES.SIN — CHORD SUGGESTION ENGINE
// Pure logic. No DOM access. No globals.
//
// Main export: suggestChords(rootA, qualityA, rootB, qualityB, artistKey, vocab)
// Returns: VoicedChord[] — 2-4 suggested chords to bridge A → B
// =============================================================================

// ── Note name helpers (mirrors music_theory.js, no import needed — pure math) ─

const NOTE_NAMES_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTE_NAMES_FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const FLAT_ROOTS = new Set([1, 3, 5, 8, 10]); // Db Eb F Ab Bb

function noteName(pc, useFlats) {
    const idx = ((pc % 12) + 12) % 12;
    return (useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP)[idx];
}

function pc(n) { return ((n % 12) + 12) % 12; }

// ── Scale constants ────────────────────────────────────────────────────────────

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

// Diatonic chord qualities by degree (0-indexed), parallel to scale arrays above
const MAJOR_QUALITIES = ['maj7', 'min7', 'min7', 'maj7', '7', 'min7', 'min7b5'];
const MINOR_QUALITIES = ['min7', 'min7b5', 'maj7', 'min7', 'min7', 'maj7', '7'];

// For quality grouping: which base category does a full quality suffix belong to?
const QUALITY_TO_BASE = {
    // minor family
    min7: 'min', min9: 'min', min11: 'min', 'min7b5': 'min',
    'm7': 'min', 'm9': 'min', 'm11': 'min', 'm13': 'min',
    // major family
    maj7: 'maj', maj9: 'maj', 'maj7#11': 'maj', 'maj7/9': 'maj', 'maj6_9': 'maj',
    add9: 'maj', '6/9': 'maj', '6': 'maj',
    // dominant family
    '7': 'dom', '9': 'dom', '13': 'dom', '9sus4': 'dom', '13sus4': 'dom',
    '7sus4': 'dom', '7#9': 'dom', '7b9': 'dom', '7#5': 'dom',
    '7sharp9': 'dom', '7flat9': 'dom', 'dom13sus4': 'dom',
    // triads
    maj: 'maj', min: 'min', dim: 'dom', aug: 'dom',
};

// Map base quality to the extension_map key used in artist_vocab.json / voicing_vocabulary.js
const BASE_TO_EXT_KEY = { min: 'm7', maj: 'Maj7', dom: '7' };

// ── ROMAN NUMERAL HELPERS ──────────────────────────────────────────────────────

const ROMAN_UPPER = ['I','II','III','IV','V','VI','VII'];
const ROMAN_LOWER = ['i','ii','iii','iv','v','vi','vii'];

/**
 * Convert a chord (root pc, quality) into a Roman numeral degree string
 * relative to tonic in given mode ('major' | 'minor').
 * Returns e.g. 'ii', 'bVII', 'IV', 'bVImaj7', 'iim7', etc.
 */
export function chordToDegree(root, quality, tonic, mode) {
    const scale = mode === 'major' ? MAJOR_SCALE : MINOR_SCALE;
    const diff = ((root - tonic) + 12) % 12;

    // Determine if the root matches a scale degree exactly or is flatted/sharped
    let degreeIdx = -1;
    let prefix = '';
    for (let i = 0; i < 7; i++) {
        if (scale[i] === diff) { degreeIdx = i; prefix = ''; break; }
    }
    if (degreeIdx < 0) {
        // Try finding which scale degree it's a half-step below (flatted)
        for (let i = 0; i < 7; i++) {
            if (scale[i] - 1 === diff || (scale[i] === 0 && diff === 11)) {
                degreeIdx = i; prefix = 'b'; break;
            }
        }
    }
    if (degreeIdx < 0) {
        // Sharp case: half-step above a scale degree
        for (let i = 0; i < 7; i++) {
            if (scale[i] + 1 === diff) {
                degreeIdx = i; prefix = '#'; break;
            }
        }
    }
    if (degreeIdx < 0) return '?'; // shouldn't happen

    const base = QUALITY_TO_BASE[quality] ?? 'maj';
    const isMinor = (base === 'min');
    const roman = isMinor ? ROMAN_LOWER[degreeIdx] : ROMAN_UPPER[degreeIdx];

    // Append quality suffix for clarity if it's not the basic diatonic expectation
    // (We keep the degree compact — just suffix the full quality for alterations)
    const qualitySuffix = quality && quality !== 'maj' && quality !== 'min'
        ? quality.replace('min', 'm').replace('maj', 'maj') // keep concise
        : '';

    return prefix + roman + qualitySuffix;
}

// ── VOICING RESOLUTION ────────────────────────────────────────────────────────

/**
 * resolveVoicing(artistKey, baseQuality, vocab)
 *
 * baseQuality: 'min' | 'maj' | 'dom'
 * vocab: the merged vocab object from loadVocabulary()
 *
 * Returns { intervals, voicing_label, source }
 */
export function resolveVoicing(artistKey, baseQuality, vocab) {
    const templates = vocab.styleTemplates || {};
    const artist = templates[artistKey];
    const extKey = BASE_TO_EXT_KEY[baseQuality] ?? 'Maj7';
    const extMap = vocab.extensionMap || {};

    // Step 1: look up artist's chord_colors to get the target suffix
    let targetSuffix = null;
    if (artist && artist.chordColors) {
        targetSuffix = artist.chordColors[baseQuality] ?? null;
    } else if (artist && artist.chord_colors) {
        targetSuffix = artist.chord_colors[baseQuality] ?? null;
    }

    // Step 2: search extension_map for the matching suffix
    const entries = extMap[extKey] ?? [];
    if (targetSuffix) {
        const match = entries.find(e => e.suffix === targetSuffix);
        if (match && match.intervals) {
            return {
                intervals: match.intervals,
                voicing_label: match.label ?? match.voicing_label ?? targetSuffix,
                source: match.source ?? '',
            };
        }
    }

    // Step 3: fallback — find any entry in extension_map[extKey] with matching quality
    if (entries.length > 0) {
        const fallback = entries[0];
        return {
            intervals: fallback.intervals,
            voicing_label: fallback.label ?? fallback.voicing_label ?? fallback.suffix,
            source: fallback.source ?? '',
        };
    }

    // Step 4: look up in chord_types from vocab
    const chordTypes = vocab.chordTypes ?? {};
    if (targetSuffix && chordTypes[targetSuffix]) {
        const ct = chordTypes[targetSuffix];
        return {
            intervals: ct.intervals,
            voicing_label: ct.name ?? targetSuffix,
            source: '',
        };
    }

    // Step 5: hardcoded base intervals as final fallback
    const BASE_INTERVALS = { min: [0,3,7,10], maj: [0,4,7,11], dom: [0,4,7,10] };
    return {
        intervals: BASE_INTERVALS[baseQuality] ?? [0,4,7,11],
        voicing_label: baseQuality,
        source: '',
    };
}

// ── KEY INFERENCE ─────────────────────────────────────────────────────────────

/**
 * inferKeyCandidates(rootA, qualityA, rootB, qualityB)
 *
 * Tests all 24 major + minor keys, scores each.
 * Returns top 4: [{ tonic, mode, score }]
 */
export function inferKeyCandidates(rootA, qualityA, rootB, qualityB) {
    const scores = [];

    for (let tonic = 0; tonic < 12; tonic++) {
        for (const mode of ['major', 'minor']) {
            const scale = mode === 'major' ? MAJOR_SCALE : MINOR_SCALE;
            const qualities = mode === 'major' ? MAJOR_QUALITIES : MINOR_QUALITIES;
            let score = 0;

            for (const [root, quality] of [[rootA, qualityA], [rootB, qualityB]]) {
                const diff = ((root - tonic) + 12) % 12;
                const degIdx = scale.indexOf(diff);
                if (degIdx >= 0) {
                    score += 2; // root on a scale degree
                    const base = QUALITY_TO_BASE[quality] ?? 'maj';
                    const diatonicBase = QUALITY_TO_BASE[qualities[degIdx]] ?? 'maj';
                    if (base === diatonicBase) score += 1; // quality matches expected
                }
            }
            scores.push({ tonic, mode, score });
        }
    }

    // Also force rootA and rootB as tonic candidates
    for (const [root, mode] of [[rootA, 'major'], [rootA, 'minor'], [rootB, 'major'], [rootB, 'minor']]) {
        const existing = scores.find(s => s.tonic === root && s.mode === mode);
        if (existing) existing.score = Math.max(existing.score, 2);
    }

    scores.sort((a, b) => b.score - a.score);
    // Deduplicate tonic+mode combos (shouldn't be needed, but safety)
    const seen = new Set();
    const result = [];
    for (const s of scores) {
        const key = `${s.tonic}:${s.mode}`;
        if (!seen.has(key)) { seen.add(key); result.push(s); }
        if (result.length >= 4) break;
    }
    return result;
}

// ── DEGREE MATCHING ───────────────────────────────────────────────────────────

/**
 * matchProgressions(degreeA, degreeB, artistProgressions)
 *
 * Score each progression for how well it bridges A → B.
 * Returns sorted matches: [{ progression, score, indexA, indexB }]
 */
export function matchProgressions(degreeA, degreeB, artistProgressions) {
    if (!Array.isArray(artistProgressions)) return [];

    const results = [];

    for (const prog of artistProgressions) {
        const degrees = prog.degrees ?? [];
        if (degrees.length === 0) continue;

        // Strip quality suffixes from degree labels for matching
        // (progression degrees like 'im9' should match degreeA like 'im9' or 'i')
        const stripped = degrees.map(stripQuality);
        const strippedA = stripQuality(degreeA);
        const strippedB = stripQuality(degreeB);

        const idxA = stripped.findIndex(d => d === strippedA || degrees[stripped.indexOf(d)] === degreeA);
        const idxB = stripped.findIndex(d => d === strippedB || degrees[stripped.indexOf(d)] === degreeB);

        // Exact degree string matching
        const exactA = degrees.indexOf(degreeA);
        const exactB = degrees.indexOf(degreeB);

        const foundA = exactA >= 0 ? exactA : (idxA >= 0 ? idxA : -1);
        const foundB = exactB >= 0 ? exactB : (idxB >= 0 ? idxB : -1);

        let score = 0;
        if (foundA >= 0 && foundB >= 0) {
            score = foundA < foundB ? 3 : 1; // in-order vs reverse
        } else if (foundA >= 0) {
            score = 0.5;
        } else if (foundB >= 0) {
            score = 0.5;
        }

        if (score > 0) {
            results.push({ progression: prog, score, indexA: foundA, indexB: foundB });
        }
    }

    results.sort((a, b) => b.score - a.score);
    return results;
}

/** Strip quality suffixes from a degree string to get the bare roman numeral */
function stripQuality(degree) {
    // Remove trailing quality descriptors, keep prefix (b/#) and roman numeral
    return degree
        .replace(/maj\d+.*$/, '')
        .replace(/min\d+.*$/, '')
        .replace(/m\d+.*$/, '')
        .replace(/\d+.*$/, '')
        .replace(/sus\d*$/, '')
        .replace(/dim\d*$/, '')
        .replace(/aug\d*$/, '')
        .replace(/add\d+$/, '')
        .replace(/alt$/, '')
        .replace(/sus$/, '');
}

// ── DEGREE → ABSOLUTE ROOT RESOLUTION ────────────────────────────────────────

/**
 * degreeStringToRoot(degreeStr, tonic, mode)
 * Parses a degree string like 'bVII', 'iv', 'II', '#iv' and returns the pitch class.
 */
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

/**
 * degreeStringToBaseQuality(degreeStr)
 * Returns 'min' | 'maj' | 'dom' from a degree string like 'im7', 'IVmaj9', 'V7'
 */
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

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

/**
 * suggestChords(rootA, qualityA, rootB, qualityB, artistKey, vocab)
 *
 * @param {number} rootA      - semitone 0-11
 * @param {string} qualityA   - e.g. 'min7', 'maj7'
 * @param {number} rootB      - semitone 0-11
 * @param {string} qualityB
 * @param {string} artistKey  - key into vocab.styleTemplates
 * @param {object} vocab      - merged vocab from loadVocabulary()
 * @returns {VoicedChord[]}
 */
export function suggestChords(rootA, qualityA, rootB, qualityB, artistKey, vocab) {
    rootA = pc(rootA);
    rootB = pc(rootB);

    // ── Edge case: same chord → turnaround ────────────────────────────────────
    if (rootA === rootB && qualityA === qualityB) {
        return buildTurnaround(rootA, qualityA, artistKey, vocab);
    }

    // ── Edge case: tritone relationship ───────────────────────────────────────
    const tritone = pc(rootA - rootB) === 6 || pc(rootB - rootA) === 6;

    // ── Step 1: infer key candidates ─────────────────────────────────────────
    const candidates = inferKeyCandidates(rootA, qualityA, rootB, qualityB);

    // ── Step 2: for each key candidate, get degrees and match progressions ────
    const artistTemplate = (vocab.styleTemplates ?? {})[artistKey];
    const artistProgressions = artistTemplate?.progressions ?? [];

    let bestMatch = null;
    let bestKey = null;

    for (const candidate of candidates) {
        const degreeA = chordToDegree(rootA, qualityA, candidate.tonic, candidate.mode);
        const degreeB = chordToDegree(rootB, qualityB, candidate.tonic, candidate.mode);

        const matches = matchProgressions(degreeA, degreeB, artistProgressions);

        // Boost score if this key candidate has a direct match
        if (matches.length > 0 && matches[0].score > 0) {
            const totalScore = candidate.score + matches[0].score * 2;
            if (!bestMatch || totalScore > bestMatch.totalScore) {
                bestMatch = { ...matches[0], totalScore, degreeA, degreeB };
                bestKey = candidate;
            }
        }
    }

    // ── Step 3: extract intermediate degrees ─────────────────────────────────
    // score >= 3: both chords found in-order — extract chords between them
    // score >= 0.5: one chord found — extract neighbors around the anchor
    if (bestMatch && bestMatch.score >= 3 && bestKey) {
        const result = extractBridgeChords(
            bestMatch, bestKey, rootA, rootB, artistKey, vocab, 'direct'
        );
        if (result.length > 0) {
            if (tritone) result.forEach(c => { c.flag = 'adventurous'; });
            return result;
        }
    } else if (bestMatch && bestMatch.score >= 0.5 && bestKey) {
        // Partial match — anchor on whichever endpoint was found, pull neighbors
        const anchor = bestMatch.indexA >= 0 ? bestMatch.indexA : bestMatch.indexB;
        const syntheticMatch = {
            ...bestMatch,
            indexA: anchor,
            indexB: anchor,  // same position triggers neighbor extraction in extractBridgeChords
        };
        const result = extractBridgeChords(
            syntheticMatch, bestKey, rootA, rootB, artistKey, vocab, 'direct'
        );
        if (result.length > 0) {
            if (tritone) result.forEach(c => { c.flag = 'adventurous'; });
            return result;
        }
    }

    // ── Step 4: fallback bridge ───────────────────────────────────────────────
    const fallback = buildFallbackBridge(
        rootA, qualityA, rootB, qualityB, artistKey, vocab, candidates
    );
    if (fallback.length > 0) {
        if (tritone) fallback.forEach(c => { c.flag = 'adventurous'; });
        return fallback;
    }

    // ── Step 5: ii-V guarantee ────────────────────────────────────────────────
    return buildIIV(rootA, rootB, artistKey, vocab);
}

// ── BRIDGE BUILDERS ───────────────────────────────────────────────────────────

/**
 * Extract 2-4 intermediate chords from the best-matching progression segment.
 */
function extractBridgeChords(match, keyCandidate, rootA, rootB, artistKey, vocab, matchType) {
    const { indexA, indexB, progression } = match;
    const degrees = progression.degrees ?? [];
    const { tonic, mode } = keyCandidate;

    if (indexA < 0 || indexB < 0) return [];

    const lo = Math.min(indexA, indexB);
    const hi = Math.max(indexA, indexB);

    // Collect intermediate degrees (excluding A and B endpoints)
    let intermediates = [];
    if (hi - lo > 1) {
        intermediates = degrees.slice(lo + 1, hi);
    } else if (hi - lo === 0) {
        // same position — grab the surrounding degrees
        if (lo > 0) intermediates.push(degrees[lo - 1]);
        if (hi < degrees.length - 1) intermediates.push(degrees[hi + 1]);
    } else {
        // Adjacent — grab one degree from the other direction for variety
        // Try to get the degree after B or before A from the full progression
        if (hi < degrees.length - 1) intermediates.push(degrees[hi + 1]);
        else if (lo > 0) intermediates.push(degrees[lo - 1]);
    }

    // Reverse order if B comes before A in the progression
    if (indexA > indexB) intermediates.reverse();

    // Limit to 2-3 chords
    intermediates = intermediates.slice(0, 3);
    if (intermediates.length === 0) return [];

    return intermediates.map(degStr => buildVoicedChord(
        degStr, tonic, mode, artistKey, vocab, matchType
    )).filter(Boolean);
}

/**
 * Fallback: find any progression containing A, take next degrees;
 * find any containing B, take the degree before it.
 */
function buildFallbackBridge(rootA, qualityA, rootB, qualityB, artistKey, vocab, candidates) {
    const template = (vocab.styleTemplates ?? {})[artistKey];
    const progressions = template?.progressions ?? [];
    if (progressions.length === 0) return [];

    const topKey = candidates[0];
    if (!topKey) return [];

    const { tonic, mode } = topKey;
    const degreeA = chordToDegree(rootA, qualityA, tonic, mode);
    const degreeB = chordToDegree(rootB, qualityB, tonic, mode);
    const strippedA = stripQuality(degreeA);
    const strippedB = stripQuality(degreeB);

    const bridgeDegrees = new Set();

    // From progressions containing A: grab the next 1-2 degrees
    for (const prog of progressions) {
        const degrees = prog.degrees ?? [];
        const stripped = degrees.map(stripQuality);
        const aIdx = stripped.findIndex(d => d === strippedA);
        if (aIdx >= 0) {
            for (let i = aIdx + 1; i < Math.min(aIdx + 3, degrees.length); i++) {
                if (stripQuality(degrees[i]) !== strippedB) bridgeDegrees.add(degrees[i]);
            }
        }
    }

    // From progressions containing B: grab the degree before it
    for (const prog of progressions) {
        const degrees = prog.degrees ?? [];
        const stripped = degrees.map(stripQuality);
        const bIdx = stripped.findIndex(d => d === strippedB);
        if (bIdx > 0) {
            if (stripQuality(degrees[bIdx - 1]) !== strippedA) bridgeDegrees.add(degrees[bIdx - 1]);
        }
    }

    const collected = [...bridgeDegrees].slice(0, 2);
    if (collected.length === 0) return [];

    return collected.map(degStr => buildVoicedChord(
        degStr, tonic, mode, artistKey, vocab, 'bridged'
    )).filter(Boolean);
}

/**
 * Guaranteed ii-V bridge between A and B roots.
 */
function buildIIV(rootA, rootB, artistKey, vocab) {
    // ii of rootB = rootB - 5 semitones (ii is a P5 below V, V = rootB if dominant)
    const iiRoot = pc(rootB + 5);  // ii is a 4th above the V — but V resolves to rootB
    // So if rootB is the target, V = P5 above ii. ii = rootB - 5 (down a 4th)
    const vRoot = pc(rootB + 7);   // V is a P5 above rootB... hmm, standard ii-V-I:
    // Let's treat rootB as I, so V = rootB + 7 won't work. Standard: V7 is P5 above ii.
    // ii-V-I: ii = P2 above I, V = P5 above I (or P4 below)
    // We want chords between A and B. Simple: build ii-V of rootB's key
    const iiR = pc(rootB - 5);  // ii is a P4 below the target (=P5 interval, ii is 2nd degree)
    // Actually in key of rootB-major: ii = rootB+2, V = rootB+7, I = rootB
    const iiRoot2 = pc(rootB + 2);
    const vRoot2 = pc(rootB + 7);

    const result = [];

    const iiVoicing = resolveVoicing(artistKey, 'min', vocab);
    result.push({
        symbol: noteName(iiRoot2, FLAT_ROOTS.has(iiRoot2)) + 'm7',
        root: iiRoot2,
        intervals: iiVoicing.intervals,
        voicing_label: iiVoicing.voicing_label,
        source: iiVoicing.source,
        artist: artistKey,
        match_type: 'bridged',
    });

    const vVoicing = resolveVoicing(artistKey, 'dom', vocab);
    result.push({
        symbol: noteName(vRoot2, FLAT_ROOTS.has(vRoot2)) + '7',
        root: vRoot2,
        intervals: vVoicing.intervals,
        voicing_label: vVoicing.voicing_label,
        source: vVoicing.source,
        artist: artistKey,
        match_type: 'bridged',
    });

    return result;
}

/**
 * Turnaround: I-vi-ii-V (or artist equivalent if available)
 */
function buildTurnaround(root, quality, artistKey, vocab) {
    const template = (vocab.styleTemplates ?? {})[artistKey];
    const progressions = template?.progressions ?? [];
    const base = QUALITY_TO_BASE[quality] ?? 'maj';
    const mode = base === 'min' ? 'minor' : 'major';
    const scale = mode === 'major' ? MAJOR_SCALE : MINOR_SCALE;

    // Try to find a cyclic / loop progression in the artist's set
    const cyclic = progressions.find(p => p.label?.toLowerCase().includes('loop')
        || p.label?.toLowerCase().includes('vamp'));
    if (cyclic && cyclic.degrees.length >= 2) {
        const tonic = root;
        return cyclic.degrees.slice(0, 4).map(degStr =>
            buildVoicedChord(degStr, tonic, mode, artistKey, vocab, 'direct')
        ).filter(Boolean);
    }

    // Default I-vi-ii-V turnaround
    const tonicOffset = mode === 'major' ? [0, 9, 2, 7] : [0, 10, 5, 7];
    const baseQualities = mode === 'major'
        ? ['maj', 'min', 'min', 'dom']
        : ['min', 'maj', 'min', 'dom'];

    return tonicOffset.map((offset, i) => {
        const r = pc(root + scale[i === 0 ? 0 : (i === 1 ? 5 : (i === 2 ? 1 : 4))]);
        const bq = baseQualities[i];
        const voicing = resolveVoicing(artistKey, bq, vocab);
        return {
            symbol: buildSymbol(r, bq, vocab, artistKey),
            root: r,
            intervals: voicing.intervals,
            voicing_label: voicing.voicing_label,
            source: voicing.source,
            artist: artistKey,
            match_type: 'direct',
        };
    });
}

// ── CHORD BUILDING HELPERS ────────────────────────────────────────────────────

/**
 * Build a VoicedChord from a degree string + key context.
 */
function buildVoicedChord(degStr, tonic, mode, artistKey, vocab, matchType) {
    if (!degStr) return null;

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
        match_type: matchType,
        degree: degStr,
    };
}

/**
 * Build a chord symbol string like "Dm9" or "Fmaj7" from root + baseQuality.
 */
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
