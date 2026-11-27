<script lang="ts">
  import { story, loadingMessage, transitionTo, errorMessage } from '$lib/stores/app';
  import {
    currentChapter, chapterStats, phrases, currentPhraseIndex,
    caughtIndices, missedIndices, revealedSegments, shivaPosition,
    isRunning, isPaused, phraseStartTime, combo, transcript
  } from '$lib/stores/game';
  import Button from '../ui/Button.svelte';
  import Stamp from '../ui/Stamp.svelte';
  import CourtCaption from '../ui/CourtCaption.svelte';
  import Transcript from '../game/Transcript.svelte';
  import { START_POSITION } from '$lib/config';
  import { DAY_WORDS } from '$lib/court';

  $: ch = $currentChapter;
  $: storyData = $story;
  $: chapter = storyData?.chapters[ch - 1];
  $: stats = $chapterStats[ch - 1];
  $: record = $transcript.find(r => r.chapter === ch);
  $: isLastChapter = ch >= 3;

  async function continueStory() {
    const nextCh = ch + 1;
    if (nextCh > 3) {
      transitionTo('STORY_COMPLETE');
      return;
    }

    const nextProse = storyData?.chapters[nextCh - 1]?.prose ?? '';

    // Reset phrase state for new chapter
    currentPhraseIndex.set(0);
    caughtIndices.set([]);
    missedIndices.set([]);
    revealedSegments.set([]);
    shivaPosition.set(START_POSITION);
    combo.set(0);

    transitionTo('EXTRACTING');
    loadingMessage.set(`Court resumes for Day ${DAY_WORDS[nextCh]}`);

    try {
      const res = await fetch('/api/extract-phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterProse: nextProse }),
      });
      if (!res.ok) throw new Error('The clerk could not cut the tape for the next day (phrase extraction failed).');
      const data = await res.json();
      phrases.set(data.phrases);
      currentChapter.set(nextCh);
      phraseStartTime.set(Date.now());
      isRunning.set(false);
      isPaused.set(false);
      transitionTo('GAMEPLAY');
    } catch (err) {
      errorMessage.set(err instanceof Error ? err.message : 'Failed to load next chapter');
      transitionTo('ERROR');
    }
  }

  function goToFinalStory() {
    transitionTo('STORY_COMPLETE');
  }
</script>

<div class="wrap">
  <article class="paper sheet">
    <div class="right-rule"></div>
    <CourtCaption compact title="Reporter's transcript of proceedings, Day {DAY_WORDS[ch]} (uncertified)" />

    <div class="adjourn">
      <Stamp tone="red" rotate={-4} size="lg">Adjourned</Stamp>
      <h1 class="font-court">End of Day {DAY_WORDS[ch]} proceedings</h1>
      {#if chapter}<p class="subtitle">"{chapter.title}"</p>{/if}
    </div>

    {#if stats}
      <table class="tally">
        <caption>Reporter's tally</caption>
        <tbody>
          <tr><th scope="row">Lines taken down</th><td>{stats.caught}</td></tr>
          <tr><th scope="row">Lines entered as [INAUDIBLE]</th><td class:red={stats.missed > 0}>{stats.missed}</td></tr>
          <tr><th scope="row">Accuracy of the record</th><td><strong>{stats.accuracy}%</strong></td></tr>
          <tr><th scope="row">Longest unbroken run, trial to date</th><td>{stats.bestCombo} lines</td></tr>
        </tbody>
      </table>
    {/if}

    {#if chapter}
      <h2 class="section font-court">Testimony as recorded</h2>
      <Transcript prose={chapter.prose} missedSegments={record?.missedSegments ?? []} />
      {#if chapter.cliffhanger}
        <p class="cliff">
          <span class="who">THE COURT:</span> We'll stop there for tonight. Let the record reflect the last thing anyone heard:
          <em>"{chapter.cliffhanger}"</em>
        </p>
      {/if}
      <p class="time">(Whereupon, at 11:59 p.m., the proceedings were adjourned.)</p>
    {/if}

    <div class="actions">
      {#if isLastChapter}
        <Button on:click={goToFinalStory}>Close the record and certify →</Button>
      {:else}
        <Button on:click={continueStory}>Court resumes: Day {DAY_WORDS[ch + 1]} →</Button>
      {/if}
    </div>
  </article>
</div>

<style>
  .wrap { max-width: 780px; margin: 0 auto; padding: 28px 12px 40px; }
  .adjourn { text-align: center; margin: calc(var(--line) * 1.2) 0 var(--line); }
  h1 { font-size: clamp(26px, 5vw, 36px); margin: 16px 0 0; line-height: 1.15; }
  .subtitle { margin: 4px 0 0; font-style: italic; color: var(--ink-soft); }
  .tally { width: 100%; border-collapse: collapse; margin: 0 0 var(--line); font-size: 15px; }
  .tally caption { text-align: left; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-size: 13px; }
  .tally th { text-align: left; font-weight: 400; padding: 0; border-bottom: 1px dotted var(--ink-faint); }
  .tally td { text-align: right; padding: 0; border-bottom: 1px dotted var(--ink-faint); font-variant-numeric: tabular-nums; }
  .red { color: var(--stamp-red); font-weight: 700; }
  .section { text-transform: uppercase; letter-spacing: 0.12em; font-size: 14px; text-align: center; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--ink); margin: 0 0 var(--line); }
  .cliff { margin: var(--line) 0 0; }
  .who { font-weight: 700; }
  .time { margin: var(--line) 0 0; text-align: center; color: var(--ink-soft); }
  .actions { margin-top: calc(var(--line) * 1.5); display: flex; justify-content: center; }
</style>
