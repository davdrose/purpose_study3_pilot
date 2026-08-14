import createExplanationLabClient from "./explanation-lab-client.js";

(function () {
  "use strict";

  function completionScreen(jsPsych) {
    const row = window.fossilPilotResult || jsPsych.data.get().last(1).values()[0] || {};
    const target = document.getElementById("jspsych-target");
    target.innerHTML = '<main class="completion-screen"><section>' +
      '<span class="completion-mark" aria-hidden="true">✓</span>' +
      '<small>Sandbox submission saved</small>' +
      '<h1>Your test responses were recorded.</h1>' +
      '<p>You rated <strong>' + (row.focal_fossil_label || "the fossil sample") + '</strong> as <strong>' +
        (row.new_species_extent_rating == null ? "—" : row.new_species_extent_rating) + ' out of 100</strong>.</p>' +
      '<button type="button" data-review-trial>Run another sandbox test</button>' +
      '<span class="prototype-note">The Explanation Lab Console confirmed this save.</span>' +
    '</section></main>';
    target.querySelector("[data-review-trial]").addEventListener("click", function () { window.location.reload(); });
  }

  async function boot() {
    const target = document.getElementById("jspsych-target");
    try {
      target.innerHTML = '<main class="completion-screen"><section><small>Explanation Lab</small><h1>Preparing your study…</h1></section></main>';
      const explanationLab = await createExplanationLabClient();
      window.EXPLANATION_LAB_CONDITION = explanationLab.launch.condition;
      window.explanationLab = explanationLab;
      const explanationLabStudyStartedAt = performance.now();
      window.FossilPilot.Stimuli.validate();
      const jsPsych = initJsPsych({
        display_element: "jspsych-target",
        on_finish: async function () {
          const result = await explanationLab.submitAndRedirect(jsPsych.data.get(), {
            durationMs: performance.now() - explanationLabStudyStartedAt,
            metadata: {
              experimentVersion: "fossil_pilot_v14",
              schemaVersion: "2.0.0",
              demographicFields: ["age", "ethnicity", "gender", "other_gender", "other_race", "race"]
            }
          });
          if (result.mode === "sandbox") completionScreen(jsPsych);
        }
      });
      window.fossilPilotJsPsych = jsPsych;
      target.innerHTML = "";
      jsPsych.run([
        { type: window.FossilConsentPlugin },
        { type: window.FossilStudyIntroductionPlugin },
        { type: window.FossilSpeciationTrialPlugin },
        { type: window.FossilDemographicsPlugin }
      ]);
    } catch (error) {
      console.error("Fossil Pilot initialization error", error);
      target.innerHTML = '<main class="completion-screen error-screen"><section><h1>The trial could not be opened.</h1><p>' +
        (error && error.message ? error.message : 'Please reopen the study using a link from the Explanation Lab Console.') +
        '</p></section></main>';
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
