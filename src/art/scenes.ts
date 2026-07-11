import { Draw, P, W, H } from './draw';

/**
 * Scene illustrations, drawn procedurally at 320x180. Each is a pure
 * function of the Draw context, so re-rendering is deterministic.
 */
export const art: Record<string, (d: Draw) => void> = {
  'village-well': (d) => {
    // Drought dusk: hot sky over cracked earth.
    d.bands(0, W, [
      [0, P.deepBlue], [18, P.duskRed], [40, P.duskOrange], [72, P.gold],
    ], 96);
    d.dither(0, 14, W, 6, P.deepBlue, P.duskRed);
    d.dither(0, 36, W, 6, P.duskRed, P.duskOrange);
    d.dither(0, 68, W, 6, P.duskOrange, P.gold);
    d.ellipse(248, 82, 14, 14, P.white); // low, merciless sun
    d.ellipse(248, 82, 11, 11, P.gold);
    // Distant village: dark roofs on the horizon.
    for (const [x, w, h] of [[18, 26, 10], [52, 20, 8], [284, 24, 12]] as const) {
      d.rect(x, 96 - h, w, h, P.soot);
      d.rect(x + 3, 96 - h - 4, w - 6, 4, P.umber);
    }
    // Dead tree.
    d.rect(300, 62, 3, 34, P.soot);
    d.rect(292, 66, 10, 2, P.soot);
    d.rect(303, 58, 9, 2, P.soot);
    d.rect(296, 60, 2, 8, P.soot);
    // Cracked ground.
    d.bands(0, W, [[96, P.sand], [120, P.clay], [156, P.umber]], H);
    d.dither(0, 116, W, 8, P.sand, P.clay);
    d.dither(0, 152, W, 8, P.clay, P.umber);
    for (let i = 0; i < 9; i++) d.crack(20 + i * 34, 100 + (i % 3) * 18, 22, P.soot, 40 + i);
    // The well, center stage.
    d.ellipse(160, 148, 34, 10, P.soot);
    d.rect(126, 118, 68, 30, P.steel);
    d.dither(126, 118, 68, 30, P.steel, P.slate);
    for (let j = 0; j < 3; j++)
      for (let i = 0; i < 6; i++)
        d.rect(128 + i * 11 + (j % 2) * 5, 121 + j * 9, 10, 1, P.ink);
    d.ellipse(160, 118, 34, 9, P.ink); // the dark mouth
    d.ellipse(160, 117, 30, 7, P.black);
    // Crossbeam, crank and rope.
    d.rect(122, 84, 4, 36, P.umber);
    d.rect(194, 84, 4, 36, P.umber);
    d.rect(118, 80, 84, 5, P.clay);
    d.rect(158, 85, 3, 30, P.rope);
    // Empty bucket on the lip: the point of the whole scene.
    d.rect(150, 106, 14, 10, P.umber);
    d.rect(150, 106, 14, 2, P.clay);
    d.scatter(0, 100, W, 70, P.clay, 90, 7); // dust and grit
  },

  'well-shaft': (d) => {
    // Looking up from inside: a shrinking coin of hot sky.
    d.clear(P.black);
    const rings: Array<[number, string]> = [
      [86, P.ink], [70, P.deepBlue], [54, P.slate], [38, P.steel], [22, P.fog],
    ];
    for (const [r, c] of rings) d.ellipse(160, 76, r + 18, r, c);
    d.ellipse(160, 76, 30, 13, P.duskOrange); // daylight, far away now
    d.ellipse(160, 76, 22, 9, P.gold);
    // Stone joints spiraling down the shaft.
    for (let i = 0; i < 4; i++) {
      const r = 30 + i * 16;
      d.ellipse(160, 76, r + 14, r, i % 2 ? P.ink : P.deepBlue);
      d.ellipse(160, 76, r + 12, r - 2, i % 2 ? P.deepBlue : P.ink);
    }
    d.ellipse(160, 76, 30, 13, P.duskOrange);
    d.ellipse(160, 76, 22, 9, P.gold);
    // The rope, snapped short, swaying against the light.
    d.rect(158, 63, 2, 14, P.rope);
    d.rect(157, 77, 2, 8, P.rope);
    d.rect(156, 85, 2, 6, P.soot);
    d.scatter(60, 120, 200, 50, P.slate, 40, 21); // falling grit
    d.dither(0, 160, W, 20, P.black, P.deepBlue);
  },

  'well-bottom': (d) => {
    d.clear(P.black);
    // Rough stone chamber.
    d.bands(0, W, [[0, P.black], [30, P.ink], [70, P.deepBlue]], 130);
    d.dither(0, 26, W, 8, P.black, P.ink);
    d.dither(0, 66, W, 8, P.ink, P.deepBlue);
    d.scatter(0, 30, W, 90, P.slate, 120, 33); // stone texture
    // Thin shaft of daylight from far above.
    d.dither(150, 0, 20, 96, P.ink, P.slate);
    d.rect(157, 0, 6, 92, P.steel);
    d.rect(159, 0, 2, 92, P.fog);
    // The pool: more water than the village has seen in a year.
    d.rect(0, 130, W, 50, P.water);
    d.dither(0, 130, W, 4, P.deepBlue, P.water);
    d.rect(140, 132, 40, 2, P.waterLight); // light striking the surface
    d.scatter(0, 136, W, 40, P.waterLight, 50, 44);
    d.ellipse(160, 134, 24, 3, P.white);
    // Fallen bucket, half-sunk.
    d.rect(196, 126, 13, 9, P.umber);
    d.rect(196, 126, 13, 2, P.clay);
    // The breach: a ragged black gap breathing faint glow.
    d.ellipse(52, 108, 26, 34, P.soot);
    d.ellipse(52, 110, 21, 29, P.black);
    d.ellipse(52, 116, 13, 20, P.glowDark);
    d.ellipse(52, 120, 7, 12, P.glowDim);
    d.scatter(38, 96, 30, 36, P.glow, 14, 55);
  },

  breach: (d) => {
    // Inside the crawl: pressed stone, glow strengthening ahead.
    d.clear(P.black);
    for (let i = 0; i < 5; i++) {
      const c = [P.ink, P.deepBlue, P.slate, P.glowDark, P.glowDim][i];
      d.ellipse(190 + i * 8, 96, 130 - i * 24, 84 - i * 15, c);
    }
    d.ellipse(222, 96, 26, 20, P.glow);
    d.ellipse(222, 96, 16, 12, P.white);
    // Strata lines in the squeezing walls.
    for (let j = 0; j < 6; j++) d.rect(0, 20 + j * 26, 70 - j * 8, 2, P.ink);
    for (let j = 0; j < 6; j++) d.rect(0, 30 + j * 26, 40 - j * 5, 1, P.slate);
    d.scatter(150, 60, 140, 70, P.glow, 25, 66);
  },

  'cavern-vista': (d) => {
    // The reveal: a cavern like a buried sky.
    d.clear(P.black);
    d.bands(0, W, [[0, P.black], [40, P.ink], [90, P.deepBlue]], 150);
    d.scatter(0, 6, W, 70, P.glow, 60, 77); // fungus on the far ceiling reads as stars
    d.scatter(0, 10, W, 60, P.glowDim, 90, 78);
    // Stalactites.
    for (const [x, w, len] of [[24, 10, 34], [70, 6, 22], [150, 12, 44], [230, 8, 28], [286, 10, 36]] as const) {
      for (let j = 0; j < len; j++) {
        const t = 1 - j / len;
        d.rect(x + (w * (1 - t)) / 2, j, Math.max(1, w * t), 1, P.ink);
      }
    }
    // Fungus fields on the cavern floor.
    d.bands(0, W, [[150, P.deepBlue], [162, P.ink]], H);
    for (let i = 0; i < 22; i++) {
      const x = 8 + i * 14 + (i % 3) * 4;
      const r = 2 + (i % 3);
      d.ellipse(x, 154 - (i % 4), r, r, P.glowDim);
      d.ellipse(x, 153 - (i % 4), r - 1, r - 1, P.glow);
    }
    d.scatter(0, 120, W, 40, P.glow, 40, 88); // drifting spores
    // The river: a luminous ribbon crossing the dark.
    d.rect(0, 128, W, 7, P.glowDark);
    d.rect(0, 130, W, 3, P.water);
    d.scatter(0, 129, W, 5, P.waterLight, 30, 99);
    // Carved stair climbing to a distant gate, right side.
    for (let i = 0; i < 9; i++) d.rect(238 + i * 8, 148 - i * 7, 26, 4, P.slate);
    d.rect(300, 74, 16, 22, P.steel);
    d.rect(304, 78, 8, 18, P.black);
  },

  'river-shore': (d) => {
    d.clear(P.black);
    d.bands(0, W, [[0, P.black], [34, P.ink], [70, P.deepBlue]], 96);
    d.scatter(0, 4, W, 60, P.glowDim, 70, 101);
    // The river fills the middle distance, wide as a road.
    d.rect(0, 96, W, 52, P.water);
    d.dither(0, 96, W, 5, P.deepBlue, P.water);
    d.scatter(0, 100, W, 44, P.waterLight, 90, 112);
    d.rect(0, 118, W, 2, P.glowDark);
    // A wake: something large moving beneath.
    for (let i = 0; i < 5; i++) d.rect(96 + i * 22, 112 + (i % 2) * 3, 16, 2, P.glow);
    d.ellipse(150, 110, 5, 2, P.glowDim);
    // Pebble shore in the foreground.
    d.bands(0, W, [[148, P.slate], [162, P.ink]], H);
    d.scatter(0, 148, W, 30, P.steel, 130, 123);
    d.scatter(0, 150, W, 28, P.deepBlue, 90, 124);
    // Glowing fungus clumps by the waterline.
    for (const x of [40, 130, 250]) {
      d.ellipse(x, 150, 4, 4, P.glowDim);
      d.ellipse(x, 149, 3, 3, P.glow);
    }
  },

  'ruins-stair': (d) => {
    d.clear(P.black);
    d.bands(0, W, [[0, P.black], [26, P.ink], [60, P.deepBlue]], 140);
    d.scatter(0, 4, W, 52, P.glowDim, 50, 131);
    // Monumental gate: someone built this, far below a dying village.
    d.rect(118, 34, 84, 106, P.slate);
    d.dither(118, 34, 84, 106, P.slate, P.steel);
    d.rect(130, 48, 60, 92, P.ink);
    d.rect(136, 54, 48, 86, P.black);
    d.ellipse(160, 54, 30, 18, P.slate);
    d.ellipse(160, 56, 24, 13, P.black);
    // Glyphs cut into the jambs, faintly alight.
    for (let j = 0; j < 8; j++) {
      d.rect(122, 42 + j * 12, 4, 6, j % 2 ? P.glowDim : P.glowDark);
      d.rect(194, 42 + j * 12, 4, 6, j % 3 ? P.glowDark : P.glowDim);
    }
    // The stair, worn hollow in the middle by ancient feet.
    for (let i = 0; i < 6; i++) {
      d.rect(96 - i * 8, 140 + i * 7, 128 + i * 16, 7, i % 2 ? P.steel : P.slate);
      d.rect(150, 140 + i * 7, 20, 7, P.deepBlue);
    }
    // Fungus colonising the cracks.
    for (const [x, y] of [[112, 130], [208, 118], [124, 76], [198, 96]] as const) {
      d.ellipse(x, y, 3, 3, P.glowDim);
      d.ellipse(x, y, 2, 2, P.glow);
    }
    d.scatter(80, 60, 160, 80, P.glow, 16, 144);
  },
};
