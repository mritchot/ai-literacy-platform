// S10 CompletionSummary — personalized competency profile rendering
// the learner's authored artifacts back into a structured profile
// organized by the four 4D competencies. Includes a "Where to focus
// next" panel built from post-assessment misses, a weekly practice row
// and 30/60/90-day behavioral milestone table with calendar check-in
// reminders, and a
// client-side PDF export.
//
// Gating: the profile shows substantive content only when all four
// modules are complete. An incomplete-state placeholder directs the
// learner to finish the program first.
//
// Data flow: all artifacts are read from LearnerProgressContext via
// the storage keys established by P4 (M2 action commitment, revised in
// M4 S9), P8 (task decomposition placement), P9 (prompt
// reformulation), P10 (output verification — KC results), P11
// (iterative refinement — Turn 3 authored prompt), and P12
// (diligence statement). Module completion is derived from the
// program's MODULES metadata + state.completedSections (there is no
// dedicated `completedModules` field in the context state).

import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AssessmentGrowth } from '../../components/assessment/AssessmentGrowth';
import { R7Trigger } from '../../components/reference/R7Trigger';
import { ReferenceTabRail } from '../../components/reference/ReferenceTabRail';
import { Icon } from '../../components/shared/Icon';
import { KCCalibration } from '../../components/shared/KCCalibration';
import { KCReview } from '../../components/shared/KCReview';
import { Overline } from '../../components/shared/Overline';
import { RefresherReminders } from '../../components/shared/RefresherReminders';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { currentCommitment } from '../../data/action-commitment';
import { POST_ASSESSMENT_ITEMS } from '../../data/post-assessment';
import { PRE_ASSESSMENT_ITEMS } from '../../data/pre-assessment';
import { MODULES } from '../../data/program';
import { FocusNextPanel } from './FocusNextPanel';
import {
  blockOutcomes,
  constructOutcomes,
  gainSentence,
  summarizeGrowth,
} from '../../utils/assessment-scoring';
import {
  generateCompletionPDF,
  type AssessmentBlockResult,
  type AssessmentGrowthData,
  type CompletionProfileData,
} from './generate-completion-pdf';
import {
  CHECK_IN_EXAMPLE_PROMPT,
  MILESTONES,
  R7_TOOL_LABEL,
  WEEKLY_PRACTICE,
  type MilestoneDays,
} from './milestones';
import { P8_CARDS } from './module4-content';

// 4D competency hex colors — matched to the on-screen accent treatment
// used throughout the platform (R1 Quick Reference, KC tone borders).
const COLORS = {
  delegation: 'rgb(var(--delegation))',
  description: 'rgb(var(--description))',
  discernment: 'rgb(var(--discernment))',
  diligence: 'rgb(var(--diligence))',
};

// All KC keys across the program. Used for the aggregate "X of Y
// preferred responses" summary. Per the activity codes:
//   M1 KCs (kc_1_1 … kc_1_4) live in section 7
//   M2 KCs (kc_2_1 … kc_2_4) live in section 7
//   M3 KCs (kc_3_1 … kc_3_4) live in section 10
//   M4 KCs split between section 4 (kc_4_1, kc_4_2) and section 7 (kc_4_3, kc_4_4)
const ALL_KC_KEYS = [
  '1.7.kc_1_1', '1.7.kc_1_2', '1.7.kc_1_3', '1.7.kc_1_4',
  '2.7.kc_2_1', '2.7.kc_2_2', '2.7.kc_2_3', '2.7.kc_2_4',
  '3.10.kc_3_1', '3.10.kc_3_2', '3.10.kc_3_3', '3.10.kc_3_4',
  '4.4.kc_4_1', '4.4.kc_4_2', '4.7.kc_4_3', '4.7.kc_4_4',
];

