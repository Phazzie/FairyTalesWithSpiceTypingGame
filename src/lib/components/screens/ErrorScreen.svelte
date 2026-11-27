<script lang="ts">
  import { errorMessage, transitionTo } from '$lib/stores/app';
  import Button from '../ui/Button.svelte';
  import Stamp from '../ui/Stamp.svelte';

  function retry() {
    transitionTo('START');
  }

  function startOver() {
    errorMessage.set('');
    transitionTo('START');
  }
</script>

<div class="hall">
  <article class="paper card" role="alert">
    <div class="right-rule"></div>
    <div class="stamp"><Stamp tone="red" rotate={-7} size="xl">Mistrial</Stamp></div>
    <h1 class="font-court">The court cannot proceed.</h1>
    <p class="sr-only">Something went wrong</p>
    <p><strong>GROUNDS:</strong></p>
    <p class="grounds">{$errorMessage || 'An irregularity occurred that nobody can explain. The wolves are howling in confusion.'}</p>
    <p class="note">Your choices on the filing are kept. Nothing was entered into the record.</p>
    <div class="actions">
      <Button on:click={retry}>Motion for retrial</Button>
      <Button variant="secondary" on:click={startOver}>Dismiss and start over</Button>
    </div>
  </article>
</div>

<style>
  .hall { min-height: 100vh; display: grid; place-items: center; padding: 16px; }
  .card { width: min(560px, 100%); }
  .stamp { text-align: center; margin: 10px 0 18px; }
  h1 { font-size: 26px; margin: 0 0 var(--line); text-align: center; }
  p { margin: 0; }
  .grounds { padding-left: 2.5em; }
  .note { margin-top: var(--line); color: var(--ink-soft); font-style: italic; }
  .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: calc(var(--line) * 1.2); }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
