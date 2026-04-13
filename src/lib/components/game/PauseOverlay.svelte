<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { isPaused } from '$lib/stores/game';
  import Button from '../ui/Button.svelte';

  const dispatch = createEventDispatcher<{ resume: void; quit: void }>();
</script>

{#if $isPaused}
  <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
    <div class="bg-slate-800 border border-purple-500/50 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
      <h2 class="text-2xl font-bold text-purple-400">Paused</h2>
      <p class="text-slate-400">Press Escape or click Resume to continue</p>
      <div class="flex gap-4 justify-center">
        <Button variant="primary" on:click={() => dispatch('resume')}>Resume</Button>
        <Button variant="secondary" on:click={() => dispatch('quit')}>Quit to Menu</Button>
      </div>
    </div>
  </div>
{/if}
