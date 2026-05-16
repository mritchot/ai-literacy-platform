// Module 4 pre-written content — scenarios, AI outputs, feedback text,
// and exemplars (4B spec §2). All content here is authored instructional
// material, not research data; lives in the module directory rather than
// `src/data/` (which is reserved for JSON research data with provenance).

// ─── P8: Task Decomposition ───────────────────────────────────────

export type P8Category = 'human' | 'assisted' | 'delegated';

interface TaskCardFeedback {
  title: string;
  text: string;
  tone: 'success' | 'caution' | 'error';
}

export interface TaskCard {
  id: string;
  title: string;
  description: string;
  intendedCategory: P8Category;
  feedback: Record<P8Category, TaskCardFeedback>;
}

export const P8_SCENARIO = `Your task: You are a senior analyst at a mid-size professional services firm. Your managing director has asked you to produce a competitive landscape briefing for a prospective client meeting in 48 hours. The briefing must include: a summary of five competitor organizations (revenue, headcount, recent strategic moves), an analysis of how the prospect's market position compares, a set of three strategic recommendations tailored to the prospect's specific situation, and an executive summary suitable for the managing director to present directly.

You have access to an AI tool. You have 48 hours. Decide how to allocate each component.`;

export const P8_CARDS: TaskCard[] = [
  {
    id: 'card_1',
    title: 'Competitor data compilation',
    description:
      'Gather publicly available information on five named competitors: revenue figures, headcount, recent press releases, and leadership changes from the past 12 months.',
    intendedCategory: 'delegated',
    feedback: {
      delegated: {
        title: 'Efficient, given that verification is a separate step.',
        text: 'Compiling publicly available information on named entities is a task AI handles reliably for well-known organizations, and the output structure (company name, revenue, headcount) is straightforward. But reliable is not the same as infallible. The compiled data has not been verified, and the scenario\'s stakes (a managing director presenting to a prospect\'s leadership) mean errors carry real consequences. Full delegation works here specifically because you have decomposed verification into its own component. If compilation and verification were bundled as a single task, this would be AI-Assisted, not Fully Delegated.',
        tone: 'success',
      },
      assisted: {
        title: 'Workable but inefficient.',
        text: 'Actively shaping the compilation adds time to a task where AI’s output is typically reliable for well-known entities. The AI-assisted approach makes more sense for the analysis of this data than the gathering of it. You’ve allocated human judgment to a step that doesn’t require it yet.',
        tone: 'caution',
      },
      human: {
        title: 'Time cost with no quality gain.',
        text: 'Manual competitor research on publicly available data takes 2–3 hours per company. AI handles this category reliably; these are well-documented entities with extensive web presence. Reserving human effort for this step means less time available for the components that actually require your judgment.',
        tone: 'error',
      },
    },
  },
  {
    id: 'card_2',
    title: 'Competitor data verification',
    description:
      'Cross-check every revenue figure, headcount number, and factual claim in the compiled competitor profiles against primary sources (annual reports, SEC filings, verified press coverage).',
    intendedCategory: 'human',
    feedback: {
      human: {
        title: 'Critical judgment call.',
        text: 'Revenue figures, headcount, and factual claims fall squarely in the specificity task category, the zone where fabrication concentrates. The model generates what plausible data looks like; it cannot verify whether the numbers are real. Cross-checking against primary sources requires human access to databases, filings, and institutional knowledge about which sources are authoritative in your industry. This step protects the entire deliverable.',
        tone: 'success',
      },
      assisted: {
        title: 'Risky hybrid.',
        text: 'You’ve asked AI to assist with verification, but the tool has no mechanism to distinguish a real revenue figure from a plausible one. That is the core limitation of next-token prediction applied to specific factual claims. If the AI “confirms” a number by finding a pattern match in its training data, you may mistake pattern recognition for verification.',
        tone: 'caution',
      },
      delegated: {
        title: 'This is how fabricated data reaches clients.',
        text: 'AI cannot verify factual claims against primary sources. It can generate text that looks like verification (for example, “According to the 2024 annual report…”) while referencing a document it has never accessed. A revenue figure presented to the prospect’s leadership as verified, when it was generated rather than checked, is a professional liability. This is the specificity task failure from Module 3, appearing in a live deliverable context.',
        tone: 'error',
      },
    },
  },
  {
    id: 'card_3',
    title: 'Comparative market analysis',
    description:
      'Analyze how the prospect’s market position, pricing strategy, and service mix compare to the five competitors, looking for gaps, overlaps, and differentiation opportunities.',
    intendedCategory: 'assisted',
    feedback: {
      assisted: {
        title: 'Well-calibrated.',
        text: 'Comparative analysis benefits from AI’s pattern-recognition strengths (identifying structural similarities, organizing dimensions of comparison) while requiring your market knowledge to weight the comparisons correctly. AI can produce the analytical structure; you determine which comparisons matter for this specific prospect. This is augmentation: the human does the substantive intellectual work with AI assistance.',
        tone: 'success',
      },
      delegated: {
        title: 'Structure without substance.',
        text: 'AI can produce a competent-looking comparison matrix, but it cannot determine which competitive dimensions matter to this specific prospect. A fully delegated analysis treats all dimensions as equally relevant, which produces a generic output the managing director cannot present as tailored insight. Format compliance without content accuracy: the steerability gap from Module 3, applied to analytical work.',
        tone: 'caution',
      },
      human: {
        title: 'Unnecessary bottleneck.',
        text: 'Building the comparison structure from scratch takes time that AI handles well. The judgment is in the weighting and interpretation, not the structural assembly. Keeping the entire analysis human-only creates the bottleneck effect from Module 2: time spent on structure that could have gone to strategic thinking.',
        tone: 'error',
      },
    },
  },
  {
    id: 'card_4',
    title: 'Strategic recommendations',
    description:
      'Develop three tailored recommendations for the prospect based on the competitive analysis, accounting for their specific organizational context, leadership priorities, and recent board-level decisions you discussed in your initial meeting.',
    intendedCategory: 'human',
    feedback: {
      human: {
        title: 'This is the work AI cannot do.',
        text: 'Tailored strategic recommendations depend on context the model does not have: your initial meeting with the prospect, their leadership dynamics, board-level priorities, and institutional factors that don’t appear in public data. This is where your professional judgment creates the value the client is paying for. Delegating this component delegates the deliverable’s core intellectual contribution.',
        tone: 'success',
      },
      assisted: {
        title: 'Proceed with caution.',
        text: 'AI can generate plausible-sounding strategic recommendations, but they will be pattern-matched from its training data: generic best practices rather than insights tied to this prospect’s specific situation. If you use AI to brainstorm starting points and then substantially reshape every recommendation using your meeting notes and relationship knowledge, this is defensible. If you use AI’s recommendations as a starting draft and make minor edits, you’ve effectively delegated the deliverable’s most important section.',
        tone: 'caution',
      },
      delegated: {
        title: 'The deliverable is now generic.',
        text: 'The managing director presents recommendations that sound professionally formatted but contain no insight the prospect couldn’t have generated themselves. The recommendations reference “industry best practices” and “market positioning opportunities,” language that applies to every company in the sector. The prospect notices. The managing director asks where the tailored analysis went. This is the component that justified the engagement; it was the one piece that required human judgment.',
        tone: 'error',
      },
    },
  },
  {
    id: 'card_5',
    title: 'Executive summary draft',
    description:
      'Write a one-page executive summary of the briefing that the managing director can present directly to the prospect’s leadership team.',
    intendedCategory: 'assisted',
    feedback: {
      assisted: {
        title: 'Good delegation boundary.',
        text: 'AI excels at synthesizing existing content into a concise format. This is a high-reliability task once the source material is verified and complete. The key word is “draft”: the summary compresses your analysis, your verified data, and your recommendations into presentation-ready form. You review the draft to confirm it emphasizes the right points for this audience. The AI accelerates the writing; you own the editorial judgment.',
        tone: 'success',
      },
      delegated: {
        title: 'Risky sequencing.',
        text: 'A fully delegated executive summary inherits the quality of everything upstream. If the data was verified and the recommendations were human-generated, the summary is likely reliable. If any upstream component was also fully delegated, errors compound: the summary may present an unverified revenue figure alongside a generic recommendation, wrapped in confident executive language. The summary is the last quality gate before the managing director’s presentation.',
        tone: 'caution',
      },
      human: {
        title: 'Reasonable but slow.',
        text: 'Writing the summary yourself guarantees you’ve processed every section, which has verification value. The tradeoff is time: 30–45 minutes for a task AI handles in 2 minutes. If you’ve already verified the inputs, the manual effort duplicates cognitive work you’ve already done.',
        tone: 'caution',
      },
    },
  },
  {
    id: 'card_6',
    title: 'Formatting and layout',
    description:
      'Apply the firm’s branded template to the final document: consistent headings, page numbers, charts formatted to house style, and a professional cover page.',
    intendedCategory: 'delegated',
    feedback: {
      delegated: {
        title: 'Appropriate delegation.',
        text: 'Template application, heading consistency, chart formatting, and cover pages are deterministic tasks with clear specifications. AI handles these reliably because the output requirements are fully specified, and there is no ambiguity about what “correct” looks like. Low verification burden, high time savings.',
        tone: 'success',
      },
      assisted: {
        title: 'Overinvestment.',
        text: 'Actively shaping the formatting output adds human time to a task that rarely produces errors when specifications are clear. Your judgment is better allocated to content quality.',
        tone: 'caution',
      },
      human: {
        title: 'Time spent on the wrong task.',
        text: 'Manual formatting is the canonical example of the bottleneck effect: if AI handles formatting in minutes, spending an hour on it means one fewer hour for the analysis and recommendations that define the deliverable’s value.',
        tone: 'error',
      },
    },
  },
];

