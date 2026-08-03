(function () {
  "use strict";

  function showFatalError(message) {
    const root = document.querySelector("#app") || document.body;
    root.innerHTML = `
      <main class="fatal-screen" id="study-main">
        <section class="fatal-card" role="alert">
          <span class="feedback-mark" aria-hidden="true">!</span>
          <h1>The study needs to restart</h1>
          <p>Your current page could not continue safely. Reload the page to try again.</p>
          <p class="technical-note">${window.FIELD_LAB_RUNTIME?.debug ? window.ContextualUI?.escapeHtml(message) : ""}</p>
          <button class="button button-primary" type="button" onclick="location.reload()">Reload study</button>
        </section>
      </main>`;
    window.ContextualUI?.focusScreen(root);
  }

  try {
    const config = window.ContextualSamplingConfig;
    const consentConfig = window.CONSENT_CONFIG;
    if (!config || !consentConfig) throw new Error("Study configuration is incomplete.");
    const runtime = window.ContextualRandomization.resolveAssignment({ config });
    window.FIELD_LAB_RUNTIME = runtime;
    window.FIELD_LAB_STATE = window.ContextualStudyState.restoreStudyState(runtime);
    window.ContextualUI.applyRuntimeClasses(runtime);

    const jsPsych = initJsPsych({
      display_element: "app",
      show_progress_bar: true,
      message_progress_bar: (progress) => `Study progress · ${Math.round(progress * 100)}%`,
      on_close: () => window.FIELD_LAB_STATE?.persist()
    });
    window.FIELD_LAB_JSPSYCH = jsPsych;
    jsPsych.data.addProperties({
      study_version: config.study_version,
      participant_id: runtime.participant_id,
      prolific_pid: runtime.prolific_pid,
      prolific_study_id: runtime.prolific_study_id,
      prolific_session_id: runtime.prolific_session_id,
      session_id: runtime.session_id,
      condition_id: runtime.condition_id,
      role_context: runtime.role_context,
      role_condition: runtime.role_condition,
      assignment_source: runtime.assignment_source
    });

    const coarse = matchMedia("(pointer: coarse)").matches;
    window.FIELD_LAB_STATE.setDevice({
      device_type: coarse ? "touch_capable" : "desktop_or_laptop",
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        device_pixel_ratio: window.devicePixelRatio || 1,
        coarse_pointer: coarse
      }
    });

    const consent = {
      type: jsPsychHtmlButtonResponse,
      stimulus: `
        <div class="study-app consent-study-app">
          ${window.ContextualUI.renderHeader("CONSENT", "Research participation", "Please review")}
          <main class="consent-main" id="study-main">
            <section class="consent-card">
              <h1 class="sr-only">Consent Form</h1>
              ${consentConfig.buildHtml()}
            </section>
          </main>
        </div>`,
      choices: ["I agree"],
      data: { trial_role: "consent" },
      on_load: () => {
        document.querySelector(".jspsych-btn").className = "button button-primary";
        const card = document.querySelector(".consent-card");
        const actions = document.querySelector("#jspsych-html-button-response-btngroup");
        if (card && actions) {
          actions.classList.add("consent-actions");
          card.appendChild(actions);
        }
        window.ContextualUI.focusScreen(document);
      },
      on_finish: (data) => {
        data.consented = data.response === 0;
      }
    };

    const attentionCheck = {
      type: jsPsychHtmlButtonResponse,
      stimulus: `
        <div class="study-app">
          ${window.ContextualUI.renderHeader("FINAL QUESTIONS", "One final question", "After all missions")}
          <main class="demographics-main" id="study-main">
            <section class="demographics-card attention-check-card">
              <span class="eyebrow">FINAL QUESTION</span>
              <h1>Eight has an even number of letters.</h1>
              <p>Please select your answer.</p>
            </section>
          </main>
        </div>`,
      choices: ["Yes", "No"],
      data: { trial_role: "attention_check" },
      on_load: () => {
        const card = document.querySelector(".attention-check-card");
        const actions = document.querySelector("#jspsych-html-button-response-btngroup");
        if (card && actions) {
          actions.classList.add("attention-check-actions");
          card.appendChild(actions);
        }
        document.querySelectorAll(".jspsych-btn").forEach((button) => {
          button.className = "button button-secondary";
        });
        window.ContextualUI.focusScreen(document);
      },
      on_finish: (data) => {
        const response = data.response === 0 ? "yes" : "no";
        data.attention_check_response = response;
        data.attention_check_correct = response === "no";
        window.FIELD_LAB_STATE.recordAttentionCheck({ response, correct: response === "no" });
      }
    };

    const timeline = [
      consent,
      { type: jsPsychPreloadLocal, required_asset_ids: config.required_asset_ids },
      { type: jsPsychGuidedTutorial }
    ];
    runtime.missions.forEach((mission) => timeline.push({ type: jsPsychSimplifiedMission, mission }));
    timeline.push(
      attentionCheck,
      { type: jsPsychDemographics },
      { type: jsPsychSaveComplete }
    );

    addEventListener("error", (event) => {
      if (event.error) showFatalError(event.error.message || "Unexpected study error.");
    });
    addEventListener("unhandledrejection", (event) => {
      showFatalError(event.reason?.message || "Unexpected study error.");
    });
    jsPsych.run(timeline);
  } catch (error) {
    showFatalError(error.message || "Study initialization failed.");
  }
})();
