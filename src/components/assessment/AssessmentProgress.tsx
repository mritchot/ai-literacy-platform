// AssessmentProgress — compact "Question N of T" indicator + thin progress
// bar shown at the top of each assessment item screen. Visual style mirrors
// the program ProgressBar so the assessment surfaces feel native to the
// platform without dragging in the section/module breadcrumb chrome.

import { Overline } from '../shared/Overline';

interface AssessmentProgressProps {
  current: number; // 1-indexed item number
  total: number;
  /** Pre vs post is shown as a small caption so a learner who lands
   *  mid-flow knows which assessment they're in. */
  kindLabel: string;
}

export function AssessmentProgress({
  current,
  total,
  kindLabel,
}: AssessmentProgressProps): JSX.Element {
  const pct = Math.max(0, Math.min(1, current / total));
  return (
    <div
      className="mb-6 flex flex-col gap-2"
      // Accessible programmatic progress for screen readers. The visual
      // bar below is decorative; this delivers the same information in
      // text form to AT.
      role="group"
      aria-label={`${kindLabel} progress: question ${current} of ${total}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Overline>{kindLabel}</Overline>
        <span
          className="font-mono text-[12px] font-semibold text-secondary"
          style={{ letterSpacing: '0.04em' }}
        >
          Question {current} of {total}
        </span>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-border-light"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-action transition-[width] duration-300 ease-out"
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}