export const P8_SUMMARY = `Decomposition pattern:

The task you just decomposed had six components spanning three reliability levels. Two were appropriate for full delegation (data compilation, formatting): deterministic tasks with clear specifications and low verification burden. Two required active human-AI collaboration (comparative analysis, executive summary): AI provides structural acceleration and you provide evaluative judgment. Two required human-only execution (data verification, strategic recommendations): the model lacks access to the ground truth or the relationship context that makes the output valuable.

This is the Delegation competency in practice. It is a component-level assessment of where the tool adds value and where it introduces risk, not a single decision about whether to "use AI." The decomposition you just performed is the first step in every AI-assisted work cycle that follows in this module.`;

export const P8_REFLECTION = `Think about a deliverable you produce regularly in your current role. Without naming it, mentally list its components: the sub-tasks that go into producing it. Which components would you assign to each of the three categories? Where is the boundary between "AI-assisted" and "fully delegated" least clear? One or two sentences.`;

// ─── P9: Prompt Reformulation ─────────────────────────────────────

export const P9_SCENARIO = `Scenario: A compliance manager needs to brief her team on how new AI-related regulatory guidance affects their current vendor review process. She opens an AI tool and types:`;

export const P9_WEAK_PROMPT = `"Summarize the new AI regulations and how they affect our vendor reviews."`;

