/**
 * The court's vocabulary. Everything the game says lives here so the world
 * stays consistent across screens.
 */
import type { SpiceLevel, SpeedSetting } from './types/domain';

export const CASE = {
  court: 'Superior Court of the State of Fairytale',
  county: 'For the County of Moonfall',
  plaintiff: 'THE PEOPLE OF MOONFALL COUNTY',
  defendant: 'SHIVA, a wolf',
  number: 'FWS-1313-LOVE',
  dept: 'Dept. 3 (Full Moon)',
};

export const RATINGS: Record<SpiceLevel, { code: string; label: string; note: string }> = {
  1: { code: 'G', label: 'Family court', note: 'hand-holding, longing looks' },
  2: { code: 'PG', label: 'Small claims', note: 'one (1) kiss, entered as evidence' },
  3: { code: 'R', label: 'Superior court', note: 'the bailiff clears his throat' },
  4: { code: 'NC-17', label: 'Bench conference', note: 'counsel, approach. Now.' },
  5: { code: 'SEALED', label: 'Clear the gallery', note: 'minors and grandmothers must leave' },
};

export const SPEAKERS: Record<SpeedSetting, { label: string; note: string }> = {
  relaxed: { label: 'Retired judge', note: 'pauses between every word' },
  normal: { label: 'Sworn witness', note: 'nervous but steady' },
  fast: { label: 'Auctioneer', note: 'sold, to the wolf in the back' },
  intense: { label: 'Defense attorney on espresso', note: 'objection-speed' },
};

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export const DAY_WORDS = ['', 'One', 'Two', 'Three'];

/** Today's date the way a court document writes it. */
export function courtDate(d = new Date()): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function fee(points: number): string {
  return '$' + points.toLocaleString('en-US') + '.00';
}
