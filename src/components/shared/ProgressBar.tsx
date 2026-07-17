// ProgressBar — module-level progress sliver used in the sidebar.
// Track: border-light. Fill: action color (per design system 5.6).

interface ProgressBarProps {
  value: number; // 0–1
  height?: number;
  label?: string;
}

export function ProgressBar({ value, height = 3, label }: ProgressBarProps): JSX.Element {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Module progress'}
      className="overflow-hidden bg-border-light"
      style={{ height }}
    >
      <div
        className="h-full bg-action transition-[width] duration-300"
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}
