(function () {
  "use strict";
  const Config = window.Interbreeding.Config;

  function hashSeed(text) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function seededRandom(seedText) {
    let state = hashSeed(seedText) || 1;
    return function () {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(values, random) {
    const out = values.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      const swap = out[i]; out[i] = out[j]; out[j] = swap;
    }
    return out;
  }

  function readParams() {
    const params = new URLSearchParams(window.location.search);
    const get = function (key) { return params.get(key) || ""; };
    return {
      debug: get("debug") === "1",
      skip_consent: get("skip_consent") === "1",
      submission_test: get("submission_test"),
      mode: get("mode"),
      cell: get("cell"),
      condition_order: get("condition_order"),
      panel_order: get("panel_order"),
      seed: get("seed"),
      lineage: get("lineage") || get("trait"),
      lineage_order: get("lineage_order"),
      prolific_pid: get("PROLIFIC_PID"),
      study_id: get("STUDY_ID"),
      session_id: get("SESSION_ID")
    };
  }

  function warnInvalid(name, value) {
    if (value) console.warn("Interbreeding Pilot: ignored invalid " + name + " override:", value);
  }

  function exactPermutation(value, validValues) {
    const requested = value.split(",");
    return requested.length === validValues.length && requested.every(function (id) { return validValues.indexOf(id) >= 0; }) && new Set(requested).size === validValues.length ? requested : null;
  }

  function moveFirst(values, selected) {
    return [selected].concat(values.filter(function (value) { return value !== selected; }));
  }

  function validateTrialPlan(plan, singleTrialPreview) {
    if (!Array.isArray(plan) || !plan.length) throw new Error("The trial plan cannot be empty.");
    plan.forEach(function (trial, index) {
      if (trial.trial_number !== index + 1) throw new Error("Trial numbers must be sequential.");
      if (Config.LINEAGE_IDS.indexOf(trial.lineage_id) < 0) throw new Error("Unknown lineage in trial plan: " + trial.lineage_id);
      if (!Config.CONDITION_CELLS[trial.condition_cell]) throw new Error("Unknown condition in trial plan: " + trial.condition_cell);
      const condition = Config.CONDITION_CELLS[trial.condition_cell];
      if (trial.genetic_timing !== condition.genetic_timing || trial.purpose_timing !== condition.purpose_timing) throw new Error("Trial timing fields must match the assigned condition cell.");
    });
    if (!singleTrialPreview) {
      if (plan.length !== Config.TRIAL_COUNT) throw new Error("The participant sequence must contain the configured number of trials.");
      if (new Set(plan.map(function (trial) { return trial.lineage_id; })).size !== Config.LINEAGE_IDS.length) throw new Error("Each configured lineage must occur exactly once.");
      if (Config.CONDITION_ASSIGNMENT === "within_participant_complete" && new Set(plan.map(function (trial) { return trial.condition_cell; })).size !== Object.keys(Config.CONDITION_CELLS).length) {
        throw new Error("Each DNA-by-purpose condition must occur exactly once.");
      }
      if (Config.CONDITION_ASSIGNMENT === "between_participant" && plan.length !== 1) {
        throw new Error("The between-participant design must assign exactly one condition and one trial.");
      }
    }
    return true;
  }

  function buildAssignment() {
    const p = readParams();
    const fallbackId = "anon-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
    const assignmentKey = p.prolific_pid || fallbackId;
    const participantId = "p-" + hashSeed(assignmentKey + "|participant-a").toString(16).padStart(8, "0") + hashSeed(assignmentKey + "|participant-b").toString(16).padStart(8, "0");
    const seed = p.seed || [assignmentKey, p.study_id, p.session_id, Config.EXPERIMENT_VERSION].join("|");
    const random = seededRandom(seed);
    const cells = Object.keys(Config.CONDITION_CELLS);
    const lineageAliases = {
      tooth: "teeth", teeth: "teeth", tooth_sharpness: "teeth",
      beak: "beaks", beaks: "beaks", beak_size: "beaks",
      fur: "fur", fur_whiteness: "fur",
      toe: "toes", toes: "toes", toe_hairiness: "toes"
    };
    const legacyCellAliases = {
      bio_early_purpose_early: "genetic_early_purpose_early",
      bio_early_purpose_late: "genetic_early_purpose_late",
      bio_late_purpose_early: "genetic_late_purpose_early",
      bio_late_purpose_late: "genetic_late_purpose_late"
    };
    const singleTrialPreview = p.mode === "single";
    if (p.mode && p.mode !== "single" && p.mode !== "sequence") warnInvalid("mode", p.mode);

    let lineageOrder = shuffle(Config.LINEAGE_IDS, random);
    const requestedLineageOrder = p.lineage_order ? exactPermutation(p.lineage_order, Config.LINEAGE_IDS) : null;
    if (requestedLineageOrder) lineageOrder = requestedLineageOrder;
    else if (p.lineage_order) warnInvalid("lineage_order", p.lineage_order);
    let selectedLineageId = Config.DEFAULT_LINEAGE_ID;
    if (p.lineage) {
      const requestedLineage = lineageAliases[p.lineage] || p.lineage;
      if (Config.LINEAGE_IDS.indexOf(requestedLineage) >= 0) {
        selectedLineageId = requestedLineage;
        if (!singleTrialPreview && !requestedLineageOrder) lineageOrder = moveFirst(lineageOrder, requestedLineage);
      } else warnInvalid("lineage", p.lineage);
    } else if (!singleTrialPreview) selectedLineageId = lineageOrder[0];

    let conditionOrder = shuffle(cells, random);
    const requestedConditionOrder = p.condition_order ? exactPermutation(p.condition_order, cells) : null;
    if (requestedConditionOrder) conditionOrder = requestedConditionOrder;
    else if (p.condition_order) warnInvalid("condition_order", p.condition_order);
    let selectedCell = conditionOrder[0];
    if (p.cell) {
      const requestedCell = legacyCellAliases[p.cell] || p.cell;
      if (cells.indexOf(requestedCell) >= 0) {
        selectedCell = requestedCell;
        if (!singleTrialPreview && !requestedConditionOrder) conditionOrder = moveFirst(conditionOrder, requestedCell);
      } else warnInvalid("cell", p.cell);
    }

    let evidenceIntroOrder = Config.EVIDENCE_INTRO_ORDERS[hashSeed(assignmentKey + "|evidence-order|" + Config.EXPERIMENT_VERSION) % Config.EVIDENCE_INTRO_ORDERS.length];
    const panelAliases = { bio_first: "genetic_first", biological_first: "genetic_first", genetic_first: "genetic_first", purpose_first: "purpose_first" };
    if (p.panel_order) {
      if (panelAliases[p.panel_order]) evidenceIntroOrder = panelAliases[p.panel_order]; else warnInvalid("panel_order", p.panel_order);
    }

    const trialLineages = singleTrialPreview ? [selectedLineageId] : lineageOrder;
    const trialConditions = singleTrialPreview ? [selectedCell] : conditionOrder;
    const trialPlan = trialLineages.map(function (lineageId, index) {
      const cellId = trialConditions[index];
      const condition = Config.CONDITION_CELLS[cellId];
      return Object.freeze({
        trial_number: index + 1,
        total_trials: trialLineages.length,
        lineage_id: lineageId,
        condition_cell: cellId,
        genetic_timing: condition.genetic_timing,
        purpose_timing: condition.purpose_timing,
        genetic_acceleration_generation: condition.genetic_generation,
        purpose_acceleration_generation: condition.purpose_generation
      });
    });
    validateTrialPlan(trialPlan, singleTrialPreview);

    const parentPositions = {};
    Config.LINEAGE_IDS.forEach(function (id) { parentPositions[id] = random() < 0.5 ? "standard" : "reversed"; });
    const firstTrial = trialPlan[0];
    const localHost = window.location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
    const localMode = localHost || p.debug;
    const oneConditionPerParticipant = Config.CONDITION_ASSIGNMENT === "between_participant";
    const assignment = {
      participant_id: participantId,
      prolific_pid: p.prolific_pid || null,
      study_id: p.study_id || null,
      session_id: p.session_id || null,
      seed: seed,
      debug: p.debug,
      local_mode: localMode,
      skip_consent: localMode && p.skip_consent,
      submission_test: localHost && ["success", "failure"].indexOf(p.submission_test) >= 0 ? p.submission_test : null,
      participant_parameters_complete: Boolean(p.prolific_pid && p.study_id && p.session_id),
      sequence_design: Config.DESIGN,
      condition_assignment: Config.CONDITION_ASSIGNMENT,
      single_trial_preview: singleTrialPreview,
      total_trials: trialPlan.length,
      condition_cell: singleTrialPreview || oneConditionPerParticipant ? firstTrial.condition_cell : "complete_2x2_sequence",
      condition_order: trialPlan.map(function (trial) { return trial.condition_cell; }),
      genetic_timing: singleTrialPreview || oneConditionPerParticipant ? firstTrial.genetic_timing : "varies_by_trial",
      purpose_timing: singleTrialPreview || oneConditionPerParticipant ? firstTrial.purpose_timing : "varies_by_trial",
      genetic_acceleration_generation: singleTrialPreview || oneConditionPerParticipant ? firstTrial.genetic_acceleration_generation : null,
      purpose_acceleration_generation: singleTrialPreview || oneConditionPerParticipant ? firstTrial.purpose_acceleration_generation : null,
      purpose_transition_generation: singleTrialPreview || oneConditionPerParticipant ? firstTrial.purpose_acceleration_generation : null,
      evidence_intro_order: evidenceIntroOrder,
      panel_order: evidenceIntroOrder,
      selected_lineage_id: firstTrial.lineage_id,
      lineage_order: trialPlan.map(function (trial) { return trial.lineage_id; }),
      counterbalanced_lineage_order: lineageOrder,
      lineage_override_requested: Boolean(p.lineage || p.lineage_order),
      trial_plan: trialPlan,
      parent_positions: parentPositions,
      random: random,
      shuffle: function (values) { return shuffle(values, random); }
    };
    if (p.debug) console.info("Interbreeding Pilot assignment", JSON.parse(JSON.stringify(assignment, function (key, value) { return typeof value === "function" ? undefined : value; })));
    return assignment;
  }

  window.Interbreeding = window.Interbreeding || {};
  window.Interbreeding.Randomization = { hashSeed: hashSeed, seededRandom: seededRandom, shuffle: shuffle, readParams: readParams, validateTrialPlan: validateTrialPlan, buildAssignment: buildAssignment };
})();
