import type { Story, GradeReport, Phrase } from '../../types/domain';

export function validateStory(data: unknown): Story {
  if (!data || typeof data !== 'object') throw new Error('Story must be an object');
  const d = data as Record<string, unknown>;

  if (!Array.isArray(d.chapters) || d.chapters.length !== 3) {
    throw new Error('Story must have exactly 3 chapters');
  }

  const expectedNumbers = [1, 2, 3];
  for (let i = 0; i < d.chapters.length; i++) {
    const ch = d.chapters[i];
    if (!ch || typeof ch !== 'object') throw new Error('Chapter must be an object');
    const c = ch as Record<string, unknown>;

    if (c.number !== expectedNumbers[i]) {
      throw new Error(`Chapter at index ${i} must have number ${expectedNumbers[i]}, got ${c.number}`);
    }
    if (typeof c.title !== 'string' || !c.title.trim()) throw new Error('Chapter title must be non-empty string');
    if (typeof c.prose !== 'string' || !c.prose.trim()) throw new Error('Chapter prose must be non-empty string');

    if (i < 2) {
      // Chapters 1 and 2 must have a non-empty cliffhanger
      if (typeof c.cliffhanger !== 'string' || !c.cliffhanger.trim()) {
        throw new Error(`Chapter ${expectedNumbers[i]} must have a non-empty cliffhanger`);
      }
    } else {
      // Chapter 3 cliffhanger must be null (or omitted/undefined, normalized to null)
      if (c.cliffhanger !== null && c.cliffhanger !== undefined) {
        throw new Error('Chapter 3 cliffhanger must be null');
      }
    }
  }

  if (!d.metadata || typeof d.metadata !== 'object') throw new Error('Story must have metadata');
  const meta = d.metadata as Record<string, unknown>;
  if (!meta.characterNames || typeof meta.characterNames !== 'object') throw new Error('Metadata must have characterNames');
  const names = meta.characterNames as Record<string, unknown>;
  if (typeof names.alpha !== 'string' || !names.alpha.trim()) throw new Error('characterNames.alpha must be non-empty');
  if (typeof names.protagonist !== 'string' || !names.protagonist.trim()) throw new Error('characterNames.protagonist must be non-empty');
  if (typeof meta.storyArc !== 'string' || !meta.storyArc.trim()) throw new Error('metadata.storyArc must be non-empty');

  // Normalize ch3 cliffhanger to null if undefined
  (d.chapters[2] as Record<string, unknown>).cliffhanger = null;

  return data as Story;
}

export function validateGradeReport(data: unknown): GradeReport {
  if (!data || typeof data !== 'object') throw new Error('GradeReport must be an object');
  const d = data as Record<string, unknown>;

  if (typeof d.overallScore !== 'number' || !isFinite(d.overallScore)) {
    throw new Error('overallScore must be a finite number');
  }
  if (d.overallScore < 0 || d.overallScore > 10) {
    throw new Error('overallScore must be between 0 and 10');
  }
  if (typeof d.passed !== 'boolean') throw new Error('passed must be a boolean');
  if (!d.categoryScores || typeof d.categoryScores !== 'object' || Array.isArray(d.categoryScores)) {
    throw new Error('categoryScores must be an object');
  }
  const scores = d.categoryScores as Record<string, unknown>;
  for (const [key, val] of Object.entries(scores)) {
    if (typeof val !== 'number' || !isFinite(val)) {
      throw new Error(`categoryScores.${key} must be a finite number`);
    }
  }

  return data as GradeReport;
}

export function validatePhrases(data: unknown): Phrase[] {
  if (!Array.isArray(data)) throw new Error('Phrases must be an array');

  const valid: Phrase[] = [];
  for (const item of data) {
    if (!item || typeof item !== 'object') continue;
    const p = item as Record<string, unknown>;
    if (typeof p.text !== 'string' || !p.text.trim()) continue;
    if (typeof p.proseSegment !== 'string' || !p.proseSegment.trim()) continue;
    if (typeof p.order !== 'number') continue;

    // Validate 2-8 words
    const wordCount = p.text.trim().split(/\s+/).length;
    if (wordCount < 2 || wordCount > 8) continue;

    valid.push(item as Phrase);
  }

  if (valid.length < 12) throw new Error(`Not enough valid phrases: got ${valid.length}, need at least 12`);
  return valid;
}
