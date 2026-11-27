<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { isPaused } from '$lib/stores/game';
  import Button from '../ui/Button.svelte';
  import Wipe from '../ui/Wipe.svelte';

  const dispatch = createEventDispatcher<{ resume: void; quit: void }>();
</script>

{#if $isPaused}
  <div class="veil" role="dialog" aria-modal="true" aria-labelledby="pause-title">
    <div class="mirror card">
      <p class="etch">Paused</p>
      <Wipe tag="h2" size="lg"><span id="pause-title">The water's off.</span></Wipe>
      <p class="body">The mirror holds still. So does he, one paw on the glass, waiting for you to come back.</p>
      <div class="actions">
        <Button on:click={() => dispatch('resume')}>Turn it back on</Button>
        <Button variant="secondary" on:click={() => dispatch('quit')}>Leave it for later</Button>
      </div>
      <p class="hint">Escape turns it back on. Leaving saves your place.</p>
    </div>
  </div>
{/if}

<style>
  .veil { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 16px; background: rgba(7, 16, 19, 0.7); backdrop-filter: blur(8px); }
  .card { max-width: 460px; width: 100%; text-align: center; }
  .body { margin: 10px 0 0; font-style: italic; color: var(--wiped-soft); line-height: 1.4; }
  .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 22px; }
  .hint { margin: 14px 0 0; font-family: var(--font-label); font-size: 12px; color: var(--wiped-soft); }
</style>
