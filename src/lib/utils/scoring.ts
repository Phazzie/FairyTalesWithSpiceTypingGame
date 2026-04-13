import { COMBO_MULTIPLIERS, BASE_POINTS } from '../config';

export function calculatePoints(params: {
  elapsedMs: number;
  speedConfig: { pixelsPerTick: number };
  combo: number;
}): number {
  const speedBonus = params.speedConfig.pixelsPerTick;
  const comboIdx = Math.min(params.combo, COMBO_MULTIPLIERS.length - 1);
  const multiplier = COMBO_MULTIPLIERS[comboIdx];
  return Math.floor(BASE_POINTS * speedBonus * multiplier);
}

export function getNextCombo(current: number): number {
  return current + 1;
}

export function resetCombo(): number {
  return 0;
}

export function matchPhrase(input: string, target: string): boolean {
  return input.trim().toLowerCase() === target.trim().toLowerCase();
}
