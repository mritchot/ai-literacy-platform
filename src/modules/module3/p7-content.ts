// P7 ContextWindowScenario — source-document excerpts, AI-generated
// summary, and verification items + feedback (4C spec §10).

interface SourceSection {
  heading: string;
  body: string;
  // Page number where this section sits in the simulated 42-page
  // contract — informs the attention visualization.
  page: number;
}

export const SOURCE_EXCERPTS: SourceSection[] = [
  {
    heading: 'Section 3 · Service Level Terms',
    body:
      'The vendor commits to a 99.5% uptime measurement on a calendar-month basis. Where uptime falls below 99.5% in any measured month, service credits will be issued against the following month’s invoice on a graduated scale set out in Schedule 3.',
    page: 4,
  },
  {
    heading: 'Section 7 · Liability Cap',
    body:
      'Aggregate liability of either party under or in connection with this Agreement is limited to the total fees paid by the client over the twelve (12) months preceding the event giving rise to the claim. This cap excludes liability for gross negligence or wilful misconduct.',
    page: 9,
  },
  {
    heading: 'Section 12 · Data Handling',
    body:
      'Following termination of this Agreement for any reason, the vendor will retain client data for ninety (90) days, after which the data will be permanently deleted. The client may request earlier deletion with thirty (30) days’ written notice. No regulatory archiving obligation applies under this Agreement.',
    page: 18,
  },
  {
    heading: 'Section 18 · Termination Clauses',
    body:
      'Either party may terminate this Agreement, with or without cause, by providing ninety (90) days’ prior written notice. Outstanding fees for services rendered remain payable through the effective termination date.',
    page: 24,
  },
  {
    heading: 'Section 24 · Indemnification',
    body:
      'The vendor shall indemnify, defend, and hold harmless the client against any third-party claim alleging that the services infringe such third party’s intellectual property rights, subject to the cap set out in Section 7. No reciprocal indemnification obligation applies to the client under this Agreement.',
    page: 31,
  },
  {
    heading: 'Appendix B · Pricing Schedule',
    body:
      'Pricing is tiered by active user count, calculated monthly. Volume discounts apply at 250, 1,000, and 5,000 active users. Annual prepayment qualifies for an additional 8% discount applied to the relevant tier rate.',
    page: 40,
  },
];

// Pre-written AI summary containing two embedded errors:
//   - Section 12 fabrication ("12 months ... regulatory archiving")
//   - Section 24 pattern substitution ("mutual indemnification")
export const AI_SUMMARY = `This vendor services agreement is structured around standard SaaS terms with several provisions worth flagging for the review team.

Service levels are governed by a 99.5% uptime commitment, measured monthly, with service credits issued for any breach of that target. The vendor is responsible for monitoring and reporting against this benchmark on a continuous basis.

Liability is capped at the total fees paid over the preceding 12-month period, which is consistent with industry-standard limitation clauses for engagements at this scale. Either party may terminate the agreement, with or without cause, on 90 days written notice, with outstanding fees remaining payable through the termination date.

Data handling is treated more conservatively than the standard SaaS pattern. Post-termination, client data is retained for 12 months to comply with regulatory archiving requirements, after which it is permanently deleted. No early-deletion mechanism is provided.

The agreement includes mutual indemnification for intellectual property claims arising from either party’s services, in line with typical bilateral indemnification clauses. Pricing is tiered by user volume with discounts at the 250, 1,000, and 5,000 user thresholds, plus an additional 8% reduction for annual prepayment.

Overall the agreement reads as a professionally-drafted vendor services contract with no provisions that materially deviate from sector norms.`;

export type VerificationAnswer = 'accurate' | 'inaccurate' | 'cannot-verify';

interface VerificationItem {
  id: 1 | 2 | 3 | 4;
  claim: string;
  correct: VerificationAnswer;
  feedback: Record<VerificationAnswer, { tone: 'success' | 'error'; text: string }>;
  sectionRef: string;
}

