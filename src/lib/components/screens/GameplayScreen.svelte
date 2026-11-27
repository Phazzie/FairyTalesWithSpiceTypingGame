<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import {
    phrases, currentPhraseIndex, shivaPosition, score, combo, bestCombo,
    revealedSegments, caughtIndices, missedIndices, isRunning, isPaused,
    phraseStartTime, chapterStats, currentChapter, transcript
  } from '$lib/stores/game';
  import { buildChapterRecord, INAUDIBLE_MARK } from '$lib/utils/transcript';
  import { story, settings, transitionTo, errorMessage } from '$lib/stores/app';
  import { SPEEDS, START_POSITION, ESCAPE_THRESHOLD } from '$lib/config';
  import { calculatePoints, getNextCombo, resetCombo, matchPhrase } from '$lib/utils/scoring';
  import { saveGame } from '$lib/utils/storage';
  import ShivaRunner from '../game/ShivaRunner.svelte';
  import TypingArea from '../game/TypingArea.svelte';
  import StoryPanel from '../game/StoryPanel.svelte';
  import ComboDisplay from '../game/ComboDisplay.svelte';
  import PauseOverlay from '../game/PauseOverlay.svelte';
  import { CASE, DAY_WORDS, fee } from '$lib/court';
  import Stamp from '../ui/Stamp.svelte';

  let typedSoFar = '';
  /** Last thing the reporter did, shown briefly under the tape. */
  let flash: { kind: 'caught' | 'missed'; id: number } | null = null;
  let flashTimer: ReturnType<typeof setTimeout>;
  function showFlash(kind: 'caught' | 'missed') {
    flash = { kind, id: Date.now() };
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => (flash = null), 900);
  }
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
      let didMiss = false;
      shivaPosition.update(pos => {
        const next = pos - speedConfig.pixelsPerTick;
        if (next <= ESCAPE_THRESHOLD) {
          didMiss = true;
          return START_POSITION;
        }
        return next;
      });
      if (didMiss) {
        triggerMiss();
      }
    }, speedConfig.tickMs);
  }

  function triggerCatch(inputText: string) {
    const idx = get(currentPhraseIndex);
    const phrase = get(phrases)[idx];
    if (!phrase) return;

    const curCombo = get(combo);
    const points = calculatePoints({ speedConfig, combo: curCombo });

    score.update(s => s + points);
    const newCombo = getNextCombo(curCombo);
    combo.set(newCombo);
    bestCombo.update(b => Math.max(b, newCombo));
    caughtIndices.update(arr => [...arr, idx]);
    revealedSegments.update(segs =>
      segs.includes(phrase.proseSegment) ? segs : [...segs, phrase.proseSegment]
    );

    shivaPosition.set(START_POSITION);
    typedSoFar = '';
    phraseStartTime.set(Date.now());
    showFlash('caught');
    advancePhrase();
  }

  function triggerMiss() {
    const idx = get(currentPhraseIndex);
    combo.set(resetCombo());
    missedIndices.update(arr => [...arr, idx]);
    revealedSegments.update(segs => [...segs, `${INAUDIBLE_MARK}${idx}`]);
    shivaPosition.set(START_POSITION);
    typedSoFar = '';
    showFlash('missed');
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

    transcript.update(t => [
      ...t.filter(r => r.chapter !== ch),
      buildChapterRecord(ch, get(phrases), get(caughtIndices), get(missedIndices)),
    ]);

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

  function handleBlur() {
    if (!get(isPaused)) {
      isPaused.set(true);
    }
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
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
        transcript: get(transcript),
        settings: settingsVal,
        savedAt: Date.now(),
      });
    }
    errorMessage.set('');
    transitionTo('START');
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
          transcript: get(transcript),
          settings: settingsVal,
          savedAt: Date.now(),
        });
      }
    }, 5000);
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('blur', handleBlur);
    };
  });

  onDestroy(() => {
    clearInterval(interval);
    clearInterval(saveInterval);
    clearTimeout(flashTimer);
  });
</script>

