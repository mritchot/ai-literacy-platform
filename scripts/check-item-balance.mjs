// Item-writing guard for the scored item banks: the pre/post assessment,
// the module knowledge checks, and the Module 1 interpretation checks.
// Run with `npm run check:items`. It is deliberately not part of `build`:
// a flawed item is a content defect to fix in review, not a reason to
// block a deploy.
//
// Why this exists: every rule below guards a cue that let a test-wise
// learner score above their knowledge, which inflates the pre score, the
// post score, or both, and so distorts the pre-to-post gain the Level 2
// evaluation reports.
//   • Post stems that name the concept being tested (LS-01, AE-01).
//   • A post stem whose program term appears only in the key (AE-15).
//   • The key as the longest option (LS-02, AE-15; Haladyna, Downing &
//     Rodriguez, 2002, guideline 24).
//   • Literal *asterisk emphasis*, which renders as plain asterisks (LS-19).
//   • Answer-key distributions that drift from the file headers.
//
// The banks are read as source text, not imported, so the script needs no
// TypeScript or JSX toolchain. Option text, stems, and feedback are plain
// string literals in every bank; an option whose text is not a string
// literal is skipped and reported.
//
// Errors exit 1. Length checks are errors for the pre/post banks, which
// were rebalanced as a set, and warnings for the knowledge-check banks.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// ─── Thresholds ────────────────────────────────────────────────────────

/** A key more than this many times longer (characters) than its longest
 *  distractor is a length cue. */
const MAX_KEY_TO_LONGEST_DISTRACTOR = 1.1;
/** A key whose word count exceeds this multiple of the mean distractor
 *  word count is a length cue. */
const MAX_KEY_TO_MEAN_DISTRACTOR_WORDS = 1.25;
/** Share of a bank's items on which the key may be the strictly longest
 *  option. Chance with four options is 25%. */
const MAX_LONGEST_KEY_SHARE = 0.3;

const POST_STEM_CUES = [
  /using your understanding/i,
  /using the [^.?]*framework/i,
  /applying what you/i,
  /applying the /i,
  /from the program/i,
];

// Competency names are matched case-sensitively, since "description" is
// an ordinary word; the rest match in any case.
const PROGRAM_TERMS = [
  { label: 'token', re: /token/i },
  { label: 'context window', re: /context window/i },
  { label: 'next-token', re: /next-token/i },
  { label: 'temperature', re: /temperature/i },
  { label: 'augmentation', re: /augmentation/i },
  { label: 'automation', re: /automation/i },
  { label: 'Description', re: /Description/ },
  { label: 'Discernment', re: /Discernment/ },
  { label: 'verification burden', re: /verification burden/i },
  { label: 'capability diagnosis', re: /capability diagnosis/i },
];

