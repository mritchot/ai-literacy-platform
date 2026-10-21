// Unscored prediction shown before the P4 dashboard (M2 S5). Its key,
// `2.5.pred_2_5`, sits outside the `.kc_` pattern, so it does not count
// toward the 16-item knowledge-check aggregate. Kept apart from
// knowledge-check-items.tsx, which holds only the scored S7 items.
//
// Lee et al. (2025, p. 12) report shares of examples (936 examples from
// 319 workers), not shares of workers, so every figure below is stated
// per example.

import type { KnowledgeCheckItemData } from '../../components/shared/KnowledgeCheck';

export const P4_EFFORT_PREDICTION: KnowledgeCheckItemData = {
  id: 'pred_2_5',
  objectiveRef: '2.2',
  stem: (
    <p className="m-0">
      A survey of 319 knowledge workers collected 936 examples of AI use at work. For each
      example, workers said whether AI made six kinds of thinking more or less effortful, from
      recalling facts to judging quality. For which kind did the smallest share of examples
      report that AI made the work easier?
    </p>
  ),
  options: [
    {
      id: 'a',
      text: 'Recalling facts, terms, and basic concepts',
      isPreferred: false,
      feedbackTitle: 'Most examples said AI made this easier',
      feedbackTone: 'caution',
      feedbackText:
        'In 72% of examples, workers said AI made recall less effortful. The exception was judging quality: only 55% of examples reported less effort for evaluation, the lowest of the six (Lee et al., 2025, p. 12). AI eased checking less than it eased producing.',
    },
    {
      id: 'b',
      text: 'Summarizing and organizing information',
      isPreferred: false,
      feedbackTitle: 'Most examples said AI made this easier',
      feedbackTone: 'caution',
      feedbackText:
        'In 79% of examples, workers said AI made summarizing and organizing less effortful, the highest share of the six. The exception was judging quality: only 55% of examples reported less effort for evaluation (Lee et al., 2025, p. 12). AI eased checking less than it eased producing.',
    },
    {
      id: 'c',
      text: 'Combining ideas into something new',
      isPreferred: false,
      feedbackTitle: 'Most examples said AI made this easier',
      feedbackTone: 'caution',
      feedbackText:
        'In 76% of examples, workers said AI made combining ideas less effortful. The exception was judging quality: only 55% of examples reported less effort for evaluation, the lowest of the six (Lee et al., 2025, p. 12). AI eased checking less than it eased producing.',
    },
    {
      id: 'd',
      text: 'Judging whether work meets a standard',
      isPreferred: true,
      feedbackTitle: 'Correct: checking is where the effort stays',
      feedbackTone: 'success',
      feedbackText:
        'For every other kind of thinking, 69% to 79% of examples reported less effort with AI. Judging quality was the exception at 55% (Lee et al., 2025, p. 12). Workers described the added work as stewardship: turning intent into a query, steering the response, and judging whether it meets the standard while staying accountable for it (pp. 12–13). That checking time is what the in-conversation savings in this dashboard leave out.',
    },
  ],
};
