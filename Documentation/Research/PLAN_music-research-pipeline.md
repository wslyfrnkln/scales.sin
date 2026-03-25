# Implementation Plan: Automated Music Research Pipeline with Chord Pattern Extraction

## Overview

A two-stage pipeline that (1) runs periodic `/research` calls against a curated topic list to produce music theory research reports, and (2) extracts structured chord pattern records from those reports via **Claude Haiku 4.5** and indexes them into a dedicated ChromaDB collection. The result is a living, queryable chord library for Scales.sin and WESLEYFRANKLIN composition work.

## Requirements

- Extract chord patterns from existing and future research reports into structured JSON records
- Index extracted records into ChromaDB with rich metadata for semantic querying
- Schedule periodic research intake with Wes-curated topic rotation
- Query interface usable from CLI (scripts, composition sessions, Scales.sin development)
- Zero new infrastructure -- use existing venv, ChromaDB, LaunchAgent pattern
- Extraction uses **Haiku 4.5** (Claude Max — fast, music-theory-aware, reliable JSON output)
- Tier 3 Sonnet for research stage only

---

## Real Use Cases

### Scales.sin — Chord Voicing Tool
- **"Played by" context** — when a user selects a Drop 2 m9 voicing, Scales.sin queries the library and surfaces: *"D'Angelo uses this voicing shape in Brown Sugar — dom7#9 on strings 5-4-3-2 around fret 7"*
- **Progression builder** — Phase 2 feature pulls from the library: *"neo-soul progression"* → query `music_chords` for patterns tagged `neo-soul` → return real-world examples ranked by artist influence
- **Technique explanations** — when Scales.sin displays a tritone substitution, it annotates with: *"Joe Pass deploys this as a chromatic approach in ii-V-I contexts"* — sourced from the KB, not hardcoded
- **Cross-genre suggestions** — user is working in minor Dorian, tool queries the library for Dorian vamps from multiple genres (gospel, jazz-funk, neo-soul) and surfaces what's available to borrow

### WESLEYFRANKLIN — Composition & Theory Learning
- **Mid-session queries** — during composition: `chordq "what follows Dm7 in a neo-soul context"` returns real artist examples instantly, no research session needed
- **Artist deep-dive study** — `chordq --artist "Stevie Wonder"` returns all extracted progressions from Wonder's catalog, organized by technique — a structured study guide built automatically from research
- **Cross-genre borrowing** — `chordq --genre "gospel" "dominant resolution"` — pull gospel chord moves (Kirk Franklin, Fred Hammond) and adapt them to R&B context
- **Technique mastery** — `chordq --technique "tritone substitution"` returns examples from Joe Pass, Herbie Hancock, Robert Glasper — see the same technique deployed across jazz, funk, and neo-soul
- **Weekly new material** — automated intake drops a new artist/genre into the library every week, passively expanding the chord vocabulary available to study and pull from

## Architecture Changes

### New Files

| File | Purpose |
|------|---------|
| `~/Javelin/scripts/extract_chords.py` | Core extraction script. Parses research .md files, calls Claude Haiku 4.5 to extract chord pattern JSON, validates output. |
| `~/Javelin/scripts/index_chords.py` | ChromaDB indexer for chord records. Creates/manages `music_chords` collection. |
| `~/Javelin/scripts/query_chords.py` | CLI query tool for the chord library. Semantic search + metadata filters. |
| `~/Javelin/scripts/research_intake.py` | Scheduled research runner. Reads topic list, selects next topic, writes dispatch task file for `/research`. |
| `~/Javelin/kb/javelin-music/chord_topics.json` | Curated topic list with rotation state. Wes-maintained. |
| `~/Javelin/kb/javelin-music/chord_extractions/` | Directory for extracted JSON records (one .json per source report). |
| `~/Javelin/templates/chord_extraction_prompt.txt` | Prompt template for Tier 1 extraction. |

### Modified Files

| File | Change |
|------|--------|
| `~/Javelin/scripts/indexer.py` | Add `javelin-music-chords` to `VALID_DOMAINS` list (line 32). No other changes -- chord indexing uses its own script. |
| `~/.zshrc` | Add aliases: `chordq`, `chordextract`, `chordindex` |

### Unchanged (used as-is)

