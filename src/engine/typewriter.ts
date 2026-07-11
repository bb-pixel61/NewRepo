/**
 * Types paragraphs into a container character by character.
 * A skip() call (wired to clicks) completes the current run instantly.
 */
export class Typewriter {
  private timer: number | undefined;
  private finish: (() => void) | undefined;

  constructor(
    private container: HTMLElement,
    private msPerChar = 16,
  ) {}

  /** Begin typing; resolves when done (naturally or via skip). */
  type(paragraphs: string[]): Promise<void> {
    this.cancel();
    this.container.innerHTML = '';
    const nodes = paragraphs.map((text) => {
      const p = document.createElement('p');
      if (text === text.toUpperCase() && text.length < 40 && /[A-Z]/.test(text)) {
        p.className = 'ending-mark'; // all-caps short lines are title cards
      }
      this.container.appendChild(p);
      return { p, text };
    });

    return new Promise((resolve) => {
      let i = 0; // paragraph index
      let j = 0; // char index within paragraph
      const done = () => {
        this.cancel();
        for (const n of nodes) n.p.textContent = n.text;
        resolve();
      };
      this.finish = done;
      const tick = () => {
        if (i >= nodes.length) return done();
        const n = nodes[i];
        j += 1;
        n.p.textContent = n.text.slice(0, j);
        if (j >= n.text.length) {
          i += 1;
          j = 0;
        }
        this.timer = window.setTimeout(tick, this.msPerChar);
      };
      tick();
    });
  }

  /** Instantly complete the in-progress typing, if any. Returns true if it skipped. */
  skip(): boolean {
    if (!this.finish) return false;
    this.finish();
    return true;
  }

  private cancel(): void {
    if (this.timer !== undefined) window.clearTimeout(this.timer);
    this.timer = undefined;
    this.finish = undefined;
  }
}
