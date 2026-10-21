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
import { EvidenceNote } from '../../components/shared/EvidenceNote';
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
import { FourDCheck } from './FourDCheck';

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
          If you use AI at work, you’re in good company. In Anthropic’s survey of 1,000
          professionals from the general workforce, 86% report that it saves them time
          <Citation ids="anthropic-interviewer-2025" pageKey="time-savings-86" />, and 65% say
          they’re satisfied with the role AI plays in their work
          <Citation ids="anthropic-interviewer-2025" pageKey="satisfaction-65" />. But
          widespread adoption is not the same thing as effective use. Nearly nine in ten
          respondents to McKinsey’s 2026 global survey say their organization uses AI regularly
          in at least one business function
          <Citation ids="mckinsey-state-of-ai-2026" pageKey="regular-use" />. Only 37% report that AI has contributed to their organization’s earnings
          <Citation ids="mckinsey-state-of-ai-2026" pageKey="ebit-37" />. The tools can produce
          real productivity gains. The question is whether workers, and the organizations around
          them, have the understanding and judgment to capture that value.
        </p>
        <p className="m-0">
          That question has become urgent unusually fast. OpenAI reports more than 900 million
          weekly ChatGPT users, though only about 5% pay
          <Citation ids="evans-2026-05" pageKey="wau-900m-29" />. Reach is not the same as
          depth: across ten US surveys from 2024 to 2025, weekly use runs well ahead of daily use
          <Citation ids="evans-2025-11" pageKey="engagement-gap-39" />. Most professionals have
          tried the tools; fewer use them every day. And the speed of that adoption has outrun
          most organizations’ ability to evaluate whether their people are using these tools
          well.
        </p>
        <p className="m-0">
          Skill gaps in the labor market are the most-cited barrier to transforming a business:
          63% of surveyed employers expect them to hold back their transformation, ahead of
          regulation, infrastructure, and budget<Citation ids="wef-2025" pageKey="skill-gap-63" />.
          Your organization almost certainly has access to the technology. What it doesn’t have
          is a way to tell whether its people are using it well.
        </p>
        <EvidenceNote id="m1-s1-access-gap" moduleId={1} sectionId={1}>
          <p className="m-0">
            Investment has followed adoption. Investment flows into AI rose nearly eightfold after
            ChatGPT’s release in November 2022, and natural-language interfaces considerably
            lowered the technical barrier to using the tools
            <Citation ids="wef-2025" pageKey="ai-investment-8x" />.
          </p>
          <p className="m-0">
            A separate survey of more than 11,000 executives asked about AI adoption specifically.
            Half named a lack of skills as the top barrier. A lack of vision among managers and
            leaders came a close second (43%), ahead of cost, regulation, and customer demand
            <Citation ids="wef-2025" pageKey="ai-adoption-barrier-50" />.
          </p>
          <p className="m-0">
            Enterprise usage records show the same gap from the vendor side. Firms that buy the
            same system differ widely in who uses it, how much, and for what
            <Citation ids="chatterji-2026" pageKey="non-uniform-use" />. The researchers conclude
            that adoption is only the beginning of deployment
            <Citation ids="chatterji-2026" pageKey="adoption-not-deployment" />.
          </p>
        </EvidenceNote>
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
          after ChatGPT’s release, overall U.S. adoption of generative AI, at home and at work
          combined, was running ahead of the personal computer and the internet at a comparable
          point after their first mass-market launches; adoption at work alone was keeping pace
          with the PC<Citation ids="bick-blandin-deming-2024" pageKey="adoption-vs-pc-internet" />.
          That speed is changing how work gets done faster than most organizations can adapt,
          and the data on that change is complicated. Through 2025, workers in the occupations
          where AI already handles the largest share of tasks showed no measurable rise in
          unemployment relative to workers in occupations with no AI exposure; the one early
          signal is a slowdown in hiring of 22-to-25-year-olds into those roles, and it is barely
          significant
          <Citation ids="massenkoff-mccrory-2026" pageKey="no-unemployment-effect" />. So far,
          the change shows up in tasks and skills more than in unemployment.
        </p>
        <p className="m-0">
          The next few sections explore three dimensions of that story through interactive data.
          Each one surfaces a pattern that most professionals haven’t seen, even those already
          using AI daily.
        </p>
        <h3 className="m-0 mt-6 font-sans text-h3 font-semibold text-ink">Demand</h3>
        <p className="m-0">
          In the World Economic Forum’s 2025 employer survey, AI and big data ranks as the single
          fastest-growing skill in the global workforce
          <Citation ids="wef-2025" pageKey="fastest-growing-skills" />. Job postings say the
          same thing from the hiring side. Between mid-2023 and mid-2025, US workers in
          occupations whose postings ask for AI fluency rose nearly sevenfold, from about one
          million to seven million
          <Citation ids="mgi-agents-robots-us-2025" pageKey="ai-fluency-7x" />. No other skill
          grew faster. Across ten European economies, demand rose fivefold between late 2023 and
          late 2025, the same rate MGI measured in the United States over those months
          <Citation ids="mgi-agents-robots-europe-2026" pageKey="ai-fluency-5x" />. The first
          story below sets that demand beside the barrier employers name most often.
        </p>
        <h3 className="m-0 mt-6 font-sans text-h3 font-semibold text-ink">Geography</h3>
        <p className="m-0">
          AI adoption is not uniform. Where you work, and the institutional context around you,
          shapes how much AI gets used, by whom, and for what
          <Citation ids="appel-mccrory-tamkin-2025" pageKey="adoption-speed" />. For
          organizations with teams across regions, this creates a practical problem: different
          locations developing AI capabilities at different rates, for different tasks, with no
          shared baseline. The second story maps that unevenness country by country.
        </p>
        <EvidenceNote
          id="m1-s2-regional-signals"
          moduleId={1}
          sectionId={2}
          label="More on regional differences"
        >
          <p className="m-0">
            The pattern holds beyond the consumer data in the next story. On one routing platform
            that serves hundreds of models to developers, Asia’s share of spending more than
            doubled in the year to November 2025, from about 13% to about 31%
            <Citation ids="openrouter-a16z-2025" pageKey="asia-share-34" />. North America fell
            below half. That platform assigns region by billing address, so read the shares as
            indicative.
          </p>
          <p className="m-0">
            Employer surveys add another view. In Singapore, 97% of surveyed employers do not rate
            their exposure to AI as low, and 82% plan to reskill staff to work alongside AI; in
            Canada the figures are 94% and 90%; employers in Hong Kong expect technology to
            deliver 43% of task time by 2030 against 34% globally
            <Citation ids="wef-2025" pageKey="economy-profiles" />. Those figures record what
            employers expect, not what people do. The usage data in the next story covers
            Singapore and Canada but not Hong Kong.
          </p>
        </EvidenceNote>
        <h3 className="m-0 mt-6 font-sans text-h3 font-semibold text-ink">Behavior</h3>
        <p className="m-0">
          How the workforce uses AI is changing rapidly, and the direction of that change matters.
          The way professionals interacted with AI tools twelve months ago is measurably different
          from how they interact today, and that shift points to a new kind of judgment these
          tools now demand. Usage volume is also still
          climbing: OpenAI's enterprise records show use accelerating in early 2026 among early
          and recent adopters alike
          <Citation ids="chatterji-2026" pageKey="cohort-acceleration" />.
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
          of the general-workforce group mentioned the social stigma that can come with using AI at work
          <Citation ids="anthropic-interviewer-2025" pageKey="stigma-69" />.
          It’s not that they reject AI. Most of them use it regularly and report clear
          productivity gains. The barrier is disclosure. Some use AI, benefit from it, and keep
          that to themselves.
        </p>
        <p className="m-0">
          The stigma surfaced as a theme in how workplace dynamics shape AI adoption, and the
          examples the researchers quote describe colleagues’ judgment, not technical barriers.
          One fact-checker said nothing when a colleague said they hated AI, and tells no one
          about their own process because they know how many people feel about AI
          <Citation ids="anthropic-interviewer-2025" pageKey="stigma-69" />. One salesperson in
          the Interviewer sample reported that colleagues can tell when an email is AI-generated
          and regard the sender as too lazy to write a personal note
          <Citation ids="anthropic-interviewer-2025" pageKey="lazy-email-quote" />. In workplaces
          like these, the rational response is silence: keep using AI privately, keep the
          gains, and avoid the professional cost of visibility. The fear is not irrational.
          Forty-one percent of employers expect to downsize where AI can replicate people’s
          work, and 47% plan to move staff from roles AI will shrink into other roles
          inside the organization
          <Citation ids="wef-2025" pageKey="downsize-41" />.
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
        <FasterPeopleCallout />
        <p className="m-0">
          This is not a problem that training alone can fix. Employers themselves rank
          organizational culture and resistance to change as the second-largest barrier to
          transformation, at 46%<Citation ids="wef-2025" pageKey="culture-barrier-46" />. If a
          professional completes an AI competency program and returns to a team where using AI
          is perceived as cutting corners, the most likely outcome is that they continue to use
          AI, and continue to hide it. Skill acquisition without social normalization produces
          no measurable organizational change.
        </p>
        <EvidenceNote
          id="m1-s4-hidden-practice"
          moduleId={1}
          sectionId={4}
          label="More on concealment and its costs"
        >
          <p className="m-0">
            The concealment reaches into the output itself. In a survey of 319 knowledge workers,
            45 described reworking AI output to fit the style the task called for, and some edited
            it to read less AI-generated and more personal
            <Citation ids="lee-2025" pageKey="verification-practices" />.
          </p>
          <p className="m-0">
            Concealment is not the only way peer learning stops. At Anthropic, where asking Claude
            first is the norm, one senior engineer noted that junior staff bring them fewer
            questions, and another said they ask more questions than before, but 80 to 90 percent
            of them now go to the model
            <Citation ids="huang-2025" pageKey="social-dynamics" />. Shared vocabulary does not
            restore those conversations by itself. It makes the ones that still happen usable.
          </p>
          <p className="m-0">
            Enforcement has its own cost. MIT’s 2026 AI committee heard from instructors that
            policing unauthorized AI use was harming their relationships with the people they
            teach, and it warns that more policing builds distrust. It recommends shared norms
            people understand over rules that feel arbitrary
            <Citation ids="mit-2026" pageKey="policing-distrust" />.
          </p>
        </EvidenceNote>
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

      <FourDCheck />

      <p className="m-0">
        These four terms give you a way to describe your AI practice that is specific,
        professional, and evaluative. They replace the binary framing (pro-AI or anti-AI,
        enthusiast or skeptic) with language that treats AI use as a professional skill to be
        developed, discussed, and improved. When your team shares this vocabulary, the
        concealment dynamic described in the previous section loses its grip. AI use becomes
        something you can talk about in terms of <em>how well</em>, not <em>whether</em>.
      </p>
      <EvidenceNote
        id="m1-s5-framework-evidence"
        moduleId={1}
        sectionId={5}
        label="Where the four terms come from"
      >
        <p className="m-0">
          The four labels come from Dakan and Feller’s framework, but the structure is not
          arbitrary. When researchers coded how 319 knowledge workers described thinking
          critically with AI, they sorted the practices into three phases of the AI workflow
          taken from earlier studies: forming the goal and the query, inspecting the response,
          and integrating it into the work
          <Citation ids="lee-2025" pageKey="three-phases" />. Delegation and Description cover
          the first phase. Discernment covers the second. Diligence is the accountability that
          carries through to the finished work. Their training recommendation points the same
          way: verification, integration, and stewardship
          <Citation ids="lee-2025" pageKey="training-recommendation" />.
        </p>
        <p className="m-0">
          The accountability principle behind Diligence is not the program’s invention either.
          The same researchers concluded that responsibility for the work stays with the person
          even when the production is delegated, and chose the word stewardship over teammate or
          collaborator for that reason
          <Citation ids="lee-2025" pageKey="stewardship-definition" />. MIT’s 2026 AI committee
          recommends the same principle for research: AI is a tool under the direction of a
          human who is responsible for verifying its output
          <Citation ids="mit-2026" pageKey="human-verifies" />.
        </p>
        <p className="m-0">
          The terms also map onto what the labor market is asking for. Job-posting analysts
          define AI fluency as the practical ability to use and manage AI in day-to-day work, not
          engineering expertise. Its requirements now extend beyond prompting: integrating AI
          into workflows, interpreting outputs, recognizing wrong results, and knowing when to
          escalate to human review
          <Citation ids="mgi-agents-robots-europe-2026" pageKey="ai-fluency-definition" />.
          Delegation, Description, Discernment, and Diligence cover most of that definition and
          make it teachable. The analysts also count building simple prototypes with low- or
          no-code tools, which this program does not cover.
        </p>
        <p className="m-0">
          The framework’s authors go further: they see AI as more than an efficiency engine, with
          the potential to act as a thinking partner, and they hold that only specific human
          competencies can realize that potential
          <Citation ids="dakan-feller-2025" pageKey="ai-fluency-definition" />.
        </p>
      </EvidenceNote>
      <p className="m-0">
        You’ll develop each of these competencies across the remaining modules. For now, the
        point is simpler: the language exists, and it changes what’s possible.
      </p>
    </section>
  );
}

