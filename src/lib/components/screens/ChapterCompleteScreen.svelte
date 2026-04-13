<script lang="ts">
  import { story, settings, loadingMessage, transitionTo, errorMessage } from '$lib/stores/app';
  import {
    currentChapter, chapterStats, phrases, currentPhraseIndex,
    caughtIndices, missedIndices, revealedSegments, shivaPosition,
    isRunning, isPaused, phraseStartTime, combo
  } from '$lib/stores/game';
  import Button from '../ui/Button.svelte';
  import { START_POSITION } from '$lib/config';

  $: ch = $currentChapter;
  $: storyData = $story;
  $: chapter = storyData?.chapters[ch - 1];
  $: stats = $chapterStats[ch - 1];
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
    loadingMessage.set(`Preparing Chapter ${nextCh}...`);

    try {
      const res = await fetch('/api/extract-phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterProse: nextProse }),
      });
      if (!res.ok) throw new Error('Failed to extract phrases');
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

<div class="min-h-screen flex flex-col items-center py-12 px-4">
  <div class="w-full max-w-2xl space-y-6">
    <div class="text-center space-y-2">
      <div class="text-4xl">🌕</div>
      <h2 class="text-3xl font-bold text-purple-400">Chapter {ch} Complete!</h2>
      {#if chapter}
        <p class="text-slate-300 text-lg">"{chapter.title}"</p>
      {/if}
    </div>

    <!-- Stats -->
    {#if stats}
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 class="text-lg font-bold text-slate-200 mb-4">Your Performance</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-3 bg-slate-700 rounded-lg">
            <div class="text-2xl font-bold text-green-400">{stats.caught}</div>
            <div class="text-slate-400 text-sm">Phrases Caught</div>
          </div>
          <div class="text-center p-3 bg-slate-700 rounded-lg">
            <div class="text-2xl font-bold text-red-400">{stats.missed}</div>
            <div class="text-slate-400 text-sm">Phrases Missed</div>
          </div>
          <div class="text-center p-3 bg-slate-700 rounded-lg">
            <div class="text-2xl font-bold text-yellow-400">{stats.accuracy}%</div>
            <div class="text-slate-400 text-sm">Accuracy</div>
          </div>
          <div class="text-center p-3 bg-slate-700 rounded-lg">
            <div class="text-2xl font-bold text-purple-400">×{stats.bestCombo}</div>
            <div class="text-slate-400 text-sm">Best Combo</div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Chapter prose -->
    {#if chapter}
      <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
        <h3 class="text-lg font-bold text-slate-200">Full Chapter</h3>
        <p class="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{chapter.prose}</p>
        {#if chapter.cliffhanger}
          <div class="border-t border-purple-500/30 pt-4">
            <p class="text-purple-300 italic text-sm">"{chapter.cliffhanger}"</p>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Actions -->
    <div class="flex justify-center gap-4">
      {#if isLastChapter}
        <Button variant="primary" on:click={goToFinalStory}>
          📖 Read Final Story
        </Button>
      {:else}
        <Button variant="primary" on:click={continueStory}>
          Continue to Chapter {ch + 1} →
        </Button>
      {/if}
    </div>
  </div>
</div>
