// P7 ContextWindowScenario — three-phase decision-simulator interaction
// (4C spec §10). Phase 1: scenario setup with side-by-side source +
// summary. Phase 2: four verification items submitted sequentially.
// Phase 3: mechanism reveal + attention heatmap + Delegation-accented
// reflection prompt.

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { BottleneckCallout } from '../../components/shared/BottleneckCallout';
import { Icon } from '../../components/shared/Icon';
import { Overline } from '../../components/shared/Overline';
import { R5Trigger } from '../../components/reference/R5Trigger';
import { ReferenceTabRail } from '../../components/reference/ReferenceTabRail';
import { ReflectionPrompt } from '../../components/shared/ReflectionPrompt';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { AttentionVisualization } from './AttentionVisualization';
import {
  AI_SUMMARY,
  MECHANISM_REVEAL,
  REASONING_PROMPT,
  SOURCE_EXCERPTS,
  VERIFICATION_ITEMS,
  type VerificationAnswer,
} from './p7-content';

type Phase = 'setup' | 'verification' | 'debrief';
type DocTab = 'source' | 'summary';

const DELEGATION = '#6B7F5E';

export function ContextWindowScenario(): JSX.Element {
  const { state, recordKnowledgeCheck } = useLearnerProgress();
  const { track } = useAnalytics();

  // Restore prior submissions so navigating away and back doesn't reset.
  const submittedItems = useMemo<Record<number, VerificationAnswer>>(() => {
    const out: Record<number, VerificationAnswer> = {};
    for (const item of VERIFICATION_ITEMS) {
      const stored = state.knowledgeChecks[`3.7.p7_item_${item.id}`];
      if (stored) {
        out[item.id] = stored.selectedOptionId as VerificationAnswer;
      }
    }
    return out;
  }, [state.knowledgeChecks]);

  // Determine the starting phase based on how far the learner has come.
  const initialPhase = useMemo<Phase>(() => {
    if (state.engagedFlags['3.7.p7_verification_started']) {
      const allDone = VERIFICATION_ITEMS.every((it) => submittedItems[it.id]);
      return allDone ? 'debrief' : 'verification';
    }
    return 'setup';
  }, [state.engagedFlags, submittedItems]);

  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [submitted, setSubmitted] = useState<Record<number, VerificationAnswer>>(submittedItems);
  const [docTab, setDocTab] = useState<DocTab>('source');

  // Determine the next item the learner should answer (sequential gating).
  const nextItemIdx = VERIFICATION_ITEMS.findIndex((it) => !submitted[it.id]);
  const allSubmitted = nextItemIdx === -1;

  // Auto-transition to debrief once all four items are submitted.
  useEffect(() => {
    if (phase === 'verification' && allSubmitted) {
      setPhase('debrief');
      const correctCount = VERIFICATION_ITEMS.reduce(
        (acc, it) => (submitted[it.id] === it.correct ? acc + 1 : acc),
        0,
      );
      track({
        type: 'p7_items_correct',
        moduleId: 3,
        sectionId: 7,
        payload: { correct: correctCount },
      });
    }
  }, [phase, allSubmitted, submitted, track]);

  // Fire scenario_viewed event once on first mount.
  useEffect(() => {
    track({ type: 'p7_scenario_viewed', moduleId: 3, sectionId: 7 });
  }, [track]);

  return (
    <div className="space-y-3">
      {/* R5 supports D3 + D8. P7 teaches the context-window pillar —
          R5's Volume Tasks section gives the integrated picture of where
          finite attention causes systematic failures. */}
      <ReferenceTabRail>
        <R5Trigger variant="tab" label="Capability Boundaries" />
      </ReferenceTabRail>

      <section
        aria-label="Context window scenario"
        className="rounded-xl"
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          padding: '24px 26px',
      }}
    >
      <Overline className="mb-2">Practice activity — P7</Overline>
      <h3
        className="m-0 mb-3 font-display text-title font-normal text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        Context window scenario: the missing clause
      </h3>
      <p className="m-0 mb-5 font-sans text-body text-body">
        Your team lead has asked an AI tool to summarize a vendor services agreement before a
        contract review meeting. The full agreement is 42 pages. The summary below was generated
        from the full document. Your job: evaluate the summary for completeness and accuracy
        before the meeting.
      </p>

      <DocumentPanels
        docTab={docTab}
        onTabChange={setDocTab}
        // Disable scroll-locking effects in setup phase so the learner can
        // freely browse both panels.
        emphasizeBoth={phase !== 'debrief'}
      />

      {phase === 'setup' && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => {
              setPhase('verification');
              track({ type: 'p7_verification_started', moduleId: 3, sectionId: 7 });
            }}
            className="inline-flex items-center gap-2 rounded-md bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] hover:bg-action-hover"
          >
            Begin verification
            <Icon name="arrowRight" size={14} />
          </button>
        </div>
      )}

      {phase !== 'setup' && (
        <div className="mt-8 space-y-6">
          {VERIFICATION_ITEMS.map((item, idx) => {
            const isSubmitted = Boolean(submitted[item.id]);
            const isVisible = idx <= nextItemIdx || isSubmitted || allSubmitted;
            if (!isVisible) return null;
            return (
              <VerificationItemCard
                key={item.id}
                item={item}
                submitted={submitted[item.id]}
                onSubmit={(answer) => {
                  setSubmitted((prev) => ({ ...prev, [item.id]: answer }));
                  recordKnowledgeCheck(3, 7, `p7_item_${item.id}`, {
                    selectedOptionId: answer,
                    isPreferred: answer === item.correct,
                    timestamp: Date.now(),
                  });
                  track({
                    type: `p7_item_${item.id}_submitted`,
                    moduleId: 3,
                    sectionId: 7,
                    payload: { answer },
                  });
                }}
              />
            );
          })}
        </div>
      )}

      {phase === 'debrief' && <DebriefBlock />}
      </section>
    </div>
  );
}

