# Essence vs. Temperature — Explanation Lab version 9

This folder is the Firebase/Firestore replacement for the Proliferate-enabled
version 8. Version 8 remains unchanged.

## What changed

- Removed the Proliferate script and submission call.
- Includes a pinned local copy of the Explanation Lab study client. This avoids
  cross-site loading restrictions and prevents a later console update from
  silently changing an already deployed study.
- Reads `study`, `condition`, and `mode` from Study Console launch links.
- Continues to capture `PROLIFIC_PID`, `STUDY_ID`, and `SESSION_ID`.
- Saves the participant summary as participant-export metadata.
- Saves the eight stimulus ratings as item rows.
- Redirects to Prolific only after a confirmed production save.
- Saves sandbox runs without redirecting to Prolific.
- Keeps the retry screen in the study if saving fails.

## Local checks

These URLs do not transmit data:

- `?purpose&submission_test=success`
- `?temp&submission_test=success`
- `?purpose&submission_test=failure`

The real sandbox URL will be generated after this folder is hosted on GitHub
Pages and registered in the Explanation Lab Study Console.
