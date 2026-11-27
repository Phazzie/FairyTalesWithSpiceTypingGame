<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { isPaused, isRunning } from '$lib/stores/game';
  import { matchPhrase } from '$lib/utils/scoring';

  export let currentPhrase: string = '';
  let input = '';
  let inputEl: HTMLInputElement;

  const dispatch = createEventDispatcher<{ catch: string; miss: void; input: string }>();

  function handleInput() {
    dispatch('input', input);

    // Auto-submit if input matches phrase length
    if (matchPhrase(input, currentPhrase)) {
      dispatch('catch', input);
      input = '';
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (matchPhrase(input, currentPhrase)) {
        dispatch('catch', input);
      } else {
        // Allow partial submit with enter
        dispatch('miss');
      }
      input = '';
    }
  }

  $: if (currentPhrase) {
    input = '';
  }

  onMount(() => {
    inputEl?.focus();
  });

  // Wait for the input to be re-enabled before focusing it (e.g. after Resume).
  $: if (!$isPaused && $isRunning) {
    tick().then(() => inputEl?.focus());
  }
</script>

<div class="finger">
  <label for="steno-input" class="who">Your fingertip</label>
  <input
    id="steno-input"
    bind:this={inputEl}
    bind:value={input}
    type="text"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    placeholder={$isPaused ? 'The water is off.' : 'Trace the line before the steam takes it…'}
    disabled={$isPaused || !$isRunning}
    on:input={handleInput}
    on:keydown={handleKeydown}
  />
</div>

<style>
  .finger { display: flex; align-items: center; gap: 14px; padding: 12px 20px; border-radius: 999px;
    background: rgba(214,223,224,0.1); border: 1px solid rgba(214,223,224,0.25); box-shadow: 0 10px 30px -12px rgba(0,0,0,0.8); }
  .who { font-family: var(--font-label); font-size: 11px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase; color: var(--candle); white-space: nowrap; }
  input { flex: 1; min-width: 0; font-family: var(--font-prose); font-weight: 600; font-size: 23px; background: transparent; border: none; color: var(--fog); padding: 2px 0; outline: none; caret-color: var(--candle); }
  input::placeholder { color: rgba(214,223,224,0.45); font-style: italic; font-weight: 400; }
  .finger:focus-within { border-color: var(--candle); box-shadow: 0 0 0 3px rgba(244,178,106,0.2), 0 10px 30px -12px rgba(0,0,0,0.8); }
  input:disabled { opacity: 0.5; }
  @media (max-width: 520px) { .finger { flex-direction: column; align-items: stretch; gap: 2px; border-radius: 18px; padding: 10px 16px; } input { font-size: 20px; } }
</style>
