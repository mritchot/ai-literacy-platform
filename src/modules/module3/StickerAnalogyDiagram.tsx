// S2 StickerAnalogyDiagram — static visual anchor for the token
// vocabulary introduced in the surrounding body text. The diagram has
// three layers, top to bottom:
//
//   1. A "vocabulary strip" showing a small sample of the model's
//      ~100,000 cl100k_base tokens (mix of whole-word and sub-word).
//   2. A common-text example: "quarterly report" → 2 tokens.
//   3. An uncommon-text example: "Schwarzenegger" → 5 tokens.
//
// The two examples sit visually in parallel so the contrast (one
// token per word vs. many tokens to spell one word) is the first
// thing the reader notices.
//
// All token boundaries are verified cl100k_base output — same tokenizer
// powering the S3 TokenizerPlayground. Verified via gpt-tokenizer:
//   encode(' quarterly report') → [' quarterly', ' report']
//   encode('Schwarzenegger')    → ['Sch', 'war', 'zen', 'eg', 'ger']
// If the vocabulary changes upstream, regenerate these constants.
//
// The component reuses TokenChip so chip styling (mono font, alternating
// surface/discernment-light backgrounds, ⎵ whitespace visualization,
// thin border) stays consistent with TokenComparisonDiagram and the
// TokenizerPlayground. All colors come from CSS variables, so dark mode
// flips automatically through the design-token system.
//
// No interactivity. Static visual, ~280px tall.

import { TokenChip } from './TokenChip';

// Sample slice of cl100k_base vocabulary — every entry is a real token.
// Mix of common whole-word tokens (with leading spaces, as they'd appear
// mid-sentence) and the sub-word fragments that make up "Schwarzenegger"
// in the uncommon example below.
const VOCABULARY_SAMPLE: string[] = [
  'the',
  ' report',
  ' revenue',
  ' quarterly',
  ' is',
  '.',
  '127',
  'Sch',
  'war',
  'zen',
  'eg',
  'ger',
];

const COMMON_EXAMPLE = {
  text: 'quarterly report',
  tokens: [' quarterly', ' report'],
};

// "Schwarzenegger" was selected over the prompt's suggested "Kuznetsova"
// after verifying cl100k_base output: Kuznetsova → 5 tokens including a
// single-character "K", which reads as visual noise. Schwarzenegger
// produces a clean 5-piece split with no single-character fragments.
const UNCOMMON_EXAMPLE = {
  text: 'Schwarzenegger',
  tokens: ['Sch', 'war', 'zen', 'eg', 'ger'],
};

export function StickerAnalogyDiagram(): JSX.Element {
  return (
    <figure
      className="m-0 rounded-lg"
      aria-label="How a fixed vocabulary of tokens covers different text"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        overflow: 'hidden',
        padding: '16px 18px',
      }}
    >
      {/* Layer 1 — vocabulary strip */}
      <div
        className="font-mono text-caption text-tertiary"
        style={{ letterSpacing: '0.02em', marginBottom: 6 }}
      >
        A small sample from the model&apos;s ~100,000 tokens
      </div>
      <ol
        aria-label="Sample vocabulary tokens"
        className="m-0 flex flex-wrap items-center p-0"
        style={{ listStyle: 'none' }}
      >
        {VOCABULARY_SAMPLE.map((t, i) => (
          <TokenChip key={`vocab-${i}`} text={t} index={i} />
        ))}
      </ol>

      {/* Divider — full-width, extends past the figure's horizontal
          padding so it reads as a structural break between the
          vocabulary strip and the examples below. */}
      <div
        aria-hidden="true"
        style={{
          borderTop: '1px solid rgb(var(--border-light))',
          margin: '14px -18px',
        }}
      />

      {/* Layer 2 — common-text example */}
      <ExampleRow
        text={COMMON_EXAMPLE.text}
        tokens={COMMON_EXAMPLE.tokens}
        label="Common English: one token per word"
      />

      {/* Inner divider between the two examples — dashed so it reads as
          "these are parallel cases" rather than as a hard section
          break. */}
      <div
        aria-hidden="true"
        style={{
          borderTop: '1px dashed rgb(var(--border-light))',
          margin: '12px 0',
        }}
      />

      {/* Layer 3 — uncommon-text example */}
      <ExampleRow
        text={UNCOMMON_EXAMPLE.text}
        tokens={UNCOMMON_EXAMPLE.tokens}
        label="Uncommon text: many tokens to spell it out"
      />

      <figcaption
        className="mt-3 font-mono text-caption text-muted"
        style={{ letterSpacing: '0.02em' }}
      >
        A real model&apos;s vocabulary contains roughly 100,000 tokens built from the most common
        text patterns in its training data. The examples above use actual token boundaries from
        the cl100k_base tokenizer.
      </figcaption>
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ExampleRow — text in → arrow → token chips out, on a single grid row.
// Both examples use this same layout so the visual parallelism (one
// token per word vs. many tokens to spell one word) reads at a
// glance.
// ─────────────────────────────────────────────────────────────────────

function ExampleRow({
  text,
  tokens,
  label,
}: {
  text: string;
  tokens: string[];
  label: string;
}): JSX.Element {
  return (
    <>
      <div className="mb-2 font-sans text-body-sm font-semibold text-secondary">{label}</div>
      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: 'minmax(0, auto) auto minmax(0, 1fr)',
          gap: 12,
        }}
      >
        {/* Left — what you type. Same surface/border treatment as the
            "What you type" input box inside TokenComparisonDiagram's
            ComparisonPanel, so the two diagrams visually rhyme. */}
        <div
          className="rounded-md font-sans text-body text-ink"
          style={{
            background: 'rgb(var(--surface-warm))',
            border: '1px solid rgb(var(--border-light))',
            padding: '6px 12px',
            justifySelf: 'start',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </div>

        {/* Arrow connector — simple Unicode glyph, aria-hidden because
            the grid layout itself conveys the relationship and the row
            label above already names the transformation. */}
        <div
          aria-hidden="true"
          className="font-mono text-tertiary"
          style={{ fontSize: 20, lineHeight: 1 }}
        >
          →
        </div>

        {/* Right — the token chips. Reuses TokenChip so the chips look
            identical to those in TokenComparisonDiagram below. */}
        <ol
          aria-label={`${tokens.length} tokens for "${text}"`}
          className="m-0 flex flex-wrap items-center p-0"
          style={{ listStyle: 'none' }}
        >
          {tokens.map((t, i) => (
            <TokenChip key={`${label}-${i}`} text={t} index={i} />
          ))}
        </ol>
      </div>
    </>
  );
}
