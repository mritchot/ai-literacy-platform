// QA dashboard — four panels rendered from ./quality-data: the defect taxonomy
// (a labeled bar breakdown summing to the ~65 total), the ten verification
// passes (a scrollable table), the triple-validation data protocol (three
// passes + the six-file results), and the eight-check capability framework.
// Every count is derived from the data, so the headline and the panels agree.
// Bars are decorative — each count is shown as text, so nothing is color-only.

import { Overline } from '../../components/shared/Overline';
import {
  CAPABILITY_CHECKS,
  DEFECT_CATEGORIES,
  DEFECT_TOTAL,
  QA_PASSES,
  VALIDATED_FILES,
  VALIDATION_PASSES,
  type CapabilityCheck,
} from './quality-data';

const BAR_MAX = Math.max(...DEFECT_CATEGORIES.map((d) => d.count));

function Section({ label, note, children }: { label: string; note?: string; children: React.ReactNode }): JSX.Element {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2.5">
        <Overline as="span">{label}</Overline>
        <span aria-hidden="true" className="h-px flex-1" style={{ background: 'rgb(var(--border-light))' }} />
      </div>
      {note && (
        <p className="m-0 mb-4 max-w-reading font-sans text-body-sm text-body" style={{ lineHeight: 1.6 }}>
          {note}
        </p>
      )}
      {children}
    </section>
  );
}

function DefectTaxonomy(): JSX.Element {
  return (
    <div>
      <div className="mb-5 flex items-baseline gap-3 rounded-xl" style={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border-light))', padding: '16px 20px' }}>
        <span className="font-mono text-[40px] font-bold leading-none" style={{ color: 'rgb(var(--info))' }}>
          {DEFECT_TOTAL}
        </span>
        <span className="font-sans text-body-sm text-body" style={{ lineHeight: 1.45 }}>
          defects identified across {DEFECT_CATEGORIES.length} categories — all resolved before or during the build.
          TypeScript strict mode then added a compile-time layer, catching type errors before runtime.
        </span>
      </div>
      <div className="space-y-3" role="img" aria-label={`Defect taxonomy: ${DEFECT_CATEGORIES.map((d) => `${d.category} ${d.count}`).join(', ')}.`}>
        {DEFECT_CATEGORIES.map((d) => (
          <div key={d.category} className="rounded-lg" style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border-light))', padding: '12px 16px' }}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="font-sans text-[13.5px] font-semibold text-ink">{d.category}</span>
              <span className="font-mono text-[13px] font-bold" style={{ color: 'rgb(var(--info))' }}>
                {d.count}
              </span>
            </div>
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgb(var(--surface))' }}>
              <div className="h-full rounded-full" style={{ width: `${(d.count / BAR_MAX) * 100}%`, background: 'rgb(var(--info))' }} />
            </div>
            <p className="m-0 font-sans text-[11.5px] text-body" style={{ lineHeight: 1.5 }}>
              {d.description} <span className="text-tertiary">— {d.resolution}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QaPassTable(): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left" style={{ minWidth: 640 }}>
        <thead>
          <tr>
            {['QA pass', 'Scope · sample', 'Result'].map((h) => (
              <th key={h} className="border-b border-border px-3 py-2 align-bottom font-sans text-label font-semibold uppercase text-ink-secondary">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {QA_PASSES.map((p) => (
            <tr key={p.activity}>
              <th scope="row" className="border-b border-border-light px-3 py-3 align-top" style={{ minWidth: 200 }}>
                <span className="block font-sans text-[13px] font-semibold text-ink">{p.activity}</span>
                <span className="mt-0.5 block font-sans text-[11px] text-tertiary" style={{ lineHeight: 1.45 }}>
                  {p.method}
                </span>
              </th>
              <td className="border-b border-border-light px-3 py-3 align-top font-sans text-[12px] text-body" style={{ minWidth: 150, lineHeight: 1.5 }}>
                {p.scope}
                <span className="mt-0.5 block font-mono text-[10.5px] text-tertiary">{p.sample}</span>
              </td>
              <td className="border-b border-border-light px-3 py-3 align-top font-sans text-[12px] text-body" style={{ lineHeight: 1.5 }}>
                {p.result}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TripleValidation(): JSX.Element {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {VALIDATION_PASSES.map((p) => (
          <div key={p.n} className="rounded-lg" style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border))', padding: '14px 16px' }}>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-bold" style={{ background: 'rgb(var(--info-light))', color: 'rgb(var(--info))' }}>
                {p.n}
              </span>
              <span className="font-sans text-[13px] font-semibold text-ink">{p.name}</span>
            </div>
            <p className="m-0 font-sans text-[11.5px] text-body" style={{ lineHeight: 1.55 }}>
              {p.detail}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left" style={{ minWidth: 560 }}>
          <thead>
            <tr>
              {['Data file', 'Source', 'Key content', 'Status'].map((h) => (
                <th key={h} className="border-b border-border px-3 py-2 font-sans text-label font-semibold uppercase text-ink-secondary">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VALIDATED_FILES.map((f) => (
              <tr key={f.file}>
                <th scope="row" className="border-b border-border-light px-3 py-2.5 align-top font-mono text-[11.5px] font-semibold text-ink" style={{ minWidth: 190 }}>
                  {f.file}
                </th>
                <td className="border-b border-border-light px-3 py-2.5 align-top font-sans text-[12px] text-secondary">{f.source}</td>
                <td className="border-b border-border-light px-3 py-2.5 align-top font-sans text-[12px] text-body" style={{ lineHeight: 1.5 }}>
                  {f.content}
                </td>
                <td className="border-b border-border-light px-3 py-2.5 align-top">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-mono text-[10.5px] font-semibold" style={{ background: 'rgb(var(--success-light))', color: 'rgb(var(--success))', padding: '3px 9px' }}>
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgb(var(--success))' }} />
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CheckTypeBadge({ type }: { type: CapabilityCheck['type'] }): JSX.Element {
  const token = type === 'Capability' ? 'info' : 'caution';
  return (
    <span
      className="inline-flex shrink-0 items-center rounded font-mono text-[9.5px] font-bold uppercase"
      style={{ background: `rgb(var(--${token}-light))`, color: `rgb(var(--${token}))`, padding: '2px 7px', letterSpacing: '0.06em' }}
    >
      {type}
    </span>
  );
}

function CapabilityFramework(): JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {CAPABILITY_CHECKS.map((c) => (
        <div key={c.check} className="rounded-lg" style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border))', padding: '13px 16px' }}>
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <span className="font-sans text-[13px] font-semibold text-ink">{c.check}</span>
            <CheckTypeBadge type={c.type} />
          </div>
          <p className="m-0 font-sans text-[11.5px] text-body" style={{ lineHeight: 1.55 }}>
            {c.criterion}
          </p>
        </div>
      ))}
    </div>
  );
}

export function QualityDashboard(): JSX.Element {
  return (
    <div className="mt-8">
      <Section label="Defect taxonomy">
        <DefectTaxonomy />
      </Section>
      <Section label="Ten verification passes">
        <QaPassTable />
      </Section>
      <Section label="Triple-validation data protocol" note="Six JSON data files each ran three dedicated validation passes — a stricter standard than a single-pass eval, because learners draw conclusions directly from the dashboards this data powers.">
        <TripleValidation />
      </Section>
      <Section label="Eight-check capability framework" note="Each check is Capability (does the output do what it should?) or Risk (what can go wrong that the learner cannot detect?). Risk checks matter most in learning contexts, because learners consume content without an answer key.">
        <CapabilityFramework />
      </Section>
    </div>
  );
}
