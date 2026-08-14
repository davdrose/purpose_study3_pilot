(function () {
  "use strict";

  const stimuli = [
    {
      id: "rhinoceros",
      singular: "rhinoceros",
      plural: "rhinoceroses",
      category: "animal",
      image: "assets/images/rhinoceros.png",
      question_id: "ITEM_RHINOCEROS"
    },
    {
      id: "beaver",
      singular: "beaver",
      plural: "beavers",
      category: "animal",
      image: "assets/images/beaver.png",
      question_id: "ITEM_BEAVER"
    },
    {
      id: "tiger",
      singular: "tiger",
      plural: "tigers",
      category: "animal",
      image: "assets/images/tiger.png",
      question_id: "ITEM_TIGER"
    },
    {
      id: "porcupine",
      singular: "porcupine",
      plural: "porcupines",
      category: "animal",
      image: "assets/images/porcupine.png",
      question_id: "ITEM_PORCUPINE"
    },
    {
      id: "monkey",
      singular: "monkey",
      plural: "monkeys",
      category: "animal",
      image: "assets/images/monkey.png",
      question_id: "ITEM_MONKEY"
    },
    {
      id: "squirrel",
      singular: "squirrel",
      plural: "squirrels",
      category: "animal",
      image: "assets/images/squirrel.png",
      question_id: "ITEM_SQUIRREL"
    },
    {
      id: "lemur",
      singular: "lemur",
      plural: "lemurs",
      category: "animal",
      image: "assets/images/lemur.png",
      question_id: "ITEM_LEMUR"
    },
    {
      id: "otter",
      singular: "otter",
      plural: "otters",
      category: "animal",
      image: "assets/images/otter.png",
      question_id: "ITEM_OTTER"
    }
  ];

  function statement(stimulus, construct) {
    const feature = construct === "temperature" ? "temperature" : "purpose";
    return "The " + feature + " of " + stimulus.plural + " is part of the essence of what it is to be " + article(stimulus.singular) + ".";
  }

  function article(noun) {
    return (/^[aeiou]/i.test(noun) ? "an " : "a ") + noun;
  }

  function preload() {
    stimuli.forEach(function (stimulus) {
      const image = new Image();
      image.src = stimulus.image;
    });
  }

  function validate() {
    const ids = new Set();
    stimuli.forEach(function (stimulus) {
      if (!stimulus.id || !stimulus.image || !stimulus.singular || !stimulus.plural) {
        throw new Error("A stimulus definition is incomplete.");
      }
      if (ids.has(stimulus.id)) throw new Error("Duplicate stimulus id: " + stimulus.id);
      ids.add(stimulus.id);
    });
    if (stimuli.length !== 8) throw new Error("The v11 design requires exactly eight target stimuli.");
    if (stimuli.some(function (stimulus) { return stimulus.category !== "animal"; })) {
      throw new Error("Every v11 target stimulus must be an animal.");
    }
  }

  window.EssenceStudy = window.EssenceStudy || {};
  window.EssenceStudy.Stimuli = {
    list: stimuli,
    statement: statement,
    preload: preload,
    validate: validate
  };
})();
