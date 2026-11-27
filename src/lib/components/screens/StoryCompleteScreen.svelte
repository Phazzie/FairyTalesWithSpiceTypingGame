<script lang="ts">
  import { story, transitionTo } from '$lib/stores/app';
  import { score, bestCombo, chapterStats, transcript } from '$lib/stores/game';
  import { clearGame } from '$lib/utils/storage';
  import { verdictFor } from '$lib/utils/transcript';
  import { heat, NIGHT_WORDS } from '$lib/steam';
  import Button from '../ui/Button.svelte';
  import Wipe from '../ui/Wipe.svelte';
  import Transcript from '../game/Transcript.svelte';
  import { onMount } from 'svelte';

  onMount(() => clearGame());

  $: totalCaught = $chapterStats.reduce((sum, s) => sum + s.caught, 0);
  $: totalPhrases = $chapterStats.reduce((sum, s) => sum + s.total, 0);
  $: accuracy = totalPhrases > 0 ? Math.round((totalCaught / totalPhrases) * 100) : 0;
  $: verdict = verdictFor(accuracy);

  function missedFor(n: number) {
    return $transcript.find(r => r.chapter === n)?.missedSegments ?? [];
  }

  function startNew() {
    clearGame();
    transitionTo('START');
  }
</script>

<div class="wrap">
  <article class="mirror sheet">
    <section class="verdict" aria-labelledby="verdict-title">
      <h1 id="verdict-title" class="sr-only">Your Story is Complete!</h1>
      <p class="etch">Three nights later, the mirror is</p>
      <div class="ruling"><Wipe tag="p" size="xl">{verdict.ruling}</Wipe></div>
      <p class="detail">{verdict.detail}</p>
    </section>

    <dl class="tally" aria-label="Your nights">
      <div><dt>Heat</dt><dd>{heat($score)}</dd></div>
      <div><dt>Still readable</dt><dd>{accuracy}%</dd></div>
      <div><dt>Longest streak</dt><dd>{$bestCombo}</dd></div>
    </dl>

    {#if $story}
      <p class="cast">
        <span class="wipe">{$story.metadata.characterNames.protagonist}</span>
        <span class="amp">&amp;</span>
        <span class="wipe">{$story.metadata.characterNames.alpha}</span>
      </p>
      <p class="arc">{$story.metadata.storyArc}</p>

      {#each $story.chapters as chapter}
        <section class="night">
          <p class="etch">Night {NIGHT_WORDS[chapter.number]}</p>
          <h2 class="wipe">{chapter.title}</h2>
          <h3 class="sr-only">Chapter {chapter.number}: {chapter.title}</h3>
          <Transcript prose={chapter.prose} missedSegments={missedFor(chapter.number)} />
          {#if chapter.cliffhanger}
            <p class="cliff">"{chapter.cliffhanger}"</p>
          {/if}
        </section>
      {/each}
    {/if}

    <p class="signoff">Whatever you see marked <span class="fogged">[fogged over]</span> is gone. The steam keeps its secrets.</p>

    <div class="actions no-print">
      <Button variant="secondary" on:click={() => window.print()}>Print what's left</Button>
      <Button on:click={startNew}>Run another shower</Button>
    </div>
  </article>
</div>

<style>
  .wrap { max-width: 760px; margin: 0 auto; padding: 36px 16px 48px; }
  .verdict { text-align: center; margin: 6px 0 26px; }
  .verdict .etch { margin: 0; }
  .ruling { margin: 6px 0 8px; color: var(--rose); }
  .ruling :global(.wipe) { color: var(--rose); text-shadow: 0 0 1px rgba(194,83,107,0.5), 0 0 10px rgba(255,255,255,0.8); }
  .detail { margin: 0 auto; max-width: 30em; font-size: 20px; font-style: italic; line-height: 1.4; }
  .tally { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 0 0 30px; }
  .tally div { text-align: center; padding: 12px 6px; border-radius: 14px; background: rgba(255,255,255,0.35); }
  dt { font-family: var(--font-label); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--wiped-soft); }
  dd { margin: 4px 0 0; font-family: var(--font-finger); font-size: 30px; line-height: 1; font-variant-numeric: tabular-nums; }
  .cast { text-align: center; margin: 0; font-size: 30px; }
  .amp { font-style: italic; color: var(--rose); margin: 0 8px; }
  .arc { text-align: center; margin: 8px auto 0; max-width: 34em; font-style: italic; color: var(--wiped-soft); }
  .night { margin-top: 34px; padding-top: 24px; border-top: 1px solid rgba(19,35,42,0.15); }
  .night .etch { margin: 0; color: var(--rose); }
  .night h2 { margin: 2px 0 14px; font-size: 30px; font-weight: 400; line-height: 1.15; }
  .cliff { margin: 18px 0 0; text-align: center; font-style: italic; color: var(--wiped-soft); }
  .signoff { margin: 34px 0 0; text-align: center; font-style: italic; color: var(--wiped-soft); }
  .actions { margin-top: 26px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
