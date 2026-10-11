import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test.beforeEach(async ({ page }, info) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [] }));
  await page.goto(info.project.metadata.backend === 'webgl2' ? '/?backend=webgl2' : '/');
  await page.waitForFunction(() => Boolean(window.__VOID_RESCUE__));
});

test('permite escoger ambiente y jugar con el paisaje seleccionado', async ({ page }, info) => {
  await page.getByRole('button', { name: /PERSONALIZAR PAISAJE/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Personalizar paisaje' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('combobox', { name: 'Estilo de paisaje' }).selectOption('city');
  expect(await page.evaluate(() => window.__VOID_RESCUE__!.getMetrics().landscape)).toBe('Ciudad abandonada');
  await dialog.getByRole('button', { name: /LISTO/ }).click();
  await page.getByRole('button', { name: /INICIAR VUELO/ }).click();
  await expect.poll(() => page.evaluate(() => window.__VOID_RESCUE__!.getState().frame)).toBeGreaterThan(30);
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
  expect(preferences.custom.layers).toHaveLength(5);
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
