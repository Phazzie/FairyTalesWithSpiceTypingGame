export const SPEEDS = {
  relaxed: { pixelsPerTick: 1, tickMs: 50, label: 'Relaxed' },
  normal:  { pixelsPerTick: 2, tickMs: 50, label: 'Normal' },
  fast:    { pixelsPerTick: 3, tickMs: 50, label: 'Fast' },
  intense: { pixelsPerTick: 4, tickMs: 50, label: 'Intense' },
} as const;

export const TRACK_WIDTH = 800;
export const START_POSITION = TRACK_WIDTH - 80;
export const ESCAPE_THRESHOLD = 40;
export const MAX_GEN_ATTEMPTS = 3;
export const PASSING_SCORE = 6.0;
export const BASE_POINTS = 100;
export const COMBO_MULTIPLIERS = [1, 1.1, 1.2, 1.5, 2.0];
export const SAVE_KEY = 'fairytales_save';
export const SAVE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const THEMES = [
  'Forbidden Love', 'Pack Rivalry', 'Ancient Curse', 'Hidden Identity',
  'Fated Mates', 'Redemption Arc', 'Power Struggle', 'Secret Society',
  'Magic Awakening', 'Exile & Return', 'Rivals to Lovers', 'Dark Forest Rite',
];
