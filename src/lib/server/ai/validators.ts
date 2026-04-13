import type { Story, GradeReport, Phrase } from '../../types/domain';

export function validateStory(data: unknown): Story {
  if (!data || typeof data !== 'object') throw new Error('Story must be an object');
  const d = data as Record<string, unknown>;
  
  if (!Array.isArray(d.chapters) || d.chapters.length !== 3) {
    throw new Error('Story must have exactly 3 chapters');
  }
  
  for (const ch of d.chapters) {
    if (!ch || typeof ch !== 'object') throw new Error('Chapter must be an object');
    const c = ch as Record<string, unknown>;
    if (typeof c.number !== 'number') throw new Error('Chapter number must be a number');
    if (typeof c.title !== 'string' || !c.title.trim()) throw new Error('Chapter title must be non-empty string');
    if (typeof c.prose !== 'string' || !c.prose.trim()) throw new Error('Chapter prose must be non-empty string');
    if (c.cliffhanger !== null && typeof c.cliffhanger !== 'string') throw new Error('Chapter cliffhanger must be string or null');
  }
  
  if (!d.metadata || typeof d.metadata !== 'object') throw new Error('Story must have metadata');
  const meta = d.metadata as Record<string, unknown>;
  if (!meta.characterNames || typeof meta.characterNames !== 'object') throw new Error('Metadata must have characterNames');
  const names = meta.characterNames as Record<string, unknown>;
  if (typeof names.alpha !== 'string' || !names.alpha.trim()) throw new Error('characterNames.alpha must be non-empty');
  if (typeof names.protagonist !== 'string' || !names.protagonist.trim()) throw new Error('characterNames.protagonist must be non-empty');
  if (typeof meta.storyArc !== 'string' || !meta.storyArc.trim()) throw new Error('metadata.storyArc must be non-empty');
  
  return data as Story;
}

export function validateGradeReport(data: unknown): GradeReport {
  if (!data || typeof data !== 'object') throw new Error('GradeReport must be an object');
  const d = data as Record<string, unknown>;
  
  if (typeof d.overallScore !== 'number') throw new Error('overallScore must be a number');
  if (typeof d.passed !== 'boolean') throw new Error('passed must be a boolean');
  if (!d.categoryScores || typeof d.categoryScores !== 'object') throw new Error('categoryScores must be an object');
  
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
  
  if (valid.length < 2) throw new Error('Not enough valid phrases');
  return valid;
}
