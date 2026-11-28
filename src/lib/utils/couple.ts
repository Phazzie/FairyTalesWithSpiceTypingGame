/**
 * Two players, one phone. Each player first writes the OTHER person's side of
 * the story; that person has to agree to it before the writer gets to add
 * their own side. Order:
 *   A writes B -> B agrees -> B writes A -> A agrees -> A adds own -> B adds own.
 * A "not quite" sends the description back to its writer with a note.
 */
export type CoupleStep =
  | 'names'
  | 'aWritesB' | 'bApproves'
  | 'bWritesA' | 'aApproves'
  | 'aOwn' | 'bOwn'
  | 'done';

export interface CoupleState {
  step: CoupleStep;
  aName: string;
  bName: string;
  /** A's description of B, and B's of A. */
  bByA: string;
  aByB: string;
  /** What each adds about themselves once their partner has been approved. */
  aOwn: string;
  bOwn: string;
  /** Why the last description was sent back, shown to its writer. */
  note: string;
}

export type CoupleAction =
  | { type: 'setNames'; a: string; b: string }
  | { type: 'write'; text: string }
  | { type: 'agree' }
  | { type: 'sendBack'; note: string }
  | { type: 'own'; text: string }
  | { type: 'restart' };

export const MAX_SIDE = 120;

export function initialCouple(): CoupleState {
  return { step: 'names', aName: '', bName: '', bByA: '', aByB: '', aOwn: '', bOwn: '', note: '' };
}

const clip = (s: string) => s.trim().slice(0, MAX_SIDE);

export function coupleReducer(s: CoupleState, action: CoupleAction): CoupleState {
  if (action.type === 'restart') return initialCouple();
  switch (s.step) {
    case 'names':
      if (action.type !== 'setNames') return s;
      if (!action.a.trim() || !action.b.trim()) return s;
      return { ...s, aName: action.a.trim().slice(0, 30), bName: action.b.trim().slice(0, 30), step: 'aWritesB' };
    case 'aWritesB':
      if (action.type !== 'write' || !action.text.trim()) return s;
      return { ...s, bByA: clip(action.text), note: '', step: 'bApproves' };
    case 'bApproves':
      if (action.type === 'agree') return { ...s, step: 'bWritesA' };
      if (action.type === 'sendBack') return { ...s, note: action.note.trim().slice(0, MAX_SIDE), step: 'aWritesB' };
      return s;
    case 'bWritesA':
      if (action.type !== 'write' || !action.text.trim()) return s;
      return { ...s, aByB: clip(action.text), note: '', step: 'aApproves' };
    case 'aApproves':
      if (action.type === 'agree') return { ...s, step: 'aOwn' };
      if (action.type === 'sendBack') return { ...s, note: action.note.trim().slice(0, MAX_SIDE), step: 'bWritesA' };
      return s;
    case 'aOwn':
      if (action.type !== 'own') return s;
      return { ...s, aOwn: clip(action.text), step: 'bOwn' };
    case 'bOwn':
      if (action.type !== 'own') return s;
      return { ...s, bOwn: clip(action.text), step: 'done' };
    default:
      return s;
  }
}

/** Who should be holding the phone at this step. */
export function holder(s: CoupleState): 'a' | 'b' | null {
  switch (s.step) {
    case 'aWritesB': case 'aApproves': case 'aOwn': return 'a';
    case 'bApproves': case 'bWritesA': case 'bOwn': return 'b';
    default: return null;
  }
}

function side(name: string, byPartner: string, partnerName: string, own: string): string {
  const parts = [`Named ${name}.`, `As ${partnerName} sees them: ${byPartner}.`];
  if (own) parts.push(`In ${name}'s own words: ${own}.`);
  return parts.join(' ').replace(/\.\./g, '.');
}

/** The two sides, ready for the story prompt (A is the protagonist, B the wolf). */
export function coupleDetails(s: CoupleState): { characterIdea: string; loveInterestIdea: string } | null {
  if (s.step !== 'done') return null;
  return {
    characterIdea: side(s.aName, s.aByB, s.bName, s.aOwn),
    loveInterestIdea: side(s.bName, s.bByA, s.aName, s.bOwn),
  };
}
