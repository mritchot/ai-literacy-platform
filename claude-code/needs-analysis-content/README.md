# needs-analysis content — generated build input (do not edit here)

These four files are **synced copies**, not the source of truth. The artifact
pages import them via Vite `?raw`
(`src/pages/needs-analysis/{ProblemStatement,CapabilityGap,LearnerPersona,ActionMap}.tsx`),
so they have to live inside the repo — but the canonical versions you edit live
in the Cowork workspace.

**Canonical source (edit there):**
`~/My Drive/02_professional/00_independent-work/01_personal-website/008_I-built-an-AI-course/008c_needs-analysis/008c_*.md`

| Build input (here)                  | Canonical source (Cowork)             |
|-------------------------------------|---------------------------------------|
| `01_executive-problem-statement.md` | `008c_executive-problem-statement.md` |
| `02_capability-gap-analysis.md`     | `008c_capability-gap-analysis.md`     |
| `03_learner-persona.md`             | `008c_learner-persona.md`             |
| `04_action-map.md`                  | `008c_action-map.md`                  |

## To update

1. Edit the canonical `008c_*.md` files in the Cowork folder.
2. Run the sync script from the repo root:

   ```
   bash claude-code/sync-content.sh
   ```

3. Review `git diff`, commit the updated copies, and rebuild/redeploy.

Anything edited directly in this folder is overwritten on the next sync. The
sync is a **local pre-commit step** — never a build hook, since Cloudflare
builds from the committed copies and has no access to the Drive.