export const P9_WEAK_OUTPUT = `Recent AI regulations have introduced several important changes that organizations should be aware of when conducting vendor reviews. Key regulatory developments include:

**Data Protection:** New requirements mandate that organizations assess how AI vendors handle personal data, including data storage, processing, and cross-border transfers. Companies should ensure vendors comply with applicable data protection frameworks.

**Transparency Requirements:** Regulations increasingly require organizations to understand and document how AI systems make decisions. Vendor reviews should include assessment of model explainability and documentation practices.

**Risk Assessment:** Several regulatory bodies now require formal AI risk assessments before deployment. Organizations should incorporate AI-specific risk criteria into their existing vendor evaluation frameworks.

**Accountability:** New guidance emphasizes organizational accountability for AI outputs, even when generated by third-party systems. Vendor contracts should clearly define liability and responsibility boundaries.

These developments represent a significant shift in the regulatory landscape. Organizations that proactively integrate AI governance into their vendor review processes will be better positioned to manage compliance risks and maintain stakeholder trust.

It is recommended that compliance teams work closely with legal counsel to review existing vendor agreements and update evaluation criteria accordingly.`;

interface P9Annotation {
  label: string;
  text: string;
}

export const P9_ANNOTATIONS: P9Annotation[] = [
  {
    label: 'Product description gap',
    text: 'This output is addressed to no one in particular. It reads like a generic article, not a team briefing. The compliance manager needed content calibrated to her team’s existing knowledge and formatted for a specific meeting context. The prompt didn’t specify the audience, the format, or the level of detail, so the model defaulted to its most probable response pattern: a general-audience summary.',
  },
  {
    label: 'Process description gap',
    text: 'The output lists categories but doesn’t connect them to the team’s actual vendor review process. The compliance manager has a specific workflow (intake forms, evaluation criteria, scoring rubrics) and none of it appears here because the prompt didn’t tell the model how to approach the task. Without process constraints, the model produces a generic framework rather than mapping to the existing one.',
  },
  {
    label: 'Performance description gap',
    text: 'The tone is cautious and bureaucratic ("it is recommended," "organizations should"). The compliance manager needed actionable, direct language her team can act on this week, not hedge-heavy advisory prose. The model defaulted to its most statistically probable register for regulatory content: formal, impersonal, and non-committal.',
  },
];

export const P9_REFORMULATED_PROMPT = `"I'm briefing my compliance team (6 people, all experienced in vendor review but new to AI-specific regulation) on how the EU AI Act's transparency and risk-classification requirements change our current vendor evaluation process. We use a 30-point scoring rubric organized by data handling, operational risk, and contractual terms. Write a 400-word briefing memo (not a general summary) that maps the three most relevant regulatory changes directly to specific sections of our existing rubric, identifies which evaluation criteria need to be added or modified, and flags two vendor categories that will require re-review within 90 days. Use direct, action-oriented language. Skip the 'it is recommended' phrasing; just tell the team what to do and by when."`;

export const P9_IMPROVED_OUTPUT = `**Team Briefing: EU AI Act Impact on Vendor Review Process**

Three changes in the EU AI Act directly affect how we score vendors on the 30-point rubric. Here's what shifts and what you need to do.

**1. Transparency documentation → Rubric Section 2 (Operational Risk), Criteria 2.3–2.5**

High-risk AI vendors must now provide technical documentation covering training data sources, model performance metrics, and known limitations. Our current criteria 2.3 ("vendor provides system documentation") is too broad. Replace it with two scored items: (a) vendor supplies a model card or equivalent technical summary, and (b) vendor discloses training data provenance for any system processing personal data. Add both to the rubric by end of this month.

**2. Risk classification → New Rubric Section (add as Section 4: AI Risk Tier)**

The Act classifies AI systems into four risk tiers. Any vendor deploying a system classified as "high-risk" triggers mandatory conformity assessment and human oversight requirements. Add a new scoring section: AI Risk Tier Assessment, with three criteria covering the vendor's self-classification, supporting evidence, and conformity documentation. Score on a 1–5 scale consistent with existing sections.

**3. Accountability provisions → Rubric Section 3 (Contractual Terms), Criteria 3.1 and 3.6**

Deploying organizations bear accountability for AI outputs even when generated by third-party systems. Update criterion 3.1 (liability allocation) to explicitly address AI-generated outputs, and add a new criterion 3.6 requiring vendors to provide incident-response protocols for AI system failures.

**Immediate action: re-review two vendor categories**

1. **Data analytics vendors** (4 active contracts): most likely to fall under high-risk classification due to automated decision-making on personal data. Begin re-review this week.
2. **Customer-facing chatbot vendors** (2 active contracts): transparency documentation requirements apply immediately. Request model cards from both vendors by Friday.

I'll distribute updated rubric templates by Wednesday. Flag questions before then.`;

export const P9_REFLECTION = `Compare the two outputs. Of the three Description dimensions (product, process, performance), which made the biggest difference in this case? Now look at your own reformulation above. Which dimension did you specify most clearly, and which would you strengthen if you rewrote it? One or two sentences.`;

// ─── P10: Output Verification ─────────────────────────────────────

export type Classification = 'include' | 'verify' | 'flag';

interface VerificationFeedback {
  title: string;
  text: string;
  tone: 'success' | 'caution' | 'error';
}

export interface VerificationElement {
  id: string;
  marker: number;
  highlightedText: string;
  intendedClassification: Classification;
  diagnosticPair?: string;
  feedback: Record<Classification, VerificationFeedback>;
}

export const P10_SCENARIO = `Your situation: You are a senior operations analyst. Your director asked you to use AI to draft a two-page internal briefing on how three competitor firms are applying AI to supply chain operations: what they've announced, what results they've reported, and what your organization should consider in response. You delegated the drafting to AI with a well-specified prompt (audience, format, constraints). The output arrived looking polished and professional. Your director plans to circulate it to the leadership team tomorrow morning.

Before you send it forward, you need to verify the output. Below is the AI-generated briefing. Read it, then evaluate each flagged element.`;

// The briefing renders as paragraphs with six embedded highlight markers.
// Each segment of `P10_BRIEFING_SEGMENTS` is either plain text (`marker:
// undefined`) or highlighted text tied to the matching VerificationElement
// (`marker: N`).
interface BriefingSegment {
  text: string;
  marker?: number;
  newParagraph?: boolean; // when true, render a paragraph break before this segment
  heading?: string; // when set, render a heading line before this segment
}

