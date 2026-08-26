# Animal and Artifact Purpose Study — v7

This is a self-contained jsPsych prototype. Open `index.html` directly or serve this folder from any static web server.

Versioning rule: preserve every completed version. Before any later change, copy the entire latest folder into the next sequentially numbered `animal_goodness_vN` folder and edit only that new copy.

## Design

- All eight items from `data/items.csv` are shown: swan, hyena, gazelle, snail, cravat, xylophone, card, and dinghy.
- Each item is introduced on its own image screen, followed by five one-question screens.
- The item picture remains above the black question text.
- All five statements use the slider from `essence_vs_temp_v11`: it ranges from 0 (Strongly disagree) to 100 (Strongly agree), starts at 50, hides the handle initially, and requires participants to move it before continuing.
- “[Items] have a purpose.” is always asked first for every item.
- The order of the four follow-up slider statements is randomized once per participant and reused for all eight items.
- Item order is randomized per participant, with animals and artifacts intermixed rather than blocked.
- The instructions omit response-format details and the five-minute estimate, and end with “When you are ready to begin, please click Begin.”
- Responses, response times, item conditions, order assignments, participant URL parameters, consent, and demographics are retained in jsPsych data.
- The completion screen offers a local JSON download. This prototype does not send data to a server.

## Test overrides

For repeatable QA, comma-separated complete orders may be supplied in the URL:

- `followup_question_order=purpose_self_good,purpose_ecosystem_good,purpose_humans_good,purpose_important`
- `item_order=swan,hyena,gazelle,snail,cravat,xylophone,card,dinghy`

The follow-up override must contain all four follow-up IDs exactly once, and the item override must contain all eight item IDs exactly once. Invalid overrides are ignored and the corresponding order is randomized.
