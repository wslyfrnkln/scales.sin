# Research Brief: Scales.sin Drop 2 / Drop 3 Guitar Voicing Quality
**Date:** 2026-03-08
**Depth:** deep
**Rounds:** 5
**Project:** Scales.sin

---

## TL;DR

Drop 2 on strings 5-4-3-2 is the algorithmic sweet spot for jazz/pop guitar voicings — best register, best voice leading, best playability — with fret floor at 3 (bass note) and ceiling at 15; voice leading is minimized by cycling through all 4 inversions in diatonic order rather than re-rooting every chord.

---

## Recommendation

**For the Scales.sin voicing engine, do the following:**

1. **Primary string set: Drop 2 on 5-4-3-2.** Deprioritize 6-5-4-3 (muddy below fret 5) and 4-3-2-1 (thin above fret 10). Use 6-5-4-3 only when the root note is on string 6 and the bass note lands at fret 5+.

2. **Voice leading: cycle inversions, don't re-root.** When generating a diatonic progression, select the inversion of each chord that keeps total semitone movement across all 4 voices minimal relative to the previous chord — not the root position of each chord. This is the core algorithmic insight: Drop 2's self-voicing property means inversions adjacent in the cycle produce near-zero movement [7, 8].

3. **Fret quality gates:** Apply hard cutoffs in the voicing scorer:
   - Strings 6-5-4-3: floor = fret 5, ceiling = fret 12
   - Strings 5-4-3-2: floor = fret 3, ceiling = fret 14
   - Strings 4-3-2-1: floor = fret 3, ceiling = fret 12
   - Strings 6-4-3-2 (Drop 3): floor = fret 4, ceiling = fret 12
   - Strings 5-3-2-1 (Drop 3): floor = fret 3, ceiling = fret 13

4. **Extended chords: omit 5th first, then root.** For Maj9/m9/dom9: omit 5. For Maj13: omit 5 and 11. For m11: omit 5 and optionally root. Never omit 3 or 7.

5. **Drop 3 role: solo guitar / bass-note comping.** Drop 3 on 6-4-3-2 is better than Drop 2 on 6-5-4-3 for lower-register voicings because the string skip separates bass from harmony, reducing muddiness. Use Drop 3 as a fallback when Drop 2 fails the fret floor gate on the low set.

6. **Scoring function:** Weight voice leading efficiency (total semitone delta across voices, lower = better) alongside fret position (prefer 5-10 range), playability (max finger span <= 4 frets), and register (penalize bass notes below open E+5 frets). This matches how ISMIR 2025 FretboardFlow approached the problem [12].

---

## Key Findings

### Q1: Practical Fret Position Preferences Per Inversion

Drop 2 voicings on strings 5-4-3-2 distribute across the neck as follows (computed from standard tuning intervals + confirmed against pedagogy sources [1, 2, 3]):

**Drop 2 / Maj7 / Strings 5-4-3-2 (C = root at fret 3):**
- Root position (R-5-7-3): frets 3-2-4-5 (compact, low position, C root)
- 1st inversion (3-7-R-5): frets 5-4-5-5 (E in bass, mid position)
- 2nd inversion (5-R-3-7): frets 5-3-5-4 (G in bass)
- 3rd inversion (7-3-5-R): frets 7-5-5-3 (B in bass, higher position)

Each inversion ascends ~2-3 frets up the neck, creating a natural staircase. Moving from root to 3rd inversion covers approximately a minor 3rd (3-4 frets) up the neck [1, 2].

**For any root on string 5:**
- Root position: root fret, +/- 1-2 frets across adjacent strings
- 1st inversion: root fret + 2
- 2nd inversion: root fret + 2-3
- 3rd inversion: root fret + 4-5

**Drop 2 on strings 6-5-4-3** sits proportionally lower — roughly 2 frets below the 5-4-3-2 equivalent voicing for the same root, putting root-position voicings of common keys (C, D, G, F) in the fret 3-8 range. This lands below fret 5 for keys in the flat/natural cluster, which is the muddy zone [2, 4].

**Drop 3 on strings 6-4-3-2:**
String skip separates the bass note (string 6) from the upper 3 voices (4-3-2). Root position typically lands with the bass note at fret 8 (key of C = fret 8 on string 6), upper voices at frets 7-5-5 or similar. First inversion brings the bass note down to fret 5, upper voices up slightly. This is why Drop 3 on 6-4-3-2 is actually cleaner than Drop 2 on 6-5-4-3 in lower positions — the string skip provides acoustic separation [5, 6].