// Tones read the --{competency}-text tokens so the names and borders flip
// with the theme; the light values equal the original hexes.
const FOUR_DS: { name: string; tone: string; description: ReactNode }[] = [
  {
    name: 'Delegation',
    tone: 'rgb(var(--delegation-text))',
    description:
      'is deciding what to hand to AI and what to keep human. AI doesn’t improve every task, and not everything needs your direct effort. It also means knowing what the tool you are using does well and where it fails, and choosing how to work with it: hand the task over, or work through it together. Delegation is the judgment call about where the line sits for a given task.',
  },
  {
    name: 'Description',
    tone: 'rgb(var(--description-text))',
    description:
      'is communicating what you need from AI clearly enough to get a useful result. This is the skill behind effective prompting: specifying the task, the constraints, the format, and the quality standard. The framework divides it into three parts: what you want (product), how the AI should approach the task and how you work through it together (process), and how the AI should behave (performance).',
  },
  {
    name: 'Discernment',
    tone: 'rgb(var(--discernment-text))',
    description:
      'is evaluating what AI gives you back. Does the output meet your standard? Is the reasoning sound? Does it show bias, such as a one-sided framing picked up from the data the AI learned from? Is the way you are working with it producing results, or does the approach need to change? Would you stake your professional reputation on this result without further review?',
  },
  {
    name: 'Diligence',
    tone: 'rgb(var(--diligence-text))',
    description:
      'is the accountability layer: using AI within ethical and legal limits, documenting how AI contributed to a deliverable, maintaining transparency with colleagues and stakeholders, and taking full ownership of the final product regardless of how it was produced.',
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
          and works as a single sitting. If you can, take the modules on different days. Spacing
          them out, and recalling the previous module before you start the next, helps you keep
          what you learn.
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
      sectionLabel="Section 7 · Scenario questions"
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
          WEF report itself calls for training in broader generative AI literacy
          <Citation ids="wef-2025" pageKey="genai-literacy-training" />, but it’s been presented
          at the market and workforce level, not at the level of your daily work.
        </p>
        <p className="m-0">
          Module 2 changes the lens. Instead of what the market is doing, you’ll look at what
          individual professionals are doing with AI, task by task, function by
          function. The productivity data is more specific than most people expect: not a general
          “AI makes things faster” claim, but documented time savings that vary dramatically by
          task type, with some tasks showing 95% reductions
          <Citation ids="tamkin-mccrory-2025" pageKey="compile-95" /> and others closer to
          20%<Citation ids="tamkin-mccrory-2025" pageKey="diagnostic-20" />. You’ll explore where the gains concentrate, where overconfidence creeps in, and
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
