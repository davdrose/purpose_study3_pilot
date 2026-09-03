(function (global) {
  "use strict";

  const Study = global.ModalStrengthStudy;
  const C = Study.Config;

  function queryValue(name) {
    const value = new URLSearchParams(global.location.search).get(name);
    return value && value.trim() ? value.trim() : null;
  }

  function randomIndex(maxExclusive) {
    if (global.crypto && typeof global.crypto.getRandomValues === "function") {
      const range = 0x100000000;
      const limit = range - (range % maxExclusive);
      const value = new Uint32Array(1);
      do global.crypto.getRandomValues(value);
      while (value[0] >= limit);
      return value[0] % maxExclusive;
    }
    return Math.floor(Math.random() * maxExclusive);
  }

  function shuffle(values) {
    const result = values.slice();
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = randomIndex(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function parseOrderOverride(name, validIds, requiredCount) {
    const raw = queryValue(name);
    if (!raw) return null;
    const ids = raw.split(",").map(function (value) { return value.trim(); });
    const unique = new Set(ids);
    if (ids.length !== requiredCount || unique.size !== requiredCount) return null;
    return ids.every(function (id) { return validIds.includes(id); }) ? ids : null;
  }

  function anonymousId() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return "anon-" + global.crypto.randomUUID();
    }
    return "anon-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
  }

  function createAssignment() {
    const animalIds = C.animals.map(function (animal) { return animal.id; });
    const animalOrder = parseOrderOverride("animal_order", animalIds, C.assignmentSize) ||
      shuffle(animalIds).slice(0, C.assignmentSize);
    return Object.freeze({ animalOrder: Object.freeze(animalOrder) });
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

  function buildPayload(jsPsych) {
    return {
      experiment_version: C.version,
      participant: Study.runtime.participant,
      assignment: {
        stimulus_pool: C.animals.map(function (animal) { return animal.id; }),
        assignment_size: C.assignmentSize,
        animal_order: Study.runtime.assignment.animalOrder
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
    buildPayload: buildPayload,
    downloadJson: downloadJson,
    shuffle: shuffle
  });
})(window);
