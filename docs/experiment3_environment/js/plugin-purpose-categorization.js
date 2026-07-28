var jsPsychPurposeCategorization = (function (jspsych) {
  "use strict";

  const info = {
    name: "purpose-categorization",
    version: "2.0.0",
    parameters: {
      task_url: { type: jspsych.ParameterType.STRING, default: "assets/task.html" },
      assignment_id: { type: jspsych.ParameterType.STRING, default: "unspecified" },
      matching_schedule_id: { type: jspsych.ParameterType.STRING, default: "unspecified" },
      trial_number: { type: jspsych.ParameterType.INT, default: 1 },
      item_pair: { type: jspsych.ParameterType.STRING, default: "unspecified" },
      animal_a: { type: jspsych.ParameterType.STRING, default: "rellin" },
      animal_b: { type: jspsych.ParameterType.STRING, default: "daxon" },
      bio_profile: { type: jspsych.ParameterType.STRING, default: "rellin" },
      feature_type: { type: jspsych.ParameterType.STRING, default: "purpose" },
      feature_profile: { type: jspsych.ParameterType.STRING, default: "rellin" },
      condition_cell: { type: jspsych.ParameterType.STRING, default: "AA" },
      evidence_order: { type: jspsych.ParameterType.STRING, default: "scan-first" },
      endpoint_order: { type: jspsych.ParameterType.STRING, default: "a-left" },
      left_species: { type: jspsych.ParameterType.STRING, default: "rellin" },
      right_species: { type: jspsych.ParameterType.STRING, default: "daxon" },
      first_introduced_species: { type: jspsych.ParameterType.STRING, default: "rellin" },
      environment: { type: jspsych.ParameterType.STRING, default: "woodland" },
      canonical_zero_species: { type: jspsych.ParameterType.STRING, default: "rellin" },
      canonical_hundred_species: { type: jspsych.ParameterType.STRING, default: "daxon" },
      show_instructions: { type: jspsych.ParameterType.BOOL, default: false }
    },
    data: {
      trial_number: { type: jspsych.ParameterType.INT },
      item_pair: { type: jspsych.ParameterType.STRING },
      animal_a: { type: jspsych.ParameterType.STRING },
      animal_b: { type: jspsych.ParameterType.STRING },
      bio_profile: { type: jspsych.ParameterType.STRING },
      feature_type: { type: jspsych.ParameterType.STRING },
      feature_profile: { type: jspsych.ParameterType.STRING },
      condition_cell: { type: jspsych.ParameterType.STRING },
      evidence_order: { type: jspsych.ParameterType.STRING },
      endpoint_order: { type: jspsych.ParameterType.STRING },
      left_species: { type: jspsych.ParameterType.STRING },
      right_species: { type: jspsych.ParameterType.STRING },
      first_introduced_species: { type: jspsych.ParameterType.STRING },
      environment: { type: jspsych.ParameterType.STRING },
      canonical_zero_species: { type: jspsych.ParameterType.STRING },
      canonical_hundred_species: { type: jspsych.ParameterType.STRING },
      placement_raw: { type: jspsych.ParameterType.INT },
      placement_canonical: { type: jspsych.ParameterType.INT },
      categorization_response_time: { type: jspsych.ParameterType.INT }
    }
  };

  class PurposeCategorizationPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    static {
      this.info = info;
    }

    trial(displayElement, trial) {
      let finished = false;
      document.body.classList.add("purpose-task-active");
      displayElement.innerHTML = "";

      const iframe = document.createElement("iframe");
      iframe.className = "purpose-task-frame";
      const featureLabel = trial.feature_type === "environmental_exposure"
        ? "environmental exposure"
        : trial.feature_type;
      iframe.title = `Biological and ${featureLabel} categorization task, trial ${trial.trial_number}`;
      iframe.setAttribute("scrolling", "yes");

      const taskUrl = new URL(trial.task_url, window.location.href);
      const taskParameters = {
        participant: "1",
        assignment_id: trial.assignment_id,
        matching_schedule_id: trial.matching_schedule_id,
        trial_number: trial.trial_number,
        item_pair: trial.item_pair,
        animal_a: trial.animal_a,
        animal_b: trial.animal_b,
        bio_profile: trial.bio_profile,
        feature_type: trial.feature_type,
        feature_profile: trial.feature_profile,
        condition_cell: trial.condition_cell,
        evidence_order: trial.evidence_order,
        endpoint_order: trial.endpoint_order,
        left_species: trial.left_species,
        right_species: trial.right_species,
        first_introduced_species: trial.first_introduced_species,
        environment: trial.environment,
        canonical_zero_species: trial.canonical_zero_species,
        canonical_hundred_species: trial.canonical_hundred_species,
        show_instructions: String(trial.show_instructions)
      };

      Object.entries(taskParameters).forEach(([key, value]) => {
        taskUrl.searchParams.set(key, value);
      });

      const cleanup = () => {
        window.removeEventListener("message", handleMessage);
        document.body.classList.remove("purpose-task-active");
      };

      const handleMessage = (event) => {
        if (event.source !== iframe.contentWindow || !event.data) return;
        if (event.data.type !== "purpose-categorization-complete" || finished) return;
        finished = true;
        cleanup();
        this.jsPsych.finishTrial({
          ...event.data.payload,
          trial_role: "categorization_task"
        });
      };

      window.addEventListener("message", handleMessage);
      iframe.src = taskUrl.toString();
      displayElement.appendChild(iframe);
    }
  }

  return PurposeCategorizationPlugin;
})(jsPsychModule);
