// KCCalibration — one row comparing knowledge-check confidence ratings with
// results: how often answers at each confidence level matched the
// recommended response, and how many confident answers missed it. Shown on
// the completion profile and the analytics dashboard.

import { Fragment } from 'react';
import type { KnowledgeCheckResult } from '../../contexts/LearnerProgressContext';
import {
  CONFIDENCE_LABEL,
  MIN_RATED_FOR_CALIBRATION,
  calibrationVerdict,
  computeCalibration,
} from '../../utils/kc-calibration';

export function KCCalibration({
  results,
}: {
  results: readonly (KnowledgeCheckResult | undefined)[];
}): JSX.Element | null {
  const summary = computeCalibration(results);
  if (summary.rated < MIN_RATED_FOR_CALIBRATION) return null;
  const bands = summary.bands.filter((b) => b.rated > 0);
  const verdict = calibrationVerdict(summary);

  return (
    <div
      className="font-sans"
      style={{
        background: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border-light))',
        padding: '12px 16px',
      }}
    >
      <p className="m-0 text-body-sm text-body">
        Confidence calibration:{' '}
        {bands.map((b, i) => (
          <Fragment key={b.level}>
            {i > 0 && ' · '}
            <strong className="text-ink">
              {CONFIDENCE_LABEL[b.level]}: {b.preferred} of {b.rated} preferred
            </strong>
          </Fragment>
        ))}
      </p>
      {(summary.certainMisses > 0 || verdict) && (
        <p className="m-0 mt-1 text-body-sm text-secondary">
          {summary.certainMisses > 0 &&
            `${summary.certainMisses} ${summary.certainMisses === 1 ? 'answer' : 'answers'} rated Certain missed the recommended response. `}
          {verdict}
        </p>
      )}
    </div>
  );
}
