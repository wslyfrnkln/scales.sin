// =============================================================================
// SCALES.SIN — FRETBOARD RENDERER
// Guitar-specific: string/fret position calculation + SVG fretboard draw.
// Imports shared theory from music_theory.js.
// =============================================================================

import {
    CHORD_INTERVALS,
    TRIAD_INTERVALS,
    DROP2_INVERSIONS,
    DROP3_INVERSIONS,
    TRIAD_INVERSIONS,
    CYCLE_PATTERNS,
    getChordRoot,
} from './music_theory.js';

// ── Guitar constants ──────────────────────────────────────────────────────────

/** Standard tuning open string MIDI pitches (low E to high e). */
export const ALL_STRINGS_MIDI = [40, 45, 50, 55, 59, 64];

/** Adjacent 4-string sets for Drop 2 / 7th chords (0-indexed). */
export const STRING_SET_INDICES = {
    '6543': [0, 1, 2, 3],
    '5432': [1, 2, 3, 4],
    '4321': [2, 3, 4, 5],
};

/** Non-adjacent 4-string sets for Drop 3 (one string muted between bass + upper voices). */
export const STRING_SET_INDICES_DROP3 = {
    '6432': [0, 2, 3, 4],  // strings 6,4,3,2 — string 5 muted
    '5321': [1, 3, 4, 5],  // strings 5,3,2,1 — string 4 muted
};

/** Adjacent 3-string sets for triads. */
export const TRIAD_STRING_SET_INDICES = {
    '6543': [1, 2, 3],
    '5432': [2, 3, 4],
    '4321': [3, 4, 5],
};

// ── Drop 2 voicing calculation ────────────────────────────────────────────────

export function calculateVoicing(rootNote, chordType, inversionName, stringSet, targetFret) {
    const intervals    = CHORD_INTERVALS[chordType];
    const dropOrder    = DROP2_INVERSIONS[inversionName];
    const stringIndices = STRING_SET_INDICES[stringSet];

    const voicing = [];

    for (let i = 0; i < 4; i++) {
        const chordToneIndex = dropOrder[i];
        const interval  = intervals[chordToneIndex];
        const stringIdx = stringIndices[i];
        const stringMidi = ALL_STRINGS_MIDI[stringIdx];

        const targetMidi = rootNote + interval;
        let fret = targetMidi - stringMidi;

        while (fret < targetFret - 6) fret += 12;
        while (fret > targetFret + 6) fret -= 12;
        if (fret < 0)  fret += 12;
        if (fret > 17) fret -= 12;

        voicing.push({ stringIndex: stringIdx, fret, chordTone: chordToneIndex });
    }

    const avgFret = voicing.reduce((sum, v) => sum + v.fret, 0) / 4;
    return { notes: voicing, avgFret, inversion: inversionName };
}

export function findLowestVoicing(rootMidi, chordType, inversionName, stringSet) {
    const candidates = [];
    for (let octave = -2; octave <= 1; octave++) {
        const adjustedRoot = rootMidi + octave * 12;
        for (let targetFret = 0; targetFret <= 15; targetFret++) {
            const v = calculateVoicing(adjustedRoot, chordType, inversionName, stringSet, targetFret);
            const frets = v.notes.map(n => n.fret);
            const span  = Math.max(...frets) - Math.min(...frets);
            if (Math.min(...frets) >= 0 && Math.max(...frets) <= 18 && span <= 5) candidates.push(v);
        }
    }
    if (!candidates.length) return null;
    return candidates.sort((a, b) => a.avgFret - b.avgFret)[0];
}

export function findHighestVoicing(rootMidi, chordType, inversionName, stringSet) {
    const candidates = [];
    for (let octave = -1; octave <= 2; octave++) {
        const adjustedRoot = rootMidi + octave * 12;
        for (let targetFret = 0; targetFret <= 15; targetFret++) {
            const v = calculateVoicing(adjustedRoot, chordType, inversionName, stringSet, targetFret);
            const frets = v.notes.map(n => n.fret);
            const span  = Math.max(...frets) - Math.min(...frets);
            if (Math.min(...frets) >= 0 && Math.max(...frets) <= 18 && span <= 5) candidates.push(v);
        }
    }
    if (!candidates.length) return null;
    return candidates.sort((a, b) => b.avgFret - a.avgFret)[0];
}

