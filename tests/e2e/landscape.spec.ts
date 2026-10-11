import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test.beforeEach(async ({ page }, info) => {
  // 1080p software rendering on hosted Linux runners can be much slower than hardware.
  // Keep these UI interaction tests at a practical 16:9 viewport.
  await page.setViewportSize({ width: 960, height: 540 });
  await page.addInitScript(() => Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [] }));
  await page.goto(info.project.metadata.backend === 'webgl2' ? '/?backend=webgl2' : '/');
  await page.waitForFunction(() => Boolean(window.__VOID_RESCUE__));
});

test('genera un gradiente de dos extremos y permite volver a edición avanzada sin perder sus cambios', async ({ page }) => {
  await page.getByRole('button', { name: /PERSONALIZAR PAISAJE/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Personalizar paisaje' });
  await dialog.getByRole('combobox', { name: 'Estilo de paisaje' }).selectOption('ice');
  await expect(dialog.getByRole('combobox', { name: 'Modo de edición' })).toHaveValue('automatic');
  await expect(dialog.getByLabel('Color de capa 1')).toBeHidden();
  await dialog.getByLabel('Color del cielo', { exact: true }).fill('#96dbef');
  await dialog.getByLabel('Color de la capa más cercana').fill('#164c78');
  await dialog.getByLabel('Número de capas').fill('5');
  const auto = await page.evaluate(() => window.__VOID_RESCUE__!.getState().landscape);
  expect(auto.selection).toBe('custom');
  expect(auto.custom.automatic).toMatchObject({ skyColor: '#96dbef', frontColor: '#164c78', layerCount: 5 });
  expect(await dialog.locator('.landscape-swatches span').count()).toBe(6);
  await dialog.getByRole('combobox', { name: 'Modo de edición' }).selectOption('advanced');
  await dialog.getByLabel('Color de capa 1').fill('#da356f');
  await dialog.getByRole('combobox', { name: 'Modo de edición' }).selectOption('automatic');
  await dialog.getByRole('combobox', { name: 'Modo de edición' }).selectOption('advanced');
  await expect(dialog.getByLabel('Color de capa 1')).toHaveValue('#da356f');
  await dialog.getByRole('button', { name: /LISTO/ }).click();
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__VOID_RESCUE__));
  const saved = await page.evaluate(() => window.__VOID_RESCUE__!.getState().landscape);
  expect(saved.mode).toBe('advanced');
  expect(saved.custom.layers[0]!.color).toBe('#da356f');
});

test('permite ocultar la luna, alternar editores y conservar la preferencia al recargar', async ({ page }) => {
  await page.getByRole('button', { name: /PERSONALIZAR PAISAJE/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Personalizar paisaje' });
  const checkbox = dialog.getByRole('checkbox', { name: 'Mostrar luna' });
  await expect(checkbox).toBeChecked();
  await checkbox.uncheck();
  expect(await page.evaluate(() => window.__VOID_RESCUE__!.getState().landscape))
    .toMatchObject({ selection: 'custom', custom: { moon: false } });
  await dialog.getByRole('combobox', { name: 'Modo de edición' }).selectOption('advanced');
  await expect(checkbox).not.toBeChecked();
  await dialog.getByRole('button', { name: /LISTO/ }).click();
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__VOID_RESCUE__));
  await page.getByRole('button', { name: /PERSONALIZAR PAISAJE/ }).click();
  await expect(page.getByRole('dialog', { name: 'Personalizar paisaje' })
    .getByRole('checkbox', { name: 'Mostrar luna' })).not.toBeChecked();
});

