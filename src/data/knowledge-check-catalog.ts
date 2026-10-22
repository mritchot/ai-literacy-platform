// Every knowledge check in the program with the section it lives in,
// in program order. The refresher draws its recall set from this list.
// Storage keys match KnowledgeCheck's `${moduleId}.${sectionId}.${id}`;
// KCReview and CompletionSummary's ALL_KC_KEYS use the same mapping.

import type { KnowledgeCheckItemData } from '../components/shared/KnowledgeCheck';
import { MODULE_1_KC_ITEMS } from '../modules/module1/knowledge-check-items';
import { MODULE_2_KC_ITEMS } from '../modules/module2/knowledge-check-items';
import { MODULE_3_KC_ITEMS } from '../modules/module3/knowledge-check-items';
import { MODULE_4_KC_ITEMS_S4, MODULE_4_KC_ITEMS_S7 } from '../modules/module4/knowledge-check-items';

export interface KnowledgeCheckEntry {
  /** `${moduleId}.${sectionId}.${item.id}` */
  storageKey: string;
  /** Learner-facing label, e.g. "KC-3.2". */
  displayLabel: string;
  moduleId: 1 | 2 | 3 | 4;
  sectionId: number;
  item: KnowledgeCheckItemData;
}

function entries(
  moduleId: KnowledgeCheckEntry['moduleId'],
  sectionId: number,
  items: KnowledgeCheckItemData[],
  firstNumber = 1,
): KnowledgeCheckEntry[] {
  return items.map((item, idx) => ({
    storageKey: `${moduleId}.${sectionId}.${item.id}`,
    displayLabel: `KC-${moduleId}.${firstNumber + idx}`,
    moduleId,
    sectionId,
    item,
  }));
}

export const KNOWLEDGE_CHECK_CATALOG: readonly KnowledgeCheckEntry[] = [
  ...entries(1, 7, MODULE_1_KC_ITEMS),
  ...entries(2, 7, MODULE_2_KC_ITEMS),
  ...entries(3, 10, MODULE_3_KC_ITEMS),
  ...entries(4, 4, MODULE_4_KC_ITEMS_S4),
  ...entries(4, 7, MODULE_4_KC_ITEMS_S7, MODULE_4_KC_ITEMS_S4.length + 1),
];
