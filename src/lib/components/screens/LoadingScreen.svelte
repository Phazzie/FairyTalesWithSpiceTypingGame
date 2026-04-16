<script lang="ts">
  import { loadingMessage, phase } from '$lib/stores/app';

  const phaseMessages: Record<string, string> = {
    GENERATING: 'Writing your story...',
    GRADING: 'Ensuring story quality...',
    EXTRACTING: 'Preparing typing phrases...',
  };

  $: displayMessage = $loadingMessage || phaseMessages[$phase] || 'Loading...';
</script>

<div class="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
  <!-- Spinning wolf -->
  <div class="text-7xl animate-spin" style="animation-duration: 2s">🐺</div>

  <!-- Message -->
  <div class="text-center space-y-2">
    <h2 class="text-2xl font-bold text-purple-400">{displayMessage}</h2>
    <p class="text-slate-500 text-sm">The moon is writing your fate...</p>
  </div>

  <!-- Dots animation -->
  <div class="flex gap-2">
    {#each [0, 1, 2] as i}
      <div
        class="w-3 h-3 rounded-full bg-purple-500 animate-bounce"
        style="animation-delay: {i * 0.2}s"
      ></div>
    {/each}
  </div>
</div>
