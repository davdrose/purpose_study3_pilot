(function () {
  "use strict";

  const stimuli = [
    {
      id: "bee",
      singular: "bee",
      plural: "bees",
      category: "animal",
      image: "assets/images/bee.png",
      qualtrics_question_id: "QID550"
    },
    {
      id: "spider",
      singular: "spider",
      plural: "spiders",
      category: "animal",
      image: "assets/images/spider.png",
      qualtrics_question_id: "QID562"
    },
    {
      id: "hummingbird",
      singular: "hummingbird",
      plural: "hummingbirds",
      category: "animal",
      image: "assets/images/hummingbird.png",
      qualtrics_question_id: "QID563"
    },
    {
      id: "vulture",
      singular: "vulture",
      plural: "vultures",
      category: "animal",
      image: "assets/images/vulture.png",
      qualtrics_question_id: "QID565"
    },
    {
      id: "dust",
      singular: "dust",
      plural: "dust",
      category: "nlnk",
      image: "assets/images/dust.png",
      qualtrics_question_id: "QID591"
    },
    {
      id: "crater",
      singular: "crater",
      plural: "craters",
      category: "nlnk",
      image: "assets/images/crater.png",
      qualtrics_question_id: "QID592"
    },
    {
      id: "icicle",
      singular: "icicle",
      plural: "icicles",
      category: "nlnk",
      image: "assets/images/icicle.png",
      qualtrics_question_id: "QID593"
    },
    {
      id: "asteroid",
      singular: "asteroid",
      plural: "asteroids",
      category: "nlnk",
      image: "assets/images/asteroid.png",
      qualtrics_question_id: "QID594"
    }
  ];

  function statement(stimulus, condition) {
    const feature = condition === "temperature" ? "temperature" : "purpose";
    return "The " + feature + " of " + stimulus.plural + " is part of the essence of what it is to be " + article(stimulus.singular) + ".";
  }

  function article(noun) {
    if (noun === "dust") return "dust";
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
    if (stimuli.length !== 8) throw new Error("The exp5 design requires exactly eight target stimuli.");
  }

  window.EssenceStudy = window.EssenceStudy || {};
  window.EssenceStudy.Stimuli = {
    list: stimuli,
    statement: statement,
    preload: preload,
    validate: validate
  };
})();
