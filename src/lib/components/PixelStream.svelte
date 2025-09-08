<script lang="ts">
  import { pixelStream, type StreamPixel } from '$lib/stores/pixelStream';
  import { ownedBitsBuyers, totalSpeedMultiplier } from '$lib/stores/upgrades';
  
  // Matrix dimensions
  const MATRIX_WIDTH = 30;
  const MATRIX_HEIGHT = 10;
  
  let pixelMatrix = $state<(StreamPixel | null)[][]>([]);
  let stats = $state({ totalPixels: 0, pixelsPerSecond: 0, recentPixelCount: 0, colorDistribution: { red: 0, green: 0, blue: 0 } });
  
  // Update matrix and stats regularly
  if (typeof window !== 'undefined') {
    setInterval(() => {
      pixelMatrix = pixelStream.getPixelMatrix();
      stats = pixelStream.getStats();
    }, 50); // 20 FPS for smooth animation
  }
  
  function getPixelClasses(pixel: StreamPixel | null): string {
    if (!pixel) {
      return 'w-2 h-2 border border-gray-800/50 bg-gray-950/50 transition-all duration-100';
    }
    
    const colorClasses = {
      red: 'bg-red-500 border-red-400/50 shadow-red-500/50',
      green: 'bg-green-500 border-green-400/50 shadow-green-500/50',
      blue: 'bg-blue-500 border-blue-400/50 shadow-blue-500/50'
    };
    
    return `w-2 h-2 border transition-all duration-100 ${colorClasses[pixel.color]} animate-pulse`;
  }
  
  function getPixelStyle(pixel: StreamPixel | null): string {
    if (!pixel) return '';
    
    const glowIntensity = pixel.opacity * 0.8;
    const shadowColors = {
      red: '255, 0, 0',
      green: '0, 255, 0',
      blue: '0, 100, 255'
    };
    
    return `
      opacity: ${pixel.opacity};
      box-shadow: 
        0 0 ${glowIntensity * 10}px rgba(${shadowColors[pixel.color]}, ${glowIntensity}),
        inset 0 0 ${glowIntensity * 5}px rgba(${shadowColors[pixel.color]}, ${glowIntensity * 0.3});
      transform: scale(${0.8 + pixel.opacity * 0.2});
    `;
  }
</script>

{#if $ownedBitsBuyers.length > 0}
  <div class="fixed top-20 right-4 w-80 bg-black/80 border-2 border-green-500/50 rounded-lg overflow-hidden backdrop-blur-sm shadow-lg shadow-green-500/20 lg:block hidden">
    <!-- Header -->
    <div class="flex justify-between items-center px-4 py-2 bg-green-500/10 border-b border-green-500/30">
      <div class="text-green-400 text-xs font-bold uppercase tracking-wider glow-text">AUTO-BUY STREAM</div>
      <div class="flex items-center gap-2 text-xs">
        <span class="text-cyan-400 font-mono font-bold">
          {stats.pixelsPerSecond}/s
        </span>
        {#if $totalSpeedMultiplier > 1}
          <span class="text-yellow-400 font-bold">
            {$totalSpeedMultiplier.toFixed(1)}x
          </span>
        {/if}
      </div>
    </div>
    
    <!-- Pixel Matrix -->
    <div class="relative p-2 h-[120px]">
      {#each pixelMatrix as row, y}
        <div class="flex gap-0.5 h-[10px] mb-0.5">
          {#each row as pixel, x}
            <div 
              class={getPixelClasses(pixel)}
              style={getPixelStyle(pixel)}
            ></div>
          {/each}
        </div>
      {/each}
      
      <!-- Scanlines overlay -->
      <div class="absolute inset-0 pointer-events-none" style="background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px);"></div>
    </div>
    
    <!-- Color Distribution -->
    <div class="px-4 py-2 bg-gray-900/50 border-t border-green-500/20">
      <div class="flex justify-center gap-4">
        <div class="flex items-center gap-1 text-xs text-gray-400">
          <div class="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div>
          <span>{stats.colorDistribution.red}</span>
        </div>
        <div class="flex items-center gap-1 text-xs text-gray-400">
          <div class="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
          <span>{stats.colorDistribution.green}</span>
        </div>
        <div class="flex items-center gap-1 text-xs text-gray-400">
          <div class="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
          <span>{stats.colorDistribution.blue}</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Mobile/Tablet version -->
  <div class="relative w-full max-w-sm mx-auto mt-8 bg-black/80 border-2 border-green-500/50 rounded-lg overflow-hidden backdrop-blur-sm shadow-lg shadow-green-500/20 lg:hidden">
    <!-- Header -->
    <div class="flex justify-between items-center px-4 py-2 bg-green-500/10 border-b border-green-500/30">
      <div class="text-green-400 text-xs font-bold uppercase tracking-wider glow-text">AUTO-BUY STREAM</div>
      <div class="flex items-center gap-2 text-xs">
        <span class="text-cyan-400 font-mono font-bold">
          {stats.pixelsPerSecond}/s
        </span>
        {#if $totalSpeedMultiplier > 1}
          <span class="text-yellow-400 font-bold">
            {$totalSpeedMultiplier.toFixed(1)}x
          </span>
        {/if}
      </div>
    </div>
    
    <!-- Pixel Matrix (smaller on mobile) -->
    <div class="relative p-2 h-[100px]">
      {#each pixelMatrix as row, y}
        <div class="flex gap-0 h-[9px] mb-0.5">
          {#each row as pixel, x}
            <div 
              class={getPixelClasses(pixel).replace('w-2 h-2', 'w-1.5 h-1.5')}
              style={getPixelStyle(pixel)}
            ></div>
          {/each}
        </div>
      {/each}
      
      <!-- Scanlines overlay -->
      <div class="absolute inset-0 pointer-events-none" style="background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px);"></div>
    </div>
    
    <!-- Color Distribution -->
    <div class="px-4 py-2 bg-gray-900/50 border-t border-green-500/20">
      <div class="flex justify-center gap-4">
        <div class="flex items-center gap-1 text-xs text-gray-400">
          <div class="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div>
          <span>{stats.colorDistribution.red}</span>
        </div>
        <div class="flex items-center gap-1 text-xs text-gray-400">
          <div class="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
          <span>{stats.colorDistribution.green}</span>
        </div>
        <div class="flex items-center gap-1 text-xs text-gray-400">
          <div class="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
          <span>{stats.colorDistribution.blue}</span>
        </div>
      </div>
    </div>
  </div>
{/if}

