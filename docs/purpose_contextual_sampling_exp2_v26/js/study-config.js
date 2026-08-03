(function (global) {
  "use strict";

  const species = {
    rellin: {
      key: "rellin",
      singular: "Rellin",
      plural: "Rellins",
      asset_id: "v10_rellin",
      biology: {
        label: "DNA map G-41K8P2",
        detail: "The complete DNA map was run and designated as G-41K8P2.",
        pattern: "paired"
      },
      purpose: {
        label: "Pollinates silver bellflowers",
        detail: "By carrying pollen between silver bellflowers, Rellins allow the flowers to produce seeds."
      },
      purpose_sequence_asset_ids: ["v12_orba_purpose_0_1", "v12_orba_purpose_0_2", "v12_orba_purpose_0_3"]
    },
    sulak: {
      key: "sulak",
      singular: "Sulak",
      plural: "Sulaks",
      asset_id: "v10_sulak",
      biology: {
        label: "DNA map G-64M3T7",
        detail: "The complete DNA map was run and designated as G-64M3T7.",
        pattern: "rings"
      },
      purpose: {
        label: "Disperses moonberry seeds",
        detail: "By carrying moonberries and dropping their seeds, Sulaks allow new vines to grow in shaded soil."
      },
      purpose_sequence_asset_ids: ["v12_orba_purpose_1_1", "v12_orba_purpose_1_2", "v12_orba_purpose_1_3"]
    },
    daxon: {
      key: "daxon",
      singular: "Daxon",
      plural: "Daxons",
      asset_id: "v10_daxon",
      biology: {
        label: "DNA map G-82Q5N4",
        detail: "The complete DNA map was run and designated as G-82Q5N4.",
        pattern: "parallel"
      },
      purpose: {
        label: "Removes scarlet scale insects from ironleaf shrubs",
        detail: "By eating scarlet scale insects, Daxons prevent leaf damage and help ironleaf shrubs keep their leaves."
      },
      purpose_sequence_asset_ids: ["v12_nira_purpose_0_1", "v12_nira_purpose_0_2", "v12_nira_purpose_0_3"]
    },
    bramel: {
      key: "bramel",
      singular: "Bramel",
      plural: "Bramels",
      asset_id: "v10_bramel",
      biology: {
        label: "DNA map G-26R9V1",
        detail: "The complete DNA map was run and designated as G-26R9V1.",
        pattern: "braided"
      },
      purpose: {
        label: "Disperses amber burrgrass seeds",
        detail: "By carrying hooked amber burrgrass seeds and dropping them elsewhere, Bramels allow new grass patches to grow."
      },
      purpose_sequence_asset_ids: ["v12_nira_purpose_1_1", "v12_nira_purpose_1_2", "v12_nira_purpose_1_3"]
    },
    kivon: {
      key: "kivon",
      singular: "Kivon",
      plural: "Kivons",
      asset_id: "v10_kivon",
      biology: {
        label: "DNA map G-77H4C6",
        detail: "The complete DNA map was run and designated as G-77H4C6.",
        pattern: "nested"
      },
      purpose: {
        label: "Fans water over pearlfin eggs",
        detail: "By moving fresh water over pearlfin eggs, Kivons keep the eggs oxygenated and help them hatch."
      },
      purpose_sequence_asset_ids: ["v12_selu_purpose_0_1", "v12_selu_purpose_0_2", "v12_selu_purpose_0_3"]
    },
    tembin: {
      key: "tembin",
      singular: "Tembin",
      plural: "Tembins",
      asset_id: "v10_tembin",
      biology: {
        label: "DNA map G-35W2L8",
        detail: "The complete DNA map was run and designated as G-35W2L8.",
        pattern: "radial"
      },
      purpose: {
        label: "Clears silt from glowreed roots",
        detail: "By scraping excess silt from glowreed roots, Tembins restore water flow and help the reeds survive."
      },
      purpose_sequence_asset_ids: ["v12_selu_purpose_1_1", "v12_selu_purpose_1_2", "v12_selu_purpose_1_3"]
    }
  };

  const pairs = [
    {
      id: "rellin_sulak",
      species: ["rellin", "sulak"],
      environment: "Flowering woodlands of Orba",
      station: "Station OR-12",
      population_labels: ["K", "M"],
      unknown_asset_id: "v10_unknown_orba",
      unknown_purpose_sequence_assets: {
        rellin: ["v12_orba_purpose_2_1", "v12_orba_purpose_2_2", "v12_orba_purpose_2_3"],
        sulak: ["v12_orba_purpose_3_1", "v12_orba_purpose_3_2", "v12_orba_purpose_3_3"]
      }
    },
    {
      id: "daxon_bramel",
      species: ["daxon", "bramel"],
      environment: "Open grasslands of Nira",
      station: "Station NI-07",
      population_labels: ["A", "C"],
      unknown_asset_id: "v10_unknown_nira",
      unknown_purpose_sequence_assets: {
        daxon: ["v12_nira_purpose_2_1", "v12_nira_purpose_2_2", "v12_nira_purpose_2_3"],
        bramel: ["v12_nira_purpose_3_1", "v12_nira_purpose_3_2", "v12_nira_purpose_3_3"]
      }
    },
    {
      id: "kivon_tembin",
      species: ["kivon", "tembin"],
      environment: "Marshlands of Selu",
      station: "Station SE-31",
      population_labels: ["X", "Z"],
      unknown_asset_id: "v10_unknown_selu",
      unknown_purpose_sequence_assets: {
        kivon: ["v12_selu_purpose_2_1", "v12_selu_purpose_2_2", "v12_selu_purpose_2_3"],
        tembin: ["v12_selu_purpose_3_1", "v12_selu_purpose_3_2", "v12_selu_purpose_3_3"]
      }
    }
  ];

  const pairOrders = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2],
    [1, 2, 0], [2, 0, 1], [2, 1, 0]
  ];
  const conditionTable = [];
  ["genetics_context", "ecology_context"].forEach((roleContext) => {
    pairOrders.forEach((pairOrder, pairOrderIndex) => {
      for (let cuePattern = 0; cuePattern < 8; cuePattern += 1) {
        [["biological", "purpose"], ["purpose", "biological"]].forEach((evidenceOrder) => {
          conditionTable.push({
            condition_id: `cs${String(conditionTable.length + 1).padStart(3, "0")}`,
            role_context: roleContext,
            pair_order_index: pairOrderIndex,
            species_pair_order: pairOrder.map((index) => pairs[index].id),
            cue_pattern: cuePattern,
            evidence_order: evidenceOrder
          });
        });
      }
    });
  });

  const config = {
    schema_version: "3.0.0",
    study_version: "purpose-contextual-sampling-exp2-v26",
    configuration_version: "exp2-config-26.0.0",
    experiment_seed: "purpose-exp2-v26-2026-08-02",
    species,
    pairs,
    condition_table: conditionTable,
    roles: {
      genetics_context: {
        division: "Biochemistry Research Team",
        short: "Biochemistry",
        article: "a",
        profession: "biochemist",
        profession_definition: "a scientist who studies biochemical processes",
        role_asset_id: "v23_biochemist_role",
        role_asset_alt: "A biochemist using a pipette to analyze samples at a laboratory bench",
        scientist_identity: "You are a biochemist—a scientist who studies biochemical processes.",
        briefing: "Use the complete reports to determine which established kind best fits the unknown animal."
      },
      ecology_context: {
        division: "Ecology Research Team",
        short: "Ecology",
        article: "an",
        profession: "ecologist",
        profession_definition: "a scientist who studies ecosystems",
        role_asset_id: "v23_ecologist_role",
        role_asset_alt: "An ecologist observing a woodpecker in a tree and recording field notes",
        scientist_identity: "You are an ecologist—a scientist who studies ecosystems.",
        briefing: "Use the complete reports to determine which established kind best fits the unknown animal."
      }
    },
    required_asset_ids: [
      "v10_rellin", "v10_sulak", "v10_unknown_orba",
      "v10_daxon", "v10_bramel", "v10_unknown_nira",
      "v10_kivon", "v10_tembin", "v10_unknown_selu",
      "v23_ecologist_role", "v23_biochemist_role",
      "v12_orba_purpose_0_1", "v12_orba_purpose_0_2", "v12_orba_purpose_0_3",
      "v12_orba_purpose_1_1", "v12_orba_purpose_1_2", "v12_orba_purpose_1_3",
      "v12_orba_purpose_2_1", "v12_orba_purpose_2_2", "v12_orba_purpose_2_3",
      "v12_orba_purpose_3_1", "v12_orba_purpose_3_2", "v12_orba_purpose_3_3",
      "v12_nira_purpose_0_1", "v12_nira_purpose_0_2", "v12_nira_purpose_0_3",
      "v12_nira_purpose_1_1", "v12_nira_purpose_1_2", "v12_nira_purpose_1_3",
      "v12_nira_purpose_2_1", "v12_nira_purpose_2_2", "v12_nira_purpose_2_3",
      "v12_nira_purpose_3_1", "v12_nira_purpose_3_2", "v12_nira_purpose_3_3",
      "v12_selu_purpose_0_1", "v12_selu_purpose_0_2", "v12_selu_purpose_0_3",
      "v12_selu_purpose_1_1", "v12_selu_purpose_1_2", "v12_selu_purpose_1_3",
      "v12_selu_purpose_2_1", "v12_selu_purpose_2_2", "v12_selu_purpose_2_3",
      "v12_selu_purpose_3_1", "v12_selu_purpose_3_2", "v12_selu_purpose_3_3"
    ],
    timing: {
      save_retry_delays_ms: [0, 750, 1800]
    }
  };

  const errors = [];
  if (Object.keys(species).length !== 6) errors.push("Six established species are required.");
  pairs.forEach((pair) => {
    if (pair.species.length !== 2) errors.push(`${pair.id} must contain two established kinds.`);
    if (pair.population_labels.length !== 2) errors.push(`${pair.id} must define two counterbalanced population labels.`);
    pair.species.forEach((kindKey) => {
      if (!species[kindKey]) errors.push(`${pair.id} references missing species ${kindKey}.`);
      if (species[kindKey]?.purpose_sequence_asset_ids?.length !== 3) errors.push(`${kindKey} needs three purpose scan frames.`);
      if (pair.unknown_purpose_sequence_assets[kindKey]?.length !== 3) errors.push(`${pair.id} needs three unknown purpose scan frames for ${kindKey}.`);
    });
  });
  if (errors.length) throw new Error(`Invalid study configuration: ${errors.join(" ")}`);

  global.ContextualSamplingConfig = Object.freeze(config);
})(typeof window !== "undefined" ? window : globalThis);
