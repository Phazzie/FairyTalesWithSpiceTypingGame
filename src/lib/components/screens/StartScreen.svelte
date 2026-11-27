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
  import CourtCaption from '../ui/CourtCaption.svelte';
  import Stamp from '../ui/Stamp.svelte';
  import { courtDate } from '$lib/court';

  const filedOn = courtDate();

  // Start from the last settings used, so "Try Again" after an error keeps your picks.
  const previous = $settings;
  let spiceLevel: SpiceLevel = previous?.spiceLevel ?? 3;
  let speedSetting: SpeedSetting = previous?.speedSetting ?? 'normal';
  let selectedThemes: string[] = previous?.selectedThemes ? [...previous.selectedThemes] : [];
  let characterIdea = previous?.characterIdea ?? '';
  let loveInterestIdea = previous?.loveInterestIdea ?? '';
  let setting = previous?.setting ?? '';
  let plotHook = previous?.plotHook ?? '';
  let showCustomize = false;
  let savedState = false;
  let savedDay = 1;

  onMount(() => {
    const save = loadGame();
    savedState = save !== null;
    savedDay = save?.currentChapter ?? 1;
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
    chapterStats.set([]); currentChapter.set(1); transcript.set([]);
    currentPhraseIndex.set(0); shivaPosition.set(START_POSITION);
    isRunning.set(false); isPaused.set(false);

    try {
      transitionTo('GENERATING');
      loadingMessage.set('The witness is being sworn in');

      const genRes = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spiceLevel,
          customization: { selectedThemes, characterIdea, loveInterestIdea, setting, plotHook },
        }),
      });

      if (!genRes.ok) throw new Error('The witness could not be sworn in (story generation failed).');
      const genData = await genRes.json();
      story.set(genData.story);

      transitionTo('GRADING');
      loadingMessage.set('The jury is reviewing the testimony');

      transitionTo('EXTRACTING');
      loadingMessage.set('The clerk is cutting the stenograph tape');

      const extractRes = await fetch('/api/extract-phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterProse: genData.story.chapters[0].prose }),
      });

      if (!extractRes.ok) throw new Error('The clerk could not cut the stenograph tape (phrase extraction failed).');
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
  <article class="paper sheet" aria-labelledby="notice-title">
    <div class="right-rule"></div>

    <div class="filed" aria-hidden="true">
      <Stamp tone="blue" rotate={7} size="sm">Filed<br />{filedOn}<br />Clerk of Court</Stamp>
    </div>

    <CourtCaption title="Notice of appointment of court reporter; schedule of proceedings" />

    <h1 id="notice-title" class="font-court headline">
      <span class="kicker">In re</span>
      Fairytales with Spice
      <span class="sub">a werewolf romance, taken down word for word, by you</span>
    </h1>
    <div class="explicit" aria-hidden="true">
      <Stamp tone="red" rotate={-9} size="md">{spiceLevel >= 5 ? 'Sealed: explicit testimony' : spiceLevel >= 3 ? 'Contains explicit testimony' : 'Testimony may cause blushing'}</Stamp>
    </div>

    <section class="notice">
      <p><strong>TO THE COURT REPORTER:</strong></p>
      <ol>
        <li>You are appointed to take down the testimony in this matter. Trial runs three (3) days.</li>
        <li>Each line of testimony comes off the stenograph tape. Type it before the defendant reaches the courtroom door.</li>
        <li>Lines you take down enter the record. Lines you miss enter the record as <span class="inaudible">[INAUDIBLE]</span>.</li>
        <li>At the close of trial you certify the transcript, and the jury rules on how much of the romance survived.</li>
      </ol>
    </section>

    {#if savedState}
      <section class="docket" data-testid="resume">
        <div>
          <strong>ON THE DOCKET:</strong> an adjourned session of this case, Day {savedDay} of 3.
          <span class="sr-only">You have a saved game</span>
        </div>
        <Button variant="secondary" on:click={resumeGame}>Reconvene</Button>
      </section>
    {/if}

    <section class="schedule">
      <h2 class="font-court">Schedule of proceedings</h2>

      <fieldset>
        <legend>A. Rating of the proceedings</legend>
        <SpiceSelector bind:value={spiceLevel} on:change={e => spiceLevel = e.detail as SpiceLevel} />
      </fieldset>

      <fieldset>
        <legend>B. Rate of speech</legend>
        <SpeedSelector bind:value={speedSetting} on:change={e => speedSetting = e.detail as SpeedSetting} />
      </fieldset>

      <fieldset>
        <legend>C. Counts charged against the defendant <span class="req">(choose exactly three)</span></legend>
        <ThemeGrid bind:selected={selectedThemes} on:change={e => selectedThemes = e.detail} />
      </fieldset>

      <fieldset>
        <legend>
          <button type="button" class="exhibits-toggle" aria-expanded={showCustomize} on:click={() => showCustomize = !showCustomize}>
            D. Exhibits <span class="req">(optional)</span> <span aria-hidden="true">{showCustomize ? '−' : '+'}</span>
          </button>
        </legend>
        {#if showCustomize}
          <div class="exhibits">
            <label for="characterIdea">Exhibit A. The protagonist</label>
            <input id="characterIdea" bind:value={characterIdea} type="text" maxlength="100" placeholder="a botanist who studies rare plants" />
            <label for="loveInterestIdea">Exhibit B. The love interest</label>
            <input id="loveInterestIdea" bind:value={loveInterestIdea} type="text" maxlength="100" placeholder="a brooding pack alpha with a secret" />
            <label for="setting">Exhibit C. The scene</label>
            <input id="setting" bind:value={setting} type="text" maxlength="100" placeholder="a remote mountain research station" />
            <label for="plotHook">Exhibit D. The motive</label>
            <input id="plotHook" bind:value={plotHook} type="text" maxlength="150" placeholder="she holds a key the pack has been searching for" />
          </div>
        {/if}
      </fieldset>
    </section>

    <div class="submit">
      <Button disabled={selectedThemes.length !== 3} on:click={generate}>
        File and call the first witness
      </Button>
      {#if selectedThemes.length !== 3}
        <p class="refusal">The clerk will not accept a filing with fewer than three counts.</p>
      {/if}
    </div>

    <footer class="page-foot">NOTICE OF APPOINTMENT · PAGE 1 OF 1</footer>
  </article>

  <p class="credit">Fairytales with Spice is a Skeptical Wombat production. Game by Phazzie.</p>
</div>

<style>
  .wrap { max-width: 780px; margin: 0 auto; padding: 28px 12px 40px; }
  .sheet { font-size: 15px; }
  .filed { position: absolute; top: 18px; right: 26px; z-index: 1; }
  .headline { margin: calc(var(--line) * 1.2) 0 var(--line); text-align: center; font-size: clamp(30px, 6vw, 46px); line-height: 1.05; font-weight: 700; letter-spacing: -0.01em; }
  .kicker { display: block; font-size: 15px; font-style: italic; font-weight: 400; letter-spacing: 0.04em; margin-bottom: 6px; color: var(--ink-soft); }
  .sub { display: block; font-size: 16px; font-style: italic; font-weight: 400; margin-top: 10px; color: var(--ink-soft); }
  .explicit { text-align: center; margin: -6px 0 var(--line); }
  .notice ol { margin: 0; padding-left: 2.2em; list-style: decimal; }
  .notice li { margin: 0 0 4px; }
  .notice p { margin: 0 0 4px; }
  .docket { margin: var(--line) 0 0; padding: 10px 14px; background: var(--highlight); border: 1px dashed var(--ink); display: flex; gap: 14px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
  .schedule h2 { text-align: center; text-transform: uppercase; letter-spacing: 0.12em; font-size: 15px; margin: calc(var(--line) * 1.2) 0 10px; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--ink); padding: 4px 0; }
  fieldset { border: none; margin: 0 0 18px; padding: 0; min-width: 0; }
  legend { font-weight: 700; margin-bottom: 6px; padding: 0; }
  .req { font-weight: 400; color: var(--ink-soft); }
  .exhibits-toggle { background: none; border: none; padding: 0; font: inherit; font-weight: 700; color: inherit; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
  .exhibits { display: grid; gap: 2px; margin-top: 6px; }
  .exhibits label { font-size: 13px; color: var(--ink-soft); margin-top: 8px; }
  .exhibits input { font: inherit; background: transparent; border: none; border-bottom: 1px solid var(--ink); padding: 4px 0; color: var(--ink); outline: none; }
  .exhibits input::placeholder { color: var(--ink-faint); font-style: italic; }
  .exhibits input:focus { background: var(--highlight); }
  .submit { margin-top: var(--line); display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
  .refusal { margin: 0; font-size: 13px; color: var(--stamp-red); font-style: italic; }
  .page-foot { margin-top: calc(var(--line) * 1.5); text-align: center; font-size: 11px; letter-spacing: 0.14em; color: var(--ink-soft); }
  .credit { text-align: center; color: #b9ab93; font-size: 13px; margin-top: 22px; font-family: var(--font-court); font-style: italic; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  @media (max-width: 520px) {
    .filed { position: static; display: flex; justify-content: flex-end; margin: -6px 0 10px; }
  }
</style>
