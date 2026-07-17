// P11 IterativeRefinement — three-turn sequential refinement on a
// pre-written set of email drafts (4B spec §8). Each turn unlocks
// after the previous turn's refinement is submitted (≥20 chars).

import { useEffect, useMemo, useRef, useState } from 'react';
import { BottleneckCallout } from '../../components/shared/BottleneckCallout';
import { Icon } from '../../components/shared/Icon';
import { Overline } from '../../components/shared/Overline';
import { R3Trigger } from '../../components/reference/R3Trigger';
import { ReferenceTabRail } from '../../components/reference/ReferenceTabRail';
import { ReflectionPrompt } from '../../components/shared/ReflectionPrompt';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { scrollBehavior } from '../../utils/motion';
import {
  P11_DRAFT_1,
  P11_DRAFT_2,
  P11_DRAFT_3,
  P11_REFLECTION,
  P11_SCENARIO,
  P11_TURN1_EVAL_PROMPTS,
  P11_TURN1_PROMPT,
  P11_TURN2_EVAL_PROMPTS,
  P11_TURN2_EXAMPLE_LABEL_FOR_DRAFT_2,
  P11_TURN2_EXAMPLE_REFINEMENT_FOR_DRAFT_2,
  P11_TURN3_COMPARISON_PROMPT,
  P11_TURN3_EXAMPLE_LABEL_FOR_DRAFT_3,
  P11_TURN3_EXAMPLE_REFINEMENT_FOR_DRAFT_3,
  P11_TURN3_REFINEMENT_PROMPT,
} from './module4-content';
import { renderMarkdownLite } from './render-markdown-lite';

// Description-accent hex used for the example-refinement callout in Turn 3 —
// matches the accent treatment used by the P9 reformulated-prompt callout
// in Phase 3 so the "this is a refinement prompt" visual signal is
// consistent across both prompt-related practice activities.
const DESCRIPTION_HEX = 'rgb(var(--description))';
const MIN_REFINEMENT_CHARS = 20;
const SECTION = 6;

