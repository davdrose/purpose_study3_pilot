(function () {
  "use strict";

  const I = window.Interbreeding;

  class InterbreedingLineageIntroductionPlugin {
    static info = {
      name: "interbreeding-lineage-introduction",
      version: "38.0.0",
      parameters: {
        lineage_id: { type: jsPsychModule.ParameterType.STRING, default: "teeth" },
        trial_number: { type: jsPsychModule.ParameterType.INT, default: 1 },
        total_trials: { type: jsPsychModule.ParameterType.INT, default: 4 },
        condition_cell: { type: jsPsychModule.ParameterType.STRING, default: "genetic_early_purpose_early" }
      },
      data: {}
    };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement, trial) {
      this.root = displayElement;
      this.startedAt = performance.now();
      this.data = window.interbreedingStudyData;
      this.trialNumber = Number(trial.trial_number) || 1;
      this.totalTrials = Number(trial.total_trials) || 4;
      this.conditionCell = trial.condition_cell;
      this.lineage = I.Stimuli.lineageFor(trial.lineage_id);
      this.step = 0;
      this.compactOrientation = this.trialNumber > 1;
      this.totalSteps = this.compactOrientation ? 3 : 5;
      this.evidenceOrder = window.interbreedingAssignment.evidence_intro_order;
      document.title = "Population " + this.trialNumber + " of " + this.totalTrials + " · Introduction";
      this.render();
      this.write("lineage_introduction_shown", {
        lineage_id: this.lineage.id,
        trial_number: this.trialNumber,
        total_trials: this.totalTrials,
        condition_cell: this.conditionCell,
        focal_trait: this.lineage.targetFeature,
        trait_label: this.lineage.traitLabel,
        trait_scale_id: this.lineage.traitScaleId,
        generation: 0,
        future_evidence_visible: false,
        irreversible_decision_reminder_shown: false
      });
    }

    write(type, row) {
      if (this.data) this.data.write(type, Object.assign({ lineage_introduction: true }, row || {}));
    }

    render() {
      const first = this.trialNumber === 1;
      const title = first ? "A new population history begins" : "A separate population history begins";
      const text = first
        ? "Researchers have tracked this unfamiliar animal population across generations. Your task is to judge when—if ever—a generation should be classified as the beginning of a distinct species."
        : "This is a new, separate population. Begin again from its own G0 baseline. Your judgment about the previous population does not affect this one.";
      const trait = I.TraitScales.render(this.lineage.traitScaleId, this.lineage.traitLevels[0], { x: 0, y: 0, width: 250, height: 250 });
      const evidencePhrase = this.evidenceOrder === "purpose_first" ? "Purpose evidence, DNA evidence, and trait change" : "DNA evidence, purpose evidence, and trait change";
      const geneticGuide = '<article class="g0-evidence-guide genetic-guide"><span>G0 DNA reference</span><strong>Researchers record this population’s founding DNA.</strong><p>The blue line rises when later generations show stronger evidence of inherited genetic differences from this record.</p></article>';
      const purposeGuide = '<article class="g0-evidence-guide purpose-guide"><span>G0 documented purpose</span><strong>' + this.lineage.purposeRoles.baselineStatement + '</strong><p>The orange line rises when researchers find stronger evidence that the trait serves a different purpose than it served at G0.</p></article>';
      const firstGuide = this.evidenceOrder === "purpose_first" ? purposeGuide : geneticGuide;
      const secondGuide = this.evidenceOrder === "purpose_first" ? geneticGuide : purposeGuide;
      const firstGuideLabel = this.evidenceOrder === "purpose_first" ? "purpose evidence" : "DNA evidence";
      const secondGuideLabel = this.evidenceOrder === "purpose_first" ? "DNA evidence" : "purpose evidence";
      const showFirstGuide = this.compactOrientation ? this.step >= 1 : this.step >= 2;
      const showSecondGuide = this.compactOrientation ? this.step >= 1 : this.step >= 3;
      const finalStep = this.totalSteps - 1;
      const traitPanel = this.step >= 1 ? '<section class="g0-orientation-panel' + (this.step === 1 ? " just-revealed" : "") + '"><div class="g0-trait-preview"><span>G0 · Founding baseline</span><div class="g0-trait-image">' + trait + '</div><div><p>Focal trait</p><h2>' + this.lineage.traitLabel + '</h2></div></div><div class="g0-evidence-guides">' +
        (showFirstGuide ? '<div class="g0-evidence-slot' + (!this.compactOrientation && this.step === 2 ? " just-revealed" : "") + '">' + firstGuide + '</div>' : '<div class="g0-evidence-placeholder" aria-hidden="true"></div>') +
        (showSecondGuide ? '<div class="g0-evidence-slot' + (!this.compactOrientation && this.step === 3 ? " just-revealed" : "") + '">' + secondGuide + '</div>' : '<div class="g0-evidence-placeholder" aria-hidden="true"></div>') +
        '</div></section>' : "";
      const finalRule = '<div class="lineage-intro-final-rule' + (this.step === finalStep ? " just-revealed" : "") + '" role="note"><strong>Make each judgment using only the evidence revealed so far.</strong><span>Continuing permanently records that generation as part of the current species. Choose Begin distinct species at the first generation you judge distinct.</span></div>';
      const nextLabels = this.compactOrientation ? ["Next: G0 baseline", "Next: decision rule"] : ["Next: G0 trait", "Next: " + firstGuideLabel, "Next: " + secondGuideLabel, "Next: decision rule"];
      const actionButton = this.step < this.totalSteps - 1
        ? '<button type="button" class="primary-flow-button lineage-next-button" data-next-lineage-intro>' + nextLabels[this.step] + '</button>'
        : '<button type="button" class="primary-flow-button" data-begin-lineage>Begin population</button>';
      this.root.innerHTML = '<main class="study-flow lineage-introduction-flow" data-lineage-introduction="' + this.trialNumber + '" data-lineage-id="' + this.lineage.id + '" data-lineage-introduction-step="' + (this.step + 1) + '"><section class="lineage-intro-card">' +
        '<header class="lineage-intro-topbar"><span>Population ' + this.trialNumber + ' of ' + this.totalTrials + '</span><strong>New population</strong></header>' +
        '<div class="lineage-intro-content' + (this.step === 0 ? " intro-overview-only" : "") + '"><div class="lineage-intro-copy"><span>Before this population</span><h1>' + title + '</h1><p>' + text + '</p><aside><strong>Start from its own G0.</strong><span>' + evidencePhrase + ' will be shown relative to this founding population.</span></aside></div>' + traitPanel + '</div>' +
        '<footer class="lineage-intro-footer">' + (this.step === finalStep ? finalRule : '<span class="lineage-intro-progress">Part ' + (this.step + 1) + ' of ' + this.totalSteps + '</span>') + actionButton + '</footer>' +
        '</section></main>';
      const button = this.root.querySelector("[data-next-lineage-intro], [data-begin-lineage]");
      button.addEventListener("click", () => this.step < this.totalSteps - 1 ? this.advance() : this.finish());
      button.focus({ preventScroll: true });
    }

    advance() {
      if (this.step >= this.totalSteps - 1) return;
      this.step += 1;
      this.render();
    }

    finish() {
      const rt = Math.round(performance.now() - this.startedAt);
      const row = {
        lineage_id: this.lineage.id,
        trial_number: this.trialNumber,
        total_trials: this.totalTrials,
        condition_cell: this.conditionCell,
        generation: 0,
        orientation_parts_viewed: this.totalSteps,
        irreversible_decision_reminder_shown: true,
        orientation_rt: rt
      };
      this.write("lineage_introduction_completed", row);
      this.jsPsych.finishTrial(Object.assign({ trial_type: "lineage_introduction" }, row));
    }
  }

  window.InterbreedingLineageIntroductionPlugin = InterbreedingLineageIntroductionPlugin;
})();
