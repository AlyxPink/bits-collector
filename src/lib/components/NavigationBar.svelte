<script lang="ts">
import { pixels } from "$lib/stores/pixels";
import SettingsButton from "./SettingsButton.svelte";

interface Props {
	onSettingsClick: () => void;
}

let { onSettingsClick }: Props = $props();
</script>

<nav class="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-b border-green-500/30 z-50">
  <div class="px-4 py-3">
    <div class="flex justify-between items-center">
      <!-- Currency Display -->
      <div class="flex items-center gap-3 sm:gap-6">
        <div class="flex items-center gap-1 sm:gap-2">
          <span class="stats-label text-red-400 text-sm">R:</span>
          <span class="font-bold text-white min-w-[1.5rem] sm:min-w-[2rem] text-right text-sm sm:text-base">{$pixels.red}</span>
          <div class="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
        </div>
        
        <div class="flex items-center gap-1 sm:gap-2">
          <span class="stats-label text-green-400 text-sm">G:</span>
          <span class="font-bold text-white min-w-[1.5rem] sm:min-w-[2rem] text-right text-sm sm:text-base">{$pixels.green}</span>
          <div class="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
        </div>
        
        <div class="flex items-center gap-1 sm:gap-2">
          <span class="stats-label text-blue-400 text-sm">B:</span>
          <span class="font-bold text-white min-w-[1.5rem] sm:min-w-[2rem] text-right text-sm sm:text-base">{$pixels.blue}</span>
          <div class="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
        </div>
        
        <div class="w-px h-4 sm:h-6 bg-gray-600"></div>
        
        <div class="flex items-center gap-1 sm:gap-2">
          <span class="stats-label text-white text-sm">W:</span>
          <span class="font-bold text-white text-base sm:text-lg min-w-[1.5rem] sm:min-w-[2rem] text-right">{$pixels.white}</span>
          <div class="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg shadow-white/50"></div>
        </div>
      </div>
      
      <!-- Settings Button -->
      <SettingsButton onclick={onSettingsClick} />
    </div>
  </div>
</nav>

<!-- Spacer to prevent content from hiding under fixed nav -->
<div class="h-16"></div>