(function () {
  "use strict";

  const I = window.Interbreeding;
  const T = I.TraitScales;

  function lineage(options) {
    const scale = T.definitionFor(options.traitScaleId);
    return Object.freeze(Object.assign({
      parents: Object.freeze(["Parent species A", "Parent species B"]),
      traitLabel: scale.label,
      traitDirectionDescription: scale.direction,
      traitCalibrationMethod: scale.calibrationMethod,
      traitChangedVisualProperty: scale.changedProperty,
      traitLevels: T.LEVELS
    }, options));
  }

  const lineages = Object.freeze({
    teeth: lineage({
      id: "teeth",
      name: "Tooth population",
      trialTitle: "Tooth Sharpness Population Trial",
      targetFeature: "sharpness of the teeth",
      targetShort: "tooth sharpness",
      traitDirection: "increasing sharpness of the teeth",
      geneticRecord: "DNA record T",
      purposeRoles: Object.freeze({
        baseline: "crush hard seeds",
        baselineStatement: "At G0, these teeth are mainly used to crush hard seeds."
      }),
      traitScaleId: "tooth_sharpness"
    }),
    beaks: lineage({
      id: "beaks",
      name: "Beak population",
      trialTitle: "Beak Size Population Trial",
      targetFeature: "size of the beak",
      targetShort: "beak size",
      traitDirection: "increasing size of the beak",
      geneticRecord: "DNA record B",
      purposeRoles: Object.freeze({
        baseline: "pick up small seeds",
        baselineStatement: "At G0, this beak is mainly used to pick up small seeds."
      }),
      traitScaleId: "beak_size"
    }),
    fur: lineage({
      id: "fur",
      name: "Fur population",
      trialTitle: "Fur Whiteness Population Trial",
      targetFeature: "whiteness of the fur",
      targetShort: "fur whiteness",
      traitDirection: "increasing whiteness of the fur",
      geneticRecord: "DNA record F",
      purposeRoles: Object.freeze({
        baseline: "blend into pale stone",
        baselineStatement: "At G0, this fur is mainly used to blend into pale stone."
      }),
      traitScaleId: "fur_whiteness"
    }),
    toes: lineage({
      id: "toes",
      name: "Toe population",
      trialTitle: "Toe Hairiness Population Trial",
      targetFeature: "hairiness of the toes",
      targetShort: "toe hairiness",
      traitDirection: "increasing hairiness of the toes",
      geneticRecord: "DNA record H",
      purposeRoles: Object.freeze({
        baseline: "sense ground vibrations",
        baselineStatement: "At G0, the hair on these toes is mainly used to sense ground vibrations."
      }),
      traitScaleId: "toe_hairiness"
    })
  });

  function validate() {
    const required = ["id", "name", "trialTitle", "parents", "purposeRoles", "targetFeature", "targetShort", "traitDirection", "geneticRecord", "traitScaleId", "traitLabel", "traitDirectionDescription", "traitCalibrationMethod", "traitChangedVisualProperty", "traitLevels"];
    const lineageIds = Object.keys(lineages);
    I.Config.LINEAGE_IDS.forEach(function (id) {
      if (!lineages[id]) throw new Error("Configured lineage is missing from the stimulus registry: " + id);
    });
    lineageIds.forEach(function (id) {
      required.forEach(function (key) {
        if (!lineages[id][key]) throw new Error("Missing stimulus field " + id + "." + key);
      });
      if (lineages[id].traitLevels.length !== 8) throw new Error("Each lineage requires eight normalized trait levels.");
      if (!lineages[id].purposeRoles.baseline || !lineages[id].purposeRoles.baselineStatement) throw new Error("Each lineage requires a concrete G0 purpose description: " + id);
      const definition = T.definitionFor(lineages[id].traitScaleId);
      if (definition.label !== lineages[id].traitLabel || definition.calibrationMethod !== lineages[id].traitCalibrationMethod) {
        throw new Error("Lineage metadata must remain synchronized with its trait-scale definition: " + id);
      }
    });
  }

  function lineageFor(id) {
    if (!lineages[id]) throw new Error("Unknown lineage: " + id);
    return lineages[id];
  }

  validate();
  window.Interbreeding.Stimuli = { lineages: lineages, lineageFor: lineageFor, validate: validate };
})();
