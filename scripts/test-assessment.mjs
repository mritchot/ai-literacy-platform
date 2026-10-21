// Unit tests for the assessment scoring rules and the results code.
// Run with `npm test`. The repo has no test framework, so this bundles
// the TypeScript modules with esbuild (a devDependency pinned to the
// version Vite installs, so the lockfile resolves one copy) and runs them
// under node:test.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

async function load(entry) {
  const out = await build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    write: false,
    logLevel: 'silent',
  });
  const code = out.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

const scoring = await load('src/utils/assessment-scoring.ts');
const resultsCode = await load('src/utils/assessment-results-code.ts');
const { PRE_ASSESSMENT_ITEMS } = await load('src/data/pre-assessment.ts');
const { POST_ASSESSMENT_ITEMS } = await load('src/data/post-assessment.ts');
const instrument = await load('src/data/instrument-version.ts');

// A synthetic ten-construct form, so the acceptance cases read as written.
const pre10 = Array.from({ length: 10 }, (_, i) => ({
  id: `PRE-${i + 1}`,
  construct: `Construct ${i + 1}`,
  constructKey: `c${i + 1}`,
  block: 'usage',
}));
const post10 = pre10.map((p, i) => ({ ...p, id: `POST-${i + 1}`, parallelPreId: p.id }));

function responses(items, correctCount) {
  return Object.fromEntries(items.map((it, i) => [it.id, { isCorrect: i < correctCount }]));
}

function summary(preCorrect, postCorrect) {
  return scoring.summarizeGrowth(
    scoring.constructOutcomes(pre10, post10, responses(pre10, preCorrect), responses(post10, postCorrect)),
  );
}

test('a zero change from a strong baseline reads as held', () => {
  const s = summary(8, 8);
  assert.equal(s.change, 0);
  assert.equal(scoring.heldLabel(s), 'Strong baseline held');
  assert.equal(scoring.gainSentence(s), null);
});

test('a zero change from a low baseline reads as no change yet', () => {
  const s = summary(4, 4);
  assert.equal(scoring.readGrowth(s), 'held-stalled');
  assert.equal(scoring.heldLabel(s), 'No change yet');
});

test('normalized gain reports the share of the gap closed', () => {
  const s = summary(4, 6);
  assert.equal(s.change, 2);
  assert.equal(
    scoring.gainSentence(s),
    'You closed 33% of the gap between your baseline and a full score',
  );
});

test('a full baseline reports itself and keeps the drop', () => {
  const s = summary(10, 9);
  assert.equal(s.change, -1);
  assert.equal(s.normalizedGain, null);
  assert.equal(scoring.gainSentence(s), 'Full score at baseline');
});

test('a drop omits the gain sentence', () => {
  assert.equal(scoring.gainSentence(summary(6, 5)), null);
});

test('a ten-response pre record is scored against the twelve-item post like with like', () => {
  assert.equal(PRE_ASSESSMENT_ITEMS.length, 12);
  assert.equal(POST_ASSESSMENT_ITEMS.length, 12);
  const legacyIds = PRE_ASSESSMENT_ITEMS.slice(0, 10).map((it) => it.id);
  const pre = Object.fromEntries(legacyIds.map((id, i) => [id, { isCorrect: i < 6 }]));
  const post = Object.fromEntries(POST_ASSESSMENT_ITEMS.map((it) => [it.id, { isCorrect: true }]));
  const s = scoring.summarizeGrowth(
    scoring.constructOutcomes(PRE_ASSESSMENT_ITEMS, POST_ASSESSMENT_ITEMS, pre, post),
  );
  assert.equal(s.preCorrect, 6);
  assert.equal(s.preAnswered, 10);
  assert.equal(s.postCorrect, 12);
  assert.equal(s.postTotal, 12);
  assert.equal(s.compared, 10);
  assert.equal(s.change, 4, 'the two constructs missing from the baseline stay out of the change');
  assert.deepEqual(
    s.notInBaseline.map((o) => o.constructKey).sort(),
    ['disclosure-accountability', 'task-decomposition'],
  );
  const evaluation = scoring.blockOutcomes(
    scoring.constructOutcomes(PRE_ASSESSMENT_ITEMS, POST_ASSESSMENT_ITEMS, pre, post),
  ).find((b) => b.block === 'evaluation');
  assert.equal(evaluation.preAnswered, 2);
  assert.equal(evaluation.postTotal, 4);
});

