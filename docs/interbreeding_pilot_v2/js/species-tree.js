(function () {
  "use strict";

  class LineageState {
    constructor(lineage, trajectory, assignment, trialNumber) {
      this.lineage = lineage;
      this.trajectory = trajectory;
      this.assignment = assignment;
      this.trialNumber = trialNumber;
      this.maxRevealed = 0;
      this.selectedGeneration = 0;
      this.decisions = {};
      this.evidenceViews = {};
      this.previewBoundary = null;
      this.confirmedBoundary = null;
      this.noDistinctSpecies = false;
      this.branchCancelCount = 0;
      this.generationRows = [];
      this.startedAt = performance.now();
      this.terminal = false;
      this.summary = null;
    }

    viewFor(generation) {
      if (!this.evidenceViews[generation]) {
        this.evidenceViews[generation] = { genetic: true, purpose: true, bio: true, order: [], startedAt: performance.now() };
      }
      return this.evidenceViews[generation];
    }

    reveal(generation) {
      this.maxRevealed = Math.max(this.maxRevealed, generation);
      this.selectedGeneration = generation;
      this.previewBoundary = null;
      this.viewFor(generation);
    }

    continueGeneration(generation) {
      this.decisions[generation] = "continue";
      this.previewBoundary = null;
    }

    previewBranch(generation) {
      this.previewBoundary = generation;
    }

    cancelBranch() {
      this.previewBoundary = null;
      this.branchCancelCount += 1;
    }

    confirmBranch(generation) {
      this.decisions[generation] = "branch";
      this.previewBoundary = null;
      this.confirmedBoundary = generation;
      this.noDistinctSpecies = false;
      this.terminal = true;
    }

    confirmNoDistinctSpecies() {
      this.confirmedBoundary = null;
      this.noDistinctSpecies = true;
      this.terminal = true;
    }

    derivedSummary() {
      const boundary = this.confirmedBoundary;
      const terminalGeneration = boundary === null ? this.maxRevealed : boundary;
      const retained = boundary === null ? terminalGeneration : Math.max(0, boundary - 1);
      const retainedRow = this.trajectory[retained];
      return {
        final_boundary_generation: boundary,
        no_new_species: this.noDistinctSpecies,
        terminal_generation: terminalGeneration,
        generations_observed: this.maxRevealed + 1,
        confirmed_branch: boundary !== null,
        right_censored_at_g7: this.noDistinctSpecies,
        final_boundary_genetic_evidence: boundary === null ? null : this.trajectory[boundary].genetic_evidence_score,
        final_boundary_purpose_evidence: boundary === null ? null : this.trajectory[boundary].purpose_evidence_score,
        maximum_genetic_evidence_retained_within_species: retainedRow.genetic_evidence_score,
        maximum_purpose_evidence_retained_within_species: retainedRow.purpose_evidence_score,
        maximum_trait_change_retained_within_species: retainedRow.target_feature_level,
        branch_preview_cancel_count: this.branchCancelCount,
        boundary_at_genetic_acceleration: boundary !== null && boundary === this.assignment.genetic_acceleration_generation,
        boundary_at_purpose_acceleration: boundary !== null && boundary === this.assignment.purpose_acceleration_generation,
        boundary_after_genetic_acceleration: boundary !== null && boundary >= this.assignment.genetic_acceleration_generation,
        boundary_after_purpose_acceleration: boundary !== null && boundary >= this.assignment.purpose_acceleration_generation
      };
    }
  }

  window.Interbreeding = window.Interbreeding || {};
  window.Interbreeding.SpeciesTree = { LineageState: LineageState };
})();
