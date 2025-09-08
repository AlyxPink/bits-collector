<script lang="ts">
  interface Props {
    pixelsPerSecond: number;
    speedMultiplier: number;
  }

  let { pixelsPerSecond, speedMultiplier }: Props = $props();
</script>

<div class="flex justify-between items-center px-4 py-2 bg-green-500/10 border-b border-green-500/30">
  <div class="text-green-400 text-xs font-bold uppercase tracking-wider glow-text">
    AUTO-BUY STREAM
  </div>
  <div class="flex items-center gap-2 text-xs">
    <span class="text-cyan-400 font-mono font-bold">
      {pixelsPerSecond}/s
    </span>
    {#if speedMultiplier > 1}
      <span class="text-yellow-400 font-bold">
        {speedMultiplier.toFixed(1)}x
      </span>
    {/if}
  </div>
</div>