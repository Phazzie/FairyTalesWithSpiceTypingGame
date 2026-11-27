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

<section class="paper record" aria-label="The record so far">
  <div class="right-rule"></div>
  <div class="head">THE RECORD, AS TAKEN</div>
  <div bind:this={panel} data-testid="story-panel" class="scroll">
    {#if $revealedSegments.length === 0}
      <p class="empty">Nothing is on the record yet. The witness is about to speak.</p>
    {:else}
      {#each $revealedSegments as segment, i}
        {#if segment.startsWith(INAUDIBLE_MARK)}
          <p class:latest={i === $revealedSegments.length - 1}><span class="inaudible">[INAUDIBLE]</span></p>
        {:else}
          <p class:latest={i === $revealedSegments.length - 1}>{segment}</p>
        {/if}
      {/each}
    {/if}
  </div>
</section>

<style>
  .record { padding-top: 14px; padding-bottom: 14px; font-size: 15px; }
  .record::before { top: 14px; }
  .head { font-size: 11px; letter-spacing: 0.16em; color: var(--ink-soft); margin-bottom: 2px; }
  .scroll { max-height: calc(var(--line) * 5); overflow-y: auto; scrollbar-width: thin; }
  p { margin: 0; }
  .empty { color: var(--ink-faint); font-style: italic; }
  .latest { animation: ink 0.6s ease-out; background: linear-gradient(to top, var(--highlight) 0 45%, transparent 45%); }
  @keyframes ink { from { opacity: 0; filter: blur(2px); } to { opacity: 1; filter: none; } }
</style>
