<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { FOG } from '$lib/steam';
  import type { SpeedSetting } from '$lib/types/domain';
  export let value: string = 'normal';

  const dispatch = createEventDispatcher<{ change: string }>();
  const speeds = Object.keys(FOG) as SpeedSetting[];

  function select(speed: string) {
    value = speed;
    dispatch('change', speed);
  }
</script>

<div role="radiogroup" aria-label="How fast the fog comes back" class="opts">
  {#each speeds as key, i}
    <button type="button" role="radio" aria-checked={value === key} class="opt" class:on={value === key}
      on:click={() => select(key)}>
      <span class="drops" aria-hidden="true">{'💧'.repeat(i + 1)}</span>
      <span class="label">{FOG[key].label}</span>
      <span class="note">{FOG[key].note}</span>
    </button>
  {/each}
</div>

<style>
  .opts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .opt { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; text-align: left; padding: 10px 12px; cursor: pointer;
    border-radius: 14px; border: 1px solid rgba(19,35,42,0.2); background: rgba(255,255,255,0.25); color: inherit; font: inherit; transition: background 0.2s ease; }
  .opt:hover { background: rgba(255,255,255,0.45); }
  .opt:focus-visible { outline: 2px solid var(--rose); outline-offset: 2px; }
  .opt.on { background: var(--wiped); color: var(--fog); border-color: var(--wiped); box-shadow: 0 0 0 2px var(--candle) inset; }
  .drops { font-size: 10px; letter-spacing: -2px; filter: grayscale(0.4); }
  .label { font-family: var(--font-label); font-weight: 500; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; }
  .note { font-style: italic; font-size: 15px; line-height: 1.2; opacity: 0.8; }
  @media (max-width: 620px) { .opts { grid-template-columns: 1fr 1fr; } }
</style>
