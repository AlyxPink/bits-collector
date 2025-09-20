<script lang="ts">
import { pixels, canConvert, conversionCost, createConversionEfficiencyStore } from "$lib/currency/implementations/PixelsCurrency";
import { gameStats } from "$lib/currency/implementations/GameStatsCurrency";
import { audio } from "$lib/stores/audio";
import { inputController } from "$lib/stores/inputController";
import { lumen } from "$lib/currency/implementations/LumenCurrency";
import { upgrades } from "$lib/currency/implementations/UpgradesCurrency";
import { getWhiteConversionRecipe } from "$lib/utils/recipes";

let isConverting = $state(false);
let buttonElement: HTMLButtonElement;

// Create efficiency store
const conversionEfficiency = createConversionEfficiencyStore(gameStats);

// Create derived stores that include lumen synergies
const lumenAdjustedConversionCost = $derived.by(() => {
	const lumenCostReduction = lumen.getConversionCostReduction();
	return pixels.getConversionCost($upgrades.breakthroughs, lumenCostReduction);
});

const lumenAdjustedCanConvert = $derived.by(() => {
	const lumenCostReduction = lumen.getConversionCostReduction();
	return pixels.canConvertAtCost($gameStats.totalConversions, $upgrades.breakthroughs, lumenCostReduction);
});

function handleConvert(event?: MouseEvent) {
	// Check if this click should be allowed (prevents held mouse button spam)
	if (event && !inputController.isMouseClickAllowed(event.button)) {
		return; // Block held mouse button spam
	}

	// Get lumen cost reduction for synergy
	const lumenCostReduction = lumen.getConversionCostReduction();
	
	if (lumenAdjustedCanConvert) {
		pixels.convertToWhite($gameStats.totalConversions, $upgrades.breakthroughs, lumenCostReduction);
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
  disabled={!lumenAdjustedCanConvert}
  class="pixel-button transition-all duration-300
    {lumenAdjustedCanConvert 
      ? 'border-white text-white bg-white/10 hover:bg-white/20 animate-pulse-glow cursor-pointer' 
      : 'border-gray-700 text-gray-600 bg-gray-900/50 cursor-not-allowed opacity-50'}
    {isConverting ? 'animate-pixel-pop' : ''} 
    {lumenAdjustedCanConvert ? 'shadow-lg shadow-white/50' : ''}"
  tabindex="0"
>
  <div class="flex flex-col items-center gap-2">
    <div class="text-xl font-bold uppercase tracking-widest">
      {lumenAdjustedCanConvert ? '⚡ Convert ⚡' : 'Convert'}
    </div>
    <div class="text-sm opacity-75">
      {lumenAdjustedCanConvert 
        ? 'Click to create WHITE pixel!' 
        : `Need ${lumenAdjustedConversionCost.red}R, ${lumenAdjustedConversionCost.green}G, ${lumenAdjustedConversionCost.blue}B`}
    </div>
    <div class="flex gap-4 text-xs mt-2">
      <span class="text-red-400">R: {lumenAdjustedConversionCost.red}</span>
      <span class="text-green-400">G: {lumenAdjustedConversionCost.green}</span>
      <span class="text-blue-400">B: {lumenAdjustedConversionCost.blue}</span>
      <span class="text-white">→</span>
      <span class="text-white font-bold">
        W: {Math.floor($conversionEfficiency)}
        {#if $conversionEfficiency < 1}
          <span class="text-gray-400">
            ({($conversionEfficiency * 100).toFixed(0)}%)
          </span>
        {/if}
      </span>
    </div>
    <div class="text-xs mt-1 opacity-75 font-mono">
      {getWhiteConversionRecipe()}
    </div>
  </div>
</button>