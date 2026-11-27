import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { callAI, hasAIKey } from '$lib/server/ai/client';
import { buildStoryPrompt, buildGradePrompt, buildRetryPrompt } from '$lib/server/ai/prompts';
import { parseJson } from '$lib/server/ai/parser';
import { validateStory, validateGradeReport } from '$lib/server/ai/validators';
import { FALLBACK_STORY, FALLBACK_GRADE } from '$lib/server/ai/fallback';
import { MAX_GEN_ATTEMPTS } from '$lib/config';
import type { GenerateStoryRequest } from '$lib/types/api';
import type { Story, GradeReport } from '$lib/types/domain';

// A story plus its grading can take over a minute per attempt.
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

  let lastStory: Story | null = null;
  let lastGrade: GradeReport | null = null;

  // No key configured: skip the doomed retries and serve the built-in story.
  const attempts = hasAIKey() ? MAX_GEN_ATTEMPTS : 0;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      let prompt: string;
      if (attempt === 1 || !lastStory || !lastGrade) {
        prompt = buildStoryPrompt(spiceLevel, customization.selectedThemes, customization);
      } else {
        prompt = buildRetryPrompt(lastStory, lastGrade);
      }

      const storyRaw = await callAI(prompt);
      const storyData = parseJson<unknown>(storyRaw);
      const validatedStory = validateStory(storyData);
      lastStory = validatedStory;

      const gradeRaw = await callAI(buildGradePrompt(validatedStory));
      const gradeData = parseJson<unknown>(gradeRaw);
      const validatedGrade = validateGradeReport(gradeData);
      lastGrade = validatedGrade;

      if (validatedGrade.passed) {
        return json({
          story: validatedStory,
          gradeReport: validatedGrade,
          usedFallback: false,
          attempts: attempt,
        });
      }
    } catch (err) {
      console.error(`Story generation attempt ${attempt} failed:`, err);
    }
  }

  // No attempt passed the grader, but a real story that validated still beats
  // serving every player the same built-in one.
  if (lastStory) {
    return json({ story: lastStory, gradeReport: lastGrade ?? FALLBACK_GRADE, usedFallback: false, attempts });
  }

  // Every attempt failed outright - use the built-in story
  return json({
    story: FALLBACK_STORY,
    gradeReport: FALLBACK_GRADE,
    usedFallback: true,
    attempts,
  });
};
