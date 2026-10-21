// 30/60/90-day milestones, shared by the on-screen competency profile,
// the PDF profile, and the refresher. Each target schedules a concrete
// action and maps to Level 3 indicators (03_level-3-behavior.md):
// 30 days to B7 plus the Module 2 commitment, 60 days to B1, 90 days to
// B9 and B11. The PDF card clamps a target to two lines, so `pdfTarget`
// carries a shorter wording of the same action.

export type MilestoneDays = 30 | 60 | 90;

export interface Milestone {
  days: MilestoneDays;
  target: string;
  pdfTarget: string;
}

export const MILESTONES: readonly Milestone[] = [
  {
    days: 30,
    target:
      'Next time you do Task 1, try it with AI. Next time you do Task 2, add a verification step. Attach a diligence statement to one of those deliverables.',
    pdfTarget:
      'Try Task 1 with AI and add a verification step to Task 2. Attach a diligence statement to one.',
  },
  {
    days: 60,
    target:
      'Before you start one new recurring task, split it into human-only, AI-assisted, and fully delegated parts. Keep one specific example for your 60-day check-in.',
    pdfTarget:
      'Split one new recurring task into human-only, AI-assisted, and fully delegated parts. Keep one example.',
  },
  {
    days: 90,
    target:
      'Lead one team conversation about AI practices in the 4D vocabulary, using the Team Policy Starter (R7) as the agenda.',
    pdfTarget:
      'Lead one team conversation on AI practices, using the Team Policy Starter as the agenda.',
  },
];

export const CHECK_IN_EXAMPLE_PROMPT =
  'At each check-in, bring one specific example: the situation, what you did, and what happened.';

export const R7_TOOL_LABEL = 'R7 Organizational AI Use Policy Starter';

export function isMilestoneDays(v: unknown): v is MilestoneDays {
  return v === 30 || v === 60 || v === 90;
}

// Throwing lookup: every MilestoneDays value has an entry above, so a
// miss is a programming error, not a state to render around.
export function milestoneFor(days: MilestoneDays): Milestone {
  const m = MILESTONES.find((x) => x.days === days);
  if (!m) throw new Error(`No milestone defined for ${days} days`);
  return m;
}
