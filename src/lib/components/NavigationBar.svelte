<script lang="ts">
import { pixels } from "$lib/stores/pixels";
import { compositeColors, mixedColorsUnlocked, pureColorsUnlocked } from "$lib/stores/compositeColors";
import SettingsButton from "./SettingsButton.svelte";

interface Props {
	onSettingsClick: () => void;
}

let { onSettingsClick }: Props = $props();
</script>

<nav class="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-green-500/30 z-50">
  <div class="px-4 py-2">
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
          {@const mixedWithCounts = Object.values($compositeColors).filter(c => c.type === "mixed" && c.count > 0)}
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
          {@const pureWithCounts = Object.values($compositeColors).filter(c => c.type === "pure" && c.count > 0)}
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