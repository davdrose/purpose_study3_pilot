var jsPsychPurposeCategorization = (function (jspsych) {
  "use strict";

  const info = {
    name: "purpose-categorization",
    version: "1.0.0",
    parameters: {
      task_url: {
        type: jspsych.ParameterType.STRING,
        default: "assets/task.html"
      },
      condition_id: {
        type: jspsych.ParameterType.STRING,
        default: "unspecified"
      },
      counterbalance_id: {
        type: jspsych.ParameterType.STRING,
        default: "unspecified"
      },
      assignment_id: {
        type: jspsych.ParameterType.STRING,
        default: "unspecified"
      },
      bio_profile: {
        type: jspsych.ParameterType.STRING,
        default: "rellin"
      },
      purpose_profile: {
        type: jspsych.ParameterType.STRING,
        default: "rellin"
      },
      scanner_available: {
        type: jspsych.ParameterType.BOOL,
        default: true
      },
      environment: {
        type: jspsych.ParameterType.STRING,
        default: "woodland"
      },
      evidence_order: {
        type: jspsych.ParameterType.STRING,
        default: "scan-first"
      },
      endpoint_order: {
        type: jspsych.ParameterType.STRING,
        default: "rellin-left"
      }
    },
    data: {
      condition_id: { type: jspsych.ParameterType.STRING },
      counterbalance_id: { type: jspsych.ParameterType.STRING },
      assignment_id: { type: jspsych.ParameterType.STRING },
      bio_profile: { type: jspsych.ParameterType.STRING },
      purpose_profile: { type: jspsych.ParameterType.STRING },
      bio_purpose_match: { type: jspsych.ParameterType.BOOL },
      scanner_available: { type: jspsych.ParameterType.BOOL },
      environment: { type: jspsych.ParameterType.STRING },
      evidence_order: { type: jspsych.ParameterType.STRING },
      endpoint_order: { type: jspsych.ParameterType.STRING },
      reference_order: { type: jspsych.ParameterType.STRING },
      response_raw_left_to_right: { type: jspsych.ParameterType.INT },
      response_daxon_0_100: { type: jspsych.ParameterType.INT },
      response_rellin_0_100: { type: jspsych.ParameterType.INT },
      response_label: { type: jspsych.ParameterType.STRING },
      response_nearest_species: { type: jspsych.ParameterType.STRING },
      placement_interaction_method: { type: jspsych.ParameterType.STRING },
      task_rt_ms: { type: jspsych.ParameterType.INT },
      decision_rt_ms: { type: jspsych.ParameterType.INT },
      placement_rt_ms: { type: jspsych.ParameterType.INT }
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
      const pluginStarted = performance.now();
      let iframeLoadedAt = null;
      let taskReadyAt = null;
      let finished = false;

      document.body.classList.add("purpose-task-active");
      displayElement.innerHTML = "";

      const iframe = document.createElement("iframe");
      iframe.className = "purpose-task-frame";
      iframe.title = "Purpose and biological categorization task";
      iframe.setAttribute("scrolling", "yes");

      const taskUrl = new URL(trial.task_url, window.location.href);
      const taskParameters = {
        participant: "1",
        condition_id: trial.condition_id,
        counterbalance_id: trial.counterbalance_id,
        assignment_id: trial.assignment_id,
        bio_profile: trial.bio_profile,
        purpose_profile: trial.purpose_profile,
        scanner_available: String(trial.scanner_available),
        environment: trial.environment,
        evidence_order: trial.evidence_order,
        endpoint_order: trial.endpoint_order
      };
      Object.entries(taskParameters).forEach(([key, value]) => {
        taskUrl.searchParams.set(key, value);
      });

      const cleanup = () => {
        window.removeEventListener("message", handleMessage);
        document.body.classList.remove("purpose-task-active");
      };

      const endTrial = (payload) => {
        if (finished) return;
        finished = true;
        cleanup();

        this.jsPsych.finishTrial({
          ...payload,
          trial_role: "categorization_task",
          iframe_load_rt_ms: iframeLoadedAt === null
            ? null
            : Math.round(iframeLoadedAt - pluginStarted),
          task_ready_rt_ms: taskReadyAt === null
            ? null
            : Math.round(taskReadyAt - pluginStarted)
        });
      };

      const handleMessage = (event) => {
        if (event.source !== iframe.contentWindow || !event.data) return;

        if (event.data.type === "purpose-categorization-ready") {
          taskReadyAt = performance.now();
          return;
        }

        if (event.data.type === "purpose-categorization-complete") {
          endTrial(event.data.payload);
        }
      };

      window.addEventListener("message", handleMessage);
      iframe.addEventListener("load", () => {
        iframeLoadedAt = performance.now();
      }, { once: true });
      iframe.src = taskUrl.toString();
      displayElement.appendChild(iframe);
    }
  }

  return PurposeCategorizationPlugin;
})(jsPsychModule);
