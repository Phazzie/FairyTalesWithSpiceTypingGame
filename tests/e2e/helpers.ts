import { expect, type Page } from '@playwright/test';

export const THEMES = ['Forbidden Love', 'Fated Mates', 'Ancient Curse'];

export async function pickThemes(page: Page, themes = THEMES) {
  for (const t of themes) await page.getByRole('button', { name: t, exact: true }).click();
}

export async function startGame(page: Page, opts: { speed?: string } = {}) {
  await page.goto('/');
  if (opts.speed) await page.getByRole('button', { name: opts.speed, exact: true }).click();
  await pickThemes(page);
  await page.getByRole('button', { name: /Generate My Story/ }).click();
  await expect(typingInput(page)).toBeEnabled();
}

export function typingInput(page: Page) {
  return page.getByPlaceholder(/Type the phrase|Paused/);
}

export async function currentPhrase(page: Page) {
  return (await page.getByTestId('phrase').innerText()).replace(/\n/g, '');
}

/** Types every phrase of the current chapter until the chapter-complete screen shows. */
export async function playChapter(page: Page) {
  const input = typingInput(page);
  for (let i = 0; i < 40; i++) {
    if (await page.getByRole('heading', { name: /Chapter \d Complete!/ }).isVisible()) return i;
    const phrase = await currentPhrase(page);
    await input.pressSequentially(phrase);
    await expect(page.getByTestId('phrase').or(page.getByRole('heading', { name: /Complete!/ }))).not.toHaveText(phrase);
  }
  throw new Error('Chapter never finished');
}
