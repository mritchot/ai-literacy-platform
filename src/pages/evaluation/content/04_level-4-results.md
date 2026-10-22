# Level 4: Results

Within the Kirkpatrick model{{cite:kirkpatrick-partners}}, Level 4 measures whether the behavioral changes documented at Level 3 produced measurable organizational outcomes. It is the tier that connects individual competency to business results, and therefore the tier executives care about. This document is an evaluation blueprint, not a results report: the program is a portfolio piece with no organizational deployment, so no Level 4 data exists. What follows is the complete methodology, the KPI framework, the isolation techniques, and a worked ROI example that shows how the model operates once an organization supplies its own data.

## The attribution chain

Level 1 establishes that the program was perceived as relevant. Level 2 establishes that it produced knowledge gains. Level 3 establishes that the knowledge moved into workplace behavior. Level 4 observes that the organizational metrics those behaviors target then improved. The argument becomes credible only when the links connect: the program was relevant, produced understanding, changed behavior, and the outcomes those behaviors drive moved in the expected direction. Strip out Level 3 and any Level 4 result is exposed to the obvious question: how do you know the program caused it?

## Why adoption metrics are not results

The dominant failure mode at this tier is the volume-ROI calculation: deploy AI tools to N employees, measure that X% activated and Y% use them weekly, multiply by a vendor-estimated time saving, and report a number with a dollar sign. It is the equivalent of estimating a gym's health benefit by counting badge swipes at the door: the swipe count says nothing about whether anyone trained. The weakness is the assumption that each unit of usage yields a uniform unit of value, which the research contradicts: estimated in-conversation savings run from about 20% to about 95% across named tasks, with most tasks between 50% and 95%{{cite:tamkin-mccrory-2025}}, and value depends on whether an interaction was augmentation or automation and how it was structured{{cite:handa-2025}}. Ignoring this has a direct cost: Uber's COO reported burning the company's entire annual AI budget in four months without a clean line to user value{{cite:fortune-uber-2026}}, and within days Fortune declared the metric dead{{cite:fortune-tokenmaxxing-2026}}.

This framework measures outcomes downstream of competent use, and treats adoption as an input condition, not a result. The vendor research agrees. OpenAI's enterprise study concludes that rapid adoption should not be equated with immediate productivity transformation{{cite:chatterji-2026#adoption-not-deployment}}. It also finds that, among adopting public companies, larger firms record lower measured use per employee, a pattern the authors say may reflect a mechanical or organizational scaling effect{{cite:chatterji-2026#firm-size-scaling-13-14}}.