export function findVoiceledVoicing(rootMidi, chordType, inversionName, stringSet, prevVoicing, direction) {
    const candidates = [];
    for (let octave = -2; octave <= 3; octave++) {
        const adjustedRoot = rootMidi + octave * 12;
        for (let targetFret = 0; targetFret <= 17; targetFret++) {
            const v = calculateVoicing(adjustedRoot, chordType, inversionName, stringSet, targetFret);
            const frets = v.notes.map(n => n.fret);
            const span  = Math.max(...frets) - Math.min(...frets);
            if (Math.min(...frets) < 0 || Math.max(...frets) > 18 || span > 5) continue;

            let totalMovement = 0, maxMove = 0;
            for (let i = 0; i < 4; i++) {
                const m = Math.abs(v.notes[i].fret - prevVoicing.notes[i].fret);
                totalMovement += m;
                maxMove = Math.max(maxMove, m);
            }
            const fretDiff = v.avgFret - prevVoicing.avgFret;
            let score = totalMovement * 10;
            if (maxMove > 5) score += (maxMove - 5) * 50;
            if (direction === 'up') {
                if (fretDiff < -2) score += 30;
                else if (fretDiff > 0) score -= 2;
            } else {
                if (fretDiff > 2) score += 30;
                else if (fretDiff < 0) score -= 2;
            }
            candidates.push({ voicing: v, score });
        }
    }
    if (!candidates.length) return calculateVoicing(rootMidi, chordType, inversionName, stringSet, prevVoicing.avgFret);
    return candidates.sort((a, b) => a.score - b.score)[0].voicing;
}

// ── Drop 3 voicing calculation ────────────────────────────────────────────────

export function calculateVoicingDrop3(rootNote, chordType, inversionName, stringSet, targetFret) {
    const intervals     = CHORD_INTERVALS[chordType];
    const dropOrder     = DROP3_INVERSIONS[inversionName];
    const stringIndices = STRING_SET_INDICES_DROP3[stringSet];

    const voicing = [];
    for (let i = 0; i < 4; i++) {
        const chordToneIndex = dropOrder[i];
        const interval  = intervals[chordToneIndex];
        const stringIdx = stringIndices[i];
        const stringMidi = ALL_STRINGS_MIDI[stringIdx];

        const targetMidi = rootNote + interval;
        let fret = targetMidi - stringMidi;

        while (fret < targetFret - 6) fret += 12;
        while (fret > targetFret + 6) fret -= 12;
        if (fret < 0)  fret += 12;
        if (fret > 17) fret -= 12;

        voicing.push({ stringIndex: stringIdx, fret, chordTone: chordToneIndex });
    }

    const avgFret = voicing.reduce((sum, v) => sum + v.fret, 0) / 4;
    return { notes: voicing, avgFret, inversion: inversionName };
}

export function findLowestVoicingDrop3(rootMidi, chordType, inversionName, stringSet) {
    const candidates = [];
    for (let octave = -2; octave <= 1; octave++) {
        const adjustedRoot = rootMidi + octave * 12;
        for (let targetFret = 0; targetFret <= 15; targetFret++) {
            const v = calculateVoicingDrop3(adjustedRoot, chordType, inversionName, stringSet, targetFret);
            const frets = v.notes.map(n => n.fret);
            const span  = Math.max(...frets) - Math.min(...frets);
            if (Math.min(...frets) >= 0 && Math.max(...frets) <= 18 && span <= 6) candidates.push(v);
        }
    }
    if (!candidates.length) return null;
    return candidates.sort((a, b) => a.avgFret - b.avgFret)[0];
}

