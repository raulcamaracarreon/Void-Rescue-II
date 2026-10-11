import {
  copyLandscape, defaultLandscapePreferences, LANDSCAPE_PRESETS, resolveLandscape,
  sanitizeLandscapePreferences,
} from '../landscape/LandscapeConfig';
import type { LandscapeLayer, LandscapePreferences, LandscapeSelection, LandscapeStyle } from '../landscape/LandscapeConfig';

/** Shared editor for the title screen and pause menu. Updates are applied to the live game. */
export class LandscapePanel {
  private readonly dialog: HTMLDialogElement;
  private readonly selection: HTMLSelectElement;
  private readonly layers: HTMLElement;
  private readonly description: HTMLElement;
  private preferences: LandscapePreferences;

  constructor(root: HTMLElement, initial: LandscapePreferences,
    private readonly onChange: (value: LandscapePreferences) => void,
    private readonly currentWave: () => number) {
    this.preferences = sanitizeLandscapePreferences(initial);
    this.dialog = document.createElement('dialog');
    this.dialog.className = 'pause-dialog landscape-dialog';
    this.dialog.setAttribute('aria-label', 'Personalizar paisaje');
    this.dialog.innerHTML = `
      <p class="eyebrow">VOID RESCUE II / MUNDO PROCEDURAL</p>
      <h2>Personalizar paisaje<span>.</span></h2>
      <p class="landscape-help">Elige un ambiente o edita una combinación propia. Los cambios se ven al instante y quedan guardados en este navegador.</p>
      <label class="landscape-label">Estilo visual
        <select id="landscape-selection" aria-label="Estilo de paisaje">
          <option value="cycle">Automático por oleada</option>
          ${Object.entries(LANDSCAPE_PRESETS).map(([key, preset]) => `<option value="${key}">${preset.label}</option>`).join('')}
          <option value="custom">Personalizado</option>
        </select>
      </label>
      <p class="landscape-description" role="status"></p>
      <div class="landscape-global">
        <label>Cielo superior <input type="color" data-sky="skyTop" aria-label="Color superior del cielo"></label>
        <label>Horizonte <input type="color" data-sky="skyBottom" aria-label="Color del horizonte"></label>
        <label>Estrellas <input type="checkbox" data-sky="stars" aria-label="Mostrar estrellas"></label>
        <label>Semilla <input type="number" min="0" max="999999999" data-sky="seed" aria-label="Semilla de paisaje"></label>
      </div>
      <div class="landscape-layers-title"><strong>CAPAS · DE LEJOS A CERCA</strong><span>2–10</span></div>
      <div class="landscape-layers"></div>
      <div class="landscape-buttons">
        <button type="button" data-landscape="customize">Editar estilo actual</button>
        <button type="button" data-landscape="add">+ Capa</button>
        <button type="button" data-landscape="remove">− Capa</button>
        <button type="button" data-landscape="restore">Restablecer</button>
      </div>
      <button type="button" class="primary" data-landscape="close">LISTO / VOLVER ↗</button>
      <p class="landscape-help">Los paisajes personalizados conservan sus colores entre oleadas, pero cambian de silueta al avanzar.</p>
    `;
    root.append(this.dialog);
    this.selection = this.dialog.querySelector<HTMLSelectElement>('#landscape-selection')!;
    this.layers = this.dialog.querySelector<HTMLElement>('.landscape-layers')!;
    this.description = this.dialog.querySelector<HTMLElement>('.landscape-description')!;
    this.selection.addEventListener('change', () => {
      this.preferences.selection = this.selection.value as LandscapeSelection;
      this.render();
      this.commit();
    });
    for (const input of this.dialog.querySelectorAll<HTMLInputElement>('[data-sky]')) {
      input.addEventListener('change', () => {
        const style = this.mutableStyle();
        const key = input.dataset.sky as keyof Pick<LandscapeStyle, 'skyTop' | 'skyBottom' | 'stars' | 'seed'>;
        if (key === 'stars') style.stars = input.checked;
        else if (key === 'seed') style.seed = Math.max(0, Math.min(999999999, Math.round(Number(input.value) || 0)));
        else style[key] = input.value;
        this.commit();
      });
    }
    this.layers.addEventListener('change', event => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement || input instanceof HTMLSelectElement)) return;
      const row = input.closest<HTMLElement>('[data-layer]');
      if (!row) return;
      const index = Number(row.dataset.layer);
      const style = this.mutableStyle();
      const layer = style.layers[index];
      if (!layer) return;
      const key = input.dataset.field as keyof LandscapeLayer | undefined;
      if (key === 'type') layer.type = input.value === 'buildings' ? 'buildings' : 'mountains';
      else if (key === 'color') layer.color = input.value;
      else if (key === 'amplitude') layer.amplitude = Math.max(2, Math.min(35, Math.round(Number(input.value) || 2)));
      else if (key === 'detail') layer.detail = Math.max(1, Math.min(100, Math.round(Number(input.value) || 1)));
      this.commit();
    });
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="customize"]')!.addEventListener('click', () => {
      this.mutableStyle(); this.render(); this.commit();
    });
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="add"]')!.addEventListener('click', () => {
      const style = this.mutableStyle();
      if (style.layers.length < 10) style.layers.push({ ...style.layers[style.layers.length - 1]! });
      this.render(); this.commit();
    });
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="remove"]')!.addEventListener('click', () => {
      const style = this.mutableStyle();
      if (style.layers.length > 2) style.layers.pop();
      this.render(); this.commit();
    });
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="restore"]')!.addEventListener('click', () => {
      this.preferences = defaultLandscapePreferences(); this.render(); this.commit();
    });
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="close"]')!.addEventListener('click', () => this.close());
    this.dialog.addEventListener('cancel', event => { event.preventDefault(); this.close(); });
    this.render();
  }

  get open(): boolean { return this.dialog.open; }
  show(): void {
    this.render();
    if (!this.dialog.open) this.dialog.showModal();
    this.selection.focus({ preventScroll: true });
  }
  close(): void { if (this.dialog.open) this.dialog.close(); }

  navigatePad(command: { x: number; y: number; confirm: boolean; back: boolean }): void {
    if (command.back) { this.close(); return; }
    const controls = [...this.dialog.querySelectorAll<HTMLElement>('input, select, button')].filter(element => element.getBoundingClientRect().width > 0);
    if (!controls.length) return;
    let index = controls.indexOf(document.activeElement as HTMLElement);
    if (index < 0) index = 0;
    let selected = controls[index]!;
    if (command.x && selected instanceof HTMLSelectElement) {
      selected.selectedIndex = Math.max(0, Math.min(selected.options.length - 1, selected.selectedIndex + command.x));
      selected.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (command.x && selected instanceof HTMLInputElement && selected.type === 'number') {
      selected.value = String(Math.max(Number(selected.min), Math.min(Number(selected.max), Number(selected.value) + command.x)));
      selected.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (command.x || command.y) {
      index = (index + (command.y || command.x) + controls.length) % controls.length;
      selected = controls[index]!;
    }
    if (command.x || command.y || command.confirm) {
      this.dialog.querySelectorAll('.joypad-focus').forEach(e => e.classList.remove('joypad-focus'));
      selected.classList.add('joypad-focus');
      selected.focus({ preventScroll: true });
      if (command.confirm) selected.click();
    }
  }

  private mutableStyle(): LandscapeStyle {
    if (this.preferences.selection !== 'custom') {
      this.preferences.custom = copyLandscape(resolveLandscape(this.preferences, this.currentWave()).style);
      this.preferences.selection = 'custom';
      this.selection.value = 'custom';
    }
    return this.preferences.custom;
  }

  private commit(): void {
    this.preferences = sanitizeLandscapePreferences(this.preferences);
    this.selection.value = this.preferences.selection;
    this.updateDescription();
    this.onChange(sanitizeLandscapePreferences(this.preferences));
  }

  private updateDescription(): void {
    const { name, style } = resolveLandscape(this.preferences, this.currentWave());
    const suffix = this.preferences.selection === 'cycle' ? ' · cambia en la siguiente oleada' : '';
    this.description.textContent = `${name} · ${style.layers.length} capas${suffix}`;
  }

  private render(): void {
    const style = resolveLandscape(this.preferences, this.currentWave()).style;
    this.selection.value = this.preferences.selection;
    for (const input of this.dialog.querySelectorAll<HTMLInputElement>('[data-sky]')) {
      const key = input.dataset.sky;
      if (key === 'skyTop') input.value = style.skyTop;
      else if (key === 'skyBottom') input.value = style.skyBottom;
      else if (key === 'stars') input.checked = style.stars;
      else if (key === 'seed') input.value = String(style.seed);
    }
    this.layers.innerHTML = style.layers.map((layer, i) => `
      <div class="landscape-layer" data-layer="${i}">
        <span class="landscape-layer-index">${String(i + 1).padStart(2, '0')}</span>
        <label>Tipo <select data-field="type" aria-label="Tipo de capa ${i + 1}">
          <option value="mountains" ${layer.type === 'mountains' ? 'selected' : ''}>Montañas</option>
          <option value="buildings" ${layer.type === 'buildings' ? 'selected' : ''}>Edificios</option>
        </select></label>
        <label>Color <input data-field="color" type="color" value="${layer.color}" aria-label="Color de capa ${i + 1}"></label>
        <label>Amplitud <input data-field="amplitude" type="number" min="2" max="35" value="${layer.amplitude}" aria-label="Amplitud de capa ${i + 1}"></label>
        <label>Detalle <input data-field="detail" type="number" min="1" max="100" value="${layer.detail}" aria-label="Detalle de capa ${i + 1}"></label>
      </div>`).join('');
    const count = style.layers.length;
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="add"]')!.disabled = count >= 10;
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="remove"]')!.disabled = count <= 2;
    this.updateDescription();
  }
}
