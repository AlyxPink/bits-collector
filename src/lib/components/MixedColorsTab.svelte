<script lang="ts">
  import { mixedColors } from "$lib/currency/implementations/MixedColorsCurrency";
  import { pureColorsUnlocked } from "$lib/currency/implementations/PureColorsCurrency";
  import { formatRecipeComponents } from "$lib/utils/recipes";
  import ColorButton from "./ColorButton.svelte";

  let mixedColorsList = $derived(mixedColors.getMixedColors());
  let unlockedCount = $derived(mixedColors.getUnlockedCount());
  let totalMixedColors = 6;
  let nextToUnlock = $derived(mixedColors.getNextToUnlock());
</script>

<div class="h-full flex flex-col justify-center items-center gap-8">
  <div class="text-center">
    <h2 class="text-2xl font-bold uppercase tracking-wider text-orange-400 glow-text mb-2">
      Mixed Colors
    </h2>
    <div class="text-sm text-orange-300 opacity-75">
      {unlockedCount}/{totalMixedColors} Unlocked
      {#if nextToUnlock}
        • Next: {nextToUnlock.name}
      {/if}
    </div>
  </div>


  <!-- Mixed colors grid -->
  <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
    {#each mixedColorsList as color}
      <ColorButton {color} store={mixedColors} />
    {/each}
  </div>

  <!-- Instructions and unlock hint -->
  <div class="text-center mt-8 opacity-60 text-sm space-y-2 max-w-lg">
    <p class="text-orange-400 uppercase tracking-wider font-bold text-xs">
      Mixed Color System:
    </p>
    <p>🔒 Spend RGB pixels to unlock each mixed color</p>
    <p>✨ Once unlocked: combine RGB pixels in different ratios to create colors</p>
    <p>Each mixed color requires 3 total pixels (2 of one + 1 of another)</p>
    
    {#if nextToUnlock}
      <div class="bg-orange-900/20 border border-orange-500/30 rounded p-3 mt-4">
        <p class="text-orange-300 font-bold">💡 Strategic Tip:</p>
        <p class="text-gray-300">Unlock {nextToUnlock.name} next to access {formatRecipeComponents(nextToUnlock.recipe)} mixing</p>
      </div>
    {/if}
    
    {#if !$pureColorsUnlocked}
      <p class="text-yellow-400 mt-3">
        Get 50 lifetime ⚪ to unlock Pure Colors!
      </p>
    {/if}
  </div>
</div>