export function findHighestVoicingDrop3(rootMidi, chordType, inversionName, stringSet) {
    const candidates = [];
    for (let octave = -1; octave <= 2; octave++) {
        const adjustedRoot = rootMidi + octave * 12;
        for (let targetFret = 0; targetFret <= 15; targetFret++) {
            const v = calculateVoicingDrop3(adjustedRoot, chordType, inversionName, stringSet, targetFret);
            const frets = v.notes.map(n => n.fret);
            const span  = Math.max(...frets) - Math.min(...frets);
            if (Math.min(...frets) >= 0 && Math.max(...frets) <= 18 && span <= 6) candidates.push(v);
        }
    }
    if (!candidates.length) return null;
    return candidates.sort((a, b) => b.avgFret - a.avgFret)[0];
}

export function findVoiceledVoicingDrop3(rootMidi, chordType, inversionName, stringSet, prevVoicing, direction) {
    const candidates = [];
    for (let octave = -2; octave <= 3; octave++) {
        const adjustedRoot = rootMidi + octave * 12;
        for (let targetFret = 0; targetFret <= 17; targetFret++) {
            const v = calculateVoicingDrop3(adjustedRoot, chordType, inversionName, stringSet, targetFret);
            const frets = v.notes.map(n => n.fret);
            const span  = Math.max(...frets) - Math.min(...frets);
            if (Math.min(...frets) < 0 || Math.max(...frets) > 18 || span > 6) continue;

            let totalMovement = 0, maxMove = 0;
            for (let i = 0; i < 4; i++) {
                const m = Math.abs(v.notes[i].fret - prevVoicing.notes[i].fret);
                totalMovement += m;
                maxMove = Math.max(maxMove, m);
            }
            const fretDiff = v.avgFret - prevVoicing.avgFret;
            let score = totalMovement * 10;
            if (maxMove > 5) score += (maxMove - 5) * 50;
            if (direction === 'up') {
                if (fretDiff < -2) score += 30;
                else if (fretDiff > 0) score -= 2;
            } else {
                if (fretDiff > 2) score += 30;
                else if (fretDiff < 0) score -= 2;
            }
            candidates.push({ voicing: v, score });
        }
    }
    if (!candidates.length) return calculateVoicingDrop3(rootMidi, chordType, inversionName, stringSet, prevVoicing.avgFret);
    return candidates.sort((a, b) => a.score - b.score)[0].voicing;
}

// ── Triad voicing calculation ─────────────────────────────────────────────────

export function calculateTriadVoicing(rootNote, triadType, inversionName, stringSet, targetFret) {
    const intervals     = TRIAD_INTERVALS[triadType];
    if (!intervals) return null;
    const dropOrder     = TRIAD_INVERSIONS[inversionName];
    const stringIndices = TRIAD_STRING_SET_INDICES[stringSet];

    const voicing = [];
    for (let i = 0; i < 3; i++) {
        const chordToneIndex = dropOrder[i];
        const interval  = intervals[chordToneIndex];
        const stringIdx = stringIndices[i];
        const stringMidi = ALL_STRINGS_MIDI[stringIdx];

        const targetMidi = rootNote + interval;
        let fret = targetMidi - stringMidi;

        while (fret < targetFret - 6) fret += 12;
        while (fret > targetFret + 6) fret -= 12;
        if (fret < 0)  fret += 12;
        if (fret > 17) fret -= 12;

        voicing.push({ stringIndex: stringIdx, fret, chordTone: chordToneIndex });
    }

    const avgFret = voicing.reduce((sum, v) => sum + v.fret, 0) / 3;
    return { notes: voicing, avgFret, inversion: inversionName };
}

export function findLowestTriadVoicing(rootMidi, triadType, inversionName, stringSet) {
    const candidates = [];
    for (let octave = -2; octave <= 1; octave++) {
        const adjustedRoot = rootMidi + octave * 12;
        for (let targetFret = 0; targetFret <= 15; targetFret++) {
            const v = calculateTriadVoicing(adjustedRoot, triadType, inversionName, stringSet, targetFret);
            if (!v) continue;
            const frets = v.notes.map(n => n.fret);
            const span  = Math.max(...frets) - Math.min(...frets);
            if (Math.min(...frets) >= 0 && Math.max(...frets) <= 18 && span <= 5) candidates.push(v);
        }
    }
    if (!candidates.length) return null;
    return candidates.sort((a, b) => a.avgFret - b.avgFret)[0];
}

