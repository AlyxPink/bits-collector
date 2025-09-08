<script lang="ts">
  import type { StreamPixel } from '$lib/stores/pixelStream';
  import PixelCell from './PixelCell.svelte';

  interface Props {
    pixels: (StreamPixel | null)[][];
    size?: 'small' | 'normal';
    class?: string;
  }

  let { pixels, size = 'normal', class: className = '' }: Props = $props();

  const matrixHeight = size === 'small' ? 'h-[100px]' : 'h-[120px]';
  const rowGap = size === 'small' ? 'gap-1' : 'gap-1.5';
  const rowHeight = size === 'small' ? 'h-[9px]' : 'h-[10px]';
</script>

<div class="relative p-2 {matrixHeight} {className}">
  {#each pixels as row, y}
    <div class="flex {rowGap} {rowHeight} mb-0.5">
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