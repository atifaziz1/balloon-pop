import { test, expect } from '@playwright/test';

test('keyboard, pause, sound controls, help and timeout work in a browser', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install();
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Pop the pink balloon' })).toBeVisible();
  await page.screenshot({ path: '/tmp/balloon-pop-desktop.png', fullPage: true });
  await page.keyboard.press('a');
  await expect(page.getByTestId('score')).toHaveText('1');
  await page.clock.runFor(700);
  await expect(page.getByRole('button', { name: 'Pop the blue balloon' })).toBeVisible();
  await page.getByRole('button', { name: 'Pause game' }).click();
  await page.clock.runFor(61000);
  await expect(page.getByTestId('timer')).toHaveText('1:00');
  await page.getByRole('button', { name: 'Resume game' }).click();
  await page.clock.runFor(60000);
  await expect(page.getByRole('button', { name: 'Pop the purple balloon' })).toBeVisible();
  await expect(page.getByTestId('score')).toHaveText('1');
  await page.getByRole('button', { name: 'Mute sound' }).click();
  await expect(page.getByRole('button', { name: 'Turn sound on' })).toBeVisible();
  await page.getByRole('button', { name: 'How to play' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile fits the screen and tapping pops exactly one balloon', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Pop the pink balloon' }).tap();
  await expect(page.getByTestId('score')).toHaveText('1');
  await expect(page.getByRole('button', { name: 'Pop the blue balloon' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '/tmp/balloon-pop-mobile.png', fullPage: true });
});
