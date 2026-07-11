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
  type GameState,
  type Story,
} from './engine/story';
import { Typewriter } from './engine/typewriter';
import { Draw } from './art/draw';
import { art } from './art/scenes';
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
const choicesEl = document.querySelector<HTMLElement>('#choices')!;
const restartEl = document.querySelector<HTMLButtonElement>('#restart')!;
const writer = new Typewriter(textEl);

let state: GameState = loadOrNew();

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

async function render(): Promise<void> {
  const scene = getScene(story, state.scene);
  (art[scene.art] ?? art['well-bottom'])(draw);

  choicesEl.innerHTML = '';
  await writer.type(visibleText(story, state));

  if (scene.ending) {
    const again = document.createElement('button');
    again.className = 'choice';
    again.innerHTML = '<span class="key">↺</span>Play again';
    again.onclick = restart;
    choicesEl.appendChild(again);
    localStorage.removeItem(SAVE_KEY); // a finished run shouldn't resume
    return;
  }

  availableChoices(story, state).forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.innerHTML = `<span class="key">${idx + 1}</span>`;
    btn.appendChild(document.createTextNode(choice.label));
    btn.onclick = () => {
      choose(story, state, choice);
      save();
      void render();
    };
    choicesEl.appendChild(btn);
  });
}

function restart(): void {
  localStorage.removeItem(SAVE_KEY);
  state = newGame(story);
  save();
  void render();
}

restartEl.onclick = restart;

// Click anywhere on the scene or text to finish the typewriter early.
for (const el of [canvas, textEl]) {
  el.addEventListener('click', () => writer.skip());
}

// Number keys pick choices; any key skips typing first.
window.addEventListener('keydown', (e) => {
  if (writer.skip()) return;
  const n = Number(e.key);
  if (n >= 1 && n <= 9) {
    const btn = choicesEl.children[n - 1] as HTMLButtonElement | undefined;
    btn?.click();
  }
});

void render();