export function findHighestTriadVoicing(rootMidi, triadType, inversionName, stringSet) {
    const candidates = [];
    for (let octave = -1; octave <= 2; octave++) {
        const adjustedRoot = rootMidi + octave * 12;
        for (let targetFret = 0; targetFret <= 15; targetFret++) {
            const v = calculateTriadVoicing(adjustedRoot, triadType, inversionName, stringSet, targetFret);
            if (!v) continue;
            const frets = v.notes.map(n => n.fret);
            const span  = Math.max(...frets) - Math.min(...frets);
            if (Math.min(...frets) >= 0 && Math.max(...frets) <= 18 && span <= 5) candidates.push(v);
        }
    }
    if (!candidates.length) return null;
    return candidates.sort((a, b) => b.avgFret - a.avgFret)[0];
}

export function findVoiceledTriadVoicing(rootMidi, triadType, inversionName, stringSet, prevVoicing, direction) {
    const candidates = [];
    for (let octave = -2; octave <= 3; octave++) {
        const adjustedRoot = rootMidi + octave * 12;
        for (let targetFret = 0; targetFret <= 17; targetFret++) {
            const v = calculateTriadVoicing(adjustedRoot, triadType, inversionName, stringSet, targetFret);
            if (!v) continue;
            const frets = v.notes.map(n => n.fret);
            const span  = Math.max(...frets) - Math.min(...frets);
            if (Math.min(...frets) < 0 || Math.max(...frets) > 18 || span > 5) continue;

            let totalMovement = 0, maxMove = 0;
            for (let i = 0; i < 3; i++) {
                const m = Math.abs(v.notes[i].fret - prevVoicing.notes[i].fret);
                totalMovement += m;
                maxMove = Math.max(maxMove, m);
            }
            const fretDiff = v.avgFret - prevVoicing.avgFret;
            let score = totalMovement * 10;
            if (maxMove > 5) score += (maxMove - 5) * 50;
            if (direction === 'up') {
                if (fretDiff < -2) score += 30;
                else if (fretDiff > 0) score -= 2;
            } else {
                if (fretDiff > 2) score += 30;
                else if (fretDiff < 0) score -= 2;
            }
            candidates.push({ voicing: v, score });
        }
    }
    if (!candidates.length) return calculateTriadVoicing(rootMidi, triadType, inversionName, stringSet, prevVoicing.avgFret);
    return candidates.sort((a, b) => a.score - b.score)[0].voicing;
}

// ── Row generation ────────────────────────────────────────────────────────────

function buildAllChords(keyRoot, scaleIntervals, chordQualityTypes, chordQualities, inv1, inv2, intervalKey, direction, findLowest, findHighest) {
    const baseCycle = CYCLE_PATTERNS[intervalKey][direction];
    return baseCycle.map((degree, i) => {
        const chordRoot = getChordRoot(keyRoot, degree, scaleIntervals);
        const chordType = chordQualityTypes[degree];
        const quality   = chordQualities[degree];
        const rootMidi  = 48 + chordRoot;

        const lowestInv1  = findLowest(rootMidi, chordType, inv1);
        const lowestInv2  = findLowest(rootMidi, chordType, inv2);
        const highestInv1 = findHighest(rootMidi, chordType, inv1);
        const highestInv2 = findHighest(rootMidi, chordType, inv2);

        const lowestVoicing  = (lowestInv1  && lowestInv2)  ? (lowestInv1.avgFret  < lowestInv2.avgFret  ? lowestInv1  : lowestInv2)  : (lowestInv1  || lowestInv2);
        const highestVoicing = (highestInv1 && highestInv2) ? (highestInv1.avgFret > highestInv2.avgFret ? highestInv1 : highestInv2) : (highestInv1 || highestInv2);

        return {
            degree, degreeLabel: degree + 1,
            root: chordRoot, chordType, quality, rootMidi,
            lowestVoicing,  highestVoicing,
            lowestAvgFret:  lowestVoicing  ? lowestVoicing.avgFret  : 100,
            highestAvgFret: highestVoicing ? highestVoicing.avgFret : 0,
        };
    });
}

