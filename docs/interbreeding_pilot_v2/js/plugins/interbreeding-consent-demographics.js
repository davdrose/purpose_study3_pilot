(function () {
  "use strict";

  const I = window.Interbreeding;

  class InterbreedingConsentPlugin {
    static info = { name: "interbreeding-consent", version: "40.0.0", parameters: {}, data: {} };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement) {
      document.title = "Consent · " + I.Config.STUDY_TITLE;
      displayElement.innerHTML = '<main class="study-flow consent-flow"><section class="consent-card">' +
        '<header><span>Research participation</span><h1>Consent Form</h1></header>' +
        '<div class="consent-document" tabindex="0">' +
        '<p>Thank you for agreeing to take part in this study. We appreciate your time and effort. In this study, we will present you with a fictional scenario, and then we will ask you to answer a brief series of questions about that scenario. The questions have no right or wrong answers—we’re just exploring features of human psychology in this research. You will be paid $1.00 for your time and efforts. We do not anticipate any risks from participating in this research. While you will not directly benefit from taking part in this research study, we hope society and the scientific community will benefit from the knowledge gained about human psychology and judgment.</p>' +
        '<p>Your involvement should take about 5 minutes. Your participation is voluntary and you can stop at any time. If you consent to take part in this survey, please indicate so below, and then click the <strong>I agree</strong> button to advance. If not, simply close your browser window.</p>' +
        '<p>The research data will be collected anonymously. We will not ask you to provide any personally identifiable information (such as an email address, name, etc.) and will not be able to link your response to you. We anticipate that your participation in this survey presents no greater risk than everyday use of the Internet. Of course, please note that there is always the possible risk of intrusion by outside agents (i.e. hacking) whenever information is shared over the Internet. In order to keep your identifying information and data from this study separate, we will host the survey on an unaffiliated platform, Prolific. Thus, Prolific will <strong>not</strong> have access to the data you provide us. Additionally, we will not ask for directly or indirectly identifiable information in the survey.</p>' +
        '<p>If you have any questions about the research study, please contact Shaun Nichols (<a href="mailto:sbn44@cornell.edu">sbn44@cornell.edu</a>) at Cornell University. If you have any questions or concerns regarding your rights as a subject in this study, you may contact the Institutional Review Board (IRB) for Human Participants at 607-255-5138 or access their website at <a href="http://www.irb.cornell.edu" target="_blank" rel="noopener">www.irb.cornell.edu</a>. You may also report your concerns or complaints anonymously through Ethicspoint online at <a href="http://www.hotline.cornell.edu" target="_blank" rel="noopener">www.hotline.cornell.edu</a> or by calling toll free at 1-866-293-3077. Ethicspoint is an independent organization that serves as a liaison between the University and the person bringing the complaint so that anonymity can be ensured.</p>' +
        '<p>Taking part in this study is voluntary. You can stop at any time. Withdrawal or refusal to participate will not result in any penalty. You do not waive any legal rights or release any agent from liability for negligence by consenting to participate.</p>' +
        '</div><footer><p>If you consent to take part in this survey, please indicate so below:</p><button type="button" class="primary-flow-button" data-consent-agree>I agree</button></footer>' +
        '</section></main>';
      const button = displayElement.querySelector("[data-consent-agree]");
      button.addEventListener("click", () => {
        window.interbreedingStudyData.setConsent(true);
        this.jsPsych.finishTrial({ trial_type: "consent", consent_given: true });
      });
      button.focus({ preventScroll: true });
    }
  }

  function checkedValue(form, name) {
    const input = form.querySelector('input[name="' + name + '"]:checked');
    return input ? input.value : null;
  }

  class InterbreedingDemographicsPlugin {
    static info = { name: "interbreeding-demographics", version: "40.0.0", parameters: {}, data: {} };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement) {
      document.title = "Final questions · " + I.Config.STUDY_TITLE;
      displayElement.innerHTML = '<main class="study-flow demographics-flow"><section class="demographics-card">' +
        '<header><span>Final questions</span><h1>About your experience</h1><p>These questions are optional. You may leave any item blank.</p></header>' +
        '<form data-demographics-form>' +
        '<div class="feedback-grid">' +
        '<label class="feedback-field"><strong>What factors influenced how you decided to respond? Do you have any questions or comments regarding the experiment?</strong><textarea name="feedback" rows="4"></textarea></label>' +
        '<label class="feedback-field"><strong>Was anything about the study confusing or unclear?</strong><textarea name="confusion_feedback" rows="4"></textarea></label>' +
        '</div>' +
        '<div class="demographic-grid">' +
        '<fieldset><legend>Age</legend><input name="age" type="number" min="18" max="100" inputmode="numeric" aria-label="Age"></fieldset>' +
        '<fieldset><legend>Gender</legend><label><input name="gender" type="radio" value="Female"> Female</label><label><input name="gender" type="radio" value="Male"> Male</label><label><input name="gender" type="radio" value="Non-binary"> Non-binary</label><label class="other-option"><input name="gender" type="radio" value="other_gender"> Other: <input type="text" name="other_gender" aria-label="Other gender"></label></fieldset>' +
        '<fieldset class="race-field"><legend>Race</legend><label><input name="race" type="radio" value="White"> White</label><label><input name="race" type="radio" value="Black/African American"> Black/African American</label><label><input name="race" type="radio" value="American Indian/Alaska Native"> American Indian/Alaska Native</label><label><input name="race" type="radio" value="Asian"> Asian</label><label><input name="race" type="radio" value="Native Hawaiian/Pacific Islander"> Native Hawaiian/Pacific Islander</label><label><input name="race" type="radio" value="Multiracial"> Multiracial/Mixed</label><label class="other-option"><input name="race" type="radio" value="other_race"> Other: <input type="text" name="other_race" aria-label="Other race"></label></fieldset>' +
        '<fieldset><legend>Ethnicity</legend><label><input name="ethnicity" type="radio" value="Hispanic"> Hispanic</label><label><input name="ethnicity" type="radio" value="Non-Hispanic"> Non-Hispanic</label></fieldset>' +
        '</div><footer><span>Press Finish to submit your responses.</span><button type="submit" class="primary-flow-button">Finish</button></footer>' +
        '</form></section></main>';
      const form = displayElement.querySelector("[data-demographics-form]");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const values = {
          feedback: form.elements.feedback.value,
          confusion_feedback: form.elements.confusion_feedback.value,
          age: form.elements.age.value,
          gender: checkedValue(form, "gender"),
          other_gender: form.elements.other_gender.value,
          race: checkedValue(form, "race"),
          other_race: form.elements.other_race.value,
          ethnicity: checkedValue(form, "ethnicity")
        };
        window.interbreedingStudyData.setDemographics(values);
        this.jsPsych.finishTrial({ trial_type: "demographics", demographics_completed: true });
      });
      form.elements.feedback.focus({ preventScroll: true });
    }
  }

  class InterbreedingSavePlugin {
    static info = { name: "interbreeding-save", version: "40.0.0", parameters: {}, data: {} };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement) {
      this.root = displayElement;
      this.saving = false;
      this.attempt();
    }

    renderSaving() {
      this.root.innerHTML = '<main class="study-flow save-flow"><section class="save-card" role="status"><span>Saving responses</span><div class="save-spinner" aria-hidden="true"></div><h1>Please wait</h1><p>Keep this window open while your responses are saved.</p></section></main>';
    }

    renderError() {
      this.root.innerHTML = '<main class="study-flow save-flow"><section class="save-card submission-error" role="alert"><span>Submission error</span><h1>Your responses have not been sent.</h1><p>Please check your connection and try again. If the problem continues, contact the researcher through Prolific so that you can still be compensated.</p><button type="button" class="primary-flow-button" data-retry-submission>Try again</button></section></main>';
      const retry = this.root.querySelector("[data-retry-submission]");
      retry.addEventListener("click", () => this.attempt());
      retry.focus({ preventScroll: true });
    }

    async attempt() {
      if (this.saving) return;
      this.saving = true;
      this.renderSaving();
      const data = window.interbreedingStudyData;
      const assignment = window.interbreedingAssignment;
      data.complete({
        completed: true,
        sequence_completed: !assignment.single_trial_preview,
        single_trial_preview: assignment.single_trial_preview
      });
      const payload = data.buildPayload();
      try {
        const result = await I.Transport.submit(payload, assignment);
        window.interbreedingSaveResult = result;
        this.jsPsych.finishTrial({ trial_type: "save", saved: true, submission_mode: result.mode, transmitted: result.transmitted });
      } catch (error) {
        console.error("Submission failed", error);
        this.saving = false;
        this.renderError();
      }
    }
  }

  window.InterbreedingConsentPlugin = InterbreedingConsentPlugin;
  window.InterbreedingDemographicsPlugin = InterbreedingDemographicsPlugin;
  window.InterbreedingSavePlugin = InterbreedingSavePlugin;
})();
