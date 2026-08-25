(function (global) {
  "use strict";

  const Study = global.ExtinctionStudy;
  const C = Study.Config;

  const balancedSequences = Object.freeze([
    Object.freeze([0, 1, 3, 2]),
    Object.freeze([1, 2, 0, 3]),
    Object.freeze([2, 3, 1, 0]),
    Object.freeze([3, 0, 2, 1])
  ]);

  function queryValue(name) {
    const value = new URLSearchParams(global.location.search).get(name);
    return value && value.trim() ? value.trim() : null;
  }

  function randomInt(maximum) {
    if (global.crypto && typeof global.crypto.getRandomValues === "function") {
      const value = new Uint32Array(1);
      global.crypto.getRandomValues(value);
      return value[0] % maximum;
    }
    return Math.floor(Math.random() * maximum);
  }

  function resolvedIndex(name, maximum) {
    const override = queryValue(name);
    if (override !== null && /^\d+$/.test(override)) {
      const value = Number(override);
      if (value >= 0 && value < maximum) return value;
    }
    return randomInt(maximum);
  }

  function resolvedCondition() {
    const override = queryValue("condition");
    if (override === "extinction" || override === "survival") return override;
    return randomInt(2) === 0 ? "extinction" : "survival";
  }

  function anonymousId() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return "anon-" + global.crypto.randomUUID();
    }
    return "anon-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
  }

  function createAssignment() {
    const condition = resolvedCondition();
    const sequenceId = resolvedIndex("sequence", balancedSequences.length);
    const magnitudeRotation = resolvedIndex("rotation", C.lossMagnitudes.length);
    const cases = balancedSequences[sequenceId].map(function (speciesIndex, presentationIndex) {
      const species = C.species[speciesIndex];
      const magnitudeIndex = (speciesIndex + magnitudeRotation) % C.lossMagnitudes.length;
      const numberDied = C.lossMagnitudes[magnitudeIndex];
      const startingPopulation = condition === "extinction"
        ? numberDied
        : numberDied * C.survivalStartingMultiplier;
      const survivingPopulation = condition === "extinction"
        ? 0
        : numberDied * C.survivalRemainingMultiplier;

      return Object.freeze({
        caseIndex: presentationIndex + 1,
        species: species,
        condition: condition,
        magnitudeIndex: magnitudeIndex,
        numberDied: numberDied,
        startingPopulation: startingPopulation,
        survivingPopulation: survivingPopulation,
        mortalityProportion: numberDied / startingPopulation,
        speciesBecameExtinct: condition === "extinction",
        populationsRemainOnEveryIsland: condition === "survival",
        deathsDistribution: "across_all_five_islands"
      });
    });

    return Object.freeze({
      condition: condition,
      sequenceId: sequenceId,
      magnitudeRotation: magnitudeRotation,
      caseSequence: Object.freeze(cases)
    });
  }

  function createParticipant() {
    const prolificId = queryValue("PROLIFIC_PID");
    return Object.freeze({
      participantId: prolificId || queryValue("participant_id") || anonymousId(),
      prolificPid: prolificId,
      studyId: queryValue("STUDY_ID"),
      sessionId: queryValue("SESSION_ID"),
      startedAt: new Date().toISOString()
    });
  }

  function wordCount(text) {
    const trimmed = String(text || "").trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }

  function formatNumber(value) {
    return Number(value).toLocaleString("en-US");
  }

  function buildPayload(jsPsych) {
    const runtime = Study.runtime;
    return {
      experiment_version: C.version,
      participant: runtime.participant,
      assignment: {
        condition: runtime.assignment.condition,
        sequence_id: runtime.assignment.sequenceId,
        magnitude_rotation: runtime.assignment.magnitudeRotation,
        cases: runtime.assignment.caseSequence.map(function (caseData) {
          return {
            case_index: caseData.caseIndex,
            species_id: caseData.species.id,
            number_died: caseData.numberDied,
            starting_population: caseData.startingPopulation,
            surviving_population: caseData.survivingPopulation
          };
        })
      },
      completed_at: new Date().toISOString(),
      trials: jsPsych.data.get().values()
    };
  }

  function downloadJson(payload) {
    const text = JSON.stringify(payload, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = C.version + "_" + Study.runtime.participant.participantId + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    global.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  Study.Data = Object.freeze({
    createAssignment: createAssignment,
    createParticipant: createParticipant,
    wordCount: wordCount,
    formatNumber: formatNumber,
    buildPayload: buildPayload,
    downloadJson: downloadJson
  });
})(window);
