# Individual Animal Purpose Study — v8

This is a self-contained jsPsych prototype. Open `index.html` directly or serve this folder from any static web server.

Versioning rule: preserve every completed version. Before any later change, copy the entire latest folder into the next sequentially numbered `animal_goodness_vN` folder and edit only that new copy.

## Design

- The four animals from `data/items.csv` are shown: swan, hyena, gazelle, and snail. Artifact trials are not included.
- Each animal is introduced on its own image screen, followed by five one-question screens about that pictured individual.
- The item picture remains above the black question text.
- All five statements use the slider from `essence_vs_temp_v11`: it ranges from 0 (Strongly disagree) to 100 (Strongly agree), starts at 50, hides the handle initially, and requires participants to move it before continuing.
- “This [animal] has a purpose even if we don’t know what it is.” is always asked first for every animal.
- The order of the four follow-up slider statements is randomized once per participant and reused for all four animals.
- Animal order is randomized per participant.
- The instructions omit response-format details and the five-minute estimate, and end with “When you are ready to begin, please click Begin.”
- Responses, response times, item conditions, order assignments, participant URL parameters, consent, and demographics are retained in jsPsych data.
- The completion screen offers a local JSON download. This prototype does not send data to a server.

## Test overrides

For repeatable QA, comma-separated complete orders may be supplied in the URL:

- `followup_question_order=purpose_self_good,purpose_ecosystem_good,purpose_humans_good,purpose_important`
- `item_order=swan,hyena,gazelle,snail`

The follow-up override must contain all four follow-up IDs exactly once, and the item override must contain all four animal IDs exactly once. Invalid overrides are ignored and the corresponding order is randomized.
