// AssessmentItem — single-item presentation for pre/post assessments.
// Differs from the KnowledgeCheck component in three ways:
//   1. NO post-submit feedback shown (responses are silent during the
//      assessment; feedback lives in the post-assessment results view).
//   2. The "Submit" button is replaced by a "Next" or "See results"
//      affordance controlled by the parent AssessmentPage — this
//      component just bubbles the selection up.
//   3. Stems may contain blank-line-separated paragraphs and numbered
//      lists; rendered via the shared `render-markdown-lite` helper.

import { useEffect, useRef } from 'react';
import type { AssessmentItem as AssessmentItemData } from '../../data/pre-assessment';
import { renderMarkdownLite } from '../../modules/module4/render-markdown-lite';
import { Overline } from '../shared/Overline';

const ASSESSMENT_ACCENT = '#5E7080'; // matches the discernment color family

interface AssessmentItemProps {
  item: AssessmentItemData;
  /** The option the learner has currently selected for THIS item (or null). */
  selectedOptionId: 'A' | 'B' | 'C' | 'D' | null;
  /** Bubble up a selection. Parent persists when the learner clicks Next. */
  onSelect: (optionId: 'A' | 'B' | 'C' | 'D') => void;
}

export function AssessmentItem({
  item,
  selectedOptionId,
  onSelect,
}: AssessmentItemProps): JSX.Element {
  // Move keyboard focus to the question stem when the item mounts (each
  // item is a distinct render — parent keys on `item.id` to force a
  // remount, which re-runs this effect). Same accessibility pattern as
  // SectionContainer's heading focus.
  const stemRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    stemRef.current?.focus({ preventScroll: true });
  }, [item.id]);

  return (
    <section
      aria-labelledby={`item-${item.id}-stem`}
      className="rounded-lg bg-[rgb(var(--white))]"
      style={{
        borderLeft: `3px solid ${ASSESSMENT_ACCENT}`,
        border: '1px solid rgb(var(--border))',
        borderLeftWidth: 3,
        borderLeftColor: ASSESSMENT_ACCENT,
        padding: '22px 24px 20px',
        // `minWidth: 0` so the card respects its grid column on mobile
        // even when a long unbreakable token appears in an option.
        minWidth: 0,
      }}
    >
      <div className="mb-3 flex flex-wrap items-baseline gap-2">
        <Overline style={{ color: ASSESSMENT_ACCENT }}>
          {item.construct}
        </Overline>
      </div>

      <h2
        id={`item-${item.id}-stem`}
        ref={stemRef}
        tabIndex={-1}
        className="m-0 mb-5 font-sans text-body font-semibold leading-snug text-ink focus:outline-none"
        // Stems carry markdown-lite (paragraphs + occasional numbered
        // list, see PRE-9 / POST-9). The renderer returns a fragment;
        // wrap in a <div> so the heading-styled type still applies.
      >
        <div style={{ overflowWrap: 'anywhere' }}>
          {renderMarkdownLite(item.stem)}
        </div>
      </h2>

      {/* Accessibility note: avoid `<legend className="sr-only">` here
          (it leaked into iOS document.scrollWidth and caused mobile
          horizontal pan). Use `aria-label` on the fieldset instead.
          Same pattern as KnowledgeCheck.tsx and InterpretationCheck.tsx. */}
      <fieldset className="m-0 border-0 p-0" aria-label="Choose the option that best matches your reasoning.">
        <ul className="m-0 list-none space-y-2 p-0">
          {item.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => onSelect(opt.id)}
                  aria-pressed={isSelected}
                  className="flex w-full items-start gap-3 rounded-md text-left transition-colors duration-150"
                  style={{
                    background: isSelected ? 'rgb(var(--surface))' : 'rgb(var(--white))',
                    // Border width and padding stay constant across states.
                    // Selected emphasis comes from a color change + an inset
                    // box-shadow that visually doubles the border to ~2px
                    // without affecting layout (box-shadow doesn't take
                    // space). The earlier 1px↔2px border + 16px↔15px padding
                    // swap was mathematically size-preserving at the start
                    // and end states, but sub-pixel rounding during the
                    // `transition-all` animation caused a visible 1px
                    // wobble in the option text. Reported by user as
                    // "selecting a choice causes the text to shift slightly."
                    border: `1px solid ${
                      isSelected ? ASSESSMENT_ACCENT : 'rgb(var(--border))'
                    }`,
                    padding: '12px 16px',
                    boxShadow: isSelected
                      ? `inset 0 0 0 1px ${ASSESSMENT_ACCENT}`
                      : 'none',
                    cursor: 'pointer',
                    minWidth: 0,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-block flex-shrink-0 rounded-full"
                    style={{
                      width: 18,
                      height: 18,
                      border: isSelected
                        ? `5px solid ${ASSESSMENT_ACCENT}`
                        : '1.5px solid rgb(var(--ghost))',
                      background: isSelected ? 'rgb(var(--white))' : 'transparent',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div className="flex min-w-0 flex-1 items-baseline gap-2">
                    <span
                      className="flex-shrink-0 font-mono text-[11px] font-bold uppercase text-tertiary"
                      style={{ letterSpacing: '0.1em' }}
                    >
                      {opt.id}.
                    </span>
                    <span
                      className="font-sans text-[14.5px] leading-[1.5] text-ink"
                      style={{ overflowWrap: 'anywhere' }}
                    >
                      {opt.text}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </section>
  );
}
