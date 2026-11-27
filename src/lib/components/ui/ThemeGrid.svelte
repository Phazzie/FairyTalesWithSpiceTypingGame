<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { THEMES } from '$lib/config';
  export let selected: string[] = [];
  const MAX_THEMES = 3;

  const dispatch = createEventDispatcher<{ change: string[] }>();

  function toggle(theme: string) {
    if (selected.includes(theme)) {
      selected = selected.filter(t => t !== theme);
    } else if (selected.length < MAX_THEMES) {
      selected = [...selected, theme];
    }
    dispatch('change', selected);
  }
</script>

<div class="words">
  {#each THEMES as theme}
    {@const on = selected.includes(theme)}
    <button
      type="button"
      aria-pressed={on}
      aria-label={theme}
      class="word"
      class:on
      disabled={!on && selected.length >= MAX_THEMES}
      on:click={() => toggle(theme)}
    >{theme}</button>
  {/each}
</div>
<p class="tally" class:done={selected.length === MAX_THEMES}>
  {#each [0, 1, 2] as i}<span class="mark" class:lit={i < selected.length}>♥</span>{/each}
  <span>{selected.length} of 3 written on the glass</span>
</p>

<style>
  .words { display: flex; flex-wrap: wrap; gap: 8px 10px; }
  .word {
    font: inherit; font-size: 18px; font-style: italic; color: var(--wiped-soft);
    padding: 6px 14px; border-radius: 999px; cursor: pointer;
    background: rgba(255,255,255,0.3); border: 1px solid rgba(19,35,42,0.15);
    transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
  }
  .word:hover:not(:disabled) { background: rgba(255,255,255,0.6); color: var(--wiped); }
  .word:focus-visible { outline: 2px solid var(--rose); outline-offset: 2px; }
  .word:disabled { opacity: 0.4; cursor: not-allowed; }
  /* Picked: wiped clean, so the dark room shows through. */
  .word.on {
    font-family: var(--font-finger); font-style: normal; font-size: 19px;
    color: var(--fog); background: var(--wiped); border-color: var(--wiped);
    box-shadow: 0 0 0 2px rgba(255,255,255,0.4), 0 0 16px rgba(19,35,42,0.4);
    transform: rotate(-1.5deg);
  }
  .tally { margin: 12px 0 0; display: flex; align-items: center; gap: 6px; font-family: var(--font-label); font-size: 13px; letter-spacing: 0.06em; color: var(--wiped-soft); }
  .mark { color: rgba(19,35,42,0.2); font-size: 16px; }
  .mark.lit { color: var(--rose); }
  .tally.done { color: var(--wiped); }
</style>
