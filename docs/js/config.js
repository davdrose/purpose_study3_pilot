(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const STUDY_VERSION = "pilot-1.0.0";
  const DATA_SCHEMA_VERSION = "1.0.0";
  const coreConditions = [
    { bioProfile: "rellin", purposeProfile: "rellin" },
    { bioProfile: "rellin", purposeProfile: "daxon" },
    { bioProfile: "daxon", purposeProfile: "rellin" },
    { bioProfile: "daxon", purposeProfile: "daxon" }
  ];
  const evidenceOrders = ["scan-first", "purpose-first"];
  const endpointOrders = ["rellin-left", "daxon-left"];
  const environments = ["woodland", "grassland", "marsh"];

  const urlValue = (name, allowed) => {
    const value = params.get(name);
    return allowed.includes(value) ? value : null;
  };

  const hashString = (value) => {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  const getLocalAssignmentKey = () => {
    const storageKey = "purpose-categorization-local-assignment";
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

  const prolificPid = params.get("PROLIFIC_PID") || "";
  const studyId = params.get("STUDY_ID") || "";
  const sessionId = params.get("SESSION_ID") || "";
  const assignmentKey = prolificPid || params.get("participant_id") || getLocalAssignmentKey();
  const assignmentHash = hashString(`${assignmentKey}|purpose-categorization|${STUDY_VERSION}`);

  let cursor = assignmentHash;
  const assignedCore = coreConditions[cursor % coreConditions.length];
  cursor = Math.floor(cursor / coreConditions.length);
  const assignedEvidenceOrder = evidenceOrders[cursor % evidenceOrders.length];
  cursor = Math.floor(cursor / evidenceOrders.length);
  const assignedEndpointOrder = endpointOrders[cursor % endpointOrders.length];
  cursor = Math.floor(cursor / endpointOrders.length);
  const assignedEnvironment = environments[cursor % environments.length];

  const bioProfileOverride = urlValue("bio_profile", ["rellin", "daxon"]);
  const purposeProfileOverride = urlValue("purpose_profile", ["rellin", "daxon"]);
  const evidenceOrderOverride = urlValue("evidence_order", evidenceOrders);
  const endpointOrderOverride = urlValue("endpoint_order", endpointOrders);
  const environmentOverride = urlValue("environment", environments);
  const bioProfile = bioProfileOverride || assignedCore.bioProfile;
  const purposeProfile = purposeProfileOverride || assignedCore.purposeProfile;
  const evidenceOrder = evidenceOrderOverride || assignedEvidenceOrder;
  const endpointOrder = endpointOrderOverride || assignedEndpointOrder;
  const environment = environmentOverride || assignedEnvironment;
  const hasUrlOverride = Boolean(
    bioProfileOverride ||
    purposeProfileOverride ||
    evidenceOrderOverride ||
    endpointOrderOverride ||
    environmentOverride
  );

  const conditionId = `bio-${bioProfile}__purpose-${purposeProfile}`;
  const referenceOrder = endpointOrder === "rellin-left"
    ? "rellin-first"
    : "daxon-first";
  const counterbalanceId = [
    `evidence-${evidenceOrder}`,
    `endpoints-${endpointOrder}`,
    `environment-${environment}`
  ].join("__");

  window.STUDY_CONFIG = Object.freeze({
    studyName: "Purpose Categorization Study 3",
    studyVersion: STUDY_VERSION,
    dataSchemaVersion: DATA_SCHEMA_VERSION,
    prolificPid,
    studyId,
    sessionId,
    assignmentKey,
    assignmentHash,
    assignmentId: assignmentHash.toString(16).padStart(8, "0"),
    assignmentSource: hasUrlOverride ? "url_override" : "deterministic_hash",
    conditionId,
    counterbalanceId,
    bioProfile,
    purposeProfile,
    bioPurposeMatch: bioProfile === purposeProfile,
    evidenceOrder,
    endpointOrder,
    referenceOrder,
    environment,
    scannerAvailable: true,
    localMode: window.location.protocol === "file:" || params.get("local") === "1",
    demoMode: params.get("demo") === "1",
    includeConsent: params.get("skip_consent") !== "1",
    participantParametersPresent: Boolean(prolificPid && studyId && sessionId)
  });
})();
