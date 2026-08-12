(function () {
  "use strict";

  const Study = window.EssenceStudy;
  const Config = Study.Config;
  const TOTAL_STEPS = 12;

  class EssenceSurveyPlugin {
    static info = {
      name: "essence-vs-temperature-survey",
      version: "9.0.0",
      parameters: {},
      data: {}
    };

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
      this.finished = false;
    }

    trial(displayElement) {
      this.root = displayElement;
      this.assignment = window.essenceAssignment || Study.Randomization.buildAssignment();
      this.data = new Study.Data.StudyData(this.assignment);
      this.pageStartedAt = performance.now();
      window.essenceStudyApp = this;
      this.showConsent();
    }

    render(html) {
      this.root.innerHTML = html;
      this.root.scrollIntoView({ block: "start" });
      window.scrollTo(0, 0);
      this.pageStartedAt = performance.now();
    }

    rt() {
      return Math.round(performance.now() - this.pageStartedAt);
    }

    showConsent() {
      this.render(Study.UI.consent(this.assignment));
      const form = this.root.querySelector("#consent-form");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const selected = form.querySelector('input[name="consent"]:checked');
        if (!selected) return this.showFormError(form);
        const consented = selected.value === "yes";
        this.data.writeResponse({
          block: "Consent form",
          question_id: "QID33",
          data_export_tag: "consent",
          question_type: "consent",
          response: consented ? "I consent, begin the study" : "I do not consent, I do not wish to participate",
          response_value: consented ? 1 : 2,
          rt: this.rt()
        });
        if (!consented) {
          const summary = this.data.complete({ completed: false, consented: false, response_count: 1 });
          this.terminal = { kind: "declined", summary: summary };
          this.finishJsPsych(summary);
          return;
        }
        this.showIntro();
      });
    }

    showIntro() {
      this.render(Study.UI.intro(this.assignment, 1, TOTAL_STEPS));
      this.root.querySelector("#continue-button").addEventListener("click", () => {
        this.data.writeEvent("instructions_continue", { rt: this.rt() });
        this.showStimulus(0);
      });
    }

    showStimulus(index) {
      const stimulus = this.assignment.stimulus_order[index];
      this.render(Study.UI.stimulusTrial(this.assignment, stimulus, index, 2 + index, TOTAL_STEPS));
      const form = this.root.querySelector("#stimulus-form");
      const slider = this.bindRequiredSlider(form, "rating");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!this.sliderWasMoved(slider)) return this.showFormError(form);
        const rating = Number(slider.value);
        this.data.writeResponse({
          block: capitalize(stimulus.id),
          question_id: stimulus.qualtrics_question_id,
          data_export_tag: stimulus.id,
          question_type: "target_slider",
          construct: this.assignment.condition,
          stimulus_id: stimulus.id,
          stimulus_category: stimulus.category,
          stimulus_position: index + 1,
          image_path: stimulus.image,
          question_text: Study.Stimuli.statement(stimulus, this.assignment.condition),
          response: rating,
          response_value: rating,
          response_scale: "0-100",
          scale_endpoint_left: "Strongly disagree",
          scale_endpoint_right: "Strongly agree",
          slider_start: Config.SLIDER_START,
          handle_moved: true,
          rt: this.rt()
        });
        if (index < this.assignment.stimulus_order.length - 1) this.showStimulus(index + 1);
        else this.showGeneralQuestion();
      });
    }

    showGeneralQuestion() {
      this.render(Study.UI.generalQuestion(this.assignment, 10, TOTAL_STEPS));
      const form = this.root.querySelector("#general-form");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const selected = form.querySelector('input[name="general"]:checked');
        if (!selected) return this.showFormError(form);
        const isYes = selected.value === "yes";
        const question = this.assignment.condition === "purpose"
          ? "Consider all the animals on our planet. Do you think each kind of animal has a purpose?"
          : "Consider all the animals on our planet. Do you think each kind of animal has a temperature?";
        this.data.writeResponse({
          block: capitalize(this.assignment.condition),
          question_id: "QID576",
          data_export_tag: this.assignment.condition,
          question_type: "general_binary",
          question_text: question,
          response: isYes ? "Yes" : "No",
          response_value: isYes ? 1 : 2,
          rt: this.rt()
        });
        this.showAttentionOne();
      });
    }

    showAttentionOne() {
      this.render(Study.UI.attentionQuestion(this.assignment, 11, TOTAL_STEPS));
      const form = this.root.querySelector("#attention-form");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const selected = form.querySelector('input[name="attention"]:checked');
        if (!selected) return this.showFormError(form);
        const isYes = selected.value === "yes";
        this.data.writeResponse({
          block: "awareness_1",
          question_id: "QID600",
          data_export_tag: "awareness_1",
          question_type: "attention_check",
          question_text: "Twenty-one is an even number.",
          response: isYes ? "Yes" : "No",
          response_value: isYes ? 1 : 2,
          response_scale: "binary",
          correct_answer: "No",
          passed: !isYes,
          rt: this.rt()
        });
        this.showDemographics();
      });
    }

    showDemographics() {
      this.render(Study.UI.demographics(this.assignment, 12, TOTAL_STEPS));
      const form = this.root.querySelector("#demographics-form");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const sex = form.querySelector('select[name="sex"]');
        const age = form.querySelector('input[name="age"]');
        const race = form.querySelector('select[name="race"]');
        if (!sex.value || !race.value || !form.checkValidity()) {
          form.reportValidity();
          return this.showFormError(form);
        }
        const pageRt = this.rt();
        this.data.writeResponse({
          block: "DemographicswRace",
          question_id: "QID1719910665",
          data_export_tag: "sex",
          question_type: "demographic",
          response: Config.SEX_CHOICES[Number(sex.value) - 1],
          response_value: Number(sex.value),
          rt: pageRt
        });
        const ageValue = Number(age.value);
        this.data.writeResponse({
          block: "DemographicswRace",
          question_id: "QID1719910666",
          data_export_tag: "age",
          question_type: "demographic",
          response: ageValue,
          response_value: ageValue,
          rt: pageRt
        });
        this.data.writeResponse({
          block: "DemographicswRace",
          question_id: "QID1719910667",
          data_export_tag: "race",
          question_type: "demographic",
          response: Config.RACE_CHOICES[Number(race.value) - 1],
          response_value: Number(race.value),
          rt: pageRt
        });
        this.completeStudy();
      });
    }

    async completeStudy() {
      if (this.saving) return;
      this.saving = true;
      const summary = this.data.summary || this.data.complete({ completed: true, consented: true });
      this.render(Study.UI.sending(this.assignment));
      try {
        const result = await Study.Transport.submit(this.data.buildPayload(), this.assignment);
        window.essenceSaveResult = result;
        this.showCompletion(summary, result);
      } catch (error) {
        console.error("Essence Study submission error", error);
        this.saving = false;
        this.render(Study.UI.submissionError(this.assignment, error.message));
        this.root.querySelector("#retry-submit").addEventListener("click", () => this.completeStudy());
      }
    }

    showCompletion(summary, saveResult) {
      this.terminal = { kind: "complete", summary: summary, saveResult: saveResult };
      this.finishJsPsych(summary);
    }

    restoreTerminal() {
      if (!this.terminal) return;
      if (this.terminal.kind === "declined") {
        this.render(Study.UI.declined(this.assignment));
        return;
      }
      const saveResult = this.terminal.saveResult || {};
      this.render(Study.UI.complete(this.assignment, this.terminal.summary, saveResult));
      if (this.assignment.preview) {
        const targets = this.data.responses.filter(function (row) { return row.question_type === "target_slider"; });
        this.root.dataset.testCondition = this.assignment.condition;
        this.root.dataset.testResponseCount = String(this.data.responses.length);
        this.root.dataset.testTargetCount = String(targets.length);
        this.root.dataset.testTargetStimuli = targets.map(function (row) { return row.stimulus_id; }).join(",");
        this.root.dataset.testTargetConstructs = Array.from(new Set(targets.map(function (row) { return row.construct; }))).join(",");
        this.root.dataset.testQuestionIds = this.data.responses.map(function (row) { return row.question_id; }).join(",");
        this.root.dataset.testAttentionPassed = String(this.terminal.summary.attention_check_1_passed);
        this.root.dataset.testResponseParticipantIds = Array.from(new Set(this.data.responses.map(function (row) { return row.participant_id; }))).join(",");
        this.root.dataset.testTargetValues = targets.map(function (row) { return row.response_value; }).join(",");
        const payload = this.data.buildPayload();
        this.root.dataset.testPayloadTables = Object.keys(payload).join(",");
        this.root.dataset.testPayloadItemCount = String(payload.items.length);
        this.root.dataset.testPayloadItemFields = payload.items.length ? Object.keys(payload.items[0]).join(",") : "";
        this.root.dataset.testPayloadItemTypes = Array.from(new Set(payload.items.map(function (row) { return row.item_type; }))).join(",");
        this.root.dataset.testPayloadRatings = payload.items.map(function (row) { return row.rating; }).join(",");
        this.root.dataset.testPayloadGeneralResponse = String(payload.participant.all_animals_response || "");
        this.root.dataset.testPayloadAttentionResponse = String(payload.participant.attention_response || "");
        this.root.dataset.testPayloadCondition = String(payload.participant.condition || "");
        this.root.dataset.testPayloadProlificPid = String(payload.participant.prolific_pid || "");
        this.root.dataset.testPayloadStudyId = String(payload.participant.study_id || "");
        this.root.dataset.testPayloadSessionId = String(payload.participant.session_id || "");
        this.root.dataset.testTransmitted = String(Boolean(saveResult.transmitted));
        this.root.dataset.testSubmissionMode = String(saveResult.mode || "");
        this.root.dataset.testSubmissionId = String(saveResult.submissionId || "");
      }
      if (saveResult.transmitted && saveResult.mode === "production" && saveResult.redirectUrl) {
        this.root.querySelector("#prolific-button").addEventListener("click", function () {
          window.location.assign(saveResult.redirectUrl);
        });
        if (!this.redirectScheduled) {
          this.redirectScheduled = true;
          window.setTimeout(function () { window.location.assign(saveResult.redirectUrl); }, 900);
        }
      }
    }

    showFormError(form) {
      const error = form.querySelector(".form-error");
      if (error) {
        error.hidden = false;
        error.focus();
      }
      form.classList.add("has-error");
      return false;
    }

    bindRequiredSlider(form, name) {
      const slider = form.querySelector('input[name="' + name + '"]');
      const submit = form.querySelector('[type="submit"]');
      const revealHandle = function () {
        slider.dataset.touched = "true";
      };
      slider.addEventListener("pointerdown", revealHandle);
      slider.addEventListener("focus", revealHandle);
      slider.addEventListener("keydown", revealHandle);
      slider.addEventListener("input", function () {
        revealHandle();
        if (slider.dataset.moved === "true" || Number(slider.value) !== Config.SLIDER_START) {
          slider.dataset.moved = "true";
          slider.setAttribute("aria-valuetext", slider.value + " on a scale from strongly disagree to strongly agree");
          if (submit) {
            submit.disabled = false;
            submit.hidden = false;
          }
          const error = form.querySelector(".form-error");
          if (error) error.hidden = true;
        }
      });
      return slider;
    }

    sliderWasMoved(slider) {
      return Boolean(slider && slider.dataset.moved === "true");
    }

    finishJsPsych(summary) {
      if (this.finished) return;
      this.finished = true;
      this.jsPsych.finishTrial({
        experiment_version: Config.EXPERIMENT_VERSION,
        participant_id: this.data.participant.participant_id,
        condition: this.assignment.condition,
        completed: summary.completed,
        consented: summary.consented,
        response_count: this.data.responses.length,
        responses: this.data.responses,
        participant_summary: summary
      });
    }
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  window.EssenceSurveyPlugin = EssenceSurveyPlugin;
})();
