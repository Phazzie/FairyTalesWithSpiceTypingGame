import { describe, it, expect } from 'vitest';
import { initialCouple, coupleReducer, coupleDetails, holder, type CoupleAction, type CoupleState } from '../../src/lib/utils/couple';

const run = (actions: CoupleAction[], s: CoupleState = initialCouple()) => actions.reduce(coupleReducer, s);

describe('two-player setup', () => {
  it('makes each player describe the other, get agreement, then add their own side', () => {
    let s = run([{ type: 'setNames', a: 'Ava', b: 'Rook' }]);
    expect(s.step).toBe('aWritesB');
    expect(holder(s)).toBe('a');
    // Ava can't add her own side before Rook agrees to what she wrote about him.
    expect(coupleReducer(s, { type: 'own', text: 'me' })).toBe(s);
    s = run([{ type: 'write', text: 'a wolf who growls at the kettle' }], s);
    expect(s.step).toBe('bApproves');
    expect(holder(s)).toBe('b');
    s = run([{ type: 'agree' }, { type: 'write', text: 'a night-shift nurse' }], s);
    expect(s.step).toBe('aApproves');
    s = run([{ type: 'agree' }, { type: 'own', text: 'secretly reads his texts' }, { type: 'own', text: '' }], s);
    expect(s.step).toBe('done');
    expect(coupleDetails(s)).toEqual({
      characterIdea: "Named Ava. As Rook sees them: a night-shift nurse. In Ava's own words: secretly reads his texts.",
      loveInterestIdea: 'Named Rook. As Ava sees them: a wolf who growls at the kettle.',
    });
  });

  it('sending a description back returns it to its writer with the note', () => {
    let s = run([{ type: 'setNames', a: 'Ava', b: 'Rook' }, { type: 'write', text: 'short' }, { type: 'sendBack', note: 'taller' }]);
    expect(s.step).toBe('aWritesB');
    expect(s.note).toBe('taller');
    s = run([{ type: 'write', text: 'tall' }], s);
    expect(s.note).toBe('');
    expect(s.step).toBe('bApproves');
  });

  it('needs both names and a non-empty description', () => {
    const s = initialCouple();
    expect(coupleReducer(s, { type: 'setNames', a: 'Ava', b: ' ' })).toBe(s);
    const named = run([{ type: 'setNames', a: 'Ava', b: 'Rook' }]);
    expect(coupleReducer(named, { type: 'write', text: '   ' })).toBe(named);
    expect(coupleDetails(named)).toBeNull();
  });
});
