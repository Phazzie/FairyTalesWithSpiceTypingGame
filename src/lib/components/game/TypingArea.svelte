<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { isPaused, isRunning } from '$lib/stores/game';

  export let currentPhrase: string = '';
  let input = '';
  let inputEl: HTMLInputElement;

  const dispatch = createEventDispatcher<{ catch: string; miss: void; input: string }>();

  function handleInput() {
    dispatch('input', input);

    // Auto-submit if input matches phrase length
    if (input.trim().toLowerCase() === currentPhrase.trim().toLowerCase()) {
      dispatch('catch', input);
      input = '';
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (input.trim().toLowerCase() === currentPhrase.trim().toLowerCase()) {
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

  $: if (!$isPaused && $isRunning) {
    inputEl?.focus();
  }
</script>

<div class="flex flex-col gap-2">
  <input
    bind:this={inputEl}
    bind:value={input}
    type="text"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    placeholder={$isPaused ? 'Paused...' : 'Type the phrase above...'}
    disabled={$isPaused || !$isRunning}
    class="w-full bg-slate-800 border border-slate-600 focus:border-purple-500 rounded-lg px-4 py-3 text-white font-mono text-lg outline-none transition-colors placeholder-slate-500 disabled:opacity-50"
    on:input={handleInput}
    on:keydown={handleKeydown}
  />
  <p class="text-slate-500 text-sm text-center">Type the phrase • Press Enter to submit</p>
</div>
