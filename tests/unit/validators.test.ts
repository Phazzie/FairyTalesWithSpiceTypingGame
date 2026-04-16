import { describe, it, expect } from 'vitest';
import { validateStory, validateGradeReport, validatePhrases } from '../../src/lib/server/ai/validators';

const validStory = {
  chapters: [
    { number: 1, title: 'Ch1', prose: 'Prose one', cliffhanger: 'Cliff!' },
    { number: 2, title: 'Ch2', prose: 'Prose two', cliffhanger: 'Cliff 2!' },
    { number: 3, title: 'Ch3', prose: 'Prose three', cliffhanger: null },
  ],
  metadata: {
    characterNames: { alpha: 'Caden', protagonist: 'Elara' },
    storyArc: 'A story arc',
  },
};

// 12 valid phrases to meet the new minimum threshold
const makePhrase = (n: number) => ({
  text: `the phrase ${n}`,
  proseSegment: `Segment ${n} from the prose.`,
  order: n,
});
const validPhrases = Array.from({ length: 12 }, (_, i) => makePhrase(i + 1));

describe('validateStory', () => {
  it('accepts valid story', () => {
    expect(() => validateStory(validStory)).not.toThrow();
  });
  it('rejects non-object', () => {
    expect(() => validateStory(null)).toThrow();
  });
  it('rejects wrong chapter count', () => {
    expect(() => validateStory({ ...validStory, chapters: validStory.chapters.slice(0, 2) })).toThrow();
  });
  it('rejects missing prose', () => {
    const bad = JSON.parse(JSON.stringify(validStory));
    bad.chapters[0].prose = '';
    expect(() => validateStory(bad)).toThrow();
  });
  it('rejects wrong chapter numbers', () => {
    const bad = JSON.parse(JSON.stringify(validStory));
    bad.chapters[0].number = 2;
    expect(() => validateStory(bad)).toThrow();
  });
  it('rejects missing cliffhanger on chapter 1', () => {
    const bad = JSON.parse(JSON.stringify(validStory));
    bad.chapters[0].cliffhanger = null;
    expect(() => validateStory(bad)).toThrow();
  });
  it('rejects missing cliffhanger on chapter 2', () => {
    const bad = JSON.parse(JSON.stringify(validStory));
    bad.chapters[1].cliffhanger = '';
    expect(() => validateStory(bad)).toThrow();
  });
  it('rejects non-null cliffhanger on chapter 3', () => {
    const bad = JSON.parse(JSON.stringify(validStory));
    bad.chapters[2].cliffhanger = 'should not exist';
    expect(() => validateStory(bad)).toThrow();
  });
});

describe('validateGradeReport', () => {
  const validGrade = { overallScore: 7, passed: true, categoryScores: { structure: 7, coherence: 8 } };
  it('accepts valid grade', () => {
    expect(() => validateGradeReport(validGrade)).not.toThrow();
  });
  it('rejects missing overallScore', () => {
    expect(() => validateGradeReport({ passed: true, categoryScores: {} })).toThrow();
  });
  it('rejects overallScore out of range', () => {
    expect(() => validateGradeReport({ ...validGrade, overallScore: 11 })).toThrow();
    expect(() => validateGradeReport({ ...validGrade, overallScore: -1 })).toThrow();
  });
  it('rejects non-finite overallScore', () => {
    expect(() => validateGradeReport({ ...validGrade, overallScore: Infinity })).toThrow();
  });
  it('rejects non-number categoryScore values', () => {
    expect(() => validateGradeReport({ ...validGrade, categoryScores: { structure: 'good' } })).toThrow();
  });
});

describe('validatePhrases', () => {
  it('accepts 12 valid phrases', () => {
    const result = validatePhrases(validPhrases);
    expect(result.length).toBe(12);
  });
  it('filters invalid entries and keeps 12 valid ones', () => {
    const mixed = [...validPhrases, { text: 'a', proseSegment: '', order: 99 }];
    const result = validatePhrases(mixed);
    expect(result.length).toBe(12);
  });
  it('throws when fewer than 12 valid phrases', () => {
    const tooFew = validPhrases.slice(0, 5);
    expect(() => validatePhrases(tooFew)).toThrow(/at least 12/);
  });
  it('rejects non-array', () => {
    expect(() => validatePhrases(null)).toThrow();
  });
});