function voiceLeadRow(allChords, inv1, inv2, direction, findLowestFn, findHighestFn, findVoiceledFn) {
    const startIdx = direction === 'up'
        ? allChords.reduce((mi, c, i, a) => c.lowestAvgFret  < a[mi].lowestAvgFret  ? i : mi, 0)
        : allChords.reduce((mi, c, i, a) => c.highestAvgFret > a[mi].highestAvgFret ? i : mi, 0);

    const orderedChords = [];
    for (let loop = 0; loop < 10; loop++) {
        for (let i = 0; i < allChords.length; i++) {
            const idx = (startIdx + i) % allChords.length;
            orderedChords.push({ ...allChords[idx], isTonic: allChords[idx].degree === 0 });
        }
    }

    const row = [];
    let prevVoicing = null;

    for (let i = 0; i < orderedChords.length; i++) {
        const chord    = orderedChords[i];
        const inversion = (i % 2 === 0) ? inv1 : inv2;
        let voicing;

        if (i === 0) {
            voicing = direction === 'up'
                ? findLowestFn(chord.rootMidi, chord.chordType, inversion)
                : findHighestFn(chord.rootMidi, chord.chordType, inversion);
        } else {
            voicing = findVoiceledFn(chord.rootMidi, chord.chordType, inversion, prevVoicing, direction);
        }

        if (!voicing) continue;
        row.push({ voicing, root: chord.root, quality: chord.quality, inversion, degreeLabel: chord.degreeLabel, isTonic: chord.isTonic });
        prevVoicing = voicing;
    }

    return row;
}

/** Generate a Drop 2 voice-led row. */
export function generateRow(keyRoot, stringSet, inv1, inv2, intervalKey, direction, scaleIntervals, chordQualityTypes, chordQualities) {
    const allChords = buildAllChords(
        keyRoot, scaleIntervals, chordQualityTypes, chordQualities,
        inv1, inv2, intervalKey, direction,
        (midi, type, inv) => findLowestVoicing(midi, type, inv, stringSet),
        (midi, type, inv) => findHighestVoicing(midi, type, inv, stringSet),
    );
    return voiceLeadRow(
        allChords, inv1, inv2, direction,
        (midi, type, inv) => findLowestVoicing(midi, type, inv, stringSet),
        (midi, type, inv) => findHighestVoicing(midi, type, inv, stringSet),
        (midi, type, inv, prev, dir) => findVoiceledVoicing(midi, type, inv, stringSet, prev, dir),
    );
}

/** Generate a Drop 3 voice-led row. */
export function generateRowDrop3(keyRoot, stringSet, inv1, inv2, intervalKey, direction, scaleIntervals, chordQualityTypes, chordQualities) {
    const allChords = buildAllChords(
        keyRoot, scaleIntervals, chordQualityTypes, chordQualities,
        inv1, inv2, intervalKey, direction,
        (midi, type, inv) => findLowestVoicingDrop3(midi, type, inv, stringSet),
        (midi, type, inv) => findHighestVoicingDrop3(midi, type, inv, stringSet),
    );
    return voiceLeadRow(
        allChords, inv1, inv2, direction,
        (midi, type, inv) => findLowestVoicingDrop3(midi, type, inv, stringSet),
        (midi, type, inv) => findHighestVoicingDrop3(midi, type, inv, stringSet),
        (midi, type, inv, prev, dir) => findVoiceledVoicingDrop3(midi, type, inv, stringSet, prev, dir),
    );
}

