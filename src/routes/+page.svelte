<script lang="ts">
  import GameHeader from '$lib/components/GameHeader.svelte';
  import PixelButton from '$lib/components/PixelButton.svelte';
  import ConvertButton from '$lib/components/ConvertButton.svelte';
  import WhitePixelDisplay from '$lib/components/WhitePixelDisplay.svelte';
  import UpgradesSection from '$lib/components/UpgradesSection.svelte';
  import AutoBuyIndicator from '$lib/components/AutoBuyIndicator.svelte';
  import { pixels } from '$lib/stores/pixels';
  import { audio } from '$lib/stores/audio';
</script>

<div class="space-y-8">
  <!-- Auto-buy Indicator -->
  <AutoBuyIndicator />
  
  <!-- Game Header -->
  <GameHeader />
  
  <!-- White Pixel Display -->
  <div class="flex justify-center">
    <WhitePixelDisplay count={$pixels.white} />
  </div>

  <!-- RGB Pixel Clickers -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
    <PixelButton color="red" count={$pixels.red} />
    <PixelButton color="green" count={$pixels.green} />
    <PixelButton color="blue" count={$pixels.blue} />
  </div>

  <!-- Convert Button -->
  <div class="flex justify-center mt-8">
    <ConvertButton />
  </div>

  <!-- Upgrades Section -->
  {#if $pixels.white > 0}
    <div class="mt-12 mb-8">
      <UpgradesSection />
    </div>
  {/if}

  <!-- Audio Controls -->
  <div class="fixed bottom-4 right-4 space-y-2">
    <button
      onclick={() => audio.toggleSound()}
      class="pixel-button border-gray-500 text-gray-400 bg-gray-900/50 text-xs px-3 py-2"
    >
      {$audio.enabled ? '🔊' : '🔇'} Sound
    </button>
  </div>

  <!-- Instructions -->
  <div class="text-center max-w-2xl mx-auto mt-12 opacity-60 text-sm space-y-2">
    <p class="text-green-400 uppercase tracking-wider font-bold">Instructions:</p>
    <p>Click the colored pixel buttons to collect RGB pixels</p>
    <p>When you have at least 1 of each color, manually convert them to a WHITE pixel</p>
    <p class="text-cyan-400">Use white pixels to purchase auto-buyers and powerups!</p>
    <p class="text-yellow-400">Auto-buyers collect bits automatically, powerups multiply all rates!</p>
  </div>
</div>
