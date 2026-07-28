(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const stimuli = window.PURPOSE_STIMULI;
  const STUDY_VERSION = "experiment3_full_pilot-1.0.0";
  const DATA_SCHEMA_VERSION = "2.0.0";
  const conditionCells = {
    AA: { bioRole: "A", featureRole: "A" },
    AB: { bioRole: "A", featureRole: "B" },
    BA: { bioRole: "B", featureRole: "A" },
    BB: { bioRole: "B", featureRole: "B" }
  };
  const featureTypes = ["purpose", "microdermal"];
  const conditionTypes = ["congruent", "incongruent"];
  const cellsByConditionType = {
    congruent: ["AA", "BB"],
    incongruent: ["AB", "BA"]
  };
  const conditionTypeByCell = {
    AA: "congruent",
    BB: "congruent",
    AB: "incongruent",
    BA: "incongruent"
  };
  const cellNames = Object.keys(conditionCells);
  const evidenceOrders = ["scan-first", "purpose-first"];
  const environmentNames = Object.keys(stimuli.environments);
  const pairOrderPermutations = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0]
  ];
  const regionOrderPermutations = [
    ["woodland", "grassland", "marsh"],
    ["woodland", "marsh", "grassland"],
    ["grassland", "woodland", "marsh"],
    ["grassland", "marsh", "woodland"],
    ["marsh", "woodland", "grassland"],
    ["marsh", "grassland", "woodland"]
  ];

  const hashString = (value) => {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  const getLocalAssignmentKey = () => {
    const storageKey = "purpose-categorization-full-pilot-assignment";
    try {
      const existing = window.sessionStorage.getItem(storageKey);
      if (existing) return existing;
      const generated = `local-${crypto.randomUUID()}`;
      window.sessionStorage.setItem(storageKey, generated);
      return generated;
    } catch (error) {
      return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
  };

  const validValue = (name, allowed) => {
    const value = params.get(name);
    return allowed.includes(value) ? value : null;
  };

  const validList = (name, length, allowed, requireUnique = false) => {
    const value = params.get(name);
    if (!value) return null;
    const entries = value.split(",");
    if (
      entries.length !== length ||
      entries.some((entry) => !allowed.includes(entry)) ||
      (requireUnique && new Set(entries).size !== entries.length)
    ) {
      return null;
    }
    return entries;
  };

  const prolificPid = params.get("PROLIFIC_PID") || "";
  const studyId = params.get("STUDY_ID") || "";
  const sessionId = params.get("SESSION_ID") || "";
  const assignmentKey = prolificPid || params.get("participant_id") || getLocalAssignmentKey();
  const assignmentHash = hashString(`${assignmentKey}|purpose-categorization|${STUDY_VERSION}`);

  let cursor = assignmentHash;
  const assignedFeatureType = featureTypes[cursor % featureTypes.length];
  cursor = Math.floor(cursor / featureTypes.length);
  const assignedConditionType = conditionTypes[cursor % conditionTypes.length];
  cursor = Math.floor(cursor / conditionTypes.length);
  const assignedCellVariant = cursor % 2;
  cursor = Math.floor(cursor / 2);
  const assignedCell = cellsByConditionType[assignedConditionType][assignedCellVariant];
  const assignedEvidenceOrder = evidenceOrders[cursor % evidenceOrders.length];
  cursor = Math.floor(cursor / evidenceOrders.length);
  const assignedSchedule = stimuli.matchingSchedules[cursor % stimuli.matchingSchedules.length];
  cursor = Math.floor(cursor / stimuli.matchingSchedules.length);
  const assignedPairOrder = pairOrderPermutations[cursor % pairOrderPermutations.length];
  cursor = Math.floor(cursor / pairOrderPermutations.length);
  const assignedRegionOrder = regionOrderPermutations[cursor % regionOrderPermutations.length];
  cursor = Math.floor(cursor / regionOrderPermutations.length);
  const assignedEndpointMask = cursor % 8;

  const featureTypeOverride = validValue("feature_type", featureTypes);
  const conditionTypeOverride = validValue("condition_type", conditionTypes);
  const cellOverride = validValue("condition_cell", cellNames);
  const evidenceOrderOverride = validValue("evidence_order", evidenceOrders);
  const scheduleOverrideId = validValue(
    "matching_schedule_id",
    stimuli.matchingSchedules.map((schedule) => schedule.id)
  );
  const endpointOrdersOverride = validList(
    "endpoint_orders",
    3,
    ["a-left", "b-left"]
  );
  const regionOrderOverride = validList(
    "region_order",
    3,
    environmentNames,
    true
  );

  const featureType = featureTypeOverride || assignedFeatureType;
  const conditionType = cellOverride
    ? conditionTypeByCell[cellOverride]
    : conditionTypeOverride || assignedConditionType;
  const conditionCell = cellOverride ||
    (conditionTypeOverride
      ? cellsByConditionType[conditionType][assignedCellVariant]
      : assignedCell);
  const evidenceOrder = evidenceOrderOverride || assignedEvidenceOrder;
  const matchingSchedule = scheduleOverrideId
    ? stimuli.matchingSchedules.find((schedule) => schedule.id === scheduleOverrideId)
    : assignedSchedule;
  const regionOrder = regionOrderOverride || assignedRegionOrder;
  const endpointOrders = endpointOrdersOverride || [0, 1, 2].map((trialIndex) => (
    ((assignedEndpointMask >> trialIndex) & 1) === 0 ? "a-left" : "b-left"
  ));
  const cell = conditionCells[conditionCell];
  const hasUrlOverride = Boolean(
    featureTypeOverride ||
    conditionTypeOverride ||
    cellOverride ||
    evidenceOrderOverride ||
    scheduleOverrideId ||
    endpointOrdersOverride ||
    regionOrderOverride
  );

  const orderedPairs = assignedPairOrder.map((pairIndex) => matchingSchedule.pairs[pairIndex]);
  const trialConfigs = orderedPairs.map((pair, index) => {
    const [animalA, animalB] = pair;
    const endpointOrder = endpointOrders[index];
    const leftSpecies = endpointOrder === "a-left" ? animalA : animalB;
    const rightSpecies = endpointOrder === "a-left" ? animalB : animalA;
    return Object.freeze({
      trialNumber: index + 1,
      itemPair: `${animalA}_${animalB}`,
      animalA,
      animalB,
      bioProfile: cell.bioRole === "A" ? animalA : animalB,
      featureProfile: cell.featureRole === "A" ? animalA : animalB,
      featureType,
      conditionType,
      conditionCell,
      evidenceOrder,
      endpointOrder,
      leftSpecies,
      rightSpecies,
      firstIntroducedSpecies: leftSpecies,
      environment: regionOrder[index],
      canonicalZeroSpecies: animalA,
      canonicalHundredSpecies: animalB,
      showInstructions: index === 0
    });
  });

  const assignmentId = assignmentHash.toString(16).padStart(8, "0");
  const counterbalanceId = [
    `feature-${featureType}`,
    `condition-${conditionType}`,
    `cell-${conditionCell}`,
    `evidence-${evidenceOrder}`,
    matchingSchedule.id,
    `pair-order-${assignedPairOrder.join("")}`,
    `endpoints-${endpointOrders.map((order) => order[0]).join("")}`,
    `regions-${regionOrder.join("-")}`
  ].join("__");

  window.STUDY_CONFIG = Object.freeze({
    studyName: "Animal Categorization Study",
    studyVersion: STUDY_VERSION,
    dataSchemaVersion: DATA_SCHEMA_VERSION,
    prolificPid,
    studyId,
    sessionId,
    assignmentKey,
    assignmentHash,
    assignmentId,
    assignmentSource: hasUrlOverride ? "url_override" : "deterministic_hash",
    featureType,
    conditionType,
    conditionCell,
    bioRole: cell.bioRole,
    featureRole: cell.featureRole,
    evidenceOrder,
    matchingScheduleId: matchingSchedule.id,
    counterbalanceId,
    trialConfigs: Object.freeze(trialConfigs),
    localMode: window.location.protocol === "file:" || params.get("local") === "1",
    demoMode: params.get("demo") === "1",
    includeConsent: params.get("skip_consent") !== "1",
    participantParametersPresent: Boolean(prolificPid && studyId && sessionId)
  });
})();
