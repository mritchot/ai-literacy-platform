// InterpretationCheck — Module 1 P1 inline interpretation gate (4C spec §3.3).
// Structurally similar to KnowledgeCheck, but renders inline within a data
// narrative flow with no overline header and a lighter visual treatment.
// On submit it locks the selection, reveals consequence-based feedback for
// the chosen option, surfaces the "best response" if the learner missed it,
// exposes a "See all responses" expandable, and fires `onSubmit` so the
// parent (DataNarrative) can lift the scroll-block on the next story.

import { forwardRef, useState, type ReactNode } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { Icon } from './Icon';

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
      setSubmitted(true);
      onSubmitted?.(option.id);
    };

    const selectedOption = item.options.find((o) => o.id === selected);
    const preferredOption = item.options.find((o) => o.isPreferred);

    return (
      <section
        ref={ref}
        aria-labelledby={`ic-${item.id}-stem`}
        className="rounded-md"
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

        <fieldset disabled={submitted} className="m-0 border-0 p-0">
          <legend className="sr-only">Choose the response that best fits the data.</legend>
          <ul className="m-0 list-none space-y-2 p-0">
            {item.options.map((opt) => {
              const isSelected = selected === opt.id;
              const isFeedbackBorder = submitted && isSelected;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => !submitted && setSelected(opt.id)}
                    aria-pressed={isSelected}
                    className="flex w-full items-start gap-3 rounded-md text-left transition-all duration-150"
                    style={{
                      background: 'rgb(var(--white))',
                      border: isFeedbackBorder
                        ? `2px solid ${TONE_BORDER[opt.feedbackTone]}`
                        : isSelected
                          ? '2px solid rgb(var(--ink))'
                          : '1px solid rgb(var(--border))',
                      padding: isSelected || isFeedbackBorder ? '11px 15px' : '12px 16px',
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
                          : '1.5px solid rgb(var(--ghost))',
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
              className="rounded-md bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] transition-colors duration-150 hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted"
            >
              Submit
            </button>
          </div>
        )}

        {submitted && selectedOption && (
          <div
            aria-live="polite"
            className="mt-4 rounded-md transition-opacity duration-200"
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
            className="mt-3 rounded-md transition-opacity duration-200"
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
                    className="rounded-md"
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
