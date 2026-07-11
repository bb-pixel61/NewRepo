# The Last Well

A pixel-art choose-your-own-adventure for the browser, in the spirit of the
classic Sierra adventures: illustrated scenes, typewriter narration, and
choices that shape the journey.

> Dunmoor is three summers into a drought. The village well is the last one
> still giving — and this morning the bucket came up scraping stone. Someone
> has to go down and see what's left. Everyone looked at you.

What starts as a climb for the last of the water becomes a fall into a vast
underground network: a buried river, fields of glowing fungus, and a carved
stair that proves somebody built a door to it all.

## Playing

- **Click** (or press any key) to skip the typewriter effect
- **Press 1–9** or click to choose
- Your progress auto-saves; close the tab and pick up where you left off
- Choices set flags and items that change later scenes and endings

## Development

```bash
npm install
npm run dev      # local dev server with hot reload
npm test         # engine + story-graph tests (vitest)
npm run build    # typecheck + production build to dist/
```

## How it's put together

| Piece | Where | What it does |
|---|---|---|
| Story engine | `src/engine/story.ts` | Generic scene graph: conditional text, gated choices, flags/items, saves. Knows nothing about the plot. |
| The adventure | `src/story/prologue.ts` | Pure data — scenes, prose, choices. Add chapters here without touching engine code. |
| Pixel art | `src/art/` | Procedural 320×180 illustrations drawn on canvas from a fixed retro palette, upscaled crisp. |
| UI | `src/main.ts`, `src/engine/typewriter.ts` | Canvas + DOM shell: typewriter text, choice buttons, keyboard input, localStorage saves. |

The story graph is validated by tests: no broken links, no unreachable
scenes, no dead ends, and every illustration referenced must exist.

## Deployment

Pushes to `main` build, test, and deploy to GitHub Pages via
`.github/workflows/deploy.yml`. One-time setup: in the repo's
**Settings → Pages**, set the source to **GitHub Actions**.

## License

No license has been chosen yet. Until one is added, all rights are reserved.
