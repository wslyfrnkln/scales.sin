# Research Brief: D'Angelo Voodoo — Chord Progressions, Harmonic Language, Voicing Techniques
**Date:** 2026-03-09
**Depth:** deep
**Rounds:** 5
**Project:** ScalesSin

---

## TL;DR
D'Angelo's Voodoo operates in a narrow modal-funk harmonic language built on looping 3–4 chord vamps using Mixolydian and Dorian tonality, with extended voicings (9th, 11th, 13th) heavily implied by bass and melody rather than stated in full, and tritone substitutions and rhythmic displacement doing the heavy lifting where harmonic complexity is needed.

---

## Recommendation
Index Voodoo's harmonic language into ChromaDB as a **modal-loop** pattern type, separate from jazz (which resolves to dominants) and separate from gospel (which resolves to I). The defining constraint: these chords don't resolve in the Western functional sense — they loop and breathe. When building the chord progression feature in Scales.sin, tag this category as "neo-soul / modal funk loop" with sub-tags: Mixolydian, Dorian, tritone-sub, extended-implied. The key voicing insight is that D'Angelo rarely voices the extensions fully on keyboard — the 9th and 11th live in the vocal melody and bass movement, not the chord block. Build that into the voicing description schema.

---

## Key Findings

### 1. Track-Level Chord Progressions

**"Untitled (How Does It Feel)"** — Key: D Mixolydian [1, 2]
- Intro / Main vamp: `Dadd9 – A7sus4 – G6 – C9`
- In Roman numerals (D Mixolydian): `I(add9) – V7sus4 – IV6 – bVII9`
- Pre-chorus shift: `F#m7 – B7 – Em9 – Asus`
- Extended voicings throughout: `Am9` (root + m7 + 9), `Gmaj9` (root + maj7 + 9), `C9→C13` (9th extended to 13th on repeat)
- The C9 (bVII9) is the modal indicator — that flat-7 chord above D signals Mixolydian [2, 3]
- Performance note: freestyle approach, exact voicings vary per take. Not a fixed progression — it's a harmonic framework [2]

