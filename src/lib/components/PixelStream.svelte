<script lang="ts">
  import { pixelStream } from '$lib/stores/pixelStream';
  import { ownedBitsBuyers, totalSpeedMultiplier } from '$lib/stores/upgrades';
  import StreamHeader from './pixel-stream/StreamHeader.svelte';
  import PixelMatrix from './pixel-stream/PixelMatrix.svelte';
  import ColorStats from './pixel-stream/ColorStats.svelte';
  import { onMount, onDestroy } from 'svelte';
  
  let pixelMatrix = $state(pixelStream.getPixelMatrix());
  let stats = $state(pixelStream.getStats());
  
  // Animation loop with manual updates
  let animationFrame: number;
  
  onMount(() => {
    function animate() {
      // Manually update the matrix and stats every frame
      pixelMatrix = pixelStream.getPixelMatrix();
      stats = pixelStream.getStats();
      animationFrame = requestAnimationFrame(animate);
    }
    animationFrame = requestAnimationFrame(animate);
  });
  
  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

{#if $ownedBitsBuyers.length > 0}
  <!-- Desktop version -->
  <div class="fixed top-20 right-4 w-80 bg-black/80 border-2 border-green-500/50 rounded-lg overflow-hidden backdrop-blur-sm shadow-lg shadow-green-500/20 lg:block hidden">
    <StreamHeader 
      pixelsPerSecond={stats.pixelsPerSecond} 
      speedMultiplier={$totalSpeedMultiplier} 
    />
    <PixelMatrix pixels={pixelMatrix} size="normal" />
    <ColorStats colorDistribution={stats.colorDistribution} />
  </div>
  
  <!-- Mobile/Tablet version -->
  <div class="relative w-full max-w-sm mx-auto mt-8 bg-black/80 border-2 border-green-500/50 rounded-lg overflow-hidden backdrop-blur-sm shadow-lg shadow-green-500/20 lg:hidden">
    <StreamHeader 
      pixelsPerSecond={stats.pixelsPerSecond} 
      speedMultiplier={$totalSpeedMultiplier} 
    />
    <PixelMatrix pixels={pixelMatrix} size="small" />
    <ColorStats colorDistribution={stats.colorDistribution} />
  </div>
{/if}

