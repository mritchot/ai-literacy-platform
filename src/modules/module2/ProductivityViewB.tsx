// P4 View B — Task-level example cards. Nine real tasks spanning 96% to
// 56% time savings, grouped by accent color into "information assembly"
// (top three, caution accent) and "physical-world / troubleshooting" (bottom
// two, info accent). Spec §5.4.

import { formatCurrency, formatPercent } from '../../utils/chart-config';
import { useChartTokens } from '../../hooks/useChartTokens';

interface TaskExample {
  occupation: string;
  task: string;
  time_without_ai_hours: number;
  hourly_wage: number;
  task_cost_usd: number;
  time_savings_pct: number;
}

interface ProductivityViewBProps {
  tasks: TaskExample[];
}

type Accent = 'caution' | 'info' | 'none';

function accentFor(index: number, total: number): Accent {
  if (index < 3) return 'caution';
  if (index >= total - 2) return 'info';
  return 'none';
}

export function ProductivityViewB({ tasks }: ProductivityViewBProps): JSX.Element {
  const tokens = useChartTokens();
  // Accent hexes resolve through useChartTokens so the group coding
  // (legend swatches, card border accents, savings-bar fills) flips
  // with the theme.
  const accentColor: Record<Accent, string | null> = {
    caution: tokens.caution,
    info: tokens.info,
    none: null,
  };
  return (
    <div className="space-y-5">
      <p className="m-0 font-sans text-body-sm text-body">
        Nine real tasks from the productivity dataset, spanning the full range from 96% to 56%
        time savings. Each card shows the task's labor cost before AI and what's left after
        applying the time savings; the gap between the two figures is the recovered value per
        occurrence. The tasks at the high end concentrate on information assembly: fast for AI,
        hardest to verify. The tasks at the low end involve physical-world or troubleshooting
        work where the speed gain is smaller but the output is more verifiable.
      </p>

      <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block rounded-full" style={{ width: 10, height: 10, background: tokens.caution }} />
          Information assembly: highest savings, hardest to verify
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block rounded-full" style={{ width: 10, height: 10, background: tokens.info }} />
          Physical-world / troubleshooting: lower savings, more verifiable
        </span>
      </div>

      <ul
        className="m-0 grid list-none gap-4 p-0"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          // `1fr` rows force every row in a row-band to match the tallest
          // card in that row, so every visible card has uniform height.
          gridAutoRows: '1fr',
        }}
      >
        {tasks.map((t, i) => {
          const accent = accentFor(i, tasks.length);
          const cardAccent = accentColor[accent];
          return (
            <li
              key={`${t.occupation}-${i}`}
              className="flex flex-col rounded-lg bg-[rgb(var(--white))]"
              style={{
                border: '1px solid rgb(var(--border))',
                borderLeft: cardAccent ? `3px solid ${cardAccent}` : '1px solid rgb(var(--border))',
                padding: '14px 18px',
              }}
            >
              <div className="mb-1 font-sans text-[12.5px] font-semibold text-secondary">{t.occupation}</div>
              <div className="mb-3 font-sans text-body text-ink">{t.task}</div>
              {/* Spacer pushes the meta + savings bar to the bottom of the
                  card so each card's bar/data row sits on the same baseline. */}
              <div className="flex-1" />
              {/* Two-line metadata. Line 1: duration + wage (the inputs that
                  produce the cost figures). Line 2: the before/after cost
                  comparison with an arrow glyph emphasizing the transition.
                  This is the visual anchor for the labor-cost framing — the
                  arrow makes the savings legible without arithmetic. */}
              <div className="mb-1 font-mono text-[11.5px] text-tertiary">
                <span>{t.time_without_ai_hours.toFixed(1)} hrs without AI</span>
                <span className="mx-1.5 text-ghost">·</span>
                <span>{formatCurrency(t.hourly_wage)}/hr wage</span>
              </div>
              <div className="mb-2 font-mono text-[11.5px] text-secondary">
                <span>{formatCurrency(t.task_cost_usd)} without AI</span>
                <span aria-hidden="true" className="mx-1.5 text-ghost">→</span>
                <span>{formatCurrency(t.task_cost_usd * (1 - t.time_savings_pct / 100))} with AI</span>
              </div>
              <SavingsBar value={t.time_savings_pct} accent={cardAccent} />
            </li>
          );
        })}
      </ul>

      <p className="m-0 font-mono text-caption text-muted" style={{ letterSpacing: '0.02em' }}>
        The full distribution peaks between 80–90% savings. The examples above are selected to show the range, not the center.
      </p>
      <p className="m-0 font-mono text-caption text-muted" style={{ letterSpacing: '0.02em' }}>
        Source: Tamkin & McCrory, Nov 2025, Figure 4, p. 7.
      </p>

      <p
        className="m-0 font-sans text-body italic text-secondary"
        style={{ marginTop: 32, marginBottom: 16 }}
      >
        Before you continue, think about your own task mix. Which of the nine tasks above is
        closest to work you do? Where would your most common AI-assisted task fall on
        this range: closer to the 95% compiling end, or the 56% troubleshooting end?
      </p>
    </div>
  );
}

function SavingsBar({ value, accent }: { value: number; accent: string | null }): JSX.Element {
  const tokens = useChartTokens();
  const pct = Math.max(0, Math.min(100, value));
  const fill = accent ?? tokens.secondary;
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex-1 overflow-hidden rounded-sm"
        style={{ height: 8, background: 'rgb(var(--border-light))' }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 transition-[width] duration-300"
          style={{ width: `${pct}%`, background: fill, opacity: accent ? 0.85 : 0.6 }}
        />
      </div>
      <span className="font-mono text-[13px] font-semibold text-ink">{formatPercent(value)}</span>
    </div>
  );
}
