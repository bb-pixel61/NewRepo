import './style.css';
import {
  newGame,
  getScene,
  availableChoices,
  visibleText,
  choose,
  serialize,
  deserialize,
  validateStory,
  type Choice,
  type GameState,
  type Story,
} from './engine/story';
import { firstCanon, matchIntent, matchResponse } from './engine/parser';
import { Typewriter } from './engine/typewriter';
import { renderHud } from './ui/hud';
import { Draw } from './art/draw';
import { art } from './art/scenes';
import { items as itemCodex, mapNodes, sceneNode } from './game/codex';
import { prologue } from './story/prologue';

const SAVE_KEY = 'the-last-well/save';

const story: Story = prologue;
{
  const problems = validateStory(story);
  if (problems.length) throw new Error(`Story is broken:\n${problems.join('\n')}`);
}

const canvas = document.querySelector<HTMLCanvasElement>('#scene')!;
const ctx = canvas.getContext('2d')!;
ctx.imageSmoothingEnabled = false;
const draw = new Draw(ctx);

const textEl = document.querySelector<HTMLElement>('#text')!;
const feedbackEl = document.querySelector<HTMLElement>('#feedback')!;
const promptEl = document.querySelector<HTMLFormElement>('#prompt')!;
const commandEl = document.querySelector<HTMLInputElement>('#command')!;
const restartEl = document.querySelector<HTMLButtonElement>('#restart')!;
const writer = new Typewriter(textEl);

let state: GameState = loadOrNew();
let stumbles = 0; // consecutive inputs the parser couldn't use

function loadOrNew(): GameState {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try {
      return deserialize(story, saved);
    } catch {
      localStorage.removeItem(SAVE_KEY); // stale save from an older story version
    }
  }
  return newGame(story);
}

function save(): void {
  localStorage.setItem(SAVE_KEY, serialize(state));
}

function say(text: string): void {
  feedbackEl.textContent = text;
}

async function render(): Promise<void> {
  const scene = getScene(story, state.scene);
  (art[scene.art] ?? art['well-bottom'])(draw);
  renderHud(state);

  say('');
  await writer.type(visibleText(story, state));

  if (scene.ending) {
    localStorage.removeItem(SAVE_KEY); // a finished run shouldn't resume
    say("Type 'again' to return to the well.");
  }
  commandEl.focus();
}

function restart(): void {
  localStorage.removeItem(SAVE_KEY);
  state = newGame(story);
  stumbles = 0;
  save();
  void render();
}

function act(choice: Choice): void {
  stumbles = 0;
  choose(story, state, choice);
  save();
  void render();
}

function hintLine(): string {
  const options = availableChoices(story, state).map((c) => c.label.toLowerCase());
  return options.length ? `You might: ${options.join(' · ')}` : '';
}

function inventoryLine(): string {
  if (state.items.size === 0) return 'You are empty-handed.';
  const names = [...state.items].map((id) => itemCodex[id]?.name.toLowerCase() ?? id);
  return `You carry: ${names.join(', ')}.`;
}

function whereLine(): string {
  const node = sceneNode[state.scene];
  return node ? `You are at ${mapNodes[node].label}.` : 'You are somewhere between places.';
}

const FALLBACKS = [
  "That doesn't seem to help here.",
  'You consider it, then think better of it.',
  "Nothing comes of it. (Type 'hint' if you're stuck.)",
];

function handle(raw: string): void {
  const scene = getScene(story, state.scene);

  if (scene.ending) {
    if (/^(again|restart|replay|play again|new game)$/i.test(raw)) restart();
    else say("The story is over — for now. Type 'again' to return to the well.");
    return;
  }

  const options = availableChoices(story, state);

  // Bare numbers still work as shortcuts for the nth action.
  const n = Number(raw);
  if (Number.isInteger(n) && n >= 1 && n <= options.length) return act(options[n - 1]);

  // Global commands, keyed on the first meaningful word.
  const head = raw.trim().toLowerCase() === 'i' ? 'inventory' : firstCanon(raw);
  if (head === 'look') {
    stumbles = 0;
    say('');
    void writer.type(visibleText(story, state)).then(() => commandEl.focus());
    return;
  }
  if (head === 'inventory') return void ((stumbles = 0), say(inventoryLine()));
  if (head === 'map') return void ((stumbles = 0), say(whereLine()));
  if (head === 'help') return void ((stumbles = 0), say(hintLine()));

  const intent = matchIntent(raw, options);
  if (intent.type === 'match') return act(intent.choice);
  if (intent.type === 'ambiguous') {
    stumbles = 0;
    const named = intent.choices.slice(0, 3).map((c) => `“${c.label.toLowerCase()}”`);
    say(`Which do you mean — ${named.join(' or ')}?`);
    return;
  }

  const flavor = matchResponse(raw, scene, state);
  if (flavor) {
    stumbles = 0;
    say(flavor);
    return;
  }

  stumbles += 1;
  say(stumbles >= 3 ? `You pause, unsure. ${hintLine()}` : FALLBACKS[(stumbles - 1) % FALLBACKS.length]);
}

promptEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const raw = commandEl.value.trim();
  commandEl.value = '';
  if (raw) handle(raw);
});

restartEl.onclick = restart;

// Click the scene or the prose to finish the typewriter early.
for (const el of [canvas, textEl]) {
  el.addEventListener('click', () => {
    writer.skip();
    commandEl.focus();
  });
}

void render();
