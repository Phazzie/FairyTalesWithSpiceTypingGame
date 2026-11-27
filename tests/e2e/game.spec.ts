import { test, expect } from '@playwright/test';
import { pickThemes, startGame, typingInput, currentPhrase, playChapter } from './helpers';

test.describe('start screen', () => {
  test('needs exactly three themes before generating', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Fairytales with Spice');
    const generate = page.getByRole('button', { name: /Generate My Story/ });
    await expect(generate).toBeDisabled();
    await pickThemes(page, ['Forbidden Love', 'Fated Mates']);
    await expect(generate).toBeDisabled();
    await page.getByRole('button', { name: 'Ancient Curse', exact: true }).click();
    await expect(generate).toBeEnabled();
    await expect(page.getByText('(3/3 selected)')).toBeVisible();
    // A fourth theme can't be added
    await expect(page.getByRole('button', { name: 'Pack Rivalry', exact: true })).toBeDisabled();
  });

  test('customize panel opens and accepts input', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Customize Your Story/ }).click();
    await page.getByLabel('Protagonist idea').fill('a lighthouse keeper');
    await expect(page.getByLabel('Protagonist idea')).toHaveValue('a lighthouse keeper');
  });
});

test('full game: three chapters to the final story', async ({ page }) => {
  await startGame(page);
  for (let ch = 1; ch <= 3; ch++) {
    await expect(page.getByRole('heading', { name: new RegExp(`^Chapter ${ch} —`) })).toBeVisible();
    await playChapter(page);
    await expect(page.getByRole('heading', { name: `Chapter ${ch} Complete!` })).toBeVisible();
    await expect(page.getByText('100%')).toBeVisible();
    await page.getByRole('button', { name: ch < 3 ? /Continue to Chapter/ : /Read Final Story/ }).click();
  }
  await expect(page.getByRole('heading', { name: 'Your Story is Complete!' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Chapter 3:/ })).toBeVisible();
  // Finished stories don't offer a stale resume
  await page.reload();
  await expect(page.getByText('You have a saved game')).toHaveCount(0);
});

test('every phrase can be typed on a normal keyboard and story text is not repeated', async ({ page }) => {
  await startGame(page);
  const phrases = new Set<string>();
  const input = typingInput(page);
  while (!(await page.getByRole('heading', { name: 'Chapter 1 Complete!' }).isVisible())) {
    const phrase = await currentPhrase(page);
    expect(phrase, `phrase "${phrase}"`).toMatch(/^[\x20-\x7E]+$/);
    phrases.add(phrase);
    await input.pressSequentially(phrase);
    await expect(page.getByTestId('phrase').or(page.getByRole('heading', { name: /Complete!/ }))).not.toHaveText(phrase);
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
  await startGame(page, { speed: 'Intense' });
  const input = typingInput(page);
  const first = await currentPhrase(page);
  await input.pressSequentially(first);
  await expect(page.getByText('✅ 1 caught')).toBeVisible();
  await input.pressSequentially('nope');
  await input.press('Enter');
  await expect(page.getByText('❌ 1 missed')).toBeVisible();
  await expect(page.getByText('COMBO BREAK!')).toBeVisible();
  // Do nothing: at Intense the wolf escapes in about 9 seconds
  await expect(page.getByText('❌ 2 missed')).toBeVisible({ timeout: 20_000 });
});

test('pause stops the wolf, resume refocuses typing, quit saves and resume restores', async ({ page }) => {
  await startGame(page);
  const input = typingInput(page);
  await input.pressSequentially(await currentPhrase(page));
  await expect(page.getByText('✅ 1 caught')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Paused' })).toBeVisible();
  const wolf = page.getByText('🐺').first();
  const before = (await wolf.boundingBox())!.x;
  await page.waitForTimeout(800);
  expect((await wolf.boundingBox())!.x).toBe(before);

  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(input).toBeFocused();

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Quit to Menu' }).click();
  await expect(page.getByText('Something went wrong')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Fairytales with Spice/ })).toBeVisible();

  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByText('✅ 1 caught')).toBeVisible();
  await expect(input).toBeEnabled();
});

test('switching away from the tab pauses the game', async ({ page }) => {
  await startGame(page);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('heading', { name: 'Paused' })).toBeVisible();
});

test('a server failure shows the error screen and Try Again keeps your picks', async ({ page }) => {
  await page.route('**/api/generate-story', r => r.fulfill({ status: 500, body: '{}' }));
  await page.goto('/');
  await pickThemes(page);
  await page.getByRole('button', { name: /Generate My Story/ }).click();
  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible();
  await page.getByRole('button', { name: 'Try Again' }).click();
  await expect(page.getByText('(3/3 selected)')).toBeVisible();
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
