// TokenChip — shared rendering for a single tokenized fragment.
// Used by both the S2 TokenComparisonDiagram and the S3 TokenizerPlayground.
//
// Visual convention (4C spec §7, §8.3):
// - Alternating colors at the chip-list level: odd index → surface bg /
//   ink text; even index → discernment-light bg / discernment-text text.
//   The pattern provides boundary clarity without using the 4D
//   competency colors (which carry semantic meaning the chips don't).
// - Leading whitespace renders as `⎵` and other invisible characters
//   become visible markers — pedagogically the point is to show the
//   model's representation of "invisible" content.

import type { CSSProperties } from 'react';

interface TokenChipProps {
  text: string;
  index: number;
  // When true, this chip animates in with a left-to-right stagger based
  // on its index (used during the P5 reveal sequence).
  animate?: boolean;
  // Extra style overrides — used for stagger delays.
  style?: CSSProperties;
}

const ODD = { bg: 'rgb(var(--surface))', fg: 'rgb(var(--ink))' };
const EVEN = { bg: '#E4EBF0', fg: '#354A57' }; // --discernment-light / --discernment-text

export function TokenChip({ text, index, animate = false, style }: TokenChipProps): JSX.Element {
  const palette = index % 2 === 0 ? ODD : EVEN;
  return (
    <li
      className="inline-flex items-center font-mono"
      style={{
        background: palette.bg,
        color: palette.fg,
        padding: '3px 6px',
        borderRadius: 4,
        fontSize: 13,
        margin: '3px',
        // Subtle border so chips read as bounded units even when the
        // background color is close to the page surface.
        border: '1px solid rgb(var(--border))',
        whiteSpace: 'pre',
        listStyle: 'none',
        // Stagger animation for P5: 60ms per chip (spec §8.3).
        animation: animate ? `tokenChipFadeIn 240ms ease-out both` : undefined,
        animationDelay: animate ? `${Math.min(index, 30) * 60}ms` : undefined,
        ...style,
      }}
    >
      {visualizeWhitespace(text)}
    </li>
  );
}

// Convert invisible characters to visible markers so the learner can see
// what the model actually receives.
function visualizeWhitespace(raw: string): string {
  let out = raw;
  // Newlines first — replace with a downward-arrow glyph.
  out = out.replace(/\n/g, '↵');
  // Tabs as `→` glyph.
  out = out.replace(/\t/g, '→');
  // Leading space → ⎵
  if (out.startsWith(' ')) {
    out = '⎵' + out.slice(1);
  }
  // Repeated runs of internal spaces remain as plain spaces (the
  // `whiteSpace: pre` style preserves them visually).
  return out;
}

// Renders a list of token strings as accessible <ol>/<li>. Used by
// TokenComparisonDiagram and TokenizerPlayground to keep chip rendering
// uniform across the module.
interface TokenChipListProps {
  tokens: string[];
  animate?: boolean;
  ariaLabel?: string;
}

export function TokenChipList({ tokens, animate = false, ariaLabel }: TokenChipListProps): JSX.Element {
  return (
    <>
      {animate && (
        <style>
          {`@keyframes tokenChipFadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }`}
        </style>
      )}
      <ol
        aria-label={ariaLabel ?? `${tokens.length} tokens`}
        className="m-0 flex flex-wrap items-center p-0"
        style={{ listStyle: 'none' }}
      >
        {tokens.map((t, i) => (
          <TokenChip key={`${i}-${t}`} text={t} index={i} animate={animate} />
        ))}
      </ol>
    </>
  );
}
