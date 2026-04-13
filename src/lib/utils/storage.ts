import type { SaveState } from '../types/domain';
import { SAVE_KEY, SAVE_MAX_AGE_MS } from '../config';

export function saveGame(state: SaveState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
  } catch {
    // Ignore storage errors
  }
}

export function loadGame(): SaveState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveState;
    if (!parsed.savedAt || Date.now() - parsed.savedAt > SAVE_MAX_AGE_MS) {
      clearGame();
      return null;
    }
    if (!parsed.story || !parsed.phase) {
      clearGame();
      return null;
    }
    return parsed;
  } catch {
    clearGame();
    return null;
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore storage errors
  }
}
