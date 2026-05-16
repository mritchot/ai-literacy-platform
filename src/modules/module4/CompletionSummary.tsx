// S10 CompletionSummary — personalized competency profile rendering
// the learner's authored artifacts back into a structured profile
// organized by the four 4D competencies. Includes a 30/60/90-day
// behavioral milestone table and a client-side PDF export.
//
// Gating: the profile shows substantive content only when all four
// modules are complete. An incomplete-state placeholder directs the
// learner to finish the program first.
//
// Data flow: all artifacts are read from LearnerProgressContext via
// the storage keys established by P4 (M2 action commitment), P9
// (prompt reformulation), P10 (output verification — KC results),
// P11 (iterative refinement — Turn 3 authored prompt), and P12
// (diligence statement). Module completion is derived from the
// program's MODULES metadata + state.completedSections (there is no
// dedicated `completedModules` field in the context state).

import { useEffect, useMemo, useRef } from 'react';
import { R7Trigger } from '../../components/reference/R7Trigger';
import { ReferenceTabRail } from '../../components/reference/ReferenceTabRail';
import { Icon } from '../../components/shared/Icon';
import { Overline } from '../../components/shared/Overline';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { MODULES } from '../../data/program';
import { generateCompletionPDF, type CompletionProfileData } from './generate-completion-pdf';

