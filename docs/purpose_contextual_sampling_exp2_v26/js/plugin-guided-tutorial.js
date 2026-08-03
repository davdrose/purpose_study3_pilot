var jsPsychGuidedTutorial = (function (jspsych) {
  "use strict";

  const info = {
    name: "guided-tutorial",
    version: "25.0.0",
    parameters: {},
    data: {
      tutorial_completed: { type: jspsych.ParameterType.BOOL },
      tutorial_duration_ms: { type: jspsych.ParameterType.INT }
    }
  };

  class GuidedTutorialPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement) {
      const ui = globalThis.ContextualUI;
      const startedAt = performance.now();
      displayElement.innerHTML = `
        <div class="study-app tutorial-app">
          ${ui.renderHeader("ORIENTATION", "Field mission", "Welcome")}
          <main class="v10-orientation-main" id="study-main">
            <section class="v10-orientation-card">
              <span class="eyebrow">YOUR FIELD MISSION</span>
              <h1>Research two known species</h1>
              <p>First, you will learn about two known animal species by completing a biological scan and a purpose scan for each one.</p>
              <div class="orientation-route v16-orientation-route" aria-label="Mission steps">
                <article><b>1</b><span><strong>Research two known species</strong><small>Learn about the biology and purpose of each species.</small></span></article>
                <article><b>2</b><span><strong>Classify a new population</strong><small>Discover a new population and decide which known species it belongs to.</small></span></article>
              </div>
              <button class="button button-primary" type="button" data-start-study>Begin research</button>
            </section>
          </main>
        </div>`;
      displayElement.querySelector("[data-start-study]").addEventListener("click", () => {
        this.jsPsych.finishTrial({
          tutorial_completed: true,
          tutorial_duration_ms: Math.round(performance.now() - startedAt)
        });
      });
      ui.focusScreen(displayElement);
    }
  }

  GuidedTutorialPlugin.info = info;
  return GuidedTutorialPlugin;
})(jsPsychModule);