The same gap between adoption and results appears in organizations worldwide. In McKinsey's 2026 global survey, nearly nine in ten respondents report regular AI use in their organization and 80% report personal productivity gains. Yet 37% report any positive effect on their organization's earnings, a figure flat on the year despite more organizations scaling. Respondents do cite other organization-wide benefits, most notably innovation, competitive differentiation, and customer and employee satisfaction, and even those reporting no earnings effect say AI has reduced costs in specific business functions{{cite:mckinsey-state-of-ai-2026#adoption-vs-earnings-5-12-14}}.

The measurement problem is structural. Charting the Atlanta Fed's December 2025 survey of US CFOs, analyst Benedict Evans sorts the reported AI impacts into two kinds. Productivity-type gains are easy to deploy and hard to measure. Cost savings and new revenue are the reverse: hard to deploy, easy to measure (Baslandze et al.){{cite:evans-2026-05#cfo-impact-35}}. Usage researchers make a related point from the supply side: the unit that matters is cost per successful outcome, not cost per token{{cite:openrouter-a16z-2025#cost-per-outcome-54}}.

## What is measurable at enterprise scale

A deploying organization will ask where this data comes from, and the answer cuts against the easy assumption that the AI vendor supplies it. What the major providers expose to administrators is mostly usage telemetry, not outcomes. OpenAI's own research on that telemetry measures three things per organization-week: messages, active users, and output tokens{{cite:chatterji-2026#telemetry-metrics-7}}. Its authors state that the task results, drawn from classified message content, do not measure downstream work products, productivity effects, or changes in organizational routines{{cite:chatterji-2026#no-downstream-outcomes}}. ChatGPT Enterprise reports seats, weekly active users, messages per active user, and usage by project and skill{{cite:openai-analytics-guide-2026,openai-user-analytics-2026}}; Claude Enterprise reports active members against assigned seats, chats, projects, and artifacts{{cite:anthropic-usage-analytics-2026}}; Gemini for Workspace reports active users and usage per app and per feature{{cite:google-gemini-usage-2026}}. Every one of those is an adoption metric, the same volume signal this framework rejects as a results measure.

OpenAI and Anthropic now add impact measures, and they do not change that conclusion. Both run user surveys: OpenAI sends workspace users a fixed impact survey{{cite:openai-analytics-guide-2026#impact-survey}}, and Anthropic lets administrators ask users short in-product questions about what they get out of Claude{{cite:anthropic-usage-analytics-2026#surveys}}. Anthropic also shows an estimated time saved and, for its coding tool, productivity estimates whose inputs the administrator can adjust to the organization's own assumptions{{cite:anthropic-usage-analytics-2026#time-saved-value}}. A survey answer is self-report, the kind of evidence Module 2 shows drifting from observed behavior. An estimate built on assumed inputs is a projection, not a measurement. Neither records whether the work got better. The conversation content that could support a quality judgment is not in the analytics at all: OpenAI's guide states that workspace analytics exposes no message text and sends administrators who need raw records to its Compliance API{{cite:openai-analytics-guide-2026#compliance-api}}, an interface built for compliance, not performance evaluation.

The consequence is that the KPIs that matter do not come from the AI provider at all. Efficiency and quality measures come from the organization's own systems: the project tracker, version history, QA and incident logs, and review workflows. Some, such as a clean count of AI-caused errors, require new instrumentation, because most organizations do not yet tag errors by cause. Baseline establishment is therefore a deployment prerequisite: the provider hands the organization an adoption dashboard, and the outcomes the framework needs are the organization's to instrument. That instrumentation is one of the practices separating organizations that report significant AI returns from the rest. They are twice as likely to have defined processes to quantify the impact of their AI initiatives{{cite:mckinsey-state-of-ai-2026#measure-impact-2x}}.

## The KPI framework

KPIs fall into four categories, each tracing back to specific Level 3 behaviors. Organizations select from them based on which outcomes matter and which they already have the infrastructure to measure. Employers say the outcomes they most expect from training investment are enhanced productivity (77%), competitiveness (70%), and talent retention (65%){{cite:wef-2025#training-investment-48}}. Those are expectations, not measured results, which is why this framework measures outcomes. The efficiency and quality KPIs speak to productivity; this framework does not measure competitiveness or retention directly.

None of the KPIs assumes a profit motive. In a university, hospital, or public agency, E1–E3 count staff time returned to core work and Q1 counts errors avoided. The ROI Institute has also published a guide to the same method for government training programs{{cite:phillips-phillips-2009}}.

**Efficiency gains** (read together: a faster draft that needs more rounds is not a gain)

| KPI | Definition | Source | L3 trace |
|---|---|---|---|
| E1 Time-to-first-draft | Time from assignment to first draft for AI-eligible tasks | PM data (ticket/doc timestamps) | B1, B3, B4 |
| E2 Revision cycles | Average revision rounds before acceptance | Review/approval workflow logs | B5, B6, B8 |
| E3 Rework rate | Share of deliverables needing substantive post-delivery correction | QA / client-feedback systems | B2, B5, B8 |

**Quality improvements** (the highest-consequence category: one prevented error in a regulatory filing can outweigh a cohort's efficiency gains; inaccuracy is also among the AI risks organizations most often report working to mitigate, at 52% of high performers and 53% of others{{cite:mckinsey-state-of-ai-2026#risk-inaccuracy}})

| KPI | Definition | Source | L3 trace |
|---|---|---|---|
| Q1 AI-related error rate | Documented errors from unverified AI output (fabricated citations, bad statistics) | Incident reports, QA logs (needs AI-error tagging) | B2, B5, B6 |
| Q2 Appropriate delegation rate | Share of AI-assisted tasks within the model's reliable range | Quarterly sample audits (new infrastructure) | B1, B2, B7 |

**Adoption maturation** (cultural change, the organizational analog of the Level 3 behavior change)

| KPI | Definition | Source | L3 trace |
|---|---|---|---|
| A1 AI transparency rate | Share of the team openly discussing AI practices | Derived from B9 aggregated by team | B9, B7 |
| A2 Concealment reduction | Drop from the 69% concealment baseline{{cite:anthropic-interviewer-2025#stigma-69}} | Anonymous pulse survey at 6 months | B9, B12 |

**Capability development** (the strategically decisive category)

| KPI | Definition | Source | L3 trace |
|---|---|---|---|
| C1 Peer coaching incidence | Documented instances of participants coaching colleagues | Derived from B11 at 90 days | B11, B9 |
| C2 Time-to-competency for new tools | Onboarding time to a new AI tool, alumni vs. non-participants | Opportunistic, when a new tool is introduced | B1, B3, B5 (tool-agnostic) |

C2 is the argument that justifies AI-literacy investment over tool-specific onboarding: if alumni onboard to each new tool faster, the program produced transferable literacy, which compounds as organizations adopt more tools through 2030. Employer plans point that way: 86% expect AI to transform their business by 2030, 77% plan to reskill existing staff to work alongside AI, and 62% plan to hire people who already can{{cite:wef-2025#ai-reskill-77}}. AI is also reaching more parts of the business: 56% of respondents say their organizations use AI in three or more functions in 2026, up from 51%{{cite:mckinsey-state-of-ai-2026#functions-56}}. The tool count is already high. Each platform shift has multiplied the tools in use, and a typical large US enterprise now runs 400 to 500 SaaS applications (Productiv){{cite:evans-2025-11#saas-apps-10}}.

## Isolating the program's contribution

Attribution is the central methodological challenge, and every technique produces an estimate, not a proof. The framework uses several in combination, in decreasing order of rigor: a comparison-group design where deployment is phased (the later group is a natural control); trend-line analysis against 6–12 months of pre-program baseline; and independently collected manager and participant estimates of the share of improvement attributable to the program, each adjusted downward for optimism. The phased design is a difference-in-differences comparison, the same structure Anthropic's labor-market analysis uses to separate AI effects from the business cycle: a change that appears in both groups is not attributed to the intervention. That analysis also reports the smallest effect its design could detect, about 1 percentage point of unemployment, and this evaluation should state its own up front{{cite:massenkoff-mccrory-2026#did-design-11-12}}. The result is reported as a range, and the ROI model uses the lower bound by default. If the return is positive at the lowest defensible attribution, the case is strong; if it is positive only at the upper bound, it should be communicated as speculative.

## The ROI model

The model applies the Phillips ROI Methodology{{cite:roi-institute-methodology}}, the established framework that extends Kirkpatrick with a fifth level, financial ROI{{cite:training-industry-phillips-roi}}. The formula below is Phillips' own, net program benefits over fully loaded cost expressed as a percentage; the isolation step above is Phillips' "isolate the effects of the program"; and the conservative inputs follow his Guiding Principles, which call for a fully loaded cost, the most conservative estimate among alternatives, and attribution adjusted downward for error. This project supplies defensible inputs. Most are drawn from the research corpus rather than a vendor benchmark; fully loaded compensation (W) and the attribution factor (A) are the adopting organization's own inputs, which the worked example below fills with stated assumptions.

None of the corpus sources supplies a fully loaded compensation figure or an attribution factor. MGI's average-pay figures for its occupation groups exclude benefits{{cite:mgi-agents-robots-us-2025#average-pay-57}}. McKinsey's EBIT attribution is a respondent's judgment, not an audited share{{cite:mckinsey-state-of-ai-2026#ebit-attribution-18}}. W and A remain assumptions an adopting organization must replace.

Two outside benchmarks give a deploying organization reference points. In US data for June 2026, benefits, including legally required ones, made up 30.0% of private-industry compensation, which puts total compensation at about 1.43 times wages and salaries{{cite:bls-ecec-2026#private-benefits-30}}. The worked example's 1.4 multiplier for W matches that ratio and so leaves out overhead. For program cost, ATD's 2024 per-employee L&D cost benchmarks{{cite:atd-2024}} are a reference point for a deploying organization's own figure.

Two other Guiding Principles shape the model. It counts one year of benefits only, the rule for short-term programs. It reports the delegation, adoption, and capability KPIs (Q2, A1, A2, C1, C2) as intangible benefits rather than assigning them a dollar value{{cite:phillips-phillips-2009#guiding-principles-15}}.

The model calculates two independently attributed benefit streams against total program cost:

```
Efficiency Benefit = N × W × T_ai × S × A
Quality Benefit    = Q × Q_reduction × A,   where Q = N × q
C_program          = C_fixed + N × c
ROI = (Efficiency + Quality − C_program) / C_program × 100%
```

| Variable | Meaning | Source |
|---|---|---|
| N | Participants | Deployment plan |
| W | Fully loaded annual compensation | HR/Finance |
| T_ai | Share of work hours on AI-eligible tasks | Task analysis / Yee et al., 2025 (technical potential and 2030 adoption){{cite:mgi-agents-robots-us-2025#agents-44-midpoint-27}} |
| S | Time savings per AI-eligible hour, competently used | Measurement / controlled trials cited in Tamkin & McCrory (14–56%){{cite:tamkin-mccrory-2025#rct-comparison}} |
| A | Attribution factor | Isolation methodology |
| C_fixed | Build, delivery, evaluation administration, and contingency | Budget |
| c | Participant and manager time per participant | HR/Finance (time × loaded rate) |
| C_program | Total program cost, C_fixed + N × c | Derived |
| q | Annual cost of AI-related quality failures per participant | QA/incident extrapolation |
| Q | Annual cost of AI-related quality failures, N × q | Derived |
| Q_reduction | Reduction in those failures post-program | KPI Q1 |

The worked example runs a 200-person deployment at a mid-sized professional-services firm, with every input set conservatively against the documented evidence:

| Variable | Value | Rationale |
|---|---|---|
| N | 200 | Departmental rollout |
| W | $140,000 | Mid-career base ~$100K × 1.4 fully loaded (BLS puts benefits, legally required ones included, at 30% of private-industry compensation, about 1.43 times wages; overhead not included){{cite:bls-ecec-2026#private-benefits-30}} |
| T_ai | 25% | MGI estimates agents could perform tasks occupying 44% of US work hours (technical potential, late scenario). MGI counts as agents all machines that automate nonphysical work, AI-based or not. Its midpoint scenario assumes about 27% of all current work hours, physical work included, automated by 2030{{cite:mgi-agents-robots-us-2025#agents-44-midpoint-27}}. 25% sits just below that midpoint. Handa et al. find about 57% of occupations use AI on at least a tenth of their tasks{{cite:handa-2025#occupations-10pct-57}}; their 57% conversation split is a different statistic and is not used here. |
| S | 30% | Inside the 14–56% range that controlled trials report, and well below the 81% in-conversation median, which leaves out the time spent refining output{{cite:tamkin-mccrory-2025#rct-comparison}} |
| A | 40% | Lower-bound; assumes 60% of improvement is other factors |
| C_fixed | $235,000 | Built from this program's own [resource plan](https://ritchot.me/courses/ai-literacy/#/build/resources): the five-person build estimate of $190,000–$258,000, which includes evaluation administration and 15% contingency. $235,000 sits in the upper half of that range. Eighty-six percent of employers expect to fund training at least partly from their own organization{{cite:wef-2025#training-investment-48}}. The model counts the fully loaded cost, as the Phillips guiding principles require, and charges it to the sponsor. |
| c | $525 | Participant time of about 6.3 hours (the 230–315-minute program with both assessments, the Level 1 survey, and three Level 3 self-assessments and check-ins) × $67 an hour (W ÷ 2,080), about $426. Manager time for the check-ins adds one hour at about $89. The sum, about $515, is rounded to the nearest $25 |
| q | $2,000 | Placeholder, per participant a year; no cited source prices AI-related errors. Replace it with incident-log data: errors × hours to fix × loaded hourly rate |
| Q_reduction | 20% | Conservative one-fifth reduction |

C_program = $235,000 + 200 × $525 = **$340,000**. With participant and manager time added, the build-up runs $293,000–$361,000, and $340,000 sits in its upper half. Q = 200 × $2,000 = $400,000. Efficiency Benefit = 200 × $140,000 × 0.25 × 0.30 × 0.40 = **$840,000**. Quality Benefit = $400,000 × 0.20 × 0.40 = **$32,000**. Total $872,000 against $340,000 yields a **156% ROI** in the first year. Each input in the efficiency stream is a straight multiplier, so halving any one of them halves that stream; halving attribution, which also scales the quality stream, still returns a positive 28%. The more useful test for a budget holder is break-even. With the other defaults held, the program covers its cost at an attribution of about 16%, at time savings of about 11% (below the 14–56% range the controlled trials report), or at an AI-eligible share of about 9%. The quality stream adds little at these inputs: set it to zero and the return is 147%. The figure is not a claim about this program's realized return. It demonstrates that results measurement was built into the architecture from the start, ready for an organization to repopulate with its own baselines.

## Timeline, and the full chain

| Milestone | Activity |
|---|---|
| Pre-program | Establish KPI baselines (6–12 months of history where systems hold it, 3 months at minimum) and the A2 concealment baseline |
| 90 days | Level 3 complete; begin watching Level 4 KPIs for direction (no ROI yet) |
| 6 months | First Level 4 point: measure KPIs, run estimation surveys, calculate a preliminary ROI range |
| 12 months | Full evaluation: trend-line analysis, final ROI with confidence range, integrated L1–L4 narrative |

Populated, the chain reads as a single argument: participants rated the program relevant and named intended changes (L1), gained measurable knowledge across all four domains (L2), changed specific behaviors that managers and self-reports both confirmed (L3), and the organizational metrics those behaviors target improved (L4). Each level hands the next its evidence; remove any one and the argument has a gap. For that reason the framework was designed as an integrated system from the outset.¹

---

¹ *No Level 4 data exists because the program has not been deployed at organizational scale. Causal certainty is unattainable outside a randomized controlled trial, which is rarely feasible organizationally; the combined isolation techniques produce a defensible estimate reported as a range, not a proof. The model requires pre-program baselines for every tracked KPI, so baseline establishment is a prerequisite for deployment, and some outcomes (cultural transparency, time-to-competency for future tools) may take longer than twelve months to fully materialize.*
