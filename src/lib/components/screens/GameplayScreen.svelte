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
  import { NIGHT_WORDS, heat } from '$lib/steam';

  let typedSoFar = '';
  /** Last thing that happened to a line, shown briefly under the tape. */
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

<div class="bath">
  <header class="hud">
    <div class="row">
      <div class="title">
        <p class="etch">Night {NIGHT_WORDS[$currentChapter] ?? $currentChapter} of three</p>
        <h2 class="wipe-light">{$story?.chapters[$currentChapter - 1]?.title ?? ''}</h2>
        <div class="tally">
          <span>Kept <strong>{caught}</strong></span>
          <span>Fogged <strong class:lost={missed > 0}>{missed}</strong></span>
          <span class="sr-only">✅ {caught} caught ❌ {missed} missed</span>
        </div>
      </div>
      <div class="heat">
        <div class="etch">Heat</div>
        <div class="amount" data-testid="score">{heat($score)}</div>
        <ComboDisplay />
      </div>
    </div>
    <div class="beads" aria-label="Lines tonight">
      {#each currentPhrases as _, i}
        <span class="bead" class:done={$caughtIndices.includes(i)} class:lost={$missedIndices.includes(i)} class:now={i === $currentPhraseIndex}></span>
      {/each}
    </div>
    <div class="controls no-print">
      <button type="button" on:click={togglePause} aria-label="Turn the water off">Pause <kbd>Esc</kbd></button>
      <button type="button" on:click={toggleFullscreen} aria-label="Toggle fullscreen">Fullscreen</button>
    </div>
  </header>

  <StoryPanel />

  <div class="glass-wrap">
    <ShivaRunner currentPhrase={currentPhrase} typedSoFar={typedSoFar} />
    {#if flash?.kind === 'missed'}
      {#key flash.id}
        <div class="puff" aria-hidden="true"><span>the steam took it</span></div>
      {/key}
    {/if}
  </div>

  <div class="flash-slot" aria-live="polite">
    {#if flash}
      {#key flash.id}
        <span class="flash {flash.kind}">{flash.kind === 'caught' ? 'Mmm. Kept.' : '[fogged over]'}</span>
      {/key}
    {/if}
  </div>

  <TypingArea
    currentPhrase={currentPhrase}
    on:catch={handleCatch}
    on:miss={handleMiss}
    on:input={handleInput}
  />

  <p class="rules">Type each line before Shiva slips into the steam. Enter on a wrong line lets it fog over. Leaving the tab turns the water off.</p>

  <PauseOverlay on:resume={togglePause} on:quit={handleQuit} />
</div>

<style>
  .bath { max-width: 900px; margin: 0 auto; padding: 22px 16px 28px; display: flex; flex-direction: column; gap: 16px; }
  .hud { color: var(--fog); }
  .hud .etch { color: var(--candle); }
  .row { display: flex; justify-content: space-between; gap: 16px; }
  .title { min-width: 0; }
  .title .etch { margin: 0; }
  .wipe-light { font-family: var(--font-finger); font-weight: 400; font-size: clamp(22px, 4vw, 32px); margin: 2px 0 4px; line-height: 1.15; color: var(--fog);
    text-shadow: 0 0 10px rgba(214,223,224,0.35); }
  .tally { display: flex; gap: 16px; font-family: var(--font-label); font-size: 13px; letter-spacing: 0.06em; color: rgba(214,223,224,0.7); }
  .tally strong { color: var(--fog); font-weight: 500; }
  .tally strong.lost { color: var(--rose-soft); }
  .heat { text-align: right; margin-left: auto; flex: none; }
  .amount { font-family: var(--font-finger); font-size: 34px; line-height: 1.05; color: var(--candle); text-shadow: 0 0 16px var(--candle-glow); font-variant-numeric: tabular-nums; }
  /* Beads of condensation, one per line tonight. */
  .beads { display: flex; gap: 6px; margin-top: 12px; }
  .bead { flex: 1; height: 6px; border-radius: 6px; background: rgba(214,223,224,0.14); transition: background 0.3s ease; }
  .bead.done { background: linear-gradient(90deg, var(--candle), var(--rose-soft)); box-shadow: 0 0 8px var(--candle-glow); }
  .bead.lost { background: rgba(214,223,224,0.5); filter: blur(1.5px); }
  .bead.now { box-shadow: 0 0 0 2px rgba(244,178,106,0.7); }
  .controls { display: flex; gap: 18px; margin-top: 10px; }
  .controls button { background: none; border: none; padding: 0; font-family: var(--font-label); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(214,223,224,0.6); cursor: pointer; }
  .controls button:hover { color: var(--fog); }
  kbd { font-family: inherit; border: 1px solid currentColor; border-radius: 4px; padding: 0 4px; font-size: 10px; }
  .flash-slot { height: 24px; margin: -8px 0 -6px; text-align: center; }
  .flash { display: inline-block; font-family: var(--font-finger); font-size: 20px; animation: rise 0.9s ease-out forwards; }
  .flash.caught { color: var(--candle); }
  .flash.missed { color: rgba(214,223,224,0.8); filter: blur(0.5px); }
  @keyframes rise { 0% { opacity: 0; transform: translateY(6px) scale(1.15); } 20% { opacity: 1; transform: none; } 100% { opacity: 0; transform: translateY(-10px); filter: blur(3px); } }
  .glass-wrap { position: relative; }
  /* A miss: a cloud of steam blooms across the glass and swallows the line. */
  .puff { position: absolute; left: 50%; top: 40%; width: min(520px, 90%); height: 150px; transform: translate(-50%, -50%); z-index: 5; pointer-events: none;
    display: grid; place-items: center; animation: bloom 0.9s ease-out forwards; }
  .puff::before { content: ""; position: absolute; inset: 0; border-radius: 50%; filter: blur(6px);
    background: radial-gradient(ellipse at center, rgba(240,244,245,0.97) 0%, rgba(230,236,237,0.88) 45%, transparent 72%); }
  .puff span { position: relative; font-family: var(--font-finger); font-size: 28px; color: var(--wiped); }
  @keyframes bloom { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); } 25% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 70% { opacity: 0.9; } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.25); } }
  .rules { color: rgba(214,223,224,0.5); font-size: 15px; text-align: center; margin: 0; font-style: italic; }
  @media (max-width: 520px) {
    .bath { padding: 12px 10px 20px; gap: 12px; }
    .row { gap: 8px; }
    .tally { gap: 10px; font-size: 12px; }
    .amount { font-size: 26px; }
    .controls { margin-top: 6px; }
    .rules { font-size: 13px; }
  }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
