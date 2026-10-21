// Module 3 — Understanding How Language Models Work (4C spec §6-13).
// Eleven sections plus three inline reliability-category callouts
// (S3.5, S5.5, S7.5) rendered within their preceding section's
// container so the sidebar stays at 11 entries (4C spec §6 design
// note).

import { useEffect } from 'react';
import { useSectionParam } from '../../hooks/useSectionParam';
import { R1Trigger } from '../../components/reference/R1Trigger';
import { ReferenceTabRail } from '../../components/reference/ReferenceTabRail';
import { BottleneckCallout } from '../../components/shared/BottleneckCallout';
import { Citation } from '../../components/shared/Citation';
import { KnowledgeCheck } from '../../components/shared/KnowledgeCheck';
import { SectionContainer } from '../../components/shared/SectionContainer';
import { getModuleOrThrow } from '../../data/program';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useLearnerProgress } from '../../contexts/LearnerProgressContext';
import { ContextWindowScenario } from './ContextWindowScenario';
import { DiagnosticPairTable } from './DiagnosticPairTable';
import { MODULE_3_KC_ITEMS } from './knowledge-check-items';
import { NextTokenDemo } from './NextTokenDemo';
import { StickerAnalogyDiagram } from './StickerAnalogyDiagram';
import { TokenComparisonDiagram } from './TokenComparisonDiagram';
import { TokenizerPlayground } from './TokenizerPlayground';

const MODULE_ID = 3;

export default function Module3(): JSX.Element {
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
    case 11:
      return <Section11 module={module} />;
    default:
      return <Section1 module={module} />;
  }
}

type ModuleProp = { module: ReturnType<typeof getModuleOrThrow> };

// ─── S1: Opening hook ──────────────────────────────────────────────
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
          Module 2 ended with a question: <em>why does the tool behave this way, and what does
          that tell me about when to trust it?</em>
        </p>
        <p className="m-0">
          You now know that AI productivity gains are real but unevenly distributed. You know that
          professionals overestimate how much they collaborate with AI versus how much they
          delegate to it. You know that the tasks where AI is fastest are often the tasks where
          it succeeds less often<Citation ids="appel-massenkoff-mccrory-2026" pageKey="speed-reliability-tradeoff" />, so that output most needs checking. And you know that the share of directive interactions
          (hand off the task, accept the result, move on) has been rising.
        </p>
        <p className="m-0">
          What you don’t yet know is <em>why</em> the tool produces fluent text that contains
          fabricated citations. Why it handles some tasks reliably and fails unpredictably on
          others. Why an AI-generated financial summary can look correct even when the numbers are
          invented. Why a multi-document analysis goes in and an incomplete synthesis comes out,
          with no warning that anything was lost.
        </p>
        <p className="m-0">
          Those failures are not random, and they are not bugs in the conventional sense. Models
          are improving: newer versions produce fewer errors across most tasks. But the{' '}
          <em>reason</em> these errors occur is structural to how language models generate output.
          The architecture predicts the next token based on statistical patterns, not factual
          verification. That mechanism has gotten more reliable, but it has not changed.
          Understanding it is what makes the failures predictable rather than surprising. On one
          routing platform, new open models often reached production-scale use within weeks of
          release, and those that stopped improving tended to lose
          share<Citation ids="openrouter-a16z-2025" pageKey="turnover-weeks-11" />. Any technique
          tied to one model's quirks goes out of date fast. What does not go out of date is the
          point industry analyst Benedict Evans keeps returning to: he sees no indication that
          error rates will go away<Citation ids="evans-2025-11" pageKey="error-rates-64" />. The operative
          questions are whether errors matter, whether verification can be automated, and where
          the human sits in the loop.
        </p>
        <p className="m-0">
          This module gives you three mechanical ideas and two additional properties that together
          explain most of what you will encounter when working with AI. You do not need an
          engineering background to follow them. Each one is a straightforward concept with a
          direct line to a specific category of failure you have almost certainly already
          experienced at work. By the end, you will be able to trace an unexpected output back to
          the mechanical property that caused it, and that traceability is what converts the
          behavioral awareness you built in Module 2 into evaluative judgment you can act on.
        </p>
        <p className="m-0">
          The concepts are mechanical, not mysterious. The consequences are practical. And the
          time investment is roughly twenty-five minutes. By the end, you will know why your AI
          tools fail in the specific ways they do.
        </p>
      </div>
    </SectionContainer>
  );
}

