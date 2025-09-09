<script lang="ts">
  import { pixelStream } from '$lib/stores/pixelStream';
  import { ownedGenerators, totalSpeedMultiplier } from '$lib/stores/upgrades';
  import StreamHeader from './pixel-stream/StreamHeader.svelte';
  import PixelMatrix from './pixel-stream/PixelMatrix.svelte';
  import ColorStats from './pixel-stream/ColorStats.svelte';
  import { onMount, onDestroy } from 'svelte';
  
  let pixelMatrix = $state(pixelStream.getPixelMatrix());
  let stats = $state(pixelStream.getStats());
  let containerRef: HTMLElement | undefined;
  
  // Animation loop with manual updates
  let animationFrame: number;
  
  onMount(() => {
    // Calculate optimal columns based on container width
    const updateColumns = () => {
      if (!containerRef) return;
      const containerWidth = containerRef.clientWidth;
      
      // More accurate calculation:
      // w-2 = 8px pixel width (will update PixelCell)
      // gap-1 = 4px gap between pixels
      // p-2 = 8px padding each side = 16px total
      const pixelWidth = 8;  // w-2
      const gapWidth = 4;    // gap-1 between pixels  
      const padding = 16;    // p-2 on container
      
      // Each pixel takes pixelWidth + gapWidth (except last one)
      const pixelTotalWidth = pixelWidth + gapWidth;
      const availableWidth = containerWidth - padding;
      const columns = Math.max(5, Math.floor(availableWidth / pixelTotalWidth));
      
      pixelStream.setMatrixDimensions(columns);
    };

    // Set up ResizeObserver to watch container size changes
    let resizeObserver: ResizeObserver | null = null;
    
    // Wait a tick for DOM to be fully mounted
    setTimeout(() => {
      if (typeof window !== 'undefined' && containerRef) {
        updateColumns(); // Initial calculation
        
        resizeObserver = new ResizeObserver(updateColumns);
        resizeObserver.observe(containerRef);
      }
    }, 0);

    // Animation loop with manual updates
    function animate() {
      pixelMatrix = pixelStream.getPixelMatrix();
      stats = pixelStream.getStats();
      animationFrame = requestAnimationFrame(animate);
    }
    animationFrame = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  });
  
  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

{#if $ownedGenerators.length > 0}
  <div bind:this={containerRef} class="w-full bg-black/50 border border-green-500/30 rounded-lg overflow-hidden backdrop-blur-sm">
    <StreamHeader 
      pixelsPerSecond={stats.pixelsPerSecond} 
      speedMultiplier={$totalSpeedMultiplier} 
    />
    <PixelMatrix pixels={pixelMatrix} size="small" />
    <ColorStats colorDistribution={stats.colorDistribution} />
  </div>
{/if}

