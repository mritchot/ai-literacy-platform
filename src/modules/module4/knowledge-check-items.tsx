// Module 4 knowledge check items (KC-4.1 → KC-4.4) — content from
// `module-4-content-document.md`, S4 (KC-4.1, KC-4.2) and S7 (KC-4.3,
// KC-4.4). Four options per item.

import type { KnowledgeCheckItemData } from '../../components/shared/KnowledgeCheck';

const KC_4_1: KnowledgeCheckItemData = {
  id: 'kc_4_1',
  objectiveRef: '4.1',
  stem: (
    <p className="m-0">
      A product manager is preparing a quarterly product review for her VP. The review includes
      four components: (1) pulling usage metrics from the analytics dashboard and formatting them
      into standardized charts, (2) writing a narrative explaining why two key metrics declined
      this quarter, (3) drafting three feature prioritization recommendations based on customer
      feedback themes she identified in last week’s user interviews, and (4) proofreading the
      final document for grammar and consistency. She plans to fully delegate all four components
      to AI and spend the time saved preparing for a different meeting. Based on what you
      practiced in the task decomposition exercise, which assessment of her plan is most accurate?
    </p>
  ),
  options: [
    {
      id: 'a',
      text: '“This is efficient delegation. All four components are production tasks with verifiable specifications. Component 1 pulls structured data from a known source: the metrics either match the dashboard or they don’t. Component 2 is a pattern the model handles well: explaining movement in quantitative data by identifying contributing factors. Component 3 synthesizes customer feedback into recommendations, which is a summarization task AI is strong at. Component 4 is straightforward proofreading. She’s making the right call by delegating everything and reallocating her time to a higher-value activity, since the time saved across four components is substantial, and each output is reviewable in a quick scan before submission.”',
      isPreferred: false,
      feedbackTitle: 'Misses the decomposition',
      feedbackTone: 'error',
      feedbackText:
        'Delegating all four components as a single block is exactly the pattern the task decomposition exercise was designed to prevent. Components 1 and 4 are deterministic tasks with clear outputs, reasonable delegation targets. Components 2 and 3 require contextual knowledge (product-specific causal reasoning, unrecorded interview insights) that the model does not have. The plan saves time on two components where time savings are safe, and introduces risk on two where the output depends on knowledge AI cannot access.',
    },
    {
      id: 'b',
      text: '“Components 1 and 4 are reasonable to delegate, but components 2 and 3 require different treatment. The metric decline narrative requires her interpretive judgment about why something happened in her specific product context. The model can describe what changed in the numbers, but it has no access to the team conversations, launch timing, or product decisions that explain why. The feature recommendations depend on customer interview insights the model has never seen. Those themes live in her notes and her memory, not in any source the AI can consult. Delegating these produces plausible-sounding output that lacks the contextual knowledge driving the VP’s decision. She should keep components 2 and 3 as human-only or AI-assisted, where she supplies the contextual reasoning and the AI helps with structure and language, and delegate 1 and 4 where the output is verifiable against a known source.”',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer applies the decomposition framework accurately: separating the task bundle into components with different reliability profiles, identifying the specific knowledge gaps that make components 2 and 3 inappropriate for full delegation (contextual interpretation, unrecorded interview data), and preserving delegation where it adds value (components 1 and 4). The reasoning mirrors the distinction the exercise established: delegation decisions are per-component, not per-deliverable.',
    },
    {
      id: 'c',
      text: '“She should keep all four components human-only. The quarterly review is a high-stakes deliverable going to her VP, the person who decides her performance rating and project funding. Any AI-generated content that sounds slightly off, uses a wrong figure, or mischaracterizes a customer insight reflects directly on her professional judgment. Components 1 and 4 might seem like safe delegation targets, but formatted charts still need contextual labeling decisions, and proofreading AI-generated text requires understanding the subject matter deeply enough to catch subtle errors in framing. The compound risk of four AI-generated components in a single deliverable is higher than the sum of individual component risks. She should invest the time to produce the review herself.”',
      isPreferred: false,
      feedbackTitle: 'Overcorrection',
      feedbackTone: 'error',
      feedbackText:
        'Component reliability determines delegation suitability, not stakeholder level. Formatting charts and proofreading are high-reliability tasks regardless of whether the deliverable goes to a VP or a peer. Refusing AI involvement on all components because the audience is senior wastes time on deterministic sub-tasks without improving quality on the components that actually need human judgment.',
    },
    {
      id: 'd',
      text: '“The plan is mostly fine, but she should move component 1 from fully delegated to AI-assisted. Pulling metrics from an analytics dashboard involves interpreting which metrics to include, which comparison periods to use, and how to label edge cases like incomplete quarters or revised figures. These are judgment calls that the model might handle differently than she would, and incorrect metrics in a VP-facing review would undermine the entire document’s credibility. Components 2 and 3 are stronger delegation targets: AI excels at narrative writing that explains quantitative trends, and synthesizing feedback themes from interviews is a pattern-recognition task well within the model’s capabilities. Component 4 is straightforward. She should delegate 2, 3, and 4, and keep component 1 as AI-assisted with her direct oversight.”',
      isPreferred: false,
      feedbackTitle: 'Inverts the risk',
      feedbackTone: 'error',
      feedbackText:
        'This answer correctly identifies component 1 as worth scrutiny but misidentifies components 2 and 3 as delegation-safe. Pulling standardized metrics from a dashboard is actually a well-specified retrieval task where AI’s output is verifiable (the numbers either match the dashboard or they don’t). Writing a causal narrative about metric decline and synthesizing interview insights are the high-judgment components, exactly the ones that should stay human-only or AI-assisted.',
    },
  ],
};

