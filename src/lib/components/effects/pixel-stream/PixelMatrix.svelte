<script lang="ts">
import type { StreamPixel } from "$lib/stores/pixelStream";
import PixelCell from "./PixelCell.svelte";

interface Props {
	pixels: (StreamPixel | null)[][];
	size?: "small" | "normal";
	class?: string;
	height?: number;
}

let { pixels, size = "normal", class: className = "", height }: Props = $props();

// Dynamic height based on props or default
const actualHeight = height || (size === "small" ? 10 : 12);
const matrixHeightPx = actualHeight * (size === "small" ? 10 : 12) + 20; // Account for padding
const rowGap = size === "small" ? "gap-1" : "gap-1.5";
const rowHeight = size === "small" ? "h-[9px]" : "h-[10px]";
</script>

<div 
  class="relative p-2 {className}"
  style="height: {matrixHeightPx}px; will-change: transform; transform: translateZ(0);"
>
  {#each pixels.slice(0, actualHeight) as row, y}
    <div class="flex {rowGap} {rowHeight} mb-0.5" style="will-change: transform;">
      {#each row as pixel, x}
        <PixelCell {pixel} {size} />
      {/each}
    </div>
  {/each}
  
  <!-- Scanlines overlay -->
  <div 
    class="absolute inset-0 pointer-events-none opacity-10"
    style="background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px);"
  ></div>
</div>