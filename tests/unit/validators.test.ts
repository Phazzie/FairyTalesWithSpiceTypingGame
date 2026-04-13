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
});

describe('validateGradeReport', () => {
  const validGrade = { overallScore: 7, passed: true, categoryScores: { structure: 7 } };
  it('accepts valid grade', () => {
    expect(() => validateGradeReport(validGrade)).not.toThrow();
  });
  it('rejects missing overallScore', () => {
    expect(() => validateGradeReport({ passed: true, categoryScores: {} })).toThrow();
  });
});

describe('validatePhrases', () => {
  const validPhrases = [
    { text: 'the dark forest', proseSegment: 'She entered the dark forest.', order: 1 },
    { text: 'ancient wolf pack', proseSegment: 'An ancient wolf pack lived here.', order: 2 },
  ];
  it('accepts valid phrases', () => {
    const result = validatePhrases(validPhrases);
    expect(result.length).toBe(2);
  });
  it('filters invalid entries', () => {
    const mixed = [...validPhrases, { text: 'a', proseSegment: '', order: 3 }];
    const result = validatePhrases(mixed);
    expect(result.length).toBe(2);
  });
  it('rejects non-array', () => {
    expect(() => validatePhrases(null)).toThrow();
  });
});
