(function (global) {
  "use strict";

  const Study = global.AnimalGoodnessStudy;
  const C = Study.Config;
  const ParameterType = global.jsPsychModule.ParameterType;

  function elapsedSince(startedAt) {
    return Math.round(performance.now() - startedAt);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[character];
    });
  }

  function checkedValue(form, name) {
    const checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : null;
  }

  function focusElement(element) {
    if (element) element.focus({ preventScroll: true });
  }

  function studyFrame(content, options) {
    const settings = options || {};
    const progress = settings.progress
      ? '<div class="study-progress"><span>' + escapeHtml(settings.progress) + "</span></div>"
      : "";
    return '<main class="study-screen"><section class="study-card ' + escapeHtml(settings.cardClass || "") + '">' +
      progress + content + "</section></main>";
  }

  function findItem(id) {
    return C.items.find(function (item) { return item.id === id; });
  }

  function findQuestion(id) {
    return C.questions.find(function (question) { return question.id === id; });
  }

  function questionText(question, item) {
    const capitalized = item.plural.charAt(0).toUpperCase() + item.plural.slice(1);
    return question.template
      .replaceAll("{Plural}", capitalized)
      .replaceAll("{plural}", item.plural);
  }

  class ConsentPlugin {
    static info = { name: "animal-goodness-consent", version: "7.0.0", parameters: {}, data: {} };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement) {
      const startedAt = performance.now();
      document.title = "Consent · " + C.title;
      displayElement.innerHTML = studyFrame(
        '<header class="card-header"><span>Research participation</span><h1>Consent Form</h1></header>' +
        '<div class="consent-document" tabindex="0">' +
          '<p>Thank you for agreeing to take part in this study. We appreciate your time and effort. In this study, you will see eight kinds of animals and artifacts, and then we will ask you to answer a brief series of questions about them. The questions have no right or wrong answers—we’re just exploring features of human psychology in this research. You will be paid $1.00 for your time and efforts. We do not anticipate any risks from participating in this research. While you will not directly benefit from taking part in this research study, we hope society and the scientific community will benefit from the knowledge gained about human psychology and judgment.</p>' +
          '<p>Your involvement should take about 5 minutes. Your participation is voluntary and you can stop at any time. If you consent to take part in this survey, please indicate so below, and then click the <strong>I agree</strong> button to advance. If not, simply close your browser window.</p>' +
          '<p>The research data will be collected anonymously. We will not ask you to provide any personally identifiable information (such as an email address, name, etc.) and will not be able to link your response to you. We anticipate that your participation in this survey presents no greater risk than everyday use of the Internet. Of course, please note that there is always the possible risk of intrusion by outside agents (i.e. hacking) whenever information is shared over the Internet. In order to keep your identifying information and data from this study separate, we will host the survey on an unaffiliated platform, Prolific. Thus, Prolific will <strong>not</strong> have access to the data you provide us. Additionally, we will not ask for directly or indirectly identifiable information in the survey.</p>' +
          '<p>If you have any questions about the research study, please contact Shaun Nichols (<a href="mailto:sbn44@cornell.edu">sbn44@cornell.edu</a>) at Cornell University. If you have any questions or concerns regarding your rights as a subject in this study, you may contact the Institutional Review Board (IRB) for Human Participants at 607-255-5138 or access their website at <a href="http://www.irb.cornell.edu" target="_blank" rel="noopener">www.irb.cornell.edu</a>. You may also report your concerns or complaints anonymously through Ethicspoint online at <a href="http://www.hotline.cornell.edu" target="_blank" rel="noopener">www.hotline.cornell.edu</a> or by calling toll free at 1-866-293-3077. Ethicspoint is an independent organization that serves as a liaison between the University and the person bringing the complaint so that anonymity can be ensured.</p>' +
          '<p>Taking part in this study is voluntary. You can stop at any time. Withdrawal or refusal to participate will not result in any penalty. You do not waive any legal rights or release any agent from liability for negligence by consenting to participate.</p>' +
        "</div>" +
        '<footer class="card-footer consent-footer"><p>If you consent to take part in this survey, please indicate so below:</p>' +
          '<button type="button" class="primary-button" data-continue>I agree</button></footer>',
        { cardClass: "consent-card" }
      );

      const button = displayElement.querySelector("[data-continue]");
      button.addEventListener("click", () => {
        Study.runtime.consentGiven = true;
        this.jsPsych.finishTrial({
          screen_id: "consent",
          consent_given: true,
          consent_rt_ms: elapsedSince(startedAt)
        });
      });
      focusElement(button);
    }
  }

  class IntroductionPlugin {
    static info = { name: "animal-goodness-introduction", version: "7.0.0", parameters: {}, data: {} };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement) {
      const startedAt = performance.now();
      document.title = "Instructions · " + C.title;
      displayElement.innerHTML = studyFrame(
        '<header class="card-header"><span>Before you begin</span><h1>About this study</h1></header>' +
        '<div class="instructions-body">' +
          '<p>You will see <strong>eight different animals and artifacts</strong>, one at a time.</p>' +
          '<p>For each item, you will first see its picture and name. You will then answer five questions about that item. Each question will appear on its own screen.</p>' +
          '<p>There are no right or wrong answers.</p>' +
          '<p>When you are ready to begin, please click <strong>Begin</strong>.</p>' +
        "</div>" +
        '<footer class="card-footer introduction-footer">' +
          '<button type="button" class="primary-button" data-continue>Begin <span aria-hidden="true">→</span></button></footer>',
        { cardClass: "introduction-card" }
      );

      const button = displayElement.querySelector("[data-continue]");
      button.addEventListener("click", () => this.jsPsych.finishTrial({
        screen_id: "introduction",
        introduction_rt_ms: elapsedSince(startedAt)
      }));
      focusElement(button);
    }
  }

  class ItemIntroductionPlugin {
    static info = {
      name: "animal-goodness-item-introduction",
      version: "7.0.0",
      parameters: {
        item_id: { type: ParameterType.STRING, default: "stud" },
        item_position: { type: ParameterType.INT, default: 1 }
      },
      data: {}
    };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement, trial) {
      const startedAt = performance.now();
      const item = findItem(trial.item_id);
      document.title = item.singular.charAt(0).toUpperCase() + item.singular.slice(1) + " · " + C.title;
      displayElement.innerHTML = studyFrame(
        '<figure class="animal-introduction-figure">' +
          '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.imageAlt) + '">' +
          '<figcaption><h1>' + escapeHtml(item.singular.charAt(0).toUpperCase() + item.singular.slice(1)) + "</h1></figcaption>" +
        "</figure>" +
        '<footer class="card-footer"><span>You will answer five questions about ' + escapeHtml(item.plural) + ".</span>" +
          '<button type="button" class="primary-button" data-continue>Continue to questions <span aria-hidden="true">→</span></button></footer>',
        {
          cardClass: "animal-introduction-card",
          progress: "Item " + trial.item_position + " of " + C.items.length
        }
      );

      const button = displayElement.querySelector("[data-continue]");
      button.addEventListener("click", () => this.jsPsych.finishTrial({
        screen_id: "item_introduction",
        item_id: item.id,
        item_condition: item.condition,
        item_singular: item.singular,
        item_plural: item.plural,
        item_position: trial.item_position,
        image_path: item.image,
        item_introduction_rt_ms: elapsedSince(startedAt)
      }));
      focusElement(button);
    }
  }

  class ItemQuestionPlugin {
    static info = {
      name: "animal-goodness-question",
      version: "7.0.0",
      parameters: {
        item_id: { type: ParameterType.STRING, default: "stud" },
        item_position: { type: ParameterType.INT, default: 1 },
        question_id: { type: ParameterType.STRING, default: "purpose_exists" },
        question_position: { type: ParameterType.INT, default: 1 }
      },
      data: {}
    };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement, trial) {
      const startedAt = performance.now();
      const item = findItem(trial.item_id);
      const question = findQuestion(trial.question_id);
      const wording = questionText(question, item);
      const responseMarkup = '<form class="slider-response-form" data-slider-form>' +
          '<fieldset class="response-slider"><legend class="sr-only">Agreement scale</legend>' +
            '<div class="response-slider__control">' +
              '<input type="range" name="rating" min="' + C.sliderMin + '" max="' + C.sliderMax + '" step="1" value="' + C.sliderStart + '" data-required-move="true" data-moved="false" data-touched="false" aria-valuetext="No response recorded">' +
              '<span class="response-slider__midpoint" aria-hidden="true"></span>' +
            "</div>" +
            '<div class="response-slider__labels"><span>Strongly disagree</span><span>Strongly agree</span></div>' +
          "</fieldset>" +
          '<p class="form-error" tabindex="-1" hidden>You must move the slider before continuing.</p>' +
          '<div class="slider-actions"><button type="submit" class="primary-button slider-continue" disabled hidden>Continue <span aria-hidden="true">→</span></button></div>' +
        "</form>";
      document.title = "Question · " + C.title;
      displayElement.innerHTML = studyFrame(
        '<div class="question-layout">' +
          '<figure class="question-animal"><img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.imageAlt) + '">' +
            '<figcaption>' + escapeHtml(item.singular.charAt(0).toUpperCase() + item.singular.slice(1)) + "</figcaption></figure>" +
          '<section class="question-panel" aria-labelledby="question-text">' +
            '<h1 id="question-text">' + escapeHtml(wording) + "</h1>" +
            responseMarkup +
          "</section>" +
        "</div>",
        {
          cardClass: "question-card",
          progress: "Item " + trial.item_position + " of " + C.items.length + " · Question " + trial.question_position + " of " + C.questions.length
        }
      );

      const finishResponse = (rating) => {
        this.jsPsych.finishTrial({
          screen_id: "item_question",
          item_id: item.id,
          item_condition: item.condition,
          item_singular: item.singular,
          item_plural: item.plural,
          item_position: trial.item_position,
          question_id: question.id,
          question_text: wording,
          question_position: trial.question_position,
          response_type: question.responseType,
          response: rating,
          response_yes: null,
          rating: rating,
          slider_min: C.sliderMin,
          slider_max: C.sliderMax,
          slider_start: C.sliderStart,
          slider_left_label: "Strongly disagree",
          slider_right_label: "Strongly agree",
          rt_ms: elapsedSince(startedAt)
        });
      };

      const form = displayElement.querySelector("[data-slider-form]");
      const slider = form.elements.rating;
      const submit = form.querySelector('[type="submit"]');
      const error = form.querySelector(".form-error");
      const revealHandle = function () { slider.dataset.touched = "true"; };
      slider.addEventListener("pointerdown", revealHandle);
      slider.addEventListener("focus", revealHandle);
      slider.addEventListener("keydown", revealHandle);
      slider.addEventListener("input", function () {
        revealHandle();
        if (slider.dataset.moved === "true" || Number(slider.value) !== C.sliderStart) {
          slider.dataset.moved = "true";
          slider.setAttribute("aria-valuetext", slider.value + " on a scale from strongly disagree to strongly agree");
          submit.disabled = false;
          submit.hidden = false;
          error.hidden = true;
        }
      });
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (slider.dataset.moved !== "true") {
          error.hidden = false;
          focusElement(error);
          return;
        }
        submit.disabled = true;
        finishResponse(Number(slider.value));
      });
    }
  }

  class DemographicsPlugin {
    static info = { name: "animal-goodness-demographics", version: "7.0.0", parameters: {}, data: {} };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement) {
      const startedAt = performance.now();
      document.title = "Final questions · " + C.title;
      displayElement.innerHTML = studyFrame(
        '<header class="card-header"><span>Final questions</span><h1>About your experience</h1><p>These questions are optional. You may leave any item blank.</p></header>' +
        '<form class="demographics-form" data-demographics-form>' +
          '<div class="feedback-grid">' +
            '<label class="feedback-field"><strong>What factors influenced how you decided to respond? Do you have any questions or comments regarding the experiment?</strong><textarea name="feedback" rows="4" spellcheck="true"></textarea></label>' +
            '<label class="feedback-field"><strong>Was anything about the study confusing or unclear?</strong><textarea name="confusion_feedback" rows="4" spellcheck="true"></textarea></label>' +
          "</div>" +
          '<div class="demographic-grid">' +
            '<fieldset><legend>Age</legend><input name="age" type="number" min="18" max="100" inputmode="numeric" aria-label="Age"></fieldset>' +
            '<fieldset><legend>Gender</legend><label><input name="gender" type="radio" value="Female"> Female</label><label><input name="gender" type="radio" value="Male"> Male</label><label><input name="gender" type="radio" value="Non-binary"> Non-binary</label><label class="other-option"><input name="gender" type="radio" value="other_gender"> Other: <input type="text" name="other_gender" aria-label="Other gender"></label></fieldset>' +
            '<fieldset class="race-field"><legend>Race</legend><label><input name="race" type="radio" value="White"> White</label><label><input name="race" type="radio" value="Black/African American"> Black/African American</label><label><input name="race" type="radio" value="American Indian/Alaska Native"> American Indian/Alaska Native</label><label><input name="race" type="radio" value="Asian"> Asian</label><label><input name="race" type="radio" value="Native Hawaiian/Pacific Islander"> Native Hawaiian/Pacific Islander</label><label><input name="race" type="radio" value="Multiracial"> Multiracial/Mixed</label><label class="other-option"><input name="race" type="radio" value="other_race"> Other: <input type="text" name="other_race" aria-label="Other race"></label></fieldset>' +
            '<fieldset><legend>Ethnicity</legend><label><input name="ethnicity" type="radio" value="Hispanic"> Hispanic</label><label><input name="ethnicity" type="radio" value="Non-Hispanic"> Non-Hispanic</label></fieldset>' +
          "</div>" +
          '<footer class="card-footer"><span>Press Finish to complete the study.</span><button type="submit" class="primary-button">Finish <span aria-hidden="true">→</span></button></footer>' +
        "</form>",
        { cardClass: "demographics-card", progress: "Final questions" }
      );

      const form = displayElement.querySelector("[data-demographics-form]");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const feedback = form.elements.feedback.value.trim();
        const confusion = form.elements.confusion_feedback.value.trim();
        this.jsPsych.finishTrial({
          screen_id: "demographics",
          feedback: feedback,
          confusion_feedback: confusion,
          feedback_character_count: feedback.length,
          confusion_feedback_character_count: confusion.length,
          age: form.elements.age.value || null,
          gender: checkedValue(form, "gender"),
          other_gender: form.elements.other_gender.value.trim() || null,
          race: checkedValue(form, "race"),
          other_race: form.elements.other_race.value.trim() || null,
          ethnicity: checkedValue(form, "ethnicity"),
          final_questions_rt_ms: elapsedSince(startedAt)
        });
      });
      focusElement(form.elements.feedback);
    }
  }

  Study.Plugins = Object.freeze({
    Consent: ConsentPlugin,
    Introduction: IntroductionPlugin,
    ItemIntroduction: ItemIntroductionPlugin,
    ItemQuestion: ItemQuestionPlugin,
    Demographics: DemographicsPlugin
  });
})(window);
