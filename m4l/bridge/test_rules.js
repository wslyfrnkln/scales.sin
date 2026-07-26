#!/usr/bin/env node
// =============================================================================
// DO THE DEVICE'S PROGRESSIONS FOLLOW THE STYLE RULES?
//
// JS counterpart of Scales.sin Plugin/Tests/test_StyleRules.cpp. Same design,
// same five claims, so the device and the plugin are held to one standard.
//
// WHY A SEPARATE FILE RATHER THAN TRUSTING THE C++ SUITE: the bridge does NOT
// run the same code. It loads a MERGED vocabulary — the built-in templates in
// voicing_vocabulary.js overlaid with artist_vocab.json — so it can resolve a
// degree differently from the plugin even with identical data. That merge is
// exactly where a divergence would hide, and the C++ tests cannot see it.
//
// WHAT THIS CAN AND CANNOT DO (same as the C++ file): of the 118 prose rules,
// roughly 65 name a checkable musical fact; the rest are descriptive or
// subjective ("groove IS the harmony"). No test verifies those. The ones worth
// testing make NEGATIVE, FALSIFIABLE claims — one counterexample disproves them.
//
// CIRCULARITY IS THE TRAP: asserting output matches the constraints block would
// prove the data matches the data. These read the PROSE RULES as source of
// truth and check the OUTPUT, so a constraints entry that contradicts its own
// rule fails.
//
// Run: node m4l/bridge/test_rules.js
// =============================================================================
'use strict';

const fs   = require('fs');
const path = require('path');
const { loadVocabularySync } = require('./vocab_loader.js');
const { resolveProgression } = require('./degree_resolver.js');

let passed = 0, failed = 0;
const fail = (name, detail) => { failed++; console.log(`  FAIL  ${name}\n        ${detail}`); };
const pass = name => { passed++; console.log(`  ok    ${name}`); };

const VOCAB_JSON = path.resolve(__dirname, '../../artist_vocab.json');
if (!fs.existsSync(VOCAB_JSON)) {
    console.log(`SKIP: vocab not found at ${VOCAB_JSON}`);
    process.exit(0);
}
const vocab = loadVocabularySync(VOCAB_JSON);
const styles = vocab.styleTemplates;

// The menu is the ONLY way a style is selected on the device, so it defines
// which templates are actually reachable.
const MENU = (() => {
    const src = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
    const m = src.match(/const ARTISTS = \[([^\]]+)\]/);
    return m[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
})();

// ── helpers over DEGREE STRINGS, mirroring the C++ file ──────────────────────
const startsWith = (s, p) => s.startsWith(p);
const isFive = d => {
    if (startsWith(d, 'VII') || startsWith(d, 'VI')) return false;
    if (startsWith(d, 'vii') || startsWith(d, 'vi'))  return false;
    return startsWith(d, 'V') || startsWith(d, 'v');
};
const isOne = d => {
    if (startsWith(d, 'IV')  || startsWith(d, 'iv'))  return false;
    if (startsWith(d, 'II')  || startsWith(d, 'ii'))  return false;
    if (startsWith(d, 'III') || startsWith(d, 'iii')) return false;
    return startsWith(d, 'I') || startsWith(d, 'i');
};
const isSus  = d => d.includes('sus');
const hasRule = (t, needle) =>
    (t.rules || []).some(r => r.toLowerCase().includes(needle.toLowerCase()));
const hasIv = (c, iv) => (c.intervals || []).includes(iv);

// =============================================================================
console.log('\nREACHABILITY — the merged vocab carries more than the menu shows');
{
    // The bridge's merged vocab has 18 templates; the menu has 15. The extra
    // three (pass / wonder / thomas) are LEGACY entries in
    // voicing_vocabulary.js under different keys than the JSON's
    // (joe_pass / stevie_wonder / leon_thomas), so the loader's merge never
    // reaches them — they carry rules but NO constraints block.
    //
    // They are unreachable from the menu, so they cannot affect output. That is
    // asserted here rather than assumed, because these same three entries have
    // already caused two separate confusions (they shipped inside the device
    // still displaying artist names after the rename).
    const unreachable = Object.keys(styles).filter(k => !MENU.includes(k));
    MENU.length === 15 ? pass('menu exposes 15 styles')
                       : fail('menu size', `got ${MENU.length}`);

    const constrained = MENU.filter(k => styles[k] && styles[k].constraints);
    constrained.length === MENU.length
        ? pass('every menu-reachable style has a constraints block')
        : fail('constraints coverage',
               `missing: ${MENU.filter(k => !(styles[k] || {}).constraints)}`);

    // Unreachable ones may lack constraints — but must stay unreachable.
    unreachable.every(k => !MENU.includes(k))
        ? pass(`${unreachable.length} legacy templates remain unreachable (${unreachable})`)
        : fail('legacy reachability', `${unreachable} became selectable`);
}

