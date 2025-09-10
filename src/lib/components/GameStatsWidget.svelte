<script lang="ts">
import { pixels, conversionCost, createConversionEfficiencyStore } from "$lib/stores/pixels";
import { upgrades, tabUnlockStatus } from "$lib/stores/upgrades";
import { gameStats } from "$lib/stores/game";

// Create efficiency store
const conversionEfficiency = createConversionEfficiencyStore(gameStats);

// Calculate next soft cap threshold
function getNextSoftCap(lifetimeWhite: number): number {
	if (lifetimeWhite < 25) return 25;
	if (lifetimeWhite < 100) return 100;
	if (lifetimeWhite < 500) return 500;
	return Math.ceil(lifetimeWhite * 1.5); // Continue scaling beyond 500
}

// Calculate theoretical vs effective production ratio
const theoreticalProduction = $derived(upgrades.getTotalProductionRate());
const effectiveProduction = $derived(upgrades.getEffectiveProductionRate());
const productionRatio = $derived(theoreticalProduction > 0 ? effectiveProduction / theoreticalProduction : 1);

// Get active soft cap tiers
function getActiveSoftCapTiers(lifetimeWhite: number): number {
	let tiers = 0;
	if (lifetimeWhite > 25) tiers++;
	if (lifetimeWhite > 100) tiers++;
	if (lifetimeWhite > 500) tiers++;
	return tiers;
}

// Get next tab to unlock
const nextTabToUnlock = $derived(() => {
	if (!$tabUnlockStatus.powerups?.unlocked) return 'powerups';
	if (!$tabUnlockStatus.breakthroughs?.unlocked) return 'breakthroughs';
	return null;
});
const nextTabCost = $derived(() => {
	const tabId = nextTabToUnlock();
	return tabId ? $tabUnlockStatus[tabId]?.cost : null;
});

let showAdvanced = $state(false);

// Track recent tab unlocks for visual feedback
let recentUnlock = $state<string | null>(null);

// Clear recent unlock notification after 3 seconds
$effect(() => {
	if (recentUnlock) {
		const timeout = setTimeout(() => {
			recentUnlock = null;
		}, 3000);
		return () => clearTimeout(timeout);
	}
});
</script>

