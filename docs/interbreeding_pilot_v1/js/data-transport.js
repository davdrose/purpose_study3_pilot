(function () {
  "use strict";

  const DEMOGRAPHIC_FIELDS = ["age", "ethnicity", "gender", "other_gender", "other_race", "race"];

  function buildSubmissionRows(payload) {
    const source = payload || {};
    const demographics = source.demographics || {};
    const summary = source.summary || {};
    const shared = {
      participant_id: demographics.participant_id || null,
      evidence_order: demographics.evidence_order || null,
      experiment_version: demographics.experiment_version || window.Interbreeding.Config.EXPERIMENT_VERSION,
      data_schema_version: demographics.data_schema_version || window.Interbreeding.Config.DATA_SCHEMA_VERSION
    };
    const rows = [{
      ...shared,
      trial_type: "participant_summary",
      trial_role: "summary",
      item_id: "participant_summary",
      measure: "study_completion",
      completed: Boolean(demographics.completed),
      consent_given: Boolean(demographics.consent_given),
      total_duration_ms: demographics.total_duration_ms,
      lineages_completed: summary.lineages_completed,
      sequence_completed: Boolean(summary.sequence_completed),
      single_trial_preview: Boolean(summary.single_trial_preview)
    }];

    (source.trial || []).forEach(function (row) {
      rows.push(Object.assign({}, shared, row, {
        trial_type: "generation_decision",
        trial_role: "response",
        item_id: row.lineage_id + "_generation_" + row.generation,
        measure: "species_boundary_decision"
      }));
    });

    (source.lineage || []).forEach(function (row) {
      rows.push(Object.assign({}, shared, row, {
        trial_type: "lineage_summary",
        trial_role: "response_summary",
        item_id: row.lineage_id + "_summary",
        measure: "species_boundary_summary"
      }));
    });

    rows.push({
      ...shared,
      trial_type: "final_feedback",
      trial_role: "feedback",
      item_id: "final_feedback",
      measure: "participant_feedback",
      feedback: demographics.feedback,
      confusion_feedback: demographics.confusion_feedback
    });

    rows.push({
      ...shared,
      trial_type: "demographics",
      trial_role: "demographic",
      item_id: "demographics",
      age: demographics.age,
      ethnicity: demographics.ethnicity,
      gender: demographics.gender,
      other_gender: demographics.other_gender,
      other_race: demographics.other_race,
      race: demographics.race
    });

    return rows;
  }

  async function submit(payload, assignment) {
    const rows = buildSubmissionRows(payload);
    window.__LAST_INTERBREEDING_PAYLOAD__ = payload;
    window.__LAST_EXPLANATION_LAB_ROWS__ = rows;

    if (assignment.submission_test === "failure") {
      throw new Error("Simulated local submission failure.");
    }
    if (assignment.submission_test === "success") {
      return { saved: true, mode: "local-test", transmitted: false };
    }
    if (assignment.local_mode) {
      return { saved: true, mode: "local-preview", transmitted: false };
    }
    if (!window.explanationLab || typeof window.explanationLab.submit !== "function") {
      throw new Error("The Explanation Lab data service did not load.");
    }

    const result = await window.explanationLab.submit(rows, {
      showRetryScreen: false,
      durationMs: payload.summary && payload.summary.total_duration_ms,
      metadata: {
        experimentVersion: window.Interbreeding.Config.EXPERIMENT_VERSION,
        schemaVersion: window.Interbreeding.Config.DATA_SCHEMA_VERSION,
        demographicFields: DEMOGRAPHIC_FIELDS,
        design: window.Interbreeding.Config.DESIGN,
        sourcePayloadFormat: "interbreeding_minimized_v38"
      }
    });
    return {
      saved: true,
      mode: window.explanationLab.launch.mode,
      transmitted: true,
      redirectUrl: result.redirectUrl
    };
  }

  window.Interbreeding = window.Interbreeding || {};
  window.Interbreeding.Transport = { buildSubmissionRows: buildSubmissionRows, submit: submit };
})();
