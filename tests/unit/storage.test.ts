import { describe, it, expect, beforeEach } from 'vitest';
import { saveGame, loadGame, clearGame } from '../../src/lib/utils/storage';
import type { SaveState } from '../../src/lib/types/domain';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

const baseSave: SaveState = {
  phase: 'GAMEPLAY',
  story: {
    chapters: [
      { number: 1, title: 'T1', prose: 'P1', cliffhanger: 'C1' },
      { number: 2, title: 'T2', prose: 'P2', cliffhanger: 'C2' },
      { number: 3, title: 'T3', prose: 'P3', cliffhanger: null },
    ],
    metadata: { characterNames: { alpha: 'A', protagonist: 'P' }, storyArc: 'arc' },
  },
  currentChapter: 1,
  phrases: [],
  currentPhraseIndex: 0,
  revealedSegments: [],
  caughtIndices: [],
  missedIndices: [],
  score: 0,
  combo: 0,
  bestCombo: 0,
  chapterStats: [],
  settings: { spiceLevel: 3, speedSetting: 'normal', selectedThemes: ['a', 'b', 'c'] },
  savedAt: Date.now(),
};

describe('saveGame / loadGame / clearGame', () => {
  beforeEach(() => localStorageMock.clear());

  it('saves and loads a game', () => {
    saveGame(baseSave);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded?.phase).toBe('GAMEPLAY');
  });

  it('returns null when no save exists', () => {
    expect(loadGame()).toBeNull();
  });

  it('clears the save', () => {
    saveGame(baseSave);
    clearGame();
    expect(loadGame()).toBeNull();
  });

  it('rejects expired saves', () => {
    const expired = { ...baseSave, savedAt: Date.now() - (25 * 60 * 60 * 1000) };
    localStorage.setItem('fairytales_save', JSON.stringify(expired));
    expect(loadGame()).toBeNull();
  });

  it('handles corrupt data gracefully', () => {
    localStorage.setItem('fairytales_save', 'not-json{{{');
    expect(loadGame()).toBeNull();
  });
});
