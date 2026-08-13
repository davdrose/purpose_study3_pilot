(function () {
  "use strict";

  const Config = {
    EXPERIMENT_VERSION: "essence_vs_temp_v9_explanation_lab",
    SOURCE_SURVEY: "exp5.qsf",
    JSPSYCH_VERSION: "8.3.0",
    STUDY_TITLE: "Research Study",
    ESTIMATED_MINUTES: 4,
    COMPENSATION: "$0.80",
    CONDITIONS: ["purpose", "temperature"],
    LAB_CLIENT_URL: new URL("js/lab-study-client.js?v=1.0.1", document.baseURI).href,
    REMOTE_SUBMISSION_ENABLED: true,
    DATA_SCHEMA_VERSION: "6.0.0",
    SLIDER_MIN: 0,
    SLIDER_MAX: 100,
    SLIDER_START: 50,
    SEX_CHOICES: [
      "Male",
      "Female",
      "Other / Prefer not to answer"
    ],
    RACE_CHOICES: [
      "American Indian / Alaska Native",
      "Asian / Asian-American",
      "Black / African American",
      "Native Hawaiian / Pacific Islander",
      "White / European-American",
      "Latino / Hispanic",
      "Other / Prefer not to answer"
    ]
  };

  window.EssenceStudy = window.EssenceStudy || {};
  window.EssenceStudy.Config = Object.freeze(Config);
  window.EXPERIMENT_VERSION = Config.EXPERIMENT_VERSION;
})();
