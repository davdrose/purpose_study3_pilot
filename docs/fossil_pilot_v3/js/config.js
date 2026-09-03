(function () {
  "use strict";

  const Config = {
    EXPERIMENT_VERSION: "fossil_pilot_v27",
    JSPSYCH_VERSION: "8.3.0",
    STUDY_TITLE: "Rellen Fossil Study",
    DEFAULT_CONDITION: "dna_near_ember_purpose_near_marsh",
    AVAILABLE_CONDITIONS: [
      "dna_near_ember_purpose_near_marsh",
      "purpose_near_ember_dna_near_marsh"
    ],
    AVAILABLE_EVIDENCE_ORDERS: [
      "purpose_first",
      "dna_first"
    ],
    EXPLANATION_MINIMUM_CHARACTERS: 20,
    SPECIMEN_IMAGES: Object.freeze({
      A: "assets/specimens/v3/fossil-a.png",
      F1: "assets/specimens/v3/fossil-1.png",
      F2: "assets/specimens/v3/fossil-2.png",
      F3: "assets/specimens/v3/fossil-3.png",
      F4: "assets/specimens/v3/fossil-4.png",
      B: "assets/specimens/v3/fossil-b.png"
    }),
    VISUAL_SEQUENCE_VERSION: "gradual_fossil_series_v1",
    REMOTE_SUBMISSION: {
      enabled: false,
      provider: "proliferate",
      endpoint: "",
      prolific_completion_url: ""
    }
  };

  window.FossilPilot = window.FossilPilot || {};
  window.FossilPilot.Config = Object.freeze(Config);
  window.EXPERIMENT_VERSION = Config.EXPERIMENT_VERSION;
})();
