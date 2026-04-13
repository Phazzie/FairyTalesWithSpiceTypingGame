import { describe, it, expect } from 'vitest';
import { extractPhrasesFallback } from '../../src/lib/server/game/phraseFallback';

const sampleProse = `The forest at midnight held secrets. Elara stepped carefully over roots.
The man who stood there was tall and broad shouldered. His eyes were storm gray and ancient.
She had never seen anything like him before. The wolves howled in the distance.
Something ancient stirred in the darkness. She could not look away from his gaze.
The moon rose high above the trees. A cold wind swept through the clearing.
He spoke in a voice like distant thunder. She felt her heart race with fear and wonder.`;

describe('extractPhrasesFallback', () => {
  it('returns at least 12 phrases', () => {
    const result = extractPhrasesFallback(sampleProse);
    expect(result.length).toBeGreaterThanOrEqual(12);
  });
  it('returns at most 20 phrases', () => {
    const result = extractPhrasesFallback(sampleProse);
    expect(result.length).toBeLessThanOrEqual(20);
  });
  it('returns no empty text', () => {
    const result = extractPhrasesFallback(sampleProse);
    for (const p of result) {
      expect(p.text.trim().length).toBeGreaterThan(0);
    }
  });
  it('all phrases have proseSegment', () => {
    const result = extractPhrasesFallback(sampleProse);
    for (const p of result) {
      expect(typeof p.proseSegment).toBe('string');
      expect(p.proseSegment.length).toBeGreaterThan(0);
    }
  });
  it('handles short prose without error', () => {
    const short = 'The wolf ran fast. She watched him go.';
    expect(() => extractPhrasesFallback(short)).not.toThrow();
  });
});
