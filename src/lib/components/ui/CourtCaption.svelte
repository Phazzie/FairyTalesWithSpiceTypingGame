<script lang="ts">
  import { CASE } from '$lib/court';
  /** Document title printed on the right side of the caption. */
  export let title: string;
  export let compact = false;
</script>

<header class="caption" class:compact>
  {#if !compact}
    <div class="filer">
      <div>SKEPTICAL WOMBAT</div>
      <div>Studio of Phazzie</div>
      <div>Appearing in pro per</div>
    </div>
    <div class="court font-court">
      <div>{CASE.court}</div>
      <div>{CASE.county}</div>
    </div>
  {/if}
  <div class="grid">
    <div class="parties">
      <div>{CASE.plaintiff},</div>
      <div class="role">Plaintiff,</div>
      <div class="vs">v.</div>
      <div>{CASE.defendant},</div>
      <div class="role">Defendant.</div>
    </div>
    <div class="doc">
      <div>Case No. {CASE.number}</div>
      <div class="title">{title}</div>
      <div class="dept">{CASE.dept}</div>
    </div>
  </div>
</header>

<style>
  .caption { font-size: 14px; }
  .filer { margin-bottom: var(--line); text-transform: uppercase; font-size: 13px; }
  .filer div:not(:first-child) { text-transform: none; }
  .court { text-align: center; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; font-size: 15px; margin-bottom: var(--line); }
  .grid { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--ink); }
  .parties { border-right: 1px solid var(--ink); border-bottom: 1px solid var(--ink); padding: 4px 14px 6px 0; }
  .role { padding-left: 4em; }
  .vs { padding-left: 2em; margin: 2px 0; }
  .doc { padding: 4px 0 6px 14px; }
  .title { font-weight: 700; text-transform: uppercase; margin-top: 6px; line-height: 1.35; }
  .dept { margin-top: 6px; color: var(--ink-soft); }
  .compact { font-size: 12px; }
  .compact .grid { line-height: 1.4; }
  .compact .role { padding-left: 2em; }
  @media (max-width: 520px) {
    .grid { grid-template-columns: 1fr; }
    .parties { border-right: none; }
    .doc { padding-left: 0; }
  }
</style>
