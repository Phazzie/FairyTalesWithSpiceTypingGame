<script lang="ts">
  export let value: number = 0; // 0-100
  export let color: string = 'bg-purple-500';
</script>

<div class="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
  <div
    class="{color} h-full rounded-full transition-all duration-300"
    style="width: {Math.max(0, Math.min(100, value))}%"
  ></div>
</div>
