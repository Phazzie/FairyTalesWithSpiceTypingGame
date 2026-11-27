<script lang="ts">
  /** The line of testimony, printed on a strip of stenograph tape. */
  export let text: string = '';
  export let typedSoFar: string = '';
  /** Horizontal position of the tear notch, as a percent of the tape width. */
  export let tailPct: number = 50;

  $: chars = text.split('');
  $: typedChars = typedSoFar.split('');
</script>

<div class="tape">
  <div class="line" data-testid="phrase">{#each chars as char, i}{#if i < typedChars.length}<span class={typedChars[i].toLowerCase() === char.toLowerCase() ? 'ok' : 'bad'}>{char}</span>{:else if i === typedChars.length}<span class="next">{char}</span>{:else}<span class="todo">{char}</span>{/if}{/each}</div>
  <div class="notch" style="left: clamp(14px, {tailPct}%, calc(100% - 14px))"></div>
</div>

<style>
  .tape {
    position: relative;
    background: #fbf8ee;
    color: var(--ink);
    padding: 9px 18px 8px;
    box-shadow: 0 6px 14px -6px rgba(0,0,0,0.6);
    /* Sprocket holes along both edges. */
    background-image:
      radial-gradient(circle at 6px 50%, var(--desk-2) 2.2px, transparent 2.6px),
      radial-gradient(circle at calc(100% - 6px) 50%, var(--desk-2) 2.2px, transparent 2.6px);
    background-size: 100% 9px;
    background-repeat: repeat-y;
  }
  .line { font-family: var(--font-steno); font-size: 19px; line-height: 1.3; letter-spacing: 0.02em; white-space: pre-wrap; }
  .ok { color: var(--ink); }
  .bad { color: #fff; background: var(--stamp-red); }
  .next { background: var(--highlight); box-shadow: inset 0 -2px 0 var(--ink); }
  .todo { color: var(--ink-faint); }
  .notch { position: absolute; bottom: -7px; width: 14px; height: 14px; background: #fbf8ee; transform: translateX(-50%) rotate(45deg); }
</style>
