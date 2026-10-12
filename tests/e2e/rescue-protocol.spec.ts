import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }, info) => {
  await page.setViewportSize({ width: 1100, height: 680 });
  await page.addInitScript(() => Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [] }));
  await page.goto(info.project.metadata.backend === 'webgl2' ? '/?backend=webgl2' : '/');
  await page.waitForFunction(() => Boolean(window.__VOID_RESCUE__));
});

test('Realista es predeterminado y Segunda oportunidad se guarda y aplica a las partidas', async ({ page }) => {
  const select = page.getByRole('combobox', { name: 'Protocolo de rescate' });
  await expect(select).toHaveValue('realistic');
  await select.selectOption('local');
  await expect(page.locator('.protocol-help')).toContainText('reaparece pronto');
  await page.getByRole('button', { name: /INICIAR VUELO/ }).click();
  const state = await page.evaluate(() => window.__VOID_RESCUE__!.getState());
  expect(state.rescueProtocol).toBe('local');
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__VOID_RESCUE__));
  await expect(page.getByRole('combobox', { name: 'Protocolo de rescate' })).toHaveValue('local');
});

test('Protegido mantiene la modalidad de misión y dificultad elegidas', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Protocolo de rescate' }).selectOption('protected');
  await page.getByRole('combobox', { name: 'Modo de juego' }).selectOption('rescue');
  await page.getByRole('combobox', { name: 'Dificultad' }).first().selectOption('hard');
  await page.getByRole('button', { name: /INICIAR VUELO/ }).click();
  const state = await page.evaluate(() => window.__VOID_RESCUE__!.getState());
  expect(state.rescueProtocol).toBe('protected');
  expect(state.missionMode).toBe('rescue');
  expect(state.difficulty).toBe('hard');
});