**"Brown Sugar"** (Brown Sugar album, foundational to Voodoo's language) — Key: loops around G Mixolydian [4]
- Instrumental loop: `Em7 – A7 – Bm7 – F7`
- The F7 is a tritone substitution for B7 (shares same tritone: D#/Eb and A) [4]
- D'Angelo's vocal recasts the guitar part from C major (iii–V–I–IV) into G Mixolydian (vi–I–IV–bVII) [4]
- Vocal strategy: hammer the flat-7 (A over G) before resolving to the root — creates constant Mixolydian tension [4]

**"Left & Right"** (feat. Method Man & Redman) — Key: C minor / F major [5]
- Chords: `Cm7 – Fm7 – Ab – G7` (advanced voicing) / simplified: `Cm – Fm – Ab – G`
- Sheet music arranged in F Major, song functions in C minor — a I–iv in Cm context [5]
- The Ab (bVI in C minor) is a borrowed chord from parallel major, classic neo-soul move [5]

**"Send It On"** — Key: F Major, 6/8 swing feel, 127 BPM [6, 7]
- Core loop: `Am7 – Gm7 – C7sus – Fmaj7`
- Roman numerals: `iii7 – ii7 – V7sus – Imaj7`
- Simplified version widely transcribed as: `Dm – Bb – C – Am – Bb – F – C`
- Described as borrowing groove from Kool & The Gang's "Sea of Tranquility" [6]
- Horn-laden arrangement — Roy Hargrove's trumpet charts fill harmonic space above the sparse keyboard

**"Devil's Pie"** — Key: disputed, likely Bb minor / F# area [8, 9]
- Produced by DJ Premier — most hip-hop-adjacent track on the album
- Chords variably transcribed: `Bm – B – G – Bm` / `G – Abm – E – B` (key confusion due to samples)
- Built around P-Funk harmonics and samples (Teddy Pendergrass, Wu-Tang, Pierre Henry) [8]
- One-chord-dominant vamp with chromatic inflections — the harmonic language is largely implied by the bass and samples
- ⚠ Conflicting: multiple sources report different keys (F# major vs. Bb minor vs. G) — likely tuning ambiguity from tape and samples

**"Chicken Grease"** — Key: A Major, 92 BPM [10]
- Title references a Prince concept: 9th minor chord played with 16th-note stabs [8, 10]
- Chords variably transcribed: `A – F# – F#7 – B` / `F#m – Bm – Em – B`
- Core groove is a one-chord James Brown-style vamp on A9 with chromatic neighbor motion [10]
- "Chicken Grease" as a technique = dominant 9th chord comped in 16th-note stabs — the harmony is the rhythm

**"Spanish Joint"** — Afro-Cuban salsa fusion, key not confirmed in sources [11, 12]
- Charlie Hunter plays guitar and bass simultaneously on a custom 8-string Novax (3 bass strings + 5 guitar strings)
- Co-written by Roy Hargrove — trumpet charts carry harmonic density
- Fender Rhodes (D'Angelo) vs. Hunter's guitar/bass creates layered harmonic texture
- Described as blending "expansive harmonics of jazz and funk" with Brazilian/Cuban percussion [11]
- ⚠ May be stale / sparse: no specific chord chart confirmed in any source reviewed

**"The Line"** — Key: not confirmed in sources [13]
- Described as a pedal-tone dominant groove with a "nearly unnoticeable high-pitched drone" in background [13]
- Hookless; functions more as a modal meditative vamp than a chord-change song
- Strong Dorian character based on descriptive references to "preacher/prophet" falsetto over an unmoving groove

---

### 2. Voicing Techniques

**Extended chord architecture:**
- Neo-soul chord foundation: `min9`, `min11`, `maj7`, `maj9`, `13sus4`, `dominant 7(b9)` [14, 15]
- D'Angelo's key technique: extensions are *implied* by walking bass and vocal melody, not fully stated in keyboard block voicings [1, 16]
- Pino Palladino's bass explicitly plays chord tones that are "wrong notes for the harmonies D'Angelo is actually singing" — the harmonic tension lives in that gap [16]

**Shell voicings (root + 3rd + 7th):**
- Keyboard parts often omit the 5th entirely; the 3rd and 7th define chord quality
- Adds ambiguity that allows modal drift [14]

**Cluster voicings:**
- 9th, 3rd, and 11th voiced in close position (tight cluster, within a 4th or 5th span) [14]
- Creates that characteristic "lush but opaque" neo-soul texture

**Quartal / fourth voicings:**
- Used in intros and breakdowns for modern jazz flair [14]
- Particularly common in James Poyser (keys, The Roots) approach on the record

**Upper structure triads:**
- Vocal harmonies voiced as triads over chord roots — D'Angelo stacked up to 16–24 vocal tracks on "The Root" [17]
- Vocal clusters function as chord extensions (9ths, 11ths, 13ths) above keyboard shell voicings

**Sus chords as harmonic resting points:**
- `A7sus4` (in "Untitled") holds tension without resolving — dominant function avoided [2]
- `C7sus` in "Send It On" — same principle: sus replaces the tritone in a dominant chord, creating open space [6]

---

### 3. Modal / Harmonic Language

**Mixolydian (primary mode):**
- "Untitled (How Does It Feel)": D Mixolydian [1, 2, 3]
- "Brown Sugar" vocal recast: G Mixolydian [4]
- Characteristic move: bVII chord (major chord a whole step below tonic) as resolution target — e.g., C major over D tonic
- Creates "neither fully major nor minor" ambiguity D'Angelo lives in

**Dorian (secondary mode):**
- Implied in minor-key tracks like "Left & Right" — minor key with raised 6th gives the characteristic "not quite sad" Dorian color
- Dorian's major IV chord (Ab over Cm = bVI, borrowed) appears frequently [5]

**Modal interchange / borrowed chords:**
- bVII, bIII, bVI regularly borrowed from parallel modes [4, 5]
- Not functional resolutions — used for color and drift, not tension-release

**Lack of functional dominant resolution:**
- Neo-soul's defining harmonic contrast with jazz: favors minor and major chord movements without resolving to V7→I [15]
- 3–4 chord loops that rotate without a "home" dominant [15]

---

### 4. Specific Techniques

**Tritone substitution:**
- "Brown Sugar": F7 substitutes for B7 (tritone sub of V in E minor) [4]
- Same tritone (D#/Eb + A) shared between B7 and F7 — resolves identically to Em but with added dissonance from the flat second [4]
- This is the most documented harmonic trick in D'Angelo's vocabulary

**Chromatic voice leading:**
- Half-step approach to chord tones from below or above
- Most visible in bass parts (Palladino) and inner keyboard voices
- Example: diminished 7th passing chords between diatonic chords [18]

**Pedal tones:**
- "The Line" uses a sustained drone under shifting harmonic content [13]
- Creates trippy stasis — harmonic movement perceived against a fixed bass

**Rhythmic harmonic displacement (Dilla Feel):**
- J Dilla's influence: drum placement "behind the beat" means chords *feel* like they arrive late even when timed correctly [19]
- The harmonic rhythm perception is warped by rhythmic placement — same chord can feel unresolved or resolved depending on drum pocket
- Pino Palladino: deliberately sits behind the beat while Questlove pushes slightly ahead — the tension between them is the groove [16, 20]

**One-chord vamps (James Brown / Sly Stone influence):**
- "Chicken Grease", "Devil's Pie" sections: extended single-chord vamps where harmonic interest = rhythmic variation + blue notes [8, 10]
- Borrowed from James Brown's approach: the beat IS the harmony [21]

---

### 5. Influence Mapping

**Marvin Gaye:**
- *I Want You* (1976) as north star — groove carrying emotional narrative without harmonic complexity [22]
- Multi-tracking vocals for harmonic density (16–24 tracks on some Voodoo songs) [17]
- *Let's Get It On* (1973) production approach: live, intimate, analog warmth [21]

**Prince:**
- "Untitled" explicitly written as a Prince tribute — closest to his *Controversy*-era balladry [3]
- "Chicken Grease" title is a Prince term — 9th chord stab in 16th notes [8, 10]
- Falsetto over Mixolydian harmony is pure Prince DNA [3]

**Sly Stone:**
- Single-chord vamp philosophy: "Everyday People" model — groove carries, harmony stays still [21]
- Multi-tracked vocal density mirrors *There's a Riot Goin' On* (1971) production [21]

**James Brown:**
- One-chord vamp as compositional philosophy
- The groove subdivides the bar; harmony is static [21]
- Pino Palladino's bass evokes "both Fred Astaire and James Brown" in feel [20]

**J Dilla:**
- Non-quantized, "limping" drum feel that makes chords sound displaced from the grid [19]
- Directly influenced Questlove's approach on Voodoo; Dilla encouraged "false starts and the nonquantized sound" [19]

---

### 6. Live Band Harmonic Density

The band's division of harmonic labor is critical for understanding why Voodoo voicings work:

| Musician | Role in Harmony |
|---|---|
| D'Angelo (Fender Rhodes) | Shell voicings + pedal tones; leaves space for extensions |
| Pino Palladino (bass) | Implies extensions through chord-tone movement; sometimes "wrong notes" create added tension [16] |
| James Poyser (keys) | Fills in upper register extensions (9ths, 11ths) |
| Charlie Hunter (guitar/bass, 8-string) | On "Spanish Joint" / "The Root": plays bass AND melodic guitar simultaneously — harmonic richness from one player [11, 12] |
| Roy Hargrove (trumpet) | Jazz-flavored upper-structure lines; trumpet charts add harmonic color above the keyboard voicings [11] |
| D'Angelo (vocals, 16–24 tracks) | Vocal clusters ARE the extended chord voicings — the harmony is in the voice stacks [17] |

---

## Watch Out For

1. **"Extended chords are fully stated" misconception.** The most common mistake when building neo-soul chord data: transcribers write `Cm11` but the actual keyboard part is just `Cm7` — the 11th (F) is in Palladino's bass or D'Angelo's vocal. The *chord symbol* overstates what any single instrument plays. Flag this in your ChromaDB schema: include both the "full symbol" and "keyboard voicing" as separate fields.

2. **Key ambiguity from sampling / tape.** "Devil's Pie" has multiple conflicting keys in transcription sources because DJ Premier's samples may have been time-stretched or pitch-shifted. ⚠ Conflicting — treat Devil's Pie key data as approximate.

3. **Modal function vs. functional harmony.** Don't analyze these progressions with II-V-I logic. The bVII chord in Mixolydian is NOT a tritone sub or a backdoor dominant — it's a modal color. Calling it "a tritone sub of I" is wrong; it's just the Mixolydian bVII. Keep the tritone sub label for the specific Brown Sugar F7 case.

4. **Freestyle performances vary.** "Untitled (How Does It Feel)" is explicitly described as a freestyle — D'Angelo does not play a fixed voicing. Multiple transcriptions will conflict because they transcribed different performances. ⚠ Conflicting across chord chart sites.

5. **Pino's "wrong notes."** The TalkBass source says Palladino consciously plays notes that don't match D'Angelo's harmony — this creates polytonal tension. Do NOT clean this up when indexing the harmonic language. The dissonance is intentional and load-bearing.

6. **Depth of influence sources is thin.** Academic-quality chord-by-chord analysis of Voodoo tracks barely exists in the public record — most sources are chord chart approximations (ChordU, Chordify) or cultural journalism. Treat track-level chord symbols as solid leads, not verified transcriptions. Cross-reference with the official Piano/Vocal/Chords book (Alfred Music, ISBN 9780757902123) for confirmation if needed.

7. **"The Line" and "Greatdayndamornin'" have almost no available harmonic analysis** — ⚠ May be stale / sparse. These may need manual transcription or eartraining.

---

## Sources
[1] Hooktheory — Untitled How Does It Feel Analysis — [https://www.hooktheory.com/theorytab/view/dangelo/untitled-how-does-it-feel](https://www.hooktheory.com/theorytab/view/dangelo/untitled-how-does-it-feel)

[2] Piano Couture — Untitled (How Does It Feel) — [https://piano-couture.com/untitled-how-does-it-feel/](https://piano-couture.com/untitled-how-does-it-feel/)

[3] Untitled (How Does It Feel) Wikipedia — [https://en.wikipedia.org/wiki/Untitled_(How_Does_It_Feel)](https://en.wikipedia.org/wiki/Untitled_(How_Does_It_Feel))

[4] Dr. Ethan Hein / MusicRadar — D'Angelo Brown Sugar tritone sub + Mixolydian recast — [https://www.musicradar.com/artists/in-the-hands-of-lesser-musicians-this-would-simply-sound-sloppy-in-dangelos-hands-its-perfectly-imperfect-the-precise-right-amount-of-wrong-a-music-professor-breaks-down-the-genius-of-dangelo](https://www.musicradar.com/artists/in-the-hands-of-lesser-musicians-this-would-simply-sound-sloppy-in-dangelos-hands-its-perfectly-imperfect-the-precise-right-amount-of-wrong-a-music-professor-breaks-down-the-genius-of-dangelo)

[5] ChordU — Left & Right Chords — [https://chordu.com/chords-tabs-left-right-d-angelo-feat-method-man-redman-id_BuBntZudYfs](https://chordu.com/chords-tabs-left-right-d-angelo-feat-method-man-redman-id_BuBntZudYfs)

[6] ChordU — Send It On — [https://chordu.com/chords-tabs-d-angelo-send-it-on-id_3cL4leeORpY](https://chordu.com/chords-tabs-d-angelo-send-it-on-id_3cL4leeORpY)

[7] Hooktheory — Send It On — [https://www.hooktheory.com/theorytab/view/dangelo/send-it-on](https://www.hooktheory.com/theorytab/view/dangelo/send-it-on)

[8] Devil's Pie Wikipedia — [https://en.wikipedia.org/wiki/Devil%27s_Pie](https://en.wikipedia.org/wiki/Devil%27s_Pie)

[9] ChordU — Devil's Pie — [https://chordu.com/chords-tabs-d-angelo-devil-s-pie-id_iduOMAYB1cw](https://chordu.com/chords-tabs-d-angelo-devil-s-pie-id_iduOMAYB1cw)

[10] Andres Music Talk — Chicken Grease groove anatomy — [https://andresmusictalk.wordpress.com/2014/10/03/anatomy-of-the-groove-100314-riques-pick-chicken-grease-by-dangelo/](https://andresmusictalk.wordpress.com/2014/10/03/anatomy-of-the-groove-100314-riques-pick-chicken-grease-by-dangelo/)

[11] Andres Music Talk — Spanish Joint groove anatomy — [https://andresmusictalk.wordpress.com/2016/02/11/anatomy-of-the-groove-spanish-joint-by-dangelo/](https://andresmusictalk.wordpress.com/2016/02/11/anatomy-of-the-groove-spanish-joint-by-dangelo/)

[12] MusicRadar — Charlie Hunter on D'Angelo Voodoo — [https://www.musicradar.com/news/charlie-hunter-dangelo-voodoo-john-mayer](https://www.musicradar.com/news/charlie-hunter-dangelo-voodoo-john-mayer)

[13] Music Times — 13 Songs of Voodoo Ranked — [https://www.musictimes.com/articles/25841/20150125/13-songs-dangelo-voodoo-ranked-15th-anniversary.htm](https://www.musictimes.com/articles/25841/20150125/13-songs-dangelo-voodoo-ranked-15th-anniversary.htm)

[14] PianoGroove — Neo Soul vs. Jazz Harmony — [https://www.pianogroove.com/live-seminars/neo-soul-jazz-harmony/](https://www.pianogroove.com/live-seminars/neo-soul-jazz-harmony/)

[15] eMastered — Neo Soul Chord Progressions — [https://emastered.com/blog/neo-soul-chord-progressions](https://emastered.com/blog/neo-soul-chord-progressions)

[16] TalkBass — Pino Palladino on D'Angelo Voodoo — [https://www.talkbass.com/threads/pino-palladino-on-dangelo-album-voodoo.333463/](https://www.talkbass.com/threads/pino-palladino-on-dangelo-album-voodoo.333463/)

[17] Gearspace — D'Angelo Voodoo Vocal Harmonies — [https://gearspace.com/board/so-much-gear-so-little-time/929352-dangelos-voodoo-vocals-harmonies.html](https://gearspace.com/board/so-much-gear-so-little-time/929352-dangelos-voodoo-vocals-harmonies.html)

[18] eMastered / Neo Soul chord movements — [https://emastered.com/blog/neo-soul-chord-progressions](https://emastered.com/blog/neo-soul-chord-progressions)

[19] Rolling Stone / BRL Theory — J Dilla and the Soulquarians — [https://www.rollingstone.com/music/music-features/charnas-dilla-time-1286599/](https://www.rollingstone.com/music/music-features/charnas-dilla-time-1286599/)

[20] Reverb News — Low-End Legacy of Voodoo — [https://reverb.com/news/the-low-end-legacy-of-dangelos-voodoo](https://reverb.com/news/the-low-end-legacy-of-dangelos-voodoo)

[21] Revolt — How D'Angelo Made Voodoo — [https://www.revolt.tv/article/how-dangelo-recorded-voodoo](https://www.revolt.tv/article/how-dangelo-recorded-voodoo)

[22] Slavetomusic — Voodoo Neo-Soul Time Travel — [https://slavetomusic.com/voodoo-neo-soul-time-travel-and-the-art-of-the-groove/](https://slavetomusic.com/voodoo-neo-soul-time-travel-and-the-art-of-the-groove/)

---

## Hand to Claude

"Before we start on Scales.sin chord progression library, Javelin researched D'Angelo's Voodoo harmonic language in depth. The core finding: Voodoo runs on Mixolydian and Dorian modal loops (3–4 chords, no functional dominant resolution), extended voicings where the 9ths and 11ths are implied by bass and vocals rather than stated in the keyboard part, and a tritone substitution in 'Brown Sugar' (F7 for B7) that's the clearest single example of his harmonic sophistication. The most important gotcha: don't transcribe the full chord symbol as the keyboard voicing — 'Cm11' on paper is usually 'Cm7' in the left hand with the 11th living in Pino's bass or D'Angelo's vocal stack. Build separate fields for full-symbol vs. keyboard-voicing in the ChromaDB schema. I have track-level chord data for: Untitled (D Mixolydian, Dadd9–A7sus4–G6–C9), Left & Right (C minor, Cm7–Fm7–Ab–G7), Send It On (F major, Am7–Gm7–C7sus–Fmaj7), Chicken Grease (A major one-chord dominant vamp), and Devil's Pie (key disputed). The Line and Spanish Joint have minimal chord data available — may need manual transcription."