export function IterativeRefinement(): JSX.Element {
  const { state, saveReflection } = useLearnerProgress();
  const { track } = useAnalytics();

  // Turn 1 state — pure evaluation. The legacy `p11_t1_refinement`
  // (a learner-authored refinement textarea under prior designs) is
  // still read for backward compatibility but no longer written or
  // surfaced in the new UI; Turn 1 is now evaluation-only.
  const stored1Product = state.reflections[`4.${SECTION}.p11_t1_product`] ?? '';
  const stored1Process = state.reflections[`4.${SECTION}.p11_t1_process`] ?? '';
  const stored1Performance = state.reflections[`4.${SECTION}.p11_t1_performance`] ?? '';
  const legacy1Refinement = state.reflections[`4.${SECTION}.p11_t1_refinement`] ?? '';
  const [t1Product, setT1Product] = useState(stored1Product);
  const [t1Process, setT1Process] = useState(stored1Process);
  const [t1Performance, setT1Performance] = useState(stored1Performance);

  // Turn 2 state — re-evaluation against Draft 2. The legacy
  // `p11_t2_refinement` (a textarea from earlier designs) is still
  // read for backward compatibility but no longer written or surfaced.
  const stored2Improvement = state.reflections[`4.${SECTION}.p11_t2_improvement`] ?? '';
  const stored2Gap = state.reflections[`4.${SECTION}.p11_t2_gap`] ?? '';
  const legacy2Refinement = state.reflections[`4.${SECTION}.p11_t2_refinement`] ?? '';
  const [t2Improvement, setT2Improvement] = useState(stored2Improvement);
  const [t2Gap, setT2Gap] = useState(stored2Gap);

  // Turn 3 state — author-and-compare. Learner writes a refinement
  // targeting the gap they identified in Turn 2, then sees the sample
  // refinement that produced Draft 3 and compares the two.
  const stored3Refinement = state.reflections[`4.${SECTION}.p11_t3_refinement`] ?? '';
  const stored3Comparison = state.reflections[`4.${SECTION}.p11_t3_comparison`] ?? '';
  const [t3Refinement, setT3Refinement] = useState(stored3Refinement);
  const [t3Comparison, setT3Comparison] = useState(stored3Comparison);

  // currentTurn: Turn 2 unlocks when all three Turn 1 evaluation
  // fields are filled; Turn 3 unlocks when both Turn 2 evaluation
  // fields are filled. Legacy refinement-textarea entries from earlier
  // designs are treated as advance signals so learners with
  // in-progress sessions aren't bounced backward.
  const currentTurn = useMemo<1 | 2 | 3>(() => {
    const t2EvalsComplete =
      stored2Gap.trim().length >= MIN_REFINEMENT_CHARS &&
      stored2Improvement.trim().length >= MIN_REFINEMENT_CHARS;
    const legacyT2Complete = legacy2Refinement.trim().length >= MIN_REFINEMENT_CHARS;
    if (t2EvalsComplete || legacyT2Complete) return 3;
    const t1EvalsComplete =
      stored1Product.trim().length >= MIN_REFINEMENT_CHARS &&
      stored1Process.trim().length >= MIN_REFINEMENT_CHARS &&
      stored1Performance.trim().length >= MIN_REFINEMENT_CHARS;
    const legacyT1Complete = legacy1Refinement.trim().length >= MIN_REFINEMENT_CHARS;
    if (t1EvalsComplete || legacyT1Complete) return 2;
    return 1;
  }, [
    stored1Product,
    stored1Process,
    stored1Performance,
    legacy1Refinement,
    stored2Gap,
    stored2Improvement,
    legacy2Refinement,
  ]);

  // Turn 3 sub-state: has the learner submitted their refinement?
  // When true, the example refinement, Draft 3, and the comparison
  // field reveal below the refinement textarea.
  const t3RefinementSubmitted = stored3Refinement.trim().length >= MIN_REFINEMENT_CHARS;

  // Refs for scroll-on-unlock
  const turn2Ref = useRef<HTMLDivElement>(null);
  // Pending scroll-into-view timer — cleared on unmount so a fast
  // navigation away can't fire it against an unmounted tree.
  const scrollTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (scrollTimerRef.current !== null) window.clearTimeout(scrollTimerRef.current);
    },
    [],
  );
  const turn3Ref = useRef<HTMLDivElement>(null);
  // Turn 3's reveal (worked example + Draft 3 + comparison) — focus
  // target after the refinement submit button unmounts.
  const t3RevealRef = useRef<HTMLDivElement>(null);
  const scenarioRef = useRef<HTMLDivElement>(null);
  const [scenarioViewed, setScenarioViewed] = useState(false);

  useEffect(() => {
    if (scenarioViewed) return;
    const el = scenarioRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !scenarioViewed) {
            setScenarioViewed(true);
            track({ type: 'p11_scenario_viewed', moduleId: 4, sectionId: SECTION });
            obs.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [scenarioViewed, track]);

  const onSubmitTurn1 = () => {
    // Turn 1 is now evaluation-only: gates on all three Description
    // dimensions being filled. No learner-authored refinement is
    // collected — the refinement that produces Draft 2 is surfaced
    // in Turn 2 as a worked example for re-evaluation.
    if (
      t1Product.trim().length < MIN_REFINEMENT_CHARS ||
      t1Process.trim().length < MIN_REFINEMENT_CHARS ||
      t1Performance.trim().length < MIN_REFINEMENT_CHARS
    ) {
      return;
    }
    saveReflection(4, SECTION, 'p11_t1_product', t1Product);
    saveReflection(4, SECTION, 'p11_t1_process', t1Process);
    saveReflection(4, SECTION, 'p11_t1_performance', t1Performance);
    track({
      type: 'p11_turn1_evaluation_submitted',
      moduleId: 4,
      sectionId: SECTION,
      payload: {
        productChars: t1Product.length,
        processChars: t1Process.length,
        performanceChars: t1Performance.length,
      },
    });
    scrollTimerRef.current = window.setTimeout(() => {
      // The submit button unmounts on advance; hand keyboard focus to
      // the revealed step so SR/keyboard users aren't dropped to <body>.
      turn2Ref.current?.focus({ preventScroll: true });
      turn2Ref.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    }, 100);
  };

  const onSubmitTurn2 = () => {
    // Turn 2 now advances on both evaluation fields being filled —
    // no learner-authored refinement prompt is collected, because the
    // refinement that produces Draft 3 is pre-written. Saving the
    // evaluation fields is what gates Turn 3.
    if (
      t2Improvement.trim().length < MIN_REFINEMENT_CHARS ||
      t2Gap.trim().length < MIN_REFINEMENT_CHARS
    ) {
      return;
    }
    saveReflection(4, SECTION, 'p11_t2_improvement', t2Improvement);
    saveReflection(4, SECTION, 'p11_t2_gap', t2Gap);
    track({
      type: 'p11_turn2_evaluation_submitted',
      moduleId: 4,
      sectionId: SECTION,
      payload: {
        improvementChars: t2Improvement.length,
        gapChars: t2Gap.length,
      },
    });
    scrollTimerRef.current = window.setTimeout(() => {
      track({ type: 'p11_turn3_viewed', moduleId: 4, sectionId: SECTION });
      turn3Ref.current?.focus({ preventScroll: true });
      turn3Ref.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    }, 100);
  };

  // Turn 3 refinement submit — gates the reveal of the example
  // refinement, Draft 3, and the comparison field. The learner writes
  // their own refinement targeting the gap they identified in Turn 2,
  // submits, and then sees how their attempt compares to the sample
  // refinement that actually produced Draft 3.
  const onSubmitTurn3Refinement = () => {
    if (t3Refinement.trim().length < MIN_REFINEMENT_CHARS) return;
    saveReflection(4, SECTION, 'p11_t3_refinement', t3Refinement);
    track({
      type: 'p11_turn3_refinement_submitted',
      moduleId: 4,
      sectionId: SECTION,
      payload: { refinementChars: t3Refinement.length },
    });
    scrollTimerRef.current = window.setTimeout(() => {
      // Same focus hand-off as Turns 1–2: the submit button unmounts.
      t3RevealRef.current?.focus({ preventScroll: true });
      t3RevealRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    }, 100);
  };

  // Comparison field save handler — fires onBlur of the Turn 3
  // comparison textarea after the reveal. Optional: not gated.
  const onSaveT3Comparison = () => {
    if (t3Comparison.trim() === stored3Comparison.trim()) return;
    saveReflection(4, SECTION, 'p11_t3_comparison', t3Comparison);
    track({
      type: 'p11_turn3_comparison_saved',
      moduleId: 4,
      sectionId: SECTION,
      payload: { comparisonChars: t3Comparison.length },
    });
  };

  return (
    <div className="space-y-3">
      {/* R3 supports the Description-Discernment loop the learner
          practices across the three refinement turns. The loop strip at
          the bottom of R3 is directly relevant to the evaluate-revise
          pattern used here. */}
      <ReferenceTabRail>
        <R3Trigger label="Prompt Template" />
      </ReferenceTabRail>

      <section
        aria-label="Iterative refinement exercise"
        style={{
          background: 'rgb(var(--white))',
          border: '1px solid rgb(var(--border))',
          padding: '24px 26px',
        }}
      >
      <Overline className="mb-2">Practice activity — P11</Overline>
      <h3
        className="m-0 mb-3 font-display text-title font-normal text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        Iterative refinement: the Description-Discernment loop
      </h3>

      <TurnIndicator currentTurn={currentTurn} />

      <div ref={scenarioRef} className="mt-6">
        <BottleneckCallout title="Your task">
          <p className="m-0 whitespace-pre-line">{P11_SCENARIO}</p>
        </BottleneckCallout>
      </div>

      <div className="mt-8">
        <Turn1
          prompt={P11_TURN1_PROMPT}
          draft={P11_DRAFT_1}
          submitted={currentTurn > 1}
          product={t1Product}
          processField={t1Process}
          performance={t1Performance}
          onProductChange={setT1Product}
          onProcessChange={setT1Process}
          onPerformanceChange={setT1Performance}
          onSubmit={onSubmitTurn1}
        />
      </div>

      {currentTurn >= 2 && (
        <div ref={turn2Ref} tabIndex={-1} className="mt-10 focus:outline-none">
          <Turn2
            draft={P11_DRAFT_2}
            submitted={currentTurn > 2}
            improvement={t2Improvement}
            gap={t2Gap}
            onImprovementChange={setT2Improvement}
            onGapChange={setT2Gap}
            onSubmit={onSubmitTurn2}
          />
        </div>
      )}

      {currentTurn >= 3 && (
        <div ref={turn3Ref} tabIndex={-1} className="mt-10 focus:outline-none">
          <Turn3
            draft={P11_DRAFT_3}
            refinement={t3Refinement}
            comparison={t3Comparison}
            refinementSubmitted={t3RefinementSubmitted}
            onRefinementChange={setT3Refinement}
            onComparisonChange={setT3Comparison}
            onComparisonBlur={onSaveT3Comparison}
            onSubmitRefinement={onSubmitTurn3Refinement}
            revealRef={t3RevealRef}
          />
          {t3RefinementSubmitted && (
            <div className="mt-8">
              <ReflectionPrompt
                moduleId={4}
                sectionId={SECTION}
                promptId="p11_reflection"
                accent="discernment"
                engagedEvent="p11_reflection_engaged"
                savedEvent="p11_reflection_saved"
                promptText={P11_REFLECTION}
              />
            </div>
          )}
        </div>
      )}
      </section>
    </div>
  );
}

