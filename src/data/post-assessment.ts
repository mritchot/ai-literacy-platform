// Post-Assessment instrument — 10 scenario-based items administered
// AFTER Module 4 completion. Items use course vocabulary (tokenization,
// next-token prediction, context window, augmentation/automation
// spectrum, Description competency, 4D framework) and are PARALLEL to
// the pre-assessment items by construct (different scenarios, same
// construct). The `parallelPreId` field joins each post item to its
// pre-assessment counterpart for the comparative results view in
// `components/assessment/AssessmentResults.tsx`.
//
// Source: the post-assessment instrument document (Phase 4 planning corpus).
// Answer key distribution: A=3, B=3, C=2, D=2.

import type { AssessmentBlock, AssessmentItem, AssessmentOption } from './pre-assessment';

export type { AssessmentBlock, AssessmentOption };

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
      'After completing the program, a participant reviews her team\'s AI usage logs and notices that 80% of their AI interactions are single-turn exchanges (one prompt, one response, no follow-up). In a team meeting, her manager describes their AI strategy as "deeply collaborative. We use it as a thinking partner." Applying what you\'ve learned about the augmentation-automation spectrum, which assessment is most accurate?',
    scenarioSummary:
      'A team\'s logs show 80% single-turn AI usage while the manager describes the team\'s strategy as deeply collaborative.',
    options: [
      {
        id: 'A',
        text:
          'The manager\'s characterization is accurate, since single-turn interactions can still be collaborative if the user carefully reviews the output before using it, and the number of turns is not a meaningful indicator of whether usage is augmentative or automated.',
        isCorrect: false,
        feedbackText:
          'The number of interaction turns is not a perfect proxy, but 80% single-turn usage is a strong behavioral signal. Single-turn interactions (one prompt, one response, no follow-up) are the defining pattern of directive, automation-oriented usage. If the team were genuinely collaborating with the tool, the logs would show iterative exchanges where users refine, redirect, and build on outputs. The manager\'s characterization doesn\'t match the behavioral evidence.',
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
          'The interaction logs suggest the team\'s actual usage is predominantly directive and automation-oriented, even though the manager frames it as collaboration. This gap between self-reported and observed interaction patterns is well-documented in the behavioral research on AI adoption.',
        isCorrect: true,
        feedbackText:
          'The behavioral research on AI adoption consistently finds a gap between how professionals describe their AI usage (collaborative and iterative) and what their interaction patterns actually show (single-turn and directive). The manager\'s framing reflects a common self-report bias, not intentional misrepresentation. The disconnect between perceived and actual interaction style is real. Recognizing this gap is the first step toward deliberately choosing augmentative practices when the task warrants them.',
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
      'A department head reviews data showing her team\'s AI-assisted tasks and notices that customer-facing proposal drafting saves the most time per task (over 60% reduction). She plans to mandate AI use for all client proposals starting next quarter. Applying the productivity-risk framework from the program, what is the most critical gap in her decision?',
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
          'She hasn\'t benchmarked her team\'s time savings against industry averages. Without knowing whether 60% is above or below the median productivity gain for proposal drafting, she can\'t determine whether her team is using AI effectively or underperforming.',
        isCorrect: false,
        feedbackText:
          'Industry benchmarking is useful for operational optimization, but it\'s not the critical gap here. Whether 60% is above or below the industry median doesn\'t change the risk calculus. The question isn\'t whether the team is saving enough time; it\'s whether the outputs they\'re saving time on are safe to use without extensive verification.',
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
      'A product manager uses an AI tool to generate a competitive landscape analysis. The report states: "Gartner\'s 2025 Magic Quadrant for Enterprise Collaboration platforms placed Vendor X in the Leaders quadrant for the third consecutive year, citing its API extensibility and compliance automation as key differentiators." The statement is fluent, specific, and formatted exactly like a real analyst citation. Using the mechanical understanding of language models from the program, what is the strongest reason to verify this claim before including it in a board presentation?',
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
          'The model generates text by predicting what a plausible analyst citation should look like based on patterns in its training data. Unless it actively retrieved and read the actual Gartner report during this interaction, the quadrant placement, consecutive-year claim, and cited differentiators may all be fabricated independently.',
        isCorrect: true,
        feedbackText:
          'The model\'s next-token prediction mechanism generates what a plausible analyst citation should contain, based on statistical patterns. Each element (the quadrant placement, the "third consecutive year" claim, the specific differentiators) is independently generated to fit the expected format of a Gartner citation. Unless the tool performed an active retrieval step (searching for and reading the actual report during this interaction), every detail may be fabricated while appearing authoritative. The specificity and formatting are features of fluent generation, not evidence of accuracy.',
      },
      {
        id: 'C',
        text:
          'AI models tend to favor positive framing when generating competitive analysis, so even if the Gartner report exists, the model likely exaggerated the vendor\'s positioning. The vendor may have been placed in the Challengers or Visionaries quadrant rather than Leaders.',
        isCorrect: false,
        feedbackText:
          'AI models don\'t have a systematic "positive framing" bias that selectively inflates competitive positioning. The model didn\'t exaggerate. It may have generated the entire citation without any connection to a real report at all. Framing this as exaggeration implies the underlying data is real but distorted, when the data may not exist at all.',
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
      'A quality assurance analyst asks an AI chatbot to compare two product serial numbers ("SN-4872-XR-2941" and "SN-4872-XR-2914") and identify the differences. The AI responds: "These serial numbers are identical." The analyst can see they differ in the last four digits (2941 vs. 2914). Using your understanding of tokenization and how models represent text, what best explains this error?',
    scenarioSummary:
      'A QA analyst asks an AI to compare two near-identical serial numbers; the AI calls them identical despite a visible four-digit difference.',
    options: [
      {
        id: 'A',
        text:
          'The AI chatbot used a fuzzy matching algorithm that treats strings with high character overlap as identical. Since the two serial numbers share 90% of their characters, the similarity threshold was exceeded and the tool reported them as matching.',
        isCorrect: false,
        feedbackText:
          'AI chatbots don\'t use fuzzy matching algorithms with similarity thresholds. The model isn\'t running a string comparison function and then applying a match/no-match threshold. It generates a response by predicting what a plausible answer should be, and the tokenization of the input determines how much character-level detail is available to the model during that prediction.',
      },
      {
        id: 'B',
        text:
          'The AI chatbot compared only the prefix portions of the serial numbers ("SN-4872-XR") and truncated the comparison at the hyphen boundary. Most AI tools process hyphenated strings as separate segments and don\'t always carry the comparison through to the final segment.',
        isCorrect: false,
        feedbackText:
          'The model doesn\'t process hyphenated strings by segmenting at hyphen boundaries and comparing segments independently. The tokenizer breaks the input into tokens based on its vocabulary, not based on punctuation structure. The comparison failure is about the granularity of the tokens relative to the character-level difference, not about where the tokenizer splits.',
      },
      {
        id: 'C',
        text:
          'The AI chatbot made a probabilistic judgment that two serial numbers from the same product line are more likely to be identical than different. It applied a statistical prior about serial number patterns rather than performing a character-level comparison of the actual input.',
        isCorrect: false,
        feedbackText:
          'While the model\'s outputs are probabilistic, framing this as a "statistical prior about serial number patterns" implies a deliberate inference process that doesn\'t match the mechanism. The model isn\'t reasoning about serial number likelihood. It\'s processing token sequences, and the token representation may not preserve the character-level distinction between 2941 and 2914.',
      },
      {
        id: 'D',
        text:
          'The AI chatbot processes these serial numbers as token sequences rather than character sequences. If the differing digits fall within the same token or are split across token boundaries, the model may not represent the character-level difference that is visible to a human reader.',
        isCorrect: true,
        feedbackText:
          'The model\'s tokenizer converts text into tokens: chunks that may contain multiple characters or digits. The serial numbers "SN-4872-XR-2941" and "SN-4872-XR-2914" might be tokenized such that the differing digits (41 vs. 14) fall within a token boundary where the model doesn\'t represent each character individually. The human eye sees a clear difference at the character level, but the model operates at the token level. If the token-level representations are similar enough, the model doesn\'t register the difference. This is the same class of failure as counting letters or comparing them: the task requires granularity that the tokenization doesn\'t provide.',
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
      'A compliance officer pastes three separate policy documents (totaling 35 pages) into an AI tool with the instruction: "Identify any contradictions between these three documents." The AI reports two contradictions, both between Documents 1 and 2. The officer later discovers a significant contradiction between Documents 1 and 3, where Document 3 explicitly overrides a key provision in Document 1. Using your understanding of context window mechanics, what most likely happened?',
    scenarioSummary:
      'An AI asked to find contradictions across three policy documents reports only adjacent pairs, missing a real conflict between the first and third documents.',
    options: [
      {
        id: 'A',
        text:
          'The AI tool\'s attention across the combined input was uneven. It processed the earlier documents with greater fidelity and progressively lost the ability to hold and cross-reference content from Document 3 against provisions established in Document 1 as the total input length increased.',
        isCorrect: true,
        feedbackText:
          'Context window mechanics explain this failure precisely. Even when all three documents fit within the model\'s context window, the model\'s attention is not uniformly distributed across the full input. As total input length increases, the model\'s ability to hold earlier content in active working memory while processing later content degrades. Cross-document contradiction work requires the model to hold a provision from Document 1 in active memory while comparing it against a provision in Document 3. Attention degradation hits that combination hardest. The model found contradictions between Documents 1 and 2 (which sit closer together in the input) but missed the Document 1-to-3 contradiction because the relevant provisions were farther apart.',
      },
      {
        id: 'B',
        text:
          'The AI tool compared the documents sequentially (1 vs. 2, then 2 vs. 3) rather than holistically, and because the contradiction was between Documents 1 and 3, it fell outside the pairwise comparison sequence. The tool never directly compared the two documents that conflicted.',
        isCorrect: false,
        feedbackText:
          'AI models don\'t process multi-document comparisons through structured pairwise passes. The model processes the entire input as a single token sequence and generates its response through next-token prediction. The failure is about the model\'s attention being unevenly distributed across the combined input, with content later in the sequence getting less effective cross-referencing against content earlier in the sequence. There is no missing comparison step to add back.',
      },
      {
        id: 'C',
        text:
          'The AI tool determined that two contradictions was a statistically appropriate number for documents of this type and length, and stopped searching after reaching that threshold. It prioritized conciseness over completeness to avoid producing an overwhelmingly detailed response.',
        isCorrect: false,
        feedbackText:
          'AI models don\'t have an internal threshold for "appropriate number of contradictions." The model isn\'t deciding to stop searching after finding two. It\'s generating a response based on what it can attend to across the full input, and attention degradation across 35 pages means some contradictions simply aren\'t detected. The omission is a capability limitation, not an editorial choice.',
      },
      {
        id: 'D',
        text:
          'The contradiction between Documents 1 and 3 involved domain-specific legal terminology that the AI tool wasn\'t trained to recognize as contradictory. It identified the simpler contradictions between Documents 1 and 2 because they used more common language patterns.',
        isCorrect: false,
        feedbackText:
          'If the model could identify contradictions between Documents 1 and 2 using legal terminology, it has sufficient domain knowledge to identify contradictions using similar terminology between Documents 1 and 3. The issue is the model\'s ability to sustain attention and cross-reference across increasing input length, not domain-specific vocabulary.',
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
      'A procurement specialist asks an AI tool to provide the current ISO 9001:2015 certification requirements for medical device suppliers. The tool produces a detailed, well-structured list of 12 requirements that reads like official documentation. The specialist notices that requirements 8 through 12 don\'t appear in the actual ISO standard. Applying the prediction-vs.-retrieval distinction from the program, which explanation is most accurate?',
    scenarioSummary:
      'An AI lists 12 ISO 9001:2015 certification requirements; the last 5 don\'t exist in the actual standard.',
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
          'The AI tool retrieved the core ISO requirements accurately from its training data but filled in additional items by generating text that matches the linguistic patterns of certification documentation. Once the model established the format of "ISO requirement," it continued producing items that fit that pattern regardless of whether they exist in the actual standard.',
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
      'A localization manager asks an AI tool to translate a product tagline from English to Thai and then translate it back to English to check fidelity. The round-trip translation produces a noticeably different meaning from the original. She runs the same test with a French translation and the round-trip is nearly perfect. Using your understanding of tokenization, what is the most likely structural explanation for this disparity?',
    scenarioSummary:
      'Round-trip translation through Thai shifts meaning while round-trip through French preserves it. Same model, same task, different result.',
    options: [
      {
        id: 'A',
        text:
          'The AI model was trained on a significantly larger corpus of French text than Thai text, giving it stronger translation capabilities for French. The quality gap reflects a training data imbalance rather than a structural limitation of the model\'s architecture.',
        isCorrect: false,
        feedbackText:
          'Training data volume is a real factor in translation quality, but it doesn\'t explain the *structural* nature of the disparity. A model with less Thai training data would produce lower-quality translations, but the specific failure pattern (meaning collapse during round-trip translation) points to a representation issue, not a data quantity issue. The question asks for the structural explanation, and tokenization granularity is the structural difference between how the model processes Thai vs. French text.',
      },
      {
        id: 'B',
        text:
          'Thai is a tonal language with context-dependent meanings, making it inherently more difficult for any translation system to handle. The round-trip error reflects the genuine linguistic complexity of Thai rather than a limitation specific to how AI models process text.',
        isCorrect: false,
        feedbackText:
          'Thai\'s linguistic complexity (tonal distinctions, context-dependent meanings) is real, but framing this as "inherent difficulty" obscures the mechanism. The model\'s difficulty with Thai is mostly about how the model represents Thai text internally, not about the language\'s complexity. A language that is tokenized into coarse chunks loses information at the representation level, before translation even begins. Latin-script languages receive finer-grained tokenization, which preserves more meaning at the token level.',
      },
      {
        id: 'C',
        text:
          'The AI model applied a different translation strategy for Thai (statistical phrase matching) than for French (neural machine translation) because it automatically selects the optimal method based on the language pair. The Thai strategy is older and less accurate.',
        isCorrect: false,
        feedbackText:
          'AI language models don\'t switch between "statistical phrase matching" and "neural machine translation" based on language pair. The model uses the same architecture (next-token prediction over a tokenized representation) for all languages. The quality difference comes from how the tokenizer handles different scripts, not from a choice between translation strategies.',
      },
      {
        id: 'D',
        text:
          'Thai script is tokenized into longer, less granular chunks than French or English text. Each Thai token may encompass multiple meaningful units that the model cannot decompose, causing meaning to shift or collapse during translation in ways that don\'t occur with Latin-script languages that receive finer-grained tokenization.',
        isCorrect: true,
        feedbackText:
          'Tokenization is the structural explanation. Most tokenizers are trained primarily on English and Latin-script languages, producing fine-grained tokens (often individual syllables or morphemes) for those languages. Non-Latin scripts, including Thai, Korean, and Chinese, are often tokenized into larger, less granular chunks. Each Thai token may span multiple meaningful units that would be separate tokens in English or French. During translation, this coarser tokenization means the model has fewer "handles" on meaning. It can\'t manipulate individual meaning units as precisely, so meaning shifts or collapses. The round-trip test exposes this: French→English→French preserves meaning because both languages have fine-grained tokenization; Thai→English→Thai loses meaning because Thai tokenization is too coarse to preserve the original structure.',
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
      'A team lead asks three colleagues to each use an AI tool for a different task, then report the results. Colleague A asked the tool to write a press release announcing a product launch; the output was polished and accurate. Colleague B asked the tool to verify whether a specific clause exists in their company\'s 200-page vendor agreement; the tool said yes, but the clause doesn\'t exist. Colleague C asked the tool to calculate the weighted average cost of capital using five financial inputs; the result was off by several percentage points. The team lead asks you: "Why did the tool work for A but fail for B and C?" Using the capability diagnosis framework from the program, which response is most accurate?',
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
          'Task A succeeded because it required generating plausible, well-structured text, which is what the model\'s architecture is optimized for. Task B failed because verifying a specific fact in a long document requires sustained attention across the full input and retrieval of a precise detail, stressing the model\'s context window. Task C failed because exact numerical computation conflicts with the model\'s token-based, probabilistic architecture.',
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
    stem: `A program coordinator uses an AI tool to draft a grant application for a workforce development initiative. The draft includes the following four claims. Using the verification priority framework from the program, which claim should be verified first?

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
          'Claim 2, because it cites a specific government report with a precise statistic. If the report doesn\'t exist or the 34% figure is fabricated, the grant application contains a falsified citation that could disqualify the proposal and damage the organization\'s credibility with the funder.',
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
      'A training coordinator asks an AI tool: "Help me with onboarding." The output is a generic checklist that could apply to any organization. Rather than abandoning the tool, she restructures her request. Which restructured prompt best demonstrates the Description competency from the program?',
    scenarioSummary:
      'A vague onboarding prompt produced a generic checklist. Four restructured prompts compete to demonstrate the Description competency.',
    options: [
      {
        id: 'A',
        text:
          '"Create a first-week onboarding schedule for a junior data analyst joining a 12-person analytics team at a financial services firm. Include: systems access setup on Day 1, introductions to the three team leads they\'ll work with, a shadow session with a senior analyst on Day 2 or 3, and a 30-minute check-in with their manager on Day 5. Format as a day-by-day table."',
        isCorrect: true,
        feedbackText:
          'This prompt demonstrates the Description competency: it specifies the role (junior data analyst), context (12-person team, financial services), concrete activities (systems access, team introductions, shadow session, manager check-in), timing constraints (Day 1, Day 2–3, Day 5), and output format (day-by-day table). Each specification narrows the model\'s output space toward a targeted, useful result. The model generates based on what the prompt tells it. More structural specification produces more relevant output.',
      },
      {
        id: 'B',
        text:
          '"Help me with onboarding. Be more specific and detailed. I need something actually useful, not a generic template. Make it thorough and comprehensive. Include everything a new hire would need."',
        isCorrect: false,
        feedbackText:
          'This prompt adds intensity, not information. "Be more specific" doesn\'t tell the model what to be specific about. "Include everything" is an unbounded instruction that produces breadth without relevance. The prompt still lacks structural specification (role, team context, format, constraints) that would narrow the output space.',
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
          '"Help me with onboarding for a data analyst. Make it specific to our company. Include first-week activities, team introductions, and system setup. Let me know if you need any other information to make this better."',
        isCorrect: false,
        feedbackText:
          'This is better than the original (it adds the role and some categories), but it still relies on the model to fill in specifics ("specific to our company" without saying what about the company matters). The closing "let me know if you need other information" defers specification to the model rather than providing it upfront. Compare that to option A, where every detail is in the prompt itself.',
      },
    ],
  },
];
