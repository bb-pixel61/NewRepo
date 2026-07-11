import type { Condition } from '../engine/story';

/**
 * The codex: presentation metadata about the story world — item
 * descriptions, character traits earned by choices, and the map.
 * Pure data; the HUD renders from it, the engine never reads it.
 */

export interface ItemInfo {
  name: string;
  desc: string;
}

export const items: Record<string, ItemInfo> = {
  rope: {
    name: 'Frayed rope',
    desc: 'Ten feet, knotted at your waist. It slowed the fall once.',
  },
  waterskin: {
    name: 'Full waterskin',
    desc: 'Heavy with cold well-water. What you came for.',
  },
  glowcap: {
    name: 'Glowcap fungus',
    desc: 'A fistful of cold teal light. The glyphs answer it.',
  },
};

/** A trait appears on the character sheet while its condition holds. */
export interface TraitRule {
  if: Condition;
  label: string;
  desc: string;
}

export const traits: TraitRule[] = [
  { if: { flags: ['reckless'] }, label: 'Reckless', desc: 'You trusted two-hundred-year-old stone.' },
  { if: { flags: ['roped'] }, label: 'Sure-footed', desc: 'You took the climb seriously.' },
  { if: { flags: ['heard-depths'] }, label: 'Curious', desc: 'You listen before you leap.' },
  { if: { flags: ['filled-skin'] }, label: 'Provident', desc: 'You remembered the errand.' },
  { if: { flags: ['fungus-light'] }, label: 'Lightbearer', desc: 'You carry the cold glow.' },
  { if: { flags: ['saw-cavern'] }, label: 'Deep-touched', desc: 'You have seen the buried sky.' },
  { if: { flags: ['path-river'] }, label: 'River-road', desc: 'You follow the distant lamps.' },
  { if: { flags: ['path-gate'] }, label: 'Gate-walker', desc: 'You entered the breathing dark.' },
];

/** Condition line: first matching rule wins. */
export const conditions: Array<{ if: Condition; label: string }> = [
  { if: { flags: ['bruised'] }, label: 'Bruised ankle' },
  { if: {}, label: 'Unhurt' },
];

// --- the map --------------------------------------------------------------

export interface MapNode {
  x: number;
  y: number;
  label: string;
}

/** Coordinates on the 160x100 minimap canvas. Surface at top, deep at bottom. */
export const mapNodes: Record<string, MapNode> = {
  surface: { x: 46, y: 14, label: 'The Well' },
  shaft: { x: 46, y: 36, label: 'The Shaft' },
  pool: { x: 46, y: 58, label: 'Well Bottom' },
  breach: { x: 70, y: 64, label: 'The Breach' },
  cavern: { x: 96, y: 70, label: 'The Cavern' },
  river: { x: 78, y: 88, label: 'The River' },
  ruins: { x: 128, y: 78, label: 'The Stair' },
  beyond: { x: 148, y: 92, label: '???' },
};

/** Which map node each scene belongs to; several scenes share a place. */
export const sceneNode: Record<string, string> = {
  'well-top': 'surface',
  'the-echo': 'surface',
  'the-slip': 'shaft',
  'the-descent': 'shaft',
  'well-bottom': 'pool',
  'the-shout': 'pool',
  'no-way-back': 'pool',
  'the-breach': 'breach',
  'cavern-vista': 'cavern',
  'river-shore': 'river',
  'ruins-stair': 'ruins',
  'end-prologue': 'beyond',
};

/** Passages drawn between two places once both have been visited. */
export const mapEdges: Array<[string, string]> = [
  ['surface', 'shaft'],
  ['shaft', 'pool'],
  ['pool', 'breach'],
  ['breach', 'cavern'],
  ['cavern', 'river'],
  ['cavern', 'ruins'],
  ['river', 'ruins'],
  ['river', 'beyond'],
  ['ruins', 'beyond'],
];
