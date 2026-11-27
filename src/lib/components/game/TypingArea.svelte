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

<div class="steno">
  <label for="steno-input" class="who">THE REPORTER:</label>
  <input
    id="steno-input"
    bind:this={inputEl}
    bind:value={input}
    type="text"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    placeholder={$isPaused ? 'Court is in recess.' : 'Type the line on the tape…'}
    disabled={$isPaused || !$isRunning}
    on:input={handleInput}
    on:keydown={handleKeydown}
  />
</div>

<style>
  .steno { display: flex; align-items: baseline; gap: 12px; background: var(--paper); padding: 14px 18px; box-shadow: 0 10px 24px -10px rgba(0,0,0,0.7); }
  .who { font-weight: 700; font-size: 14px; letter-spacing: 0.06em; white-space: nowrap; }
  input { flex: 1; min-width: 0; font-family: var(--font-steno); font-size: 22px; background: transparent; border: none; border-bottom: 2px solid var(--ink); color: var(--ink); padding: 2px 0; outline: none; }
  input::placeholder { color: var(--ink-faint); font-style: italic; }
  input:focus { background: linear-gradient(to top, var(--highlight) 0 40%, transparent 40%); }
  input:disabled { border-bottom-style: dashed; }
  @media (max-width: 520px) { .steno { flex-direction: column; gap: 4px; align-items: stretch; } input { font-size: 19px; } }
</style>
