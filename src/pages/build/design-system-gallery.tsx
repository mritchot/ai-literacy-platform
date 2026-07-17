// Design-system gallery — the live style guide surface. A light/dark toggle
// drives a `.ds-preview` scope whose token variables are re-declared for both
// modes (see design-system-data.previewScopeCss), so every swatch, type
// specimen, and live component renders in the chosen mode regardless of the
// app's global theme. The 4D-competency-only constraint is demonstrated inline.
//
// The gallery renders the real shared components (CompetencyDot, KnowledgeCheck,
// ReflectionPrompt) — not facsimiles — so the guide can never drift from what
// the platform ships. The live components use synthetic module id 0 so their
// state stays isolated from real learner progress.

import { useState } from 'react';
import { CompetencyDot } from '../../components/shared/CompetencyDot';
import { Overline } from '../../components/shared/Overline';
import { KnowledgeCheck, type KnowledgeCheckItemData } from '../../components/shared/KnowledgeCheck';
import { ReflectionPrompt } from '../../components/shared/ReflectionPrompt';
import {
  ACTION_TOKENS,
  COMPETENCY_SWATCHES,
  FEEDBACK_TOKENS,
  NEUTRAL_TOKENS,
  TYPE_SPECS,
  previewScopeCss,
  tripleToHex,
  type CompetencySpec,
  type TokenSpec,
  type TypeSpec,
} from './design-system-data';

type Mode = 'light' | 'dark';

// ─── Swatches ──────────────────────────────────────────────────────────

function Swatch({ token, mode }: { token: TokenSpec; mode: Mode }): JSX.Element {
  const triple = token[mode];
  return (
    <div className="overflow-hidden" style={{ border: '1px solid rgb(var(--border))', background: 'rgb(var(--white))' }}>
      <div className="h-11" style={{ background: `rgb(${triple})` }} />
      <div style={{ padding: '8px 10px' }}>
        <div className="font-mono text-[11px] font-semibold text-ink">--{token.name}</div>
        <div className="font-mono text-[10px] text-tertiary">{tripleToHex(triple)}</div>
        <div className="mt-1 font-sans text-[10.5px] text-muted" style={{ lineHeight: 1.4 }}>
          {token.usage}
        </div>
      </div>
    </div>
  );
}

function SwatchGrid({ tokens, mode }: { tokens: TokenSpec[]; mode: Mode }): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {tokens.map((t) => (
        <Swatch key={t.name} token={t} mode={mode} />
      ))}
    </div>
  );
}

function CompetencyRow({ spec, mode }: { spec: CompetencySpec; mode: Mode }): JSX.Element {
  const tints: { label: string; hex: string }[] = [
    { label: 'accent', hex: spec.bgHex[mode] },
    { label: 'light', hex: spec.lightHex[mode] },
    { label: 'mid', hex: spec.mid },
    { label: 'text', hex: spec.textHex[mode] },
  ];
  return (
    <div style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border))', padding: '14px 16px' }}>
      <div className="mb-3">
        <CompetencyDot competency={spec.key} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {tints.map((t) => (
          <div key={t.label}>
            <div className="h-9" style={{ background: t.hex, border: '1px solid rgb(var(--border-light))' }} />
            <div className="mt-1 font-mono text-[9.5px] font-semibold text-secondary">{t.label}</div>
            <div className="font-mono text-[9px] text-tertiary">{t.hex.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── The one constraint ────────────────────────────────────────────────

function CompetencyConstraint(): JSX.Element {
  return (
    <div
      style={{ background: 'rgb(var(--surface-warm))', border: '1px solid rgb(var(--border))', borderLeft: '3px solid rgb(var(--info))', padding: '16px 20px' }}
    >
      <Overline className="mb-2" style={{ color: 'rgb(var(--info))' }}>
        The one rule
      </Overline>
      <p className="m-0 mb-4 max-w-reading font-sans text-body-sm text-body" style={{ lineHeight: 1.6 }}>
        The 4D competency colors are reserved for competency tagging — swatches, tags, and
        competency-scoped accents. They are <strong className="text-ink">never</strong> used for
        general UI: buttons, links, and navigation use the dedicated <span className="font-mono">--action</span>{' '}
        teal instead. This is what keeps the colors semantic: when a learner sees the olive, it always
        means Delegation.
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-bold" style={{ color: 'rgb(var(--success))' }}>
            ✓
          </span>
          <CompetencyDot competency="delegation" />
          <span className="font-sans text-[11px] text-tertiary">competency tag</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-bold" style={{ color: 'rgb(var(--error))' }}>
            ✗
          </span>
          <span
            aria-hidden="true"
            className="font-sans text-[12px] font-semibold"
            style={{
              background: 'rgb(var(--delegation))',
              color: 'rgb(var(--white))',
              padding: '8px 16px',
              opacity: 0.55,
            }}
          >
            Continue
          </span>
          <span className="font-sans text-[11px] text-tertiary">never a button</span>
        </div>
      </div>
    </div>
  );
}

// ─── Typography ────────────────────────────────────────────────────────

function TypeSpecimen({ spec }: { spec: TypeSpec }): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border-light py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <div className={`${spec.className} min-w-0 flex-1`}>{spec.sample}</div>
      <div className="shrink-0 font-mono text-[10.5px] text-tertiary sm:text-right">
        <span className="text-secondary">--{spec.token}</span> · {spec.family} · {spec.spec}
      </div>
    </div>
  );
}

// ─── Component specimens ───────────────────────────────────────────────

// The segmented control that replaced the platform's filter and toggle
// pills. Static — a specimen, not a live control.
function SegmentedControlSpecimen(): JSX.Element {
  const segments = ['Top 14', 'All countries', 'By tier'];
  return (
    <div
      aria-hidden="true"
      className="inline-flex"
      style={{ border: '1px solid rgb(var(--border))', background: 'rgb(var(--surface))' }}
    >
      {segments.map((s, i) => {
        const active = i === 0;
        return (
          <span
            key={s}
            className="font-sans text-[12.5px]"
            style={{
              padding: '5px 14px',
              borderLeft: i > 0 ? '1px solid rgb(var(--border))' : undefined,
              background: active ? 'rgb(var(--white))' : 'transparent',
              color: active ? 'rgb(var(--ink))' : 'rgb(var(--tertiary))',
              fontWeight: active ? 600 : 500,
            }}
          >
            {s}
          </span>
        );
      })}
    </div>
  );
}

// Square, hairline-bordered surfaces at three densities. The system has no
// radius scale left to specimen: corners are square everywhere except a
// handful of true circles (radio bullets, state dots).
function CardSpecimens(): JSX.Element {
  const cards: { label: string; pad: string; bg: string; note: string }[] = [
    { label: 'Raised card', pad: '20px 24px', bg: 'rgb(var(--white))', note: 'Sits above the page ground. The card color, not a shadow, is what lifts it.' },
    { label: 'Recessed surface', pad: '16px', bg: 'rgb(var(--surface))', note: 'Sits below the ground: insets, segmented-control tracks, hover dips.' },
    { label: 'Dense surface', pad: '12px 16px', bg: 'rgb(var(--surface))', note: 'Same recess at table and list density. One hairline, one weight, everywhere.' },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} style={{ background: c.bg, border: '1px solid rgb(var(--border))', padding: c.pad }}>
          <div className="font-sans text-[12.5px] font-semibold text-ink">{c.label}</div>
          <div className="mt-1 font-sans text-[11.5px] text-body" style={{ lineHeight: 1.5 }}>
            {c.note}
          </div>
        </div>
      ))}
    </div>
  );
}

