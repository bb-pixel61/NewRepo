import { describe, it, expect } from 'vitest';
import { items, mapNodes, sceneNode, mapEdges } from './codex';
import { prologue } from '../story/prologue';
import type { Effect } from '../engine/story';

describe('codex integrity', () => {
  it('every scene has a place on the map', () => {
    for (const scene of prologue.scenes) {
      const node = sceneNode[scene.id];
      expect(node, `scene "${scene.id}" has no map node`).toBeDefined();
      expect(mapNodes[node], `scene "${scene.id}" points at unknown node "${node}"`).toBeDefined();
    }
  });

  it('map edges connect places that exist', () => {
    for (const [a, b] of mapEdges) {
      expect(mapNodes[a], `edge endpoint "${a}" missing`).toBeDefined();
      expect(mapNodes[b], `edge endpoint "${b}" missing`).toBeDefined();
    }
  });

  it('every item the story can grant has a codex entry', () => {
    const granted = new Set<string>();
    const collect = (e: Effect | undefined) => e?.add?.forEach((i) => granted.add(i));
    for (const scene of prologue.scenes) {
      collect(scene.onEnter);
      for (const choice of scene.choices) collect(choice.do);
    }
    for (const id of granted) {
      expect(items[id], `item "${id}" granted by the story but missing from the codex`).toBeDefined();
    }
  });

  it('minimap nodes fit the 160x100 canvas', () => {
    for (const [id, n] of Object.entries(mapNodes)) {
      expect(n.x, `node "${id}" x out of bounds`).toBeGreaterThanOrEqual(4);
      expect(n.x, `node "${id}" x out of bounds`).toBeLessThanOrEqual(156);
      expect(n.y, `node "${id}" y out of bounds`).toBeGreaterThanOrEqual(4);
      expect(n.y, `node "${id}" y out of bounds`).toBeLessThanOrEqual(96);
    }
  });
});
