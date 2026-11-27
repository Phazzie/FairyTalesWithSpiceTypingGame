<script lang="ts">
  import { tick } from 'svelte';
  import { revealedSegments } from '$lib/stores/game';

  let panel: HTMLDivElement;

  // Scroll to the newest revealed text.
  $: if ($revealedSegments.length && panel) {
    tick().then(() => panel.scrollTo({ top: panel.scrollHeight, behavior: 'smooth' }));
  }
</script>

<div bind:this={panel} data-testid="story-panel" class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 max-h-48 overflow-y-auto">
  {#if $revealedSegments.length === 0}
    <p class="text-slate-500 text-sm italic text-center">
      Catch phrases to reveal the story...
    </p>
  {:else}
    <div class="space-y-1">
      {#each $revealedSegments as segment, i}
        <p
          class="text-slate-300 text-sm leading-relaxed"
          style={i === $revealedSegments.length - 1 ? 'animation: fadeIn 0.5s ease-in' : ''}
        >
          {segment}
        </p>
      {/each}
    </div>
  {/if}
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
