// P1: DataNarrative — three sequential stories with scroll-blocking gates
// (4C spec §3.1). Stories 2 and 3 stay visible on scroll but dimmed and
// non-interactive (`opacity: 0.3`, `pointer-events: none`) until the
// preceding interpretation check is submitted; on submit they transition
// to full opacity over 300ms.
//
// A sentinel element placed below each unsubmitted IC scrolls the IC back
// into view if the learner pages past it — a one-shot per story so the
// scroll-back doesn't fire repeatedly while the learner reads context.

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { Citation } from '../../components/shared/Citation';
import { InterpretationCheck } from '../../components/shared/InterpretationCheck';
import { Overline } from '../../components/shared/Overline';
import { AdoptionTrendChart } from './AdoptionTrendChart';
import {
  CensusEnterpriseInset,
  GeographicAdoptionChart,
  type GeoCountry,
  type TierRange,
} from './GeographicAdoptionChart';
import { GDPCorrelationScatter } from './GDPCorrelationScatter';
import { SkillDemandBar } from './SkillDemandBar';
import { MODULE_1_DEBRIEFS, MODULE_1_IC_ITEMS } from './interpretation-check-items';

interface SkillRow {
  rank: number;
  skill: string;
  netIncrease: number;
}

interface CollaborationPoint {
  wave: string;
  period: string;
  augmentation: number;
  automation: number;
}

interface DirectivePoint {
  wave: string;
  period: string;
  directiveShare: number;
}

interface DataNarrativeProps {
  skills: SkillRow[];
  instability: { prior2020: number; prior2023: number; current: number };
  /** Full Anthropic Economic Index country dataset (>=200 obs filter
   *  applied). Sourced from `src/data/geographic-adoption-full.json`. */
  countries: GeoCountry[];
  tierRanges: Record<string, TierRange>;
  censusAdoption: { fall2023: number; earlyAugust2025: number; description: string };
  collaboration: CollaborationPoint[];
  directive: DirectivePoint[];
  classifierCaveat: string;
}

interface StoryShellProps {
  storyNumber: 1 | 2 | 3;
  headline: string;
  unlocked: boolean;
  ic: (typeof MODULE_1_IC_ITEMS)[number] | null;
  children: ReactNode;
  debrief?: string | null;
}

export function DataNarrative(props: DataNarrativeProps): JSX.Element {
  const { state } = useLearnerProgress();

  const ic1Submitted = Boolean(state.knowledgeChecks['1.3.ic_1_1']);
  const ic2Submitted = Boolean(state.knowledgeChecks['1.3.ic_1_2']);
  const ic3Submitted = Boolean(state.knowledgeChecks['1.3.ic_1_3']);

  return (
    <div className="space-y-8">
      {/* R1 (4D Quick Reference) is intentionally NOT mounted here —
          the 4D vocabulary isn't introduced until S5, so the trigger
          would invite the learner to peek at terminology they haven't
          encountered yet. The tab rail moves to S5 alongside the
          vocabulary block. */}
      <StoryShell
        storyNumber={1}
        headline="What employers say they need, and what's standing in the way"
        unlocked
        ic={MODULE_1_IC_ITEMS[0] ?? null}
        debrief={ic1Submitted ? MODULE_1_DEBRIEFS.ic_1_1 ?? null : null}
      >
        <Story1Body skills={props.skills} instability={props.instability} />
      </StoryShell>

      <StoryShell
        storyNumber={2}
        headline="Geography, context, and the adoption gap"
        unlocked={ic1Submitted}
        ic={MODULE_1_IC_ITEMS[1] ?? null}
        debrief={ic2Submitted ? MODULE_1_DEBRIEFS.ic_1_2 ?? null : null}
      >
        <Story2Body
          countries={props.countries}
          tierRanges={props.tierRanges}
          censusAdoption={props.censusAdoption}
        />
      </StoryShell>

      <StoryShell
        storyNumber={3}
        headline="Twelve months of behavioral shift"
        unlocked={ic2Submitted}
        ic={MODULE_1_IC_ITEMS[2] ?? null}
        debrief={ic3Submitted ? MODULE_1_DEBRIEFS.ic_1_3 ?? null : null}
      >
        <Story3Body
          collaboration={props.collaboration}
          directive={props.directive}
          classifierCaveat={props.classifierCaveat}
        />
      </StoryShell>
    </div>
  );
}

