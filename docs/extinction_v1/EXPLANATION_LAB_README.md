# Explanation Lab conversion report

Converted: 2026-08-16T23:32:00.714Z
Source ZIP: extinction_v5.zip
jsPsych: 8.2.3
Experiment version: 1.0.0
Client version: 1.4.0
Assignment: between_participant
Launch conditions: extinction, survival
Internal condition cells: none detected
Demographics: age, ethnicity, gender, other_gender, other_race, race
Package fingerprint: 9e3c7447b7da1e1e5a41394a1a0ffebf4d2d945b0516a41721cc6e5f73884979

## Changes
- Added explanation-lab.config.json with confirmed versions and data mappings.
- Preserved the original launch files so a future public-repository package can remove lab collection safely.
- Added a frozen local Explanation Lab client at js/explanation-lab-client.js.
- Automatic rewriting was not safe. The original experiment code was preserved.
- Added EXPLANATION_LAB_MANUAL_INTEGRATION.js with paste-ready code for the detected experiment file.

## Warnings from inspection
- None

## Items requiring manual review
- The study appears to randomize a between-participant condition without a condition URL. Technical review is required so Console assignment controls the displayed condition.

## Required next steps
1. Open and test the converted study locally.
2. Publish this converted folder through GitHub Pages.
3. Register the public Pages URL in the Explanation Lab Console.
4. Paste the Pages URL into the Console; it will read and verify this manifest automatically.
5. Complete every Sandbox condition and inspect both CSV exports.
6. Do not launch while any readiness item remains incomplete.