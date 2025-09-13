<script lang="ts">
import { pixels } from "$lib/stores/pixels";
import { mixedColors, mixedColorsUnlocked } from "$lib/currency/implementations/MixedColorsCurrency";
import { pureColors, pureColorsUnlocked } from "$lib/currency/implementations/PureColorsCurrency";
import { lux, formatLux, WINNING_GOAL } from "$lib/currency/implementations/LuxCurrency";
import SettingsButton from "$lib/components/settings/SettingsButton.svelte";

interface Props {
	onSettingsClick: () => void;
}

let { onSettingsClick }: Props = $props();

// Get dynamic styling based on lux amount
function getLuxStyling(total: number, intensity: number) {
	const baseClasses = "text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent transition-all duration-500";
	
	// Add glow effects based on amount
	if (total < 1000) {
		return `${baseClasses} drop-shadow-[0_0_8px_rgba(168,85,247,${0.3 + intensity * 0.2})]`;
	} else if (total < 100000) {
		return `${baseClasses} drop-shadow-[0_0_15px_rgba(168,85,247,${0.4 + intensity * 0.3})] hover:scale-105`;
	} else if (total < 10000000) {
		return `${baseClasses} drop-shadow-[0_0_20px_rgba(168,85,247,${0.5 + intensity * 0.4})] hover:scale-105 animate-pulse`;
	} else {
		return `${baseClasses} drop-shadow-[0_0_25px_rgba(168,85,247,${0.6 + intensity * 0.4})] hover:scale-105 animate-pulse`;
	}
}

function getLuxContainerStyling(total: number, intensity: number) {
	const baseClasses = "bg-gradient-to-r backdrop-blur-sm border rounded-lg px-4 py-2 transition-all duration-500";
	
	if (total < 1000) {
		return `${baseClasses} from-purple-900/10 to-cyan-900/10 border-purple-500/20`;
	} else if (total < 100000) {
		return `${baseClasses} from-purple-900/20 to-cyan-900/20 border-purple-500/30`;
	} else {
		return `${baseClasses} from-purple-900/30 to-cyan-900/30 border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,${0.2 + intensity * 0.3})]`;
	}
}
</script>

<nav class="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-green-500/30 z-50">
  <div class="px-4 py-2">
    <div class="flex justify-between items-start">
      <!-- Left: Multi-row Currency Display -->
      <div class="flex flex-col gap-1 flex-shrink-0">
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
      
      <!-- Center: Lux Display -->
      <div class="flex-1 text-center">
        <div class="flex items-center justify-center gap-3">
          <div class={getLuxContainerStyling($lux.displayTotal, lux.getDisplayIntensity())}>
            <span class={getLuxStyling($lux.displayTotal, lux.getDisplayIntensity())}>
              Lux: {formatLux($lux.displayTotal)}
            </span>
          </div>
          {#if lux.getPrestigeLevel() > 0}
            <div class="text-xs bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent font-semibold">
              ★{lux.getPrestigeLevel()}
            </div>
          {/if}
        </div>
        <div class="text-xs text-purple-200/70 mt-1">
          Reach {formatLux(WINNING_GOAL)} to transcend reality itself
        </div>
      </div>
      
      <!-- Right: Settings Button -->
      <div class="flex-shrink-0">
        <SettingsButton onclick={onSettingsClick} />
      </div>
    </div>
  </div>
</nav>

