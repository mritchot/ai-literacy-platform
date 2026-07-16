// InterpretationCheck — Module 1 P1 inline interpretation gate (4C spec §3.3).
// Structurally similar to KnowledgeCheck, but renders inline within a data
// narrative flow with no overline header and a lighter visual treatment.
// On submit it locks the selection, reveals consequence-based feedback for
// the chosen option, surfaces the "best response" if the learner missed it,
// exposes a "See all responses" expandable, and fires `onSubmit` so the
// parent (DataNarrative) can lift the scroll-block on the next story.

import { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { scrollBehavior } from '../../utils/motion';
import { Icon } from './Icon';
import { nextRadioIndex } from './radio-group-nav';

type InterpretationCheckTone = 'success' | 'caution' | 'error';

interface InterpretationCheckOption {
  id: string;
  text: string;
  isPreferred: boolean;
  feedbackTitle: string;
  feedbackText: string;
  feedbackTone: InterpretationCheckTone;
}

export interface InterpretationCheckItemData {
  id: string;
  stem: ReactNode;
  options: InterpretationCheckOption[];
}

interface InterpretationCheckProps {
  moduleId: number;
  sectionId: number;
  item: InterpretationCheckItemData;
  // Fires *exactly once* on first submission. The parent narrative uses this
  // hook to release the scroll-block on the next story.
  onSubmitted?: (selectedOptionId: string) => void;
  trackingEvent?: string;
}

const TONE_BORDER: Record<InterpretationCheckTone, string> = {
  success: 'rgb(var(--success))',
  caution: 'rgb(var(--caution))',
  error: 'rgb(var(--error))',
};

const TONE_BG: Record<InterpretationCheckTone, string> = {
  success: 'rgb(var(--success-light))',
  caution: 'rgb(var(--caution-light))',
  error: 'rgb(var(--error-light))',
};

export const InterpretationCheck = forwardRef<HTMLDivElement, InterpretationCheckProps>(
  function InterpretationCheck(
    { moduleId, sectionId, item, onSubmitted, trackingEvent }: InterpretationCheckProps,
    ref,
  ): JSX.Element {
    const { recordKnowledgeCheck, getKnowledgeCheck } = useLearnerProgress();
    const { track } = useAnalytics();

    const stored = getKnowledgeCheck(moduleId, sectionId, item.id);
    const [selected, setSelected] = useState<string | null>(stored?.selectedOptionId ?? null);
    const [submitted, setSubmitted] = useState<boolean>(Boolean(stored));
    const [showAll, setShowAll] = useState<boolean>(false);

    // After submission, scroll the feedback callout into view so the
    // learner sees the result rather than being left at their pre-submit
    // scroll position. See KnowledgeCheck.tsx for the same pattern +
    // rationale; the IC has the same submit-then-reveal-feedback flow.
    const feedbackRef = useRef<HTMLDivElement | null>(null);
    const didJustSubmitRef = useRef(false);

    const submit = () => {
      if (!selected || submitted) return;
      const option = item.options.find((o) => o.id === selected);
      if (!option) return;
      recordKnowledgeCheck(moduleId, sectionId, item.id, {
        selectedOptionId: option.id,
        isPreferred: option.isPreferred,
        timestamp: Date.now(),
      });
      track({
        type: trackingEvent ?? `${item.id}_submitted`,
        moduleId,
        sectionId,
        payload: { optionId: option.id, isPreferred: option.isPreferred },
      });
      didJustSubmitRef.current = true;
      setSubmitted(true);
      onSubmitted?.(option.id);
    };

    useEffect(() => {
      if (submitted && didJustSubmitRef.current && feedbackRef.current) {
        didJustSubmitRef.current = false;
        feedbackRef.current.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
      }
    }, [submitted]);

    const selectedOption = item.options.find((o) => o.id === selected);
    const preferredOption = item.options.find((o) => o.isPreferred);

    return (
      <section
        ref={ref}
        aria-labelledby={`ic-${item.id}-stem`}
        style={{
          background: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))',
          padding: '18px 20px',
        }}
      >
        <div
          id={`ic-${item.id}-stem`}
          className="mb-4 font-sans text-body font-medium leading-snug text-ink"
        >
          {item.stem}
        </div>

        {/* Accessibility label is on the fieldset itself rather than in
            a `<legend className="sr-only">` child. The sr-only legend
            pattern (position:absolute + white-space:nowrap + width:1px
            + overflow:hidden) leaked ~326 px of unwrapped content width
            into iOS Safari's document.scrollWidth despite the visual
            being clipped — three of these on a single section (M1 S3's
            three interpretation checks) was enough to make the page
            rubber-band scrollable horizontally on mobile. Moving the
            label to aria-label on the parent fieldset removes the DOM
            node entirely with no accessibility loss; the fieldset's
            implicit role is "group" and aria-label is supported on
            groups. */}
        <fieldset disabled={submitted} className="m-0 border-0 p-0">
          {/* Radio semantics + roving tabindex — see KnowledgeCheck. */}
          <ul
            role="radiogroup"
            aria-label="Choose the response that best fits the data."
            className="m-0 list-none space-y-2 p-0"
          >
            {item.options.map((opt, optIdx) => {
              const isSelected = selected === opt.id;
              const isFeedbackBorder = submitted && isSelected;
              return (
                // role="presentation": a radiogroup owns radios, not
                // listitems — the <li> is layout-only.
                <li key={opt.id} role="presentation">
                  <button
                    type="button"
                    id={`ic-${item.id}-opt-${opt.id}`}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={isSelected || (selected === null && optIdx === 0) ? 0 : -1}
                    onKeyDown={(e) => {
                      const next = nextRadioIndex(e.key, optIdx, item.options.length);
                      if (next === null) return;
                      e.preventDefault();
                      const nextOpt = item.options[next];
                      if (!nextOpt) return;
                      setSelected(nextOpt.id);
                      document.getElementById(`ic-${item.id}-opt-${nextOpt.id}`)?.focus();
                    }}
                    onClick={() => !submitted && setSelected(opt.id)}
                    className="flex w-full items-start gap-3 text-left transition-colors duration-[160ms]"
                    style={{
                      background: 'rgb(var(--white))',
                      // Border width and padding stay constant across states.
                      // Selected / feedback emphasis comes from a color
                      // change + an inset box-shadow that visually doubles
                      // the border to ~2px without affecting layout. See
                      // AssessmentItem / KnowledgeCheck for the rationale —
                      // the earlier 1px↔2px border + padding swap caused
                      // sub-pixel content shifts during the transition.
                      border: `1px solid ${
                        isFeedbackBorder
                          ? TONE_BORDER[opt.feedbackTone]
                          : isSelected
                            ? 'rgb(var(--ink))'
                            : 'rgb(var(--border))'
                      }`,
                      padding: '12px 16px',
                      boxShadow: isFeedbackBorder
                        ? `inset 0 0 0 1px ${TONE_BORDER[opt.feedbackTone]}`
                        : isSelected
                          ? 'inset 0 0 0 1px rgb(var(--ink))'
                          : 'none',
                      cursor: submitted ? 'default' : 'pointer',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-block flex-shrink-0 rounded-full"
                      style={{
                        width: 16,
                        height: 16,
                        border: isSelected
                          ? '5px solid rgb(var(--ink))'
                          : '1px solid rgb(var(--ghost))',
                        background: isSelected ? 'rgb(var(--white))' : 'transparent',
                        boxSizing: 'border-box',
                      }}
                    />
                    <span className="flex-1 font-sans text-[14.5px] leading-[1.5] text-ink">
                      {opt.text}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        {!submitted && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={submit}
              disabled={!selected}
              aria-disabled={!selected}
              className="bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] dark:text-[rgb(var(--canvas))] transition-colors duration-[160ms] hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted"
            >
              Submit
            </button>
          </div>
        )}

        {/* Always-mounted live region — see KnowledgeCheck. */}
        <span aria-live="polite" className="sr-only">
          {submitted && selectedOption
            ? `${selectedOption.feedbackTitle}. ${selectedOption.feedbackText}`
            : ''}
        </span>

        {submitted && selectedOption && (
          <div
            ref={feedbackRef}
            className="mt-4 transition-opacity duration-200"
            style={{
              background: TONE_BG[selectedOption.feedbackTone],
              borderLeft: `3px solid ${TONE_BORDER[selectedOption.feedbackTone]}`,
              padding: '12px 14px',
            }}
          >
            <div
              className="mb-1 font-mono text-[10px] font-bold uppercase"
              style={{
                letterSpacing: '0.1em',
                color: TONE_BORDER[selectedOption.feedbackTone],
              }}
            >
              {selectedOption.feedbackTitle}
            </div>
            <div className="font-sans text-body-sm leading-relaxed text-body">
              {selectedOption.feedbackText}
            </div>
          </div>
        )}

        {submitted && preferredOption && !selectedOption?.isPreferred && (
          <div
            className="mt-3 transition-opacity duration-200"
            style={{
              background: 'rgb(var(--success-light))',
              borderLeft: `3px solid rgb(var(--success))`,
              padding: '12px 14px',
            }}
          >
            <div
              className="mb-1 font-mono text-[10px] font-bold uppercase"
              style={{ letterSpacing: '0.1em', color: 'rgb(var(--success))' }}
            >
              ★ Best response
            </div>
            <div className="mb-1 font-sans text-body-sm font-semibold text-ink">
              {preferredOption.text}
            </div>
            <div className="font-sans text-body-sm leading-relaxed text-body">
              {preferredOption.feedbackText}
            </div>
          </div>
        )}

        {submitted && (
          <div className="mt-3 border-t border-border-light pt-3">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              className="inline-flex items-center gap-1.5 font-sans text-[12.5px] font-semibold text-action hover:text-action-hover"
            >
              <Icon name={showAll ? 'chevronDown' : 'chevronRight'} size={14} />
              {showAll ? 'Hide all responses' : 'See all responses'}
            </button>
            {showAll && (
              <ul className="section-enter mt-3 space-y-2 list-none p-0">
                {item.options.map((opt) => (
                  <li
                    key={`all-${opt.id}`}
                    style={{
                      background: 'rgb(var(--white))',
                      border: '1px solid rgb(var(--border-light))',
                      borderLeft: `3px solid ${TONE_BORDER[opt.feedbackTone]}`,
                      padding: '10px 12px',
                    }}
                  >
                    <div
                      className="mb-1 font-mono text-[10px] font-bold uppercase"
                      style={{
                        letterSpacing: '0.1em',
                        color: TONE_BORDER[opt.feedbackTone],
                      }}
                    >
                      Option {opt.id.toUpperCase()} · {opt.feedbackTitle}
                    </div>
                    <div className="mb-1 font-sans text-[13.5px] font-semibold text-ink">
                      {opt.text}
                    </div>
                    <div className="font-sans text-body-sm leading-relaxed text-body">
                      {opt.feedbackText}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    );
  },
);
