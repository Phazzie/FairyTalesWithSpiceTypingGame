<script lang="ts">
  import { story, transitionTo } from '$lib/stores/app';
  import { score, bestCombo, chapterStats } from '$lib/stores/game';
  import { clearGame } from '$lib/utils/storage';
  import Button from '../ui/Button.svelte';

  $: totalCaught = $chapterStats.reduce((sum, s) => sum + s.caught, 0);
  $: totalMissed = $chapterStats.reduce((sum, s) => sum + s.missed, 0);
  $: totalPhrases = $chapterStats.reduce((sum, s) => sum + s.total, 0);
  $: accuracy = totalPhrases > 0 ? Math.round((totalCaught / totalPhrases) * 100) : 0;

  function startNew() {
    clearGame();
    transitionTo('START');
  }
</script>

<div class="min-h-screen flex flex-col items-center py-12 px-4">
  <div class="w-full max-w-2xl space-y-6">
    <!-- Header -->
    <div class="text-center space-y-3">
      <div class="text-5xl">🐺🌕✨</div>
      <h1 class="text-4xl font-bold text-purple-400">Your Story is Complete!</h1>
      <p class="text-slate-400">The moon has witnessed your tale...</p>
    </div>

    <!-- Final stats -->
    <div class="bg-slate-800 border border-purple-500/40 rounded-xl p-6">
      <h3 class="text-lg font-bold text-purple-300 mb-4">Final Results</h3>
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-3xl font-bold text-yellow-400">{$score.toLocaleString()}</div>
          <div class="text-slate-400 text-sm">Final Score</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-green-400">{accuracy}%</div>
          <div class="text-slate-400 text-sm">Accuracy</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-purple-400">×{$bestCombo}</div>
          <div class="text-slate-400 text-sm">Best Combo</div>
        </div>
      </div>
    </div>

    <!-- Full story -->
    {#if $story}
      <div class="space-y-4">
        <h2 class="text-2xl font-bold text-slate-100">
          {$story.metadata.characterNames.protagonist} & {$story.metadata.characterNames.alpha}
        </h2>
        <p class="text-slate-400 text-sm italic">{$story.metadata.storyArc}</p>

        {#each $story.chapters as chapter}
          <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-3">
            <h3 class="text-xl font-bold text-purple-300">
              Chapter {chapter.number}: {chapter.title}
            </h3>
            <p class="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{chapter.prose}</p>
            {#if chapter.cliffhanger}
              <p class="text-purple-400 italic text-sm border-t border-purple-500/20 pt-3">
                "{chapter.cliffhanger}"
              </p>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <div class="flex justify-center">
      <Button variant="primary" on:click={startNew}>✨ Start New Story</Button>
    </div>
  </div>
</div>