/** Generate a Triad voice-led row. */
export function generateTriadRow(keyRoot, stringSet, inv1, inv2, intervalKey, direction, scaleIntervals, triadQualityTypes, triadQualities) {
    const baseCycle = CYCLE_PATTERNS[intervalKey][direction];
    const allChords = baseCycle.map(degree => {
        const chordRoot = getChordRoot(keyRoot, degree, scaleIntervals);
        const triadType = triadQualityTypes[degree];
        const quality   = triadQualities[degree];
        const rootMidi  = 48 + chordRoot;

        const lowestInv1  = findLowestTriadVoicing(rootMidi, triadType, inv1, stringSet);
        const lowestInv2  = findLowestTriadVoicing(rootMidi, triadType, inv2, stringSet);
        const highestInv1 = findHighestTriadVoicing(rootMidi, triadType, inv1, stringSet);
        const highestInv2 = findHighestTriadVoicing(rootMidi, triadType, inv2, stringSet);

        const lowestVoicing  = (lowestInv1  && lowestInv2)  ? (lowestInv1.avgFret  < lowestInv2.avgFret  ? lowestInv1  : lowestInv2)  : (lowestInv1  || lowestInv2);
        const highestVoicing = (highestInv1 && highestInv2) ? (highestInv1.avgFret > highestInv2.avgFret ? highestInv1 : highestInv2) : (highestInv1 || highestInv2);

        return { degree, degreeLabel: degree + 1, root: chordRoot, triadType, quality, rootMidi, lowestVoicing, highestVoicing, lowestAvgFret: lowestVoicing ? lowestVoicing.avgFret : 100, highestAvgFret: highestVoicing ? highestVoicing.avgFret : 0 };
    });

    return voiceLeadRow(
        allChords, inv1, inv2, direction,
        (midi, type, inv) => findLowestTriadVoicing(midi, type, inv, stringSet),
        (midi, type, inv) => findHighestTriadVoicing(midi, type, inv, stringSet),
        (midi, type, inv, prev, dir) => findVoiceledTriadVoicing(midi, type, inv, stringSet, prev, dir),
    );
}

// ── SVG fretboard rendering ───────────────────────────────────────────────────

const CHORD_TONE_COLORS = { 0: '#e85d4c', 1: '#4a90a4', 2: '#7db87d', 3: '#c9a227' };
const CHORD_TONE_LABELS = { 0: 'R', 1: '3', 2: '5', 3: '7' };
const TRIAD_TONE_COLORS = { 0: '#e85d4c', 1: '#4a90a4', 2: '#7db87d' };
const TRIAD_TONE_LABELS = { 0: 'R', 1: '3', 2: '5' };

const SVG_WIDTH  = 85;
const SVG_HEIGHT = 120;
const NUM_STRINGS = 6;
const NUM_FRETS   = 5;
const STRING_SPACING = 10;
const FRET_SPACING   = 19;
const LEFT_MARGIN    = 22;
const TOP_MARGIN     = 20;

