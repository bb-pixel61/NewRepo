import { describe, it, expect } from 'vitest';
import {
  newGame,
  holds,
  apply,
  availableChoices,
  visibleText,
  choose,
  serialize,
  deserialize,
  validateStory,
  type Story,
} from './story';
import { prologue } from '../story/prologue';
import { art } from '../art/scenes';

const tiny: Story = {
  title: 'Tiny',
  start: 'a',
  scenes: [
    {
      id: 'a',
      art: 'x',
      onEnter: { set: ['arrived'] },
      text: ['Hello.', { if: { flags: ['secret'] }, text: 'A hidden line.' }],
      choices: [
        { label: 'Take the key', goto: 'a', if: { lacks: ['key'] }, do: { add: ['key'] } },
        { label: 'Open the door', goto: 'b', if: { has: ['key'] }, do: { set: ['secret'] } },
        { label: 'Give up', goto: 'end' },
      ],
    },
    { id: 'b', art: 'x', text: ['Inside.'], choices: [{ label: 'Done', goto: 'end' }] },
    { id: 'end', art: 'x', text: ['The end.'], ending: true, choices: [] },
  ],
};

describe('conditions', () => {
  it('holds() checks flags, not, has, lacks', () => {
    const s = newGame(tiny);
    s.flags.add('f');
    s.items.add('i');
    expect(holds(s, undefined)).toBe(true);
    expect(holds(s, { flags: ['f'] })).toBe(true);
    expect(holds(s, { flags: ['g'] })).toBe(false);
    expect(holds(s, { not: ['f'] })).toBe(false);
    expect(holds(s, { not: ['g'] })).toBe(true);
    expect(holds(s, { has: ['i'] })).toBe(true);
    expect(holds(s, { has: ['j'] })).toBe(false);
    expect(holds(s, { lacks: ['i'] })).toBe(false);
    expect(holds(s, { lacks: ['j'] })).toBe(true);
  });

  it('apply() mutates flags and items', () => {
    const s = newGame(tiny);
    apply(s, { set: ['x'], add: ['sword'] });
    expect(s.flags.has('x')).toBe(true);
    expect(s.items.has('sword')).toBe(true);
    apply(s, { clear: ['x'], remove: ['sword'] });
    expect(s.flags.has('x')).toBe(false);
    expect(s.items.has('sword')).toBe(false);
  });
});

describe('game flow', () => {
  it('runs onEnter for the start scene', () => {
    const s = newGame(tiny);
    expect(s.flags.has('arrived')).toBe(true);
    expect(s.seen).toEqual(['a']);
  });

  it('gates choices on state and reveals them as state changes', () => {
    const s = newGame(tiny);
    expect(availableChoices(tiny, s).map((c) => c.label)).toEqual(['Take the key', 'Give up']);
    choose(tiny, s, availableChoices(tiny, s)[0]); // take the key (self-loop)
    expect(s.scene).toBe('a');
    expect(availableChoices(tiny, s).map((c) => c.label)).toEqual(['Open the door', 'Give up']);
  });

  it('shows conditional paragraphs only when their condition holds', () => {
    const s = newGame(tiny);
    expect(visibleText(tiny, s)).toEqual(['Hello.']);
    s.flags.add('secret');
    expect(visibleText(tiny, s)).toEqual(['Hello.', 'A hidden line.']);
  });

  it('refuses a choice whose condition fails', () => {
    const s = newGame(tiny);
    const locked = tiny.scenes[0].choices[1];
    expect(() => choose(tiny, s, locked)).toThrow(/not available/);
  });

  it('round-trips through serialize/deserialize', () => {
    const s = newGame(tiny);
    choose(tiny, s, availableChoices(tiny, s)[0]);
    const restored = deserialize(tiny, serialize(s));
    expect(restored.scene).toBe(s.scene);
    expect([...restored.flags].sort()).toEqual([...s.flags].sort());
    expect([...restored.items].sort()).toEqual([...s.items].sort());
    expect(restored.seen).toEqual(s.seen);
  });

  it('rejects a save pointing at a scene that no longer exists', () => {
    expect(() => deserialize(tiny, '{"scene":"gone","flags":[],"items":[],"seen":[]}')).toThrow(
      /Unknown scene/,
    );
  });
});

describe('the prologue story', () => {
  it('is a well-formed graph (no broken links or dead ends)', () => {
    expect(validateStory(prologue)).toEqual([]);
  });

  it('references only illustrations that exist', () => {
    for (const scene of prologue.scenes) {
      expect(art[scene.art], `missing art "${scene.art}" for scene "${scene.id}"`).toBeDefined();
    }
  });

  it('every scene is reachable from the start', () => {
    const reached = new Set<string>();
    const queue = [prologue.start];
    while (queue.length) {
      const id = queue.pop()!;
      if (reached.has(id)) continue;
      reached.add(id);
      const scene = prologue.scenes.find((s) => s.id === id)!;
      queue.push(...scene.choices.map((c) => c.goto));
    }
    for (const scene of prologue.scenes) {
      expect(reached.has(scene.id), `unreachable scene "${scene.id}"`).toBe(true);
    }
  });

  it('an ending is reachable by simple play (always pick the first choice)', () => {
    const s = newGame(prologue);
    for (let step = 0; step < 50; step++) {
      const scene = prologue.scenes.find((sc) => sc.id === s.scene)!;
      if (scene.ending) return;
      choose(prologue, s, availableChoices(prologue, s)[0]);
    }
    throw new Error('never reached an ending in 50 steps');
  });
});
