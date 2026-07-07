// Architecture Decisions — interactive artifact page (`/#/build/architecture`).
// An expandable-card browser over the platform's technical decision records:
// seven adopted decisions plus the two hosting options evaluated and declined.
// Each card's header is a real <button> (aria-expanded/controls) so the browser
// is fully keyboard-navigable. Records live in ./architecture-data; prose is
// sliced from the co-located markdown (via ?raw).

import { useId, useState } from 'react';
import ARCH_MD from './content/03_architecture.md?raw';
import { renderMarkdown } from '../../components/shared/render-markdown';
import { Overline } from '../../components/shared/Overline';
import { ADRS, type Adr } from './architecture-data';
import { ArtifactFooter, ArtifactTopBar, SeriesEyebrow } from './chrome';

const [INTRO_MD = '', ...REST] = ARCH_MD.replace(/\r\n/g, '\n').split(/\n## /);
const SECTIONS = REST.map((part) => {
  const nl = part.indexOf('\n');
  return { heading: part.slice(0, nl).trim(), body: part.slice(nl + 1).trim() };
});

function StatusBadge({ status }: { status: Adr['status'] }): JSX.Element {
  const adopted = status === 'adopted';
  const token = adopted ? 'success' : 'error';
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full font-mono text-[9.5px] font-bold uppercase"
      style={{ padding: '2px 9px', border: `1px solid rgb(var(--${token}))`, color: `rgb(var(--${token}))`, letterSpacing: '0.08em' }}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: `rgb(var(--${token}))` }} />
      {adopted ? 'Adopted' : 'Declined'}
    </span>
  );
}

function AdrCard({ adr, expanded, onToggle }: { adr: Adr; expanded: boolean; onToggle: () => void }): JSX.Element {
  const panelId = useId();
  return (
    <div className="overflow-hidden rounded-lg" style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border))' }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 text-left transition-colors hover:bg-surface"
        style={{ padding: '15px 20px' }}
      >
        <span className="flex-1">
          <span className="mb-1 block font-mono text-overline font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
            {adr.category}
          </span>
          <span className="block font-sans text-[15px] font-semibold text-ink" style={{ lineHeight: 1.3 }}>
            {adr.decision}
          </span>
        </span>
        <StatusBadge status={adr.status} />
        <span aria-hidden="true" className="text-tertiary transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>
      {expanded && (
        <div id={panelId} className="border-t border-border-light" style={{ padding: '16px 20px' }}>
          {adr.rationale.map((p, i) => (
            <p key={i} className="m-0 mb-3 max-w-reading font-sans text-body-sm text-body last:mb-0" style={{ lineHeight: 1.65 }}>
              {p}
            </p>
          ))}
          {adr.config && (
            <div className="mt-4 flex flex-wrap gap-2">
              {adr.config.map((c, i) => (
                <span
                  key={i}
                  className="rounded-md font-mono text-[11px] text-secondary"
                  style={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border-light))', padding: '5px 10px' }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ArchitectureBrowser(): JSX.Element {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const allOpen = open.size === ADRS.length;

  const toggle = (id: string): void =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const setAll = (v: boolean): void => setOpen(v ? new Set(ADRS.map((a) => a.id)) : new Set());

  const adopted = ADRS.filter((a) => a.status === 'adopted');
  const declined = ADRS.filter((a) => a.status === 'declined');

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted">{ADRS.length} decisions</span>
        <button
          type="button"
          onClick={() => setAll(!allOpen)}
          className="font-sans text-[12px] font-semibold text-action hover:text-action-hover"
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <div className="space-y-2.5">
        {adopted.map((a) => (
          <AdrCard key={a.id} adr={a} expanded={open.has(a.id)} onToggle={() => toggle(a.id)} />
        ))}
      </div>

      <div className="mb-4 mt-8 flex items-center gap-2.5">
        <Overline as="span">Evaluated and declined</Overline>
        <span aria-hidden="true" className="h-px flex-1" style={{ background: 'rgb(var(--border-light))' }} />
      </div>
      <div className="space-y-2.5">
        {declined.map((a) => (
          <AdrCard key={a.id} adr={a} expanded={open.has(a.id)} onToggle={() => toggle(a.id)} />
        ))}
      </div>
    </div>
  );
}

export default function Architecture(): JSX.Element {
  return (
    <div className="mx-auto max-w-interactive px-4 py-12 sm:px-8 lg:px-16 lg:py-14">
      <ArtifactTopBar pdfSlug="architecture" />
      <SeriesEyebrow label="Behind the build · Design" />

      <h1 className="m-0 mb-2 font-display text-display font-normal text-ink">Architecture Decisions</h1>
      <p className="m-0 mb-6 font-sans text-h3 font-normal text-secondary">AI Literacy for the Modern Workforce</p>

      <div className="max-w-reading">{renderMarkdown(INTRO_MD.trim())}</div>

      <ArchitectureBrowser />

      {SECTIONS.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="mb-3 font-sans text-h2 font-semibold text-ink">{s.heading}</h2>
          <div className="max-w-reading">{renderMarkdown(s.body)}</div>
        </section>
      ))}

      <ArtifactFooter currentSlug="architecture" />
    </div>
  );
}