const KC_4_2: KnowledgeCheckItemData = {
  id: 'kc_4_2',
  objectiveRef: '4.2',
  stem: (
    <p className="m-0">
      A marketing coordinator asks an AI tool: “Write me some social media posts about our new
      product launch.” The output is a set of five generic, enthusiastic posts that could describe
      any product from any company. She’s frustrated and considers switching to a different AI
      tool. Based on the Description framework you just practiced, which response best identifies
      the core issue and the most effective fix?
    </p>
  ),
  options: [
    {
      id: 'a',
      text: '“The issue is the AI tool’s quality. A better model would infer from context that she needs brand-specific, audience-appropriate posts rather than generic copy. Some models are specifically fine-tuned for marketing content and are better at picking up on implicit requirements (the brand’s industry, the product category, the likely audience). More capable models maintain better internal representations of marketing conventions and can produce platform-appropriate content with less explicit guidance. She should try a purpose-built marketing AI tool that’s been trained on social media datasets and understands platform-specific formatting norms. The prompt itself is adequate; it clearly states the task and provides enough context for a capable model to infer the rest.”',
      isPreferred: false,
      feedbackTitle: 'Misattributes the problem',
      feedbackTone: 'error',
      feedbackText:
        'The output quality issue lies in the input’s specificity, not the model’s capability. A different model receiving the same underspecified prompt will produce a different set of generic posts, not a better set of targeted ones. The idea that a “better” tool would infer brand-specific requirements from a prompt that doesn’t contain them misunderstands the steerability principle from Module 3. The fix is in the Description, not the tool.',
    },
    {
      id: 'b',
      text: '“The issue is prompt length: she didn’t give the model enough to work with. A longer, more detailed prompt that describes the product’s features, the launch timeline, the competitive landscape, and the target audience demographics will produce better output because longer prompts give the model more context to draw on. She should add three to four additional sentences of background information: what the product does, who it’s for, why this launch matters relative to competitors, and what results the product has shown in beta testing. Each additional detail constrains the output space and makes the model more likely to generate relevant content. More input means more relevant output, and the additional time spent writing a thorough prompt pays for itself in output quality.”',
      isPreferred: false,
      feedbackTitle: 'Right direction, wrong framework',
      feedbackTone: 'caution',
      feedbackText:
        'Prompt length is correlated with output quality, but not because longer prompts are inherently better. What matters is which dimensions are specified, not how many words are used. A 200-word prompt that describes product features and competitive landscape in detail but omits audience, format, tone, and strategic approach will still produce misaligned output that is longer and more detailed but still generic. Length without structure is the Description equivalent of volume without signal. The three-dimensional framework (product, process, performance) organizes the specificity that matters.',
    },
    {
      id: 'c',
      text: '“The issue is that all three Description dimensions are underspecified. Product description: she didn’t specify format (character count, platform, number of posts per platform), audience (B2B decision-makers vs. end consumers), or tone (professional vs. conversational). Process description: she didn’t tell the model how to approach the task, whether to emphasize features, benefits, or social proof, or whether to vary the angle across posts. Performance description: she didn’t specify the voice the brand uses (her brand’s actual communication style versus generic marketing language), or specific terms and turns of phrase the brand uses consistently. The fix is specifying all three dimensions, not switching tools. Each dimension narrows the probability distribution the model selects from, and the generic output she received reflects three open dimensions multiplied together.”',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer diagnoses the problem using the three Description dimensions and identifies the specific gap in each. The product description omits format, audience, and tone constraints. The process description omits the strategic approach. The performance description omits the brand voice. Each underspecified dimension produces a corresponding gap in the output, and fixing all three together is what transforms a generic result into a usable one. The fix is structural, not cosmetic.',
    },
    {
      id: 'd',
      text: '“The issue is that AI tools aren’t reliable for creative marketing content. Social media posts require brand voice intuition, cultural awareness, and an understanding of audience dynamics that AI fundamentally can’t replicate. These are high-judgment tasks that depend on tacit knowledge about how real audiences respond, not deterministic formatting work. The generic output she received isn’t a prompt problem; it’s a capability boundary. Even a perfectly specified prompt can’t give the model the cultural fluency and audience instinct that a human marketer develops through experience. She should write the posts herself using her knowledge of the brand and audience, and reserve AI for tasks where it’s demonstrably more reliable: scheduling, analytics, A/B test analysis, and performance reporting.”',
      isPreferred: false,
      feedbackTitle: 'Categorical dismissal based on one data point',
      feedbackTone: 'error',
      feedbackText:
        'Social media copy is within AI’s reliable capability range when the task is well-specified: brand guidelines, audience profile, platform constraints, and tone requirements are all specifiable inputs that increase the model’s leverage on the task. Dismissing the entire category as a capability boundary based on one underspecified attempt forecloses a high-productivity-gain application. This is the pattern Module 2 documented: underuse driven by a single negative experience that was actually a Description failure, not a capability failure. The distinction matters; one is fixable in two minutes, and the other is not.',
    },
  ],
};

