// Pre-Assessment instrument — 10 scenario-based items administered
// BEFORE Module 1. No course vocabulary assumed; learners answer based
// on existing intuition and experience. Responses are recorded without
// feedback during the pre-assessment itself; the same constructs are
// re-tested with parallel scenarios in the post-assessment (see
// `post-assessment.ts`), and the comparative view in
// `components/assessment/AssessmentResults.tsx` shows pre→post
// learning gains.
//
// Source: the pre-assessment instrument document (Phase 4 planning corpus).
// Answer key distribution: A=2, B=3, C=2, D=3.

export type AssessmentBlock = 'usage' | 'failure' | 'mechanics' | 'evaluation';

export interface AssessmentOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect: boolean;
  /** Consequence-based feedback. Not shown during pre-assessment, but
   *  carried in the data so the post-assessment results view can show
   *  parallel feedback for the same construct from the post item. */
  feedbackText: string;
}

export interface AssessmentItem {
  /** Stable id, e.g. "PRE-1" or "POST-1". Used as the localStorage key
   *  for the learner's response. */
  id: string;
  /** Human-readable construct name shown in the results view header. */
  construct: string;
  /** Machine key to join pre and post items by construct. Same value
   *  on both sides of a parallel pair (e.g. "augmentation-automation"). */
  constructKey: string;
  block: AssessmentBlock;
  /** Module/objective refs from the instrument doc, e.g. ["2.1","2.4"]. */
  objectiveRefs: string[];
  /** Full scenario stem. May contain blank-line-separated paragraphs and
   *  a numbered list (rendered via the shared markdown-lite renderer). */
  stem: string;
  /** 15–25-word summary surfaced in the comparative results view as a
   *  reminder of what the scenario was about. */
  scenarioSummary: string;
  options: AssessmentOption[];
}

