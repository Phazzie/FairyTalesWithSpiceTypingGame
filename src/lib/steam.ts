/**
 * The world: a steamed-up bathroom mirror at night. Every line of the story is
 * written into the steam with a fingertip, and the fog rolls back over it.
 * Everything the game says lives here so the world stays consistent.
 */
import type { SpiceLevel, SpeedSetting } from './types/domain';

/** Spice level, as the water temperature. */
export const TEMPS: Record<SpiceLevel, { label: string; note: string }> = {
  1: { label: 'Lukewarm', note: 'hand-holding, long looks' },
  2: { label: 'Warm', note: 'one kiss, maybe two' },
  3: { label: 'Hot', note: 'the mirror fogs fast' },
  4: { label: 'Scalding', note: 'lock the door' },
  5: { label: "Don't touch the dial", note: 'nothing left to the imagination' },
};

/** Speed setting, as how fast the fog rolls back in. */
export const FOG: Record<SpeedSetting, { label: string; note: string }> = {
  relaxed: { label: 'Slow drip', note: 'plenty of time to linger' },
  normal: { label: 'Steady', note: 'the glass clouds at a lazy pace' },
  fast: { label: 'Rolling', note: 'you have to keep up' },
  intense: { label: 'Shower running', note: 'gone the moment you blink' },
};

export const NIGHT_WORDS = ['', 'One', 'Two', 'Three'];
export const NIGHT_ORDINALS = ['', 'first', 'second', 'third'];

/** The score, as heat. */
export function heat(points: number): string {
  return points.toLocaleString('en-US') + '°';
}
