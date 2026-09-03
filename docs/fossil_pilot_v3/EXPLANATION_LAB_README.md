# Explanation Lab conversion report

Converted: 2026-09-03T17:04:54.930Z
Source ZIP: pilot_v27.zip
jsPsych: 8.3.0
Experiment version: fossil_pilot_v27
Client version: 1.5.1
Assignment: between_participant
Launch assignment parameter: condition
Launch conditions: dna_near_ember_purpose_near_marsh, purpose_near_ember_dna_near_marsh
Internal condition cells: none detected
Demographics: age, ethnicity, gender, other_gender, other_race, race
Package fingerprint: b504143839342fe178a010df93b6f7ef1f9fc3f02de1baa4fed087f02940eb00

## Changes
- Added explanation-lab.config.json with confirmed versions and data mappings.
- Preserved the original launch files so a future public-repository package can remove lab collection safely.
- Added a frozen local Explanation Lab client at js/explanation-lab-client.js.
- Integrated the jsPsych experiment in js/experiment.js.
- Connected 2 condition readers to the Console assignment.
- Passed post-conversion checks for the confirmed-save handler.
- Verified that every condition reader in the package uses the Console assignment.

## Warnings from inspection
- The converter will replace the study's condition URL reader with the Console-assigned condition.

## Required next steps
1. Open and test the converted study locally.
2. Publish this converted folder through GitHub Pages.
3. Register the public Pages URL in the Explanation Lab Console.
4. Paste the Pages URL into the Console; it will read and verify this manifest automatically.
5. Complete every Sandbox condition and inspect both CSV exports.
6. Do not launch while any readiness item remains incomplete.