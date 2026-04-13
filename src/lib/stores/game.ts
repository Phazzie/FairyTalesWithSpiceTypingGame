import { writable } from 'svelte/store';
import type { Phrase, ChapterStats } from '../types/domain';

export const currentChapter = writable(1);
export const phrases = writable<Phrase[]>([]);
export const currentPhraseIndex = writable(0);
export const shivaPosition = writable(800);
export const score = writable(0);
export const combo = writable(0);
export const bestCombo = writable(0);
export const revealedSegments = writable<string[]>([]);
export const caughtIndices = writable<number[]>([]);
export const missedIndices = writable<number[]>([]);
export const chapterStats = writable<ChapterStats[]>([]);
export const isPaused = writable(false);
export const isRunning = writable(false);
export const phraseStartTime = writable(0);
