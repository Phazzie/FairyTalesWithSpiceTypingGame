<script lang="ts">
  import { onMount } from 'svelte';
  import { phase, story, loadingMessage, errorMessage, settings, transitionTo } from '$lib/stores/app';
  import { phrases, currentChapter, score, combo, bestCombo, revealedSegments, caughtIndices, missedIndices, chapterStats, isRunning, isPaused, currentPhraseIndex, shivaPosition, phraseStartTime } from '$lib/stores/game';
  import SpiceSelector from '../ui/SpiceSelector.svelte';
  import SpeedSelector from '../ui/SpeedSelector.svelte';
  import ThemeGrid from '../ui/ThemeGrid.svelte';
  import Button from '../ui/Button.svelte';
  import { loadGame } from '$lib/utils/storage';
  import type { SpiceLevel, SpeedSetting } from '$lib/types/domain';
  import { START_POSITION } from '$lib/config';

  let spiceLevel: SpiceLevel = 3;
  let speedSetting: SpeedSetting = 'normal';
  let selectedThemes: string[] = [];
  let characterIdea = '';
  let loveInterestIdea = '';
  let setting = '';
  let plotHook = '';
  let showCustomize = false;
  let savedState = false;

  onMount(() => {
    const save = loadGame();
    savedState = save !== null;
  });

  async function generate() {
    const currentSettings = {
      spiceLevel,
      speedSetting,
      selectedThemes,
      characterIdea: characterIdea || undefined,
      loveInterestIdea: loveInterestIdea || undefined,
      setting: setting || undefined,
      plotHook: plotHook || undefined,
    };

    settings.set(currentSettings);

    // Reset game state
    score.set(0); combo.set(0); bestCombo.set(0);
    revealedSegments.set([]); caughtIndices.set([]); missedIndices.set([]);
    chapterStats.set([]); currentChapter.set(1);
    currentPhraseIndex.set(0); shivaPosition.set(START_POSITION);
    isRunning.set(false); isPaused.set(false);

    try {
      transitionTo('GENERATING');
      loadingMessage.set('Weaving your werewolf romance...');

      const genRes = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spiceLevel,
          customization: { selectedThemes, characterIdea, loveInterestIdea, setting, plotHook },
        }),
      });

      if (!genRes.ok) throw new Error('Story generation failed');
      const genData = await genRes.json();
      story.set(genData.story);

      transitionTo('GRADING');
      loadingMessage.set('Grading your story quality...');

      transitionTo('EXTRACTING');
      loadingMessage.set('Extracting typing phrases...');

      const extractRes = await fetch('/api/extract-phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterProse: genData.story.chapters[0].prose }),
      });

      if (!extractRes.ok) throw new Error('Phrase extraction failed');
      const extractData = await extractRes.json();
      phrases.set(extractData.phrases);
      phraseStartTime.set(Date.now());

      transitionTo('GAMEPLAY');
    } catch (err) {
      console.error(err);
      errorMessage.set(err instanceof Error ? err.message : 'Something went wrong');
      transitionTo('ERROR');
    }
  }

  function resumeGame() {
    const save = loadGame();
    if (!save) return;
    story.set(save.story);
    settings.set(save.settings);
    currentChapter.set(save.currentChapter);
    phrases.set(save.phrases);
    currentPhraseIndex.set(save.currentPhraseIndex);
    revealedSegments.set(save.revealedSegments);
    caughtIndices.set(save.caughtIndices);
    missedIndices.set(save.missedIndices);
    score.set(save.score);
    combo.set(save.combo);
    bestCombo.set(save.bestCombo);
    chapterStats.set(save.chapterStats);
    shivaPosition.set(START_POSITION);
    isRunning.set(false);
    isPaused.set(false);
    // Force phase transition from START to GAMEPLAY via intermediate phases
    phase.set('CHAPTER_COMPLETE');
    transitionTo('GAMEPLAY');
  }
</script>

<div class="min-h-screen flex flex-col items-center justify-start py-12 px-4">
  <div class="w-full max-w-2xl space-y-8">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h1 class="text-5xl font-bold text-purple-400">🐺 Fairytales with Spice</h1>
      <p class="text-slate-400 text-lg">A werewolf romance typing adventure</p>
    </div>

    <!-- How to play -->
    <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-400">
      <strong class="text-slate-200">How to play:</strong> Type phrases before Shiva the wolf escapes!
      Catch phrases to reveal the story. Build combos for bonus points.
      3 chapters of werewolf romance await. 🌕
    </div>

    <!-- Resume -->
    {#if savedState}
      <div class="bg-purple-900/30 border border-purple-500/40 rounded-xl p-4 flex items-center justify-between">
        <span class="text-purple-300">📖 You have a saved game</span>
        <Button variant="secondary" on:click={resumeGame}>Resume</Button>
      </div>
    {/if}

    <!-- Settings Card -->
    <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
      <!-- Spice Level -->
      <div class="space-y-2">
        <p class="text-slate-200 font-medium">Romance Intensity</p>
        <SpiceSelector bind:value={spiceLevel} on:change={e => spiceLevel = e.detail as SpiceLevel} />
      </div>

      <!-- Speed -->
      <div class="space-y-2">
        <p class="text-slate-200 font-medium">Game Speed</p>
        <SpeedSelector bind:value={speedSetting} on:change={e => speedSetting = e.detail as SpeedSetting} />
      </div>

      <!-- Themes -->
      <div class="space-y-2">
        <p class="text-slate-200 font-medium">Story Themes</p>
        <ThemeGrid bind:selected={selectedThemes} on:change={e => selectedThemes = e.detail} />
      </div>

      <!-- Customize toggle -->
      <button
        type="button"
        class="text-purple-400 hover:text-purple-300 text-sm underline"
        on:click={() => showCustomize = !showCustomize}
      >
        {showCustomize ? '▼' : '▶'} Customize Your Story (optional)
      </button>

      {#if showCustomize}
        <div class="space-y-3 border-t border-slate-700 pt-4">
          <div>
            <label for="characterIdea" class="text-slate-400 text-sm">Protagonist idea</label>
            <input id="characterIdea" bind:value={characterIdea} type="text" maxlength="100"
              class="w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm outline-none focus:border-purple-500"
              placeholder="e.g., a botanist who studies rare plants" />
          </div>
          <div>
            <label for="loveInterestIdea" class="text-slate-400 text-sm">Love interest idea</label>
            <input id="loveInterestIdea" bind:value={loveInterestIdea} type="text" maxlength="100"
              class="w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm outline-none focus:border-purple-500"
              placeholder="e.g., a brooding pack alpha with a secret" />
          </div>
          <div>
            <label for="setting" class="text-slate-400 text-sm">Setting</label>
            <input id="setting" bind:value={setting} type="text" maxlength="100"
              class="w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm outline-none focus:border-purple-500"
              placeholder="e.g., a remote mountain research station" />
          </div>
          <div>
            <label for="plotHook" class="text-slate-400 text-sm">Plot hook</label>
            <input id="plotHook" bind:value={plotHook} type="text" maxlength="150"
              class="w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm outline-none focus:border-purple-500"
              placeholder="e.g., she holds a key the pack has been searching for" />
          </div>
        </div>
      {/if}
    </div>

    <!-- Generate Button -->
    <Button
      variant="primary"
      disabled={selectedThemes.length !== 3}
      on:click={generate}
    >
      <span class="text-lg px-4">✨ Generate My Story</span>
    </Button>
    {#if selectedThemes.length !== 3}
      <p class="text-slate-500 text-sm text-center">Select exactly 3 themes to begin</p>
    {/if}
  </div>
</div>
