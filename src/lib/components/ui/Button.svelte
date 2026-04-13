<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'danger' = 'primary';
  export let disabled = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';

  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-500 text-white disabled:bg-slate-600',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 disabled:bg-slate-700',
    danger: 'bg-red-600 hover:bg-red-500 text-white disabled:bg-slate-600',
  };
</script>

<button
  {type}
  {disabled}
  class="px-4 py-2 rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 {variants[variant]}"
  on:click
>
  <slot />
</button>
