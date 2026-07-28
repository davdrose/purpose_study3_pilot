(function () {
  "use strict";

  const config = window.STUDY_CONFIG;
  const consentConfig = window.CONSENT_CONFIG;
  const stimuli = window.PURPOSE_STIMULI;
  const statusElement = document.getElementById("thanks");

  if (!config || !consentConfig || !stimuli) {
    statusElement.innerHTML = "<h1>Study configuration error</h1><p>The study could not be initialized.</p>";
    return;
  }

  const addPrimaryButtonStyle = () => {
    const buttons = document.querySelectorAll(".jspsych-btn");
    if (buttons.length > 0) {
      buttons[buttons.length - 1].classList.add("jspsych-btn-primary");
    }
  };

  const exportedEvidenceOrder = config.evidenceOrder === "scan-first"
    ? "bio-scan-first"
    : `${config.featureType}-scan-first`;

  const renderCompletion = (html) => {
    document.body.innerHTML = `<main id="thanks" aria-live="polite">${html}</main>`;
    return document.getElementById("thanks");
  };

  const buildPayload = (jsPsych) => {
    const rows = jsPsych.data.get().values();
    const taskRows = rows
      .filter((row) => row.trial_role === "categorization_task")
      .sort((first, second) => first.trial_number - second.trial_number);
    const attentionRow = rows.find((row) => row.trial_role === "attention_check") || {};
    const surveyRow = rows.find((row) => row.trial_role === "participant_survey") || {};
    const attentionResponse = attentionRow.response?.letter_check || null;
    const surveyResponse = surveyRow.response || {};
    const completed = taskRows.length === 3;

    const demographics = {
      participant_id: config.assignmentId,
      prolific_pid: config.prolificPid || null,
      completed,
      feedback: surveyResponse.feedback || null,
      age: surveyResponse.age ? Number(surveyResponse.age) : null,
      gender: surveyResponse.gender || null,
      other_gender: surveyResponse.other_gender || null,
      race: surveyResponse.race || null,
      other_race: surveyResponse.other_race || null,
      ethnicity: surveyResponse.ethnicity || null
    };

    const trial = taskRows.map((taskRow) => {
      const placementBiologyAligned = taskRow.bio_profile === taskRow.canonical_hundred_species
        ? taskRow.placement_canonical
        : 100 - taskRow.placement_canonical;

      return {
        participant_id: config.assignmentId,
        prolific_pid: config.prolificPid || null,
        completed,
        trial_number: taskRow.trial_number,
        item_pair: taskRow.item_pair,
        bio_profile: taskRow.bio_profile,
        feature_type: config.featureType,
        feature_profile: taskRow.feature_profile,
        condition_type: config.conditionType,
        evidence_order: exportedEvidenceOrder,
        endpoint_order: `${taskRow.left_species}_left`,
        left_species: taskRow.left_species,
        right_species: taskRow.right_species,
        environment: taskRow.environment,
        canonical_zero_species: taskRow.canonical_zero_species,
        canonical_hundred_species: taskRow.canonical_hundred_species,
        placement_raw: taskRow.placement_raw,
        placement_canonical: taskRow.placement_canonical,
        placement_biology_aligned: placementBiologyAligned,
        categorization_response_time: taskRow.categorization_response_time
      };
    });

    const participants = trial.map((trialRecord) => ({
      ...trialRecord,
      attention_check_response: attentionResponse,
      attention_check_correct: attentionResponse === "no",
      feedback: demographics.feedback,
      age: demographics.age,
      gender: demographics.gender,
      other_gender: demographics.other_gender,
      race: demographics.race,
      other_race: demographics.other_race,
      ethnicity: demographics.ethnicity
    }));

    return { demographics, trial, participants };
  };

  let jsPsych;
  jsPsych = initJsPsych({
    show_progress_bar: true,
    on_finish: function () {
      const payload = buildPayload(jsPsych);
      window.__LAST_PROLIFERATE_PAYLOAD__ = payload;
      document.body.classList.remove("purpose-task-active");

      const completionHtml = `
        <div class="study-shell">
          <h1>Thank you for participating in this experiment!</h1>
          <p>Redirecting you back to Prolific…</p>
        </div>
      `;

      if (!window.proliferate || typeof window.proliferate.submit !== "function") {
        const completionElement = renderCompletion("");
        completionElement.innerHTML = `
          <div class="study-shell">
            <h1>Submission error</h1>
            <p>Your responses could not be sent because the data service did not load. Please contact the researcher through Prolific so that you can still be compensated.</p>
          </div>
        `;
        return;
      }

      window.proliferate.submit(payload);
      $("#jspsych-content").html(completionHtml);
    }
  });

  const browserCheck = {
    type: jsPsychBrowserCheck,
    features: ["width", "height", "browser", "browser_version", "mobile", "os"],
    inclusion_function: function (data) {
      return config.demoMode || data.mobile === false;
    },
    exclusion_message: function () {
      return `
        <div class="study-shell">
          <h1>Desktop or laptop required</h1>
          <p>This study uses an interactive scanner and categorization display that is not designed for phones or tablets. Please return the study on Prolific.</p>
        </div>
      `;
    },
    data: {
      trial_role: "browser_check"
    }
  };

  const consentTrial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: consentConfig.buildHtml(),
    choices: ["I agree"],
    data: {
      trial_role: "consent"
    },
    on_load: addPrimaryButtonStyle,
    on_finish: function (data) {
      data.consent_given = data.response === 0;
    }
  };

  const categorizationTasks = config.trialConfigs.map((trialConfig) => ({
    type: jsPsychPurposeCategorization,
    task_url: "assets/task.html",
    assignment_id: config.assignmentId,
    matching_schedule_id: config.matchingScheduleId,
    trial_number: trialConfig.trialNumber,
    item_pair: trialConfig.itemPair,
    animal_a: trialConfig.animalA,
    animal_b: trialConfig.animalB,
    bio_profile: trialConfig.bioProfile,
    feature_type: config.featureType,
    feature_profile: trialConfig.featureProfile,
    condition_cell: config.conditionCell,
    evidence_order: config.evidenceOrder,
    endpoint_order: trialConfig.endpointOrder,
    left_species: trialConfig.leftSpecies,
    right_species: trialConfig.rightSpecies,
    first_introduced_species: trialConfig.firstIntroducedSpecies,
    environment: trialConfig.environment,
    canonical_zero_species: trialConfig.canonicalZeroSpecies,
    canonical_hundred_species: trialConfig.canonicalHundredSpecies,
    show_instructions: trialConfig.showInstructions
  }));

  const attentionCheck = {
    type: jsPsychSurveyHtmlForm,
    preamble: `
      <div class="study-shell">
        <h2>One final question</h2>
      </div>
    `,
    html: `
      <div class="study-shell">
        <div class="question-label">Eight has an even number of letters.</div>
        <div class="radio-group">
          <label class="radio-option" for="letter_check_yes">
            <input type="radio" id="letter_check_yes" name="letter_check" value="yes" required>
            <span>Yes</span>
          </label>
          <label class="radio-option" for="letter_check_no">
            <input type="radio" id="letter_check_no" name="letter_check" value="no" required>
            <span>No</span>
          </label>
        </div>
      </div>
    `,
    button_label: "Continue",
    data: {
      trial_role: "attention_check"
    },
    on_load: addPrimaryButtonStyle
  };

  const participantSurvey = {
    type: jsPsychSurveyHtmlForm,
    html: `
      <div style="max-width:700px; text-align:center;">
        <p>What factors influenced how you decided to respond? Do you have any questions or comments regarding the experiment?</p>
        <textarea name="feedback" cols="40" rows="6" autofocus></textarea>
        <p>Please provide the following information to complete the study.</p>

        <div style="text-align:center;">
          <div style="text-align:left; display:inline-block; margin-right:20px; line-height:1.8em;">
            <ol>
              <li>Age:</li><br>
              <li>Gender:</li><br><br>
              <li>Race:</li><br><br><br><br><br><br><br>
              <li>Ethnicity:</li>
            </ol>
          </div>

          <div style="text-align:left; display:inline-block; line-height:1.8em;">
            <input name="age" type="number" min="18" max="100"><br><br>

            <input name="gender" type="radio" id="female" value="Female">
            <label for="female">Female</label>
            <input name="gender" type="radio" id="male" value="Male">
            <label for="male">Male</label>
            <input name="gender" type="radio" id="nonbinary" value="Non-binary">
            <label for="nonbinary">Non-binary</label><br>
            <input name="gender" type="radio" id="other_gender" value="other_gender">
            <label for="other_gender">Other: <input type="text" name="other_gender"></label><br><br>

            <input name="race" type="radio" id="white" value="White">
            <label for="white">White</label><br>
            <input name="race" type="radio" id="black" value="Black/African American">
            <label for="black">Black/African American</label><br>
            <input name="race" type="radio" id="am_ind" value="American Indian/Alaska Native">
            <label for="am_ind">American Indian/Alaska Native</label><br>
            <input name="race" type="radio" id="asian" value="Asian">
            <label for="asian">Asian</label><br>
            <input name="race" type="radio" id="pac_isl" value="Native Hawaiian/Pacific Islander">
            <label for="pac_isl">Native Hawaiian/Pacific Islander</label><br>
            <input name="race" type="radio" id="multi" value="Multiracial">
            <label for="multi">Multiracial/Mixed</label><br>
            <input name="race" type="radio" id="other_race" value="other_race">
            <label for="other_race">Other: <input type="text" name="other_race"></label><br><br>

            <input name="ethnicity" type="radio" id="hisp" value="Hispanic">
            <label for="hisp">Hispanic</label>
            <input name="ethnicity" type="radio" id="nonhisp" value="Non-Hispanic">
            <label for="nonhisp">Non-Hispanic</label>
          </div>
        </div>

        <p>Please press the finish button to complete the experiment.</p>
      </div>
    `,
    button_label: "Finish",
    data: {
      trial_role: "participant_survey"
    },
    on_load: addPrimaryButtonStyle
  };

  const timeline = [browserCheck];
  if (config.includeConsent) {
    timeline.push(consentTrial);
  }
  timeline.push(...categorizationTasks);
  timeline.push(attentionCheck);
  timeline.push(participantSurvey);

  jsPsych.run(timeline);
})();
