# Level 2: Learning
## AI Literacy for the Modern Workforce

Within the [Kirkpatrick model](https://www.kirkpatrickpartners.com/the-kirkpatrick-model/), Level 2 measures whether participants actually acquired the intended knowledge, as distinct from whether they liked the program (Level 1), changed their behavior (Level 3), or produced organizational results (Level 4). It is the only level of this framework with empirical evidence behind it, and the evidence is qualified, so this document is careful to state what the data supports and what it does not. The instrument is a ten-item, scenario-based pre/post assessment embedded in the program as a mandatory gate, with no skip option in any platform mode, because without paired pre and post measurement the level cannot function.

## A parallel-form design that resists gaming

The pre and post assessments measure the same ten constructs through different workplace scenarios. This parallel-form construction controls the primary threat to a pre/post design, which is test-retest memory: a participant cannot transfer a recalled answer when the scenario, the framing, and the distractors have all changed. One further control reinforces it. The correct answer letter shifts on eight of the ten construct pairs (only tokenization and output verification keep their position), defeating position-based recall.

The scenario format matters for a second reason. A definitional recall item ("Which of the following best defines tokenization?") can be reverse-engineered by a capable test-taker who never engaged the content, because the phrasing telegraphs the key. A scenario stem ("Given this situation, what should you recognize or do?"), paired with distractors drawn from documented misconceptions, is far harder to pattern-match, because the participant has to recognize the underlying construct in an unfamiliar context. The assessment measures applied understanding, not vocabulary recall, and its feedback is consequence-based: each option explains the realistic workplace result of acting on that reasoning, which turns the post-assessment into a final learning moment rather than a bare score.

## What the ten constructs cover

The items span four blocks that follow the program's instructional progression, and every item traces backward to a documented capability gap and forward to one of the program's seventeen performance objectives:

- **Usage patterns (2 items)** — the gap between self-reported collaborative AI use and observed single-turn directive use, and the coexistence of high time savings with high verification burden.
- **Failure modes (3 items)** — fluent fabrication (confident, specific output generated rather than retrieved), boundary-task failure, and context-window limits.
- **Mechanics (3 items)** — prediction versus retrieval, tokenization, and the integrative skill of attributing a specific failure to a specific architectural property.
- **Evaluation (2 items)** — which claims in a deliverable carry the highest fabrication risk, and how structural prompt specification drives output quality.

Scoring is binary per item with no weighting, because all four domains are treated as equally load-bearing components of the competency model. Learning gain is the simple post-minus-pre delta, framed positively in the interface: with a ten-item instrument, a stable score most often reflects a strong baseline reinforced rather than a failure, so a zero delta reads as "solid foundation" rather than a penalty. Beyond the aggregate, the admin view exposes a per-construct breakdown, so a participant who improved overall but missed verification priority on both assessments is flagged for targeted follow-up rather than averaged into a single number.

## Thresholds as ranges, not cutoffs

The program uses directional thresholds rather than fixed pass/fail lines, for two reasons: a ten-item instrument lacks the precision for high-stakes certification, and different organizations operate in different risk contexts. A post-assessment score of 8 to 10 indicates readiness for on-the-job application and Level 3 monitoring; 6 to 7 indicates core acquisition with specific gaps; below that prompts a check of engagement data before any conclusion. A single item swing equals ten percentage points, which is exactly why the framework reports bands rather than precise cutoffs. A formative layer complements the summative instrument: sixteen scenario-based knowledge checks and three interpretation checks distributed across the modules reveal when knowledge was acquired, not merely that it was, adding temporal resolution the pre/post delta cannot reach.

## Validity, and the one number that is real

Content validity rests on systematic traceability: each construct derives from a specific finding in the research corpus, including the augmentation-automation split ([Handa et al., 2025](https://www.anthropic.com/research/anthropic-economic-index)), the productivity-verification gap ([Tamkin & McCrory, 2025](https://www.anthropic.com/research/estimating-ai-productivity-gains)), the mechanics of fluent fabrication and tokenization ([Karpathy, 2025](https://www.youtube.com/watch?v=7xTGNNLPyMI); [Anthropic, 2026](https://anthropic.skilljar.com/ai-capabilities-and-limitations)), and the verification-priority finding ([Lee et al., CHI 2025](https://doi.org/10.1145/3706598.3713778)). Construct validity is addressed by the parallel-form controls above, and face validity by scenarios built around recognizable roles (marketing director, project manager, legal analyst) with no abstract or academic framing.

The empirical anchor is prior, not present. The instructional design underlying this program was validated in my M.Ed. capstone (Ritchot, Western Governors University, June 2025), which piloted the tokenization instruction with ten participants in a mixed-methods pre/post design: pre-assessment scores averaged 3.1 out of 5, post-assessment scores averaged 4.5, and nine of ten participants showed positive gains, with triangulation across reflections and a scenario task confirming the knowledge transferred. That result validates the design, not this specific ten-item corporate instrument, and it came from a different population, secondary students rather than the mid-career professionals this program targets, so it carries as suggestive support rather than proof. The corporate instrument has no [Cronbach's alpha](https://www.scribbr.com/statistics/cronbachs-alpha/) or item-discrimination data, because those require a first deployment cohort. The honest position is that this is a second iteration on a validated foundation, not a first-generation prototype, which is a meaningfully different claim from "trust me, it works."¹

---

¹ *The instructional design has prior empirical support (the capstone pilot); the specific ten-item instrument awaits its first deployment cohort for psychometric reliability data. A single-cohort pre/post design without a control group also cannot fully isolate program effects from maturation or concurrent learning, a standard limitation in corporate L&D where control groups are rarely feasible. The parallel-form design mitigates the largest confound (test-retest memory) but does not eliminate every threat to internal validity.*

---

## Sources

- **Kirkpatrick Partners** — [*The Kirkpatrick Model*](https://www.kirkpatrickpartners.com/the-kirkpatrick-model/)
- **Handa, K. et al. / Anthropic** — [*Anthropic Economic Index*](https://www.anthropic.com/research/anthropic-economic-index) (augmentation-automation task split)
- **Tamkin, A. & McCrory, P.** — [*Estimating AI Productivity Gains from Claude Conversations*](https://www.anthropic.com/research/estimating-ai-productivity-gains) (Nov 2025)
- **Lee, H. et al.** — [*The Impact of Generative AI on Critical Thinking*](https://doi.org/10.1145/3706598.3713778), CHI 2025
- **Karpathy, A.** — [*Deep Dive into LLMs like ChatGPT*](https://www.youtube.com/watch?v=7xTGNNLPyMI) (2025)
- **Anthropic** — [*AI Capabilities and Limitations*](https://anthropic.skilljar.com/ai-capabilities-and-limitations) (2026)
- **Ritchot, M.** — M.Ed. Capstone, Western Governors University (June 2025), prior pre/post validation of the tokenization instruction
