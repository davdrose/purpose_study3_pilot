(function () {
  "use strict";

  const LEVELS = Object.freeze([0, 1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7, 1]);
  const TOOTH_AREA_CALIBRATION = Object.freeze([0, 0.150409, 0.298079, 0.443154, 0.585768, 0.72604, 0.864083, 1]);
  const TOE_HAIR_SEGMENTS = Object.freeze([
    [83, 27, 84, 14], [49, 64, 36, 61], [119, 62, 132, 64], [80, 130, 80, 144],
    [56, 40, 50, 28], [109, 40, 113, 27], [45, 88, 32, 83], [115, 88, 128, 83],
    [69, 45, 58, 39], [94, 45, 105, 38], [58, 125, 51, 138], [102, 125, 109, 138],
    [69, 58, 57, 54], [96, 58, 108, 53], [44, 101, 30, 101], [116, 101, 130, 101],
    [70, 69, 58, 67], [92, 69, 104, 67], [49, 114, 37, 121], [111, 114, 123, 121],
    [50, 52, 39, 47], [118, 51, 131, 47], [71, 34, 65, 22], [94, 34, 101, 22],
    [69, 76, 57, 79], [94, 76, 106, 79], [69, 130, 66, 143], [91, 130, 94, 143]
  ]);
  const definitions = {};

  function clamp01(value) {
    return Math.max(0, Math.min(1, Number(value)));
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function rounded(value) {
    return Math.round(value * 100) / 100;
  }

  function calibratedToothProgress(level) {
    const scaled = clamp01(level) * 7;
    const lower = Math.floor(scaled);
    const upper = Math.min(7, lower + 1);
    return lerp(TOOTH_AREA_CALIBRATION[lower], TOOTH_AREA_CALIBRATION[upper], scaled - lower);
  }

  function toothParameters(level) {
    const s = clamp01(level);
    const t = calibratedToothProgress(s);
    return {
      outer_width: 60,
      total_height: 120,
      root_geometry: 0,
      crown_shoulder_half_width: rounded(lerp(12, 4, t)),
      crown_taper_control_half_width: rounded(lerp(10, 2, t)),
      crown_tip_control_half_width: rounded(lerp(7, 0.5, t)),
      crown_area_proxy: rounded(lerp(1286.39, 695.05, s)),
      calibrated_progress: rounded(t),
      normalized_level: rounded(s)
    };
  }

  function toothPath(level) {
    const s = calibratedToothProgress(level);
    const number = function (start, end) { return rounded(lerp(start, end, s)); };
    return [
      "M58 56",
      "C" + number(60, 64) + " " + number(42, 47) + " " + number(64, 72) + " " + number(30, 39) + " " + number(68, 76) + " " + number(23, 30),
      "C" + number(70, 78) + " " + number(19, 25) + " " + number(73, 79.5) + " " + number(18, 20) + " 80 18",
      "C" + number(87, 80.5) + " " + number(18, 20) + " " + number(90, 82) + " " + number(19, 25) + " " + number(92, 84) + " " + number(23, 30),
      "C" + number(96, 88) + " " + number(30, 39) + " " + number(100, 96) + " " + number(42, 47) + " 102 56",
      "C109 63 110 78 105 91 L99 125 C97 137 88 138 84 126 L80 112 L76 126 C72 138 63 137 61 125 L55 91 C50 78 51 63 58 56Z"
    ].join(" ");
  }

  function beakParameters(level) {
    const s = clamp01(level);
    const length = lerp(68, 110, s);
    return {
      root_position_x: 18,
      root_center_y: 80,
      root_height: 52,
      beak_length: rounded(length),
      projected_area_proxy: rounded(length * 26),
      pose_degrees: 0,
      normalized_level: rounded(s)
    };
  }

  function beakPath(level) {
    const parameters = beakParameters(level);
    const rootX = parameters.root_position_x;
    const tipX = rounded(rootX + parameters.beak_length);
    const upperOne = rounded(rootX + parameters.beak_length * .43);
    const upperTwo = rounded(tipX - parameters.beak_length * .2);
    const lowerOne = rounded(rootX + parameters.beak_length * .45);
    const lowerTwo = rounded(tipX - parameters.beak_length * .23);
    return "M" + rootX + " 54 C" + upperOne + " 54 " + upperTwo + " 67 " + tipX + " 78 Q" + (tipX + 2) + " 80 " + tipX + " 82 C" + lowerTwo + " 91 " + lowerOne + " 106 " + rootX + " 106 C24 95 24 65 " + rootX + " 54Z";
  }

  function labLightnessToGray(lightness) {
    const l = Math.max(0, Math.min(100, lightness));
    const linear = l > 8 ? Math.pow((l + 16) / 116, 3) : l / 903.3;
    const srgb = linear <= 0.0031308 ? 12.92 * linear : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
    const channel = Math.round(clamp01(srgb) * 255);
    const hex = channel.toString(16).padStart(2, "0");
    return { channel: channel, color: "#" + hex + hex + hex };
  }

  function furParameters(level) {
    const s = clamp01(level);
    const lightness = lerp(48, 90, s);
    const gray = labLightnessToGray(lightness);
    return {
      silhouette_geometry: 0,
      texture_geometry: 0,
      lab_lightness: rounded(lightness),
      srgb_channel: gray.channel,
      fill_color: gray.color,
      normalized_level: rounded(s)
    };
  }

  function toeParameters(level) {
    const s = clamp01(level);
    const count = Math.round(s * TOE_HAIR_SEGMENTS.length);
    return {
      foot_geometry: 0,
      hair_geometry_order: 0,
      maximum_hair_count: TOE_HAIR_SEGMENTS.length,
      visible_hair_count: count,
      visible_hair_coverage_percent: rounded((count / TOE_HAIR_SEGMENTS.length) * 100),
      normalized_level: rounded(s)
    };
  }

  function toeHairMarkup(level) {
    const count = toeParameters(level).visible_hair_count;
    return TOE_HAIR_SEGMENTS.slice(0, count).map(function (segment) {
      return '<line x1="' + segment[0] + '" y1="' + segment[1] + '" x2="' + segment[2] + '" y2="' + segment[3] + '"></line>';
    }).join("");
  }

  function register(definition) {
    if (!definition || !definition.id || typeof definition.render !== "function" || typeof definition.parameters !== "function") {
      throw new Error("Every trait scale requires an id, parameter mapping, and renderer.");
    }
    definitions[definition.id] = Object.freeze(definition);
  }

  register({
    id: "tooth_sharpness",
    label: "Tooth sharpness",
    direction: "broader rounded crown to narrower pointed crown",
    calibrationMethod: "equal_upper_crown_silhouette_area_steps",
    changedProperty: "equal-area whole-crown taper",
    invariantProperties: Object.freeze(["outer width", "total height", "root geometry", "frame", "fill", "stroke", "lighting"]),
    parameters: toothParameters,
    render: function (level, options) {
      const normalized = clamp01(level);
      const index = Math.round(normalized * 7);
      const gradientId = "tooth-enamel-" + index;
      return '<svg class="trait-image" x="' + options.x + '" y="' + options.y + '" width="' + options.width + '" height="' + options.height + '" viewBox="0 0 160 160" role="img" aria-label="Tooth sharpness level ' + index + ' of 7" data-trait-scale="tooth_sharpness" data-trait-level="' + normalized.toFixed(3) + '">' +
        '<defs><linearGradient id="' + gradientId + '" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"></stop><stop offset="1" stop-color="#dce9e5"></stop></linearGradient></defs>' +
        '<path d="' + toothPath(normalized) + '" fill="url(#' + gradientId + ')" stroke="#173f3a" stroke-width="4" stroke-linejoin="round"></path>' +
        '<path d="M64 62 C62 76 65 94 68 110" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"></path></svg>';
    }
  });

  register({
    id: "beak_size",
    label: "Beak size",
    direction: "smaller standalone beak to larger projecting beak",
    calibrationMethod: "equal_projected_beak_length_and_area_steps",
    changedProperty: "projected beak length and area",
    invariantProperties: Object.freeze(["standalone presentation", "root position", "root height", "pose", "frame", "fill", "stroke", "lighting"]),
    parameters: beakParameters,
    render: function (level, options) {
      const normalized = clamp01(level);
      const index = Math.round(normalized * 7);
      const parameters = beakParameters(normalized);
      const tipX = rounded(parameters.root_position_x + parameters.beak_length);
      return '<svg class="trait-image" x="' + options.x + '" y="' + options.y + '" width="' + options.width + '" height="' + options.height + '" viewBox="0 0 160 160" role="img" aria-label="Beak size level ' + index + ' of 7" data-trait-scale="beak_size" data-trait-level="' + normalized.toFixed(3) + '">' +
        '<path d="' + beakPath(normalized) + '" fill="#e7d7aa" stroke="#173f3a" stroke-width="4" stroke-linejoin="round"></path>' +
        '<path d="M43 81 C' + rounded(parameters.root_position_x + parameters.beak_length * .48) + ' 82 ' + rounded(tipX - parameters.beak_length * .16) + ' 81 ' + tipX + ' 80" fill="none" stroke="#9d8656" stroke-width="2.4" stroke-linecap="round" opacity=".72"></path>' +
        '<path d="M43 68 C' + rounded(parameters.root_position_x + parameters.beak_length * .38) + ' 66 ' + rounded(tipX - parameters.beak_length * .3) + ' 71 ' + rounded(tipX - 8) + ' 76" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".67"></path></svg>';
    }
  });

  register({
    id: "fur_whiteness",
    label: "Fur whiteness",
    direction: "darker fur to whiter fur",
    calibrationMethod: "equal_cielab_lightness_steps",
    changedProperty: "CIELAB perceptual lightness",
    invariantProperties: Object.freeze(["fur-patch silhouette", "texture geometry", "frame", "outline", "pose", "illumination"]),
    parameters: furParameters,
    render: function (level, options) {
      const normalized = clamp01(level);
      const index = Math.round(normalized * 7);
      const parameters = furParameters(normalized);
      return '<svg class="trait-image" x="' + options.x + '" y="' + options.y + '" width="' + options.width + '" height="' + options.height + '" viewBox="0 0 160 160" role="img" aria-label="Fur whiteness level ' + index + ' of 7" data-trait-scale="fur_whiteness" data-trait-level="' + normalized.toFixed(3) + '">' +
        '<path d="M42 55 L50 45 L58 50 L65 39 L73 47 L81 35 L89 47 L98 40 L104 51 L114 46 L120 59 L114 70 L123 80 L115 90 L121 102 L110 109 L107 122 L95 119 L85 129 L76 121 L63 127 L57 115 L44 114 L45 102 L35 93 L42 81 L35 69 L45 63Z" fill="' + parameters.fill_color + '" stroke="#173f3a" stroke-width="4" stroke-linejoin="round"></path>' +
        '<path d="M53 66 C64 58 74 60 82 69 M76 91 C88 82 99 85 108 96 M55 102 C65 94 72 98 79 108 M93 56 C101 59 106 66 109 74" fill="none" stroke="#173f3a" stroke-width="3" stroke-linecap="round" opacity=".24"></path></svg>';
    }
  });

  register({
    id: "toe_hairiness",
    label: "Toe hairiness",
    direction: "hairless toes to progressively hairier toes",
    calibrationMethod: "equal_persistent_filament_count_steps",
    changedProperty: "visible fixed-filament hair coverage",
    invariantProperties: Object.freeze(["toe anatomy", "foot-pad geometry", "hair positions and order", "frame", "fill", "stroke", "lighting"]),
    parameters: toeParameters,
    render: function (level, options) {
      const normalized = clamp01(level);
      const index = Math.round(normalized * 7);
      return '<svg class="trait-image" x="' + options.x + '" y="' + options.y + '" width="' + options.width + '" height="' + options.height + '" viewBox="0 0 160 160" role="img" aria-label="Toe hairiness level ' + index + ' of 7" data-trait-scale="toe_hairiness" data-trait-level="' + normalized.toFixed(3) + '">' +
        '<path d="M48 84 C44 69 45 51 53 41 C59 34 68 36 72 44 C77 54 73 71 68 84Z" fill="#dfeae7" stroke="#173f3a" stroke-width="4" stroke-linejoin="round"></path>' +
        '<path d="M68 82 C66 63 67 40 75 30 C80 24 88 25 92 33 C98 45 94 67 91 83Z" fill="#dfeae7" stroke="#173f3a" stroke-width="4" stroke-linejoin="round"></path>' +
        '<path d="M91 84 C90 68 94 47 103 40 C110 35 119 39 121 48 C124 59 116 75 111 86Z" fill="#dfeae7" stroke="#173f3a" stroke-width="4" stroke-linejoin="round"></path>' +
        '<path d="M44 100 C44 83 58 74 80 74 C103 74 116 83 116 101 C116 120 101 131 80 131 C59 131 44 119 44 100Z" fill="#dfeae7" stroke="#173f3a" stroke-width="4" stroke-linejoin="round"></path>' +
        '<g fill="none" stroke="#173f3a" stroke-width="2.3" stroke-linecap="round">' + toeHairMarkup(normalized) + '</g>' +
        '<path d="M58 96 C66 87 78 84 88 87" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".68"></path></svg>';
    }
  });

  function definitionFor(id) {
    if (!definitions[id]) throw new Error("Unknown trait scale: " + id);
    return definitions[id];
  }

  function render(id, level, options) {
    return definitionFor(id).render(clamp01(level), options);
  }

  function validate() {
    if (LEVELS.length !== 8 || LEVELS[0] !== 0 || LEVELS[7] !== 1) throw new Error("Trait scale requires eight endpoints from 0 to 1.");
    LEVELS.forEach(function (level, index) {
      if (index && level <= LEVELS[index - 1]) throw new Error("Trait levels must increase monotonically.");
    });
    ["tooth_sharpness", "beak_size", "fur_whiteness", "toe_hairiness"].forEach(function (id) {
      const definition = definitionFor(id);
      const rows = LEVELS.map(definition.parameters);
      if (!definition.label || !definition.direction || !definition.calibrationMethod || rows.length !== 8 || definition.render(0, { x: 0, y: 0, width: 70, height: 70 }).indexOf('data-trait-scale="' + id + '"') < 0) {
        throw new Error("Trait scale failed the shared renderer contract: " + id);
      }
    });
    const tooth = definitionFor("tooth_sharpness");
    const parameterRows = LEVELS.map(tooth.parameters);
    parameterRows.forEach(function (row, index) {
      if (row.outer_width !== 60 || row.total_height !== 120 || row.root_geometry !== 0) throw new Error("Tooth invariants changed across the calibration scale.");
      if (index && row.crown_shoulder_half_width >= parameterRows[index - 1].crown_shoulder_half_width) throw new Error("Tooth crown taper must increase monotonically.");
      if (index && Math.abs((row.crown_area_proxy - parameterRows[index - 1].crown_area_proxy) + 84.48) > 0.03) throw new Error("Tooth crown-area steps must remain equal across generations.");
    });
    const beakRows = LEVELS.map(definitionFor("beak_size").parameters);
    beakRows.forEach(function (row, index) {
      if (row.root_position_x !== 18 || row.root_center_y !== 80 || row.root_height !== 52 || row.pose_degrees !== 0) throw new Error("Beak invariants changed across the calibration scale.");
      if (index && Math.abs((row.beak_length - beakRows[index - 1].beak_length) - 6) > 0.01) throw new Error("Beak length steps must remain equal across generations.");
      if (index && Math.abs((row.projected_area_proxy - beakRows[index - 1].projected_area_proxy) - 156) > 0.01) throw new Error("Beak area steps must remain equal across generations.");
    });
    const furRows = LEVELS.map(definitionFor("fur_whiteness").parameters);
    furRows.forEach(function (row, index) {
      if (row.silhouette_geometry !== 0 || row.texture_geometry !== 0) throw new Error("Fur invariants changed across the calibration scale.");
      if (index && Math.abs((row.lab_lightness - furRows[index - 1].lab_lightness) - 6) > 0.01) throw new Error("Fur CIELAB lightness steps must remain equal across generations.");
      if (index && row.srgb_channel <= furRows[index - 1].srgb_channel) throw new Error("Fur display lightness must increase monotonically.");
    });
    const toeRows = LEVELS.map(definitionFor("toe_hairiness").parameters);
    toeRows.forEach(function (row, index) {
      if (row.foot_geometry !== 0 || row.hair_geometry_order !== 0 || row.maximum_hair_count !== 28) throw new Error("Toe invariants changed across the calibration scale.");
      if (index && row.visible_hair_count - toeRows[index - 1].visible_hair_count !== 4) throw new Error("Toe hair coverage must increase by four fixed filaments per generation.");
    });
  }

  validate();
  window.Interbreeding = window.Interbreeding || {};
  window.Interbreeding.TraitScales = {
    LEVELS: LEVELS,
    definitionFor: definitionFor,
    render: render,
    validate: validate
  };
})();