function StoryShell({
  storyNumber,
  headline,
  unlocked,
  ic,
  children,
  debrief,
}: StoryShellProps): JSX.Element {
  const articleRef = useRef<HTMLElement>(null);
  const icRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrolledBackRef = useRef(false);
  const viewedRef = useRef(false);
  const { state } = useLearnerProgress();
  const { track } = useAnalytics();

  const icKey = ic ? `1.3.${ic.id}` : '';
  const icSubmitted = ic ? Boolean(state.knowledgeChecks[icKey]) : true;

  // View-tracking — fires once per story when at least 10% of it enters the
  // viewport AND the story is unlocked (no point logging "viewed" while a
  // story is dimmed and unreadable).
  useEffect(() => {
    if (!unlocked || viewedRef.current) return;
    const el = articleRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !viewedRef.current) {
            viewedRef.current = true;
            track({ type: `p1_story_${storyNumber}_viewed`, moduleId: 1, sectionId: 3 });
            obs.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -40% 0px', threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [storyNumber, track, unlocked]);

  // Scroll-back: when the story is unlocked AND its IC has not been
  // submitted, watch the sentinel below the IC. If it enters the viewport
  // (the learner scrolled past), bring the IC back into view. One-shot.
  useEffect(() => {
    if (!unlocked || icSubmitted || !ic) return;
    scrolledBackRef.current = false;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !scrolledBackRef.current) {
            scrolledBackRef.current = true;
            icRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      },
      { threshold: 0 },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [unlocked, icSubmitted, ic]);

  const onIcSubmitted = useCallback(() => {
    scrolledBackRef.current = false;
  }, []);

  return (
    <article
      ref={articleRef}
      data-story-index={storyNumber}
      className="rounded-xl"
      style={{
        background: 'rgb(var(--white))',
        border: '1px solid rgb(var(--border))',
        padding: '24px 26px 22px',
        opacity: unlocked ? 1 : 0.3,
        pointerEvents: unlocked ? 'auto' : 'none',
        transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      aria-hidden={unlocked ? undefined : true}
    >
      <Overline className="mb-2" style={{ fontSize: 11 }}>
        Story {storyNumber} of 3
      </Overline>
      <h3
        className="m-0 mb-4 font-display text-h2 font-normal text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        {headline}
      </h3>

      {children}

      {ic && (
        <div ref={icRef} className="mt-8">
          <InterpretationCheck
            moduleId={1}
            sectionId={3}
            item={ic}
            trackingEvent={`${ic.id}_submitted`}
            onSubmitted={onIcSubmitted}
          />
        </div>
      )}

      {debrief && (
        <p
          className="m-0 mt-6 font-sans text-body text-body transition-opacity duration-200"
          style={{ opacity: 1 }}
        >
          {debrief}
        </p>
      )}

      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1, marginTop: 4 }} />
    </article>
  );
}

// ─── Story bodies ────────────────────────────────────────────────────

function Story1Body({
  skills,
  instability,
}: {
  skills: SkillRow[];
  instability: { prior2020: number; prior2023: number; current: number };
}): JSX.Element {
  return (
    <>
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          The World Economic Forum regularly surveys over a thousand employers across 55 economies
          about the skills they expect to need most in the coming years. The 2025 report identifies
          a familiar pattern with one important shift: AI and big data literacy now ranks as the
          single fastest-growing skill demand in the global workforce, ahead of cybersecurity,
          creative thinking, and leadership.
        </p>
        <p className="m-0">
          That ranking reflects more than enthusiasm. Eighty-five percent of surveyed employers
          plan to upskill their workforce in AI-related competencies by 2030. But the same
          employers identify a persistent obstacle: the workforce doesn’t have the skills yet, and
          this gap, not technology access or budgets or regulation, is the factor most
          employers cite as the primary barrier to their AI transformation.
        </p>
        <p className="m-0">
          The chart below shows the top rising skills. Below it, a callout tracks how quickly the
          required skills are turning over — a measure called skills instability that captures the
          share of core workforce skills expected to change over a five-year window.
        </p>
      </div>

      <div className="my-6">
        <SkillDemandBar skills={skills} instability={instability} />
      </div>
    </>
  );
}

function Story2Body({
  countries,
  tierRanges,
  censusAdoption,
}: {
  countries: GeoCountry[];
  tierRanges: Record<string, TierRange>;
  censusAdoption: { fall2023: number; earlyAugust2025: number; description: string };
}): JSX.Element {
  return (
    <>
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          AI adoption isn’t uniform. Where you sit geographically and institutionally shapes
          whether AI is available to you and how it gets used. The data you’re about to explore
          comes from an analysis of one million AI conversations, measuring usage rates relative
          to working-age population across countries.
        </p>
        <p className="m-0">
          What stands out is less about how much AI gets used than about how. Countries with high
          adoption rates tend to use AI across a wider range of tasks, including creative,
          analytical, and operational work. Countries with lower adoption concentrate
          overwhelmingly on a single use case: coding. The pattern suggests that adoption breadth,
          not volume alone, is a sign of maturity.
        </p>
      </div>

      <div className="my-6 space-y-5">
        <GeographicAdoptionChart countries={countries} tierRanges={tierRanges} />
        <GDPCorrelationScatter countries={countries} />
        <p className="m-0 font-sans text-body text-body">
          The relationship between income and adoption is real, but it is not the whole story.
          Countries with comparable GDP per capita can have sharply different adoption rates. The
          research identifies several factors that contribute beyond income: digital
          infrastructure maturity, the proportion of knowledge work in a country’s economy,
          regulatory environments around technology, and organizational norms about AI use. For
          organizations operating across regions, this means that providing AI access does not
          automatically produce AI adoption. The institutional context shapes whether and how
          tools get used.
        </p>
        <CensusEnterpriseInset adoption={censusAdoption} />
        <p
          className="m-0 font-mono text-caption text-muted"
          style={{ letterSpacing: '0.02em' }}
        >
          Source: Appel, McCrory &amp; Tamkin, Sep 2025 (countries); Figure 3.1, p. 32
          (enterprise). Country-level data from the Anthropic Economic Index open dataset (MIT
          license).
        </p>
      </div>
    </>
  );
}

function Story3Body({
  collaboration,
  directive,
  classifierCaveat,
}: {
  collaboration: CollaborationPoint[];
  directive: DirectivePoint[];
  classifierCaveat: string;
}): JSX.Element {
  return (
    <>
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          The previous two stories showed you market demand and adoption patterns as snapshots.
          This one shows you how the picture is moving.
        </p>
        <p className="m-0">
          Researchers tracked how professionals interact with AI tools across three measurement
          periods spanning twelve months. Two patterns stand out. First, the share of purely
          directive interactions (where a user hands a complete task to the model and accepts
          the result with minimal back-and-forth) rose sharply from 28% to 39% between January
          and August 2025, then partially fell back to 32% by November
          <Citation ids={['handa-2025', 'appel-mccrory-tamkin-2025']} pageKey="directive-share-28" />.
          Second, the balance between augmentation (using AI to enhance your own thinking) and
          automation (delegating tasks to AI entirely) shifted meaningfully during the same
          period.
        </p>
        <p className="m-0">
          These patterns introduce a distinction that will be central to the rest of this program:
          are you augmenting, or are you automating?
        </p>
      </div>

      <div className="my-6">
        <AdoptionTrendChart
          collaboration={collaboration}
          directive={directive}
          classifierCaveat={classifierCaveat}
        />
      </div>
    </>
  );
}
