<script lang="ts">
  /** A rubber stamp: double border, uneven ink, slightly crooked. */
  export let tone: 'red' | 'blue' | 'ink' = 'red';
  export let rotate = -6;
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  let className = '';
  export { className as class };
</script>

<span class="stamp {tone} {size} {className}" style="--rot: {rotate}deg">
  <slot />
</span>

<style>
  .stamp {
    display: inline-block;
    transform: rotate(var(--rot));
    font-family: var(--font-steno);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    line-height: 1.05;
    text-align: center;
    padding: 0.35em 0.6em 0.3em;
    border: 0.16em double currentColor;
    border-radius: 0.18em;
    mix-blend-mode: multiply;
    /* Uneven ink: punch speckles out of the stamp. */
    -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.75'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>");
    mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.75'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>");
    white-space: nowrap;
  }
  .red { color: var(--stamp-red); }
  .blue { color: var(--stamp-blue); }
  .ink { color: var(--ink); }
  .sm { font-size: 11px; }
  .md { font-size: 15px; }
  .lg { font-size: 26px; }
  .xl { font-size: clamp(34px, 9vw, 64px); }
</style>
