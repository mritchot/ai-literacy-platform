// Module 1 — Why AI Literacy Matters Now (4C spec §3-5).
// Renders the eight sections of the module sequentially, switching by the
// URL section param. Data files are imported here once and passed as props
// to chart components (4C spec §18.1).

import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  SectionContainer,
  getModuleOrThrow,
} from '../../components/shared/SectionContainer';
import { Citation } from '../../components/shared/Citation';
import { R1Trigger } from '../../components/reference/R1Trigger';
import { ReferenceTabRail } from '../../components/reference/ReferenceTabRail';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { KnowledgeCheck } from '../../components/shared/KnowledgeCheck';

import wefSkillDemand from '../../data/wef-skill-demand.json';
import geographicAdoption from '../../data/geographic-adoption.json';
import geographicAdoptionFull from '../../data/geographic-adoption-full.json';
import adoptionTrends from '../../data/adoption-trends.json';
import type { GeoCountry, TierRange } from './GeographicAdoptionChart';

import { DataNarrative } from './DataNarrative';
import { MODULE_1_KC_ITEMS } from './knowledge-check-items';
import { StigmaReflection } from './StigmaReflection';

const MODULE_ID = 1;

export default function Module1(): JSX.Element {
  const { sectionId: sectionParam } = useParams<{ sectionId?: string }>();
  const navigate = useNavigate();

  const sectionId = useMemo(() => {
    if (sectionParam === undefined) return 1;
    const parsed = Number.parseInt(sectionParam, 10);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 8) return 1;
    return parsed;
  }, [sectionParam]);

  // Normalize bare /module/1 to /module/1/section/1 so back/forward work.
  useEffect(() => {
    if (sectionParam === undefined) {
      navigate(`/module/${MODULE_ID}/section/1`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionParam]);

  const module = getModuleOrThrow(MODULE_ID);

  switch (sectionId) {
    case 1:
      return <Section1 module={module} />;
    case 2:
      return <Section2 module={module} />;
    case 3:
      return <Section3 module={module} />;
    case 4:
      return <Section4 module={module} />;
    case 5:
      return <Section5 module={module} />;
    case 6:
      return <Section6 module={module} />;
    case 7:
      return <Section7 module={module} />;
    case 8:
      return <Section8 module={module} />;
    default:
      return <Section1 module={module} />;
  }
}

type ModuleProp = { module: ReturnType<typeof getModuleOrThrow> };

// ─── S1: You Already Use AI ────────────────────────────────────────
function Section1({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={1}
      sectionTitle="You already use AI. Can you prove it’s working?"
      sectionLabel="Section 1 · Reading"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          If you use AI at work, you’re in good company: 86% of professionals report that it
          saves them time, and 65% say they’re satisfied with the results
          <Citation ids="anthropic-interviewer-2025" pageKey="time-savings-86" />. But
          widespread adoption is not the same thing as effective use. The tools can produce real
          productivity gains. The question is whether workers have the understanding and judgment
          to capture that value.
        </p>
        <p className="m-0">
          That question has become urgent faster than any previous technology shift. ChatGPT
          reached 100 million users within two months of launch — a pace no consumer
          application had achieved before. The tools are no longer emerging; they are embedded
          in daily workflows across industries. And the speed of that adoption has outrun most
          organizations’ ability to evaluate whether their people are using these tools well.
        </p>
        <p className="m-0">
          Sixty-three percent of employers
          worldwide identify workforce skill gaps, not tools or budget or infrastructure, as the
          single largest barrier to their AI transformation
          <Citation ids="wef-2025" pageKey="skill-gap-63" />. Your organization almost certainly
          has access to the technology. What it doesn’t have is a way to tell whether its
          people are using it well.
        </p>
        <p className="m-0">
          This module grounds that claim in data: what the market demands, where adoption is
          happening, how usage patterns are shifting, and why the gap between access and
          competence matters now.
        </p>
      </div>
    </SectionContainer>
  );
}

// ─── S2: The Strategic Landscape ────────────────────────────────────
function Section2({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={2}
      sectionTitle="The market picture"
      sectionLabel="Section 2 · Reading"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          AI tools have been adopted faster than any consumer technology in history, reaching mass
          usage in weeks rather than years. That speed is transforming the labor market faster
          than most organizations can adapt, and the data on that transformation is more
          complicated than the headlines suggest.
        </p>
        <p className="m-0">
          The next few sections explore three dimensions of that story through interactive data.
          Each one surfaces a pattern that most professionals haven’t seen, even those already
          using AI daily.
        </p>
        <h3 className="m-0 mt-6 font-sans text-h3 font-semibold text-ink">Demand</h3>
        <p className="m-0">
          The World Economic Forum regularly surveys over a thousand employers across 55 economies
          about the skills they expect to need most in the coming years. The 2025 report
          identifies a familiar pattern with one important shift: AI and big data literacy now
          ranks as the single fastest-growing skill demand in the global workforce
          <Citation ids="wef-2025" pageKey="fastest-growing-skills" />, ahead of cybersecurity,
          creative thinking, and leadership. Most organizations recognize the shift: 85% plan to
          upskill their workforce<Citation ids="wef-2025" pageKey="upskill-85" /> in response.
          But planning isn’t execution: skill gaps remain the single largest barrier to AI
          transformation across industries, outranking budget, technology access, and regulatory
          uncertainty. Nearly every organization intends to adapt, but far fewer are able to.
        </p>
        <h3 className="m-0 mt-6 font-sans text-h3 font-semibold text-ink">Geography</h3>
        <p className="m-0">
          AI adoption is not uniform. Where you work, and the institutional context around you,
          shapes how much AI gets used, by whom, and for what. For organizations with teams
          across regions, this creates a practical problem: different locations developing AI
          capabilities at different rates, for different tasks, with no shared baseline.
        </p>
        <h3 className="m-0 mt-6 font-sans text-h3 font-semibold text-ink">Behavior</h3>
        <p className="m-0">
          How the workforce uses AI is changing rapidly, and the direction of that change matters.
          The way professionals interacted with AI tools twelve months ago is measurably different
          from how they interact today, and that shift points to a new kind of judgment these
          tools now demand.
        </p>
      </div>
    </SectionContainer>
  );
}

// ─── S3 / P1: Interactive Data Narrative ────────────────────────────
function Section3({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();

  // Section completes once all three interpretation checks have been
  // submitted — `knowledgeChecks` is the persisted IC store.
  useEffect(() => {
    const allDone =
      Boolean(state.knowledgeChecks['1.3.ic_1_1']) &&
      Boolean(state.knowledgeChecks['1.3.ic_1_2']) &&
      Boolean(state.knowledgeChecks['1.3.ic_1_3']);
    if (allDone && !state.completedSections['1.3']) {
      markInteractionComplete(1, 3);
    }
  }, [state.knowledgeChecks, state.completedSections, markInteractionComplete]);

  return (
    <SectionContainer
      module={module}
      sectionId={3}
      sectionTitle="Data narrative — the workforce shift"
      sectionLabel="Section 3 · P1 Interactive"
      width="interactive"
    >
      <p className="m-0 mb-6 font-sans text-body text-body">
        Below are three sequential stories. Each one combines a few paragraphs of context, a data
        visualization, and one interpretation check. Submit each interpretation check before
        moving on — the next story dims until you do, so the prompt stays where you left it.
      </p>
      <DataNarrative
        skills={wefSkillDemand.skillsOutlook.skillsOnTheRise.skills}
        instability={wefSkillDemand.skillsOutlook.skillInstability}
        countries={geographicAdoptionFull.countries as GeoCountry[]}
        tierRanges={geographicAdoptionFull.tierRanges as Record<string, TierRange>}
        censusAdoption={geographicAdoption.enterpriseAdoption.censusData.adoptionRate}
        collaboration={adoptionTrends.collaborationMode.timeSeries}
        directive={adoptionTrends.directiveInteractions.timeSeries}
        classifierCaveat={adoptionTrends._metadata._classifierCaveat ?? ''}
      />
    </SectionContainer>
  );
}

// ─── S4: The Invisible Problem ──────────────────────────────────────
function Section4({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={4}
      sectionTitle="The invisible problem"
      sectionLabel="Section 4 · Reading"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          The data you just explored describes what’s happening in the market: skill demand,
          adoption patterns, behavioral shifts. But there’s a dimension of the AI adoption story
          that doesn’t show up in usage dashboards or productivity metrics, because the people it
          affects are making sure it stays invisible.
        </p>
        <p className="m-0">
          In a survey of 1,250 professionals across industries, 69% reported that social stigma
          is an active barrier
          <Citation ids="anthropic-interviewer-2025" pageKey="stigma-69" /> to using AI at work.
          It’s not that they reject AI. Most of them use it regularly and report clear
          productivity gains. The barrier is disclosure. They use AI, they benefit from it, and
          they don’t tell anyone.
        </p>
        <p className="m-0">
          When asked why, professionals don’t point to technical barriers. They describe team
          environments where expressing enthusiasm for AI risks being perceived as lazy,
          replaceable, or insufficiently skilled to do the work themselves. In those
          environments, the rational response is silence: keep using AI privately, keep the
          gains, and avoid the professional cost of visibility.
        </p>
        <p className="m-0">
          The result isn’t resistance to AI — most of these professionals are active users who
          see clear value. The problem is that their usage stays invisible, and the
          organizational cost of that invisibility is substantial.
        </p>
        <p className="m-0">
          When a significant share of your workforce uses AI in isolation, four things happen
          simultaneously. First, peer learning stops. The colleague who discovered an effective
          way to use AI for financial analysis doesn’t share it, because sharing means disclosing.
          Second, best practices stay invisible. Every individual is running their own experiment
          with AI, and none of the results are visible to the organization. Third, productivity
          gains become unmeasurable. If managers don’t know which outputs involved AI, they can’t
          evaluate whether AI-assisted work is better, worse, or different, and they can’t make
          informed decisions about where to invest further. Fourth, duplicated effort compounds.
          Teams solve the same problems independently, develop the same workarounds, and make the
          same mistakes, because no one can see what anyone else is doing.
        </p>
        <p className="m-0">
          The result is an organization where individuals are getting faster, but the institution
          isn’t getting smarter.
        </p>
        <p className="m-0">
          This is not a problem that training alone can fix. If a professional completes an AI
          competency program and returns to a team where using AI is perceived as cutting
          corners, the most likely outcome is that they continue to use AI, and continue to hide
          it. Skill acquisition without social normalization produces no measurable
          organizational change.
        </p>
        <p className="m-0">
          What’s missing is shared language: a way to talk about AI use that is professional,
          specific, and evaluative rather than promotional or defensive. That’s what the next
          section introduces.
        </p>
      </div>
    </SectionContainer>
  );
}

// ─── S5 / P2: Stigma Reflection + 4D Vocabulary Block ───────────────
function Section5({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  // Mark complete once the learner clicks Continue (engaged flag) OR after
  // they've spent enough time that the timer fires; we use the engaged
  // flag as a proxy here.
  useEffect(() => {
    if (state.engagedFlags['1.5.p2_continued'] && !state.completedSections['1.5']) {
      markInteractionComplete(1, 5);
    }
  }, [state.engagedFlags, state.completedSections, markInteractionComplete]);

  // The shared SectionContainer handles auto-complete for autoComplete=true
  // sections; this one is autoComplete=false but we mark it via the flag.
  return (
    <SectionContainer
      module={module}
      sectionId={5}
      sectionTitle="Stigma reflection — a shared vocabulary"
      sectionLabel="Section 5 · P2 Reflection"
      width="reading"
    >
      {/* R1 (4D Quick Reference) is mounted here, alongside the
          vocabulary introduction. Moved from S3 (DataNarrative) so the
          trigger surfaces only after the learner has the conceptual
          anchor for what's behind it. */}
      <ReferenceTabRail>
        <R1Trigger variant="tab" label="4D Reference" />
      </ReferenceTabRail>

      <StigmaReflection scrollTargetId="m1-s5-content-block" />

      <FourDVocabularyBlock />
    </SectionContainer>
  );
}

function FourDVocabularyBlock(): JSX.Element {
  const { markEngaged } = useLearnerProgress();
  // Track that the learner reached the content block (used as a soft
  // completion signal for S5 in addition to the Continue button).
  useEffect(() => {
    markEngaged(1, 5, 'p2_continued');
  }, [markEngaged]);

  return (
    <section
      id="m1-s5-content-block"
      aria-labelledby="m1-s5-vocab-heading"
      className="mt-10 space-y-4 font-sans text-body text-body"
    >
      <h2
        id="m1-s5-vocab-heading"
        className="m-0 mb-2 font-display text-title font-normal text-ink"
        style={{ letterSpacing: '-0.005em' }}
      >
        A shared vocabulary for AI work
      </h2>

      <p className="m-0">
        Whatever your answer to that reflection, you’re not alone in it. The fact that most
        professionals navigate AI use without shared language for what they’re doing is itself
        the problem this program addresses.
      </p>
      <p className="m-0">
        To address that gap, the program uses four competencies as a shared vocabulary. Together,
        they describe what effective, professional AI use looks like. They’re called the 4Ds:
      </p>

      <FourDList />

      <p className="m-0">
        These four terms give you a way to describe your AI practice that is specific,
        professional, and evaluative. They replace the binary framing (pro-AI or anti-AI,
        enthusiast or skeptic) with language that treats AI use as a professional skill to be
        developed, discussed, and improved. When your team shares this vocabulary, the
        concealment dynamic described in the previous section loses its grip. AI use becomes
        something you can talk about in terms of <em>how well</em>, not <em>whether</em>.
      </p>
      <p className="m-0">
        You’ll develop each of these competencies across the remaining modules. For now, the
        point is simpler: the language exists, and it changes what’s possible.
      </p>
    </section>
  );
}

const FOUR_DS: { name: string; tone: string; toneDark: string; description: string }[] = [
  {
    name: 'Delegation',
    tone: '#3D4A35',
    toneDark: '#B5C4AB',
    description:
      'is deciding what to hand to AI and what to keep human. AI doesn’t improve every task, and not everything needs your direct effort. Delegation is the judgment call about where the line sits for a given task.',
  },
  {
    name: 'Description',
    tone: '#5A4A37',
    toneDark: '#C9B99E',
    description:
      'is communicating what you need from AI clearly enough to get a useful result. This is the skill behind effective prompting: specifying the task, the constraints, the format, and the quality standard.',
  },
  {
    name: 'Discernment',
    tone: '#354A57',
    toneDark: '#A8BCCA',
    description:
      'is evaluating what AI gives you back. Does the output meet your standard? Is the reasoning sound? Would you stake your professional reputation on this result without further review?',
  },
  {
    name: 'Diligence',
    tone: '#4A3557',
    toneDark: '#BEA8C9',
    description:
      'is the accountability layer: documenting how AI contributed to a deliverable, maintaining transparency with colleagues and stakeholders, and taking full ownership of the final product regardless of how it was produced.',
  },
];

function FourDList(): JSX.Element {
  return (
    <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2" style={{ gridAutoRows: '1fr' }}>
      {FOUR_DS.map((d) => (
        <li
          key={d.name}
          className="rounded-lg"
          style={{
            background: 'rgb(var(--white))',
            border: '1px solid rgb(var(--border))',
            borderLeft: `3px solid ${d.tone}`,
            padding: '14px 18px',
          }}
        >
          <div
            className="mb-1 font-sans text-h4 font-semibold"
            style={{ color: d.tone }}
          >
            {d.name}
          </div>
          <p className="m-0 font-sans text-body-sm text-body">{d.description}</p>
        </li>
      ))}
    </ul>
  );
}

// ─── S6: Program Framing ────────────────────────────────────────────
function Section6({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={6}
      sectionTitle="What this program builds"
      sectionLabel="Section 6 · Reading"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          This program is four modules, designed to be completed in sequence. Each one builds on
          the last.
        </p>
        <p className="m-0">
          Module 1, where you are now, establishes why AI literacy is a strategic and
          organizational priority, not just an individual skill. Module 2 shifts from the market
          picture to the behavioral evidence: what the workforce is actually doing with AI, how
          productivity gains distribute across tasks, and where the gap between perception and
          practice is widest. Module 3 goes inside the technology itself (how language models
          process text, generate output, and fail) so you have the knowledge to evaluate AI
          outputs rather than accepting them on faith. Module 4 puts it all together: applied
          evaluation, structured delegation, and the accountability practices that make your AI
          use professionally defensible.
        </p>
        <p className="m-0">
          The full program takes roughly two hours. Each module runs between 15 and 40 minutes
          and works as a single sitting.
        </p>
      </div>
    </SectionContainer>
  );
}

// ─── S7: Knowledge Check ────────────────────────────────────────────
function Section7({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  const { track } = useAnalytics();
  useEffect(() => {
    const allDone = MODULE_1_KC_ITEMS.every((item) =>
      Boolean(state.knowledgeChecks[`1.7.${item.id}`]),
    );
    if (allDone && !state.completedSections['1.7']) {
      markInteractionComplete(1, 7);
      track({ type: 'kc_module_1_complete', moduleId: 1, sectionId: 7 });
    }
  }, [state.knowledgeChecks, state.completedSections, markInteractionComplete, track]);

  return (
    <SectionContainer
      module={module}
      sectionId={7}
      sectionTitle="Knowledge check"
      sectionLabel="Section 7 · Tier 1 assessment"
      width="reading"
    >
      <p className="m-0 mb-6 font-sans text-body text-body">
        Four scenario-based items. Pick the response best supported by the data. Feedback
        explains the consequence of each choice. There is no pass/fail threshold and no time
        limit. Attempt all four to complete the section.
      </p>
      <ul className="m-0 list-none space-y-8 p-0">
        {MODULE_1_KC_ITEMS.map((item, idx) => (
          <li key={item.id}>
            <KnowledgeCheck
              moduleId={1}
              sectionId={7}
              item={item}
              itemNumber={idx + 1}
              totalItems={MODULE_1_KC_ITEMS.length}
            />
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}

// ─── S8: Transition to Module 2 ─────────────────────────────────────
function Section8({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={8}
      sectionTitle="Transition to Module 2"
      sectionLabel="Section 8 · Reading"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          You’ve seen the market picture: what employers need, where adoption is happening, how
          usage patterns are changing, and why a workforce that conceals its AI practices can’t
          improve them. The data is clear that AI literacy is a strategic priority, but it’s
          been presented at the market and workforce level, not at the level of your daily work.
        </p>
        <p className="m-0">
          Module 2 changes the lens. Instead of what the market is doing, you’ll look at what
          individual professionals are doing with AI, task by task, function by
          function. The productivity data is more specific than most people expect: not a general
          “AI makes things faster” claim, but documented time savings that vary dramatically by
          task type, with some categories showing 95% reductions
          <Citation ids="tamkin-mccrory-2025" pageKey="compile-95" /> and others showing almost
          none. You’ll explore where the gains concentrate, where overconfidence creeps
          in, and how your own task mix compares to the behavioral data.
        </p>
        <p className="m-0">
          The question shifts from <em>“why does this matter?”</em> to{' '}
          <em>“what’s happening, and does my experience match the evidence?”</em>
        </p>
      </div>
    </SectionContainer>
  );
}
