/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 4D competency palette (Section 1.1). Variable-driven, like
        // every other color here — these were literal hexes, which is
        // precisely why dark mode could not flip them.
        delegation: 'rgb(var(--delegation) / <alpha-value>)',
        description: 'rgb(var(--description) / <alpha-value>)',
        discernment: 'rgb(var(--discernment) / <alpha-value>)',
        diligence: 'rgb(var(--diligence) / <alpha-value>)',

        // Warm neutrals (Section 1.3) — exposed as CSS variables so dark mode flips them
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-secondary': 'rgb(var(--ink-secondary) / <alpha-value>)',
        body: 'rgb(var(--body) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        tertiary: 'rgb(var(--tertiary) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        subtle: 'rgb(var(--subtle) / <alpha-value>)',
        ghost: 'rgb(var(--ghost) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'border-light': 'rgb(var(--border-light) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-warm': 'rgb(var(--surface-warm) / <alpha-value>)',
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        white: 'rgb(var(--white) / <alpha-value>)',

        // Feedback colors (Section 1.4) — variable so dark mode shifts hue
        success: {
          DEFAULT: 'rgb(var(--success) / <alpha-value>)',
          light: 'rgb(var(--success-light) / <alpha-value>)',
        },
        caution: {
          DEFAULT: 'rgb(var(--caution) / <alpha-value>)',
          light: 'rgb(var(--caution-light) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'rgb(var(--error) / <alpha-value>)',
          light: 'rgb(var(--error-light) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--info) / <alpha-value>)',
          light: 'rgb(var(--info-light) / <alpha-value>)',
        },

        // Action — primary CTA color (Section 1.6) — variable so dark mode flips
        action: {
          DEFAULT: 'rgb(var(--action) / <alpha-value>)',
          hover: 'rgb(var(--action-hover) / <alpha-value>)',
          active: 'rgb(var(--action-active) / <alpha-value>)',
        },

        // Focus — vermilion keyboard-focus ring (Section 9.2)
        focus: 'rgb(var(--focus) / <alpha-value>)',
      },

      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },

      fontSize: {
        // Type scale (Section 2.2) — exact values, no approximations
        display: ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        title: ['26px', { lineHeight: '1.25', letterSpacing: '-0.005em' }],
        h2: ['22px', { lineHeight: '1.3' }],
        h3: ['18px', { lineHeight: '1.35' }],
        h4: ['16px', { lineHeight: '1.4' }],
        body: ['16px', { lineHeight: '1.65' }],
        'body-sm': ['14px', { lineHeight: '1.55' }],
        label: ['12px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        caption: ['11px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        overline: ['10px', { lineHeight: '1.4', letterSpacing: '0.1em' }],
      },

      maxWidth: {
        reading: '680px',
        interactive: '960px',
      },

      screens: {
        // Three breakpoints (Section 10e of architecture)
        sm: '768px',
        lg: '1024px',
      },

      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(.4, .0, .2, 1)',
      },
    },
  },
  plugins: [],
};
