import { describe, it, expect } from 'vitest';
import { buildChapterRecord, redactProse, recordedPercent, verdictFor } from '../../src/lib/utils/transcript';

const phrases = [
  { text: 'a b', proseSegment: 'First line here.', order: 1 },
  { text: 'c d', proseSegment: 'Second line\nwraps.', order: 2 },
  { text: 'e f', proseSegment: 'First line here.', order: 3 },
];

describe('buildChapterRecord', () => {
  it('keeps a segment as caught when any of its phrases was caught', () => {
    const r = buildChapterRecord(1, phrases, [0], [1, 2]);
    expect(r.caughtSegments).toEqual(['First line here.']);
    expect(r.missedSegments).toEqual(['Second line\nwraps.']);
  });
});

describe('redactProse', () => {
  const prose = 'First line here.\n\nSecond line\nwraps. Third line.';
  it('marks missed segments inaudible, matching across whitespace', () => {
    const parts = redactProse(prose, ['Second line wraps.']);
    expect(parts.map(p => p.inaudible)).toEqual([false, true, false]);
    expect(parts.map(p => p.text).join('')).toBe(prose);
  });
  it('returns the whole prose when nothing was missed', () => {
    expect(redactProse(prose, [])).toEqual([{ text: prose, inaudible: false }]);
  });
  it('ignores segments that are not in the prose', () => {
    expect(redactProse(prose, ['Nowhere to be found.'])).toHaveLength(1);
  });
  it('strikes every occurrence of a repeated missed segment', () => {
    const p = 'She held her breath. He stepped closer. She held her breath.';
    const parts = redactProse(p, ['She held her breath.', 'He stepped closer.']);
    expect(parts.every(x => x.inaudible || x.text.trim() === '')).toBe(true);
    expect(parts.filter(x => x.inaudible)).toHaveLength(3);
    expect(parts.map(x => x.text).join('')).toBe(p);
  });
  it('merges overlapping missed segments instead of dropping the longer one', () => {
    const p = 'She held her breath. Middle. She held her breath. He stepped closer.';
    const parts = redactProse(p, ['She held her breath.', 'She held her breath. He stepped closer.']);
    const struck = parts.filter(x => x.inaudible).map(x => x.text);
    expect(struck).toEqual(['She held her breath.', 'She held her breath. He stepped closer.']);
    expect(parts.map(x => x.text).join('')).toBe(p);
  });
  it('handles regex characters in segments', () => {
    const parts = redactProse('Is it (really) $5? Yes.', ['Is it (really) $5?']);
    expect(parts[0]).toEqual({ text: 'Is it (really) $5?', inaudible: true });
  });
});

describe('recordedPercent', () => {
  it('counts words kept', () => {
    expect(recordedPercent([{ text: 'a b c', inaudible: false }, { text: 'd', inaudible: true }])).toBe(75);
  });
});

describe('verdictFor', () => {
  it('scales with accuracy', () => {
    expect(verdictFor(100).ruling).toBe('CRYSTAL CLEAR');
    expect(verdictFor(60).ruling).toBe('HAZY');
    expect(verdictFor(10).ruling).toBe('FOGGED OVER');
  });
});