| File | Role |
|------|------|
| `~/Javelin/scripts/dispatch.sh` | Routes extraction tasks to Tier 1 |
| `~/Javelin/scripts/query.py` | Reference pattern for query_chords.py |
| `~/Javelin/training/venv/bin/python3` | Python interpreter with chromadb installed |
| `~/.claude/skills/research/SKILL.md` | Research skill (Tier 3, unchanged) |

---

## Extraction Schema

Each chord pattern record:

```json
{
  "id": "sha256_hash_of_content",
  "artist": "D'Angelo",
  "song": "Brown Sugar",
  "genre": "neo-soul",
  "key": "Em",
  "mode": "Dorian",
  "progression_roman": ["i7", "IV7", "vi7", "bII7"],
  "progression_absolute": ["Em7", "A7", "Bm7", "F7"],
  "chord_types": ["m7", "dom7", "dom7#9"],
  "technique": "tritone substitution",
  "technique_detail": "F7 functions as tritone sub or chromatic neighbor chord",
  "context": "Main progression from Brown Sugar (1995). F7#9 is the signature voicing.",
  "tags": ["hendrix-chord", "chromatic-neighbor", "neo-soul-dominant"],
  "source_report": "RESEARCH_Music_2026-03-08-harmonic-language.md",
  "source_section": "D'Angelo",
  "date_extracted": "2026-03-09T10:30:00",
  "confidence": "high"
}
```

Fields explained:
- `progression_roman` -- Roman numeral analysis (portable across keys)
- `progression_absolute` -- Concrete chord names in the stated key
- `chord_types` -- Unique chord qualities appearing in the progression
- `technique` -- Primary harmonic technique demonstrated
- `technique_detail` -- One-sentence explanation of the technique
- `context` -- Free-text context from the report
- `tags` -- Queryable labels for cross-referencing
- `confidence` -- "high" (explicit in report), "medium" (inferred by extraction), "low" (uncertain parse)

---

## Implementation Steps

### Phase 1: Validate Extraction on Existing Reports (Complexity: Medium, ~3 hours)

Goal: Prove the extraction pipeline works on the two existing research reports before building scheduling or indexing.

**1.1 Create the extraction prompt template** (File: `~/Javelin/templates/chord_extraction_prompt.txt`)
- Action: Write a structured prompt that instructs Tier 1 to parse a markdown section and output JSON array of chord pattern records matching the schema above.
- Why: Separating the prompt from the script makes it tunable without code changes.
- Dependencies: None
- Risk: Low

**1.2 Create extract_chords.py** (File: `~/Javelin/scripts/extract_chords.py`)
- Action: Python script that:
  1. Accepts a research report path as argument
  2. Splits the report into sections by `### ` headers (artist-level chunks)
  3. For each section, builds a prompt from the template + section text
  4. Calls **Claude Haiku 4.5** via the Anthropic SDK (`anthropic` Python package in training venv)
  5. Parses the JSON response, validates required fields
  6. Writes validated records to `~/Javelin/kb/javelin-music/chord_extractions/{report_slug}.json`
  7. Prints summary: N records extracted, N failed validation
- Why: Haiku 4.5 understands music theory vocabulary natively — Roman numeral analysis, chord quality labels, technique names. 8B Ollama models frequently misparse progression notation or hallucinate chord data not present in the source. Haiku on Claude Max is fast (~1-2s/section) and produces reliable structured JSON without needing repair logic.
- Model: `claude-haiku-4-5-20251001`
- Dependencies: `anthropic` package in training venv (`pip install anthropic` if not present)
- Risk: **Low** -- Haiku produces clean JSON reliably for structured extraction tasks.

