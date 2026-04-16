import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { callAI } from '$lib/server/ai/client';
import { buildPhrasePrompt } from '$lib/server/ai/prompts';
import { parseJson } from '$lib/server/ai/parser';
import { validatePhrases } from '$lib/server/ai/validators';
import { extractPhrasesFallback } from '$lib/server/game/phraseFallback';
import type { ExtractPhrasesRequest } from '$lib/types/api';

export const POST: RequestHandler = async ({ request }) => {
  let body: ExtractPhrasesRequest;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { chapterProse } = body;
  if (!chapterProse || typeof chapterProse !== 'string') {
    return json({ error: 'chapterProse is required' }, { status: 400 });
  }

  try {
    const raw = await callAI(buildPhrasePrompt(chapterProse));
    const data = parseJson<unknown>(raw);
    const phrases = validatePhrases(data);
    return json({ phrases, usedFallback: false });
  } catch (err) {
    console.error('Phrase extraction failed, using fallback:', err);
    const phrases = extractPhrasesFallback(chapterProse);
    return json({ phrases, usedFallback: true });
  }
};
