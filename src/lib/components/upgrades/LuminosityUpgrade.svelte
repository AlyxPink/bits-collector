<script lang="ts">
	import { lumen, type LumenUpgrade } from "$lib/currency/implementations/LumenCurrency";

	interface Props {
		upgrade: LumenUpgrade;
	}

	let { upgrade }: Props = $props();

	let cost = $derived(lumen.getUpgradeCost(upgrade.id));
	let canAfford = $derived($lumen.total >= cost && (!upgrade.maxLevel || upgrade.level < upgrade.maxLevel));
	let isMaxed = $derived(upgrade.maxLevel ? upgrade.level >= upgrade.maxLevel : false);

	const handlePurchase = () => {
		if (canAfford && !isMaxed) {
			lumen.purchaseUpgrade(upgrade.id);
		}
	};

	// Format effect text based on upgrade type
	function getEffectText(upgrade: LumenUpgrade): string {
		if (upgrade.type === "multiplier") {
			return `${upgrade.effect}x multiplier`;
		} else if (upgrade.type === "efficiency") {
			return `+${((upgrade.effect - 1) * 100).toFixed(0)}% efficiency`;
		} else if (upgrade.type === "synergy") {
			if (upgrade.id === "chromaticResonance") {
				return `+${(upgrade.effect * 100).toFixed(0)}% RGB rate per 100 lumen`;
			} else if (upgrade.id === "whitePixelCatalyst") {
				return `-${(upgrade.effect * 100).toFixed(0)}% conversion cost per 1000 lumen`;
			} else if (upgrade.id === "luminousOverflow") {
				return `+${(upgrade.effect * 100).toFixed(0)}% RGB boost per 100 overflow`;
			}
			return `${upgrade.effect} effect`;
		}
		return "";
	}

	// Format large numbers
	function formatNumber(num: number): string {
		if (num < 1000) return num.toString();
		if (num < 1000000) return (num / 1000).toFixed(1) + "K";
		if (num < 1000000000) return (num / 1000000).toFixed(1) + "M";
		if (num < 1000000000000) return (num / 1000000000).toFixed(1) + "B";
		return (num / 1000000000000).toFixed(1) + "T";
	}

	// Get border color based on upgrade type
	function getBorderColor(type: string): string {
		switch (type) {
			case "multiplier": return "border-yellow-500";
			case "efficiency": return "border-purple-500";
			case "synergy": return "border-cyan-500";
			default: return "border-gray-500";
		}
	}

	// Get glow color for purchased upgrades
	function getGlowColor(type: string): string {
		switch (type) {
			case "multiplier": return "shadow-yellow-500/30";
			case "efficiency": return "shadow-purple-500/30";
			case "synergy": return "shadow-cyan-500/30";
			default: return "";
		}
	}
</script>

<div class="p-4 border-2 rounded-lg backdrop-blur-sm transition-all duration-200 bg-black/30 flex flex-col {getBorderColor(upgrade.type)} {upgrade.level > 0 ? 'shadow-lg ' + getGlowColor(upgrade.type) : ''}">
	<div class="flex justify-between items-start mb-3">
		<div class="flex-1">
			<h3 class="text-lg font-bold text-yellow-300 mb-1">
				{upgrade.name}
			</h3>
			<p class="text-sm opacity-75 leading-tight">
				{upgrade.description}
			</p>
		</div>
		{#if upgrade.level > 0}
			<div class="ml-3 px-2 py-1 bg-yellow-500/20 rounded-full">
				<span class="text-xs font-bold text-yellow-300">Lv. {upgrade.level}</span>
			</div>
		{/if}
	</div>

	<div class="flex-1 space-y-2">
		<div class="flex items-center justify-between text-sm">
			<span class="opacity-75">Effect:</span>
			<span class="font-semibold text-yellow-200">
				{getEffectText(upgrade)}
			</span>
		</div>

		{#if upgrade.level > 0}
			<div class="flex items-center justify-between text-sm">
				<span class="opacity-75">Current Boost:</span>
				<span class="font-bold text-green-400">
					{upgrade.type === "multiplier" 
						? `${Math.pow(upgrade.effect, upgrade.level).toFixed(1)}x`
						: upgrade.type === "efficiency"
						? `${Math.pow(upgrade.effect, upgrade.level).toFixed(2)}x`
						: `Level ${upgrade.level}`}
				</span>
			</div>
		{/if}

		{#if upgrade.maxLevel}
			<div class="w-full bg-gray-700 rounded-full h-2">
				<div 
					class="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-300"
					style="width: {(upgrade.level / upgrade.maxLevel) * 100}%"
				></div>
			</div>
			<div class="text-xs text-center opacity-75">
				{upgrade.level} / {upgrade.maxLevel}
			</div>
		{/if}
	</div>

	<button
		onclick={handlePurchase}
		disabled={!canAfford || isMaxed}
		class="mt-4 py-2 px-4 font-bold rounded-lg transition-all duration-300 transform
			   {isMaxed
				? 'bg-gray-700 text-gray-400 cursor-not-allowed'
				: canAfford
				? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30'
				: 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'}"
	>
		{#if isMaxed}
			MAX LEVEL
		{:else}
			<div class="flex items-center justify-center gap-2">
				<span>Buy for</span>
				<span class="font-bold">💡 {formatNumber(cost)} Lumen</span>
			</div>
		{/if}
	</button>
</div>