/**
 * Explanation Lab study client v1.0.0
 *
 * Browser-native submission client for jsPsych studies hosted on GitHub
 * Pages. This study includes a pinned local copy so a future console update
 * cannot silently change a deployed experiment.
 */

const CLIENT_VERSION = "1.0.0";
const FIREBASE_SDK_VERSION = "12.16.0";

// Firebase's web configuration is public by design. Never put a service-account
// credential or private key here.
const LAB_CONFIG = Object.freeze({
  firebase: {
    apiKey: "AIzaSyCY39Z3Ej0qHQvLh8qWdCM03MFPGXXAe1E",
    authDomain: "explanation-lab-studies.firebaseapp.com",
    projectId: "explanation-lab-studies",
    storageBucket: "explanation-lab-studies.firebasestorage.app",
    messagingSenderId: "934653534012",
    appId: "1:934653534012:web:1df486c3ea3b7e4cc1c839",
  },
  appCheckSiteKey: "__APP_CHECK_SITE_KEY__",
});

function configured(config) {
  return Boolean(
    config.firebase.apiKey &&
      !config.firebase.apiKey.startsWith("__") &&
      config.firebase.projectId &&
      !config.firebase.projectId.startsWith("__"),
  );
}

function normalizeTrials(input) {
  const value = input && typeof input.values === "function" ? input.values() : input;
  if (!Array.isArray(value)) {
    throw new TypeError(
      "Study data must be an array or the value returned by jsPsych.data.get().",
    );
  }
  return sanitize(value);
}

function sanitize(value, depth = 0) {
  if (depth > 20) return "[maximum depth reached]";
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (["string", "boolean"].includes(typeof value)) return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((item) => sanitize(item, depth + 1));
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => typeof item !== "function" && typeof item !== "symbol")
        .map(([key, item]) => [key, sanitize(item, depth + 1)]),
    );
  }
  return String(value);
}

function readLaunchContext() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") === "sandbox" ? "sandbox" : "production";
  return {
    studyKey: params.get("study") ?? "",
    condition: params.get("condition") ?? "default",
    mode,
    participant: {
      prolificPid: params.get("PROLIFIC_PID") ?? "",
      studyId: params.get("STUDY_ID") ?? "",
      sessionId: params.get("SESSION_ID") ?? "",
    },
  };
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function estimateBytes(value) {
  return new Blob([JSON.stringify(value)]).size;
}

async function loadFirebase() {
  const root = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;
  const [appModule, authModule, firestoreModule, appCheckModule] = await Promise.all([
    import(`${root}/firebase-app.js`),
    import(`${root}/firebase-auth.js`),
    import(`${root}/firebase-firestore.js`),
    import(`${root}/firebase-app-check.js`),
  ]);
  return { ...appModule, ...authModule, ...firestoreModule, ...appCheckModule };
}

function renderRecovery(error, retry) {
  const previous = document.getElementById("explanation-lab-save-recovery");
  if (previous) previous.remove();

  const layer = document.createElement("div");
  layer.id = "explanation-lab-save-recovery";
  layer.setAttribute("role", "alert");
  layer.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;background:#f6f7f2;color:#172b2a;font-family:system-ui,sans-serif";
  const card = document.createElement("div");
  card.style.cssText =
    "width:min(520px,100%);padding:30px;border:1px solid #dfe5e1;border-radius:14px;background:#fffefa;box-shadow:0 20px 70px #163b3a22";
  const heading = document.createElement("h1");
  heading.textContent = "Your responses have not been confirmed yet";
  heading.style.cssText = "margin:0 0 12px;font:500 28px Georgia,serif";
  const copy = document.createElement("p");
  copy.textContent =
    "Please keep this page open and try saving again. You will only be returned to Prolific after the lab confirms the save.";
  copy.style.cssText = "margin:0 0 18px;color:#687774;line-height:1.55";
  const detail = document.createElement("p");
  detail.textContent = `Technical detail: ${error?.message ?? "Unknown save error"}`;
  detail.style.cssText = "font-size:11px;color:#8a9692";
  const button = document.createElement("button");
  button.textContent = "Try saving again";
  button.style.cssText =
    "margin-top:8px;padding:11px 16px;border:0;border-radius:8px;background:#143b3a;color:white;font-weight:700;cursor:pointer";
  button.addEventListener("click", () => {
    button.disabled = true;
    button.textContent = "Saving…";
    retry();
  });
  card.append(heading, copy, detail, button);
  layer.append(card);
  document.body.append(layer);
}

