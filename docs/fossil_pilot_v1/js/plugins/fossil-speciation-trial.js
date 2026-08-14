(function () {
  "use strict";

  const FP = window.FossilPilot;
  const C = FP.Config;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatAge(years) {
    return Math.round(years / 1000).toLocaleString("en-US") + " thousand years ago";
  }

  function progress(step, label) {
    return '<div class="stage-topline"><span>Step ' + step + ' of 5</span>' +
      '<div class="stage-dots" aria-hidden="true">' + [1, 2, 3, 4, 5].map(function (number) {
        return '<i class="' + (number < step ? "complete" : (number === step ? "active" : "")) + '"></i>';
      }).join("") + '</div><strong>' + escapeHtml(label) + '</strong></div>';
  }

  function comparisonPhrase(order) {
    return order === "purpose_first" ? "purpose and DNA" : "DNA and purpose";
  }

  function comparisonTitle(order) {
    return order === "purpose_first" ? "Purpose and DNA" : "DNA and purpose";
  }

  function dnaSamePercent(specimen) {
    return (100 - specimen.dna_difference_percent).toFixed(2);
  }

  function seedCounts(specimen) {
    if (specimen.id === "A") {
      return '<div class="seed-counts endpoint-seed-counts">' +
        '<span><i class="nutseed-dot"></i><b>99</b> storage</span>' +
        '<span><i class="other-dot"></i><b>1</b> other</span>' +
      '</div>';
    }
    if (specimen.id === "B") {
      return '<div class="seed-counts endpoint-seed-counts">' +
        '<span><i class="emberfruit-dot"></i><b>99</b> spreading</span>' +
        '<span><i class="other-dot"></i><b>1</b> other</span>' +
      '</div>';
    }
    return '<div class="seed-counts">' +
      '<span><i class="emberfruit-dot"></i><b>' + specimen.emberfruit_percent + '</b> spreading</span>' +
      '<span><i class="nutseed-dot"></i><b>' + specimen.crimson_nutseed_percent + '</b> storage</span>' +
    '</div>';
  }

  function endpointPurpose(specimen) {
    if (specimen.id === "A") return "Store nutseeds underground; forgotten seeds can sprout and replenish local plants.";
    if (specimen.id === "B") return "Spread emberfruit seeds into new areas, where new growth stabilizes soil after floods.";
    return "";
  }

  function dnaEvidence(specimen, className) {
    return '<div class="' + className + ' dna-card-evidence"><span>DNA compared with Marsh Rellen</span>' +
      '<div class="dna-values"><strong>' + specimen.dna_difference_percent.toFixed(2) + '% different</strong>' +
      '<small>' + dnaSamePercent(specimen) + '% the same</small></div></div>';
  }

  function purposeEvidence(specimen, className) {
    return '<div class="' + className + ' ecology-card-evidence"><span>Purpose evidence (of 100 traces)</span>' +
      seedCounts(specimen) + '</div>';
  }

  function endpointPurposeSummary(specimen) {
    return '<div class="endpoint-summary endpoint-purpose"><span>Purpose evidence: 100 traces</span><strong>' +
      escapeHtml(endpointPurpose(specimen)) + '</strong>' + seedCounts(specimen) + '</div>';
  }

  function endpointDnaSummary(specimen) {
    return dnaEvidence(specimen, "endpoint-summary endpoint-dna");
  }

  function orderedEvidence(specimen, order, endpointSummary) {
    const purpose = endpointSummary
      ? endpointPurposeSummary(specimen)
      : purposeEvidence(specimen, "card-evidence");
    const dna = endpointSummary
      ? endpointDnaSummary(specimen)
      : dnaEvidence(specimen, "card-evidence");
    return order === "purpose_first" ? purpose + dna : dna + purpose;
  }

  function specimenCard(specimen, options) {
    const settings = options || {};
    const highlighted = Boolean(settings.highlightFocal && specimen.focal);
    const classes = [
      "fossil-card",
      "fossil-" + specimen.id.toLowerCase(),
      specimen.endpoint ? "endpoint-card" : "candidate-card"
    ];
    if (highlighted) classes.push("focal-card");
    if (settings.contextClass) classes.push(settings.contextClass);
    if (settings.showEvidence === false) classes.push("identity-card");
    if (settings.showEndpointSummary) classes.push("summary-card");

    const tag = "article";
    const attrs = highlighted ? ' aria-label="Sample you will evaluate: ' + escapeHtml(specimen.label) + '"' : '';
    const status = specimen.known_species
      ? '<span class="species-status known-status">Known species</span>'
      : (highlighted
        ? '<span class="species-status focal-status">Sample you will evaluate</span>'
        : '<span class="species-status discovery-status">Not yet classified</span>');

    return '<' + tag + ' class="' + classes.join(" ") + '"' + attrs + '>' +
      (highlighted ? '<span class="focal-mark" aria-hidden="true">Evaluate</span>' : '') +
      '<header><span class="fossil-label">' + escapeHtml(specimen.label) + '</span>' + status + '</header>' +
      '<span class="fossil-age">' + formatAge(specimen.age_years) + '</span>' +
      '<div class="specimen-window"><img src="' + escapeHtml(specimen.specimen_image) +
      '" alt="Representative Rellen fossil from this sample."></div>' +
      (settings.showEndpointSummary ? orderedEvidence(specimen, settings.evidenceOrder, true) : '') +
      (settings.showEvidence === false ? '' : orderedEvidence(specimen, settings.evidenceOrder, false)) +
      '</' + tag + '>';
  }

  function dnaLesson(number) {
    return '<section class="evidence-lesson dna-lesson"><div class="lesson-title"><span>' + number + '</span><h2>DNA comparison with the Marsh Rellen</h2></div>' +
        '<p>Researchers compared the same DNA locations in every sample. The percentage shows how many differed from the Marsh Rellen sample. Higher percentages mean more genetic change.</p>' +
        '<div class="dna-scale" role="img" aria-label="The Marsh Rellen is 0.00 percent different and 100.00 percent the same as itself. The Ember Rellen is 0.33 percent different and 99.67 percent the same as the Marsh Rellen."><span><strong>Marsh Rellen</strong><b>0.00% different</b><small>100.00% the same</small></span><i aria-hidden="true"></i><span><strong>Ember Rellen</strong><b>0.33% different</b><small>99.67% the same</small></span></div>' +
        '<p class="example-note"><strong>For scale:</strong> 0.03% different means 99.97% the same—about 3 of every 10,000 compared DNA locations differ.</p></section>';
  }

  function purposeLesson(number) {
    return '<section class="evidence-lesson seed-lesson"><div class="lesson-title"><span>' + number + '</span><h2>Purpose in the environment</h2></div>' +
        '<p class="purpose-definition">Researchers compared each Rellen population’s purpose—the job it performed in its environment—using the same types of preserved activity traces. The numbers show how many of 100 traces support each purpose. Higher numbers mean stronger evidence for that purpose.</p>' +
        '<div class="seed-examples purpose-examples"><div><i class="emberfruit-swatch"></i><span><strong>Emberfruit-spreading purpose</strong>Spread emberfruit seeds into new areas, where new growth stabilizes soil after floods.</span></div>' +
          '<div><i class="nutseed-swatch"></i><span><strong>Nutseed-storage purpose</strong>Store nutseeds underground; forgotten seeds can sprout and replenish local plants.</span></div></div>' +
        '<div class="purpose-count-example" aria-label="Example from one fossil sample: 65 of 100 traces support emberfruit spreading and 35 of 100 traces support nutseed storage">' +
          '<span class="purpose-example-heading">Example from one fossil sample</span>' +
          '<div><i class="emberfruit-dot"></i><span>Emberfruit spreading</span><strong>65 of 100 traces</strong></div>' +
          '<div><i class="nutseed-dot"></i><span>Nutseed storage</span><strong>35 of 100 traces</strong></div></div></section>' +
    '';
  }

  function evidenceLessons(order) {
    const lessons = order === "purpose_first"
      ? [purposeLesson(1), dnaLesson(2)]
      : [dnaLesson(1), purposeLesson(2)];
    return '<div class="evidence-lessons">' + lessons.join("") + '</div>';
  }

  function evidenceReminder(order) {
    const dna = '<div><h3>DNA compared with Marsh Rellen</h3>' +
      '<p>Each card shows the same comparison in two ways: the percentage of DNA locations that are different and the percentage that are the same.</p></div>';
    const purpose = '<div><h3>Purpose evidence</h3><p>The numbers show how many of 100 preserved activity traces support each purpose. Forgotten stored nutseeds can replenish local plants; emberfruit seeds spread into new areas can produce growth that stabilizes soil after floods.</p></div>';
    const ordered = order === "purpose_first" ? purpose + dna : dna + purpose;
    return '<div class="evidence-modal" data-evidence-modal hidden>' +
      '<section class="evidence-dialog" role="dialog" aria-modal="true" aria-labelledby="evidence-dialog-title">' +
        '<div class="dialog-heading"><h2 id="evidence-dialog-title">' + escapeHtml(comparisonTitle(order)) + ' on each card</h2>' +
          '<button type="button" class="dialog-close" data-close-evidence aria-label="Close evidence definitions">×</button></div>' +
        '<div class="dialog-evidence">' + ordered + '</div>' +
        '<button type="button" class="primary-button dialog-done" data-close-evidence>Return to the fossils</button>' +
      '</section></div>';
  }

  class FossilSpeciationTrialPlugin {
    static info = {
      name: "fossil-speciation-single-trial",
      version: "14.0.0",
      parameters: {},
      data: {}
    };

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement) {
      this.root = displayElement;
      this.conditionId = FP.Stimuli.conditionFromUrl();
      this.evidenceOrder = FP.Stimuli.evidenceOrderFromUrl();
      this.sequence = FP.Stimuli.buildSequence(this.conditionId);
      this.focal = this.sequence.find((item) => item.focal);
      this.participant = FP.Data.participantRecord(this.conditionId, this.evidenceOrder);
      this.introStartedAt = performance.now();
      this.endpointSpeciesRt = null;
      this.evidenceStartedAt = null;
      this.evidenceIntroRt = null;
      this.endpointIntroRt = null;
      this.sequenceStartedAt = null;
      this.sequenceContextRt = null;
      this.ratingStartedAt = null;
      this.ratingFirstResponseRt = null;
      this.ratingRt = null;
      this.rating = null;
      this.ratingHistory = [];
      this.explanationStartedAt = null;
      this.draftExplanation = "";
      window.fossilPilotApp = this;
      window.fossilPilotParticipant = this.participant;
      this.renderEndpointIntroduction();
    }

    shell(content, step) {
      return '<main class="fossil-study" data-step="' + step + '">' + content + '</main>';
    }

    renderEndpointIntroduction() {
      const marsh = this.sequence[0];
      const ember = this.sequence[this.sequence.length - 1];
      const differenceSentence = this.evidenceOrder === "purpose_first"
        ? 'The fossils look similar, but the two species had <strong>different purposes in their environments</strong> and <strong>different DNA</strong>.'
        : 'The fossils look similar, but the two species had <strong>different DNA</strong> and <strong>different purposes in their environments</strong>.';

      this.root.innerHTML = this.shell(
        '<section class="trial-panel intro-stage">' + progress(1, "Meet the known species") +
          '<div class="intro-heading"><h1>First, meet the two known Rellen species</h1>' +
            '<p>The <strong>Ember Rellen</strong> evolved from the <strong>Marsh Rellen</strong>. Scientists have now found four fossil samples from populations that lived between them.</p>' +
            '<p class="purpose-intro">' + differenceSentence + '</p>' +
            '<div class="task-preview"><strong>Your task</strong><span>Rate the extent to which one fossil sample is an Ember Rellen, then explain your judgment.</span></div></div>' +
          '<div class="intro-sequence">' + specimenCard(marsh, { contextClass: "intro-card", showEvidence: false, showEndpointSummary: true, evidenceOrder: this.evidenceOrder }) +
            '<div class="evolution-connector" aria-label="The Marsh Rellen evolved into the Ember Rellen"><span>Evolved over<br>many generations</span><i aria-hidden="true">→</i></div>' +
            specimenCard(ember, { contextClass: "intro-card", showEvidence: false, showEndpointSummary: true, evidenceOrder: this.evidenceOrder }) + '</div>' +
          '<footer class="trial-footer intro-footer"><span>Next, learn how scientists compared ' + escapeHtml(comparisonPhrase(this.evidenceOrder)) + '.</span>' +
            '<button class="primary-button" type="button" data-explain-evidence>Learn about ' + escapeHtml(comparisonPhrase(this.evidenceOrder)) + ' <span aria-hidden="true">→</span></button></footer>' +
        '</section>',
        1
      );

      window.scrollTo(0, 0);
      this.root.querySelector("[data-explain-evidence]").addEventListener("click", () => {
        this.endpointSpeciesRt = Math.round(performance.now() - this.introStartedAt);
        this.evidenceStartedAt = performance.now();
        this.renderEvidenceIntroduction();
      });
    }

    renderEvidenceIntroduction() {
      this.root.innerHTML = this.shell(
        '<section class="trial-panel evidence-stage">' + progress(2, "Understand the evidence") +
          '<div class="evidence-heading"><h1>How researchers compared ' + escapeHtml(comparisonPhrase(this.evidenceOrder)) + '</h1>' +
            '<p>Each card summarizes one fossil sample representing a Rellen population from one frozen sediment layer.</p></div>' +
          evidenceLessons(this.evidenceOrder) +
          '<footer class="trial-footer evidence-footer"><span>Next, examine the full fossil sequence and the sample you will evaluate.</span>' +
            '<button class="primary-button" type="button" data-show-fossils>See all six samples <span aria-hidden="true">→</span></button></footer>' +
        '</section>',
        2
      );

      window.scrollTo(0, 0);
      this.root.querySelector("[data-show-fossils]").addEventListener("click", () => {
        this.evidenceIntroRt = Math.round(performance.now() - this.evidenceStartedAt);
        this.endpointIntroRt = Math.round(performance.now() - this.introStartedAt);
        this.renderSequence(true);
      });
    }

    renderSequence(animate) {
      const cards = this.sequence.map((specimen) => specimenCard(specimen, {
        highlightFocal: true,
        evidenceOrder: this.evidenceOrder
      })).join("");
      const ratingStatus = this.rating == null
        ? '<div><strong>Next: rate ' + escapeHtml(this.focal.label) + '</strong><small>You are not choosing among the six samples.</small></div>'
        : '<div><strong>Current rating: ' + this.rating + ' out of 100</strong><small>You can return to the rating and change it.</small></div>';

      this.root.innerHTML = this.shell(
        '<section class="trial-panel selection-stage sequence-stage ' + (animate ? "sequence-transition" : "transition-complete") + '">' + progress(3, "Examine the sequence") +
          '<div class="question-heading"><h1>Examine the full fossil sequence</h1>' +
            '<p>The four new samples lived between the two known species. Use the full sequence as context. <strong>' + escapeHtml(this.focal.label) + ' is the sample you will evaluate.</strong></p>' +
            '<button class="evidence-reminder-button" type="button" data-review-evidence>Review ' + escapeHtml(comparisonPhrase(this.evidenceOrder)) + '</button></div>' +
          '<div class="sequence-wrap"><div class="time-arrow"><span>Older</span><i></i><span>More recent</span></div>' +
            '<div class="fossil-sequence">' + cards + '</div>' +
            '<span class="sr-only" aria-live="polite">' + escapeHtml(this.focal.label) + ' is the sample you will evaluate.</span></div>' +
          evidenceReminder(this.evidenceOrder) +
          '<footer class="trial-footer">' + ratingStatus +
            '<button class="primary-button" type="button" data-rate-fossil>' + (this.rating == null ? "Rate this sample" : "Return to rating") + ' <span aria-hidden="true">→</span></button></footer>' +
        '</section>',
        3
      );

      window.scrollTo(0, 0);
      this.bindEvidenceReminder();
      this.root.querySelector("[data-rate-fossil]").addEventListener("click", () => {
        if (this.sequenceContextRt == null && this.sequenceStartedAt != null) {
          this.sequenceContextRt = Math.round(performance.now() - this.sequenceStartedAt);
        }
        this.renderRating();
      });
      if (animate) this.runSequenceTransition();
      else if (this.sequenceStartedAt == null) this.sequenceStartedAt = performance.now();
    }

    runSequenceTransition() {
      const stage = this.root.querySelector(".sequence-transition");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { stage.classList.add("transition-ready"); });
      });
      window.setTimeout(() => {
        stage.classList.remove("sequence-transition");
        stage.classList.add("transition-complete");
        if (this.sequenceStartedAt == null) this.sequenceStartedAt = performance.now();
      }, reducedMotion ? 0 : 700);
    }

    bindEvidenceReminder() {
      const modal = this.root.querySelector("[data-evidence-modal]");
      const reviewButton = this.root.querySelector("[data-review-evidence]");
      let returnFocus = null;
      const closeModal = () => {
        if (modal.hidden) return;
        modal.hidden = true;
        if (returnFocus) returnFocus.focus({ preventScroll: true });
      };
      const openModal = () => {
        returnFocus = document.activeElement;
        modal.hidden = false;
        modal.querySelector("[data-close-evidence]").focus({ preventScroll: true });
      };
      reviewButton.addEventListener("click", openModal);
      modal.querySelectorAll("[data-close-evidence]").forEach((button) => button.addEventListener("click", closeModal));
      modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
      modal.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeModal();
        }
      });
    }

    renderRating() {
      if (this.ratingStartedAt == null) this.ratingStartedAt = performance.now();
      const marsh = this.sequence[0];
      const ember = this.sequence[this.sequence.length - 1];
      const answered = this.rating != null;
      const sliderValue = answered ? this.rating : 50;
      const ratingStatus = answered
        ? '<span class="rating-ready"><i aria-hidden="true">✓</i>Rating: <strong>' + this.rating + ' out of 100</strong></span>'
        : '<span class="rating-pending">Move the slider to give your answer.</span>';

      this.root.innerHTML = this.shell(
        '<section class="trial-panel rating-stage">' + progress(4, "Rate the fossil") +
          '<div class="explanation-heading rating-heading"><div><h1>Evaluate ' + escapeHtml(this.focal.label) + '</h1>' +
            '<p>Consider its ' + escapeHtml(comparisonPhrase(this.evidenceOrder)) + ' in the context of the full sequence.</p></div>' +
            '<button type="button" class="text-button" data-review-sequence>← Review the full sequence</button></div>' +
          '<div class="rating-layout"><aside class="rating-comparison"><h2>Compare with the two known species</h2>' +
            '<div class="rating-reference-cards">' +
              specimenCard(marsh, { contextClass: "rating-reference-card", showEvidence: false, showEndpointSummary: true, evidenceOrder: this.evidenceOrder }) +
              specimenCard(this.focal, { highlightFocal: true, contextClass: "rating-card", evidenceOrder: this.evidenceOrder }) +
              specimenCard(ember, { contextClass: "rating-reference-card", showEvidence: false, showEndpointSummary: true, evidenceOrder: this.evidenceOrder }) +
            '</div></aside>' +
            '<section class="rating-form" aria-labelledby="rating-question"><h2 id="rating-question">To what extent do you think this fossil sample is an Ember Rellen?</h2>' +
              '<p>Move the slider to give an answer from 0 to 100.</p>' +
              '<output class="rating-output ' + (answered ? "answered" : "") + '" data-rating-output for="new-species-rating">' + (answered ? this.rating : "—") + '</output>' +
              '<input class="new-species-slider ' + (answered ? "" : "unanswered") + '" id="new-species-rating" type="range" min="0" max="100" step="1" value="' + sliderValue + '" aria-labelledby="rating-question" aria-valuetext="' + (answered ? this.rating + ' out of 100' : 'No response yet') + '">' +
              '<div class="rating-anchors" aria-hidden="true"><span><b>0</b>Not at all</span><span><b>50</b>Somewhat</span><span><b>100</b>Completely</span></div>' +
            '</section></div>' +
          '<footer class="trial-footer rating-footer"><div data-rating-status>' + ratingStatus + '</div>' +
            '<button class="primary-button" type="button" data-explain-rating ' + (answered ? "" : "disabled") + '>Explain this rating <span aria-hidden="true">→</span></button></footer>' +
        '</section>',
        4
      );

      window.scrollTo(0, 0);
      const slider = this.root.querySelector("#new-species-rating");
      const output = this.root.querySelector("[data-rating-output]");
      const status = this.root.querySelector("[data-rating-status]");
      const continueButton = this.root.querySelector("[data-explain-rating]");
      const update = () => {
        const value = Number(slider.value);
        if (this.ratingFirstResponseRt == null) {
          this.ratingFirstResponseRt = Math.round(performance.now() - this.ratingStartedAt);
        }
        this.rating = value;
        this.ratingHistory.push({ value: value, elapsed_ms: Math.round(performance.now() - this.ratingStartedAt) });
        slider.classList.remove("unanswered");
        slider.setAttribute("aria-valuetext", value + " out of 100");
        output.textContent = value;
        output.classList.add("answered");
        status.innerHTML = '<span class="rating-ready"><i aria-hidden="true">✓</i>Rating: <strong>' + value + ' out of 100</strong></span>';
        continueButton.disabled = false;
      };
      slider.addEventListener("input", update);
      this.root.querySelector("[data-review-sequence]").addEventListener("click", () => this.renderSequence(false));
      continueButton.addEventListener("click", () => {
        if (this.rating == null) return;
        this.ratingRt = Math.round(performance.now() - this.ratingStartedAt);
        this.renderExplanation(this.draftExplanation);
      });
    }

    renderExplanation(preservedText) {
      if (this.rating == null) return;
      this.explanationStartedAt = performance.now();
      const value = preservedText || "";

      this.root.innerHTML = this.shell(
        '<section class="trial-panel explanation-stage">' + progress(5, "Explain your judgment") +
          '<div class="explanation-heading"><div><h1>Explain your rating of ' + this.rating + ' out of 100</h1>' +
            '<p>Your rating indicates the extent to which you think this fossil sample is an Ember Rellen.</p></div>' +
            '<button type="button" class="text-button" data-change-rating>← Review or change rating</button></div>' +
          '<div class="explanation-layout"><aside class="selection-context"><h2>Fossil you evaluated</h2>' +
            specimenCard(this.focal, { highlightFocal: true, contextClass: "explanation-card", evidenceOrder: this.evidenceOrder }) + '</aside>' +
            '<div class="explanation-form"><label for="fossil-explanation">Why did you give this fossil a rating of ' + this.rating + ' out of 100?</label>' +
              '<p>Please explain your judgment in your own words.</p>' +
              '<textarea id="fossil-explanation" rows="8" spellcheck="true" placeholder="Type your explanation here…">' + escapeHtml(value) + '</textarea>' +
              '<div class="response-meta"><span data-character-count>' + value.trim().length + ' / ' + C.EXPLANATION_MINIMUM_CHARACTERS + ' minimum</span></div></div></div>' +
          '<footer class="trial-footer explanation-footer"><span class="rating-ready"><i aria-hidden="true">✓</i>Rating: <strong>' + this.rating + ' out of 100</strong></span>' +
            '<button class="primary-button" type="button" data-submit disabled>Submit judgment <span aria-hidden="true">→</span></button></footer>' +
        '</section>',
        5
      );

      window.scrollTo(0, 0);
      const textarea = this.root.querySelector("#fossil-explanation");
      const submit = this.root.querySelector("[data-submit]");
      const counter = this.root.querySelector("[data-character-count]");
      const update = () => {
        this.draftExplanation = textarea.value;
        const length = textarea.value.trim().length;
        counter.textContent = length + " / " + C.EXPLANATION_MINIMUM_CHARACTERS + " minimum";
        counter.classList.toggle("minimum-met", length >= C.EXPLANATION_MINIMUM_CHARACTERS);
        submit.disabled = length < C.EXPLANATION_MINIMUM_CHARACTERS;
      };
      textarea.addEventListener("input", update);
      this.root.querySelector("[data-change-rating]").addEventListener("click", () => this.renderRating());
      submit.addEventListener("click", () => this.submit(textarea.value));
      update();
      textarea.focus({ preventScroll: true });
    }

    submit(explanation) {
      const focalIndex = this.sequence.findIndex((item) => item.focal);
      const previous = this.sequence[focalIndex - 1];
      const trialData = Object.assign({}, this.participant, {
        trial_role: "response",
        measure: "species_membership_extent",
        item_id: "focal_fossil_F2",
        condition_assignment_source: window.explanationLab && window.explanationLab.launch
          ? window.explanationLab.launch.assignmentSource
          : "study_fallback",
        condition_randomized: !window.EXPLANATION_LAB_CONDITION && new URLSearchParams(window.location.search).get("condition") == null,
        cue_conflict_design: true,
        endpoint_intro_presented: true,
        endpoint_species_intro_rt_ms: this.endpointSpeciesRt,
        evidence_intro_presented: true,
        evidence_intro_rt_ms: this.evidenceIntroRt,
        endpoint_intro_rt_ms: this.endpointIntroRt,
        endpoint_relationship_explicitly_stated: true,
        endpoint_visible_similarity_stated: true,
        frozen_sediment_context_presented: true,
        population_sample_unit_presented: true,
        dna_definition_presented: true,
        ecological_record_definition_presented: true,
        purpose_explicitly_stated: true,
        purpose_definition_presented: true,
        purpose_framing_version: "explicit_environmental_purpose_v6_parallel_ecological_roles",
        purpose_evidence_label_presented: true,
        purpose_bar_presented: false,
        endpoint_noise_label_presented: true,
        ember_endpoint_spreading_percent: 99,
        ember_endpoint_other_activity_percent: 1,
        marsh_endpoint_storage_percent: 99,
        marsh_endpoint_other_activity_percent: 1,
        ember_endpoint_dna_difference_percent: 0.33,
        evidence_order: this.evidenceOrder,
        evidence_order_randomized: new URLSearchParams(window.location.search).get("order") == null,
        dna_similarity_and_difference_presented: true,
        ecological_trace_denominator: 100,
        ecological_evidence_type: "preserved_activity_traces_unspecified",
        full_sequence_context_presented: true,
        rating_screen_endpoint_contrast_presented: true,
        intermediate_reveal_simultaneous: true,
        visual_sequence_version: C.VISUAL_SEQUENCE_VERSION,
        focal_sample_highlighted: true,
        focal_fossil_id: this.focal.id,
        focal_fossil_label: this.focal.label,
        focal_fossil_position: focalIndex,
        focal_fossil_age_years: this.focal.age_years,
        focal_fossil_dna_difference_percent: this.focal.dna_difference_percent,
        focal_fossil_dna_similarity_percent: Number(dnaSamePercent(this.focal)),
        focal_fossil_spreading_percent: this.focal.emberfruit_percent,
        focal_fossil_storage_percent: this.focal.crimson_nutseed_percent,
        preceding_fossil_id: previous.id,
        preceding_fossil_dna_difference_percent: previous.dna_difference_percent,
        preceding_fossil_spreading_percent: previous.emberfruit_percent,
        new_species_extent_rating: this.rating,
        rating_scale_min: 0,
        rating_scale_max: 100,
        rating_scale_step: 1,
        rating_scale_left_anchor: "Not at all",
        rating_scale_midpoint_anchor: "Somewhat",
        rating_scale_right_anchor: "Completely",
        rating_required: true,
        rating_no_preset_response: true,
        rating_question_version: "extent_is_ember_rellen_v2",
        sequence_context_rt_ms: this.sequenceContextRt,
        rating_first_response_rt_ms: this.ratingFirstResponseRt,
        rating_rt_ms: this.ratingRt,
        rating_history: JSON.stringify(this.ratingHistory),
        explanation_context_mode: "focal_card_and_locked_rating",
        explanation_prompt_version: "explain_extent_rating_v1",
        progress_step_count: 5,
        evidence_reminder_available: true,
        explanation: explanation.trim(),
        explanation_character_count: explanation.trim().length,
        explanation_rt_ms: Math.round(performance.now() - this.explanationStartedAt),
        completion_timestamp: new Date().toISOString(),
        prototype_single_trial: true
      });
      window.fossilPilotResult = trialData;
      this.jsPsych.finishTrial(trialData);
    }
  }

  window.FossilSpeciationTrialPlugin = FossilSpeciationTrialPlugin;
})();