// ─── Document panels (Source + Summary) ───────────────────────────

function DocumentPanels({
  docTab,
  onTabChange,
  emphasizeBoth,
}: {
  docTab: DocTab;
  onTabChange: (t: DocTab) => void;
  emphasizeBoth: boolean;
}): JSX.Element {
  // Desktop: side-by-side. Mobile: tabbed. We render both layouts via
  // CSS — `sm:` breakpoint hides one or the other.
  return (
    <div>
      {/* Mobile: tablist switcher (hidden ≥640px) */}
      <div role="tablist" aria-label="Document panels" className="flex flex-wrap sm:hidden" style={{ borderBottom: '1px solid rgb(var(--border-light))' }}>
        {(['source', 'summary'] as const).map((t, i) => {
          const active = docTab === t;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onTabChange(t)}
              onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  onTabChange(t === 'source' ? 'summary' : 'source');
                }
              }}
              className="font-sans text-[13px] transition-colors duration-150"
              style={{
                padding: '12px 18px',
                background: active ? 'rgb(var(--white))' : 'transparent',
                color: active ? 'rgb(var(--ink))' : 'rgb(var(--secondary))',
                fontWeight: active ? 600 : 500,
                borderBottom: active ? `2px solid rgb(var(--ink))` : '2px solid transparent',
                marginBottom: '-1px',
                cursor: 'pointer',
                flex: 1,
                opacity: emphasizeBoth ? 1 : 1,
              }}
            >
              {i === 0 ? 'Source' : 'Summary'}
            </button>
          );
        })}
      </div>

      {/* `gridAutoRows: 1fr` plus `h-full` on each panel cell forces both
          panels in a row to share the height of the taller one — the source
          excerpts banner is multi-line while the summary header is single-
          line, so without this the two panels render at different total
          heights even though both have the same internal scroll cap. */}
      <div
        className="mt-3 grid gap-4 sm:grid-cols-2"
        style={{ gridAutoRows: '1fr' }}
      >
        <div className={`h-full ${docTab === 'source' ? 'block' : 'hidden sm:block'}`}>
          <SourcePanel />
        </div>
        <div className={`h-full ${docTab === 'summary' ? 'block' : 'hidden sm:block'}`}>
          <SummaryPanel />
        </div>
      </div>
    </div>
  );
}

