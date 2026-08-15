(function () {
  "use strict";

  const I = window.Interbreeding;
  const C = I.Config;
  const U = I.UnfoldingUI;

  class InterbreedingRegistryPlugin {
    static info = {
      name: "interbreeding-lineage-trial",
      version: "40.0.0",
      parameters: {
        lineage_id: { type: jsPsychModule.ParameterType.STRING, default: "teeth" },
        trial_number: { type: jsPsychModule.ParameterType.INT, default: 1 },
        total_trials: { type: jsPsychModule.ParameterType.INT, default: 4 },
        condition_cell: { type: jsPsychModule.ParameterType.STRING, default: "genetic_early_purpose_early" },
        genetic_timing: { type: jsPsychModule.ParameterType.STRING, default: "early" },
        purpose_timing: { type: jsPsychModule.ParameterType.STRING, default: "early" },
        genetic_acceleration_generation: { type: jsPsychModule.ParameterType.INT, default: 3 },
        purpose_acceleration_generation: { type: jsPsychModule.ParameterType.INT, default: 3 },
        single_trial_preview: { type: jsPsychModule.ParameterType.BOOL, default: false }
      },
      data: {}
    };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement, trial) {
      this.root = displayElement;
      this.assignment = window.interbreedingAssignment || I.Randomization.buildAssignment();
      window.interbreedingAssignment = this.assignment;
      this.data = window.interbreedingStudyData || new I.Data.StudyData(this.jsPsych, this.assignment);
      window.interbreedingStudyData = this.data;
      this.trialNumber = Number(trial && trial.trial_number) || 1;
      this.totalTrials = Number(trial && trial.total_trials) || this.assignment.total_trials || 1;
      this.singleTrialPreview = Boolean(trial && trial.single_trial_preview);
      this.confirmation = null;
      this.justRevealed = null;
      this.continueFeedback = null;
      this.continueTimer = null;
      this.trialConfig = Object.freeze({
        condition_cell: trial.condition_cell,
        genetic_timing: trial.genetic_timing,
        purpose_timing: trial.purpose_timing,
        genetic_acceleration_generation: Number(trial.genetic_acceleration_generation),
        purpose_acceleration_generation: Number(trial.purpose_acceleration_generation)
      });
      const configuredCondition = C.CONDITION_CELLS[this.trialConfig.condition_cell];
      if (!configuredCondition || configuredCondition.genetic_timing !== this.trialConfig.genetic_timing || configuredCondition.purpose_timing !== this.trialConfig.purpose_timing) {
        throw new Error("Trial parameters do not match a configured DNA-by-purpose condition cell.");
      }
      const lineage = I.Stimuli.lineageFor((trial && trial.lineage_id) || C.DEFAULT_LINEAGE_ID);
      document.title = (this.singleTrialPreview ? "Preview" : "Population " + this.trialNumber + " of " + this.totalTrials) + " · " + lineage.trialTitle;
      const trajectory = I.Trajectories.build(this.trialConfig.genetic_timing, this.trialConfig.purpose_timing);
      const trialAssignment = Object.assign({}, this.assignment, this.trialConfig);
      this.state = new I.SpeciesTree.LineageState(lineage, trajectory, trialAssignment, this.trialNumber);
      this.state.reveal(0);
      this.writeEvent("lineage_started", {
        lineage_id: lineage.id,
        trial_number: this.trialNumber,
        total_trials: this.totalTrials,
        genetic_trajectory: this.trialConfig.genetic_timing,
        purpose_trajectory: this.trialConfig.purpose_timing,
        trait_trajectory: C.TRAIT_TRAJECTORY.join(","),
        fixed_terminal_generation: 7,
        progressive_axis_disclosure: true,
        prior_generation_positions_fixed: true,
        overlap_encoding: "equal_weight_symmetric_split_tracks_with_compound_marker",
        evidence_scale_type: "shared_standardized_qualitative_strength",
        evidence_values_visible: false,
        numeric_cutoff_presented: false,
        evidence_trajectories_matched: true,
        origin_label: "No evidence of change",
        current_evidence_summaries_visible: true,
        trait_scale_id: lineage.traitScaleId,
        trait_scale_normalized: true,
        trait_label: lineage.traitLabel,
        trait_direction: lineage.traitDirectionDescription,
        trait_calibration_contract: C.TRAIT_CALIBRATION_METHOD,
        trait_calibration_method: lineage.traitCalibrationMethod,
        trait_changed_visual_property: lineage.traitChangedVisualProperty,
        trait_parameters_by_generation: lineage.traitLevels.map(function (level) { return I.TraitScales.definitionFor(lineage.traitScaleId).parameters(level); }),
        endpoint_labels_visible: false,
        progressive_trait_band: true
      });
      window.interbreedingApp = this;
      this.showWorkspace();
    }

    trialContext() {
      return {
        condition_cell: this.trialConfig.condition_cell,
        genetic_timing: this.trialConfig.genetic_timing,
        purpose_timing: this.trialConfig.purpose_timing,
        genetic_acceleration_generation: this.trialConfig.genetic_acceleration_generation,
        purpose_acceleration_generation: this.trialConfig.purpose_acceleration_generation
      };
    }

    writeEvent(type, row) {
      return this.data.write(type, Object.assign(this.trialContext(), row || {}));
    }

    showWorkspace() {
      this.root.innerHTML = U.workspace({
        lineage: this.state.lineage,
        trajectory: this.state.trajectory,
        state: this.state,
        justRevealed: this.justRevealed,
        confirmation: this.confirmation,
        continueFeedback: this.continueFeedback,
        trialNumber: this.trialNumber,
        totalTrials: this.totalTrials,
        singleTrialPreview: this.singleTrialPreview,
        conditionCell: this.trialConfig.condition_cell,
        evidenceOrder: this.assignment.evidence_intro_order
      });
      this.justRevealed = null;
      this.bindWorkspace();
    }

    bindWorkspace() {
      this.root.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", () => this.handleAction(button.dataset.action));
      });
      const cancel = this.root.querySelector("[data-cancel-confirmation]");
      if (cancel) cancel.addEventListener("click", () => this.cancelConfirmation());
      const confirm = this.root.querySelector("[data-confirm-judgment]");
      if (confirm) confirm.addEventListener("click", () => this.confirmJudgment());
      const advance = this.root.querySelector("[data-advance-trial]");
      if (advance) advance.addEventListener("click", () => this.advanceTrial());
    }

    handleAction(action) {
      if (this.continueFeedback) return;
      const generation = this.state.maxRevealed;
      if (action === "branch" && generation === 0) return;
      if (action === "branch") {
        this.state.previewBranch(generation);
        this.confirmation = { type: "branch", generation: generation, startedAt: performance.now() };
        this.writeEvent("branch_previewed", { lineage_id: this.state.lineage.id, trial_number: this.trialNumber, generation: generation });
        this.showWorkspace();
        return;
      }
      if (generation === 7) {
        this.confirmation = { type: "no_species", generation: 7, startedAt: performance.now() };
        this.showWorkspace();
        return;
      }
      this.state.continueGeneration(generation);
      if (generation === 0) {
        this.writeEvent("baseline_continue", { lineage_id: this.state.lineage.id, trial_number: this.trialNumber, generation: 0, categorization_judgment: false });
        this.state.reveal(1);
        this.justRevealed = 1;
        this.showWorkspace();
        return;
      }
      this.recordCategorization(generation, "continue", false);
      this.continueFeedback = { generation: generation };
      this.showWorkspace();
      this.continueTimer = window.setTimeout(() => {
        if (!this.continueFeedback || this.continueFeedback.generation !== generation || this.state.terminal) return;
        this.state.reveal(generation + 1);
        this.justRevealed = generation + 1;
        this.continueFeedback = null;
        this.continueTimer = null;
        this.showWorkspace();
      }, 650);
    }

    cancelConfirmation() {
      if (!this.confirmation) return;
      if (this.confirmation.type === "branch") {
        this.state.cancelBranch();
        this.writeEvent("branch_preview_canceled", {
          lineage_id: this.state.lineage.id,
          trial_number: this.trialNumber,
          generation: this.confirmation.generation,
          preview_rt: Math.round(performance.now() - this.confirmation.startedAt),
          cumulative_cancel_count: this.state.branchCancelCount
        });
      }
      this.confirmation = null;
      this.showWorkspace();
    }

    confirmJudgment() {
      if (!this.confirmation) return;
      const generation = this.confirmation.generation;
      const confirmationRt = Math.round(performance.now() - this.confirmation.startedAt);
      if (this.confirmation.type === "branch") {
        this.state.confirmBranch(generation);
        this.recordCategorization(generation, "branch", true, confirmationRt);
      } else {
        this.state.continueGeneration(7);
        this.recordCategorization(7, "continue", true, confirmationRt);
        this.state.confirmNoDistinctSpecies();
      }
      this.confirmation = null;
      this.finalizeLineage();
      this.showWorkspace();
    }

    advanceTrial() {
      if (!this.state.terminal || !this.state.summary) return;
      const terminalGeneration = this.state.confirmedBoundary === null ? this.state.maxRevealed : this.state.confirmedBoundary;
      this.writeEvent("lineage_advanced", {
        lineage_id: this.state.lineage.id,
        trial_number: this.trialNumber,
        terminal_generation: terminalGeneration,
        next_trial_number: this.trialNumber < this.totalTrials ? this.trialNumber + 1 : null
      });
      this.jsPsych.finishTrial({
        lineage_id: this.state.lineage.id,
        trial_number: this.trialNumber,
        total_trials: this.totalTrials,
        condition_cell: this.trialConfig.condition_cell,
        terminal_generation: terminalGeneration,
        distinct_species_started: this.state.confirmedBoundary !== null,
        single_trial_preview: this.singleTrialPreview
      });
    }

    recordCategorization(generation, action, terminal, confirmationRt) {
      const row = this.state.trajectory[generation];
      const view = this.state.viewFor(generation);
      const stored = this.data.addGeneration(Object.assign(this.trialContext(), {
        lineage_id: this.state.lineage.id,
        trial_number: this.trialNumber,
        generation: generation,
        genetic_evidence_score: row.genetic_evidence_score,
        purpose_evidence_score: row.purpose_evidence_score,
        target_feature_normalized_level: C.NORMALIZED_TRAIT_TRAJECTORY[generation],
        trait_scale_id: this.state.lineage.traitScaleId,
        branch_judgment: action === "branch" ? 1 : 0,
        terminal_judgment: Boolean(terminal),
        no_distinct_species_terminal: terminal && action === "continue",
        generation_decision_rt: Math.round(performance.now() - view.startedAt)
      }));
      this.state.generationRows.push(stored);
    }

    finalizeLineage() {
      if (this.state.summary) return;
      const derived = this.state.derivedSummary();
      this.state.generationRows.forEach(function (row) {
        row.final_boundary_generation = derived.final_boundary_generation;
        row.final_boundary_at_this_generation = row.generation === derived.final_boundary_generation;
        row.no_new_species = Boolean(derived.no_new_species);
      });
      this.state.summary = this.data.addLineage(Object.assign(this.trialContext(), {
        lineage_id: this.state.lineage.id,
        trial_number: this.trialNumber,
        trait_scale_id: this.state.lineage.traitScaleId,
        trial_rt: Math.round(performance.now() - this.state.startedAt)
      }, derived));
    }
  }

  window.InterbreedingRegistryPlugin = InterbreedingRegistryPlugin;
})();
