<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { RATINGS } from '$lib/court';
  import type { SpiceLevel } from '$lib/types/domain';
  export let value: number = 3;

  const dispatch = createEventDispatcher<{ change: number }>();
  const levels = [1, 2, 3, 4, 5] as SpiceLevel[];

  function select(level: number) {
    value = level;
    dispatch('change', level);
  }
</script>

<div role="radiogroup" aria-label="Rating of the proceedings" class="options">
  {#each levels as level}
    <button type="button" role="radio" aria-checked={value === level} class="opt" class:on={value === level}
      on:click={() => select(level)}>
      <span class="box">{value === level ? 'X' : ''}</span>
      <span><strong>{RATINGS[level].code}</strong> · {RATINGS[level].label}<span class="note">&nbsp;({RATINGS[level].note})</span></span>
    </button>
  {/each}
</div>

<style>
  .options { display: flex; flex-direction: column; }
  .opt { display: flex; gap: 10px; align-items: flex-start; text-align: left; padding: 2px 0; line-height: 24px; cursor: pointer; background: none; border: none; color: inherit; font: inherit; }
  .opt .box { margin-top: 3px; }
  .opt:hover .box { background: var(--highlight); }
  .opt:focus-visible { outline: 2px solid var(--stamp-blue); outline-offset: 2px; }
  .note { color: var(--ink-soft); }
  .on strong { background: var(--highlight); }
</style>
