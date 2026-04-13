import { GROK_API_KEY } from '$env/static/private';

const GROK_URL = 'https://api.x.ai/v1/chat/completions';
const MODEL = 'grok-3-mini';
const TIMEOUT_MS = 30000;

export async function callAI(prompt: string): Promise<string> {
  if (!GROK_API_KEY) throw new Error('GROK_API_KEY not set');
  
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const res = await fetch(GROK_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${GROK_API_KEY}` 
      },
      body: JSON.stringify({ 
        model: MODEL, 
        messages: [{ role: 'user', content: prompt }], 
        temperature: 0.8 
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
