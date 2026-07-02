// Module 3 S10 knowledge check items (KC-3.1 → KC-3.4) — content from
// `module-3-content-document.md`, S10. Three response options per item
// (consistent with the content document) — comparable in length, with
// consequence-based feedback.

import type { KnowledgeCheckItemData } from '../../components/shared/KnowledgeCheck';

const KC_3_1: KnowledgeCheckItemData = {
  id: 'kc_3_1',
  objectiveRef: '3.1',
  stem: (
    <>
      <p className="m-0 mb-3">
        A colleague on your team uses an AI tool to translate a product description from English
        into Vietnamese for a regional launch. The English version is 200 words. The Vietnamese
        output reads fluently but contains several awkward phrasings and two factual errors that a
        native-speaking reviewer catches. Your colleague is frustrated: “It translated a similar
        document into French last week with no issues. Why is Vietnamese so much worse?”
      </p>
      <p className="m-0">
        Based on what you know about how language models process text, which explanation best
        accounts for the quality difference?
      </p>
    </>
  ),
  options: [
    {
      id: 'a',
      text: '“The model is probably trained on less Vietnamese data, so it has fewer patterns to draw from. That’s primarily a knowledge problem: the model’s internal representation of Vietnamese is thinner than its representation of French, which means its predictions in Vietnamese are built on a sparser statistical foundation. Your colleague should expect this quality gap to persist across similar documents and should budget additional review time for Vietnamese outputs. A different model with stronger multilingual training data might narrow the gap, but no model fully eliminates it.”',
      isPreferred: false,
      feedbackTitle: 'Partially right, incomplete mechanism',
      feedbackTone: 'caution',
      feedbackText:
        'This answer correctly identifies uneven training data coverage as a factor, but it treats the problem as purely a knowledge issue and misses the tokenization dimension. The quality difference is not just about how much Vietnamese the model “knows.” It is about how Vietnamese text is represented at the token level. Fewer tokens per concept in French means shorter sequences, cleaner prediction, and less working memory consumed. More tokens per concept in Vietnamese means the opposite. Understanding the tokenization mechanism changes the practical response: you would allocate more verification time for non-English outputs, not just accept that “the model knows less.”',
    },
    {
      id: 'b',
      text: '“Vietnamese text fragments into more tokens than French because Vietnamese characters were less frequent in the training data. More tokens means a longer sequence consuming more working memory, more token boundaries where errors can occur, and a thinner statistical foundation for each prediction. The quality difference is structural, not random, and it will recur on similar inputs. Your colleague should allocate more verification time for non-English outputs and consider having a native speaker review any customer-facing translation, regardless of how fluent the output appears.”',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer identifies the correct mechanical chain: tokenization asymmetry → longer sequences → more prediction surface area → higher error concentration. It names the structural nature of the problem (it will recur on similar inputs, not self-correct) and connects tokenization unevenness to both working memory consumption and prediction quality. This is the tokenization framework in action: explaining the mechanism, predicting when unexpected results will occur, and describing the systematic nature of the errors.',
    },
    {
      id: 'c',
      text: '“The model probably used a lower temperature setting for the French translation, which kept the output closer to high-probability patterns and produced more reliable results. For Vietnamese, the temperature was likely higher, introducing more variability and allowing less probable tokens into the output. Adjusting the temperature to a more conservative setting should narrow the quality gap. Your colleague should check whether the AI tool allows manual temperature control, and if so, set it lower for Vietnamese translations. The formatting quality confirms the model can handle the task; the issue is in the generation parameters.”',
      isPreferred: false,
      feedbackTitle: 'Misattributes the cause',
      feedbackTone: 'error',
      feedbackText:
        'Temperature affects output variability, but it is not the primary driver of quality differences between languages. Commercial AI tools typically set temperature automatically and do not adjust it per language. The quality gap between French and Vietnamese is a tokenization and training-data phenomenon. French text compresses more efficiently and draws on denser training patterns. Adjusting temperature would change the variability of the Vietnamese output, not its accuracy. This answer demonstrates a common misconception: attributing a structural limitation to a tunable parameter.',
    },
  ],
};

