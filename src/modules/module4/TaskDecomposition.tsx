// P8 TaskDecomposition — six-card categorization with consequence-based
// feedback (4B spec §4). Click-to-assign segmented controls (chosen over
// drag-and-drop for accessibility + zero-dependency rationale, spec §4.2).
// Persists assignments via LearnerProgressContext under
// `4.2.p8_card_N → { selectedOptionId: category, isPreferred }`.

import { useMemo, useState } from 'react';
import { BottleneckCallout } from '../../components/shared/BottleneckCallout';
import { Icon } from '../../components/shared/Icon';
import { Overline } from '../../components/shared/Overline';
import { R1Trigger } from '../../components/reference/R1Trigger';
import { R2Trigger } from '../../components/reference/R2Trigger';
import { ReferenceTabRail } from '../../components/reference/ReferenceTabRail';
import { ReflectionPrompt } from '../../components/shared/ReflectionPrompt';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { P8_CARDS, P8_REFLECTION, P8_SCENARIO, P8_SUMMARY, type P8Category, type TaskCard } from './module4-content';

const DELEGATION = '#6B7F5E';

function isP8Category(v: unknown): v is P8Category {
  return v === 'human' || v === 'assisted' || v === 'delegated';
}

const CATEGORY_LABELS: Record<P8Category, string> = {
  human: 'Human-Only',
  assisted: 'AI-Assisted',
  delegated: 'Fully Delegated',
};

const CATEGORY_DESCRIPTIONS: Record<P8Category, string> = {
  human: 'You perform this component yourself, without AI involvement.',
  assisted:
    'AI produces a draft or starting point; you actively shape, verify, and refine the output.',
  delegated: 'AI produces the final output; you perform only surface-level review before inclusion.',
};

// Per-category visual treatment for the segmented control's active state
// (spec §4.2 — Delegation olive / Description amber / Discernment blue-gray).
const CATEGORY_PALETTE: Record<P8Category, { bg: string; text: string; count: string }> = {
  human: { bg: '#E8EDE4', text: '#3D4A35', count: '#6B7F5E' },
  assisted: { bg: '#F0EAE0', text: '#5A4A37', count: '#8B7355' },
  delegated: { bg: '#E4EBF0', text: '#354A57', count: '#5E7080' },
};

const TONE_BORDER: Record<'success' | 'caution' | 'error', string> = {
  success: 'rgb(var(--success))',
  caution: 'rgb(var(--caution))',
  error: 'rgb(var(--error))',
};

const TONE_BG: Record<'success' | 'caution' | 'error', string> = {
  success: 'rgb(var(--success-light))',
  caution: 'rgb(var(--caution-light))',
  error: 'rgb(var(--error-light))',
};

