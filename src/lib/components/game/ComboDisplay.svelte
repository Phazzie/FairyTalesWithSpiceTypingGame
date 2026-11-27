<script lang="ts">
  import { combo } from '$lib/stores/game';

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
    <span class="gone">The moment's gone</span>
  {:else if $combo > 1}
    <span class="run">Don't stop ×{$combo}</span>
  {:else}
    <span class="none">Find a rhythm</span>
  {/if}
</div>

<style>
  .combo { min-height: 30px; display: flex; align-items: center; justify-content: flex-end; font-family: var(--font-label); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; }
  .run { color: var(--candle); text-shadow: 0 0 12px var(--candle-glow); white-space: nowrap; animation: pulse 0.6s ease; }
  .none { color: rgba(214,223,224,0.4); }
  .gone { color: var(--rose-soft); font-style: italic; animation: fade 1.5s ease forwards; }
  @keyframes pulse { from { transform: scale(1.25); } to { transform: scale(1); } }
  @keyframes fade { 0% { opacity: 0; filter: blur(4px); } 20% { opacity: 1; filter: none; } 100% { opacity: 0.2; filter: blur(3px); } }
  @media (max-width: 520px) { .combo { font-size: 10px; } }
</style>
