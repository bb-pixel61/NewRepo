/**
 * Declarative story model. The whole adventure is data: scenes with
 * conditional text, choices gated by flags/items, and effects that
 * mutate the game state. Engine code never knows the plot.
 */

export interface Condition {
  /** All of these flags must be set. */
  flags?: string[];
  /** None of these flags may be set. */
  not?: string[];
  /** All of these items must be in the inventory. */
  has?: string[];
  /** None of these items may be in the inventory. */
  lacks?: string[];
}

export interface Effect {
  set?: string[];
  clear?: string[];
  add?: string[];
  remove?: string[];
}

/** A paragraph is plain text, or text shown only when its condition holds. */
export type Paragraph = string | { if: Condition; text: string };

export interface Choice {
  label: string;
  goto: string;
  if?: Condition;
  do?: Effect;
  /** Extra keywords the parser accepts for this action, beyond the label. */
  intent?: string[];
}

/** A flavor reply to typed input that doesn't advance the story. */
export interface ResponseRule {
  match: string[];
  text: string;
  if?: Condition;
}

export interface Scene {
  id: string;
  /** Key into the art registry; scenes may share an illustration. */
  art: string;
  text: Paragraph[];
  onEnter?: Effect;
  choices: Choice[];
  responses?: ResponseRule[];
  /** Endings terminate play; they render a restart prompt instead of choices. */
  ending?: boolean;
}

export interface Story {
  title: string;
  start: string;
  scenes: Scene[];
}

export interface GameState {
  scene: string;
  flags: Set<string>;
  items: Set<string>;
  /** Scene ids visited, in order — enables "you have been here" text. */
  seen: string[];
}

export function newGame(story: Story): GameState {
  const state: GameState = { scene: story.start, flags: new Set(), items: new Set(), seen: [] };
  enterScene(story, state, story.start);
  return state;
}

export function getScene(story: Story, id: string): Scene {
  const scene = story.scenes.find((s) => s.id === id);
  if (!scene) throw new Error(`Unknown scene: ${id}`);
  return scene;
}

export function holds(state: GameState, cond: Condition | undefined): boolean {
  if (!cond) return true;
  if (cond.flags?.some((f) => !state.flags.has(f))) return false;
  if (cond.not?.some((f) => state.flags.has(f))) return false;
  if (cond.has?.some((i) => !state.items.has(i))) return false;
  if (cond.lacks?.some((i) => state.items.has(i))) return false;
  return true;
}

export function apply(state: GameState, effect: Effect | undefined): void {
  if (!effect) return;
  effect.set?.forEach((f) => state.flags.add(f));
  effect.clear?.forEach((f) => state.flags.delete(f));
  effect.add?.forEach((i) => state.items.add(i));
  effect.remove?.forEach((i) => state.items.delete(i));
}

/** The choices actually offered in the current scene, given the state. */
export function availableChoices(story: Story, state: GameState): Choice[] {
  return getScene(story, state.scene).choices.filter((c) => holds(state, c.if));
}

/** Paragraphs actually shown for the current scene, given the state. */
export function visibleText(story: Story, state: GameState): string[] {
  return getScene(story, state.scene)
    .text.filter((p) => typeof p === 'string' || holds(state, p.if))
    .map((p) => (typeof p === 'string' ? p : p.text));
}

export function choose(story: Story, state: GameState, choice: Choice): void {
  if (!holds(state, choice.if)) throw new Error(`Choice not available: ${choice.label}`);
  apply(state, choice.do);
  enterScene(story, state, choice.goto);
}

function enterScene(story: Story, state: GameState, id: string): void {
  const scene = getScene(story, id);
  state.scene = id;
  state.seen.push(id);
  apply(state, scene.onEnter);
}

// --- persistence ---------------------------------------------------------

interface SaveData {
  scene: string;
  flags: string[];
  items: string[];
  seen: string[];
}

export function serialize(state: GameState): string {
  const data: SaveData = {
    scene: state.scene,
    flags: [...state.flags],
    items: [...state.items],
    seen: state.seen,
  };
  return JSON.stringify(data);
}

export function deserialize(story: Story, json: string): GameState {
  const data = JSON.parse(json) as SaveData;
  getScene(story, data.scene); // validate the save points at a real scene
  return {
    scene: data.scene,
    flags: new Set(data.flags),
    items: new Set(data.items),
    seen: data.seen ?? [],
  };
}

// --- authoring safety ----------------------------------------------------

/** Returns a list of problems in the story graph; empty means well-formed. */
export function validateStory(story: Story): string[] {
  const problems: string[] = [];
  const ids = new Set(story.scenes.map((s) => s.id));
  if (ids.size !== story.scenes.length) problems.push('Duplicate scene ids');
  if (!ids.has(story.start)) problems.push(`Start scene missing: ${story.start}`);
  for (const scene of story.scenes) {
    if (!scene.ending && scene.choices.length === 0) {
      problems.push(`Dead end (no choices, not an ending): ${scene.id}`);
    }
    for (const choice of scene.choices) {
      if (!ids.has(choice.goto)) {
        problems.push(`Broken link: ${scene.id} -> ${choice.goto}`);
      }
    }
  }
  return problems;
}
