var jsPsychSaveComplete = (function (jspsych) {
  "use strict";

  const info = {
    name: "save-complete",
    version: "4.0.0",
    parameters: {},
    data: {
      saved: { type: jspsych.ParameterType.BOOL },
      save_mode: { type: jspsych.ParameterType.STRING }
    }
  };

  class SaveCompletePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement) {
      const runtime = globalThis.FIELD_LAB_RUNTIME;
      const state = globalThis.FIELD_LAB_STATE;
      const ui = globalThis.ContextualUI;

      const renderSaving = () => {
        displayElement.innerHTML = `
          <div class="study-app">
            ${ui.renderHeader("FINALIZING", "Saving study data", "Please keep this page open")}
            <main class="save-main" id="study-main">
              <section class="save-card" aria-live="polite">
                <div class="save-spinner" aria-hidden="true"></div>
                <h1>Saving your study record</h1>
                <p>We will confirm when the complete record has been saved.</p>
              </section>
            </main>
          </div>`;
        ui.focusScreen(displayElement);
      };

      const attemptSave = async () => {
        renderSaving();
        const payload = state.payload(true);
        try {
          const result = await globalThis.ContextualTransport.saveStudyData(payload, runtime);
          if (this.jsPsych.progressBar) this.jsPsych.progressBar.progress = 1;
          const localPreview = result.mode === "debug-local";
          const scoreRows = payload.trial.map((row) => `
            <tr>
              <td>${row.trial_number}</td>
              <td>Population ${ui.escapeHtml(row.population_id)}</td>
              <td>${ui.escapeHtml(row.role_condition)}</td>
              <td>${row.purpose_match_rating_0_to_100}</td>
            </tr>`).join("");
          displayElement.innerHTML = `
            <div class="study-app completion-app">
              ${ui.renderHeader("COMPLETE", localPreview ? "Local data preview" : "Study record submitted", "Thank you")}
              <main class="completion-main" id="study-main">
                <section class="completion-card ${localPreview ? "local-payload-preview" : ""}">
                  <span class="completion-mark" aria-hidden="true">✓</span>
                  <span class="eyebrow">${localPreview ? "PREVIEW MODE" : "STUDY COMPLETE"}</span>
                  <h1>Thanks for participating!</h1>
                  <p>${localPreview
                    ? "Local preview: nothing was transmitted. In the hosted study, your responses are saved and this screen redirects you back to Prolific."
                    : result.mode === "proliferate"
                      ? "Your responses have been saved. Redirecting you back to Prolific…"
                      : "Your responses have been saved."}</p>
                  ${localPreview ? `
                    <p class="production-redirect-preview"><strong>Production ending:</strong> Thanks for participating! Redirecting you back to Prolific…</p>
                    <div class="payload-summary" aria-label="Prepared study data summary">
                      <p><strong>Condition:</strong> ${ui.escapeHtml(payload.session.role_condition)} · <strong>Trial rows:</strong> ${payload.trial.length} · <strong>Participant rows:</strong> ${payload.participants.length}</p>
                      <table>
                        <thead><tr><th>Trial</th><th>Population</th><th>Condition</th><th>Purpose-match rating</th></tr></thead>
                        <tbody>${scoreRows}</tbody>
                      </table>
                    </div>
                    <details class="payload-details">
                      <summary>Inspect the full Proliferate payload</summary>
                      <pre>${ui.escapeHtml(JSON.stringify(payload, null, 2))}</pre>
                    </details>
                    <button class="button button-secondary" type="button" data-download>Download preview JSON</button>
                  ` : ""}
                </section>
              </main>
            </div>`;
          displayElement.querySelector("[data-download]")?.addEventListener("click", () =>
            globalThis.ContextualTransport.downloadPayload(payload)
          );
          ui.focusScreen(displayElement);
          state.destroy();
          if (result.mode === "https" && runtime.completion_url) {
            setTimeout(() => globalThis.location.assign(runtime.completion_url), 1200);
          }
        } catch (error) {
          displayElement.innerHTML = `
            <div class="study-app">
              ${ui.renderHeader("SAVE INTERRUPTED", "Study record not yet saved", "Retry available")}
              <main class="save-main" id="study-main">
                <section class="save-card save-failure" role="alert">
                  <span class="feedback-mark" aria-hidden="true">!</span>
                  <h1>We could not save your record yet</h1>
                  <p>No success has been displayed or recorded. Check your connection, then try again.</p>
                  <p class="technical-note">${runtime.debug ? ui.escapeHtml(error.message) : ""}</p>
                  <button class="button button-primary" type="button" data-retry-save>Retry saving</button>
                </section>
              </main>
            </div>`;
          displayElement.querySelector("[data-retry-save]").addEventListener("click", attemptSave);
          ui.focusScreen(displayElement);
        }
      };
      attemptSave();
    }
  }

  SaveCompletePlugin.info = info;
  return SaveCompletePlugin;
})(jsPsychModule);