export const P10_BRIEFING_SEGMENTS: BriefingSegment[] = [
  { heading: '1. Meridian Logistics Group', text: '', newParagraph: true },
  {
    text: 'Meridian announced its AI-powered demand forecasting platform in Q2 2025, ',
    newParagraph: true,
  },
  { text: 'reporting a 34% reduction in inventory carrying costs', marker: 2 },
  {
    text: ' across its North American distribution network within the first six months of deployment. The system integrates real-time point-of-sale data with weather and macroeconomic indicators. ',
  },
  {
    text: 'According to a case study published in the Harvard Business Review (Chen & Walters, 2025)',
    marker: 1,
  },
  {
    text: ', Meridian’s approach is notable for its phased rollout strategy, which limited initial deployment to three regional warehouses before scaling to the full network. ',
  },
  { text: 'The company currently processes approximately 2.1 million SKU-level forecasts per week.', marker: 5 },

  { heading: '2. Praxon Industrial Solutions', text: '', newParagraph: true },
  {
    text: 'Praxon has taken a different approach, focusing on AI-driven supplier risk assessment. Their platform, launched in late 2024, monitors over 4,800 tier-1 and tier-2 suppliers across 23 countries for financial stability, geopolitical exposure, and ESG compliance indicators. In its 2025 annual report, Praxon disclosed that the system identified 17 critical supplier risks in its first year of operation, three of which would have resulted in production line disruptions without advance warning. ',
    newParagraph: true,
  },
  {
    text: 'Praxon’s CFO stated in a February 2025 earnings call that the platform "has fundamentally changed how we think about procurement resilience"',
    marker: 3,
  },
  {
    text: ' and contributed to a 12% reduction in supply disruption costs.',
  },

  { heading: '3. Cascade Systems International', text: '', newParagraph: true },
  {
    text: 'Cascade has focused on AI-assisted logistics routing. Its optimization engine, deployed across its European and Southeast Asian networks, adjusts delivery routes in real time based on traffic conditions, fuel costs, and customs processing times. ',
    newParagraph: true,
  },
  {
    text: 'Cascade reported an 18% reduction in average delivery times and a 23% decrease in fuel expenditure per shipment in a press release issued in March 2025, though independent verification of these figures has not been published.',
    marker: 4,
  },
  {
    text: ' The company noted that results vary significantly by region, with European routes showing stronger improvements than Southeast Asian routes, where infrastructure variability remains a constraint.',
  },

  { heading: 'Recommended Actions', text: '', newParagraph: true },
  {
    text: 'Based on this competitive landscape, three actions merit consideration: (1) initiate a pilot demand forecasting program modeled on Meridian’s phased approach, beginning with a single distribution region; (2) evaluate our current supplier monitoring against Praxon’s 4,800-supplier benchmark; and (3) commission a feasibility study on AI-assisted routing for our domestic logistics network.',
    marker: 6,
    newParagraph: true,
  },
];

