<script lang="ts">
  import { shivaPosition } from '$lib/stores/game';
  import PhraseBubble from './PhraseBubble.svelte';
  import { TRACK_WIDTH } from '$lib/config';

  export let currentPhrase: string = '';
  export let typedSoFar: string = '';

  $: pct = ($shivaPosition / TRACK_WIDTH) * 100;
</script>

<div class="relative w-full h-24 bg-slate-700 rounded-full overflow-visible my-4">
  <!-- Track line -->
  <div class="absolute inset-y-0 left-4 right-4 flex items-center">
    <div class="w-full h-1 bg-slate-600 rounded"></div>
  </div>

  <!-- Escape zone marker -->
  <div class="absolute left-4 top-0 bottom-0 flex items-center">
    <div class="w-0.5 h-12 bg-red-500/60 rounded"></div>
    <span class="text-red-400 text-xs ml-1 -mt-8">ESCAPE!</span>
  </div>

  <!-- Shiva character -->
  <div
    class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-none"
    style="left: {pct}%"
  >
    <!-- Phrase bubble above -->
    {#if currentPhrase}
      <div class="absolute bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
        <PhraseBubble text={currentPhrase} typedSoFar={typedSoFar} />
      </div>
    {/if}

    <!-- Wolf character emoji -->
    <div class="text-3xl select-none" style="filter: drop-shadow(0 0 8px rgba(168,85,247,0.6))">
      🐺
    </div>
  </div>
</div>