export const PRE_ASSESSMENT_ITEMS: AssessmentItem[] = [
  {
    id: 'PRE-1',
    construct: 'Augmentation vs. automation',
    constructKey: 'augmentation-automation',
    block: 'usage',
    objectiveRefs: ['2.1', '2.4'],
    stem:
      'Based on large-scale behavioral research, which of the following best describes how professionals currently work with AI tools?',
    scenarioSummary:
      'How professionals actually use AI tools vs. how they describe using them.',
    options: [
      {
        id: 'A',
        text:
          'Most professionals who use AI regularly engage in iterative, multi-turn collaboration: going back and forth with the tool, refining outputs together until the result meets their standards. Self-reported usage patterns reliably reflect these actual interaction styles.',
        isCorrect: false,
        feedbackText:
          'Behavioral data tells a different story. While professionals frequently describe their AI use as collaborative, observed interaction patterns show a trend toward single-turn, directive usage: one request, one response, no iteration. The gap between how professionals describe their AI workflow and how they actually interact with these tools is one of the most consistent findings in adoption research.',
      },
      {
        id: 'B',
        text:
          'Most professionals interact with AI in directive, single-turn exchanges (typing a request, receiving output, using it with minimal iteration) even when they describe their usage as iterative collaboration.',
        isCorrect: true,
        feedbackText:
          'Large-scale behavioral studies show that directive, single-turn interactions have increased over time, even as professionals describe their usage as iterative collaboration. This matters because single-turn usage produces output that hasn\'t been refined through human judgment. That raises the risk of unverified or low-quality deliverables. Without awareness of this pattern, teams can\'t assess whether their actual workflow matches their intended quality standard.',
      },
      {
        id: 'C',
        text:
          'Most professionals limit AI usage to routine administrative tasks such as data formatting, scheduling, and email sorting, and avoid using it for complex creative or analytical work.',
        isCorrect: false,
        feedbackText:
          'AI usage for complex tasks like drafting and analysis is widespread and growing. It extends well beyond routine administrative work.',
      },
      {
        id: 'D',
        text:
          'Most professionals who describe themselves as frequent AI users actually engage with these tools far less consistently than their self-reports suggest. The gap is in usage frequency, not interaction style.',
        isCorrect: false,
        feedbackText:
          'The issue is misidentifying interaction quality, not exaggerating frequency. Professionals genuinely use AI frequently; the gap is in how they characterize the nature of that interaction.',
      },
    ],
  },
  {
    id: 'PRE-2',
    construct: 'Productivity gain vs. verification burden',
    constructKey: 'productivity-verification',
    block: 'usage',
    objectiveRefs: ['2.2', '2.3'],
    stem:
      'A project manager reviews data showing that AI tools reduce task completion time by over 50% for first-draft writing, research summarization, and data analysis in her team. She concludes: "These are our three biggest efficiency wins, so we should push for maximum AI adoption in all three." What critical factor is missing from her analysis?',
    scenarioSummary:
      'A project manager sees 50%+ time savings on writing, research, and analysis and wants to push AI adoption everywhere.',
    options: [
      {
        id: 'A',
        text:
          'She hasn\'t accounted for the licensing and infrastructure costs of AI tools across these three task categories, which may partially or fully offset the productivity gains her team is experiencing in practice.',
        isCorrect: false,
        feedbackText:
          'Licensing cost is a real consideration but not the critical missing factor. The analysis already demonstrates value through time savings. The gap is whether that saved time is being offset by unexamined risk in the outputs.',
      },
      {
        id: 'B',
        text:
          'She hasn\'t asked whether her team wants to use AI tools for these tasks. Adoption initiatives fail without employee enthusiasm, and mandating AI use in high-skill work often generates resistance.',
        isCorrect: false,
        feedbackText:
          'Employee satisfaction matters for adoption, but it\'s not the analytical gap here. The issue is that the data she has (time savings) is being treated as sufficient for a delegation decision when it\'s only half the picture.',
      },
      {
        id: 'C',
        text:
          'She hasn\'t considered that AI tools use very different underlying technologies for each of these three task types, and that the time savings figures aren\'t directly comparable across writing, summarization, and analysis.',
        isCorrect: false,
        feedbackText:
          'From the user\'s perspective, the underlying AI architecture is less relevant than the output characteristics. The critical question is about the outputs (whether they can be trusted without verification), not about the underlying technology.',
      },
      {
        id: 'D',
        text:
          'She hasn\'t considered that tasks with the highest time savings can also carry the highest risk of unverified output, and that the verification burden required to ensure quality differs significantly across task types.',
        isCorrect: true,
        feedbackText:
          'High productivity gain and high verification burden can coexist in the same task category. Research summarization may save significant time, but a summary that omits key findings or introduces fabricated claims creates downstream risk that erases the efficiency gain. The critical analysis step is asking two questions: how much time AI saves, and how much effort it takes to verify the output is safe to use. Those two numbers don\'t move together.',
      },
    ],
  },
  {
    id: 'PRE-3',
    construct: 'Fluent fabrication',
    constructKey: 'fluent-fabrication',
    block: 'failure',
    objectiveRefs: ['3.2', '4.3'],
    stem:
      'A colleague uses an AI tool to research competitors and shares a summary that includes this line: "According to McKinsey\'s 2024 Global AI Adoption Survey (p. 14), 72% of mid-market firms have deployed at least one generative AI application in customer-facing roles." The citation looks specific and credible. What is the most important thing to understand about this kind of AI-generated output?',
    scenarioSummary:
      'A colleague\'s AI-generated summary cites "McKinsey\'s 2024 Global AI Adoption Survey, p. 14" with a specific percentage and credible formatting.',
    options: [
      {
        id: 'A',
        text:
          'The citation may be entirely fabricated. Unless the AI tool actively searched for and retrieved the source document, it generated the citation by predicting what plausible academic language should come next. That process can produce confident, invented references that look authoritative.',
        isCorrect: true,
        feedbackText:
          'Some AI tools can now search the web or retrieve documents to ground their responses in real sources. But when an AI generates a citation without performing a retrieval step, it\'s producing text that looks like a well-formed reference (author, year, page number, statistic) because that\'s what citations look like in its training data. The result can be entirely fabricated while appearing authoritative. Knowing whether the tool searched for the source, or simply generated what a source should look like, is the critical distinction.',
      },
      {
        id: 'B',
        text:
          'The citation is almost certainly accurate, since AI tools are trained on massive datasets that include published research reports, and when they produce specific page numbers and percentage figures, it reflects information the model encoded during training.',
        isCorrect: false,
        feedbackText:
          'The specificity of a citation (page numbers, percentages, publication details) does not indicate the AI encoded it accurately during training. When generating text, AI models predict what plausible-sounding output should come next based on statistical patterns. Specificity is a feature of fluent language generation, not evidence of factual accuracy.',
      },
      {
        id: 'C',
        text:
          'The citation is likely a paraphrase rather than an exact quote. AI tools synthesize information from multiple sources into composite statements, so the page number may be approximate but the underlying finding is generally reliable.',
        isCorrect: false,
        feedbackText:
          'The issue is not paraphrasing or compression. The citation, the page number, the statistic, and even the report title may not correspond to any real publication. Treating the "underlying finding" as reliable when the source itself may not exist creates a false sense of verification.',
      },
      {
        id: 'D',
        text:
          'The citation would only be unreliable if the AI tool explicitly flagged uncertainty in its response. When a model produces output without hedging language or built-in disclaimers, it indicates high internal confidence in the accuracy of the information.',
        isCorrect: false,
        feedbackText:
          'AI models do not have a reliable internal mechanism that maps hedging language to factual uncertainty. A model can state a complete fabrication with full confidence and qualify an accurate fact with cautious language. The presence or absence of hedging does not indicate whether the content is real.',
      },
    ],
  },
  {
    id: 'PRE-4',
    construct: 'Boundary task failure',
    constructKey: 'boundary-task',
    block: 'failure',
    objectiveRefs: ['3.3'],
    stem:
      'A data analyst asks an AI chatbot to "count the number of times the word \'revenue\' appears in this quarterly report" by pasting a 2,000-word document into the conversation. The AI responds: "The word \'revenue\' appears 23 times in the document." The analyst spot-checks and finds the actual count is 17. What is the most likely explanation for this error?',
    scenarioSummary:
      'An analyst asks an AI chatbot to count word occurrences in a 2,000-word document and the count comes back wrong.',
    options: [
      {
        id: 'A',
        text:
          'The AI chatbot probably encountered a formatting issue with the pasted text: special characters, line breaks, or encoding artifacts in the document caused the text processing to malfunction and inflate the reported word count.',
        isCorrect: false,
        feedbackText:
          'Formatting issues can cause problems in traditional text processing tools, but the error here is more fundamental. The AI isn\'t running a text search algorithm that could be disrupted by encoding. It\'s generating a response about what a count should probably be given the context it sees.',
      },
      {
        id: 'B',
        text:
          'The AI chatbot likely counted partial matches and morphological variations: it included instances like "revenues," "non-revenue," and related compound terms in its total because it interprets word-matching requests broadly to provide comprehensive results.',
        isCorrect: false,
        feedbackText:
          'The AI\'s error isn\'t about overly broad matching criteria. The model isn\'t running a search at all in a standard chat interaction; it\'s generating a number that fits the context. The 23 isn\'t a misconfigured search result. It\'s what happens when no search runs.',
      },
      {
        id: 'C',
        text:
          'The AI chatbot generated a plausible-sounding number rather than performing an actual count. Its architecture processes text in chunks that don\'t map cleanly to individual words, making precise enumeration tasks systematically unreliable when handled through conversation alone.',
        isCorrect: true,
        feedbackText:
          'When a user pastes text into a chatbot and asks it to count, the model doesn\'t execute a counting operation; it predicts a plausible answer. Its architecture processes text in tokens (chunks that don\'t align to individual words), which makes exact enumeration unreliable. Some AI tools can perform precise counts, but only when they have access to a code execution environment that runs an actual counting script. The distinction matters: the same task routed through conversation produces an approximation; routed through a code tool, it produces an exact answer. Knowing which pathway your tool uses determines whether you can trust the result.',
      },
      {
        id: 'D',
        text:
          'The AI chatbot made a random processing error. Like any software, AI tools occasionally produce incorrect outputs due to computational glitches, and running the identical query again would most likely return the correct count.',
        isCorrect: false,
        feedbackText:
          'This is not a random glitch. Running the same query again might produce a different number, but not because the first error was random. The model generates a new prediction each time, and the underlying limitation (inability to perform exact enumeration without a code tool) is consistent. The error is systematic, not stochastic.',
      },
    ],
  },
  {
    id: 'PRE-5',
    construct: 'Context window limits',
    constructKey: 'context-window',
    block: 'failure',
    objectiveRefs: ['3.3'],
    stem:
      'A legal analyst pastes a 40-page contract into an AI tool with the instruction: "Review this contract and list every clause that limits the vendor\'s liability." The AI produces a well-organized list of eight liability clauses. The analyst later discovers that three additional liability clauses appearing in the final ten pages of the contract were omitted entirely. What is the most likely explanation?',
    scenarioSummary:
      'A legal analyst pastes a 40-page contract and asks for every liability clause; the AI returns 8, missing 3 in the final pages.',
    options: [
      {
        id: 'A',
        text:
          'The AI tool applied editorial judgment: it identified that eight clauses represented the most significant liability limitations in the contract and excluded the remaining three because they were narrower in scope or appeared as sub-clauses within broader provisions.',
        isCorrect: false,
        feedbackText:
          'AI models don\'t apply legal materiality judgments to decide what to include or exclude. The model has no basis for assessing the relative significance of individual clauses. It generates output based on pattern matching against the input text, not domain-specific prioritization. Framing the omission as intentional editorial judgment masks a genuine capability limitation.',
      },
      {
        id: 'B',
        text:
          'The AI tool has a limited working memory for processing input. As the document length increases, the model\'s ability to attend to content in all parts of the text degrades, making it more likely to miss information that appears far from the instruction or from earlier relevant content.',
        isCorrect: true,
        feedbackText:
          'AI models have a finite context window: a limit on how much text they can process at once. Even when the entire document fits within that window, the model\'s ability to attend to all parts of the input is not uniform. Content that appears far from the instruction, or far from other relevant content, receives less attention during generation. For long documents, this means the model may miss relevant information, especially toward the end of the input. This failure mode is systematic: longer documents and more dispersed target information increase the probability of omission.',
      },
      {
        id: 'C',
        text:
          'The AI tool prioritized the most legally significant liability clauses and intentionally excluded the three minor ones. It applied legal judgment to determine which clauses warranted inclusion in the summary.',
        isCorrect: false,
        feedbackText:
          'AI models do not apply domain-specific professional judgment to decide what to include or exclude. The model has no basis for assessing the legal significance of individual clauses relative to each other; it generates output based on pattern matching, not legal analysis. Framing the omission as intentional prioritization masks a genuine capability limitation.',
      },
      {
        id: 'D',
        text:
          'The AI tool hit a hard input limit and silently dropped the final portion of the document before processing it. The last ten pages were never received by the model, which is why those clauses don\'t appear in the output. This is a common failure with long documents that exceed the tool\'s maximum capacity.',
        isCorrect: false,
        feedbackText:
          'Silent truncation can occur with very long inputs, and some older tools do fail this way. But modern AI tools typically indicate when input exceeds their limit, and a 40-page contract is within the capacity of most current models. The more common and harder-to-detect failure is attention degradation: the full text is received, but the model doesn\'t process all parts with equal fidelity. Silent truncation is the obvious failure mode to guard against; attention degradation is the subtle one that catches experienced users off guard.',
      },
    ],
  },
  {
    id: 'PRE-6',
    construct: 'Prediction vs. retrieval',
    constructKey: 'prediction-retrieval',
    block: 'mechanics',
    objectiveRefs: ['3.2'],
    stem:
      'A product manager asks an AI tool to summarize the return policy for a SaaS product she\'s evaluating. The AI produces a detailed, professional summary that includes a "30-day full refund window" and a "pro-rated annual plan cancellation" clause. She checks the vendor\'s actual terms page and finds the policy is 14 days with no pro-rating. The AI\'s summary read like it came directly from the vendor\'s documentation. Why did this happen?',
    scenarioSummary:
      'A product manager asks an AI to summarize a SaaS return policy; the detailed-sounding output doesn\'t match the vendor\'s actual terms.',
    options: [
      {
        id: 'A',
        text:
          'The AI tool generated text that matches the statistical patterns of what SaaS return policies typically look like. It wasn\'t retrieving or summarizing an actual document; it was producing output that is linguistically consistent with how these policies are usually written.',
        isCorrect: true,
        feedbackText:
          'AI models generate output through next-token prediction. At each step, the model produces the token that is most probable given everything that came before. When asked about a SaaS return policy, the model generates text that sounds like a SaaS return policy because it has learned the statistical patterns of that document type. The output is not retrieved from a stored document, not synthesized from identified sources, and not reasoned from understood terms. It is generated language that is fluent, specific, and potentially unrelated to any real policy.',
      },
      {
        id: 'B',
        text:
          'The AI tool accessed an outdated cached version of the vendor\'s website. The return policy was likely 30 days at some point in the past, and the model retrieved the older version because its training data hadn\'t been refreshed to include the most recent policy change.',
        isCorrect: false,
        feedbackText:
          'Even when outdated training data is a factor, this explanation mischaracterizes how the model operates. The model doesn\'t "retrieve" documents from its training data the way a search engine pulls cached pages. It generates text based on statistical patterns learned during training. The output may resemble real policies without corresponding to any specific one.',
      },
      {
        id: 'C',
        text:
          'The AI tool blended information from multiple SaaS vendors\' return policies into a composite. It recognized the general category of "SaaS return policy" and synthesized a representative answer from patterns across similar companies in its training data.',
        isCorrect: false,
        feedbackText:
          'This is closer to the mechanism but still implies a deliberate synthesis process. The model isn\'t identifying multiple vendor policies and merging them. It\'s generating the next most probable token given the context "SaaS return policy summary." The result happens to resemble a composite because SaaS return policies share common language patterns in the training data.',
      },
      {
        id: 'D',
        text:
          'The AI tool made an inference error: it correctly identified that the vendor has a return policy but applied faulty reasoning when extracting the specific terms, similar to how a person might misremember details from a document they read quickly.',
        isCorrect: false,
        feedbackText:
          'The model doesn\'t "read" the vendor\'s policy and then misremember it. That description implies a retrieval-then-recall process, which doesn\'t match how generation works. The human analogy of misremembering a document is intuitive but misleading: the model never had access to the specific document in the first place during this interaction. It produced plausible-sounding terms, not inaccurate memories.',
      },
    ],
  },
  {
    id: 'PRE-7',
    construct: 'Tokenization',
    constructKey: 'tokenization',
    block: 'mechanics',
    objectiveRefs: ['3.1'],
    stem:
      'A software developer asks an AI chatbot to reverse the word "strawberry" and receives the response "yrrebwarts," which is correct. She then asks it to count the number of R\'s in "strawberry" and it responds "2." The actual count is 3. The reversal task succeeded but the counting task failed, even though both involve the same word. What best explains this inconsistency?',
    scenarioSummary:
      'An AI reverses "strawberry" correctly but miscounts the R\'s. Same word, two different outcomes.',
    options: [
      {
        id: 'A',
        text:
          'The reversal task is a more common request in AI training data, so the model had more examples to learn from. The counting task failed because the model encountered fewer examples of letter-counting during training and hasn\'t learned to perform it reliably.',
        isCorrect: false,
        feedbackText:
          'Training frequency doesn\'t explain why one task succeeds and another fails on the same input. If the issue were simply insufficient training examples, the model would show general weakness on counting tasks; it wouldn\'t produce the exact wrong count of 2 with confidence. The inconsistency points to a structural limitation, not a training gap.',
      },
      {
        id: 'B',
        text:
          'The model applied two different internal algorithms: string reversal uses a character-level operation while letter counting uses a statistical estimation method, and the estimation method is inherently less accurate for letters that appear multiple times.',
        isCorrect: false,
        feedbackText:
          'The model doesn\'t have separate algorithms for different string operations. Both tasks run through the same generation mechanism: next-token prediction. The difference in outcomes reflects how the underlying tokenization interacts with each task\'s requirements, not a choice between two internal methods.',
      },
      {
        id: 'C',
        text:
          'The counting error is a simple arithmetic mistake that occurs randomly. The model correctly identified all three R\'s but made a calculation error when summing them, similar to how a person might miscount when working quickly through a routine task.',
        isCorrect: false,
        feedbackText:
          'This isn\'t an arithmetic error. The model doesn\'t first identify all three R\'s and then miscount them. It never identifies individual letters at all. It generates a plausible answer based on token-level patterns, and those patterns don\'t reliably encode character-level frequency information.',
      },
      {
        id: 'D',
        text:
          'The model processes text as chunks called tokens rather than as individual characters. Some tasks can be solved through pattern recognition at the token level, but tasks requiring precise character-by-character analysis depend on how the word was split into tokens, which the model doesn\'t control or see.',
        isCorrect: true,
        feedbackText:
          'AI models convert text into tokens (sub-word chunks) before processing it. "Strawberry" might be split into tokens like "straw" + "berry" or "str" + "aw" + "berry," depending on the tokenizer. The model never "sees" individual letters the way a human reader does. Some tasks (like reversal) can be solved through learned patterns at the token level, but precise character-level operations (counting specific letters, identifying character positions) require the model to reason about units smaller than its tokens. When the tokenization splits an R across a token boundary, the model may not register it. This is a systematic limitation, not a random error: it affects any task that requires character-level precision. Some AI tools can route character-level tasks to a built-in program that processes letters directly. When that happens, the task succeeds reliably. The failure described here occurs when the AI handles the task conversationally, generating an answer rather than running an operation.',
      },
    ],
  },
  {
    id: 'PRE-8',
    construct: 'Capability diagnosis',
    constructKey: 'capability-diagnosis',
    block: 'mechanics',
    objectiveRefs: ['3.4'],
    stem:
      'A consultant uses a general-purpose AI chatbot for three tasks in one afternoon. In Task A, the tool produces a policy brief that includes a fabricated regulatory citation. In Task B, the tool miscalculates the percentage change between two quarterly revenue figures. In Task C, the tool summarizes a 50-page strategy document but omits key recommendations from the final section. A colleague says: "AI just makes random mistakes sometimes. You can\'t predict when it\'ll fail." Based on what is known about how these models work, which response is most accurate?',
    scenarioSummary:
      'A consultant sees three different AI failures in one afternoon: fabricated citation, math error, omitted document section. Is this random?',
    options: [
      {
        id: 'A',
        text:
          'The colleague is largely correct: AI failures are stochastic in nature, and while the overall error rate can be estimated statistically, there is no reliable way to predict which specific tasks will produce errors before running them through the model.',
        isCorrect: false,
        feedbackText:
          'These failures are not random. Task A (fabricated citation) failed because the model generates plausible text through prediction rather than retrieving verified sources. Any task requiring factual specificity the model wasn\'t trained on is vulnerable. Task B (percentage miscalculation) failed because the model\'s token-based architecture doesn\'t support precise arithmetic; numerical reasoning tasks are systematically unreliable. Task C (omitted content from a long document) failed because the model\'s attention degrades across long inputs; information-extraction tasks on lengthy documents are systematically prone to omission. Each failure traces to a known property of the architecture, not to chance.',
      },
      {
        id: 'B',
        text:
          'The colleague is partially right: AI models are more likely to fail on complex tasks than simple ones, so difficulty level is the best predictor of failure, and all three of these tasks fall into the "complex" category where errors should be expected.',
        isCorrect: false,
        feedbackText:
          'Complexity is a poor predictor of AI failure. A model can flawlessly produce a sophisticated 2,000-word analysis while failing to count the letters in a five-letter word. The relevant variable is whether the task\'s requirements conflict with a specific mechanical property of how the model processes information (token-level representation, probabilistic generation, finite context window). Difficulty itself isn\'t the predictor.',
      },
      {
        id: 'C',
        text:
          'The colleague is wrong. Each of these failures traces to a specific mechanical property of how the model processes information, and understanding those properties lets you predict which categories of tasks are systematically unreliable before you run them.',
        isCorrect: true,
        feedbackText:
          'The three failures map to three distinct mechanical properties: Task A reflects probabilistic generation (producing plausible text rather than verified facts), Task B reflects token-based representation (inability to perform precise numerical operations), and Task C reflects context window limitations (degraded attention across long inputs). These failures are predictable categories of unreliability, not random events. A professional who understands these properties can assess, before running a task, whether it falls into a category where the model is likely to fail and plan verification accordingly.',
      },
      {
        id: 'D',
        text:
          'The colleague is mostly wrong. These failures can be prevented by writing better prompts, since AI errors are primarily caused by ambiguous or underspecified instructions rather than by inherent limitations in how the model processes different types of tasks.',
        isCorrect: false,
        feedbackText:
          'Better prompts can improve output quality in many cases, but they cannot overcome architectural limitations. No prompt will make a model reliably count characters, perform exact arithmetic through conversation, or maintain uniform attention across a 50-page document. Attributing all failures to prompt quality understates the model\'s inherent capability boundaries and leads to false confidence when a well-written prompt happens to produce fluent output.',
      },
    ],
  },
  {
    id: 'PRE-9',
    construct: 'Output verification priority',
    constructKey: 'verification-priority',
    block: 'evaluation',
    objectiveRefs: ['4.3'],
    stem: `An HR specialist uses an AI tool to draft a summary of recent changes to Singapore's Employment Act for an internal policy update. The draft includes the following four claims. Which one most urgently requires independent verification before the summary is shared with the leadership team?

1. "The Employment Act applies to all employees under a contract of service, with specific provisions varying by salary threshold."
2. "Recent amendments expanded coverage of core employment protections to all employees regardless of salary level."
3. "The Ministry of Manpower has published updated guidelines reflecting these changes on its official website."
4. "Employers are required to provide itemized payslips and maintain detailed employment records under the Act."`,
    scenarioSummary:
      'An HR specialist\'s AI-drafted summary includes four claims about Singapore employment law; one needs verification most urgently.',
    options: [
      {
        id: 'A',
        text:
          'Claim 1, because it describes the general scope of the Act, and getting the foundational framing wrong would undermine every downstream recommendation in the policy update.',
        isCorrect: false,
        feedbackText:
          'The general scope description (Claim 1) is worth verifying, but it uses broad, hedged language ("specific provisions varying by salary threshold") that is less likely to be precisely wrong in a consequential way. General framing errors are lower-stakes than specific legislative claims because they\'re less likely to drive concrete policy decisions.',
      },
      {
        id: 'B',
        text:
          'Claim 2, because it describes a specific legislative change with concrete policy implications, and if the amendment\'s scope or timing is fabricated or inaccurate, the resulting internal policy could expose the organization to compliance risk.',
        isCorrect: true,
        feedbackText:
          'Claim 2 makes a specific assertion about legislative change: that coverage was expanded to all employees regardless of salary. If this is fabricated or inaccurately scoped (wrong amendment, wrong scope, wrong timing), the internal policy update could direct the organization to apply protections it isn\'t required to apply, or worse, fail to apply protections it is required to apply. The verification priority hierarchy puts claims with direct compliance or legal consequences above general framing, operational details, and resource references.',
      },
      {
        id: 'C',
        text:
          'Claim 3, because it refers to a specific, verifiable external resource that either exists or doesn\'t, and directing leadership to a non-existent government publication would damage the HR team\'s credibility.',
        isCorrect: false,
        feedbackText:
          'Verifying that an external resource exists (Claim 3) is good practice, but a broken link or missing webpage is a credibility issue, not a compliance risk. The leadership team can check the MOM website themselves. The higher-priority verification target is the claim that would cause the organization to act on incorrect legal obligations.',
      },
      {
        id: 'D',
        text:
          'Claim 4, because payslip and record-keeping requirements are operational details that directly affect HR workflows, and an error here would cause immediate procedural disruption across the organization.',
        isCorrect: false,
        feedbackText:
          'Payslip and record-keeping requirements (Claim 4) are operationally important but are established, well-documented provisions. They\'re less likely to be fabricated by an AI model than a claim about recent amendments, which involves specific temporal and legislative details that are harder for the model to generate accurately.',
      },
    ],
  },
  {
    id: 'PRE-10',
    construct: 'Structured prompting',
    constructKey: 'structured-prompting',
    block: 'evaluation',
    objectiveRefs: ['4.2'],
    stem:
      'A financial analyst asks an AI tool: "Write me something about our Q3 performance." The output is a generic, surface-level paragraph that could describe almost any company\'s quarterly results. The analyst is frustrated and says: "This tool just isn\'t good enough for real financial work." Before concluding the tool is inadequate, which of the following adjustments would most likely produce a substantially better result?',
    scenarioSummary:
      'A financial analyst\'s vague AI prompt ("write something about Q3") produces generic output. The fix isn\'t a better tool.',
    options: [
      {
        id: 'A',
        text:
          'Running the same prompt multiple times and selecting the best output from the batch. AI tools produce variable results with each generation, and sampling several responses increases the probability of getting one that matches the analyst\'s expectations.',
        isCorrect: false,
        feedbackText:
          'Generating multiple outputs from the same underspecified prompt gives you variation, not improvement. Each response will be a different generic paragraph because the underlying instruction hasn\'t changed. Sampling addresses randomness, not relevance. The constraint is the prompt, not the generation roll.',
      },
      {
        id: 'B',
        text:
          'Switching to a more advanced AI model with a larger parameter count. The quality limitation is in the model\'s capability tier, and a more powerful model would infer the analyst\'s intent and produce specific, relevant financial analysis without additional guidance.',
        isCorrect: false,
        feedbackText:
          'A more capable model can produce more sophisticated output, but it still generates based on what the prompt tells it. "Write me something about Q3 performance" gives any model, regardless of size, the same thin instruction to work with. The model isn\'t failing to understand the request; it\'s fulfilling exactly what was asked, which wasn\'t much.',
      },
      {
        id: 'C',
        text:
          'Adding a system instruction that tells the AI to "try harder" or "be more detailed and accurate." AI models respond to motivational framing, and explicitly requesting higher quality activates a more rigorous internal processing mode.',
        isCorrect: false,
        feedbackText:
          'AI models do not have motivational states. Phrases like "try harder" or "be your best" don\'t activate a different processing mode. The model responds to structural specification (what to include, what format to use, what audience to write for), not to encouragement. Prompt quality is about information, not tone.',
      },
      {
        id: 'D',
        text:
          'Restructuring the request to include the specific metrics to analyze, the comparison period, the target audience, the desired format, and any constraints, because the model generates output based on what the prompt specifies, and an underspecified prompt produces output that defaults to generic patterns.',
        isCorrect: true,
        feedbackText:
          'The original prompt specifies almost nothing: no metrics, no comparison period, no audience, no format, no constraints. The model defaults to generic patterns because the prompt doesn\'t narrow the output space. Compare that to a restructured request like "Compare Q3 2025 revenue, gross margin, and customer acquisition cost against Q2 2025 for a board presentation; flag any variance over 5%." That gives the model the specificity it needs to generate targeted, useful output. The gap is almost always in the instruction, not in the tool.',
      },
    ],
  },
];
