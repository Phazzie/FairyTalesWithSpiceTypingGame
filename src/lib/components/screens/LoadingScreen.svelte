<script lang="ts">
  import { onDestroy } from 'svelte';
  import { loadingMessage, phase } from '$lib/stores/app';

  const phaseMessages: Record<string, string> = {
    GENERATING: 'Running the water',
    GRADING: 'Waiting for the glass to fog',
    EXTRACTING: 'Breathing on the mirror',
  };

  // Things you'd notice while the room steams up (writing the story takes a while).
  const asides = [
    'Somewhere in the house, a door clicks shut.',
    'The towel slips off the hook. Nobody picks it up.',
    'The candle leans toward the door, like it heard something.',
    'There are pawprints on the bathmat. They were not there before.',
    'The mirror is clouding from the corners in. Someone is breathing on the other side.',
    'Shiva says he is just here to check the pipes. He is not a plumber. He is a wolf.',
  ];
  let i = Math.floor(Math.random() * asides.length);
  const timer = setInterval(() => (i = (i + 1) % asides.length), 3600);
  onDestroy(() => clearInterval(timer));

  $: displayMessage = $loadingMessage || phaseMessages[$phase] || 'Running the water';
</script>

<div class="room">
  <div class="mirror card" role="status" aria-live="polite">
    <div class="fogging" aria-hidden="true"></div>
    <p class="etch">Steam</p>
    <h2 class="wipe msg">{displayMessage}<span class="dots"><span>.</span><span>.</span><span>.</span></span></h2>
    {#key i}<p class="aside">{asides[i]}</p>{/key}
    <p class="etch wait">Usually under a minute</p>
  </div>
  <div class="drops" aria-hidden="true">
    {#each Array(9) as _, n}<span style="--x: {8 + n * 11}%; --d: {n * 0.7}s; --t: {3 + (n % 4)}s"></span>{/each}
  </div>
</div>

<style>
  .room { min-height: 100vh; display: grid; place-items: center; padding: 16px; position: relative; overflow: hidden; }
  .card { width: min(540px, 100%); text-align: center; overflow: hidden; }
  /* The fog rolling in from the edges of the glass. */
  .fogging { position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 30%, rgba(255,255,255,0.75) 80%);
    animation: roll 4s ease-in-out infinite alternate; }
  @keyframes roll { from { opacity: 0.3; transform: scale(1.1); } to { opacity: 1; transform: scale(1); } }
  .msg { position: relative; font-size: clamp(30px, 7vw, 42px); font-weight: 400; margin: 10px 0 12px; }
  .aside { position: relative; margin: 0 auto; max-width: 36ch; min-height: 3em; color: var(--wiped-soft); font-style: italic; font-size: 19px; line-height: 1.4; animation: clear 0.9s ease; }
  .wait { position: relative; margin: 14px 0 0; color: var(--wiped-faint); }
  .dots span { animation: blink 1.4s infinite; }
  .dots span:nth-child(2) { animation-delay: 0.25s; }
  .dots span:nth-child(3) { animation-delay: 0.5s; }
  @keyframes blink { 0%, 60%, 100% { opacity: 0.15; } 30% { opacity: 1; } }
  @keyframes clear { from { opacity: 0; filter: blur(6px); } to { opacity: 1; filter: none; } }
  /* Droplets running down the tile. */
  .drops span { position: absolute; top: -20px; left: var(--x); width: 3px; height: 14px; border-radius: 3px;
    background: linear-gradient(transparent, rgba(214,223,224,0.5)); animation: run var(--t) linear var(--d) infinite; }
  @keyframes run { to { transform: translateY(110vh); } }
  @media (prefers-reduced-motion: reduce) { .dots span, .fogging, .drops span { animation: none; } }
</style>
