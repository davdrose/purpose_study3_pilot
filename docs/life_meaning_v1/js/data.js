(function (global) {
  "use strict";

  const Study = global.LifeMeaningStudy;
  const C = Study.Config;

  function queryValue(name) {
    const value = new URLSearchParams(global.location.search).get(name);
    return value && value.trim() ? value.trim() : null;
  }

  function anonymousId() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return "anon-" + global.crypto.randomUUID();
    }
    return "anon-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
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
    const trials = jsPsych.data.get().values();
    const responses = {};
    trials.filter(function (trial) { return trial.screen_id === "study_question"; })
      .forEach(function (trial) { responses[trial.question_id] = trial.response; });
    return {
      experiment_version: C.version,
      participant: Study.runtime.participant,
      consent_given: Study.runtime.consentGiven,
      question_order: C.questions.map(function (question) { return question.id; }),
      responses: responses,
      completed_at: new Date().toISOString(),
      trials: trials
    };
  }

  function downloadJson(payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
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
    createParticipant: createParticipant,
    buildPayload: buildPayload,
    downloadJson: downloadJson
  });
})(window);
