(function (global) {
  "use strict";

  const Study = global.LifeMeaningStudy;
  const C = Study.Config;

  function completionScreen(jsPsych) {
    const payload = Study.Data.buildPayload(jsPsych);
    global.__LIFE_MEANING_STUDY_DATA__ = payload;
    const target = document.getElementById("jspsych-target");
    document.title = "Complete · " + C.title;
    target.innerHTML = '<main class="study-screen completion-screen"><section class="completion-card">' +
      '<span class="completion-mark" aria-hidden="true">✓</span>' +
      '<small>Study complete</small><h1>Thank you for participating.</h1>' +
      '<p>Your responses have been recorded in this browser session.</p>' +
      '<div class="prototype-actions"><button type="button" class="secondary-button" data-download>Download test data</button>' +
        '<button type="button" class="text-button" data-restart>Restart study</button></div>' +
      '<span class="prototype-note">Prototype mode · No data were sent to a server</span>' +
    "</section></main>";

    target.querySelector("[data-download]").addEventListener("click", function () {
      Study.Data.downloadJson(payload);
    });
    target.querySelector("[data-restart]").addEventListener("click", function () {
      global.location.reload();
    });
  }

  function fatal(error) {
    console.error("Life meaning study initialization error", error);
    document.getElementById("jspsych-target").innerHTML =
      '<main class="study-screen completion-screen"><section class="completion-card error-card" role="alert">' +
      '<h1>The study could not start.</h1><p>Please reopen index.html from the complete life_meaning_v1 folder.</p>' +
      '<span class="prototype-note">No data were sent.</span></section></main>';
  }

  function buildTimeline() {
    const timeline = [
      { type: Study.Plugins.Consent },
      { type: Study.Plugins.Introduction }
    ];
    C.questions.forEach(function (question, index) {
      timeline.push({
        type: Study.Plugins.Question,
        question_id: question.id,
        question_position: index + 1
      });
    });
    timeline.push({ type: Study.Plugins.Demographics });
    return timeline;
  }

  async function boot() {
    try {
      Study.runtime = {
        participant: Study.Data.createParticipant(),
        consentGiven: false
      };
      const jsPsych = global.initJsPsych({
        display_element: "jspsych-target",
        show_progress_bar: false,
        use_webaudio: false,
        on_finish: function () { completionScreen(jsPsych); }
      });
      Study.jsPsych = jsPsych;
      jsPsych.data.addProperties({
        experiment_version: C.version,
        participant_id: Study.runtime.participant.participantId,
        prolific_pid: Study.runtime.participant.prolificPid,
        study_id: Study.runtime.participant.studyId,
        session_id: Study.runtime.participant.sessionId,
        start_timestamp: Study.runtime.participant.startedAt,
        question_order: C.questions.map(function (question) { return question.id; }).join(",")
      });
      await jsPsych.run(buildTimeline());
    } catch (error) {
      fatal(error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