// ─── S2: How text becomes data ─────────────────────────────────────
function Section2({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={2}
      sectionTitle="How text becomes data — tokenization"
      sectionLabel="Section 2 · Reading + visual"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          When you type a message to an AI tool, you see words and sentences. The model does not.
          Before your text reaches the system that generates a response, it passes through a
          preprocessing step that breaks it into fragments called <strong>tokens</strong>: chunks
          of text that are often whole common words, often pieces of longer or rarer words, and
          sometimes single characters. This conversion process is called <strong>tokenization</strong>, and it is
          the first mechanical idea you need to understand, because several kinds of error that look
          random to a user (an unexpected word, a typo-like slip, trouble with an unfamiliar term)
          are predictable consequences of how this step works
         <Citation ids="ritchot-2025" pageKey="predictable-errors" />.
        </p>
        <p className="m-0">
          Think of the model's vocabulary as a fixed set of tokens: about 100,000 for the
          tokenizer this module's playground uses (OpenAI's cl100k_base), about 200,000 for
          OpenAI's newer o200k_base, and different again for other labs
          <Citation ids="openai-tiktoken" pageKey="vocab-sizes" />. Every input you provide must
          be represented using only those tokens. The pieces are not chosen by meaning or by
          spelling rules. Apart from a few fixed rules for where text may be split, such as
          cutting runs of digits into chunks of up to three, they are chosen by how often a
          character sequence appeared in the text the tokenizer was built from. A common English
          word like "report" matches a single token. An unusual term might require three or four
          tokens placed side by side to spell it out. The model never sees your original text; it
          only sees the token sequence. That is why the examples below look arbitrary until you
          know the rules. Tokens are also the unit vendors price by
         <Citation ids="evans-2025-05" pageKey="mtok-22" />, so an input that fragments into more
          tokens also costs more to process.
        </p>
      </div>

      {/* Static visual anchor for the token vocabulary: a sample strip
          plus a common-text and uncommon-text example showing the
          1-token vs. 5-token contrast. Inserted between the vocabulary
          introduction and the formal "A token is not a word" definition
          that follows. */}
      <div className="my-8">
        <StickerAnalogyDiagram />
      </div>

      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          A token is not a word. It is not a syllable. It is a statistically derived text
          fragment: a chunk that the tokenization algorithm identified as frequently recurring in
          the massive dataset used to build the model. Common English phrases that appeared
          millions of times in the training data compress into relatively few tokens. An unusual
          proper name, a line of Python code, or a sentence in Vietnamese fractures into many
          more, sometimes down to individual characters, because those patterns were rarer.
        </p>
        <p className="m-0">
          The algorithm that produces these fragments is called Byte Pair Encoding. You don’t need
          to know how it works internally; what matters is what it optimizes for. BPE scans the
          training data and identifies which pairs of characters appear together most frequently.
          It merges the most common pair into a single symbol, then repeats (thousands of times)
          until the vocabulary reaches the target size set by the tokenizer’s designers.
        </p>
      </div>

      <div className="my-8">
        <TokenComparisonDiagram />
      </div>

      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          That bias is the key point. Tokenization is not a neutral process. It is a compression
          algorithm that gives preferential treatment to frequently occurring patterns, which in
          practice means common English text. Three consequences follow directly.
        </p>
        <h3 className="m-0 mt-2 font-sans text-h3 font-semibold text-ink">
          First, numbers tokenize inconsistently.
        </h3>
        <p className="m-0">
          The digit sequence “127” is a single token, while “1279” splits into “127” and
          “9.” Here the split does not come from frequency. The tokenizer this module uses, and
          OpenAI’s newer o200k_base, cut every run of digits into chunks of up to three, counting
          from the left<Citation ids="openai-tiktoken" pageKey="digit-grouping" />, so even a
          common year like “2024” becomes “202” and “4.” Place value groups digits from the
          right, so the token boundaries often ignore the number’s mathematical structure. Typed
          without commas, 12345678 becomes 123 / 456 / 78. Typed as 12,345,678, it becomes
          12 / , / 345 / , / 678, with each comma a token of its own. It is the same number split
          two ways, and only the second split lines up with place value. Other vendors chose
          other rules: the tokenizer Google uses for Gemini 2.0 and Gemma 3 splits every digit
          apart<Citation ids="gemma-team-2025" pageKey="split-digits" />. None of these rules
          does arithmetic. This is why AI tools make arithmetic errors that look bizarre: the
          model is not performing calculation on numbers, it is predicting the next token in a
          sequence of fragments that happen to contain digits.
        </p>
        <p className="m-0">
          Newer AI tools partially address this by routing arithmetic to external calculators
          or code interpreters; when they do, the calculation is exact. But the model must
          first recognize that a calculation is needed and choose to use the tool. When it
          doesn't (when it generates the answer directly from token prediction), the errors
          return.
        </p>
        <h3 className="m-0 mt-2 font-sans text-h3 font-semibold text-ink">
          Second, non-English text fragments more aggressively.
        </h3>
        <p className="m-0">
          A sentence in English might tokenize into 15 tokens. The same semantic content in
          Japanese, Arabic, or Hindi might produce 40 or more, because those character sequences
          were less frequent in the training data and therefore received less compression. More
          tokens means a longer sequence, which consumes more of the model’s working memory and
          increases the surface area for generation errors. Newer tokenizers narrow the gap
          without closing it. In this module’s tokenizer, the nine-token English request “Please
          review the attached quarterly report before Friday” takes 59 tokens in Hindi; OpenAI’s
          newer o200k_base needs 18. Across languages and tokenizers, researchers have measured
          the same text costing up to 15 times as many tokens
         <Citation ids="petrov-2023" pageKey="up-to-15x" />.
        </p>
        <h3 className="m-0 mt-2 font-sans text-h3 font-semibold text-ink">
          Third, character-level tasks are structurally difficult.
        </h3>
        <p className="m-0">
          When you ask “how many R’s are in ‘strawberry’?”, you are asking about individual
          letters. But the model does not see individual letters; it sees tokens. In this
          module’s tokenizer, “strawberry” after a space is one token. Inside quotation marks, as
          in the question above, it becomes three: str / aw / berry. Try both in the playground
          in the next section. OpenAI’s newer tokenizer cuts the quoted word into st / raw /
          berry. Counting
          characters within a token requires the model to have learned, during training, exactly
          which letters are packed inside that token ID. It sometimes gets this right. It often
          does not. Routing the same question to a code tool that steps through the characters
          one by one returns the correct count every time; the failure isn’t in the question,
          it’s in which pathway handles it.
        </p>
        <p className="m-0">
          Tokenization is invisible in normal use. No commercial AI tool shows you the token
          boundaries in its interface. The fragmentation happens silently, between your input and
          the model’s processing. The interactive exercise that follows makes the invisible
          visible.
        </p>
      </div>
    </SectionContainer>
  );
}

