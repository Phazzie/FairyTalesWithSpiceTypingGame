import { env } from '$env/dynamic/private';

const GROK_URL = 'https://api.x.ai/v1/chat/completions';
const DEFAULT_MODEL = 'grok-3-mini';
// A full 3-chapter story takes grok-3-mini 30-45s; 30s cut real stories off mid-reply.
const TIMEOUT_MS = 75000;

/** The xAI key. Vercel's xAI integration names it XAI_API_KEY; GROK_API_KEY is the older name. */
function apiKey(): string | undefined {
  return env.XAI_API_KEY || env.GROK_API_KEY || undefined;
}

/** The xAI key. Vercel's xAI integration names it XAI_API_KEY; GROK_API_KEY is the older name. */
function apiKey(): string | undefined {
  return env.XAI_API_KEY || env.GROK_API_KEY || undefined;
}

/** True when an xAI key is configured. Without one, routes go straight to their fallback. */
export function hasAIKey(): boolean {
  return !!apiKey();
}

export async function callAI(prompt: string): Promise<string> {
  const key = apiKey();
  if (!key) throw new Error('XAI_API_KEY not set');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GROK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: env.XAI_MODEL || DEFAULT_MODEL,
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
