(function (global) {
  "use strict";

  const Study = global.AnimalGoodnessStudy;
  const C = Study.Config;

  function completionScreen(jsPsych) {
    const payload = Study.Data.buildPayload(jsPsych);
    global.__ANIMAL_GOODNESS_STUDY_DATA__ = payload;
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
    console.error("Individual animal purpose study initialization error", error);
    const target = document.getElementById("jspsych-target");
    target.innerHTML = '<main class="study-screen completion-screen"><section class="completion-card error-card" role="alert">' +
      '<h1>The study could not start.</h1><p>Please reopen index.html from the complete animal_goodness_v8 folder.</p>' +
      '<span class="prototype-note">No data were sent.</span></section></main>';
  }

  function preloadImages() {
    const target = document.getElementById("jspsych-target");
    target.innerHTML = '<main class="loading-screen" aria-live="polite"><div class="loading-spinner" aria-hidden="true"></div><p>Loading study…</p></main>';
    return Promise.all(C.items.map(function (item) {
      return new Promise(function (resolve, reject) {
        const image = new Image();
        image.onload = resolve;
        image.onerror = function () { reject(new Error("Could not load " + item.image)); };
        image.src = item.image;
      });
    }));
  }

  function buildTimeline() {
    const timeline = [
      { type: Study.Plugins.Consent },
      { type: Study.Plugins.Introduction }
    ];

    Study.runtime.assignment.itemOrder.forEach(function (itemId, itemIndex) {
      timeline.push({
        type: Study.Plugins.ItemIntroduction,
        item_id: itemId,
        item_position: itemIndex + 1
      });

      Study.runtime.assignment.questionOrder.forEach(function (questionId, questionIndex) {
        timeline.push({
          type: Study.Plugins.ItemQuestion,
          item_id: itemId,
          item_position: itemIndex + 1,
          question_id: questionId,
          question_position: questionIndex + 1
        });
      });
    });

    timeline.push({ type: Study.Plugins.Demographics });
    return timeline;
  }

  async function boot() {
    try {
      Study.runtime = {
        assignment: Study.Data.createAssignment(),
        participant: Study.Data.createParticipant(),
        consentGiven: false
      };

      await preloadImages();
      document.getElementById("jspsych-target").innerHTML = "";

      const jsPsych = global.initJsPsych({
        display_element: "jspsych-target",
        show_progress_bar: false,
        use_webaudio: false,
        on_finish: function () { completionScreen(jsPsych); }
      });
      Study.jsPsych = jsPsych;

      const questionOrder = Study.runtime.assignment.questionOrder;
      const followupQuestionOrder = Study.runtime.assignment.followupQuestionOrder;
      const itemOrder = Study.runtime.assignment.itemOrder;
      jsPsych.data.addProperties({
        experiment_version: C.version,
        participant_id: Study.runtime.participant.participantId,
        prolific_pid: Study.runtime.participant.prolificPid,
        study_id: Study.runtime.participant.studyId,
        session_id: Study.runtime.participant.sessionId,
        start_timestamp: Study.runtime.participant.startedAt,
        question_order: questionOrder.join(","),
        question_order_1: questionOrder[0],
        question_order_2: questionOrder[1],
        question_order_3: questionOrder[2],
        question_order_4: questionOrder[3],
        question_order_5: questionOrder[4],
        followup_question_order: followupQuestionOrder.join(","),
        item_order: itemOrder.join(",")
      });

      jsPsych.run(buildTimeline());
    } catch (error) {
      fatal(error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
