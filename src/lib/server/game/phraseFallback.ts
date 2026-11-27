import type { Phrase } from '../../types/domain';
import { toTypeable } from '../../utils/typeable';

const MIN_PHRASES = 12;
const MAX_PHRASES = 20;

function splitSentences(prose: string): string[] {
  return prose
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?]["'”’]?)\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

/** Picks a 2-4 word typeable chunk from a sentence, preferring its middle. */
function pickChunk(sentence: string, offset = 0): string | null {
  const words = toTypeable(sentence).split(' ').filter(Boolean);
  if (words.length < 2) return null;
  const size = Math.min(words.length, 3 + (offset % 2));
  const maxStart = words.length - size;
  const start = Math.min(maxStart, Math.max(0, Math.floor(maxStart / 2) + offset));
  const chunk = toTypeable(words.slice(start, start + size).join(' '));
  return chunk.split(' ').length >= 2 ? chunk : null;
}

/**
 * Builds 12-20 phrases without AI. The chapter is split into evenly sized
 * groups of sentences, one phrase per group, so catching every phrase
 * reveals the whole chapter in order with no repeated text.
 */
export function extractPhrasesFallback(prose: string): Phrase[] {
  const sentences = splitSentences(prose);
  if (sentences.length === 0) return [];

  const phrases: Phrase[] = [];

  if (sentences.length >= MIN_PHRASES) {
    const groups = Math.min(MAX_PHRASES, sentences.length);
    for (let g = 0; g < groups; g++) {
      const from = Math.floor((g * sentences.length) / groups);
      const to = Math.floor(((g + 1) * sentences.length) / groups);
      const group = sentences.slice(from, to);
      const longest = group.reduce((a, b) => (b.length > a.length ? b : a), '');
      const text = pickChunk(longest) ?? group.map(s => pickChunk(s)).find(Boolean);
      const segment = group.join(' ');
      if (text) {
        phrases.push({ text, proseSegment: segment, order: phrases.length + 1 });
      } else if (phrases.length > 0) {
        // Nothing typeable here: attach the text to the previous phrase so it still gets revealed.
        phrases[phrases.length - 1].proseSegment += ' ' + segment;
      }
    }
  }

  if (phrases.length < MIN_PHRASES) {
    // Short prose: take several chunks per sentence. Only the first chunk of
    // each sentence carries the sentence; later ones reveal it again, which
    // the gameplay screen de-duplicates.
    phrases.length = 0;
    let offset = 0;
    while (phrases.length < MIN_PHRASES && offset < 6) {
      for (const sentence of sentences) {
        const text = pickChunk(sentence, offset);
        if (text && !phrases.some(p => p.text === text && p.proseSegment === sentence)) {
          phrases.push({ text, proseSegment: sentence, order: phrases.length + 1 });
        }
        if (phrases.length >= MIN_PHRASES) break;
      }
      offset++;
    }
    // Still short (very tiny prose): repeat what we have.
    const original = [...phrases];
    for (let i = 0; phrases.length < MIN_PHRASES && original.length > 0; i++) {
      phrases.push({ ...original[i % original.length], order: phrases.length + 1 });
    }
  }

  return phrases.slice(0, MAX_PHRASES);
}
