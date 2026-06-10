# Level 4: Results
## AI Literacy for the Modern Workforce

Within the [Kirkpatrick model](https://www.kirkpatrickpartners.com/the-kirkpatrick-model/), Level 4 measures whether the behavioral changes documented at Level 3 produced measurable organizational outcomes. It is the tier that connects individual competency to business results, and therefore the tier executives actually care about. This document is an evaluation blueprint, not a results report: the program is a portfolio piece with no organizational deployment, so no Level 4 data exists. What follows is a complete, ready-to-populate methodology, with a worked example that demonstrates how the model operates once an organization supplies its own data.

## The attribution chain

The value of a four-level framework is the attribution chain it produces, because no single level makes the causal argument alone. Level 1 establishes that the program was perceived as relevant. Level 2 establishes that it produced knowledge gains. Level 3 establishes that the knowledge moved into workplace behavior. Level 4 observes that the organizational metrics those behaviors target then improved. The argument becomes credible only when the links connect: the program was relevant, produced understanding, changed behavior, and the outcomes those behaviors drive moved in the expected direction. Strip out Level 3 and any Level 4 result is exposed to the obvious question: how do you know the program caused it?

## Why adoption metrics are not results

The dominant failure mode at this tier is the volume-ROI calculation: deploy AI tools to N employees, measure that X% activated and Y% use them weekly, multiply by a vendor-estimated time saving, and report a number with a dollar sign. It is the structural equivalent of estimating a gym's health benefit by counting badge swipes at the door, since the turnstile count says nothing about whether anyone trained. The weakness is the assumption in the multiplication step, that each unit of usage yields a uniform unit of value, which the research directly contradicts: savings range from 20% to 95% by task ([Tamkin & McCrory, 2025](https://www.anthropic.com/research/estimating-ai-productivity-gains)), and value depends on whether an interaction was augmentation or automation and how it was structured ([Handa et al., 2025](https://www.anthropic.com/research/anthropic-economic-index)). The cost of ignoring this arrives as an invoice: Uber's COO [reported burning the company's entire annual AI budget in four months](https://fortune.com/2026/05/26/uber-coo-ai-spending-tokens-claude-code/) without a clean line to user value, and within days [Fortune declared the metric dead](https://fortune.com/2026/05/28/tokenmaxxing-is-dead-companies-didnt-get-the-roi-from-ai-they-wanted-to-see/). This framework measures outcomes downstream of competent use instead, and treats adoption as an input condition, not a result.

## The KPI framework

KPIs are organized into four categories, each tracing back to specific Level 3 behaviors, and organizations select from them based on which outcomes matter and which they already have the infrastructure to measure:

- **Efficiency gains** — time-to-first-draft and revision cycles, read together. A faster draft that needs more rounds is not a gain; only when speed improves and revision holds or falls has efficiency improved rather than merely shifted.
- **Quality improvements** — the rate of AI-related errors (fabricated citations, incorrect statistics, unsupported claims). This is the most consequential category, because quality is a risk measure with non-linear value: preventing one high-impact error in a regulatory filing can outweigh an entire cohort's efficiency gains.
- **Adoption maturation** — behavioral transparency and concealment reduction, the organizational analog of the individual behavior change at Level 3, targeting the [69% concealment baseline](https://www.anthropic.com/research/anthropic-interviewer). A workforce where 90% use AI but 70% hide it has a more fragile posture than one where 60% use it openly.
- **Capability development** — peer coaching incidence, and time-to-competency for newly introduced tools. The latter is the strategically decisive metric: if alumni onboard to new AI tools faster than non-participants, the program produced transferable literacy rather than tool-specific training, which compounds as organizations adopt more tools through 2030 ([WEF Future of Jobs Report, 2025](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf)).

## What is measurable at enterprise scale

A deploying organization will ask where this data comes from, and the answer cuts against the easy assumption that the AI vendor supplies it. What the major providers expose to administrators is usage telemetry, not outcomes. [ChatGPT Enterprise](https://help.openai.com/en/articles/10875114-user-analytics-for-chatgpt-enterprise-and-edu) reports active users, message volumes, and top tools; [Claude Enterprise](https://support.claude.com/en/articles/12883420-view-usage-analytics-for-team-and-enterprise-plans) reports conversation and message counts, projects, and seat utilization; [Gemini for Workspace](https://support.google.com/a/answer/14564320) reports active users and per-app feature usage across Gmail and Docs. Every one of those is an adoption metric, the same volume signal this framework rejects as a results measure. The conversation content that could support a quality judgment sits behind a compliance or eDiscovery interface built for litigation, not performance evaluation.

The consequence is that the Level 4 KPIs that matter do not come from the AI provider at all. Efficiency and quality measures (revision cycles, time-to-first-draft, AI-attributable error rate) come from the organization's own systems: the project tracker, version history, QA and incident logs, and review workflows. Some, such as a clean count of AI-caused errors, require new instrumentation, because most organizations do not yet tag errors by cause. This is why baseline establishment is a deployment prerequisite rather than an afterthought: the provider hands the organization an adoption dashboard, and the outcomes the framework actually needs are the organization's to instrument.

## Isolating the program's contribution

Attribution is the central methodological challenge, and the framework is honest that every technique produces an estimate, not a proof. It uses several in combination, in decreasing order of rigor: a comparison-group design where deployment is phased, trend-line analysis against pre-program baselines, and manager and participant estimation of the share of improvement attributable to the program, collected independently and adjusted downward for optimism. The result is reported as a range. The ROI model uses the lower bound by default, which makes the business case deliberately conservative: if the return is positive at the lowest defensible attribution, the case is strong; if it is positive only at the upper bound, it should be communicated as speculative.

## The ROI model, populated conservatively

The model calculates two independently attributed benefit streams, efficiency and quality, against total program cost. The worked example runs a 200-person deployment at a mid-sized professional services firm, with every input set conservatively against the documented evidence:

- Efficiency benefit: 200 participants x $120,000 fully loaded cost x 25% of time on AI-eligible tasks (against 57% documented) x 30% time savings (against an 81% in-conversation median) x 40% attribution (against a 100% claim) = $720,000.
- Quality benefit: $400,000 estimated annual cost of AI-related failures x 20% reduction x 40% attribution = $32,000.
- Total benefit $752,000 against a $180,000 program cost yields a **318% ROI**.

Even with conservative inputs at every step, the projection is strongly positive, and the model is most sensitive to three variables: attribution, time savings, and the percentage of work that is actually AI-eligible. Halving attribution still returns a positive 109%. The figure is not a claim about this program's realized return; it is a demonstration that the program was built with results measurement in its architecture from inception, ready for an organization to repopulate with its own baselines.¹

---

¹ *No Level 4 data exists because the program has not been deployed at organizational scale. Causal certainty is unattainable outside a randomized controlled trial, which is rarely feasible organizationally; the combined isolation techniques produce a defensible estimate reported as a range, not a proof. The model also requires pre-program baselines for every tracked KPI, so baseline establishment is a prerequisite for deployment rather than an afterthought, and some outcomes (cultural transparency, time-to-competency for future tools) may take longer than twelve months to fully materialize.*

---

## Sources

- **Kirkpatrick Partners** — [*The Kirkpatrick Model*](https://www.kirkpatrickpartners.com/the-kirkpatrick-model/)
- **Fortune** — [*Uber's AI budget burn*](https://fortune.com/2026/05/26/uber-coo-ai-spending-tokens-claude-code/) and [*Tokenmaxxing is over*](https://fortune.com/2026/05/28/tokenmaxxing-is-dead-companies-didnt-get-the-roi-from-ai-they-wanted-to-see/) (May 2026)
- **Tamkin, A. & McCrory, P.** — [*Estimating AI Productivity Gains from Claude Conversations*](https://www.anthropic.com/research/estimating-ai-productivity-gains) (Nov 2025)
- **Handa, K. et al. / Anthropic** — [*Anthropic Economic Index*](https://www.anthropic.com/research/anthropic-economic-index) (augmentation-automation split)
- **Anthropic Interviewer** — [*What 1,250 Professionals Told Us About Working with AI*](https://www.anthropic.com/research/anthropic-interviewer) (Dec 2025) (69% concealment baseline)
- **World Economic Forum** — [*Future of Jobs Report 2025*](https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf) (Jan 2025)