<div class="court">
  <header class="paper strip">
    <div class="right-rule"></div>
    <div class="row">
      <div class="title">
        <div class="case">People v. Shiva · No. {CASE.number}</div>
        <h2 class="font-court">
          Day {DAY_WORDS[$currentChapter] ?? $currentChapter} of Three: {$story?.chapters[$currentChapter - 1]?.title ?? ''}
        </h2>
        <div class="tally">
          <span>Lines recorded: <strong>{caught}</strong></span>
          <span>[INAUDIBLE]: <strong class:red={missed > 0}>{missed}</strong></span>
          <span class="sr-only">✅ {caught} caught ❌ {missed} missed</span>
        </div>
      </div>
      <div class="fee">
        <div class="label">Reporter's fee</div>
        <div class="amount" data-testid="score">{fee($score)}</div>
        <ComboDisplay />
      </div>
    </div>
    <div class="pages" aria-label="Lines taken this day">
      {#each currentPhrases as _, i}
        <span class="tick" class:done={$caughtIndices.includes(i)} class:lost={$missedIndices.includes(i)} class:now={i === $currentPhraseIndex}></span>
      {/each}
    </div>
    <div class="controls no-print">
      <button type="button" on:click={togglePause} aria-label="Call a recess">Recess <kbd>Esc</kbd></button>
      <button type="button" on:click={toggleFullscreen} aria-label="Toggle fullscreen">Fullscreen</button>
    </div>
  </header>

  <StoryPanel />

  <div class="aisle-wrap">
    <ShivaRunner currentPhrase={currentPhrase} typedSoFar={typedSoFar} />
    {#if flash?.kind === 'missed'}
      {#key flash.id}
        <div class="objection" aria-hidden="true"><Stamp tone="red" rotate={-10} size="xl">Objection!</Stamp></div>
      {/key}
    {/if}
  </div>

  <div class="flash-slot" aria-live="polite">
    {#if flash}
      {#key flash.id}
        <span class="flash {flash.kind}">{flash.kind === 'caught' ? 'So recorded.' : '[INAUDIBLE]'}</span>
      {/key}
    {/if}
  </div>

  <TypingArea
    currentPhrase={currentPhrase}
    on:catch={handleCatch}
    on:miss={handleMiss}
    on:input={handleInput}
  />

  <p class="rules">Type the line before Shiva reaches the door. Enter on a wrong line strikes it as [INAUDIBLE]. Leaving the tab calls a recess.</p>

  <PauseOverlay on:resume={togglePause} on:quit={handleQuit} />
</div>

<style>
  .court { max-width: 900px; margin: 0 auto; padding: 18px 12px 28px; display: flex; flex-direction: column; gap: 14px; }
  .strip { padding-top: 14px; padding-bottom: 12px; font-size: 13px; line-height: 1.5; }
  .strip::before { top: 14px; line-height: 1.5; }
  .row { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .case { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-soft); }
  h2 { font-size: clamp(18px, 3.2vw, 24px); margin: 2px 0 4px; line-height: 1.2; }
  .tally { display: flex; gap: 16px; flex-wrap: wrap; }
  .red { color: var(--stamp-red); }
  .fee { text-align: right; margin-left: auto; }
  .fee .label { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-soft); }
  .amount { font-size: 26px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
  .pages { display: flex; gap: 3px; margin-top: 10px; }
  .tick { flex: 1; height: 6px; background: rgba(0,0,0,0.1); }
  .tick.done { background: var(--ink); }
  .tick.lost { background: repeating-linear-gradient(-45deg, var(--stamp-red) 0 3px, transparent 3px 5px); }
  .tick.now { outline: 2px solid var(--stamp-blue); outline-offset: 1px; }
  .controls { display: flex; gap: 16px; margin-top: 10px; }
  .controls button { background: none; border: none; padding: 0; font: inherit; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-soft); cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
  .controls button:hover { color: var(--ink); }
  kbd { font-family: inherit; border: 1px solid currentColor; padding: 0 3px; font-size: 10px; text-decoration: none; }
  .flash-slot { height: 22px; margin: -8px 0 -6px; text-align: center; }
  .flash { display: inline-block; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; font-size: 14px; animation: rise 0.9s ease-out forwards; }
  .flash.caught { color: #e9dcc2; }
  .flash.missed { color: #ff8b8b; }
  @keyframes rise { 0% { opacity: 0; transform: translateY(6px) scale(1.2); } 20% { opacity: 1; transform: none; } 100% { opacity: 0; transform: translateY(-8px); } }
  .aisle-wrap { position: relative; }
  .objection { position: absolute; left: 50%; top: 78%; transform: translate(-50%, -50%); z-index: 5; pointer-events: none; animation: slam 0.75s cubic-bezier(.2,1.5,.4,1) forwards; }
  .objection :global(.stamp) { background: rgba(245,240,225,0.92); }
  @keyframes slam { 0% { opacity: 0; transform: translate(-50%, -50%) scale(2.4); } 18% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 75% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1); } }
  .rules { color: #b9ab93; font-size: 12px; text-align: center; margin: 0; font-family: var(--font-court); font-style: italic; }
  @media (max-width: 520px) {
    .court { padding: 10px 8px 20px; gap: 10px; }
    .strip { padding-top: 10px; padding-bottom: 8px; }
    .row { flex-wrap: nowrap; gap: 8px; }
    h2 { font-size: 16px; }
    .tally { gap: 10px; font-size: 12px; }
    .amount { font-size: 18px; }
    .fee .label { font-size: 9px; }
    .controls { margin-top: 6px; }
    .rules { font-size: 11px; }
  }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
