(function (global) {
  "use strict";

  global.LifeMeaningStudy = global.LifeMeaningStudy || {};
  global.LifeMeaningStudy.Config = Object.freeze({
    version: "life_meaning_v1",
    title: "Life Meaning Study",
    estimatedMinutes: 3,
    consentPayment: "$0.60",
    questions: Object.freeze([
      Object.freeze({
        id: "life_ultimate_meaning",
        responseType: "binary",
        text: "Do you think that life has an ultimate meaning?"
      }),
      Object.freeze({
        id: "life_meaning_explanation",
        responseType: "text",
        text: "Please explain in as much detail as possible why you think that."
      }),
      Object.freeze({
        id: "all_animals_purpose",
        responseType: "binary",
        text: "Do you think all animals have a purpose?"
      })
    ])
  });
})(window);
