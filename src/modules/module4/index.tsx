// Module 4 — Evaluating AI Outputs and Working Responsibly (4B spec).
// Ten sections: opening, five practice activities, two knowledge-check
// blocks, a program closing, and a personalized competency profile.

import { useEffect } from 'react';
import { useSectionParam } from '../../hooks/useSectionParam';
import { Citation } from '../../components/shared/Citation';
import { KnowledgeCheck } from '../../components/shared/KnowledgeCheck';
import { SectionContainer } from '../../components/shared/SectionContainer';
import { getModuleOrThrow } from '../../data/program';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';

import { CompletionSummary } from './CompletionSummary';
import { DiligenceStatement } from './DiligenceStatement';
import { IterativeRefinement } from './IterativeRefinement';
import {
  MODULE_4_KC_ITEMS_S4,
  MODULE_4_KC_ITEMS_S7,
} from './knowledge-check-items';
import { OutputVerification } from './OutputVerification';
import { PromptComparison } from './PromptComparison';
import { R7Trigger } from '../../components/reference/R7Trigger';
import { ReferenceTabRail } from '../../components/reference/ReferenceTabRail';
import { TaskDecomposition } from './TaskDecomposition';

const MODULE_ID = 4;

export default function Module4(): JSX.Element {
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
    case 9:
      return <Section9 module={module} />;
    case 10:
      return <Section10 module={module} />;
    default:
      return <Section1 module={module} />;
  }
}

type ModuleProp = { module: ReturnType<typeof getModuleOrThrow> };

// ─── S1: Opening hook + module framing ────────────────────────────
function Section1({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={1}
      sectionTitle="Putting it all together"
      sectionLabel="Section 1 · Reading"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          Module 3 ended with a question: <em>given what I now know about how it works, how do I
          evaluate what it gives me, and what do I do when it fails?</em>
        </p>
        <p className="m-0">This module answers it through practice rather than further explanation.</p>
        <p className="m-0">
          You now have the mechanical vocabulary to trace any AI output failure to a specific
          cause. You know why a fluent paragraph can contain a fabricated citation (next-token
          prediction meeting thin knowledge). You know why a multi-document synthesis silently
          drops material from the files you uploaded (context window limits meeting cumulative
          conversation length). You know why a calculation looks right but isn’t (tokenization
          meeting probability-based generation).
          And you know that these failures concentrate in three predictable categories (boundary
          tasks, specificity tasks, and volume tasks), each with a targeted response.
        </p>
        <p className="m-0">
          What you haven’t done yet is apply that vocabulary under realistic conditions. Knowing
          that a diagnostic pair exists and using it to catch an error in a deliverable your
          manager is about to send to a client are different competencies. Module 3 gave you the
          framework. Module 4 gives you the reps.
        </p>
        <p className="m-0">
          This module is structured around five practice activities, more than any other module
          in the course, each targeting a specific judgment in the AI-assisted work cycle. You’ll
          work through five practice tasks in sequence: decomposing a workplace task to decide
          what belongs with AI and what stays human; rewriting an underspecified prompt and
          comparing the outputs side by side; evaluating an AI-generated deliverable element by
          element, using the mechanical framework to decide what to include, what to verify, and
          what to flag; iterating through multiple refinement turns to practice the
          Description-Discernment loop; and producing a diligence statement, a concrete
          workplace-deployable document that makes your AI practices visible to colleagues and
          managers.
        </p>
        <p className="m-0">
          All four competencies converge here. Delegation determines what to hand to AI.
          Description determines how to specify the task. Discernment determines how to evaluate
          what comes back. Diligence determines how to document the process and take
          accountability for the result. In Modules 1 through 3, these operated as separate
          lenses, with one or two emphasized per module. In Module 4, they work together the way they
          will in your actual work: simultaneously, in sequence, as a complete professional
          workflow.
        </p>
        <p className="m-0">The framing text between activities is brief. The activities carry the weight.</p>
      </div>
    </SectionContainer>
  );
}

