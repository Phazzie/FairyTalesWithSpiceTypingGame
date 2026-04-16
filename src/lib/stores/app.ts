import { writable } from 'svelte/store';
import type { AppPhase, Story, StoryCustomization } from '../types/domain';

export const phase = writable<AppPhase>('START');
export const story = writable<Story | null>(null);
export const loadingMessage = writable('');
export const errorMessage = writable('');
export const settings = writable<StoryCustomization | null>(null);

const ALLOWED_TRANSITIONS: Record<AppPhase, AppPhase[]> = {
  START: ['GENERATING'],
  GENERATING: ['GRADING', 'ERROR'],
  GRADING: ['EXTRACTING', 'GENERATING', 'ERROR'],
  EXTRACTING: ['GAMEPLAY', 'ERROR'],
  GAMEPLAY: ['CHAPTER_COMPLETE', 'ERROR'],
  CHAPTER_COMPLETE: ['EXTRACTING', 'STORY_COMPLETE'],
  STORY_COMPLETE: ['START'],
  ERROR: ['START'],
};

export function transitionTo(next: AppPhase): void {
  phase.update(current => {
    if (ALLOWED_TRANSITIONS[current]?.includes(next)) return next;
    console.warn(`Invalid phase transition: ${current} -> ${next}`);
    return current;
  });
}

/**
 * Restores the app directly to GAMEPLAY after rehydrating all game stores from a save.
 * Bypasses normal phase guards because this is a controlled restore path, not gameplay flow.
 */
export function restoreToGameplay(): void {
  phase.set('GAMEPLAY');
}
