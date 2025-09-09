<script lang="ts">
import { pixels, canConvert } from "$lib/stores/pixels";
import { gameStats } from "$lib/stores/game";
import { audio } from "$lib/stores/audio";
import { inputController } from "$lib/stores/inputController";

let isConverting = $state(false);
let buttonElement: HTMLButtonElement;

function handleConvert(event?: MouseEvent) {
	// Check if this click should be allowed (prevents held mouse button spam)
	if (event && !inputController.isMouseClickAllowed(event.button)) {
		return; // Block held mouse button spam
	}

	if ($canConvert) {
		pixels.convertToWhite();
		gameStats.incrementConversions();
		audio.playConvertSound();

		// Trigger animation
		isConverting = true;
		setTimeout(() => {
			isConverting = false;
		}, 500);
	}
}

function handleKeyDown(event: KeyboardEvent) {
	const key = event.key.toLowerCase();

	// Handle Enter, Space, and 'C' for Convert
	if (key === "enter" || key === " " || key === "c") {
		// Check if this key press is allowed (not held down)
		if (inputController.isKeyPressAllowed(key)) {
			event.preventDefault();
			handleConvert();
		} else {
			// Block held key spam
			event.preventDefault();
			event.stopPropagation();
		}
	}
}
</script>

<button
  bind:this={buttonElement}
  onclick={handleConvert}
  onkeydown={handleKeyDown}
  disabled={!$canConvert}
  class="pixel-button transition-all duration-300
    {$canConvert 
      ? 'border-white text-white bg-white/10 hover:bg-white/20 animate-pulse-glow cursor-pointer' 
      : 'border-gray-700 text-gray-600 bg-gray-900/50 cursor-not-allowed opacity-50'}
    {isConverting ? 'animate-pixel-pop' : ''} 
    {$canConvert ? 'shadow-lg shadow-white/50' : ''}"
  tabindex="0"
>
  <div class="flex flex-col items-center gap-2">
    <div class="text-xl font-bold uppercase tracking-widest">
      {$canConvert ? '⚡ Convert ⚡' : 'Convert'}
    </div>
    <div class="text-sm opacity-75">
      {$canConvert 
        ? 'Click to create WHITE pixel!' 
        : 'Need 1 of each RGB pixel'}
    </div>
    <div class="flex gap-4 text-xs mt-2">
      <span class="text-red-400">R: 1</span>
      <span class="text-green-400">G: 1</span>
      <span class="text-blue-400">B: 1</span>
      <span class="text-white">=</span>
      <span class="text-white font-bold">W: 1</span>
    </div>
  </div>
</button>