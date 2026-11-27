import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { callAI, hasAIKey } from '$lib/server/ai/client';
import { buildStoryPrompt } from '$lib/server/ai/prompts';
import { parseJson } from '$lib/server/ai/parser';
import { validateStory } from '$lib/server/ai/validators';
import { FALLBACK_STORY, FALLBACK_GRADE } from '$lib/server/ai/fallback';
import { MAX_GEN_ATTEMPTS } from '$lib/config';
import type { GenerateStoryRequest } from '$lib/types/api';
import type { Story } from '$lib/types/domain';

// A story call can take over a minute when xAI is slow.
export const config = { maxDuration: 300 };

export const POST: RequestHandler = async ({ request }) => {
  let body: GenerateStoryRequest;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { spiceLevel, customization } = body;

  if (!spiceLevel || spiceLevel < 1 || spiceLevel > 5) {
    return json({ error: 'spiceLevel must be 1-5' }, { status: 400 });
  }
  if (!Array.isArray(customization?.selectedThemes) || customization.selectedThemes.length !== 3) {
    return json({ error: 'selectedThemes must have exactly 3 items' }, { status: 400 });
  }

  // No key configured: skip the doomed calls and serve the built-in story.
  const attempts = hasAIKey() ? MAX_GEN_ATTEMPTS : 0;

  // One story call takes grok-3-mini ~40s. The old grade-and-rewrite loop doubled
  // or tripled that (96s live) to polish a score the player never sees, so a
  // second attempt is only made when the first reply is unusable.
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const raw = await callAI(buildStoryPrompt(spiceLevel, customization.selectedThemes, customization));
      const story: Story = validateStory(parseJson<unknown>(raw));
      return json({ story, usedFallback: false, attempts: attempt });
    } catch (err) {
      console.error(`Story generation attempt ${attempt} failed:`, err);
    }
  }

  // Every attempt failed outright - use the built-in story
  return json({
    story: FALLBACK_STORY,
    gradeReport: FALLBACK_GRADE,
    usedFallback: true,
    attempts,
  });
};
