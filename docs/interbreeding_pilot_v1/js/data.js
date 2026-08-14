(function () {
  "use strict";

  const Config = window.Interbreeding.Config;

  function nullableText(value) {
    const text = value == null ? "" : String(value).trim();
    return text || null;
  }

  function nullableNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  class StudyData {
    constructor(jsPsych, assignment) {
      this.jsPsych = jsPsych;
      this.assignment = assignment;
      this.generationRows = [];
      this.lineageRows = [];
      this.demographics = {};
      this.summary = null;
      this.consentGiven = false;
      this.startedAt = performance.now();
    }

    /* UI events use this method, but are deliberately not retained or transmitted. */
    write(trialType, row) {
      return Object.assign({ trial_type: trialType }, row || {});
    }

    setConsent(given) {
      this.consentGiven = Boolean(given);
    }

    setDemographics(values) {
      const source = values || {};
      this.demographics = {
        feedback: nullableText(source.feedback),
        confusion_feedback: nullableText(source.confusion_feedback),
        age: nullableNumber(source.age),
        gender: nullableText(source.gender),
        other_gender: nullableText(source.other_gender),
        race: nullableText(source.race),
        other_race: nullableText(source.other_race),
        ethnicity: nullableText(source.ethnicity)
      };
      return this.demographics;
    }

    addGeneration(row) {
      const source = row || {};
      const stored = {
        participant_id: this.assignment.participant_id,
        trial_number: source.trial_number,
        lineage_id: source.lineage_id,
        trait_scale_id: source.trait_scale_id,
        condition_cell: source.condition_cell,
        genetic_timing: source.genetic_timing,
        purpose_timing: source.purpose_timing,
        evidence_order: this.assignment.evidence_intro_order,
        generation: source.generation,
        genetic_evidence_score: source.genetic_evidence_score,
        purpose_evidence_score: source.purpose_evidence_score,
        trait_level_normalized: source.target_feature_normalized_level,
        branch_judgment: source.branch_judgment,
        terminal_judgment: Boolean(source.terminal_judgment),
        no_distinct_species_terminal: Boolean(source.no_distinct_species_terminal),
        decision_rt_ms: source.generation_decision_rt,
        final_boundary_generation: null,
        final_boundary_at_this_generation: false,
        no_new_species: false
      };
      this.generationRows.push(stored);
      return stored;
    }

    addLineage(row) {
      const source = row || {};
      const stored = {
        trial_number: source.trial_number,
        lineage_id: source.lineage_id,
        condition_cell: source.condition_cell,
        trait_scale_id: source.trait_scale_id,
        final_boundary_generation: source.final_boundary_generation,
        no_new_species: Boolean(source.no_new_species),
        terminal_generation: source.terminal_generation,
        final_boundary_genetic_evidence: source.final_boundary_genetic_evidence,
        final_boundary_purpose_evidence: source.final_boundary_purpose_evidence,
        trial_rt_ms: source.trial_rt
      };
      this.lineageRows.push(stored);
      return stored;
    }

    complete(extra) {
      this.summary = Object.assign({
        completed: true,
        lineages_completed: this.lineageRows.length,
        total_duration_ms: Math.round(performance.now() - this.startedAt)
      }, extra || {});
      return this.summary;
    }

    buildPayload() {
      const summary = this.summary || this.complete({ completed: true });
      return {
        demographics: Object.assign({
          participant_id: this.assignment.participant_id,
          prolific_pid: this.assignment.prolific_pid,
          study_id: this.assignment.study_id,
          session_id: this.assignment.session_id,
          experiment_version: Config.EXPERIMENT_VERSION,
          data_schema_version: Config.DATA_SCHEMA_VERSION,
          completed: Boolean(summary.completed),
          consent_given: this.consentGiven,
          evidence_order: this.assignment.evidence_intro_order,
          total_duration_ms: summary.total_duration_ms
        }, this.demographics),
        trial: this.generationRows.map(function (row) { return Object.assign({}, row); }),
        lineage: this.lineageRows.map(function (row) { return Object.assign({}, row); }),
        summary: Object.assign({}, summary)
      };
    }

    package() {
      return this.buildPayload();
    }
  }

  window.Interbreeding = window.Interbreeding || {};
  window.Interbreeding.Data = { StudyData: StudyData };
})();