### Q2: Register Quality Cutoffs

**Low-end muddiness** is a known problem below fret 5 on strings 6 and 5 [4]. The physics: on electric guitar, low-register notes below ~130 Hz (roughly the open A string) have fundamentals that the amp/speaker reproduces poorly and the chord tones have intervals too narrow for the ear to separate clearly. On acoustic, same problem — intervals below a 10th in the bass register sound cluttered.

Practical rule cited in pedagogy sources: "Drop 2 chords on strings 1-4 and 2-5 are the most useful" — this is a direct register quality recommendation, not just a playability one [2, 4].

**Upper-end thinning** above fret 12: the guitar body cutaway on many acoustics ends at fret 14; on electric, the sound gets increasingly thin above fret 12 as string tension drops and sustain shortens. Not a hard cutoff for playability but a quality preference — sustained comping voicings above fret 12 sound "guitaristic" rather than full [4, 9].

**String-set quality ranking (best to worst for jazz comping):**
1. Strings 5-4-3-2: wide usable range, best register balance
2. Strings 6-4-3-2 (Drop 3): good separation, bass stays grounded
3. Strings 4-3-2-1: clean but thin in high positions
4. Strings 6-5-4-3 (Drop 2): muddy below fret 5, acceptable fret 5-12
5. Strings 5-3-2-1 (Drop 3): workable but less common, thin top end

### Q3: Voice Leading Between Inversions

**The core finding:** Drop 2 voicings have a structural property where cycling through all 4 inversions in a diatonic progression (cycle of 4ths) produces near-minimal voice movement automatically [7, 8]. This is because:

- When you move from chord I to chord IV (a 4th up), 2 voices move by step and 2 stay as common tones [7]
- The voice leading "takes care of itself" when you select the inversion whose bass note is closest to the previous chord's bass note [7]

**Optimal inversion cycle for Drop 2 in a diatonic cycle of 4ths (e.g., Cmaj7 → Fmaj7 → Bm7b5...):**

The rule: when moving forward in the cycle of 4ths, the next chord's inversion that produces minimal voice movement is typically one inversion "ahead" in the cycle — i.e., if you play Cmaj7 in root position, play Fmaj7 in 1st inversion, Bm7b5 in 2nd inversion, Em7 in 3rd inversion, then wrap. The total movement averages ~2-3 semitones per voice [7, 8].

**For Drop 3:** Voice leading is less "automatic" because the string skip creates larger jumps between inversions. The same principle applies — select the inversion closest in fret position to the previous chord — but manual scoring of semitone delta is needed rather than relying on inherent structure [5, 6].

**Practical algorithm:**
- Enumerate all valid inversions (that pass fret gate) for each chord
- Score each candidate by sum of |prev_fret[i] - cand_fret[i]| across all 4 voice strings
- Select minimum score, breaking ties by preferring the lower overall fret position
- This is equivalent to the graph search in the Dartmouth CS thesis [11]

### Q4: Extended Chord Voicing Conventions

**Maj9 (R-3-5-7-9):**
- Omit: 5 (perfect fifth). "It's better to omit the fifth or even the root than the seventh, the third or the ninth" [2, 10]
- Keep: R-3-7-9 (four strings)
- Construction: take the Drop 2 maj7 shape and move the root up 2 frets to the 9th [10]
- Preferred string set: 5-4-3-2, frets 5-9
- With bass player: drop root too — play 3-7-9 on strings 4-3-2

**m9 (R-b3-5-b7-9):**
- Omit: 5
- Keep: R-b3-b7-9
- Same construction principle as Maj9: modify Drop 2 m7 shape, raise root → 9
- Preferred string set: 5-4-3-2, frets 5-9 [10]

**dom9 (R-3-5-b7-9):**
- Omit: 5
- Keep: R-3-b7-9
- Most common jazz comping voicing for dominant chords
- Preferred string set: 5-4-3-2, frets 5-10 [10]

**Maj13 (R-3-5-7-9-11-13):**
- Omit: 5 and 11 (perfect 11th creates clash with major 3rd)
- Keep: 3-7-9-13 (rootless, four strings — hand the root to the bass)
- On guitar: R-3-7-13 or 3-7-9-13 depending on register [13]
- Preferred string set: 5-4-3-2, frets 5-9

