<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { THEMES } from '$lib/config';
  import { ROMAN } from '$lib/court';
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

<div class="counts">
  {#each THEMES as theme, i}
    {@const on = selected.includes(theme)}
    <button
      type="button"
      aria-pressed={on}
      aria-label={theme}
      class="count"
      class:on
      disabled={!on && selected.length >= MAX_THEMES}
      on:click={() => toggle(theme)}
    >
      <span class="box">{on ? 'X' : ''}</span>
      <span><span class="num">Count {ROMAN[i]}.</span> {theme}</span>
    </button>
  {/each}
</div>
<p class="tally" class:done={selected.length === MAX_THEMES}>
  {selected.length} of 3 counts charged
</p>

<style>
  .counts { display: grid; grid-template-columns: 1fr 1fr; column-gap: 18px; }
  .count { display: flex; gap: 10px; align-items: flex-start; text-align: left; padding: 2px 0; line-height: 24px; cursor: pointer; background: none; border: none; color: inherit; font: inherit; }
  .count .box { margin-top: 3px; }
  .count:hover:not(:disabled) .box { background: var(--highlight); }
  .count:focus-visible { outline: 2px solid var(--stamp-blue); outline-offset: 2px; }
  .count:disabled { color: var(--ink-faint); cursor: not-allowed; }
  .count:disabled .box { border-color: var(--ink-faint); }
  .num { color: var(--ink-soft); }
  .on { font-weight: 700; }
  .on .num { color: var(--stamp-red); }
  .tally { margin: 6px 0 0; color: var(--ink-soft); }
  .tally.done { color: var(--ink); }
  @media (max-width: 520px) { .counts { grid-template-columns: 1fr; } }
</style>
