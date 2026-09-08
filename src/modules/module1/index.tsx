// Module 1 — Why AI Literacy Matters Now (4C spec §3-5).
// Renders the eight sections of the module sequentially, switching by the
// URL section param. Data files are imported here once and passed as props
// to chart components (4C spec §18.1).

import { useEffect, type ReactNode } from 'react';
import { useSectionParam } from '../../hooks/useSectionParam';
import { SectionContainer } from '../../components/shared/SectionContainer';
import { getModuleOrThrow } from '../../data/program';
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
import { FasterPeopleCallout } from './FasterPeopleCallout';

const MODULE_ID = 1;

export default function Module1(): JSX.Element {
  const sectionId = useSectionParam(MODULE_ID);


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
          saves them time<Citation ids="anthropic-interviewer-2025" pageKey="time-savings-86" />,
          and 65% say they’re satisfied with the role AI plays in their work
          <Citation ids="anthropic-interviewer-2025" pageKey="satisfaction-65" />. But
          widespread adoption is not the same thing as effective use. Nearly nine in ten
          respondents to McKinsey’s 2026 global survey report regular AI use in at least one
          function. Only 37% report that AI has contributed to their organization’s earnings
          <Citation ids="mckinsey-state-of-ai-2026" pageKey="ebit-37" />. The tools can produce
          real productivity gains. The question is whether workers, and the organizations around
          them, have the understanding and judgment to capture that value.
        </p>
        <p className="m-0">
          That question has become urgent faster than any previous technology shift. ChatGPT
          was estimated to have reached 100 million monthly active users in January 2023, two
          months after launch. A UBS analysis of Similarweb traffic data called it the
          fastest-growing consumer application in history
          <Citation ids="reuters-ubs-2023" pageKey="chatgpt-100m" />. OpenAI reports more than
          900 million weekly ChatGPT users, though only about 5% pay
          <Citation ids="evans-2026-05" pageKey="wau-900m-29" />. Reach is not the same as
          depth: across ten US surveys from 2024 to 2025, weekly use runs well ahead of daily use
          <Citation ids="evans-2025-11" pageKey="engagement-gap-39" />. Investment followed:
          flows into AI rose nearly eightfold after ChatGPT’s release in November 2022, and
          natural-language interfaces removed most of the technical barrier to using the tools
          <Citation ids="wef-2025" pageKey="ai-investment-8x" />. The tools are no longer
          emerging; they are embedded in daily workflows across industries. Most professionals have tried them; fewer use them every day. And the speed of
          that adoption has outrun most organizations’ ability to evaluate whether their people
          are using these tools well.
        </p>
        <p className="m-0">
          Sixty-three percent of employers worldwide identify workforce skill gaps, not budget
          or infrastructure or regulation, as the single largest barrier to transforming their
          business<Citation ids="wef-2025" pageKey="skill-gap-63" />. A separate survey of more
          than 11,000 executives asked about AI adoption specifically. Half named a lack of
          skills as the top barrier, ahead of cost, regulation, and customer demand
          <Citation ids="wef-2025" pageKey="ai-adoption-barrier-50" />. Your organization almost
          certainly has access to the technology. What it doesn’t have is a way to tell whether
          its people are using it well. Enterprise usage records show the same gap from the
          vendor side. Firms that buy the same system differ widely in who uses it, how much,
          and for what. The researchers conclude that adoption is only the beginning of
          deployment<Citation ids="chatterji-2026" pageKey="adoption-not-deployment" />.
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
          Generative AI has been adopted faster than earlier consumer technologies. ChatGPT
          reached an estimated 100 million monthly users two months after launch; TikTok took
          about nine months and Instagram about two and a half years
          <Citation ids="reuters-ubs-2023" pageKey="tiktok-instagram-comparison" />. Two years
          after ChatGPT’s release, U.S. adoption of generative AI was running ahead of the
          personal computer and the internet at the same point after their first mass-market
          launches<Citation ids="bick-blandin-deming-2024" pageKey="adoption-vs-pc-internet" />.
          That speed is changing how work gets done faster than most organizations can adapt,
          and the data on that change is complicated. Through early 2026, the most AI-exposed
          workers showed no measurable rise in unemployment relative to unexposed workers; the
          one early signal is a slowdown in hiring of 22-to-25-year-olds into exposed roles, and
          it is barely significant
          <Citation ids="massenkoff-mccrory-2026" pageKey="no-unemployment-effect" />. The
          transformation is in tasks and skills, not yet in job counts.
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
          identifies a familiar pattern with one important shift: AI and big data now ranks as
          the single fastest-growing skill in the global workforce
          <Citation ids="wef-2025" pageKey="fastest-growing-skills" />, ahead of networks and
          cybersecurity, technological literacy, and creative thinking. Job postings say the
          same thing from the hiring side. Between mid-2023 and mid-2025, US workers in
          occupations whose postings ask for AI fluency rose nearly sevenfold, from about one
          million to seven million
          <Citation ids="mgi-agents-robots-us-2025" pageKey="ai-fluency-7x" />. No other skill
          grew faster. Ten European economies show a fivefold rise over the same period
          <Citation ids="mgi-agents-robots-europe-2026" pageKey="ai-fluency-5x" />. Most
          organizations recognize the shift: 85% plan to upskill their workforce
          <Citation ids="wef-2025" pageKey="upskill-85" /> in response. But planning isn’t
          execution: skill gaps remain the single largest barrier to business transformation
          across industries, outranking organizational culture (46%), regulation (39%), data
          infrastructure (32%), and investment capital (26%)
          <Citation ids="wef-2025" pageKey="skill-gap-63" />. Nearly every organization intends
          to adapt, but far fewer are able to. The report’s own reading of what to train is
          specific: employers need programs that build both prompt-writing skill and broader
          generative AI literacy, because the technology augments human work rather than
          replacing it in most areas
          <Citation ids="wef-2025" pageKey="genai-literacy-training" />.
        </p>
        <h3 className="m-0 mt-6 font-sans text-h3 font-semibold text-ink">Geography</h3>
        <p className="m-0">
          AI adoption is not uniform. Where you work, and the institutional context around you,
          shapes how much AI gets used, by whom, and for what
          <Citation ids="appel-mccrory-tamkin-2025" pageKey="adoption-speed" />. The pattern
          holds beyond the consumer data you will see next. On one routing platform that serves
          hundreds of models to developers, Asia’s share of spending more than doubled in the
          year to November 2025, from about 13% to about 31%
          <Citation ids="openrouter-a16z-2025" pageKey="asia-share-34" />. North America fell
          below half. That platform assigns region by billing address, so read the shares as
          indicative. For organizations with teams across regions, this creates a practical
          problem: different locations developing AI capabilities at different rates, for
          different tasks, with no shared baseline. Employer expectations run ahead of usage
          almost everywhere. In Singapore, 97% of surveyed employers report AI exposure and 82%
          plan to reskill staff to work alongside AI; in Canada the figures are 94% and 90%;
          employers in Hong Kong expect technology to deliver 43% of task time by 2030 against
          34% globally<Citation ids="wef-2025" pageKey="ai-reskill-77" />. The usage data in the
          next story shows how differently those expectations are being met.
        </p>
        <h3 className="m-0 mt-6 font-sans text-h3 font-semibold text-ink">Behavior</h3>
        <p className="m-0">
          How the workforce uses AI is changing rapidly, and the direction of that change matters.
          The way professionals interacted with AI tools twelve months ago is measurably different
          from how they interact today, and that shift points to a new kind of judgment these
          tools now demand. The change has not slowed: enterprise usage accelerated across every
          adoption cohort in early 2026
          <Citation ids="chatterji-2026" pageKey="token-growth-7x" />.
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
    if (allDone && !state.interactionCompleteSections['1.3']) {
      markInteractionComplete(1, 3);
    }
  }, [state.knowledgeChecks, state.interactionCompleteSections, markInteractionComplete]);

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
        moving on — the next story dims until you do.
      </p>
      <DataNarrative
        skills={wefSkillDemand.skillsOutlook.skillsOnTheRise.skills}
        coreSkills={wefSkillDemand.skillsOutlook.coreSkills2025.skills}
        coreSkills2030={wefSkillDemand.skillsOutlook.coreSkills2030}
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
          In a survey of 1,250 professionals (1,000 from the general workforce, 125 scientists,
          and 125 creatives; interviews conducted by an AI interviewer, with the dataset publicly
          released)<Citation ids="anthropic-interviewer-2025" pageKey="sample-method" />, 69%
          mentioned the social stigma that can come with using AI at work
          <Citation ids="anthropic-interviewer-2025" pageKey="stigma-69" />.
          It’s not that they reject AI. Most of them use it regularly and report clear
          productivity gains. The barrier is disclosure. They use AI, they benefit from it, and
          they don’t tell anyone.
        </p>
        <p className="m-0">
          When asked why, professionals don’t point to technical barriers. They describe team
          environments where expressing enthusiasm for AI risks being perceived as lazy,
          replaceable, or insufficiently skilled to do the work themselves. One salesperson in
          the Interviewer sample reported that colleagues can tell when an email is AI-generated
          and regard the sender as too lazy to write a personal note
          <Citation ids="anthropic-interviewer-2025" pageKey="lazy-email-quote" />. In those
          environments, the rational response is silence: keep using AI privately, keep the
          gains, and avoid the professional cost of visibility. The fear is not irrational.
          Forty-one percent of employers expect to downsize where AI can replicate people’s
          work, and 47% plan to move staff out of roles AI will shrink
          <Citation ids="wef-2025" pageKey="downsize-41" />. The concealment reaches into the
          output itself. In a survey of 319 knowledge workers, 45 described editing AI text so
          that it would not read as AI-generated
          <Citation ids="lee-2025" pageKey="verification-practices" />.
        </p>
        <p className="m-0">
          When a significant share of your workforce uses AI in isolation, four things happen
          simultaneously. First, peer learning stops. The colleague who discovered an effective
          way to use AI for financial analysis doesn’t share it, because sharing means disclosing.
          Concealment is not the only way this happens. At Anthropic, where asking Claude first
          is the norm, one senior engineer noted that junior staff bring them fewer questions,
          and another said 80 to 90 percent of their questions now go to the model
          <Citation ids="huang-2025" pageKey="full-stack" />. Shared vocabulary does not restore
          those conversations by itself. It makes the ones that still happen usable. Second,
          best practices stay invisible. Every individual is running their own experiment
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
        <FasterPeopleCallout />
        <p className="m-0">
          This is not a problem that training alone can fix. Employers themselves rank
          organizational culture and resistance to change as the second-largest barrier to
          transformation, at 46%<Citation ids="wef-2025" pageKey="culture-barrier-46" />. If a
          professional completes an AI competency program and returns to a team where using AI
          is perceived as cutting corners, the most likely outcome is that they continue to use
          AI, and continue to hide it. Skill acquisition without social normalization produces
          no measurable organizational change. Institutions that tried enforcement first report
          the same dynamic. MIT’s 2026 review found that policing AI use eroded trust, and it
          recommends norms people understand over rules they evade
          <Citation ids="mit-2026" pageKey="policy-rationale" />.
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
    if (state.engagedFlags['1.5.p2_continued'] && !state.interactionCompleteSections['1.5']) {
      markInteractionComplete(1, 5);
    }
  }, [state.engagedFlags, state.interactionCompleteSections, markInteractionComplete]);

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
        <R1Trigger label="4D Reference" />
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
        they describe what effective, professional AI use looks like. They’re called the 4Ds
        <Citation ids="dakan-feller-2025" pageKey="four-ds" />:
      </p>

      <FourDList />

      <p className="m-0">
        The accountability principle behind Diligence is not the program’s invention.
        Researchers studying knowledge workers concluded that responsibility for the work stays
        with the person even when the production is delegated, and chose the word stewardship
        over teammate or collaborator for that reason
        <Citation ids="lee-2025" pageKey="stewardship-definition" />.
      </p>
      <p className="m-0">
        The four labels are Anthropic’s, but the structure is not arbitrary. When researchers
        coded how 319 knowledge workers described thinking critically with AI, the practices fell
        into three phases: forming the goal and the query, inspecting the response, and
        integrating it into the work<Citation ids="lee-2025" pageKey="three-phases" />.
        Delegation and Description cover the first phase. Discernment is the second. Diligence
        governs the third. Their training recommendation names the same skills: verification,
        integration, and stewardship
        <Citation ids="lee-2025" pageKey="training-recommendation" />.
      </p>
      <p className="m-0">
        These four terms give you a way to describe your AI practice that is specific,
        professional, and evaluative. They also map onto what the labor market is asking for.
        Job-posting analysts define AI fluency as the practical ability to use and manage AI in
        day-to-day work, not engineering expertise. Its requirements now extend beyond
        prompting: integrating AI into workflows, interpreting outputs, recognizing wrong
        results, and knowing when to escalate to human review
        <Citation ids="mgi-agents-robots-europe-2026" pageKey="ai-fluency-definition" />.
        Delegation, Description, Discernment, and Diligence are that definition, made teachable.
        They replace the binary framing (pro-AI or anti-AI, enthusiast or skeptic) with language
        that treats AI use as a professional skill to be developed, discussed, and improved. The
        framework’s authors make the same move: they treat AI as a thinking partner rather than
        an efficiency engine, and they make human competence the condition for that
        <Citation ids="dakan-feller-2025" pageKey="ai-fluency-definition" />. When your team
        shares this vocabulary, the
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

