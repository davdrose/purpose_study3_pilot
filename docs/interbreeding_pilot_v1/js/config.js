(function () {
  "use strict";

  const Config = {
    EXPERIMENT_VERSION: "interbreeding_pilot_v38",
    JSPSYCH_VERSION: "8.3.0",
    STUDY_TITLE: "Population Classification Pilot",
    DATA_SCHEMA_VERSION: "2.1.0",
    CONDITION_CELLS: {
      genetic_early_purpose_early: { genetic_timing: "early", purpose_timing: "early", genetic_generation: 3, purpose_generation: 3 },
      genetic_early_purpose_late: { genetic_timing: "early", purpose_timing: "late", genetic_generation: 3, purpose_generation: 6 },
      genetic_late_purpose_early: { genetic_timing: "late", purpose_timing: "early", genetic_generation: 6, purpose_generation: 3 },
      genetic_late_purpose_late: { genetic_timing: "late", purpose_timing: "late", genetic_generation: 6, purpose_generation: 6 }
    },
    EVIDENCE_INTRO_ORDERS: ["genetic_first", "purpose_first"],
    DEFAULT_LINEAGE_ID: "teeth",
    LINEAGE_IDS: ["teeth", "beaks", "fur", "toes"],
    TRIAL_COUNT: 4,
    CONDITION_ASSIGNMENT: "within_participant_complete",
    DESIGN: "within_participant_complete_2x2_dna_by_purpose_evidence_timing",
    TRAIT_TRAJECTORY: [0, 1, 2, 3, 4, 5, 6, 7],
    NORMALIZED_TRAIT_TRAJECTORY: [0, 1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7, 1],
    TRAIT_CALIBRATION_METHOD: "trait_specific_parameterized_visual_continuum",
    REFERENCE_ASSET_PATHS: [
      "assets/traits/tooth-g0.svg",
      "assets/traits/tooth-g1.svg",
      "assets/traits/tooth-g2.svg",
      "assets/traits/tooth-g3.svg",
      "assets/traits/tooth-g4.svg",
      "assets/traits/tooth-g5.svg",
      "assets/traits/tooth-g6.svg",
      "assets/traits/tooth-g7.svg"
    ]
  };

  window.Interbreeding = window.Interbreeding || {};
  window.Interbreeding.Config = Object.freeze(Config);
  window.EXPERIMENT_VERSION = Config.EXPERIMENT_VERSION;
})();
