<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { THEMES } from '$lib/config';
  export let selected: string[] = [];
  const MAX_THEMES = 3;

  const dispatch = createEventDispatcher<{ change: string[] }>();

  function toggle(theme: string) {
    if (selected.includes(theme)) {
      selected = selected.filter(t => t !== theme);
    } else if (selected.length < MAX_THEMES) {
      selected = [...selected, theme];
    }
    dispatch('change', selected);
  }
</script>

<div class="grid grid-cols-3 gap-2">
  {#each THEMES as theme}
    <button
      type="button"
      class="px-2 py-1.5 rounded-lg text-sm text-center transition-colors {selected.includes(theme)
        ? 'bg-purple-600 text-white border border-purple-400'
        : selected.length >= MAX_THEMES
        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
      on:click={() => toggle(theme)}
      disabled={!selected.includes(theme) && selected.length >= MAX_THEMES}
    >
      {theme}
    </button>
  {/each}
</div>
<p class="text-slate-400 text-sm mt-2">
  Select exactly 3 themes ({selected.length}/3 selected)
</p>
