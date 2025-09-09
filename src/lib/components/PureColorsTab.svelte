<script lang="ts">
  import { pureColors } from "$lib/stores/compositeColors";
  import CompositeColorButton from "./CompositeColorButton.svelte";

  let pureColorsList = $derived($pureColors);
</script>

<div class="h-full flex flex-col justify-center items-center gap-8">
  <h2 class="text-2xl font-bold uppercase tracking-wider text-purple-400 glow-text mb-4">
    Pure Colors
  </h2>


  <!-- Pure colors grid (horizontal layout since only 3 colors) -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
    {#each pureColorsList as color}
      <CompositeColorButton {color} />
    {/each}
  </div>

  <!-- Instructions -->
  <div class="text-center mt-8 opacity-60 text-sm space-y-2 max-w-lg">
    <p class="text-purple-400 uppercase tracking-wider font-bold text-xs">
      Pure Concentration:
    </p>
    <p>Create the purest forms by using 3 pixels of the same color</p>
    <p>Pure colors are concentrated essences with deep, rich properties</p>
    <div class="text-center mt-4 text-xs text-gray-500">
      <p>❤️ Crimson: 3 Red pixels concentrated into deep crimson</p>
      <p>💚 Emerald: 3 Green pixels concentrated into brilliant emerald</p>
      <p>💙 Sapphire: 3 Blue pixels concentrated into pure sapphire</p>
    </div>
  </div>
</div>