export function CompletionSummary(): JSX.Element {
  const { state, isSectionComplete } = useLearnerProgress();
  const { track } = useAnalytics();

  // Derive module-completion from the canonical split-bit completion
  // model (4E §11.5): a section is "done" only when BOTH
  // `scrolledSections[key]` AND `interactionCompleteSections[key]` are
  // true. The legacy single-bit `completedSections` map carries only
  // migrated pre-split data — it's empty for fresh runs even when every
  // section has been completed, so we must use `isSectionComplete()`
  // (which checks both bits) rather than reading `completedSections`
  // directly. There's no `completedModules` field on the state.
  const allModulesComplete = useMemo(() => {
    return MODULES.every((mod) =>
      mod.sections
        // Exclude S10 itself from the check — the profile shouldn't
        // require itself to be marked complete before it can render.
        .filter((sec) => !(mod.id === 4 && sec.id === 10))
        .every((sec) => isSectionComplete(mod.id, sec.id)),
    );
    // isSectionComplete's identity tracks every state change, so it is
    // the only dependency the memo needs.
  }, [isSectionComplete]);

  // Fire the view event once when the complete profile first renders.
  // The ref guard prevents re-fires on every state change in the
  // context (which would happen if the dependency array included
  // `track` and `track`'s identity changed).
  const viewedRef = useRef(false);
  const [downloadError, setDownloadError] = useState(false);
  useEffect(() => {
    if (!allModulesComplete || viewedRef.current) return;
    viewedRef.current = true;
    track({ type: 'completion_profile_viewed', moduleId: 4, sectionId: 10 });
  }, [allModulesComplete, track]);

  // Both memos live above the early return so the hook order is
  // identical on every render (Rules of Hooks); their bodies are
  // safe to run while the program is incomplete.
  // Completion date — derive from the most recent reflection or KC
  // timestamp in state, falling back to today. Timestamps live on
  // KnowledgeCheckResult objects; reflections don't carry per-field
  // timestamps, so KCs are the primary signal.
  const completionDate = useMemo(() => formatCompletionDate(state), [state]);

  // Pre/post assessment growth — aggregate per-block correct counts
  // from the recorded responses. Returns undefined when either side
  // is missing (portfolio reviewers without an assessment history,
  // or a learner who somehow reached this page without both
  // assessments) so the PDF can fall back to the standalone KC card.
  const growth = useMemo<AssessmentGrowthData | undefined>(() => {
    const preResponses = state.assessments?.pre?.responses ?? {};
    const postResponses = state.assessments?.post?.responses ?? {};
    if (
      !state.assessments?.pre?.completedAt ||
      !state.assessments?.post?.completedAt
    ) {
      return undefined;
    }
    // Scored by utils/assessment-scoring, the same rules as the results
    // screen. Block item counts come from the items themselves. Built as
    // an explicit 4-tuple (no cast) — the PDF layout depends on exactly
    // four rows, and a cast would let a fifth entry compile silently.
    const outcomes = constructOutcomes(
      PRE_ASSESSMENT_ITEMS,
      POST_ASSESSMENT_ITEMS,
      preResponses,
      postResponses,
    );
    const byBlock = blockOutcomes(outcomes);
    const blockFor = (
      key: 'usage' | 'failure' | 'mechanics' | 'evaluation',
      name: AssessmentBlockResult['name'],
    ): AssessmentBlockResult => {
      const b = byBlock.find((x) => x.block === key);
      return {
        name,
        items: b?.postAnswered ?? 0,
        preItems: b?.preAnswered ?? 0,
        pre: b?.preCorrect ?? 0,
        post: b?.postCorrect ?? 0,
        change: b?.change ?? 0,
      };
    };
    const blocks: AssessmentGrowthData['blocks'] = [
      blockFor('usage', 'Usage patterns'),
      blockFor('failure', 'Failure modes'),
      blockFor('mechanics', 'Mechanics'),
      blockFor('evaluation', 'Evaluation'),
    ];
    const summary = summarizeGrowth(outcomes);
    return {
      preTotal: summary.preCorrect,
      preItems: summary.preAnswered,
      postTotal: summary.postCorrect,
      postItems: summary.postAnswered,
      change: summary.change,
      gainText: gainSentence(summary),
      blocks,
    };
  }, [state.assessments]);

  if (!allModulesComplete) {
    return (
      <div
        className="font-sans"
        style={{
          background: 'rgb(var(--surface))',
          border: '1px solid rgb(var(--border))',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <p
          className="m-0 mb-2 font-sans text-h3 font-semibold text-ink"
          style={{ letterSpacing: '-0.005em' }}
        >
          Complete all four modules to see your profile
        </p>
        <p className="m-0 font-sans text-body-sm text-secondary">
          Your competency profile summarizes your work across the entire program. It becomes
          available once you've finished every section.
        </p>
      </div>
    );
  }

  // ── Pull learner artifacts from context state ──────────────────
  const commitment = currentCommitment(state.reflections);
  const { task1, task2 } = commitment;
  const p9Product = state.reflections['4.3.p9_product'] ?? '';
  const p9Process = state.reflections['4.3.p9_process'] ?? '';
  const p9Performance = state.reflections['4.3.p9_performance'] ?? '';
  const p11Refinement = state.reflections['4.6.p11_t3_refinement'] ?? '';
  const p12Statement = state.reflections['4.8.p12_statement'] ?? '';

  // P10 triage accuracy: 6 elements, each stored with isPreferred = true
  // when the learner's classification matched the intended one.
  const p10Total = 6;
  const p10Accuracy = ['element_1', 'element_2', 'element_3', 'element_4', 'element_5', 'element_6']
    .reduce((acc, id) => {
      const result = state.knowledgeChecks[`4.5.${id}`];
      return result?.isPreferred ? acc + 1 : acc;
    }, 0);

  // P8 decomposition: each card is stored with isPreferred = true when
  // the learner placed it in its intended category. Gives the Delegation
  // card the same kind of performance measure Discernment has from P10.
  const p8Total = P8_CARDS.length;
  const p8Results = P8_CARDS.map((card) => state.knowledgeChecks[`4.2.${card.id}`]);
  const p8Answered = p8Results.filter((r) => r !== undefined).length;
  const p8Accuracy = p8Results.filter((r) => r?.isPreferred).length;

  // KC aggregate
  const kcTotal = ALL_KC_KEYS.length;
  const kcCorrect = ALL_KC_KEYS.reduce((acc, key) => {
    const result = state.knowledgeChecks[key];
    return result?.isPreferred ? acc + 1 : acc;
  }, 0);

  const pdfData: CompletionProfileData = {
    completionDate,
    task1,
    task2,
    task1Revised: commitment.task1Revised,
    task2Revised: commitment.task2Revised,
    p8Accuracy,
    p8Answered,
    p8Total,
    p9Product,
    p9Process,
    p9Performance,
    p10Accuracy,
    p10Total,
    p11Refinement,
    p12Statement,
    kcCorrect,
    kcTotal,
    growth,
  };

  // PDF generation is async because the font TTFs need to be
  // fetched (from inlined data: URLs in production) and registered
  // with jsPDF before rendering. The first click incurs the font
  // load; subsequent clicks reuse the cached binaries.
  const onDownloadPDF = async () => {
    setDownloadError(false);
    try {
      await generateCompletionPDF(pdfData);
      // Tracked on success only — a failed generation is not a download.
      track({ type: 'completion_pdf_downloaded', moduleId: 4, sectionId: 10 });
    } catch {
      setDownloadError(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* R7 (Team AI Policy Starter) is referenced in the 90-day
          milestone below. Mounting the rail here (inside the gated
          profile) keeps it visible on the page where it's named, while
          hiding it on the placeholder. ReferenceTabRail uses fixed
          positioning, so its DOM placement here is fine. */}
      <ReferenceTabRail>
        <R7Trigger label="Policy Starter" />
      </ReferenceTabRail>
      {/* ProfileHeader leads the page — it's the document title block
          (program name, completion date, Download PDF action). Putting
          it first gives the page a proper cover-page → content reading
          order. Previously this sat between AssessmentGrowth and the
          competency cards, which created two competing titles on the
          page and read like an interleaved cover sheet.
          Caveat caption is rewritten to make sense at the top of the
          page (it now references the on-screen content "below"
          instead of being adjacent to it). */}
      <div>
        <ProfileHeader completionDate={completionDate} onDownload={onDownloadPDF} />
      {downloadError && (
        <p
          role="alert"
          className="m-0 font-sans text-body-sm"
          style={{ color: 'rgb(var(--error))' }}
        >
          The PDF could not be generated. Check your connection and try again.
        </p>
      )}
        <p
          className="m-0 font-sans text-caption text-tertiary"
          style={{ textAlign: 'right', marginTop: 6, paddingRight: 4, lineHeight: 1.45 }}
        >
          Note: long responses may truncate in the PDF. The on-screen version below shows everything in full.
        </p>
      </div>
      {/* Assessment Growth — pre→post comparative view. Sits above the
          competency cards so the learner sees the program-level
          measurement before the per-competency artifacts. Renders its
          own placeholder when either assessment is missing (portfolio
          review case). */}
      <AssessmentGrowth />
      {/* Same fix pattern as the M4 S8 ExemplarComparison grid:
          explicit `grid-cols-1` for mobile so the single column
          doesn't auto-size to the widest cell's min-content (which
          for any of the four cards could include an unbreakable
          user-typed string from a P4/P9/P11/P12 saved artifact).
          `lg:grid-cols-2` restores the 2x2 layout at desktop. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" style={{ gridAutoRows: '1fr' }}>
        <DelegationCard
          task1={task1}
          task2={task2}
          task1Revised={commitment.task1Revised}
          task2Revised={commitment.task2Revised}
          tellWho={commitment.tellWho}
          p8Accuracy={p8Accuracy}
          p8Answered={p8Answered}
          p8Total={p8Total}
        />
        <DescriptionCard
          product={p9Product}
          processField={p9Process}
          performance={p9Performance}
        />
        <DiscernmentCard
          p10Accuracy={p10Accuracy}
          p10Total={p10Total}
          p11Refinement={p11Refinement}
        />
        <DiligenceCard statement={p12Statement} />
      </div>
      <KCSummaryBar kcCorrect={kcCorrect} kcTotal={kcTotal} />
      <KCCalibration results={ALL_KC_KEYS.map((key) => state.knowledgeChecks[key])} />
      {/* Knowledge check review — collapsed-by-default expandable
          section. Mirrors the pre/post AssessmentResults pattern so KCs
          get the same response-transparency treatment as assessment
          items. The KCSummaryBar above remains the at-a-glance
          single-number; KCReview is the deeper drill-down path. */}
      <KCReview />
      {/* Feed-forward from the post-assessment misses (AE-04): sits
          between the look-back sections above and the milestones. */}
      <FocusNextPanel />
      <MilestoneTable
        task1={task1}
        task2={task2}
        p8Accuracy={p8Accuracy}
        p8Answered={p8Answered}
        p8Total={p8Total}
        examples={state.refresherExamples ?? {}}
      />
      <p
        className="m-0 font-sans text-body-sm text-secondary"
        style={{ textAlign: 'center', lineHeight: 1.55 }}
      >
        This profile is a snapshot of where you are now. The milestones above set out what to
        practice next.
      </p>
      {/* Soft invitation to the standalone creator page — first-person
          origin story + tip / blog links. Hash-router link so it works
          without a Router-aware import. Caption-size, action-color: a
          present option rather than a required next step. */}
      <div className="mt-8 text-center">
        <a
          href="#/thank-you"
          className="font-sans text-body-sm font-medium text-action no-underline hover:underline"
        >
          A note from the creator →
        </a>
      </div>
    </div>
  );
}

// ─── Completion-date derivation ───────────────────────────────────

function formatCompletionDate(state: ReturnType<typeof useLearnerProgress>['state']): string {
  // The KnowledgeCheckResult records carry millisecond timestamps;
  // the latest one approximates when the learner last engaged. If
  // none exist (impossible at this point since the gating check
  // passed, but defensive), fall back to today.
  let latest = 0;
  for (const result of Object.values(state.knowledgeChecks)) {
    if (typeof result?.timestamp === 'number' && result.timestamp > latest) {
      latest = result.timestamp;
    }
  }
  const d = latest > 0 ? new Date(latest) : new Date();
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Profile header ───────────────────────────────────────────────

function ProfileHeader({
  completionDate,
  onDownload,
}: {
  completionDate: string;
  onDownload: () => void;
}): JSX.Element {
  return (
    <header
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${COLORS.diligence}`,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <Overline
          className="mb-1"
          style={{ color: 'rgb(var(--diligence-text))', letterSpacing: '0.1em' }}
        >
          Competency Profile
        </Overline>
        <h2
          className="m-0 mb-1 font-sans text-h2 font-semibold text-ink"
          style={{ letterSpacing: '-0.005em' }}
        >
          AI Literacy for the Modern Workforce
        </h2>
        <p className="m-0 font-sans text-body-sm text-secondary">Completed {completionDate}</p>
      </div>
      <button
        type="button"
        onClick={onDownload}
        className="inline-flex items-center gap-2 font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] hover:opacity-90"
        style={{
          background: COLORS.diligence,
          padding: '10px 16px',
          cursor: 'pointer',
        }}
      >
        <Icon name="download" size={14} />
        Download PDF
      </button>
    </header>
  );
}

// ─── Competency cards ─────────────────────────────────────────────

function CompetencyCard({
  accent,
  accentText,
  label,
  heading,
  children,
  footerNote,
}: {
  /** Brand accent for the decorative left rule. */
  accent: string;
  /** Theme-adaptive text token for the overline — the brand hex sits
   *  at ~3:1 on the dark card surface, below AA. */
  accentText: string;
  label: string;
  heading: string;
  children: React.ReactNode;
  footerNote: string;
}): JSX.Element {
  return (
    <article
      className="flex h-full flex-col"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderLeft: `3px solid ${accent}`,
        padding: '18px 20px',
        // `minWidth: 0` lets the article shrink below its intrinsic
        // content width inside the grid column — without it, a long
        // unbreakable token in any child would force the column wider
        // and break the 2-up layout / equal-height behavior.
        minWidth: 0,
      }}
    >
      <Overline className="mb-1.5" style={{ color: accentText, letterSpacing: '0.1em' }}>
        {label}
      </Overline>
      <h3 className="m-0 mb-3 font-sans text-h4 font-semibold text-ink">{heading}</h3>
      <div className="flex-1 space-y-2">{children}</div>
      <p
        className="m-0 mt-4 font-mono text-caption text-tertiary"
        style={{ letterSpacing: '0.02em' }}
      >
        {footerNote}
      </p>
    </article>
  );
}

function DelegationCard({
  task1,
  task2,
  task1Revised,
  task2Revised,
  tellWho,
  p8Accuracy,
  p8Answered,
  p8Total,
}: {
  task1: string;
  task2: string;
  task1Revised: boolean;
  task2Revised: boolean;
  tellWho: string;
  p8Accuracy: number;
  p8Answered: number;
  p8Total: number;
}): JSX.Element {
  const hasContent = task1.trim().length > 0 || task2.trim().length > 0;
  const anyRevised = task1Revised || task2Revised;
  return (
    <CompetencyCard
      accent={COLORS.delegation}
      accentText="rgb(var(--delegation-text))"
      label="Delegation"
      heading="What you committed to changing"
      footerNote={
        anyRevised
          ? 'From Module 2: Action Commitment (revised in Module 4) + Module 4: Task Decomposition'
          : 'From Module 2: Action Commitment + Module 4: Task Decomposition'
      }
    >
      {p8Answered > 0 && (
        <p className="m-0 font-sans text-body-sm text-body" style={{ lineHeight: 1.55 }}>
          Decomposition:{' '}
          <strong className="text-ink">
            {p8Accuracy} of {p8Total} components placed as intended
          </strong>
        </p>
      )}
      {hasContent ? (
        <>
          <QuotedBlock label={task1Revised ? 'Task 1 · revised' : 'Task 1'} value={task1} />
          <QuotedBlock label={task2Revised ? 'Task 2 · revised' : 'Task 2'} value={task2} />
          {tellWho.length > 0 && (
            <p className="m-0 font-sans text-body-sm text-secondary" style={{ overflowWrap: 'anywhere' }}>
              You will tell: <span className="text-ink">{tellWho}</span>
            </p>
          )}
        </>
      ) : (
        <p className="m-0 font-sans text-body-sm italic text-muted">No commitment recorded.</p>
      )}
    </CompetencyCard>
  );
}

function DescriptionCard({
  product,
  processField,
  performance,
}: {
  product: string;
  processField: string;
  performance: string;
}): JSX.Element {
  const dims: { label: string; value: string }[] = [
    { label: 'Product', value: product },
    { label: 'Process', value: processField },
    { label: 'Performance', value: performance },
  ];
  return (
    <CompetencyCard
      accent={COLORS.description}
      accentText="rgb(var(--description-text))"
      label="Description"
      heading="How you specified the task"
      footerNote="From Module 4: Prompt Reformulation"
    >
      {dims.map((d) => (
        <div key={d.label}>
          <div
            className="mb-0.5 font-mono text-overline font-bold uppercase"
            // Theme-aware description-text variable matches the P9 input form's
            // label color so the profile card visually rhymes with the activity.
            style={{ color: 'rgb(var(--description-text))', letterSpacing: '0.1em' }}
          >
            {d.label}
          </div>
          {d.value.trim().length > 0 ? (
            <p
              className="m-0 font-sans text-body-sm text-body"
              style={{ lineHeight: 1.55, overflowWrap: 'anywhere' }}
            >
              {d.value}
            </p>
          ) : (
            <p className="m-0 font-sans text-body-sm italic text-muted">No response recorded.</p>
          )}
        </div>
      ))}
    </CompetencyCard>
  );
}

function DiscernmentCard({
  p10Accuracy,
  p10Total,
  p11Refinement,
}: {
  p10Accuracy: number;
  p10Total: number;
  p11Refinement: string;
}): JSX.Element {
  const allCorrect = p10Accuracy === p10Total;
  return (
    <CompetencyCard
      accent={COLORS.discernment}
      accentText="rgb(var(--discernment-text))"
      label="Discernment"
      heading="How you evaluated AI output"
      footerNote="From Module 4: Output Verification + Iterative Refinement"
    >
      <p className="m-0 font-sans text-body-sm text-body" style={{ lineHeight: 1.55 }}>
        Triage accuracy:{' '}
        <strong className="text-ink">
          {p10Accuracy} of {p10Total} elements correctly triaged
        </strong>
        {allCorrect && (
          <span
            className="ml-2 font-mono text-[11px] font-bold uppercase"
            style={{
              color: 'rgb(var(--success))',
              letterSpacing: '0.05em',
            }}
          >
            (all correct)
          </span>
        )}
      </p>
      {p11Refinement.trim().length > 0 && (
        <QuotedBlock label="Your refinement" value={p11Refinement} />
      )}
    </CompetencyCard>
  );
}

function DiligenceCard({ statement }: { statement: string }): JSX.Element {
  return (
    <CompetencyCard
      accent={COLORS.diligence}
      accentText="rgb(var(--diligence-text))"
      label="Diligence"
      heading="Your AI practices, documented"
      footerNote="From Module 4: Diligence Statement"
    >
      {statement.trim().length > 0 ? (
        <div
          className="font-sans text-body-sm text-body"
          style={{
            background: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border-light))',
            padding: '12px 14px',
            whiteSpace: 'pre-wrap',
            // `pre-wrap` preserves the learner's line breaks but doesn't
            // break long unbroken tokens (URLs, codepoints). `anywhere`
            // forces breaks when no other break opportunity exists.
            overflowWrap: 'anywhere',
            lineHeight: 1.55,
          }}
        >
          {statement}
        </div>
      ) : (
        <p className="m-0 font-sans text-body-sm italic text-muted">No statement recorded.</p>
      )}
    </CompetencyCard>
  );
}

// Quoted-block sub-element used inside Delegation and Discernment
// cards. Surface-tinted, label-above-value layout.
function QuotedBlock({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <div
        className="mb-0.5 font-mono text-overline font-bold uppercase text-tertiary"
        style={{ letterSpacing: '0.1em' }}
      >
        {label}
      </div>
      {value.trim().length > 0 ? (
        <div
          className="font-sans text-body-sm text-body"
          style={{
            background: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border-light))',
            padding: '10px 12px',
            lineHeight: 1.55,
            overflowWrap: 'anywhere',
          }}
        >
          {value}
        </div>
      ) : (
        <p className="m-0 font-sans text-body-sm italic text-muted">No response recorded.</p>
      )}
    </div>
  );
}

// ─── KC summary bar ───────────────────────────────────────────────

function KCSummaryBar({
  kcCorrect,
  kcTotal,
}: {
  kcCorrect: number;
  kcTotal: number;
}): JSX.Element {
  return (
    <div
      className="font-sans"
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border-light))',
        padding: '12px 16px',
      }}
    >
      <p className="m-0 text-body-sm text-body">
        Knowledge checks:{' '}
        <strong className="text-ink">
          {kcCorrect} of {kcTotal} preferred responses
        </strong>
      </p>
    </div>
  );
}

// ─── Weekly practice and 30/60/90 milestones ──────────────────────

function MilestoneTable({
  task1,
  task2,
  p8Accuracy,
  p8Answered,
  p8Total,
  examples,
}: {
  task1: string;
  task2: string;
  p8Accuracy: number;
  p8Answered: number;
  p8Total: number;
  /** Check-in examples saved in the refresher, keyed '30' | '60' | '90'. */
  examples: Record<string, string>;
}): JSX.Element {
  const hasTask1 = task1.trim().length > 0;
  const hasTask2 = task2.trim().length > 0;
  const connections: Record<MilestoneDays, JSX.Element> = {
    30:
      hasTask1 || hasTask2 ? (
        <>
          <span className="font-semibold text-ink">Your tasks →</span>{' '}
          {hasTask1 && <span className="italic">Task 1: {truncateToLines(task1, 90)}</span>}
          {hasTask1 && hasTask2 && ' '}
          {hasTask2 && <span className="italic">Task 2: {truncateToLines(task2, 90)}</span>}
        </>
      ) : (
        <span className="italic text-muted">
          Complete the action commitment to see your tasks here.
        </span>
      ),
    60:
      p8Answered > 0 ? (
        <>
          <span className="font-semibold text-ink">Your practice run →</span>{' '}
          <span>
            You placed {p8Accuracy} of {p8Total} components as intended in the task decomposition
            exercise.
          </span>
        </>
      ) : (
        <span className="italic text-muted">
          Complete the task decomposition exercise to see your result here.
        </span>
      ),
    90: (
      <>
        <span className="font-semibold text-ink">Your tool →</span>{' '}
        <span>{R7_TOOL_LABEL} (available in the reference panel).</span>
      </>
    ),
  };
  // §4.9 names Task 2 (the oversight task) as the place to start the
  // weekly verification habit, so the weekly row quotes it.
  const weeklyRow = {
    days: WEEKLY_PRACTICE.label,
    target: WEEKLY_PRACTICE.target,
    connection: hasTask2 ? (
      <>
        <span className="font-semibold text-ink">Start with →</span>{' '}
        <span className="italic">Task 2: {truncateToLines(task2, 90)}</span>
      </>
    ) : (
      <span className="italic text-muted">
        Complete the action commitment to see your oversight task here.
      </span>
    ),
    example: '',
  };
  const rows = [
    weeklyRow,
    ...MILESTONES.map((m) => ({
      days: `${m.days} days`,
      target: m.target,
      connection: connections[m.days],
      example: (examples[String(m.days)] ?? '').trim(),
    })),
  ];

  return (
    <section
      aria-label="Weekly practice and 30, 60, and 90 day milestones"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${COLORS.diligence}`,
        padding: '18px 22px',
      }}
    >
      <Overline
        className="mb-4"
        style={{ color: 'rgb(var(--diligence-text))', letterSpacing: '0.1em' }}
      >
        Weekly practice and 30 / 60 / 90 day milestones
      </Overline>
      <ul className="m-0 list-none space-y-4 p-0">
        {rows.map((row, i) => (
          <li
            key={row.days}
            className="grid items-start gap-4"
            style={{
              // `minmax(0, 1fr)` instead of `1fr` — the bare `1fr` lets
              // the column grow to fit its content's min-content, which
              // includes unbreakable user-typed strings from the
              // P12/P9 artifact quotes embedded in the connection
              // text. That pushed both the connection line AND the
              // target line past the viewport on mobile. The `minmax`
              // caps the column at the available track width
              // regardless of content.
              gridTemplateColumns: '90px minmax(0, 1fr)',
              paddingTop: i === 0 ? 0 : 12,
              borderTop:
                i === 0 ? 'none' : '1px solid rgb(var(--border-light))',
            }}
          >
            <span
              className="inline-flex items-center justify-center font-mono text-[11px] font-bold uppercase text-[rgb(var(--white))]"
              style={{
                background: COLORS.diligence,
                border: `1px solid ${COLORS.diligence}`,
                padding: '6px 10px',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                width: 'fit-content',
              }}
            >
              {row.days}
            </span>
            <div className="min-w-0">
              <p
                className="m-0 mb-1 font-sans text-body-sm text-ink"
                style={{ lineHeight: 1.5 }}
              >
                {row.target}
              </p>
              {/* `break-words` on the connection paragraph so
                  unbreakable user-typed strings ("Hdjsjshava…") wrap
                  at any character rather than overflowing the cell. */}
              <p
                className="m-0 break-words font-sans text-body-sm text-secondary"
                style={{ lineHeight: 1.5 }}
              >
                {row.connection}
              </p>
              {row.example.length > 0 && (
                <p
                  className="m-0 mt-1 break-words font-sans text-body-sm text-secondary"
                  style={{ lineHeight: 1.5 }}
                >
                  <span className="font-semibold text-ink">Your example →</span>{' '}
                  <span className="italic">{truncateToLines(row.example, 160)}</span>
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p
        className="m-0 mt-4 border-t border-border-light pt-3 font-sans text-body-sm text-secondary"
        style={{ lineHeight: 1.5 }}
      >
        {CHECK_IN_EXAMPLE_PROMPT} The{' '}
        <Link to="/refresher" className="font-medium text-action no-underline hover:underline">
          refresher
        </Link>{' '}
        asks for it and brings back a few knowledge checks to answer from memory.
      </p>
      <div className="mt-4">
        <RefresherReminders placement="profile" />
      </div>
    </section>
  );
}

// Trim a text value to roughly N characters of single-spaced prose,
// preserving word boundaries. Used for the milestone connection
// excerpts that quote back the learner's longer artifacts.
function truncateToLines(text: string, max: number): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length <= max) return `"${compact}"`;
  return `"${compact.slice(0, max).trimEnd()}…"`;
}
