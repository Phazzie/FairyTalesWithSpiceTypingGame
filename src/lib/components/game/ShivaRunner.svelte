<script lang="ts">
  import { shivaPosition } from '$lib/stores/game';
  import PhraseBubble from './PhraseBubble.svelte';
  import { TRACK_WIDTH, ESCAPE_THRESHOLD, START_POSITION } from '$lib/config';

  export let currentPhrase: string = '';
  export let typedSoFar: string = '';

  $: pct = ($shivaPosition / TRACK_WIDTH) * 100;
  // 0 at the witness stand, 1 at the door.
  $: danger = Math.min(1, Math.max(0, (START_POSITION - $shivaPosition) / (START_POSITION - ESCAPE_THRESHOLD)));
</script>

<div class="aisle" style="--danger: {danger}">
  <div class="door" aria-hidden="true">
    <span class="exit">EXIT</span>
    <span class="leaf"></span>
  </div>
  <div class="stand" aria-hidden="true">WITNESS<br />STAND</div>
  <div class="floor" aria-hidden="true"></div>

  <div class="runner" style="left: {pct}%">
    {#if currentPhrase}
      <div class="bubble" style="transform: translateX(-{pct}%)">
        <PhraseBubble text={currentPhrase} typedSoFar={typedSoFar} tailPct={pct} />
      </div>
    {/if}
    <div class="wolf" role="img" aria-label="Shiva, the defendant">🐺</div>
  </div>
</div>

<style>
  .aisle {
    position: relative;
    height: 104px;
    margin-top: 92px;
    background:
      linear-gradient(to bottom, transparent 62%, rgba(0,0,0,0.25) 62% 64%, transparent 64%),
      repeating-linear-gradient(90deg, #5a4331 0 46px, #4e3a2a 46px 48px);
    border-top: 6px solid #6d5038;
    border-bottom: 6px solid #3a2b1f;
    box-shadow: inset 0 10px 18px -8px rgba(0,0,0,0.6);
  }
  /* The rail of the bar, balusters. */
  .floor {
    position: absolute; left: 0; right: 0; top: 0; height: 40px;
    background: repeating-linear-gradient(90deg, rgba(0,0,0,0.0) 0 22px, rgba(0,0,0,0.22) 22px 26px);
    opacity: 0.6;
  }
  .door { position: absolute; left: 8px; top: 8px; bottom: 8px; width: 54px; background: #2a1f17; border: 3px solid #1a130e; }
  .door .leaf { position: absolute; inset: 4px; background: linear-gradient(90deg, #3a2a1e, #2a1f17); }
  .door .leaf::after { content: ""; position: absolute; right: 6px; top: 50%; width: 6px; height: 6px; border-radius: 50%; background: #c9a25a; }
  .exit {
    position: absolute; top: -26px; left: 50%; transform: translateX(-50%);
    font-family: var(--font-steno); font-weight: 700; font-size: 12px; letter-spacing: 0.14em;
    color: #ffdede; background: #7d1015; padding: 1px 6px; border: 1px solid #3a0508;
    text-shadow: 0 0 calc(4px + var(--danger) * 10px) rgba(255, 60, 60, calc(0.4 + var(--danger) * 0.6));
    box-shadow: 0 0 calc(var(--danger) * 18px) rgba(255, 40, 40, calc(var(--danger) * 0.8));
  }
  .stand {
    position: absolute; right: 8px; top: 12px; bottom: 12px; width: 66px;
    display: grid; place-items: center; text-align: center;
    font-family: var(--font-steno); font-size: 10px; letter-spacing: 0.12em; line-height: 1.3; font-weight: 700;
    color: #e9dcc2; background: #6d5038; border: 2px solid #3a2b1f;
  }
  .runner { position: absolute; top: 50%; transform: translate(-50%, -50%); z-index: 2; }
  .bubble { position: absolute; bottom: 58px; left: 50%; width: max-content; max-width: min(560px, 86vw); }
  .wolf { font-size: 40px; line-height: 1; transform: scaleX(1); filter: drop-shadow(0 4px 3px rgba(0,0,0,0.6)); user-select: none; }
  @media (max-width: 520px) {
    .door { width: 40px; }
    .stand { width: 50px; font-size: 8px; }
    .wolf { font-size: 34px; }
    .aisle { margin-top: 84px; height: 88px; }
    .bubble { bottom: 50px; }
  }
</style>
