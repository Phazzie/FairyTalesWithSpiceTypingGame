<script lang="ts">
  /** Words wiped through the steam with a fingertip; they draw on left to right. */
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let tag: 'span' | 'h1' | 'h2' | 'p' = 'span';
  export let delay = 0;
  let className = '';
  export { className as class };
</script>

<svelte:element this={tag} class="wipe wiped {size} {className}" style="--d: {delay}ms">
  <slot />
</svelte:element>

<style>
  .wiped {
    display: inline-block;
    margin: 0;
    font-weight: 400;
    line-height: 1.15;
    clip-path: inset(-20% 100% -20% 0);
    animation: draw 1.1s cubic-bezier(.55,.1,.3,1) var(--d) forwards;
  }
  @keyframes draw { to { clip-path: inset(-20% -2% -20% 0); } }
  .sm { font-size: 20px; }
  .md { font-size: 28px; }
  .lg { font-size: clamp(32px, 7vw, 46px); }
  .xl { font-size: clamp(44px, 12vw, 84px); }
</style>
