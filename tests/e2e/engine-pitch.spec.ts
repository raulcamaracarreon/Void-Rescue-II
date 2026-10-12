import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }, info) => {
  await page.setViewportSize({ width: 1100, height: 680 });
  await page.addInitScript(() => Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [] }));
  await page.goto(info.project.metadata.backend === 'webgl2' ? '/?backend=webgl2' : '/');
  await page.waitForFunction(() => Boolean(window.__VOID_RESCUE__));
});

async function moveSlider(page: import('@playwright/test').Page, selector: string, hz: number) {
  await page.locator(selector).evaluate((element, value) => {
    const slider = element as HTMLInputElement;
    slider.value = String(value);
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  }, hz);
}

test('tono del motor en menú y pausa: 250–1000 Hz, 432 Hz preciso y persistencia', async ({ page }) => {
  const titleSlider = page.locator('.title-engine-pitch .engine-pitch-slider');
  const pauseSlider = page.locator('.pause-engine-pitch .engine-pitch-slider');
  await expect(titleSlider).toHaveAttribute('min', '250');
  await expect(titleSlider).toHaveAttribute('max', '1000');
  await expect(titleSlider).toHaveAttribute('step', '1');
  await expect(titleSlider).toHaveValue('300');
  await moveSlider(page, '.title-engine-pitch .engine-pitch-slider', 432);
  await expect(titleSlider).toHaveValue('432');
  await expect(page.locator('.title-engine-pitch output')).toHaveText('432 Hz');
  await expect(pauseSlider).toHaveValue('432');
  await page.getByRole('button', { name: /INICIAR VUELO/ }).click();
  expect((await page.evaluate(() => window.__VOID_RESCUE__!.getState())).audio.enginePitchHz).toBe(432);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeVisible();
  await moveSlider(page, '.pause-engine-pitch .engine-pitch-slider', 750);
  await expect(page.locator('.pause-engine-pitch output')).toHaveText('750 Hz');
  await expect(titleSlider).toHaveValue('750');
  const state = await page.evaluate(() => window.__VOID_RESCUE__!.getState());
  expect(state.preferences.enginePitchHz).toBe(750);
  expect(state.audio.enginePitchHz).toBe(750);
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__VOID_RESCUE__));
  await expect(titleSlider).toHaveValue('750');
  expect((await page.evaluate(() => window.__VOID_RESCUE__!.getState())).preferences.enginePitchHz).toBe(750);
});