**1.3 Run extraction on the harmonic-language report** (Manual validation)
- Action: `~/Javelin/training/venv/bin/python3 ~/Javelin/scripts/extract_chords.py ~/Javelin/reports/research/RESEARCH_Music_2026-03-08-harmonic-language.md`
- Why: This report has 4 artist sections with explicit `Core progressions:` code blocks -- ideal for testing extraction accuracy.
- Dependencies: 1.1, 1.2
- Risk: Low
- Expected output: ~15-20 chord pattern records (Joe Pass: ~4, Wonder: ~5, D'Angelo: ~4, Thomas: ~3, plus shared vocabulary items)

**1.4 Run extraction on the voicing-quality report** (Manual validation)
- Action: Same script on the second report.
- Why: This report is structurally different (technical reference, not artist-by-artist). Tests whether the extractor handles non-standard layouts gracefully. Expect fewer chord patterns (mostly technique records about Drop 2/3, not progressions).
- Dependencies: 1.1, 1.2
- Risk: Low -- may extract 0-3 records, which is correct for this report type.

**1.5 Review and tune** (Manual)
- Action: Inspect the output JSON files. Check: Are Roman numeral progressions parsed correctly? Are techniques labeled accurately? Are there duplicates? Is the 8B model hallucinating chord data not in the source?
- Why: Calibrate before automating.
- Dependencies: 1.3, 1.4
- Risk: Low

### Phase 2: ChromaDB Indexing (Complexity: Low, ~1.5 hours)

Goal: Get extracted chord records into a queryable ChromaDB collection.

**2.1 Create index_chords.py** (File: `~/Javelin/scripts/index_chords.py`)
- Action: Python script that:
  1. Reads all `.json` files from `~/Javelin/kb/javelin-music/chord_extractions/`
  2. Opens/creates ChromaDB collection `music_chords` (separate from `javelin_knowledge`)
  3. For each record, generates a document string: `"{artist} - {song}: {progression_roman} ({technique}). {context}"`
  4. Upserts with metadata: all schema fields as metadata, document string as the searchable text
  5. Deduplicates by record `id` (content hash)
  6. Prints summary: N records indexed, N skipped (dupes), total in collection
- Why: Separate collection keeps chord queries fast and avoids noise from ops/legal/finance docs in `javelin_knowledge`.
- Dependencies: Phase 1 complete (extraction JSON files exist)
- Risk: Low

**2.2 Create query_chords.py** (File: `~/Javelin/scripts/query_chords.py`)
- Action: CLI query tool:
  1. Semantic search: `query_chords.py "neo-soul dominant substitution"`
  2. Metadata filters: `--artist "D'Angelo"`, `--genre "neo-soul"`, `--technique "tritone substitution"`, `--chord-type "dom13sus4"`
  3. Output: formatted results with progression, technique, context, source
- Why: This is the primary interface for composition sessions and Scales.sin development.
- Dependencies: 2.1
- Risk: Low

**2.3 Add shell aliases** (File: `~/.zshrc`)
- Action: Append:
  ```bash
  alias chordq='~/Javelin/training/venv/bin/python3 ~/Javelin/scripts/query_chords.py'
  alias chordextract='~/Javelin/training/venv/bin/python3 ~/Javelin/scripts/extract_chords.py'
  alias chordindex='~/Javelin/training/venv/bin/python3 ~/Javelin/scripts/index_chords.py'
  ```
- Dependencies: 2.1, 2.2
- Risk: Low

**2.4 End-to-end validation**
- Action: Run `chordextract` on both reports, then `chordindex`, then `chordq "Dorian vamp"`. Verify results include Stevie Wonder "I Wish" and D'Angelo patterns.
- Dependencies: 2.1, 2.2, 2.3
- Risk: Low

### Phase 3: Scheduled Research Intake (Complexity: Medium, ~2 hours)

Goal: Automate periodic research topic execution with Wes-curated topic rotation.

**3.1 Create chord_topics.json** (File: `~/Javelin/kb/javelin-music/chord_topics.json`)
- Action: Seed file with initial topic list. Structure:
  ```json
  {
    "rotation": "weekly",
    "last_run": null,
    "last_topic_index": -1,
    "topics": [
      {
        "query": "harmonic language of Erykah Badu chord progressions and voicing techniques",
        "project": "Music",
        "depth": "deep",
        "genre_tags": ["neo-soul", "jazz-funk"],
        "status": "pending"
      },
      {
        "query": "chord progressions and harmonic techniques of Anderson .Paak and Silk Sonic",
        "project": "Music",
        "depth": "deep",
        "genre_tags": ["funk", "soul", "r&b"],
        "status": "pending"
      },
      {
        "query": "harmonic analysis of Frank Ocean Blonde and Channel Orange chord progressions",
        "project": "Music",
        "depth": "deep",
        "genre_tags": ["alternative-r&b", "art-pop"],
        "status": "pending"
      },
      {
        "query": "gospel chord progressions and extended harmony techniques Kirk Franklin Fred Hammond",
        "project": "Music",
        "depth": "deep",
        "genre_tags": ["gospel", "contemporary-gospel"],
        "status": "pending"
      },
      {
        "query": "harmonic language of Robert Glasper Black Radio jazz-hip-hop chord vocabulary",
        "project": "Music",
        "depth": "deep",
        "genre_tags": ["jazz-hip-hop", "neo-soul"],
        "status": "pending"
      },
      {
        "query": "Herbie Hancock Head Hunters and Sextant era chord voicings and harmonic techniques",
        "project": "Music",
        "depth": "deep",
        "genre_tags": ["jazz-funk", "fusion"],
        "status": "pending"
      },
      {
        "query": "common chord progressions in trap-soul and alternative R&B SZA Bryson Tiller 6LACK",
        "project": "Music",
        "depth": "shallow",
        "genre_tags": ["trap-soul", "alternative-r&b"],
        "status": "pending"
      },
      {
        "query": "harmonic techniques in J Dilla productions and sample-based chord reharmonization",
        "project": "Music",
        "depth": "deep",
        "genre_tags": ["hip-hop-production", "neo-soul"],
        "status": "pending"
      }
    ]
  }
  ```
- Why: Wes reviews and edits this file to control what gets researched. No auto-research without a curated entry.
- Dependencies: None
- Risk: Low. Wes should review the seed list before any automated run.

**3.2 Create research_intake.py** (File: `~/Javelin/scripts/research_intake.py`)
- Action: Python script that:
  1. Reads `chord_topics.json`
  2. Checks if enough time has elapsed since `last_run` (based on `rotation` field)
  3. Selects the next pending topic (round-robin by index)
  4. Writes a task file to `~/Javelin/queue/` with the `/research` command parameters
  5. Updates `last_run` and `last_topic_index` in the JSON
  6. Logs the action
  7. Does NOT execute the research itself -- it stages the task for the next Javelin session to pick up via the queue
- Why: Queue-based approach keeps research under Javelin session control (Tier 3, requires Claude). The intake script just decides WHAT to research and WHEN; the actual research happens when Javelin reads the queue.
- Dependencies: 3.1
- Risk: Low

**3.3 Create post-research hook** (File: `~/Javelin/scripts/post_research_extract.sh`)
- Action: Simple shell script that:
  1. Finds research reports modified in the last 24 hours in `~/Javelin/reports/research/`
  2. Runs `extract_chords.py` on each
  3. Runs `index_chords.py` to update ChromaDB
  4. Logs results
- Why: Automates the extract+index step after new research lands. Can be called manually or by the observer daemon.
- Dependencies: Phase 1, Phase 2
- Risk: Low

**3.4 Add research intake to LaunchAgent schedule** (File: `~/Library/LaunchAgents/com.javelin.research-intake.plist`)
- Action: New LaunchAgent that runs `research_intake.py` weekly (604800 second interval). Runs under the training venv python.
- Why: Separate from the observer daemon (different cadence, different purpose). Observer runs every 5min for instinct evolution; research intake runs weekly.
- Dependencies: 3.2
- Risk: Low. LaunchAgent only stages tasks in the queue -- no API calls, no side effects.

**3.5 Wire post-research extraction into session workflow**
- Action: Document in this plan (no code change needed): after `/research` completes and produces a new report, Javelin should run `post_research_extract.sh` as a follow-up step. This is a manual convention initially -- can be automated later by having the `/research` skill call the hook.
- Dependencies: 3.3
- Risk: Low

---

## Testing Strategy

### Phase 1 Tests
- **Extraction accuracy**: Manually verify extracted records against source report for the harmonic-language report. Expected: ~15-20 records with correct Roman numerals, artist attribution, and technique labels.
- **JSON robustness**: Intentionally feed a non-music research report (if available) and verify 0 records extracted (graceful no-op).
- **Ollama availability**: Test with Ollama stopped -- script should fail with clear error message, not hang.

### Phase 2 Tests
- **Index idempotency**: Run `index_chords.py` twice on the same extraction files. Verify collection count does not double (upsert by ID).
- **Query relevance**: `chordq "Dorian vamp"` should return Stevie Wonder "I Wish" pattern. `chordq "tritone substitution"` should return Joe Pass patterns.
- **Metadata filter**: `chordq "chord" --artist "D'Angelo"` returns only D'Angelo records.

### Phase 3 Tests
- **Topic rotation**: Run `research_intake.py` 3 times in succession (overriding the time check). Verify it cycles through topics 0, 1, 2 in order.
- **Queue file format**: Verify the queued task file is valid for `/research` parsing.
- **LaunchAgent**: Load the plist, verify it fires on schedule (`launchctl list | grep research`).

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Haiku API unavailable (network/auth)** | Low | extract_chords.py checks for `ANTHROPIC_API_KEY` env var on startup, exits with clear error. post_research_extract.sh logs the failure -- extraction can be re-run manually. |
| **Haiku misreads ambiguous notation** | Low | Every record includes `source_report` and `source_section` for traceability. Confidence field ("high"/"medium"/"low") flags uncertain parses. Manual review in Phase 1 catches systematic issues before automation. |
| **ChromaDB schema evolution** | Low | music_chords is a new collection with no existing consumers. Schema changes only affect this pipeline. |
| **Topic list goes stale** | Low | rotation field is configurable. Wes can add/remove/reorder topics at any time by editing chord_topics.json. Status field tracks which topics have been researched. |
| **Research reports with no extractable chord data** | Low | Extraction returns 0 records and logs "no chord patterns found" -- not an error. The voicing-quality report is this case. |
| **Duplicate extraction across reports** | Low | Content-hash ID deduplicates at index time. Same progression from different reports gets one record (first wins). |

---

## Success Criteria

- [ ] `extract_chords.py` produces 15+ valid records from the harmonic-language report
- [ ] `extract_chords.py` produces 0-3 records from the voicing-quality report (correct behavior)
- [ ] `music_chords` ChromaDB collection exists with indexed records
- [ ] `chordq "Dorian vamp"` returns relevant results (Stevie Wonder, D'Angelo)
- [ ] `chordq "tritone substitution" --artist "Joe Pass"` returns Joe Pass tritone sub patterns
- [ ] `chord_topics.json` seed list reviewed and approved by Wes
- [ ] `research_intake.py` correctly stages a queue task for the next pending topic
- [ ] LaunchAgent fires weekly and stages research tasks without error
- [ ] End-to-end: new research report -> extraction -> indexing -> queryable in under 2 minutes (excluding research time)

---

## Estimated Timeline

| Phase | Effort | Can Ship Independently |
|-------|--------|----------------------|
| Phase 1: Extraction validation | ~3 hours | Yes -- produces JSON files usable without ChromaDB |
| Phase 2: ChromaDB indexing + query | ~1.5 hours | Yes -- queryable chord library, manual intake |
| Phase 3: Scheduled intake | ~2 hours | Yes -- automated topic rotation + queue staging |
| **Total** | **~6.5 hours** | |

---

## Design Decisions (Rationale)

**Why Haiku 4.5 instead of 8B Ollama for extraction?**
Music theory extraction is mechanically simple but domain-specific — Roman numeral parsing, chord quality labeling, technique identification all require vocabulary that 8B models handle inconsistently. Haiku 4.5 gets it right on first pass with no repair logic needed, and on Claude Max the cost is negligible (~$0.002/report). The JSON repair + retry complexity in the original plan disappears entirely. Direct Anthropic SDK call — no dispatch.sh (dispatch.sh is for human-authored task files, not programmatic API loops).

**Why a separate `music_chords` collection instead of extending `javelin_knowledge`?**
The javelin_knowledge collection has 1,541 docs across 6 domains (ops, dev, music, finance, legal, wes). Chord pattern records have different metadata fields (artist, genre, progression_roman) that don't map to the existing domain/source/filename schema. A separate collection allows chord-specific queries without metadata conflicts and keeps the general KB clean.

**Why queue-based research staging instead of direct `/research` invocation?**
The `/research` skill requires a Tier 3 Claude session (Sonnet-class agent with web search). LaunchAgents run headless -- they can't invoke Claude Code. By staging a task file in `~/Javelin/queue/`, the next Javelin session picks it up naturally during session start (step 3 of the session protocol).

**Why weekly rotation instead of daily?**
Each deep research run uses Tier 3 API budget. Weekly gives 4 new artist/genre reports per month -- enough to build a substantial chord library without burning API credits. Wes can change the rotation field to "biweekly" or "daily" in chord_topics.json.

**Why not modify the observer daemon?**
The observer daemon (`com.javelin.observer`) is purpose-built for instinct evolution with its own state tracking. Adding chord extraction to it would create coupling between unrelated systems. A separate LaunchAgent for research intake keeps concerns separated.