export const VERIFICATION_ITEMS: VerificationItem[] = [
  {
    id: 1,
    sectionRef: 'Section 3',
    claim:
      'The vendor commits to 99.5% uptime, measured on a monthly basis, with service credits issued for any breach.',
    correct: 'accurate',
    feedback: {
      accurate: {
        tone: 'success',
        text: 'Correct. This claim matches Section 3 of the source document. Not every AI-generated summary contains errors. Verification is about systematic checking, not reflexive suspicion.',
      },
      inaccurate: {
        tone: 'error',
        text: 'Section 3 of the source confirms the 99.5% monthly uptime commitment with service credits. The summary reproduces this clause faithfully. This is a baseline verification: not every AI claim is wrong, and verification is about systematic checking rather than reflexive doubt.',
      },
      'cannot-verify': {
        tone: 'error',
        text: 'Section 3 of the source provides full information on the uptime commitment, monthly measurement window, and service-credit mechanism. The summary matches it.',
      },
    },
  },
  {
    id: 2,
    sectionRef: 'Section 7',
    claim:
      'Liability is capped at the total fees paid over the preceding 12-month period.',
    correct: 'accurate',
    feedback: {
      accurate: {
        tone: 'success',
        text: 'Correct. This matches Section 7. The cap is set at twelve months of preceding fees, consistent with the summary.',
      },
      inaccurate: {
        tone: 'error',
        text: 'Section 7 of the source establishes the twelve-month liability cap using the same language the summary reproduces. This claim is accurate.',
      },
      'cannot-verify': {
        tone: 'error',
        text: 'Section 7 provides full information on the liability cap. The summary matches it.',
      },
    },
  },
  {
    id: 3,
    sectionRef: 'Section 12',
    claim:
      'Post-termination, client data is retained for 12 months to comply with regulatory archiving requirements, after which it is permanently deleted.',
    correct: 'inaccurate',
    feedback: {
      accurate: {
        tone: 'error',
        text: 'This claim is fabricated. Section 12 of the source specifies a 90-day retention window post-termination, not 12 months, and it makes no reference to regulatory archiving. The AI-generated summary replaced the actual clause with a more formal-sounding pattern: a longer retention period justified by a generic regulatory rationale. This is next-token prediction at work: the model generated what is statistically plausible in this position, not what the source document actually states. In a contract review, this error could lead the organization to believe it has 12 months of data access when it has 90 days.',
      },
      inaccurate: {
        tone: 'success',
        text: 'This is the critical error. The source document specifies 90-day data retention post-termination, with an option for early deletion on written request. The summary replaced this with 12-month retention for regulatory archiving, a claim that appears nowhere in the source. The fabricated version sounds more formal and more plausible than the real clause, which is precisely why it is dangerous. A quick scan of the summary would not catch it. Only a direct comparison to the source reveals the discrepancy.',
      },
      'cannot-verify': {
        tone: 'error',
        text: 'Section 12 of the source is provided in the excerpts and contains full information on the data-retention window. The summary contradicts it. The 12-month figure and the regulatory-archiving rationale are not in the source.',
      },
    },
  },
  {
    id: 4,
    sectionRef: 'Section 24',
    claim:
      'The agreement includes mutual indemnification for intellectual property claims arising from either party’s services.',
    correct: 'inaccurate',
    feedback: {
      accurate: {
        tone: 'error',
        text: 'This claim is distorted. The source says the vendor indemnifies the client (a one-directional obligation). The summary says “mutual indemnification” (a bidirectional obligation that appears nowhere in the source). “Mutual indemnification” is a more common contract pattern, which is why the model generated it: it is the statistically probable completion at this point in contract-shaped text. The difference is material in a real negotiation.',
      },
      inaccurate: {
        tone: 'success',
        text: 'Good catch. The source specifies vendor-only indemnification: the vendor indemnifies the client. The summary broadened this to “mutual indemnification,” which is a more common contract pattern and therefore a more statistically probable completion. The model defaulted to the typical pattern rather than the specific term in this document. This is a subtler error than the data-retention fabrication, but in a contract context, the difference between one-directional and mutual indemnification is material.',
      },
      'cannot-verify': {
        tone: 'error',
        text: 'Section 24 of the source provides the indemnification language and is included in the excerpts. The summary substitutes “mutual indemnification” for the source’s vendor-only obligation.',
      },
    },
  },
];

export const MECHANISM_REVEAL = `The full 42-page agreement was provided to the AI tool, and the document fit inside the model's context window. This is not a truncation failure; the entire document was available. But attention is not distributed evenly across long inputs. Research on long-context models documents a lost-in-the-middle effect: material at the beginning and end of the input receives more attention than material buried in the center.

Section 12, the data-handling clause located on page 18, fell squarely in that middle zone. Rather than flagging that it had not fully processed the section, the model generated a plausible replacement: "12 months for regulatory archiving" is the kind of clause that frequently appears in vendor agreements, so it scored well on the probability distribution. The model did not know the clause was fabricated. It does not have a mechanism to distinguish "text I generated from the source" from "text I generated to fill a gap."

Section 24, the indemnification clause located on page 31, failed for a different reason. This clause is not in the middle zone. The error here is pure pattern substitution: "mutual indemnification" is a more common contract pattern than one-directional indemnification, so it is the statistically probable completion regardless of where the clause sits in the document. The model defaulted to the typical pattern rather than the specific term in this agreement. Not all errors come from the same mechanism. Some are position-dependent attention failures; others are prediction defaults that would occur at any position.

Two properties are meeting in this scenario. The lost-in-the-middle effect degraded the model's grasp of the middle sections, and next-token prediction filled gaps with plausible-sounding text and defaulted to common patterns over specific ones. Recognizing which mechanism produced an error is a core Discernment skill, because it tells you whether the fix is repositioning information (for attention failures) or adding explicit verification steps (for pattern substitution).`;

export const REASONING_PROMPT = `This scenario involved a 42-page document that fit inside the model's context window. The output looked professional and complete. Two substantive errors were embedded in it: one from a position-dependent attention failure (Section 12, lost in the middle), and one from a position-independent pattern substitution (Section 24, common pattern overriding specific term).

Consider your own work: when you delegate a task involving a long document to an AI tool, how would you verify that the model actually processed the information you needed it to use, and how would you catch errors that have nothing to do with document length? One or two sentences.`;