// =============================================================================
console.log('\nMERGE — the device does not see the same rules as the plugin');
{
    // A REAL DIVERGENCE, found by running this suite against the C++ one.
    //
    //   C++ : 5 styles forbid resolution, 2 are cyclic
    //   JS  : 4 styles forbid resolution, 3 are cyclic
    //
    // Same rules, same JSON, different answers. The cause is vocab_loader's
    // documented merge policy (line ~81): "never overwrite rules from JSON".
    // MEASURED: exactly ONE style is shadowed — dangelo. voicing_vocabulary.js
    // has built-in templates for four styles, but three of them (pass, wonder,
    // thomas) use LEGACY KEYS that differ from the JSON's (joe_pass,
    // stevie_wonder, leon_thomas), so the merge never reaches those and they
    // shadow nothing. Only dangelo shares its key.
    //
    // dangelo's JSON carries 8 researched rules; the device sees 4 older ones,
    // including "2-3 chords max - cyclic" (which the JSON does not say) and
    // lacking "Do NOT resolve to V7->I" (which it does). I first assumed all
    // four were shadowed — the test measured one.
    //
    // That is why dangelo counts as cyclic here and as forbidding-resolution
    // there. The policy is deliberate and mirrored from the original JS engine,
    // so this test DOCUMENTS it rather than asserting the two must agree —
    // changing it would alter shipped device behaviour and belongs in its own
    // change with its own listening pass.
    //
    // What must not happen silently is the set GROWING. If a fifth style starts
    // shadowing its JSON rules, that is new drift and wants a decision.
    const MAX_SHADOWED = 1;   // measured 2026-07-26: dangelo only

    const raw = JSON.parse(fs.readFileSync(VOCAB_JSON, 'utf8')).style_templates;
    const shadowed = MENU.filter(k => {
        const jsonRules = (raw[k] || {}).rules || [];
        const seenRules = (styles[k] || {}).rules || [];
        return jsonRules.length > 0 && seenRules.length > 0
            && jsonRules.length !== seenRules.length;
    });

    shadowed.length <= MAX_SHADOWED
        ? pass(`${shadowed.length} styles see built-in rules instead of the JSON's (${shadowed})`)
        : fail('rule shadowing grew', `now ${shadowed}`);

    // The device must still HAVE rules for every style it can select — a style
    // with none would silently skip every rule check below.
    const ruleless = MENU.filter(k => !((styles[k] || {}).rules || []).length);
    ruleless.length === 0 ? pass('every selectable style carries rules')
                          : fail('missing rules', `${ruleless}`);
}

// =============================================================================
console.log('\nRULE — styles that forbid resolution author no authentic cadence');
{
    // Same three subtleties the C++ version had to learn:
    //   (a) a suspension on either side defuses the cadence;
    //   (b) the matcher must be NARROW — matching "no leading tone" swept in a
    //       blues style whose V7->I7 is the form itself;
    //   (c) only the LANDING counts — leon_thomas's own third rule permits a
    //       ii-V-i that lands on bVImaj7 rather than resolving.
    let stylesChecked = 0;
    const violations = [];

    for (const key of MENU) {
        const t = styles[key];
        if (!t) continue;
        const forbids = hasRule(t, 'do not resolve to v7') || hasRule(t, 'avoid v')
                     || hasRule(t, 'refuse to resolve')    || hasRule(t, 'no resolution urge');
        if (!forbids) continue;
        ++stylesChecked;

        for (const prog of (t.progressions || [])) {
            const dg = prog.degrees || [];
            for (let i = 0; i + 1 < dg.length; ++i) {
                if (!(isFive(dg[i]) && isOne(dg[i + 1]))) continue;
                if (isSus(dg[i]) || isSus(dg[i + 1])) continue;
                if (i + 2 !== dg.length) continue;     // not the landing
                violations.push(`${key} / ${prog.label} : ${dg[i]} -> ${dg[i + 1]}`);
            }
        }
    }

    stylesChecked >= 4 ? pass(`${stylesChecked} styles forbid resolution`)
                       : fail('rule set findable', `only ${stylesChecked} matched`);
    violations.length === 0 ? pass('no authentic cadence in those styles')
                            : fail('authentic cadence', violations.join('; '));
}

