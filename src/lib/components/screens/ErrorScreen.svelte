<script lang="ts">
  import { errorMessage, transitionTo } from '$lib/stores/app';
  import Button from '../ui/Button.svelte';

  function retry() {
    transitionTo('START');
  }

  function startOver() {
    errorMessage.set('');
    transitionTo('START');
  }
</script>

<div class="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
  <div class="text-center space-y-4 max-w-md">
    <div class="text-6xl">🌑</div>
    <h2 class="text-2xl font-bold text-red-400">Something went wrong</h2>
    {#if $errorMessage}
      <p class="text-slate-400 bg-slate-800 rounded-lg p-3 text-sm font-mono">{$errorMessage}</p>
    {:else}
      <p class="text-slate-400">An unexpected error occurred. The wolves howl in confusion.</p>
    {/if}
    <div class="flex gap-4 justify-center">
      <Button variant="primary" on:click={retry}>Try Again</Button>
      <Button variant="secondary" on:click={startOver}>Start Over</Button>
    </div>
  </div>
</div>
