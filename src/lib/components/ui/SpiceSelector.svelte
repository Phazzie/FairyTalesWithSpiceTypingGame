<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let value: number = 3;

  const dispatch = createEventDispatcher<{ change: number }>();

  function select(level: number) {
    value = level;
    dispatch('change', level);
  }
</script>

<div class="flex gap-2 items-center">
  {#each [1, 2, 3, 4, 5] as level}
    <button
      type="button"
      class="text-2xl transition-transform hover:scale-125 {level <= value ? 'opacity-100' : 'opacity-30'}"
      on:click={() => select(level)}
      title="Spice level {level}"
    >
      🌶️
    </button>
  {/each}
  <span class="text-slate-400 text-sm ml-2">
    {['', 'Very Mild', 'Mild', 'Moderate', 'Spicy', 'Very Spicy'][value]}
  </span>
</div>
