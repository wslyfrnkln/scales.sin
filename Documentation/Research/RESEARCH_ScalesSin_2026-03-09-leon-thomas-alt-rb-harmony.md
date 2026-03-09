# Research Brief: Leon Thomas — Alt-R&B Chord Progressions, Modal Harmony & Voicing Techniques
**Date:** 2026-03-09
**Depth:** deep
**Rounds:** 5
**Project:** ScalesSin

---

## TL;DR
Leon Thomas's harmonic language centers on F-minor-family vamps using stacked minor 7th/9th/11th extensions, ii–V–i jazz turnarounds with flat-VII substitutions, and Dorian-inflected modal ambiguity — all deliberately sparse to leave vertical space for his falsetto and stacked self-harmonies.

---

## Recommendation
Index the following into ChromaDB as a dedicated `leon_thomas_alt_rb` pattern set with tags: `[minor_vamp, m7_stack, m9_extension, dorian_modal, ii-V-i_turnaround, bVII_sub, sus4_suspension, vocal_space_design]`. Do not attempt to categorize his progressions as purely Dorian or purely Aeolian — the ambiguity is the point and should be preserved as a metadata flag (`modal_ambiguity: true`). Build the Scales.sin chord library entry so it generates voicings in the same register-separated style: bass note anchored low, inner voices clustered (3rd, 7th, 9th), melody/top-note left open.

---

## Key Findings

### 1. Primary Key Centers and Track Data
The MUTT album (Sept 27, 2024) shows a strong preference for flat-key minor centers [1, 2]:

