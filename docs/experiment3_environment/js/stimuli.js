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
      environmental_exposure: {
        mineralResidue: { value: "53 µg/cm²", width: 92 },
        atmosphericParticles: { value: "61 particles/cm²", width: 64 },
        exposureSignature: { value: "77/100", width: 78 }
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
      environmental_exposure: {
        mineralResidue: { value: "45 µg/cm²", width: 78 },
        atmosphericParticles: { value: "89 particles/cm²", width: 92 },
        exposureSignature: { value: "62/100", width: 64 }
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
      environmental_exposure: {
        mineralResidue: { value: "36 µg/cm²", width: 64 },
        atmosphericParticles: { value: "75 particles/cm²", width: 78 },
        exposureSignature: { value: "91/100", width: 92 }
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
      environmental_exposure: {
        mineralResidue: { value: "49 µg/cm²", width: 78 },
        atmosphericParticles: { value: "67 particles/cm²", width: 64 },
        exposureSignature: { value: "96/100", width: 92 }
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
      environmental_exposure: {
        mineralResidue: { value: "40 µg/cm²", width: 64 },
        atmosphericParticles: { value: "95 particles/cm²", width: 92 },
        exposureSignature: { value: "80/100", width: 78 }
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
      environmental_exposure: {
        mineralResidue: { value: "57 µg/cm²", width: 92 },
        atmosphericParticles: { value: "81 particles/cm²", width: 78 },
        exposureSignature: { value: "66/100", width: 64 }
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
