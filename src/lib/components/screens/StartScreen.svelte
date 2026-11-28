<script lang="ts">
  import { onMount } from 'svelte';
  import { story, loadingMessage, errorMessage, settings, transitionTo, restoreToGameplay } from '$lib/stores/app';
  import { phrases, currentChapter, score, combo, bestCombo, revealedSegments, caughtIndices, missedIndices, chapterStats, isRunning, isPaused, currentPhraseIndex, shivaPosition, phraseStartTime, transcript } from '$lib/stores/game';
  import SpiceSelector from '../ui/SpiceSelector.svelte';
  import SpeedSelector from '../ui/SpeedSelector.svelte';
  import ThemeGrid from '../ui/ThemeGrid.svelte';
  import Button from '../ui/Button.svelte';
  import { loadGame } from '$lib/utils/storage';
  import type { SpiceLevel, SpeedSetting } from '$lib/types/domain';
  import { START_POSITION } from '$lib/config';
  import MirrorTitle from '../ui/MirrorTitle.svelte';
  import CoupleSetup from '../ui/CoupleSetup.svelte';
  import { coupleDetails, initialCouple, type CoupleState } from '$lib/utils/couple';
  import { NIGHT_WORDS } from '$lib/steam';

  // Start from the last settings used, so "Try Again" after an error keeps your picks.
  const previous = $settings;
  let spiceLevel: SpiceLevel = previous?.spiceLevel ?? 3;
  let speedSetting: SpeedSetting = previous?.speedSetting ?? 'normal';
  let selectedThemes: string[] = previous?.selectedThemes ? [...previous.selectedThemes] : [];
  let couple: CoupleState = previous?.couple ?? initialCouple();
  let players: 'one' | 'two' = previous?.couple ? 'two' : 'one';
  let characterIdea = previous?.couple ? '' : previous?.characterIdea ?? '';
  let loveInterestIdea = previous?.couple ? '' : previous?.loveInterestIdea ?? '';
  $: coupleDone = coupleDetails(couple);
  $: canStart = selectedThemes.length === 3 && (players === 'one' || coupleDone !== null);
  let setting = previous?.setting ?? '';
  let plotHook = previous?.plotHook ?? '';
  let savedState = false;
  let savedDay = 1;

  onMount(() => {
    const save = loadGame();
    savedState = save !== null;
    savedDay = save?.currentChapter ?? 1;
  });

  async function generate() {
    const two = players === 'two' ? coupleDetails(couple) : null;
    const hero = two ? two.characterIdea : characterIdea;
    const wolf = two ? two.loveInterestIdea : loveInterestIdea;
    const currentSettings = {
      spiceLevel,
      speedSetting,
      selectedThemes,
      characterIdea: hero || undefined,
      loveInterestIdea: wolf || undefined,
      setting: setting || undefined,
      plotHook: plotHook || undefined,
      couple: two ? couple : undefined,
    };

    settings.set(currentSettings);

    // Reset game state
    score.set(0); combo.set(0); bestCombo.set(0);
    revealedSegments.set([]); caughtIndices.set([]); missedIndices.set([]);
    chapterStats.set([]); currentChapter.set(1); transcript.set([]);
    currentPhraseIndex.set(0); shivaPosition.set(START_POSITION);
    isRunning.set(false); isPaused.set(false);

    try {
      transitionTo('GENERATING');
      loadingMessage.set('Running the water');

      const genRes = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spiceLevel,
          customization: { selectedThemes, characterIdea: hero, loveInterestIdea: wolf, setting, plotHook },
        }),
      });

      if (!genRes.ok) throw new Error('The water never got hot (the story could not be written).');
      const genData = await genRes.json();
      story.set(genData.story);

      transitionTo('GRADING');
      loadingMessage.set('Waiting for the glass to fog');

      transitionTo('EXTRACTING');
      loadingMessage.set('Breathing on the mirror');

      const extractRes = await fetch('/api/extract-phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterProse: genData.story.chapters[0].prose }),
      });

      if (!extractRes.ok) throw new Error('The mirror would not fog (the lines could not be prepared).');
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
    transcript.set(Array.isArray(save.transcript) ? save.transcript : []);
    shivaPosition.set(START_POSITION);
    isRunning.set(false);
    isPaused.set(false);
    restoreToGameplay();
  }
</script>

