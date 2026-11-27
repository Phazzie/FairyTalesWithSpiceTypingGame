<script lang="ts">
  import { shivaPosition } from '$lib/stores/game';
  import PhraseBubble from './PhraseBubble.svelte';
  import { TRACK_WIDTH, ESCAPE_THRESHOLD, START_POSITION } from '$lib/config';

  export let currentPhrase: string = '';
  export let typedSoFar: string = '';

  $: pct = ($shivaPosition / TRACK_WIDTH) * 100;
  // 0 near the candle, 1 when he's lost in the steam.
  $: danger = Math.min(1, Math.max(0, (START_POSITION - $shivaPosition) / (START_POSITION - ESCAPE_THRESHOLD)));
</script>

<div class="glass" style="--danger: {danger}">
  <div class="steam" aria-hidden="true"></div>
  <div class="candle" aria-hidden="true"><span class="flame"></span></div>
  <div class="trail" aria-hidden="true" style="left: {pct}%"></div>

  <div class="runner" style="left: {pct}%">
    {#if currentPhrase}
      <div class="bubble" style="transform: translateX(-{pct}%)">
        <PhraseBubble text={currentPhrase} typedSoFar={typedSoFar} tailPct={pct} />
      </div>
    {/if}
    <div class="wolf" role="img" aria-label="Shiva, slipping into the steam">🐺</div>
  </div>
</div>

<style>
  .glass {
    position: relative;
    height: 104px;
    margin-top: 104px;
    border-radius: 18px;
    background:
      var(--droplets),
      linear-gradient(90deg, rgba(214,223,224,0.18), rgba(214,223,224,0.06) 60%, rgba(244,178,106,0.12));
    background-size: 180px 220px, 100% 100%;
    border: 1px solid rgba(214,223,224,0.18);
    box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
  }
  /* The fog bank he's trying to vanish into. It swells as he gets closer. */
  .steam {
    position: absolute; inset: 0 auto 0 0; border-radius: 18px 0 0 18px;
    width: calc(14% + var(--danger) * 22%);
    background: linear-gradient(90deg, rgba(232,238,239,0.95), rgba(232,238,239,calc(0.4 + var(--danger) * 0.4)) 55%, transparent);
    filter: blur(6px);
    transition: width 0.4s ease;
    animation: billow 5s ease-in-out infinite alternate;
  }
  @keyframes billow { from { opacity: 0.85; } to { opacity: 1; } }
  .candle { position: absolute; right: 18px; bottom: 14px; width: 14px; height: 30px; border-radius: 3px; background: linear-gradient(#f3e6cf, #cdb894); }
  .flame { position: absolute; left: 50%; top: -16px; width: 10px; height: 16px; transform: translateX(-50%); border-radius: 50% 50% 50% 50% / 65% 65% 35% 35%;
    background: radial-gradient(circle at 50% 70%, #fff6d0, var(--candle) 60%, transparent 70%);
    box-shadow: 0 0 24px 10px var(--candle-glow); animation: flicker 1.8s ease-in-out infinite; }
  @keyframes flicker { 50% { transform: translateX(-50%) scale(0.92, 1.08); opacity: 0.9; } }
  /* The streak his paw leaves on the glass behind him. */
  .trail { position: absolute; top: 50%; right: 46px; height: 3px; transform: translateY(-50%); border-radius: 3px;
    background: linear-gradient(90deg, rgba(214,223,224,0.4), transparent); }
  .runner { position: absolute; top: 50%; transform: translate(-50%, -50%); z-index: 2; }
  .bubble { position: absolute; bottom: 58px; left: 50%; width: max-content; max-width: min(600px, 88vw); }
  .wolf { font-size: 40px; line-height: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6)) blur(calc(var(--danger) * 1.2px)); opacity: calc(1 - var(--danger) * 0.35); user-select: none; }
  @media (max-width: 520px) {
    .wolf { font-size: 34px; }
    .glass { margin-top: 96px; height: 88px; }
    .bubble { bottom: 50px; }
    .candle { right: 10px; }
  }
</style>