// ─── S2 / P8: Task Decomposition ──────────────────────────────────
function Section2({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  // Complete when all six cards are submitted.
  useEffect(() => {
    const allDone = ['card_1', 'card_2', 'card_3', 'card_4', 'card_5', 'card_6'].every(
      (cardId) => Boolean(state.knowledgeChecks[`4.2.${cardId}`]),
    );
    if (allDone && !state.interactionCompleteSections['4.2']) markInteractionComplete(4, 2);
  }, [state.knowledgeChecks, state.interactionCompleteSections, markInteractionComplete]);

  return (
    <SectionContainer
      module={module}
      sectionId={2}
      sectionTitle="Task decomposition"
      sectionLabel="Section 2 · P8 Interactive"
      width="interactive"
    >
      <p className="m-0 mb-4 font-sans text-body text-body">
        The first judgment in any AI-assisted work cycle is scope: which parts of a task belong
        with AI, which require your expertise, and which sit in between, benefiting from AI
        assistance but requiring your active direction. Most workplace tasks are not single
        activities; they are bundles of sub-tasks with different reliability profiles.
      </p>
      <p className="m-0 mb-6 font-sans text-body text-body">
        One thing to watch for as you work through the exercise below: your choices interact.
        How you categorize one component can change the right answer for another. A step you
        might fully delegate on its own could be safe to delegate precisely because a later
        step involves human verification. Decompose the briefing below, and see what happens
        when components are miscategorized.
      </p>
      <TaskDecomposition />
    </SectionContainer>
  );
}

// ─── S3 / P9: Prompt Reformulation ────────────────────────────────
function Section3({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  // Complete when phase reaches "compare" (recorded via engagedFlags).
  useEffect(() => {
    if (state.engagedFlags['4.3.phase_compare'] && !state.interactionCompleteSections['4.3']) {
      markInteractionComplete(4, 3);
    }
  }, [state.engagedFlags, state.interactionCompleteSections, markInteractionComplete]);

  return (
    <SectionContainer
      module={module}
      sectionId={3}
      sectionTitle="Prompt reformulation"
      sectionLabel="Section 3 · P9 Interactive"
      width="interactive"
    >
      <p className="m-0 mb-6 font-sans text-body text-body">
        You’ve decided what to delegate. The next judgment is how to describe it. Description
        breaks down into three dimensions: <em>product</em> (what you want), <em>process</em>{' '}
        (how the AI should approach the task), and <em>performance</em> (how the AI should
        behave). Most underspecified prompts fail on all three at once. Read the weak prompt
        and its output, then rewrite it across all three dimensions.
      </p>
      <PromptComparison />
    </SectionContainer>
  );
}

// ─── S4: KC-4.1 + KC-4.2 ──────────────────────────────────────────
function Section4({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  const { track } = useAnalytics();
  useEffect(() => {
    const allDone = MODULE_4_KC_ITEMS_S4.every((item) =>
      Boolean(state.knowledgeChecks[`4.4.${item.id}`]),
    );
    if (allDone && !state.interactionCompleteSections['4.4']) {
      markInteractionComplete(4, 4);
      track({ type: 'kc_4_1_4_2_complete', moduleId: 4, sectionId: 4 });
    }
  }, [state.knowledgeChecks, state.interactionCompleteSections, markInteractionComplete, track]);

  return (
    <SectionContainer
      module={module}
      sectionId={4}
      sectionTitle="Knowledge check: Delegation and Description"
      sectionLabel="Section 4 · Tier 1 assessment"
      width="reading"
    >
      <p className="m-0 mb-6 font-sans text-body text-body">
        Two scenario-based items applying what you practiced in the task decomposition exercise
        and the prompt reformulation.
      </p>
      <ul className="m-0 list-none space-y-8 p-0">
        {MODULE_4_KC_ITEMS_S4.map((item, idx) => (
          <li key={item.id}>
            <KnowledgeCheck
              moduleId={4}
              sectionId={4}
              item={item}
              itemNumber={idx + 1}
              totalItems={MODULE_4_KC_ITEMS_S4.length}
            />
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}

// ─── S5 / P10: Output Verification ────────────────────────────────
function Section5({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  useEffect(() => {
    const allDone = ['element_1', 'element_2', 'element_3', 'element_4', 'element_5', 'element_6']
      .every((id) => Boolean(state.knowledgeChecks[`4.5.${id}`]));
    if (allDone && !state.interactionCompleteSections['4.5']) markInteractionComplete(4, 5);
  }, [state.knowledgeChecks, state.interactionCompleteSections, markInteractionComplete]);

  return (
    <SectionContainer
      module={module}
      sectionId={5}
      sectionTitle="Output verification"
      sectionLabel="Section 5 · P10 Interactive"
      width="interactive"
    >
      <p className="m-0 mb-6 font-sans text-body text-body">
        You’ve decomposed a task and specified it clearly. Now: which parts of an AI-generated
        deliverable can you trust, and which require independent verification? The exercise below
        puts a complete polished AI output in front of you: the kind of document that arrives in
        your inbox looking ready to forward. It is not ready to forward, and your job is to find
        out why.
      </p>
      <OutputVerification />
    </SectionContainer>
  );
}

// ─── S6 / P11: Iterative Refinement ──────────────────────────────
function Section6({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  useEffect(() => {
    // Complete once the learner has submitted their Turn 3 refinement
    // (the author-and-compare step is the pedagogical core). The only
    // fallback is `p11_t2_refinement`, a textarea key from the original
    // pre-restructure design, kept so old in-progress sessions don't
    // regress. `p11_t2_gap` must NOT count: the current Turn 2 submit
    // writes it, so treating it as a completion signal marked the
    // section done a full turn early — before the learner authored
    // their own refinement.
    const sectionDone =
      (state.reflections['4.6.p11_t3_refinement'] ?? '').trim().length >= 20 ||
      (state.reflections['4.6.p11_t2_refinement'] ?? '').trim().length >= 20;
    if (sectionDone && !state.interactionCompleteSections['4.6']) markInteractionComplete(4, 6);
  }, [state.reflections, state.interactionCompleteSections, markInteractionComplete]);

  return (
    <SectionContainer
      module={module}
      sectionId={6}
      sectionTitle="Iterative refinement"
      sectionLabel="Section 6 · P11 Interactive"
      width="interactive"
    >
      <p className="m-0 mb-6 font-sans text-body text-body">
        The task decomposition exercise practiced Delegation. The prompt reformulation practiced
        Description. The output verification practiced Discernment. This exercise puts the last
        two together in the cycle Module 3 named but didn’t practice: the Description-Discernment
        loop. Three structured turns on a single drafting task. The scaffolding makes the loop
        visible.
      </p>
      <IterativeRefinement />
    </SectionContainer>
  );
}

// ─── S7: KC-4.3 + KC-4.4 ──────────────────────────────────────────
function Section7({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  const { track } = useAnalytics();
  useEffect(() => {
    const s4Done = MODULE_4_KC_ITEMS_S4.every((item) =>
      Boolean(state.knowledgeChecks[`4.4.${item.id}`]),
    );
    const s7Done = MODULE_4_KC_ITEMS_S7.every((item) =>
      Boolean(state.knowledgeChecks[`4.7.${item.id}`]),
    );
    if (s7Done && !state.interactionCompleteSections['4.7']) {
      markInteractionComplete(4, 7);
      if (s4Done) {
        track({ type: 'kc_module_4_complete', moduleId: 4, sectionId: 7 });
      }
    }
  }, [state.knowledgeChecks, state.interactionCompleteSections, markInteractionComplete, track]);

  return (
    <SectionContainer
      module={module}
      sectionId={7}
      sectionTitle="Knowledge check: Discernment and the loop"
      sectionLabel="Section 7 · Tier 1 assessment"
      width="reading"
    >
      <p className="m-0 mb-6 font-sans text-body text-body">
        Two scenario-based items applying what you practiced in the output verification scenario
        and the iterative refinement exercise (the Description-Discernment loop).
      </p>
      <ul className="m-0 list-none space-y-8 p-0">
        {MODULE_4_KC_ITEMS_S7.map((item, idx) => (
          <li key={item.id}>
            <KnowledgeCheck
              moduleId={4}
              sectionId={7}
              item={item}
              itemNumber={idx + 1}
              totalItems={MODULE_4_KC_ITEMS_S7.length}
            />
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}

// ─── S8 / P12: Diligence Statement ────────────────────────────────
function Section8({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  useEffect(() => {
    const seen = Boolean(state.engagedFlags['4.8.exemplar_viewed']);
    if (seen && !state.interactionCompleteSections['4.8']) markInteractionComplete(4, 8);
  }, [state.engagedFlags, state.interactionCompleteSections, markInteractionComplete]);

  return (
    <SectionContainer
      module={module}
      sectionId={8}
      sectionTitle="Diligence statement"
      sectionLabel="Section 8 · P12 Interactive"
      width="interactive"
    >
      <DiligenceStatement />
    </SectionContainer>
  );
}

// ─── S9: Program closing ──────────────────────────────────────────
function Section9({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={9}
      sectionTitle="Program closing"
      sectionLabel="Section 9 · Reading"
      width="reading"
      autoComplete
    >
      {/* R7 — team policy starter — is the handoff tool the learner
          takes back to their team. Rendered as a right-edge tab while
          they're in the closing reading, mirroring how it'll feel to
          reach for outside the program. */}
      <ReferenceTabRail>
        <R7Trigger label="Policy Starter" />
      </ReferenceTabRail>
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          You started this program with a question most professionals think they’ve already
          answered: <em>do I know how to use AI effectively at work?</em>
        </p>
        <p className="m-0">
          Four modules later, you know why the question is harder than it sounds. The behavioral
          data says professionals overestimate how much they collaborate with AI versus how much
          they delegate to it, by 8 to 18 percentage points depending on the measurement
          <Citation
            ids={['handa-2025', 'anthropic-interviewer-2025']}
            pageKey="self-vs-behavioral"
          />
          . The mechanical data says the tool generates output by probability, not by retrieving
          facts, which means fluent text and accurate text are independent properties. And the
          adoption data says 69% of professionals mention the social stigma that comes with
          using AI at work
          <Citation ids="anthropic-interviewer-2025" pageKey="stigma-69" />, which means the
          fastest-growing capability in the modern workforce is developing in isolation, without
          shared standards, without peer learning, and without organizational visibility.
        </p>
        <p className="m-0">
          This program gave you four competencies as a practiced workflow, not as abstract
          categories. You decomposed a task to decide what belongs with AI and what stays human.
          You reformulated an underspecified prompt and saw the output difference that precise
          Description produces. You evaluated an AI-generated deliverable element by element,
          using mechanical reasoning to distinguish what you can trust from what you need to
          verify. You iterated through a multi-turn refinement cycle, practicing the
          Description-Discernment loop that converts a mediocre first draft into a reliable
          output. Finally, you produced a diligence statement: a concrete document that makes
          your AI practices visible to your team and your organization.
        </p>
        <p className="m-0">
          One caution belongs in this closing. Research on knowledge workers using generative AI
          has documented a pattern worth naming: the more confident people become in the tool,
          the less critical thinking they report applying to its output
          <Citation ids="lee-2025" pageKey="confidence-critical-thinking" />. Confidence is the
          intended product of a program like this one — but the confidence this program built is
          confidence in your evaluation process, not in the tool's output. The moment the
          verification workflow starts to feel unnecessary is the moment it is doing the most
          work. If your Discernment practice fades as the outputs keep looking clean, you have
          not become better at using AI; you have become a faster route for unverified content.
        </p>
        <p className="m-0">
          The diligence statement is the artifact that outlasts the program. The action commitment
          you wrote in Module 2 identified two tasks to change your approach to. The diligence
          statement you wrote in this module documented how you actually did it. Both are
          designed to persist: at 30, 60, and 90 days, the question is whether these practices
          have become part of how you work, sustained by the evidence and the mechanical
          understanding rather than by a training program telling you to do them.
        </p>
        <p className="m-0">
          The 4D vocabulary (Delegation, Description, Discernment, Diligence) was introduced in
          Module 1 as a normalization tool: shared language that makes AI practice discussable
          in professional settings where the default is concealment.
          It has since become a competency framework you’ve practiced across twelve activities
          and four modules. Both functions remain active. When you use the word “Delegation” to
          describe how you assigned components of a task, you are simultaneously exercising a
          professional competency and modeling the transparency that makes organizational
          learning possible.
        </p>

        <p className="m-0">
          The tools are on your desktop and the vocabulary is in your hands. The practice starts
          now.
        </p>
      </div>
    </SectionContainer>
  );
}

// ─── S10: Your competency profile ─────────────────────────────────
function Section10({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={10}
      sectionTitle="Your competency profile"
      sectionLabel="Section 10 · Summary"
      width="reading"
      autoComplete
    >
      <CompletionSummary />
    </SectionContainer>
  );
}