// Both panels render at a uniform total height (`PANEL_HEIGHT`) so the
// source/summary pair always reads as a balanced comparison. Banner and
// header rows are different visual treatments but both fit in the same
// outer dimensions; the inner scroll region absorbs height differences.
const PANEL_HEIGHT = 520;

function SourcePanel(): JSX.Element {
  return (
    <section
      role="region"
      aria-label="Source document excerpts"
      className="flex flex-col rounded-lg"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        overflow: 'hidden',
        height: PANEL_HEIGHT,
      }}
    >
      <div
        className="font-sans text-body-sm"
        style={{
          background: 'rgb(var(--info-light))',
          color: 'rgb(var(--info))',
          padding: '8px 14px',
          borderBottom: '1px solid rgb(var(--border-light))',
          flexShrink: 0,
        }}
      >
        Excerpts from a 42-page agreement. The full document was provided to the AI tool.
      </div>
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '14px 16px' }}
      >
        <ul className="m-0 space-y-4 list-none p-0">
          {SOURCE_EXCERPTS.map((sec) => (
            <li key={sec.heading}>
              <div className="mb-1 font-sans text-body-sm font-semibold text-ink">
                {sec.heading}
              </div>
              <div className="mb-1 font-mono text-caption text-tertiary" style={{ letterSpacing: '0.02em' }}>
                Page {sec.page}
              </div>
              <p className="m-0 font-sans text-body-sm leading-relaxed text-body">
                {sec.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SummaryPanel(): JSX.Element {
  return (
    <section
      role="region"
      aria-label="AI-generated summary"
      className="flex flex-col rounded-lg"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        overflow: 'hidden',
        height: PANEL_HEIGHT,
      }}
    >
      <div
        className="font-sans text-body-sm font-semibold"
        style={{
          background: 'rgb(var(--surface-warm))',
          color: 'rgb(var(--ink))',
          padding: '8px 14px',
          borderBottom: '1px solid rgb(var(--border-light))',
          flexShrink: 0,
        }}
      >
        AI-generated summary
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: '14px 16px' }}>
        {AI_SUMMARY.split(/\n\n/).map((para, i) => (
          <p
            key={i}
            className="m-0 font-sans text-body-sm leading-relaxed text-body"
            style={{ marginBottom: 12 }}
          >
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}

// ─── Verification item ────────────────────────────────────────────

function VerificationItemCard({
  item,
  submitted,
  onSubmit,
}: {
  item: (typeof VERIFICATION_ITEMS)[number];
  submitted?: VerificationAnswer;
  onSubmit: (a: VerificationAnswer) => void;
}): JSX.Element {
  const [selected, setSelected] = useState<VerificationAnswer | null>(submitted ?? null);
  const isSubmitted = Boolean(submitted);
  const feedback = submitted ? item.feedback[submitted] : null;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSubmitted) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [isSubmitted]);

  const options: { id: VerificationAnswer; label: string }[] = [
    { id: 'accurate', label: 'Accurate' },
    { id: 'inaccurate', label: 'Inaccurate' },
    { id: 'cannot-verify', label: 'Cannot verify from excerpts provided' },
  ];

  return (
    <div
      ref={ref}
      className="rounded-lg"
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        padding: '18px 20px',
      }}
    >
      <Overline className="mb-2" style={{ fontSize: 11 }}>
        Item {item.id} of 4 · {item.sectionRef}
      </Overline>
      <p className="m-0 mb-4 font-sans text-body text-ink">
        <span className="font-semibold">Summary claim:</span> “{item.claim}”
      </p>

      <fieldset disabled={isSubmitted} className="m-0 border-0 p-0">
        <legend className="sr-only">Does the summary accurately reflect the source?</legend>
        <ul className="m-0 list-none space-y-2 p-0">
          {options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => !isSubmitted && setSelected(opt.id)}
                  aria-pressed={isSelected}
                  className="flex w-full items-start gap-3 rounded-md text-left"
                  style={{
                    background: 'rgb(var(--white))',
                    border: isSelected ? '2px solid rgb(var(--ink))' : '1px solid rgb(var(--border))',
                    padding: isSelected ? '11px 15px' : '12px 16px',
                    cursor: isSubmitted ? 'default' : 'pointer',
                    transition: 'all 150ms',
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
                    {opt.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      {!isSubmitted && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => selected && onSubmit(selected)}
            disabled={!selected}
            aria-disabled={!selected}
            className="rounded-md bg-action px-5 py-2.5 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted"
          >
            Submit
          </button>
        </div>
      )}

      {isSubmitted && feedback && (
        <div
          aria-live="polite"
          className="mt-4 rounded-md"
          style={{
            background:
              feedback.tone === 'success'
                ? 'rgb(var(--success-light))'
                : 'rgb(var(--error-light))',
            borderLeft: `3px solid ${feedback.tone === 'success' ? 'rgb(var(--success))' : 'rgb(var(--error))'}`,
            padding: '12px 14px',
          }}
        >
          <div
            className="mb-1 font-mono text-[10px] font-bold uppercase"
            style={{
              letterSpacing: '0.1em',
              color: feedback.tone === 'success' ? 'rgb(var(--success))' : 'rgb(var(--error))',
            }}
          >
            {feedback.tone === 'success' ? '★ Correct identification' : 'Reconsider'}
          </div>
          <div className="font-sans text-body-sm leading-relaxed text-body">{feedback.text}</div>
        </div>
      )}
    </div>
  );
}

// ─── Debrief: mechanism reveal + attention viz + reflection ──────

function DebriefBlock(): JSX.Element {
  const { track } = useAnalytics();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    track({ type: 'p7_debrief_viewed', moduleId: 3, sectionId: 7 });
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [track]);

  return (
    <div ref={ref} className="mt-10 space-y-6">
      <BottleneckCallout title="What happened mechanically">
        {(() => {
          // Each blank-line-separated chunk becomes a paragraph. All
          // paragraphs except the last get 8px bottom margin so the
          // gaps between paragraphs render consistently regardless of
          // how many MECHANISM_REVEAL contains — the prior `i === 0 ? 8 : 0`
          // was tuned for the original 2-paragraph reveal and left
          // later paragraphs flush against each other.
          const paragraphs = MECHANISM_REVEAL.split(/\n\n/);
          return paragraphs.map((para, i) => (
            <p
              key={i}
              className="m-0"
              style={{ marginBottom: i === paragraphs.length - 1 ? 0 : 8 }}
            >
              {para}
            </p>
          ));
        })()}
      </BottleneckCallout>

      <AttentionVisualization />

      <ReflectionPromptDelegation />
    </div>
  );
}

// P7 reflection accent is Delegation (#6B7F5E) per spec §10.4 — the
// prompt asks about delegation judgment ("how would you verify the
// model processed the information you needed it to use?"), not
// diligence per se.
function ReflectionPromptDelegation(): JSX.Element {
  return (
    <ReflectionPrompt
      moduleId={3}
      sectionId={7}
      promptId="p7_reasoning"
      engagedEvent="p7_reasoning_engaged"
      savedEvent="p7_reasoning_submitted"
      promptText={REASONING_PROMPT}
      accentColor={DELEGATION}
    />
  );
}
