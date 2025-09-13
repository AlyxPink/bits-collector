<script lang="ts">
import { lumen } from "$lib/currency/implementations/LumenCurrency";

interface Props {
	count: number;
}

let { count }: Props = $props();

// Format lumen count to 2 decimal places for satisfying feedback
function formatLumen(value: number): string {
	return value.toFixed(2);
}
</script>

<div
  class="pixel-button border-yellow-500 text-yellow-400 bg-yellow-500/10 shadow-lg shadow-yellow-500/50 cursor-not-allowed opacity-90"
>
  <div class="flex flex-col items-center gap-2">
    <div class="text-2xl font-bold uppercase tracking-widest glow-text">
      LUMEN
    </div>
    <div class="text-4xl font-bold tabular-nums text-yellow-300">
      {formatLumen(count)}
    </div>
    <div class="text-xs opacity-75 uppercase">
      Pure energy
    </div>
  </div>
</div>