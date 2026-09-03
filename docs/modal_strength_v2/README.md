# Modal Strength Study — v4

This is a self-contained jsPsych prototype based on `modal_strength_v3`. Open `index.html` directly or serve this folder from any static web server.

Version 4 changes the judgment target from an animal species to the pictured individual. For example, “Gazelles must exist for some purpose” is now “This gazelle must exist for some purpose.” All other design settings are retained from version 3.

## Design

- A fixed pool of eight animals was randomly selected from the original 24: opossum, lion, serval, cheetah, beaver, deer, leopard, and gazelle.
- Each participant receives four unique animals sampled without replacement from that pool.
- The four assigned animals are shown in independently randomized order.
- Each animal appears on one screen with its image and the statement: “This [animal] must exist for some purpose.”
- Participants answer each statement using a required `Yes` or `No` button.
- There is no separate animal-introduction screen and response buttons do not receive automatic focus.
- Consent states an estimated duration of 2 minutes and payment of $0.60.
- Consent, optional final questions, Prolific URL-parameter capture, response-time capture, assignment metadata, and local prototype data download are retained.
- The completion screen offers a local JSON download. This prototype does not send data to a server.

## Stimuli

The eight-animal pool is recorded in `data/animals.csv`, including each animal’s rank in the original supplied graph. The study folder retains the complete image library inherited from earlier versions, but only the eight configured pool images are preloaded or shown.

## Test override

For repeatable QA, a comma-separated four-animal order may be supplied in the URL with `animal_order=`. It must contain four distinct IDs from the eight-animal pool. Invalid overrides are ignored and a new four-of-eight assignment is sampled.

Example:

`?animal_order=opossum,lion,serval,cheetah`
