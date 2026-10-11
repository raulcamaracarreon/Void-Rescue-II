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