<div class="space-y-3 text-xs">
	<!-- Success Notification -->
	{#if recentUnlock}
		<div class="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-400/50 rounded-lg p-2 text-center animate-pulse">
			<div class="text-green-400 font-bold">🎉 {recentUnlock} Unlocked!</div>
			<div class="text-xs text-green-300 mt-1">Check the Upgrades tab to explore new content</div>
		</div>
	{/if}

	<!-- Conversion Stats -->
	<div class="border-b border-cyan-500/20 pb-2">
		<div class="text-cyan-400 font-bold mb-1.5 flex items-center gap-1">
			⚡ Conversion
			<span class="text-xs text-gray-400 cursor-help" title="Shows how many RGB pixels you need to convert into 1 white pixel. Efficiency decreases as you make more conversions to prevent runaway growth.">ℹ️</span>
		</div>
		<div class="space-y-1">
			<div class="flex justify-between">
				<span class="text-gray-400">Cost:</span>
				<span class="text-white tabular-nums">
					{$conversionCost.red}R, {$conversionCost.green}G, {$conversionCost.blue}B
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-400">Efficiency:</span>
				<span class="text-white tabular-nums">
					{($conversionEfficiency * 100).toFixed(1)}%
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-400">Next Soft Cap:</span>
				<span class="text-white tabular-nums">
					{getNextSoftCap($pixels.lifetimeWhite)} lifetime
				</span>
			</div>
		</div>
	</div>
	
	<!-- Production Stats -->
	<div class="border-b border-yellow-500/20 pb-2">
		<div class="text-yellow-400 font-bold mb-1.5 flex items-center gap-1">
			🤖 Production
			<span class="text-xs text-gray-400 cursor-help" title="Shows how fast your generators produce bits per second. Theoretical is the raw rate, Effective is after soft caps reduce efficiency at high speeds.">ℹ️</span>
		</div>
		<div class="space-y-1">
			<div class="flex justify-between">
				<span class="text-gray-400">Theoretical:</span>
				<span class="text-white tabular-nums">
					{theoreticalProduction.toFixed(1)}/s
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-400">Effective:</span>
				<span class="text-white tabular-nums">
					{effectiveProduction.toFixed(1)}/s
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-400">Efficiency:</span>
				<span class="text-white tabular-nums {productionRatio < 0.9 ? 'text-orange-400' : productionRatio < 0.5 ? 'text-red-400' : ''}">
					{(productionRatio * 100).toFixed(1)}%
				</span>
			</div>
		</div>
	</div>
	
	<!-- Tab Unlocks -->
	<div class="border-b border-purple-500/20 pb-2">
		<div class="text-purple-400 font-bold mb-1.5 flex items-center">
			🔓 Tab Unlocks
		</div>
		<div class="space-y-1">
			<div class="flex justify-between">
				<span class="text-gray-400">Powerups:</span>
				<span class="{$tabUnlockStatus.powerups?.unlocked ? 'text-green-400' : 'text-red-400'}">
					{$tabUnlockStatus.powerups?.unlocked ? '✅ Purchased' : $tabUnlockStatus.powerups?.canAfford ? '💎 Can Buy' : '🔒 Locked'}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-400">Breakthroughs:</span>
				<span class="{$tabUnlockStatus.breakthroughs?.unlocked ? 'text-green-400' : 'text-red-400'}">
					{$tabUnlockStatus.breakthroughs?.unlocked ? '✅ Purchased' : $tabUnlockStatus.breakthroughs?.canAfford ? '💎 Can Buy' : '🔒 Locked'}
				</span>
			</div>
			{#if nextTabToUnlock() && nextTabCost()}
				{@const cost = nextTabCost()!}
				{@const tabName = nextTabToUnlock() === 'powerups' ? 'Powerups' : 'Breakthroughs'}
				{@const canAfford = $tabUnlockStatus[nextTabToUnlock()!]?.canAfford}
				<div class="mt-2 p-2 bg-black/20 rounded border border-purple-500/30">
					<div class="text-xs text-purple-400 font-bold mb-1">
						Next Purchase: {tabName}
					</div>
					<div class="grid grid-cols-2 gap-1 text-xs">
						<div class="flex items-center gap-1 {$pixels.white >= cost.white ? 'text-white' : 'text-red-400'}">
							<div class="w-2 h-2 rounded-full bg-white"></div>
							{cost.white}
						</div>
						<div class="flex items-center gap-1 {$pixels.red >= cost.red ? 'text-red-400' : 'text-red-600'}">
							<div class="w-2 h-2 rounded-full bg-red-500"></div>
							{cost.red}
						</div>
						<div class="flex items-center gap-1 {$pixels.green >= cost.green ? 'text-green-400' : 'text-green-600'}">
							<div class="w-2 h-2 rounded-full bg-green-500"></div>
							{cost.green}
						</div>
						<div class="flex items-center gap-1 {$pixels.blue >= cost.blue ? 'text-blue-400' : 'text-blue-600'}">
							<div class="w-2 h-2 rounded-full bg-blue-500"></div>
							{cost.blue}
						</div>
					</div>
					{#if canAfford}
						<div class="text-xs text-cyan-300 mt-1 text-center">
							💡 Go to Upgrades to purchase!
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Advanced Stats (collapsible) -->
	<details bind:open={showAdvanced} class="cursor-pointer">
		<summary class="text-gray-400 hover:text-white transition-colors select-none">
			📊 Advanced Stats
		</summary>
		{#if showAdvanced}
			<div class="mt-2 space-y-1 text-gray-500">
				<div class="flex justify-between">
					<span>Lifetime White:</span>
					<span class="tabular-nums">{$pixels.lifetimeWhite}</span>
				</div>
				<div class="flex justify-between">
					<span>Total Conversions:</span>
					<span class="tabular-nums">{$gameStats.totalConversions}</span>
				</div>
				<div class="flex justify-between">
					<span>Soft Cap Tiers:</span>
					<span class="tabular-nums">{getActiveSoftCapTiers($pixels.lifetimeWhite)}/3</span>
				</div>
				<div class="flex justify-between">
					<span>Speed Multiplier:</span>
					<span class="tabular-nums">{upgrades.getEffectiveMultiplier().toFixed(2)}x</span>
				</div>
				{#if theoreticalProduction > 0}
					<div class="flex justify-between">
						<span>Production Loss:</span>
						<span class="tabular-nums {productionRatio < 0.5 ? 'text-red-400' : productionRatio < 0.9 ? 'text-orange-400' : 'text-green-400'}">
							{((1 - productionRatio) * 100).toFixed(1)}%
						</span>
					</div>
				{/if}
			</div>
		{/if}
	</details>
</div>