<script lang="ts">
  export let text: string = '';
  export let typedSoFar: string = '';
  /** Horizontal position of the tail, as a percent of the bubble width. */
  export let tailPct: number = 50;

  $: chars = text.split('');
  $: typedChars = typedSoFar.split('');
</script>

<div class="relative bg-slate-800 border border-purple-500/50 rounded-xl px-4 py-2 shadow-lg text-center">
  <div class="font-mono text-base tracking-wide" data-testid="phrase">
    {#each chars as char, i}
      {#if i < typedChars.length}
        <span class={typedChars[i].toLowerCase() === char.toLowerCase() ? 'text-green-400' : 'text-red-400'}>
          {char}
        </span>
      {:else if i === typedChars.length}
        <span class="text-white bg-purple-600/40 rounded px-0.5">{char}</span>
      {:else}
        <span class="text-slate-400">{char}</span>
      {/if}
    {/each}
  </div>
  <!-- Bubble tail -->
  <div style="left: clamp(12px, {tailPct}%, calc(100% - 12px))" class="absolute -bottom-2 -translate-x-1/2 w-0 h-0
    border-l-[8px] border-l-transparent
    border-r-[8px] border-r-transparent
    border-t-[8px] border-t-purple-500/50"></div>
</div>