test('a ten-response post record is scored over the items answered', () => {
  const legacyIds = POST_ASSESSMENT_ITEMS.slice(0, 10).map((it) => it.id);
  const pre = Object.fromEntries(PRE_ASSESSMENT_ITEMS.map((it) => [it.id, { isCorrect: false }]));
  const post = Object.fromEntries(legacyIds.map((id) => [id, { isCorrect: true }]));
  const s = scoring.summarizeGrowth(
    scoring.constructOutcomes(PRE_ASSESSMENT_ITEMS, POST_ASSESSMENT_ITEMS, pre, post),
  );
  assert.equal(s.postCorrect, 10);
  assert.equal(s.postAnswered, 10);
  assert.equal(s.compared, 10);
  assert.equal(s.change, 10);
});

test('with nothing answered on both forms, a zero change is not a strong baseline', () => {
  const s = scoring.summarizeGrowth(
    scoring.constructOutcomes(pre10, post10, {}, responses(post10, 7)),
  );
  assert.equal(s.compared, 0);
  assert.equal(scoring.readGrowth(s), 'held-stalled');
  assert.equal(scoring.gainSentence(s), null);
});

test('every post item pairs with a pre item on the same construct', () => {
  for (const post of POST_ASSESSMENT_ITEMS) {
    const pre = PRE_ASSESSMENT_ITEMS.find((p) => p.id === post.parallelPreId);
    assert.ok(pre, `${post.id} has no pre item`);
    assert.equal(pre.constructKey, post.constructKey);
  }
});

test('the results code round-trips through the parser', () => {
  const code = {
    preVersion: '2026.11',
    postVersion: '2026.11',
    preAnswers: 'BDACBADCBDCA',
    postAnswers: 'CABDACDBBADC',
    preMedianSeconds: 48,
    postMedianSeconds: 41,
    participantCode: 'ACME-0042',
  };
  const text = resultsCode.formatResultsCode(code);
  assert.equal(text, 'AIL|2026.11/2026.11|PRE:BDACBADCBDCA|POST:CABDACDBBADC|RT:48/41|ID:ACME-0042');
  assert.deepEqual(resultsCode.parseResultsCode(text), code);
});

test('a legacy pre form with missing items and no times round-trips', () => {
  const code = {
    preVersion: 'legacy',
    postVersion: '2026.11',
    preAnswers: 'BAADBCDCBB--',
    postAnswers: 'CABDACDBBADC',
    preMedianSeconds: null,
    postMedianSeconds: 37,
    participantCode: '',
  };
  assert.deepEqual(resultsCode.parseResultsCode(resultsCode.formatResultsCode(code)), code);
});

test('the parser rejects anything that is not a results code', () => {
  assert.equal(resultsCode.parseResultsCode('AIL|2026.11|PRE:AB'), null);
  assert.equal(resultsCode.parseResultsCode('hello'), null);
  assert.equal(
    resultsCode.parseResultsCode('AIL|2026.11/2026.11|PRE:AB|POST:CD|RT:1/2|ID:Jane Smith'),
    null,
  );
});

test('participant codes keep only safe characters', () => {
  assert.equal(resultsCode.sanitizeParticipantCode(' acme 0042 '), 'acme0042');
  assert.equal(resultsCode.sanitizeParticipantCode('a|b/c'), 'abc');
  assert.equal(resultsCode.sanitizeParticipantCode('x'.repeat(40)).length, 24);
});

test('response-time medians and form versions', () => {
  assert.equal(resultsCode.medianSeconds([]), null);
  assert.equal(resultsCode.medianSeconds([30_000, 10_000, 20_000]), 20);
  assert.equal(resultsCode.medianSeconds([10_000, 21_000]), 16);
  assert.equal(resultsCode.formVersion({}), 'legacy');
  assert.equal(resultsCode.formVersion({ a: {}, b: {} }), 'legacy');
  assert.equal(resultsCode.formVersion({ a: { instrumentVersion: '2026.11' } }), '2026.11');
  assert.equal(
    resultsCode.formVersion({ a: { instrumentVersion: '2026.11' }, b: {} }),
    'mixed',
  );
});

test('a record answered against an earlier item bank is flagged as revised', () => {
  const current = instrument.INSTRUMENT_VERSION;
  assert.equal(instrument.answeredBeforeRevision({}), false);
  assert.equal(instrument.answeredBeforeRevision({ a: { instrumentVersion: current } }), false);
  assert.equal(instrument.answeredBeforeRevision({ a: {} }), true);
  assert.equal(
    instrument.answeredBeforeRevision({ a: { instrumentVersion: current }, b: {} }),
    true,
  );
});
