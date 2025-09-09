<script lang="ts">
  import { mixedColors } from "$lib/stores/compositeColors";
  import { pureColorsUnlocked } from "$lib/stores/compositeColors";
  import CompositeColorButton from "./CompositeColorButton.svelte";

  let mixedColorsList = $derived($mixedColors);
</script>

<div class="h-full flex flex-col justify-center items-center gap-8">
  <h2 class="text-2xl font-bold uppercase tracking-wider text-orange-400 glow-text mb-4">
    Mixed Colors
  </h2>


  <!-- Mixed colors grid -->
  <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
    {#each mixedColorsList as color}
      <CompositeColorButton {color} />
    {/each}
  </div>

  <!-- Instructions and unlock hint -->
  <div class="text-center mt-8 opacity-60 text-sm space-y-2 max-w-lg">
    <p class="text-orange-400 uppercase tracking-wider font-bold text-xs">
      Color Mixing:
    </p>
    <p>Combine RGB pixels in different ratios to create new colors</p>
    <p>Each mixed color requires 3 total pixels (2 of one + 1 of another)</p>
    
    {#if !$pureColorsUnlocked}
      <p class="text-yellow-400 mt-3">
        Get 50 lifetime ⚪ to unlock Pure Colors!
      </p>
    {/if}
  </div>
</div>