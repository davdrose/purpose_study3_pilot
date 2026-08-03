(function (global) {
  "use strict";

  const v12PurposeSequences = [
    ["orba", 0, "A Rellin pollinating silver bellflowers"],
    ["orba", 1, "A Sulak dispersing moonberry seeds"],
    ["orba", 2, "The unfamiliar Orba animal pollinating silver bellflowers"],
    ["orba", 3, "The unfamiliar Orba animal dispersing moonberry seeds"],
    ["nira", 0, "A Daxon removing scarlet scale insects from ironleaf shrubs"],
    ["nira", 1, "A Bramel dispersing amber burrgrass seeds"],
    ["nira", 2, "The unfamiliar Nira animal removing scarlet scale insects"],
    ["nira", 3, "The unfamiliar Nira animal dispersing amber burrgrass seeds"],
    ["selu", 0, "A Kivon fanning water over pearlfin eggs"],
    ["selu", 1, "A Tembin clearing silt from glowreed roots"],
    ["selu", 2, "The unfamiliar Selu animal fanning water over pearlfin eggs"],
    ["selu", 3, "The unfamiliar Selu animal clearing silt from glowreed roots"]
  ].flatMap(([world, subjectIndex, description]) => [1, 2, 3].map((frame) => [
    `v12_${world}_purpose_${subjectIndex}_${frame}`,
    `v12-${world}-purpose-${subjectIndex}-${frame}.webp`,
    `${description}, purpose scan observation ${frame} of 3`
  ]));

  const entries = [
    ["v10_rellin", "v10-orba-ext-0.webp", "A photorealistic Rellin specimen"],
    ["v10_sulak", "v10-orba-ext-1.webp", "A photorealistic Sulak specimen"],
    ["v10_unknown_orba", "v10-orba-ext-2.webp", "A photorealistic unfamiliar Orba animal"],
    ["v10_daxon", "v10-nira-ext-0.webp", "A photorealistic Daxon specimen"],
    ["v10_bramel", "v10-nira-ext-1.webp", "A photorealistic Bramel specimen"],
    ["v10_unknown_nira", "v10-nira-ext-2.webp", "A photorealistic unfamiliar Nira animal"],
    ["v10_kivon", "v10-selu-ext-0.webp", "A photorealistic Kivon specimen"],
    ["v10_tembin", "v10-selu-ext-1.webp", "A photorealistic Tembin specimen"],
    ["v10_unknown_selu", "v10-selu-ext-2.webp", "A photorealistic unfamiliar Selu animal"],
    ["v23_ecologist_role", "v23-ecologist-role.webp", "An ecologist observing a woodpecker and recording field notes"],
    ["v23_biochemist_role", "v23-biochemist-role.webp", "A biochemist analyzing samples with a pipette at a laboratory bench"],
    ...v12PurposeSequences
  ];

  global.ContextualAssetManifest = Object.freeze({
    version: "exp2-assets-25.0.0",
    assets: Object.freeze(entries.map(([id, path, alt]) => Object.freeze({
      id,
      path,
      alt,
      status: "v25_centered_role_context_and_evidence_heading_stimulus"
    })))
  });
})(typeof window !== "undefined" ? window : globalThis);
