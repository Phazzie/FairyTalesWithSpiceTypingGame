<script lang="ts">
  import { phase } from '$lib/stores/app';
  import StartScreen from '$lib/components/screens/StartScreen.svelte';
  import LoadingScreen from '$lib/components/screens/LoadingScreen.svelte';
  import GameplayScreen from '$lib/components/screens/GameplayScreen.svelte';
  import ChapterCompleteScreen from '$lib/components/screens/ChapterCompleteScreen.svelte';
  import StoryCompleteScreen from '$lib/components/screens/StoryCompleteScreen.svelte';
  import ErrorScreen from '$lib/components/screens/ErrorScreen.svelte';
</script>

<main class="min-h-screen bg-slate-900 text-slate-100">
  {#if $phase === 'START'}
    <StartScreen />
  {:else if $phase === 'GENERATING' || $phase === 'GRADING' || $phase === 'EXTRACTING'}
    <LoadingScreen />
  {:else if $phase === 'GAMEPLAY'}
    <GameplayScreen />
  {:else if $phase === 'CHAPTER_COMPLETE'}
    <ChapterCompleteScreen />
  {:else if $phase === 'STORY_COMPLETE'}
    <StoryCompleteScreen />
  {:else if $phase === 'ERROR'}
    <ErrorScreen />
  {/if}
</main>
