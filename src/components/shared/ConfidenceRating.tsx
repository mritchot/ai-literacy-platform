// ConfidenceRating — optional three-level rating shown beside a knowledge
// check's Submit button. Skipping it is fine; a rating only feeds the
// calibration row on the completion profile and the dashboard.

import type { KeyboardEvent } from 'react';
import type { KCConfidence } from '../../contexts/LearnerProgressContext';
import { CONFIDENCE_LABEL, CONFIDENCE_LEVELS } from '../../utils/kc-calibration';
import { nextRadioIndex } from './radio-group-nav';

interface ConfidenceRatingProps {
  /** Prefix for element ids; must be unique on the page. */
  idBase: string;
  value: KCConfidence | null;
  onChange: (value: KCConfidence) => void;
}

export function ConfidenceRating({ idBase, value, onChange }: ConfidenceRatingProps): JSX.Element {
  const labelId = `${idBase}-confidence-label`;

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const next = nextRadioIndex(e.key, idx, CONFIDENCE_LEVELS.length);
    if (next === null) return;
    e.preventDefault();
    const level = CONFIDENCE_LEVELS[next];
    if (!level) return;
    onChange(level);
    document.getElementById(`${idBase}-confidence-${level}`)?.focus();
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span id={labelId} className="font-sans text-[12.5px] text-secondary">
        How sure are you? <span className="text-muted">(optional)</span>
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="flex gap-1.5">
        {CONFIDENCE_LEVELS.map((level, idx) => {
          const isSelected = value === level;
          return (
            <button
              key={level}
              type="button"
              id={`${idBase}-confidence-${level}`}
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected || (value === null && idx === 0) ? 0 : -1}
              onKeyDown={(e) => onKey(e, idx)}
              onClick={() => onChange(level)}
              className="font-sans text-[12px] transition-colors duration-[160ms]"
              style={{
                padding: '4px 10px',
                color: isSelected ? 'rgb(var(--ink))' : 'rgb(var(--body))',
                background: isSelected ? 'rgb(var(--surface))' : 'rgb(var(--white))',
                border: `1px solid ${isSelected ? 'rgb(var(--info))' : 'rgb(var(--border))'}`,
                boxShadow: isSelected ? 'inset 0 0 0 1px rgb(var(--info))' : 'none',
              }}
            >
              {CONFIDENCE_LABEL[level]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