export const P10_ELEMENTS: VerificationElement[] = [
  {
    id: 'element_1',
    marker: 1,
    highlightedText: 'According to a case study published in the Harvard Business Review (Chen & Walters, 2025)',
    intendedClassification: 'flag',
    diagnosticPair: 'NTP × Knowledge: compounding specificity',
    feedback: {
      flag: {
        title: 'Right call: check this first.',
        text: 'This element has compounding specificity signals: a named journal, specific authors, and a recent year applied to a company the model may or may not have training data on. The citation satisfies the probability distribution for "academic reference in a business context." It looks exactly like a real HBR citation because the model optimized for that pattern. Note what\'s also missing: the article title. Without it, even searching HBR\'s database by author name plus year may not surface a definitive match: there could be multiple Chen/Walters articles, or none, and you cannot quickly distinguish "I haven\'t found it yet" from "it doesn\'t exist." High verification difficulty plus compounding signals is the flag pattern. If you can\'t confirm the citation in reasonable time, exclude it from the briefing. A single fabricated citation undermines everything else in the document.',
        tone: 'success',
      },
      verify: {
        title: 'Right behavior, but deprioritized.',
        text: 'You\'d verify before circulating, which is the correct action. But the indicators here are strong enough to prioritize this above other elements: a specific journal, specific authors, and a specific year is the compounding-specificity pattern, and the missing article title makes verification harder than a clean citation would be. Treating this as routine verification rather than a priority flag means it might not get checked first, and this is the element most likely to embarrass the organization if it reaches leadership unverified. When specificity signals compound AND verification is harder, flag it.',
        tone: 'caution',
      },
      include: {
        title: 'This is how generated citations reach leadership.',
        text: 'The citation has every surface feature of a real reference: a recognized journal, plausible author names, a recent date. That is precisely why it needs verification: it looks real because the model optimized for plausibility, not accuracy. If you forward this without checking and someone searches for the article during the meeting, the briefing (and your professional judgment) are both discredited. Compounding specificity signals (named source + authors + date) should always trigger a flag.',
        tone: 'error',
      },
    },
  },
  {
    id: 'element_2',
    marker: 2,
    highlightedText: 'reporting a 34% reduction in inventory carrying costs',
    intendedClassification: 'verify',
    feedback: {
      verify: {
        title: 'Appropriate triage.',
        text: 'This figure could be real; companies do report specific operational metrics. But it\'s a precise percentage attributed to a specific company and timeframe, which puts it in the verification zone. The model may have encountered this data point in training, or it may have generated a plausible-sounding figure. You can\'t tell from the output alone. Unlike a citation without an article title, this metric has a clear search target (a named company plus a specific timeframe), which makes the verification cost low: check Meridian\'s public announcements, press releases, or investor materials, and you\'ll find the figure or you won\'t in ~5 minutes either way. Single signal plus easy verification = verify-level (medium risk), not flag-level (high risk). If you find the figure, include it. If you can\'t find it, exclude or caveat it.',
        tone: 'success',
      },
      include: {
        title: 'Skipping verification on a single-source metric.',
        text: 'A precise operational metric attributed to a specific company is exactly the type of claim that warrants a quick check. The number feels reasonable (34% is neither suspiciously high nor implausibly low), but plausibility is the mechanism by which generated content passes scrutiny, not evidence of accuracy. Without independent verification, you\'re trusting pattern plausibility rather than confirmed data. One specific claim with no compounding signals = verify before including.',
        tone: 'caution',
      },
      flag: {
        title: 'Possible overtriage.',
        text: 'The figure could genuinely appear in Meridian\'s public materials; not all specific numbers in AI output are generated. This element has a single specificity signal (one precise metric), not the compounding pattern that would push it to flag priority. Reserve the flag classification for elements with multiple compounding indicators, like the HBR citation, where journal + authors + year all compound. A single metric warrants verification, not an assumption of fabrication.',
        tone: 'caution',
      },
    },
  },
  {
    id: 'element_3',
    marker: 3,
    highlightedText:
      'Praxon’s CFO stated in a February 2025 earnings call that the platform "has fundamentally changed how we think about procurement resilience"',
    intendedClassification: 'flag',
    diagnosticPair: 'NTP × Knowledge: compounding specificity with attribution',
    feedback: {
      flag: {
        title: 'Right call: check this first.',
        text: 'This element combines multiple specificity signals: a direct quote attributed to a specific executive, in a specific forum (earnings call), on a specific date (February 2025), using language that could describe any company\'s AI initiative ("fundamentally changed how we think about X"). The model generated the quote because executive quotes about strategic initiatives are statistically probable in this document type. Even if Praxon\'s CFO said something similar, the exact wording is almost certainly generated. Verification is also harder than it looks: earnings call transcripts are searchable in principle, but pinpointing a specific quote against a 90-minute transcript is meaningfully harder than checking a published figure, and the generic phrasing ("fundamentally changed how we think about X") gives the search engine little to anchor on. Compounding signals plus high verification difficulty is the flag pattern. Publishing a fabricated direct quote attributed to a named executive is a more serious professional risk than an inaccurate statistic, because it misrepresents a specific person\'s words.',
        tone: 'success',
      },
      verify: {
        title: 'Close, but the indicators are strong enough to flag.',
        text: 'A direct quote attributed to a named role, in a specific forum, on a specific date, using language that could describe any company\'s AI initiative: this is the compounding-specificity pattern. Earnings call transcripts are searchable, so verification is possible, but the combination of multiple signals should elevate this above routine verification. When specificity signals compound, flag it for priority checking rather than placing it in the general verification queue.',
        tone: 'caution',
      },
      include: {
        title: 'Direct quotes with attribution are high-priority verification targets.',
        text: 'The model does not retrieve quotes from a transcript database; it generates text that matches the pattern of what a CFO would say about an AI initiative in an earnings call. The quote sounds plausible because the pattern is common. If this quote is generated and a leadership team member looks it up (or worse, contacts Praxon), the reputational damage extends well beyond the briefing. Multiple compounding signals (quote + named executive + specific date + specific forum) should always trigger a flag.',
        tone: 'error',
      },
    },
  },
  {
    id: 'element_4',
    marker: 4,
    highlightedText:
      'Cascade reported an 18% reduction in average delivery times and a 23% decrease in fuel expenditure per shipment in a press release issued in March 2025, though independent verification of these figures has not been published.',
    intendedClassification: 'include',
    feedback: {
      include: {
        title: 'Good reading.',
        text: 'This passage demonstrates a different pattern from the other elements. The figures are explicitly attributed to a press release (not an independent study), and the output itself flags that independent verification hasn\'t been published. The text is managing its own epistemic status by disclosing the source and its limitations. No verification cost: the passage discloses its own limitations, which is the include pattern (low risk). The appropriate response is to forward it with the caveat preserved. Not every specific claim requires the same triage level; the quality of the self-attribution matters.',
        tone: 'success',
      },
      verify: {
        title: 'Reasonable caution, but the passage already manages the risk.',
        text: 'You could verify whether Cascade actually issued the press release, which is a defensible check. But the passage itself is doing what a well-constructed briefing should do: attributing claims to their source and flagging the absence of independent confirmation. The uncertainty you\'re flagging is already surfaced in the text. If your verification time is limited, spend it on elements that don\'t self-manage their limitations.',
        tone: 'caution',
      },
      flag: {
        title: 'Overtriage: the text is already doing the work.',
        text: 'Flagging everything with specific numbers loses the distinction between elements that compound specificity signals (the citation, the quote) and elements that handle attribution responsibly. The caveat clause ("though independent verification has not been published") is the kind of epistemic self-management that generated-without-awareness content typically omits. This element is more credible than the others precisely because it acknowledges its own limitations. Calibrated triage means spending your verification time where the text isn\'t already doing the work for you.',
        tone: 'error',
      },
    },
  },
  {
    id: 'element_5',
    marker: 5,
    highlightedText: 'The company currently processes approximately 2.1 million SKU-level forecasts per week.',
    intendedClassification: 'verify',
    feedback: {
      verify: {
        title: 'Correct triage.',
        text: 'This is a specific operational metric that sounds impressive and precise. It could be real (companies do publish throughput statistics), or it could be generated to fill the pattern of "impressive-sounding operational metric in a technology capability paragraph." The word "approximately" is a slight credibility signal (generated figures tend toward false precision), but not enough to include without checking. Verification cost is low: Meridian\'s annual report or operations page should publish throughput stats with this level of detail. Clear search target, ~5 minutes either way. Single signal plus easy verification = verify-level (medium risk), not flag-level. Verify against company materials before including.',
        tone: 'success',
      },
      include: {
        title: 'Insufficient triage for a specificity claim.',
        text: 'A precise throughput figure attributed to a specific company is exactly the type of content that warrants verification. The detail is granular enough (2.1 million, SKU-level, per week) that it feels like data someone retrieved, which is why it passes casual scrutiny. But feeling like real data and being real data are independent. One specific claim with company attribution = verify before including.',
        tone: 'caution',
      },
      flag: {
        title: 'Defensible but overweighted.',
        text: 'Unlike the HBR citation and the CFO quote, this figure doesn\'t combine multiple specificity signals. It\'s a single data point with a hedge word ("approximately"). Flagging it as priority is a defensible professional posture, but less calibrated than routing it through standard verification. Reserve the flag for elements with compounding indicators; this one warrants a check, not an assumption.',
        tone: 'caution',
      },
    },
  },
  {
    id: 'element_6',
    marker: 6,
    highlightedText:
      'three actions merit consideration: (1) initiate a pilot demand forecasting program modeled on Meridian’s phased approach … (2) evaluate our current supplier monitoring against Praxon’s 4,800-supplier benchmark … (3) commission a feasibility study on AI-assisted routing for our domestic logistics network.',
    intendedClassification: 'verify',
    feedback: {
      verify: {
        title: 'Precise identification of a different risk.',
        text: 'The recommended actions are not generated claims in the way the citation and quote are; they are logically derived from the competitor profiles. But that derivation has a dependency problem: recommendations 1 and 2 reference data points that may themselves be unverified (Meridian\'s phased approach, Praxon\'s 4,800-supplier benchmark). If the upstream data is wrong, the downstream recommendations are built on a false premise. The verification difficulty here isn\'t about finding an external source. It\'s about checking the upstream data the recommendations depend on. The work is real but bounded: once you\'ve verified the inputs (medium risk, ~5 minutes each), the conclusions follow. This is a different verification need: not "is this claim true?" but "does the reasoning hold if the inputs change?" Checking the recommendations means checking their inputs first.',
        tone: 'success',
      },
      include: {
        title: 'Missed the dependency chain.',
        text: 'The recommendations sound reasonable ("initiate a pilot," "evaluate our monitoring," "commission a feasibility study") because the model generated strategically conservative language that is hard to argue with. But recommendation 2 benchmarks your organization against Praxon\'s 4,800-supplier figure, which has not been verified. If that number is generated, you\'ve recommended evaluating your operations against a fictional standard. Recommendations inherit the verification status of their inputs.',
        tone: 'error',
      },
      flag: {
        title: 'Wrong triage category.',
        text: 'The recommendations are not generated factual claims; they are conclusions derived from premises. There is no "real" version of these recommendations to verify against an external source. The issue is not compounding specificity signals; it is that they rest on upstream data that itself needs verification. Flagging them conflates two different types of verification need: factual claims (check against a source) and dependency risk (check the inputs that the conclusion relies on). Route these through verify: check the premises, and the conclusions follow.',
        tone: 'caution',
      },
    },
  },
];

