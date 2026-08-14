import createExplanationLabClient from "./explanation-lab-client.js";

(function () {
  "use strict";

  function completionMarkup(assignment, data, result) {
    const local = assignment.local_mode;
    const sandbox = result && result.mode === "sandbox";
    const payload = data.buildPayload();
    const status = local ? "Local preview complete" : sandbox ? "Sandbox submission saved" : "Study complete";
    const message = local
      ? "No data were transmitted in local preview mode. The minimized payload is available for inspection in this browser session."
      : sandbox
        ? "Your test responses were saved. You can close this tab and return to the Study Console."
        : "Your responses were saved. Redirecting you back to Prolific…";
    return '<main class="sequence-complete" aria-label="Study complete" data-lineages-completed="' + data.lineageRows.length + '" data-generation-rows="' + data.generationRows.length + '" data-payload-tables="' + Object.keys(payload).join(",") + '" data-transmitted="' + Boolean(result && result.transmitted) + '"><section><span>' + status + '</span><h1>Thank you for participating in this experiment!</h1><p>' + message +
      '</p></section></main>';
  }

  function configurationError(message) {
    document.getElementById("jspsych-target").innerHTML = '<main class="sequence-complete"><section><span>Study configuration error</span><h1>The study could not be opened.</h1><p>' + message + '</p></section></main>';
  }

  async function boot() {
    try {
      const I = window.Interbreeding;
      I.Trajectories.validate();
      I.TraitScales.validate();
      I.Stimuli.validate();
      const assignment = I.Randomization.buildAssignment();
      I.Randomization.validateTrialPlan(assignment.trial_plan, assignment.single_trial_preview);
      if (!assignment.local_mode && !assignment.participant_parameters_complete) {
        configurationError("The required Prolific participant parameters are missing. Please reopen the study from Prolific.");
        return;
      }

      if (!assignment.local_mode) {
        const explanationLab = await createExplanationLabClient();
        window.explanationLab = explanationLab;
        window.EXPLANATION_LAB_CONDITION = explanationLab.launch.condition;
        assignment.console_condition = explanationLab.launch.condition;
        if (assignment.console_condition !== "complete_2x2_sequence") {
          throw new Error("This within-participant study must be registered with the complete_2x2_sequence condition.");
        }
      }

      window.interbreedingAssignment = assignment;
      document.title = I.Config.STUDY_TITLE;
      const jsPsych = initJsPsych({
        display_element: "jspsych-target",
        on_finish: function () {
          const data = window.interbreedingStudyData;
          const result = window.interbreedingSaveResult || { transmitted: false, mode: "unknown" };
          document.title = assignment.local_mode ? "Local Preview Complete" : "Study Complete";
          document.getElementById("jspsych-target").innerHTML = completionMarkup(assignment, data, result);
          if (result.transmitted && result.mode === "production" && result.redirectUrl) {
            window.setTimeout(function () { window.location.assign(result.redirectUrl); }, 900);
          }
        }
      });
      window.interbreedingJsPsych = jsPsych;
      window.interbreedingStudyData = new I.Data.StudyData(jsPsych, assignment);

      const studyTrials = [];
      assignment.trial_plan.forEach(function (trial) {
        studyTrials.push({
          type: window.InterbreedingLineageIntroductionPlugin,
          lineage_id: trial.lineage_id,
          trial_number: trial.trial_number,
          total_trials: trial.total_trials,
          condition_cell: trial.condition_cell
        });
        studyTrials.push({
          type: window.InterbreedingRegistryPlugin,
          lineage_id: trial.lineage_id,
          trial_number: trial.trial_number,
          total_trials: trial.total_trials,
          condition_cell: trial.condition_cell,
          genetic_timing: trial.genetic_timing,
          purpose_timing: trial.purpose_timing,
          genetic_acceleration_generation: trial.genetic_acceleration_generation,
          purpose_acceleration_generation: trial.purpose_acceleration_generation,
          single_trial_preview: assignment.single_trial_preview
        });
      });

      const timeline = [];
      if (!assignment.skip_consent) timeline.push({ type: window.InterbreedingConsentPlugin });
      timeline.push({ type: window.InterbreedingInstructionsPlugin });
      Array.prototype.push.apply(timeline, studyTrials);
      timeline.push({ type: window.InterbreedingDemographicsPlugin });
      timeline.push({ type: window.InterbreedingSavePlugin });
      jsPsych.run(timeline);
    } catch (error) {
      console.error("Interbreeding pilot initialization error", error);
      configurationError("Please reopen index.html from the complete experiment folder.");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
