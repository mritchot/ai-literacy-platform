// Post-Assessment instrument — 12 scenario-based items administered
// AFTER Module 4 completion. The options use course vocabulary
// (tokenization, next-token prediction, context window,
// augmentation/automation spectrum, Description competency, 4D
// framework); the stems never name the concept an item tests, so the
// learner has to recognize which idea applies, as on the pre form.
// Items are PARALLEL to the pre-assessment items by construct
// (different scenarios, same construct). The `parallelPreId` field joins each post item to its
// pre-assessment counterpart for the comparative results view in
// `components/assessment/AssessmentResults.tsx`.
//
// Source: the post-assessment instrument document (Phase 4 planning corpus).
// POST-11 and POST-12 pair with PRE-11 and PRE-12 (task decomposition,
// disclosure); see `instrument-version.ts`.
// Answer key distribution: A=3, B=3, C=3, D=3.

import type { AssessmentItem } from './pre-assessment';

export interface PostAssessmentItem extends AssessmentItem {
  /** Id of the parallel pre-assessment item that tests the same
   *  construct (e.g. POST-1 ↔ PRE-1). Used to align responses in the
   *  pre→post comparative view. */
  parallelPreId: string;
}

export const POST_ASSESSMENT_ITEMS: PostAssessmentItem[] = [
  {
    id: 'POST-1',
    parallelPreId: 'PRE-1',
    construct: 'Augmentation vs. automation',
    constructKey: 'augmentation-automation',
    block: 'usage',
    objectiveRefs: ['2.1', '2.4'],
    stem:
      'After completing the program, a participant reviews her team\'s AI usage logs and notices that 80% of their AI interactions are single-turn exchanges (one prompt, one response, no follow-up). In a team meeting, her manager describes their AI strategy as "deeply collaborative. We use it as a thinking partner." Which assessment is most accurate?',
    scenarioSummary:
      'A team\'s logs show 80% single-turn AI usage while the manager describes the team\'s strategy as deeply collaborative.',
    options: [
      {
        id: 'A',
        text:
          'The manager\'s characterization is accurate, since single-turn interactions can still be collaborative if the user carefully reviews the output before using it, and the number of turns is not a meaningful indicator of whether usage is augmentative or automated.',
        isCorrect: false,
        feedbackText:
          'The number of interaction turns is not a perfect proxy, but 80% single-turn usage is a strong behavioral signal. Single-turn interactions (one prompt, one response, no follow-up) are the closest observable proxy for directive, automation-oriented usage, which the research defines as a task completed with minimal back-and-forth. If the team were genuinely collaborating with the tool, the logs would show iterative exchanges where users refine, redirect, and build on outputs. The manager\'s characterization doesn\'t match the behavioral evidence.',
      },
      {
        id: 'B',
        text:
          'The high proportion of single-turn exchanges indicates the team is using AI efficiently. Iterative multi-turn interactions are a sign of poorly written prompts, not of deeper collaboration, and the manager should view this pattern as a positive indicator.',
        isCorrect: false,
        feedbackText:
          'Efficiency and collaboration are not opposites, but describing single-turn usage as "efficient prompting" rather than "automation-style usage" repeats exactly the self-report/behavioral gap the program identified. Multi-turn interaction is a sign that a human is applying judgment, refining output, and maintaining quality control, not a sign of poor prompting. The distinction matters for output quality.',
      },
      {
        id: 'C',
        text:
          'The interaction logs suggest the team\'s actual usage is predominantly directive and automation-oriented, even though the manager frames it as collaboration. This gap between self-reported and observed interaction patterns is documented in research on AI adoption.',
        isCorrect: true,
        feedbackText:
          'The behavioral research on AI adoption finds a gap between how professionals describe their AI usage (collaborative and iterative) and what their interaction patterns show (more directive than reported). The gap is not universal: when Anthropic compared its own engineers\' self-reported task mix with usage logs, the two distributions roughly aligned. The documented gap concerns collaboration style, not which tasks people bring to AI. The manager\'s framing reflects a common self-report bias, not intentional misrepresentation. The disconnect between perceived and actual interaction style is real. Recognizing this gap is the first step toward deliberately choosing augmentative practices when the task warrants them.',
      },
      {
        id: 'D',
        text:
          'The interaction logs are unreliable for assessing usage quality because they only capture turn count, not the cognitive effort the user applied before and after the interaction. A single well-crafted prompt can reflect more thoughtful AI use than ten iterative exchanges.',
        isCorrect: false,
        feedbackText:
          'While cognitive effort before and after an interaction is real and hard to measure from logs alone, dismissing the logs entirely overlooks a meaningful pattern. 80% single-turn usage across a team is not an artifact of measurement; it\'s a consistent behavioral signature. The claim that a single prompt can reflect deep thought is true in individual cases, but at scale, a team averaging 80% single-turn interactions is unlikely to be applying sustained human judgment to most AI outputs.',
      },
    ],
  },
  {
    id: 'POST-2',
    parallelPreId: 'PRE-2',
    construct: 'Productivity gain vs. verification burden',
    constructKey: 'productivity-verification',
    block: 'usage',
    objectiveRefs: ['2.2', '2.3'],
    stem:
      'A department head reviews data showing her team\'s AI-assisted tasks and notices that customer-facing proposal drafting saves the most time per task (over 60% reduction). She plans to mandate AI use for all client proposals starting next quarter. What is the most critical gap in her decision?',
    scenarioSummary:
      'A department head plans to mandate AI for all client proposals based on 60%+ time savings, without examining verification burden.',
    options: [
      {
        id: 'A',
        text:
          'She hasn\'t assessed whether the verification burden for client proposals is proportionate to the time saved. Customer-facing documents carry reputational and contractual risk, and a fabricated claim or inaccurate figure in a proposal could cost more than the time the AI saved.',
        isCorrect: true,
        feedbackText:
          'The productivity-risk framework from the program establishes that time savings and verification burden are independent variables that must be assessed together. Customer-facing proposals carry high stakes. A fabricated statistic, an inaccurate compliance claim, or a misrepresented capability could damage client relationships, trigger contractual liability, or erode the organization\'s reputation. The 60% time savings is the benefit side of the equation. The risk side (how much effort is needed to verify that the proposal is accurate, complete, and safe to send) is entirely unexamined.',
      },
      {
        id: 'B',
        text:
          'She hasn\'t checked whether proposal drafting is augmentation or automation. If her team refines each draft with the tool over several turns, that back-and-forth already reviews the content, so the proposals need no separate verification step.',
        isCorrect: false,
        feedbackText:
          'Iterating with the tool and verifying its output are different activities. Refining a draft over several turns improves tone and structure, but a proposal refined over ten turns can still carry a fabricated statistic or an inaccurate compliance claim, and the client still receives it. Only a check against sources catches those errors. The critical gap is the missing verification assessment for a customer-facing document.',
      },
      {
        id: 'C',
        text:
          'She hasn\'t consulted her team about their comfort level with AI-assisted proposal writing. Mandating AI use without employee input creates resistance, and adoption studies show that voluntary usage produces higher-quality outputs than required usage.',
        isCorrect: false,
        feedbackText:
          'Employee comfort and adoption willingness are real factors in change management, but they\'re not the critical analytical gap. Even if the team enthusiastically adopts AI for proposals, the verification burden for customer-facing documents remains. The risk is in the outputs, not in the adoption strategy.',
      },
      {
        id: 'D',
        text:
          'She hasn\'t considered whether the AI tool she\'s using is specifically designed for proposal writing. General-purpose AI tools produce lower-quality outputs for specialized document types, and a domain-specific tool would eliminate most of the quality risks associated with mandated use.',
        isCorrect: false,
        feedbackText:
          'Domain-specific tools may produce higher baseline quality, but they don\'t eliminate the verification burden for high-stakes documents. A tool optimized for proposal writing can still fabricate statistics, misrepresent capabilities, or introduce inaccuracies that require human review. The critical gap is the absence of a verification assessment, not the absence of a specialized tool.',
      },
    ],
  },
  {
    id: 'POST-3',
    parallelPreId: 'PRE-3',
    construct: 'Fluent fabrication',
    constructKey: 'fluent-fabrication',
    block: 'failure',
    objectiveRefs: ['3.2', '4.3'],
    stem:
      'A product manager uses an AI tool to generate a competitive landscape analysis. The report states: "Gartner\'s 2025 Magic Quadrant for Enterprise Collaboration platforms placed Vendor X in the Leaders quadrant for the third consecutive year, citing its API extensibility and compliance automation as key differentiators." The statement is fluent, specific, and formatted exactly like a real analyst citation. What is the strongest reason to verify this claim before including it in a board presentation?',
    scenarioSummary:
      'An AI-generated competitive analysis cites a specific Gartner Magic Quadrant placement with named differentiators: fluent, specific, and unverified.',
    options: [
      {
        id: 'A',
        text:
          'Gartner reports are behind a paywall, so the AI tool\'s training data may have included an incomplete or pirated version of the report. The specific ranking could be correct but the cited differentiators may reflect a different vendor\'s evaluation.',
        isCorrect: false,
        feedbackText:
          'This explanation assumes the model is retrieving a real report, albeit an incomplete version. The more fundamental issue is that the model may not be retrieving anything at all. It generates text that looks like an analyst citation because that\'s what analyst citations look like in its training data. The paywall issue is secondary to the generation-vs.-retrieval distinction.',
      },
      {
        id: 'B',
        text:
          'The model generates text by predicting what a plausible analyst citation looks like. Unless it retrieved and read the Gartner report, the quadrant placement, the consecutive-year claim, and the differentiators may each be fabricated.',
        isCorrect: true,
        feedbackText:
          'The model\'s next-token prediction mechanism generates what a plausible analyst citation should contain, based on statistical patterns. Each element (the quadrant placement, the "third consecutive year" claim, the specific differentiators) is independently generated to fit the expected format of a Gartner citation. Unless the tool performed an active retrieval step (searching for and reading the actual report during this interaction), every detail may be fabricated while appearing authoritative. The specificity and formatting are features of fluent generation, not evidence of accuracy.',
      },
      {
        id: 'C',
        text:
          'The tool\'s temperature setting let it sample a less probable continuation, so the quadrant placement drifted from the real one. Lowering the temperature and regenerating the analysis would return the accurate Gartner placement and differentiators.',
        isCorrect: false,
        feedbackText:
          'Temperature changes how much the output varies from run to run, not whether it is grounded in a source. At any setting, the model generates citation-shaped text from patterns unless it retrieved the report during this interaction. A lower temperature would produce the same kind of claim more consistently, which is not the same as producing a verified one. The only fix is to check the placement against the report itself.',
      },
      {
        id: 'D',
        text:
          'Gartner frequently updates its Magic Quadrant reports mid-cycle, so the model may be citing an accurate but outdated placement. The vendor\'s current quadrant position could have shifted since the model\'s training data was collected.',
        isCorrect: false,
        feedbackText:
          'Training data currency is a real limitation, but it\'s the wrong diagnosis here. The concern is that the placement itself may be fabricated, not that the model is citing an outdated-but-real version. Focusing on data freshness assumes the citation is grounded in a real source, which is precisely the assumption that needs to be verified.',
      },
    ],
  },
  {
    id: 'POST-4',
    parallelPreId: 'PRE-4',
    construct: 'Boundary task failure',
    constructKey: 'boundary-task',
    block: 'failure',
    objectiveRefs: ['3.3'],
    stem:
      'An operations analyst pastes a list of 140 purchase-order numbers (formatted like "PO-2025-04417") into an AI chatbot and asks: "How many of these appear more than once?" The chatbot answers that 6 order numbers are duplicated. A spreadsheet check shows 11. When the analyst asks the chatbot to check again, it answers 8. What best explains these results?',
    scenarioSummary:
      'An analyst asks an AI chatbot to count duplicates in 140 pasted purchase-order numbers; it answers 6, then 8, against a true count of 11.',
    options: [
      {
        id: 'A',
        text:
          'The chatbot used a fuzzy-matching method that groups near-identical order numbers together. Numbers that differ by a single digit were grouped on one pass and separated on the other, which is why its two counts disagree with each other.',
        isCorrect: false,
        feedbackText:
          'A chatbot answering in conversation isn\'t running a matching method, fuzzy or exact. It reads the order numbers as token chunks and generates a count that fits the context. The two answers are two predictions, not two runs of a configurable algorithm, which is why neither matches the spreadsheet.',
      },
      {
        id: 'B',
        text:
          'The list was too long for the chatbot to hold at once. Its context window filled partway through the 140 numbers, so it counted duplicates only in the part of the list it could still see, and a different part each time it was asked.',
        isCorrect: false,
        feedbackText:
          'A list of 140 order numbers runs to roughly a thousand tokens, a small fraction of any current context window, so the whole list was in view. Context window limits explain omissions in long documents. This failure comes from the task: exact matching and counting across a list is an operation, and in conversation the model generates an answer instead of performing one.',
      },
      {
        id: 'C',
        text:
          'The chatbot made random processing errors. Like any software under load, it occasionally miscounts, and asking it to check again until two of its answers agree would eventually produce the correct count of duplicates.',
        isCorrect: false,
        feedbackText:
          'The errors aren\'t glitches that repetition will average out. Each answer is a fresh prediction of a plausible count, and two predictions can agree and still be wrong. The limitation is systematic: exact counting through conversation is unreliable on every attempt, so agreement between two generated answers is not verification.',
      },
      {
        id: 'D',
        text:
          'The chatbot generated plausible counts instead of counting. It reads the order numbers as token chunks, not as strings it compares one by one, so exact tallies come out as estimates. A spreadsheet formula gives the exact count.',
        isCorrect: true,
        feedbackText:
          'This is a boundary task: the job needs exact, item-by-item operations below the level at which the model represents text. In conversation, the model does not loop through the list, compare each pair of strings, and keep a tally. It predicts what a count should look like, and each new attempt is a new prediction, which is why the answers differ from each other and from the truth. Tools that can run code count exactly when they actually run it. For any count, sort, deduplication, or comparison across many items, use a spreadsheet formula or a code tool, and use the chatbot to write the formula if that helps.',
      },
    ],
  },
  {
    id: 'POST-5',
    parallelPreId: 'PRE-5',
    construct: 'Context window limits',
    constructKey: 'context-window',
    block: 'failure',
    objectiveRefs: ['3.3'],
    stem:
      'A compliance officer pastes three policy documents into an AI tool, one after another: Document 1 (14 pages), Document 2 (12 pages), and Document 3 (9 pages), well within the tool\'s stated limit. Her instruction: "Identify any contradictions between these three documents." The AI reports two contradictions, both between Documents 1 and 3. The officer later discovers one it missed: a provision on page 7 of Document 2 is explicitly overridden by Document 3. What most likely happened?',
    scenarioSummary:
      'An AI asked to find contradictions across three pasted policy documents misses a conflict involving a provision near the center of the combined input.',
    options: [
      {
        id: 'A',
        text:
          'The tool\'s attention across the combined input was uneven: material near the start and end of a long input gets the most weight. Page 7 of Document 2 sat near the center of the 35 pages, where a provision is most likely to be underweighted.',
        isCorrect: true,
        feedbackText:
          'Context window mechanics explain this failure. All three documents fit within the model\'s context window, but attention is not spread evenly across a long input: material near the beginning and end receives more weight than material buried in the middle, the lost-in-the-middle effect. Documents 1 and 3 sat at the edges of the combined input, and the model found the conflicts between them. Page 7 of Document 2 is page 21 of 35, near the center. Cross-document work is especially exposed, because the model has to connect a middle-zone provision to one far away. The fix is positional: check the middle sections on their own, or run the comparison on shorter inputs.',
      },
      {
        id: 'B',
        text:
          'The AI tool compared the documents as separate pairs (1 vs. 3, then 1 vs. 2) rather than holistically. Because the conflict was between Documents 2 and 3, it fell outside the comparison sequence, and the tool never directly compared the two documents that conflicted.',
        isCorrect: false,
        feedbackText:
          'AI models don\'t process multi-document comparisons through structured pairwise passes. The model processes the entire input as a single token sequence and generates its response through next-token prediction. The failure is about the model\'s attention being unevenly distributed across the combined input, with material in the middle of the sequence getting the least weight. There is no missing comparison step to add back.',
      },
      {
        id: 'C',
        text:
          'The AI tool determined that two contradictions was a statistically appropriate number for documents of this type and length, and stopped searching after reaching that threshold. It prioritized conciseness over completeness to avoid producing an overwhelmingly detailed response.',
        isCorrect: false,
        feedbackText:
          'AI models don\'t have an internal threshold for "appropriate number of contradictions." The model isn\'t deciding to stop searching after finding two. It\'s generating a response based on what it can attend to across the full input, and uneven attention across 35 pages means a provision in the middle can go undetected. The omission is a capability limitation, not an editorial choice.',
      },
      {
        id: 'D',
        text:
          'The Document 2 provision used clause numbers and defined terms that split into unusual tokens, so tokenization kept the model from matching it against the wording in Document 3. The conflicts between Documents 1 and 3 used plainer wording that tokenized cleanly.',
        isCorrect: false,
        feedbackText:
          'Tokenization affects character-level tasks such as counting letters or comparing digit strings. It does not stop a model from recognizing that two passages make conflicting policy statements, and the same model matched provisions between Documents 1 and 3 written in the same register. What sets the missed provision apart is its position near the center of a long input, not how its words were split into tokens.',
      },
    ],
  },
  {
    id: 'POST-6',
    parallelPreId: 'PRE-6',
    construct: 'Prediction vs. retrieval',
    constructKey: 'prediction-retrieval',
    block: 'mechanics',
    objectiveRefs: ['3.2'],
    stem:
      'A procurement specialist asks an AI tool to provide the ISO 9001:2015 certification requirements for medical device suppliers, the edition the company\'s suppliers are certified to. The tool produces a detailed, well-structured list of 12 requirements that reads like official documentation. The specialist notices that requirements 8 through 12 don\'t appear in the 2015 standard or in the 2026 revision that followed it. Which explanation is most accurate?',
    scenarioSummary:
      'An AI lists 12 ISO 9001:2015 certification requirements; the last 5 don\'t exist in the 2015 edition or its 2026 revision.',
    options: [
      {
        id: 'A',
        text:
          'The AI tool accessed a draft version of an upcoming ISO revision that includes proposed requirements not yet in the published standard. The additional items are real but belong to a future version of the certification framework.',
        isCorrect: false,
        feedbackText:
          'This explanation assumes the model has access to draft standards not yet published. AI models generate based on training data patterns, not by accessing unpublished documents. More fundamentally, this explanation frames the additional requirements as real. The issue is that they may be entirely fabricated, not that they belong to a future version.',
      },
      {
        id: 'B',
        text:
          'The AI tool correctly identified all ISO 9001:2015 requirements but reformulated them using different language, causing the specialist to fail to recognize requirements 8 through 12 as corresponding to real provisions. The content is accurate but the phrasing doesn\'t match the official documentation.',
        isCorrect: false,
        feedbackText:
          'This explanation assumes all 12 requirements are real but rephrased. If the specialist (a procurement professional familiar with ISO standards) can\'t recognize requirements 8 through 12 in the actual standard, it\'s far more likely the requirements don\'t exist than that they\'re reformulated beyond recognition. Attributing the discrepancy to phrasing differences rather than fabrication creates false confidence.',
      },
      {
        id: 'C',
        text:
          'The AI tool reproduced the core ISO requirements accurately but filled in additional items with text matching the linguistic patterns of certification documentation. Once it established the "ISO requirement" format, it kept producing items that fit the pattern whether or not they exist in the actual standard.',
        isCorrect: true,
        feedbackText:
          'This is the prediction-vs.-retrieval distinction in action. The model may have encoded some real ISO 9001 requirements from its training data, producing accurate items 1 through 7. But the model doesn\'t "know" how many requirements exist. It generates one item after another by predicting what the next plausible requirement should look like. Once the output format is established ("numbered requirement in formal certification language"), the model continues generating items that fit that pattern. Requirements 8 through 12 exist because they\'re linguistically plausible, not because they correspond to real provisions. The model can\'t distinguish between generating a real requirement from memory and generating a fabricated one from pattern matching: from the model\'s perspective, both processes are identical.',
      },
      {
        id: 'D',
        text:
          'The AI tool merged requirements from ISO 9001 with requirements from adjacent standards (ISO 13485 for medical devices, ISO 14001 for environmental management). It recognized the medical device context and pulled in relevant requirements from related frameworks to provide comprehensive coverage.',
        isCorrect: false,
        feedbackText:
          'This explanation implies a deliberate cross-referencing process: the model identifies the medical device context, locates adjacent standards, and selectively merges requirements. AI models don\'t perform that kind of structured knowledge retrieval. The additional requirements may superficially resemble provisions from other standards (because certification language shares common patterns), but the model isn\'t merging identified sources. It\'s generating text that fits the format.',
      },
    ],
  },
  {
    id: 'POST-7',
    parallelPreId: 'PRE-7',
    construct: 'Tokenization',
    constructKey: 'tokenization',
    block: 'mechanics',
    objectiveRefs: ['3.1'],
    stem:
      'A localization manager asks an AI tool to translate a product tagline from English to Thai and then translate it back to English to check fidelity. The round-trip translation produces a noticeably different meaning from the original. She runs the same test with a French translation and the round-trip is nearly perfect. What is the most likely structural explanation for this disparity?',
    scenarioSummary:
      'Round-trip translation through Thai shifts meaning while round-trip through French preserves it. Same model, same task, different result.',
    options: [
      {
        id: 'A',
        text:
          'The AI model was trained on a significantly larger corpus of French text than Thai text, giving it stronger translation capabilities for French. The quality gap reflects a training data imbalance rather than a structural limitation of the model\'s architecture.',
        isCorrect: false,
        feedbackText:
          'Training data volume is a real factor in translation quality, but it doesn\'t explain the *structural* nature of the disparity. A model with less Thai training data would produce lower-quality translations, but the specific failure pattern (meaning collapse during round-trip translation) points to a representation issue, not a data quantity issue. The question asks for the structural explanation, and tokenization alignment is the structural difference: Thai fragments into sub-character pieces while French tokens track meaningful units.',
      },
      {
        id: 'B',
        text:
          'Thai is a tonal language with context-dependent meanings, making it inherently more difficult for any translation system to handle. The round-trip error reflects the genuine linguistic complexity of Thai rather than a limitation specific to how AI models process text.',
        isCorrect: false,
        feedbackText:
          'Thai\'s linguistic complexity (tonal distinctions, context-dependent meanings) is real, but framing this as "inherent difficulty" obscures the mechanism. The model\'s difficulty with Thai is mostly about how the model represents Thai text internally, not about the language\'s complexity. A language whose tokens don\'t align with its meaningful units loses structure at the representation level, before translation even begins. Latin-script languages get tokens that track words and word parts, which preserves more meaning at the token level.',
      },
      {
        id: 'C',
        text:
          'Thai text breaks into many more tokens than French, so the Thai round trip filled the model\'s context window and the end of the tagline was cut off before translation. The meaning shifted because part of the input never reached the model.',
        isCorrect: false,
        feedbackText:
          'The token count is right; the consequence is wrong. A product tagline runs to a few dozen tokens even in Thai, a tiny fraction of any current context window, so nothing was cut off. Heavier tokenization matters here because meaning is represented in fragments that don\'t align with Thai\'s words and syllables, not because of how much room the text takes up. Context window limits explain omissions in long documents, not a meaning shift in one sentence.',
      },
      {
        id: 'D',
        text:
          'Thai script tokenizes into many small byte-level fragments that don\'t align with its meaningful units, while French and English map onto tokens tracking whole words and word parts, so the Thai tagline\'s meaning shifts or collapses in round-trip translation.',
        isCorrect: true,
        feedbackText:
          'Tokenization is the structural explanation. Tokenizer vocabularies are built mostly from English and other Latin-script text, so common English and French words map onto whole-word or word-part tokens that line up with meaning. Non-Latin scripts, including Thai, appeared far less often in that data, so Thai text fragments much more aggressively — often into byte-level pieces that split individual characters and ignore where Thai\'s words and syllables actually begin and end. The model has to rebuild meaning from fragments that don\'t align with meaningful units, which gives it weaker handles on the content it needs to preserve. The round-trip test exposes this: French→English→French holds because French tokens track meaningful units; Thai→English→Thai degrades because the representation is built on misaligned fragments. Thinner Thai training data compounds the problem, but the fragmentation is the structural piece.',
      },
    ],
  },
  {
    id: 'POST-8',
    parallelPreId: 'PRE-8',
    construct: 'Capability diagnosis',
    constructKey: 'capability-diagnosis',
    block: 'mechanics',
    objectiveRefs: ['3.4'],
    stem:
      'A team lead asks three colleagues to each use an AI tool for a different task, then report the results. Colleague A asked the tool to write a press release announcing a product launch; the output was polished and accurate. Colleague B asked the tool to verify whether a specific clause exists in their company\'s 200-page vendor agreement; the tool said yes, but the clause doesn\'t exist. Colleague C asked the tool to calculate the weighted average cost of capital using five financial inputs; the result was off by several percentage points. The team lead asks you: "Why did the tool work for A but fail for B and C?" Which response is most accurate?',
    scenarioSummary:
      'Three colleagues, three AI tasks: press release succeeds, vendor-agreement clause check fabricates, WACC calculation is wrong by several points.',
    options: [
      {
        id: 'A',
        text:
          'Task A succeeded because press releases use formulaic language that AI tools are well-trained on, while Tasks B and C failed because vendor agreements and financial calculations are specialized domains that require enterprise-grade AI tools. The team should upgrade to a domain-specific model for legal and financial work.',
        isCorrect: false,
        feedbackText:
          'The failure is about architectural fit, not domain specialization. A "domain-specific" model for legal or financial work would still struggle with the same underlying limitations: context window attention degradation for long-document verification (Task B) and token-based representation for exact numerical computation (Task C). The fix isn\'t a better model; it\'s knowing which tasks match the model\'s architecture and which require different tools (e.g., a code execution environment for Task C, or a retrieval system for Task B).',
      },
      {
        id: 'B',
        text:
          'Task A required generating plausible, well-structured text, which is what the architecture is optimized for. Task B stressed the context window: verifying one precise fact demands sustained attention across a long input. Task C failed because exact numerical computation conflicts with token-based, probabilistic generation.',
        isCorrect: true,
        feedbackText:
          'The capability diagnosis framework maps each success or failure to a specific property of the model\'s architecture. Task A (press release) succeeded because generating well-structured, contextually appropriate text is precisely what next-token prediction is optimized for. The model excels at producing language that fits the expected patterns of a given document type. Task B (clause verification) failed because finding a specific fact in a 200-page document requires sustained attention across the entire input and precise retrieval. The model\'s attention degrades across long inputs, so it sometimes "finds" clauses that don\'t exist or misses clauses that do. Task C (WACC calculation) failed because exact arithmetic requires precise numerical operations that conflict with the model\'s token-based, probabilistic architecture. The model generates plausible-looking numbers rather than computing.',
      },
      {
        id: 'C',
        text:
          'Task A succeeded by chance. If the team ran it again, the press release might contain errors too. The model doesn\'t have different reliability levels for different tasks; it has a general accuracy rate, and Tasks B and C happened to fall on the wrong side of that probability distribution.',
        isCorrect: false,
        feedbackText:
          'The model does have systematically different reliability levels for different tasks. That\'s the central insight of the capability diagnosis framework. Press release generation aligns with the model\'s architectural strengths (text generation). Clause verification and numerical computation conflict with specific architectural limitations (context window attention and token-based representation, respectively). The outcomes are predictable, not random.',
      },
      {
        id: 'D',
        text:
          'Task A succeeded because the colleague who wrote the prompt was more experienced with AI tools than the other two. Prompt quality is the primary determinant of output quality, and with better-written prompts, Tasks B and C would have produced accurate results.',
        isCorrect: false,
        feedbackText:
          'Prompt quality affects output quality, but it cannot overcome architectural limitations. No prompt will make the model maintain uniform attention across a 200-page document, and no prompt will make the model perform exact WACC calculations through token-based prediction. Attributing the failures to prompt quality implies that the right instruction can fix any task, which misidentifies the source of the limitation.',
      },
    ],
  },
  {
    id: 'POST-9',
    parallelPreId: 'PRE-9',
    construct: 'Output verification priority',
    constructKey: 'verification-priority',
    block: 'evaluation',
    objectiveRefs: ['4.3'],
    stem: `A program coordinator uses an AI tool to draft a grant application for a workforce development initiative. The draft includes the following four claims. Which claim should be verified first?

1. "Workforce development programs have historically played a central role in addressing skill gaps during periods of economic transition."
2. "The U.S. Department of Labor's 2024 Workforce Innovation Report found that employer-sponsored upskilling programs reduced turnover by 34% in participating organizations."
3. "This initiative will serve approximately 500 professionals across four industry sectors over a 12-month delivery period."
4. "Program evaluation will include pre- and post-assessments, participant surveys, and quarterly progress reports to the funding body."`,
    scenarioSummary:
      'An AI-drafted grant application contains four claims: general framing, a specific government-report statistic, a scope projection, and an evaluation plan.',
    options: [
      {
        id: 'A',
        text:
          'Claim 1, because the general framing establishes the rationale for the entire grant application, and a reviewer who disputes the foundational premise will reject the proposal regardless of the quality of the specific evidence presented.',
        isCorrect: false,
        feedbackText:
          'The general framing in Claim 1 ("Workforce development programs have historically played a central role...") is broad, consensus-level language that is unlikely to be factually wrong in a way that triggers rejection. General framing errors are lower-stakes than specific fabricated citations because they don\'t create verifiable false claims; they\'re directional statements reviewers are unlikely to dispute or fact-check.',
      },
      {
        id: 'B',
        text:
          'Claim 2, because it cites a specific government report with a precise statistic. If the report doesn\'t exist or the 34% is fabricated, the application carries a false citation that could disqualify it and damage credibility with the funder.',
        isCorrect: true,
        feedbackText:
          'Claim 2 cites a specific government report ("U.S. Department of Labor\'s 2024 Workforce Innovation Report") with a precise statistic (34% turnover reduction). This is exactly the type of claim AI models fabricate fluently: a plausible-sounding report title, a credible government source, and a specific percentage that would be impressive if real. If the report doesn\'t exist or the statistic is fabricated, the grant application contains a falsified citation. In a grant review context, a falsified citation can disqualify the proposal and damage the organization\'s credibility with the funder. The consequences are immediate and disproportionate to the other claims.',
      },
      {
        id: 'C',
        text:
          'Claim 3, because the projected participant numbers and scope define the budget justification, and if 500 professionals across four sectors is not feasible within the proposed timeline, the grant funder will identify the proposal as unrealistic.',
        isCorrect: false,
        feedbackText:
          'The scope projection in Claim 3 is an estimate the coordinator should validate against their program capacity, but it\'s a planning figure, not a factual claim about an external source. If 500 professionals is unrealistic, it\'s a planning error, not a fabrication, and it\'s visible to the coordinator without external verification.',
      },
      {
        id: 'D',
        text:
          'Claim 4, because the evaluation methodology section is what reviewers scrutinize most closely, and any inaccuracy in the evaluation plan would signal the applicant lacks the methodological rigor to execute the proposed initiative.',
        isCorrect: false,
        feedbackText:
          'The evaluation methodology in Claim 4 describes the coordinator\'s own planned activities (pre/post assessments, surveys, quarterly reports). These are *intentions*, not factual claims about external sources. They should be reviewed for feasibility, but they don\'t carry the same fabrication risk as an AI-generated citation to a specific government report.',
      },
    ],
  },
  {
    id: 'POST-10',
    parallelPreId: 'PRE-10',
    construct: 'Structured prompting',
    constructKey: 'structured-prompting',
    block: 'evaluation',
    objectiveRefs: ['4.2'],
    stem:
      'A training coordinator asks an AI tool: "Help me with onboarding." The output is a generic checklist that could apply to any organization. Rather than abandoning the tool, she restructures her request. Which restructured prompt is most likely to produce a plan she can use?',
    scenarioSummary:
      'A vague onboarding prompt produced a generic checklist. Four restructured prompts compete to demonstrate the Description competency.',
    options: [
      {
        id: 'A',
        text:
          '"Create a first-week onboarding schedule for a junior data analyst joining a 12-person analytics team at a financial services firm. Include systems access on Day 1, introductions to the three team leads, a shadow session with a senior analyst on Day 2 or 3, and a manager check-in on Day 5. Format as a day-by-day table."',
        isCorrect: true,
        feedbackText:
          'This prompt demonstrates the Description competency: it specifies the role (junior data analyst), context (12-person team, financial services), concrete activities (systems access, team introductions, shadow session, manager check-in), timing constraints (Day 1, Day 2–3, Day 5), and output format (day-by-day table). Each specification narrows the model\'s output space toward a targeted, useful result. The model generates based on what the prompt tells it. More structural specification produces more relevant output.',
      },
      {
        id: 'B',
        text:
          '"Help me with onboarding. Some background: we are a 400-person financial services firm with offices in Chicago and Toronto, founded in 2009. We value collaboration, curiosity, and client focus, and our analytics team has doubled in two years. New hires have told us their first weeks felt disorganized. Please make onboarding better."',
        isCorrect: false,
        feedbackText:
          'This prompt adds background, not specification. It tells the model about the firm but never says what to produce: no role, no time frame, no activities, no format. Length is not Description. Given this prompt, the model will produce a warmer, longer generic onboarding plan, because nothing in it narrows the output to a particular role, week, or format.',
      },
      {
        id: 'C',
        text:
          '"You are an expert HR consultant with 20 years of experience in employee onboarding. Using your expertise, create the most effective onboarding plan possible. Think step by step and consider all aspects of a successful onboarding experience."',
        isCorrect: false,
        feedbackText:
          'This prompt uses role-assignment and meta-instructions ("think step by step") but provides almost no task-specific information. The model still doesn\'t know the hire\'s role, team size, industry, or what the coordinator considers a successful onboarding outcome. Persona framing without structural content produces confident-sounding but generic output.',
      },
      {
        id: 'D',
        text:
          '"Help me with onboarding for a data analyst joining our team. Make it specific to our company and our industry rather than a generic template. Include first-week activities, team introductions, and system setup, and make sure nothing important is missed. Let me know if you need any other information to make this better."',
        isCorrect: false,
        feedbackText:
          'This is better than the original (it adds the role and some categories), but it still relies on the model to fill in specifics ("specific to our company and our industry" without saying what the company or industry is). The closing "let me know if you need other information" defers specification to the model rather than providing it upfront. Compare that to option A, where every detail is in the prompt itself.',
      },
    ],
  },
  {
    id: 'POST-11',
    parallelPreId: 'PRE-11',
    construct: 'Task decomposition',
    constructKey: 'task-decomposition',
    block: 'evaluation',
    objectiveRefs: ['4.1'],
    stem:
      'A benefits manager is preparing an employee FAQ about a change of health-benefits provider. The work has four parts: (1) pulling every question employees asked at last week\'s town hall out of the meeting transcript, which she will paste in; (2) drafting answers about the new coverage terms from the provider\'s plan document, which she will also paste in; (3) deciding which questions to answer now and which to hold until employee representatives have been consulted; and (4) formatting the FAQ into the intranet template. Which plan for using AI is most sound?',
    scenarioSummary:
      'A benefits manager splits an employee FAQ into four parts and has to decide how much of each to hand to AI.',
    options: [
      {
        id: 'A',
        text:
          'Fully delegate all four parts. The tool has the transcript and the plan document, so it has every source it needs, and she can review the finished FAQ once, carefully, before it is published to the whole company.',
        isCorrect: false,
        feedbackText:
          'Supplying the sources does not make every part delegable. Part 3 is a judgment about timing and commitments to employee representatives, and nothing in the transcript or the plan document tells the tool what was promised. Part 1 also needs a check: a long transcript is a volume task, and questions buried in the middle are the ones most likely to be dropped. One read of a polished FAQ tends to check tone and layout, not whether a question is missing or an answer is premature.',
      },
      {
        id: 'B',
        text:
          'Keep all four parts human-only. Benefits changes are sensitive, and employees who learn the FAQ was produced with AI will trust its answers less, however accurate those answers turn out to be.',
        isCorrect: false,
        feedbackText:
          'Sensitivity raises the bar for checking. It does not make every part unsuitable for AI. Extracting questions and formatting a template are checkable tasks, and refusing help on them spends time without improving the parts that need judgment. Whether employees are told AI was used is a disclosure decision, which a diligence statement handles, not a reason to avoid the tool.',
      },
      {
        id: 'C',
        text:
          'Fully delegate parts 2 and 3, since drafting answers from a source document and ranking questions are pattern tasks the model handles well, and keep parts 1 and 4 human-only, since a transcript and a template need exact handling by a person.',
        isCorrect: false,
        feedbackText:
          'This inverts the risk. Pulling questions from a transcript and formatting a template are the parts with a clear standard to check against. Answers about coverage terms must match the plan document line by line, and deciding what to answer now depends on consultation commitments the tool cannot see. The model will produce answers and a ranking that look right whether or not they are, which is why those two parts need the most human control.',
      },
      {
        id: 'D',
        text:
          'Delegate parts 1 and 4, then check that no town-hall question is missing. Use AI to draft part 2 and check each answer against the plan document. Keep part 3 human-only: it turns on commitments the tool knows nothing about.',
        isCorrect: true,
        feedbackText:
          'This plan makes the decision component by component. Parts 1 and 4 have a clear standard, the transcript and the template, so they can be delegated with a check; for part 1 the check is completeness, because questions in the middle of a long transcript are the easiest to lose. Part 2 works from a pasted source, so AI can draft and she verifies each answer against the plan. Part 3 depends on context only she has, so it stays human-only.',
      },
    ],
  },
  {
    id: 'POST-12',
    parallelPreId: 'PRE-12',
    construct: 'Disclosure and accountability',
    constructKey: 'disclosure-accountability',
    block: 'evaluation',
    objectiveRefs: ['4.5'],
    stem:
      'A training manager used AI to prepare a quarterly report on the company\'s onboarding program for the executive team. The tool turned her survey export into charts, drafted a summary of 140 open-ended comments, and suggested three improvements. She checked the charts against the export, read all 140 comments to confirm the summary, rejected one suggested improvement, and rewrote the other two from her own observations. Her company asks staff to note AI use in their deliverables. Which note is most appropriate to attach to the report?',
    scenarioSummary:
      'A training manager used AI for charts, a comment summary, and suggestions in an executive report, and has to decide how to note it.',
    options: [
      {
        id: 'A',
        text:
          '"AI assistance was used in preparing this report, in line with company policy. All of its content has been reviewed for accuracy and approved by the program owner, and the report reflects the onboarding team\'s current view of the program."',
        isCorrect: false,
        feedbackText:
          'This acknowledges AI use without saying what it did. The executive team cannot tell whether the charts, the comment summary, or the recommendations came from the tool, or what "reviewed" covered. A diligence statement earns trust by being specific: which parts AI produced, what was checked, and what the author changed.',
      },
      {
        id: 'B',
        text:
          '"The charts, the comment summary, and the improvement ideas were generated by AI. Because the analysis is the tool\'s, the executive team should treat these conclusions as provisional until a second reviewer confirms them."',
        isCorrect: false,
        feedbackText:
          'This understates her own work and hands accountability away. She checked the charts and the comments, rejected one suggestion, and rewrote two, so the conclusions are hers. Telling the executive team to wait for a second reviewer shifts a responsibility she has already carried out.',
      },
      {
        id: 'C',
        text:
          '"AI built the charts and drafted the comment summary; I checked both against the export and all 140 comments. Of three AI-suggested improvements, I rejected one and rewrote two from my own observations. I stand behind the report."',
        isCorrect: true,
        feedbackText:
          'This statement does what the Diligence competency asks. It separates AI-generated work (charts, comment summary) from human judgment (the rejected and rewritten improvements), names the checks and what they covered, and closes with accountability. It is short enough to append to the report, and a reader can weigh each part on what was done to it.',
      },
      {
        id: 'D',
        text:
          '"No AI note is needed. The report went through the same review as any other deliverable, and naming the tool would only invite the executive team to discount findings that have already been checked."',
        isCorrect: false,
        feedbackText:
          'Leaving the note out treats disclosure as a risk to the findings rather than evidence for them. The organization\'s practice is to disclose, and the silence it replaces is what keeps teams from learning which AI practices work. A specific note that the output was checked makes the findings easier to trust, not harder.',
      },
    ],
  },
];
