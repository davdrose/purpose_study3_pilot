(function (global) {
  "use strict";

  const items = Object.freeze([
    Object.freeze({ id: "swan", condition: "animal", singular: "swan", plural: "swans", image: "assets/items/swan.png", imageAlt: "An isolated realistic swan" }),
    Object.freeze({ id: "hyena", condition: "animal", singular: "hyena", plural: "hyenas", image: "assets/items/hyena.png", imageAlt: "An isolated realistic spotted hyena" }),
    Object.freeze({ id: "gazelle", condition: "animal", singular: "gazelle", plural: "gazelles", image: "assets/items/gazelle.png", imageAlt: "An isolated realistic gazelle" }),
    Object.freeze({ id: "snail", condition: "animal", singular: "snail", plural: "snails", image: "assets/items/snail.png", imageAlt: "An isolated realistic land snail" })
  ]);

  const questions = Object.freeze([
    Object.freeze({ id: "purpose_exists", responseType: "slider", template: "This {singular} has a purpose even if we don’t know what it is." }),
    Object.freeze({ id: "purpose_self_good", responseType: "slider", template: "The purpose of this {singular} is good for it." }),
    Object.freeze({ id: "purpose_ecosystem_good", responseType: "slider", template: "The purpose of this {singular} is good for the ecosystem." }),
    Object.freeze({ id: "purpose_humans_good", responseType: "slider", template: "The purpose of this {singular} is good for humans." }),
    Object.freeze({ id: "purpose_important", responseType: "slider", template: "The purpose of this {singular} is important." })
  ]);

  global.AnimalGoodnessStudy = global.AnimalGoodnessStudy || {};
  global.AnimalGoodnessStudy.Config = Object.freeze({
    version: "animal_goodness_v8",
    title: "Purpose Study",
    estimatedMinutes: 5,
    consentPayment: "$1.00",
    sliderMin: 0,
    sliderMax: 100,
    sliderStart: 50,
    items: items,
    questions: questions
  });
})(window);