function ButtonSpecimens(): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="bg-action font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] dark:text-[rgb(var(--canvas))] hover:bg-action-hover"
        style={{ padding: '10px 24px' }}
      >
        Primary
      </button>
      <button
        type="button"
        className="font-sans text-[12.5px] font-semibold text-ink hover:bg-surface"
        style={{ background: 'transparent', border: '1px solid rgb(var(--border))', padding: '10px 24px' }}
      >
        Secondary
      </button>
      <button
        type="button"
        className="font-sans text-[12.5px] font-semibold text-tertiary hover:bg-surface hover:text-secondary"
        style={{ background: 'transparent', padding: '8px 16px' }}
      >
        Ghost
      </button>
    </div>
  );
}

// Self-referential knowledge check demonstrating the live component.
const DEMO_KC: KnowledgeCheckItemData = {
  id: 'ds-demo',
  objectiveRef: 'DS',
  stem: 'A reviewer toggles the preview above to dark and notices the four competency accents shift to lighter values rather than holding the hues they carry in light mode. What is the best explanation?',
  options: [
    {
      id: 'a',
      text: 'An accent has to hold contrast against the ground it sits on, and no single value clears that bar on both washi paper and sumi ink — so each competency carries a light-mode value and a dark-mode value of the same hue.',
      isPreferred: true,
      feedbackTitle: 'Correct: contrast is measured against a ground',
      feedbackText:
        'Exactly. A mid-tone that reads on paper goes muddy on sumi. Each accent keeps its hue — olive stays olive — while its lightness inverts, so a competency stays recognizable without any of the four dropping below AA. This is why the accents are CSS variables rather than literal hexes: a literal cannot flip.',
      feedbackTone: 'success',
    },
    {
      id: 'b',
      text: 'It is a rendering bug: the competency accents are brand colors and should be identical in both modes.',
      isPreferred: false,
      feedbackTitle: 'That was the old rule',
      feedbackText:
        'The palette did once hold the accents fixed across modes, on the reasoning that a brand color is theme-invariant. The problem is that contrast is not a property of a color — it is a property of a color against a ground. Holding one value fixed meant accepting a failing ratio on one of the two.',
      feedbackTone: 'error',
    },
    {
      id: 'c',
      text: 'Dark mode only affects neutral tokens and never touches semantic color.',
      isPreferred: false,
      feedbackTitle: 'Partly, but not quite',
      feedbackText:
        'Nearly every semantic family shifts: feedback, action, and the competency accents all carry a value per mode. What stays fixed is the meaning attached to each hue, not the hue’s lightness.',
      feedbackTone: 'caution',
    },
  ],
};

