var jsPsychDemographics = (function (jspsych) {
  "use strict";

  const info = {
    name: "demographics",
    version: "2.0.0",
    parameters: {},
    data: {
      submitted: { type: jspsych.ParameterType.BOOL }
    }
  };

  class DemographicsPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement) {
      const ui = globalThis.ContextualUI;
      const state = globalThis.FIELD_LAB_STATE;
      displayElement.innerHTML = `
        <div class="study-app">
          ${ui.renderHeader("FINAL QUESTIONS", "Feedback and demographics", "Final section")}
          <main class="demographics-main" id="study-main">
            <form class="demographics-card" data-demographics>
              <span class="eyebrow">FINAL SECTION</span>
              <h1>About your experience and you</h1>
              <label class="text-response">
                <span>What factors influenced how you decided to respond? Do you have any questions or comments regarding the experiment?</span>
                <textarea name="feedback" rows="5" maxlength="2000" autofocus></textarea>
              </label>
              <p>Please provide the following information to complete the study. You may leave any item blank.</p>
              <div class="demographic-grid">
                <label><span>Age</span><input type="number" name="age" min="18" max="120" inputmode="numeric"></label>
              </div>
              <fieldset>
                <legend>Gender</legend>
                <label><input type="radio" name="gender" value="Female"> Female</label>
                <label><input type="radio" name="gender" value="Male"> Male</label>
                <label><input type="radio" name="gender" value="Non-binary"> Non-binary</label>
                <label><input type="radio" name="gender" value="other_gender"> Other</label>
                <label class="demographic-other"><span>If other, please describe</span><input type="text" name="other_gender" maxlength="160"></label>
              </fieldset>
              <fieldset>
                <legend>Race</legend>
                <label><input type="radio" name="race" value="White"> White</label>
                <label><input type="radio" name="race" value="Black/African American"> Black/African American</label>
                <label><input type="radio" name="race" value="American Indian/Alaska Native"> American Indian/Alaska Native</label>
                <label><input type="radio" name="race" value="Asian"> Asian</label>
                <label><input type="radio" name="race" value="Native Hawaiian/Pacific Islander"> Native Hawaiian/Pacific Islander</label>
                <label><input type="radio" name="race" value="Multiracial"> Multiracial/Mixed</label>
                <label><input type="radio" name="race" value="other_race"> Other</label>
                <label class="demographic-other"><span>If other, please describe</span><input type="text" name="other_race" maxlength="160"></label>
              </fieldset>
              <fieldset>
                <legend>Ethnicity</legend>
                <label><input type="radio" name="ethnicity" value="Hispanic"> Hispanic</label>
                <label><input type="radio" name="ethnicity" value="Non-Hispanic"> Non-Hispanic</label>
              </fieldset>
              <p>Please press the finish button to complete the experiment.</p>
              <button class="button button-primary" type="submit">Finish</button>
            </form>
          </main>
        </div>`;
      const form = displayElement.querySelector("[data-demographics]");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(form));
        values.age = values.age ? Number(values.age) : null;
        ["feedback", "gender", "other_gender", "race", "other_race", "ethnicity"].forEach((key) => {
          values[key] = String(values[key] || "").trim() || null;
        });
        state.recordDemographics(values);
        this.jsPsych.finishTrial({
          trial_role: "participant_survey",
          submitted: true,
          feedback: values.feedback,
          age: values.age,
          gender: values.gender,
          other_gender: values.other_gender,
          race: values.race,
          other_race: values.other_race,
          ethnicity: values.ethnicity
        });
      });
      ui.focusScreen(displayElement);
    }
  }

  DemographicsPlugin.info = info;
  return DemographicsPlugin;
})(jsPsychModule);
