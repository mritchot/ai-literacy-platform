// AssessmentItem — single-item presentation for pre/post assessments.
// Differs from the KnowledgeCheck component in three ways:
//   1. NO post-submit feedback shown (responses are silent during the
//      assessment; feedback lives in the post-assessment results view).
//   2. The "Submit" button is replaced by a "Next" or "See results"
//      affordance controlled by the parent AssessmentPage — this
//      component just bubbles the selection up.
//   3. Stems may contain blank-line-separated paragraphs and numbered
//      lists; rendered via the shared `render-markdown-lite` helper.

import { useEffect, useRef, type KeyboardEvent } from 'react';
import type { AssessmentItem as AssessmentItemData } from '../../data/pre-assessment';
import { renderMarkdownLite } from '../shared/render-markdown-lite';
import { nextRadioIndex } from '../shared/radio-group-nav';

const ASSESSMENT_ACCENT = 'rgb(var(--discernment))'; // matches the discernment color family

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
      aria-labelledby={`item-${item.id}-heading`}
      aria-describedby={`item-${item.id}-stem`}
      className="bg-[rgb(var(--white))]"
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
      {/* Concise, visually-hidden heading (the focus target) — the full
          stem renders below as regular flow content. Stems carry
          markdown-lite paragraphs/lists (PRE-9 / POST-9), and block
          content inside a heading is invalid; a multi-paragraph
          scenario is also a terrible heading for SR navigation. */}
      <h2
        id={`item-${item.id}-heading`}
        ref={stemRef}
        tabIndex={-1}
        className="sr-only focus:outline-none"
      >
        Question {item.id.replace(/^(PRE|POST)-/, '')}
      </h2>
      <div
        id={`item-${item.id}-stem`}
        className="m-0 mb-5 font-sans text-body font-semibold leading-snug text-ink"
        style={{ overflowWrap: 'anywhere' }}
      >
        {renderMarkdownLite(item.stem)}
      </div>

      {/* Accessibility note: avoid `<legend className="sr-only">` here
          (it leaked into iOS document.scrollWidth and caused mobile
          horizontal pan). Use `aria-label` on the fieldset instead.
          Same pattern as KnowledgeCheck.tsx and InterpretationCheck.tsx. */}
      <fieldset className="m-0 border-0 p-0">
        {/* Radio semantics + roving tabindex — see KnowledgeCheck. */}
        <ul
          role="radiogroup"
          aria-label="Choose the option that best matches your reasoning."
          className="m-0 list-none space-y-2 p-0"
        >
          {item.options.map((opt, optIdx) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              // role="presentation": a radiogroup owns radios, not
              // listitems — the <li> is layout-only.
              <li key={opt.id} role="presentation">
                <button
                  type="button"
                  id={`item-${item.id}-opt-${opt.id}`}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={
                    isSelected || (selectedOptionId === null && optIdx === 0) ? 0 : -1
                  }
                  onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
                    const next = nextRadioIndex(e.key, optIdx, item.options.length);
                    if (next === null) return;
                    e.preventDefault();
                    const nextOpt = item.options[next];
                    if (!nextOpt) return;
                    onSelect(nextOpt.id);
                    document.getElementById(`item-${item.id}-opt-${nextOpt.id}`)?.focus();
                  }}
                  onClick={() => onSelect(opt.id)}
                  className="flex w-full items-start gap-3 text-left transition-colors duration-[160ms]"
                  style={{
                    background: isSelected ? 'rgb(var(--surface))' : 'rgb(var(--white))',
                    // Border width and padding stay constant across states.
                    // Selected emphasis comes from a color change + an inset
                    // box-shadow that visually doubles the border to ~2px
                    // without affecting layout (box-shadow doesn't take
                    // space). The earlier 1px↔2px border + 16px↔15px padding
                    // swap was mathematically size-preserving at the start
                    // and end states, but sub-pixel rounding during the
                    // unscoped property animation caused a visible 1px
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
                        : '1px solid rgb(var(--ghost))',
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
