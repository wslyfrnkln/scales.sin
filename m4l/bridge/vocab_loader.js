// =============================================================================
// SCALES.SIN M4L — VOCAB LOADER (Node side)
//
// Replicates loadVocabulary() from voicing_vocabulary.js:247-309 for Node:
// the browser version fetch()es artist_vocab.json; under Node-for-Max there is
// no fetch for local files, so this reads via fs. The merge semantics below
// mirror the browser merge line-for-line — only the transport differs.
//
// CJS by design: node.script loads its entry via CommonJS (validated against
// Max's bundled Node v22.18.0, Task 1.1). require() of the ESM
// voicing_vocabulary.js works natively in v22.12+.
// =============================================================================

const fs = require('fs');
const path = require('path');
// Plain-object data exports — DOM-free, reused unmodified (D-01/D-02).
// Deployed bridge/ carries its own copy (deploy_m4l.sh); repo layout falls back.
const { CHORD_TYPES, EXTENSION_MAP, STYLE_TEMPLATES } = require(
    fs.existsSync(path.join(__dirname, 'voicing_vocabulary.js'))
        ? './voicing_vocabulary.js' : '../../voicing_vocabulary.js');

/**
 * loadVocabularySync(vocabPath)
 * Returns merged { chordTypes, extensionMap, styleTemplates } — same shape the
 * engine expects (camelCase top-level; inner keys stay as-authored, the engine
 * handles both chordColors and chord_colors).
 */
function loadVocabularySync(vocabPath) {
    const base = {
        chordTypes:     { ...CHORD_TYPES },
        extensionMap:   {},
        styleTemplates: {},
    };

    // Deep-copy extension map (arrays need real copy) — mirrors voicing_vocabulary.js:255-257
    for (const [k, v] of Object.entries(EXTENSION_MAP)) {
        base.extensionMap[k] = [...v];
    }
    // Deep-copy style templates — mirrors voicing_vocabulary.js:259-261
    for (const [k, v] of Object.entries(STYLE_TEMPLATES)) {
        base.styleTemplates[k] = { ...v, progressions: [...v.progressions], rules: [...v.rules] };
    }

    // One try covers read + parse + ALL merges — mirrors the browser exactly
    // (voicing_vocabulary.js:263-306 wraps fetch AND merge in a single try), so a
    // shape-invalid JSON degrades to built-in vocab instead of crashing the
    // node.script process at startup. Failure reader: the message lands in
    // node.script's stderr outlet → visible in the Max console.
    try {
        const data = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

        // Merge chord_types — mirrors voicing_vocabulary.js:269-271
        if (data.chord_types) {
            Object.assign(base.chordTypes, data.chord_types);
        }

        // Merge extension_map — append new suffix entries, don't replace existing
        // (mirrors voicing_vocabulary.js:274-284)
        if (data.extension_map) {
            for (const [quality, exts] of Object.entries(data.extension_map)) {
                if (base.extensionMap[quality]) {
                    const existingSuffixes = new Set(base.extensionMap[quality].map(e => e.suffix));
                    const newExts = exts.filter(e => !existingSuffixes.has(e.suffix));
                    base.extensionMap[quality] = [...base.extensionMap[quality], ...newExts];
                } else {
                    base.extensionMap[quality] = exts;
                }
            }
        }

        // Merge style_templates — append new progressions, don't replace templates,
        // never overwrite rules from JSON (mirrors voicing_vocabulary.js:287-302)
        if (data.style_templates) {
            for (const [key, tmpl] of Object.entries(data.style_templates)) {
                if (base.styleTemplates[key]) {
                    const existingLabels = new Set(base.styleTemplates[key].progressions.map(p => p.label));
                    const newProgs = (tmpl.progressions || []).filter(p => !existingLabels.has(p.label));
                    base.styleTemplates[key] = {
                        ...base.styleTemplates[key],
                        ...tmpl,
                        progressions: [...base.styleTemplates[key].progressions, ...newProgs],
                        rules: base.styleTemplates[key].rules, // never overwrite rules from JSON
                    };
                } else {
                    base.styleTemplates[key] = tmpl;
                }
            }
        }
    } catch (e) {
        console.error(`[vocab_loader] ${vocabPath} unavailable or malformed (${e.message}) — using built-in vocab only.`);
    }

    return base;
}

module.exports = { loadVocabularySync };

// Self-test (Task 1.2 acceptance): run directly with any Node ≥22.
if (require.main === module) {
    const vocab = loadVocabularySync(path.join(__dirname, '../../artist_vocab.json'));
    // All 19 JSON artists must survive the merge. Total is 22: the built-in
    // STYLE_TEMPLATES adds 4 legacy keys (pass, wonder, dangelo, thomas) — the
    // browser merge produces the same union, verified 2026-07-03 (count updated
    // 2026-09-04, Phase 6: bill_evans/steely_dan/duke_ellington/bon_iver appended).
    const JSON_ARTISTS = ['frank_ocean','dangelo','leon_thomas','glasper','badu','paak',
        'stevie_wonder','herbie_hancock','thundercat','gospel','dilla','kendrick',
        'mac_miller','joe_pass','ama_lou','bill_evans','steely_dan','duke_ellington',
        'bon_iver'];
    const missing = JSON_ARTISTS.filter(k => !vocab.styleTemplates[k]);
    console.log('artists (union):', Object.keys(vocab.styleTemplates).length);
    console.log('missing JSON artists:', missing.length ? missing.join(',') : 'none');
    console.log('frank_ocean progressions:', vocab.styleTemplates.frank_ocean?.progressions?.length ?? 0);
    console.log('extensionMap.Maj7 defined:', vocab.extensionMap.Maj7 !== undefined);
    console.log('chordTypes.maj7 defined:', vocab.chordTypes.maj7 !== undefined);
    const ok = missing.length === 0
        && (vocab.styleTemplates.frank_ocean?.progressions?.length ?? 0) > 0
        && vocab.extensionMap.Maj7 !== undefined
        && vocab.chordTypes.maj7 !== undefined;
    console.log(ok ? 'SELF-TEST PASS' : 'SELF-TEST FAIL');
    process.exit(ok ? 0 : 1);
}
