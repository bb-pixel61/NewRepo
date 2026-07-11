import type { Story } from '../engine/story';

/**
 * THE LAST WELL — Prologue
 *
 * Dunmoor is three summers into a drought. The village well is the last
 * one still giving, and today the bucket came up scraping stone.
 * Someone has to go down and see. Everyone looked at you.
 */
export const prologue: Story = {
  title: 'The Last Well',
  start: 'well-top',
  scenes: [
    {
      id: 'well-top',
      art: 'village-well',
      text: [
        'Dunmoor, in the third summer without rain. The river is a memory with a bridge over it. Six wells served this village once; five are filled with dust and prayers.',
        'This one still gives — gave. This morning the bucket came up scraping stone, and the whole square went quiet at the sound.',
        'Someone has to go down and see what is left. Everyone looked at you.',
      ],
      responses: [
        {
          match: ['drink', 'water'],
          text: 'There is nothing up here to drink. That is rather the point.',
        },
        {
          match: ['bucket'],
          text: 'The bucket sits on the lip, dry as a sermon. It has nothing to tell you that the scraping sound didn’t.',
        },
      ],
      choices: [
        {
          label: 'Lean over the lip and haul the rope in for a closer look',
          goto: 'the-slip',
          do: { set: ['reckless'] },
          intent: ['edge', 'lip', 'look inside'],
        },
        {
          label: 'Knot the rope around your waist and climb down properly',
          goto: 'the-descent',
          intent: ['descend', 'go down the well'],
        },
        {
          label: 'Drop a pebble in first, and listen',
          goto: 'the-echo',
          intent: ['listen', 'test', 'throw a stone'],
        },
      ],
    },
    {
      id: 'the-echo',
      art: 'village-well',
      onEnter: { set: ['heard-depths'] },
      text: [
        'The pebble falls. You count — two, three, four — far too long for any well.',
        'Then: a splash. Not the flat slap of a puddle. A deep sound, a wide sound, with an echo behind it like a voice in a great hall.',
        'There is water down there. There is a *down there* down there.',
      ],
      choices: [
        {
          label: 'Lean over the lip and haul the rope in for a closer look',
          goto: 'the-slip',
          do: { set: ['reckless'] },
          intent: ['edge', 'lip', 'look inside'],
        },
        {
          label: 'Knot the rope around your waist and climb down properly',
          goto: 'the-descent',
          intent: ['descend', 'go down the well'],
        },
      ],
    },
    {
      id: 'the-slip',
      art: 'well-shaft',
      onEnter: { set: ['bruised'] },
      text: [
        'The lip of the well has stood for two hundred years. It picks this moment to stop.',
        'A stone shifts under your hand, the rope burns through your fingers, and the hot sky becomes a shrinking coin above you.',
        'You have time to notice the well is far, far deeper than any well has a right to be.',
      ],
      choices: [
        {
          label: 'Fall.',
          goto: 'well-bottom',
          intent: ['continue', 'scream', 'brace', 'accept', 'close eyes', 'ok'],
        },
      ],
    },
    {
      id: 'the-descent',
      art: 'well-shaft',
      onEnter: { set: ['roped'], add: ['rope'] },
      text: [
        'You go down hand over hand, boots braced on the stonework. Ten feet. Twenty. The daylight narrows to a coin overhead.',
        'Thirty feet down, the masonry is wet — wet, in this summer — and then a whole course of it simply lets go beneath your boot.',
        'The rope snaps taut, tears free, snags again — each catch stealing a little of the fall — and then the wall is gone entirely and you are dropping through open dark.',
      ],
      choices: [
        {
          label: 'Hold on.',
          goto: 'well-bottom',
          intent: ['grip', 'rope', 'continue', 'hang', 'brace', 'ok'],
        },
      ],
    },
    {
      id: 'well-bottom',
      art: 'well-bottom',
      text: [
        'Water takes you — cold, real, shockingly deep — and then your boots find gravel and you stand, gasping, in a pool that reaches your waist.',
        {
          if: { flags: ['bruised'] },
          text: 'Your left ankle throbs where it clipped stone on the way down. It will carry you. It will complain.',
        },
        {
          if: { flags: ['roped'] },
          text: 'Ten feet of rope is still knotted at your waist, frayed end drifting. It slowed you enough. It may yet be useful.',
        },
        'This is more water than Dunmoor has seen in a year. Above, the shaft you fell through is a pale thread of daylight, impossibly far.',
        'And there — at the waterline — the wall is torn open. A breach, black and ragged, breathing cool air that smells of stone and something green. Moving air means open space beyond.',
        {
          if: { flags: ['filled-skin'] },
          text: 'Your waterskin hangs heavy and full at your hip. Whatever happens next, that much is won.',
        },
      ],
      responses: [
        {
          match: ['drink', 'water'],
          text: 'You cup a mouthful. It is cold enough to hurt and sweeter than anything Dunmoor has tasted in three years.',
        },
        {
          match: ['climb', 'up'],
          text: 'You run your hands over the shaft wall. Sheer, weeping stone, and sixty feet of it. Not without a ladder, and nobody up there is building you one.',
        },
        {
          match: ['bucket'],
          text: 'The old bucket bobs by your knee, finally full. Small victories.',
        },
      ],
      choices: [
        {
          label: 'Fill your waterskin — this is what you came for',
          goto: 'well-bottom',
          if: { not: ['filled-skin'] },
          do: { set: ['filled-skin'], add: ['waterskin'] },
          intent: ['water', 'skin', 'flask', 'bottle'],
        },
        {
          label: 'Shout for help up the shaft',
          goto: 'the-shout',
          if: { not: ['shouted'] },
          intent: ['yell', 'scream', 'call for help'],
        },
        {
          label: 'Squeeze into the breach',
          goto: 'the-breach',
          intent: ['enter', 'crawl', 'through the gap', 'hole', 'passage'],
        },
      ],
    },
    {
      id: 'the-shout',
      art: 'well-bottom',
      onEnter: { set: ['shouted'] },
      text: [
        'You cup your hands and send your voice up the shaft. It climbs, and thins, and dies somewhere below the daylight.',
        'Nothing comes back but your own name, worn smooth by the stone.',
        'And one other thing: from the breach at your back, the moving air goes still for a moment. As if something paused to listen.',
      ],
      choices: [
        {
          label: 'Turn to the breach',
          goto: 'well-bottom',
          intent: ['face', 'continue', 'look at the gap', 'ok'],
        },
      ],
    },
    {
      id: 'the-breach',
      art: 'breach',
      text: [
        'You go in sideways, cheek to the stone. The rock presses your chest like a hand and the dark is total — except ahead, where a faint green-blue glow outlines the twist of the passage.',
        'The glow is getting stronger. The passage is getting tighter.',
      ],
      choices: [
        {
          label: 'Push on toward the glow',
          goto: 'cavern-vista',
          intent: ['continue', 'forward', 'deeper', 'go on', 'light'],
        },
        {
          label: 'Back out while you still can',
          goto: 'no-way-back',
          intent: ['retreat', 'return', 'leave', 'turn around'],
        },
      ],
    },
    {
      id: 'no-way-back',
      art: 'well-bottom',
      text: [
        'You worm backward into the well chamber and look up, really look, at the way you came.',
        'Sixty feet of sheer, weeping stone. The rope that might have helped is short, frayed, or gone. The daylight is a rumor.',
        'The truth settles on you, cold as the water at your waist: the only way out is through.',
      ],
      choices: [
        {
          label: 'Face the breach',
          goto: 'the-breach',
          intent: ['enter', 'crawl', 'squeeze', 'go through', 'continue', 'accept'],
        },
      ],
    },
    {
      id: 'cavern-vista',
      art: 'cavern-vista',
      onEnter: { set: ['saw-cavern'] },
      text: [
        'The passage releases you like a held breath — and you stop, because your eyes refuse the scale of what they are seeing.',
        'A cavern like a buried sky. The ceiling is lost in the dark, strewn with colonies of glowing fungus like cold constellations. Below, a river — a real river, wide as a road — pours silver-blue through fields of luminous growth.',
        'And rising from the cavern floor: a stair. Cut. Carved. Made. Climbing to a gate in the far wall.',
        'Dunmoor is dying of thirst sixty feet above an ocean of night, and somebody built a door to it.',
        {
          if: { flags: ['heard-depths'] },
          text: 'This is what the pebble told you. The splash with a hall behind it. You just never imagined the hall.',
        },
      ],
      responses: [
        {
          match: ['listen'],
          text: 'You stand still. The river speaks in a long, patient vowel, and beneath it — or maybe within it — something slower keeps time.',
        },
        {
          match: ['shout', 'echo'],
          text: 'You almost shout, to hear the size of this place answer. Some instinct advises against announcing yourself. You take its advice.',
        },
      ],
      choices: [
        {
          label: 'Gather a handful of the glowing fungus for light',
          goto: 'cavern-vista',
          if: { not: ['fungus-light'] },
          do: { set: ['fungus-light'], add: ['glowcap'] },
          intent: ['take', 'pick', 'mushroom', 'glowcap', 'torch'],
        },
        {
          label: 'Head down to the river',
          goto: 'river-shore',
          intent: ['go to the river', 'water', 'shore'],
        },
        {
          label: 'Climb the carved stair to the gate',
          goto: 'ruins-stair',
          intent: ['steps', 'gate', 'up', 'ruins', 'door'],
        },
      ],
    },
    {
      id: 'river-shore',
      art: 'river-shore',
      text: [
        'The shore is pebbles worn round — worn by water, by ages of it. You crouch and drink from cupped hands. The water is sweet and mineral and so cold it aches.',
        'Out in the current, something makes a wake. A long one. It does not surface, and it does not leave.',
        'Downstream, the river bends away into the dark, and you would swear — faint, far off — there are lights along it. Regular ones. Spaced like lamps.',
      ],
      responses: [
        {
          match: ['drink', 'water'],
          text: 'You drink again, slower this time. Mineral, and old — water that has never once seen the sun.',
        },
        {
          match: ['swim', 'wade'],
          text: 'You watch the long wake keep its patient distance out in the current, and decide — firmly, permanently — against swimming.',
        },
        {
          match: ['wake', 'creature', 'fish'],
          text: 'Whatever makes the wake, it is longer than a rowboat and in no hurry at all. It knows you are here. That is all you can tell.',
        },
      ],
      choices: [
        {
          label: 'Follow the shore downstream, toward the lights',
          goto: 'end-prologue',
          do: { set: ['path-river'] },
          intent: ['walk', 'lamps', 'lights', 'downstream'],
        },
        {
          label: 'Turn back and take the carved stair instead',
          goto: 'ruins-stair',
          intent: ['steps', 'gate', 'back', 'ruins'],
        },
      ],
    },
    {
      id: 'ruins-stair',
      art: 'ruins-stair',
      text: [
        'The steps are cut for feet like yours, but worn hollow in the middle by centuries of others. At the top stands the gate: two jambs of dressed stone, carved edge to edge with glyphs you almost recognize, the way you almost recognize a word on the tip of your tongue.',
        {
          if: { flags: ['fungus-light'] },
          text: 'When you raise the glowcap, the glyphs answer it — a shimmer chasing through the carvings like breath over embers. The light and the stone know each other.',
        },
        'The gate stands ajar. From the gap, warm air moves in a slow rhythm. Out. And in. Like something very large, very far below, is asleep and breathing.',
      ],
      responses: [
        {
          match: ['read', 'glyphs'],
          text: 'The glyphs sit right at the edge of meaning, like a word on the tip of your tongue. One shape repeats, over and over: a circle with a line falling into it. A well, you think. Or a mouth.',
        },
        {
          match: ['listen', 'breathing'],
          text: 'Out. And in. Slower than any sleeper you have ever sat beside. You find your own breath has changed pace to match, and make yourself stop.',
        },
        {
          match: ['knock'],
          text: 'You raise a knuckle to the stone — and lower it. Some doors you knock on. Some doors you do not wake.',
        },
      ],
      choices: [
        {
          label: 'Slip through the gate',
          goto: 'end-prologue',
          do: { set: ['path-gate'] },
          intent: ['enter', 'go through', 'door', 'inside'],
        },
        {
          label: 'Go back down to the river instead',
          goto: 'river-shore',
          intent: ['water', 'shore', 'back'],
        },
      ],
    },
    {
      id: 'end-prologue',
      art: 'cavern-vista',
      ending: true,
      text: [
        {
          if: { flags: ['path-river'] },
          text: 'You follow the shore into the dark, toward the distant lamps, with the river whispering beside you and the wake keeping pace, always just offshore.',
        },
        {
          if: { flags: ['path-gate'] },
          text: 'You turn sideways and slip through the gate, into the warm breathing dark, and the glyphs glimmer once behind you like an eye closing.',
        },
        {
          if: { flags: ['filled-skin'] },
          text: 'Somewhere above, Dunmoor is still thirsty. But you know something now that no one up there knows: the water never vanished. It went somewhere. And you are standing in the door of it.',
        },
        {
          if: { not: ['filled-skin'] },
          text: 'Somewhere above, Dunmoor is still thirsty — and your waterskin is still empty, a small regret you carry into the dark. But you know something now: the water never vanished. It went somewhere. And you are standing in the door of it.',
        },
        'END OF THE PROLOGUE',
        'The Last Well continues in Chapter One.',
      ],
      choices: [],
    },
  ],
};
