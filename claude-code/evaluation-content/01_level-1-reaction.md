# Level 1: Reaction
## AI Literacy for the Modern Workforce

Within the [Kirkpatrick model](https://www.kirkpatrickpartners.com/the-kirkpatrick-model/), Level 1 measures participant reaction: whether learners found the program relevant, credible, and applicable to their work. It is the earliest and cheapest evaluation tier, administered immediately after completion and before any on-the-job behavior can be observed. It is also the tier most often wasted, because the default reaction survey collects satisfaction that maps to no decision. The instrument described here is built against a single constraint that separates a management-grade evaluation from a compliance-grade one: every item must produce data that drives a specific program change.

## The actionability requirement

A generic item such as "How would you rate this program overall?" returns a number that cannot be traced to any design feature, which means it cannot be acted on. An item such as "The scenarios in this program reflected situations I encounter in my role" maps directly to the scenario-design layer and triggers a concrete revision if it scores below threshold. Every item in the instrument was written to the second standard. Items that produce interesting but unactionable data were excluded by design, including facilitator-effectiveness items (the program is self-paced with no facilitator), platform-satisfaction items (better handled through usability research), and items about organizational AI support (outside the program's control). The exclusions keep the survey pointed at the design decisions the program team can actually change.

## Four dimensions, each tied to a decision

The survey runs eight to thirteen scaled items across four dimensions, plus three to four open-response prompts, calibrated to a deploying organization's tolerance for length:

- **Perceived relevance to role** informs scenario selection, industry representation, and example specificity. It asks whether the workplace situations felt authentic and whether the participant can now identify specific tasks where the concepts apply.
- **Confidence change** informs instructional depth and scaffolding. Its items map to the program's competency model: output evaluation (Discernment), prompt construction (Description), and the mechanistic understanding that underpins both.
- **Content quality and pacing** informs module sequencing, section length, and vocabulary calibration for a non-technical audience, separating length satisfaction from pacing satisfaction since a program can be well-paced but too long.
- **Intent to apply and recommend** captures behavioral intent as a leading indicator for Level 3, and pairs a comparable agreement item with a standard [Net Promoter Score](https://www.netpromoter.com/know/) item so the program can be benchmarked against an organization's other learning initiatives.

The final two dimensions carry the most weight downstream. The intent items (a planned behavioral change, named in the participant's own words) become the baseline against which Level 3 measures whether intention turned into action.

## Privacy by design, and why the survey is a prototype

I did not build the reaction survey as a live instrument. The platform carries a prototype of it, a working mock of what the survey would look like as part of the course, wired to collect nothing. The reason is structural. The platform collects no personally identifiable information; learner progress lives in the browser's local storage and never reaches a server, because as a solo-built portfolio project it has no data processing agreement, no retention policy, and no legal entity to bear data-controller liability. A reaction survey with free-text fields is precisely the data this architecture should not hold. So the prototype demonstrates the instrument design, and a deploying organization would run the live version through its own survey infrastructure, inheriting that organization's existing governance rather than forcing a parallel one into existence. The recommended trigger is the program's completion screen, where response rates and recall are highest.

## Reading the data

Each scaled item is analyzed for mean, standard deviation, and distribution, because a mean of 3.5 with high disagreement tells a different story than the same mean with consensus. Directional thresholds guide interpretation rather than fixed pass/fail cutoffs: scores at or above 4.0 indicate the design feature is working, the 3.0 to 3.9 band calls for review of the open-response data, and anything below 3.0 prioritizes revision and cross-references the Level 2 results to separate a content problem from a relevance or difficulty problem. Open responses are thematically coded into a frequency-ranked list that maps to revision priorities. The full value emerges across cohorts: when a revision is made between cohorts, the next cohort's reaction data shows whether it worked.

The honest limit of this tier is that reaction predicts neither learning nor behavior. The correlation between participant satisfaction and knowledge gain is weak across the L&D literature, which is the entire reason the framework does not stop here. Level 1 tells the designer what the participant experienced. Levels 2 through 4 tell the organization what the program produced.¹

---

¹ *This is an evaluation instrument design, not a results report. The program is an independent portfolio project that has not been deployed at organizational scale, so no Level 1 cohort data exists. The platform carries a prototype of the survey; the item bank, administration protocol, and analysis thresholds are complete and ready for a deploying organization to administer the live version through its own survey infrastructure.*

---

## Sources

- **Kirkpatrick Partners** — [*The Kirkpatrick Model*](https://www.kirkpatrickpartners.com/the-kirkpatrick-model/)
- **Bain & Company / Reichheld, F.** — [*Net Promoter System*](https://www.netpromoter.com/know/)
- **Anthropic** — [*AI Fluency: Framework and Foundations*](https://www.anthropic.com/ai-fluency) (the 4D competency vocabulary referenced in the confidence-change dimension)
