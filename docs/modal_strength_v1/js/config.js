(function (global) {
  "use strict";

  const animals = Object.freeze([
    Object.freeze({ id: "opossum", singular: "opossum", plural: "opossums", image: "assets/animals/opossum.png", imageAlt: "An isolated realistic opossum" }),
    Object.freeze({ id: "lion", singular: "lion", plural: "lions", image: "assets/animals/lion.png", imageAlt: "An isolated realistic lion" }),
    Object.freeze({ id: "serval", singular: "serval", plural: "servals", image: "assets/animals/serval.png", imageAlt: "An isolated realistic serval" }),
    Object.freeze({ id: "cheetah", singular: "cheetah", plural: "cheetahs", image: "assets/animals/cheetah.png", imageAlt: "An isolated realistic cheetah" }),
    Object.freeze({ id: "beaver", singular: "beaver", plural: "beavers", image: "assets/animals/beaver.png", imageAlt: "An isolated realistic beaver" }),
    Object.freeze({ id: "deer", singular: "deer", plural: "deer", image: "assets/animals/deer.png", imageAlt: "An isolated realistic deer" }),
    Object.freeze({ id: "leopard", singular: "leopard", plural: "leopards", image: "assets/animals/leopard.png", imageAlt: "An isolated realistic leopard" }),
    Object.freeze({ id: "gazelle", singular: "gazelle", plural: "gazelles", image: "assets/animals/gazelle.png", imageAlt: "An isolated realistic gazelle" })
  ]);

  const question = Object.freeze({
    id: "modal_purpose",
    responseType: "binary",
    template: "{Plural} must exist for some purpose."
  });

  global.ModalStrengthStudy = global.ModalStrengthStudy || {};
  global.ModalStrengthStudy.Config = Object.freeze({
    version: "modal_strength_v3",
    title: "Purpose Study",
    estimatedMinutes: 2,
    consentPayment: "$0.60",
    assignmentSize: 4,
    animals: animals,
    question: question
  });
})(window);
