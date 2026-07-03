// Program metadata — module sequence, sections, and 4D competency emphasis.
// Drives sidebar navigation, landing-page cards, and route definitions.

export type CompetencyKey = 'delegation' | 'description' | 'discernment' | 'diligence';

type SequenceLetter = 'C' | 'E' | 'M' | 'A';

export type SectionState = 'todo' | 'current' | 'done';

interface SectionMeta {
  id: number;
  title: string;
  state: SectionState;
}

export interface ModuleMeta {
  id: 1 | 2 | 3 | 4;
  seq: SequenceLetter;
  label: string; // Sequence label (Context, Evidence, Mechanism, Application)
  title: string;
  duration: string;
  shortDescription: string;
  competencies: CompetencyKey[];
  activities: number;
  objectives: number;
  progress: number; // 0–1
  sections: SectionMeta[];
}

interface CompetencyMeta {
  key: CompetencyKey;
  label: string;
  description: string;
}

export const COMPETENCIES: CompetencyMeta[] = [
  { key: 'delegation', label: 'Delegation', description: 'Choosing what to send to AI' },
  { key: 'description', label: 'Description', description: 'Specifying the task clearly' },
  { key: 'discernment', label: 'Discernment', description: 'Judging what comes back' },
  { key: 'diligence', label: 'Diligence', description: 'Verifying before you ship' },
];

export const MODULES: ModuleMeta[] = [
  {
    id: 1,
    seq: 'C',
    label: 'Context',
    title: 'Why AI literacy matters now',
    duration: '15–20 min',
    shortDescription: 'How AI is reshaping knowledge work, and why literacy must travel with the tool.',
    competencies: ['delegation', 'diligence'],
    activities: 2,
    objectives: 4,
    progress: 0,
    sections: [
      { id: 1, title: 'You already use AI. Can you prove it’s working?', state: 'todo' },
      { id: 2, title: 'The market picture', state: 'todo' },
      { id: 3, title: 'Data narrative — the workforce shift', state: 'todo' },
      { id: 4, title: 'The invisible problem', state: 'todo' },
      { id: 5, title: 'Stigma reflection — a shared vocabulary', state: 'todo' },
      { id: 6, title: 'What this program builds', state: 'todo' },
      { id: 7, title: 'Knowledge check', state: 'todo' },
      { id: 8, title: 'Transition to Module 2', state: 'todo' },
    ],
  },
  {
    id: 2,
    seq: 'E',
    label: 'Evidence',
    title: 'How AI is actually being used at work',
    duration: '15–20 min',
    shortDescription: 'Behavioral evidence vs. self-report, augmentation vs. automation, and where the gaps live.',
    competencies: ['delegation', 'discernment'],
    activities: 2,
    objectives: 4,
    progress: 0,
    sections: [
      { id: 1, title: 'Opening hook', state: 'todo' },
      { id: 2, title: 'What the workforce is actually doing', state: 'todo' },
      { id: 3, title: 'Dashboard — augmentation vs. automation', state: 'todo' },
      { id: 4, title: 'Where the productivity gains concentrate', state: 'todo' },
      { id: 5, title: 'Dashboard — productivity distributions', state: 'todo' },
      { id: 6, title: 'The gap between speed and judgment', state: 'todo' },
      { id: 7, title: 'Knowledge check', state: 'todo' },
      { id: 8, title: 'Transition to Module 3', state: 'todo' },
    ],
  },
  {
    id: 3,
    seq: 'M',
    label: 'Mechanism',
    title: 'Understanding how language models work',
    duration: '20–30 min',
    shortDescription: 'Tokenization, next-token prediction, context windows — and the diagnostic pairs behind workplace AI failures.',
    competencies: ['description', 'discernment'],
    activities: 3,
    objectives: 4,
    progress: 0,
    sections: [
      { id: 1, title: 'Opening hook', state: 'todo' },
      { id: 2, title: 'How text becomes data — tokenization', state: 'todo' },
      { id: 3, title: 'Tokenizer playground', state: 'todo' },
      { id: 4, title: 'How output gets generated — next-token prediction', state: 'todo' },
      { id: 5, title: 'Next-token prediction in action', state: 'todo' },
      { id: 6, title: 'Context windows and working memory', state: 'todo' },
      { id: 7, title: 'Context window scenario', state: 'todo' },
      { id: 8, title: 'Steerability', state: 'todo' },
      { id: 9, title: 'When properties meet', state: 'todo' },
      { id: 10, title: 'Knowledge check', state: 'todo' },
      { id: 11, title: 'Transition to Module 4', state: 'todo' },
    ],
  },
  {
    id: 4,
    seq: 'A',
    label: 'Application',
    title: 'Evaluating AI outputs and working responsibly',
    duration: '30–40 min',
    shortDescription: 'Five practice activities — decompose, reformulate, verify, refine, and document — pulling all four competencies into one workflow.',
    competencies: ['delegation', 'description', 'discernment', 'diligence'],
    activities: 5,
    objectives: 5,
    progress: 0,
    sections: [
      { id: 1, title: 'Opening hook — putting it all together', state: 'todo' },
      { id: 2, title: 'Task decomposition', state: 'todo' },
      { id: 3, title: 'Prompt reformulation', state: 'todo' },
      { id: 4, title: 'Knowledge check — Delegation & Description', state: 'todo' },
      { id: 5, title: 'Output verification', state: 'todo' },
      { id: 6, title: 'Iterative refinement', state: 'todo' },
      { id: 7, title: 'Knowledge check — Discernment & the loop', state: 'todo' },
      { id: 8, title: 'Diligence statement builder', state: 'todo' },
      { id: 9, title: 'Program closing', state: 'todo' },
      { id: 10, title: 'Your competency profile', state: 'todo' },
    ],
  },
];

export const TOTAL_OBJECTIVES = MODULES.reduce((acc, m) => acc + m.objectives, 0);
export const TOTAL_ACTIVITIES = MODULES.reduce((acc, m) => acc + m.activities, 0);

export function getModule(id: number): ModuleMeta | undefined {
  return MODULES.find((m) => m.id === id);
}
