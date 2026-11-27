<script lang="ts">
  import { tick } from 'svelte';
  import { revealedSegments } from '$lib/stores/game';
  import { INAUDIBLE_MARK } from '$lib/utils/transcript';

  let panel: HTMLDivElement;

  // Scroll to the newest revealed text.
  $: if ($revealedSegments.length && panel) {
    tick().then(() => panel.scrollTo({ top: panel.scrollHeight, behavior: 'smooth' }));
  }
</script>

<section class="mirror record" aria-label="The story so far">
  <p class="etch head">What's on the glass</p>
  <div bind:this={panel} data-testid="story-panel" class="scroll">
    {#if $revealedSegments.length === 0}
      <p class="empty">The glass is blank and fogged. Something is about to be written on it.</p>
    {:else}
      {#each $revealedSegments as segment, i}
        {#if segment.startsWith(INAUDIBLE_MARK)}
          <p class:latest={i === $revealedSegments.length - 1}><span class="fogged">[fogged over]</span></p>
        {:else}
          <p class:latest={i === $revealedSegments.length - 1}>{segment}</p>
        {/if}
      {/each}
    {/if}
  </div>
</section>

<style>
  .record { padding: 18px 26px; font-size: 19px; line-height: 1.5; }
  .head { margin: 0 0 6px; }
  .scroll { max-height: calc(1.5em * 5); overflow-y: auto; scrollbar-width: thin; }
  p { margin: 0 0 4px; }
  .empty { color: var(--wiped-faint); font-style: italic; }
  .latest { animation: clear 1.1s ease-out; }
  @keyframes clear { from { opacity: 0; filter: blur(5px); } to { opacity: 1; filter: none; } }
  @media (max-width: 520px) { .scroll { max-height: calc(1.5em * 3); } .record { font-size: 17px; padding: 14px 18px; } }
</style>
