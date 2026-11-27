<script lang="ts">
  import { story, transitionTo } from '$lib/stores/app';
  import { score, bestCombo, chapterStats, transcript } from '$lib/stores/game';
  import { clearGame } from '$lib/utils/storage';
  import { verdictFor } from '$lib/utils/transcript';
  import { courtDate, fee, DAY_WORDS } from '$lib/court';
  import Button from '../ui/Button.svelte';
  import Stamp from '../ui/Stamp.svelte';
  import CourtCaption from '../ui/CourtCaption.svelte';
  import Transcript from '../game/Transcript.svelte';
  import { onMount } from 'svelte';

  onMount(() => clearGame());

  $: totalCaught = $chapterStats.reduce((sum, s) => sum + s.caught, 0);
  $: totalPhrases = $chapterStats.reduce((sum, s) => sum + s.total, 0);
  $: accuracy = totalPhrases > 0 ? Math.round((totalCaught / totalPhrases) * 100) : 0;
  $: verdict = verdictFor(accuracy);
  const today = courtDate();

  function missedFor(n: number) {
    return $transcript.find(r => r.chapter === n)?.missedSegments ?? [];
  }

  function startNew() {
    clearGame();
    transitionTo('START');
  }
</script>

<div class="wrap">
  <article class="paper sheet">
    <div class="right-rule"></div>
    <CourtCaption title="Reporter's certified transcript of proceedings, Days One through Three" />

    <section class="verdict" aria-labelledby="verdict-title">
      <p class="label">The jury, having heard the record as taken, finds the defendant</p>
      <div class="ruling">
        <Stamp tone={verdict.ruling === 'GUILTY' ? 'red' : 'ink'} rotate={-5} size="xl">{verdict.ruling}</Stamp>
      </div>
      <p class="detail">{verdict.detail}</p>
      <h1 id="verdict-title" class="sr-only">Your Story is Complete!</h1>
    </section>

    <table class="tally">
      <tbody>
        <tr><th scope="row">Reporter's fee</th><td>{fee($score)}</td></tr>
        <tr><th scope="row">Accuracy of the record</th><td><strong>{accuracy}%</strong></td></tr>
        <tr><th scope="row">Longest unbroken run</th><td>{$bestCombo} lines</td></tr>
      </tbody>
    </table>

    {#if $story}
      <h2 class="section font-court">Appearances</h2>
      <p class="appear">For the heart: <strong>{$story.metadata.characterNames.protagonist}</strong>. For the pack: <strong>{$story.metadata.characterNames.alpha}</strong>, Alpha.</p>
      <p class="appear"><span class="who">STATEMENT OF THE CASE:</span> {$story.metadata.storyArc}</p>

      {#each $story.chapters as chapter}
        <h2 class="section font-court">Day {DAY_WORDS[chapter.number]}: {chapter.title}</h2>
        <h3 class="sr-only">Chapter {chapter.number}: {chapter.title}</h3>
        <Transcript prose={chapter.prose} missedSegments={missedFor(chapter.number)} />
        {#if chapter.cliffhanger}
          <p class="cliff"><em>"{chapter.cliffhanger}"</em></p>
        {/if}
      {/each}
    {/if}

    <section class="certificate">
      <h2 class="section font-court">Reporter's certificate</h2>
      <p>I, the undersigned court reporter, certify that the foregoing is a true and correct transcript of the proceedings in this matter, taken down by me at the speed of the witness, except where marked <span class="inaudible">[INAUDIBLE]</span>.</p>
      <div class="sign">
        <div>
          <div class="date">Dated: {today}</div>
        </div>
        <div class="sig">
          <span class="font-sign scrawl">The Reporter</span>
          <div class="sig-line">Certified Shorthand Reporter</div>
        </div>
      </div>
      <div class="cert-stamp" aria-hidden="true">
        <Stamp tone="blue" rotate={8} size="md">Certified true<br />and correct copy</Stamp>
      </div>
    </section>

    <div class="actions no-print">
      <Button variant="secondary" on:click={() => window.print()}>Print the transcript</Button>
      <Button on:click={startNew}>File a new case</Button>
    </div>
  </article>
</div>

<style>
  .wrap { max-width: 780px; margin: 0 auto; padding: 28px 12px 40px; }
  .verdict { text-align: center; margin: calc(var(--line) * 1.5) 0 var(--line); }
  .label { margin: 0; font-style: italic; color: var(--ink-soft); }
  .ruling { margin: 18px 0 14px; }
  .detail { margin: 0 auto; max-width: 30em; }
  .tally { width: 100%; border-collapse: collapse; margin: 0 0 var(--line); }
  .tally th { text-align: left; font-weight: 400; padding: 0; border-bottom: 1px dotted var(--ink-faint); }
  .tally td { text-align: right; padding: 0; border-bottom: 1px dotted var(--ink-faint); font-variant-numeric: tabular-nums; }
  .section { text-transform: uppercase; letter-spacing: 0.12em; font-size: 14px; text-align: center; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--ink); margin: var(--line) 0; }
  .appear { margin: 0 0 6px; }
  .who { font-weight: 700; }
  .cliff { margin: var(--line) 0 0; text-align: center; color: var(--ink-soft); }
  .certificate { position: relative; margin-top: calc(var(--line) * 1.5); }
  .certificate p { margin: 0; }
  .sign { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-top: calc(var(--line) * 1.5); flex-wrap: wrap; }
  .sig { text-align: center; min-width: 220px; }
  .scrawl { font-size: 44px; line-height: 1; display: block; transform: rotate(-4deg); color: #1f2c5a; }
  .sig-line { border-top: 1px solid var(--ink); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
  .cert-stamp { position: absolute; right: 8%; bottom: 10px; opacity: 0.85; pointer-events: none; }
  .actions { margin-top: calc(var(--line) * 2); display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  @media (max-width: 520px) { .cert-stamp { position: static; margin-top: 16px; text-align: center; } }
</style>
