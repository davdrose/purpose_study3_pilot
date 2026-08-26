(function (global) {
  "use strict";

  const items = Object.freeze([
    Object.freeze({ id: "swan", condition: "animal", singular: "swan", plural: "swans", image: "assets/items/swan.png", imageAlt: "An isolated realistic swan" }),
    Object.freeze({ id: "hyena", condition: "animal", singular: "hyena", plural: "hyenas", image: "assets/items/hyena.png", imageAlt: "An isolated realistic spotted hyena" }),
    Object.freeze({ id: "gazelle", condition: "animal", singular: "gazelle", plural: "gazelles", image: "assets/items/gazelle.png", imageAlt: "An isolated realistic gazelle" }),
    Object.freeze({ id: "snail", condition: "animal", singular: "snail", plural: "snails", image: "assets/items/snail.png", imageAlt: "An isolated realistic land snail" }),
    Object.freeze({ id: "cravat", condition: "artifact", singular: "cravat", plural: "cravats", image: "assets/items/cravat.png", imageAlt: "An isolated realistic cravat" }),
    Object.freeze({ id: "xylophone", condition: "artifact", singular: "xylophone", plural: "xylophones", image: "assets/items/xylophone.png", imageAlt: "An isolated realistic xylophone" }),
    Object.freeze({ id: "card", condition: "artifact", singular: "card", plural: "cards", image: "assets/items/card.png", imageAlt: "An isolated realistic playing card" }),
    Object.freeze({ id: "dinghy", condition: "artifact", singular: "dinghy", plural: "dinghies", image: "assets/items/dinghy.png", imageAlt: "An isolated realistic dinghy" })
  ]);

  const questions = Object.freeze([
    Object.freeze({ id: "purpose_exists", responseType: "slider", template: "{Plural} have a purpose." }),
    Object.freeze({ id: "purpose_self_good", responseType: "slider", template: "The purpose of {plural} is good for {plural}." }),
    Object.freeze({ id: "purpose_ecosystem_good", responseType: "slider", template: "The purpose of {plural} is good for the ecosystem." }),
    Object.freeze({ id: "purpose_humans_good", responseType: "slider", template: "The purpose of {plural} is good for humans." }),
    Object.freeze({ id: "purpose_important", responseType: "slider", template: "The purpose of {plural} is important." })
  ]);

  global.AnimalGoodnessStudy = global.AnimalGoodnessStudy || {};
  global.AnimalGoodnessStudy.Config = Object.freeze({
    version: "animal_goodness_v7",
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
