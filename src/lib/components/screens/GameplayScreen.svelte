<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import {
    phrases, currentPhraseIndex, shivaPosition, score, combo, bestCombo,
    revealedSegments, caughtIndices, missedIndices, isRunning, isPaused,
    phraseStartTime, chapterStats, currentChapter
  } from '$lib/stores/game';
  import { story, settings, transitionTo, errorMessage } from '$lib/stores/app';
  import { SPEEDS, START_POSITION, ESCAPE_THRESHOLD } from '$lib/config';
  import { calculatePoints, getNextCombo, resetCombo, matchPhrase } from '$lib/utils/scoring';
  import { saveGame } from '$lib/utils/storage';
  import ShivaRunner from '../game/ShivaRunner.svelte';
  import TypingArea from '../game/TypingArea.svelte';
  import StoryPanel from '../game/StoryPanel.svelte';
  import ComboDisplay from '../game/ComboDisplay.svelte';
  import PauseOverlay from '../game/PauseOverlay.svelte';
  import ProgressBar from '../ui/ProgressBar.svelte';

  let typedSoFar = '';
  let interval: ReturnType<typeof setInterval>;
  let saveInterval: ReturnType<typeof setInterval>;

  $: currentSettings = $settings;
  $: speedConfig = SPEEDS[(currentSettings?.speedSetting ?? 'normal') as keyof typeof SPEEDS];
  $: currentPhrases = $phrases;
  $: currentPhrase = currentPhrases[$currentPhraseIndex]?.text ?? '';
  $: progress = currentPhrases.length > 0 ? ($currentPhraseIndex / currentPhrases.length) * 100 : 0;
  $: caught = $caughtIndices.length;
  $: missed = $missedIndices.length;

  function startGameLoop() {
    isRunning.set(true);
    phraseStartTime.set(Date.now());
    interval = setInterval(() => {
      if (get(isPaused) || !get(isRunning)) return;
      shivaPosition.update(pos => {
        const next = pos - speedConfig.pixelsPerTick;
        if (next <= ESCAPE_THRESHOLD) {
          triggerMiss();
          return START_POSITION;
        }
        return next;
      });
    }, speedConfig.tickMs);
  }

  function triggerCatch(inputText: string) {
    const idx = get(currentPhraseIndex);
    const phrase = get(phrases)[idx];
    if (!phrase) return;

    const elapsed = Date.now() - get(phraseStartTime);
    const curCombo = get(combo);
    const points = calculatePoints({ elapsedMs: elapsed, speedConfig, combo: curCombo });

    score.update(s => s + points);
    const newCombo = getNextCombo(curCombo);
    combo.set(newCombo);
    bestCombo.update(b => Math.max(b, newCombo));
    caughtIndices.update(arr => [...arr, idx]);
    revealedSegments.update(segs => [...segs, phrase.proseSegment]);

    shivaPosition.set(START_POSITION);
    typedSoFar = '';
    phraseStartTime.set(Date.now());
    advancePhrase();
  }

  function triggerMiss() {
    const idx = get(currentPhraseIndex);
    combo.set(resetCombo());
    missedIndices.update(arr => [...arr, idx]);
    shivaPosition.set(START_POSITION);
    typedSoFar = '';
    phraseStartTime.set(Date.now());
    advancePhrase();
  }

  function advancePhrase() {
    const nextIdx = get(currentPhraseIndex) + 1;
    const total = get(phrases).length;
    if (nextIdx >= total) {
      endChapter();
    } else {
      currentPhraseIndex.set(nextIdx);
    }
  }

  function endChapter() {
    clearInterval(interval);
    isRunning.set(false);

    const ch = get(currentChapter);
    const caughtCount = get(caughtIndices).length;
    const missedCount = get(missedIndices).length;
    const total = get(phrases).length;

    chapterStats.update(stats => [...stats, {
      chapter: ch,
      caught: caughtCount,
      missed: missedCount,
      total,
      accuracy: total > 0 ? Math.round((caughtCount / total) * 100) : 0,
      score: get(score),
      bestCombo: get(bestCombo),
    }]);

    transitionTo('CHAPTER_COMPLETE');
  }

  function handleCatch(e: CustomEvent<string>) {
    if (matchPhrase(e.detail, currentPhrase)) {
      triggerCatch(e.detail);
    }
  }

  function handleInput(e: CustomEvent<string>) {
    typedSoFar = e.detail;
  }

  function handleMiss() {
    triggerMiss();
  }

  function togglePause() {
    isPaused.update(p => !p);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') togglePause();
  }

  function handleQuit() {
    clearInterval(interval);
    clearInterval(saveInterval);
    isRunning.set(false);
    isPaused.set(false);
    const storyVal = get(story);
    const settingsVal = get(settings);
    if (storyVal && settingsVal) {
      saveGame({
        phase: 'GAMEPLAY',
        story: storyVal,
        currentChapter: get(currentChapter),
        phrases: get(phrases),
        currentPhraseIndex: get(currentPhraseIndex),
        revealedSegments: get(revealedSegments),
        caughtIndices: get(caughtIndices),
        missedIndices: get(missedIndices),
        score: get(score),
        combo: get(combo),
        bestCombo: get(bestCombo),
        chapterStats: get(chapterStats),
        settings: settingsVal,
        savedAt: Date.now(),
      });
    }
    errorMessage.set('');
    transitionTo('ERROR');
    setTimeout(() => { transitionTo('START'); }, 100);
  }

  onMount(() => {
    startGameLoop();
    saveInterval = setInterval(() => {
      const storyVal = get(story);
      const settingsVal = get(settings);
      if (storyVal && settingsVal) {
        saveGame({
          phase: 'GAMEPLAY',
          story: storyVal,
          currentChapter: get(currentChapter),
          phrases: get(phrases),
          currentPhraseIndex: get(currentPhraseIndex),
          revealedSegments: get(revealedSegments),
          caughtIndices: get(caughtIndices),
          missedIndices: get(missedIndices),
          score: get(score),
          combo: get(combo),
          bestCombo: get(bestCombo),
          chapterStats: get(chapterStats),
          settings: settingsVal,
          savedAt: Date.now(),
        });
      }
    }, 5000);
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    clearInterval(interval);
    clearInterval(saveInterval);
  });
</script>

<div class="min-h-screen flex flex-col p-4 gap-4 max-w-4xl mx-auto">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-lg font-bold text-purple-400">
        Chapter {$currentChapter} — {$story?.chapters[$currentChapter - 1]?.title ?? ''}
      </h2>
      <div class="flex gap-4 text-sm text-slate-400">
        <span>✅ {caught} caught</span>
        <span>❌ {missed} missed</span>
      </div>
    </div>
    <div class="text-right">
      <div class="text-2xl font-bold text-yellow-400">{$score.toLocaleString()}</div>
      <ComboDisplay />
    </div>
  </div>

  <!-- Progress -->
  <ProgressBar value={progress} />

  <!-- Story panel -->
  <StoryPanel />

  <!-- Track & Runner -->
  <ShivaRunner currentPhrase={currentPhrase} typedSoFar={typedSoFar} />

  <!-- Typing area -->
  <TypingArea
    currentPhrase={currentPhrase}
    on:catch={handleCatch}
    on:miss={handleMiss}
    on:input={handleInput}
  />

  <!-- Pause hint -->
  <p class="text-slate-600 text-xs text-center">Press Escape to pause</p>

  <!-- Pause overlay -->
  <PauseOverlay on:resume={togglePause} on:quit={handleQuit} />
</div>
