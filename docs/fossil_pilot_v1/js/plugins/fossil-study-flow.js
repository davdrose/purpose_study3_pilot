(function () {
  "use strict";

  const C = window.FossilPilot.Config;

  function elapsedSince(startedAt) {
    return Math.round(performance.now() - startedAt);
  }

  function checkedValue(form, name) {
    const input = form.querySelector('input[name="' + name + '"]:checked');
    return input ? input.value : null;
  }

  class FossilConsentPlugin {
    static info = { name: "fossil-consent", version: "14.0.0", parameters: {}, data: {} };

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement) {
      const startedAt = performance.now();
      document.title = "Consent · " + C.STUDY_TITLE;
      displayElement.innerHTML = '<main class="prestudy-screen consent-flow"><section class="prestudy-card consent-card">' +
        '<header><span>Research participation</span><h1>Consent Form</h1></header>' +
        '<div class="consent-document" tabindex="0">' +
          '<p>Thank you for agreeing to take part in this study. We appreciate your time and effort. In this study, we will present you with a fictional scenario, and then we will ask you to answer a brief series of questions about that scenario. The questions have no right or wrong answers—we’re just exploring features of human psychology in this research. You will be paid $1.00 for your time and efforts. We do not anticipate any risks from participating in this research. While you will not directly benefit from taking part in this research study, we hope society and the scientific community will benefit from the knowledge gained about human psychology and judgment.</p>' +
          '<p>Your involvement should take about 5 minutes. Your participation is voluntary and you can stop at any time. If you consent to take part in this survey, please indicate so below, and then click the <strong>I agree</strong> button to advance. If not, simply close your browser window.</p>' +
          '<p>The research data will be collected anonymously. We will not ask you to provide any personally identifiable information (such as an email address, name, etc.) and will not be able to link your response to you. We anticipate that your participation in this survey presents no greater risk than everyday use of the Internet. Of course, please note that there is always the possible risk of intrusion by outside agents (i.e. hacking) whenever information is shared over the Internet. In order to keep your identifying information and data from this study separate, we will host the survey on an unaffiliated platform, Prolific. Thus, Prolific will <strong>not</strong> have access to the data you provide us. Additionally, we will not ask for directly or indirectly identifiable information in the survey.</p>' +
          '<p>If you have any questions about the research study, please contact Shaun Nichols (<a href="mailto:sbn44@cornell.edu">sbn44@cornell.edu</a>) at Cornell University. If you have any questions or concerns regarding your rights as a subject in this study, you may contact the Institutional Review Board (IRB) for Human Participants at 607-255-5138 or access their website at <a href="http://www.irb.cornell.edu" target="_blank" rel="noopener">www.irb.cornell.edu</a>. You may also report your concerns or complaints anonymously through Ethicspoint online at <a href="http://www.hotline.cornell.edu" target="_blank" rel="noopener">www.hotline.cornell.edu</a> or by calling toll free at 1-866-293-3077. Ethicspoint is an independent organization that serves as a liaison between the University and the person bringing the complaint so that anonymity can be ensured.</p>' +
          '<p>Taking part in this study is voluntary. You can stop at any time. Withdrawal or refusal to participate will not result in any penalty. You do not waive any legal rights or release any agent from liability for negligence by consenting to participate.</p>' +
        '</div>' +
        '<footer><p>If you consent to take part in this survey, please indicate so below:</p>' +
          '<button type="button" class="primary-button" data-consent-agree>I agree</button></footer>' +
      '</section></main>';

      const button = displayElement.querySelector("[data-consent-agree]");
      button.addEventListener("click", () => {
        window.fossilPilotConsentGiven = true;
        this.jsPsych.finishTrial({
          trial_type: "consent",
          trial_role: "consent",
          experiment_version: C.EXPERIMENT_VERSION,
          consent_given: true,
          consent_rt_ms: elapsedSince(startedAt)
        });
      });
      button.focus({ preventScroll: true });
    }
  }

  class FossilStudyIntroductionPlugin {
    static info = { name: "fossil-study-introduction", version: "14.0.0", parameters: {}, data: {} };

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement) {
      const startedAt = performance.now();
      document.title = "Introduction · " + C.STUDY_TITLE;
      displayElement.innerHTML = '<main class="prestudy-screen introduction-flow"><section class="prestudy-card study-introduction-card">' +
        '<header><span>Getting started</span><h1>About this study</h1></header>' +
        '<div class="study-introduction-body">' +
          '<p class="introduction-lead">You will examine a fictional fossil record showing how one animal species evolved into another.</p>' +
          '<p>Researchers know the species represented by the oldest and most recent fossils. They also found four fossil samples from populations that lived between them.</p>' +
          '<div class="study-outline" aria-label="What you will do">' +
            '<article><span>1</span><div><strong>Meet the known species</strong><p>Learn how the species at the two ends of the fossil record differ.</p></div></article>' +
            '<article><span>2</span><div><strong>Compare the evidence</strong><p>Examine the purpose and DNA evidence associated with each fossil sample.</p></div></article>' +
            '<article><span>3</span><div><strong>Make one judgment</strong><p>Rate one fossil sample and briefly explain the reason for your rating.</p></div></article>' +
          '</div>' +
          '<aside><strong>There are no right or wrong answers.</strong><span>We are interested in how you make your judgment.</span></aside>' +
        '</div>' +
        '<footer><span>The study should take about 5 minutes.</span>' +
          '<button type="button" class="primary-button" data-begin-study>Begin the study <span aria-hidden="true">→</span></button></footer>' +
      '</section></main>';

      const button = displayElement.querySelector("[data-begin-study]");
      button.addEventListener("click", () => {
        this.jsPsych.finishTrial({
          trial_type: "study_introduction",
          trial_role: "instruction",
          experiment_version: C.EXPERIMENT_VERSION,
          study_introduction_rt_ms: elapsedSince(startedAt)
        });
      });
      button.focus({ preventScroll: true });
    }
  }

  class FossilDemographicsPlugin {
    static info = { name: "fossil-demographics", version: "14.0.0", parameters: {}, data: {} };

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement) {
      const startedAt = performance.now();
      document.title = "Final questions · " + C.STUDY_TITLE;
      displayElement.innerHTML = '<main class="prestudy-screen demographics-flow"><section class="prestudy-card demographics-card">' +
        '<header><span>Final questions</span><h1>About your experience</h1>' +
          '<p>These questions are optional. You may leave any item blank.</p></header>' +
        '<form data-demographics-form>' +
          '<div class="feedback-grid">' +
            '<label class="feedback-field"><strong>What factors influenced how you decided to respond? Do you have any questions or comments regarding the experiment?</strong><textarea name="feedback" rows="4" spellcheck="true"></textarea></label>' +
            '<label class="feedback-field"><strong>Was anything about the study confusing or unclear?</strong><textarea name="confusion_feedback" rows="4" spellcheck="true"></textarea></label>' +
          '</div>' +
          '<div class="demographic-grid">' +
            '<fieldset><legend>Age</legend><input name="age" type="number" min="18" max="100" inputmode="numeric" aria-label="Age"></fieldset>' +
            '<fieldset><legend>Gender</legend><label><input name="gender" type="radio" value="Female"> Female</label><label><input name="gender" type="radio" value="Male"> Male</label><label><input name="gender" type="radio" value="Non-binary"> Non-binary</label><label class="other-option"><input name="gender" type="radio" value="other_gender"> Other: <input type="text" name="other_gender" aria-label="Other gender"></label></fieldset>' +
            '<fieldset class="race-field"><legend>Race</legend><label><input name="race" type="radio" value="White"> White</label><label><input name="race" type="radio" value="Black/African American"> Black/African American</label><label><input name="race" type="radio" value="American Indian/Alaska Native"> American Indian/Alaska Native</label><label><input name="race" type="radio" value="Asian"> Asian</label><label><input name="race" type="radio" value="Native Hawaiian/Pacific Islander"> Native Hawaiian/Pacific Islander</label><label><input name="race" type="radio" value="Multiracial"> Multiracial/Mixed</label><label class="other-option"><input name="race" type="radio" value="other_race"> Other: <input type="text" name="other_race" aria-label="Other race"></label></fieldset>' +
            '<fieldset><legend>Ethnicity</legend><label><input name="ethnicity" type="radio" value="Hispanic"> Hispanic</label><label><input name="ethnicity" type="radio" value="Non-Hispanic"> Non-Hispanic</label></fieldset>' +
          '</div>' +
          '<footer><span>Press Finish to submit your responses.</span>' +
            '<button type="submit" class="primary-button">Finish <span aria-hidden="true">→</span></button></footer>' +
        '</form>' +
      '</section></main>';

      const form = displayElement.querySelector("[data-demographics-form]");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const values = {
          feedback: form.elements.feedback.value.trim(),
          confusion_feedback: form.elements.confusion_feedback.value.trim(),
          age: form.elements.age.value,
          gender: checkedValue(form, "gender"),
          other_gender: form.elements.other_gender.value.trim(),
          race: checkedValue(form, "race"),
          other_race: form.elements.other_race.value.trim(),
          ethnicity: checkedValue(form, "ethnicity")
        };
        const focalResult = window.fossilPilotResult || {};
        const finalQuestionsRt = elapsedSince(startedAt);
        this.jsPsych.data.addDataToLastTrial({
          decision_feedback: values.feedback,
          confusing_or_unclear_feedback: values.confusion_feedback,
          feedback_character_count: values.feedback.length,
          confusion_feedback_character_count: values.confusion_feedback.length,
          final_questions_rt_ms: finalQuestionsRt
        });
        window.fossilPilotFeedback = values;
        this.jsPsych.finishTrial({
          trial_type: "demographics",
          trial_role: "demographic",
          experiment_version: C.EXPERIMENT_VERSION,
          participant_id: focalResult.participant_id || null,
          condition_id: focalResult.condition_id || null,
          evidence_order: focalResult.evidence_order || null,
          demographics_completed: true,
          final_questions_rt_ms: finalQuestionsRt,
          age: values.age,
          gender: values.gender,
          other_gender: values.other_gender,
          race: values.race,
          other_race: values.other_race,
          ethnicity: values.ethnicity
        });
      });
      form.elements.feedback.focus({ preventScroll: true });
    }
  }

  window.FossilConsentPlugin = FossilConsentPlugin;
  window.FossilStudyIntroductionPlugin = FossilStudyIntroductionPlugin;
  window.FossilDemographicsPlugin = FossilDemographicsPlugin;
})();
