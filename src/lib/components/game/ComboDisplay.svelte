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

<div class="flex items-center gap-2 min-w-[100px]">
  {#if showBreak}
    <span class="text-red-400 text-sm font-bold animate-bounce">COMBO BREAK!</span>
  {:else if $combo > 1}
    <span class="text-yellow-400 font-bold text-lg">
      ×{$combo} COMBO
    </span>
    {#if $combo >= 4}
      <span class="text-2xl animate-spin">⭐</span>
    {:else if $combo >= 2}
      <span class="text-xl">🔥</span>
    {/if}
  {:else}
    <span class="text-slate-500 text-sm">No combo</span>
  {/if}
</div>
