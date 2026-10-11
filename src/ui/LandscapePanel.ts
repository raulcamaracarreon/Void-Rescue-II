import {
  allLandscapeChoices, copyLandscape, defaultLandscapePreferences, LANDSCAPE_PRESETS,
  resolveLandscape, sanitizeLandscapePreferences,
} from '../landscape/LandscapeConfig';
import type {
  AutomaticLandscape, LandscapeEditorMode, LandscapeLayer, LandscapePreferences,
  LandscapeSelection, LandscapeStyle,
} from '../landscape/LandscapeConfig';

/** Two editing modes: a derived RGB gradient and complete per-layer controls. */
export class LandscapePanel {
  private readonly dialog: HTMLDialogElement;
  private readonly selection: HTMLSelectElement;
  private readonly mode: HTMLSelectElement;
  private readonly layers: HTMLElement;
  private readonly description: HTMLElement;
  private readonly swatches: HTMLElement;
  private preferences: LandscapePreferences;
  private editingId: string | null = null;
  private readonly nameInput: HTMLInputElement;
  private readonly rotationList: HTMLElement;

  constructor(root: HTMLElement, initial: LandscapePreferences,
    private readonly onChange: (value: LandscapePreferences) => void,
    private readonly currentWave: () => number,
    private readonly currentSeed: () => number = () => 0) {
    this.preferences = sanitizeLandscapePreferences(initial);
    this.dialog = document.createElement('dialog');
    this.dialog.className = 'pause-dialog landscape-dialog';
    this.dialog.setAttribute('aria-label', 'Personalizar paisaje');
    this.dialog.innerHTML = `
      <p class="eyebrow">VOID RESCUE II / MUNDO PROCEDURAL</p>
      <h2>Personalizar paisaje<span>.</span></h2>
      <p class="landscape-help">Un gradiente automático entre el color del cielo y el primer plano, o control individual de cada capa. Los cambios se aplican al instante.</p>
      <div class="landscape-selection-row">
        <label class="landscape-label">Estilo visual
          <select id="landscape-selection" aria-label="Estilo de paisaje">
            <option value="cycle">Automático por oleada</option>
            ${Object.entries(LANDSCAPE_PRESETS).map(([key, preset]) => `<option value="${key}">${preset.label}</option>`).join('')}
            <option value="custom">Personalizado</option>
          </select>
        </label>
        <label class="landscape-label">Edición de capas
          <select id="landscape-mode" aria-label="Modo de edición">
            <option value="automatic">Automático · dos colores</option>
            <option value="advanced">Avanzado · por capa</option>
          </select>
        </label>
      </div>
      <p class="landscape-description" role="status"></p>
      <section class="landscape-library">
        <h3>Mis paisajes</h3>
        <p class="landscape-help">Guarda tantos paisajes como quieras. Los estilos incluidos no se sobrescriben.</p>
        <label class="landscape-label">Nombre del paisaje
          <input type="text" maxlength="60" class="landscape-name" aria-label="Nombre del paisaje" placeholder="Mi nuevo mundo">
        </label>
        <div class="landscape-buttons landscape-library-actions">
          <button type="button" data-landscape="save-new">Guardar nuevo</button>
          <button type="button" data-landscape="save-changes">Guardar cambios</button>
          <button type="button" data-landscape="duplicate">Duplicar</button>
          <button type="button" data-landscape="rename">Renombrar</button>
          <button type="button" data-landscape="delete">Eliminar</button>
        </div>
        <h3>Ambientes de las oleadas</h3>
        <label class="landscape-label">Orden de aparición
          <select class="landscape-rotation" aria-label="Rotación de ambientes">
            <option value="sequential">Secuencial</option>
            <option value="shuffle">Aleatorio sin repeticiones</option>
          </select>
        </label>
        <div class="landscape-rotation-list" aria-label="Ambientes incluidos en las oleadas"></div>
      </section>
      <div class="landscape-automatic">
        <p class="landscape-help">Elige únicamente dos colores. El juego interpola los tonos de las capas, de lejos a cerca.</p>
        <div class="landscape-global">
          <label>Color del cielo <input type="color" data-auto="skyColor" aria-label="Color del cielo"></label>
          <label>Capa más cercana <input type="color" data-auto="frontColor" aria-label="Color de la capa más cercana"></label>
          <label>Número de capas <input type="number" min="2" max="10" step="1" data-auto="layerCount" aria-label="Número de capas"></label>
          <label>Composición <select data-auto="composition" aria-label="Tipo de paisaje">
            <option value="mountains">Montañas</option><option value="buildings">Edificios</option><option value="mixed">Mixto</option>
          </select></label>
        </div>
        <p class="landscape-swatches-label">GRADIENTE GENERADO · DE LEJOS A CERCA</p>
        <div class="landscape-swatches" aria-label="Vista previa de colores por capa"></div>
      </div>
      <div class="landscape-advanced" hidden>
        <div class="landscape-global">
          <label>Cielo superior <input type="color" data-sky="skyTop" aria-label="Color superior del cielo"></label>
          <label>Horizonte <input type="color" data-sky="skyBottom" aria-label="Color del horizonte"></label>
        </div>
        <div class="landscape-layers-title"><strong>CAPAS · DE LEJOS A CERCA</strong><span>2–10</span></div>
        <div class="landscape-layers"></div>
        <div class="landscape-buttons">
          <button type="button" data-landscape="add">+ Capa</button>
          <button type="button" data-landscape="remove">− Capa</button>
        </div>
      </div>
      <div class="landscape-common">
        <label>Estrellas <input type="checkbox" data-common="stars" aria-label="Mostrar estrellas"></label>
        <label>Luna <input type="checkbox" data-common="moon" aria-label="Mostrar luna"></label>
        <label>Semilla <input type="number" min="0" max="999999999" data-common="seed" aria-label="Semilla de paisaje"></label>
      </div>
      <div class="landscape-buttons">
        <button type="button" data-landscape="customize">Editar estilo actual</button>
        <button type="button" data-landscape="restore">Restablecer</button>
      </div>
      <button type="button" class="primary" data-landscape="close">LISTO / VOLVER ↗</button>
      <p class="landscape-help">Las siluetas cambian de semilla al avanzar de oleada. El modo Automático por oleada cambia también de paleta.</p>
    `;
    root.append(this.dialog);
    this.selection = this.dialog.querySelector<HTMLSelectElement>('#landscape-selection')!;
    this.mode = this.dialog.querySelector<HTMLSelectElement>('#landscape-mode')!;
    this.layers = this.dialog.querySelector<HTMLElement>('.landscape-layers')!;
    this.description = this.dialog.querySelector<HTMLElement>('.landscape-description')!;
    this.swatches = this.dialog.querySelector<HTMLElement>('.landscape-swatches')!;
    this.nameInput = this.dialog.querySelector<HTMLInputElement>('.landscape-name')!;
    this.rotationList = this.dialog.querySelector<HTMLElement>('.landscape-rotation-list')!;

    this.selection.addEventListener('change', () => {
      this.preferences.selection = this.selection.value as LandscapeSelection;
      this.editingId = null;
      const saved = this.currentSaved();
      if (saved) this.preferences.mode = saved.mode;
      this.commit();
      this.render();
    });
    this.mode.addEventListener('change', () => {
      this.switchMode(this.mode.value as LandscapeEditorMode);
    });
    for (const input of this.dialog.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-auto]')) {
      const apply = () => {
        const style = this.mutableStyle();
        const settings = style.automatic!;
        const key = input.dataset.auto as keyof AutomaticLandscape;
        if (key === 'layerCount') settings.layerCount = Math.max(2, Math.min(10, Math.round(Number(input.value) || 2)));
        else if (key === 'composition') settings.composition = input.value === 'buildings' || input.value === 'mixed' ? input.value : 'mountains';
        else if (key === 'skyColor' || key === 'frontColor') settings[key] = input.value;
        this.commit();
      };
      // The number field publishes immediately, without forcing a focus-losing rerender mid-typing.
      if (input.dataset.auto === 'layerCount') input.addEventListener('input', () => { apply(); this.paintSwatches(); });
      input.addEventListener('change', () => { apply(); this.render(); });
    }
    for (const input of this.dialog.querySelectorAll<HTMLInputElement>('[data-sky]')) {
      input.addEventListener('change', () => {
        const style = this.mutableStyle();
        const key = input.dataset.sky as 'skyTop' | 'skyBottom';
        style[key] = input.value;
        style.advancedEdited = true;
        this.commit();
      });
    }
    for (const input of this.dialog.querySelectorAll<HTMLInputElement>('[data-common]')) {
      input.addEventListener('change', () => {
        const style = this.mutableStyle();
        const key = input.dataset.common;
        if (key === 'stars') style.stars = input.checked;
        else if (key === 'moon') style.moon = input.checked;
        else if (key === 'seed') style.seed = Math.max(0, Math.min(999999999, Math.round(Number(input.value) || 0)));
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
      style.advancedEdited = true;
      this.commit();
    });

    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="customize"]')!.addEventListener('click', () => {
      if (this.preferences.mode === 'automatic') this.switchMode('advanced');
      else { this.mutableStyle(); this.render(); this.commit(); }
    });
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="add"]')!.addEventListener('click', () => {
      const style = this.mutableStyle();
      if (style.layers.length < 10) style.layers.push({ ...style.layers[style.layers.length - 1]! });
      style.advancedEdited = true;
      this.commit(); this.render();
    });
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="remove"]')!.addEventListener('click', () => {
      const style = this.mutableStyle();
      if (style.layers.length > 2) style.layers.pop();
      style.advancedEdited = true;
      this.commit(); this.render();
    });
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="restore"]')!.addEventListener('click', () => {
      // Presets are restored, but personal library and its pool must never be wiped.
      const previous = this.preferences;
      this.preferences = { ...defaultLandscapePreferences(), library: previous.library,
        cyclePool: previous.cyclePool, rotation: previous.rotation };
      this.editingId = null;
      this.commit(); this.render();
    });
    this.dialog.querySelector<HTMLSelectElement>('.landscape-rotation')!.addEventListener('change', event => {
      this.preferences.rotation = (event.target as HTMLSelectElement).value === 'shuffle'
        ? 'shuffle' : 'sequential';
      this.commit(); this.render();
    });
    this.rotationList.addEventListener('change', event => {
      const checkbox = event.target;
      if (!(checkbox instanceof HTMLInputElement) || !checkbox.dataset.landscapeId) return;
      const id = checkbox.dataset.landscapeId;
      if (checkbox.checked && !this.preferences.cyclePool.includes(id)) this.preferences.cyclePool.push(id);
      if (!checkbox.checked) this.preferences.cyclePool = this.preferences.cyclePool.filter(item => item !== id);
      this.commit(); this.renderRotationList();
    });
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="save-new"]')!.addEventListener('click', () => {
      const name = this.nameInput.value.trim().slice(0, 60) || `Mi paisaje ${this.preferences.library.length + 1}`;
      const id = crypto.randomUUID();
      if (this.preferences.library.length >= 100) { this.description.textContent = 'Máximo de 100 paisajes guardados'; return; }
      this.preferences.library.push({
        id, name, mode: this.preferences.mode,
        style: copyLandscape(resolveLandscape(this.preferences, this.currentWave(), this.currentSeed()).style),
      });
      this.preferences.selection = `user:${id}`;
      this.editingId = null;
      this.commit(); this.render();
    });
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="save-changes"]')!.addEventListener('click', () => {
      const entry = this.currentSaved() ?? this.preferences.library.find(item => item.id === this.editingId);
      if (!entry) return;
      entry.style = copyLandscape(this.preferences.selection === 'custom'
        ? this.preferences.custom : resolveLandscape(this.preferences, this.currentWave(), this.currentSeed()).style);
      entry.mode = this.preferences.mode;
      this.preferences.selection = `user:${entry.id}`;
      this.editingId = null;
      this.commit(); this.render();
    });
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="duplicate"]')!.addEventListener('click', () => {
      if (this.preferences.library.length >= 100) return;
      const source = this.currentSaved();
      const name = `${source?.name ?? resolveLandscape(this.preferences, this.currentWave(), this.currentSeed()).name} (copia)`;
      const id = crypto.randomUUID();
      this.preferences.library.push({ id, name, mode: this.preferences.mode,
        style: copyLandscape(resolveLandscape(this.preferences, this.currentWave(), this.currentSeed()).style) });
      this.preferences.selection = `user:${id}`;
      this.editingId = null;
      this.commit(); this.render();
    });
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="rename"]')!.addEventListener('click', () => {
      const entry = this.currentSaved() ?? this.preferences.library.find(item => item.id === this.editingId);
      if (!entry || !this.nameInput.value.trim()) return;
      entry.name = this.nameInput.value.trim().slice(0, 60);
      this.commit(); this.render();
    });
    this.dialog.querySelector<HTMLButtonElement>('[data-landscape="delete"]')!.addEventListener('click', () => {
      const entry = this.currentSaved() ?? this.preferences.library.find(item => item.id === this.editingId);
      if (!entry || !confirm(`¿Eliminar el paisaje "${entry.name}"?`)) return;
      this.preferences.library = this.preferences.library.filter(item => item.id !== entry.id);
      this.preferences.cyclePool = this.preferences.cyclePool.filter(item => item !== `user:${entry.id}`);
      this.preferences.selection = 'cycle';
      this.editingId = null;
      this.commit(); this.render();
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
    const controls = [...this.dialog.querySelectorAll<HTMLElement>('input, select, button')]
      .filter(element => element.getBoundingClientRect().width > 0);
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

  private currentSaved() {
    return this.preferences.library.find(item => `user:${item.id}` === this.preferences.selection);
  }

  private switchMode(mode: LandscapeEditorMode): void {
    if (mode === 'advanced' && this.preferences.mode === 'automatic') {
      // First switch copies the visible gradient; subsequent switches preserve hand-made layers.
      const visible = resolveLandscape(this.preferences, this.currentWave(), this.currentSeed()).style;
      const style = this.mutableStyle();
      if (!style.advancedEdited) style.layers = visible.layers.map(layer => ({ ...layer }));
      if (!style.advancedEdited) {
        style.skyTop = visible.skyTop;
        style.skyBottom = visible.skyBottom;
      }
    }
    this.preferences.mode = mode;
    this.commit();
    this.render();
  }

  private mutableStyle(): LandscapeStyle {
    if (this.preferences.selection !== 'custom') {
      const current = resolveLandscape(this.preferences, this.currentWave(), this.currentSeed()).style;
      this.editingId = this.currentSaved()?.id ?? null;
      this.preferences.custom = copyLandscape(current);
      this.preferences.custom.advancedEdited = false;
      this.preferences.selection = 'custom';
      this.selection.value = 'custom';
    }
    return this.preferences.custom;
  }

  private commit(): void {
    this.preferences = sanitizeLandscapePreferences(this.preferences);
    this.updateDescription();
    this.onChange(sanitizeLandscapePreferences(this.preferences));
  }

  private updateDescription(): void {
    const { name, style } = resolveLandscape(this.preferences, this.currentWave());
    const suffix = this.preferences.selection === 'cycle' ? ' · cambia en la siguiente oleada' : '';
    this.description.textContent = `${name} · ${style.layers.length} capas · ${this.preferences.mode === 'automatic' ? 'gradiente automático' : 'edición avanzada'}${suffix}`;
  }

  private paintSwatches(): void {
    this.swatches.replaceChildren();
    if (this.preferences.mode !== 'automatic') return;
    const style = resolveLandscape(this.preferences, this.currentWave()).style;
    const colors = [style.automatic!.skyColor, ...style.layers.map(layer => layer.color)];
    for (let i = 0; i < colors.length; i++) {
      const swatch = document.createElement('span');
      swatch.style.backgroundColor = colors[i]!;
      swatch.title = i === 0 ? 'Cielo' : `Capa ${i}`;
      swatch.setAttribute('aria-label', swatch.title);
      this.swatches.append(swatch);
    }
  }

  private renderRotationList(): void {
    this.rotationList.replaceChildren();
    for (const item of allLandscapeChoices(this.preferences)) {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.landscapeId = item.id;
      checkbox.checked = this.preferences.cyclePool.includes(item.id);
      checkbox.setAttribute('aria-label', `Incluir ${item.label} en oleadas`);
      label.append(checkbox, document.createTextNode(item.label));
      this.rotationList.append(label);
    }
  }

  private render(): void {
    // Never inject user-provided names as HTML; construct text-only select options.
    this.selection.replaceChildren(new Option('Rotación por oleada', 'cycle'));
    for (const item of allLandscapeChoices(this.preferences))
      this.selection.add(new Option(item.label, item.id));
    this.selection.add(new Option('Personalizado (sin guardar)', 'custom'));
    const style = resolveLandscape(this.preferences, this.currentWave()).style;
    const automatic = style.automatic!;
    this.selection.value = this.preferences.selection;
    this.mode.value = this.preferences.mode;
    const saved = this.currentSaved() ?? this.preferences.library.find(item => item.id === this.editingId);
    this.nameInput.value = saved?.name ?? '';
    for (const id of ['save-changes', 'rename', 'delete']) {
      this.dialog.querySelector<HTMLButtonElement>(`[data-landscape="${id}"]`)!.disabled = !saved;
    }
    this.dialog.querySelector<HTMLSelectElement>('.landscape-rotation')!.value = this.preferences.rotation;
    this.renderRotationList();
    this.dialog.querySelector<HTMLElement>('.landscape-automatic')!.hidden = this.preferences.mode !== 'automatic';
    this.dialog.querySelector<HTMLElement>('.landscape-advanced')!.hidden = this.preferences.mode !== 'advanced';

    for (const input of this.dialog.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-auto]')) {
      const key = input.dataset.auto as keyof AutomaticLandscape;
      input.value = String(automatic[key]);
    }
    this.paintSwatches();
    for (const input of this.dialog.querySelectorAll<HTMLInputElement>('[data-sky]')) {
      const key = input.dataset.sky;
      if (key === 'skyTop') input.value = style.skyTop;
      else if (key === 'skyBottom') input.value = style.skyBottom;
    }
    for (const input of this.dialog.querySelectorAll<HTMLInputElement>('[data-common]')) {
      if (input.dataset.common === 'stars') input.checked = style.stars;
      else if (input.dataset.common === 'moon') input.checked = style.moon;
      else input.value = String(style.seed);
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
