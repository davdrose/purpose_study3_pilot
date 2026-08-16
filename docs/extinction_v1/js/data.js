(function (global) {
  "use strict";

  const Study = global.ExtinctionStudy;
  const C = Study.Config;

  function queryValue(name) {
    const value = new URLSearchParams(global.location.search).get(name);
    return value && value.trim() ? value.trim() : null;
  }

  function randomBit() {
    if (global.crypto && typeof global.crypto.getRandomValues === "function") {
      const value = new Uint32Array(1);
      global.crypto.getRandomValues(value);
      return value[0] % 2;
    }
    return Math.random() < 0.5 ? 0 : 1;
  }

  function anonymousId() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return "anon-" + global.crypto.randomUUID();
    }
    return "anon-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
  }

  function resolvedOrder() {
    const override = queryValue("order");
    if (override === "extinction_first" || override === "survival_first") return override;
    return randomBit() === 0 ? "extinction_first" : "survival_first";
  }

  function resolvedMapping() {
    const override = queryValue("mapping");
    if (override === "tavira_extinction" || override === "lorinu_extinction") return override;
    return randomBit() === 0 ? "tavira_extinction" : "lorinu_extinction";
  }

  function createAssignment() {
    const order = resolvedOrder();
    const mapping = resolvedMapping();
    const extinctionSpeciesId = mapping === "tavira_extinction" ? "tavira" : "lorinu";

    const cases = C.species.map(function (species) {
      const condition = species.id === extinctionSpeciesId ? "extinction" : "survival";
      return Object.freeze({
        species: species,
        condition: condition,
        speciesBecameExtinct: condition === "extinction",
        survivingPopulation: condition === "extinction" ? "0" : C.survivingPopulationDescription
      });
    });

    const byCondition = Object.fromEntries(cases.map(function (caseData) {
      return [caseData.condition, caseData];
    }));
    const sequence = order === "extinction_first"
      ? [byCondition.extinction, byCondition.survival]
      : [byCondition.survival, byCondition.extinction];

    return Object.freeze({
      order: order,
      mapping: mapping,
      extinctionSpeciesId: extinctionSpeciesId,
      caseSequence: Object.freeze(sequence)
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

  function buildPayload(jsPsych) {
    const runtime = Study.runtime;
    return {
      experiment_version: C.version,
      participant: runtime.participant,
      assignment: {
        order: runtime.assignment.order,
        mapping: runtime.assignment.mapping,
        extinction_species_id: runtime.assignment.extinctionSpeciesId
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
    buildPayload: buildPayload,
    downloadJson: downloadJson
  });
})(window);
