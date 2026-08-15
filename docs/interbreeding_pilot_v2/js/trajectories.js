(function () {
  "use strict";

  // Matched trajectories place DNA-change evidence and purpose-change evidence
  // on the same standardized, qualitative evidence-strength scale. Participants
  // see only the unnumbered curves; these latent values define and log stimuli.
  const matched = {
    early: [0, 5, 12, 35, 51, 65, 78, 90],
    late: [0, 5, 9, 14, 22, 35, 68, 90]
  };
  const genetic = { early: matched.early.slice(), late: matched.late.slice() };
  const purpose = { early: matched.early.slice(), late: matched.late.slice() };
  const trait = [0, 1, 2, 3, 4, 5, 6, 7];

  function buildTrajectory(geneticTiming, purposeTiming) {
    const geneticValues = genetic[geneticTiming] || genetic.late;
    const purposeValues = purpose[purposeTiming] || purpose.late;
    const geneticAccelerationGeneration = geneticTiming === "early" ? 3 : 6;
    const purposeAccelerationGeneration = purposeTiming === "early" ? 3 : 6;
    return geneticValues.map(function (geneticScore, generation) {
      const previousGenetic = generation ? geneticValues[generation - 1] : 0;
      const previousPurpose = generation ? purposeValues[generation - 1] : 0;
      return {
        generation: generation,
        genetic_evidence_score: geneticScore,
        genetic_increment_from_previous_generation: generation ? geneticScore - previousGenetic : 0,
        genetic_acceleration_this_generation: generation === geneticAccelerationGeneration,
        purpose_evidence_score: purposeValues[generation],
        purpose_increment_from_previous_generation: generation ? purposeValues[generation] - previousPurpose : 0,
        purpose_acceleration_this_generation: generation === purposeAccelerationGeneration,
        target_feature_level: trait[generation],
        target_feature_increment: generation ? 1 : 0
      };
    });
  }

  function validate() {
    [genetic.early, genetic.late, purpose.early, purpose.late].forEach(function (trajectory) {
      if (trajectory.length !== 8 || trajectory[0] !== 0 || trajectory[7] !== 90) throw new Error("Invalid trajectory endpoints.");
      trajectory.forEach(function (value, index) {
        if (index && value <= trajectory[index - 1]) throw new Error("Evidence strength must increase monotonically.");
      });
    });
    if (trait.some(function (value, index) { return value !== index; })) throw new Error("The focal-trait trajectory must remain fixed across conditions.");
    if (genetic.early[7] !== genetic.late[7] || purpose.early[7] !== purpose.late[7]) throw new Error("Condition endpoints must match.");
    if (genetic.early.join(",") !== purpose.early.join(",") || genetic.late.join(",") !== purpose.late.join(",")) throw new Error("DNA and purpose evidence-strength trajectories must remain matched.");
  }

  validate();
  window.Interbreeding = window.Interbreeding || {};
  window.Interbreeding.Trajectories = {
    genetic: { early: genetic.early.slice(), late: genetic.late.slice() },
    purpose: { early: purpose.early.slice(), late: purpose.late.slice() },
    trait: trait.slice(),
    build: buildTrajectory,
    validate: validate
  };
})();