export function TaskDecomposition(): JSX.Element {
  const { state, recordKnowledgeCheck } = useLearnerProgress();
  const { track } = useAnalytics();

  // Restore prior assignments from persisted state. The stored value
  // comes from the frozen 'ail.progress' store — guard the union so a
  // legacy or corrupt string reads as unassigned instead of rendering
  // a phantom category (and NaN-ing the tally).
  const restored = useMemo<Record<string, P8Category | null>>(() => {
    const out: Record<string, P8Category | null> = {};
    for (const card of P8_CARDS) {
      const stored = state.knowledgeChecks[`4.2.${card.id}`];
      out[card.id] = isP8Category(stored?.selectedOptionId) ? stored.selectedOptionId : null;
    }
    return out;
  }, [state.knowledgeChecks]);

  const [assignments, setAssignments] = useState<Record<string, P8Category | null>>(restored);
  // Submitted = at least one feedback record exists in state for this card set.
  // We treat submission as "all six recorded" since recordKnowledgeCheck only
  // fires on submit.
  const [submitted, setSubmitted] = useState<boolean>(() =>
    P8_CARDS.every((c) => Boolean(state.knowledgeChecks[`4.2.${c.id}`])),
  );

  const allAssigned = P8_CARDS.every((c) => assignments[c.id] !== null);
  const counts: Record<P8Category, number> = {
    human: 0,
    assisted: 0,
    delegated: 0,
  };
  for (const c of P8_CARDS) {
    const cat = assignments[c.id];
    if (cat) counts[cat] += 1;
  }

  const onAssign = (cardId: string, category: P8Category) => {
    if (submitted) return;
    setAssignments((prev) => ({ ...prev, [cardId]: category }));
    track({
      type: 'p8_card_assigned',
      moduleId: 4,
      sectionId: 2,
      payload: { cardId, category },
    });
  };

  const onSubmit = () => {
    if (!allAssigned || submitted) return;
    let matchCount = 0;
    for (const card of P8_CARDS) {
      const chosen = assignments[card.id];
      if (!chosen) continue;
      const isPreferred = chosen === card.intendedCategory;
      if (isPreferred) matchCount += 1;
      recordKnowledgeCheck(4, 2, card.id, {
        selectedOptionId: chosen,
        isPreferred,
        timestamp: Date.now(),
      });
    }
    track({
      type: 'p8_submitted',
      moduleId: 4,
      sectionId: 2,
      payload: { matchCount, total: P8_CARDS.length },
    });
    setSubmitted(true);
  };

  return (
    <div className="space-y-3">
      {/* R1 + R2 both support the delegation-decision moment that P8
          practices. R1 = vocabulary/competency map; R2 = step-by-step
          decision flowchart. Stacked vertically on the right edge so
          the learner can reach for whichever frame fits their current
          question. */}
      <ReferenceTabRail>
        <R1Trigger label="4D Reference" />
        <R2Trigger label="Delegation Guide" />
      </ReferenceTabRail>

      <section
        aria-label="Task decomposition exercise"
        className="rounded-xl"
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          padding: '24px 26px',
        }}
      >
        <Overline className="mb-2">Practice activity — P8</Overline>
        <h3
          className="m-0 mb-3 font-display text-title font-normal text-ink"
          style={{ letterSpacing: '-0.005em' }}
        >
          Structured task decomposition
        </h3>

        <div className="mb-6">
          <BottleneckCallout title="Your task">
            <p className="m-0 whitespace-pre-line">{P8_SCENARIO}</p>
          </BottleneckCallout>
        </div>

      <CategorySummaryStrip counts={counts} />

      <ul className="m-0 mt-5 list-none space-y-3 p-0">
        {P8_CARDS.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            assignment={assignments[card.id] ?? null}
            submitted={submitted}
            onAssign={(cat) => onAssign(card.id, cat)}
          />
        ))}
      </ul>

      {!submitted && (
        <div className="mt-5 flex items-center justify-end gap-3">
          <span className="font-mono text-caption text-tertiary" style={{ letterSpacing: '0.02em' }}>
            {P8_CARDS.filter((c) => assignments[c.id] !== null).length} of {P8_CARDS.length} assigned
          </span>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allAssigned}
            aria-disabled={!allAssigned}
            className="rounded-md bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted"
          >
            See Results
          </button>
        </div>
      )}

      {submitted && (
        <>
          <div className="mt-8">
            <SummaryCallout />
          </div>
          <div className="mt-6">
            <ReflectionPrompt
              moduleId={4}
              sectionId={2}
              promptId="p8_reflection"
              accent="delegation"
              engagedEvent="p8_reflection_engaged"
              savedEvent="p8_reflection_saved"
              promptText={P8_REFLECTION}
            />
          </div>
        </>
      )}
      </section>
    </div>
  );
}