export const P10_SUMMARY = `Verification triage: what this briefing revealed.

This briefing contained four distinct verification patterns. The triage decision for each one came from two factors operating together: the number of specificity signals (one detail vs. compounding details), and the verification cost (clear search target vs. hard-to-verify).

Flag: High Risk (Elements 1, 3): The HBR citation and the CFO quote both showed compounding specificity signals (journal + authors + year; quote + executive + forum + date) AND high verification difficulty (no article title to anchor a search; a 90-minute transcript to comb through against generic phrasing). When both factors compound, the probability of generation is high and the cost to confirm is real. These get checked first; if unconfirmed in reasonable time, they get excluded.

Verify: Medium Risk (Elements 2, 5): The revenue reduction figure and the SKU throughput number were single-signal claims with clear search targets. A named company plus a specific timeframe gives you somewhere obvious to look. Doable in ~5 minutes against primary sources. Single signal plus low verification cost = verify before including.

Include: Low Risk (Element 4): The Cascade passage attributed its claims to a specific source and disclosed the absence of independent verification. No verification cost: the text is managing its own epistemic status. Forward as-is with the caveat preserved.

Verify: dependency risk (Element 6): The recommendations were not generated claims themselves, but they inherited the verification status of their inputs. The work is bounded: verify the upstream inputs (medium risk each), and the conclusions follow.

The triage heuristic has two factors. Count the specificity signals (one signal vs. compounding signals) AND estimate the verification cost (clear search target vs. hard-to-verify). These compound. Element 1 was high-signal AND hard-to-verify, which puts it at flag, high risk. Element 2 was single-signal AND clear search target, which puts it at verify, medium risk. Element 4 was self-managed, with no verification cost, which puts it at include, low risk. The skill is reading both axes at once, then matching the risk profile to your available verification time.`;

// ─── P11: Iterative Refinement ────────────────────────────────────

export const P11_SCENARIO = `Your task: You are an HR business partner at a mid-size technology company. The Chief People Officer has asked you to draft an internal communication to a 200-person engineering department announcing a reorganization. Three teams are being merged into two, reporting lines are changing for roughly 60 people, and two team lead positions are being eliminated (the affected individuals have already been notified privately). The email will go out Monday morning. It needs to be clear, honest, and specific enough that people know what's changed, without generating panic or a wave of resignations.

You've decided to use AI to draft the communication. The exercise below walks you through three refinement turns, practicing the Description-Discernment loop on each iteration.`;

export const P11_TURN1_PROMPT = `Your initial prompt: "Write an email to the engineering department announcing a reorganization. Three teams are being merged into two and some reporting lines are changing."`;

