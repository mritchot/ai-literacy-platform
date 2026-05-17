// KnowledgeCheck — shared component for Tier-1 knowledge check items.
// Consequence-based feedback: each option carries its own framing (best
// response, partial, misidentifies, etc.). Stem may include arbitrary JSX
// for the KC-2.2 inline data table case.

import { useState, type ReactNode } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { Icon } from './Icon';
import { Overline } from './Overline';

type KnowledgeCheckTone = 'success' | 'caution' | 'error';

const TIER1 = '#A0AEB8';

interface KnowledgeCheckOption {
  id: string;
  text: string;
  isPreferred: boolean;
  feedbackTitle: string;
  feedbackText: string;
  feedbackTone: KnowledgeCheckTone;
}

export interface KnowledgeCheckItemData {
  id: string;
  objectiveRef: string;
  stem: ReactNode;
  options: KnowledgeCheckOption[];
}

interface KnowledgeCheckProps {
  moduleId: number;
  sectionId: number;
  item: KnowledgeCheckItemData;
  itemNumber: number;
  totalItems: number;
  onSubmitted?: () => void;
}

const TONE_BORDER: Record<KnowledgeCheckTone, string> = {
  success: 'rgb(var(--success))',
  caution: 'rgb(var(--caution))',
  error: 'rgb(var(--error))',
};

const TONE_BG: Record<KnowledgeCheckTone, string> = {
  success: 'rgb(var(--success-light))',
  caution: 'rgb(var(--caution-light))',
  error: 'rgb(var(--error-light))',
};

export function KnowledgeCheck({
  moduleId,
  sectionId,
  item,
  itemNumber,
  totalItems,
  onSubmitted,
}: KnowledgeCheckProps): JSX.Element {
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
      type: `${item.id}_submitted`,
      moduleId,
      sectionId,
      payload: { optionId: option.id, isPreferred: option.isPreferred },
    });
    setSubmitted(true);
    onSubmitted?.();
  };

  const selectedOption = item.options.find((o) => o.id === selected);
  const preferredOption = item.options.find((o) => o.isPreferred);

  return (
    <section
      aria-labelledby={`kc-${item.id}-stem`}
      className="rounded-lg bg-[rgb(var(--white))]"
      style={{
        borderLeft: `3px solid ${TIER1}`,
        border: '1px solid rgb(var(--border))',
        borderLeftWidth: 3,
        borderLeftColor: TIER1,
        padding: '22px 24px 20px',
      }}
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        {/* `--info` (blue-family feedback token) keeps the slate-blue
            tier intent while flipping correctly for dark mode — the
            previous hardcoded #4A5A66 stayed dark and went near-
            invisible on the dark card surface. */}
        <Overline style={{ color: 'rgb(var(--info))' }}>
          Knowledge check · Tier 1 · Recall
        </Overline>
        <Overline style={{ color: 'rgb(var(--muted))' }}>
          Item {itemNumber} of {totalItems} · Obj. {item.objectiveRef}
        </Overline>
      </div>

      <div
        id={`kc-${item.id}-stem`}
        className="mb-4 font-sans text-body font-semibold leading-snug text-ink"
      >
        {item.stem}
      </div>

      {/* Accessibility label is on the fieldset as aria-label rather
          than in a <legend className="sr-only"> child — see
          InterpretationCheck.tsx for the full rationale (the sr-only
          legend pattern leaked into iOS document.scrollWidth and made
          pages with multiple checks horizontally pannable on mobile). */}
      <fieldset
        disabled={submitted}
        className="m-0 border-0 p-0"
        aria-label="Choose the response that best applies the module framework."
      >
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
                    background: isSelected ? 'rgb(var(--surface))' : 'rgb(var(--white))',
                    border: isFeedbackBorder
                      ? `2px solid ${TONE_BORDER[opt.feedbackTone]}`
                      : isSelected
                        ? `2px solid ${TIER1}`
                        : '1px solid rgb(var(--border))',
                    padding: isSelected || isFeedbackBorder ? '11px 15px' : '12px 16px',
                    cursor: submitted ? 'default' : 'pointer',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-block flex-shrink-0 rounded-full"
                    style={{
                      width: 18,
                      height: 18,
                      border: isSelected ? `5px solid ${TIER1}` : '1.5px solid rgb(var(--ghost))',
                      background: isSelected ? 'rgb(var(--white))' : 'transparent',
                      boxSizing: 'border-box',
                    }}
                  />
                  <span className="flex-1 font-sans text-[14.5px] leading-[1.5] text-ink">
                    {opt.text}
                  </span>
                  {opt.isPreferred && submitted && (
                    <span
                      title="Recommended answer"
                      className="flex-shrink-0 rounded-full font-mono text-[9.5px] font-bold uppercase"
                      style={{
                        color: 'rgb(var(--action))',
                        border: '1px solid rgb(var(--action))',
                        padding: '3px 8px',
                        letterSpacing: '0.1em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ★ Recommended
                    </span>
                  )}
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
            Submit response
          </button>
        </div>
      )}

      {submitted && selectedOption && (
        <div
          aria-live="polite"
          className="mt-4 rounded-md"
          style={{
            background: TONE_BG[selectedOption.feedbackTone],
            borderLeft: `3px solid ${TONE_BORDER[selectedOption.feedbackTone]}`,
            padding: '14px 16px',
          }}
        >
          <Overline className="mb-1.5">{selectedOption.feedbackTitle}</Overline>
          <div className="font-sans text-body-sm leading-relaxed text-body">
            {selectedOption.feedbackText}
          </div>
        </div>
      )}

      {submitted && preferredOption && !selectedOption?.isPreferred && (
        <div
          className="mt-3 rounded-md"
          style={{
            background: 'rgb(var(--success-light))',
            borderLeft: `3px solid rgb(var(--success))`,
            padding: '14px 16px',
          }}
        >
          <Overline className="mb-1.5" style={{ color: 'rgb(var(--success))' }}>
            ★ Recommended response
          </Overline>
          <div className="mb-1.5 font-sans text-body-sm font-semibold text-ink">
            {preferredOption.text}
          </div>
          <div className="font-sans text-body-sm leading-relaxed text-body">
            {preferredOption.feedbackText}
          </div>
        </div>
      )}

      {submitted && (
        <div className="mt-4 border-t border-border-light pt-3">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
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
                    background: 'rgb(var(--surface))',
                    border: '1px solid rgb(var(--border-light))',
                    borderLeft: `3px solid ${TONE_BORDER[opt.feedbackTone]}`,
                    padding: '12px 14px',
                  }}
                >
                  <div className="mb-1 font-mono text-[10px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: TONE_BORDER[opt.feedbackTone] }}>
                    Option {opt.id.toUpperCase()} · {opt.feedbackTitle}
                  </div>
                  <div className="mb-1.5 font-sans text-[13.5px] font-semibold text-ink">
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
}