const KC_3_2: KnowledgeCheckItemData = {
  id: 'kc_3_2',
  objectiveRef: '3.2',
  stem: (
    <>
      <p className="m-0 mb-3">
        A marketing director uses an AI tool to draft a competitive analysis for a quarterly
        business review. The draft includes the following sentence: “According to Forrester’s
        Q3 2024 Digital Experience Index, our primary competitor’s customer satisfaction score
        declined 8.2% year-over-year, placing them in the bottom quartile of enterprise SaaS
        providers.”
      </p>
      <p className="m-0">
        The sentence is well-written and formatted exactly like a real analyst citation. The
        marketing director plans to include it in the presentation. Before she does, she asks you:
        “Does this look right to you?” What is the most useful response?
      </p>
    </>
  ),
  options: [
    {
      id: 'a',
      text: '“It looks professionally formatted, but every specific element in that sentence (the report name, the quarter, the percentage, the quartile ranking) needs to be verified against the actual Forrester report. The AI tool generates text that matches the pattern of an analyst citation, but the generation mechanism does not distinguish between a real finding and a plausible-sounding fabrication. Any or all of those specifics could be invented. The draft is useful as a starting structure, but she should treat every factual claim as unverified until she checks it against the source.”',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer applies the generation-retrieval distinction directly: the model generated tokens that satisfy the pattern of an analyst citation, but satisfying the pattern and stating a fact are independent outcomes. It correctly identifies that every specific element sits in the fabrication zone where independent verification is required. Crucially, it does not recommend deleting the output. It recommends verifying it. The AI draft may accelerate the workflow even if every specific needs checking. This is Discernment applied: evaluate the output against the mechanism that produced it.',
    },
    {
      id: 'b',
      text: '“It looks fine. Forrester’s Digital Experience Index is a well-known report, and 8.2% is a plausible year-over-year decline for a competitor in the current market environment. AI tools are generally reliable when citing major industry analysts because those sources appear frequently in training data, which gives the model dense, well-calibrated patterns to draw from. I’d recommend double-checking the quartile ranking since that’s a more specific claim, but the report name and percentage are likely accurate. She should feel confident including it with that one verification step.”',
      isPreferred: false,
      feedbackTitle: 'Dangerous overconfidence',
      feedbackTone: 'error',
      feedbackText:
        'This answer assumes that frequently cited sources produce reliable outputs. That assumption inverts the mechanism. The model generates citation-shaped text because citation patterns are common in its training data, but common patterns make the *format* reliable rather than the *content*. “Forrester’s Digital Experience Index” sounds real because the model has seen many citation patterns involving Forrester. Whether this specific report exists, whether it covers Q3 2024, whether the 8.2% figure is real: those are questions the generation mechanism cannot answer. Plausibility and accuracy are different things. In a quarterly business review, a fabricated competitor statistic attributed to a real analyst firm could cause significant reputational damage.',
    },
    {
      id: 'c',
      text: '“I’d be cautious. AI tools sometimes fabricate citations entirely, and presenting a fabricated Forrester statistic in a quarterly business review would be a serious credibility risk. She should delete the sentence and write it herself using the actual Forrester data, since you cannot reliably distinguish real AI-generated citations from fabricated ones without checking every element. The time saved by using the AI draft is not worth the reputational risk if even one specific turns out to be invented. Better to draft competitor analysis sections manually.”',
      isPreferred: false,
      feedbackTitle: 'Overcorrection',
      feedbackTone: 'caution',
      feedbackText:
        'This answer correctly identifies the fabrication risk but overcorrects by discarding the output entirely. The AI-generated draft may contain useful structure, framing, and analysis that accelerates the marketing director’s work, even if the specific citation needs replacement. Treating all AI output as unusable because some elements may be fabricated is as miscalibrated as treating all AI output as reliable. The appropriate response is targeted verification of specific claims, not wholesale rejection.',
    },
  ],
};