// ─── Turn indicator ───────────────────────────────────────────────

function TurnIndicator({ currentTurn }: { currentTurn: 1 | 2 | 3 }): JSX.Element {
  const turns: { n: 1 | 2 | 3; label: string }[] = [
    { n: 1, label: 'First draft' },
    { n: 2, label: 'Revised draft' },
    { n: 3, label: 'Final draft' },
  ];
  return (
    <div
      role="progressbar"
      aria-valuenow={currentTurn}
      aria-valuemin={1}
      aria-valuemax={3}
      aria-label="Refinement turn progress"
      className="flex items-center gap-2"
    >
      {turns.map((t, i) => {
        const completed = currentTurn > t.n;
        const active = currentTurn === t.n;
        const dotColor = completed
          ? 'rgb(var(--success))'
          : active
            ? 'rgb(var(--action))'
            : 'rgb(var(--border))';
        return (
          <div key={t.n} className="flex flex-1 items-center gap-2">
            <span
              className="flex h-3 w-3 items-center justify-center rounded-full"
              style={{ background: dotColor }}
              aria-hidden="true"
            >
              {completed && <Icon name="check" size={8} />}
            </span>
            <span
              className="font-sans text-body-sm"
              style={{
                color: active
                  ? 'rgb(var(--ink))'
                  : completed
                    ? 'rgb(var(--success))'
                    : 'rgb(var(--secondary))',
                fontWeight: active ? 600 : 400,
              }}
            >
              Turn {t.n} · {t.label}
            </span>
            {i < turns.length - 1 && (
              <span
                aria-hidden="true"
                className="flex-1 self-center"
                style={{
                  height: 2,
                  background: completed ? 'rgb(var(--success))' : 'rgb(var(--border-light))',
                  marginTop: 1,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Turn 1 ───────────────────────────────────────────────────────

function Turn1({
  prompt,
  draft,
  submitted,
  product,
  processField,
  performance,
  onProductChange,
  onProcessChange,
  onPerformanceChange,
  onSubmit,
}: {
  prompt: string;
  draft: string;
  submitted: boolean;
  product: string;
  processField: string;
  performance: string;
  onProductChange: (v: string) => void;
  onProcessChange: (v: string) => void;
  onPerformanceChange: (v: string) => void;
  onSubmit: () => void;
}): JSX.Element {
  const allEvalsFilled =
    product.trim().length >= MIN_REFINEMENT_CHARS &&
    processField.trim().length >= MIN_REFINEMENT_CHARS &&
    performance.trim().length >= MIN_REFINEMENT_CHARS;
  return (
    <article aria-label="Turn 1: First draft">
      <div className="mb-3">
        <Overline style={{ fontSize: 11 }}>Turn 1</Overline>
        <h4 className="m-0 mt-1 font-sans text-h4 font-semibold text-ink">The first draft</h4>
      </div>

      <BottleneckCallout title="Your initial prompt">
        <p className="m-0 italic">{prompt.replace(/^Your initial prompt: /, '')}</p>
      </BottleneckCallout>

      <DraftCard label="AI Output: Draft 1" body={draft} />

      <fieldset disabled={submitted} className="m-0 mt-6 border-0 p-0">
        <legend className="m-0 mb-3 font-sans text-h4 font-semibold text-ink">
          Evaluate this draft.
        </legend>
        <div className="space-y-4">
          {P11_TURN1_EVAL_PROMPTS.map((p, i) => {
            const value = i === 0 ? product : i === 1 ? processField : performance;
            const onChange = i === 0 ? onProductChange : i === 1 ? onProcessChange : onPerformanceChange;
            return (
              <EvaluationField
                key={p.label}
                id={`p11_t1_${i}`}
                label={p.label}
                prompt={p.prompt}
                value={value}
                onChange={onChange}
              />
            );
          })}
        </div>
      </fieldset>

      {!submitted && (
        <div className="mt-4 flex items-center justify-end gap-3">
          {/* Turn 1 is now evaluation-only — no learner-authored
              refinement textarea. The refinement that produces Draft 2
              is surfaced in Turn 2 as a worked example for re-evaluation. */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allEvalsFilled}
            aria-disabled={!allEvalsFilled}
            className="inline-flex w-full items-center justify-center gap-2 bg-action px-5 py-2.5 text-center font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] dark:text-[rgb(var(--canvas))] hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted sm:w-auto sm:justify-start sm:text-left"
          >
            Continue → See a Refinement and Draft 2
            <Icon name="arrowRight" size={14} />
          </button>
        </div>
      )}
    </article>
  );
}

// ─── Turn 2 ───────────────────────────────────────────────────────

function Turn2({
  draft,
  submitted,
  improvement,
  gap,
  onImprovementChange,
  onGapChange,
  onSubmit,
}: {
  draft: string;
  submitted: boolean;
  improvement: string;
  gap: string;
  onImprovementChange: (v: string) => void;
  onGapChange: (v: string) => void;
  onSubmit: () => void;
}): JSX.Element {
  const bothEvalsFilled =
    improvement.trim().length >= MIN_REFINEMENT_CHARS &&
    gap.trim().length >= MIN_REFINEMENT_CHARS;
  return (
    <article aria-label="Turn 2: Revised draft">
      <div className="mb-3">
        <Overline style={{ fontSize: 11 }}>Turn 2</Overline>
        <h4 className="m-0 mt-1 font-sans text-h4 font-semibold text-ink">The revised draft</h4>
      </div>

      {/* Worked-example refinement that produced Draft 2. Description-
          accent callout (same treatment as the P9 reformulated-prompt
          callout) for cross-activity visual consistency. This replaces
          the previous "your refinement" collapsed callout that surfaced
          a learner-authored Turn 1 refinement — under the restructured
          design Turn 1 collects no refinement, and this worked example
          is what the learner re-evaluates against Draft 2. */}
      <aside
        role="note"
        aria-label={P11_TURN2_EXAMPLE_LABEL_FOR_DRAFT_2}
        style={{
          background: 'rgb(var(--description-light))',
          border: '1px solid rgb(var(--border))',
          borderLeft: `3px solid ${DESCRIPTION_HEX}`,
          padding: '16px 20px',
          marginBottom: 16,
        }}
      >
        <Overline className="mb-2" style={{ color: 'rgb(var(--description-text))' }}>
          {P11_TURN2_EXAMPLE_LABEL_FOR_DRAFT_2}
        </Overline>
        <p className="m-0 font-sans text-body-sm italic text-ink" style={{ lineHeight: 1.55 }}>
          {P11_TURN2_EXAMPLE_REFINEMENT_FOR_DRAFT_2}
        </p>
      </aside>

      <DraftCard label="AI Output: Draft 2" body={draft} />

      <fieldset disabled={submitted} className="m-0 mt-6 border-0 p-0">
        <legend className="m-0 mb-3 font-sans text-h4 font-semibold text-ink">
          What improved? What didn’t?
        </legend>
        <div className="space-y-4">
          <EvaluationField
            id="p11_t2_improvement"
            label={P11_TURN2_EVAL_PROMPTS[0]?.label ?? ''}
            prompt={P11_TURN2_EVAL_PROMPTS[0]?.prompt ?? ''}
            value={improvement}
            onChange={onImprovementChange}
          />
          <EvaluationField
            id="p11_t2_gap"
            label={P11_TURN2_EVAL_PROMPTS[1]?.label ?? ''}
            prompt={P11_TURN2_EVAL_PROMPTS[1]?.prompt ?? ''}
            value={gap}
            onChange={onGapChange}
          />
        </div>
      </fieldset>

      {!submitted && (
        <div className="mt-4 flex items-center justify-end gap-3">
          {/* Button unlocks when both re-evaluation fields are filled.
              No learner-authored refinement on this turn — that step
              is now Turn 3, after the learner has seen one worked
              example (Draft 2's refinement above). */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={!bothEvalsFilled}
            aria-disabled={!bothEvalsFilled}
            className="inline-flex w-full items-center justify-center gap-2 bg-action px-5 py-2.5 text-center font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] dark:text-[rgb(var(--canvas))] hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted sm:w-auto sm:justify-start sm:text-left"
          >
            Continue → Write Your Own Refinement
            <Icon name="arrowRight" size={14} />
          </button>
        </div>
      )}
    </article>
  );
}

// ─── Turn 3 ───────────────────────────────────────────────────────

function Turn3({
  draft,
  refinement,
  comparison,
  refinementSubmitted,
  onRefinementChange,
  onComparisonChange,
  onComparisonBlur,
  onSubmitRefinement,
  revealRef,
}: {
  draft: string;
  refinement: string;
  comparison: string;
  refinementSubmitted: boolean;
  onRefinementChange: (v: string) => void;
  onComparisonChange: (v: string) => void;
  onComparisonBlur: () => void;
  onSubmitRefinement: () => void;
  /** Focus target for the post-submit reveal (the submit button unmounts). */
  revealRef: React.RefObject<HTMLDivElement>;
}): JSX.Element {
  return (
    <article aria-label="Turn 3: Author and compare">
      <div className="mb-3">
        <Overline style={{ fontSize: 11 }}>Turn 3</Overline>
        <h4 className="m-0 mt-1 font-sans text-h4 font-semibold text-ink">
          Write your own refinement, then compare
        </h4>
      </div>

      {/* Refinement-author phase (visible before submit). The learner
          writes their refinement targeting the Turn 2 gap, then submits
          to reveal the worked-example refinement, Draft 3, and the
          comparison field. */}
      {/* Accessibility label on the fieldset as aria-label rather than
          in a sr-only legend (see InterpretationCheck.tsx for full
          rationale on the iOS overflow pattern). */}
      <fieldset
        disabled={refinementSubmitted}
        className="m-0 border-0 p-0"
        aria-label="Write a refinement for Draft 3"
      >
        <p className="m-0 mb-2 font-sans text-body-sm text-body">
          {P11_TURN3_REFINEMENT_PROMPT}
        </p>
        <RefinementTextarea
          id="p11_t3_refinement"
          value={refinement}
          onChange={onRefinementChange}
          disabled={refinementSubmitted}
        />
      </fieldset>

      {!refinementSubmitted && (
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onSubmitRefinement}
            disabled={refinement.trim().length < MIN_REFINEMENT_CHARS}
            aria-disabled={refinement.trim().length < MIN_REFINEMENT_CHARS}
            className="inline-flex w-full items-center justify-center gap-2 bg-action px-5 py-2.5 text-center font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] dark:text-[rgb(var(--canvas))] hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-ghost disabled:text-muted sm:w-auto sm:justify-start sm:text-left"
          >
            Submit Refinement → See Draft 3 and Compare
            <Icon name="arrowRight" size={14} />
          </button>
        </div>
      )}

      {/* Reveal phase (after submit): worked-example refinement that
          actually produced Draft 3, then Draft 3 itself, then the
          comparison field where the learner reflects on how their
          authored refinement differs from the sample. */}
      {refinementSubmitted && (
        <div ref={revealRef} tabIndex={-1} className="focus:outline-none">
          <aside
            role="note"
            aria-label={P11_TURN3_EXAMPLE_LABEL_FOR_DRAFT_3}
            style={{
              background: 'rgb(var(--description-light))',
              border: '1px solid rgb(var(--border))',
              borderLeft: `3px solid ${DESCRIPTION_HEX}`,
              padding: '16px 20px',
              marginTop: 20,
              marginBottom: 16,
            }}
          >
            <Overline className="mb-2" style={{ color: 'rgb(var(--description-text))' }}>
              {P11_TURN3_EXAMPLE_LABEL_FOR_DRAFT_3}
            </Overline>
            <p className="m-0 font-sans text-body-sm italic text-ink" style={{ lineHeight: 1.55 }}>
              {P11_TURN3_EXAMPLE_REFINEMENT_FOR_DRAFT_3}
            </p>
          </aside>

          <DraftCard label="AI Output: Draft 3" body={draft} />

          <div className="mt-6">
            <EvaluationField
              id="p11_t3_comparison"
              label={P11_TURN3_COMPARISON_PROMPT.label}
              prompt={P11_TURN3_COMPARISON_PROMPT.prompt}
              value={comparison}
              onChange={onComparisonChange}
              onBlur={onComparisonBlur}
            />
          </div>
        </div>
      )}
    </article>
  );
}

// ─── Shared sub-components ────────────────────────────────────────

function DraftCard({ label, body }: { label: string; body: string }): JSX.Element {
  return (
    <article
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        padding: '18px 20px',
        marginTop: 12,
      }}
    >
      <h5 className="m-0 mb-3 font-sans text-h4 font-semibold text-ink">{label}</h5>
      <div className="font-sans text-body-sm leading-relaxed text-body">
        {renderMarkdownLite(body)}
      </div>
    </article>
  );
}

function EvaluationField({
  id,
  label,
  prompt,
  value,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  prompt: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
}): JSX.Element {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block font-mono text-overline font-bold uppercase"
        style={{ color: 'rgb(var(--discernment-text))', letterSpacing: '0.1em' }}
      >
        {label}
      </label>
      <p className="m-0 mb-1.5 font-sans text-body-sm text-body">{prompt}</p>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        rows={2}
        className="block w-full resize-y border border-border bg-[rgb(var(--white))] p-2.5 font-sans text-body-sm text-ink focus:border-ink"
        style={{ minHeight: 60, lineHeight: 1.5 }}
      />
    </div>
  );
}

function RefinementTextarea({
  id,
  value,
  onChange,
  disabled,
  minHeight = 120,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  minHeight?: number;
}): JSX.Element {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      rows={4}
      aria-label="Your refined prompt"
      placeholder="Write your refined prompt here…"
      className="block w-full resize-y border border-border bg-[rgb(var(--white))] p-3 font-sans text-body text-ink placeholder:text-muted focus:border-ink"
      style={{ minHeight, lineHeight: 1.55 }}
    />
  );
}