const ASTERISK_EMPHASIS = /(^|[\s(“"'])\*[^*\s][^*]*\*(?=[\s.,;:!?)”"']|$)/;

// ─── Parsing ───────────────────────────────────────────────────────────

const STRING_LITERAL = String.raw`'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|` + '`(?:[^`\\\\]|\\\\.)*`';

function unquote(literal) {
  return literal.slice(1, -1).replace(/\\(.)/g, '$1');
}

function firstString(segment, field) {
  const m = segment.match(new RegExp(`\\b${field}:\\s*(${STRING_LITERAL})`));
  return m ? unquote(m[1]) : null;
}

function allStrings(segment, field) {
  const re = new RegExp(`\\b${field}:\\s*(${STRING_LITERAL})`, 'g');
  return [...segment.matchAll(re)].map((m) => unquote(m[1]));
}

/** Split a bank file into item segments at each item id. */
function parseItems(source, idPattern, keyFlag) {
  const re = new RegExp(`\\bid:\\s*'(${idPattern})'`, 'g');
  const starts = [...source.matchAll(re)];
  return starts.map((m, i) => {
    const segment = source.slice(m.index, starts[i + 1]?.index ?? source.length);
    const optionRe = new RegExp(
      `\\bid:\\s*'([A-Da-d])'[\\s\\S]*?\\btext:\\s*(${STRING_LITERAL}|\\()[\\s\\S]*?\\b${keyFlag}:\\s*(true|false)`,
      'g',
    );
    const options = [...segment.matchAll(optionRe)].map((o) => ({
      id: o[1],
      text: o[2] === '(' ? null : unquote(o[2]),
      isKey: o[3] === 'true',
    }));
    return {
      id: m[1],
      stem: firstString(segment, 'stem'),
      constructKey: firstString(segment, 'constructKey'),
      parallelPreId: firstString(segment, 'parallelPreId'),
      feedback: allStrings(segment, 'feedbackText'),
      options,
    };
  });
}

const words = (text) => text.trim().split(/\s+/).length;

// ─── Banks ─────────────────────────────────────────────────────────────

const kcFiles = readdirSync('src/modules')
  .filter((d) => /^module\d$/.test(d))
  .map((d) => join('src/modules', d, 'knowledge-check-items.tsx'));

const BANKS = [
  { name: 'pre', files: ['src/data/pre-assessment.ts'], idPattern: 'PRE-\\d+', keyFlag: 'isCorrect', minOptions: 4, strictLength: true, header: true },
  { name: 'post', files: ['src/data/post-assessment.ts'], idPattern: 'POST-\\d+', keyFlag: 'isCorrect', minOptions: 4, strictLength: true, header: true, stemRules: true },
  { name: 'knowledge checks', files: kcFiles, idPattern: 'kc_\\d+_\\d+', keyFlag: 'isPreferred', minOptions: 3, strictLength: false },
  { name: 'interpretation checks', files: ['src/modules/module1/interpretation-check-items.ts'], idPattern: 'ic_\\d+_\\d+', keyFlag: 'isPreferred', minOptions: 3, strictLength: false },
];

const errors = [];
const warnings = [];
const banks = {};

for (const bank of BANKS) {
  const sources = bank.files.map((f) => readFileSync(f, 'utf8'));
  const items = sources.flatMap((src) => parseItems(src, bank.idPattern, bank.keyFlag));
  banks[bank.name] = items;
  const lengthIssue = (msg) => (bank.strictLength ? errors : warnings).push(msg);
  let keyLongest = 0;
  const distribution = { A: 0, B: 0, C: 0, D: 0 };

  for (const item of items) {
    const where = `${bank.name} ${item.id}`;
    const keys = item.options.filter((o) => o.isKey);
    if (item.options.length < bank.minOptions) errors.push(`${where}: expected at least ${bank.minOptions} options, found ${item.options.length}`);
    if (keys.length !== 1) {
      errors.push(`${where}: expected exactly one key, found ${keys.length}`);
      continue;
    }
    const key = keys[0];
    distribution[key.id.toUpperCase()] += 1;

    for (const text of [...item.feedback, ...item.options.map((o) => o.text ?? '')]) {
      if (ASTERISK_EMPHASIS.test(text)) {
        errors.push(`${where}: literal *asterisk emphasis* in "${text.match(ASTERISK_EMPHASIS)[0].trim()}"`);
      }
    }

    if (item.options.some((o) => o.text == null)) {
      warnings.push(`${where}: an option's text is not a string literal; length checks skipped`);
      continue;
    }
    const distractors = item.options.filter((o) => !o.isKey);
    const longestDistractor = Math.max(...distractors.map((o) => o.text.length));
    if (key.text.length > longestDistractor) keyLongest += 1;
    const ratio = key.text.length / longestDistractor;
    if (ratio > MAX_KEY_TO_LONGEST_DISTRACTOR) {
      lengthIssue(`${where}: key is ${Math.round((ratio - 1) * 100)}% longer than the longest distractor (${key.text.length} vs ${longestDistractor} characters)`);
    }
    const meanDistractorWords = distractors.reduce((a, o) => a + words(o.text), 0) / distractors.length;
    const wordRatio = words(key.text) / meanDistractorWords;
    if (wordRatio > MAX_KEY_TO_MEAN_DISTRACTOR_WORDS) {
      lengthIssue(`${where}: key runs ${words(key.text)} words against a ${meanDistractorWords.toFixed(0)}-word distractor mean (${wordRatio.toFixed(2)}x)`);
    }

    if (bank.stemRules && item.stem) {
      for (const cue of POST_STEM_CUES) {
        if (cue.test(item.stem)) errors.push(`${where}: stem names the concept under test ("${item.stem.match(cue)[0]}")`);
      }
      for (const term of PROGRAM_TERMS) {
        if (term.re.test(item.stem) && term.re.test(key.text) && !distractors.some((d) => term.re.test(d.text))) {
          errors.push(`${where}: program term "${term.label}" appears in the stem and the key but in no distractor`);
        }
      }
    }
  }

  const share = items.length === 0 ? 0 : keyLongest / items.length;
  const shareMsg = `${bank.name}: the key is the longest option on ${keyLongest} of ${items.length} items (${Math.round(share * 100)}%; limit ${Math.round(MAX_LONGEST_KEY_SHARE * 100)}%)`;
  if (share > MAX_LONGEST_KEY_SHARE) lengthIssue(shareMsg);
  bank.summary = shareMsg;

  if (bank.header) {
    const m = sources[0].match(/Answer key distribution: A=(\d+), B=(\d+), C=(\d+), D=(\d+)\./);
    const actual = `A=${distribution.A}, B=${distribution.B}, C=${distribution.C}, D=${distribution.D}`;
    if (!m) errors.push(`${bank.name}: file header has no "Answer key distribution" line`);
    else if (`A=${m[1]}, B=${m[2]}, C=${m[3]}, D=${m[4]}` !== actual) {
      errors.push(`${bank.name}: header says A=${m[1]}, B=${m[2]}, C=${m[3]}, D=${m[4]} but the keys are ${actual}`);
    }
  }
}

// Every post item must pair with a pre item on the same construct.
const preById = new Map(banks.pre.map((it) => [it.id, it]));
for (const post of banks.post) {
  const pre = preById.get(post.parallelPreId ?? '');
  if (!pre) errors.push(`post ${post.id}: parallelPreId ${post.parallelPreId} has no pre item`);
  else if (pre.constructKey !== post.constructKey) {
    errors.push(`post ${post.id}: constructKey ${post.constructKey} does not match ${pre.id} (${pre.constructKey})`);
  }
}
if (banks.pre.length !== banks.post.length) {
  errors.push(`pre has ${banks.pre.length} items but post has ${banks.post.length}`);
}

// ─── Report ────────────────────────────────────────────────────────────

for (const bank of BANKS) console.log(bank.summary);
if (warnings.length > 0) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  warn  ${w}`);
}
if (errors.length > 0) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  error ${e}`);
  process.exit(1);
}
console.log('\nItem-balance check passed.');