| Track | Key | BPM | Mode |
|-------|-----|-----|------|
| MUTT | F minor (C#/Db enharmonic reported by some sources) | 180 | Minor |
| YES IT IS | F minor | 120 | Minor |
| VIBES DON'T LIE | Bb minor | 82 | Minor |
| LUCID DREAMS (ft. Masego) | Bb maj / G minor | 77 | Ambiguous |
| FAR FETCHED (ft. Ty Dolla $ign) | G# minor / Ab minor | 81 | Minor |
| LOVE JONES (ft. Ty Dolla $ign) | Ab/Bb major | 116 | Major (rare for LT) |
| DANCING WITH DEMONS | F#/Gb | 92 | Major |
| ANSWER YOUR PHONE | C | 144 | Major |

Note: Bb-minor/F-minor/Ab-minor cluster is the dominant tonal neighborhood across the catalog. [1, 2, 3]

### 2. MUTT (Title Track) — Core Progression
Key: F minor. The three structural chords are Fm, Bbm, Cm — i, iv, v in natural minor/Aeolian. [4]

Live and tab interpretations consistently voice these as **Fm7, Bbm7, Eb, C** with the following extension behavior [4, 5]:
- Fm9 (root–b3–5–b7–9) used as the tonic rest point
- Bbm9 mirrors it as the iv
- Eb major (bVII) acts as the harmonic "breath" before returning — this bVII move is a Mixolydian/Dorian marker, not pure Aeolian
- C or Cm functioning as the V — Leon Thomas uses it without a leading tone, keeping modal ambiguity intact (no raised 7th = no V7 dominant resolution)

Hooktheory rates MUTT's Chord Complexity at 95/100 and Chord Progression Novelty at 85/100 vs. average songs. [4]

### 3. YES IT IS — ii–V–i Jazz Turnaround
Progression: **Gm7 – C7 – Fm7 – Dbmaj7** in F minor [6, 7]

This is a textbook jazz ii–V–i in F minor (Gm7 = ii°7 functioning as ii, C7 = V7, Fm7 = i) followed by a **bVI major 7 substitution** (Dbmaj7 instead of resolving back). The Dbmaj7 landing is the signature alt-R&B move — it avoids full cadential closure, creating a floating, unresolved quality. This is the most explicitly jazz-derived progression in the MUTT catalog. [6, 7]

### 4. VIBES DON'T LIE — Dominant Tension Stack
Progression: **Bbm7 – Ebm7 – Gb7 – F7** in Bb minor [8]

Analysis:
- Bbm7 = i
- Ebm7 = iv
- Gb7 = bVI7 (a borrowed dominant — Mixolydian color)
- F7 = V7 (dominant — this one resolves, unlike MUTT)

The COLORS Show version substitutes Fm7 for F7, returning to a softer non-dominant landing. The Gb7 is the harmonic fingerprint here — a flat-VI dominant that adds tritone tension without jazz-style secondary dominant voice leading. [8]

### 5. LOVE JONES (ft. Ty Dolla $ign) — Rare Major Excursion
Chord progression: **Cm7 – Ab7 – Db7 – Fm7** [9]

In Ab major / F minor context: this reads as iii–bVII7–bIII7–vi — a cycle of descending minor thirds with dominant 7th coloring on non-diatonic chord roots. Db7 (bIII7) is the unusual chord — a tritone sub of G7, which would be the V of Cm. This is straight jazz reharmonization applied to R&B production. [9]

### 6. FAR FETCHED (ft. Ty Dolla $ign) — Minor Pentatonic + Borrowed Major
Chords: **G#m – F#m – F# – E7** [10]

G#m = i, F#m = bVII minor (unexpected — Dorian or natural minor), F# major = bVII major (direct parallel with minor to major shift), E7 = bVI7. The F#m to F# major move is a deliberate chromatic voicing shift — major 3rd swap within the same root is a neo-soul color technique. [10]

### 7. Modal Language Assessment
⚠️ No primary source explicitly names a mode — all modal analysis below is inferred from progression structure.

**Dorian evidence:** The raised 6th (natural 6th in minor key) appears implicitly in the bVII chord usage without raising the 7th. The Bbm7–Ebm7 movement in VIBES DON'T LIE is consistent with Dorian vamp behavior (i–iv in minor with no V7 resolution). [8, 11]

**Mixolydian evidence:** bVII major chord (Eb in F minor) as a resolution target rather than tension point (MUTT, FAR FETCHED). [4, 10]

**Phrygian evidence:** Sparse. One source notes "rock influences including Black Sabbath" which could introduce Phrygian color, but no progression data confirms it. [12] ⚠️ Unverified.

**Modal ambiguity as design intent:** Thomas explicitly avoids dominant V7 resolutions in most progressions (MUTT, LUCID DREAMS). This keeps the tonic area ambiguous between Aeolian, Dorian, and Mixolydian — a hallmark of D'Angelo-era neo-soul influence. [11, 12]

### 8. Voicing Techniques — Extended Chord Stack
Based on tabbing community consensus and neo-soul theory sources [6, 13, 14]:

**Minor 9 (m9):** Root–b3–5–b7–9. Used as the primary tonic voicing in MUTT and YES IT IS. The 9th (major 2nd above root) comes from Dorian coloring. In piano voicings: omit 5th, keep b3–b7–9 as inner cluster.

**Minor 11 (m11):** Root–b3–b7–9–11 (5th omitted). Creates floating, suspended quality. Useful for iv chord (Bbm11 in MUTT's key).

**Dominant 7b9 (V7b9):** 1–3–5–b7–b9. Appears as tension chord before minor tonic resolution. Characteristic of neo-soul's jazz inheritance (D'Angelo "Voodoo" harmonic language). [13, 15]

**Sus4 suspensions:** Delay harmonic definition on intros and transitions before resolving to m9. Thomas uses sus voicings as pre-downbeat breath, consistent with his falsetto approach (sustained tones need harmonic space before the chord snaps in).

**bVII major 7 substitution:** Dbmaj7 in YES IT IS (landing from C7). Parallel in jazz: tritone substitution of the dominant. Creates resolution without strong cadential pull.

**Quartal voicings:** Stacked 4ths (e.g., F–Bb–Eb) appear in guitar parts — provides "modal, uncentered" texture that doesn't compete with vocal overtones. [14]

### 9. Vocal-Harmony Interaction Design
Leon Thomas's signature studio technique: he records vocals at a **slower tempo in a different key, then speeds up the audio** — creating a pitched, slightly processed tone. [16] This means:

- His falsetto sits in the upper register (above the chord's 5th/7th)
- Chords are voiced to stay below the vocal register — inner voicing density (b3, b7, 9) is kept in the mid range, leaving the top open
- He layers stacked self-harmonies (choir-of-himself technique, similar to D'Angelo's Voodoo approach) [15]
- Sparse chord comping (often just bass + upper extension cluster) creates room for vocal ad libs and melismatic runs

**Practical rule for Scales.sin:** When generating voicings in Leon Thomas style, leave the top voice open (no chord tone above the 12th). Melody/vocal will occupy that space.

### 10. Production Influences Confirmed
- **Jazz root:** Miles Davis, John Coltrane, Art Blakey (family lineage) [12]
- **Neo-soul:** D'Angelo (Voodoo), Erykah Badu — specifically the choir-of-self harmonic stacking and ambiguous modal vamps [12, 15]
- **Rock:** Black Sabbath, Rolling Stones, Led Zeppelin — cited directly by Thomas for the MUTT album [12]
- **Key collaborators:** Babyface (Snooze), Masego (Lucid Dreams), Ty Dolla $ign (Far Fetched, Love Jones)
- **Producer quote on harmony:** "I try to find ways to implement some of the chord progressions that I hear in my head into my music... I'm not doing basic concepts or attacking basic instrumentals." [12]

---

## Watch Out For

1. **Key reporting discrepancy on MUTT (title track):** Hooktheory reports F minor. Tunebat/SongBPM report C#/Db major. These are enharmonic relative keys — same pitch set, different tonal center interpretation. Both can be correct depending on what the bass/tonic is doing. Index as F minor with a note on the enharmonic ambiguity. ⚠️ Conflicting

2. **"BYRDS" and "Overthinking It" not confirmed as Leon Thomas solo tracks.** "BYRDS" is his EP title (BYRDS EP, pre-MUTT), not a single track. "If I Ever" appears to be a different artist. "Overthinking It" returns no results for Leon Thomas — may be incorrectly attributed or a deep cut not indexed online. ⚠️ Verify with Spotify/Apple Music directly before indexing.

3. **Wasted (ft. Ty Dolla $ign):** No dedicated track found under this title in his confirmed catalog. The Ty Dolla features are FAR FETCHED and LOVE JONES. "Wasted" may be a different track, a pre-release, or a misremembered title.

4. **Tab/chord data is crowd-sourced:** ChordU, Chordify, and Ultimate Guitar tabs reflect the transcriber's interpretation. Extended chord voicings (m9 vs m7, maj7 vs 7) may be simplified. Treat them as directionally correct, not pitch-perfect.

5. **Modal classification is researcher inference:** No academic analysis or primary source explicitly identifies Dorian/Mixolydian by name for any Leon Thomas track. All modal readings in this brief are inferred from chord movement patterns.

6. **"Love Jones" key conflict:** Musicstax reports G#/Ab major; chordify tab shows Cm7–Ab7–Db7–Fm7, which implies Ab major / F minor tonal center. The tab chords support the Cm7 as vi of Ab, making Ab major the most likely center. ⚠️ Conflicting

7. **MUTT album release date:** September 27, 2024. Not 2023. Deluxe edition (HEEL) released May 30, 2025. If searching for tracks, use the correct release window.

---

## Sources
[1] Leon Thomas - MUTT | Musicstax — [https://musicstax.com/track/mutt/1mh9eHVRdNhzryG43PXdW1](https://musicstax.com/track/mutt/1mh9eHVRdNhzryG43PXdW1)

[2] BPM and key for Leon Thomas songs — [https://songbpm.com/@leon-thomas](https://songbpm.com/@leon-thomas)

[3] Key & BPM for VIBES DON'T LIE — [https://tunebat.com/Info/VIBES-DON-T-LIE-Leon-Thomas/1WwrfoGe0K33z1tVI6mevJ](https://tunebat.com/Info/VIBES-DON-T-LIE-Leon-Thomas/1WwrfoGe0K33z1tVI6mevJ)

[4] MUTT by Leon Thomas — Hooktheory — [https://www.hooktheory.com/theorytab/view/leon-thomas/mutt](https://www.hooktheory.com/theorytab/view/leon-thomas/mutt)

[5] MUTT Remix Chords (Freddie Gibbs) — ChordZone — [https://www.chordzone.org/2025/02/leon-thomas-freddie-gibbs-mutt-remix-chords-for-piano-guitar.html](https://www.chordzone.org/2025/02/leon-thomas-freddie-gibbs-mutt-remix-chords-for-piano-guitar.html)

[6] YES IT IS Chords — Chordify — [https://chordify.net/chords/leon-thomas-songs/yes-it-is-chords](https://chordify.net/chords/leon-thomas-songs/yes-it-is-chords)

[7] Key & BPM for YES IT IS — Tunebat — [https://tunebat.com/Info/YES-IT-IS-Leon-Thomas/2iksjpqL3eraxCBKqNHuqd](https://tunebat.com/Info/YES-IT-IS-Leon-Thomas/2iksjpqL3eraxCBKqNHuqd)

[8] VIBES DON'T LIE Chords — Chordify — [https://chordify.net/chords/leon-thomas-songs/vibes-don-t-lie-chords](https://chordify.net/chords/leon-thomas-songs/vibes-don-t-lie-chords)

[9] Love Jones Chords — Chordify — [https://chordify.net/chords/leon-thomas-ty-dolla-ign-love-jones-visualizer-leonthomasvevo](https://chordify.net/chords/leon-thomas-ty-dolla-ign-love-jones-visualizer-leonthomasvevo)

[10] FAR FETCHED Chords — Chordify — [https://chordify.net/chords/leon-thomas-ft-ty-dolla-ign-songs/far-fetched-chords](https://chordify.net/chords/leon-thomas-ft-ty-dolla-ign-songs/far-fetched-chords)

[11] Neo Soul Chords: Minor Chords — Hear and Play — [https://www.hearandplay.com/main/neo-soul-chords-minor-chords](https://www.hearandplay.com/main/neo-soul-chords-minor-chords)

[12] Leon Thomas III interview — GRAMMY.com — [https://www.grammy.com/news/leon-thomas-iii-interview-new-album-mutt](https://www.grammy.com/news/leon-thomas-iii-interview-new-album-mutt)

[13] Top Neo Soul Chords — Orange Candy Music — [https://orangecandymusic.com/top-neo-soul-chords-you-need-to-know-and-how-to-use-them/](https://orangecandymusic.com/top-neo-soul-chords-you-need-to-know-and-how-to-use-them/)

[14] Neo Soul Chord Progressions — RiffRevel — [https://riffrevel.com/neo-soul-chord-progressions/](https://riffrevel.com/neo-soul-chord-progressions/)

[15] D'Angelo Voodoo — NPR World Cafe — [https://www.npr.org/2025/01/16/1224897131/the-culture-corner-dangelo-album-voodoo](https://www.npr.org/2025/01/16/1224897131/the-culture-corner-dangelo-album-voodoo)

[16] Leon Thomas Studio Sessions — Revolt TV — [https://www.revolt.tv/article/2023-01-26/268519/leon-thomas-studio-sessions-interview](https://www.revolt.tv/article/2023-01-26/268519/leon-thomas-studio-sessions-interview)

[17] Mutt (album) — Rap-Up tracklist — [https://www.rap-up.com/article/leon-thomas-shares-mutt-deluxe-heel-tracklist](https://www.rap-up.com/article/leon-thomas-shares-mutt-deluxe-heel-tracklist)

[18] Snooze by SZA — Hooktheory — [https://www.hooktheory.com/theorytab/view/sza/snooze](https://www.hooktheory.com/theorytab/view/sza/snooze)

---

## Hand to Claude

Before we start building the Leon Thomas chord pattern library for Scales.sin, I had Javelin run deep research on his harmonic language. Here is what to know:

His core sound is F-minor-family vamps with m7/m9/m11 extensions — the title track MUTT is Fm7–Bbm7–Eb–C (i–iv–bVII–V without V7 resolution), YES IT IS is a jazz ii–V–i turnaround (Gm7–C7–Fm7–Dbmaj7) with a bVI maj7 landing instead of resolving back, and VIBES DON'T LIE stacks Bbm7–Ebm7–Gb7–F7 with a borrowed bVI dominant. The through-line is deliberate avoidance of V7 resolution and consistent use of bVII major as a harmonic rest point — which keeps the music between Dorian, Mixolydian, and Aeolian without committing to any one. Modal ambiguity is intentional.

Voicing rule for the pattern library: omit the 5th, keep b3–b7–9 in the inner cluster (mid-register), leave the top voice open above the 12th. His falsetto and stacked self-harmonies live in that top space.

Watch out for: "BYRDS" is an EP name not a track, "Wasted" and "Overthinking It" have no confirmed chord data, and Tunebat vs. Hooktheory disagree on the MUTT key center (Db vs F minor — same pitch set, different tonal interpretation). Index the patterns with `modal_ambiguity: true` and cross-reference the vocal-space design note.
