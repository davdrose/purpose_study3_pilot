import createExplanationLabClient from "./explanation-lab-client.js";

const explanationLab = await createExplanationLabClient();
const assignedCondition = explanationLab.launch.condition;
window.EXPLANATION_LAB_CONDITION = assignedCondition;
window.explanationLab = explanationLab;
const explanationLabStudyStartedAt = performance.now();

const jsPsych = initJsPsych({
  // Preserve any existing options here.
  on_finish: async () => {
    // Preserve necessary existing finish work before this save.
    await explanationLab.submitAndRedirect(jsPsych.data.get(), {
      durationMs: performance.now() - explanationLabStudyStartedAt,
      metadata: {
        experimentVersion: "1.0.0",
        schemaVersion: "2.0.0",
        demographicFields: ["age","ethnicity","gender","other_gender","other_race","race"]
      }
    });
  }
});