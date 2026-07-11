/**
 * Tiny procedural pixel-art toolkit. Everything draws onto a 320x180
 * canvas with integer rects only, so the upscaled result stays crisp.
 */

export const W = 320;
export const H = 180;

/** Deterministic PRNG so scene "noise" (stars, cracks, spores) never flickers. */
export function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Draw {
  constructor(private ctx: CanvasRenderingContext2D) {}

  clear(color: string): void {
    this.rect(0, 0, W, H, color);
  }

  rect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  px(x: number, y: number, color: string): void {
    this.rect(x, y, 1, 1, color);
  }

  /** Checkerboard blend of two colors — the classic pixel-art gradient. */
  dither(x: number, y: number, w: number, h: number, a: string, b: string): void {
    this.rect(x, y, w, h, a);
    this.ctx.fillStyle = b;
    for (let j = 0; j < h; j++) {
      for (let i = (j + Math.round(x) + Math.round(y)) % 2; i < w; i += 2) {
        this.ctx.fillRect(Math.round(x) + i, Math.round(y) + j, 1, 1);
      }
    }
  }

  /** Horizontal color bands filling x..x+w between the given y stops. */
  bands(x: number, w: number, stops: Array<[number, string]>, yEnd: number): void {
    for (let i = 0; i < stops.length; i++) {
      const [y, color] = stops[i];
      const next = i + 1 < stops.length ? stops[i + 1][0] : yEnd;
      this.rect(x, y, w, next - y, color);
    }
  }

  /** Filled ellipse from scanlines of 1px-tall rects. */
  ellipse(cx: number, cy: number, rx: number, ry: number, color: string): void {
    for (let j = -ry; j <= ry; j++) {
      const span = rx * Math.sqrt(Math.max(0, 1 - (j / ry) * (j / ry)));
      this.rect(cx - span, cy + j, span * 2, 1, color);
    }
  }

  /** Scatter n single pixels in a box — stars, spores, grit. */
  scatter(x: number, y: number, w: number, h: number, color: string, n: number, seed: number): void {
    const rnd = mulberry(seed);
    for (let i = 0; i < n; i++) {
      this.px(x + Math.floor(rnd() * w), y + Math.floor(rnd() * h), color);
    }
  }

  /** A jagged vertical crack wandering downward. */
  crack(x: number, y: number, len: number, color: string, seed: number): void {
    const rnd = mulberry(seed);
    let cx = x;
    for (let j = 0; j < len; j++) {
      this.px(cx, y + j, color);
      const r = rnd();
      if (r < 0.3) cx -= 1;
      else if (r > 0.7) cx += 1;
    }
  }
}

/** Moody retro palette: drought dusk above, luminous dark below. */
export const P = {
  black: '#0b0a12',
  ink: '#141527',
  deepBlue: '#1b2038',
  slate: '#2e3a56',
  steel: '#4a5a78',
  fog: '#8fa3bf',
  white: '#e8ecf2',
  duskRed: '#b8432e',
  duskOrange: '#e8873a',
  gold: '#e8c162',
  sand: '#d9b26a',
  clay: '#a3663a',
  umber: '#5e3a28',
  soot: '#31231e',
  moss: '#3f6b4f',
  glow: '#5fe8c8',
  glowDim: '#2b8f83',
  glowDark: '#1a4f52',
  water: '#2b5d8f',
  waterLight: '#4a90c2',
  rope: '#b98a4e',
} as const;
