<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'desk' = 'primary';
  export let disabled = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  let className = '';
  export { className as class };

  const variants = { primary: '', secondary: 'btn-ghost', desk: 'btn-desk' };
</script>

<button {type} {disabled} class="btn {variants[variant]} {className}" on:click>
  <slot />
</button>
