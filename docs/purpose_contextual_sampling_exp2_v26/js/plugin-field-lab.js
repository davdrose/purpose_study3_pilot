(function (global) {
  "use strict";

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function inputMethod(event) {
    if (!event) return "pointer";
    if (event.type?.startsWith("key") || event.detail === 0) return "keyboard";
    if (event.pointerType === "touch") return "touch";
    return "pointer";
  }

  function asset(assetId) {
    const record = global.ContextualAssets?.byId?.[assetId];
    if (!record) throw new Error(`Asset ${assetId} has not been prepared.`);
    return record.path.startsWith("assets/") ? record.path : `assets/${record.path}`;
  }

  function species(key) {
    return global.ContextualSamplingConfig.species[key];
  }

  function renderHeader(step, title, detail, options = {}) {
    const roleReminder = options.roleReminder;
    const trailing = roleReminder
      ? `<aside class="v23-role-reminder" aria-label="Current scientist role">
          ${assetImage(roleReminder.assetId, roleReminder.imageAlt, "v23-role-reminder-image")}
          <span><strong>${escapeHtml(roleReminder.sentence || `${roleReminder.title}—${roleReminder.definition}`)}</strong></span>
        </aside>`
      : options.division
        ? `<span class="division-chip">${escapeHtml(options.division)}</span>`
        : `<span class="system-status"><i aria-hidden="true"></i> SYSTEM READY</span>`;
    return `
      <header class="app-header">
        <a class="brand" href="#study-main" aria-label="Kestrel field research">
          <span class="brand-mark" aria-hidden="true">K</span>
          <span><strong>KESTREL</strong><small>FIELD REGISTRY</small></span>
        </a>
        <div class="phase-status" aria-label="Study progress">
          <span>${escapeHtml(step)}</span>
          <strong>${escapeHtml(title)}</strong>
          <small>${escapeHtml(detail)}</small>
        </div>
        ${trailing}
      </header>`;
  }

  function focusScreen(root) {
    global.scrollTo?.(0, 0);
    const heading = root.querySelector("h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }

  function assetImage(assetId, alt, classes = "") {
    return `<img src="${asset(assetId)}" alt="${escapeHtml(alt)}" class="${classes}" width="640" height="640">`;
  }

  const mapShapes = {
    paired: {
      paths: ["M115 128 C170 84 235 84 292 128", "M115 154 C170 198 235 198 292 154", "M135 105 L135 178", "M270 104 L270 178"],
      nodes: [[115,128],[145,108],[202,98],[260,110],[292,128],[292,154],[260,176],[202,188],[145,176],[115,154]]
    },
    rings: {
      paths: ["M110 142 C110 88 184 88 184 142 C184 196 110 196 110 142", "M184 142 C184 88 258 88 258 142 C258 196 184 196 184 142", "M258 142 C258 102 310 102 310 142 C310 182 258 182 258 142"],
      nodes: [[110,142],[147,96],[184,142],[147,188],[221,96],[258,142],[221,188],[284,108],[310,142],[284,176]]
    },
    parallel: {
      paths: ["M105 105 C165 122 235 122 310 105", "M105 142 C165 158 235 158 310 142", "M105 179 C165 196 235 196 310 179", "M145 105 L145 179", "M270 105 L270 179"],
      nodes: [[105,105],[145,116],[205,120],[270,114],[310,105],[105,142],[205,158],[310,142],[105,179],[205,194],[310,179]]
    },
    braided: {
      paths: ["M105 105 C165 105 165 180 225 180 C270 180 280 130 315 130", "M105 180 C165 180 165 105 225 105 C270 105 280 155 315 155", "M132 112 L132 173", "M200 115 L200 170", "M272 126 L272 160"],
      nodes: [[105,105],[132,118],[170,142],[200,170],[225,180],[315,130],[105,180],[132,168],[170,142],[200,115],[225,105],[315,155]]
    },
    nested: {
      paths: ["M105 142 C105 75 310 75 310 142 C310 209 105 209 105 142", "M140 142 C140 100 275 100 275 142 C275 184 140 184 140 142", "M175 142 C175 122 240 122 240 142 C240 162 175 162 175 142"],
      nodes: [[105,142],[150,92],[207,80],[265,92],[310,142],[265,192],[207,204],[150,192],[175,142],[240,142]]
    },
    radial: {
      paths: ["M207 142 L115 100", "M207 142 L105 142", "M207 142 L115 184", "M207 142 L280 95", "M207 142 L315 142", "M207 142 L280 190"],
      nodes: [[207,142],[115,100],[105,142],[115,184],[280,95],[315,142],[280,190],[160,122],[160,162],[255,142]]
    }
  };

  function biologyMap(kindKey, subjectLabel, exteriorAssetId, compact = false) {
    const item = species(kindKey);
    const map = mapShapes[item.biology.pattern];
    return `
      <div class="biology-map ${compact ? "is-compact" : ""}" aria-label="${escapeHtml(`${subjectLabel}: ${item.biology.label}`)}">
        ${assetImage(exteriorAssetId, `${subjectLabel} during an internal biological scan`, "biology-map-animal")}
        <div class="biology-map-screen" aria-hidden="true">
          <svg viewBox="0 0 420 280" focusable="false">
            <path class="body-map" d="M74 165 C78 103 144 79 250 86 C310 90 345 113 360 145 L390 157 L361 172 C336 187 315 199 277 199 L263 239 L240 239 L237 199 L150 199 L134 239 L111 239 L115 193 C88 186 74 177 74 165 Z" />
            ${map.paths.map((path) => `<path class="map-line" d="${path}"/>`).join("")}
            ${map.nodes.map(([x, y]) => `<circle class="map-node" cx="${x}" cy="${y}" r="7"/>`).join("")}
          </svg>
          <span>${escapeHtml(item.biology.label)}</span>
        </div>
      </div>`;
  }

  function liveRegion() {
    return `<div class="live-region sr-only" id="field-live-region" aria-live="polite"></div>`;
  }

  function announce(message) {
    const region = document.querySelector("#field-live-region");
    if (region) region.textContent = message;
  }

  function applyRuntimeClasses(runtime) {
    document.body.classList.add("field-lab-body", "v15-study", "v16-study", "v17-study", "v20-study", "v21-study", "v22-study", "v23-study", "v24-study", "v25-study", "v26-study");
    document.body.classList.toggle("reduced-motion", matchMedia("(prefers-reduced-motion: reduce)").matches);
    document.body.classList.toggle("debug-mode", runtime.debug);
  }

  global.ContextualUI = {
    escapeHtml,
    inputMethod,
    asset,
    species,
    renderHeader,
    focusScreen,
    assetImage,
    biologyMap,
    liveRegion,
    announce,
    applyRuntimeClasses
  };
})(typeof window !== "undefined" ? window : globalThis);
