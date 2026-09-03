(function () {
  "use strict";

  function completionScreen(jsPsych) {
    const row = window.fossilPilotResult || jsPsych.data.get().last(1).values()[0] || {};
    const target = document.getElementById("jspsych-target");
    target.innerHTML = '<main class="completion-screen"><section>' +
      '<span class="completion-mark" aria-hidden="true">✓</span>' +
      '<small>Single trial complete</small>' +
      '<h1>Your responses were recorded.</h1>' +
      '<p>You rated <strong>' + (row.focal_fossil_label || "the fossil sample") + '</strong> as <strong>' +
        (row.new_species_extent_rating == null ? "—" : row.new_species_extent_rating) + ' out of 100</strong>.</p>' +
      '<button type="button" data-review-trial>Review the trial again</button>' +
      '<span class="prototype-note">Prototype mode · No data were sent to a server</span>' +
    '</section></main>';
    target.querySelector("[data-review-trial]").addEventListener("click", function () { window.location.reload(); });
  }

  function boot() {
    try {
      window.FossilPilot.Stimuli.validate();
      const jsPsych = initJsPsych({
        display_element: "jspsych-target",
        on_finish: function () { completionScreen(jsPsych); }
      });
      window.fossilPilotJsPsych = jsPsych;
      jsPsych.run([
        { type: window.FossilConsentPlugin },
        { type: window.FossilStudyIntroductionPlugin },
        { type: window.FossilSpeciationTrialPlugin },
        { type: window.FossilDemographicsPlugin }
      ]);
    } catch (error) {
      console.error("Fossil Pilot initialization error", error);
      document.getElementById("jspsych-target").innerHTML = '<main class="completion-screen error-screen"><section><h1>The trial could not be opened.</h1><p>Please reopen index.html from the complete pilot_v27 folder.</p></section></main>';
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
