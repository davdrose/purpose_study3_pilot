(function () {
  "use strict";

  const Config = window.EssenceStudy.Config;

  function waitForProliferate(timeoutMs) {
    const started = Date.now();
    return new Promise(function (resolve, reject) {
      function check() {
        if (window.proliferate && typeof window.proliferate.submit === "function") {
          resolve(window.proliferate);
          return;
        }
        if (Date.now() - started >= timeoutMs) {
          reject(new Error("The Proliferate data service did not load."));
          return;
        }
        window.setTimeout(check, 100);
      }
      check();
    });
  }

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
    if (!Config.REMOTE_SUBMISSION_ENABLED) {
      throw new Error("Remote submission is disabled in the study configuration.");
    }

    const service = await waitForProliferate(6000);
    await Promise.resolve(service.submit(payload));
    return { saved: true, mode: "proliferate", transmitted: true };
  }

  window.EssenceStudy = window.EssenceStudy || {};
  window.EssenceStudy.Transport = { submit: submit, waitForProliferate: waitForProliferate };
})();
