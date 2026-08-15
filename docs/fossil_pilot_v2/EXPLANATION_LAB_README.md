# Explanation Lab conversion report

Converted: 2026-08-15T21:42:10.085Z
Source ZIP: pilot_v20.zip
jsPsych: 8.3.0
Experiment version: fossil_pilot_v20
Client version: 1.3.0
Conditions: dna_near_ember_purpose_near_marsh, purpose_near_ember_dna_near_marsh
Demographics: age, ethnicity, gender, other_gender, other_race, race

## Changes
- Added explanation-lab.config.json with confirmed versions and data mappings.
- Added a frozen local Explanation Lab client at js/explanation-lab-client.js.
- Integrated the jsPsych experiment in js/experiment.js.
- Connected 2 condition readers to the Console assignment.
- Passed post-conversion checks for the save handler and condition assignment.

## Warnings from inspection
- The converter will replace the study's condition URL reader with the Console-assigned condition.

## Required next steps
1. Open and test the converted study locally.
2. Publish this converted folder through GitHub Pages.
3. Register the public Pages URL in the Explanation Lab Console.
4. Confirm condition codes and demographics in the Console.
5. Complete every Sandbox condition and inspect both CSV exports.
6. Do not launch while any readiness item remains incomplete.