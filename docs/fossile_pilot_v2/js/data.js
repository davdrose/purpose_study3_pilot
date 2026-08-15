(function () {
  "use strict";

  function readPlatformParameters() {
    const params = new URLSearchParams(window.location.search);
    const get = function (key) { return params.get(key) || null; };
    return {
      prolific_pid: get("PROLIFIC_PID"),
      study_id: get("STUDY_ID"),
      session_id: get("SESSION_ID")
    };
  }

  function anonymousId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return "anon-" + window.crypto.randomUUID();
    return "anon-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
  }

  function participantRecord(conditionId, evidenceOrder) {
    const platform = readPlatformParameters();
    return {
      participant_id: platform.prolific_pid || anonymousId(),
      prolific_pid: platform.prolific_pid,
      study_id: platform.study_id,
      session_id: platform.session_id,
      experiment_version: window.FossilPilot.Config.EXPERIMENT_VERSION,
      consent_given: window.fossilPilotConsentGiven === true,
      condition_id: conditionId,
      evidence_order: evidenceOrder,
      browser_user_agent: navigator.userAgent,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      start_timestamp: new Date().toISOString()
    };
  }

  window.FossilPilot.Data = {
    participantRecord: participantRecord
  };
})();
