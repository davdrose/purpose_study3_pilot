(function (global) {
  "use strict";

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function postJson(endpoint, payload, idempotencyKey) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify(payload),
      credentials: "omit"
    });
    if (!response.ok) throw new Error(`Save failed with status ${response.status}.`);
    return response;
  }

  async function saveStudyData(payload, runtime) {
    global.__LAST_PROLIFERATE_PAYLOAD__ = payload;
    if (runtime.debug) {
      global.__CONTEXTUAL_SAMPLING_DEBUG_DATA__ = payload;
      return { saved: true, mode: "debug-local", transmitted: false };
    }
    if (!payload.session?.completed || payload.trial?.length !== 3 ||
        payload.trial.some((row) => !row.trial_completed)) {
      throw new Error("Incomplete records cannot be submitted as successful.");
    }
    if (global.proliferate && typeof global.proliferate.submit === "function") {
      if (!global.__CONTEXTUAL_SAMPLING_SUBMISSION__) {
        global.__CONTEXTUAL_SAMPLING_SUBMISSION__ = Promise.resolve().then(() => global.proliferate.submit(payload));
      }
      try {
        await global.__CONTEXTUAL_SAMPLING_SUBMISSION__;
      } catch (error) {
        global.__CONTEXTUAL_SAMPLING_SUBMISSION__ = null;
        throw error;
      }
      return { saved: true, mode: "proliferate", transmitted: true };
    }
    if (!runtime.data_endpoint || !/^https:\/\//i.test(runtime.data_endpoint)) {
      throw new Error("No approved HTTPS data endpoint is configured.");
    }
    let lastError;
    for (const delay of global.ContextualSamplingConfig.timing.save_retry_delays_ms) {
      if (delay) await sleep(delay);
      try {
        await postJson(runtime.data_endpoint, payload, payload.session.session_id);
        return { saved: true, mode: "https", transmitted: true };
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }

  function downloadPayload(payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contextual-sampling-${payload.session.session_id}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  global.ContextualTransport = { saveStudyData, downloadPayload };
})(typeof window !== "undefined" ? window : globalThis);
