(function () {
  "use strict";

  let graphCounter = 0;
  const T = window.Interbreeding.TraitScales;

  function generationX(generation, dimensions) {
    return dimensions.left + (generation / 7) * (dimensions.right - dimensions.left);
  }

  function generationInterval(dimensions) {
    return (dimensions.right - dimensions.left) / 7;
  }

  function axisEndFor(generation, dimensions, terminal) {
    const forwardInterval = terminal ? 0.18 : 1;
    return generationX(generation, dimensions) + generationInterval(dimensions) * forwardInterval;
  }

  function pointFor(row, generation, key, dimensions) {
    return {
      generation: generation,
      value: row[key],
      x: generationX(generation, dimensions),
      y: dimensions.bottom - (row[key] / 100) * (dimensions.bottom - dimensions.top)
    };
  }

  function pointsFor(rows, key, upto, dimensions) {
    return rows.slice(0, upto + 1).map(function (row, generation) {
      return pointFor(row, generation, key, dimensions);
    });
  }

  function segmentPath(previous, current) {
    const midpoint = (previous.x + current.x) / 2;
    return "M " + previous.x + " " + previous.y + " C " + midpoint + " " + previous.y + ", " + midpoint + " " + current.y + ", " + current.x + " " + current.y;
  }

  function evidenceCurvesMarkup(genetic, purpose, animateNewest) {
    let markup = "";
    for (let index = 1; index < genetic.length; index += 1) {
      const geneticPrevious = genetic[index - 1];
      const geneticCurrent = genetic[index];
      const purposePrevious = purpose[index - 1];
      const purposeCurrent = purpose[index];
      const newest = animateNewest && index === genetic.length - 1;
      const revealClass = newest ? " new-evidence-segment" : "";
      const pathLength = newest ? ' pathLength="1"' : "";
      const equalSegment = geneticPrevious.value === purposePrevious.value && geneticCurrent.value === purposeCurrent.value;
      const equalClass = equalSegment ? " equal-evidence-track" : "";
      const geneticTransform = equalSegment ? ' transform="translate(0 -3)"' : "";
      const purposeTransform = equalSegment ? ' transform="translate(0 3)"' : "";
      markup += '<path class="evidence-curve genetic-curve' + equalClass + revealClass + '"' + geneticTransform + pathLength + ' d="' + segmentPath(geneticPrevious, geneticCurrent) + '"></path>' +
        '<path class="evidence-curve purpose-curve' + equalClass + revealClass + '"' + purposeTransform + pathLength + ' d="' + segmentPath(purposePrevious, purposeCurrent) + '"></path>';
    }
    return markup;
  }

  function pointSymbolDefinitions(ids) {
    return '<symbol id="' + ids.genetic + '" viewBox="0 0 16 16"><circle class="genetic-point" cx="8" cy="8" r="5.7"></circle></symbol>' +
      '<symbol id="' + ids.purpose + '" viewBox="0 0 16 16"><path class="purpose-point" d="M8 2.5 L13.5 8 L8 13.5 L2.5 8 Z"></path></symbol>' +
      '<symbol id="' + ids.shared + '" viewBox="0 0 16 16"><circle class="genetic-point shared-marker-circle" cx="8" cy="8" r="6.1"></circle><path class="purpose-point shared-marker-diamond" d="M8 3.6 L12.4 8 L8 12.4 L3.6 8 Z"></path></symbol>';
  }

  function keySample(curveClass, symbolId) {
    return '<svg class="series-key-symbol" viewBox="0 0 60 22" aria-hidden="true"><line class="key-line ' + curveClass + '" x1="3" y1="11" x2="57" y2="11"></line><use href="#' + symbolId + '" x="20" y="1" width="20" height="20"></use></svg>';
  }

  function orderedEvidencePhrase(order) {
    return order === "purpose_first" ? "purpose and DNA" : "DNA and purpose";
  }

  function orderedEvidenceList(order, trait) {
    return order === "purpose_first" ? "purpose, DNA, and " + trait : "DNA, purpose, and " + trait;
  }

  function evidenceKeyMarkup(ids, order) {
    const genetic = '<span class="genetic-key">' + keySample("genetic-key-line", ids.genetic) + '<strong>Evidence of DNA change</strong></span>';
    const purpose = '<span class="purpose-key">' + keySample("purpose-key-line", ids.purpose) + '<strong>Evidence of purpose change</strong></span>';
    return '<div class="series-key" aria-label="Evidence key">' + (order === "purpose_first" ? purpose + genetic : genetic + purpose) + '</div>';
  }

  function axisMarkup(upto, dimensions) {
    let markup = "";
    for (let generation = 0; generation <= upto; generation += 1) {
      const x = generationX(generation, dimensions);
      const stateClass = generation < upto ? "revealed" : "active";
      markup += '<line class="x-tick ' + stateClass + '" x1="' + x + '" y1="228" x2="' + x + '" y2="239"></line>' +
        '<text class="generation-label ' + stateClass + '" x="' + x + '" y="257">G' + generation + '</text>';
    }
    return markup;
  }

  function axisLineMarkup(upto, dimensions, arrowId, animateNewest, terminal) {
    const activeX = generationX(upto, dimensions);
    const axisEnd = axisEndFor(upto, dimensions, terminal);
    if (upto === 0) {
      return '<line class="x-axis" x1="' + dimensions.left + '" y1="' + dimensions.bottom + '" x2="' + axisEnd + '" y2="' + dimensions.bottom + '" marker-end="url(#' + arrowId + ')"></line>';
    }
    return '<line class="x-axis x-axis-base" x1="' + dimensions.left + '" y1="' + dimensions.bottom + '" x2="' + activeX + '" y2="' + dimensions.bottom + '"></line>' +
      '<line class="x-axis x-axis-extension' + (animateNewest && !terminal ? " new-axis-extension" : "") + '" pathLength="1" x1="' + activeX + '" y1="' + dimensions.bottom + '" x2="' + axisEnd + '" y2="' + dimensions.bottom + '" marker-end="url(#' + arrowId + ')"></line>';
  }

  function railMarkup(options, dimensions) {
    const state = options.state;
    let connectors = "";
    let groups = "";
    for (let generation = 0; generation <= state.maxRevealed; generation += 1) {
      const x = generationX(generation, dimensions);
      const decision = state.decisions[generation];
      const isActive = generation === state.maxRevealed && !state.terminal;
      const isBranch = state.previewBoundary === generation || state.confirmedBoundary === generation;
      const offset = isBranch ? 20 : 0;
      const status = generation === 0 ? "Founding" : decision === "continue" ? "Continued" : decision === "branch" ? "Distinct" : isActive ? "Current" : "Observed";
      if (generation > 0) {
        const previousX = generationX(generation - 1, dimensions);
        connectors += '<line class="lineage-connector ' + (isBranch ? "branch-connector" : "") + '" x1="' + (previousX + 46) + '" y1="414" x2="' + (x - 46) + '" y2="' + (414 + offset) + '"></line>';
      }
      groups += '<g class="generation-group ' + (isActive ? "active " : "") + (isBranch ? "branching " : "") + (options.justRevealed === generation ? "just-revealed" : "") + '" transform="translate(0 ' + offset + ')" data-generation-slot="' + generation + '" aria-label="Generation G' + generation + ', ' + status + '">' +
        '<rect class="trait-frame" x="' + (x - 36) + '" y="304" width="72" height="72" rx="12"></rect>' +
        T.render(options.lineage.traitScaleId, options.lineage.traitLevels[generation], { x: x - 35, y: 305, width: 70, height: 70 }) +
        '<rect class="generation-node" x="' + (x - 44) + '" y="389" width="88" height="51" rx="11"></rect>' +
        '<text class="node-generation" x="' + x + '" y="409">G' + generation + '</text>' +
        '<text class="node-status" x="' + x + '" y="427">' + status + '</text>' +
        (isBranch ? '<text class="branch-label" x="' + x + '" y="448">Distinct species begins</text>' : "") + '</g>';
    }
    const activeX = generationX(state.maxRevealed, dimensions);
    const railRight = axisEndFor(state.maxRevealed, dimensions, state.terminal);
    return '<rect class="trait-band" x="' + (dimensions.left - 58) + '" y="280" width="' + (railRight - dimensions.left + 116) + '" height="193" rx="18"></rect>' +
      '<rect class="active-column active-column-rail" x="' + (activeX - 52) + '" y="282" width="104" height="189" rx="16"></rect>' +
      '<text class="trait-band-label" x="' + (dimensions.left - 40) + '" y="294" text-anchor="start">TYPICAL POPULATION ' + options.lineage.targetShort.toUpperCase() + ' BY GENERATION</text>' + connectors + groups;
  }

  function integratedMaster(options) {
    const width = 1200;
    const height = 478;
    const dimensions = { left: 128, right: 960, top: 36, bottom: 228 };
    const genetic = pointsFor(options.trajectory, "genetic_evidence_score", options.state.maxRevealed, dimensions);
    const purpose = pointsFor(options.trajectory, "purpose_evidence_score", options.state.maxRevealed, dimensions);
    const activeX = generationX(options.state.maxRevealed, dimensions);
    const axisEnd = axisEndFor(options.state.maxRevealed, dimensions, options.state.terminal);
    const animateNewest = options.justRevealed === options.state.maxRevealed && options.state.maxRevealed > 0;
    const graphId = "integrated-graph-" + (++graphCounter);
    const arrowId = graphId + "-arrow";
    const pointIds = { genetic: graphId + "-genetic-point", purpose: graphId + "-purpose-point", shared: graphId + "-shared-point" };
    const evidenceDots = genetic.map(function (point, index) {
      const newClass = animateNewest && point.generation === options.state.maxRevealed ? " new-point" : "";
      const shared = point.value === purpose[index].value;
      if (shared) return '<use class="graph-point shared-point' + newClass + '" href="#' + pointIds.shared + '" x="' + (point.x - 8) + '" y="' + (point.y - 8) + '" width="16" height="16"></use>';
      return '<use class="graph-point' + newClass + '" href="#' + pointIds.genetic + '" x="' + (point.x - 8) + '" y="' + (point.y - 8) + '" width="16" height="16"></use>' +
        '<use class="graph-point' + newClass + '" href="#' + pointIds.purpose + '" x="' + (purpose[index].x - 8) + '" y="' + (purpose[index].y - 8) + '" width="16" height="16"></use>';
    }).join("");
    const evidencePhrase = orderedEvidencePhrase(options.evidenceOrder);
    const evidenceList = orderedEvidenceList(options.evidenceOrder, options.lineage.targetShort);
    return '<section class="master-panel" aria-label="Integrated ' + evidenceList + ' population-history evidence">' +
      '<svg class="svg-symbol-bank" aria-hidden="true"><defs>' + pointSymbolDefinitions(pointIds) + '</defs></svg>' +
      '<header><div class="master-heading"><h1>Evidence across generations</h1>' + evidenceKeyMarkup(pointIds, options.evidenceOrder) + '</div></header>' +
      '<svg class="integrated-graph" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + evidenceList + ' through Generation G' + options.state.maxRevealed + '">' +
      '<defs><marker id="' + arrowId + '" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z"></path></marker></defs>' +
      '<rect class="active-column active-column-plot" x="' + (activeX - 52) + '" y="19" width="104" height="258" rx="16"></rect>' +
      '<line class="y-axis" x1="' + dimensions.left + '" y1="' + dimensions.bottom + '" x2="' + dimensions.left + '" y2="' + (dimensions.top - 11) + '" marker-end="url(#' + arrowId + ')"></line>' +
      '<text class="scale-label axis-label" x="122" y="48" text-anchor="end" aria-label="Stronger evidence of change from G0"><tspan x="122" dy="0">Stronger evidence</tspan><tspan x="122" dy="16">of change</tspan><tspan x="122" dy="16">from G0</tspan></text>' +
      '<text class="scale-label zero-label" x="122" y="196" text-anchor="end" aria-label="No evidence of change"><tspan x="122" dy="0">No evidence</tspan><tspan x="122" dy="16">of change</tspan></text>' +
      axisLineMarkup(options.state.maxRevealed, dimensions, arrowId, animateNewest, options.state.terminal) +
      axisMarkup(options.state.maxRevealed, dimensions) +
      '<text class="x-axis-label" x="' + ((dimensions.left + axisEnd) / 2) + '" y="274">Generation →</text>' +
      evidenceCurvesMarkup(genetic, purpose, animateNewest) +
      evidenceDots +
      railMarkup(options, dimensions) + '</svg></section>';
  }

  function decisionPanel(options) {
    const state = options.state;
    const generation = state.maxRevealed;
    const progress = options.singleTrialPreview ? "Single-trial check" : "Population " + options.trialNumber + " of " + options.totalTrials;
    if (options.continueFeedback && options.continueFeedback.generation === generation) {
      return '<section class="decision-panel continue-recorded-panel" aria-live="polite"><div class="decision-copy"><span>' + progress + ' · Judgment recorded · G' + generation + '</span><h2>Generation G' + generation + ' recorded as part of the current species.</h2><p>You cannot return and make G' + generation + ' the beginning of a distinct species.</p></div><div class="continue-feedback-next"><i aria-hidden="true"></i><div><strong>Revealing what comes next…</strong><small>If another generation remains, it will appear now.</small></div></div></section>';
    }
    if (state.terminal) {
      const result = state.confirmedBoundary !== null
        ? "Generation G" + state.confirmedBoundary + " begins a distinct species."
        : "Generations G0–G7 remain one species.";
      const finalTrial = options.trialNumber === options.totalTrials;
      const advanceLabel = finalTrial ? "Continue to final questions" : "Continue to next population";
      const advanceNote = finalTrial ? "Answer a few optional questions, then submit" : "Begin Population " + (options.trialNumber + 1) + " of " + options.totalTrials;
      return '<section class="decision-panel terminal-result sequence-terminal" aria-live="polite"><div><span>' + progress + ' · Judgment recorded</span><h2>' + result + '</h2><p>This population history is complete.</p></div><button type="button" class="advance-trial-button" data-advance-trial><strong>' + advanceLabel + '</strong><small>' + advanceNote + '</small></button></section>';
    }
    const heading = generation === 0 ? "G0 establishes the baseline." : "Does Generation G" + generation + " remain in the current species?";
    const evidencePhrase = orderedEvidencePhrase(options.evidenceOrder);
    const note = generation === 0 ? evidencePhrase.charAt(0).toUpperCase() + evidencePhrase.slice(1) + " evidence begin at the G0 reference." : "Use only the history revealed so far. If G" + generation + " is the first generation you judge distinct, choose it now.";
    const continueNote = generation === 0 ? "Record the baseline and reveal Generation G1" : "Record G" + generation + " as current species; reveal what comes next. You cannot revisit G" + generation + ".";
    const branchNote = generation === 0 ? "Available beginning at G1" : "Record G" + generation + " as the first distinct generation and end this population.";
    return '<section class="decision-panel" aria-label="Categorization judgment"><div class="decision-copy"><span>' + progress + ' · Categorization judgment · G' + generation + '</span><h2>' + heading + '</h2><p>' + note + '</p></div><div class="decision-actions"><button type="button" class="choice-button continue-choice" data-action="continue"><strong>Continue current species</strong><small>' + continueNote + '</small></button><button type="button" class="choice-button branch-choice" data-action="branch" ' + (generation === 0 ? "disabled" : "") + '><strong>Begin distinct species</strong><small>' + branchNote + '</small></button></div></section>';
  }

  function confirmationDialog(options) {
    if (!options.confirmation) return "";
    const generation = options.confirmation.generation;
    const isBranch = options.confirmation.type === "branch";
    return '<div class="confirmation-backdrop"><section class="confirmation-dialog" role="dialog" aria-modal="true" aria-label="Confirm categorization judgment"><span>Confirm your judgment</span><h2>' +
      (isBranch ? "Begin a distinct species at G" + generation + "?" : "Keep G0–G7 within one species?") +
      '</h2><p>' + (isBranch ? "G" + generation + " will be recorded as the first generation of a distinct species." : "The full population history will be recorded as one continuing species.") +
      '</p><div><button type="button" class="cancel-button" data-cancel-confirmation>Review current generation</button><button type="button" class="confirm-button" data-confirm-judgment>' +
      (isBranch ? "Confirm distinct species" : "Confirm one species") + '</button></div></section></div>';
  }

  function workspace(options) {
    return '<main class="single-trial" data-generation="' + options.state.maxRevealed + '" data-trial-number="' + options.trialNumber + '" data-total-trials="' + options.totalTrials + '" data-condition-cell="' + options.conditionCell + '" data-lineage-id="' + options.lineage.id + '" data-trait-scale="' + options.lineage.traitScaleId + '" data-trait-label="' + options.lineage.traitLabel + '" data-trait-calibration-method="' + options.lineage.traitCalibrationMethod + '" data-continue-feedback="' + Boolean(options.continueFeedback) + '">' +
      integratedMaster(options) + decisionPanel(options) + confirmationDialog(options) + '</main>';
  }

  window.Interbreeding = window.Interbreeding || {};
  window.Interbreeding.UnfoldingUI = { integratedMaster: integratedMaster, masterGraph: integratedMaster, workspace: workspace };
})();
