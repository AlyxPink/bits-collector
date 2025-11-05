<script lang="ts">
import { pixelStream, pixelStreamAnimation } from "$lib/stores/pixelStream";
import { ownedGenerators, totalSpeedMultiplier } from "$lib/currency/implementations/UpgradesCurrency";
import StreamHeader from "./pixel-stream/StreamHeader.svelte";
import PixelMatrix from "./pixel-stream/PixelMatrix.svelte";
import ColorStats from "./pixel-stream/ColorStats.svelte";
import { onMount, onDestroy } from "svelte";

// Stream visibility settings with localStorage persistence
function loadStreamSettings() {
	if (typeof window === "undefined") {
		return { visible: true };
	}
	const saved = localStorage.getItem("pixelStreamSettings");
	if (saved) {
		try {
			return JSON.parse(saved);
		} catch {
			return { visible: true };
		}
	}
	return { visible: true };
}

let streamVisible = $state(loadStreamSettings().visible);

// Control animation loop based on visibility
$effect(() => {
	if (typeof window !== "undefined") {
		// Save visibility setting
		localStorage.setItem("pixelStreamSettings", JSON.stringify({ visible: streamVisible }));

		// Start/stop animation loop based on visibility
		if (streamVisible) {
			pixelStreamAnimation.start();
		} else {
			pixelStreamAnimation.stop();
			// Clear pixels when hidden to free memory
			pixelStream.clear();
		}
	}
});

let pixelMatrix = $state(pixelStream.getPixelMatrix());
let stats = $state(pixelStream.getStats());
let matrixDimensions = $state(pixelStream.getMatrixDimensions());
let containerRef = $state<HTMLElement | undefined>();

// Animation loop with manual updates
let animationFrame: number;

function toggleVisibility() {
	streamVisible = !streamVisible;
}

onMount(() => {
	// Calculate optimal columns based on container width
	const updateColumns = () => {
		if (!containerRef) return;
		const containerWidth = containerRef.clientWidth;

		// More accurate calculation:
		// w-2 = 8px pixel width (will update PixelCell)
		// gap-1 = 4px gap between pixels
		// p-2 = 8px padding each side = 16px total
		const pixelWidth = 8; // w-2
		const gapWidth = 4; // gap-1 between pixels
		const padding = 16; // p-2 on container

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
		if (typeof window !== "undefined" && containerRef) {
			updateColumns(); // Initial calculation

			resizeObserver = new ResizeObserver(updateColumns);
			resizeObserver.observe(containerRef);
		}
	}, 0);

	// Animation loop with manual updates - only run when visible
	// Throttle to 30 FPS for better performance (still smooth but less CPU)
	let lastFrameTime = 0;
	const frameInterval = 1000 / 30; // 30 FPS

	function animate(currentTime: number) {
		const elapsed = currentTime - lastFrameTime;

		if (streamVisible && elapsed >= frameInterval) {
			lastFrameTime = currentTime - (elapsed % frameInterval);
			pixelMatrix = pixelStream.getPixelMatrix();
			stats = pixelStream.getStats();
			matrixDimensions = pixelStream.getMatrixDimensions();
		}

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
  <div class="w-full">
    <!-- Header with toggle button -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-yellow-400">PIXEL STREAM</span>
        {#if stats.sampling}
          <span class="text-xs px-1.5 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded text-orange-400 font-bold">
            SAMPLING
          </span>
        {/if}
        {#if stats.pixelsPerSecond > 1000}
          <span class="text-xs px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-red-400 font-bold">
            HIGH RATE
          </span>
        {/if}
      </div>
      <button 
        onclick={toggleVisibility}
        class="text-xs px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 rounded transition-colors"
        title={streamVisible ? "Hide stream" : "Show stream"}
      >
        {streamVisible ? "⏷" : "⏵"}
      </button>
    </div>

    {#if streamVisible}
      <div 
        bind:this={containerRef} 
        class="w-full bg-black/50 border border-green-500/30 rounded-lg overflow-hidden backdrop-blur-sm"
        style="height: {matrixDimensions.height * 12 + 40}px; transition: height 0.3s ease;"
      >
        <StreamHeader 
          pixelsPerSecond={stats.pixelsPerSecond} 
          speedMultiplier={$totalSpeedMultiplier} 
          intensityWeightedRate={stats.intensityWeightedRate}
        />
        <PixelMatrix 
          pixels={pixelMatrix} 
          size="small" 
          height={matrixDimensions.height}
        />
        <ColorStats colorDistribution={stats.colorDistribution} />
      </div>
    {:else}
      <div class="w-full h-16 bg-black/30 border border-green-500/20 rounded-lg flex items-center justify-center">
        <span class="text-xs text-gray-400">Stream hidden for performance</span>
      </div>
    {/if}
  </div>
{/if}

