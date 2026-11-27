import { describe, it, expect, vi, beforeEach } from 'vitest';

const callAI = vi.fn();
vi.mock('$lib/server/ai/client', () => ({ callAI: (p: string) => callAI(p), hasAIKey: () => true }));

const { POST } = await import('../../src/routes/api/generate-story/+server');
const { FALLBACK_STORY } = await import('../../src/lib/server/ai/fallback');

const ch = (n: number, title: string) => ({
  number: n, title, prose: `Prose for ${title}.`, cliffhanger: n < 3 ? 'And then?' : null,
});
const story = JSON.stringify({
  chapters: [ch(1, 'One'), ch(2, 'Two'), ch(3, 'Three')],
  metadata: { characterNames: { alpha: 'Rune', protagonist: 'Mara' }, storyArc: 'They fall.' },
});

function call() {
  const request = new Request('http://x/api/generate-story', {
    method: 'POST',
    body: JSON.stringify({ spiceLevel: 3, customization: { selectedThemes: ['a', 'b', 'c'] } }),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (POST as any)({ request }).then((r: Response) => r.json());
}

describe('POST /api/generate-story with a key', () => {
  beforeEach(() => { callAI.mockReset(); vi.spyOn(console, 'error').mockImplementation(() => {}); });

  it('serves the first valid AI story without a grading round', async () => {
    callAI.mockResolvedValueOnce(story);
    const body = await call();
    expect(body.usedFallback).toBe(false);
    expect(body.story.chapters[0].title).toBe('One');
    expect(callAI).toHaveBeenCalledTimes(1);
  });

  it('tries again only when the first reply is unusable', async () => {
    callAI.mockResolvedValueOnce('{"chapters": []}').mockResolvedValueOnce(story);
    const body = await call();
    expect(body.usedFallback).toBe(false);
    expect(body.attempts).toBe(2);
  });

  it('falls back to the built-in story only when every attempt fails', async () => {
    callAI.mockRejectedValue(new Error('timeout'));
    const body = await call();
    expect(body.usedFallback).toBe(true);
    expect(body.story.chapters[0].title).toBe(FALLBACK_STORY.chapters[0].title);
  });
});
