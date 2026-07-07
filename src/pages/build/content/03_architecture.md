Every technical decision behind the custom platform, recorded before implementation began so the AI development partner had a single reference to build against. This is the architecture decision record: seven adopted decisions, and the two hosting options evaluated and declined. Expand any card for the decision and its rationale.

The through-line is deployment simplicity and reviewability — choices that keep the build one static artifact any reviewer can open, read, and verify.

## The standards these encode

The decisions here sit on a set of standards carried through implementation as non-negotiable: TypeScript strict mode with no `any` except as a documented last resort; zero console errors in production; WCAG 2.1 AA as a floor rather than an enhancement; semantic HTML landmarks on every page; and a mandatory header comment on every component and data file, the latter citing its source. This page — and the seven others in this series — were built to the same standards.
