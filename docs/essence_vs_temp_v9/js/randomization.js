(function () {
  "use strict";

  const Config = window.EssenceStudy.Config;

  function hashSeed(text) {
    let hash = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededRandom(seedText) {
    let state = hashSeed(seedText) || 1;
    return function () {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(values, random) {
    const result = values.slice();
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      const swap = result[i];
      result[i] = result[j];
      result[j] = swap;
    }
    return result;
  }

  function pseudonymousParticipantId(source) {
    const text = String(source || "anonymous");
    return "p-" + hashSeed(text + "|participant-a").toString(16).padStart(8, "0") + hashSeed(text + "|participant-b").toString(16).padStart(8, "0");
  }

  function value(params, key) {
    return (params.get(key) || "").trim();
  }

  function readConditionOverride(params) {
    const rawQuery = window.location.search.replace(/^\?/, "");
    const bareTokens = rawQuery.split("&").map(function (token) {
      return decodeURIComponent(token.split("=")[0] || "").toLowerCase();
    });
    const explicit = value(params, "condition").toLowerCase();
    const aliases = {
      temp: "temperature",
      temperature: "temperature",
      control: "temperature",
      purpose: "purpose",
      puprose: "purpose"
    };
    if (aliases[explicit]) return aliases[explicit];
    for (let i = 0; i < bareTokens.length; i += 1) {
      if (aliases[bareTokens[i]]) return aliases[bareTokens[i]];
    }
    return "";
  }

  function buildAssignment() {
    const params = new URLSearchParams(window.location.search);
    const prolificPid = value(params, "PROLIFIC_PID");
    const studyId = value(params, "STUDY_ID");
    const sessionId = value(params, "SESSION_ID");
    const labStudyKey = value(params, "study");
    const submissionMode = value(params, "mode") === "sandbox" ? "sandbox" : "production";
    const fallbackKey = "preview-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
    const assignmentKey = prolificPid || fallbackKey;
    const participantId = prolificPid ? pseudonymousParticipantId(prolificPid) : fallbackKey;
    const seed = value(params, "seed") || [assignmentKey, studyId, sessionId, Config.EXPERIMENT_VERSION].join("|");
    const random = seededRandom(seed);
    const randomCondition = Config.CONDITIONS[Math.floor(random() * Config.CONDITIONS.length)];
    const conditionOverride = readConditionOverride(params);
    const condition = conditionOverride || randomCondition;
    const stimulusOrder = shuffle(window.EssenceStudy.Stimuli.list, random);
    const debug = value(params, "debug") === "1";
    const submissionTest = value(params, "submission_test");
    const localHost = window.location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
    const participantParametersComplete = Boolean(prolificPid && studyId && sessionId);
    const manualConditionPreview = Boolean(conditionOverride && !participantParametersComplete);
    const localMode = localHost || debug || manualConditionPreview;

    const assignment = {
      participant_id: participantId,
      prolific_pid: prolificPid || null,
      study_id: studyId || null,
      session_id: sessionId || null,
      lab_study_key: labStudyKey || null,
      submission_mode: submissionMode,
      seed: seed,
      condition: condition,
      construct: condition,
      condition_override: conditionOverride || null,
      manual_condition_preview: manualConditionPreview,
      stimulus_order: stimulusOrder,
      participant_parameters_complete: participantParametersComplete,
      local_mode: localMode,
      preview: localMode,
      debug: debug,
      submission_test: localHost && ["success", "failure"].indexOf(submissionTest) >= 0 ? submissionTest : null
    };

    if (debug) console.info("Essence Study assignment", assignment);
    return assignment;
  }

  window.EssenceStudy = window.EssenceStudy || {};
  window.EssenceStudy.Randomization = {
    hashSeed: hashSeed,
    seededRandom: seededRandom,
    shuffle: shuffle,
    pseudonymousParticipantId: pseudonymousParticipantId,
    readConditionOverride: readConditionOverride,
    buildAssignment: buildAssignment
  };
})();