const KC_3_3: KnowledgeCheckItemData = {
  id: 'kc_3_3',
  objectiveRef: '3.3',
  stem: (
    <>
      <p className="m-0 mb-3">
        You manage a small operations team. Three team members each used AI tools for different
        tasks last week and reported problems:
      </p>
      <ol className="m-0 mb-3 ml-5 list-decimal space-y-2 text-body">
        <li>
          Asked an AI tool to calculate cost-per-unit across 14 product lines. Several calculations
          were wrong: products with five-digit unit costs were calculated incorrectly while
          three-digit costs were fine.
        </li>
        <li>
          Asked an AI tool to summarize a 35-page supplier compliance audit. The summary covered
          sections 1–8 thoroughly but missed two non-conformances documented in sections 12–13.
        </li>
        <li>
          Asked an AI tool to draft a memo citing three specific industry standards by their exact
          document numbers. Two of the three numbers looked correct in format but referenced
          standards that do not exist.
        </li>
      </ol>
      <p className="m-0">
        Which analysis correctly identifies the mechanical root cause of each failure?
      </p>
    </>
  ),
  options: [
    {
      id: 'a',
      text: '“All three failures are knowledge problems. The model didn’t have enough training data about unit costs, compliance audit structures, or the specific ISO standards referenced. More training data, or a model fine-tuned on operations and compliance content, would address all three. Your team should evaluate whether a specialized model is available, and in the meantime cross-reference all AI outputs against existing documentation rather than relying on the model’s general knowledge base.”',
      isPreferred: false,
      feedbackTitle: 'Single-cause explanation for three different mechanisms',
      feedbackTone: 'error',
      feedbackText:
        'This answer collapses three distinct failure modes into one explanation. The calculation errors are not caused by insufficient training data about unit costs; they are caused by tokenization splitting multi-digit numbers at arbitrary boundaries. The missed audit sections are not caused by insufficient compliance knowledge; they are caused by context window limitations and the lost-in-the-middle effect. The fabricated standards are a specificity failure where the model generates plausible patterns, not a gap in standards knowledge. Treating all AI failures as knowledge problems leads to a single fix (“use a better model”) that does not address the actual mechanisms and misses the targeted responses that would work.',
    },
    {
      id: 'b',
      text: '“Member 1 hit a boundary task failure: token boundaries misaligned with the mathematical structure of larger numbers, causing five-digit calculations to fail where three-digit ones succeeded. Member 2 hit a volume task failure: the middle sections of a 35-page document fell in the attention valley of the context window, causing sections 12 and 13 to be underprocessed. Member 3 hit a specificity task failure: the model generated standard-number-shaped text from its probability distribution without retrieving actual document numbers. Each failure has a different root cause and requires a different fix.”',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer correctly maps each failure to its mechanical root cause and uses the three unreliable task categories established in this module. Member 1: tokenization fragments numbers inconsistently, so multi-digit calculations fail where shorter ones succeed, which is a boundary task. Member 2: a 35-page document fits inside the window, but sections 12–13 fall in the middle where attention is weakest. That is a volume task driven by the lost-in-the-middle effect. Member 3: ISO standard numbers are specific identifiers that the model generates by pattern rather than retrieval, which is a specificity task. Each diagnosis points to a different fix: offload computation to code, break long documents into sections, and verify every specific identifier independently.',
    },
    {
      id: 'c',
      text: '“Member 1 should have used a lower temperature to get more consistent calculations. Member 2 should have used a model with a larger context window so the full 35 pages could be processed. Member 3 should have included an explicit instruction asking the model to verify its citations against a standards database before returning results. Each failure has a clear user-side fix that does not require understanding the model’s internals.”',
      isPreferred: false,
      feedbackTitle: 'Fixes without diagnosis',
      feedbackTone: 'caution',
      feedbackText:
        'This answer proposes reasonable-sounding fixes but skips the diagnostic step. Lower temperature does not fix arithmetic errors; tokenization boundaries are the root cause, and temperature does not change how numbers are tokenized. A larger context window would help with Member 2’s problem, but the answer treats it as the complete solution without addressing the lost-in-the-middle effect, which persists even in larger windows. Asking the model to “double-check its citations” is unreliable. The same mechanism that generated the fabricated standard numbers would generate the “verification,” potentially confirming its own fabrication. Diagnose first, then fix; the order matters.',
    },
  ],
};