function buildFretboardSVG(voicing, usedStringIndices, colors, labels) {
    const frets = voicing.notes.map(n => n.fret);
    const minFret = Math.min(...frets);
    const maxFret = Math.max(...frets);

    let displayStartFret = Math.max(1, minFret);
    if (minFret === 0) displayStartFret = 1;
    else if (maxFret - displayStartFret >= NUM_FRETS) displayStartFret = Math.max(1, maxFret - NUM_FRETS + 1);

    const showNut = displayStartFret === 1;

    let svg = `<svg viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">`;

    // Fret number indicator
    svg += `<text x="5" y="${TOP_MARGIN + FRET_SPACING / 2 + 3}" font-family="JetBrains Mono, monospace" font-size="8" fill="#a89f94">${displayStartFret}</text>`;

    // String header row (chord tone letter or × for muted)
    for (let i = 0; i < NUM_STRINGS; i++) {
        const x = LEFT_MARGIN + i * STRING_SPACING;
        if (!usedStringIndices.includes(i)) {
            svg += `<text x="${x}" y="10" font-family="JetBrains Mono, monospace" font-size="8" fill="#a89f94" text-anchor="middle">×</text>`;
        } else {
            const note = voicing.notes.find(n => n.stringIndex === i);
            if (note) {
                svg += `<text x="${x}" y="10" font-family="JetBrains Mono, monospace" font-size="7" fill="${colors[note.chordTone]}" text-anchor="middle" font-weight="600">${labels[note.chordTone]}</text>`;
            }
        }
    }

    // Nut
    if (showNut) {
        svg += `<rect x="${LEFT_MARGIN - 2}" y="${TOP_MARGIN - 2}" width="${STRING_SPACING * (NUM_STRINGS - 1) + 4}" height="3" fill="#f5f0e8" rx="1"/>`;
    }

    // Fret wires
    for (let i = 0; i <= NUM_FRETS; i++) {
        const y = TOP_MARGIN + i * FRET_SPACING;
        svg += `<line x1="${LEFT_MARGIN - 2}" y1="${y}" x2="${LEFT_MARGIN + STRING_SPACING * (NUM_STRINGS - 1) + 2}" y2="${y}" stroke="#8a8078" stroke-width="${i === 0 && !showNut ? 1.5 : 1}"/>`;
    }

    // Strings
    for (let i = 0; i < NUM_STRINGS; i++) {
        const x = LEFT_MARGIN + i * STRING_SPACING;
        const opacity = usedStringIndices.includes(i) ? 1 : 0.35;
        svg += `<line x1="${x}" y1="${TOP_MARGIN}" x2="${x}" y2="${TOP_MARGIN + NUM_FRETS * FRET_SPACING}" stroke="#d4cfc5" stroke-width="1.2" opacity="${opacity}"/>`;
    }

    // Finger dots
    voicing.notes.forEach(note => {
        const x = LEFT_MARGIN + note.stringIndex * STRING_SPACING;
        const color = colors[note.chordTone];
        const label = labels[note.chordTone];

        if (note.fret === 0) {
            const y = TOP_MARGIN - 8;
            svg += `<circle cx="${x}" cy="${y}" r="5" fill="${color}"/>`;
            svg += `<text x="${x}" y="${y + 2.5}" font-family="JetBrains Mono, monospace" font-size="5" fill="white" text-anchor="middle" font-weight="600">${label}</text>`;
        } else {
            const fretOffset = note.fret - displayStartFret;
            if (fretOffset >= 0 && fretOffset < NUM_FRETS) {
                const y = TOP_MARGIN + fretOffset * FRET_SPACING + FRET_SPACING / 2;
                svg += `<circle cx="${x}" cy="${y}" r="7" fill="${color}"/>`;
                svg += `<text x="${x}" y="${y + 2.5}" font-family="JetBrains Mono, monospace" font-size="7" fill="white" text-anchor="middle" font-weight="600">${label}</text>`;
            }
        }
    });

    svg += '</svg>';
    return svg;
}

/** Render a Drop 2 or Drop 3 7th chord voicing. stringSet determines which index map to use. */
export function createFretboardSVG(voicing, stringSet) {
    const usedIndices = STRING_SET_INDICES[stringSet];
    return buildFretboardSVG(voicing, usedIndices, CHORD_TONE_COLORS, CHORD_TONE_LABELS);
}

/** Render a Drop 3 voicing (uses non-adjacent string set map). */
export function createFretboardSVGDrop3(voicing, stringSet) {
    const usedIndices = STRING_SET_INDICES_DROP3[stringSet];
    return buildFretboardSVG(voicing, usedIndices, CHORD_TONE_COLORS, CHORD_TONE_LABELS);
}

/** Render a triad voicing (3-note, adjacent strings). */
export function createTriadFretboardSVG(voicing, stringSet) {
    const usedIndices = TRIAD_STRING_SET_INDICES[stringSet];
    return buildFretboardSVG(voicing, usedIndices, TRIAD_TONE_COLORS, TRIAD_TONE_LABELS);
}
