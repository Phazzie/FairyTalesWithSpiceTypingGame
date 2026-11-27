<script lang="ts">
  import { onDestroy } from 'svelte';
  import { loadingMessage, phase } from '$lib/stores/app';

  const phaseMessages: Record<string, string> = {
    GENERATING: 'The witness is being sworn in',
    GRADING: 'The jury is reviewing the testimony',
    EXTRACTING: 'The clerk is cutting the stenograph tape',
  };

  // Courtroom asides while the story is written (it can take a while).
  const asides = [
    'Please silence all phones and howling.',
    'The bailiff has confiscated one (1) silver bullet from the gallery.',
    'The witness swears to tell the truth, the whole truth, and the steamy parts.',
    'Counsel for the pack has requested the blinds be closed. The moon objects.',
    'The jury has been instructed to disregard their own blushing.',
    'Shiva has been read his rights. He did not listen. He is a wolf.',
  ];
  let i = Math.floor(Math.random() * asides.length);
  const timer = setInterval(() => (i = (i + 1) % asides.length), 3200);
  onDestroy(() => clearInterval(timer));

  $: displayMessage = $loadingMessage || phaseMessages[$phase] || 'All rise';
</script>

<div class="hall">
  <div class="paper card" role="status" aria-live="polite">
    <div class="right-rule"></div>
    <div class="rise font-court">All rise.</div>
    <svg class="gavel" viewBox="0 0 120 84" aria-hidden="true">
      <rect x="8" y="68" width="64" height="11" rx="2" fill="#5a4331" />
      <rect x="14" y="62" width="52" height="7" rx="2" fill="#6d5038" />
      <g class="swing">
        <rect x="50" y="33" width="58" height="7" rx="3" fill="#6d5038" />
        <rect x="18" y="20" width="44" height="30" rx="5" fill="#3a2b1f" />
        <rect x="18" y="27" width="44" height="4" fill="#c9a25a" />
        <rect x="18" y="39" width="44" height="4" fill="#c9a25a" />
      </g>
    </svg>
    <h2>{displayMessage}<span class="dots"><span>.</span><span>.</span><span>.</span></span></h2>
    {#key i}<p class="aside">{asides[i]}</p>{/key}
  </div>
</div>

<style>
  .hall { min-height: 100vh; display: grid; place-items: center; padding: 16px; }
  .card { width: min(520px, 100%); text-align: center; }
  .rise { font-size: clamp(36px, 8vw, 56px); font-weight: 700; letter-spacing: 0.02em; }
  h2 { font-size: 17px; margin: 10px 0 6px; font-weight: 700; }
  .aside { margin: 0; min-height: calc(var(--line) * 2); color: var(--ink-soft); font-style: italic; animation: fade 0.5s ease; }
  .dots span { animation: blink 1.2s infinite; }
  .dots span:nth-child(2) { animation-delay: 0.2s; }
  .dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink { 0%, 60%, 100% { opacity: 0.15; } 30% { opacity: 1; } }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  .gavel { display: block; width: 132px; height: 92px; margin: 10px auto 0; }
  .swing { transform-box: view-box; transform-origin: 106px 36px; animation: bang 1.2s infinite cubic-bezier(.6,0,.4,1); }
  @keyframes bang { 0%, 100% { transform: rotate(30deg); } 42% { transform: rotate(-17deg); } 50% { transform: rotate(-14deg); } 58% { transform: rotate(-17deg); } }
  @media (prefers-reduced-motion: reduce) { .swing, .dots span { animation: none; } }
</style>
