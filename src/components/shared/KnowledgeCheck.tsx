// KnowledgeCheck — shared component for Tier-1 knowledge check items.
// Consequence-based feedback: each option carries its own framing (best
// response, partial, misidentifies, etc.). Stem may include arbitrary JSX
// for the KC-2.2 inline data table case.

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { scrollBehavior } from '../../utils/motion';
import { Icon } from './Icon';
import { nextRadioIndex } from './radio-group-nav';
import { Overline } from './Overline';

type KnowledgeCheckTone = 'success' | 'caution' | 'error';

const TIER1 = '#A0AEB8';
// Selected-option stroke. TIER1 (#A0AEB8) is ~2.2:1 on white — below the
// 3:1 non-text minimum the unselected ring was already fixed to meet —
// so the selected border/ring/dot use the theme-aware slate --info token
// instead; TIER1 remains as the decorative card accent only.
const SELECTED_STROKE = 'rgb(var(--info))';

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

  // Ref to the post-submit feedback callout. After submission we scroll
  // it into view so the learner isn't left at their pre-submit scroll
  // position wondering where the result went — particularly important
  // on mobile where the feedback can appear well below the fold once
  // the option button itself has expanded with its feedback border.
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  // Distinguish "just submitted in this session" from "submitted in a
  // prior session and re-mounted with stored state." We only want the
  // auto-scroll for the former — re-mounts shouldn't yank the page.
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
      type: `${item.id}_submitted`,
      moduleId,
      sectionId,
      payload: { optionId: option.id, isPreferred: option.isPreferred },
    });
    didJustSubmitRef.current = true;
    setSubmitted(true);
    onSubmitted?.();
  };

  // Scroll the freshly-rendered feedback into view after submission.
  // Runs after React commits the new DOM (so `feedbackRef.current` is
  // attached). `block: 'nearest'` is non-disruptive — only scrolls if
  // the feedback isn't already fully visible.
  useEffect(() => {
    if (submitted && didJustSubmitRef.current && feedbackRef.current) {
      didJustSubmitRef.current = false;
      feedbackRef.current.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
    }
  }, [submitted]);

  const onRadioKey = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const next = nextRadioIndex(e.key, idx, item.options.length);
    if (next === null) return;
    e.preventDefault();
    const opt = item.options[next];
    if (!opt) return;
    setSelected(opt.id);
    document.getElementById(`kc-${item.id}-opt-${opt.id}`)?.focus();
  };

  const selectedOption = item.options.find((o) => o.id === selected);
  const preferredOption = item.options.find((o) => o.isPreferred);

  return (
    <section
      aria-labelledby={`kc-${item.id}-stem`}
      className="bg-[rgb(var(--white))]"
      style={{
        borderLeft: `3px solid ${TIER1}`,
        border: '1px solid rgb(var(--border))',
        borderLeftWidth: 3,
        borderLeftColor: TIER1,
        padding: '22px 24px 20px',
      }}
    >
      {/* On mobile the two Overlines stack onto their own lines so each
          can use the full row width — the original justify-between
          flex split forced each Overline to fit in roughly half the
          viewport, which wrapped both mid-content with dangling bullet
          separators ("...· TIER 1" / "· RECALL" on the left; "ITEM 1
          OF 4 ·" / "OBJ. 1.1" on the right). At sm: and above the
          original side-by-side layout is restored. */}
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
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
      <fieldset disabled={submitted} className="m-0 border-0 p-0">
        {/* Real radio semantics: mutually exclusive options announced as
            "x of y" with roving tabindex + arrow keys (APG pattern) —
            these were aria-pressed toggle buttons before, which never
            told SR users that selecting one deselects the others. */}
        <ul
          role="radiogroup"
          aria-label="Choose the response that best applies the module framework."
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
                  id={`kc-${item.id}-opt-${opt.id}`}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isSelected || (selected === null && optIdx === 0) ? 0 : -1}
                  onKeyDown={(e) => onRadioKey(e, optIdx)}
                  onClick={() => !submitted && setSelected(opt.id)}
                  className="flex w-full items-start gap-3 text-left transition-colors duration-[160ms]"
                  style={{
                    background: isSelected ? 'rgb(var(--surface))' : 'rgb(var(--white))',
                    // Border width and padding stay constant across states.
                    // Selected / feedback emphasis comes from a color change
                    // + an inset box-shadow that visually doubles the border
                    // to ~2px without affecting layout. The earlier 1px↔2px
                    // border + 16px↔15px padding swap was math-correct at
                    // start and end states but sub-pixel rounding during
                    // the transition caused the option text to wobble by a
                    // pixel on click.
                    border: `1px solid ${
                      isFeedbackBorder
                        ? TONE_BORDER[opt.feedbackTone]
                        : isSelected
                          ? SELECTED_STROKE
                          : 'rgb(var(--border))'
                    }`,
                    padding: '12px 16px',
                    boxShadow: isFeedbackBorder
                      ? `inset 0 0 0 1px ${TONE_BORDER[opt.feedbackTone]}`
                      : isSelected
                        ? `inset 0 0 0 1px ${SELECTED_STROKE}`
                        : 'none',
                    cursor: submitted ? 'default' : 'pointer',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-block flex-shrink-0 rounded-full"
                    style={{
                      width: 18,
                      height: 18,
                      border: isSelected ? `5px solid ${SELECTED_STROKE}` : '1px solid rgb(var(--ghost))',
                      background: isSelected ? 'rgb(var(--white))' : 'transparent',
                      boxSizing: 'border-box',
                    }}
                  />
                  {/* Text + recommended badge layout switches by
                      viewport. On mobile the inner container is
                      `flex-col` so the badge drops onto its own line
                      below the option text (right-aligned), giving the
                      text full row width instead of competing with the
                      badge for the limited mobile width (which would
                      otherwise compress the text into a narrow column
                      and visually orphan the badge). On `sm:` (≥768 px)
                      it's `flex-row` with the badge inline to the
                      right, matching the original desktop layout. */}
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                    <span className="font-sans text-[14.5px] leading-[1.5] text-ink sm:flex-1">
                      {opt.text}
                    </span>
                    {opt.isPreferred && submitted && (
                      <span
                        title="Recommended answer"
                        className="self-end flex-shrink-0 font-mono text-[9.5px] font-bold uppercase sm:self-auto"
                        style={{
                          color: 'rgb(var(--action))',
                          border: '1px solid rgb(var(--action))',
                          padding: '3px 8px',
                          letterSpacing: '0.1em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Recommended
                      </span>
                    )}
                  </div>
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
            Submit response
          </button>
        </div>
      )}

      {/* Always-mounted live region: content injected on submit is
          reliably announced (a region that mounts together with its
          content often isn't). The visual callout below is separate. */}
      <span aria-live="polite" className="sr-only">
        {submitted && selectedOption
          ? `${selectedOption.feedbackTitle}. ${selectedOption.feedbackText}`
          : ''}
      </span>

      {submitted && selectedOption && (
        <div
          ref={feedbackRef}
          className="mt-4"
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
          className="mt-3"
          style={{
            background: 'rgb(var(--success-light))',
            borderLeft: `3px solid rgb(var(--success))`,
            padding: '14px 16px',
          }}
        >
          <Overline className="mb-1.5" style={{ color: 'rgb(var(--success))' }}>
            Recommended response
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
