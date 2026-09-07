# Life Meaning Study — v1

A self-contained jsPsych 8.2.3 study using the consent, green-and-white layout, optional final questions, and local data-download format of the other studies in this repository. Open `index.html` directly, or serve this folder with a static web server. All runtime files are included; there are no CDN or sibling-folder dependencies.

## Versioning

Preserve every completed version. Before a later revision, copy the entire latest folder to the next sequential folder (`life_meaning_v2`, `life_meaning_v3`, and so on), then edit only that copy. Update its version identifiers, script/style cache versions, and README. Do not overwrite an earlier version.

## Participant flow

1. Cornell consent form with an **I agree** button. The study description is adapted to this questionnaire, with the requested duration of **3 minutes** and payment of **$0.60**; both are configured in `js/config.js`.
2. Brief introduction, followed by **Begin**.
3. **Do you think that life has an ultimate meaning?** — Yes / No.
4. **Please explain in as much detail as possible why you think that.** — a large text box and Continue button. A nonblank response is required; there is no minimum word count or maximum length.
5. **Do you think all animals have a purpose?** — Yes / No.
6. The existing optional feedback and demographics page: response factors/comments, confusing or unclear aspects, age, gender, race, and ethnicity. Wording, options, and age limits match the recent animal-goodness and modal-strength studies.
7. Thank-you screen with **Download test data** and **Restart study**.

The three study questions always appear in the stated order, each on a separate page. Both Yes and No advance to the same next question. No images, randomized assignments, additional study questions, or conditional branches are used.

## Data

Responses are kept in the browser session and can be downloaded as JSON at completion. This local prototype does not transmit responses to a server or redirect to Prolific. Reloading or closing the page clears the session, so download data before restarting.

- Question IDs: `life_ultimate_meaning`, `life_meaning_explanation`, `all_animals_purpose`.
- Each question records its wording, position, response type, response, and response time in milliseconds. Yes/No answers also record `response_yes`; the explanation records character and word counts.
- Consent and optional demographics are retained in the trial data, alongside jsPsych trial indices and timing.
- `PROLIFIC_PID`, `STUDY_ID`, and `SESSION_ID` URL parameters are captured. A `participant_id` parameter or generated anonymous ID is used when no Prolific ID is present.
- The JSON includes a convenient `responses` summary plus the complete `trials` array. The completed payload is also accessible at `window.__LIFE_MEANING_STUDY_DATA__` for local inspection.