**m11 (R-b3-5-b7-9-11):**
- Omit: 5, optionally root
- Keep: b3-b7-9-11 (the four most characteristic tones)
- Note: 11 = 4, making the voicing function like a sus4 with a minor 3rd — distinguish by including b3 [14]
- Common voicing: R-b7-b3-11 on strings 6-4-3-2 (Drop 3 style, string skip keeps it clean)
- Preferred string set: 5-4-3-2 or 6-4-3-2, frets 5-10

### Q5: Standard References

**Ted Greene — Chord Chemistry (1971):** The definitive reference for guitar voicing density and register. Greene catalogued thousands of voicings with emphasis on voice leading and register quality. His approach: treat chord progressions like string quartet writing, prioritize stepwise motion in inner voices. Chord Chemistry covers Drop 2 and Drop 3 systematically but requires the book itself — not freely accessible online in full [15, 16].

**Ted Greene — Modern Chord Progressions (1976):** Jazz and classical voicings for guitar. Full text partially archived. Covers extended chord conventions with diagrams [16].

**Jody Fisher — Complete Jazz Guitar Method + Jazz Guitar Harmony:** Fisher's approach emphasizes rootless voicings (leave root to bass player), abbreviated voicings for extended chords, and dominant cycle voice leading. His Intermediate book (Internet Archive) covers ii-V-I voice leading in Drop 2 context [17, 18].

**Academic / computational:**
- FretboardFlow (ISMIR 2025): Dual-model (Bi-LSTM + DeepGRU) trained on hexaphonic recordings of expert guitarists. Uses chord symbol + voicing history to predict optimal fingerings. Confirms that expert guitarists' voicing choices encode implicit register and voice-leading preferences [12].
- Keating, M. (Dartmouth CS, thesis): Graph search + LSTM for jazz guitar tablature voice leading. Evaluates with mean reciprocal rank. Confirms that optimal voice leading reduces to a graph path problem over inversion space [11].
- Bayesian Network for Automatic Chord Voicing (ResearchGate): Probabilistic model for voicing selection with instrument constraints [19].

---

## JSON Preference Table

The fret ranges below are key-agnostic bounds: they represent the fret range where the **bass note** of each inversion should land to keep the voicing in a useful register. All values derived from music theory first principles + pedagogy sources [1, 2, 4, 5, 6].

