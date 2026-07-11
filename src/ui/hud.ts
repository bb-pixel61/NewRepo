import { holds, type GameState } from '../engine/story';
import { items, traits, conditions, mapNodes, sceneNode, mapEdges } from '../game/codex';

/**
 * The HUD: minimap (fog of war — only visited places exist), character
 * sheet (condition + traits earned by choices), and inventory.
 */

const MAP = { bg: '#141527', edge: '#4a5a78', node: '#8fa3bf', here: '#5fe8c8', halo: '#2b8f83' };

export function renderHud(state: GameState): void {
  renderMinimap(state);
  renderCharacter(state);
  renderInventory(state);
}

function visitedNodes(state: GameState): Set<string> {
  const visited = new Set<string>();
  for (const sceneId of state.seen) {
    const node = sceneNode[sceneId];
    if (node) visited.add(node);
  }
  return visited;
}

function renderMinimap(state: GameState): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#minimap')!;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = MAP.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const visited = visitedNodes(state);
  const here = sceneNode[state.scene];

  // Passages between places you have seen both ends of.
  ctx.fillStyle = MAP.edge;
  for (const [a, b] of mapEdges) {
    if (!visited.has(a) || !visited.has(b)) continue;
    const na = mapNodes[a];
    const nb = mapNodes[b];
    // Stepped pixel line: walk the longer axis one pixel at a time.
    const steps = Math.max(Math.abs(nb.x - na.x), Math.abs(nb.y - na.y));
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(na.x + ((nb.x - na.x) * i) / steps);
      const y = Math.round(na.y + ((nb.y - na.y) * i) / steps);
      ctx.fillRect(x, y, 1, 1);
    }
  }

  for (const id of visited) {
    const n = mapNodes[id];
    if (id === here) {
      ctx.fillStyle = MAP.halo;
      ctx.fillRect(n.x - 3, n.y - 3, 7, 7);
      ctx.fillStyle = MAP.here;
      ctx.fillRect(n.x - 2, n.y - 2, 5, 5);
    } else {
      ctx.fillStyle = MAP.node;
      ctx.fillRect(n.x - 2, n.y - 2, 4, 4);
    }
  }

  const label = document.querySelector<HTMLElement>('#location')!;
  label.textContent = here ? mapNodes[here].label : '';
}

function renderCharacter(state: GameState): void {
  const list = document.querySelector<HTMLElement>('#character')!;
  list.innerHTML = '';

  const condition = conditions.find((c) => holds(state, c.if));
  if (condition) {
    list.appendChild(entry(condition.label, 'How you are holding up.'));
  }
  for (const t of traits) {
    if (holds(state, t.if)) list.appendChild(entry(t.label, t.desc));
  }
}

function renderInventory(state: GameState): void {
  const list = document.querySelector<HTMLElement>('#inventory')!;
  list.innerHTML = '';

  if (state.items.size === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = '— empty-handed —';
    list.appendChild(li);
    return;
  }
  for (const id of state.items) {
    const info = items[id] ?? { name: id, desc: '' };
    list.appendChild(entry(info.name, info.desc));
  }
}

function entry(label: string, desc: string): HTMLLIElement {
  const li = document.createElement('li');
  const name = document.createElement('span');
  name.className = 'entry-name';
  name.textContent = label;
  li.appendChild(name);
  if (desc) {
    li.title = desc;
    const d = document.createElement('span');
    d.className = 'entry-desc';
    d.textContent = desc;
    li.appendChild(d);
  }
  return li;
}
