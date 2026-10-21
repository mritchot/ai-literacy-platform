// FasterPeopleCallout — Module 1 S4 two-figure callout ("Faster people,
// flat organizations"). Same visual family as `BottleneckCallout`
// (bordered aside, left accent, h4 title) with a pair of large figures
// above the body prose. Accent uses the Diligence competency token.
// Source: McKinsey, The state of AI in 2026 (1,719 respondents).

import { Citation } from '../../components/shared/Citation';

const TITLE = 'Faster people, flat organizations';

const FIGURES: { value: string; label: string }[] = [
  { value: '80%', label: 'respondents who say AI improved their own productivity' },
  { value: '37%', label: 'respondents who report any positive effect on their organization’s earnings' },
];

export function FasterPeopleCallout(): JSX.Element {
  return (
    <aside
      role="note"
      aria-label={`Key concept: ${TITLE}`}
      className="border border-border bg-surface-warm"
      style={{
        borderLeft: '3px solid rgb(var(--diligence))',
        padding: '16px 20px',
      }}
    >
      <h4 className="m-0 mb-3 font-sans text-h4 font-semibold text-ink">{TITLE}</h4>
      <dl className="m-0 mb-3 grid gap-4 sm:grid-cols-2">
        {FIGURES.map((f) => (
          <div key={f.value} className="m-0">
            <dt
              className="m-0 font-display text-ink"
              style={{ fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.01em' }}
            >
              {f.value}
            </dt>
            <dd className="m-0 mt-1 font-sans text-body-sm text-secondary">{f.label}</dd>
          </div>
        ))}
      </dl>
      <p
        className="m-0 mb-2 font-mono text-caption text-muted"
        style={{ letterSpacing: '0.02em' }}
      >
        Both from the 2026 McKinsey survey of 1,719 respondents
        <Citation ids="mckinsey-state-of-ai-2026" pageKey="individual-vs-enterprise" />.
      </p>
      <p className="m-0 font-sans text-body-sm text-body">
        The 37% was essentially unchanged from 2025. The few organizations reporting significant
        returns from AI were about three times as likely as others to have redesigned workflows
        <Citation ids="mckinsey-state-of-ai-2026" pageKey="workflow-redesign-74" /> and twice as
        likely to have defined processes for measuring impact
        <Citation ids="mckinsey-state-of-ai-2026" pageKey="measure-impact-2x" />. Concealment
        is the individual-level face of the same problem: gains that stay private cannot be
        measured, shared, or built on.
      </p>
    </aside>
  );
}
