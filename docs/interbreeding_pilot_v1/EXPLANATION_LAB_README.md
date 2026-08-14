# Explanation Lab integration report

Converted: 2026-08-14T18:23:31.944Z
Source ZIP: interbreeding_pilot_v38.zip
jsPsych: 8.3.0
Experiment version: interbreeding_pilot_v38
Client version: 1.1.1
Conditions: complete_2x2_sequence
Demographics: age, ethnicity, gender, other_gender, other_race, race

## Integration status

**Ready for hosted Sandbox testing.** This study required a custom integration because it uses a minimized research payload rather than ordinary jsPsych rows.

## Changes
- Kept the study's complete within-participant 2x2 design and all internal randomization.
- Registered one Console condition: `complete_2x2_sequence`.
- Removed the retired Proliferate loader and replaced its transport with the frozen Explanation Lab client.
- Preserved generation-level decisions and added explicit lineage-summary rows.
- Kept `feedback` and `confusion_feedback` in the response export.
- Tagged age, ethnicity, gender, other-gender, race, and other-race fields for the separate demographic export.
- Preserved the study's save-error retry screen.
- Redirects to Prolific only after Firestore confirms the Production save.

## Inspection findings resolved during integration
- The study's original completion and redirect logic was replaced with save-confirmed Explanation Lab behavior.
- The design is within-participant, so the four experimental cells remain in `condition_cell`; they are not four Console conditions.
- The Console should use the single condition code `complete_2x2_sequence`.

## Data layout

- `participant_summary`: one response row per participant.
- `generation_decision`: one response row for each recorded generation decision.
- `lineage_summary`: one response row for each of the four completed lineages.
- `final_feedback`: one response row containing the two feedback questions.
- `demographics`: one row routed to the demographic export.

## Required next steps
1. Publish this complete folder through GitHub Pages.
2. Register the public Pages URL in the Explanation Lab Console.
3. Use `complete_2x2_sequence` as the only condition code and set its target to the total desired sample.
4. Keep the six confirmed demographic fields listed above.
5. Add the Prolific completion URL.
6. Complete a full Sandbox run and inspect both CSV exports.
7. Run a small Production pilot before increasing places.
