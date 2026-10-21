// Recall questions that open Modules 2, 3, and 4 (RetrievalWarmup).
// Each set draws on the previous module, and the Module 3 and 4 sets mix
// in one item from further back, so the learner has to tell similar
// categories apart. Every answer restates what the cited section
// teaches; when that section's wording changes, update the answer here.

export type WarmupModuleId = 2 | 3 | 4;

export interface WarmupItem {
  id: string;
  prompt: string;
  answer: string;
  taughtIn: { moduleId: 1 | 2 | 3; sectionId: number };
}

export const RETRIEVAL_WARMUPS: Record<WarmupModuleId, readonly WarmupItem[]> = {
  2: [
    {
      id: 'a',
      prompt: 'Name the four competencies in the 4D framework and what each one covers.',
      answer:
        'Delegation: deciding what to hand to AI and what to keep. Description: specifying the task, across product, process, and performance. Discernment: judging what comes back. Diligence: using AI responsibly, documenting its role, and owning what you ship.',
      taughtIn: { moduleId: 1, sectionId: 5 },
    },
    {
      id: 'b',
      prompt: 'When people hide their AI use, what does the organization lose? Name two.',
      answer:
        'Any two of four: peer learning stops, best practices stay invisible, productivity gains become unmeasurable, and duplicated effort compounds.',
      taughtIn: { moduleId: 1, sectionId: 4 },
    },
    {
      id: 'c',
      prompt: 'In your own words, what separates augmentation from automation?',
      answer:
        'In augmentation, you use AI to enhance your own thinking and you still shape the work. In automation, you hand the task to AI and accept the result with little back-and-forth.',
      taughtIn: { moduleId: 1, sectionId: 3 },
    },
  ],
  3: [
    {
      id: 'a',
      prompt:
        'Inside the conversation, Claude’s own estimates put the median task’s time savings at 81%. Controlled trials of the full work cycle found 14–56%. What accounts for part of the gap?',
      answer:
        'Verification and refinement: the time people spend after the conversation turning AI output into a reliable deliverable. The report offers two other possible reasons: it cannot see work done after the conversation ends, and the trials tested earlier models.',
      taughtIn: { moduleId: 2, sectionId: 4 },
    },
    {
      id: 'b',
      prompt:
        'Do professionals overestimate or underestimate how much they collaborate with AI, and by roughly how much?',
      answer:
        'They overestimate it. Self-reports run 8 to 18 percentage points more collaborative than the behavioral data, depending on the measurement.',
      taughtIn: { moduleId: 2, sectionId: 3 },
    },
    {
      id: 'c',
      prompt: 'Which 4D competency decides what goes to AI, and which one judges what comes back?',
      answer: 'Delegation decides what goes to AI. Discernment judges what comes back.',
      taughtIn: { moduleId: 1, sectionId: 5 },
    },
  ],
  4: [
    {
      id: 'a',
      prompt:
        'Name the property pair behind each failure: (1) a fluent report that cites a paper that does not exist; (2) a long session where the tool stops following your constraints; (3) a confident arithmetic error.',
      answer:
        '(1) Next-token prediction and knowledge. (2) Context window and steerability. (3) Tokenization and next-token prediction.',
      taughtIn: { moduleId: 3, sectionId: 9 },
    },
    {
      id: 'b',
      prompt:
        'Name the three task categories where reliability is structurally limited, with one example of each.',
      answer:
        'Boundary tasks, such as arithmetic, spelling, and non-English text. Specificity tasks, such as citations, statistics, quotes, and dates. Volume tasks, such as long documents, multi-source synthesis, and long conversations.',
      taughtIn: { moduleId: 3, sectionId: 9 },
    },
    {
      id: 'c',
      prompt:
        'Compiling information from reports shows about 95% time savings inside the conversation. Why might it still be a poor task to hand off without checks?',
      answer:
        'Time savings and verification burden are separate axes. A fabricated citation in the compiled output stays invisible unless someone checks every source.',
      taughtIn: { moduleId: 2, sectionId: 4 },
    },
  ],
};
