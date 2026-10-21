// Where each pre/post-assessment construct is taught, for the competency
// profile's "Where to focus next" panel. Keys are the `constructKey`
// values the pre and post item banks share. Section titles come from
// program.ts at render time, so a renamed section never goes stale here.
//
// scripts/verify-construct-routing.mjs fails the build when a bank key
// has no entry here, or when an entry points at a section program.ts
// does not define. Update this map when sections move.

export type ReferenceCardId = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7';

export interface ConstructRoute {
  moduleId: 1 | 2 | 3 | 4;
  sectionId: number;
  referenceId: ReferenceCardId;
  /** What to look at again, in the module's own terms. */
  focus: string;
}

export const CONSTRUCT_ROUTES: Record<string, ConstructRoute> = {
  'augmentation-automation': {
    moduleId: 2,
    sectionId: 3,
    referenceId: 'R1',
    focus:
      'Compare how professionals describe their AI use with what the conversation data shows. Who shapes the task decides whether you are augmenting or automating.',
  },
  'productivity-verification': {
    moduleId: 2,
    sectionId: 4,
    referenceId: 'R2',
    focus:
      'Time saved inside the conversation is not time saved on the task. Look at the verification work that follows a fast draft.',
  },
  'fluent-fabrication': {
    moduleId: 3,
    sectionId: 4,
    referenceId: 'R4',
    focus:
      'Specific, confident details can be generated rather than looked up. Check every citation, statistic, and quote.',
  },
  'boundary-task': {
    moduleId: 3,
    sectionId: 3,
    referenceId: 'R5',
    focus:
      'Counting, character-level comparisons, and arithmetic sit at the edge of how the model sees text. Expect errors there and check them with a tool.',
  },
  'context-window': {
    moduleId: 3,
    sectionId: 6,
    referenceId: 'R5',
    focus:
      'What happens to over-long input depends on the tool, and you may not be told what the model did not see. Even inside the window, material in the middle of a long input is recalled less reliably. Check the output against the full source.',
  },
  'prediction-retrieval': {
    moduleId: 3,
    sectionId: 4,
    referenceId: 'R5',
    focus:
      'The model generates text that fits the pattern. Unless a document or search tool grounds it, it is not retrieving facts.',
  },
  tokenization: {
    moduleId: 3,
    sectionId: 2,
    referenceId: 'R5',
    focus:
      'Text is split into sub-word tokens, and less common text, including many non-English languages, splits into many more. That unevenness predicts where errors cluster.',
  },
  'capability-diagnosis': {
    moduleId: 3,
    sectionId: 9,
    referenceId: 'R5',
    focus:
      'Name the two properties behind a failure before you choose a fix. The diagnostic pair table maps each common failure to its pair.',
  },
  'task-decomposition': {
    moduleId: 4,
    sectionId: 2,
    referenceId: 'R2',
    focus:
      'Sort each component, not the whole task, into Human-Only, AI-Assisted, or Fully Delegated. Delegate a component when it stands alone and checking it costs less than producing it.',
  },
  'disclosure-accountability': {
    moduleId: 4,
    sectionId: 8,
    referenceId: 'R6',
    focus:
      'A diligence statement says which parts AI produced, what you checked, and what you changed, then states who takes responsibility for the final content.',
  },
  'verification-priority': {
    moduleId: 4,
    sectionId: 5,
    referenceId: 'R4',
    focus:
      'Rank claims by their specificity signals and by how hard they are to verify. Spend your checking time on the riskiest ones first.',
  },
  'structured-prompting': {
    moduleId: 4,
    sectionId: 3,
    referenceId: 'R3',
    focus:
      'Specify the product you want, the process the AI should follow, and how it should behave (performance). Most underspecified prompts miss all three at once.',
  },
};
