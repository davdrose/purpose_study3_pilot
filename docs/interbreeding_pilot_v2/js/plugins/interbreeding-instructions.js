(function () {
  "use strict";

  const I = window.Interbreeding;

  function populationMember(centerX) {
    const scale = .72;
    const translateX = Math.round((centerX - 260 * scale) * 10) / 10;
    return '<g transform="translate(' + translateX + ' 24) scale(' + scale + ')">' +
      '<ellipse class="creature-shadow" cx="260" cy="263" rx="145" ry="17"></ellipse>' +
      '<path class="creature-leg" d="M190 205 Q150 232 132 255 M218 220 Q194 251 186 270 M330 205 Q370 232 388 255 M302 220 Q326 251 334 270"></path>' +
      '<ellipse class="creature-body" cx="260" cy="187" rx="103" ry="71"></ellipse>' +
      '<circle class="creature-head" cx="260" cy="105" r="62"></circle>' +
      '<path class="creature-antenna" d="M230 63 Q195 31 163 28 M290 63 Q325 31 357 28"></path>' +
      '<circle class="antenna-tip" cx="160" cy="27" r="10"></circle><circle class="antenna-tip" cx="360" cy="27" r="10"></circle>' +
      '<circle class="creature-eye" cx="238" cy="101" r="7"></circle><circle class="creature-eye" cx="282" cy="101" r="7"></circle>' +
      '<path class="creature-face" d="M239 126 Q260 143 281 126"></path>' +
      '<path class="creature-mark" d="M205 170 Q260 135 315 170 M190 195 Q260 155 330 195"></path></g>';
  }

  function creatureVisual() {
    return '<svg class="intro-creature" viewBox="0 0 760 310" role="img" aria-label="Three similar unfamiliar animals representing one example population">' +
      populationMember(150) + populationMember(380) + populationMember(610) +
      '<rect class="visual-label-bg" x="277" y="263" width="206" height="31" rx="15"></rect><text class="visual-label" x="380" y="284">ONE EXAMPLE POPULATION</text></svg>';
  }

  function miniPopulationAnimal(x, y, scale, opacity) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + scale + ')" opacity="' + opacity + '"><ellipse class="mini-body" cx="0" cy="42" rx="24" ry="17"></ellipse><circle class="mini-head" cx="0" cy="18" r="15"></circle><path class="mini-line" d="M-7 8 Q-15 -4 -23 -5 M7 8 Q15 -4 23 -5 M-14 54 L-22 65 M14 54 L22 65"></path><circle class="mini-dot" cx="-24" cy="-6" r="3"></circle><circle class="mini-dot" cx="24" cy="-6" r="3"></circle></g>';
  }

  function populationCluster(x, opacity) {
    return miniPopulationAnimal(x - 33, 46, .72, opacity * .82) + miniPopulationAnimal(x, 30, .92, opacity) + miniPopulationAnimal(x + 33, 46, .72, opacity * .82);
  }

  function lineageVisual() {
    return '<svg class="intro-lineage" viewBox="0 0 760 270" role="img" aria-label="A whole animal population shown at Generation G0 and at later Generations G1 and G2">' +
      '<path class="lineage-path" d="M142 150 H618"></path>' + populationCluster(142, 1) + populationCluster(380, .88) + populationCluster(618, .76) +
      '<circle class="lineage-node founding" cx="142" cy="150" r="46"></circle><circle class="lineage-node" cx="380" cy="150" r="46"></circle><circle class="lineage-node" cx="618" cy="150" r="46"></circle>' +
      '<text class="lineage-generation" x="142" y="158">G0</text><text class="lineage-generation" x="380" y="158">G1</text><text class="lineage-generation" x="618" y="158">G2</text>' +
      '<text class="population-caption" x="142" y="214">POPULATION AT G0</text><text class="population-caption" x="380" y="214">POPULATION AT G1</text><text class="population-caption" x="618" y="214">POPULATION AT G2</text>' +
      '<text class="lineage-caption founding-caption" x="142" y="241">FOUNDING GENERATION</text><text class="lineage-caption" x="499" y="241">LATER GENERATIONS</text></svg>';
  }

  function antennaCloseup(length, label, note) {
    const leftX = 100 - length * .58;
    const rightX = 140 + length * .58;
    const topY = 72 - length * .72;
    return '<article class="trait-example"><span>' + label + '</span><svg viewBox="0 0 240 170" role="img" aria-label="' + note + '"><path class="feature-line" d="M100 82 L' + leftX + ' ' + topY + ' M140 82 L' + rightX + ' ' + topY + '"></path><circle class="feature-tip" cx="' + leftX + '" cy="' + topY + '" r="7"></circle><circle class="feature-tip" cx="' + rightX + '" cy="' + topY + '" r="7"></circle><circle class="feature-head" cx="120" cy="115" r="48"></circle><circle class="feature-eye" cx="102" cy="111" r="5"></circle><circle class="feature-eye" cx="138" cy="111" r="5"></circle><path class="feature-mouth" d="M104 132 Q120 143 136 132"></path></svg><strong>' + note + '</strong></article>';
  }

  function traitVisual() {
    return '<div class="trait-intro-comparison">' + antennaCloseup(35, "G0", "Shorter antennae") + '<span class="comparison-arrow" aria-hidden="true">→</span>' + antennaCloseup(62, "NEXT GENERATION", "Slightly longer antennae") + '</div>';
  }

  function dnaHelix(changed) {
    const rungs = [42, 66, 90, 114, 138, 162, 186];
    return '<svg class="dna-helix" viewBox="0 0 250 225" role="img" aria-label="' + (changed ? "A later generation DNA record with inherited differences" : "The G0 DNA record") + '"><path class="dna-rail one" d="M58 18 C195 60 55 165 192 207"></path><path class="dna-rail two" d="M192 18 C55 60 195 165 58 207"></path>' + rungs.map(function (y, index) {
      const wide = index % 2 === 0;
      const x1 = wide ? 77 : 92;
      const x2 = wide ? 173 : 158;
      return '<line class="dna-rung' + (changed && (index === 2 || index === 5) ? " changed" : "") + '" x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '"></line>';
    }).join("") + '</svg>';
  }

  function dnaVisual() {
    return '<div class="dna-comparison"><article><span>G0 DNA</span>' + dnaHelix(false) + '<strong>Founding DNA record</strong></article><span class="comparison-arrow" aria-hidden="true">→</span><article><span>LATER-GENERATION DNA</span>' + dnaHelix(true) + '<strong>Inherited DNA differences</strong></article></div>';
  }

  function purposeIcon(type) {
    if (type === "air") {
      return '<svg viewBox="0 0 230 160" role="img" aria-label="Antennae detecting air movement"><path class="purpose-head" d="M82 133 Q115 79 148 133Z"></path><path class="purpose-antenna" d="M103 102 Q77 63 49 49 M127 102 Q153 63 181 49"></path><circle class="purpose-tip" cx="47" cy="48" r="6"></circle><circle class="purpose-tip" cx="183" cy="48" r="6"></circle><path class="air-line" d="M17 37 Q42 19 69 36 M13 71 Q39 53 72 67 M158 28 Q185 10 214 29 M163 68 Q192 47 218 66"></path></svg>';
    }
    return '<svg viewBox="0 0 230 160" role="img" aria-label="Antennae helping locate food"><path class="purpose-head" d="M64 138 Q97 84 130 138Z"></path><path class="purpose-antenna" d="M85 107 Q62 70 42 56 M109 107 Q137 65 168 48"></path><circle class="purpose-tip" cx="40" cy="55" r="6"></circle><circle class="purpose-tip" cx="170" cy="47" r="6"></circle><circle class="food-berry" cx="189" cy="58" r="13"></circle><circle class="food-berry" cx="208" cy="76" r="12"></circle><circle class="food-berry" cx="180" cy="84" r="12"></circle><path class="food-stem" d="M190 46 Q197 27 213 24"></path><path class="attention-line" d="M145 65 L154 60 M148 82 L159 82 M138 49 L145 41"></path></svg>';
  }

  function purposeVisual() {
    return '<div class="purpose-comparison"><article><span>G0 DOCUMENTED PURPOSE</span>' + purposeIcon("air") + '<strong>Detect air movement</strong></article><span class="comparison-arrow" aria-hidden="true">→</span><article><span>A LATER DOCUMENTED PURPOSE</span>' + purposeIcon("food") + '<strong>Locate food</strong></article></div>';
  }

  function compoundPoint(x, y) {
    return '<circle class="intro-equal-point" cx="' + x + '" cy="' + y + '" r="9"></circle>' +
      '<path class="intro-equal-diamond" d="M' + x + ' ' + (y - 6) + ' L' + (x + 6) + ' ' + y + ' L' + x + ' ' + (y + 6) + ' L' + (x - 6) + ' ' + y + 'Z"></path>';
  }

  function graphKey(order) {
    const dna = '<span><i class="dna-key-mark"></i>Evidence of DNA change</span>';
    const purpose = '<span><i class="purpose-key-mark"></i>Evidence of purpose change</span>';
    return order === "purpose_first" ? purpose + dna : dna + purpose;
  }

  function singleGraphKey(kind) {
    return kind === "purpose" ? '<span><i class="purpose-key-mark"></i>Evidence of purpose change</span>' : '<span><i class="dna-key-mark"></i>Evidence of DNA change</span>';
  }

  function graphAxes(arrowId) {
    return '<defs><marker id="' + arrowId + '" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10Z"></path></marker></defs>' +
      '<path class="intro-axis" d="M105 238 V40 M105 238 H674" marker-end="url(#' + arrowId + ')"></path>' +
      '<text class="intro-axis-word" x="89" y="224" text-anchor="end"><tspan x="89">NO EVIDENCE</tspan><tspan x="89" dy="14">OF CHANGE</tspan></text>' +
      '<text class="intro-axis-word" x="82" y="47" text-anchor="middle"><tspan x="82">STRONGER</tspan><tspan x="82" dy="14">EVIDENCE</tspan></text>' +
      '<text class="graph-generation" x="105" y="268">G0</text><text class="graph-generation" x="310" y="268">G1</text><text class="graph-generation" x="520" y="268">G2</text>';
  }

  function dnaPoint(x, y) {
    return '<circle class="intro-dna-point" cx="' + x + '" cy="' + y + '" r="8"></circle>';
  }

  function purposePoint(x, y) {
    return '<path class="intro-purpose-point" d="M' + x + ' ' + (y - 7) + ' L' + (x + 7) + ' ' + y + ' L' + x + ' ' + (y + 7) + ' L' + (x - 7) + ' ' + y + 'Z"></path>';
  }

  function singleEvidenceLineVisual(kind) {
    const purpose = kind === "purpose";
    const lineClass = purpose ? "intro-purpose-line" : "intro-dna-line";
    const label = purpose ? "Evidence of purpose change" : "Evidence of DNA change";
    const point = purpose ? purposePoint : dnaPoint;
    return '<div class="intro-graph-wrap single-evidence-graph"><div class="intro-graph-key">' + singleGraphKey(kind) + '</div>' +
      '<svg class="intro-graph" viewBox="0 0 760 300" role="img" aria-label="' + label + ' becoming stronger from G0 to G2">' + graphAxes("intro-single-arrow-" + kind) +
      '<path class="' + lineClass + '" d="M105 238 C205 238 210 218 310 218 C405 218 430 145 520 145"></path>' +
      point(105, 238) + point(310, 218) + point(520, 145) + '</svg></div>';
  }

  function purposeLineVisual() { return singleEvidenceLineVisual("purpose"); }
  function dnaLineVisual() { return singleEvidenceLineVisual("dna"); }

  function combinedGraphVisual(mode, order) {
    const equal = mode === "equal";
    const dnaY = equal ? 155 : mode === "purpose_earlier" ? 195 : mode === "dna_earlier" ? 135 : 158;
    const purposeY = equal ? 155 : mode === "purpose_earlier" ? 135 : mode === "dna_earlier" ? 195 : 186;
    const sharedPath = "M105 238 C205 238 210 216 310 216";
    const dnaFinalTransform = equal ? ' transform="translate(0 -3)"' : "";
    const purposeFinalTransform = equal ? ' transform="translate(0 3)"' : "";
    const histories = '<path class="intro-dna-line intro-equal-track" transform="translate(0 -3)" d="' + sharedPath + '"></path><path class="intro-purpose-line intro-equal-track" transform="translate(0 3)" d="' + sharedPath + '"></path>' + compoundPoint(105, 238) + compoundPoint(310, 216) +
      '<path class="intro-dna-line intro-diverging-segment' + (equal ? " intro-equal-track" : "") + '"' + dnaFinalTransform + ' d="M310 216 C405 216 430 ' + dnaY + ' 520 ' + dnaY + '"></path>' +
      '<path class="intro-purpose-line intro-diverging-segment' + (equal ? " intro-equal-track" : "") + '"' + purposeFinalTransform + ' d="M310 216 C405 216 430 ' + purposeY + ' 520 ' + purposeY + '"></path>' +
      (equal ? compoundPoint(520, dnaY) : dnaPoint(520, dnaY) + purposePoint(520, purposeY));
    const aria = equal ? "DNA and purpose evidence have the same strength at G2" : mode === "dna_earlier" ? "DNA evidence strengthens sooner than purpose evidence" : mode === "purpose_earlier" ? "Purpose evidence strengthens sooner than DNA evidence" : "DNA and purpose evidence shown together";
    return '<div class="intro-graph-wrap"><div class="intro-graph-key">' + graphKey(order) + '</div><svg class="intro-graph" viewBox="0 0 760 300" role="img" aria-label="' + aria + '">' + graphAxes("intro-combined-arrow-" + mode) + histories + '</svg></div>';
  }

  function togetherVisual(order) { return combinedGraphVisual("together", order); }
  function equalVisual(order) { return combinedGraphVisual("equal", order); }
  function dnaEarlierVisual(order) { return combinedGraphVisual("dna_earlier", order); }
  function purposeEarlierVisual(order) { return combinedGraphVisual("purpose_earlier", order); }

  function decisionVisual() {
    return '<div class="decision-intro"><div class="current-generation"><span>CURRENT GENERATION</span><strong>G2</strong><small>Review all of the evidence revealed so far</small></div><div class="intro-choice-row"><article class="intro-choice continue"><span>CONTINUE CURRENT SPECIES</span><strong>G2 remains in the current species</strong><small>Record G2 as another generation of the current species.</small></article><article class="intro-choice distinct"><span>BEGIN DISTINCT SPECIES</span><strong>G2 is the first distinct generation</strong><small>Record G2 as the beginning of a distinct species.</small></article></div></div>';
  }

  function procedureTraitIcon(x, generation) {
    const rise = generation * 2.2;
    const leftX = x - 10 - generation * 1.4;
    const rightX = x + 10 + generation * 1.4;
    const tipY = 181 - rise;
    return '<rect class="procedure-trait-frame" x="' + (x - 25) + '" y="159" width="50" height="36" rx="7"></rect>' +
      '<path class="procedure-antenna-stem" d="M' + (x - 5) + ' 190 Q' + (x - 7) + ' 179 ' + leftX + ' ' + tipY + ' M' + (x + 5) + ' 190 Q' + (x + 7) + ' 179 ' + rightX + ' ' + tipY + '"></path>' +
      '<circle class="procedure-antenna-tip" cx="' + leftX + '" cy="' + tipY + '" r="2.6"></circle><circle class="procedure-antenna-tip" cx="' + rightX + '" cy="' + tipY + '" r="2.6"></circle>';
  }

  function procedurePoint(kind, x, y) {
    return kind === "dna"
      ? '<circle class="procedure-dna-point" cx="' + x + '" cy="' + y + '" r="5"></circle>'
      : '<path class="procedure-purpose-point" d="M' + x + ' ' + (y - 5) + ' L' + (x + 5) + ' ' + y + ' L' + x + ' ' + (y + 5) + ' L' + (x - 5) + ' ' + y + 'Z"></path>';
  }

  function procedureTaskGraph(mode) {
    const boundary = mode === "boundary";
    const continued = mode === "continued";
    const current = boundary ? 3 : 2;
    const xs = [92, 252, 412, 572];
    const dnaYs = [132, 126, 101, 86];
    const purposeYs = [132, 126, 113, 98];
    const axisEnd = boundary ? 650 : 490;
    let ticks = "";
    let traits = "";
    let nodes = "";
    let connectors = "";
    for (let generation = 0; generation <= current; generation += 1) {
      const x = xs[generation];
      const status = generation === 0 ? "Founding" : generation < current || continued ? "Continued" : "Current";
      const preview = boundary && generation === 3;
      ticks += '<line class="procedure-x-tick" x1="' + x + '" y1="132" x2="' + x + '" y2="140"></line><text class="procedure-generation-label" x="' + x + '" y="151">G' + generation + '</text>';
      traits += procedureTraitIcon(x, generation);
      if (generation > 0) connectors += '<line class="procedure-lineage-connector' + (preview ? " boundary" : "") + '" x1="' + (xs[generation - 1] + 35) + '" y1="218" x2="' + (x - 35) + '" y2="' + (preview ? 223 : 218) + '"></line>';
      nodes += '<g class="procedure-generation-node' + (generation === current ? " current" : "") + (preview ? " boundary" : "") + '" transform="translate(0 ' + (preview ? 5 : 0) + ')"><rect x="' + (x - 34) + '" y="201" width="68" height="34" rx="8"></rect><text class="procedure-node-generation" x="' + x + '" y="215">G' + generation + '</text><text class="procedure-node-status" x="' + x + '" y="228">' + status + '</text>' + (continued && generation === 2 ? '<text class="procedure-lock-mark" x="' + (x + 27) + '" y="210">✓</text>' : "") + (preview ? '<text class="procedure-boundary-label" x="' + x + '" y="247">Distinct species begins</text>' : "") + '</g>';
    }
    const pathEnd = current === 3 ? ' C482 101 512 86 572 86' : "";
    const purposeEnd = current === 3 ? ' C482 113 512 98 572 98' : "";
    let points = "";
    for (let index = 0; index <= current; index += 1) points += procedurePoint("dna", xs[index], dnaYs[index]) + procedurePoint("purpose", xs[index], purposeYs[index]);
    return '<svg class="procedure-task-graph" viewBox="0 0 740 255" role="img" aria-label="The task graph through Generation G' + current + '">' +
      '<defs><marker id="procedure-axis-arrow-' + mode + '" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10Z"></path></marker></defs>' +
      '<rect class="procedure-active-column" x="' + (xs[current] - 42) + '" y="8" width="84" height="241" rx="14"></rect>' +
      '<line class="procedure-axis" x1="92" y1="132" x2="92" y2="23" marker-end="url(#procedure-axis-arrow-' + mode + ')"></line><line class="procedure-axis" x1="92" y1="132" x2="' + axisEnd + '" y2="132" marker-end="url(#procedure-axis-arrow-' + mode + ')"></line>' +
      '<text class="procedure-axis-label" x="81" y="38" text-anchor="end"><tspan x="81">Stronger evidence</tspan><tspan x="81" dy="12">of change from G0</tspan></text><text class="procedure-axis-label" x="81" y="121" text-anchor="end"><tspan x="81">No evidence</tspan><tspan x="81" dy="12">of change</tspan></text>' + ticks +
      '<path class="procedure-dna-line" d="M92 129 C160 129 190 123 252 123 C322 123 352 98 412 98' + pathEnd + '"></path><path class="procedure-purpose-line" d="M92 135 C160 135 190 129 252 129 C322 129 352 113 412 113' + purposeEnd + '"></path>' + points +
      '<rect class="procedure-trait-band" x="55" y="156" width="' + (axisEnd - 15) + '" height="91" rx="13"></rect><text class="procedure-trait-label" x="68" y="169">TYPICAL POPULATION ANTENNA LENGTH BY GENERATION</text>' + connectors + traits + nodes + '</svg>';
  }

  function procedureDecisionPanel(mode) {
    const boundary = mode === "boundary";
    const continued = mode === "continued";
    const generation = boundary ? 3 : 2;
    if (continued) {
      return '<div class="procedure-demo-decision recorded"><div><span>CATEGORIZATION JUDGMENT · G2</span><strong>Generation G2 recorded as part of the current species.</strong><small>You cannot return and make G2 the beginning of a distinct species.</small></div><aside><i aria-hidden="true"></i><b>Revealing what comes next…</b></aside></div>';
    }
    const decision = '<div class="procedure-demo-decision"><div><span>CATEGORIZATION JUDGMENT · G' + generation + '</span><strong>Does Generation G' + generation + ' remain in the current species?</strong><small>Use only the history revealed so far.</small></div><section><article class="procedure-demo-choice"><b>Continue current species</b><small>Record G' + generation + ' as current species; reveal what comes next.</small></article><article class="procedure-demo-choice distinct' + (boundary ? " selected" : "") + '"><b>Begin distinct species</b><small>Record G' + generation + ' as the first distinct generation.</small></article></section></div>';
    if (!boundary) return decision;
    return decision + '<div class="procedure-demo-confirmation"><div><span>CONFIRM YOUR JUDGMENT</span><strong>Begin a distinct species at G3?</strong><small>G3 will be recorded as the first generation of a distinct species.</small></div><section><i>Review current generation</i><b>Confirm distinct species</b></section></div>';
  }

  function procedureTaskVisual(mode, order) {
    const annotation = mode === "hidden"
      ? '<aside class="procedure-task-annotation hidden"><strong>Later evidence is not shown yet</strong><span>The graph and lineage stop at the generation awaiting judgment.</span></aside>'
      : mode === "continued"
        ? '<aside class="procedure-task-annotation continued"><strong>G2 is now permanently recorded</strong><span>The next generation appears only after this message.</span></aside>'
        : "";
    return '<div class="procedure-task-demo ' + mode + '"><header><strong>Evidence across generations</strong><div class="procedure-task-key">' + graphKey(order) + '</div></header><div class="procedure-task-master">' + procedureTaskGraph(mode) + annotation + '</div><div class="procedure-decision-wrap">' + procedureDecisionPanel(mode) + '</div></div>';
  }

  function hiddenFutureVisual(order) {
    return procedureTaskVisual("hidden", order);
  }

  function continueFinalVisual(order) {
    return procedureTaskVisual("continued", order);
  }

  function boundaryNowVisual(order) {
    return procedureTaskVisual("boundary", order);
  }

  function checkQuestion(id, number, question, correct, incorrect, answered) {
    return '<article class="comprehension-question' + (answered ? " answered" : "") + '" data-comprehension-question="' + id + '"><span>CHECK ' + number + '</span><h2>' + question + '</h2><div>' +
      '<button type="button" class="check-option' + (answered ? " selected-correct" : "") + '" data-check-question="' + id + '" data-check-correct="true" ' + (answered ? "disabled" : "") + '>' + correct + '</button>' +
      '<button type="button" class="check-option" data-check-question="' + id + '" data-check-correct="false" ' + (answered ? "disabled" : "") + '>' + incorrect + '</button></div>' +
      '<small class="check-feedback" aria-live="polite">' + (answered ? "That’s right." : "Choose one answer.") + '</small></article>';
  }

  function comprehensionVisual(order, state) {
    const completed = state || {};
    const correctLineKey = order === "purpose_first"
      ? "Orange shows purpose differences from G0; blue shows inherited DNA differences from G0."
      : "Blue shows inherited DNA differences from G0; orange shows purpose differences from G0.";
    const incorrectLineKey = order === "purpose_first"
      ? "Orange shows inherited DNA differences from G0; blue shows purpose differences from G0."
      : "Blue shows purpose differences from G0; orange shows inherited DNA differences from G0.";
    return '<div class="comprehension-checks">' +
      checkQuestion("line_key", 1, "Which description of the evidence lines is correct?", correctLineKey, incorrectLineKey, Boolean(completed.line_key)) +
      checkQuestion("decision_timing", 2, "If you think G4 is the first generation of a distinct species, what should you do at G4?", "Choose “Begin distinct species” and confirm the decision now.", "Continue to later generations and return to G4 afterward.", Boolean(completed.decision_timing)) +
      '</div>';
  }

  const FIRST_PAGES = [
    {
      id: "populations",
      title: "You will follow several separate animal populations",
      text: "For each population, you will see its history across generations and decide when—if ever—you would classify a generation as the beginning of a distinct species.",
      visual: creatureVisual,
      visualClass: "creature-stage"
    },
    {
      id: "generations",
      title: "Each population history begins at Generation G0",
      text: "The population begins at G0, the founding generation. Each later generation descends from the generation before it. The group of animals at each generation represents the whole population—not one individual animal.",
      visual: lineageVisual,
      visualClass: "lineage-stage"
    },
    {
      id: "trait",
      title: "First, researchers track a visible trait",
      text: function (order) { return "In this example, researchers track antenna length. The small image at each generation shows the typical form of that trait in the whole population. Researchers also compare evidence about " + (order === "purpose_first" ? "purpose and DNA" : "DNA and purpose") + ", which will be introduced one step at a time."; },
      visual: traitVisual,
      visualClass: "trait-stage"
    }
  ];

  const DNA_PAGES = [
    {
      id: "dna_records",
      title: "Researchers compare inherited DNA records",
      text: "At G0, researchers record the population’s founding DNA. For every later generation, they compare inherited DNA records with that founding record.",
      visual: dnaVisual,
      visualClass: "dna-stage"
    },
    {
      id: "dna_line",
      title: "The blue line shows evidence of DNA change",
      text: "Researchers summarize those comparisons in a blue evidence history. When the blue line rises, there is stronger evidence that later generations have inherited DNA differences from G0.",
      visual: dnaLineVisual,
      visualClass: "single-evidence-stage dna-line-stage"
    }
  ];

  const PURPOSE_PAGES = [
    {
      id: "purpose_records",
      title: "Researchers document the purpose served by the trait",
      text: "Researchers document what the focal trait is used for at G0. In later generations, they examine whether the trait continues serving that purpose or serves a different one.",
      visual: purposeVisual,
      visualClass: "purpose-stage"
    },
    {
      id: "purpose_line",
      title: "The orange line shows evidence of purpose change",
      text: "Researchers summarize those observations in an orange evidence history. When the orange line rises, there is stronger evidence that the trait serves a different purpose than it served at G0.",
      visual: purposeLineVisual,
      visualClass: "single-evidence-stage purpose-line-stage"
    }
  ];

  const DNA_EARLIER_PAGE = {
    id: "dna_stronger",
    title: "DNA evidence can become stronger sooner",
    text: "Here, the blue line rises more sharply. By G2, evidence of DNA change is stronger than evidence of purpose change.",
    visual: dnaEarlierVisual,
    visualClass: "comparison-evidence-stage"
  };

  const PURPOSE_EARLIER_PAGE = {
    id: "purpose_stronger",
    title: "Purpose evidence can become stronger sooner",
    text: "Here, the orange line rises more sharply. By G2, evidence of purpose change is stronger than evidence of DNA change.",
    visual: purposeEarlierVisual,
    visualClass: "comparison-evidence-stage"
  };

  const FINAL_PAGES = [
    {
      id: "combined_graph",
      title: "The two evidence histories appear together",
      text: "In the task, the blue and orange histories appear on the same unnumbered evidence-strength scale. Use the large legend above the graph to track which history is which.",
      visual: togetherVisual,
      visualClass: "combined-evidence-stage"
    },
    {
      id: "equal_evidence",
      title: "The two histories can show equal evidence strength",
      text: "When the two points have the same height, evidence of DNA change and purpose change is equally strong at that generation. To keep both solid lines visible, they are shown as two very close tracks centered on the same underlying position. This small separation does not mean that one is stronger.",
      visual: equalVisual,
      visualClass: "equal-evidence-stage"
    },
    {
      id: "classification",
      title: "Use the graph to make your judgment",
      text: "The graph has no marked threshold. Its unnumbered lines summarize the strength of the evidence; they are not percentages. Use the pattern of evidence revealed so far to make your own classification.",
      visual: decisionVisual,
      visualClass: "decision-stage"
    },
    {
      id: "future_hidden",
      title: "Judge the current generation before seeing what comes next",
      text: "Only the evidence revealed through the current generation is available. If another generation remains, it appears only after your current judgment has been recorded.",
      visual: hiddenFutureVisual,
      visualClass: "procedure-stage"
    },
    {
      id: "continue_is_final",
      title: "Continuing permanently classifies that generation",
      text: "Selecting Continue records the current generation as part of the current species. You cannot return later and make that generation the beginning of a distinct species.",
      visual: continueFinalVisual,
      visualClass: "procedure-stage"
    },
    {
      id: "choose_boundary_now",
      title: "Choose the boundary when it first appears",
      text: "If the current generation is the first one you judge to belong to a distinct species, select Begin distinct species at that generation. After confirmation, the boundary is recorded and the population history ends.",
      visual: boundaryNowVisual,
      visualClass: "procedure-stage"
    },
    {
      id: "checks",
      title: "Two quick checks before you begin",
      text: "Choose the best answer to each question. Both must be correct before the study begins.",
      visual: comprehensionVisual,
      visualClass: "comprehension-stage",
      requiresComprehension: true
    }
  ];

  function pagesFor(order) {
    const evidencePages = order === "purpose_first" ? PURPOSE_PAGES.concat(DNA_PAGES) : DNA_PAGES.concat(PURPOSE_PAGES);
    const comparisonPages = order === "purpose_first" ? [PURPOSE_EARLIER_PAGE, DNA_EARLIER_PAGE] : [DNA_EARLIER_PAGE, PURPOSE_EARLIER_PAGE];
    return FIRST_PAGES.concat(evidencePages, FINAL_PAGES.slice(0, 2), comparisonPages, FINAL_PAGES.slice(2));
  }

  class InterbreedingInstructionsPlugin {
    static info = {
      name: "interbreeding-sixteen-screen-introduction",
      version: "40.0.0",
      parameters: {},
      data: {}
    };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(displayElement) {
      this.root = displayElement;
      this.page = 0;
      this.comprehension = { line_key: false, decision_timing: false };
      this.startedAt = performance.now();
      this.pageStartedAt = this.startedAt;
      this.pageViews = 0;
      this.data = window.interbreedingStudyData;
      this.evidenceOrder = (window.interbreedingAssignment && window.interbreedingAssignment.evidence_intro_order) || "genetic_first";
      this.pages = pagesFor(this.evidenceOrder);
      document.title = "Introduction · " + I.Config.STUDY_TITLE;
      this.write("introduction_started", { introduction_screen_count: this.pages.length });
      this.render();
    }

    write(type, row) {
      if (this.data) this.data.write(type, Object.assign({ introduction: true }, row || {}));
    }

    render() {
      const page = this.pages[this.page];
      const dots = this.pages.map((unused, index) => '<i class="intro-progress-dot' + (index === this.page ? " active" : index < this.page ? " complete" : "") + '"></i>').join("");
      this.pageViews += 1;
      this.pageStartedAt = performance.now();
      const pageText = typeof page.text === "function" ? page.text(this.evidenceOrder) : page.text;
      const nextLabel = this.page === this.pages.length - 1 ? "Begin study" : "Continue";
      const comprehensionComplete = this.comprehension.line_key && this.comprehension.decision_timing;
      const nextDisabled = page.requiresComprehension && !comprehensionComplete ? " disabled" : "";
      this.root.innerHTML = '<main class="study-flow introduction-flow" data-introduction-page="' + (this.page + 1) + '" data-introduction-screen="' + page.id + '"><section class="intro-card">' +
        '<header class="intro-topbar"><span>Introduction</span><div class="intro-progress" aria-label="Introduction screen ' + (this.page + 1) + ' of ' + this.pages.length + '">' + dots + '<strong>' + (this.page + 1) + ' of ' + this.pages.length + '</strong></div></header>' +
        '<div class="intro-content"><div class="intro-copy"><h1>' + page.title + '</h1><p>' + pageText + '</p></div><div class="intro-visual-stage ' + page.visualClass + '">' + page.visual(this.evidenceOrder, this.comprehension) + '</div></div>' +
        '<footer class="intro-footer">' + (this.page ? '<button type="button" class="intro-back" data-intro-back>Back</button>' : '<span></span>') + '<button type="button" class="primary-flow-button" data-intro-next' + nextDisabled + '>' + nextLabel + '</button></footer>' +
        '</section></main>';
      const next = this.root.querySelector("[data-intro-next]");
      next.addEventListener("click", () => this.advance());
      const back = this.root.querySelector("[data-intro-back]");
      if (back) back.addEventListener("click", () => this.goBack());
      this.root.querySelectorAll("[data-check-question]").forEach((button) => button.addEventListener("click", () => this.handleCheck(button)));
      if (!next.disabled) next.focus({ preventScroll: true });
      this.write("introduction_screen_shown", {
        screen_number: this.page + 1,
        screen_id: page.id,
        screen_title: page.title,
        page_view_number: this.pageViews
      });
    }

    recordExit(direction) {
      this.write("introduction_screen_exited", {
        screen_number: this.page + 1,
        screen_id: this.pages[this.page].id,
        screen_title: this.pages[this.page].title,
        direction: direction,
        screen_rt: Math.round(performance.now() - this.pageStartedAt)
      });
    }

    advance() {
      if (this.pages[this.page].requiresComprehension && !(this.comprehension.line_key && this.comprehension.decision_timing)) return;
      this.recordExit("forward");
      if (this.page < this.pages.length - 1) {
        this.page += 1;
        this.render();
        return;
      }
      const totalRt = Math.round(performance.now() - this.startedAt);
      this.write("introduction_completed", { introduction_screen_count: this.pages.length, page_view_count: this.pageViews, introduction_rt: totalRt });
      this.jsPsych.finishTrial({ trial_type: "fourteen_screen_introduction", introduction: true, screens_viewed: this.pages.length, page_view_count: this.pageViews, rt: totalRt });
    }

    handleCheck(button) {
      const question = button.dataset.checkQuestion;
      const correct = button.dataset.checkCorrect === "true";
      const card = button.closest("[data-comprehension-question]");
      const feedback = card.querySelector(".check-feedback");
      card.querySelectorAll(".check-option").forEach(function (option) { option.classList.remove("selected-wrong"); });
      if (!correct) {
        button.classList.add("selected-wrong");
        feedback.textContent = "Take another look.";
        return;
      }
      this.comprehension[question] = true;
      card.classList.add("answered");
      button.classList.add("selected-correct");
      card.querySelectorAll(".check-option").forEach(function (option) { option.disabled = true; });
      feedback.textContent = "That’s right.";
      const next = this.root.querySelector("[data-intro-next]");
      if (this.comprehension.line_key && this.comprehension.decision_timing) {
        next.disabled = false;
        next.focus({ preventScroll: true });
      }
    }

    goBack() {
      if (this.page === 0) return;
      this.recordExit("back");
      this.page -= 1;
      this.render();
    }
  }

  window.InterbreedingInstructionsPlugin = InterbreedingInstructionsPlugin;
})();