```json
{
  "_notes": {
    "fret_ranges": "Bass note (lowest string of voicing) target fret range",
    "avoid_below": "Hard floor — bass note below this fret = muddy or too open",
    "avoid_above": "Soft ceiling — quality degrades, not impossible",
    "preferred_frets": "[min, max] inclusive, bass note"
  },

  "drop2": {
    "strings_6543": {
      "_note": "Least preferred string set. Use only when bass explicitly on string 6 and fret >= 5.",
      "root":  { "preferred_frets": [5, 9],  "avoid_below": 5,  "avoid_above": 12 },
      "1st":   { "preferred_frets": [4, 8],  "avoid_below": 4,  "avoid_above": 11 },
      "2nd":   { "preferred_frets": [5, 9],  "avoid_below": 5,  "avoid_above": 12 },
      "3rd":   { "preferred_frets": [4, 8],  "avoid_below": 4,  "avoid_above": 11 }
    },
    "strings_5432": {
      "_note": "Primary string set. Best register balance for jazz/pop comping.",
      "root":  { "preferred_frets": [3, 10], "avoid_below": 3,  "avoid_above": 14 },
      "1st":   { "preferred_frets": [4, 11], "avoid_below": 3,  "avoid_above": 14 },
      "2nd":   { "preferred_frets": [4, 10], "avoid_below": 3,  "avoid_above": 14 },
      "3rd":   { "preferred_frets": [4, 12], "avoid_below": 3,  "avoid_above": 15 }
    },
    "strings_4321": {
      "_note": "High register. Good for solo lines, thin for rhythm comping below fret 7.",
      "root":  { "preferred_frets": [5, 10], "avoid_below": 3,  "avoid_above": 12 },
      "1st":   { "preferred_frets": [4, 10], "avoid_below": 3,  "avoid_above": 12 },
      "2nd":   { "preferred_frets": [5, 10], "avoid_below": 3,  "avoid_above": 12 },
      "3rd":   { "preferred_frets": [4, 10], "avoid_below": 3,  "avoid_above": 12 }
    }
  },

  "drop3": {
    "strings_6432": {
      "_note": "String skip (6-skip-4-3-2). Bass separated from harmony. Better than drop2/6543 in low register.",
      "root":  { "preferred_frets": [5, 10], "avoid_below": 4,  "avoid_above": 12 },
      "1st":   { "preferred_frets": [4, 9],  "avoid_below": 3,  "avoid_above": 12 },
      "2nd":   { "preferred_frets": [5, 10], "avoid_below": 4,  "avoid_above": 12 },
      "3rd":   { "preferred_frets": [4, 9],  "avoid_below": 3,  "avoid_above": 12 }
    },
    "strings_5321": {
      "_note": "String skip (5-skip-3-2-1). Usable mid-range, thin in high positions.",
      "root":  { "preferred_frets": [3, 10], "avoid_below": 3,  "avoid_above": 13 },
      "1st":   { "preferred_frets": [3, 9],  "avoid_below": 3,  "avoid_above": 13 },
      "2nd":   { "preferred_frets": [3, 10], "avoid_below": 3,  "avoid_above": 13 },
      "3rd":   { "preferred_frets": [3, 9],  "avoid_below": 3,  "avoid_above": 13 }
    }
  },

  "voice_leading": {
    "algorithm": "minimize_semitone_delta",
    "method": "For each new chord, score all valid inversions by sum(|prev_fret[voice] - cand_fret[voice]|) across 4 voices. Select minimum. Break ties by lower mean fret position.",
    "drop2_cycle_of_4ths_pattern": "Root -> 1st -> 2nd -> 3rd -> Root (wraps). Advance one inversion per step in the diatonic cycle. Two voices move by step, two hold as common tones per step.",
    "drop3_cycle_of_4ths_pattern": "No automatic pattern. Must score all candidates per step."
  },

  "extensions": {
    "maj9": {
      "tones_full": [1, 3, 5, 7, 9],
      "omit": [5],
      "keep": [1, 3, 7, 9],
      "rootless_keep": [3, 7, 9],
      "construction": "Drop 2 maj7 shape: raise root voice by 2 semitones to 9th",
      "string_set": "5432",
      "preferred_frets": [5, 10],
      "avoid_below": 3
    },
    "m9": {
      "tones_full": [1, "b3", 5, "b7", 9],
      "omit": [5],
      "keep": [1, "b3", "b7", 9],
      "rootless_keep": ["b3", "b7", 9],
      "construction": "Drop 2 m7 shape: raise root voice by 2 semitones to 9th",
      "string_set": "5432",
      "preferred_frets": [5, 10],
      "avoid_below": 3
    },
    "dom9": {
      "tones_full": [1, 3, 5, "b7", 9],
      "omit": [5],
      "keep": [1, 3, "b7", 9],
      "rootless_keep": [3, "b7", 9],
      "construction": "Drop 2 dom7 shape: raise root voice by 2 semitones to 9th",
      "string_set": "5432",
      "preferred_frets": [5, 10],
      "avoid_below": 3
    },
    "maj13": {
      "tones_full": [1, 3, 5, 7, 9, 11, 13],
      "omit": [5, 11],
      "note_omit_11": "11 clashes with maj3 — always omit unless #11 (Lydian context)",
      "keep": [1, 3, 7, 13],
      "rootless_keep": [3, 7, 9, 13],
      "string_set": "5432",
      "preferred_frets": [5, 10],
      "avoid_below": 3
    },
    "m11": {
      "tones_full": [1, "b3", 5, "b7", 9, 11],
      "omit": [5, 1],
      "note_omit": "Omit 5 and root — keep b3 to distinguish from sus4 chord",
      "keep": ["b3", "b7", 9, 11],
      "note_11_equals_4": "11 = 4. b3 must be present to distinguish m11 from sus4.",
      "string_set": "5432",
      "preferred_frets": [5, 10],
      "avoid_below": 3,
      "alt_string_set": "6432",
      "alt_note": "6432 string set useful when bass note needed for context"
    }
  },

  "quality_scoring_weights": {
    "voice_leading_delta": 0.40,
    "fret_position_preference": 0.30,
    "playability_span": 0.20,
    "register_penalty": 0.10,
    "notes": "Penalize voicings: bass below avoid_below (-50), span > 4 frets (-30 per excess fret), mean fret > 12 (-20)"
  }
}
```

---

## Watch Out For

