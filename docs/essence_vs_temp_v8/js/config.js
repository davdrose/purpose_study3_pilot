(function () {
  "use strict";

  const Config = {
    EXPERIMENT_VERSION: "essence_vs_temp_v8_full_pilot",
    SOURCE_SURVEY: "exp5.qsf",
    JSPSYCH_VERSION: "8.3.0",
    STUDY_TITLE: "Research Study",
    ESTIMATED_MINUTES: 4,
    COMPENSATION: "$0.80",
    CONDITIONS: ["purpose", "temperature"],
    COMPLETION_URL: "https://app.prolific.co/submissions/complete?cc=843D0C17",
    REMOTE_SUBMISSION_ENABLED: true,
    DATA_SCHEMA_VERSION: "5.0.0",
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
