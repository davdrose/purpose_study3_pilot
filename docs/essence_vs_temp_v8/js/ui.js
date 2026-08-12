(function () {
  "use strict";

  const Config = window.EssenceStudy.Config;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function progress(step, total) {
    if (!step || !total) return "";
    const percent = Math.max(0, Math.min(100, (step / total) * 100));
    return '<div class="study-progress" aria-label="Study progress">' +
      '<div class="study-progress__track"><span style="width:' + percent + '%"></span></div>' +
      '<p>' + step + ' of ' + total + '</p>' +
      '</div>';
  }

  function shell(options) {
    const wide = options.wide ? " study-card--wide" : "";
    const compact = options.compact ? " study-card--compact" : "";
    const centered = options.centered ? " study-card--centered" : "";
    return '<main class="study-shell">' +
      '<header class="study-header">' +
        progress(options.step, options.total) +
      '</header>' +
      '<section class="study-card' + wide + compact + centered + '">' +
        (options.eyebrow ? '<p class="eyebrow">' + escapeHtml(options.eyebrow) + '</p>' : '') +
        (options.title ? '<h1>' + options.title + '</h1>' : '') +
        (options.lede ? '<p class="lede">' + options.lede + '</p>' : '') +
        (options.content || '') +
      '</section>' +
    '</main>';
  }

  function primaryButton(label, attributes) {
    return '<button class="button button--primary" ' + (attributes || "") + '>' + escapeHtml(label) +
      '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4"/></svg></button>';
  }

  function consent(assignment) {
    return shell({
      assignment: assignment,
      wide: true,
      eyebrow: "Before you begin",
      title: "Consent form",
      lede: "Please read the information below and choose whether you would like to participate.",
      content: '<div class="consent-copy">' +
        '<p>Thank you for agreeing to take part in this study. We appreciate your time and effort. In this study, we will present you with a fictional scenario, and then we will ask you to answer a brief series of questions about that scenario. The questions have no right or wrong answers—we’re exploring features of human psychology in this research.</p>' +
        '<div class="consent-facts"><div><strong>About 4 minutes</strong><span>Estimated time</span></div><div><strong>$0.80</strong><span>Compensation</span></div><div><strong>Voluntary</strong><span>Stop at any time</span></div></div>' +
        '<p>You will be paid $0.80 for your time and effort. We do not anticipate any risks from participating in this research. While you will not directly benefit from taking part, we hope society and the scientific community will benefit from the knowledge gained about human psychology and judgment.</p>' +
        '<p>Your participation is voluntary and you can stop at any time. Withdrawal or refusal to participate will not result in any penalty. You do not waive any legal rights or release any agent from liability for negligence by consenting to participate.</p>' +
        '<p>The research data will be collected confidentially. We will not ask for your name or email address. Your Prolific ID is collected only to connect your participation with this study. We anticipate that participating presents no greater risk than everyday internet use, though information shared online always carries a possible risk of intrusion by outside agents.</p>' +
        '<p>If you have questions about the study, contact Shaun Nichols at <a href="mailto:sbn44@cornell.edu">sbn44@cornell.edu</a>. For questions about your rights as a participant, contact Cornell University’s Institutional Review Board at 607-255-5138 or visit <a href="https://researchservices.cornell.edu/offices/IRB" target="_blank" rel="noopener">the IRB website</a>. You may report concerns anonymously through <a href="https://www.hotline.cornell.edu" target="_blank" rel="noopener">EthicsPoint</a> or at 1-866-293-3077.</p>' +
      '</div>' +
      '<form id="consent-form" class="study-form">' +
        '<fieldset class="choice-fieldset"><legend>If you consent to take part, please indicate so below:</legend>' +
          radioCard("consent", "yes", "I consent, begin the study", "I have read the information above and agree to participate.") +
          radioCard("consent", "no", "I do not consent", "I do not wish to participate in this study.") +
        '</fieldset>' +
        '<div class="form-error" role="alert" hidden>Please select an option to continue.</div>' +
        '<div class="form-actions">' + primaryButton("Continue", 'type="submit"') + '</div>' +
      '</form>'
    });
  }

  function intro(assignment, step, total) {
    return shell({
      assignment: assignment,
      step: step,
      total: total,
      compact: true,
      eyebrow: "Instructions",
      title: "Think about what makes things what they are",
      lede: "In this study, you will be asked about features of various kinds of things.",
      content: '<div class="instruction-panel"><strong>There are no right or wrong answers.</strong><p>We are interested in your own judgment.</p></div>' +
        '<div class="form-actions">' + primaryButton("Begin", 'id="continue-button" type="button"') + '</div>'
    });
  }

  function stimulusTrial(assignment, stimulus, trialIndex, step, total) {
    const statement = window.EssenceStudy.Stimuli.statement(stimulus, assignment.condition);
    return '<main class="plain-trial">' +
      '<p class="plain-trial__progress">' + (trialIndex + 1) + ' / 8</p>' +
      '<section class="plain-trial__content">' +
        '<div class="plain-trial__image"><img src="' + escapeHtml(stimulus.image) + '" alt="Photograph of ' + escapeHtml(stimulus.plural) + '"></div>' +
        '<form id="stimulus-form" class="plain-trial__form">' +
          '<div class="plain-trial__question"><p>Please indicate the extent to which you agree with the following statement:</p><blockquote>' + emphasizeEssence(statement) + '</blockquote></div>' +
          slider("rating") +
          '<div class="form-error" role="alert" hidden>You must move the slider before continuing.</div>' +
          '<div class="plain-trial__actions"><button class="trial-next" type="submit" aria-label="Continue" hidden disabled>&rarr;</button></div>' +
        '</form>' +
      '</section>' +
    '</main>';
  }

  function generalQuestion(assignment, step, total) {
    const purpose = assignment.condition === "purpose";
    const question = purpose
      ? "Consider all the animals on our planet. Do you think each kind of animal has a purpose?"
      : "Consider all the animals on our planet. Do you think each kind of animal has a temperature?";
    return shell({
      assignment: assignment,
      step: step,
      total: total,
      compact: true,
      centered: true,
      title: question,
      content: '<form id="general-form" class="study-form">' +
        '<fieldset class="choice-fieldset choice-fieldset--horizontal"><legend class="sr-only">Choose yes or no</legend>' +
          radioCard("general", "yes", "Yes", "") + radioCard("general", "no", "No", "") +
        '</fieldset>' +
        '<div class="form-error" role="alert" hidden>Please select an answer to continue.</div>' +
        '<div class="form-actions">' + primaryButton("Continue", 'type="submit"') + '</div>' +
      '</form>'
    });
  }

  function attentionQuestion(assignment, step, total) {
    return shell({
      assignment: assignment,
      step: step,
      total: total,
      compact: true,
      centered: true,
      title: "Please indicate the extent to which you agree with the following sentence:",
      content: '<form id="attention-form" class="study-form attention-form">' +
        '<p class="attention-statement">Twenty-one is an even number.</p>' +
        '<fieldset class="choice-fieldset choice-fieldset--horizontal"><legend class="sr-only">Choose yes or no</legend>' +
          radioCard("attention", "yes", "Yes", "") + radioCard("attention", "no", "No", "") +
        '</fieldset>' +
        '<div class="form-error" role="alert" hidden>Please select an answer to continue.</div>' +
        '<div class="form-actions">' + primaryButton("Continue", 'type="submit"') + '</div>' +
      '</form>'
    });
  }

  function demographics(assignment, step, total) {
    return shell({
      assignment: assignment,
      step: step,
      total: total,
      wide: true,
      centered: true,
      title: "Demographic questions",
      content: '<form id="demographics-form" class="study-form demographics-form">' +
        '<div class="demographics-grid">' +
          selectField("sex", "Please indicate your sex.", Config.SEX_CHOICES, true) +
          '<label class="text-field"><span>Please indicate your age (in years)</span><input id="age" name="age" type="number" inputmode="numeric" min="18" max="120" required></label>' +
          selectField("race", "What is your race/ethnicity?", Config.RACE_CHOICES, true) +
        '</div>' +
        '<div class="form-error" role="alert" hidden>Please answer each required question.</div>' +
        '<div class="form-actions">' + primaryButton("Continue", 'type="submit"') + '</div>' +
      '</form>'
    });
  }

  function sending(assignment) {
    return shell({
      assignment: assignment,
      compact: true,
      eyebrow: "Saving responses",
      title: "Just a moment…",
      lede: "Please keep this tab open while your responses are submitted.",
      content: '<div class="sending-indicator" aria-label="Submitting"><i></i><i></i><i></i></div>'
    });
  }

  function complete(assignment, summary, remoteSaved) {
    const remoteCopy = remoteSaved
      ? "Your responses were saved. Continue to Prolific to record your completion."
      : "Your responses have been recorded for this local test.";
    return shell({
      assignment: assignment,
      compact: true,
      eyebrow: "Study complete",
      title: "Thank you for participating",
      lede: remoteCopy,
      content: '<div class="completion-check" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="m14 25 7 7 14-16"/></svg></div>' +
        (remoteSaved
          ? '<div class="form-actions">' + primaryButton("Continue to Prolific", 'id="prolific-button" type="button"') + '</div>'
          : '')
    });
  }

  function submissionError(assignment, message) {
    return shell({
      assignment: assignment,
      compact: true,
      eyebrow: "Connection problem",
      title: "Your responses have not been submitted yet",
      lede: "Your responses are still available in this tab. Please try again.",
      content: '<p class="technical-note">' + escapeHtml(message) + '</p><div class="form-actions"><button class="button button--primary" id="retry-submit" type="button">Try again</button></div>'
    });
  }

  function declined(assignment) {
    return shell({
      assignment: assignment,
      compact: true,
      eyebrow: "Participation declined",
      title: "You have not joined the study",
      lede: "No further study responses will be collected. You may close this tab.",
      content: '<div class="completion-check completion-check--neutral" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M15 24h18"/></svg></div>'
    });
  }

  function fatal(message) {
    return '<main class="study-shell"><section class="study-card study-card--compact"><p class="eyebrow">Unable to open</p><h1>The experiment could not be started</h1><p class="lede">' + escapeHtml(message) + '</p><p class="technical-note">Please reopen index.html from the complete essence_vs_temp_v8 folder.</p></section></main>';
  }

  function radioCard(name, value, title, detail) {
    return '<label class="choice-card"><input type="radio" name="' + escapeHtml(name) + '" value="' + escapeHtml(value) + '"><span class="choice-card__control" aria-hidden="true"></span><span><strong>' + escapeHtml(title) + '</strong>' + (detail ? '<small>' + escapeHtml(detail) + '</small>' : '') + '</span></label>';
  }

  function slider(name) {
    return '<fieldset class="response-slider"><legend class="sr-only">Agreement scale</legend>' +
      '<div class="response-slider__control">' +
        '<input type="range" name="' + escapeHtml(name) + '" min="' + Config.SLIDER_MIN + '" max="' + Config.SLIDER_MAX + '" step="1" value="' + Config.SLIDER_START + '" data-required-move="true" data-moved="false" data-touched="false" aria-valuetext="No response recorded">' +
        '<span class="response-slider__midpoint" aria-hidden="true"></span>' +
      '</div>' +
      '<div class="response-slider__labels"><span>Strongly disagree</span><span>Strongly agree</span></div>' +
    '</fieldset>';
  }

  function selectField(name, label, options, required) {
    return '<label class="select-field"><span>' + escapeHtml(label) + '</span><select name="' + escapeHtml(name) + '" ' + (required ? "required" : "") + '><option value="">Select an option</option>' + options.map(function (option, index) {
      return '<option value="' + (index + 1) + '">' + escapeHtml(option) + '</option>';
    }).join("") + '</select></label>';
  }

  function emphasizeEssence(statement) {
    const safe = escapeHtml(statement);
    return safe.replace("what it is", "<em>what it is</em>");
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  window.EssenceStudy = window.EssenceStudy || {};
  window.EssenceStudy.UI = {
    consent: consent,
    intro: intro,
    stimulusTrial: stimulusTrial,
    generalQuestion: generalQuestion,
    attentionQuestion: attentionQuestion,
    demographics: demographics,
    sending: sending,
    complete: complete,
    submissionError: submissionError,
    declined: declined,
    fatal: fatal
  };
})();