1. **The string 6 muddiness cutoff is electric vs. acoustic.** On a clean electric with a bass player, string 6 Drop 2 at fret 5 is usable. On acoustic alone, push the floor to fret 7. Scales.sin should expose an `acoustic_mode` flag that raises the floor by 2 frets on string 6/5 and drops the ceiling by 2 on string 1/2.

2. **Maj13 natural 11 is almost always wrong.** Maj13 with a natural 11 against a major 3rd creates a tritone cluster that sounds wrong in all but avant-garde contexts. The algorithm must omit 11 from Maj13 by default. Only include if the user explicitly requests Lydian (#11) voicings.

3. **m11 vs. sus4 collision.** m11 voiced as b7-4-9 on strings 4-3-2 is indistinguishable from a sus2sus4 chord without the b3. The algorithm must include the b3 in m11 voicings — this may force a 5-string shape or a stretch.

4. **Drop 2 fret positions are key-dependent, not inversion-dependent.** The "preferred_frets" in the JSON above refer to where the bass note of that inversion type should land. The actual fret numbers for every voice are a function of the root + intervals. The algorithm should compute voice frets from (root_fret + interval_in_semitones + string_offset), not look up static tables.

5. **Voice leading across string set changes.** If chord N is on strings 5-4-3-2 and chord N+1 is on strings 6-5-4-3, the voice leading delta calculation breaks (different strings). Always try to keep the same string set for consecutive chords in a progression. Only switch string sets when the fret gate forces it.

6. **FretboardFlow (ISMIR 2025) is trained on one dominant player.** The dataset skews toward that player's voicing preferences. Don't treat it as ground truth for preferred fret ranges — use it only as confirmation that ML approaches are viable, not as a source of specific fret numbers [12].

7. **Octave equivalent inversions.** Drop 2 produces some voicings that are octave-equivalent to others (especially in high positions). The algorithm needs a dedup step — if two inversions produce the same pitch-class set in the same octave register, keep only one.

8. **Ted Greene Chord Chemistry is copyrighted and not freely available.** The full diagrams require the book. Do not assume online sources have complete coverage of his voicing catalog. The core Drop 2 / Drop 3 system is well-documented elsewhere, but Greene's extended voicing work (especially his color chord system) is only in the books [15, 16].

9. **Jody Fisher's rootless voicing emphasis.** Fisher strongly advocates rootless voicings in jazz context (bass player covers root). This is correct for jazz but wrong for solo guitar / no-bass contexts. Scales.sin needs a `with_bass_player` flag that enables rootless voicing options for extended chords.

10. **Stretch limit for extended chords.** Maj9 in 1st inversion on strings 5-4-3-2 can require a 5-fret span. At frets 1-5 this is unplayable for most hands. The playability scorer must reject voicings where span > 4 frets below fret 7, and span > 5 frets anywhere.

---

## Sources

[1] Drop 2 Chords - Chord Chart, Theory & Exercises — [jazzguitar.be](https://www.jazzguitar.be/blog/drop-2-chords/) (2024)

[2] Drop 2 Chords For Guitar - Theory Lesson With Diagrams — [jazz-guitar-licks.com](https://www.jazz-guitar-licks.com/blog/drop-2-chord-voicings-guitar-diagrams-jazz-lesson.html) (2023)

[3] Learn Drop 2 Voicings on Piano and Guitar — [learnjazzstandards.com](https://www.learnjazzstandards.com/blog/drop-2-voicings/) (2023)

[4] Drop 2 Chords Chart — [hubguitar.com](https://hubguitar.com/fretboard/drop2-chords) (2024)

[5] Drop 3 Chords & Inversions — [jazzguitar.be](https://www.jazzguitar.be/blog/drop-3-chords-and-inversions/) (2024)

[6] Drop 3 chord Voicings For Guitar — [jazz-guitar-licks.com](https://www.jazz-guitar-licks.com/blog/chords/drop-3-chords.html) (2023)

[7] Jazz Guitar Chords for Beginners: The Drop 2 Chords Challenge — [jazzguitarlessons.net](https://www.jazzguitarlessons.net/blog/jazz-guitar-chords-beginners-drop-2-chords-challenge) (2024)

[8] Drop 2 Voicings — [jenslarsen.nl, Jazz Chord Essentials Part 1](https://jenslarsen.nl/jazz-chord-essentials-drop-2-voicings-part-1/) (2023)

[9] Guitar sounds dull or thin on the higher frets — [acousticguitarforum.com](https://www.acousticguitarforum.com/forums/showthread.php?t=370802) (2021) ⚠️ May be stale

[10] Major 9th Chords - Guitar Diagrams and Drop 2 Voicings — [jazz-guitar-licks.com](https://www.jazz-guitar-licks.com/pages/chords/major-9th-guitar-chord-diagrams-drop-2-voicings.html) (2024)

[11] "An Algorithmic Approach to Jazz Guitar Voice-Leading Chord Fingerings" — Keating, M., Dartmouth CS Senior Thesis — [digitalcommons.dartmouth.edu](https://digitalcommons.dartmouth.edu/cs_senior_theses/9/) (year unspecified)

[12] FretboardFlow: A Dual-Model Approach to Optimize Chord Voicings on the Guitar Fretboard — ISMIR 2025 — [ismir2025program.ismir.net](https://ismir2025program.ismir.net/poster_266.html) (2025)

[13] Major Thirteenth Guitar Chords (maj13) — [jazz-guitar-licks.com](https://www.jazz-guitar-licks.com/pages/chords/extended-major-7th-chords-guitar-diagrams-voicings.html) (2023)

[14] Minor 11th Guitar chords — [jazz-guitar-licks.com](https://www.jazz-guitar-licks.com/pages/chords/minor-11-m11-guitar-chords-diagrams-and-voicings.html) (2023)

[15] Ted Greene — Chord Chemistry — Alfred Music, ISBN 0-89898-696-6 (1971). Available at Amazon and Alfred.

[16] Ted Greene — Modern Chord Progressions: Jazz and Classical Voicings for Guitar — Alfred Music. Partial archive: [archive.org](https://archive.org/details/TedGreeneModernChordProgressionsJazzAndClassicalVoicingsForGuitar)

[17] Jody Fisher — The Complete Jazz Guitar Method: Complete Edition — Alfred Music — [alfred.com](https://www.alfred.com/the-complete-jazz-guitar-method-complete-edition/p/00-34352/)

[18] Jody Fisher — Jazz Guitar Harmony — Alfred Music — [alfred.com](https://www.alfred.com/jazz-guitar-harmony/p/00-20440/)

[19] Computational Model for Automatic Chord Voicing based on Bayesian Network — [researchgate.net](https://www.researchgate.net/publication/228984137_Computational_Model_for_Automatic_Chord_Voicing_based_on_Bayesian_Network) (date varies)

[20] Voice Leading for Guitar — Berklee Online — [berklee.edu](https://online.berklee.edu/takenote/voice-leading-for-guitar/) (2023)

[21] Dan Cosley — Drop Voicing Book for Guitar — [amazon.com](https://www.amazon.com/DROP-VOICING-BOOK-GUITAR-Inversions/dp/1076128734) (2019)

---

## Hand to Claude

Paste this into your Mac session before starting the Scales.sin voicing algorithm:

---

"Before we start on the Scales.sin guitar voicing engine, Javelin researched Drop 2 / Drop 3 quality criteria, fret position preferences, voice leading, and extended chord conventions. Here is what to implement:

**Core architecture decisions:**
1. Primary string set is Drop 2 on 5-4-3-2. String set 6-5-4-3 is secondary and has a hard bass-note floor at fret 5 (muddiness below that). String set 4-3-2-1 has a ceiling around fret 12.
2. Voice leading algorithm: enumerate all valid inversions for each chord that pass fret gates, score by total semitone delta across all 4 voice strings from the previous chord, pick the minimum. This is equivalent to a graph search over inversion space (see Keating/Dartmouth thesis [11]).
3. For Drop 2 in a diatonic cycle of 4ths, the optimal pattern is root -> 1st -> 2nd -> 3rd -> root (cycle), advancing one inversion per chord step. Two voices move by step, two hold as common tones.
4. Extended chords: omit 5th first, then root. Keep 3 and 7 always. Maj13: omit 5 AND natural 11 (clash with maj3). m11: keep b3 explicitly to distinguish from sus4.

**The JSON preference table is in the research brief at:**
`~/Javelin/reports/research/RESEARCH_Scales.sin_2026-03-08-voicing-quality.md`

Watch out for: Maj13 natural 11 (always omit), m11 vs. sus4 collision (keep b3), string set switching breaking voice leading (stay on same set per progression segment), and the acoustic vs. electric muddiness floor difference (expose an acoustic_mode flag that raises the low floor by 2 frets)."
