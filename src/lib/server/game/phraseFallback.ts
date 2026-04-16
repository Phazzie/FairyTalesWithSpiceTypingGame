import type { Phrase } from '../../types/domain';

export function extractPhrasesFallback(prose: string): Phrase[] {
  // Split into sentences
  const sentences = prose
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 20);

  const phrases: Phrase[] = [];
  let order = 1;

  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    if (words.length < 2) continue;

    // Extract 2-4 word chunks from the sentence
    for (let i = 0; i < words.length - 1 && phrases.length < 20; i += 2) {
      const chunkSize = Math.min(2 + (i % 3), 4, words.length - i);
      const text = words.slice(i, i + chunkSize).join(' ');
      
      // Clean punctuation from phrase text
      const cleaned = text.replace(/[,;:!?"'()\[\]]/g, '').trim();
      if (!cleaned || cleaned.split(/\s+/).length < 2) continue;
      
      phrases.push({
        text: cleaned,
        proseSegment: sentence.trim(),
        order: order++,
      });

      if (phrases.length >= 20) break;
    }

    if (phrases.length >= 20) break;
  }

  // Ensure minimum 12 phrases - repeat if needed
  if (phrases.length < 12 && phrases.length > 0) {
    const original = [...phrases];
    let idx = 0;
    while (phrases.length < 12) {
      const p = original[idx % original.length];
      phrases.push({ ...p, order: order++ });
      idx++;
    }
  }

  return phrases.slice(0, 20);
}
