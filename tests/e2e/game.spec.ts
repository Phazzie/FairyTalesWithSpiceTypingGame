import { test, expect } from '@playwright/test';
import { pickThemes, startGame, typingInput, currentPhrase, playChapter } from './helpers';

test.describe('start screen', () => {
  test('needs exactly three themes before generating', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Fairytales with Spice');
    const generate = page.getByRole('button', { name: /Turn on the water/ });
    await expect(generate).toBeDisabled();
    await pickThemes(page, ['Forbidden Love', 'Fated Mates']);
    await expect(generate).toBeDisabled();
    await page.getByRole('button', { name: 'Ancient Curse', exact: true }).click();
    await expect(generate).toBeEnabled();
    await expect(page.getByText('3 of 3 written on the glass')).toBeVisible();
    // A fourth can't be added
    await expect(page.getByRole('button', { name: 'Pack Rivalry', exact: true })).toBeDisabled();
  });

  test('story details are on the page, not hidden, and are sent to the story writer', async ({ page }) => {
    let sent: any = null;
    await page.route('**/api/generate-story', async r => { sent = r.request().postDataJSON(); await r.fulfill({ status: 500, body: '{}' }); });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Tell the mirror what you want' })).toBeVisible();
    await page.getByLabel('Her', { exact: true }).fill('a lighthouse keeper');
    await page.getByLabel('Him', { exact: true }).fill('a wolf who hates the sea');
    await page.getByLabel('Where').fill('a storm-cut island');
    await page.getByLabel('What starts it').fill('the lamp goes out');
    await pickThemes(page);
    await page.getByRole('button', { name: /Turn on the water/ }).click();
    await expect(page.getByText('The hot water ran out.')).toBeVisible();
    expect(sent.customization).toMatchObject({
      selectedThemes: ['Forbidden Love', 'Fated Mates', 'Ancient Curse'],
      characterIdea: 'a lighthouse keeper', loveInterestIdea: 'a wolf who hates the sea',
      setting: 'a storm-cut island', plotHook: 'the lamp goes out',
    });
  });
});

test('full game: three chapters to the final story', async ({ page }) => {
  await startGame(page);
  const nights = ['One', 'Two', 'Three'];
  const ordinals = ['first', 'second', 'third'];
  for (let ch = 1; ch <= 3; ch++) {
    await expect(page.getByText(`Night ${nights[ch - 1]} of three`)).toBeVisible();
    await playChapter(page);
    await expect(page.getByRole('heading', { name: `End of the ${ordinals[ch - 1]} night` })).toBeVisible();
    await expect(page.getByText('100%')).toBeVisible();
    await expect(page.locator('.fogged')).toHaveCount(0);
    await page.getByRole('button', { name: ch < 3 ? /Run it hotter/ : /See the whole mirror/ }).click();
  }
  await expect(page.getByRole('heading', { name: 'Your Story is Complete!' })).toBeAttached();
  await expect(page.getByText('CRYSTAL CLEAR', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Chapter 3:/ })).toBeVisible();
  // Finished stories don't offer a stale resume
  await page.reload();
  await expect(page.getByTestId('resume')).toHaveCount(0);
});

test('every phrase can be typed on a normal keyboard and story text is not repeated', async ({ page }) => {
  await startGame(page);
  const phrases = new Set<string>();
  const input = typingInput(page);
  while (!(await page.getByRole('heading', { name: 'End of the first night' }).isVisible())) {
    const phrase = await currentPhrase(page);
    expect(phrase, `phrase "${phrase}"`).toMatch(/^[\x20-\x7E]+$/);
    phrases.add(phrase);
    await input.pressSequentially(phrase);
    await expect(page.getByTestId('phrase').or(page.getByRole('heading', { name: /night$/ }))).not.toHaveText(phrase);
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
  await startGame(page, { speed: 'Shower running' });
  const input = typingInput(page);
  const first = await currentPhrase(page);
  await input.pressSequentially(first);
  await expect(page.getByText('✅ 1 caught')).toBeVisible();
  await input.pressSequentially('nope');
  await input.press('Enter');
  await expect(page.getByText('❌ 1 missed')).toBeVisible();
  await expect(page.getByText('the steam took it')).toBeVisible();
  await expect(page.getByTestId('story-panel').getByText('[fogged over]')).toBeVisible();
  // Do nothing: at top speed the wolf escapes in about 9 seconds
  await expect(page.getByText('❌ 2 missed')).toBeVisible({ timeout: 20_000 });
});

test('pause stops the wolf, resume refocuses typing, quit saves and resume restores', async ({ page }) => {
  await startGame(page);
  const input = typingInput(page);
  await input.pressSequentially(await currentPhrase(page));
  await expect(page.getByText('✅ 1 caught')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: "The water's off." })).toBeVisible();
  const wolf = page.getByText('🐺').first();
  const before = (await wolf.boundingBox())!.x;
  await page.waitForTimeout(800);
  expect((await wolf.boundingBox())!.x).toBe(before);

  await page.getByRole('button', { name: "Turn it back on" }).click();
  await expect(input).toBeFocused();

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Leave it for later/ }).click();
  await expect(page.getByText('The hot water ran out.')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Steam', exact: true })).toBeVisible();

  await page.getByRole('button', { name: "Pick up where you left off" }).click();
  await expect(page.getByText('✅ 1 caught')).toBeVisible();
  await expect(input).toBeEnabled();
});

test('switching away from the tab pauses the game', async ({ page }) => {
  await startGame(page);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('heading', { name: "The water's off." })).toBeVisible();
});

test('a server failure runs out the hot water and trying again keeps your picks', async ({ page }) => {
  await page.route('**/api/generate-story', r => r.fulfill({ status: 500, body: '{}' }));
  await page.goto('/');
  await pickThemes(page);
  await page.getByRole('button', { name: /Turn on the water/ }).click();
  await expect(page.getByText('The hot water ran out.')).toBeVisible();
  await page.getByRole('button', { name: 'Try the water again' }).click();
  await expect(page.getByText('3 of 3 written on the glass')).toBeVisible();
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

test('missed lines fog over in the story', async ({ page }) => {
  await startGame(page);
  const input = typingInput(page);
  await input.press('Enter'); // miss the first line on purpose
  await expect(page.getByText('❌ 1 missed')).toBeVisible();
  await playChapter(page);
  await expect(page.getByRole('heading', { name: 'End of the first night' })).toBeVisible();
  await expect(page.getByText(/^\[fogged over: \d+ words\]$/)).toHaveCount(1);
});
