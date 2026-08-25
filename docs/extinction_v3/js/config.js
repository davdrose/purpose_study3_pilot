(function (global) {
  "use strict";

  const species = Object.freeze([
    Object.freeze({
      id: "tavira",
      name: "Tavira",
      islandChain: "Pelu Island Chain",
      worldRegion: "the South Pacific Ocean",
      image: "assets/tavira.png",
      imageAlt: "A tall rust-colored Tavira with long red legs and a curved bill",
      globeImage: "assets/globe-pelu.png",
      islandImage: "assets/islands-pelu.png",
      globeMarker: Object.freeze({ x: 49, y: 52 }),
      islandMarkers: Object.freeze([
        Object.freeze({ x: 39, y: 51 }),
        Object.freeze({ x: 15, y: 19 }),
        Object.freeze({ x: 77, y: 18 }),
        Object.freeze({ x: 81, y: 62 }),
        Object.freeze({ x: 52, y: 84 })
      ])
    }),
    Object.freeze({
      id: "nembi",
      name: "Nembi",
      islandChain: "Keta Island Chain",
      worldRegion: "the western Indian Ocean",
      image: "assets/nembi.png",
      imageAlt: "A compact indigo Nembi with four translucent wings and copper-colored legs",
      globeImage: "assets/globe-keta.png",
      islandImage: "assets/islands-keta.png",
      globeMarker: Object.freeze({ x: 43, y: 58 }),
      islandMarkers: Object.freeze([
        Object.freeze({ x: 75, y: 54 }),
        Object.freeze({ x: 18, y: 51 }),
        Object.freeze({ x: 48, y: 25 }),
        Object.freeze({ x: 43, y: 77 }),
        Object.freeze({ x: 88, y: 16 })
      ])
    }),
    Object.freeze({
      id: "orava",
      name: "Orava",
      islandChain: "Saren Island Chain",
      worldRegion: "the North Atlantic Ocean",
      image: "assets/orava.png",
      imageAlt: "A compact slate-gray Orava with rounded ears, amber bands, and a bushy tail",
      globeImage: "assets/globe-saren.png",
      islandImage: "assets/islands-saren.png",
      globeMarker: Object.freeze({ x: 51, y: 53 }),
      islandMarkers: Object.freeze([
        Object.freeze({ x: 25, y: 31 }),
        Object.freeze({ x: 52, y: 13 }),
        Object.freeze({ x: 88, y: 39 }),
        Object.freeze({ x: 15, y: 88 }),
        Object.freeze({ x: 64, y: 83 })
      ])
    }),
    Object.freeze({
      id: "keshi",
      name: "Keshi",
      islandChain: "Malu Island Chain",
      worldRegion: "the western Pacific Ocean",
      image: "assets/keshi.png",
      imageAlt: "A small turquoise-gray Keshi with coral side stripes and a long tail",
      globeImage: "assets/globe-malu.png",
      islandImage: "assets/islands-malu.png",
      globeMarker: Object.freeze({ x: 61, y: 52 }),
      islandMarkers: Object.freeze([
        Object.freeze({ x: 13, y: 18 }),
        Object.freeze({ x: 72, y: 18 }),
        Object.freeze({ x: 42, y: 42 }),
        Object.freeze({ x: 23, y: 70 }),
        Object.freeze({ x: 87, y: 78 })
      ])
    })
  ]);

  global.ExtinctionStudy = global.ExtinctionStudy || {};
  global.ExtinctionStudy.Config = Object.freeze({
    version: "extinction_v14",
    title: "Island Animal Study",
    islandCount: 5,
    lossMagnitudes: Object.freeze([1000, 10000, 100000, 1000000]),
    survivalStartingMultiplier: 10,
    survivalRemainingMultiplier: 9,
    consentPayment: "$1.00",
    estimatedMinutes: 8,
    species: species
  });
})(window);
