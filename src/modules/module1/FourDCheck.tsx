// FourDCheck — two unscored practice items after the 4D cards in M1 S5.
// They contrast Discernment and Diligence on one running scenario, so the
// second stem continues the first. Keys `1.5.vocab_*` sit outside the
// `.kc_` pattern, so the 16-item knowledge-check aggregates do not change.
//
// Source for the boundary: Dakan & Feller (2025) put relevance and
// soundness of an output under Product Discernment (p. 5), and disclosure
// plus vouching for the result under Transparency and Deployment
// Diligence (p. 6). No feedback here calls pre-release fact-checking
// Discernment.

import {
  KnowledgeCheck,
  type KnowledgeCheckItemData,
} from '../../components/shared/KnowledgeCheck';

const VOCAB_1: KnowledgeCheckItemData = {
  id: 'vocab_1',
  objectiveRef: '1.3',
  stem: (
    <p className="m-0">
      A colleague asks an AI tool to draft a market summary for a client deck. Reading the draft,
      she notices that its argument rests on consumer trends, while the client sells only to
      other businesses, so the summary does not answer the client’s question. Which competency
      is she using?
    </p>
  ),
  options: [
    {
      id: 'a',
      text: 'Delegation',
      isPreferred: false,
      feedbackTitle: 'Not quite',
      feedbackTone: 'caution',
      feedbackText:
        'Delegation was the earlier decision: whether the summary could go to AI at all. Judging whether the draft answers the client’s question is Discernment.',
    },
    {
      id: 'b',
      text: 'Description',
      isPreferred: false,
      feedbackTitle: 'Not quite',
      feedbackTone: 'caution',
      feedbackText:
        'Description is how she asked: the task, constraints and format she gave the tool. A clearer request might have prevented the miss, but spotting it in the output is Discernment.',
    },
    {
      id: 'c',
      text: 'Discernment',
      isPreferred: true,
      feedbackTitle: 'Correct',
      feedbackTone: 'success',
      feedbackText:
        'Judging whether an output is relevant, sound and fit for its purpose is Discernment.',
    },
    {
      id: 'd',
      text: 'Diligence',
      isPreferred: false,
      feedbackTitle: 'Not quite',
      feedbackTone: 'caution',
      feedbackText:
        'Diligence is the accountability layer: standing behind the work once it goes out, disclosing AI’s role and owning the result. Judging whether this draft answers the client’s question is Discernment.',
    },
  ],
};

const VOCAB_2: KnowledgeCheckItemData = {
  id: 'vocab_2',
  objectiveRef: '1.3',
  stem: (
    <p className="m-0">
      She rewrites the summary and adds a line to the deck: the market summary was drafted with
      an AI tool, every figure was checked against its source, and she is responsible for the
      content. Which competency is that line?
    </p>
  ),
  options: [
    {
      id: 'a',
      text: 'Delegation',
      isPreferred: false,
      feedbackTitle: 'Not quite',
      feedbackTone: 'caution',
      feedbackText:
        'Delegation decided what went to AI. This line reports that decision to the reader and takes ownership of the result, which is Diligence.',
    },
    {
      id: 'b',
      text: 'Description',
      isPreferred: false,
      feedbackTitle: 'Not quite',
      feedbackTone: 'caution',
      feedbackText:
        'Description shaped the request to the tool. This line is addressed to the reader, not the tool. Disclosing AI’s role and owning the result is Diligence.',
    },
    {
      id: 'c',
      text: 'Discernment',
      isPreferred: false,
      feedbackTitle: 'Not quite',
      feedbackTone: 'caution',
      feedbackText:
        'Evaluating the draft was Discernment. Telling the reader how AI contributed and taking responsibility for the content is Diligence.',
    },
    {
      id: 'd',
      text: 'Diligence',
      isPreferred: true,
      feedbackTitle: 'Correct',
      feedbackTone: 'success',
      feedbackText:
        'Disclosing how AI contributed and taking ownership of the final product is Diligence. It makes the rest of her work visible to the reader.',
    },
  ],
};

const FOUR_D_PRACTICE_ITEMS: KnowledgeCheckItemData[] = [VOCAB_1, VOCAB_2];

export function FourDCheck(): JSX.Element {
  return (
    <div className="space-y-4">
      <p className="m-0">Try two cases that separate Discernment from Diligence.</p>
      <ul className="m-0 list-none space-y-6 p-0">
        {FOUR_D_PRACTICE_ITEMS.map((item, idx) => (
          <li key={item.id}>
            <KnowledgeCheck
              moduleId={1}
              sectionId={5}
              item={item}
              itemNumber={idx + 1}
              totalItems={FOUR_D_PRACTICE_ITEMS.length}
              variant="practice"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
