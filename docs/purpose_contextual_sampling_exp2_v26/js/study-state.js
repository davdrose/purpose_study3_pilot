(function (global) {
  "use strict";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function blankMission(assignment) {
    return {
      mission_id: assignment.mission_id,
      mission_index: assignment.mission_index,
      species_pair: assignment.species_pair,
      environment: assignment.environment,
      station: assignment.station,
      reference_order: clone(assignment.reference_order),
      profile_order: clone(assignment.profile_order),
      scale_order: clone(assignment.scale_order),
      crossed_direction: assignment.crossed_direction,
      unknown_population_id: assignment.unknown_population_id,
      unknown_biological_kind: assignment.unknown_biological_kind,
      unknown_purpose_kind: assignment.unknown_purpose_kind,
      evidence_check_attempts: 0,
      evidence_check_first_response: null,
      evidence_check_complete: false,
      role_context_revealed: false,
      classification_slider_0_to_100: null,
      classification_probability_left_0_to_100: null,
      classification_probability_right_0_to_100: null,
      classification_confidence_50_to_100: null,
      classification_toward_purpose_0_to_100: null,
      chosen_kind: null,
      classification_strength_0_to_50: null,
      decision_rt_ms: null,
      input_method: null,
      evidence_review_order: [],
      evidence_review_duration_ms: {},
      completed: false
    };
  }

  class ContextualStudyState {
    constructor(runtime, serialized) {
      this.runtime = runtime;
      this.startedAt = performance.now();
      this.lastEventTime = 0;
      this.visible = typeof document === "undefined" ? true : document.visibilityState === "visible";
      const valid = serialized && serialized.version === 26 &&
        serialized.participant?.session_id === runtime.session_id;
      this.data = valid ? serialized : {
        version: 26,
        participant: {
          participant_id: runtime.participant_id,
          prolific_pid: runtime.prolific_pid,
          prolific_study_id: runtime.prolific_study_id,
          prolific_session_id: runtime.prolific_session_id,
          session_id: runtime.session_id,
          study_version: runtime.study_version,
          schema_version: global.ContextualSamplingConfig.schema_version,
          configuration_version: global.ContextualSamplingConfig.configuration_version,
          experiment_seed: global.ContextualSamplingConfig.experiment_seed,
          assignment_seed: runtime.assignment_seed,
          condition_id: runtime.condition_id,
          assignment_source: runtime.assignment_source,
          role_context: runtime.role_context,
          role_condition: runtime.role_condition,
          evidence_order: clone(runtime.evidence_order),
          species_pair_order: clone(runtime.species_pair_order),
          device_type: null,
          browser: global.navigator?.userAgent || "unknown",
          viewport: null,
          completion_status: "started",
          page_visibility_summary: { hidden_count: 0, hidden_total_ms: 0 }
        },
        missions: runtime.missions.map(blankMission),
        attention_check: {},
        demographics: {},
        page_visibility_changes: [],
        evidence_events: [],
        role_first_revealed_at_ms: null,
        completed: false
      };
      this.hiddenSince = null;
      this.visibilityHandler = () => this.setVisibility(document.visibilityState === "visible");
      if (typeof document !== "undefined") document.addEventListener("visibilitychange", this.visibilityHandler);
    }

    elapsed() {
      return Math.max(this.lastEventTime, Math.round(performance.now() - this.startedAt));
    }

    mission(missionId) {
      const mission = this.data.missions.find((item) => item.mission_id === missionId);
      if (!mission) throw new Error(`Unknown mission ${missionId}.`);
      return mission;
    }

    persist() {
      try {
        global.sessionStorage?.setItem(`contextual_sampling_state_${this.runtime.session_id}`, JSON.stringify(this.data));
      } catch (_) {
        // The jsPsych record remains available if session storage is unavailable.
      }
    }

    setDevice(fields) {
      Object.assign(this.data.participant, fields);
      this.persist();
    }

    setVisibility(visible) {
      if (this.visible === visible) return;
      const now = this.elapsed();
      this.visible = visible;
      this.data.page_visibility_changes.push({ state: visible ? "visible" : "hidden", t_ms: now });
      if (!visible) {
        this.hiddenSince = now;
        this.data.participant.page_visibility_summary.hidden_count += 1;
      } else if (this.hiddenSince !== null) {
        this.data.participant.page_visibility_summary.hidden_total_ms += Math.max(0, now - this.hiddenSince);
        this.hiddenSince = null;
      }
      this.persist();
    }

    recordEvidence(missionId, fields) {
      const row = Object.assign({ mission_id: missionId, timestamp_ms: this.elapsed() }, fields);
      this.data.evidence_events.push(row);
      const mission = this.mission(missionId);
      if (fields.event_type === "reveal") mission.evidence_review_order.push(`${fields.subject_id}:${fields.profile_type}`);
      if (fields.duration_ms !== undefined) {
        const key = `${fields.subject_id}:${fields.profile_type}`;
        mission.evidence_review_duration_ms[key] = (mission.evidence_review_duration_ms[key] || 0) + fields.duration_ms;
      }
      this.persist();
    }

    completeEvidenceCheck(missionId, fields) {
      const mission = this.mission(missionId);
      mission.evidence_check_attempts = fields.attempts;
      mission.evidence_check_first_response = clone(fields.first_response);
      mission.evidence_check_complete = true;
      this.persist();
    }

    revealRole(missionId) {
      const mission = this.mission(missionId);
      mission.role_context_revealed = true;
      if (this.data.role_first_revealed_at_ms === null) this.data.role_first_revealed_at_ms = this.elapsed();
      this.persist();
    }

    finalizeClassification(missionId, fields) {
      const mission = this.mission(missionId);
      if (!mission.role_context_revealed) throw new Error("Classification cannot finish before the research context is revealed.");
      if (!mission.evidence_check_complete) throw new Error("Classification cannot finish before the evidence check.");
      Object.assign(mission, clone(fields), { completed: true });
      this.persist();
    }

    recordAttentionCheck(fields) {
      this.data.attention_check = clone(fields);
      this.persist();
    }

    recordDemographics(fields) {
      this.data.demographics = clone(fields);
      this.persist();
    }

    payload(completed = true) {
      const source = clone(this.data);
      const config = global.ContextualSamplingConfig;
      const participant = source.participant;
      const roleCondition = participant.role_condition ||
        (participant.role_context === "genetics_context" ? "biochemistry" : "ecology");
      const missionComplete = source.missions.every((mission) => mission.completed);
      const fullyCompleted = Boolean(completed && missionComplete);
      const common = {
        participant_id: participant.participant_id,
        prolific_pid: participant.prolific_pid || null,
        prolific_study_id: participant.prolific_study_id || null,
        prolific_session_id: participant.prolific_session_id || null,
        session_id: participant.session_id,
        study_version: participant.study_version,
        schema_version: participant.schema_version,
        configuration_version: participant.configuration_version,
        experiment_seed: participant.experiment_seed,
        condition_id: participant.condition_id,
        assignment_source: participant.assignment_source,
        role_condition: roleCondition,
        role_context: participant.role_context,
        completed: fullyCompleted
      };

      const trialRows = source.missions.map((mission, index) => {
        const purposeScore = mission.classification_toward_purpose_0_to_100;
        const purposeChoice = mission.chosen_kind === mission.unknown_purpose_kind
          ? 1
          : mission.chosen_kind === mission.unknown_biological_kind
            ? 0
            : null;
        const choiceCategory = purposeChoice === 1
          ? "purpose_match"
          : purposeChoice === 0
            ? "biology_match"
            : mission.chosen_kind === "equally_likely"
              ? "midpoint"
              : null;
        const first = mission.evidence_check_first_response || {};
        return Object.assign({}, common, {
          trial_number: index + 1,
          mission_id: mission.mission_id,
          species_pair: mission.species_pair,
          environment: mission.environment,
          station: mission.station,
          population_id: mission.unknown_population_id,
          biological_match_kind: mission.unknown_biological_kind,
          purpose_match_kind: mission.unknown_purpose_kind,
          reference_order: mission.reference_order.join("|"),
          evidence_order: mission.profile_order.join("|"),
          evidence_left_type: mission.profile_order[0],
          evidence_right_type: mission.profile_order[1],
          scale_left_kind: mission.scale_order[0],
          scale_right_kind: mission.scale_order[1],
          purpose_endpoint_side: mission.scale_order[0] === mission.unknown_purpose_kind ? "left" : "right",
          biology_endpoint_side: mission.scale_order[0] === mission.unknown_biological_kind ? "left" : "right",
          crossed_direction: mission.crossed_direction,
          classification_slider_raw_0_to_100: mission.classification_slider_0_to_100,
          purpose_match_rating_0_to_100: purposeScore,
          biology_match_rating_0_to_100: purposeScore === null ? null : 100 - purposeScore,
          purpose_choice_binary: purposeChoice,
          classification_choice_category: choiceCategory,
          midpoint_selected: mission.chosen_kind === "equally_likely",
          chosen_kind: mission.chosen_kind,
          decision_rt_ms: mission.decision_rt_ms,
          input_method: mission.input_method,
          evidence_check_attempts: mission.evidence_check_attempts,
          first_biology_check_response: first.biology_match || null,
          first_purpose_check_response: first.purpose_match || null,
          first_biology_check_correct: first.biology_match
            ? first.biology_match === mission.unknown_biological_kind
            : null,
          first_purpose_check_correct: first.purpose_match
            ? first.purpose_match === mission.unknown_purpose_kind
            : null,
          evidence_check_completed: mission.evidence_check_complete,
          trial_completed: mission.completed
        });
      });

      const completedScores = trialRows
        .map((row) => row.purpose_match_rating_0_to_100)
        .filter((value) => Number.isFinite(value));
      const completedChoices = trialRows
        .map((row) => row.purpose_choice_binary)
        .filter((value) => value === 0 || value === 1);
      const mean = (values) => values.length
        ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 1000) / 1000
        : null;
      const attention = source.attention_check || {};
      const demographicsValues = source.demographics || {};
      const demographics = Object.assign({}, common, {
        completed_mission_count: source.missions.filter((mission) => mission.completed).length,
        mean_purpose_match_rating_0_to_100: mean(completedScores),
        purpose_choice_proportion: mean(completedChoices),
        attention_check_response: attention.response || null,
        attention_check_correct: typeof attention.correct === "boolean" ? attention.correct : null,
        feedback: demographicsValues.feedback || null,
        age: demographicsValues.age ?? null,
        gender: demographicsValues.gender || null,
        other_gender: demographicsValues.other_gender || null,
        race: demographicsValues.race || null,
        other_race: demographicsValues.other_race || null,
        ethnicity: demographicsValues.ethnicity || null,
        hidden_count: participant.page_visibility_summary?.hidden_count || 0,
        hidden_total_ms: participant.page_visibility_summary?.hidden_total_ms || 0,
        device_type: participant.device_type || null,
        browser: participant.browser || null,
        viewport_width: participant.viewport?.width || null,
        viewport_height: participant.viewport?.height || null,
        device_pixel_ratio: participant.viewport?.device_pixel_ratio || null,
        coarse_pointer: participant.viewport?.coarse_pointer ?? null
      });
      const participants = trialRows.map((row) => Object.assign({}, row, {
        mean_purpose_match_rating_0_to_100: demographics.mean_purpose_match_rating_0_to_100,
        purpose_choice_proportion: demographics.purpose_choice_proportion,
        attention_check_response: demographics.attention_check_response,
        attention_check_correct: demographics.attention_check_correct,
        feedback: demographics.feedback,
        age: demographics.age,
        gender: demographics.gender,
        other_gender: demographics.other_gender,
        race: demographics.race,
        other_race: demographics.other_race,
        ethnicity: demographics.ethnicity,
        hidden_count: demographics.hidden_count,
        hidden_total_ms: demographics.hidden_total_ms,
        device_type: demographics.device_type,
        viewport_width: demographics.viewport_width,
        viewport_height: demographics.viewport_height
      }));
      const evidenceEvents = source.evidence_events.map((event) => Object.assign({}, common, event));
      const session = Object.assign({}, common, {
        completed_mission_count: demographics.completed_mission_count,
        expected_mission_count: config.pairs.length,
        mean_purpose_match_rating_0_to_100: demographics.mean_purpose_match_rating_0_to_100,
        purpose_choice_proportion: demographics.purpose_choice_proportion,
        attention_check_correct: demographics.attention_check_correct,
        hidden_count: demographics.hidden_count,
        hidden_total_ms: demographics.hidden_total_ms
      });
      const result = {
        session,
        demographics,
        trial: trialRows,
        participants,
        evidence_events: evidenceEvents
      };
      global.__CONTEXTUAL_SAMPLING_SESSION_STATE__ = source;
      return result;
    }

    destroy() {
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", this.visibilityHandler);
    }
  }

  function restoreStudyState(runtime) {
    let serialized = null;
    try {
      const raw = global.sessionStorage?.getItem(`contextual_sampling_state_${runtime.session_id}`);
      if (raw) serialized = JSON.parse(raw);
    } catch (_) {
      serialized = null;
    }
    return new ContextualStudyState(runtime, serialized);
  }

  global.ContextualStudyState = { ContextualStudyState, restoreStudyState, blankMission };
})(typeof window !== "undefined" ? window : globalThis);
