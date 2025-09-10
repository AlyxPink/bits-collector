<script lang="ts">
import { autoConverters, type AutoConverter } from "$lib/stores/autoConverters";
import { pixels } from "$lib/stores/pixels";
import { audio } from "$lib/stores/audio";
import { type ColorVariant } from "$lib/utils/colors";
import GameCard from "$lib/components/ui/GameCard.svelte";
import GameButton from "$lib/components/ui/GameButton.svelte";

interface Props {
	converter: AutoConverter;
}

let { converter }: Props = $props();
let isPurchasing = $state(false);

let cost = $derived(autoConverters.getUpgradeCost(converter.id as any));
let canAfford = $derived($pixels.white >= cost && converter.level < converter.maxLevel);
let rate = $derived(autoConverters.getConversionRate(converter.id as any));
let nextLevelRate = $derived(
	converter.level >= converter.maxLevel 
		? 0 
		: converter.baseRate * Math.pow(converter.rateMultiplier, converter.level)
);

// Get variant color based on converter type and target color
let cardVariant: ColorVariant = $derived(
	converter.type === "white" 
		? "white"
		: converter.type === "pure"
			? converter.targetColor === "crimson"
				? "crimson"
				: converter.targetColor === "emerald"
					? "emerald"
					: converter.targetColor === "sapphire"
						? "sapphire"
						: "blue" // fallback
			: converter.type === "mixed"
				? converter.targetColor === "orange"
					? "orange"
					: converter.targetColor === "purple"
						? "purple"
						: converter.targetColor === "yellow"
							? "yellow"
							: converter.targetColor === "cyan"
								? "cyan"
								: converter.targetColor === "magenta"
									? "magenta"
									: converter.targetColor === "lime"
										? "lime"
										: "green" // fallback
				: "gray" // fallback
);

// Get conversion recipe text
let recipeText = $derived(
	converter.type === "white" 
		? "1R + 1G + 1B → 1W"
		: converter.type === "pure"
			? converter.targetColor === "crimson" 
				? "3R → 1 Crimson"
				: converter.targetColor === "emerald"
					? "3G → 1 Emerald"
					: converter.targetColor === "sapphire"
						? "3B → 1 Sapphire"
						: ""
			: converter.type === "mixed"
				? converter.targetColor === "orange"
					? "2R + 1G → 1 Orange"
					: converter.targetColor === "purple"
						? "2R + 1B → 1 Purple"
						: converter.targetColor === "yellow"
							? "1R + 2G → 1 Yellow"
							: converter.targetColor === "cyan"
								? "1G + 2B → 1 Cyan"
								: converter.targetColor === "magenta"
									? "1R + 2B → 1 Magenta"
									: converter.targetColor === "lime"
										? "2G + 1B → 1 Lime"
										: ""
				: ""
);

function handlePurchase() {
	if (!canAfford || isPurchasing || converter.level >= converter.maxLevel) return;

	isPurchasing = true;
	const success = autoConverters.upgradeConverter(converter.id as any);

	if (success) {
		audio.playPixelSound("green");
	} else {
		audio.playPixelSound("red");
	}

	setTimeout(() => {
		isPurchasing = false;
	}, 300);
}

function handleToggle() {
	if (converter.level === 0) return;
	autoConverters.toggleConverter(converter.id as any);
	audio.playPixelSound(converter.enabled ? "red" : "blue");
}
</script>

<GameCard variant={cardVariant} animated={isPurchasing}>
	<div class="flex justify-between items-start mb-3">
		<div>
			<div class="flex items-center gap-2">
				<h3 class="text-lg font-bold uppercase tracking-wide glow-text">
					{converter.name}
				</h3>
				{#if converter.level > 0}
					<button 
						onclick={handleToggle}
						class="w-6 h-6 rounded border-2 transition-all duration-200 {converter.enabled 
							? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50' 
							: 'bg-gray-700 border-gray-600 hover:bg-gray-600'}"
						title={converter.enabled ? 'Click to disable' : 'Click to enable'}
					>
						{#if converter.enabled}
							<div class="w-full h-full flex items-center justify-center text-white text-xs font-bold">
								✓
							</div>
						{/if}
					</button>
				{/if}
			</div>
			<p class="text-xs opacity-75 mt-1">
				{converter.description}
			</p>
			<p class="text-xs opacity-60 mt-1 font-mono">
				{recipeText}
			</p>
		</div>
		
		<div class="text-right">
			<div class="text-sm opacity-60">Level</div>
			<div class="text-xl font-bold tabular-nums">
				{converter.level}/{converter.maxLevel}
			</div>
		</div>
	</div>
	
	{#if converter.level > 0}
		<div class="space-y-2 mb-4">
			<div class="flex justify-between items-center text-sm">
				<span class="opacity-75">Current Rate:</span>
				<span class="font-bold tabular-nums {converter.enabled ? 'text-green-400' : 'text-gray-500'}">
					{rate.toFixed(2)}/sec
				</span>
			</div>
			
			{#if converter.level < converter.maxLevel}
				<div class="flex justify-between text-sm">
					<span class="opacity-75">Next Level:</span>
					<span class="font-bold tabular-nums text-yellow-400">
						{nextLevelRate.toFixed(2)}/sec
					</span>
				</div>
			{/if}
			
			{#if !converter.enabled}
				<div class="text-xs text-orange-400 text-center p-1 bg-orange-500/10 rounded">
					⚠️ Converter is disabled
				</div>
			{/if}
		</div>
	{:else}
		<div class="mb-4 p-2 bg-black/30 rounded">
			<div class="text-sm opacity-75 mb-1">First Purchase:</div>
			<div class="font-bold text-green-400">
				{converter.baseRate.toFixed(2)} conversions/sec
			</div>
		</div>
	{/if}
	
	{#if converter.level >= converter.maxLevel}
		<div class="w-full p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-center">
			<span class="text-yellow-400 font-bold">MAX LEVEL</span>
		</div>
	{:else}
		<GameButton 
			color={cardVariant}
			disabled={!canAfford}
			loading={isPurchasing}
			onclick={handlePurchase}
			class="w-full"
		>
			<div class="flex items-center justify-between">
				<span class="font-bold">
					{converter.level === 0 ? 'PURCHASE' : 'UPGRADE'}
				</span>
				<div class="flex items-center gap-2">
					<span class="text-white font-bold tabular-nums">
						{cost}
					</span>
					<div class="w-3 h-3 bg-white rounded-full shadow-lg shadow-white/50"></div>
				</div>
			</div>
		</GameButton>
	{/if}
</GameCard>