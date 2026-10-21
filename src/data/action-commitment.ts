// The action commitment the learner writes in Module 2 (P4) and revises
// in the Module 4 closing. Both live in LearnerProgressContext
// reflections, keyed `${moduleId}.${sectionId}.${promptId}`. The profile,
// the PDF, and the refresher show the revised plan when one exists,
// because it is the learner's current plan.

export const COMMITMENT_PROMPT_IDS = {
  task1: 'p4_task1',
  task2: 'p4_task2',
  revisedTask1: 'p4_revised_task1',
  revisedTask2: 'p4_revised_task2',
  tellWho: 'p4_revised_tell',
} as const;

const ORIGINAL = { moduleId: 2, sectionId: 5 } as const;
const REVISED = { moduleId: 4, sectionId: 9 } as const;

const key = (where: { moduleId: number; sectionId: number }, promptId: string): string =>
  `${where.moduleId}.${where.sectionId}.${promptId}`;

export const COMMITMENT_LOCATION = { original: ORIGINAL, revised: REVISED } as const;

export interface CurrentCommitment {
  task1: string;
  task2: string;
  task1Revised: boolean;
  task2Revised: boolean;
  /** Who the learner said they will tell; empty when not given. */
  tellWho: string;
}

export function currentCommitment(reflections: Record<string, string>): CurrentCommitment {
  const pick = (originalId: string, revisedId: string): { text: string; revised: boolean } => {
    const revised = (reflections[key(REVISED, revisedId)] ?? '').trim();
    if (revised.length > 0) return { text: revised, revised: true };
    return { text: reflections[key(ORIGINAL, originalId)] ?? '', revised: false };
  };
  const t1 = pick(COMMITMENT_PROMPT_IDS.task1, COMMITMENT_PROMPT_IDS.revisedTask1);
  const t2 = pick(COMMITMENT_PROMPT_IDS.task2, COMMITMENT_PROMPT_IDS.revisedTask2);
  return {
    task1: t1.text,
    task2: t2.text,
    task1Revised: t1.revised,
    task2Revised: t2.revised,
    tellWho: (reflections[key(REVISED, COMMITMENT_PROMPT_IDS.tellWho)] ?? '').trim(),
  };
}
