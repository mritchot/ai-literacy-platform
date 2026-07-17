// KCReview — collapsed-by-default review surface for all 16 knowledge
// check items across the program. Mirrors the pre/post AssessmentResults
// pattern (expandable cards, response pills, ✓/✗) so the M4 S10 page
// treats KC responses with the same transparency as assessment
// responses.
//
// Two-level disclosure:
//   1. Module group row — module label + N/T correct + chevron. Click
//      to expand the four items inside (single-module-open at a time
//      to bound the scroll).
//   2. Item row — KC id + objective + selected option pill + ✓/✗.
//      Click to expand the full review: stem, all four options with
//      the selected one highlighted, feedback for the selected
//      response, and (when the learner missed it) the preferred
//      response with its feedback. Multiple items within an open
//      module can be expanded simultaneously.
//
// Data flow: KC item bodies (stem, options, feedback text) come
// directly from each module's `knowledge-check-items.tsx`. Learner
// responses come from `state.knowledgeChecks[`${module}.${section}.${checkId}`]`
// — the same keys recorded by KnowledgeCheck.tsx at submission time.
// Missing responses render as "Not answered" rather than blowing up.

import { useState } from 'react';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { MODULE_1_KC_ITEMS } from '../../modules/module1/knowledge-check-items';
import { MODULE_2_KC_ITEMS } from '../../modules/module2/knowledge-check-items';
import { MODULE_3_KC_ITEMS } from '../../modules/module3/knowledge-check-items';
import {
  MODULE_4_KC_ITEMS_S4,
  MODULE_4_KC_ITEMS_S7,
} from '../../modules/module4/knowledge-check-items';
import { Icon } from './Icon';
import type { KnowledgeCheckItemData } from './KnowledgeCheck';
import { Overline } from './Overline';

// Visual tokens — match the assessment-surface slate accent so this
// review block reads as part of the same "review past responses"
// family as AssessmentResults / AssessmentGrowth.
const ACCENT = 'rgb(var(--discernment))';
const SUCCESS = 'rgb(var(--success))';
const SUCCESS_LIGHT = 'rgb(var(--success-light))';
const ERROR = 'rgb(var(--error))';
const ERROR_LIGHT = 'rgb(var(--error-light))';
const SURFACE = 'rgb(var(--surface))';
const WHITE = 'rgb(var(--white))';

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

interface KCEntry {
  /** state.knowledgeChecks key — `${moduleId}.${sectionId}.${kc.id}` */
  storageKey: string;
  /** Display label for the item row (e.g. "KC-1.3"). */
  displayLabel: string;
  moduleId: number;
  sectionId: number;
  item: KnowledgeCheckItemData;
}

interface KCGroup {
  moduleId: number;
  moduleLabel: string;
  entries: KCEntry[];
}

const GROUPS: KCGroup[] = [
  {
    moduleId: 1,
    moduleLabel: 'Module 1 · Context',
    entries: MODULE_1_KC_ITEMS.map((item, idx) => ({
      storageKey: `1.7.${item.id}`,
      displayLabel: `KC-1.${idx + 1}`,
      moduleId: 1,
      sectionId: 7,
      item,
    })),
  },
  {
    moduleId: 2,
    moduleLabel: 'Module 2 · Evidence',
    entries: MODULE_2_KC_ITEMS.map((item, idx) => ({
      storageKey: `2.7.${item.id}`,
      displayLabel: `KC-2.${idx + 1}`,
      moduleId: 2,
      sectionId: 7,
      item,
    })),
  },
  {
    moduleId: 3,
    moduleLabel: 'Module 3 · Mechanism',
    entries: MODULE_3_KC_ITEMS.map((item, idx) => ({
      storageKey: `3.10.${item.id}`,
      displayLabel: `KC-3.${idx + 1}`,
      moduleId: 3,
      sectionId: 10,
      item,
    })),
  },
  {
    moduleId: 4,
    moduleLabel: 'Module 4 · Application',
    entries: [
      // M4's KCs split across two sections (S4: kc_4_1, kc_4_2; S7: kc_4_3, kc_4_4)
      ...MODULE_4_KC_ITEMS_S4.map((item, idx) => ({
        storageKey: `4.4.${item.id}`,
        displayLabel: `KC-4.${idx + 1}`,
        moduleId: 4,
        sectionId: 4,
        item,
      })),
      ...MODULE_4_KC_ITEMS_S7.map((item, idx) => ({
        storageKey: `4.7.${item.id}`,
        displayLabel: `KC-4.${idx + 3}`,
        moduleId: 4,
        sectionId: 7,
        item,
      })),
    ],
  },
];