const FOUR_DS: { name: string; tone: string; toneDark: string; description: ReactNode }[] = [
  {
    name: 'Delegation',
    tone: '#3D4A35',
    toneDark: '#B5C4AB',
    description:
      'is deciding what to hand to AI and what to keep human. AI doesn’t improve every task, and not everything needs your direct effort. It also means knowing what the tool you are using does well and where it fails, and choosing how to work with it: hand the task over, or work through it together. Delegation is the judgment call about where the line sits for a given task.',
  },
  {
    name: 'Description',
    tone: '#5A4A37',
    toneDark: '#C9B99E',
    description:
      'is communicating what you need from AI clearly enough to get a useful result. This is the skill behind effective prompting: specifying the task, the constraints, the format, and the quality standard. It has three parts: what you want (product), how the work should proceed across turns (process), and how the AI should behave (performance).',
  },
  {
    name: 'Discernment',
    tone: '#354A57',
    toneDark: '#A8BCCA',
    description:
      'is evaluating what AI gives you back. Does the output meet your standard? Is the reasoning sound? Has the model’s training skewed the framing? Is the way you are working with it producing results, or does the approach need to change? Would you stake your professional reputation on this result without further review?',
  },
  {
    name: 'Diligence',
    tone: '#4A3557',
    toneDark: '#BEA8C9',
    description: (
      <>
        is the accountability layer: using AI within ethical and legal limits, documenting how AI
        contributed to a deliverable, maintaining transparency with colleagues and stakeholders,
        and taking full ownership of the final product regardless of how it was produced. The
        principle is not unique to this program. MIT’s 2026 institutional policy states that AI
        is a tool under the direction of a human who verifies its output
        <Citation ids="mit-2026" pageKey="human-verifies" />.
      </>
    ),
  },
];

