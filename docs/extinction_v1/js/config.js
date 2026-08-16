(function (global) {
  "use strict";

  const species = Object.freeze([
    Object.freeze({
      id: "tavira",
      name: "Tavira",
      birds: "Tavira birds",
      island: "Mera Island",
      islandChain: "Pelu Island Chain",
      worldRegion: "the South Pacific Ocean",
      image: "assets/tavira.png",
      imageAlt: "A tall rust-colored Tavira bird with long red legs and a long curved bill",
      globeImage: "assets/globe-pelu.png",
      islandImage: "assets/islands-pelu.png",
      globeMarker: Object.freeze({ x: 49, y: 52 }),
      lossMarker: Object.freeze({ x: 39, y: 51 }),
      survivorMarkers: Object.freeze([
        Object.freeze({ x: 15, y: 19 }),
        Object.freeze({ x: 77, y: 18 }),
        Object.freeze({ x: 81, y: 62 }),
        Object.freeze({ x: 52, y: 84 })
      ])
    }),
    Object.freeze({
      id: "lorinu",
      name: "Lorinu",
      birds: "Lorinu birds",
      island: "Naro Island",
      islandChain: "Keta Island Chain",
      worldRegion: "the western Indian Ocean",
      image: "assets/lorinu.png",
      imageAlt: "A compact green Lorinu bird with a large hooked beak and a short crest",
      globeImage: "assets/globe-keta.png",
      islandImage: "assets/islands-keta.png",
      globeMarker: Object.freeze({ x: 43, y: 58 }),
      lossMarker: Object.freeze({ x: 75, y: 54 }),
      survivorMarkers: Object.freeze([
        Object.freeze({ x: 18, y: 51 }),
        Object.freeze({ x: 48, y: 25 }),
        Object.freeze({ x: 43, y: 77 }),
        Object.freeze({ x: 88, y: 16 })
      ])
    })
  ]);

  global.ExtinctionStudy = global.ExtinctionStudy || {};
  global.ExtinctionStudy.Config = Object.freeze({
    version: "extinction_v5",
    title: "Island Bird Study",
    deathsPerCase: 10000,
    survivingPopulationDescription: "more than 40,000",
    consentPayment: "$1.00",
    estimatedMinutes: 5,
    species: species
  });
})(window);
