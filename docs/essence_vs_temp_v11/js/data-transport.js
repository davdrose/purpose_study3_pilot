(function () {
  "use strict";

  const Config = window.EssenceStudy.Config;

  let clientPromise = null;

  function loadLabClient(assignment) {
    if (!clientPromise) {
      clientPromise = import(Config.LAB_CLIENT_URL).then(function (module) {
        const options = assignment.condition_override
          ? { launch: { condition: assignment.condition_override } }
          : {};
        return module.default(options);
      });
    }
    return clientPromise;
  }

  async function submit(payload, assignment) {
    window.__LAST_EXPLANATION_LAB_PAYLOAD__ = payload;

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

    const client = await loadLabClient(assignment);
    const participant = payload.participant || {};
    const trials = Array.isArray(payload.trials) ? payload.trials : [];
    const result = await client.submit(trials, {
      durationMs: Number.isFinite(participant.elapsed_seconds)
        ? Math.round(participant.elapsed_seconds * 1000)
        : null,
      metadata: Object.assign({}, participant, {
        experimentVersion: Config.EXPERIMENT_VERSION,
        schemaVersion: Config.DATA_SCHEMA_VERSION,
        demographicFields: ["sex", "age", "race"],
        experiment_version: Config.EXPERIMENT_VERSION,
        data_schema_version: Config.DATA_SCHEMA_VERSION,
        source_transport: "explanation-lab-client",
        lab_study_key: assignment.lab_study_key,
        assigned_condition: assignment.condition
      }),
      showRetryScreen: false
    });
    return {
      saved: true,
      mode: result.mode,
      transmitted: true,
      redirectUrl: result.redirectUrl,
      submissionId: result.id,
      duplicate: Boolean(result.duplicate)
    };
  }

  window.EssenceStudy = window.EssenceStudy || {};
  window.EssenceStudy.Transport = { submit: submit, loadLabClient: loadLabClient };
})();
