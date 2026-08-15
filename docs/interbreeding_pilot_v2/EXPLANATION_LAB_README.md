# Explanation Lab conversion report

Converted: 2026-08-15T18:49:04.861Z
Source ZIP: interbreeding_pilot_v40.zip
jsPsych: 8.3.0
Experiment version: interbreeding_pilot_v40
Client version: 1.2.0
Conditions: none specified
Demographics: age, ethnicity, gender, other_gender, other_race, race

## Changes
- Added explanation-lab.config.json with confirmed versions and data mappings.
- Added a frozen local Explanation Lab client at js/explanation-lab-client.js.
- Integrated the jsPsych experiment in js/experiment.js.
- Removed the retired Proliferate loader, supplied an in-page compatibility handoff for the legacy save plugin, and removed its old completion redirect.
- Passed post-conversion checks for the save handler and condition assignment.

## Warnings from inspection
- No condition codes were detected. Add them manually if this is a between-participant study.

## Required next steps
1. Open and test the converted study locally.
2. Publish this converted folder through GitHub Pages.
3. Register the public Pages URL in the Explanation Lab Console.
4. Confirm condition codes and demographics in the Console.
5. Complete every Sandbox condition and inspect both CSV exports.
6. Do not launch while any readiness item remains incomplete.