/**
 * Turns story text into something a player can type on a normal keyboard.
 * Curly quotes become straight ones, dashes and ellipses become spaces,
 * and anything outside printable ASCII is dropped. Leading and trailing
 * punctuation is stripped so phrases don't end in a stray period or comma.
 */
export function toTypeable(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // accents: é -> e
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”‟″]/g, '"')
    .replace(/[‐-―−]/g, ' ') // hyphen/en/em dashes between words
    .replace(/…/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[^A-Za-z0-9]+/, '')
    .replace(/[^A-Za-z0-9]+$/, '');
}

/** Normalizes typed input or a target phrase for comparison. */
export function normalizeForMatch(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}
