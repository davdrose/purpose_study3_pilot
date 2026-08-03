var jsPsychSimplifiedMission = (function (jspsych) {
  "use strict";

  const info = {
    name: "simplified-contextual-mission",
    version: "26.0.0",
    parameters: {
      mission: { type: jspsych.ParameterType.OBJECT, default: undefined }
    },
    data: {
      mission_id: { type: jspsych.ParameterType.STRING },
      evidence_check_attempts: { type: jspsych.ParameterType.INT },
      classification_slider_0_to_100: { type: jspsych.ParameterType.INT },
      classification_probability_left_0_to_100: { type: jspsych.ParameterType.INT },
      classification_probability_right_0_to_100: { type: jspsych.ParameterType.INT },
      classification_confidence_50_to_100: { type: jspsych.ParameterType.INT },
      classification_toward_purpose_0_to_100: { type: jspsych.ParameterType.INT },
      classification_strength_0_to_50: { type: jspsych.ParameterType.INT },
      chosen_kind: { type: jspsych.ParameterType.STRING },
      decision_rt_ms: { type: jspsych.ParameterType.INT }
    }
  };

  class SimplifiedMissionPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(displayElement, trial) {
      const mission = trial.mission;
      const config = globalThis.ContextualSamplingConfig;
      const runtime = globalThis.FIELD_LAB_RUNTIME;
      const state = globalThis.FIELD_LAB_STATE;
      const ui = globalThis.ContextualUI;
      const pair = config.pairs.find((item) => item.id === mission.species_pair);
      const role = config.roles[runtime.role_context];
      const roleContextPanel = () => `
        <section class="v24-role-context v26-scientist-reminder" aria-label="Scientist assignment">
          ${ui.assetImage(role.role_asset_id, role.role_asset_alt, "v24-role-context-image")}
          <div>
            <p>${ui.escapeHtml(role.scientist_identity)}</p>
          </div>
        </section>`;
      let subjectIndex = 0;
      let screenOpenedAt = performance.now();
      let checkAttempts = 0;
      let firstCheckResponse = null;
      let checkStageIndex = 0;
      let pendingCheckResponse = {};
      let scanningType = null;
      let scanToken = 0;

      const knownSubject = (kindKey) => {
        const kind = config.species[kindKey];
        return {
          id: `known_${kindKey}`,
          status: "KNOWN SPECIES",
          title: kind.singular,
          plural: kind.plural,
          intro: `This animal belongs to a known species called ${kind.plural}.`,
          exterior_asset_id: kind.asset_id,
          biological_kind: kindKey,
          purpose_kind: kindKey,
          purpose_sequence_asset_ids: [...kind.purpose_sequence_asset_ids],
          revealed: { biological: false, purpose: false }
        };
      };

      const subjects = mission.reference_order.map(knownSubject);
      subjects.push({
        id: `population_${mission.unknown_population_id}`,
        status: "UNKNOWN SPECIES",
        title: `Population ${mission.unknown_population_id}`,
        plural: `Population ${mission.unknown_population_id}`,
        intro: `This newly discovered animal is from an unknown species. It will be called Population ${mission.unknown_population_id}.`,
        exterior_asset_id: mission.unknown_asset_id,
        biological_kind: mission.unknown_biological_kind,
        purpose_kind: mission.unknown_purpose_kind,
        purpose_sequence_asset_ids: [...mission.unknown_purpose_sequence_asset_ids],
        revealed: { biological: false, purpose: false }
      });

      const profileName = (type) => type === "biological" ? "Biological scan" : "Purpose scan";
      const profileShortName = (type) => type === "biological" ? "Biology" : "Purpose";

      const reportFor = (subject, type) => {
        const kindKey = type === "biological" ? subject.biological_kind : subject.purpose_kind;
        const kind = config.species[kindKey];
        return kind[type === "biological" ? "biology" : "purpose"];
      };

      const reportCopy = (subject, type) => {
        const report = reportFor(subject, type);
        return `
          <div class="single-report-copy">
            <small>${type === "biological" ? "COMPLETE BIOLOGY REPORT" : "COMPLETE PURPOSE REPORT"}</small>
            <strong>${ui.escapeHtml(report.label)}</strong>
            <p>${ui.escapeHtml(report.detail)}</p>
            <span>Verified · complete · equally reliable</span>
          </div>`;
      };

      const revealedVisual = (subject, type, compact = false) => {
        if (type === "biological") {
          return ui.biologyMap(subject.biological_kind, subject.title, subject.exterior_asset_id, compact);
        }
        return `
          <figure class="purpose-observation ${compact ? "is-compact" : ""}">
            ${ui.assetImage(subject.purpose_sequence_asset_ids[2], `${subject.title} ecological purpose outcome`)}
            <figcaption>Verified field observation</figcaption>
          </figure>`;
      };

      const dnaHelix = () => `
        <div class="dna-rotation-stage" aria-hidden="true">
          <svg class="rotating-dna" viewBox="0 0 260 210" focusable="false">
            <defs>
              <linearGradient id="dnaGlow" x1="0" x2="1">
                <stop offset="0" stop-color="#8ce7bd"/>
                <stop offset=".5" stop-color="#e6fff2"/>
                <stop offset="1" stop-color="#5ab68d"/>
              </linearGradient>
            </defs>
            <path class="dna-strand" d="M58 17 C206 53 206 88 58 105 C-4 114 2 160 58 193"/>
            <path class="dna-strand" d="M202 17 C54 53 54 88 202 105 C264 114 258 160 202 193"/>
            <g class="dna-rungs">
              <path d="M78 24 L182 24"/><path d="M108 42 L152 42"/>
              <path d="M126 61 L134 61"/><path d="M104 80 L156 80"/>
              <path d="M69 99 L191 99"/><path d="M48 118 L212 118"/>
              <path d="M64 137 L196 137"/><path d="M94 156 L166 156"/>
              <path d="M119 175 L141 175"/><path d="M83 191 L177 191"/>
            </g>
          </svg>
          <span>DNA MAP PROCESSING</span>
        </div>`;

      const purposeScanAnimation = (subject) => `
        <div class="live-scan purpose-live-scan" data-live-scan="purpose" data-phase="0">
          <div class="purpose-pulse-specimen">
            ${ui.assetImage(subject.exterior_asset_id, `${subject.title} during purpose scanning`)}
            <i class="pulse-ring ring-one" aria-hidden="true"></i>
            <i class="pulse-ring ring-two" aria-hidden="true"></i>
            <i class="pulse-ring ring-three" aria-hidden="true"></i>
            <span class="scan-reticle" aria-hidden="true"></span>
          </div>
          <div class="purpose-story-sequence">
            <figure data-purpose-frame="1">
              ${ui.assetImage(subject.purpose_sequence_asset_ids[0], `${subject.title} behavior observation`)}
              <figcaption>Behavior detected</figcaption>
            </figure>
            <figure data-purpose-frame="2">
              ${ui.assetImage(subject.purpose_sequence_asset_ids[1], `${subject.title} ecological interaction observation`)}
              <figcaption>Interaction verified</figcaption>
            </figure>
            <figure data-purpose-frame="3">
              ${ui.assetImage(subject.purpose_sequence_asset_ids[2], `${subject.title} ecological effect observation`)}
              <figcaption>Ecological effect confirmed</figcaption>
            </figure>
          </div>
          <div class="live-scan-footer">
            <span class="live-dot" aria-hidden="true"></span>
            <strong data-scan-status>Calibrating purpose sensors</strong>
            <div class="scan-progress"><i></i></div>
          </div>
        </div>`;

      const biologyScanAnimation = (subject) => `
        <div class="live-scan biology-live-scan" data-live-scan="biological" data-phase="0">
          <div class="bio-specimen-window">
            ${ui.assetImage(subject.exterior_asset_id, `${subject.title} during biological scanning`)}
            <span class="bio-grid" aria-hidden="true"></span>
            <span class="vertical-scan-bar" aria-hidden="true"></span>
            <span class="scan-depth-shade" aria-hidden="true"></span>
          </div>
          ${dnaHelix()}
          <div class="live-scan-footer">
            <span class="live-dot" aria-hidden="true"></span>
            <strong data-scan-status>Initializing biological scanner</strong>
            <div class="scan-progress"><i></i></div>
          </div>
        </div>`;

      const scanPanel = (subject, type, orderIndex) => {
        const revealed = subject.revealed[type];
        const earlierComplete = mission.profile_order
          .slice(0, orderIndex)
          .every((earlierType) => subject.revealed[earlierType]);
        const isScanning = scanningType === type;
        const active = !revealed && !scanningType && earlierComplete;
        const icon = type === "biological" ? "⌬" : "◉";
        let body;
        if (revealed) {
          body = `
            <div class="revealed-report-layout">
              ${revealedVisual(subject, type)}
              ${reportCopy(subject, type)}
            </div>`;
        } else if (isScanning) {
          body = type === "biological" ? biologyScanAnimation(subject) : purposeScanAnimation(subject);
        } else {
          const lockedCopy = orderIndex === 0
            ? "The scanner is ready."
            : `Complete the ${profileName(mission.profile_order[orderIndex - 1]).toLowerCase()} first.`;
          body = `
            <div class="scan-ready-state">
              <span class="scan-ready-icon" aria-hidden="true">${active ? icon : "○"}</span>
              <p>${lockedCopy}</p>
              <button class="button ${active ? "button-primary" : "button-secondary"}" type="button"
                data-run-scan="${type}" ${active ? "" : "disabled"}>
                ${type === "biological" ? "Run biological scan" : "Run purpose scan"}
              </button>
            </div>`;
        }
        return `
          <article class="one-scan-panel v11-scan-panel ${type} ${revealed ? "is-revealed" : isScanning ? "is-scanning" : active ? "is-active" : "is-locked"}"
            data-scan-panel="${type}">
            <header>
              <span aria-hidden="true">${icon}</span>
              <div>
                <small>${orderIndex === 0 ? "LEFT REPORT" : "RIGHT REPORT"} · ${orderIndex + 1} OF 2</small>
                <h2>${profileName(type)}</h2>
              </div>
              <b>${revealed ? "COMPLETE" : isScanning ? "SCANNING" : active ? "READY" : "WAITING"}</b>
            </header>
            ${body}
          </article>`;
      };

      const runScan = (subject, type, launchEvent) => {
        if (scanningType || subject.revealed[type]) return;
        const waitingDuration = Math.round(performance.now() - screenOpenedAt);
        const token = ++scanToken;
        scanningType = type;
        renderSubjectScans();
        const liveScan = displayElement.querySelector("[data-live-scan]");
        const status = liveScan?.querySelector("[data-scan-status]");
        const phases = type === "purpose"
          ? ["Calibrating purpose sensors", "Tracking the animal’s behavior", "Verifying its ecological interaction", "Confirming the ecological effect"]
          : ["Initializing biological scanner", "Scanning the complete specimen", "Rotating and mapping DNA", `DNA map designated ${reportFor(subject, type).label.replace("DNA map ", "")}`];
        const pace = runtime.debug_fast ? 35 : (type === "purpose" ? 900 : 850);
        phases.forEach((label, index) => {
          setTimeout(() => {
            if (token !== scanToken || !liveScan?.isConnected) return;
            liveScan.dataset.phase = String(index);
            if (status) status.textContent = label;
            ui.announce(label);
          }, index * pace);
        });
        setTimeout(() => {
          if (token !== scanToken) return;
          scanningType = null;
          subject.revealed[type] = true;
          state.recordEvidence(mission.mission_id, {
            event_type: "reveal",
            subject_id: subject.id,
            profile_type: type,
            duration_ms: waitingDuration,
            scan_duration_ms: pace * phases.length,
            scan_stage_count: phases.length,
            evidence_position: mission.profile_order.indexOf(type) === 0 ? "left" : "right",
            input_method: ui.inputMethod(launchEvent)
          });
          renderSubjectScans();
          ui.announce(`${profileName(type)} complete for ${subject.title}.`);
        }, pace * phases.length);
      };

      const renderDiscoveryAlert = () => {
        const subject = subjects[subjectIndex];
        screenOpenedAt = performance.now();
        displayElement.innerHTML = `
          <div class="study-app v13-discovery-app">
            ${ui.renderHeader(
              `MISSION ${mission.mission_index + 1} · FIELD ALERT`,
              "New discovery",
              mission.station
            )}
            <main class="v13-discovery-main" id="study-main">
              <section class="v13-discovery-card" role="alert" aria-labelledby="discovery-title">
                <span class="v13-alert-symbol" aria-hidden="true">!</span>
                <span class="eyebrow">FIELD ALERT</span>
                <h1 id="discovery-title">A new population has been discovered</h1>
                <p>The animal has not yet been classified. Reveal it before beginning the scans.</p>
                <button class="button button-primary" type="button" data-reveal-new-population>
                  Reveal Population ${mission.unknown_population_id}
                </button>
              </section>
            </main>
          </div>`;
        displayElement.querySelector("[data-reveal-new-population]").addEventListener("click", () => {
          renderAnimalIntroduction();
        }, { once: true });
        ui.focusScreen(displayElement);
      };

      const renderAnimalIntroduction = () => {
        const subject = subjects[subjectIndex];
        const isUnknown = subject.status === "UNKNOWN SPECIES";
        screenOpenedAt = performance.now();
        displayElement.innerHTML = `
          <div class="study-app v13-introduction-app">
            ${ui.renderHeader(
              `MISSION ${mission.mission_index + 1} · ${subject.status}`,
              `${subjectIndex + 1} of ${subjects.length} animals`,
              mission.station
            )}
            <main class="v13-animal-introduction-main" id="study-main">
              <section class="v13-animal-introduction-card ${isUnknown ? "is-unknown" : "is-known"}">
                <span class="eyebrow">${subject.status}</span>
                <h1>${isUnknown ? `This is Population ${mission.unknown_population_id}` : `This species is ${ui.escapeHtml(subject.title)}`}</h1>
                <figure>
                  ${ui.assetImage(subject.exterior_asset_id, `${subject.title} exterior`, "v13-introduction-animal")}
                  <figcaption>${ui.escapeHtml(subject.title)}</figcaption>
                </figure>
                <p>${ui.escapeHtml(subject.intro)}</p>
                <button class="button button-primary" type="button" data-reveal-scan-controls>
                  Reveal purpose and biology scans
                </button>
              </section>
            </main>
          </div>`;
        displayElement.querySelector("[data-reveal-scan-controls]").addEventListener("click", () => {
          renderSubjectScans();
        }, { once: true });
        ui.focusScreen(displayElement);
      };

      const renderSubjectScans = () => {
        const subject = subjects[subjectIndex];
        const complete = mission.profile_order.every((type) => subject.revealed[type]);
        screenOpenedAt = performance.now();
        displayElement.innerHTML = `
          <div class="study-app v11-mission-app">
            ${ui.renderHeader(
              `MISSION ${mission.mission_index + 1} · ${subject.status}`,
              `${subjectIndex + 1} of ${subjects.length} animals`,
              mission.station
            )}
            <main class="one-subject-main v11-subject-main" id="study-main">
              <section class="subject-identity-card v11-subject-identity">
                <div class="subject-portrait">
                  ${ui.assetImage(subject.exterior_asset_id, `${subject.title} exterior`, "subject-large-animal")}
                </div>
                <div class="subject-identity-copy">
                  <span class="eyebrow">${subject.status}</span>
                  <h1>${ui.escapeHtml(subject.title)}</h1>
                  <p>${ui.escapeHtml(subject.intro)}</p>
                  <div class="scan-order-line" aria-label="Scan order">
                    ${mission.profile_order.map((type, index) => `
                      <span class="${type} ${subject.revealed[type] ? "is-done" : scanningType === type ? "is-running" : ""}">
                        <b>${index + 1}</b>${profileName(type)}
                      </span>`).join("")}
                  </div>
                </div>
              </section>
              <section class="two-report-stage v11-report-stage order-${mission.profile_order.join("-")}" aria-label="Biology and purpose scanners">
                ${mission.profile_order.map((type, index) => scanPanel(subject, type, index)).join("")}
              </section>
              <div class="subject-continue-row">
                <button class="button button-primary" type="button" data-next-subject ${complete && !scanningType ? "" : "disabled"}>
                  ${subjectIndex < subjects.length - 1 ? "Continue to next animal" : "Receive your scientist assignment"}
                </button>
              </div>
            </main>
            ${ui.liveRegion()}
          </div>`;

        displayElement.querySelectorAll("[data-run-scan]").forEach((button) => {
          button.addEventListener("click", (event) => runScan(subject, button.dataset.runScan, event), { once: true });
        });
        displayElement.querySelector("[data-next-subject]").addEventListener("click", () => {
          if (!complete || scanningType) return;
          if (subjectIndex < subjects.length - 1) {
            subjectIndex += 1;
            if (subjects[subjectIndex].status === "UNKNOWN SPECIES") {
              renderDiscoveryAlert();
            } else {
              renderAnimalIntroduction();
            }
          } else {
            renderRoleBriefing();
          }
        });
        ui.focusScreen(displayElement);
      };

      const evidenceReport = (subject, type) => {
        const report = reportFor(subject, type);
        return `
          <section class="compact-report ${type}">
            <div>
              <small>${type === "biological" ? "BIOLOGICAL SCAN" : "PURPOSE SCAN"}</small>
              <strong>${ui.escapeHtml(report.label)}</strong>
              <p>${ui.escapeHtml(report.detail)}</p>
            </div>
          </section>`;
      };

      const comparisonAnimalCard = (subject, position) => `
        <article class="v12-comparison-animal ${subject.status === "UNKNOWN SPECIES" ? "is-unknown" : "is-known"} is-${position}">
          <header>
            ${ui.assetImage(subject.exterior_asset_id, `${subject.title} exterior`)}
            <span><small>${subject.status}</small><strong>${ui.escapeHtml(subject.title)}</strong></span>
          </header>
          <div class="v12-comparison-reports order-${mission.profile_order.join("-")}">
            ${mission.profile_order.map((type) => evidenceReport(subject, type)).join("")}
          </div>
        </article>`;

      const evidenceComparison = (questionMarkup) => {
        const unknown = subjects.find((subject) => subject.status === "UNKNOWN SPECIES");
        const knownFor = (kindKey) => subjects.find((subject) =>
          subject.status === "KNOWN SPECIES" && subject.biological_kind === kindKey
        );
        return `
          <section class="v12-evidence-board v21-evidence-board order-${mission.profile_order.join("-")}" aria-label="Known species and unfamiliar population comparison">
            <div class="v21-unknown-evidence">
              ${comparisonAnimalCard(unknown, "center")}
            </div>
            <div class="v21-evidence-lower-row">
              ${comparisonAnimalCard(knownFor(mission.scale_order[0]), "left")}
              <div class="v21-check-slot">
                ${questionMarkup}
              </div>
              ${comparisonAnimalCard(knownFor(mission.scale_order[1]), "right")}
            </div>
          </section>`;
      };

      const choiceCards = (type) => {
        const name = type === "biological" ? "biology_match" : "purpose_match";
        const legend = type === "biological"
          ? `Which known species shares Population ${mission.unknown_population_id}’s complete DNA map?`
          : `Which known species shares Population ${mission.unknown_population_id}’s purpose?`;
        return `
          <fieldset class="evidence-check-question ${type}">
            <legend><small>${profileShortName(type).toUpperCase()} CHECK</small>${legend}</legend>
            <div>
              ${mission.scale_order.map((kindKey) => {
                const kind = config.species[kindKey];
                return `<label><input type="radio" name="${name}" value="${kindKey}" required><span><strong>${kind.plural}</strong></span></label>`;
              }).join("")}
            </div>
          </fieldset>`;
      };

      const renderRoleBriefing = () => {
        state.revealRole(mission.mission_id);
        const roleAssignment = role.scientist_identity;
        displayElement.innerHTML = `
          <div class="study-app v11-role-app">
            ${ui.renderHeader(`MISSION ${mission.mission_index + 1} · ASSIGNMENT`, "Scientist assignment", mission.station, { division: role.division })}
            <main class="v10-role-main" id="study-main">
              <section class="v10-role-card v11-role-card v23-role-card">
                <h1>${ui.escapeHtml(roleAssignment)}</h1>
                <figure class="v23-role-hero">
                  ${ui.assetImage(role.role_asset_id, role.role_asset_alt)}
                </figure>
                <button class="button button-primary" type="button" data-open-comparison>Continue to the evidence checks</button>
              </section>
            </main>
          </div>`;
        displayElement.querySelector("[data-open-comparison]").addEventListener("click", () => renderEvidenceCheck());
        ui.focusScreen(displayElement);
      };

      const renderEvidenceCheck = (message = "") => {
        const activeType = mission.profile_order[checkStageIndex];
        const left = config.species[mission.scale_order[0]];
        const right = config.species[mission.scale_order[1]];
        const questionNumber = checkStageIndex + 1;
        const questionMarkup = `
          <form class="v21-single-question-check ${activeType}" data-evidence-check>
            ${choiceCards(activeType)}
            ${message ? `<p class="neutral-correction" role="alert">${message}</p>` : ""}
            <button class="button button-primary" type="submit">${questionNumber === 1 ? "Continue" : "Submit comparison answers"}</button>
          </form>`;
        displayElement.innerHTML = `
          <div class="study-app v11-mission-app">
            <main class="evidence-check-main v11-compare-main" id="study-main">
              ${roleContextPanel()}
              <section class="compact-heading v11-compare-heading">
                <div><span class="eyebrow">SCIENTIST EVIDENCE CHECK</span><h1>Is Population ${mission.unknown_population_id} a ${left.singular} or a ${right.singular}?</h1></div>
              </section>
              ${evidenceComparison(questionMarkup)}
            </main>
          </div>`;
        displayElement.querySelector("[data-evidence-check]").addEventListener("submit", (event) => {
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          const responseKey = activeType === "biological" ? "biology_match" : "purpose_match";
          const responseValue = values.get(responseKey);
          pendingCheckResponse[responseKey] = responseValue;
          if (!firstCheckResponse) firstCheckResponse = {};
          if (firstCheckResponse[responseKey] === undefined) firstCheckResponse[responseKey] = responseValue;
          if (checkStageIndex === 0) {
            checkStageIndex = 1;
            renderEvidenceCheck();
            return;
          }
          checkAttempts += 1;
          const response = Object.assign({}, pendingCheckResponse);
          const correct = response.biology_match === mission.unknown_biological_kind &&
            response.purpose_match === mission.unknown_purpose_kind;
          if (!correct) {
            checkStageIndex = 0;
            pendingCheckResponse = {};
            renderEvidenceCheck("One or both answers do not match the reports. Compare the DNA-map and purpose labels, then try again.");
            return;
          }
          state.completeEvidenceCheck(mission.mission_id, {
            attempts: checkAttempts,
            first_response: firstCheckResponse
          });
          renderClassification();
        });
        ui.focusScreen(displayElement);
      };

      const renderClassification = () => {
        const decisionStartedAt = performance.now();
        const left = config.species[mission.scale_order[0]];
        const right = config.species[mission.scale_order[1]];
        const unknown = subjects.find((subject) => subject.status === "UNKNOWN SPECIES");
        const knownFor = (kindKey) => subjects.find((subject) =>
          subject.status === "KNOWN SPECIES" && subject.biological_kind === kindKey
        );
        const leftSubject = knownFor(mission.scale_order[0]);
        const rightSubject = knownFor(mission.scale_order[1]);
        const scalePositionLabel = (value) => `Scale position ${value} of 100 from ${left.singular} to ${right.singular}`;
        let responseValue = null;
        let inputMethod = "pointer";
        const sliderPosition = (percent) => `${16.6667 + (percent * 2 / 3)}%`;
        displayElement.innerHTML = `
          <div class="study-app v11-decision-app">
            <main class="v11-slider-main" id="study-main">
              ${roleContextPanel()}
              <section class="slider-heading">
                <span class="eyebrow">FINAL CLASSIFICATION</span>
                <h1>Which species does Population ${mission.unknown_population_id} belong to?</h1>
              </section>
              <section class="v20-classification-board">
                <div class="v20-slider-stage" data-image-slider>
                  <input type="range" min="0" max="100" step="1" value="50"
                    aria-label="Position Population ${mission.unknown_population_id} between ${left.singular} and ${right.singular}"
                    aria-valuetext="No response selected" data-classification-slider>
                  <div class="v20-unknown-panel-handle is-uncommitted" data-slider-handle style="left: ${sliderPosition(50)}">
                    ${comparisonAnimalCard(unknown, "center")}
                    <span class="v20-handle-arrow" aria-hidden="true"></span>
                  </div>
                  <div class="v20-slider-rail" aria-hidden="true"></div>
                  <div class="v20-slider-ticks" aria-hidden="true">
                    ${[0, 100].map((value) => `<i style="left: ${sliderPosition(value)}"></i>`).join("")}
                  </div>
                </div>
                <div class="v20-slider-labels">
                  <strong>Definitely ${left.singular}</strong>
                  <strong>Definitely ${right.singular}</strong>
                </div>
                <div class="v20-classification-lower-row">
                  ${comparisonAnimalCard(leftSubject, "left")}
                  <div class="v20-submit-slot">
                    <button class="button button-primary" type="button" data-submit-classification disabled>Submit classification</button>
                  </div>
                  ${comparisonAnimalCard(rightSubject, "right")}
                </div>
              </section>
            </main>
          </div>`;
        const slider = displayElement.querySelector("[data-classification-slider]");
        const handle = displayElement.querySelector("[data-slider-handle]");
        const sliderStage = displayElement.querySelector("[data-image-slider]");
        const rail = displayElement.querySelector(".v20-slider-rail");
        const submit = displayElement.querySelector("[data-submit-classification]");
        const updateSlider = (event) => {
          const raw = Math.max(0, Math.min(100, Number(slider.value)));
          responseValue = raw;
          handle.style.left = sliderPosition(raw);
          handle.classList.remove("is-uncommitted");
          slider.setAttribute("aria-valuetext", scalePositionLabel(raw));
          submit.disabled = false;
          inputMethod = ui.inputMethod(event);
        };
        slider.addEventListener("input", updateSlider);
        slider.addEventListener("change", updateSlider);
        let draggingSlider = false;
        const updateFromPointer = (event) => {
          const bounds = rail.getBoundingClientRect();
          const percent = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
          slider.value = String(Math.round(percent));
          updateSlider(event);
        };
        sliderStage.addEventListener("pointerdown", (event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          event.preventDefault();
          draggingSlider = true;
          try { sliderStage.setPointerCapture?.(event.pointerId); } catch (_) { /* Pointer capture is optional. */ }
          slider.focus({ preventScroll: true });
          updateFromPointer(event);
        });
        sliderStage.addEventListener("pointermove", (event) => {
          if (!draggingSlider) return;
          event.preventDefault();
          updateFromPointer(event);
        });
        sliderStage.addEventListener("pointerup", (event) => {
          if (!draggingSlider) return;
          draggingSlider = false;
          updateFromPointer(event);
          try { sliderStage.releasePointerCapture?.(event.pointerId); } catch (_) { /* Pointer capture is optional. */ }
        });
        sliderStage.addEventListener("pointercancel", (event) => {
          draggingSlider = false;
          try { sliderStage.releasePointerCapture?.(event.pointerId); } catch (_) { /* Pointer capture is optional. */ }
        });
        submit.addEventListener("click", (event) => {
          if (responseValue === null) return;
          const leftProbability = 100 - responseValue;
          const rightProbability = responseValue;
          const chosenKind = responseValue < 50
            ? mission.scale_order[0]
            : responseValue > 50
              ? mission.scale_order[1]
              : "equally_likely";
          const strength = Math.abs(responseValue - 50);
          const purposeScore = mission.unknown_purpose_kind === mission.scale_order[1]
            ? responseValue
            : 100 - responseValue;
          const fields = {
            role_context: runtime.role_context,
            population_id: mission.unknown_population_id,
            biological_match_kind: mission.unknown_biological_kind,
            purpose_match_kind: mission.unknown_purpose_kind,
            evidence_left_type: mission.profile_order[0],
            evidence_right_type: mission.profile_order[1],
            scale_left_kind: mission.scale_order[0],
            scale_right_kind: mission.scale_order[1],
            classification_slider_0_to_100: responseValue,
            classification_probability_left_0_to_100: leftProbability,
            classification_probability_right_0_to_100: rightProbability,
            classification_confidence_50_to_100: Math.max(leftProbability, rightProbability),
            classification_toward_purpose_0_to_100: purposeScore,
            chosen_kind: chosenKind,
            classification_strength_0_to_50: strength,
            decision_rt_ms: Math.round(performance.now() - decisionStartedAt),
            input_method: inputMethod || ui.inputMethod(event),
            evidence_check_attempts: checkAttempts
          };
          state.finalizeClassification(mission.mission_id, fields);
          this.jsPsych.finishTrial(Object.assign({ mission_id: mission.mission_id }, fields));
        }, { once: true });
        ui.focusScreen(displayElement);
      };

      renderAnimalIntroduction();
    }
  }

  SimplifiedMissionPlugin.info = info;
  return SimplifiedMissionPlugin;
})(jsPsychModule);