// ─── S3 / P5: Tokenizer Playground + S3.5 callout ──────────────────
function Section3({ module }: ModuleProp): JSX.Element {
  // Section completes once all four guided rounds are submitted.
  const { state, markInteractionComplete } = useLearnerProgress();
  useEffect(() => {
    const allDone = [1, 2, 3, 4].every(
      (n) => state.knowledgeChecks[`3.3.p5_round_${n}`],
    );
    if (allDone && !state.interactionCompleteSections['3.3']) {
      markInteractionComplete(3, 3);
    }
  }, [state.knowledgeChecks, state.interactionCompleteSections, markInteractionComplete]);

  return (
    <SectionContainer
      module={module}
      sectionId={3}
      sectionTitle="Tokenizer playground"
      sectionLabel="Section 3 · P5 Interactive"
      width="interactive"
    >
      <p className="m-0 mb-6 font-sans text-body text-body">
        Predict the token count, then see the actual result. Four guided rounds — each designed
        to surface a different aspect of the tokenizer’s behavior — followed by free exploration
        with your own text. Counts here come from one widely used tokenizer (cl100k_base); other
        models split text differently, but the pattern — common text compresses, unusual text
        fragments — holds across all of them.
      </p>
      <TokenizerPlayground />

      {/* S3.5 inline callout — Reliability category 1 */}
      <div className="mt-10">
        <BottleneckCallout title="Unreliable task category 1 — Boundary tasks">
          <p className="m-0">
            Arithmetic, spelling, character-level operations, and multilingual content sit at the
            boundaries of the model’s symbol system. Tokenization unevenness makes errors in
            these areas structurally predictable, not random. When you encounter an AI output
            that miscounts, misspells, or handles non-English text inconsistently, you are seeing
            a tokenization consequence, and knowing that tells you the error will recur on
            similar inputs, not self-correct.
          </p>
        </BottleneckCallout>
      </div>
    </SectionContainer>
  );
}