export const P11_DRAFT_1 = `Subject: Upcoming Organizational Changes

Dear Engineering Team,

I'm writing to share some exciting news about changes coming to our engineering organization. As we continue to evolve and grow as a company, we are realigning our team structure to better position ourselves for the opportunities ahead.

Effective [date], we will be consolidating three of our existing engineering teams into two streamlined groups. This change reflects our commitment to efficiency, collaboration, and innovation. Some reporting lines will be adjusted as part of this transition.

We believe these changes will create a stronger, more unified engineering organization that is better equipped to deliver on our ambitious product roadmap. The leadership team is confident that this new structure will foster greater cross-functional collaboration and reduce silos.

More details will be shared in the coming weeks. In the meantime, please don't hesitate to reach out to your manager or HR with any questions.

We appreciate your flexibility and dedication during this transition.

Best regards,
[Name]`;

export const P11_DRAFT_2 = `Subject: Engineering Reorganization — Effective May 12

Team,

Starting May 12, we're restructuring the engineering organization. Three teams — Platform Infrastructure, Core Services, and Developer Tools — are merging into two: Platform Engineering and Product Infrastructure. Roughly 60 people will have new reporting lines. This email explains what's changing, what isn't, and what to expect next.

**What's changing:**
- Platform Infrastructure and Core Services merge into Platform Engineering, reporting to [Director name].
- Developer Tools merges into Product Infrastructure, reporting to [Director name].
- Two team lead positions have been eliminated. The affected individuals have been notified and are being supported through the transition.

**What isn't changing:**
- Your day-to-day project assignments remain the same through the end of Q2.
- Compensation, benefits, and employment terms are unaffected.
- The product roadmap and sprint commitments are unchanged.

**Why:**
We've been running three teams with overlapping mandates. The merge reduces coordination overhead and gives both new groups a clearer scope. This is a structural change, not a cost reduction.

**Next steps:**
- Your new manager will reach out by Wednesday to schedule a 1:1.
- A full org chart will be published on the intranet by Friday.
- I'm holding open office hours Thursday and Friday for questions.

I know reorganizations generate anxiety, and I won't pretend this is frictionless. If you have concerns — about your role, your reporting line, or what this means for your trajectory here — bring them to your new manager or to me directly. We'd rather hear them than have you sit with them.

[Name]
HR Business Partner`;

export const P11_DRAFT_3 = `Subject: Engineering Reorganization — Effective May 12

Team,

Starting May 12, we're restructuring the engineering organization. Three teams — Platform Infrastructure, Core Services, and Developer Tools — are merging into two: Platform Engineering and Product Infrastructure. Roughly 60 people will have new reporting lines. This email explains what's changing, what isn't, and what to expect next.

**What's changing:**
- Platform Infrastructure and Core Services merge into Platform Engineering, reporting to [Director name].
- Developer Tools merges into Product Infrastructure, reporting to [Director name].
- Two team lead positions have been eliminated. The affected individuals have been notified and are being supported through the transition.

**What isn't changing:**
- Your day-to-day project assignments remain the same through the end of Q2.
- Compensation, benefits, and employment terms are unaffected.
- The product roadmap and sprint commitments are unchanged.

**If your reporting line is changing:**
- Your current manager has shared a transition summary with your new manager, including project context and any development goals you've discussed. You won't have to re-establish that from scratch.
- Your mid-year performance review will be conducted jointly by your outgoing and incoming managers to ensure continuity. No one's review will be based solely on a manager who's known them for six weeks.
- If you were in an active development plan or promotion conversation, that continues — your new manager has been briefed.

**Why:**
We've been running three teams with overlapping mandates. The merge reduces coordination overhead and gives both new groups a clearer scope. This is a structural change, not a cost reduction.

**Next steps:**
- Your new manager will reach out by Wednesday to schedule a 1:1.
- A full org chart will be published on the intranet by Friday.
- I'm holding open office hours Thursday and Friday for questions.

I know "restructuring" is a word that makes people update their résumés. I want to be direct: this is a structural simplification, not a precursor to further reductions. The two affected team lead roles are the full scope of position changes. If that changes, I will tell you before you hear it elsewhere.

[Name]
HR Business Partner`;

export const P11_TURN1_EVAL_PROMPTS = [
  {
    label: 'Product discernment',
    prompt:
      'Does this email give the 200 recipients enough specific information to understand what changed for them? What is missing?',
  },
  {
    label: 'Process discernment',
    prompt:
      'Look at how the email is structured. Does the sequence (announcement, rationale, reassurance, next steps) serve the audience’s actual needs in this situation? What would you reorder or restructure?',
  },
  {
    label: 'Performance discernment',
    prompt:
      'Read the tone. Is "exciting news" the right register for an email that eliminates two positions and changes 60 people’s reporting lines? Where does the tone misalign with the situation?',
  },
];

export const P11_TURN2_EVAL_PROMPTS = [
  {
    label: 'Improvement assessment',
    prompt:
      'Compare Draft 2 to Draft 1. Identify the two most significant improvements. What changed, and which Description dimension drove the improvement?',
  },
  {
    label: 'Remaining gap',
    prompt:
      'Draft 2 is substantially better. But read it again from the perspective of the 60 people whose reporting lines are changing. What specific concern does this email still not address? What would you add or adjust in one more refinement?',
  },
];

// Example refinements displayed alongside Drafts 2 and 3 in the
// restructured P11 flow. Turn 1 is pure evaluation (no learner-authored
// refinement); Turn 2 surfaces a worked-example refinement that
// produced Draft 2, paired with re-evaluation; Turn 3 is the
// author-and-compare step — the learner writes their own refinement
// targeting the gap they identified, then sees the sample refinement
// that produced Draft 3 and compares the two. This makes both
// refinement examples worked-examples-with-evaluation rather than
// false-interactive prompts that don't drive the output.
export const P11_TURN2_EXAMPLE_REFINEMENT_FOR_DRAFT_2 = `"The draft opens with 'exciting news' and uses corporate-speak ('evolve and grow,' 'opportunities ahead') that will read as evasive to people whose jobs are being restructured. Replace the framing: 200 engineers will read this Monday morning, two of them have already been told their roles are eliminated, and 60 have new reporting lines. They need specifics, not enthusiasm. Restructure around four sections: (1) what's changing, which means naming the three teams merging into two, the effective date, the headcount affected, and acknowledging the two eliminated positions; (2) what isn't changing (compensation, benefits, day-to-day assignments through Q2, the roadmap); (3) why, with an explanation of the overlap that drove consolidation and an explicit acknowledgement that this is structural simplification, not a cost reduction; (4) next steps, including when new managers will reach out, when the org chart publishes, and when office hours are. Cut the 'exciting' framing. Use direct language: 'reorganizing,' not 'realigning.' Acknowledge in the closing that reorganizations generate anxiety and give people a concrete path to surface concerns."`;

