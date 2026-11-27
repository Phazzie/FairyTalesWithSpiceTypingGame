<script lang="ts">
  /** The next line, half-showing through the fog. Type it to wipe it clear. */
  export let text: string = '';
  export let typedSoFar: string = '';
  /** Where the drip falls from, as a percent of the bubble width. */
  export let tailPct: number = 50;

  $: chars = text.split('');
  $: typedChars = typedSoFar.split('');
</script>

<div class="pane">
  <div class="line" data-testid="phrase">{#each chars as char, i}{#if i < typedChars.length}<span class={typedChars[i].toLowerCase() === char.toLowerCase() ? 'ok' : 'bad'}>{char}</span>{:else if i === typedChars.length}<span class="next">{char}</span>{:else}<span class="todo">{char}</span>{/if}{/each}</div>
  <div class="drip" style="left: clamp(18px, {tailPct}%, calc(100% - 18px))"></div>
</div>

<style>
  .pane {
    position: relative;
    color: var(--wiped);
    padding: 10px 20px 11px;
    border-radius: 16px;
    background-color: var(--fog);
    background-image: var(--droplets), var(--fog-noise);
    background-size: 180px 220px, 240px 240px;
    box-shadow: 0 0 0 2px rgba(255,255,255,0.35), 0 10px 24px -8px rgba(0,0,0,0.7), 0 0 30px -4px var(--candle-glow);
  }
  .line { font-family: var(--font-prose); font-weight: 600; font-size: 23px; line-height: 1.3; white-space: pre-wrap; }
  /* Wiped: crisp and dark. Not yet: still under the steam. */
  .ok { color: var(--wiped); }
  .bad { color: #fff; background: var(--rose); border-radius: 3px; }
  .next { color: var(--wiped); box-shadow: inset 0 -3px 0 var(--candle); }
  .todo { color: var(--wiped-faint); filter: blur(0.6px); }
  .drip { position: absolute; bottom: -12px; width: 8px; height: 14px; transform: translateX(-50%); border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%; background: var(--fog); }
</style>
