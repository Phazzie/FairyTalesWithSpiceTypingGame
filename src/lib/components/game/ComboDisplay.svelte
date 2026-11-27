<script lang="ts">
  import { combo } from '$lib/stores/game';
  import Stamp from '../ui/Stamp.svelte';

  let prevCombo = 0;
  let showBreak = false;
  let breakTimer: ReturnType<typeof setTimeout>;

  $: {
    if (prevCombo > 0 && $combo === 0) {
      showBreak = true;
      clearTimeout(breakTimer);
      breakTimer = setTimeout(() => { showBreak = false; }, 1500);
    }
    prevCombo = $combo;
  }
</script>

<div class="combo" aria-live="polite">
  {#if showBreak}
    <span class="objection"><Stamp tone="red" rotate={-6} size="sm">Run broken</Stamp></span>
  {:else if $combo > 1}
    <span class="run">Unbroken record ×{$combo}</span>
  {:else}
    <span class="none">No unbroken run</span>
  {/if}
</div>

<style>
  .combo { min-height: 30px; display: flex; align-items: center; justify-content: flex-end; font-size: 13px; }
  .run { font-weight: 700; background: var(--highlight); padding: 0 6px; white-space: nowrap; }
  @media (max-width: 520px) { .combo { font-size: 11px; } }
  .none { color: var(--ink-faint); }
  .objection { animation: slam 0.25s cubic-bezier(.2,1.6,.4,1); display: inline-block; }
  @keyframes slam { from { transform: scale(2.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
