// Module 2 — How AI Is Actually Being Used at Work
// Renders the eight sections of the module sequentially, switching by URL
// section param. Data files are imported here once and passed as props to
// the chart components (4A spec §11.1).

import { useEffect } from 'react';
import { useSectionParam } from '../../hooks/useSectionParam';
import { SectionContainer } from '../../components/shared/SectionContainer';
import { getModuleOrThrow } from '../../data/program';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { BottleneckCallout } from '../../components/shared/BottleneckCallout';
import { Citation } from '../../components/shared/Citation';
import { KnowledgeCheck } from '../../components/shared/KnowledgeCheck';
import { R1Trigger } from '../../components/reference/R1Trigger';
import { ReferenceTabRail } from '../../components/reference/ReferenceTabRail';

import augmentationAutomation from '../../data/augmentation-automation.json';
import productivityGains from '../../data/productivity-gains.json';
import interviewerFindings from '../../data/interviewer-findings.json';
import adoptionTrends from '../../data/adoption-trends.json';

// JSON inference widens union literals to `string`. Narrow ONLY the
// `category` key: the intermediate assignment is a plain (uncast)
// structural check, so renaming/removing any other field in the JSON
// fails to compile — the old `as unknown as` bridge silenced that too.
type CollaborationCategoryArray = Array<{
  pattern: string;
  category: 'augmentation' | 'automation';
  pct: number;
  definition: string;
  example: string;
  typical_tasks: string;
}>;
type CollaborationCategoryRaw = Omit<CollaborationCategoryArray[number], 'category'> & {
  category: string;
};
const RAW_COLLABORATION_CATEGORIES: CollaborationCategoryRaw[] =
  augmentationAutomation.collaboration_patterns.categories;
const COLLABORATION_CATEGORIES = RAW_COLLABORATION_CATEGORIES as CollaborationCategoryArray;

import { AugAutoDashboard } from './AugAutoDashboard';
import { DirectiveTrendSparkline } from './DirectiveTrendSparkline';
import { FivePatternBar } from './FivePatternBar';
import { MODULE_2_KC_ITEMS } from './knowledge-check-items';
import { ProductivityDashboard } from './ProductivityDashboard';
import { RCTComparisonChart } from './RCTComparisonChart';

const MODULE_ID = 2;