export const P11_TURN2_EXAMPLE_LABEL_FOR_DRAFT_2 = 'The refinement that produced Draft 2';

export const P11_TURN3_EXAMPLE_REFINEMENT_FOR_DRAFT_3 = `"The email addresses structural changes clearly but doesn't speak to the 60 people whose reporting lines are changing. They're reading this thinking: does my new manager know what I'm working on? What happens to my performance review? Is my promotion conversation dead? Add a section specifically for people whose reporting lines are changing that addresses transition continuity (project context handoff, performance review fairness, active development plans). Keep the direct tone. The closing should also acknowledge that 'restructuring' triggers résumé-updating behavior. Be honest about scope: this is the full extent of position changes, and if that changes you'll say so before they hear it elsewhere."`;

export const P11_TURN3_EXAMPLE_LABEL_FOR_DRAFT_3 = 'The refinement that produced Draft 3';

export const P11_TURN3_REFINEMENT_PROMPT =
  "Based on the gap you identified in your evaluation above, write a refinement targeting it. Be specific about what you want changed and why. After you submit, we'll show you a sample refinement that produced Draft 3, and you'll compare your approach to the sample.";

export const P11_TURN3_COMPARISON_PROMPT = {
  label: 'Compare to the sample',
  prompt:
    "How does your refinement compare to the sample? What did the sample target that yours did or didn't? What would you keep from your version, and what would you adopt from the sample?",
};

export const P11_REFLECTION = `You evaluated three drafts and wrote one refinement of your own. You also compared it against a sample refinement that produced Draft 3. Look across your evaluation notes: of the three Discernment dimensions (product, process, performance), which did you identify gaps in most quickly? Which took you longer to see? Where did your authored refinement differ most from the sample, and what does that tell you about your evaluative instincts? Two or three sentences.`;

// ─── P12: Diligence Statement ─────────────────────────────────────
//
// P12_FRAMING was previously a plain string here, split-on-paragraphs at
// the render site. It was moved inline into DiligenceStatement.tsx as
// JSX so it can host a `<Citation>` component for the Anthropic
// Interviewer 2025 stigma stat — a `.ts` file can't contain JSX without
// being renamed, and only one consumer (DiligenceStatement) reads this
// content. P12_SCENARIO / P12_EXEMPLAR / etc. remain plain strings
// below since they don't carry inline citations.

export const P12_SCENARIO = `Your situation: You've just completed the competitive landscape briefing from the output verification scenario, the one with the AI-generated competitor profiles that required verification. Imagine you caught the errors, verified the data against primary sources, rewrote the strategic recommendations using your own meeting notes, and sent the final briefing to your director. The briefing is going to the leadership team tomorrow.

Your organization has adopted the practice of appending a brief AI diligence statement to any deliverable that involved AI assistance. Write the statement for this briefing.`;

export const P12_EXEMPLAR = `**AI Diligence Statement: Competitive Landscape Briefing**

**Delegation:** Competitor data compilation (profiles, revenue, headcount, recent announcements) was fully delegated to AI using a structured prompt specifying five competitors and four data categories. Comparative analysis was AI-assisted: AI generated the framework, which I reweighted based on the prospect's priorities from our initial meeting. Strategic recommendations and the executive summary were human-authored from verified inputs. Formatting was fully delegated.

**Description:** The prompt specified a two-page internal briefing for the leadership team covering competitor profiles, comparative analysis, strategic recommendations, and an executive summary. Constraints: factual claims must be verifiable, no speculative projections, direct tone.

**Discernment:** Verification identified two fabricated elements (a nonexistent HBR citation and a fabricated competitor CFO quote), both removed. Three data points were checked against annual reports; one unconfirmable figure was removed.

**Diligence:** Two limitations: (1) competitive data reflects publicly available information only, and (2) comparative analysis weights are based on a single initial meeting with the prospect. Strategic recommendations reflect my professional judgment informed by the verified data.`;

export const P12_EFFECTIVENESS = `What makes the exemplar effective:

The exemplar does four things your own statement may or may not have included. Read these as a reference for the next statement you write at work, not as a judgment on your draft.

First, it uses the 4D vocabulary naturally, not as a checklist. "Fully delegated," "AI-assisted," "human-authored" are Delegation terms doing real descriptive work: they tell the reader exactly where AI contributed and where it didn't. Second, it names what was verified and what was found: the fabricated citation, the fabricated quote, the unconfirmable figure. This is Discernment made visible: not just "I checked the output" but "I checked it, found these specific problems, and here is what I did about each one." Third, it acknowledges limitations honestly: the data is public-only, the priority weighting reflects a single meeting. This is accountability, not defensiveness. Fourth, it is concise enough to actually append to a deliverable. A diligence statement that takes longer to read than the briefing it accompanies won't be used. The exemplar covers all four competencies in a single, brief block of structured prose.`;

export const P12_REFLECTION = `Think about the last deliverable you produced at work that involved AI assistance. If you had appended a diligence statement like the exemplar above, what would have been different in the document itself, in how your manager perceived it, or in how you thought about your own process? One or two sentences.`;
