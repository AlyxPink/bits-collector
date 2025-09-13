<script lang="ts">
  import { lumen, lumenPerSecond } from "$lib/stores/lumen";
  import LumenButton from "./LumenButton.svelte";

  // Format lumen per second to show satisfying feedback
  function formatLumenPerSecond(value: number): string {
    return value.toFixed(2);
  }
</script>

<div class="h-full flex flex-col justify-center items-center gap-8">
  <h2 class="text-2xl font-bold uppercase tracking-wider text-yellow-400 glow-text mb-4">
    Lumen Energy
  </h2>

  <!-- Lumen Display Button -->
  <LumenButton count={$lumen.total} />

  <!-- Lumen Per Second Display -->
  {#if $lumenPerSecond > 0}
    <div class="text-center">
      <div class="text-lg font-bold text-yellow-300 mb-1">
        {formatLumenPerSecond($lumenPerSecond)} lumen/sec
      </div>
      <div class="text-xs opacity-60">
        Automatic generation active
      </div>
    </div>
  {/if}

  <!-- Instructions -->
  <div class="text-center mt-8 opacity-60 text-sm space-y-1">
    <p class="text-yellow-400 uppercase tracking-wider font-bold text-xs">
      Lumen Energy:
    </p>
    <p>Pure concentrated light energy</p>
    <p>Use lumen to unlock powerful generators</p>
    <p class="text-yellow-400 mt-2">
      Visit the Luminance tab to begin generating!
    </p>
  </div>
</div>