const KC_4_3: KnowledgeCheckItemData = {
  id: 'kc_4_3',
  objectiveRef: '4.3',
  stem: (
    <p className="m-0">
      A financial analyst used AI to draft a client-facing investment summary. One paragraph
      reads: “According to Morgan Stanley’s 2025 Global Outlook Report (Krishnamurthy & Oberg, pp.
      14–17), emerging market equities are projected to outperform developed market indices by
      3.2 percentage points over the next 18 months, driven primarily by favorable demographic
      trends in Southeast Asia and infrastructure spending in Sub-Saharan Africa.” The analyst
      plans to include this paragraph in a report going to a high-net-worth client tomorrow. Based
      on the verification framework you just practiced, which assessment is most accurate?
    </p>
  ),
  options: [
    {
      id: 'a',
      text: '“The paragraph is likely reliable. Morgan Stanley publishes an annual Global Outlook Report, the author names are plausible for a major bank’s research division, and the projection itself is consistent with current emerging market sentiment. The page numbers add credibility, since fabricated references rarely include specific page citations, and the level of detail here (percentage points, regional drivers, 18-month timeframe) is characteristic of a genuine research report rather than a vague AI-generated summary. The regional specificity (Southeast Asian demographics, Sub-Saharan African infrastructure) suggests the model drew on actual report content rather than generating generic emerging market commentary. A quick formatting check and confirmation that the report title exists is sufficient before including it in the client report.”',
      isPreferred: false,
      feedbackTitle: 'Dangerous misread of specificity indicators',
      feedbackTone: 'error',
      feedbackText:
        'The paragraph has every surface feature of credibility: a recognized institution, plausible authors, specific page numbers, a precise projection. That surface credibility is exactly what the NTP × Knowledge diagnostic pair produces. Page numbers do not add reliability; they add specificity to a fabricated reference, making it harder to dismiss on first reading. The model generates page numbers because citations in financial reports typically include them. It is pattern completion, not source retrieval.',
    },
    {
      id: 'b',
      text: '“The entire paragraph should be classified as fabricated and removed. AI tools cannot access proprietary research reports from investment banks, so any citation to a Morgan Stanley report is necessarily generated rather than retrieved. The projection, the author names, the page numbers, and the regional drivers are all pattern-completion output. The model assembled what a credible investment bank citation looks like based on the structure of financial research it has seen in training data. The specificity that makes the paragraph convincing is precisely what makes it dangerous: precise percentages, named authors, and page numbers create an illusion of sourcing that doesn’t exist. The analyst should delete the paragraph entirely and write the emerging market section from primary sources she has actually read, even if that means the section is shorter or less detailed.”',
      isPreferred: false,
      feedbackTitle: 'Correct instinct, slightly overcorrected',
      feedbackTone: 'caution',
      feedbackText:
        'The citation is almost certainly fabricated. Classifying it as fabricated and removing it is the safe professional response. The slight overcorrection is in dismissing the directional analytical content: the claim about emerging market outperformance might reflect genuine consensus even though the source is fake. But in a client-facing context, removing the entire paragraph and rebuilding from verified sources is the defensible choice.',
    },
    {
      id: 'c',
      text: '“The citation requires immediate verification, but the analytical content may be independently valuable. The specific reference (journal title, author names, page numbers, precise percentage) combines multiple specificity indicators, the pattern where fabrication concentrates: the model generated what a credible investment bank citation looks like, not a citation it retrieved from a real document. However, the directional claim about emerging market outperformance and the regional drivers could reflect genuine market consensus even if the specific source is fabricated. The analyst should verify the citation against Morgan Stanley’s published reports, and if it doesn’t exist, replace it with a verified source that supports the claim, or remove the claim entirely if no supporting source is found.”',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer applies the verification framework precisely: the citation triggers the NTP × Knowledge diagnostic pair (specific claims in the fabrication zone), which means it should be classified as fabricated until independently confirmed. But it also distinguishes between the fabricated citation and the analytical claim the citation supports, recognizing that directional market analysis can be valid even when the attributed source is generated. The recommended action is correct: verify the source, replace with a real one if confirmed, remove the claim if unsupported. This is calibrated Discernment: neither blanket trust nor blanket rejection.',
    },
    {
      id: 'd',
      text: '“The paragraph is uncertain and needs verification, but the risk is manageable given the timeline. The analyst should include the analytical content (the emerging market outperformance thesis and the regional drivers) but replace the specific Morgan Stanley citation with softer attribution, something like ‘based on available research projections’ or ‘consistent with current market consensus.’ This preserves the directional insight, which is the valuable part of the paragraph, while removing the specific citation that carries fabrication risk. If the client asks for the source, the analyst can locate a supporting reference at that point. Given that the report is due tomorrow, this balances verification rigor against the practical constraint of the deadline. Perfect verification of every claim isn’t always feasible in client-facing work.”',
      isPreferred: false,
      feedbackTitle: 'Concealment by another name',
      feedbackTone: 'error',
      feedbackText:
        'Replacing a specific citation with vague attribution does not solve the problem; it hides it. The client receives a projection without a verifiable source, which may trigger exactly the follow-up question the analyst is trying to avoid. More fundamentally, the approach treats verification as optional if time is short. In a client-facing financial document, time pressure does not reduce the verification obligation. It increases the consequence of getting it wrong. This is the opposite of the Diligence standard the next exercise will address.',
    },
  ],
};

