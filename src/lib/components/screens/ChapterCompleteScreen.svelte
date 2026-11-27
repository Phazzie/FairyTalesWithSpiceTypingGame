<script lang="ts">
  import { story, loadingMessage, transitionTo, errorMessage } from '$lib/stores/app';
  import {
    currentChapter, chapterStats, phrases, currentPhraseIndex,
    caughtIndices, missedIndices, revealedSegments, shivaPosition,
    isRunning, isPaused, phraseStartTime, combo, transcript
  } from '$lib/stores/game';
  import Button from '../ui/Button.svelte';
  import Wipe from '../ui/Wipe.svelte';
  import Transcript from '../game/Transcript.svelte';
  import { START_POSITION } from '$lib/config';
  import { NIGHT_WORDS, NIGHT_ORDINALS } from '$lib/steam';

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
    loadingMessage.set(`Running it hotter for Night ${NIGHT_WORDS[nextCh]}`);

    try {
      const res = await fetch('/api/extract-phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterProse: nextProse }),
      });
      if (!res.ok) throw new Error('The mirror would not fog for the next night (the lines could not be prepared).');
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
  <article class="mirror sheet">
    <header class="top">
      <p class="etch">Night {NIGHT_WORDS[ch]} of three</p>
      <Wipe tag="h1" size="lg">End of the {NIGHT_ORDINALS[ch]} night</Wipe>
      {#if chapter}<p class="subtitle">"{chapter.title}"</p>{/if}
    </header>

    {#if stats}
      <dl class="tally" aria-label="How much you kept">
        <div><dt>Lines you kept</dt><dd>{stats.caught}</dd></div>
        <div><dt>Lost to the fog</dt><dd class:lost={stats.missed > 0}>{stats.missed}</dd></div>
        <div><dt>Still readable</dt><dd><strong>{stats.accuracy}%</strong></dd></div>
        <div><dt>Longest streak</dt><dd>{stats.bestCombo}</dd></div>
      </dl>
    {/if}

    {#if chapter}
      <p class="etch section">What's left on the glass</p>
      <Transcript prose={chapter.prose} missedSegments={record?.missedSegments ?? []} />
      {#if chapter.cliffhanger}
        <p class="cliff">The last thing written before the glass went white:
          <span class="wipe line">"{chapter.cliffhanger}"</span>
        </p>
      {/if}
    {/if}

    <div class="actions">
      {#if isLastChapter}
        <Button on:click={goToFinalStory}>See the whole mirror →</Button>
      {:else}
        <Button on:click={continueStory}>Run it hotter: Night {NIGHT_WORDS[ch + 1]} →</Button>
      {/if}
    </div>
  </article>
</div>

<style>
  .wrap { max-width: 760px; margin: 0 auto; padding: 36px 16px 48px; }
  .top { text-align: center; margin-bottom: 22px; }
  .top .etch { margin: 0 0 4px; color: var(--rose); }
  .subtitle { margin: 6px 0 0; font-style: italic; font-size: 20px; color: var(--wiped-soft); }
  .tally { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 0 0 26px; }
  .tally div { text-align: center; padding: 12px 6px; border-radius: 14px; background: rgba(255,255,255,0.35); }
  dt { font-family: var(--font-label); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--wiped-soft); }
  dd { margin: 4px 0 0; font-family: var(--font-finger); font-size: 30px; line-height: 1; font-variant-numeric: tabular-nums; }
  dd strong { font-weight: 400; color: var(--rose); }
  .lost { color: var(--wiped-faint); }
  .section { text-align: center; margin: 0 0 14px; }
  .cliff { margin: 22px 0 0; text-align: center; font-style: italic; color: var(--wiped-soft); }
  .cliff .line { display: block; margin-top: 6px; font-style: normal; font-size: 24px; line-height: 1.25; }
  .actions { margin-top: 30px; display: flex; justify-content: center; }
  @media (max-width: 560px) { .tally { grid-template-columns: 1fr 1fr; } }
</style>
