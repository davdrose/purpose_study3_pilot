(function (global) {
  "use strict";

  const Study = global.ExtinctionStudy;
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
    return '<main class="study-screen"><section class="study-card ' +
      escapeHtml(settings.cardClass || "") + '">' + content + '</section></main>';
  }

  function caseDataFor(caseIndex) {
    return Study.runtime.assignment.caseSequence[caseIndex - 1];
  }

  function trialMetadata(caseData) {
    return {
      case_index: caseData.caseIndex,
      assigned_condition: caseData.condition,
      species_id: caseData.species.id,
      species_name: caseData.species.name,
      island_chain: caseData.species.islandChain,
      magnitude_index: caseData.magnitudeIndex,
      number_died: caseData.numberDied,
      starting_population_presented: caseData.startingPopulation,
      surviving_population_presented: caseData.survivingPopulation,
      mortality_proportion_presented: caseData.mortalityProportion,
      species_became_extinct: caseData.speciesBecameExtinct,
      populations_remained_on_every_island: caseData.populationsRemainOnEveryIsland,
      deaths_distribution_presented: caseData.deathsDistribution,
      island_count_presented: C.islandCount
    };
  }

  function islandMap(caseData) {
    const species = caseData.species;
    const extinct = caseData.condition === "extinction";
    const died = Study.Data.formatNumber(caseData.numberDied);
    const remained = Study.Data.formatNumber(caseData.survivingPopulation);
    const outcomeMarkers = species.islandMarkers.map(function (marker) {
      if (extinct) {
        return '<span class="population-marker marker-died" style="left:' + marker.x + '%;top:' + marker.y +
          '%" role="img" aria-label="Animals died here and none remain">×</span>';
      }
      return '<span class="outcome-marker-pair" style="left:' + marker.x + '%;top:' + marker.y +
        '%" role="img" aria-label="Some animals died here and animals remain here">' +
          '<i class="population-marker marker-died" aria-hidden="true">×</i>' +
          '<i class="population-marker marker-survived" aria-hidden="true">✓</i>' +
        '</span>';
    }).join("");

    const description = extinct
      ? "After the illness, " + died + " " + species.name + " had died across all five islands, and none remained anywhere."
      : "After the illness, " + died + " " + species.name + " had died across all five islands, while " + remained + " remained and populations continued on every island.";

    return '<figure class="distribution-map">' +
      '<figcaption><div class="map-title"><span>Population map</span><strong>' + escapeHtml(species.islandChain) + ' after the illness</strong></div></figcaption>' +
      '<div class="realistic-map-image" role="img" aria-label="' + escapeHtml(description) + '">' +
        '<img src="' + escapeHtml(species.islandImage) + '" alt="">' + outcomeMarkers +
      '</div>' +
      '<div class="map-key"><span><i class="key-loss" aria-hidden="true">×</i> ' +
        (extinct ? escapeHtml(species.name) + ' died on all five islands' : 'Some ' + escapeHtml(species.name) + ' died on each island') + '</span>' +
        (extinct ? "" : '<span><i class="key-survive" aria-hidden="true">✓</i> ' + escapeHtml(species.name) + ' remain on every island</span>') +
      '</div>' +
      '<div class="map-status"><div><span>Across the island chain</span><strong>' + died + ' died</strong></div>' +
        '<div class="world-status ' + (extinct ? 'is-extinct' : 'is-surviving') + '"><span>After the illness</span><strong>' +
          (extinct ? '0 remain anywhere in the world' : remained + ' remain across all five islands') +
        '</strong></div></div>' +
    '</figure>';
  }

  function speciesHeader(species) {
    return '<header class="case-header"><div class="case-title-row">' +
      '<h1>The ' + escapeHtml(species.name) + '</h1>' +
      '<div class="species-portrait"><img src="' + escapeHtml(species.image) + '" alt="' + escapeHtml(species.imageAlt) + '"></div>' +
    '</div></header>';
  }

  class ConsentPlugin {
    static info = { name: "extinction-consent", version: "14.0.0", parameters: {}, data: {} };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement) {
      const startedAt = performance.now();
      document.title = "Consent · " + C.title;
      displayElement.innerHTML = studyFrame(
        '<header class="card-header"><span>Research participation</span><h1>Consent Form</h1></header>' +
        '<div class="consent-document" tabindex="0">' +
          '<p>Thank you for agreeing to take part in this study. We appreciate your time and effort. In this study, you will learn about four island animals, and then we will ask you to answer a brief series of questions about them. The questions have no right or wrong answers—we’re just exploring features of human psychology in this research. You will be paid ' + escapeHtml(C.consentPayment) + ' for your time and efforts. We do not anticipate any risks from participating in this research. While you will not directly benefit from taking part in this research study, we hope society and the scientific community will benefit from the knowledge gained about human psychology and judgment.</p>' +
          '<p>Your involvement should take about ' + C.estimatedMinutes + ' minutes. Your participation is voluntary and you can stop at any time. If you consent to take part in this survey, please indicate so below, and then click the <strong>I agree</strong> button to advance. If not, simply close your browser window.</p>' +
          '<p>The research data will be collected anonymously. We will not ask you to provide any personally identifiable information (such as an email address, name, etc.) and will not be able to link your response to you. We anticipate that your participation in this survey presents no greater risk than everyday use of the Internet. Of course, please note that there is always the possible risk of intrusion by outside agents (i.e. hacking) whenever information is shared over the Internet. In order to keep your identifying information and data from this study separate, we will host the survey on an unaffiliated platform, Prolific. Thus, Prolific will <strong>not</strong> have access to the data you provide us. Additionally, we will not ask for directly or indirectly identifiable information in the survey.</p>' +
          '<p>If you have any questions about the research study, please contact Shaun Nichols (<a href="mailto:sbn44@cornell.edu">sbn44@cornell.edu</a>) at Cornell University. If you have any questions or concerns regarding your rights as a subject in this study, you may contact the Institutional Review Board (IRB) for Human Participants at 607-255-5138 or access their website at <a href="http://www.irb.cornell.edu" target="_blank" rel="noopener">www.irb.cornell.edu</a>. You may also report your concerns or complaints anonymously through Ethicspoint online at <a href="http://www.hotline.cornell.edu" target="_blank" rel="noopener">www.hotline.cornell.edu</a> or by calling toll free at 1-866-293-3077. Ethicspoint is an independent organization that serves as a liaison between the University and the person bringing the complaint so that anonymity can be ensured.</p>' +
          '<p>Taking part in this study is voluntary. You can stop at any time. Withdrawal or refusal to participate will not result in any penalty. You do not waive any legal rights or release any agent from liability for negligence by consenting to participate.</p>' +
        '</div>' +
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
    static info = { name: "extinction-introduction", version: "14.0.0", parameters: {}, data: {} };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement) {
      const startedAt = performance.now();
      document.title = "Introduction · " + C.title;
      displayElement.innerHTML = studyFrame(
        '<header class="card-header"><span>Before you begin</span><h1>About this study</h1></header>' +
        '<div class="readiness-body"><p class="readiness-statement">You will learn about four different animals that live on four different chains of islands.</p>' +
          '<p>When you are ready to begin, please click Next.</p></div>' +
        '<footer class="card-footer readiness-footer">' +
          '<button type="button" class="primary-button" data-continue>Next <span aria-hidden="true">→</span></button></footer>',
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

  class LocationPlugin {
    static info = {
      name: "extinction-location",
      version: "14.0.0",
      parameters: { case_index: { type: ParameterType.INT, default: 1 } },
      data: {}
    };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement, trial) {
      const startedAt = performance.now();
      const caseData = caseDataFor(trial.case_index);
      const species = caseData.species;
      const previousCaseIndex = trial.case_index === 1 ? C.species.length : trial.case_index - 1;
      const startingSpecies = caseDataFor(previousCaseIndex).species;
      const reducedMotion = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let phase = "ready_to_find";
      let findLocationRt = null;
      let globeRt = null;
      let zoomStartedAt = null;
      document.title = "Finding the " + species.name + " · " + C.title;

      displayElement.innerHTML = studyFrame(
        '<div class="location-stage" data-location-stage>' +
          '<div class="location-visual" role="img" aria-label="A globe rotating toward ' + escapeHtml(species.worldRegion) + ', then zooming into the ' + escapeHtml(species.islandChain) + '">' +
            '<div class="globe-view">' +
              '<img class="globe-frame globe-start" src="' + escapeHtml(startingSpecies.globeImage) + '" alt="" aria-hidden="true">' +
              '<img class="globe-frame globe-destination" src="' + escapeHtml(species.globeImage) + '" alt="" aria-hidden="true">' +
              '<span class="destination-pin" style="left:' + species.globeMarker.x + '%;top:' + species.globeMarker.y + '%" aria-hidden="true"><i></i></span>' +
              '<span class="visually-hidden" data-globe-status aria-live="polite">Full view of Earth</span>' +
            '</div>' +
            '<div class="island-reveal"><div class="island-canvas">' +
              '<img src="' + escapeHtml(species.islandImage) + '" alt="A realistic aerial view of the ' + escapeHtml(species.islandChain) + '">' +
              '<span class="island-chain-label">' + escapeHtml(species.islandChain) + '</span>' +
            '</div></div>' +
          '</div>' +
          '<section class="location-copy" data-location-copy>' +
            '<div class="location-species-portrait" aria-hidden="true"><img src="' + escapeHtml(species.image) + '" alt=""></div>' +
            '<div class="location-message location-message-simple" data-location-message aria-live="polite">' +
              '<h1>You will learn about animals in ' + escapeHtml(species.worldRegion) + '.</h1>' +
            '</div>' +
          '</section>' +
          '<footer class="location-footer location-footer-simple">' +
            '<button type="button" class="primary-button" data-location-button>Find their location <span aria-hidden="true">→</span></button>' +
          '</footer>' +
        '</div>',
        { cardClass: "location-card" }
      );

      const root = displayElement.querySelector("[data-location-stage]");
      const button = displayElement.querySelector("[data-location-button]");
      const status = displayElement.querySelector("[data-globe-status]");
      const message = displayElement.querySelector("[data-location-message]");
      const speciesRevealDelay = reducedMotion ? 80 : 2100;
      const rotationDuration = reducedMotion ? 80 : 3000;
      const approachDuration = reducedMotion ? 80 : 600;
      const islandZoomDuration = reducedMotion ? 80 : 1200;

      button.addEventListener("click", () => {
        if (phase === "ready_to_find") {
          phase = "finding";
          findLocationRt = elapsedSince(startedAt);
          button.disabled = true;
          button.innerHTML = "Finding their location…";
          root.classList.add("is-rotating");
          status.textContent = "Finding the animals’ location";

          global.setTimeout(function () {
            root.classList.add("species-ready");
            message.classList.remove("location-message-simple");
            message.innerHTML = '<span>Meet the ' + escapeHtml(species.name) + '</span><h1>These are ' + escapeHtml(species.name) + '.</h1>' +
              '<p>They live in the ' + escapeHtml(species.islandChain) + '.</p>';
          }, speciesRevealDelay);

          global.setTimeout(function () {
            root.classList.add("destination-ready", "region-close");
            status.textContent = "The animals’ region has been located";
          }, rotationDuration);

          global.setTimeout(function () {
            phase = "globe";
            root.classList.add("location-ready");
            button.innerHTML = 'Zoom in to the ' + escapeHtml(species.islandChain) + ' <span aria-hidden="true">→</span>';
            button.disabled = false;
            focusElement(button);
          }, rotationDuration + approachDuration);
          return;
        }

        if (phase === "globe") {
          phase = "islands";
          globeRt = elapsedSince(startedAt);
          zoomStartedAt = performance.now();
          button.disabled = true;
          root.classList.add("is-zoomed");
          message.innerHTML = '<span>The ' + escapeHtml(species.islandChain) + '</span><h1>Home of the ' + escapeHtml(species.name) + '</h1>' +
            '<p>' + escapeHtml(species.name) + ' live throughout the island chain, with populations on all five islands.</p>';
          global.setTimeout(function () {
            button.innerHTML = 'Learn what happened to the ' + escapeHtml(species.name) + ' <span aria-hidden="true">→</span>';
            button.disabled = false;
            focusElement(button);
          }, islandZoomDuration);
          return;
        }

        this.jsPsych.finishTrial(Object.assign(trialMetadata(caseData), {
          screen_id: "location_" + trial.case_index,
          world_region: species.worldRegion,
          find_location_rt_ms: findLocationRt,
          globe_view_rt_ms: globeRt,
          island_zoom_view_rt_ms: zoomStartedAt == null ? null : elapsedSince(zoomStartedAt),
          location_total_rt_ms: elapsedSince(startedAt)
        }));
      });
      focusElement(button);
    }
  }

  class CasePlugin {
    static info = {
      name: "extinction-case",
      version: "14.0.0",
      parameters: { case_index: { type: ParameterType.INT, default: 1 } },
      data: {}
    };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement, trial) {
      const startedAt = performance.now();
      const caseData = caseDataFor(trial.case_index);
      const species = caseData.species;
      const extinct = caseData.condition === "extinction";
      const died = Study.Data.formatNumber(caseData.numberDied);
      const started = Study.Data.formatNumber(caseData.startingPopulation);
      const remained = Study.Data.formatNumber(caseData.survivingPopulation);
      document.title = species.name + " · " + C.title;

      const populationParagraph = extinct
        ? '<p>Before the illness, there were <strong>' + started + ' ' + escapeHtml(species.name) + ' in total</strong> across the five islands. These were the only ' + escapeHtml(species.name) + ' in the world. By the time the illness ended several weeks later, <strong>' + died + ' had died across the five islands, with some deaths on every island.</strong></p>'
        : '<p>Before the illness, there were <strong>' + started + ' ' + escapeHtml(species.name) + '</strong> across the five islands. By the time the illness ended several weeks later, <strong>' + died + ' had died across the five islands, with some deaths on every island.</strong></p>';
      const outcomeParagraph = extinct
        ? '<p>No ' + escapeHtml(species.name) + ' remained on any island—or anywhere else in the world—so the ' + escapeHtml(species.name) + ' became extinct.</p>'
        : '<p><strong>' + remained + ' ' + escapeHtml(species.name) + ' survived.</strong> They continued to live on every island where they had lived before, so the ' + escapeHtml(species.name) + ' did not become extinct.</p>';

      displayElement.innerHTML = studyFrame(
        speciesHeader(species) +
        '<div class="case-layout"><section class="scenario-copy" aria-label="Case description">' +
          '<p>' + escapeHtml(species.name) + ' live throughout the <strong>' + escapeHtml(species.islandChain) + '</strong>, with populations on all five islands.</p>' +
          '<p>A short-lived illness that affected only ' + escapeHtml(species.name) + ' occurred across the island chain.</p>' +
          populationParagraph +
          outcomeParagraph +
        '</section>' + islandMap(caseData) + '</div>' +
        '<form class="response-form" data-response-form>' +
          '<label for="case-response">Please list all the reasons you can think of for why it was bad that the ' + died + ' ' + escapeHtml(species.name) + ' died.</label>' +
          '<p>Write your answer in your own words. There are no right or wrong answers.</p>' +
          '<textarea id="case-response" name="response" rows="5" spellcheck="true" placeholder="Type your response here…" required></textarea>' +
          '<div class="response-footer"><span data-count>0 characters</span>' +
            '<button type="submit" class="primary-button" disabled>Continue <span aria-hidden="true">→</span></button></div>' +
        '</form>',
        { cardClass: "case-card" }
      );

      const form = displayElement.querySelector("[data-response-form]");
      const textarea = form.elements.response;
      const submit = form.querySelector('button[type="submit"]');
      const counter = form.querySelector("[data-count]");
      textarea.addEventListener("input", function () {
        const length = textarea.value.trim().length;
        counter.textContent = length + (length === 1 ? " character" : " characters");
        submit.disabled = length === 0;
      });
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const response = textarea.value.trim();
        if (!response) return;
        this.jsPsych.finishTrial(Object.assign(trialMetadata(caseData), {
          screen_id: "case_" + trial.case_index,
          response_text: response,
          response_character_count: response.length,
          response_word_count: Study.Data.wordCount(response),
          response_rt_ms: elapsedSince(startedAt)
        }));
      });
      focusElement(textarea);
    }
  }

  class DemographicsPlugin {
    static info = { name: "extinction-demographics", version: "14.0.0", parameters: {}, data: {} };

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
          '</div>' +
          '<div class="demographic-grid">' +
            '<fieldset><legend>Age</legend><input name="age" type="number" min="18" max="100" inputmode="numeric" aria-label="Age"></fieldset>' +
            '<fieldset><legend>Gender</legend><label><input name="gender" type="radio" value="Female"> Female</label><label><input name="gender" type="radio" value="Male"> Male</label><label><input name="gender" type="radio" value="Non-binary"> Non-binary</label><label class="other-option"><input name="gender" type="radio" value="other_gender"> Other: <input type="text" name="other_gender" aria-label="Other gender"></label></fieldset>' +
            '<fieldset class="race-field"><legend>Race</legend><label><input name="race" type="radio" value="White"> White</label><label><input name="race" type="radio" value="Black/African American"> Black/African American</label><label><input name="race" type="radio" value="American Indian/Alaska Native"> American Indian/Alaska Native</label><label><input name="race" type="radio" value="Asian"> Asian</label><label><input name="race" type="radio" value="Native Hawaiian/Pacific Islander"> Native Hawaiian/Pacific Islander</label><label><input name="race" type="radio" value="Multiracial"> Multiracial/Mixed</label><label class="other-option"><input name="race" type="radio" value="other_race"> Other: <input type="text" name="other_race" aria-label="Other race"></label></fieldset>' +
            '<fieldset><legend>Ethnicity</legend><label><input name="ethnicity" type="radio" value="Hispanic"> Hispanic</label><label><input name="ethnicity" type="radio" value="Non-Hispanic"> Non-Hispanic</label></fieldset>' +
          '</div>' +
          '<footer class="card-footer"><span>Press Finish to complete the study.</span><button type="submit" class="primary-button">Finish <span aria-hidden="true">→</span></button></footer>' +
        '</form>',
        { cardClass: "demographics-card" }
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
    Location: LocationPlugin,
    Case: CasePlugin,
    Demographics: DemographicsPlugin
  });
})(window);