// ─── S4: How output gets generated ─────────────────────────────────
function Section4({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={4}
      sectionTitle="How output gets generated: next-token prediction"
      sectionLabel="Section 4 · Reading"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          If you leave this module with
          only one concept, it should be this: language models generate output by predicting the
          next token in a sequence, one fragment at a time, based on probability. On their own,
          language models do not retrieve information from a database, look up facts, or consult
          a reference. This is the break from the workplace software most people know. A
          spreadsheet, a database, or a payroll system is deterministic: the same input always
          yields the same output, and it handles tasks that are easy to explain to a computer. A
          language model is probabilistic: it handles tasks that are easy to explain to an
          intern, and it might get the answer wrong
         <Citation ids="evans-2025-05" pageKey="deterministic-probabilistic-27" />. Industry analyst Benedict Evans describes
          generative AI as probabilistic systems added on top of deterministic ones
         <Citation ids="evans-2026-05" pageKey="probabilistic-52" />. The questions you can now
          ask are questions deterministic software could never take, such as what the top
          customer concerns were across six months of calls
         <Citation ids="evans-2026-05" pageKey="new-questions-66" />. Modern AI systems can be equipped
          with tools (web search, code
          interpreters, document retrieval) that provide external information. But the language
          generation itself, the part that assembles the response you read, still operates by
          predicting the next token based on statistical patterns. The tools supply inputs; the
          model's prediction mechanism produces the prose. Understanding what the mechanism does
          without tools is what makes tool-augmented behavior legible: you can distinguish when
          a system is retrieving a fact from when it is generating one.
        </p>
        <p className="m-0">
          This is called <strong>next-token prediction</strong>, and it is the core mechanism
          behind every piece of text a language model produces.
        </p>
        <p className="m-0">
          You type a prompt. The model receives it as a sequence of tokens. It processes that
          sequence and generates a probability distribution: a ranked list of every token in its
          vocabulary (about 100,000 options for the cl100k_base tokenizer used in this module,
          about 200,000 for newer OpenAI models) with a probability attached to each one
         <Citation ids="openai-tiktoken" pageKey="vocab-sizes" />. The model selects a token
          from this distribution, appends it to the sequence, and repeats, one token at a time,
          until it reaches a stopping point.
        </p>
        <h3 className="m-0 mt-2 font-sans text-h3 font-semibold text-ink">
          Fluency and accuracy are independent.
        </h3>
        <p className="m-0">
          A real citation and a fabricated citation satisfy the same statistical pattern. Both
          look like author names followed by years followed by journal titles, because that is
          the pattern the model learned. The model has no internal mechanism to distinguish “this
          is a real paper” from “this sequence of tokens looks like a real paper.” The text is
          fluent because fluency is what the prediction mechanism optimizes for. Accuracy is a
          separate question that the mechanism does not address.
        </p>
        <h3 className="m-0 mt-2 font-sans text-h3 font-semibold text-ink">
          Knowledge: the model’s probabilities are frozen.
        </h3>
        <p className="m-0">
          The statistical patterns the model uses to predict the next token were learned during
          training, a process that consumed months and enormous computational resources. When
          training ends, the patterns are fixed. The model has a <strong>knowledge cutoff</strong>
          , and topics that appeared rarely in the training data are represented thinly, making
          its predictions about niche or recent topics more likely to drift from plausible to
          fabricated. Retrieval-augmented systems can access documents or search results that
          postdate the cutoff, but the model's own statistical patterns (the ones that shape
          how it interprets and presents that retrieved information) remain fixed.
        </p>
        <h3 className="m-0 mt-2 font-sans text-h3 font-semibold text-ink">Temperature.</h3>
        <p className="m-0">
          A parameter controlling how the model selects from its probability distribution. At
          low temperature, the model almost always picks the highest-probability token, producing
          consistent, predictable output. At high temperature, the model is willing to select
          lower-probability tokens, producing more varied output but with a higher chance of
          drifting into implausible territory. You will rarely set it yourself. Most chat apps
          offer no temperature control, and on Anthropic’s newest models the developer interface
          rejects any temperature other than the default
         <Citation ids="anthropic-thinking-2026" pageKey="sampling-parameters" />. Temperature
          still explains why the same prompt gives different answers. What you control is the
          prompt: ask for one answer, or ask for ten distinct options.
        </p>
        <p className="m-0">
          The interactive demonstration below shows both features in action: probability-based
          selection, and the effect of temperature on output.
        </p>
      </div>
    </SectionContainer>
  );
}

