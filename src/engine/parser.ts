import { holds, type Choice, type GameState, type Scene } from './story';

/**
 * The intent parser. Typed input is reduced to canonical content tokens
 * (synonyms collapse to one word, filler drops away), then scored against
 * each available choice's keywords — label words plus authored `intent`
 * synonyms. Best unique score wins; ties ask for clarification.
 */

const STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'for', 'in', 'into', 'on', 'at',
  'over', 'with', 'your', 'you', 'my', 'me', 'i', 'it', 'its', 'that', 'this',
  'is', 'are', 'be', 'do', 'does', 'was', 'were', 'while', 'still', 'can',
  'could', 'would', 'should', 'then', 'now', 'please', 'try', 'want', 'will',
  'just', 'some', 'came', 'properly', 'first', 'am', 'lets', 'let', 'us',
  'toward', 'towards', 'here', 'there', 'check', 'show', 'see', 'use',
]);

/** Synonym groups: every variant collapses to the first (canonical) word. */
const GROUPS: string[][] = [
  ['go', 'walk', 'head', 'move', 'travel', 'proceed', 'approach'],
  ['climb', 'scale', 'clamber', 'descend'],
  ['down', 'downward', 'below', 'deeper'],
  ['up', 'upward', 'ascend'],
  ['take', 'grab', 'pick', 'gather', 'collect', 'harvest', 'get', 'keep'],
  ['shout', 'yell', 'call', 'scream', 'holler', 'shriek'],
  ['squeeze', 'crawl', 'wriggle', 'worm', 'shimmy'],
  ['enter', 'inside'],
  ['push', 'press', 'continue', 'onward', 'forward', 'onwards', 'ahead'],
  ['follow', 'chase', 'track', 'trail'],
  ['fill', 'refill'],
  ['drop', 'toss', 'throw', 'lob'],
  ['listen', 'hear'],
  ['lean', 'peer', 'peek'],
  ['back', 'retreat', 'return', 'leave', 'flee', 'withdraw'],
  ['fall', 'plunge', 'drop-down'],
  ['hold', 'grip', 'hang', 'cling', 'grasp'],
  ['stair', 'stairs', 'steps', 'staircase', 'stairway'],
  ['gate', 'door', 'doorway', 'gates', 'archway'],
  ['fungus', 'mushroom', 'mushrooms', 'glowcap', 'glowcaps', 'fungi'],
  ['pebble', 'stone', 'rock'],
  ['breach', 'gap', 'hole', 'opening', 'crack', 'passage', 'tunnel'],
  ['lamps', 'lamp', 'lights'],
  ['river', 'stream', 'current'],
  ['shore', 'bank', 'waterline'],
  ['glyphs', 'glyph', 'carvings', 'runes', 'writing', 'inscriptions'],
  ['drink', 'sip', 'gulp', 'taste'],
  ['swim', 'wade', 'dive'],
  ['read', 'decipher', 'translate'],
  // global command groups, resolved by the UI via firstCanon()
  ['look', 'l', 'examine', 'inspect', 'observe', 'describe', 'around'],
  ['inventory', 'pack', 'items', 'belongings', 'bag', 'carrying'],
  ['map', 'where', 'location'],
  ['help', 'hint', 'hints', 'stuck'],
];

const CANON = new Map<string, string>();
for (const group of GROUPS) {
  for (const word of group) CANON.set(word, group[0]);
}

function canon(token: string): string {
  return CANON.get(token) ?? token;
}

/** Lowercased, filler removed, synonyms collapsed, deduplicated. */
export function contentTokens(input: string): string[] {
  const raw = input.toLowerCase().split(/[^a-z']+/).filter(Boolean);
  const out: string[] = [];
  for (const t of raw) {
    const word = t.replace(/'/g, '');
    if (!word || STOP.has(word)) continue;
    const c = canon(word);
    if (!out.includes(c)) out.push(c);
  }
  return out;
}

/** Canonical form of the first meaningful word — used for global commands. */
export function firstCanon(input: string): string | undefined {
  return contentTokens(input)[0];
}

export function choiceKeywords(choice: Choice): Set<string> {
  const words = contentTokens(choice.label);
  for (const extra of choice.intent ?? []) {
    for (const t of contentTokens(extra)) if (!words.includes(t)) words.push(t);
  }
  return new Set(words);
}

export type IntentResult =
  | { type: 'match'; choice: Choice }
  | { type: 'ambiguous'; choices: Choice[] }
  | { type: 'none' };

export function matchIntent(input: string, choices: Choice[]): IntentResult {
  const tokens = contentTokens(input);
  if (tokens.length === 0) return { type: 'none' };

  let best = 0;
  const scored = choices.map((choice) => {
    const keywords = choiceKeywords(choice);
    const score = tokens.filter((t) => keywords.has(t)).length;
    best = Math.max(best, score);
    return { choice, score };
  });

  if (best === 0) return { type: 'none' };
  const top = scored.filter((s) => s.score === best).map((s) => s.choice);
  if (top.length === 1) return { type: 'match', choice: top[0] };
  return { type: 'ambiguous', choices: top };
}

/** First flavor response whose keywords overlap the input and whose condition holds. */
export function matchResponse(input: string, scene: Scene, state: GameState): string | undefined {
  const tokens = new Set(contentTokens(input));
  for (const rule of scene.responses ?? []) {
    if (!holds(state, rule.if)) continue;
    const keys = rule.match.flatMap((m) => contentTokens(m));
    if (keys.some((k) => tokens.has(k))) return rule.text;
  }
  return undefined;
}