<div class="wrap">
  <article class="mirror sheet" aria-labelledby="steam-title">
    <span id="steam-title" class="sr-only">Steam: Fairytales with Spice</span>
    <MirrorTitle line="Fairytales with Spice" />

    <ol class="how">
      <li><span class="n">1</span><span>Tell the mirror what you want. It writes you a story in three nights.</span></li>
      <li><span class="n">2</span><span>Each line appears through the steam. Trace it with your fingertips (type it) before the fog takes it back.</span></li>
      <li><span class="n">3</span><span>Whatever you miss is <span class="fogged">[fogged over]</span> for good. At the end, see how much of the night survived.</span></li>
    </ol>

    {#if savedState}
      <section class="resume" data-testid="resume">
        <p><span class="wipe">Still steamy in here.</span> You left on Night {NIGHT_WORDS[savedDay] ?? savedDay} of three.
          <span class="sr-only">You have a saved game</span></p>
        <Button variant="secondary" on:click={resumeGame}>Pick up where you left off</Button>
      </section>
    {/if}

    <section class="block steer" aria-labelledby="steer-title">
      <h2 id="steer-title" class="wipe">Tell the mirror what you want</h2>
      <p class="hint">This steers the whole story. Pick three, then add as much or as little as you like.</p>

      <fieldset>
        <legend class="etch">Write three things on the glass</legend>
        <ThemeGrid bind:selected={selectedThemes} on:change={e => selectedThemes = e.detail} />
      </fieldset>

      <fieldset>
        <legend class="etch">Who's in the bathroom</legend>
        <div role="radiogroup" aria-label="How many players" class="players">
          <button type="button" role="radio" aria-checked={players === 'one'} class:on={players === 'one'} on:click={() => (players = 'one')}>Just me</button>
          <button type="button" role="radio" aria-checked={players === 'two'} class:on={players === 'two'} on:click={() => (players = 'two')}>Two of us</button>
        </div>
      </fieldset>

      {#if players === 'two'}
        <fieldset>
          <legend class="etch">Write each other</legend>
          <CoupleSetup bind:state={couple} />
        </fieldset>
      {/if}

      <fieldset class="details">
        <legend class="etch">Whisper the details <span class="opt">optional</span></legend>
        <div class="grid">
          {#if players === 'one'}
          <label>
            <span>Her</span>
            <input id="characterIdea" bind:value={characterIdea} type="text" maxlength="100" placeholder="a botanist who studies rare plants" />
          </label>
          <label>
            <span>Him</span>
            <input id="loveInterestIdea" bind:value={loveInterestIdea} type="text" maxlength="100" placeholder="a brooding pack alpha with a secret" />
          </label>
          {/if}
          <label>
            <span>Where</span>
            <input id="setting" bind:value={setting} type="text" maxlength="100" placeholder="a remote mountain research station" />
          </label>
          <label>
            <span>What starts it</span>
            <input id="plotHook" bind:value={plotHook} type="text" maxlength="150" placeholder="she holds a key the pack has been searching for" />
          </label>
        </div>
      </fieldset>
    </section>

    <section class="block">
      <fieldset>
        <legend class="etch">How hot is the water</legend>
        <SpiceSelector bind:value={spiceLevel} on:change={e => spiceLevel = e.detail as SpiceLevel} />
      </fieldset>

      <fieldset>
        <legend class="etch">How fast the fog comes back</legend>
        <SpeedSelector bind:value={speedSetting} on:change={e => speedSetting = e.detail as SpeedSetting} />
      </fieldset>
    </section>

    <div class="submit">
      <Button disabled={!canStart} on:click={generate}>
        Turn on the water
      </Button>
      {#if selectedThemes.length !== 3}
        <p class="refusal">Write three things on the glass first ({3 - selectedThemes.length} to go).</p>
      {:else if !canStart}
        <p class="refusal">Finish writing each other first.</p>
      {:else}
        <p class="ready">Lock the door. It takes about a minute to steam up.</p>
      {/if}
    </div>
  </article>

  <p class="credit">Fairytales with Spice is a Skeptical Wombat production. Game by Phazzie. Adults only.</p>
</div>

<style>
  .wrap { max-width: 760px; margin: 0 auto; padding: 36px 16px 48px; }
  .how { list-style: none; margin: 26px auto 0; padding: 0; max-width: 560px; display: grid; gap: 8px; font-size: 18px; line-height: 1.4; }
  .how li { display: flex; gap: 12px; align-items: baseline; }
  .n { font-family: var(--font-finger); color: var(--rose); font-size: 22px; flex: none; width: 16px; }
  .resume { margin: 24px 0 0; padding: 14px 18px; border-radius: 16px; background: rgba(255,255,255,0.4); border: 1px dashed rgba(19,35,42,0.35);
    display: flex; gap: 14px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
  .resume p { margin: 0; }
  .resume .wipe { font-size: 22px; margin-right: 6px; }
  .block { margin-top: 28px; padding-top: 24px; border-top: 1px solid rgba(19,35,42,0.15); }
  .steer h2 { margin: 0; font-size: clamp(28px, 6vw, 38px); font-weight: 400; line-height: 1.1; color: var(--rose); text-shadow: 0 0 1px rgba(194,83,107,0.5), 0 0 8px rgba(255,255,255,0.8); }
  .hint { margin: 6px 0 18px; font-style: italic; color: var(--wiped-soft); }
  fieldset { border: none; margin: 0 0 22px; padding: 0; min-width: 0; }
  fieldset:last-child { margin-bottom: 0; }
  legend { padding: 0; margin-bottom: 10px; }
  .opt { color: var(--wiped-faint); letter-spacing: 0.12em; margin-left: 6px; }
  .players { display: inline-flex; padding: 4px; border-radius: 999px; background: rgba(19,35,42,0.08); }
  .players button { font-family: var(--font-label); font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; padding: 8px 18px; border-radius: 999px; border: none; background: none; color: var(--wiped-soft); cursor: pointer; }
  .players button.on { background: var(--wiped); color: var(--fog); }
  .players button:focus-visible { outline: 2px solid var(--rose); outline-offset: 2px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
  .grid label { display: flex; flex-direction: column; gap: 2px; }
  .grid label span { font-family: var(--font-finger); font-size: 19px; color: var(--wiped); }
  .grid input { font: inherit; font-size: 18px; background: rgba(255,255,255,0.35); border: 1px solid rgba(19,35,42,0.15); border-radius: 12px; padding: 8px 12px; color: var(--wiped); outline: none; transition: background 0.2s ease; }
  .grid input::placeholder { color: var(--wiped-faint); font-style: italic; }
  .grid input:focus { background: rgba(255,255,255,0.7); border-color: var(--rose); }
  .submit { margin-top: 30px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
  .refusal { margin: 0; font-size: 16px; color: var(--rose); font-style: italic; }
  .ready { margin: 0; font-size: 16px; color: var(--wiped-soft); font-style: italic; }
  .credit { text-align: center; color: rgba(214,223,224,0.5); font-size: 14px; margin-top: 30px; font-style: italic; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  @media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
</style>