// ─── S5 / P6: NextTokenDemo + S5.5 callout ─────────────────────────
function Section5({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  // Spec §14: complete when all 3 stems viewed AND ≥1 token generated on
  // Stem 1 or Stem 2.
  useEffect(() => {
    const tabsViewed =
      Boolean(state.viewedTabs['3.5.stem_1']) &&
      Boolean(state.viewedTabs['3.5.stem_2']) &&
      Boolean(state.viewedTabs['3.5.stem_3']);
    const generated =
      Boolean(state.engagedFlags['3.5.stem_1_generated']) ||
      Boolean(state.engagedFlags['3.5.stem_2_generated']);
    if (tabsViewed && generated && !state.interactionCompleteSections['3.5']) {
      markInteractionComplete(3, 5);
    }
  }, [state.viewedTabs, state.engagedFlags, state.interactionCompleteSections, markInteractionComplete]);

  return (
    <SectionContainer
      module={module}
      sectionId={5}
      sectionTitle="Next-token prediction in action"
      sectionLabel="Section 5 · P6 Interactive"
      width="interactive"
    >
      <p className="m-0 mb-6 font-sans text-body text-body">
        Three stems show the prediction mechanism in three modes: a pattern-completion task where
        one token dominates, a factual-specificity task where no candidate dominates, and a
        side-by-side temperature comparison where the same prompt produces three different
        outputs. The candidate tokens and their base probabilities are illustrative, pre-computed
        examples rather than a live model's output; the temperature math applied to them is the
        real softmax calculation, the same mechanism commercial models use.
      </p>
      <NextTokenDemo />

      {/* S5.5 inline callout — Reliability category 2 */}
      <div className="mt-10">
        <BottleneckCallout title="Unreliable task category 2 — Specificity tasks">
          <p className="m-0">
            Names, dates, citations, statistics, URLs, and direct quotes sit in the zone where
            fabrication concentrates. The model generates what a plausible citation <em>looks
            like</em> because pattern completion, not factual accuracy, drives the output. The
            more precise the claim, the more it warrants independent verification. If an
            AI-generated deliverable contains a specific factual assertion (a number, a name, a
            quoted source), treat it as a draft to be checked, not a fact to be trusted.
          </p>
        </BottleneckCallout>
      </div>
    </SectionContainer>
  );
}

// ─── S6: Context windows and working memory ────────────────────────
function Section6({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={6}
      sectionTitle="Context windows and working memory"
      sectionLabel="Section 6 · Reading"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          The third mechanical idea is the simplest to state and the hardest to see: the model
          has a fixed-size container for everything it can process at once, and you may not be
          told what the model did not see.
        </p>
        <p className="m-0">
          This container is called the <strong>context window</strong>. It holds your prompt, any
          documents you’ve uploaded, the conversation history so far, and the model’s own output
          as it generates, all of it measured in tokens. Advertised sizes vary widely by model. As
          of September 2026, the flagship hosted models from Anthropic, OpenAI, and Google each
          advertise about one million tokens
         <Citation ids="anthropic-models-2026" pageKey="context-window" />
         <Citation ids="openai-models-2026" pageKey="context-window" />
         <Citation ids="google-gemini-models-2026" pageKey="input-token-limit" />. Open-weight
          models, which organizations can download and run on their own hardware, commonly
          advertise 128,000 tokens, and some handle 32,000 tokens
          natively<Citation ids="qwen3-model-card-2025" pageKey="context-length" />. This module
          uses 200,000 tokens as its working example: it sits between the open-weight and
          flagship sizes and is a round number for the arithmetic that follows. Most requests use a small
          fraction of that, even though average prompts have grown, mostly in programming work
         <Citation ids="openrouter-a16z-2025" pageKey="prompt-length-6k" />. The window rarely
          binds on a single request. It binds over a session, which is the failure mode described
          below.
        </p>
        <p className="m-0">
          What a 200K window actually holds depends entirely on what you put in. English prose
          runs about 75,000 words per 100,000 tokens in OpenAI’s tokenizers, so 200K is roughly the
          length of a 500-page novel. Counts differ by vendor and even by model version: Anthropic
          says the tokenizer it introduced with Claude Opus 4.7 produces about 30 percent more
          tokens for the same text
         <Citation ids="anthropic-token-counting-2026" pageKey="newer-tokenizer" />. Other formats fit very differently. The same content in Japanese or another
          non-Latin script can use two to three times as many tokens for the same meaning,
          leaving room for the equivalent of roughly 170 to 250 pages of an English novel rather
          than 500.
          Source code is heavier than equivalent English prose because operators, punctuation,
          and split identifiers each consume tokens; a few hundred lines of Python can run
          several thousand. Spreadsheets and CSVs are heavier than they look: every comma,
          cell value, and digit fragment registers as its own piece. Budget two to four tokens per
          cell. A 2,000-row sales export with seven columns (date, region, SKU, units, price,
          revenue, rep) comes to about 58,000 tokens in this module’s tokenizer, and a two-column
          list of the same length to about 9,000.
        </p>
        <p className="m-0">
          That sounds like a lot until you upload your team’s vendor portfolio for a quarterly
          review (twenty contracts plus the renegotiation memos) and work through it across an
          hour of follow-up questions. The initial upload might fit comfortably, but each prompt
          and each generated response adds to the running total, and the conversation history
          that grows around the documents can eventually rival the documents themselves.
          Reasoning models add a draw you do not see. When a model works through a problem in
          steps before it answers, those steps are reasoning tokens, and they count as output.
          On the same routing platform, average completion length nearly tripled during 2025,
          from about 150 to 400 tokens, mostly because of reasoning tokens
         <Citation ids="openrouter-a16z-2025" pageKey="reasoning-tokens-completion" />. A tool
          that thinks longer is also a tool that fills its container faster.
        </p>
        <p className="m-0">
          Flagship models now advertise context windows of about one million tokens, but
          research on long-context performance shows that accuracy on demanding tasks degrades
          well before the advertised limit. In a 2024 benchmark of 17 models that each claimed at
          least 32,000 tokens, only about half stayed above the benchmark’s pass mark at 32,000
          tokens on tasks that ask a model to find planted facts, follow a chain of references,
          pick out the most frequent words, and answer questions about a long input
         <Citation ids="hsieh-ruler-2024" pageKey="half-at-32k" />. GPT-4, which claimed
          128,000 tokens, stayed above it up to 64,000
         <Citation ids="hsieh-ruler-2024" pageKey="effective-length" />. When the question and
          the relevant passage share almost no words, the drop is steeper. In a 2025 test of 13
          models claiming at least 128,000 tokens, 11 lost more than half their short-context
          accuracy by 32,000 tokens
         <Citation ids="modarressi-nolima-2025" pageKey="drop-at-32k" />. The practical rule is
          that the advertised window is a ceiling on what fits, not a promise about what the
          model will use well. The window has a maximum size, and that maximum is absolute. There is
          no overflow mechanism, no “page two” of the model’s attention. What happens at the limit
          depends on the tool. A single input that is too long is usually refused with an error
         <Citation ids="anthropic-context-windows-2026" pageKey="overflow" />. Two other cases
          are quiet. Over a long conversation, chat apps drop or summarize the oldest turns to
          make room<Citation ids="anthropic-context-windows-2026" pageKey="rolling" />. And some
          tools stop placing a large upload in the window at all: they search it and pass the
          model only the passages that match your question
         <Citation ids="anthropic-rag-projects-2026" pageKey="search-mode" />. In both quiet
          cases, the response does not tell you what the model never saw.
        </p>
        <h3 className="m-0 mt-2 font-sans text-h3 font-semibold text-ink">
          Context exhaustion is usually cumulative.
        </h3>
        <p className="m-0">
          You upload a project folder (a year of meeting notes, the customer interview
          transcripts, the original spec, the post-mortems from related work) and ask for a
          retrospective. The first response fits. You ask for revisions, regenerate sections,
          compare angles. Each round adds to the running total. By the time the conversation has
          run long enough, files that fit at the start may be silently dropped or summarized to
          make room for what came later. The model will still produce a fluent, complete-sounding
          retrospective, because fluent, complete-sounding text is what next-token prediction
          optimizes for. Nothing in the response will signal that three interview transcripts
          and half the post-mortems were dropped two prompts ago.
        </p>
        <h3 className="m-0 mt-2 font-sans text-h3 font-semibold text-ink">
          Position within the window matters.
        </h3>
        <p className="m-0">
          Even when your input fits inside the context window, the model does not attend to all
          positions equally. Research on long-context language models has documented a{' '}
          <strong>lost-in-the-middle effect</strong>
         <Citation ids="liu-2024" />: material at the beginning and end of the input receives
          more attention than material buried in the center. If you upload a 200-page document
          and the critical
          clause is on page 100, the model is more likely to miss it than if the same clause
          appeared on page 1 or page 200.
        </p>
        <h3 className="m-0 mt-2 font-sans text-h3 font-semibold text-ink">
          Memory across conversations is limited and selective.
        </h3>
        <p className="m-0">
          Each conversation starts with an empty context window. The detailed instructions you
          provided yesterday, the corrections you made, the preferences you expressed: none of
          it carries forward automatically through the model itself. Many AI tools now offer
          memory features that persist selected information across conversations, such as saved
          preferences, project context, and key facts you have told the system. These features help,
          but they are selective and lossy: the tool decides what to retain, the stored memories
          consume part of the context window when loaded, and nuance from earlier exchanges is
          often compressed into summaries. The base reality remains: the model itself does not
          learn from your conversations. Product features layer persistence on top of a mechanism
          that has none.
        </p>
        <p className="m-0">
          Quality degradation over a long conversation is often a context window problem, not a
          capability problem. As the conversation grows, earlier messages consume an increasing
          share of the window, and your original instructions may lose influence as they drift
          toward the middle. Some AI tools use{' '}
          <strong>compaction</strong>, automatically condensing earlier conversation history to
          free up space when a session runs long. This extends the usable conversation length,
          but the condensation is lossy: the model retains the general trajectory of the exchange
          while specific details from earlier may be compressed or dropped. If you notice an AI
          tool “forgetting” what you asked for partway through a long session, the explanation is
          mechanical. The fix is to start a fresh conversation with your key constraints restated
          at the top rather than repeating yourself louder.
        </p>
      </div>
    </SectionContainer>
  );
}

// ─── S7 / P7: ContextWindowScenario + S7.5 callout ─────────────────
function Section7({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  useEffect(() => {
    const allItems = [1, 2, 3, 4].every(
      (n) => state.knowledgeChecks[`3.7.p7_item_${n}`],
    );
    if (allItems && !state.interactionCompleteSections['3.7']) {
      markInteractionComplete(3, 7);
    }
  }, [state.knowledgeChecks, state.interactionCompleteSections, markInteractionComplete]);

  return (
    <SectionContainer
      module={module}
      sectionId={7}
      sectionTitle="Context window scenario: the missing clause"
      sectionLabel="Section 7 · P7 Interactive"
      width="interactive"
    >
      <p className="m-0 mb-6 font-sans text-body text-body">
        A simulated contract review where the AI tool has summarized a 42-page agreement. The
        full document fits comfortably inside the model’s context window; this scenario is not
        about truncation. It is about what happens to the model’s attention within the window,
        which is the harder failure to detect because the output looks complete. Compare the
        summary against the source excerpts, flag what is accurate and what is not, then see the
        mechanism reveal. Two errors are embedded, each from a different failure mode.
      </p>
      <ContextWindowScenario />

      {/* S7.5 inline callout — Reliability category 3 */}
      <div className="mt-10">
        <BottleneckCallout title="Unreliable task category 3 — Volume tasks">
          <p className="m-0">
            Long document analysis, multi-source synthesis, and extended conversations push
            against the context window’s hard limits. When critical information falls outside the
            window or gets buried in the middle, the model generates plausible but incomplete
            outputs and does not signal that information was lost. The longer the input, the
            more important it becomes to verify that the output reflects the full source rather
            than only the parts the model attended to.
          </p>
        </BottleneckCallout>
      </div>
    </SectionContainer>
  );
}

// ─── S8: Steerability ──────────────────────────────────────────────
function Section8({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={8}
      sectionTitle="The remaining piece: steerability"
      sectionLabel="Section 8 · Reading"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        {/* R1 (4D Quick Reference) — S8 introduces Steerability and ties
            it to the other 4D dimensions; this is the first M3 section
            where the named-competency framing is explicit, mirroring
            M1 S5 and M2 S6's placement pattern. */}
        <ReferenceTabRail>
          <R1Trigger label="4D Reference" />
        </ReferenceTabRail>
        <p className="m-0">
          You now have three mechanical ideas: tokenization determines how text enters the model,
          next-token prediction determines how output is generated, and the context window
          determines how much the model can hold at once. Together they explain a large share of
          the AI failures you will encounter at work. Section 4 added a fourth, knowledge: the
          patterns frozen at the training cutoff and thin on rare topics. A fifth property
          completes the picture, and it governs something you have direct control over: how well
          the model follows your instructions.
        </p>
        <p className="m-0">
          <strong>Steerability</strong> is the degree to which the model’s output actually
          conforms to what you asked for. When you give an instruction, the model interprets that
          instruction through the same probabilistic mechanism that generates everything else. It
          predicts what a response to your instruction would look like, based on patterns from
          its training data. Sometimes that prediction aligns precisely with your intent.
          Sometimes it does not. Three steerability failures come up most often.
        </p>
        <p className="m-0">
          The first is <strong>sycophancy</strong>. The model is trained on data where agreeable,
          affirming responses are common, and the human-preference tuning that follows rewards
          agreeable answers: people, and the reward models trained on their ratings, tend to
          prefer a response that matches their own view, sometimes over a correct one
         <Citation ids="sharma-2024" pageKey="preference-data" />. When you present a flawed argument and ask for
          feedback, the most statistically probable response is agreement, not critique. The
          model is more likely to tell you your analysis is insightful than to tell you it
          contains an error.
        </p>
        <p className="m-0">
          The second is <strong>verbosity</strong>. Ask for a one-paragraph summary and you may
          receive four paragraphs. Preference tuning rewards length: in studies of that
          tuning, reward models scored longer answers higher, and much of the measured gain came
          from answers simply getting longer
         <Citation ids="singhal-2024" pageKey="length-bias" />.
        </p>
        <p className="m-0">
          The third is <strong>format compliance without content accuracy</strong>. The model can
          follow structural instructions like “use bullet points” or “include a references
          section” while filling that structure with generated content that satisfies the format
          but not the substance. A neatly formatted table of quarterly figures can contain
          fabricated numbers. A references section can list citations that do not exist.
        </p>
        <p className="m-0">
          Steerability is what the Description competency acts on. The clearer and more specific
          your instructions, the more leverage you have over the output. But there is always a
          gap between words and intent, and that gap is where Discernment steps in. No
          instruction, however well-crafted, eliminates the need to evaluate what comes back.
        </p>
      </div>
    </SectionContainer>
  );
}

// ─── S9: When properties meet ──────────────────────────────────────
function Section9({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={9}
      sectionTitle="When properties meet"
      sectionLabel="Section 9 · Reading + reference"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        {/* R1 (4D Quick Reference) — S9 synthesizes the diagnostic-pair
            framework, which the body text explicitly maps to Discernment
            and the broader 4D vocabulary. Same placement pattern as S8. */}
        <ReferenceTabRail>
          <R1Trigger label="4D Reference" />
        </ReferenceTabRail>
        <p className="m-0">
          You now have five concepts (tokenization, next-token prediction, knowledge, context
          window, and steerability) and three categories of tasks where reliability is
          structurally limited: boundary tasks, specificity tasks, and volume tasks. That is a
          useful toolkit. But most of the AI failures you will encounter at work do not come from
          a single property acting alone. They come from two properties intersecting, and when
          you can name which two, the fix becomes obvious.
        </p>
        <p className="m-0">
          Consider a failure you may have already experienced: you ask an AI tool to summarize a
          research report and include citations. The summary is fluent and well-organized. The
          citations look real: author names and publication years, journal titles, all formatted
          correctly. You check one. It does not exist.
        </p>
        <p className="m-0">
          This is not a single-property failure. It is two properties meeting.{' '}
          <strong>Next-token prediction</strong> generated citation-shaped text because that is
          the most statistically probable pattern at that position. <strong>Knowledge</strong>
          {' '}(the frozen, unevenly distributed representation of the training data) provided no
          reliable anchor for the specific authors, dates, and titles the model needed to
          produce. The fix follows directly from the diagnosis: use source grounding, supply
          actual documents, or verify every citation independently.
        </p>
        <p className="m-0">
          Five diagnostic pairs account for the majority of workplace AI failures. The first
          three appear most often; the final two surface in specific contexts.
        </p>
      </div>

      <div className="my-8">
        <DiagnosticPairTable />
      </div>

      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          These five pairs are not exhaustive. But they cover the failures you will encounter
          most frequently in professional work, and the diagnostic habit they build is
          transferable:
          before reaching for a prompt fix, ask <em>which properties am I looking at?</em> A
          knowledge problem and a context window problem can look similar on the surface,
          because both produce outputs that are missing information you expected. But they need
          completely different fixes. Naming the properties first means you are operating
          strategically instead of guessing.
        </p>
        <p className="m-0">
          This diagnostic habit is Discernment at the mechanical level, and it also feeds
          Delegation. If the same property pair keeps failing on the same task type, that is a
          signal about whether the task belongs in AI-assisted workflow at all, or whether it
          needs to be restructured, broken into smaller pieces, or kept fully human.
        </p>
      </div>
    </SectionContainer>
  );
}

// ─── S10: Knowledge check ──────────────────────────────────────────
function Section10({ module }: ModuleProp): JSX.Element {
  const { state, markInteractionComplete } = useLearnerProgress();
  const { track } = useAnalytics();
  useEffect(() => {
    const allDone = MODULE_3_KC_ITEMS.every((item) =>
      Boolean(state.knowledgeChecks[`3.10.${item.id}`]),
    );
    if (allDone && !state.interactionCompleteSections['3.10']) {
      markInteractionComplete(3, 10);
      track({ type: 'kc_module_3_complete', moduleId: 3, sectionId: 10 });
    }
  }, [state.knowledgeChecks, state.interactionCompleteSections, markInteractionComplete, track]);

  return (
    <SectionContainer
      module={module}
      sectionId={10}
      sectionTitle="Knowledge check"
      sectionLabel="Section 10 · Tier 1 assessment"
      width="reading"
    >
      <p className="m-0 mb-6 font-sans text-body text-body">
        Four scenario-based items. Pick the response best supported by the mechanical framework
        from this module. There is no pass/fail threshold and no time limit. Attempt all four to
        complete the section.
      </p>
      <ul className="m-0 list-none space-y-8 p-0">
        {MODULE_3_KC_ITEMS.map((item, idx) => (
          <li key={item.id}>
            <KnowledgeCheck
              moduleId={3}
              sectionId={10}
              item={item}
              itemNumber={idx + 1}
              totalItems={MODULE_3_KC_ITEMS.length}
            />
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}

// ─── S11: Transition to Module 4 ──────────────────────────────────
function Section11({ module }: ModuleProp): JSX.Element {
  return (
    <SectionContainer
      module={module}
      sectionId={11}
      sectionTitle="Transition to Module 4"
      sectionLabel="Section 11 · Reading"
      width="reading"
      autoComplete
    >
      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0">
          You came into this module knowing that verification matters. Module 2’s behavioral
          data made that case clearly. You now know <em>why</em> it matters, and more importantly,
          <em> what to verify</em>.
        </p>
        <p className="m-0">
          Three mechanical properties shape every AI output you will encounter. Tokenization
          determines how your text enters the model, and its unevenness produces systematic
          errors in arithmetic, multilingual content, and character-level tasks. Next-token
          prediction determines how output is generated: one token at a time, by probability,
          with no mechanism to distinguish real from plausible. The context window determines
          how much the model can hold; it is a fixed container with a hard edge, and you may not be
          told what falls outside it. Two more properties round out the set: knowledge
          that is frozen at the training cutoff and unevenly distributed across topics, and
          steerability that follows the most probable response pattern rather than your exact
          intent.
        </p>
        <p className="m-0">
          These five properties are not separate problems; they interact. Hallucinated citations
          (hallucination is the industry’s name for this class of fabricated specifics)
          are next-token prediction meeting thin knowledge. Long-conversation drift is context
          window limits meeting steerability. Confident arithmetic errors are tokenization
          meeting probability-based generation. Naming the pair that failed is the diagnostic
          habit that converts a vague sense that “something is off” into a targeted response.
        </p>
        <p className="m-0">
          That is the mechanical foundation. What it does not yet give you is a practiced
          workflow for applying it. Module 4 closes that gap. It moves through five practice
          tasks: decomposing a workplace task into components that belong to different
          reliability zones; reformulating an underspecified prompt and comparing the outputs
          side by side; evaluating an AI-generated deliverable by identifying exactly which
          elements need verification and which can be trusted; refining a draft over several
          turns; and writing a diligence statement that documents how AI contributed.
        </p>
        <p className="m-0">
          The question shifts from <em>“why does the tool behave this way?”</em> to{' '}
          <em>“given what I now know about how it works, how do I evaluate what it gives me, and
          what do I do when it fails?”</em>
        </p>
      </div>
    </SectionContainer>
  );
}
