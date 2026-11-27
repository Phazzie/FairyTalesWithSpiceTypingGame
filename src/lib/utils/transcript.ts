import type { ChapterRecord, Phrase } from '../types/domain';

/** Marks a missed line in the live record shown during play. */
export const INAUDIBLE_MARK = '\u2063INAUDIBLE:';


export interface TranscriptPart {
  text: string;
  inaudible: boolean;
}

/** Builds a chapter's record from which phrases were caught and which were missed. */
export function buildChapterRecord(
  chapter: number,
  phrases: Phrase[],
  caughtIndices: number[],
  missedIndices: number[],
): ChapterRecord {
  const caught = new Set<string>();
  for (const i of caughtIndices) if (phrases[i]) caught.add(phrases[i].proseSegment);
  const missed = new Set<string>();
  for (const i of missedIndices) {
    const seg = phrases[i]?.proseSegment;
    // A segment shared by a caught phrase still made it into the record.
    if (seg && !caught.has(seg)) missed.add(seg);
  }
  return { chapter, caughtSegments: [...caught], missedSegments: [...missed] };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Splits chapter prose into parts, marking every missed segment as inaudible.
 * Segments are matched loosely on whitespace, since phrase segments are
 * single-spaced and prose keeps its line breaks.
 */
export function redactProse(prose: string, missedSegments: string[]): TranscriptPart[] {
  const ranges: Array<[number, number]> = [];
  for (const seg of missedSegments) {
    const words = seg.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    // Global: a segment repeated in the prose is struck everywhere it appears.
    const re = new RegExp(words.map(escapeRegex).join('\\s+'), 'g');
    for (const m of prose.matchAll(re)) ranges.push([m.index, m.index + m[0].length]);
  }
  ranges.sort((a, b) => a[0] - b[0]);

  const parts: TranscriptPart[] = [];
  let pos = 0;
  // Merge overlapping ranges so the whole union of missed text is hidden.
  const merged: Array<[number, number]> = [];
  for (const [start, end] of ranges) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  for (const [start, end] of merged) {
    if (start > pos) parts.push({ text: prose.slice(pos, start), inaudible: false });
    parts.push({ text: prose.slice(start, end), inaudible: true });
    pos = end;
  }
  if (pos < prose.length) parts.push({ text: prose.slice(pos), inaudible: false });
  return parts;
}

/** Share of the chapter's words that made it into the record, 0-100. */
export function recordedPercent(parts: TranscriptPart[]): number {
  const count = (t: string) => t.split(/\s+/).filter(Boolean).length;
  const total = parts.reduce((n, p) => n + count(p.text), 0);
  if (total === 0) return 0;
  const kept = parts.filter(p => !p.inaudible).reduce((n, p) => n + count(p.text), 0);
  return Math.round((kept / total) * 100);
}

export interface Verdict {
  ruling: string;
  detail: string;
}

/** What the mirror looks like after all three nights, by how much you kept. */
export function verdictFor(accuracy: number): Verdict {
  if (accuracy >= 100) return { ruling: 'CRYSTAL CLEAR', detail: 'Every word, every night, still on the glass. Nobody is getting out of this bathroom any time soon.' };
  if (accuracy >= 95) return { ruling: 'CRYSTAL CLEAR', detail: 'A drop or two ran, but the whole thing is still there to read. Twice.' };
  if (accuracy >= 80) return { ruling: 'STEAMY', detail: 'Most of it survived. A few lines were lost to the heat of the moment, which is fair.' };
  if (accuracy >= 50) return { ruling: 'HAZY', detail: 'You can make out the shape of a love story. The good parts are under the fog.' };
  return { ruling: 'FOGGED OVER', detail: 'The steam won. Whatever happened in here stays a rumor.' };
}