export async function createExplanationLabClient(options = {}) {
  const config = options.config ?? LAB_CONFIG;
  if (!configured(config)) {
    throw new Error(
      "The Explanation Lab Firebase configuration has not been added to the shared study client.",
    );
  }

  const launch = { ...readLaunchContext(), ...options.launch };
  launch.studyKey = options.studyKey ?? launch.studyKey;
  if (!launch.studyKey) {
    throw new Error("This launch URL is missing its study key (?study=…).");
  }
  if (
    launch.mode === "production" &&
    (!launch.participant.prolificPid ||
      !launch.participant.studyId ||
      !launch.participant.sessionId)
  ) {
    throw new Error(
      "This production launch is missing one or more Prolific participant identifiers.",
    );
  }

  const firebase = await loadFirebase();
  const app = firebase.getApps().length
    ? firebase.getApp()
    : firebase.initializeApp(config.firebase);

  if (
    config.appCheckSiteKey &&
    !config.appCheckSiteKey.startsWith("__") &&
    !firebase.getApps().some((entry) => entry.name === "explanation-lab-app-check")
  ) {
    try {
      firebase.initializeAppCheck(app, {
        provider: new firebase.ReCaptchaEnterpriseProvider(config.appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (error) {
      console.warn("Explanation Lab App Check could not initialize.", error);
    }
  }

  const auth = firebase.getAuth(app);
  await firebase.setPersistence(auth, firebase.browserLocalPersistence);
  const user = auth.currentUser ?? (await firebase.signInAnonymously(auth)).user;
  const db = firebase.getFirestore(app);
  const publicStudyRef = firebase.doc(db, "publicStudies", launch.studyKey);
  const publicStudySnapshot = await firebase.getDoc(publicStudyRef);
  if (!publicStudySnapshot.exists()) {
    throw new Error(`Study “${launch.studyKey}” is not registered with the Explanation Lab.`);
  }
  const study = publicStudySnapshot.data();

  if (launch.mode === "production" && study.status !== "live") {
    throw new Error("This study is not accepting production submissions.");
  }
  if (launch.mode === "sandbox" && !["draft", "sandbox", "live"].includes(study.status)) {
    throw new Error("This study is not available for sandbox testing.");
  }
  if (Array.isArray(study.conditions) && !study.conditions.includes(launch.condition)) {
    throw new Error(`Condition “${launch.condition}” is not registered for this study.`);
  }

  async function save(input, saveOptions = {}) {
    const trials = normalizeTrials(input);
    const serializedBytes = estimateBytes(trials);
    if (serializedBytes > 900_000) {
      throw new Error(
        "This response is too large for one Firestore record. Contact the lab before continuing.",
      );
    }
    const id =
      launch.mode === "sandbox"
        ? `sandbox-${crypto.randomUUID()}`
        : await sha256(`${launch.studyKey}:${launch.participant.prolificPid}`);
    const submissionRef = firebase.doc(db, "studies", launch.studyKey, "submissions", id);

    if (launch.mode === "production") {
      try {
        const existing = await firebase.getDoc(submissionRef);
        if (existing.exists() && existing.data().authUid === user.uid) {
          return { id, duplicate: true, mode: launch.mode, redirectUrl: study.completionUrl };
        }
      } catch {
        // A prior save from another anonymous session remains unreadable and
        // the create-only security rule will safely reject a duplicate write.
      }
    }

    const payload = {
      submissionId: id,
      studyId: launch.studyKey,
      mode: launch.mode,
      condition: launch.condition,
      participant: launch.participant,
      authUid: user.uid,
      itemCount: trials.length,
      durationMs: Number.isFinite(saveOptions.durationMs) ? saveOptions.durationMs : null,
      trials,
      metadata: sanitize({
        ...(saveOptions.metadata ?? {}),
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
      serializedBytes,
      clientVersion: CLIENT_VERSION,
      createdAt: firebase.serverTimestamp(),
    };
    await firebase.setDoc(submissionRef, payload);
    return { id, duplicate: false, mode: launch.mode, redirectUrl: study.completionUrl };
  }

  async function submit(input, saveOptions = {}) {
    try {
      return await save(input, saveOptions);
    } catch (error) {
      if (saveOptions.showRetryScreen !== false) {
        renderRecovery(error, async () => {
          try {
            const result = await save(input, saveOptions);
            if (launch.mode === "production") window.location.assign(result.redirectUrl);
            else document.getElementById("explanation-lab-save-recovery")?.remove();
          } catch (retryError) {
            renderRecovery(retryError, () => submit(input, saveOptions));
          }
        });
      }
      throw error;
    }
  }

  async function submitAndRedirect(input, saveOptions = {}) {
    const result = await submit(input, saveOptions);
    if (launch.mode === "production") window.location.assign(result.redirectUrl);
    return result;
  }

  return Object.freeze({
    study: { key: launch.studyKey, ...study },
    launch,
    submit,
    submitAndRedirect,
    version: CLIENT_VERSION,
  });
}

export default createExplanationLabClient;
