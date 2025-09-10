<script lang="ts">
import { pixels } from "$lib/stores/pixels";
import { mixedColors, mixedColorsUnlocked } from "$lib/stores/mixedColors";
import { pureColors, pureColorsUnlocked } from "$lib/stores/pureColors";
import { lumen } from "$lib/stores/lumen";
import SettingsButton from "./SettingsButton.svelte";

interface Props {
	onSettingsClick: () => void;
}

let { onSettingsClick }: Props = $props();

// Format lumen numbers for display
function formatLumen(num: number): string {
	if (num < 1000) return num.toFixed(1);
	if (num < 1000000) return (num / 1000).toFixed(2) + "K";
	if (num < 1000000000) return (num / 1000000).toFixed(2) + "M";
	if (num < 1000000000000) return (num / 1000000000).toFixed(2) + "B";
	if (num < 1e15) return (num / 1e12).toFixed(2) + "T";
	if (num < 1e18) return (num / 1e15).toFixed(2) + "Qa";
	if (num < 1e21) return (num / 1e18).toFixed(2) + "Qi";
	// Use scientific notation for truly absurd numbers
	return num.toExponential(2);
}

// The absurd winning goal - like Prestige Tree's endgame
const WINNING_GOAL = 1.79e308; // Near JavaScript's max number
</script>

<nav class="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-green-500/30 z-50">
  <div class="px-4 py-2">
    <!-- Lumen Display - Prestige Tree Style -->
    <div class="text-center mb-2">
      <div class="flex items-center justify-center gap-2">
        <span class="text-2xl">💡</span>
        <span class="text-xl font-bold text-yellow-300">Lumens: {formatLumen($lumen.total)}</span>
      </div>
      <div class="text-xs text-yellow-200/70">
        Reach {formatLumen(WINNING_GOAL)} to become the brightest light in the universe
      </div>
    </div>
    
    <div class="flex justify-between items-start">
      <!-- Multi-row Currency Display -->
      <div class="flex flex-col gap-1">
        <!-- Row 1: RGB + White (always visible) -->
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
            <span class="font-bold text-white text-sm min-w-[1.5rem] text-right">{$pixels.red}</span>
          </div>
          
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
            <span class="font-bold text-white text-sm min-w-[1.5rem] text-right">{$pixels.green}</span>
          </div>
          
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
            <span class="font-bold text-white text-sm min-w-[1.5rem] text-right">{$pixels.blue}</span>
          </div>
          
          <div class="w-px h-4 bg-gray-600"></div>
          
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 bg-white rounded-full shadow-lg shadow-white/50"></div>
            <span class="font-bold text-white text-base min-w-[1.5rem] text-right">{$pixels.white}</span>
          </div>
        </div>
        
        <!-- Row 2: Mixed Colors (visible when unlocked and any owned) -->
        {#if $mixedColorsUnlocked}
          {@const mixedWithCounts = mixedColors.getMixedColors().filter(c => c.count > 0)}
          {#if mixedWithCounts.length > 0}
            <div class="flex items-center gap-3 sm:gap-4">
              {#each mixedWithCounts as color}
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 rounded-full shadow-lg {color.circleColor} {color.shadowColor}"></div>
                  <span class="font-bold text-white text-sm min-w-[1.5rem] text-right">{color.count}</span>
                </div>
              {/each}
            </div>
          {/if}
        {/if}
        
        <!-- Row 3: Pure Colors (visible when unlocked and any owned) -->
        {#if $pureColorsUnlocked}
          {@const pureWithCounts = pureColors.getPureColors().filter(c => c.count > 0)}
          {#if pureWithCounts.length > 0}
            <div class="flex items-center gap-3 sm:gap-4">
              {#each pureWithCounts as color}
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 rounded-full shadow-lg {color.circleColor} {color.shadowColor}"></div>
                  <span class="font-bold text-white text-sm min-w-[1.5rem] text-right">{color.count}</span>
                </div>
              {/each}
            </div>
          {/if}
        {/if}
      </div>
      
      <!-- Settings Button -->
      <div class="flex-shrink-0">
        <SettingsButton onclick={onSettingsClick} />
      </div>
    </div>
  </div>
</nav>

<style>
  /* Add glow effect when lumen count is high */
  :global(.lumen-glow) {
    text-shadow: 0 0 10px rgba(255, 193, 7, 0.6);
  }
</style>