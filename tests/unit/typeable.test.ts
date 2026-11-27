import { describe, it, expect } from 'vitest';
import { toTypeable } from '../../src/lib/utils/typeable';
import { matchPhrase } from '../../src/lib/utils/scoring';
import { extractPhrasesFallback } from '../../src/lib/server/game/phraseFallback';
import { validatePhrases } from '../../src/lib/server/ai/validators';
import { FALLBACK_STORY } from '../../src/lib/server/ai/fallback';

describe('toTypeable', () => {
  it('turns em dashes into spaces', () => {
    expect(toTypeable('the unexplained—the strange')).toBe('the unexplained the strange');
  });
  it('straightens curly quotes and drops edge punctuation', () => {
    expect(toTypeable('“Caden’s rival.”')).toBe("Caden's rival");
  });
  it('strips accents', () => {
    expect(toTypeable('café au lait')).toBe('cafe au lait');
  });
});

describe('matchPhrase', () => {
  it('ignores repeated spaces', () => {
    expect(matchPhrase('the  dark   forest', 'the dark forest')).toBe(true);
  });
});

describe('fallback phrases on the built-in story', () => {
  for (const chapter of FALLBACK_STORY.chapters) {
    const phrases = extractPhrasesFallback(chapter.prose);
    it(`chapter ${chapter.number}: 12-20 plain-ASCII phrases`, () => {
      expect(phrases.length).toBeGreaterThanOrEqual(12);
      expect(phrases.length).toBeLessThanOrEqual(20);
      for (const p of phrases) expect(p.text).toMatch(/^[A-Za-z0-9][\x20-\x7E]*[A-Za-z0-9]$/);
    });
    it(`chapter ${chapter.number}: segments cover the whole chapter once, in order`, () => {
      const joined = phrases.map(p => p.proseSegment).join(' ');
      expect(joined).toBe(chapter.prose.replace(/\s+/g, ' ').trim());
    });
  }
});

describe('validatePhrases', () => {
  it('makes AI phrases typeable and sorts them by order', () => {
    const items = Array.from({ length: 12 }, (_, i) => ({
      text: i === 0 ? 'wild—and magnetic' : `phrase number ${i}`,
      proseSegment: `Sentence ${i}.`,
      order: 12 - i,
    }));
    const result = validatePhrases(items);
    expect(result[0].order).toBe(1);
    expect(result.find(p => p.proseSegment === 'Sentence 0.')!.text).toBe('wild and magnetic');
  });
});