const KC_4_4: KnowledgeCheckItemData = {
  id: 'kc_4_4',
  objectiveRef: '4.4',
  stem: (
    <p className="m-0">
      A project manager asked AI to draft a stakeholder update email for a software implementation
      that is three weeks behind schedule. His prompt specified the audience (executive sponsors),
      the tone (transparent but not alarmist), and the structure (current status, root causes,
      revised timeline, mitigation actions). The AI produced a draft that accurately covers all
      four sections, uses an appropriately measured tone, and is the right length. However,
      reading through it, the project manager notices that the “root causes” section attributes
      the delay entirely to “unforeseen technical complexity,” which is only partially true. The
      primary cause was a vendor delivering a key integration component two weeks late. The AI had
      no way to know this because the project manager didn’t include it in the prompt. Which next
      step best applies the Description-Discernment loop?
    </p>
  ),
  options: [
    {
      id: 'a',
      text: '“Manually edit the root causes section to include the vendor delay, then send the email. The rest of the draft is solid: product, process, and performance all align with the prompt. Manually correcting one factual gap is faster than reformulating and regenerating. Not every output issue requires a full refinement turn; sometimes a direct edit is the most efficient response.”',
      isPreferred: false,
      feedbackTitle: 'Efficient, but misses the dependency chain',
      feedbackTone: 'caution',
      feedbackText:
        'The manual edit fixes the root causes section, but the revised timeline and mitigation actions were generated based on the wrong root cause. If the delay is vendor-driven rather than complexity-driven, the mitigation plan should address vendor management (escalation protocols, contractual remedies, alternative suppliers) rather than technical de-risking (additional engineering resources, scope reduction). Manually editing one section without checking whether downstream sections depend on the same faulty premise leaves the email internally inconsistent. This is the dependency risk from the output verification scenario: conclusions inherit the reliability of their inputs.',
    },
    {
      id: 'b',
      text: '“Reformulate the prompt to include the vendor delay information, then regenerate the entire email. The root causes section affects everything downstream: the revised timeline and mitigation actions should reflect the actual cause of the delay, not the AI’s guess. Regenerating the full email ensures all four sections are internally consistent. The refinement prompt should add: ‘The primary delay was caused by the vendor delivering the integration component two weeks late. Technical complexity was a secondary factor. Adjust the root causes, revised timeline, and mitigation actions accordingly.’”',
      isPreferred: true,
      feedbackTitle: 'Best response',
      feedbackTone: 'success',
      feedbackText:
        'This answer identifies the core Description-Discernment loop decision: the root causes gap was a Description failure (the prompt omitted critical context the model needed), not a Discernment failure (the model didn’t produce something wrong from available information; it produced the most probable explanation given what it had). The correct refinement adds the missing context and regenerates all dependent sections to maintain internal consistency. The specific refinement language demonstrates the loop in action: evaluate the gap → trace it to a Description omission → reformulate with the missing information → regenerate to assess whether the revision resolves the downstream dependencies.',
    },
    {
      id: 'c',
      text: '“Ask the AI to self-evaluate the draft before making changes. Prompt it: ‘Review this email for accuracy and completeness. Are there any claims that seem unsupported or assumptions you made without source material?’ The model’s self-evaluation should identify the root causes gap on its own, since it can detect where it filled in assumptions rather than working from provided facts. Once the model flags the gap, the project manager can then provide the missing vendor delay context and ask for a targeted revision of just that section. This approach practices Discernment by leveraging the AI’s own analytical capability before committing to a full regeneration.”',
      isPreferred: false,
      feedbackTitle: 'Misapplies the model’s capabilities',
      feedbackTone: 'error',
      feedbackText:
        'Asking the model to self-evaluate for accuracy misunderstands source amnesia from Module 3: the model cannot distinguish information it generated from information it received. When prompted to “check for unsupported claims,” it will either affirm the existing output (sycophancy) or generate plausible-sounding caveats that may or may not correspond to actual gaps. The root cause gap exists because the model lacks the vendor delay information. Asking it to identify what it doesn’t know requires the exact capability it doesn’t have. Discernment is a human competency in this framework, not a task to delegate back to the model.',
    },
    {
      id: 'd',
      text: '“Discard the draft and write the email manually. If the AI produced an inaccurate root cause explanation, the entire output is unreliable, because the same knowledge gap that produced the wrong root cause may have produced subtly wrong mitigation actions or timeline assumptions. The safest approach is to treat any factual error as evidence that the output cannot be trusted and to draft the communication without AI assistance.”',
      isPreferred: false,
      feedbackTitle: 'Overcorrection from a single identifiable gap',
      feedbackTone: 'error',
      feedbackText:
        'The root cause inaccuracy is evidence that the prompt omitted information the model needed for one specific section, not that the entire output is unreliable. The tone, structure, and length all met the specification. The product, process, and performance Description dimensions were handled well. Discarding the entire draft because one section contained an input-dependent gap is the same categorical response that the output verification scenario’s Element 4 feedback addressed: blanket skepticism is as uncalibrated as blanket trust. The Description-Discernment loop exists precisely to handle outputs that are partially good. Refine the weak section rather than starting over.',
    },
  ],
};

export const MODULE_4_KC_ITEMS_S4: KnowledgeCheckItemData[] = [KC_4_1, KC_4_2];
export const MODULE_4_KC_ITEMS_S7: KnowledgeCheckItemData[] = [KC_4_3, KC_4_4];
