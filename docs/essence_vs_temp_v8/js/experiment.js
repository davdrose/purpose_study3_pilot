(function () {
  "use strict";

  function boot() {
    try {
      window.EssenceStudy.Stimuli.validate();
      window.EssenceStudy.Stimuli.preload();
      const assignment = window.EssenceStudy.Randomization.buildAssignment();
      if (!assignment.local_mode && !assignment.participant_parameters_complete) {
        document.getElementById("jspsych-target").innerHTML = window.EssenceStudy.UI.fatal("The required Prolific participant parameters are missing. Please reopen the study from Prolific, or add ?temp or ?purpose for a local condition test.");
        return;
      }
      window.essenceAssignment = assignment;
      document.title = window.EssenceStudy.Config.STUDY_TITLE;
      const jsPsych = initJsPsych({
        display_element: "jspsych-target",
        show_progress_bar: false,
        on_finish: function () {
          if (window.essenceStudyApp) window.essenceStudyApp.restoreTerminal();
        },
        on_close: function () {
          if (window.essenceStudyApp && window.essenceStudyApp.data) {
            window.essenceStudyApp.data.writeEvent("window_closed", {});
          }
        }
      });
      window.essenceJsPsych = jsPsych;
      jsPsych.run([{ type: window.EssenceSurveyPlugin }]);
    } catch (error) {
      console.error("Essence Study initialization error", error);
      const target = document.getElementById("jspsych-target");
      target.innerHTML = window.EssenceStudy && window.EssenceStudy.UI
        ? window.EssenceStudy.UI.fatal(error.message)
        : "<p>The experiment could not be opened.</p>";
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
