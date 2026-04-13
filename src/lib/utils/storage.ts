import type { AppPhase, SaveState } from '../types/domain';
import { SAVE_KEY, SAVE_MAX_AGE_MS } from '../config';

const VALID_PHASES: AppPhase[] = [
  'START', 'GENERATING', 'GRADING', 'EXTRACTING',
  'GAMEPLAY', 'CHAPTER_COMPLETE', 'STORY_COMPLETE', 'ERROR',
];

function isValidSaveState(parsed: unknown): parsed is SaveState {
  if (!parsed || typeof parsed !== 'object') return false;
  const s = parsed as Record<string, unknown>;

  if (typeof s.savedAt !== 'number') return false;
  if (!s.phase || !VALID_PHASES.includes(s.phase as AppPhase)) return false;
  if (!s.story || typeof s.story !== 'object') return false;

  // Validate story has 3 chapters
  const story = s.story as Record<string, unknown>;
  if (!Array.isArray(story.chapters) || story.chapters.length !== 3) return false;

  if (typeof s.currentChapter !== 'number' || s.currentChapter < 1 || s.currentChapter > 3) return false;
  if (!Array.isArray(s.phrases)) return false;
  if (typeof s.currentPhraseIndex !== 'number' || s.currentPhraseIndex < 0) return false;
  if (!Array.isArray(s.revealedSegments)) return false;
  if (!Array.isArray(s.caughtIndices)) return false;
  if (!Array.isArray(s.missedIndices)) return false;
  if (typeof s.score !== 'number' || s.score < 0) return false;
  if (typeof s.combo !== 'number' || s.combo < 0) return false;
  if (typeof s.bestCombo !== 'number' || s.bestCombo < 0) return false;
  if (!Array.isArray(s.chapterStats)) return false;
  if (!s.settings || typeof s.settings !== 'object') return false;

  const settings = s.settings as Record<string, unknown>;
  if (typeof settings.spiceLevel !== 'number') return false;
  if (!Array.isArray(settings.selectedThemes)) return false;

  return true;
}

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
    const parsed = JSON.parse(raw);

    // Reject expired saves
    if (typeof parsed?.savedAt !== 'number' || Date.now() - parsed.savedAt > SAVE_MAX_AGE_MS) {
      clearGame();
      return null;
    }

    // Reject structurally corrupt saves
    if (!isValidSaveState(parsed)) {
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
