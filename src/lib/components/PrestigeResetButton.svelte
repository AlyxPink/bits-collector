<script lang="ts">
  import { lux, formatLux } from "$lib/currency/implementations/LuxCurrency";
  import { lumen } from "$lib/currency/implementations/LumenCurrency";

  function handlePrestige() {
    const success = lux.performPrestige();
    if (success) {
      // Could add visual feedback here
      console.log("Prestige successful! +1 Lumen gained!");
    }
  }

  $: canPrestige = $lux.total >= 10;
  $: currentReward = lux.getLumenReward();
  $: nextThreshold = lux.getNextThreshold();
</script>

<!-- Prestige Reset Section -->
<div class="{canPrestige 
  ? 'bg-gradient-to-br from-yellow-900/20 via-orange-900/20 to-red-900/20 border border-yellow-500/30 shadow-lg shadow-yellow-500/10' 
  : 'bg-gradient-to-br from-gray-900/40 via-gray-800/40 to-gray-900/40 border border-gray-600/50 shadow-none'} rounded-lg p-6 text-center space-y-4">
  <!-- Header -->
  <div class="space-y-2">
    <div class="text-2xl">🌟</div>
    <h3 class="text-xl font-bold text-yellow-400 uppercase tracking-wide">
      Transcendence Reset
    </h3>
    <div class="text-sm text-yellow-200/70">
      You have {formatLux($lux.displayTotal)} Lux
    </div>
  </div>

  <!-- Prestige Button -->
  <div class="space-y-3">
    {#if canPrestige}
      <button
        onclick={handlePrestige}
        class="w-full py-3 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/40 animate-pulse shadow-lg shadow-yellow-500/30"
      >
        ✨ Reset for +{currentReward} Lumen ✨
      </button>
      <div class="text-sm text-green-300">
        Next: +{nextThreshold.reward} Lumen at {formatLux(nextThreshold.lux)} Lux
      </div>
    {:else}
      <button
        disabled
        class="w-full py-3 px-6 bg-gray-800 border border-gray-600 text-gray-500 font-bold text-lg rounded-lg cursor-not-allowed opacity-40 shadow-none"
      >
        Need 10.0 Lux to reset for +1 Lumen
      </button>
      <div class="text-sm text-gray-500">
        Collect more Lux to unlock transcendence
      </div>
    {/if}
  </div>

  <!-- Personal Records -->
  <div class="space-y-2 pt-4 border-t border-yellow-500/20">
    <div class="text-xs text-yellow-200/60 font-semibold uppercase tracking-wider">
      Personal Records
    </div>
    <div class="flex justify-between text-sm">
      <span class="text-yellow-300">Your best Lux:</span>
      <span class="font-bold text-white">{formatLux($lux.bestLux)}</span>
    </div>
    <div class="flex justify-between text-sm">
      <span class="text-yellow-300">Total Lumen earned:</span>
      <span class="font-bold text-white">{$lux.totalLumenEarned}</span>
    </div>
    {#if $lux.prestigeLevel > 0}
      <div class="flex justify-between text-sm">
        <span class="text-orange-300">Transcendence level:</span>
        <span class="font-bold text-orange-200">★{$lux.prestigeLevel}</span>
      </div>
    {/if}
  </div>

  <!-- Encouraging Message -->
  <div class="text-xs text-yellow-200/50 italic leading-relaxed pt-2 border-t border-yellow-500/10">
    "Transcending is not losing progress—it's ascending to new heights of power!"
  </div>
</div>