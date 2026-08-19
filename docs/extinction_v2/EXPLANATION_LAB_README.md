# Explanation Lab conversion report

Converted: 2026-08-19T18:07:39.643Z
Source ZIP: extinction_v8.zip
jsPsych: 8.2.3
Experiment version: 1.0.0
Client version: 1.5.0
Assignment: counterbalanced_within_participant
Launch assignment parameter: order
Launch conditions: extinction_first, survival_first
Internal condition cells: extinction, survival
Demographics: age, ethnicity, gender, other_gender, other_race, race
Package fingerprint: ec2ffa0a34a177762c98c12029fb5db75e3009a54a5e01047dad1d269d2ca53c

## Changes
- Added explanation-lab.config.json with confirmed versions and data mappings.
- Preserved the original launch files so a future public-repository package can remove lab collection safely.
- Added a frozen local Explanation Lab client at js/explanation-lab-client.js.
- Integrated the jsPsych experiment in js/experiment.js.
- Connected 1 condition reader to the Console assignment.
- Passed post-conversion checks for the save handler and condition assignment.

## Warnings from inspection
- A counterbalanced within-participant design was detected. Everyone receives extinction and survival; the Console will balance extinction_first versus survival_first.

## Required next steps
1. Open and test the converted study locally.
2. Publish this converted folder through GitHub Pages.
3. Register the public Pages URL in the Explanation Lab Console.
4. Paste the Pages URL into the Console; it will read and verify this manifest automatically.
5. Complete every Sandbox condition and inspect both CSV exports.
6. Do not launch while any readiness item remains incomplete.