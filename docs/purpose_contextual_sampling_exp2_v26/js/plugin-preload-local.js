var jsPsychPreloadLocal = (function (jspsych) {
  "use strict";

  const info = {
    name: "preload-local",
    version: "2.0.0",
    parameters: {
      required_asset_ids: { type: jspsych.ParameterType.STRING, default: [], array: true }
    },
    data: {
      loaded: { type: jspsych.ParameterType.INT },
      failed: { type: jspsych.ParameterType.OBJECT }
    }
  };

  class PreloadLocalPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    async trial(displayElement, trial) {
      const runtime = globalThis.FIELD_LAB_RUNTIME;
      let loaded = 0;
      let failed = [];
      displayElement.innerHTML = `
        <main class="loading-screen" id="study-main">
          <section class="loading-card" aria-live="polite">
            <span class="brand-mark" aria-hidden="true">K</span>
            <h1>Preparing field materials</h1>
            <p data-preload-status>Loading study assets · 0 of ${trial.required_asset_ids.length}</p>
            <progress max="${trial.required_asset_ids.length}" value="0"><span>Loading</span></progress>
          </section>
        </main>`;
      try {
        const manifest = globalThis.ContextualAssetManifest;
        if (!manifest || !Array.isArray(manifest.assets)) {
          throw new Error("The local asset manifest is unavailable.");
        }
        const byId = Object.fromEntries(manifest.assets.map((asset) => [asset.id, asset]));
        const missingIds = trial.required_asset_ids.filter((id) => !byId[id]);
        if (missingIds.length) throw new Error(`Manifest is missing: ${missingIds.join(", ")}.`);
        if (runtime.simulate_missing_asset) byId[trial.required_asset_ids[0]] =
          Object.assign({}, byId[trial.required_asset_ids[0]], { path: "__missing_asset__.webp" });
        globalThis.ContextualAssets = Object.freeze({
          version: manifest.version,
          byId: Object.freeze(byId)
        });
        await Promise.all(trial.required_asset_ids.map((id) => new Promise((resolve) => {
          const image = new Image();
          image.onload = () => {
            loaded += 1;
            displayElement.querySelector("progress").value = loaded;
            displayElement.querySelector("[data-preload-status]").textContent =
              `Loading study assets · ${loaded} of ${trial.required_asset_ids.length}`;
            resolve();
          };
          image.onerror = () => {
            loaded += 1;
            failed.push(id);
            resolve();
          };
          const path = byId[id].path;
          image.src = path.startsWith("assets/") ? path : `assets/${path}`;
        })));
        if (failed.length) throw new Error(`Required assets failed: ${failed.join(", ")}.`);
        this.jsPsych.finishTrial({ loaded, failed: [], manifest_version: manifest.version });
      } catch (error) {
        const fatalMarkup = `
          <main class="fatal-screen" id="study-main">
            <section class="fatal-card" role="alert">
              <span class="feedback-mark" aria-hidden="true">!</span>
              <h1>Study materials could not be prepared</h1>
              <p>Please check your connection and reload the study. No substantive study responses have been collected or sent.</p>
              <p class="technical-note">${runtime.debug ? globalThis.ContextualUI.escapeHtml(error.message) : ""}</p>
              <button class="button button-primary" type="button" onclick="location.reload()">Reload study</button>
            </section>
          </main>`;
        displayElement.innerHTML = fatalMarkup;
        globalThis.ContextualUI.focusScreen(displayElement);
        this.jsPsych.abortExperiment(fatalMarkup, {
          loaded,
          failed,
          asset_preload_failed: true
        });
      }
    }
  }

  PreloadLocalPlugin.info = info;
  return PreloadLocalPlugin;
})(jsPsychModule);