export default function Module2(): JSX.Element {
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

// ─── S1: Opening Hook ──────────────────────────────────────────────
function Section1({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={1}
      sectionTitle="Opening hook"
      sectionLabel="Section 1 · Reading"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          Module 1 ended with a shift in framing: from{' '}
          <em>"why does AI literacy matter?"</em> to{' '}
          <em>"what's happening, and does my experience match the evidence?"</em> This module
          answers that second question. It moves from the market picture to the behavioral
          data: what professionals are doing with AI, task by task, and where the gap between
          self-perception and measured reality is widest.
        </p>
        <p className="m-0">
          Most professionals can answer the first question easily. If you work with AI tools
          regularly, you have a mental picture of how you use them: which tasks you hand off, which
          ones you collaborate on, how much time you save, and where you draw the line between your
          judgment and the tool's output.
        </p>
        <p className="m-0">
          <strong className="font-semibold text-ink">That mental picture is almost certainly incomplete.</strong>
        </p>
        <p className="m-0">
          Incomplete in the way that self-assessments of any complex behavior tend to be
          incomplete. Across 22 meta-analyses covering academic, language, medical, sports, and
          vocational skills, self-ratings of ability correlate only moderately with measured
          performance, and the match is weakest when the task is unfamiliar, complex, or hard to
          score objectively
          <Citation ids="zell-krizan-2014" pageKey="mean-r-29" />. The direction of the error is
          usually upward. Most drivers rate themselves above the median driver
          <Citation ids="svenson-1981" pageKey="above-median" />, and investors who trade on
          overconfidence lower their own returns
          <Citation ids="barber-odean-2001" pageKey="trading-returns" />. The classic finding that
          the least skilled overestimate the most
          <Citation ids="kruger-dunning-1999" pageKey="bottom-quartile" /> is contested as partly
          a statistical artifact
          <Citation ids="gignac-zajenkowski-2020" pageKey="artefact" />, but the broader gap
          between self-report and measured performance is not. AI usage is no exception.
          Self-confidence is often poorly calibrated against objective skill, a point the
          critical-thinking researchers make about their own survey
          <Citation ids="lee-2025" pageKey="self-report-limits" />. AI use adds two distortions of
          its own. People conflate a task feeling easier with thinking less about it, and they do
          so most when the output looks right
          <Citation ids="lee-2025" pageKey="self-report-limits" />. And self-reported productivity
          gains run high: Anthropic's own engineers cite a controlled study in which experienced
          developers overestimated how much AI sped them up
          <Citation ids="huang-2025" pageKey="self-report-limits" />. Researchers who study
          enterprise AI from usage records say so directly: self-reported use is less detailed and
          subject to recall and reporting bias
          <Citation ids="chatterji-2026" pageKey="survey-limits" />. When
          researchers compared how 1,250 professionals described their AI practices against
          behavioral data from millions of actual AI conversations, the gap was substantial, and
          it ran in a consistent direction.
        </p>
        <p className="m-0">
          This module makes that gap visible. You'll work with the same behavioral datasets the
          researchers used: task-level adoption patterns across occupations, productivity
          distributions that range from 95% time savings down to about 20%, and the documented
          discrepancy between what professionals report doing with AI and what they do.
          The point is not to prove that your self-assessment is inaccurate. It's to give you the
          data to calibrate it.
        </p>
        <p className="m-0">
          By the end of this module, you'll have identified at least one task where you're probably
          leaving value on the table and at least one where you may be trusting the output more
          than the evidence warrants.
        </p>
      </div>
    </SectionContainer>
  );
}

// ─── S2: Five-Pattern Taxonomy ─────────────────────────────────────
function Section2({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={2}
      sectionTitle="What the workforce is actually doing"
      sectionLabel="Section 2 · Reading + chart"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          When researchers analyzed over a million AI conversations (the same single-platform
          Claude dataset introduced in Module 1), they didn't just count how
          often people used AI. They classified <em>how</em> those conversations worked. The
          result is a five-pattern taxonomy that captures the range of ways professionals interact
          with AI tools.
        </p>
        <p className="m-0">
          The five patterns fall into two categories you encountered in Module 1: augmentation
          (where the human does the substantive intellectual work with AI assistance) and
          automation (where AI performs the core task with minimal human involvement). The 4D
          framework draws the same line from the delegation side. In automation, AI performs a
          task on your direct instruction; in augmentation, you and the AI define and carry out
          the task together, turn by turn
          <Citation ids="dakan-feller-2025" pageKey="modalities" />. Automation needs a clear task
          definition and a quality check. Most real work moves between the two inside a single
          deliverable.
        </p>
        <p className="m-0">
          The framework names a third modality, agency: you configure an AI to carry out future
          tasks on its own, sometimes for other people. Chatbots and tutors are its examples, and
          the framework says it demands the deepest understanding of what AI can and cannot do
          <Citation ids="dakan-feller-2025" pageKey="modalities" />. This program stops at the
          first two. The judgment it builds transfers upward when you reach the third.
        </p>
      </div>

      <div className="my-8">
        <FivePatternBar categories={COLLABORATION_CATEGORIES} />
      </div>

      <div className="space-y-4 font-sans text-body text-body">
        <h3 className="m-0 font-sans text-h3 font-semibold text-ink">
          Augmentation patterns: 57% of all conversations
          <Citation ids="handa-2025" pageKey="aug-auto-split-57-43" />
        </h3>
        <p className="m-0">
          <em>Task iteration</em> is the most common single pattern, accounting for roughly a third
          of all AI interactions. The user and the AI work on a task together through multiple
          exchanges: drafting, revising, refining. The human shapes the direction; the AI
          accelerates the execution.
        </p>
        <p className="m-0">
          <em>Learning</em> accounts for about a quarter of interactions. The user asks AI to
          explain, teach, or clarify, not to produce a deliverable, but to build the user's own
          understanding. It matters more than its share suggests, because delegation has a
          learning cost. Anthropic's engineers describe losing the incidental learning that came
          from debugging a problem by hand: reading the docs and code around it and building a
          model of the system on the way
          <Citation ids="huang-2025" pageKey="paradox-of-supervision" />. Only 13 of 319 knowledge
          workers in one survey named skill development as a reason to think critically about AI
          output
          <Citation ids="lee-2025" pageKey="inhibitors" />. Asking the tool to teach is how some
          of that learning comes back.
        </p>
        <p className="m-0">
          <em>Validation</em> is the smallest category at under 3%, and nearly all of it is
          language translation
          <Citation ids="handa-2025" pageKey="feedback-loop-15" />. The user brings their own work
          and asks the AI to check it. Given that verification is one of the highest-value
          applications of AI assistance, the near-absence of validation in the behavioral data is a
          significant finding. Fewer than 3 in 100 AI interactions involve the user asking the
          tool to check <em>their</em> work rather than produce <em>its</em> work.
        </p>
        <p className="m-0">
          Read the 3% carefully. It counts users asking the tool to check the user's work. It does not count
          users checking the tool's work, which mostly happens outside the conversation. In one
          survey of 319 knowledge workers, 114 said they verify AI output against external sources
          and 125 said they check it against objective criteria such as whether code runs
          <Citation ids="lee-2025" pageKey="verification-practices" />. The behavioral data shows
          that people rarely use AI as a checker. It cannot show how often they check AI.
        </p>
        <p className="m-0">
          Employers are moving the other way. Between 2023 and 2025, quality assurance entered the
          posting requirements of 87 more US occupations, and process optimization of 114 more.
          MGI describes these as the skills used to supervise and verify AI systems
          <Citation ids="mgi-agents-robots-us-2025" pageKey="qa-demand" />. Verification is scarce
          in the conversation data and rising in the hiring data.
        </p>
        <h3 className="m-0 mt-6 font-sans text-h3 font-semibold text-ink">
          Automation patterns: 43% of all conversations
          <Citation ids="handa-2025" pageKey="aug-auto-split-57-43" />
        </h3>
        <p className="m-0">
          <em>Directive</em> interactions account for roughly 28% of all conversations
          <Citation ids="handa-2025" pageKey="directive-share-28" />. The user gives a complete
          instruction and accepts the result with minimal back-and-forth: format this document,
          draft this email, generate this code. This is the purest form of automation.
        </p>
        <p className="m-0">
          <em>Feedback loop</em> interactions account for about 15%
          <Citation ids="handa-2025" pageKey="feedback-loop-15" />. These look collaborative on
          the surface (multiple exchanges, back-and-forth), but the user is not shaping the
          output; they are reporting whether it works. Almost all feedback-loop conversations are
          coding and debugging, where the user relays each error back to the model
          <Citation ids="handa-2025" pageKey="feedback-loop-15" />.
        </p>
        <p className="m-0 mt-4">
          The aggregate split (57% augmentation, 43% automation) is the January 2025 behavioral
          baseline. It describes what users actually do, measured by analyzing conversation
          transcripts, not what they say they do when asked. The split moves: by August 2025
          automation had edged ahead (49% to 47%), and by November 2025 augmentation led again at
          52% to 45%, with about 3% of conversations fitting neither category
          <Citation ids="appel-massenkoff-mccrory-2026" pageKey="aug-auto-52-45" />. The
          five-pattern breakdown above is only published for the January wave. That distinction
          matters, and the gap between the two is larger than you might expect. One caution on
          the number itself. This 57% is a share of conversations on one platform. It is
          unrelated to the 57% of US work hours that McKinsey Global Institute estimates current
          technology could automate in theory
          <Citation ids="mgi-agents-robots-us-2025" pageKey="not-a-forecast" />. That figure
          measures technical feasibility, not observed use, and its authors state it is not a
          forecast of job losses. The two numbers coincide; they do not corroborate each other.
        </p>
        <p className="m-0">
          One more thing about the behavioral data before you explore it yourself: these patterns
          are not stable. Between January and August 2025, the share of directive interactions
          jumped from 28% to 39%
          <Citation
            ids={['handa-2025', 'appel-mccrory-tamkin-2025']}
            pageKey="directive-share-28"
          />
          . By November, it had fallen back to 32%
          <Citation ids="appel-massenkoff-mccrory-2026" pageKey="directive-share-32" />. The chart
          below shows how quickly that share has moved. The point is that how
          people use AI is evolving rapidly, and any snapshot is exactly that: a snapshot.
        </p>
      </div>

      <div className="my-8">
        <DirectiveTrendSparkline series={adoptionTrends.directiveInteractions.timeSeries} />
      </div>
    </SectionContainer>
  );
}

// ─── S3 / P3: Augmentation vs. Automation Dashboard ────────────────
function Section3({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  // P3 completes once at least two of three tabs have been viewed.
  // Read the count off `state.viewedTabs` directly so the effect's only
  // reactive dep is the raw record reference — the stable setter handles
  // the no-op case if completion is already recorded.
  useEffect(() => {
    const prefix = '2.3.';
    const viewed = Object.keys(state.viewedTabs).filter((key) => key.startsWith(prefix)).length;
    if (viewed >= 2) markInteractionComplete(2, 3);
  }, [state.viewedTabs, markInteractionComplete]);

  return (
    <SectionContainer
      module={module}
      sectionId={3}
      sectionTitle="Dashboard — augmentation vs. automation"
      sectionLabel="Section 3 · P3 Interactive"
      width="interactive"
    >
      <p className="m-0 mb-6 font-sans text-body text-body">
        Three tabs, three angles on the same behavioral dataset. <em>Adoption by Occupation</em>{' '}
        ranks where AI usage concentrates relative to each occupation's share of the workforce.{' '}
        <em>Collaboration Patterns</em> breaks down the five-pattern taxonomy you encountered in
        the previous section, with a reflection prompt that asks you to map your own recent AI
        interactions onto it. <em>Self-Report vs. Behavioral Data</em> sets your self-assessment
        from that prompt against the documented gap between what professionals say they do and
        what the conversation data shows, and asks a follow-up reflection that closes the loop.
        Move between tabs in whatever order makes sense; the prompts in the second and third tabs
        are where this section asks for your time.
      </p>
      <p className="m-0 mb-6 font-sans text-body-sm text-secondary" style={{ lineHeight: 1.55 }}>
        Two caveats. First, this dataset comes from one platform's consumer tiers; business and
        API traffic is excluded, and about a quarter of the sampled conversations are not
        work-related. Second, the direction of any bias is uncertain. The study's authors note
        that users may edit outputs outside the chat, so the true augmentation share may be
        higher than 57%. Enterprise API traffic, by contrast, is about 77% automation. The
        patterns are directionally reliable, but the specific percentages reflect a particular
        user population, not the full workforce.
      </p>
      <p className="m-0 mb-6 font-sans text-body-sm text-secondary" style={{ lineHeight: 1.55 }}>
        A second single-platform dataset shows how much the population matters. OpenRouter is a
        developer-facing service that routes requests to hundreds of models. There, programming
        grew from about 11% to more than half of all tokens during 2025
        <Citation ids="openrouter-a16z-2025" pageKey="programming-share-50" />. Programming and
        technology made up more than 80% of the traffic sent to Claude. Creative roleplay nearly
        matched programming by volume. That study excludes enterprise and locally hosted use, so
        it is a third population, not a correction to this one. Every usage dataset is a window
        onto its own users.
      </p>
      <AugAutoDashboard
        occupationCategories={augmentationAutomation.occupation_usage_shares.categories}
        occupationDepthInsight={augmentationAutomation.occupation_depth.insight}
        collaborationCategories={COLLABORATION_CATEGORIES}
        jobZones={augmentationAutomation.job_zone_analysis.zones}
        jobZoneInsight={augmentationAutomation.job_zone_analysis.insight}
        selfReportAug={Math.round(interviewerFindings.augmentationVsAutomation.selfReport.augmentative * 100)}
        selfReportAuto={Math.round(interviewerFindings.augmentationVsAutomation.selfReport.automative * 100)}
        v1Aug={augmentationAutomation.self_report_comparison.behavioral.augmentation_pct}
        v1Auto={augmentationAutomation.self_report_comparison.behavioral.automation_pct}
        latestAug={Math.round(interviewerFindings.augmentationVsAutomation.behavioralData.augmentative * 100)}
        latestAuto={Math.round(interviewerFindings.augmentationVsAutomation.behavioralData.automative * 100)}
      />
    </SectionContainer>
  );
}

// ─── S4: Productivity Distributions Intro + RCT Chart ───────────────
function Section4({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={4}
      sectionTitle="Where the productivity gains concentrate"
      sectionLabel="Section 4 · Reading + chart"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          The behavioral data in the previous section tells you <em>how</em> people use AI. This
          section tells you <em>what happens</em> when they do: how much time the
          tool saves across different types of work.
        </p>
        <p className="m-0">
          There are two ways to measure how much time AI saves on a task.
        </p>
        <p className="m-0">
          The first measures only what happens inside the AI interaction: the portion of the work
          conducted in the conversation window. Across 100,000 real-world conversations mapped to
          work tasks, the median task showed 81% in-conversation time savings
          <Citation ids="tamkin-mccrory-2025" pageKey="median-savings-81" />, meaning the
          AI-assisted portion took roughly a fifth of the time it would have taken unassisted.
          (The median conversation, a different unit, shows 84%.) But the range is wide. At the
          high end, compiling information from reports shows
          approximately 95% savings
          <Citation ids="tamkin-mccrory-2025" pageKey="compile-95" />. At the low end, checking
          diagnostic images shows only about 20%
          <Citation ids="tamkin-mccrory-2025" pageKey="diagnostic-20" />.
        </p>
        <p className="m-0">
          The second measurement comes from randomized controlled trials that capture the full
          work cycle: the AI interaction plus all the time users spend afterward refining,
          verifying, and correcting the output. These studies found net time savings between 14%
          and 56%, depending on the task and the model generation tested, and at least one found
          no saving at all.
        </p>
        <p className="m-0">
          The gap between
          them, from 81% down to 14–56%, is mostly the cost of verification and refinement: the
          time where human judgment converts AI-generated output into a reliable deliverable. The
          report names two reasons its own figure sits higher: it cannot see work done after the
          conversation ends, and the trials it cites tested earlier models
          <Citation ids="tamkin-mccrory-2025" pageKey="rct-comparison" />. Even at the
          conservative end, a 14% reduction in task time across routine workflows is operationally
          significant. At the high end, 56% represents a structural change in how work time is
          allocated.
        </p>
      </div>

      <div className="my-8">
        <RCTComparisonChart
          median={productivityGains.aggregate_metrics.median_time_savings_pct}
          rctFindings={productivityGains.time_savings_distribution.rct_comparison.rct_findings}
          note={productivityGains.time_savings_distribution.rct_comparison.note}
        />
      </div>

      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          One framing that will help you read the dashboard in the next section: productivity gain
          and verification burden are not the same axis. A task category can show high
          in-conversation time savings <em>and</em> high risk of unverified output. Compiling
          information from reports is 95% faster inside the AI interaction, but a fabricated
          citation embedded in that compiled output is invisible unless someone verifies every
          source.
        </p>
      </div>
    </SectionContainer>
  );
}

// ─── S5 / P4: Productivity Dashboard ────────────────────────────────
function Section5({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  useEffect(() => {
    const tabPrefix = '2.5.';
    const viewedCount = Object.keys(state.viewedTabs).filter((key) =>
      key.startsWith(tabPrefix),
    ).length;
    const engaged =
      Boolean(state.engagedFlags['2.5.p4_task1_engaged']) ||
      Boolean(state.engagedFlags['2.5.p4_task2_engaged']);
    if (viewedCount >= 1 && engaged) markInteractionComplete(2, 5);
  }, [state.viewedTabs, state.engagedFlags, markInteractionComplete]);

  return (
    <SectionContainer
      module={module}
      sectionId={5}
      sectionTitle="Dashboard — productivity distributions"
      sectionLabel="Section 5 · P4 Interactive"
      width="interactive"
    >
      <p className="m-0 mb-4 font-sans text-body text-body">
        The previous section introduced two ways of measuring productivity: in-conversation
        time savings and net time savings after verification. The gap between them is where
        human judgment lives. This dashboard lets you explore that gap across occupations and
        tasks; what the data doesn’t capture is equally important: the time spent
        independently verifying output, reworking errors, and catching fabricated details that
        looked correct on first read. The knowledge-worker survey puts a number on where that
        time goes. Majorities reported less effort with AI for every kind of thinking they were
        asked about, from recall to synthesis. Evaluation was the exception: only 55% reported
        less effort, and it drew the most reports of more effort
        <Citation ids="lee-2025" pageKey="effort-reduction-shares" />. Workers described the added
        work as stewardship: turning intent into a query, steering the response, and judging
        whether it meets the standard while staying accountable for it
        <Citation ids="lee-2025" pageKey="effort-shift-stewardship" />.
      </p>
      <p className="m-0 mb-4 font-sans text-body text-body">
        Time saved is one axis; whether the task succeeded is another. In the November 2025 wave,
        the model judged its own output successful in 67% of consumer conversations and 49% of
        single-shot API calls. Success falls as tasks lengthen: API calls reach a coin flip at
        tasks a person would need about 3.5 hours to do. Multi-turn conversations degrade far more
        slowly, which the authors attribute to users breaking tasks into steps and correcting
        course. Two cautions apply. The success judgment is the model's own. And users choose
        which tasks to bring, so observed success overstates what the model can do across all
        possible tasks
        <Citation ids="appel-massenkoff-mccrory-2026" pageKey="speed-reliability-tradeoff" />.
      </p>
      <p className="m-0 mb-6 font-sans text-body text-body">
        <em>By Occupation</em> covers all 22
        occupation categories; sort the table to find where the time savings, hourly wages, and
        task costs concentrate. <em>Task-Level Examples</em> drills into nine specific tasks that
        span the full range from 96% savings down to 56%, grouped to show the pattern:
        information-assembly tasks at the high end, physical-world and troubleshooting tasks at
        the low end. The action commitment below asks you to identify two tasks from your own
        work: one to add AI to, one to review more carefully.
      </p>
      <ProductivityDashboard
        occupationRows={productivityGains.occupation_table.categories}
        taskExamples={productivityGains.example_tasks.tasks}
      />
    </SectionContainer>
  );
}

// ─── S6: Speed vs. Judgment ─────────────────────────────────────────
function Section6({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={6}
      sectionTitle="The gap between speed and judgment"
      sectionLabel="Section 6 · Reading + sparkline"
      width="reading"
      autoComplete
    >
      {/* R1 (4D Quick Reference) — Section 6 is where the body text
          explicitly invokes Delegation and Discernment as named
          competencies, so this is the first M2 section where the
          reference is unambiguously in scope. The rail mounts inside
          the SectionContainer matching M1 S5's pattern. */}
      <ReferenceTabRail>
        <R1Trigger label="4D Reference" />
      </ReferenceTabRail>

      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          In the previous section, you identified tasks where AI could add value and tasks where
          the output warrants closer review. Those two choices reflect a tension you’ve seen
          throughout this module: the behavioral data shows a workforce that
          overestimates how collaboratively it works with AI, and the productivity data shows
          time savings that shrink substantially once you account for the verification work that
          follows. These two findings converge on the same problem.
        </p>
        <p className="m-0">
          The directive interaction trend makes the convergence visible. Between January and August
          2025, the share of AI interactions classified as directive (user gives a task, accepts
          the result, moves on) rose from 28% to 39%
          <Citation
            ids={['handa-2025', 'appel-mccrory-tamkin-2025']}
            pageKey="directive-share-28"
          />
          . That is an 11 percentage point shift toward the simplest form of automation in seven
          months. By November, the share had fallen back to 32%
          <Citation ids="appel-massenkoff-mccrory-2026" pageKey="directive-share-32" />, but it
          remained higher than where it started.
        </p>
      </div>

      <div className="my-8">
        <DirectiveTrendSparkline series={adoptionTrends.directiveInteractions.timeSeries} />
      </div>

      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          The report that measured the trend offers two explanations
          <Citation ids="appel-mccrory-tamkin-2025" pageKey="directive-trend-v3" />. The first is
          that models are getting better: as AI produces higher-quality first-draft outputs, users
          need fewer refinement turns. The capability change over the same months is documented.
          Reasoning models work through a problem in steps before answering. Tokens routed through
          them went from a negligible share in early 2025 to more than half by late 2025
          <Citation ids="openrouter-a16z-2025" pageKey="reasoning-share-50" />. A new frontier
          model now arrives every six to nine months
          <Citation ids="evans-2026-05" pageKey="frontier-cadence-20" />. The second is
          learning-by-doing: users who gain experience with AI develop enough confidence to
          delegate complete tasks rather than collaborating on them. Enterprise records support
          the learning-by-doing reading. About half of the growth in usage between mid-2025 and
          early 2026 came from firms that had already adopted
          <Citation ids="chatterji-2026" pageKey="adoption-not-deployment" />. The researchers
          describe those firms as still learning where the tool belongs in their workflows. Both
          explanations are probably contributing. The November reversal adds a third factor:
          product features that invite collaboration, such as file creation and persistent memory,
          may pull usage back toward augmentation
          <Citation ids="appel-massenkoff-mccrory-2026" pageKey="aug-auto-52-45" />. And both lead
          to the same consequence: more output is passing through less human review.
        </p>
        <p className="m-0">
          The tasks with the highest time savings (compiling information, drafting documents,
          preparing reports) are also the tasks most often delegated outright: most directive
          conversations are writing and content generation, including business email drafting
          <Citation ids="handa-2025" pageKey="directive-share-28" />. The labor market is already
          repricing them. Between 2023 and 2025, writing and editing dropped out of the posting
          requirements of 134 US occupations, and general research out of 140
          <Citation ids="mgi-agents-robots-us-2025" pageKey="declining-mentions" />. The analysts
          note the skills remain essential for much of the workforce. The efficiency gain is real.
          But so is the verification gap.
        </p>
      </div>

      <div className="my-8">
        <BottleneckCallout title="The bottleneck effect">
          <p className="m-0 mb-2">
            As AI accelerates certain tasks within a role, the remaining tasks, the ones AI
            handles poorly or not at all, become a larger share of the professional's actual work.
            A home inspector who uses AI to draft reports faster doesn't become a faster inspector;
            they become someone who spends proportionally more of their day doing physical
            inspections and proportionally less writing about them.
            <Citation ids="tamkin-mccrory-2025" pageKey="bottleneck-tasks" />
          </p>
          <p className="m-0 mb-2">
            History shows both outcomes. When Otis launched the automatic elevator in 1950, the
            elevator attendant's whole job was one task, and it became a button. When spreadsheets
            arrived, accountants did not disappear; the job changed. Once barcodes automated
            inventory, grocery stores stocked five times more products
            <Citation ids="evans-2026-05" pageKey="task-vs-job-54" />. Benedict Evans puts one
            question to every automation: is the thing being automated the task, or the job? For
            most knowledge work, it is the task.
          </p>
          <p className="m-0 mb-2">
            The AI-accelerated task gets faster; the role doesn't disappear; it reshapes around
            the tasks AI cannot do. Employer forecasts say the same. The WEF projects a smaller
            human share of task time by 2030 but notes both people and machines may do more,
            higher-value work in that time, so concern about humans 'running out of things to do'
            would be misplaced
            <Citation ids="wef-2025" pageKey="human-machine-frontier" />. The open question the
            report poses is whether workers share in the value machines generate. For your own
            practice, the bottleneck concept points to a specific question: which of your tasks
            are reshaping right now, and are you making that decision deliberately, or is the
            tool's speed making it for you?
          </p>
          <p className="m-0">
            The report borrows an economist's summary: growth is constrained not by what we are
            good at but by what is essential and hard to improve.
          </p>
        </BottleneckCallout>
      </div>

      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          That is a Delegation question. And the answer depends on Discernment: your ability to
          evaluate whether the AI-accelerated output meets the standard you'd apply if
          you'd produced it yourself. These two competencies, introduced in Module 1, are not
          abstract categories. They describe the specific judgment calls the data in this module
          documents: which tasks to hand to AI (Delegation), and how to evaluate what comes back
          (Discernment).
        </p>
        <p className="m-0">
          The next module shifts from behavioral data to the mechanics underneath it. You've seen
          what people do with AI and what happens when they do it. Module 3 asks the question that
          makes evaluation possible: how does the tool work, and why does it fail in the
          specific ways it does?
        </p>
      </div>
    </SectionContainer>
  );
}

// ─── S7: Knowledge Check ────────────────────────────────────────────
function Section7({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  const { track } = useAnalytics();
  // Watch for completion: all four items attempted.
  useEffect(() => {
    const allDone = MODULE_2_KC_ITEMS.every((item) =>
      Boolean(state.knowledgeChecks[`2.7.${item.id}`]),
    );
    if (allDone && !state.interactionCompleteSections['2.7']) {
      markInteractionComplete(2, 7);
      track({ type: 'kc_module_2_complete', moduleId: 2, sectionId: 7 });
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
        Four scenario-based items. Pick the response that best applies the module framework.
        Feedback explains the consequence of each choice. There is no pass/fail threshold and no
        time limit. Attempt all four to complete the section.
      </p>
      <ul className="m-0 list-none space-y-8 p-0">
        {MODULE_2_KC_ITEMS.map((item, idx) => (
          <li key={item.id}>
            <KnowledgeCheck
              moduleId={2}
              sectionId={7}
              item={item}
              itemNumber={idx + 1}
              totalItems={MODULE_2_KC_ITEMS.length}
            />
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}

// ─── S8: Transition to Module 3 ─────────────────────────────────────
function Section8({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={8}
      sectionTitle="Transition to Module 3"
      sectionLabel="Section 8 · Reading"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          You've spent this module looking at what professionals do with AI, not what
          they say they do, not what headlines claim they do, but what the behavioral data
          documents. Three findings should stay with you.
        </p>
        <p className="m-0">
          <strong className="font-semibold text-ink">First</strong>, the gap between self-reported
          and actual AI usage patterns is consistent and directional. Professionals believe they
          collaborate with AI more than they do, by a margin of 8 to 18 percentage points
          depending on the measurement
          <Citation
            ids={['handa-2025', 'anthropic-interviewer-2025']}
            pageKey="self-vs-behavioral"
          />
          . It is a calibration problem, and calibration problems
          are fixable.
        </p>
        <p className="m-0">
          <strong className="font-semibold text-ink">Second</strong>, the productivity gains are
          real but unevenly distributed. Some task categories show 95% time savings; others show
          closer to 20%. And the tasks where AI is fastest are often the tasks where the output is
          hardest to verify: speed and reliability are separate axes, not the same one. The
          November 2025 Economic Index wave measured both and found the same pattern: more complex
          tasks gain more time and succeed less often. Tasks needing a college-level prompt showed
          a 12× speedup but a 66% self-assessed success rate; simpler tasks showed 9× and 70%
          <Citation ids="appel-massenkoff-mccrory-2026" pageKey="speed-reliability-tradeoff" />.
        </p>
        <p className="m-0">
          <strong className="font-semibold text-ink">Third</strong>, the share of directive
          interactions has been rising. More output is passing through less human review. Whether
          that trend accelerates or reverses depends on whether professionals can evaluate what the
          tool gives them back.
        </p>
        <p className="m-0">
          That last point is the bridge to Module 3. Everything in this module has been about{' '}
          <em>what</em>: what people do, what happens when they do it, what the data shows. Module
          3 asks <em>why</em>. Why does the tool produce fluent text that contains fabricated
          citations? Why does it handle some tasks reliably and fail unpredictably on others? Why
          does an AI-generated financial summary look correct even when the numbers are invented?
        </p>
        <p className="m-0">
          The answers are mechanical. Language models generate output through a
          specific process (probability-based prediction, not information retrieval), and that
          process has specific, documentable failure modes. Understanding those mechanics is what
          converts the behavioral awareness you built in this module into the evaluative judgment
          you need to act on it.
        </p>
        <p className="m-0">
          The question shifts from <em>"what's happening?"</em> to{' '}
          <em>"why does the tool behave this way, and what does that tell me about when to trust it?"</em>
        </p>
      </div>
    </SectionContainer>
  );
}
