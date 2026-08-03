(function (global) {
  "use strict";

  function stableHash(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function normalizeBoolean(value) {
    return ["1", "true", "yes"].includes(String(value || "").toLowerCase());
  }

  function safeId(value, label) {
    if (!value) return null;
    if (!/^[A-Za-z0-9._:-]{1,160}$/.test(value)) throw new Error(`Invalid ${label}.`);
    return value;
  }

  function persistentDebugId(storage) {
    const key = "contextual_sampling_v26_debug_participant";
    const existing = storage?.getItem(key);
    if (existing) return existing;
    const created = `debug-${stableHash(`${Date.now()}-${global.navigator?.userAgent || "browser"}`).toString(16)}`;
    storage?.setItem(key, created);
    return created;
  }

  function parity(conditionIndex, missionIndex, offset) {
    return ((conditionIndex >> offset) + missionIndex) & 1;
  }

  function createMissionAssignment(config, cell, conditionIndex, missionIndex, assignmentSeed = "") {
    const pairId = cell.species_pair_order[missionIndex];
    const pair = config.pairs.find((item) => item.id === pairId);
    if (!pair) throw new Error(`Unknown pair ${pairId}.`);
    const crossedDirection = (cell.cue_pattern >> missionIndex) & 1;
    const biologicalKind = pair.species[crossedDirection];
    const purposeKind = pair.species[1 - crossedDirection];
    const referenceOrder = parity(conditionIndex, missionIndex, 0)
      ? [pair.species[1], pair.species[0]]
      : [...pair.species];
    const profileOrder = [...cell.evidence_order];
    const scaleOrder = (stableHash(`${assignmentSeed}|scale|${pairId}`) & 1)
      ? [pair.species[1], pair.species[0]]
      : [...pair.species];
    return {
      mission_id: `mission_${missionIndex + 1}`,
      mission_index: missionIndex,
      species_pair: pairId,
      reference_order: referenceOrder,
      profile_order: profileOrder,
      scale_order: scaleOrder,
      crossed_direction: crossedDirection,
      unknown_population_id: pair.population_labels[crossedDirection],
      unknown_asset_id: pair.unknown_asset_id,
      unknown_biological_kind: biologicalKind,
      unknown_purpose_kind: purposeKind,
      unknown_purpose_sequence_asset_ids: [...pair.unknown_purpose_sequence_assets[purposeKind]],
      environment: pair.environment,
      station: pair.station
    };
  }

  function resolveAssignment(options = {}) {
    const config = options.config || global.ContextualSamplingConfig;
    const search = options.search !== undefined ? options.search : (global.location?.search || "");
    const params = new URLSearchParams(search);
    const storage = options.storage !== undefined ? options.storage : global.localStorage;
    const protocol = options.protocol || global.location?.protocol || "https:";
    const debug = normalizeBoolean(params.get("debug")) || protocol === "file:";
    const prolificPid = safeId(params.get("PROLIFIC_PID"), "Prolific participant ID");
    const prolificStudyId = safeId(params.get("STUDY_ID"), "Prolific study ID");
    const prolificSessionId = safeId(params.get("SESSION_ID"), "Prolific session ID");
    const participantId = safeId(
      prolificPid || params.get("participant_id"),
      "participant ID"
    ) || persistentDebugId(storage);
    const suppliedCondition = params.get("CONDITION") || params.get("condition");
    const cellIds = config.condition_table.map((cell) => cell.condition_id);
    if (suppliedCondition && !cellIds.includes(suppliedCondition)) {
      throw new Error(`Invalid CONDITION. Expected ${cellIds[0]} through ${cellIds[cellIds.length - 1]}.`);
    }
    const assignmentSeed = `${participantId}|${config.study_version}|${config.experiment_seed}`;
    const roleParameter = params.get("role_condition");
    const roleMap = {
      ecology: "ecology_context",
      ecologist: "ecology_context",
      biochemistry: "genetics_context",
      biochemist: "genetics_context"
    };
    if (roleParameter && !roleMap[roleParameter]) {
      throw new Error("Invalid role_condition. Expected ecology or biochemistry.");
    }
    const requestedRole = roleParameter ? roleMap[roleParameter] : null;
    let conditionId = suppliedCondition;
    if (!conditionId && requestedRole) {
      const roleCells = config.condition_table.filter((cell) => cell.role_context === requestedRole);
      conditionId = roleCells[stableHash(`${assignmentSeed}|${requestedRole}`) % roleCells.length].condition_id;
    }
    if (!conditionId) conditionId = cellIds[stableHash(assignmentSeed) % cellIds.length];
    const conditionIndex = cellIds.indexOf(conditionId);
    const baseCell = config.condition_table[conditionIndex];
    const forcedRole = debug ? params.get("role") : null;
    let roleContext = baseCell.role_context;
    if (requestedRole) {
      if (suppliedCondition && baseCell.role_context !== requestedRole) {
        throw new Error("CONDITION and role_condition refer to different study conditions.");
      }
      roleContext = requestedRole;
    } else if (forcedRole) {
      const allowed = ["genetics_context", "ecology_context"];
      if (!allowed.includes(forcedRole)) throw new Error("Invalid forced role condition.");
      roleContext = forcedRole;
    }
    const cell = Object.assign({}, baseCell, { role_context: roleContext });
    const missions = cell.species_pair_order.map((_, index) =>
      createMissionAssignment(config, cell, conditionIndex, index, assignmentSeed)
    );
    const sessionId = safeId(prolificSessionId || params.get("session_id"), "session ID") ||
      (global.crypto?.randomUUID ? global.crypto.randomUUID() : `session-${Date.now()}-${stableHash(assignmentSeed)}`);
    const completionUrl = params.get("completion_url");
    if (completionUrl && !/^https:\/\/(app\.prolific\.com|prolific\.com)\//i.test(completionUrl)) {
      throw new Error("The completion URL is not on the allowlist.");
    }
    return {
      participant_id: participantId,
      prolific_pid: prolificPid,
      prolific_study_id: prolificStudyId,
      prolific_session_id: prolificSessionId,
      session_id: sessionId,
      study_version: config.study_version,
      assignment_seed: assignmentSeed,
      condition_id: conditionId,
      assignment_source: suppliedCondition
        ? "condition_parameter"
        : requestedRole
          ? "proliferate_role_condition"
          : forcedRole
            ? "debug_role_override"
            : "stable_hash",
      role_context: roleContext,
      role_condition: roleContext === "genetics_context" ? "biochemistry" : "ecology",
      role_label: roleContext === "genetics_context" ? "biochemistry" : "ecology",
      evidence_order: [...cell.evidence_order],
      species_pair_order: [...cell.species_pair_order],
      missions,
      debug,
      debug_fast: debug && normalizeBoolean(params.get("fast")),
      skip_tours: debug && normalizeBoolean(params.get("skip_tours")),
      simulate_missing_asset: debug && normalizeBoolean(params.get("missing_asset")),
      completion_code: safeId(params.get("completion_code"), "completion code"),
      completion_url: completionUrl || null,
      data_endpoint: params.get("data_endpoint") || null
    };
  }

  global.ContextualRandomization = {
    stableHash,
    createMissionAssignment,
    resolveAssignment
  };
})(typeof window !== "undefined" ? window : globalThis);
