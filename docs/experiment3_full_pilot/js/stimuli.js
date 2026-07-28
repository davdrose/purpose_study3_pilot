(function () {
  "use strict";

  const animalOrder = ["rellin", "daxon", "bramel", "kivon", "tembin", "sulak"];

  const animals = {
    rellin: {
      singular: "Rellin",
      plural: "Rellins",
      scan: {
        genome: { value: "G-41", width: 78 },
        development: { value: "D-17", width: 64 },
        body: { value: "B-63", width: 92 }
      },
      purpose: {
        purpose: { value: "Making honey", width: 78 },
        animalBenefit: { value: "Stored food during shortages", width: 64 },
        environmentBenefit: { value: "Provides a food source for other animals", width: 92 }
      },
      microdermal: {
        skinConductance: { value: "45 µS", width: 78 },
        oxygenSaturation: { value: "61%", width: 64 },
        melaninConcentration: { value: "26 mg/mL", width: 92 }
      }
    },
    daxon: {
      singular: "Daxon",
      plural: "Daxons",
      scan: {
        genome: { value: "G-82", width: 64 },
        development: { value: "D-54", width: 92 },
        body: { value: "B-31", width: 78 }
      },
      purpose: {
        purpose: { value: "Eating dead animals", width: 64 },
        animalBenefit: { value: "Food when live prey is scarce", width: 92 },
        environmentBenefit: { value: "Removes carcasses and returns nutrients", width: 78 }
      },
      microdermal: {
        skinConductance: { value: "36 µS", width: 64 },
        oxygenSaturation: { value: "89%", width: 92 },
        melaninConcentration: { value: "22 mg/mL", width: 78 }
      }
    },
    bramel: {
      singular: "Bramel",
      plural: "Bramels",
      scan: {
        genome: { value: "G-26", width: 92 },
        development: { value: "D-74", width: 78 },
        body: { value: "B-58", width: 64 }
      },
      purpose: {
        purpose: { value: "Spinning webs", width: 92 },
        animalBenefit: { value: "Food from insects caught in webs", width: 78 },
        environmentBenefit: { value: "Controls plant-eating insect numbers", width: 64 }
      },
      microdermal: {
        skinConductance: { value: "53 µS", width: 92 },
        oxygenSaturation: { value: "75%", width: 78 },
        melaninConcentration: { value: "18 mg/mL", width: 64 }
      }
    },
    kivon: {
      singular: "Kivon",
      plural: "Kivons",
      scan: {
        genome: { value: "G-77", width: 92 },
        development: { value: "D-32", width: 64 },
        body: { value: "B-15", width: 78 }
      },
      purpose: {
        purpose: { value: "Spreading seeds", width: 92 },
        animalBenefit: { value: "Fruit provides food", width: 64 },
        environmentBenefit: { value: "Helps plants grow in new places", width: 78 }
      },
      microdermal: {
        skinConductance: { value: "57 µS", width: 92 },
        oxygenSaturation: { value: "67%", width: 64 },
        melaninConcentration: { value: "24 mg/mL", width: 78 }
      }
    },
    tembin: {
      singular: "Tembin",
      plural: "Tembins",
      scan: {
        genome: { value: "G-35", width: 78 },
        development: { value: "D-68", width: 92 },
        body: { value: "B-91", width: 64 }
      },
      purpose: {
        purpose: { value: "Making light", width: 78 },
        animalBenefit: { value: "Helps families reunite at night", width: 92 },
        environmentBenefit: { value: "Helps nighttime animals find food", width: 64 }
      },
      microdermal: {
        skinConductance: { value: "49 µS", width: 78 },
        oxygenSaturation: { value: "95%", width: 92 },
        melaninConcentration: { value: "20 mg/mL", width: 64 }
      }
    },
    sulak: {
      singular: "Sulak",
      plural: "Sulaks",
      scan: {
        genome: { value: "G-64", width: 64 },
        development: { value: "D-25", width: 78 },
        body: { value: "B-47", width: 92 }
      },
      purpose: {
        purpose: { value: "Purifying water", width: 64 },
        animalBenefit: { value: "Keeps drinking water clean", width: 78 },
        environmentBenefit: { value: "Provides clean water for other animals", width: 92 }
      },
      microdermal: {
        skinConductance: { value: "40 µS", width: 64 },
        oxygenSaturation: { value: "81%", width: 78 },
        melaninConcentration: { value: "29 mg/mL", width: 92 }
      }
    }
  };

  const environments = {
    woodland: {
      title: "The flowering woodlands of Orba",
      habitat: "woodland",
      features: "flowers, trees, insects, waterways, and animal remains"
    },
    grassland: {
      title: "The open grasslands of Nira",
      habitat: "grassland",
      features: "flowers, shrubs, insects, waterways, and animal remains"
    },
    marsh: {
      title: "The marshlands of Selu",
      habitat: "marsh",
      features: "flowers, reeds, insects, waterways, and animal remains"
    }
  };

  const perfectMatchings = (remaining) => {
    if (remaining.length === 0) return [[]];
    const first = remaining[0];
    const schedules = [];
    for (let index = 1; index < remaining.length; index += 1) {
      const partner = remaining[index];
      const rest = remaining.filter((_, restIndex) => restIndex !== 0 && restIndex !== index);
      perfectMatchings(rest).forEach((matching) => {
        schedules.push([[first, partner], ...matching]);
      });
    }
    return schedules;
  };

  const matchingSchedules = perfectMatchings(animalOrder).map((pairs, index) => ({
    id: `schedule-${String(index + 1).padStart(2, "0")}`,
    pairs
  }));

  window.PURPOSE_STIMULI = Object.freeze({
    animalOrder: Object.freeze([...animalOrder]),
    animals: Object.freeze(animals),
    environments: Object.freeze(environments),
    matchingSchedules: Object.freeze(matchingSchedules)
  });
})();
