<script lang="ts">
  import { redactProse, type TranscriptPart } from '$lib/utils/transcript';
  /** One chapter as it survived, with missed lines fogged back over. */
  export let prose: string;
  export let missedSegments: string[] = [];

  /** Redact across the whole chapter first (a missed segment can span paragraphs), then split into paragraphs. */
  function toParagraphs(text: string, missed: string[]): TranscriptPart[][] {
    const paragraphs: TranscriptPart[][] = [[]];
    for (const part of redactProse(text, missed)) {
      if (part.inaudible) {
        paragraphs[paragraphs.length - 1].push(part);
        continue;
      }
      part.text.split(/\n\s*\n/).forEach((chunk, i) => {
        if (i > 0) paragraphs.push([]);
        if (chunk) paragraphs[paragraphs.length - 1].push({ text: chunk, inaudible: false });
      });
    }
    return paragraphs.filter(p => p.some(x => x.text.trim()));
  }

  $: paragraphs = toParagraphs(prose, missedSegments);
  const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
</script>

<div class="transcript">
  {#each paragraphs as parts}
    <p>{#each parts as part}{#if part.inaudible}<span class="fogged" title="{words(part.text)} words lost to the steam">[fogged over: {words(part.text)} words]</span>{:else}{part.text}{/if}{/each}</p>
  {/each}
</div>

<style>
  .transcript { font-size: 19px; line-height: 1.55; }
  p { margin: 0 0 1em; white-space: pre-line; }
  p:last-child { margin-bottom: 0; }
</style>
