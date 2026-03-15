// =============================================================================
// SCALES.SIN — CHORD AUDIO
// Web Audio API playback for voiced chord sequences.
// No dependencies. Triangle oscillators + ADSR envelope.
// =============================================================================

/** Map root semitone + interval array → frequencies in Hz, middle octave (C4=60) */
function intervalsToFrequencies(root, intervals) {
    // root: 0=C, 1=C#, ... 11=B → MIDI note 60 + root (middle C octave)
    const midiBase = 60 + root;
    return intervals.map(interval => {
        const midi = midiBase + interval;
        return 440 * Math.pow(2, (midi - 69) / 12);
    });
}

/**
 * playChord(root, intervals, audioCtx, startTime, duration)
 *
 * Plays all notes of a chord simultaneously using triangle oscillators
 * with a soft ADSR envelope.
 *
 * @param {number} root       - semitone 0-11 (0=C)
 * @param {number[]} intervals - semitone offsets from root
 * @param {AudioContext} audioCtx
 * @param {number} startTime  - AudioContext time in seconds
 * @param {number} duration   - note duration in seconds
 */
export function playChord(root, intervals, audioCtx, startTime, duration) {
    if (!intervals || intervals.length === 0) return;

    const frequencies = intervalsToFrequencies(root, intervals);
    const attackTime = 0.01;
    const decayTime = 0.08;
    const sustainLevel = 0.7;
    const releaseTime = 0.3;
    const peakGain = 0.22 / Math.max(frequencies.length, 1); // scale down per voice

    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(1.0, startTime);
    masterGain.connect(audioCtx.destination);

    for (const freq of frequencies) {
        const osc = audioCtx.createOscillator();
        const envGain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        // ADSR envelope
        envGain.gain.setValueAtTime(0, startTime);
        envGain.gain.linearRampToValueAtTime(peakGain, startTime + attackTime);
        envGain.gain.linearRampToValueAtTime(peakGain * sustainLevel, startTime + attackTime + decayTime);
        envGain.gain.setValueAtTime(peakGain * sustainLevel, startTime + duration - releaseTime);
        envGain.gain.linearRampToValueAtTime(0, startTime + duration);

        osc.connect(envGain);
        envGain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05); // tiny tail to avoid click
    }
}

/**
 * playChordSequence(voicedChords, rootA, intervalsA, rootB, intervalsB, options)
 *
 * Plays: chordA → ...voicedChords → chordB
 *
 * @param {object[]} voicedChords - array of VoicedChord from suggestChords()
 * @param {number} rootA
 * @param {number[]} intervalsA
 * @param {number} rootB
 * @param {number[]} intervalsB
 * @param {object} options
 * @param {number} options.bpm          - default 80
 * @param {number} options.noteDuration - seconds per chord, default 1.5
 * @param {number} options.gap          - silence between chords, default 0.2
 */
export function playChordSequence(voicedChords, rootA, intervalsA, rootB, intervalsB, options = {}) {
    const bpm = options.bpm ?? 80;
    const noteDuration = options.noteDuration ?? (60 / bpm * 2); // 2 beats per chord
    const gap = options.gap ?? 0.15;
    const stepTime = noteDuration + gap;

    // Create a fresh AudioContext for this playback session
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
        console.warn('[ChordAudio] Web Audio API not available.');
        return null;
    }
    const audioCtx = new AudioCtx();

    // Resume in case it's suspended (browser autoplay policy)
    const playSequence = () => {
        let t = audioCtx.currentTime + 0.05; // tiny scheduling lead

        const sequence = [
            { root: rootA, intervals: intervalsA },
            ...voicedChords.map(c => ({ root: c.root, intervals: c.intervals })),
            { root: rootB, intervals: intervalsB },
        ];

        for (const chord of sequence) {
            if (chord.intervals && chord.intervals.length > 0) {
                playChord(chord.root, chord.intervals, audioCtx, t, noteDuration);
            }
            t += stepTime;
        }

        // Auto-close the context after the sequence finishes + buffer
        const totalTime = t - audioCtx.currentTime + 0.5;
        setTimeout(() => {
            audioCtx.close().catch(() => {});
        }, totalTime * 1000);
    };

    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(playSequence);
    } else {
        playSequence();
    }

    return audioCtx;
}
