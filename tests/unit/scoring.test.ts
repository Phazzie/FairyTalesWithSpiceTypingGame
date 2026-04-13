import { describe, it, expect } from 'vitest';
import { calculatePoints, matchPhrase, getNextCombo, resetCombo } from '../../src/lib/utils/scoring';

describe('calculatePoints', () => {
  it('returns base points at combo 0 speed 1', () => {
    const pts = calculatePoints({ elapsedMs: 1000, speedConfig: { pixelsPerTick: 1 }, combo: 0 });
    expect(pts).toBe(100);
  });
  it('multiplies by speed', () => {
    const pts = calculatePoints({ elapsedMs: 1000, speedConfig: { pixelsPerTick: 2 }, combo: 0 });
    expect(pts).toBe(200);
  });
  it('applies combo multiplier', () => {
    const pts = calculatePoints({ elapsedMs: 1000, speedConfig: { pixelsPerTick: 1 }, combo: 4 });
    expect(pts).toBe(200); // multiplier at index 4 is 2.0
  });
});

describe('matchPhrase', () => {
  it('matches exact strings', () => {
    expect(matchPhrase('hello world', 'hello world')).toBe(true);
  });
  it('is case insensitive', () => {
    expect(matchPhrase('Hello World', 'hello world')).toBe(true);
  });
  it('trims whitespace', () => {
    expect(matchPhrase('  hello  ', 'hello')).toBe(true);
  });
  it('returns false for mismatch', () => {
    expect(matchPhrase('hello', 'world')).toBe(false);
  });
});

describe('getNextCombo / resetCombo', () => {
  it('increments combo', () => {
    expect(getNextCombo(3)).toBe(4);
  });
  it('resets to 0', () => {
    expect(resetCombo()).toBe(0);
  });
});