// ─── Section wrapper ───────────────────────────────────────────────────

function GallerySection({ label, children, note }: { label: string; children: React.ReactNode; note?: string }): JSX.Element {
  return (
    <section className="mt-8">
      <div className="mb-4 border-b border-border-light pb-2">
        <Overline>{label}</Overline>
        {note && <p className="m-0 mt-1.5 font-sans text-[12px] text-tertiary">{note}</p>}
      </div>
      {children}
    </section>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────

export function DesignSystemGallery(): JSX.Element {
  const [mode, setMode] = useState<Mode>('light');

  return (
    <div className="mt-8">
      {/* Scoped token stylesheet — declares both modes for `.ds-preview`. */}
      <style>{previewScopeCss()}</style>

      {/* Mode toggle — a control, so it follows the app's global theme. */}
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-overline font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
          Preview
        </span>
        <div
          role="group"
          aria-label="Preview color mode"
          className="inline-flex"
          style={{ border: '1px solid rgb(var(--border))', background: 'rgb(var(--surface))' }}
        >
          {(['light', 'dark'] as const).map((m, i) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className="font-sans text-[12px] font-semibold capitalize transition-colors duration-[160ms]"
              style={{
                padding: '6px 16px',
                borderLeft: i > 0 ? '1px solid rgb(var(--border))' : undefined,
                background: mode === m ? 'rgb(var(--white))' : 'transparent',
                color: mode === m ? 'rgb(var(--ink))' : 'rgb(var(--tertiary))',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* The themed preview surface. */}
      <div
        className="ds-preview"
        data-theme={mode}
        aria-label={`Design system preview in ${mode} mode`}
        style={{ border: '1px solid rgb(var(--border))', padding: '24px 26px' }}
      >
        <GallerySection label="Color · 4D competency" note="The platform's primary semantic palette. Each accent keeps its hue across modes and inverts its lightness, so contrast holds against whichever ground it sits on.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {COMPETENCY_SWATCHES.map((c) => (
              <CompetencyRow key={c.key} spec={c} mode={mode} />
            ))}
          </div>
          <div className="mt-4">
            <CompetencyConstraint />
          </div>
        </GallerySection>

        <GallerySection label="Color · Neutrals" note="A warm ink scale: no pure grays, and no pure white — the lightest surface is washi paper, and the page ground is a shade under it.">
          <SwatchGrid tokens={NEUTRAL_TOKENS} mode={mode} />
        </GallerySection>

        <GallerySection label="Color · Feedback" note="Muted and earthy, not saturated traffic-light colors. Used only for knowledge-check feedback and system states.">
          <SwatchGrid tokens={FEEDBACK_TOKENS} mode={mode} />
        </GallerySection>

        <GallerySection label="Color · Action & focus" note="A dedicated interactive teal, outside the 4D palette, so competency colors never do double duty as buttons — and a vermilion focus ring, off both, so a focus state can never be mistaken for a hover.">
          <SwatchGrid tokens={ACTION_TOKENS} mode={mode} />
        </GallerySection>

        <GallerySection label="Typography" note="Source Serif 4 for the two top heading levels; IBM Plex Sans for everything functional; IBM Plex Mono for anything countable or codified.">
          <div>
            {TYPE_SPECS.map((s) => (
              <TypeSpecimen key={s.token} spec={s} />
            ))}
          </div>
        </GallerySection>

        <GallerySection label="Components · Tags & controls" note="The capsule is retired. A competency reads as a square swatch against its label, and a choice between views reads as one segmented control rather than a row of loose pills.">
          <div className="space-y-5">
            <div>
              <div className="mb-2 font-mono text-[10px] font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
                Competency tag (CompetencyDot)
              </div>
              <div className="flex flex-wrap gap-4">
                {COMPETENCY_SWATCHES.map((c) => (
                  <CompetencyDot key={c.key} competency={c.key} />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
                Segmented control
              </div>
              <SegmentedControlSpecimen />
            </div>
          </div>
        </GallerySection>

        <GallerySection label="Components · Cards" note="Square, hairline-bordered. Depth is carried by the surface color against the ground — there are no drop shadows in the system.">
          <CardSpecimens />
        </GallerySection>

        <GallerySection label="Components · Buttons">
          <ButtonSpecimens />
        </GallerySection>

        <GallerySection label="Components · Knowledge check" note="The live shared component: select a response to see consequence-based feedback.">
          <KnowledgeCheck moduleId={0} sectionId={1} item={DEMO_KC} itemNumber={1} totalItems={1} />
        </GallerySection>

        <GallerySection label="Components · Reflection prompt" note="The live shared component: a private, ungraded reflection with the Diligence accent.">
          <ReflectionPrompt
            moduleId={0}
            sectionId={1}
            promptId="ds-demo"
            promptText="Where in your own work do you let color carry meaning that a label should carry instead? Note one place you could add a text or icon cue."
          />
        </GallerySection>
      </div>
    </div>
  );
}
