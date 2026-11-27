<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { isPaused } from '$lib/stores/game';
  import Button from '../ui/Button.svelte';
  import Stamp from '../ui/Stamp.svelte';

  const dispatch = createEventDispatcher<{ resume: void; quit: void }>();
</script>

{#if $isPaused}
  <div class="veil" role="dialog" aria-modal="true" aria-labelledby="recess-title">
    <div class="paper card">
      <div class="right-rule"></div>
      <Stamp tone="ink" rotate={-3} size="lg">Recess</Stamp>
      <h2 id="recess-title" class="font-court">The court is in recess.</h2>
      <p>The defendant is being watched by the bailiff. He is not moving. Neither is the clock.</p>
      <div class="actions">
        <Button on:click={() => dispatch('resume')}>Reconvene</Button>
        <Button variant="secondary" on:click={() => dispatch('quit')}>Adjourn &amp; save</Button>
      </div>
      <p class="hint">Escape also reconvenes.</p>
    </div>
  </div>
{/if}

<style>
  .veil { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 16px; background: rgba(20, 14, 10, 0.78); backdrop-filter: blur(2px); }
  .card { max-width: 440px; width: 100%; text-align: left; }
  h2 { font-size: 24px; margin: 18px 0 4px; }
  p { margin: 0; }
  .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
  .hint { margin-top: 10px; font-size: 12px; color: var(--ink-soft); }
</style>
