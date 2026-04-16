<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { SPEEDS } from '$lib/config';
  export let value: string = 'normal';

  const dispatch = createEventDispatcher<{ change: string }>();

  function select(speed: string) {
    value = speed;
    dispatch('change', speed);
  }
</script>

<div class="flex gap-2 flex-wrap">
  {#each Object.entries(SPEEDS) as [key, config]}
    <button
      type="button"
      class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors {value === key
        ? 'bg-purple-600 text-white'
        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
      on:click={() => select(key)}
    >
      {config.label}
    </button>
  {/each}
</div>
