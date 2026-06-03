# Needs-analysis artifact PDFs

Polished, downloadable PDFs of the four needs-analysis artifacts live here,
produced separately (Claude Design) against the platform style guide. They are
served as standalone files in dist/needs-analysis/ (vite-plugin-singlefile
leaves public/ assets uninlined, same as public/reference/).

Expected files (slugs match src/pages/needs-analysis/config.ts):
  - executive-problem-statement.pdf
  - capability-gap-analysis.pdf
  - learner-persona.pdf
  - action-map.pdf

Until a file lands, its Download PDF button stays hidden (the per-slug
constant in config.ts is empty).
