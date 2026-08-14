(function () {
  "use strict";

  const C = window.FossilPilot.Config;

  const ages = [900000, 735000, 570000, 405000, 240000, 75000];
  const labels = ["Marsh Rellen fossil sample", "New fossil sample 1", "New fossil sample 2", "New fossil sample 3", "New fossil sample 4", "Ember Rellen fossil sample"];
  const ids = ["A", "F1", "F2", "F3", "F4", "B"];

  const conditions = {
    dna_near_ember_purpose_near_marsh: {
      id: "dna_near_ember_purpose_near_marsh",
      dna: [0.00, 0.01, 0.30, 0.31, 0.32, 0.33],
      emberfruit: [0, 5, 10, 95, 97, 99]
    },
    purpose_near_ember_dna_near_marsh: {
      id: "purpose_near_ember_dna_near_marsh",
      dna: [0.00, 0.01, 0.03, 0.31, 0.32, 0.33],
      emberfruit: [0, 5, 90, 95, 97, 99]
    }
  };

  function conditionFromUrl() {
    const assigned = window.EXPLANATION_LAB_CONDITION;
    if (C.AVAILABLE_CONDITIONS.indexOf(assigned) >= 0) return assigned;
    const requested = new URLSearchParams(window.location.search).get("condition");
    if (C.AVAILABLE_CONDITIONS.indexOf(requested) >= 0) return requested;
    return Math.random() < 0.5
      ? "dna_near_ember_purpose_near_marsh"
      : "purpose_near_ember_dna_near_marsh";
  }

  function evidenceOrderFromUrl() {
    const requested = new URLSearchParams(window.location.search).get("order");
    if (C.AVAILABLE_EVIDENCE_ORDERS.indexOf(requested) >= 0) return requested;
    return Math.random() < 0.5 ? "purpose_first" : "dna_first";
  }

  function buildSequence(conditionId) {
    const condition = conditions[conditionId] || conditions[C.DEFAULT_CONDITION];
    return ids.map(function (id, index) {
      const endpoint = index === 0 || index === ids.length - 1;
      return Object.freeze({
        id: id,
        label: labels[index],
        age_years: ages[index],
        endpoint: endpoint,
        selectable: false,
        focal: id === "F2",
        known_species: index === 0 ? "Marsh Rellen" : (index === ids.length - 1 ? "Ember Rellen" : null),
        dna_difference_percent: condition.dna[index],
        emberfruit_percent: condition.emberfruit[index],
        crimson_nutseed_percent: index === 0 ? 99 : (index === ids.length - 1 ? 0 : 100 - condition.emberfruit[index]),
        other_activity_percent: endpoint ? 1 : 0,
        specimen_image: C.SPECIMEN_IMAGES[id]
      });
    });
  }

  function validate() {
    ids.forEach(function (id) {
      if (!C.SPECIMEN_IMAGES[id]) throw new Error("Every fossil must have its own specimen image.");
    });
    Object.keys(conditions).forEach(function (key) {
      const condition = conditions[key];
      if (condition.dna.length !== 6 || condition.emberfruit.length !== 6) throw new Error("Every fossil condition must contain six observations.");
      if (condition.dna[0] !== 0 || condition.dna[5] !== 0.33) throw new Error("DNA endpoints must remain matched.");
      if (condition.emberfruit[0] !== 0 || condition.emberfruit[5] !== 99) throw new Error("Purpose endpoints must remain 99 target traces plus 1 other trace.");
      if (condition.dna[2] !== (key === "dna_near_ember_purpose_near_marsh" ? 0.30 : 0.03)) throw new Error("Focal DNA profile is not balanced as specified.");
      if (condition.emberfruit[2] !== (key === "dna_near_ember_purpose_near_marsh" ? 10 : 90)) throw new Error("Focal purpose profile is not balanced as specified.");
      condition.dna.forEach(function (value, index) {
        if (index && value <= condition.dna[index - 1]) throw new Error("DNA difference must increase monotonically.");
      });
      condition.emberfruit.forEach(function (value, index) {
        if (index && value <= condition.emberfruit[index - 1]) throw new Error("Ecological outcome must increase monotonically.");
      });
    });
  }

  validate();
  window.FossilPilot.Stimuli = {
    conditionFromUrl: conditionFromUrl,
    evidenceOrderFromUrl: evidenceOrderFromUrl,
    buildSequence: buildSequence,
    validate: validate
  };
})();