export function KCReview(): JSX.Element {
  const { state } = useLearnerProgress();
  // Single-module-open at a time keeps the scroll bounded. Multiple
  // items within the open module can be expanded simultaneously
  // (useful for comparing two adjacent KCs).
  const [openModuleId, setOpenModuleId] = useState<number | null>(null);
  const [openItemKeys, setOpenItemKeys] = useState<Set<string>>(() => new Set());

  const toggleModule = (moduleId: number) => {
    setOpenModuleId((prev) => (prev === moduleId ? null : moduleId));
    setOpenItemKeys(new Set()); // collapse any open items when switching modules
  };

  const toggleItem = (key: string) => {
    setOpenItemKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <section
      aria-label="Knowledge check review"
      style={{
        background: WHITE,
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${ACCENT}`,
        padding: '20px 24px',
      }}
    >
      <Overline className="mb-1" style={{ color: 'rgb(var(--discernment-text))', letterSpacing: '0.1em' }}>
        Knowledge check review
      </Overline>
      <h2
        className="m-0 mb-1 font-sans text-h2 font-semibold text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        Revisit your responses
      </h2>
      <p className="m-0 mb-5 font-sans text-body-sm text-secondary">
        Open a module to see how you answered each knowledge check, with the consequence-based
        feedback for the option you picked.
      </p>

      <ul className="m-0 list-none space-y-3 p-0">
        {GROUPS.map((group) => {
          const isModuleOpen = openModuleId === group.moduleId;
          const correctCount = group.entries.reduce((acc, entry) => {
            const result = state.knowledgeChecks[entry.storageKey];
            return result?.isPreferred ? acc + 1 : acc;
          }, 0);
          const total = group.entries.length;

          return (
            <li
              key={group.moduleId}
              style={{
                background: WHITE,
                border: '1px solid rgb(var(--border))',
                borderLeft: `3px solid ${ACCENT}`,
                minWidth: 0,
              }}
            >
              <button
                type="button"
                onClick={() => toggleModule(group.moduleId)}
                aria-expanded={isModuleOpen}
                className="flex w-full items-center gap-3 text-left hover:bg-[rgb(var(--surface))]"
                style={{ padding: '14px 18px', cursor: 'pointer' }}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center"
                  style={{ color: 'rgb(var(--secondary))' }}
                >
                  <Icon name={isModuleOpen ? 'chevronDown' : 'chevronRight'} size={16} />
                </span>
                <span className="flex-1 font-sans text-body-sm font-semibold text-ink">
                  {group.moduleLabel}
                </span>
                <ScoreBadge correct={correctCount} total={total} />
              </button>

              {isModuleOpen && (
                <div
                  className="section-enter border-t border-border-light"
                  style={{ padding: '12px 14px 14px' }}
                >
                  <ul className="m-0 list-none space-y-2 p-0">
                    {group.entries.map((entry) => (
                      <KCItemRow
                        key={entry.storageKey}
                        entry={entry}
                        result={state.knowledgeChecks[entry.storageKey]}
                        expanded={openItemKeys.has(entry.storageKey)}
                        onToggle={() => toggleItem(entry.storageKey)}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ─── Score badge (module row right side) ─────────────────────────

function ScoreBadge({ correct, total }: { correct: number; total: number }): JSX.Element {
  const allCorrect = correct === total && total > 0;
  const someCorrect = correct > 0 && correct < total;
  const color = allCorrect ? SUCCESS : someCorrect ? 'rgb(var(--caution))' : 'rgb(var(--muted))';
  const bg = allCorrect
    ? SUCCESS_LIGHT
    : someCorrect
      ? 'rgb(var(--caution-light))'
      : SURFACE;
  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase"
      style={{
        background: bg,
        color,
        border: `1px solid ${
          color === 'rgb(var(--muted))' ? 'rgb(var(--border-light))' : color
        }`,
        padding: '4px 8px',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
      }}
    >
      {correct} / {total}
    </span>
  );
}

// ─── Item row (per-KC expandable) ────────────────────────────────

function KCItemRow({
  entry,
  result,
  expanded,
  onToggle,
}: {
  entry: KCEntry;
  result: { selectedOptionId: string; isPreferred: boolean } | undefined;
  expanded: boolean;
  onToggle: () => void;
}): JSX.Element {
  const preferredOption = entry.item.options.find((o) => o.isPreferred);

  return (
    <li
      style={{
        background: SURFACE,
        border: '1px solid rgb(var(--border-light))',
        minWidth: 0,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 text-left hover:bg-[rgb(var(--white))]"
        style={{ padding: '10px 14px', cursor: 'pointer' }}
      >
        <span
          aria-hidden="true"
          className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center"
          style={{ color: 'rgb(var(--secondary))' }}
        >
          <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={14} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <div
              className="font-mono text-[10px] font-bold uppercase text-tertiary"
              style={{ letterSpacing: '0.12em' }}
            >
              {entry.displayLabel} · Obj. {entry.item.objectiveRef}
            </div>
          </div>
          <ResponsePill
            optionId={result?.selectedOptionId}
            isPreferred={result?.isPreferred}
          />
        </div>
      </button>
      {expanded && (
        <div
          className="section-enter space-y-3 border-t border-border-light"
          style={{ padding: '12px 14px 14px' }}
        >
          {/* Stem */}
          <div className="font-sans text-body-sm font-semibold leading-snug text-ink">
            {entry.item.stem}
          </div>

          {/* All four options, with the selected one highlighted */}
          <ul className="m-0 list-none space-y-1.5 p-0">
            {entry.item.options.map((opt) => {
              const isSelected = result?.selectedOptionId === opt.id;
              const isCorrect = opt.isPreferred;
              const borderColor = isSelected
                ? TONE_BORDER[opt.feedbackTone]
                : 'rgb(var(--border-light))';
              const bg = isSelected ? TONE_BG[opt.feedbackTone] : WHITE;
              return (
                <li
                  key={opt.id}
                  style={{
                    background: bg,
                    border: `1px solid ${borderColor}`,
                    padding: '8px 12px',
                    minWidth: 0,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="flex-shrink-0 font-mono text-[10px] font-bold uppercase text-tertiary"
                      style={{ letterSpacing: '0.1em', paddingTop: 2 }}
                    >
                      {opt.id.toUpperCase()}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-sans text-[13px] text-body"
                        style={{ lineHeight: 1.5, overflowWrap: 'anywhere' }}
                      >
                        {opt.text}
                      </div>
                      {isSelected && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className="font-mono text-[9.5px] font-bold uppercase"
                            style={{
                              color: TONE_BORDER[opt.feedbackTone],
                              letterSpacing: '0.1em',
                            }}
                          >
                            Your response
                          </span>
                          {isCorrect && (
                            <span
                              className="font-mono text-[9.5px] font-bold uppercase"
                              style={{ color: SUCCESS, letterSpacing: '0.1em' }}
                            >
                              Preferred
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div
                      className="mt-2 font-sans text-body-sm text-body"
                      style={{
                        background: WHITE,
                        border: '1px solid rgb(var(--border-light))',
                        borderLeft: `3px solid ${TONE_BORDER[opt.feedbackTone]}`,
                        padding: '8px 10px',
                        lineHeight: 1.55,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      <div
                        className="mb-1 font-mono text-[9.5px] font-bold uppercase"
                        style={{
                          color: TONE_BORDER[opt.feedbackTone],
                          letterSpacing: '0.1em',
                        }}
                      >
                        {opt.feedbackTitle}
                      </div>
                      {opt.feedbackText}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* When the learner missed the preferred response, surface it
              with its own feedback (same pattern as KnowledgeCheck's
              "Recommended response" callout). Skip when they got it
              right (the highlighted option above already is the
              preferred one) or when no response was recorded. */}
          {result && !result.isPreferred && preferredOption && (
            <div
              style={{
                background: SUCCESS_LIGHT,
                border: `1px solid ${SUCCESS}`,
                padding: '10px 12px',
                minWidth: 0,
              }}
            >
              <div
                className="mb-1 font-mono text-[9.5px] font-bold uppercase"
                style={{ color: SUCCESS, letterSpacing: '0.1em' }}
              >
                Preferred response · option {preferredOption.id.toUpperCase()}
              </div>
              <div
                className="mb-1.5 font-sans text-body-sm font-semibold text-ink"
                style={{ overflowWrap: 'anywhere' }}
              >
                {preferredOption.text}
              </div>
              <div
                className="font-sans text-body-sm text-body"
                style={{ lineHeight: 1.55, overflowWrap: 'anywhere' }}
              >
                {preferredOption.feedbackText}
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

// ─── Response pill (item row right side) ─────────────────────────

function ResponsePill({
  optionId,
  isPreferred,
}: {
  optionId?: string | undefined;
  isPreferred?: boolean | undefined;
}): JSX.Element {
  if (!optionId) {
    return (
      <span
        className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase"
        style={{
          background: SURFACE,
          color: 'rgb(var(--muted))',
          border: '1px solid rgb(var(--border-light))',
          padding: '3px 8px',
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
        }}
      >
        Not answered
      </span>
    );
  }
  const ok = isPreferred;
  const color = ok ? SUCCESS : ERROR;
  const bg = ok ? SUCCESS_LIGHT : ERROR_LIGHT;
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase"
      style={{
        background: bg,
        color,
        border: `1px solid ${color}`,
        padding: '3px 8px',
        letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
      }}
    >
      <span className="text-tertiary">Your</span>
      <span>{optionId.toUpperCase()}</span>
      {ok ? <span aria-label="correct">✓</span> : <span aria-label="incorrect">✗</span>}
    </span>
  );
}
