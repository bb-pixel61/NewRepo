import { describe, it, expect } from 'vitest';
import { contentTokens, firstCanon, matchIntent, matchResponse, choiceKeywords } from './parser';
import { newGame, getScene, availableChoices, choose, apply } from './story';
import { prologue } from '../story/prologue';

function optionsAt(sceneId: string, flags: string[] = []) {
  const s = newGame(prologue);
  s.scene = sceneId;
  apply(s, { set: flags });
  return { state: s, options: availableChoices(prologue, s) };
}

function expectGoto(input: string, options: ReturnType<typeof optionsAt>['options'], goto: string) {
  const res = matchIntent(input, options);
  expect(res.type, `"${input}" should match a choice`).toBe('match');
  if (res.type === 'match') expect(res.choice.goto).toBe(goto);
}

describe('tokenizing', () => {
  it('drops filler and collapses synonyms', () => {
    expect(contentTokens('Please try to grab the mushrooms for me')).toEqual(['take', 'fungus']);
    expect(contentTokens('walk towards the door')).toEqual(['go', 'gate']);
  });

  it('firstCanon identifies global commands anywhere in phrasing', () => {
    expect(firstCanon('look at the gate')).toBe('look');
    expect(firstCanon('examine the glyphs')).toBe('look');
    expect(firstCanon('check pack')).toBe('inventory');
    expect(firstCanon('where am i')).toBe('map');
  });
});

describe('intent matching in the prologue', () => {
  it('understands ways to climb down the well', () => {
    const { options } = optionsAt('well-top');
    expectGoto('climb down the rope', options, 'the-descent');
    expectGoto('tie the rope around my waist and descend', options, 'the-descent');
  });

  it('understands leaning over for a look', () => {
    const { options } = optionsAt('well-top');
    expectGoto('lean over the edge', options, 'the-slip');
    expectGoto('peer over the lip', options, 'the-slip');
  });

  it('understands the pebble test', () => {
    const { options } = optionsAt('well-top');
    expectGoto('throw a stone in and listen', options, 'the-echo');
    expectGoto('drop a pebble', options, 'the-echo');
  });

  it('understands shouting and filling the waterskin at the well bottom', () => {
    const { options } = optionsAt('well-bottom');
    expectGoto('yell for help', options, 'the-shout');
    expectGoto('fill my flask with water', options, 'well-bottom');
    expectGoto('crawl into the gap', options, 'the-breach');
  });

  it('understands travel intents in the cavern', () => {
    const { options } = optionsAt('cavern-vista');
    expectGoto('pick some glowing mushrooms', options, 'cavern-vista');
    expectGoto('go to the river', options, 'river-shore');
    expectGoto('take the stairs up to the door', options, 'ruins-stair');
  });

  it('asks for clarification on a genuine tie', () => {
    const { options } = optionsAt('well-top');
    const res = matchIntent('rope', options);
    expect(res.type).toBe('ambiguous');
  });

  it('returns none for nonsense', () => {
    const { options } = optionsAt('well-top');
    expect(matchIntent('dance a jig', options).type).toBe('none');
    expect(matchIntent('', options).type).toBe('none');
  });

  it('every choice keeps at least one keyword after filtering', () => {
    for (const scene of prologue.scenes) {
      for (const choice of scene.choices) {
        expect(
          choiceKeywords(choice).size,
          `choice "${choice.label}" in "${scene.id}" has no keywords`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('a full game is winnable by typing', () => {
    const state = newGame(prologue);
    const script = [
      'drop a pebble and listen',
      'climb down',
      'hold on',
      'fill my waterskin',
      'squeeze into the breach',
      'push on toward the glow',
      'gather some fungus',
      'head down to the river',
      'follow the lights downstream',
    ];
    for (const line of script) {
      const res = matchIntent(line, availableChoices(prologue, state));
      expect(res.type, `"${line}" failed at scene "${state.scene}"`).toBe('match');
      if (res.type === 'match') choose(prologue, state, res.choice);
    }
    expect(getScene(prologue, state.scene).ending).toBe(true);
  });
});

describe('flavor responses', () => {
  it('answers drinking at the well bottom', () => {
    const { state } = optionsAt('well-bottom');
    const scene = getScene(prologue, 'well-bottom');
    expect(matchResponse('drink the water', scene, state)).toMatch(/sweeter/);
  });

  it('answers reading the glyphs, honoring conditions', () => {
    const { state } = optionsAt('ruins-stair');
    const scene = getScene(prologue, 'ruins-stair');
    expect(matchResponse('read the carvings', scene, state)).toMatch(/edge of meaning/);
  });

  it('returns nothing when no rule matches', () => {
    const { state } = optionsAt('well-top');
    const scene = getScene(prologue, 'well-top');
    expect(matchResponse('sing a song', scene, state)).toBeUndefined();
  });
});
