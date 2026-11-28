<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { coupleReducer, holder, coupleDetails, initialCouple, MAX_SIDE, type CoupleAction, type CoupleState } from '$lib/utils/couple';
  import Button from './Button.svelte';

  export let state: CoupleState = initialCouple();
  const dispatch = createEventDispatcher<{ change: CoupleState }>();

  let aName = state.aName;
  let bName = state.bName;
  let draft = '';
  let note = '';
  let objecting = false;
  /** Who has confirmed they're holding the phone. Until it matches, the glass is fogged over. */
  let confirmed: 'a' | 'b' | null = holder(state);

  function act(action: CoupleAction) {
    state = coupleReducer(state, action);
    draft = '';
    note = '';
    objecting = false;
    dispatch('change', state);
  }

  $: who = holder(state);
  $: covered = who !== null && who !== confirmed;
  $: me = who === 'a' ? state.aName : state.bName;
  $: them = who === 'a' ? state.bName : state.aName;
  $: details = coupleDetails(state);
</script>

<div class="couple" data-testid="couple">
  {#if covered}
    <div class="handoff" role="dialog" aria-labelledby="handoff-title">
      <p class="etch">Pass the phone</p>
      <h3 id="handoff-title" class="wipe">Hand it to {me}.</h3>
      <p class="hint">No peeking, {them}. The glass stays fogged until {me} has it.</p>
      <Button on:click={() => (confirmed = who)}>I'm {me}</Button>
    </div>
  {:else if state.step === 'names'}
    <p class="lead">Two of you, one phone. You each describe the <em>other</em> person first, and they have to agree before you get to say a word about yourself.</p>
    <div class="names">
      <label><span>The one who wanders in</span>
        <input bind:value={aName} maxlength="30" placeholder="your name" /></label>
      <label><span>The wolf</span>
        <input bind:value={bName} maxlength="30" placeholder="their name" /></label>
    </div>
    <Button disabled={!aName.trim() || !bName.trim()} on:click={() => act({ type: 'setNames', a: aName, b: bName })}>Start writing</Button>
  {:else if state.step === 'aWritesB' || state.step === 'bWritesA'}
    <h3 class="wipe">{me}, describe {them}.</h3>
    <p class="hint">How do you see them in this story? {them} has to agree to it before you get to say anything about yourself.</p>
    {#if state.note}<p class="sent-back">{them} sent it back: "{state.note}"</p>{/if}
    <label class="sr-only" for="couple-draft">Describe {them}</label>
    <textarea id="couple-draft" bind:value={draft} maxlength={MAX_SIDE} rows="3" placeholder="the one with the low voice who never knocks"></textarea>
    <Button disabled={!draft.trim()} on:click={() => act({ type: 'write', text: draft })}>Pass it to {them}</Button>
  {:else if state.step === 'bApproves' || state.step === 'aApproves'}
    <h3 class="wipe">{me}, this is how {them} wrote you:</h3>
    <p class="quote">"{state.step === 'bApproves' ? state.bByA : state.aByB}"</p>
    {#if objecting}
      <label class="sr-only" for="couple-note">What should {them} change?</label>
      <input id="couple-note" class="note" bind:value={note} maxlength={MAX_SIDE} placeholder="what should they change?" />
      <div class="row">
        <Button on:click={() => act({ type: 'sendBack', note })}>Send it back</Button>
        <Button variant="secondary" on:click={() => (objecting = false)}>Never mind</Button>
      </div>
    {:else}
      <div class="row">
        <Button on:click={() => act({ type: 'agree' })}>Yes, that's me</Button>
        <Button variant="secondary" on:click={() => (objecting = true)}>Not quite</Button>
      </div>
    {/if}
  {:else if state.step === 'aOwn' || state.step === 'bOwn'}
    <h3 class="wipe">Your turn, {me}.</h3>
    <p class="hint">{them} wrote you as "{state.step === 'aOwn' ? state.aByB : state.bByA}". You agreed. Now add your own side, the part they don't know.</p>
    <label class="sr-only" for="couple-own">Your own side</label>
    <textarea id="couple-own" bind:value={draft} maxlength={MAX_SIDE} rows="3" placeholder="optional: a secret, a want, a rule you'll break"></textarea>
    <Button on:click={() => act({ type: 'own', text: draft })}>{state.step === 'aOwn' ? `Pass it to ${them}` : 'Done'}</Button>
  {:else if details}
    <div class="sides">
      <div><p class="etch">{state.aName}</p><p>{details.characterIdea}</p></div>
      <div><p class="etch">{state.bName}</p><p>{details.loveInterestIdea}</p></div>
    </div>
    <button type="button" class="redo" on:click={() => { act({ type: 'restart' }); confirmed = null; }}>Start the two sides over</button>
  {/if}
</div>

<style>
  .couple { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; padding: 18px; border-radius: 18px; background: rgba(255,255,255,0.3); border: 1px solid rgba(19,35,42,0.15); }
  h3 { margin: 0; font-size: 26px; font-weight: 400; line-height: 1.15; }
  .lead, .hint { margin: 0; font-style: italic; color: var(--wiped-soft); line-height: 1.4; }
  .names { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; }
  label span { display: block; font-family: var(--font-finger); font-size: 19px; }
  input, textarea { width: 100%; box-sizing: border-box; font: inherit; font-size: 18px; background: rgba(255,255,255,0.45); border: 1px solid rgba(19,35,42,0.15); border-radius: 12px; padding: 8px 12px; color: var(--wiped); outline: none; resize: vertical; }
  input:focus, textarea:focus { background: rgba(255,255,255,0.75); border-color: var(--rose); }
  ::placeholder { color: var(--wiped-faint); font-style: italic; }
  .quote { margin: 0; font-family: var(--font-finger); font-size: 24px; line-height: 1.3; color: var(--rose); }
  .sent-back { margin: 0; color: var(--rose); font-style: italic; }
  .row { display: flex; flex-wrap: wrap; gap: 10px; }
  .handoff { width: 100%; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 26px 8px;
    background: radial-gradient(ellipse at center, rgba(255,255,255,0.9), rgba(255,255,255,0.35) 75%); border-radius: 14px; }
  .handoff .etch { margin: 0; color: var(--rose); }
  .sides { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 100%; }
  .sides p { margin: 0; }
  .sides .etch { color: var(--rose); margin-bottom: 4px; }
  .redo { background: none; border: none; padding: 0; font-family: var(--font-label); font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--wiped-soft); text-decoration: underline; cursor: pointer; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  @media (max-width: 560px) { .names, .sides { grid-template-columns: 1fr; } }
</style>
