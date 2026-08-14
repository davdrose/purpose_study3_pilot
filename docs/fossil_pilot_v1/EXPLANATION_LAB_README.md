# Explanation Lab conversion report

Converted: 2026-08-14T12:53:41.670Z
Source ZIP: pilot_v14.zip
jsPsych: 8.3.0
Experiment version: fossil_pilot_v14
Client version: 1.1.1
Conditions: dna_near_ember_purpose_near_marsh, purpose_near_ember_dna_near_marsh
Demographics: age, ethnicity, gender, other_gender, other_race, race

## Changes
- Added explanation-lab.config.json with confirmed versions and data mappings.
- Added the frozen Explanation Lab client beside js/experiment.js.
- Completed the manual integration review identified by the converter.
- Preserved the original participant-facing study flow and within-participant evidence-order randomization.
- Made the displayed between-participant condition follow the Console assignment.
- Replaced the prototype completion behavior with confirmed Firebase saving and the Prolific redirect.
- Added stable response and demographic row roles for clean CSV exports; the two feedback answers are stored on the main judgment row.

## Warnings from inspection
- None

## Manual review status
- Complete: the existing completion handler now runs only after a confirmed Sandbox save; Production redirects to Prolific only after a confirmed save.
- Complete: the Console-assigned condition takes priority over the study's local fallback randomization.

## Required next steps
1. Publish this reviewed folder through GitHub Pages.
2. Register the public Pages URL in the Explanation Lab Console.
3. Use both condition codes from explanation-lab.config.json exactly as written.
4. Complete both Sandbox conditions and inspect the response and demographic CSV exports.
5. Do not launch while any readiness item remains incomplete.
