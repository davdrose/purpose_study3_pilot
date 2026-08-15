(function () {
  "use strict";

  async function submit(payload, assignment) {
    window.__LAST_PROLIFERATE_PAYLOAD__ = payload;

    if (assignment.submission_test === "failure") {
      throw new Error("Simulated local submission failure.");
    }
    if (assignment.submission_test === "success") {
      return { saved: true, mode: "local-test", transmitted: false };
    }
    if (assignment.local_mode) {
      return { saved: true, mode: "local-preview", transmitted: false };
    }
    if (!window.proliferate || typeof window.proliferate.submit !== "function") {
      throw new Error("The Proliferate data service did not load.");
    }

    await Promise.resolve(window.proliferate.submit(payload));
    return { saved: true, mode: "proliferate", transmitted: true };
  }

  window.Interbreeding = window.Interbreeding || {};
  window.Interbreeding.Transport = { submit: submit };
})();
