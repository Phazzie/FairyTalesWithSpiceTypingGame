<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { TEMPS } from '$lib/steam';
  import type { SpiceLevel } from '$lib/types/domain';
  export let value: number = 3;

  const dispatch = createEventDispatcher<{ change: number }>();
  const levels = [1, 2, 3, 4, 5] as SpiceLevel[];

  function select(level: number) {
    value = level;
    dispatch('change', level);
  }
</script>

<div class="dial">
  <div role="radiogroup" aria-label="How hot is the water" class="notches">
    {#each levels as level}
      <button type="button" role="radio" aria-checked={value === level} aria-label={TEMPS[level].label}
        class="notch" class:on={value === level} class:below={level < value} style="--i: {level}"
        on:click={() => select(level)}>
        <span class="pip"></span>
      </button>
    {/each}
  </div>
  <p class="read" aria-live="polite">
    <span class="wipe name">{TEMPS[value as SpiceLevel].label}</span>
    <span class="note">{TEMPS[value as SpiceLevel].note}</span>
  </p>
</div>

<style>
  .notches { display: flex; gap: 8px; align-items: flex-end; }
  .notch { flex: 1; height: calc(18px + var(--i) * 9px); padding: 0; border: none; cursor: pointer; border-radius: 10px 10px 4px 4px;
    background: rgba(19,35,42,0.12); position: relative; transition: background 0.2s ease, transform 0.12s ease; }
  .notch.below { background: linear-gradient(to top, color-mix(in srgb, var(--rose) calc(var(--i) * 15%), var(--candle)), rgba(244,178,106,0.5)); }
  .notch.on { background: linear-gradient(to top, var(--rose), var(--candle)); box-shadow: 0 0 18px var(--candle-glow); transform: translateY(-2px); }
  .notch:hover:not(.on) { background: rgba(194,83,107,0.3); }
  .notch:focus-visible { outline: 2px solid var(--rose); outline-offset: 3px; }
  .pip { position: absolute; left: 50%; bottom: 6px; width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.7); transform: translateX(-50%); }
  .read { margin: 10px 0 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; }
  .name { font-size: 26px; }
  .note { font-style: italic; color: var(--wiped-soft); }
</style>
