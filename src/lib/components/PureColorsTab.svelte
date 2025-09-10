<script lang="ts">
  import { pureColors, compositeColors } from "$lib/stores/compositeColors";
  import CompositeColorButton from "./CompositeColorButton.svelte";

  let pureColorsList = $derived($pureColors);
  let unlockedCount = $derived(compositeColors.getUnlockedCount("pure"));
  let totalPureColors = 3;
  let nextToUnlock = $derived(compositeColors.getNextToUnlock("pure"));
</script>

<div class="h-full flex flex-col justify-center items-center gap-8">
  <div class="text-center">
    <h2 class="text-2xl font-bold uppercase tracking-wider text-purple-400 glow-text mb-2">
      Pure Colors
    </h2>
    <div class="text-sm text-purple-300 opacity-75">
      {unlockedCount}/{totalPureColors} Unlocked
      {#if nextToUnlock}
        • Next: {nextToUnlock.name}
      {/if}
    </div>
  </div>


  <!-- Pure colors grid (horizontal layout since only 3 colors) -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
    {#each pureColorsList as color}
      <CompositeColorButton {color} />
    {/each}
  </div>

  <!-- Instructions -->
  <div class="text-center mt-8 opacity-60 text-sm space-y-3 max-w-2xl">
    <p class="text-purple-400 uppercase tracking-wider font-bold text-xs">
      Pure Color System & Generator Synergy:
    </p>
    <p>🔒 Spend RGB pixels to unlock each pure color (Higher costs!)</p>
    <p>✨ Once unlocked: create the purest forms by using 3 pixels of the same color</p>
    <p class="text-yellow-300 opacity-80">
      💡 <strong>Pure colors boost their matching RGB generators!</strong>
    </p>
    
    {#if nextToUnlock}
      <div class="bg-purple-900/20 border border-purple-500/30 rounded p-3 mt-4">
        <p class="text-purple-300 font-bold">🚀 Strategic Priority:</p>
        <p class="text-gray-300">Unlock {nextToUnlock.name} to boost your {nextToUnlock.id === "crimson" ? "Red" : nextToUnlock.id === "emerald" ? "Green" : "Blue"} Generator production!</p>
      </div>
    {/if}
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs">
      <div class="bg-red-900/20 border border-red-500/30 rounded p-3">
        <p class="text-red-400 font-bold">❤️ Crimson Boost</p>
        <p class="text-gray-300">3 Red pixels → Crimson</p>
        <p class="text-red-300">Boosts Red Generator rate</p>
      </div>
      <div class="bg-emerald-900/20 border border-emerald-500/30 rounded p-3">
        <p class="text-emerald-400 font-bold">💚 Emerald Boost</p>
        <p class="text-gray-300">3 Green pixels → Emerald</p>
        <p class="text-emerald-300">Boosts Green Generator rate</p>
      </div>
      <div class="bg-blue-900/20 border border-blue-500/30 rounded p-3">
        <p class="text-blue-400 font-bold">💙 Sapphire Boost</p>
        <p class="text-gray-300">3 Blue pixels → Sapphire</p>
        <p class="text-blue-300">Boosts Blue Generator rate</p>
      </div>
    </div>
    
    <div class="bg-purple-900/20 border border-purple-500/30 rounded p-3 mt-3 text-xs">
      <p class="text-purple-400 font-bold">🌈 Spectrum Synergy</p>
      <p class="text-gray-300">Having all three pure colors boosts Random Generator</p>
      <p class="text-yellow-300">✨ Perfect balance = maximum effect!</p>
    </div>
    
    <div class="text-xs text-gray-400 mt-4 space-y-1">
      <p>• Milestones at 10, 25, 50+ pure colors give bonus multipliers</p>
      <p>• Synergy bonus when you have all three pure color types</p>
      <p>• Check your generators to see current boost effects!</p>
    </div>
  </div>
</div>