function FourDList(): JSX.Element {
  return (
    <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2" style={{ gridAutoRows: '1fr' }}>
      {FOUR_DS.map((d) => (
        <li
          key={d.name}
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
    if (allDone && !state.interactionCompleteSections['1.7']) {
      markInteractionComplete(1, 7);
      track({ type: 'kc_module_1_complete', moduleId: 1, sectionId: 7 });
    }
  }, [state.knowledgeChecks, state.interactionCompleteSections, markInteractionComplete, track]);

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
          improve them. The data is clear that AI literacy is a strategic priority, and the
          employers surveyed name it as the training they need
          <Citation ids="wef-2025" pageKey="genai-literacy-training" />, but it’s been presented
          at the market and workforce level, not at the level of your daily work.
        </p>
        <p className="m-0">
          Module 2 changes the lens. Instead of what the market is doing, you’ll look at what
          individual professionals are doing with AI, task by task, function by
          function. The productivity data is more specific than most people expect: not a general
          “AI makes things faster” claim, but documented time savings that vary dramatically by
          task type, with some categories showing 95% reductions
          <Citation ids="tamkin-mccrory-2025" pageKey="compile-95" /> and others closer to
          20%. You’ll explore where the gains concentrate, where overconfidence creeps in, and
          how your own task mix compares to the behavioral data.
        </p>
        <p className="m-0">
          The question shifts from <em>“why does this matter?”</em> to{' '}
          <em>“what’s happening, and does my experience match the evidence?”</em>
        </p>
      </div>
    </SectionContainer>
  );
}
