(function () {
  "use strict";

  const Config = window.EssenceStudy.Config;

  class StudyData {
    constructor(assignment) {
      this.assignment = assignment;
      this.startedAt = new Date().toISOString();
      this.responses = [];
      this.events = [];
      this.summary = null;
      this.participant = {
        participant_id: assignment.participant_id,
        prolific_pid: assignment.prolific_pid,
        study_id: assignment.study_id,
        session_id: assignment.session_id,
        experiment_version: Config.EXPERIMENT_VERSION,
        data_schema_version: Config.DATA_SCHEMA_VERSION,
        condition: assignment.condition,
        stimulus_order: assignment.stimulus_order.map(function (stimulus) { return stimulus.id; }).join(","),
        start_timestamp: this.startedAt,
        completion_timestamp: null
      };
      this.writeEvent("participant_start", {});
    }

    base() {
      return {
        participant_id: this.participant.participant_id,
        experiment_version: Config.EXPERIMENT_VERSION,
        data_schema_version: Config.DATA_SCHEMA_VERSION,
        condition: this.assignment.condition,
        timestamp: new Date().toISOString()
      };
    }

    writeEvent(eventType, values) {
      const row = Object.assign(this.base(), { event_type: eventType }, values || {});
      this.events.push(row);
      return row;
    }

    writeResponse(values) {
      const row = Object.assign(this.base(), values || {});
      this.responses.push(row);
      this.events.push(Object.assign({ event_type: "response" }, row));
      return row;
    }

    responseFor(exportTag) {
      return this.responses.find(function (row) { return row.data_export_tag === exportTag; }) || null;
    }

    complete(extra) {
      const attention = this.responses.find(function (row) { return row.question_type === "attention_check"; });
      this.participant.completion_timestamp = new Date().toISOString();
      this.summary = Object.assign({}, this.participant, {
        completed: true,
        consented: true,
        response_count: this.responses.length,
        attention_response: attention ? attention.response : null,
        attention_check_1_passed: attention ? Boolean(attention.passed) : null,
        elapsed_seconds: Math.round((Date.now() - Date.parse(this.startedAt)) / 100) / 10
      }, extra || {});
      this.writeEvent("participant_complete", this.summary);
      return this.summary;
    }

    buildPayload() {
      const summary = this.summary || this.complete({ completed: true });
      const attention = this.responses.find(function (row) { return row.question_type === "attention_check"; });
      const general = this.responses.find(function (row) { return row.question_type === "general_binary"; });
      const sex = this.responseFor("sex");
      const age = this.responseFor("age");
      const race = this.responseFor("race");
      const targets = this.responses
        .filter(function (row) { return row.question_type === "target_slider"; })
        .sort(function (first, second) { return first.stimulus_position - second.stimulus_position; });

      const participant = {
        participant_id: this.participant.participant_id,
        prolific_pid: this.participant.prolific_pid,
        study_id: this.participant.study_id,
        session_id: this.participant.session_id,
        study_version: Config.EXPERIMENT_VERSION,
        data_schema_version: Config.DATA_SCHEMA_VERSION,
        completed: Boolean(summary.completed) && targets.length === 8,
        condition: this.assignment.condition,
        attention_response: attention ? attention.response : null,
        attention_passed: attention ? Boolean(attention.passed) : null,
        all_animals_response: general ? general.response : null,
        sex: sex ? sex.response : null,
        age: age ? age.response_value : null,
        race: race ? race.response : null,
        stimulus_order: this.participant.stimulus_order,
        start_timestamp: this.participant.start_timestamp,
        completion_timestamp: this.participant.completion_timestamp,
        elapsed_seconds: summary.elapsed_seconds
      };

      const items = targets.map(function (row) {
        return {
          participant_id: participant.participant_id,
          prolific_pid: participant.prolific_pid,
          study_version: participant.study_version,
          completed: participant.completed,
          trial_number: row.stimulus_position,
          item_name: row.stimulus_id,
          item_type: row.stimulus_category,
          condition: row.condition,
          rating: row.response_value
        };
      });

      return { participant: participant, items: items };
    }

    package() {
      return this.buildPayload();
    }
  }

  window.EssenceStudy = window.EssenceStudy || {};
  window.EssenceStudy.Data = { StudyData: StudyData };
})();
