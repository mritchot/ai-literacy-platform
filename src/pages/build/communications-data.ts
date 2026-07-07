// Stakeholder-communication samples — two memos in the L&D-Manager voice
// (a weekly status update and a design-review summary), reproduced in full and
// framed as an organizational-context simulation, plus the communication-design
// notes that annotate them.
//
// Source: Phase 4 Component 7C Stakeholder Communication Samples
// (course-info/content/04_phase-04/07c_stakeholder-communications.docx). The
// samples are the document's fictional-but-grounded originals. ONE reconciliation:
// design-review item 5 originally cited a stale Module-4 duration (the memo
// said "31–33 minutes"); per src/data/program.ts — the source of truth,
// M4 = 30–40 min — the item now uses the actual shipped module duration.

export interface MemoMeta {
  to: string;
  from: string;
  date: string;
  re: string;
}

export type StatusTone = 'success' | 'caution' | 'neutral';

export interface StatusRow {
  workstream: string;
  status: string;
  tone: StatusTone;
  notes: string;
}

export interface DecisionRow {
  n: string;
  item: string;
  decision: string;
  status: string;
  tone: StatusTone;
  owner: string;
}

export const SAMPLE1_META: MemoMeta = {
  to: 'Executive Sponsor, HR Business Partner, IT Platform Lead',
  from: 'L&D Program Manager',
  date: 'Week of May 5, 2026',
  re: 'AI Literacy Program: Status Update (Week 6 of 8)',
};

export const SAMPLE1_STATUS: StatusRow[] = [
  { workstream: 'Content Development', status: 'Complete', tone: 'success', notes: 'All four modules authored, reviewed, and integrated. 37 sections, 16 knowledge checks, 3 interpretation checks finalized.' },
  { workstream: 'Platform Build', status: 'Complete', tone: 'success', notes: 'Custom React platform deployed to Cloudflare Pages. 12 interactive components, admin dashboard, three-mode navigation, dark mode. Production code cleanup complete.' },
  { workstream: 'Assessment System', status: 'Complete', tone: 'success', notes: '10-item pre/post assessment (parallel design) implemented and integrated into the admin-dashboard analytics.' },
  { workstream: 'Evaluation Framework', status: 'In Progress', tone: 'caution', notes: 'Levels 1 and 2 design documents complete. Level 3 (behavioral) in final review. Level 4 (ROI) drafting this week. Target: complete by May 16.' },
  { workstream: 'PM Documentation', status: 'Not Started', tone: 'neutral', notes: 'Deferred until the evaluation framework is complete. Retrospective, no upstream dependency. Target: May 19.' },
];

export const SAMPLE1_BODY_MD = `### Progress since last update

The platform build reached production quality this week. The three-mode navigation system (learner, portfolio, admin) is deployed and tested. Learner mode enforces sequential progression; portfolio mode enables free navigation for hiring reviewers and internal stakeholders; admin mode exposes the full analytics dashboard with live data. The citation-visibility toggle, which lets readers show or hide inline source references, passed smoke testing across all 41 platform routes with zero errors.

### Risks and mitigations

**Articulate build (Component 5) remains deferred.** No budget for Rise/Storyline licensing. Mitigation: the custom platform serves as the primary portfolio artifact and is fully functional. The Articulate build would demonstrate authoring-tool proficiency but is not required for program completeness. Recommendation: defer indefinitely and reallocate effort to the evaluation framework, which carries stronger signal for management-level roles.

**Evaluation-framework timeline is tight.** Four design documents (6A–6D) in 10 days. Mitigation: the framework structure is well-defined and all upstream content (performance objectives, action-map behaviors, assessment instruments) is finalized. No blocking dependencies remain.

### Decisions needed

None this week. The remaining work is execution against approved designs.

*Next update: week of May 12.*`;

export const SAMPLE1_NOTE =
  'The status update leads with a status table so a reader can assess overall health in about ten seconds; the narrative sections are read only when the table raises a question. The "Decisions needed" section appears even when empty; its absence would leave a reader wondering whether they had missed something.';

export const SAMPLE2_META: MemoMeta = {
  to: 'Design Review Attendees (ID, FS, SME, ES)',
  from: 'L&D Program Manager',
  date: 'April 21, 2026',
  re: 'Phase 2 Design Review: Decisions and Action Items',
};

export const SAMPLE2_INTRO =
  'This summarizes the outcomes from the Phase 2 design review conducted on April 18. The review covered the program structure (Component 3A), the component specifications (4A–4E), the design system (Component 5), and the data-validation protocol. Five items were raised; dispositions follow.';

export const SAMPLE2_DECISIONS: DecisionRow[] = [
  {
    n: '1',
    item: 'Module 3 scope: steerability should be a standalone section, not folded into the “properties” section.',
    decision: 'Accepted. Module 3 expanded from 10 to 11 sections. Steerability and synthesis (“When Properties Meet”) are now separate sections.',
    status: 'Implemented',
    tone: 'success',
    owner: 'Instructional Designer',
  },
  {
    n: '2',
    item: 'Pre/post assessment: 10 items may be too few for reliable measurement across four competency dimensions.',
    decision: 'Retained as-is. 10 items is a deliberate tradeoff: sufficient construct coverage against completion burden for time-pressured mid-career professionals. Documented in 6B §7.5.',
    status: 'Resolved',
    tone: 'success',
    owner: 'L&D Manager',
  },
  {
    n: '3',
    item: 'The platform should collect Level 1 survey data directly to simplify evaluation.',
    decision: 'Declined. The platform collects no PII by design: no server-side store, no data-governance infrastructure. The survey is administered externally. Rationale in 6A §2.',
    status: 'Resolved',
    tone: 'success',
    owner: 'L&D Manager',
  },
  {
    n: '4',
    item: 'Data dashboards should use live API data rather than static JSON files.',
    decision: 'Deferred. Static JSON with validated provenance is appropriate for a portfolio piece; live API integration is an enhancement for organizational deployment where real-time feeds exist.',
    status: 'Deferred',
    tone: 'neutral',
    owner: 'Full-Stack Developer',
  },
  {
    n: '5',
    item: 'Module 4 runs 30–40 minutes, over its original 20–30 minute target, the longest of the four modules.',
    decision: 'Accepted as-is. Module 4 carries the highest practice density (5 activities, P8–P12) because it is the program’s capstone; the extra length is a reasonable tradeoff for assessment completeness.',
    status: 'Resolved',
    tone: 'success',
    owner: 'Instructional Designer',
  },
];

export const SAMPLE2_BODY_MD = `### Summary

Three items were resolved with no design change required (items 2, 3, and 5, each a deliberate design decision with documented rationale). One item was accepted and implemented (item 1, the Module 3 scope expansion). One item was deferred to organizational deployment (item 4, live API data). No items were escalated to the Executive Sponsor.

The review confirms that the Phase 2 architecture is approved for content development and platform build. Phase 3 begins April 25.

*Action-items tracker updated. Next design review: post-build QA review, tentatively May 12.*`;

export const SAMPLE2_NOTE =
  'The design-review summary leads with a decision table, not meeting minutes: stakeholders need to know what was decided and who owns the action, not what was discussed. Each row carries a disposition (Implemented, Resolved, Deferred) and an owner, and the format scales: a fifteen-item review uses the same structure.';