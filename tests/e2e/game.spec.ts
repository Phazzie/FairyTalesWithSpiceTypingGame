import { test, expect } from '@playwright/test';
import { pickThemes, startGame, typingInput, currentPhrase, playChapter } from './helpers';

test.describe('start screen', () => {
  test('needs exactly three themes before generating', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Fairytales with Spice');
    const generate = page.getByRole('button', { name: /File and call the first witness/ });
    await expect(generate).toBeDisabled();
    await pickThemes(page, ['Forbidden Love', 'Fated Mates']);
    await expect(generate).toBeDisabled();
    await page.getByRole('button', { name: 'Ancient Curse', exact: true }).click();
    await expect(generate).toBeEnabled();
    await expect(page.getByText('3 of 3 counts charged')).toBeVisible();
    // A fourth count can't be added
    await expect(page.getByRole('button', { name: 'Pack Rivalry', exact: true })).toBeDisabled();
  });

  test('exhibits panel opens and accepts input', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Exhibits/ }).click();
    await page.getByLabel('Exhibit A. The protagonist').fill('a lighthouse keeper');
    await expect(page.getByLabel('Exhibit A. The protagonist')).toHaveValue('a lighthouse keeper');
  });
});

test('full game: three chapters to the final story', async ({ page }) => {
  await startGame(page);
  const days = ['One', 'Two', 'Three'];
  for (let ch = 1; ch <= 3; ch++) {
    await expect(page.getByRole('heading', { name: new RegExp(`^Day ${days[ch - 1]} of Three`) })).toBeVisible();
    await playChapter(page);
    await expect(page.getByRole('heading', { name: `End of Day ${days[ch - 1]} proceedings` })).toBeVisible();
    await expect(page.getByText('100%')).toBeVisible();
    await expect(page.locator('.inaudible')).toHaveCount(0);
    await page.getByRole('button', { name: ch < 3 ? /Court resumes/ : /certify/ }).click();
  }
  await expect(page.getByRole('heading', { name: 'Your Story is Complete!' })).toBeAttached();
  await expect(page.getByText('GUILTY', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Day Three:/ })).toBeVisible();
  // Finished stories don't offer a stale resume
  await page.reload();
  await expect(page.getByTestId('resume')).toHaveCount(0);
});

test('every phrase can be typed on a normal keyboard and story text is not repeated', async ({ page }) => {
  await startGame(page);
  const phrases = new Set<string>();
  const input = typingInput(page);
  while (!(await page.getByRole('heading', { name: 'End of Day One proceedings' }).isVisible())) {
    const phrase = await currentPhrase(page);
    expect(phrase, `phrase "${phrase}"`).toMatch(/^[\x20-\x7E]+$/);
    phrases.add(phrase);
    await input.pressSequentially(phrase);
    await expect(page.getByTestId('phrase').or(page.getByRole('heading', { name: /proceedings/ }))).not.toHaveText(phrase);
    if (await page.getByTestId('story-panel').isVisible()) {
      const lines = await page.getByTestId('story-panel').locator('p').allInnerTexts();
      expect(new Set(lines).size).toBe(lines.length);
    }
  }
  expect(phrases.size).toBeGreaterThanOrEqual(12);
});

test('typing is forgiving about case and extra spaces', async ({ page }) => {
  await startGame(page);
  const phrase = await currentPhrase(page);
  await typingInput(page).pressSequentially(phrase.toUpperCase().replace(' ', '  '));
  await typingInput(page).press('Enter');
  await expect(page.getByText('✅ 1 caught')).toBeVisible();
});

test('misses: Enter on a wrong phrase, and the wolf escaping', async ({ page }) => {
  test.setTimeout(60_000);
  await startGame(page, { speed: 'espresso' });
  const input = typingInput(page);
  const first = await currentPhrase(page);
  await input.pressSequentially(first);
  await expect(page.getByText('✅ 1 caught')).toBeVisible();
  await input.pressSequentially('nope');
  await input.press('Enter');
  await expect(page.getByText('❌ 1 missed')).toBeVisible();
  await expect(page.getByText('Objection!')).toBeVisible();
  await expect(page.getByTestId('story-panel').getByText('[INAUDIBLE]')).toBeVisible();
  // Do nothing: at top speed the wolf escapes in about 9 seconds
  await expect(page.getByText('❌ 2 missed')).toBeVisible({ timeout: 20_000 });
});

test('pause stops the wolf, resume refocuses typing, quit saves and resume restores', async ({ page }) => {
  await startGame(page);
  const input = typingInput(page);
  await input.pressSequentially(await currentPhrase(page));
  await expect(page.getByText('✅ 1 caught')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'The court is in recess.' })).toBeVisible();
  const wolf = page.getByText('🐺').first();
  const before = (await wolf.boundingBox())!.x;
  await page.waitForTimeout(800);
  expect((await wolf.boundingBox())!.x).toBe(before);

  await page.getByRole('button', { name: 'Reconvene' }).click();
  await expect(input).toBeFocused();

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Adjourn/ }).click();
  await expect(page.getByText('Mistrial')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Fairytales with Spice/ })).toBeVisible();

  await page.getByRole('button', { name: 'Reconvene' }).click();
  await expect(page.getByText('✅ 1 caught')).toBeVisible();
  await expect(input).toBeEnabled();
});

test('switching away from the tab pauses the game', async ({ page }) => {
  await startGame(page);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('heading', { name: 'The court is in recess.' })).toBeVisible();
});

test('a server failure declares a mistrial and a retrial keeps your picks', async ({ page }) => {
  await page.route('**/api/generate-story', r => r.fulfill({ status: 500, body: '{}' }));
  await page.goto('/');
  await pickThemes(page);
  await page.getByRole('button', { name: /File and call the first witness/ }).click();
  await expect(page.getByText('Mistrial')).toBeVisible();
  await page.getByRole('button', { name: 'Motion for retrial' }).click();
  await expect(page.getByText('3 of 3 counts charged')).toBeVisible();
});

test('API rejects bad input', async ({ request }) => {
  const bad = await request.post('/api/generate-story', {
    data: { spiceLevel: 9, customization: { selectedThemes: ['a', 'b', 'c'] } },
  });
  expect(bad.status()).toBe(400);
  const noProse = await request.post('/api/extract-phrases', { data: {} });
  expect(noProse.status()).toBe(400);
});

test('phone layout has no sideways scroll during play @mobile', async ({ page }) => {
  await startGame(page);
  const [scrollW, viewW] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(scrollW).toBeLessThanOrEqual(viewW);
});

test('missed testimony is struck from the record as [INAUDIBLE]', async ({ page }) => {
  await startGame(page);
  const input = typingInput(page);
  await input.press('Enter'); // miss the first line on purpose
  await expect(page.getByText('❌ 1 missed')).toBeVisible();
  await playChapter(page);
  await expect(page.getByRole('heading', { name: 'End of Day One proceedings' })).toBeVisible();
  await expect(page.getByText(/^\[INAUDIBLE: \d+ words\]$/)).toHaveCount(1);
});
