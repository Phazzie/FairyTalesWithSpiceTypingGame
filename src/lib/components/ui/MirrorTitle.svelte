<script lang="ts">
  import Wipe from './Wipe.svelte';
  /** What's written on the glass above everything else. */
  export let line: string;
  export let compact = false;
</script>

<header class="title" class:compact>
  {#if !compact}
    <p class="etch brand">Skeptical Wombat · after dark</p>
    <div class="word">
      <Wipe tag="h1" size="xl">Steam</Wipe>
      <span class="drip d1" aria-hidden="true"></span><span class="drip d2" aria-hidden="true"></span><span class="drip d3" aria-hidden="true"></span>
    </div>
    <svg class="heart" viewBox="0 0 120 110" aria-hidden="true">
      <path d="M60 100 C 20 70, 4 48, 14 26 C 24 6, 50 8, 60 30 C 70 8, 96 6, 106 26 C 116 48, 100 70, 60 100 Z" />
      <text x="60" y="58" text-anchor="middle">S + you</text>
    </svg>
    <p class="sub">A werewolf romance in three nights, written in the fog on your bathroom mirror.</p>
  {/if}
  <p class="etch line">{line}</p>
</header>

<style>
  .title { text-align: center; position: relative; }
  .word { position: relative; display: inline-block; }
  /* Water running down from the letters, the way it does on a real mirror. */
  .drip { position: absolute; top: 78%; width: 3px; border-radius: 3px; background: linear-gradient(rgba(19,35,42,0.5), rgba(19,35,42,0.05)); height: 0; animation: run 2.6s ease-in 1.2s forwards; }
  .drip::after { content: ""; position: absolute; bottom: -3px; left: -1.5px; width: 6px; height: 7px; border-radius: 50%; background: rgba(19,35,42,0.35); }
  .d1 { left: 14%; --h: 46px; }
  .d2 { left: 52%; --h: 70px; animation-delay: 1.8s; }
  .d3 { left: 88%; --h: 32px; animation-delay: 2.4s; }
  @keyframes run { to { height: var(--h); } }
  /* A heart someone drew in the fog before you got here. */
  .heart { position: absolute; top: -6px; right: -4px; width: 96px; transform: rotate(9deg); opacity: 0.55; }
  .heart path { fill: none; stroke: var(--rose); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 330; stroke-dashoffset: 330; animation: trace 1.6s ease 0.6s forwards; }
  .heart text { font-family: var(--font-finger); font-size: 17px; fill: var(--rose); opacity: 0; animation: show 0.6s ease 2.1s forwards; }
  @keyframes trace { to { stroke-dashoffset: 0; } }
  @keyframes show { to { opacity: 1; } }
  @media (max-width: 520px) { .heart { width: 58px; top: 36px; right: -6px; } }
  .brand { margin: 0 0 4px; }
  .sub { margin: 4px auto 0; max-width: 32ch; font-style: italic; font-size: 19px; color: var(--wiped-soft); line-height: 1.35; }
  .line { margin: 18px 0 0; color: var(--rose); }
  .compact .line { margin: 0; }
</style>
