import { env } from '$env/dynamic/private';

const GROK_URL = 'https://api.x.ai/v1/chat/completions';
const MODEL = 'grok-3-mini';
const TIMEOUT_MS = 30000;

export async function callAI(prompt: string): Promise<string> {
  const apiKey = env.GROK_API_KEY;
  if (!apiKey) throw new Error('GROK_API_KEY not set');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GROK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`AI provider error: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  } finally {
    clearTimeout(timer);
  }
}