const KC_3_4: KnowledgeCheckItemData = {
  id: 'kc_3_4',
  objectiveRef: '3.4',
  stem: (
    <>
      <p className="m-0 mb-3">
        A product manager uses an AI tool to help prepare for a strategy meeting. She provides a
        detailed brief (her team’s product roadmap, three competitor analyses, and a market
        sizing report) and asks the tool to “identify the three biggest strategic risks we should
        discuss.” The total input is approximately 180,000 tokens. The model’s context window is
        200,000 tokens.
      </p>
      <p className="m-0 mb-3">
        The AI output lists three risks. Risk 1 and Risk 2 are insightful and well-supported by the
        input documents. Risk 3 reads: <em>“Increasing regulatory scrutiny of AI-powered features
        in consumer products, particularly in the EU, poses a compliance risk to the product
        roadmap. Recent enforcement actions under the EU AI Act suggest accelerating timelines for
        conformity assessments.”</em> The product manager’s brief does not mention the EU AI Act,
        regulatory scrutiny, or compliance requirements.
      </p>
      <p className="m-0">Which analysis best explains what happened with Risk 3?</p>
    </>
  ),
  options: [
    {
      id: 'a',
      text: '“The model drew on its general knowledge of the EU AI Act from training data to supplement the input documents. This is an expected behavior: when asked for strategic risks, the model combines input-specific analysis with its broader understanding of the industry landscape. The EU AI Act is a well-documented regulatory development, so the model’s knowledge base likely contains accurate information about enforcement timelines and conformity requirements. She should verify the specific regulatory details but should keep the risk in her presentation.”',
      isPreferred: false,
      feedbackTitle: 'Treats generated content as supplementary knowledge',
      feedbackTone: 'error',
      feedbackText:
        'This answer assumes the model deliberately chose to augment the brief with external knowledge, a framing that implies intentional reasoning. The model does not decide to supplement input documents. It generates the most statistically probable tokens at each position, drawing on whatever patterns are available. When the input documents ran thin on a third risk, the model drew on training-data patterns about AI strategy, and those patterns produced EU AI Act references because that topic frequently co-occurs with “AI product risk” in the training data. The regulatory details may or may not be accurate, but they were not sourced from a verified reference. Presenting them as if they were supported by the team’s analysis would misrepresent both the source and the reliability of the claim.',
    },
    {
      id: 'b',
      text: '“The model was asked for three risks and could only identify two that were well-supported by the input documents. Rather than returning two risks and explaining that the third was weaker, the model generated a third to fulfill the instruction. This is a steerability pattern where format compliance overrides content accuracy. The regulatory content is not drawn from her brief; it is the model’s attempt to complete the requested list with plausible material. She should delete risk 3 and present only two risks.”',
      isPreferred: false,
      feedbackTitle: 'Correct intuition, incomplete mechanism',
      feedbackTone: 'caution',
      feedbackText:
        'This answer correctly identifies that format compliance drove the model to produce a third risk even when only two were well-supported, a real steerability pattern. But it oversimplifies by calling risk 3 filler. The regulatory content is not random noise; it is a statistically probable pattern that the model generated because EU AI Act references frequently co-occur with AI product risk discussions in the training data. The content may even be partially accurate. The problem is not that risk 3 is empty; it is that risk 3 is generated from a different source (training patterns) than risks 1 and 2 (the supplied brief), and the output does not signal this difference. Deleting risk 3 is a reasonable action, but the reasoning should be “this risk is not grounded in our analysis” rather than “this is filler.”',
    },
    {
      id: 'c',
      text: '“The input consumed approximately 180,000 of the model’s 200,000-token context window, leaving limited room for generation. The model processed the brief’s content unevenly: risks 1 and 2 drew on material that was well-represented in the context, while risk 3 was generated primarily from training-data patterns about AI product strategy rather than from the supplied documents. The regulatory specifics (the EU AI Act, enforcement actions, conformity assessments) are specificity-zone claims generated by probability, not retrieved from either the brief or a verified source. She should not present risk 3 as supported by her team’s analysis.”',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer identifies the compound failure correctly. The input nearly filled the context window (180,000 of 200,000 tokens), which constrained the generation space and likely reduced attention quality on parts of the input. Risks 1 and 2 drew on well-represented material; risk 3 shifted to training-data patterns when the input ran thin. The regulatory specifics (the EU AI Act, enforcement actions, conformity assessments) are specificity-zone claims: precise-sounding, plausible, and generated by probability rather than retrieved from a source. The analysis correctly advises against presenting risk 3 as supported by the team’s analysis. That is the diagnostic skill the module builds toward: determining that a specific output sits outside the model’s reliable capability range for this input and task.',
    },
  ],
};

export const MODULE_3_KC_ITEMS: KnowledgeCheckItemData[] = [KC_3_1, KC_3_2, KC_3_3, KC_3_4];
