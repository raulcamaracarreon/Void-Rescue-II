import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }, info) => {
  await page.setViewportSize({ width: 960, height: 540 });
  await page.addInitScript(() => Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [] }));
  await page.goto(info.project.metadata.backend === 'webgl2' ? '/?backend=webgl2' : '/');
  await page.waitForFunction(() => Boolean(window.__VOID_RESCUE__));
});

test('Clásico es predeterminado y conserva el calendario finito', async ({ page }) => {
  const choice = page.getByRole('combobox', { name: 'Sistema de enemigos' });
  await expect(choice).toHaveValue('classic');
  await page.getByRole('button', { name: /INICIAR VUELO/ }).click();
  const state = await page.evaluate(() => window.__VOID_RESCUE__!.getState());
  expect(state.spawnMode).toBe('classic');
  expect(state.schedule).toHaveLength(11);
  expect(state.director).toBeNull();
});

test('el jugador puede elegir enemigos recurrentes por zonas y objetivo Rescatista', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Sistema de enemigos' }).selectOption('dynamic');
  await page.getByRole('combobox', { name: 'Modo de juego' }).selectOption('rescue');
  await page.getByRole('button', { name: /INICIAR VUELO/ }).click();
  const current = await page.evaluate(() => window.__VOID_RESCUE__!.getState());
  expect(current.spawnMode).toBe('dynamic');
  expect(current.missionMode).toBe('rescue');
  expect(current.schedule).toHaveLength(0);
  expect(current.director).not.toBeNull();
  await page.evaluate(() => window.__VOID_RESCUE__!.setPaused(true));
  await page.evaluate(() => window.__VOID_RESCUE__!.step(300));
  const next = await page.evaluate(() => window.__VOID_RESCUE__!.getState());
  expect(next.spawnIndex).toBe(0);
  expect(next.director!.spawned).toBeGreaterThan(0);
  expect(next.enemies.length).toBeGreaterThan(0);
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__VOID_RESCUE__));
  await expect(page.getByRole('combobox', { name: 'Sistema de enemigos' })).toHaveValue('dynamic');
  await expect(page.getByRole('combobox', { name: 'Modo de juego' })).toHaveValue('rescue');
});
