<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { SPEAKERS } from '$lib/court';
  import type { SpeedSetting } from '$lib/types/domain';
  export let value: string = 'normal';

  const dispatch = createEventDispatcher<{ change: string }>();
  const speeds = Object.keys(SPEAKERS) as SpeedSetting[];

  function select(speed: string) {
    value = speed;
    dispatch('change', speed);
  }
</script>

<div role="radiogroup" aria-label="Rate of speech" class="options">
  {#each speeds as key}
    <button type="button" role="radio" aria-checked={value === key} class="opt" class:on={value === key}
      on:click={() => select(key)}>
      <span class="box">{value === key ? 'X' : ''}</span>
      <span><strong>{SPEAKERS[key].label}</strong><span class="note">&nbsp;({SPEAKERS[key].note})</span></span>
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