function CategorySummaryStrip({ counts }: { counts: Record<P8Category, number> }): JSX.Element {
  const items: { id: P8Category; label: string }[] = [
    { id: 'human', label: 'Human-Only' },
    { id: 'assisted', label: 'AI-Assisted' },
    { id: 'delegated', label: 'Fully Delegated' },
  ];
  return (
    <div
      className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md"
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border-light))',
        padding: '10px 14px',
      }}
    >
      {items.map((it) => {
        const count = counts[it.id];
        const palette = CATEGORY_PALETTE[it.id];
        return (
          <div key={it.id} className="flex items-baseline gap-2">
            <span className="font-sans text-body-sm text-secondary">{it.label}:</span>
            <span
              className="font-mono text-[12px] font-semibold"
              style={{
                color: count > 0 ? palette.count : 'rgb(var(--tertiary))',
              }}
            >
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CardItem({
  card,
  assignment,
  submitted,
  onAssign,
}: {
  card: TaskCard;
  assignment: P8Category | null;
  submitted: boolean;
  onAssign: (cat: P8Category) => void;
}): JSX.Element {
  const feedback = submitted && assignment ? card.feedback[assignment] : null;
  // Local toggle for the See-all-responses expander — mirrors the
  // KnowledgeCheck pattern (also stored as per-item local state, not
  // surfaced to LearnerProgressContext, since the expanded view is a
  // pure UI affordance, not a learning signal).
  const [showAll, setShowAll] = useState<boolean>(false);

  // Render order for the expanded list. Fixed so every card surfaces
  // categories in the same sequence regardless of which one the learner
  // selected, matching how KnowledgeCheck renders its options in their
  // canonical a/b/c/d order.
  const ALL_CATEGORIES: P8Category[] = ['human', 'assisted', 'delegated'];

  return (
    <li
      className="rounded-lg"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        padding: '16px 18px',
      }}
    >
      <div className="mb-1 font-sans text-h4 font-semibold text-ink">{card.title}</div>
      <p className="m-0 mb-3 font-sans text-body-sm text-body">{card.description}</p>

      <SegmentedControl
        cardTitle={card.title}
        value={assignment}
        disabled={submitted}
        onChange={onAssign}
      />

      {feedback && (
        <div
          aria-live="polite"
          className="mt-3 rounded-md transition-opacity duration-200"
          style={{
            background: TONE_BG[feedback.tone],
            borderLeft: `3px solid ${TONE_BORDER[feedback.tone]}`,
            padding: '12px 14px',
          }}
        >
          <div
            className="mb-1 font-sans text-body-sm font-semibold"
            style={{ color: TONE_BORDER[feedback.tone] }}
          >
            {feedback.title}
          </div>
          <div className="font-sans text-body-sm leading-relaxed text-body">{feedback.text}</div>
        </div>
      )}

      {/* See-all-responses expander — surfaces the consequence feedback
          for the two categories the learner didn't pick. Central to the
          consequence-based-feedback design: the value of P8 is in seeing
          what would have happened on the alternate paths, not only the
          one taken. Styling mirrors KnowledgeCheck's matching toggle
          (toggle button, surface-backed list items with tone-colored
          left border, mono uppercase header, tone-colored category
          label, prose feedback text). */}
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
              {ALL_CATEGORIES.map((cat) => {
                const fb = card.feedback[cat];
                const isSelected = cat === assignment;
                return (
                  <li
                    key={`all-${card.id}-${cat}`}
                    className="rounded-md"
                    style={{
                      background: 'rgb(var(--surface))',
                      border: '1px solid rgb(var(--border-light))',
                      borderLeft: `3px solid ${TONE_BORDER[fb.tone]}`,
                      padding: '12px 14px',
                    }}
                  >
                    <div
                      className="mb-1 font-mono text-[10px] font-bold uppercase"
                      style={{ letterSpacing: '0.1em', color: TONE_BORDER[fb.tone] }}
                    >
                      {CATEGORY_LABELS[cat]} · {fb.title}
                      {isSelected && (
                        <span
                          className="ml-2 text-tertiary"
                          style={{ letterSpacing: '0.1em' }}
                        >
                          · Your choice
                        </span>
                      )}
                    </div>
                    <div className="font-sans text-body-sm leading-relaxed text-body">
                      {fb.text}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

function SegmentedControl({
  cardTitle,
  value,
  disabled,
  onChange,
}: {
  cardTitle: string;
  value: P8Category | null;
  disabled: boolean;
  onChange: (cat: P8Category) => void;
}): JSX.Element {
  const cats: P8Category[] = ['human', 'assisted', 'delegated'];
  return (
    <div
      role="radiogroup"
      aria-label={`Categorize: ${cardTitle}`}
      className="grid"
      style={{
        gridTemplateColumns: 'repeat(3, 1fr)',
        border: '1px solid rgb(var(--border))',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {cats.map((cat, i) => {
        const active = value === cat;
        const palette = CATEGORY_PALETTE[cat];
        return (
          <button
            key={cat}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${CATEGORY_LABELS[cat]} — ${CATEGORY_DESCRIPTIONS[cat]}`}
            disabled={disabled}
            onClick={() => onChange(cat)}
            className="font-sans text-[12px] font-medium transition-colors duration-150"
            style={{
              padding: '10px 12px',
              background: active ? palette.bg : 'transparent',
              color: active ? palette.text : 'rgb(var(--secondary))',
              fontWeight: active ? 600 : 500,
              borderLeft: i === 0 ? 'none' : '1px solid rgb(var(--border))',
              cursor: disabled ? 'default' : 'pointer',
            }}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        );
      })}
    </div>
  );
}

function SummaryCallout(): JSX.Element {
  return (
    <aside
      role="note"
      aria-label="Decomposition pattern summary"
      className="rounded-lg"
      style={{
        background: 'rgb(var(--surface-warm))',
        border: '1px solid rgb(var(--border))',
        borderLeft: `3px solid ${DELEGATION}`,
        padding: '16px 20px',
      }}
    >
      <h4 className="m-0 mb-2 font-sans text-h4 font-semibold text-ink">Decomposition pattern</h4>
      <div className="font-sans text-body-sm text-body whitespace-pre-line">
        {P8_SUMMARY.replace(/^Decomposition pattern:\n\n/, '')}
      </div>
    </aside>
  );
}
