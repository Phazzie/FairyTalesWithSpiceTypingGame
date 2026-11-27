<script lang="ts">
  import { errorMessage, transitionTo } from '$lib/stores/app';
  import Button from '../ui/Button.svelte';
  import Wipe from '../ui/Wipe.svelte';

  function retry() {
    transitionTo('START');
  }

  function startOver() {
    errorMessage.set('');
    transitionTo('START');
  }
</script>

<div class="room">
  <article class="mirror card" role="alert">
    <p class="etch">Cold water</p>
    <Wipe tag="h1" size="lg">The hot water ran out.</Wipe>
    <p class="sr-only">Something went wrong</p>
    <p class="why">{$errorMessage || 'Nobody knows why. The pipes are groaning. A wolf is howling about it.'}</p>
    <p class="note">Everything you told the mirror is still here. Nothing was lost.</p>
    <div class="actions">
      <Button on:click={retry}>Try the water again</Button>
      <Button variant="secondary" on:click={startOver}>Start over</Button>
    </div>
  </article>
</div>

<style>
  .room { min-height: 100vh; display: grid; place-items: center; padding: 16px; }
  .card { width: min(560px, 100%); text-align: center; }
  p { margin: 0; }
  .why { margin-top: 14px; font-size: 19px; }
  .note { margin-top: 12px; color: var(--wiped-soft); font-style: italic; }
  .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 24px; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