test('HUD sobre el cielo sin tarjetas ni fondos opacos, con texto legible', async ({ page }, info) => {
  await page.getByRole('button', { name: /PERSONALIZAR PAISAJE/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Personalizar paisaje' });
  await dialog.getByRole('combobox', { name: 'Estilo de paisaje' }).selectOption('sunset');
  await dialog.getByRole('button', { name: /LISTO/ }).click();
  await page.getByRole('button', { name: /INICIAR VUELO/ }).click();
  const hud = page.locator('.flight-hud.combat');
  await expect(hud).toBeVisible();
  const styles = await hud.evaluate(element => {
    const selector = (part: string) => getComputedStyle(element.querySelector(part)!);
    return ['.mission', '.coordinates', '.combat-stats', '.combat-message'].map(part => ({
      background: selector(part).backgroundColor,
      paddingLeft: selector(part).paddingLeft,
      borderLeft: selector(part).borderLeftWidth,
      fontSize: parseFloat(selector(part).fontSize),
      textShadow: selector(part).textShadow,
      strokeWidth: selector(part).webkitTextStrokeWidth,
    }));
  });
  for (const style of styles) {
    expect(style.background).toBe('rgba(0, 0, 0, 0)');
    expect(style.paddingLeft).toBe('0px');
    expect(style.borderLeft).toBe('0px');
    expect(style.fontSize).toBeGreaterThanOrEqual(11);
    expect(style.textShadow).toBe('none');
    expect(style.strokeWidth).toBe('0px');
  }
  // All labels and numeric values must share ONE computed foreground color.
  const inks = await hud.evaluate(element => {
    const targets = [
      '.mission p', '.mission div > span', '.mission-index',
      '.mission-status', '.coordinates', '.coordinates b',
      '.combat-stats', '.combat-stats span', '.combat-stats b', '.combat-message',
    ];
    return {
      ink: getComputedStyle(element).getPropertyValue('--vr-hud-ink').trim(),
      colors: targets.map(selector => getComputedStyle(element.querySelector(selector)!).color),
      textShadows: targets.map(selector => getComputedStyle(element.querySelector(selector)!).textShadow),
      strokeWidths: targets.map(selector => getComputedStyle(element.querySelector(selector)!).webkitTextStrokeWidth),
      colorVars: ['--vr-hud-primary', '--vr-hud-secondary', '--vr-hud-accent', '--vr-hud-outline']
        .map(name => getComputedStyle(element).getPropertyValue(name).trim()),
    };
  });
  expect(inks.ink).toMatch(/^#[0-9a-f]{6}$/i);
  expect(new Set(inks.colors).size).toBe(1);
  expect(inks.textShadows.every(v => v === 'none')).toBe(true);
  expect(inks.strokeWidths.every(v => v === '0px')).toBe(true);
  expect(inks.colorVars.every(v => !v)).toBe(true);
  await mkdir('docs/screenshots', { recursive: true });
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-hud-transparent.png` });
});

test('permite escoger ambiente y jugar con el paisaje seleccionado', async ({ page }, info) => {
  await page.getByRole('button', { name: /PERSONALIZAR PAISAJE/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Personalizar paisaje' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('combobox', { name: 'Estilo de paisaje' }).selectOption('city');
  expect(await page.evaluate(() => window.__VOID_RESCUE__!.getMetrics().landscape)).toBe('Ciudad abandonada');
  await dialog.getByRole('button', { name: /LISTO/ }).click();
  await page.getByRole('button', { name: /INICIAR VUELO/ }).click();
  await expect.poll(() => page.evaluate(() => window.__VOID_RESCUE__!.getState().frame)).toBeGreaterThan(3);
  expect(await page.evaluate(() => window.__VOID_RESCUE__!.getMetrics().landscape)).toBe('Ciudad abandonada');
  await mkdir('docs/screenshots', { recursive: true });
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-landscape-city.png` });
});

test('edita capas y colores, guarda y recupera tras recargar', async ({ page }) => {
  await page.getByRole('button', { name: /PERSONALIZAR PAISAJE/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Personalizar paisaje' });
  await dialog.getByRole('button', { name: 'Editar estilo actual' }).click();
  await dialog.getByLabel('Color superior del cielo').fill('#142536');
  await dialog.getByLabel('Tipo de capa 1').selectOption('buildings');
  await dialog.getByLabel('Detalle de capa 1').fill('75');
  await dialog.getByRole('button', { name: /\+ Capa/ }).click();
  expect(await page.evaluate(() => window.__VOID_RESCUE__!.getState().landscape))
    .toMatchObject({ selection: 'custom', custom: { skyTop: '#142536' } });
  await dialog.getByRole('button', { name: /LISTO/ }).click();
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__VOID_RESCUE__));
  const preferences = await page.evaluate(() => window.__VOID_RESCUE__!.getState().landscape);
  expect(preferences.custom.layers).toHaveLength(7);
  expect(preferences.custom.layers[0]).toMatchObject({ type: 'buildings', detail: 75 });
  expect(preferences.custom.skyTop).toBe('#142536');
});

test('la personalización en pausa no reanuda el combate al cerrar el editor', async ({ page }) => {
  await page.getByRole('button', { name: /INICIAR VUELO/ }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Vuelo en pausa.' })).toBeVisible();
  await page.getByRole('button', { name: /PERSONALIZAR PAISAJE/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Personalizar paisaje' });
  await dialog.getByRole('combobox', { name: 'Estilo de paisaje' }).selectOption('ice');
  await dialog.getByRole('button', { name: /LISTO/ }).click();
  expect(await page.evaluate(() => window.__VOID_RESCUE__!.getState().mode)).toBe('paused');
  await page.getByRole('button', { name: /CONTINUAR VUELO/ }).click();
  await expect.poll(() => page.evaluate(() => window.__VOID_RESCUE__!.getState().mode)).toBe('playing');
});