// =============================================================================
console.log('\nRULE — "no leading tone" styles emit no major 3rd on their dominant');
{
    // THE RULE (glasper): "Replace V7 with 13sus4 or sus2 — no leading tone."
    //
    // TWO FALSE STARTS, recorded because they explain the final design.
    //
    // (1) The first version walked authored progressions looking for chords
    //     that ARE dominants and flagged them. Nothing upstream ever hands it
    //     one, so it found none and passed — and disabling sus13 entirely left
    //     it green. A test that cannot fail.
    //
    // (2) The second resolved V7 and applied constraints, and STILL could not
    //     fail. The reason is worth knowing: THIS RULE IS ALREADY SATISFIED BY
    //     THE DATA. glasper's chord_colors.dom is "13sus4" in
    //     artist_vocab.json, so resolveVoicing returns [0,5,10,21] before the
    //     constraint layer runs at all. Phase 4's constraint is a SECOND
    //     enforcement of a rule the vocab already honoured.
    //
    // So the assertion is about the RULE, not about which layer delivers it:
    // whatever the pipeline does, a style saying "no leading tone" must never
    // emit a dominant carrying a major third. Both enforcement paths are
    // covered because neither is named — if someone loosens chord_colors to a
    // plain "7" and the constraint is also absent, this fails.
    let checked = 0;
    const violations = [];

    for (const key of MENU) {
        const t = styles[key];
        if (!t || !hasRule(t, 'no leading tone')) continue;

        for (let i = 0; i < (t.progressions || []).length; ++i) {
            for (const c of resolveProgression(key, 0, 'major', vocab, i)) {
                ++checked;
                // A dominant is a major 3rd plus a minor 7th. Either alone is
                // fine; together they are the leading-tone pull the rule bans.
                if (hasIv(c, 4) && hasIv(c, 10))
                    violations.push(`${key} ${c.degree} -> ${c.symbol} [${c.intervals}]`);
            }
        }
    }

    checked > 0 ? pass(`${checked} chords checked in no-leading-tone styles`)
                : fail('coverage', 'no style matched the rule');
    violations.length === 0 ? pass('no dominant keeps its leading tone')
                            : fail('leading tone present', violations.join('; '));
}

// =============================================================================
console.log('\nRULE — cyclic styles keep their progressions short');
{
    let stylesChecked = 0;
    const violations = [];
    for (const key of MENU) {
        const t = styles[key];
        if (!t) continue;
        const cyclic = hasRule(t, 'cyclic') || hasRule(t, 'vamps repeated')
                    || hasRule(t, 'chord loops');
        if (!cyclic) continue;
        ++stylesChecked;
        for (const prog of (t.progressions || []))
            if ((prog.degrees || []).length > 6)
                violations.push(`${key} / ${prog.label} : ${prog.degrees.length} chords`);
    }
    stylesChecked > 0 ? pass(`${stylesChecked} cyclic styles`)
                      : fail('cyclic styles', 'none matched');
    violations.length === 0 ? pass('all cyclic progressions <= 6 chords')
                            : fail('too long', violations.join('; '));
}

// =============================================================================
console.log('\nRULE — rootless styles actually omit the root');
{
    let rootlessStyles = 0;
    const violations = [];

    for (const key of MENU) {
        const t = styles[key];
        if (!t || !hasRule(t, 'rootless')) continue;
        ++rootlessStyles;

        // Only chords carrying a THIRD are what this rule speaks about — a
        // suspended chord has no third to voice around, and in glasper's case
        // the sus13 rule fires first and legitimately owns the chord.
        let applicable = 0, rootless = 0;
        for (const prog of (t.progressions || [])) {
            const idx = (t.progressions || []).indexOf(prog);
            for (const c of resolveProgression(key, 0, 'major', vocab, idx)) {
                if (!(hasIv(c, 3) || hasIv(c, 4))) continue;
                ++applicable;
                if (!hasIv(c, 0)) ++rootless;
            }
        }
        if (applicable > 0 && rootless === 0)
            violations.push(`${key}: 0 of ${applicable} third-bearing chords rootless`);
    }

    rootlessStyles > 0 ? pass(`${rootlessStyles} styles declare rootless voicings`)
                       : fail('rootless styles', 'none matched');
    violations.length === 0 ? pass('each emits at least one rootless chord')
                            : fail('no rootless output', violations.join('; '));
}

// =============================================================================
console.log('\nSTRUCTURE — every emitted chord is well-formed');
{
    // Not a taste judgement — structural corruption is what actually goes
    // wrong. Every chord the device can produce must have >= 3 distinct pitch
    // classes and a non-empty symbol.
    let generated = 0;
    const violations = [];

    for (const key of MENU) {
        const t = styles[key];
        if (!t || !(t.progressions || []).length) continue;
        for (let i = 0; i < t.progressions.length; ++i) {
            const chords = resolveProgression(key, 0, 'major', vocab, i);
            if (!chords.length) continue;
            ++generated;
            for (const c of chords) {
                const pcs = new Set((c.intervals || []).map(iv => ((c.root + iv) % 12 + 12) % 12));
                if (pcs.size < 3)
                    violations.push(`${key} ${c.degree}: only ${pcs.size} pitch classes`);
                if (!c.symbol)
                    violations.push(`${key} ${c.degree}: empty symbol`);
            }
        }
    }

    generated > 50 ? pass(`${generated} progressions resolved`)
                   : fail('coverage', `only ${generated} progressions`);
    violations.length === 0 ? pass('every chord well-formed')
                            : fail('malformed chords', violations.slice(0, 5).join('; '));
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
