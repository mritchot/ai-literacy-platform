# Level 3: Behavior
## AI Literacy for the Modern Workforce

Within the [Kirkpatrick model](https://www.kirkpatrickpartners.com/the-kirkpatrick-model/), Level 3 measures whether participants apply what they learned to their on-the-job behavior. It is the tier that distinguishes knowing from doing, and therefore the tier that determines whether the program produced transfer. It is also the tier most AI training skips, which is the gap this instrument is built to close. The design measures what a participant does with AI, not how much they use it, sampled at 30, 60, and 90 days through two parallel instruments.

## The transfer problem this level exists to catch

The L&D literature documents a persistent gap between learning and application. Philippa Hardman's synthesis of the transfer research estimates that only 10 to 20% of learning investment produces measurable on-the-job behavior change, against a global L&D spend in the hundreds of billions of dollars annually.¹ An evaluation that stops at Level 2 cannot see this leak at all; it certifies that knowledge was acquired and assumes the rest. This instrument is designed to both measure the gap and create the conditions to close it, by adding indicators at 60 and 90 days that target the specific barriers (peer influence, manager reinforcement, organizational environment) where transfer tends to stall.

## Why usage volume is not behavioral change

Through early 2026, a growing number of organizations began measuring AI adoption through usage volume: token consumption, login frequency, leaderboards ranking employees by how much they used a tool. The approach is intuitive and wrong. It conflates activity with competency. A participant who generates thousands of tokens through single-turn, underspecified prompts and accepts first-generation output without verification registers as a high-usage employee on every volume metric, while demonstrating precisely the behaviors this program identifies as problematic: poor delegation, poor description, absent discernment, absent diligence. The research the program is built on shows why volume cannot proxy value: task-time savings range from 20% to 95% depending on the task ([Tamkin & McCrory, 2025](https://www.anthropic.com/research/estimating-ai-productivity-gains)), and 57% of AI-touched tasks are augmentation while 43% are automation ([Handa et al., 2025](https://www.anthropic.com/research/anthropic-economic-index)), so the value of an interaction depends entirely on what was delegated and how it was structured. The most competent user often shows lower consumption, because she decomposes the task, prompts well enough to need fewer iterations, and routes unreliable work back to her own hands.

The market reached the same conclusion the hard way. By late May 2026, [Fortune declared "tokenmaxxing" over](https://fortune.com/2026/05/28/tokenmaxxing-is-dead-companies-didnt-get-the-roi-from-ai-they-wanted-to-see/) as a measure of AI return, after Uber's COO [reported burning the company's entire annual AI budget in four months](https://fortune.com/2026/05/26/uber-coo-ai-spending-tokens-claude-code/) without a clean line to user value, Amazon deprecated an internal usage leaderboard, and Meta quietly removed its own. The reversal is corroboration rather than vindication, since the critique predates all of it, but it confirms the design principle: an organization that incentivizes volume rewards the highest-risk behavior, which is uncritical, high-volume delegation with no verification layer.

## Two instruments, anchored to evidence

A traditional observation checklist assumes a co-located manager who can watch the work. That assumption fails for distributed knowledge work, where structured prompting, citation verification, and task decomposition all happen invisibly at a workstation. The instrument addresses this with an evidence-informed parallel design:

- **Manager evidence review** rates each indicator from three sources: review of work artifacts (deliverables, documentation, shared prompt logs), a structured 15 to 20 minute check-in conversation, and any direct observation available. The manager is not assumed to have witnessed each behavior firsthand.
- **Participant self-assessment** rates the same indicators, but each rating must be accompanied by a specific recent example (situation, behavior, outcome). Fabricating a convincing, detailed example is substantially harder than checking a frequency box, which is the primary control against self-report inflation.

Both use a four-point frequency scale with no neutral midpoint, forcing a directional call between "occasionally" and "consistently," and topping out at "modeling for others," because peer modeling is how one person's competence becomes a team's. Where the two ratings agree, the behavioral change is well-evidenced. Where they diverge, the gap is the most useful signal in the instrument: a behavior the participant claims but the manager does not see could be a legibility problem, a self-report inflation problem, or a manager-orientation problem, and each points to a different intervention.

## Indicators organized by the 4D framework

The twelve indicators map to [Anthropic's 4D competency framework](https://www.anthropic.com/ai-fluency) (Delegation, Description, Discernment, Diligence) and to the program's action map. Each is phrased as a concrete, observable action, never a mindset: "verifies factual claims against independent sources before incorporating them" is measurable; "values accuracy" is not. Each is also classified by evidence type, which sets how much weight the manager review can carry:

- **Artifact-anchored** (structured prompting, iterative refinement, citation verification, AI-contribution documentation) produce reviewable work products and carry high confidence.
- **Conversation-anchored** (delegation reasoning, reasoning evaluation, open discussion of practices) are elicited through the check-in and carry moderate confidence.
- **Self-report** (capability-boundary recognition, accountability stance) are visible mainly to the participant and lean on the specificity requirement.

This graduated confidence model is a transparency mechanism, not an apology: organizations should weight artifact-anchored claims heavily and temper self-report claims accordingly, which is more honest than treating all twelve indicators as equally observable.

## Progressive intervals and convergence

The eight core indicators run at all three intervals to produce a trend line; transfer indicators (open discussion of practices, a concrete workflow change) are added at 60 days, and organizational-influence indicators (peer coaching, responsible dissent) at 90, because those behaviors require time to emerge. The 60-day open-discussion indicator targets the concealment dynamic directly: the [Anthropic Interviewer study](https://www.anthropic.com/research/anthropic-interviewer) found 69% of professionals conceal their AI use at work, and a competency program that builds private skill while ignoring the social conditions for visible use produces no change an organization can measure. The trend line is also a sustainability check: an indicator that rises from 30 to 60 days but falls by 90 signals a behavior adopted and then crowded out, which is a different problem than one never adopted, and the framework treats the difference as diagnostic rather than incidental.²

---

¹ *The transfer estimate and the global L&D spend figure are widely cited in the field but should be read as directional, since both depend heavily on how "behavior change" and "L&D spend" are defined across organizations.*

² *This is an evaluation instrument design, not a results report. No cohort has run these instruments; the program is an independent portfolio project not yet deployed at organizational scale. The behavioral indicators, rating scales, evidence-type classifications, interval design, and convergence-analysis protocol are complete and ready for a deploying organization to administer through its own HR or performance-management infrastructure. Attribution also remains inherently limited: behavioral change at 30, 60, or 90 days cannot be definitively separated from concurrent factors such as policy changes or independent learning.*

---

## Sources

- **Kirkpatrick Partners** — [*The Kirkpatrick Model*](https://www.kirkpatrickpartners.com/the-kirkpatrick-model/)
- **Anthropic** — [*AI Fluency: Framework and Foundations*](https://www.anthropic.com/ai-fluency) (the 4D competency framework)
- **Anthropic Interviewer** — [*What 1,250 Professionals Told Us About Working with AI*](https://www.anthropic.com/research/anthropic-interviewer) (Dec 2025) (69% concealment finding)
- **Tamkin, A. & McCrory, P.** — [*Estimating AI Productivity Gains from Claude Conversations*](https://www.anthropic.com/research/estimating-ai-productivity-gains) (Nov 2025)
- **Handa, K. et al. / Anthropic** — [*Anthropic Economic Index*](https://www.anthropic.com/research/anthropic-economic-index) (augmentation-automation split)
- **Fortune** — [*Tokenmaxxing is over*](https://fortune.com/2026/05/28/tokenmaxxing-is-dead-companies-didnt-get-the-roi-from-ai-they-wanted-to-see/) and [*Uber's AI budget burn*](https://fortune.com/2026/05/26/uber-coo-ai-spending-tokens-claude-code/) (May 2026)
- **Hardman, P.** — synthesis of the learning-transfer literature (transfer rate and L&D-spend estimates)