// 4D competency hex colors — matched to the on-screen accent treatment
// used throughout the platform (R1 Quick Reference, KC tone borders).
const COLORS = {
  delegation: '#6B7F5E',
  description: '#8B7355',
  discernment: '#5E7080',
  diligence: '#7A6B80',
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
  }, [state.scrolledSections, state.interactionCompleteSections, isSectionComplete]);

  // Fire the view event once when the complete profile first renders.
  // The ref guard prevents re-fires on every state change in the
  // context (which would happen if the dependency array included
  // `track` and `track`'s identity changed).
  const viewedRef = useRef(false);
  useEffect(() => {
    if (!allModulesComplete || viewedRef.current) return;
    viewedRef.current = true;
    track({ type: 'completion_profile_viewed', moduleId: 4, sectionId: 10 });
  }, [allModulesComplete, track]);

  if (!allModulesComplete) {
    return (
      <div
        className="rounded-lg font-sans"
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
  const task1 = state.reflections['2.5.p4_task1'] ?? '';
  const task2 = state.reflections['2.5.p4_task2'] ?? '';
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

  // KC aggregate
  const kcTotal = ALL_KC_KEYS.length;
  const kcCorrect = ALL_KC_KEYS.reduce((acc, key) => {
    const result = state.knowledgeChecks[key];
    return result?.isPreferred ? acc + 1 : acc;
  }, 0);

  // Completion date — derive from the most recent reflection or KC
  // timestamp in state, falling back to today. Timestamps live on
  // KnowledgeCheckResult objects; reflections don't carry per-field
  // timestamps, so KCs are the primary signal.
  const completionDate = useMemo(() => formatCompletionDate(state), []);

  const pdfData: CompletionProfileData = {
    completionDate,
    task1,
    task2,
    p9Product,
    p9Process,
    p9Performance,
    p10Accuracy,
    p10Total,
    p11Refinement,
    p12Statement,
    kcCorrect,
    kcTotal,
  };

  // PDF generation is async because the DM font TTFs need to be
  // fetched (from inlined data: URLs in production) and registered
  // with jsPDF before rendering. The first click incurs the font
  // load; subsequent clicks reuse the cached binaries.
  const onDownloadPDF = async () => {
    track({ type: 'completion_pdf_downloaded', moduleId: 4, sectionId: 10 });
    await generateCompletionPDF(pdfData);
  };

  return (
    <div className="space-y-6">
      {/* R7 (Team AI Policy Starter) is referenced in the 90-day
          milestone below. Mounting the rail here (inside the gated
          profile) keeps it visible on the page where it's named, while
          hiding it on the placeholder. ReferenceTabRail uses fixed
          positioning, so its DOM placement here is fine. */}
      <ReferenceTabRail>
        <R7Trigger variant="tab" label="Policy Starter" />
      </ReferenceTabRail>
      <div>
        <ProfileHeader completionDate={completionDate} onDownload={onDownloadPDF} />
        {/* Fit caveat — sits directly under the header so it stays
            adjacent to the Download button without disturbing the
            header's title/button alignment. The PDF is a fixed-rect
            2×2 landscape grid (R8 spec); long fields auto-shrink
            (down to 7pt) before truncation kicks in. The note keeps
            the learner from thinking the PDF lost data when their
            P12 statement runs past the fit budget. */}
        <p
          className="m-0 font-sans text-caption text-tertiary"
          style={{ textAlign: 'right', marginTop: 6, paddingRight: 4, lineHeight: 1.45 }}
        >
          The PDF auto-fits long responses; very long ones may truncate. Full versions stay on this page.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2" style={{ gridAutoRows: '1fr' }}>
        <DelegationCard task1={task1} task2={task2} />
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
      <MilestoneTable task1={task1} p12Statement={p12Statement} />
      <p
        className="m-0 font-sans text-body-sm text-secondary"
        style={{ textAlign: 'center', lineHeight: 1.55 }}
      >
        This profile is a snapshot of where you are now; the milestones above show where the
        practice goes next.
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
      className="rounded-lg"
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
          style={{ color: COLORS.diligence, letterSpacing: '0.1em' }}
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
        className="inline-flex items-center gap-2 rounded-md font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] hover:opacity-90"
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
  label,
  heading,
  children,
  footerNote,
}: {
  accent: string;
  label: string;
  heading: string;
  children: React.ReactNode;
  footerNote: string;
}): JSX.Element {
  return (
    <article
      className="flex h-full flex-col rounded-lg"
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
      <Overline className="mb-1.5" style={{ color: accent, letterSpacing: '0.1em' }}>
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

function DelegationCard({ task1, task2 }: { task1: string; task2: string }): JSX.Element {
  const hasContent = task1.trim().length > 0 || task2.trim().length > 0;
  return (
    <CompetencyCard
      accent={COLORS.delegation}
      label="Delegation"
      heading="What you committed to changing"
      footerNote="From Module 2: Action Commitment"
    >
      {hasContent ? (
        <>
          <QuotedBlock label="Task 1" value={task1} />
          <QuotedBlock label="Task 2" value={task2} />
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
      label="Diligence"
      heading="Your AI practices, documented"
      footerNote="From Module 4: Diligence Statement"
    >
      {statement.trim().length > 0 ? (
        <div
          className="rounded-md font-sans text-body-sm text-body"
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
          className="rounded-md font-sans text-body-sm text-body"
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
      className="rounded-md font-sans"
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

// ─── 30/60/90 milestones ──────────────────────────────────────────

function MilestoneTable({
  task1,
  p12Statement,
}: {
  task1: string;
  p12Statement: string;
}): JSX.Element {
  const rows: { days: string; target: string; connection: JSX.Element }[] = [
    {
      days: '30 days',
      target:
        'Produce a diligence statement for at least one AI-assisted deliverable in your actual work.',
      connection:
        p12Statement.trim().length > 0 ? (
          <>
            <span className="font-semibold text-ink">Your template →</span>{' '}
            <span className="italic">
              {truncateToLines(p12Statement, 200)}
            </span>
          </>
        ) : (
          <span className="italic text-muted">
            Complete the diligence statement builder to see your template here.
          </span>
        ),
    },
    {
      days: '60 days',
      target:
        'Apply the delegation framework to a new task category beyond the two you identified.',
      connection:
        task1.trim().length > 0 ? (
          <>
            <span className="font-semibold text-ink">Your starting point →</span>{' '}
            <span className="italic">{truncateToLines(task1, 120)}</span>
          </>
        ) : (
          <span className="italic text-muted">
            Complete the action commitment to see your commitment here.
          </span>
        ),
    },
    {
      days: '90 days',
      target:
        'Initiate a team-level conversation about AI use practices using the 4D vocabulary.',
      connection: (
        <>
          <span className="font-semibold text-ink">Your tool →</span>{' '}
          <span>R7 Team AI Policy Starter (available in the reference panel).</span>
        </>
      ),
    },
  ];

  return (
    <section
      aria-label="30, 60, and 90 day milestones"
      className="rounded-lg"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        borderTop: `3px solid ${COLORS.diligence}`,
        padding: '18px 22px',
      }}
    >
      <Overline
        className="mb-4"
        style={{ color: COLORS.diligence, letterSpacing: '0.1em' }}
      >
        30 / 60 / 90 day milestones
      </Overline>
      <ul className="m-0 list-none space-y-4 p-0">
        {rows.map((row, i) => (
          <li
            key={row.days}
            className="grid items-start gap-4"
            style={{
              gridTemplateColumns: '90px 1fr',
              paddingTop: i === 0 ? 0 : 12,
              borderTop:
                i === 0 ? 'none' : '1px solid rgb(var(--border-light))',
            }}
          >
            <span
              className="inline-flex items-center justify-center rounded-full font-mono text-[11px] font-bold uppercase text-[rgb(var(--white))]"
              style={{
                background: COLORS.diligence,
                padding: '6px 10px',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                width: 'fit-content',
              }}
            >
              {row.days}
            </span>
            <div>
              <p
                className="m-0 mb-1 font-sans text-body-sm text-ink"
                style={{ lineHeight: 1.5 }}
              >
                {row.target}
              </p>
              <p
                className="m-0 font-sans text-body-sm text-secondary"
                style={{ lineHeight: 1.5 }}
              >
                {row.connection}
              </p>
            </div>
          </li>
        ))}
      </ul>
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
