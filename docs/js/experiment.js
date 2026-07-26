(function () {
  "use strict";

  const config = window.STUDY_CONFIG;
  const consentConfig = window.CONSENT_CONFIG;
  const statusElement = document.getElementById("thanks");

  if (!config || !consentConfig) {
    statusElement.innerHTML = "<h1>Study configuration error</h1><p>The study could not be initialized.</p>";
    return;
  }

  const addPrimaryButtonStyle = () => {
    const buttons = document.querySelectorAll(".jspsych-btn");
    if (buttons.length > 0) {
      buttons[buttons.length - 1].classList.add("jspsych-btn-primary");
    }
  };

  const exportedEvidenceOrder = () => config.evidenceOrder === "scan-first"
    ? "bio-scan-first"
    : "purpose-scan-first";

  const downloadJson = (payload) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `purpose-categorization-${config.assignmentId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const renderCompletion = (html) => {
    document.body.innerHTML = `<main id="thanks" aria-live="polite">${html}</main>`;
    return document.getElementById("thanks");
  };

  const buildPayload = (jsPsych) => {
    const rows = jsPsych.data.get().values();
    const taskRow = rows.find((row) => row.trial_role === "categorization_task") || {};
    const recallRow = rows.find((row) => row.trial_role === "manipulation_recall") || {};
    const surveyRow = rows.find((row) => row.trial_role === "participant_survey") || {};
    const recallResponse = recallRow.response || {};
    const surveyResponse = surveyRow.response || {};

    return {
      participant: {
        participant_id: config.assignmentId,
        prolific_pid: config.prolificPid || null,
        study_version: config.studyVersion,
        completed: true,
        bio_profile: config.bioProfile,
        purpose_profile: config.purposeProfile,
        evidence_order: exportedEvidenceOrder(),
        endpoint_order: config.endpointOrder,
        environment: config.environment,
        placement_raw: taskRow.response_raw_left_to_right ?? null,
        placement_canonical: taskRow.response_daxon_0_100 ?? null,
        bio_recall_response: recallResponse.bio_recall || null,
        bio_recall_correct: recallResponse.bio_recall === config.bioProfile,
        purpose_recall_response: recallResponse.purpose_recall || null,
        purpose_recall_correct: recallResponse.purpose_recall === config.purposeProfile,
        age: surveyResponse.age ? Number(surveyResponse.age) : null,
        gender: surveyResponse.gender || null,
        other_gender: surveyResponse.other_gender || null,
        race: surveyResponse.race || null,
        other_race: surveyResponse.other_race || null,
        ethnicity: surveyResponse.ethnicity || null
      }
    };
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

  const categorizationTask = {
    type: jsPsychPurposeCategorization,
    task_url: "assets/task.html",
    condition_id: config.conditionId,
    counterbalance_id: config.counterbalanceId,
    assignment_id: config.assignmentId,
    bio_profile: config.bioProfile,
    purpose_profile: config.purposeProfile,
    scanner_available: config.scannerAvailable,
    environment: config.environment,
    evidence_order: config.evidenceOrder,
    endpoint_order: config.endpointOrder
  };

  const recallSpeciesOrder = config.endpointOrder === "rellin-left"
    ? [
        { value: "rellin", label: "Rellins" },
        { value: "daxon", label: "Daxons" }
      ]
    : [
        { value: "daxon", label: "Daxons" },
        { value: "rellin", label: "Rellins" }
      ];

  const radioOptions = (name) => recallSpeciesOrder.map((option) => `
    <label class="radio-option">
      <input type="radio" name="${name}" value="${option.value}" required>
      <span>${option.label}</span>
    </label>
  `).join("");

  const manipulationRecall = {
    type: jsPsychSurveyHtmlForm,
    preamble: `
      <div class="study-shell">
        <h2>A couple of questions about what you saw</h2>
        <p class="study-lead">Please answer from memory. Your categorization response has already been recorded.</p>
      </div>
    `,
    html: `
      <div class="study-shell">
        <div class="question-label">According to the biological scan, which known species did the new population’s biological profile match?</div>
        <div class="radio-group">${radioOptions("bio_recall")}</div>

        <div class="question-label">According to the purpose scan, which known species did the new population’s purpose profile match?</div>
        <div class="radio-group">${radioOptions("purpose_recall")}</div>
      </div>
    `,
    button_label: "Continue",
    data: {
      trial_role: "manipulation_recall",
      recall_option_order: recallSpeciesOrder.map((option) => option.value).join("-first-then-")
    },
    on_load: addPrimaryButtonStyle,
    on_finish: function (data) {
      data.bio_recall_correct = data.response.bio_recall === config.bioProfile;
      data.purpose_recall_correct = data.response.purpose_recall === config.purposeProfile;
    }
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
      trial_role: "participant_survey",
      page_type: "participant_survey"
    },
    on_load: addPrimaryButtonStyle
  };

  const timeline = [browserCheck];
  if (config.includeConsent) {
    timeline.push(consentTrial);
  }
  timeline.push(categorizationTask);
  timeline.push(manipulationRecall);
  timeline.push(participantSurvey);

  jsPsych.run(timeline);
})();
