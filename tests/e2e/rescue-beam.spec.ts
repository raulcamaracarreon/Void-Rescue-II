import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }, info) => {
  await page.setViewportSize({ width: 960, height: 540 });
  await page.addInitScript(() => Object.defineProperty(navigator, 'getGamepads',
    { configurable: true, value: () => [] }));
  await page.goto(info.project.metadata.backend === 'webgl2' ? '/?backend=webgl2' : '/');
  await page.waitForFunction(() => Boolean(window.__VOID_RESCUE__));
  await page.getByRole('combobox', { name: 'Modo de juego' }).selectOption('rescue');
  await page.getByRole('button', { name: /INICIAR VUELO/ }).click();
  await page.evaluate(() => window.__VOID_RESCUE__!.loadScenario('rescue-pickup'));
});

test('E mantenida eleva al colono y lo oculta dentro de la nave con contador de pasajeros', async ({ page }) => {
  test.setTimeout(110_000);
  await page.keyboard.down('KeyE');
  await page.waitForFunction(() => window.__VOID_RESCUE__!.getState().colonists[0]!.status === 'extracting');
  await page.waitForFunction(() => window.__VOID_RESCUE__!.getState().colonists[0]!.status === 'carried');
  await page.keyboard.up('KeyE');
  const s = await page.evaluate(() => window.__VOID_RESCUE__!.getState());
  expect(s.colonists[0]!.onboard).toBe(true);
  await expect(page.locator('#combat-stats')).toContainText('A BORDO');
  await expect(page.locator('#combat-stats')).toContainText('1/8');
});

test('soltar E a mitad del ascenso interrumpe la extracción', async ({ page }) => {
  await page.keyboard.down('KeyE');
  await page.waitForFunction(() => window.__VOID_RESCUE__!.getState().colonists[0]!.status === 'extracting');
  await page.keyboard.up('KeyE');
  await page.waitForFunction(() => window.__VOID_RESCUE__!.getState().colonists[0]!.status !== 'extracting');
  const c = (await page.evaluate(() => window.__VOID_RESCUE__!.getState())).colonists[0]!;
  expect(c.onboard).not.toBe(true);
  expect(c.status).not.toBe('carried');
});
