<script lang="ts">
	import { lumen, lumenPerSecond, lumenEfficiency } from "$lib/currency/implementations/LumenCurrency";
	import { pixels } from "$lib/stores/pixels";

	// Format numbers for display
	function formatNumber(num: number): string {
		if (num < 1000) return num.toFixed(2);
		if (num < 1000000) return (num / 1000).toFixed(2) + "K";
		if (num < 1000000000) return (num / 1000000).toFixed(2) + "M";
		return (num / 1000000000).toFixed(2) + "B";
	}

	// Get efficiency color based on percentage
	function getEfficiencyColor(efficiency: number): string {
		if (efficiency > 0.8) return "text-green-400";
		if (efficiency > 0.5) return "text-yellow-400";
		if (efficiency > 0.3) return "text-orange-400";
		return "text-red-400";
	}

	// Get next soft cap threshold
	function getNextSoftCap(currentRate: number): number {
		if (currentRate < 10) return 10;
		if (currentRate < 100) return 100;
		if (currentRate < 1000) return 1000;
		return Math.ceil(currentRate / 1000) * 1000;
	}

	// Calculate progress to next soft cap
	function getProgressToNextCap(currentRate: number): number {
		const nextCap = getNextSoftCap(currentRate);
		if (nextCap === 10) return Math.min(1, currentRate / 10);
		if (nextCap === 100) return Math.min(1, (currentRate - 10) / 90);
		if (nextCap === 1000) return Math.min(1, (currentRate - 100) / 900);
		return Math.min(1, (currentRate - 1000) / (nextCap - 1000));
	}

	$: efficiency = $lumenEfficiency;
	$: efficiencyPercent = Math.round(efficiency * 100);
	$: efficiencyColor = getEfficiencyColor(efficiency);
	$: nextCap = getNextSoftCap($lumenPerSecond);
	$: progress = getProgressToNextCap($lumenPerSecond);
</script>

<div class="lumen-rate-container">
	<div class="rate-header">
		<div class="rate-title">Lumen Generation</div>
		<div class="rate-efficiency {efficiencyColor}">
			{efficiencyPercent}% Efficiency
		</div>
	</div>

	<div class="rate-display">
		<div class="rate-amount">
			{formatNumber($lumenPerSecond)} <span class="rate-unit">lumen/sec</span>
		</div>
		{#if $pixels.white < 10}
			<div class="rate-requirement">
				Need 10 white pixels to start generating lumen
			</div>
		{/if}
	</div>

	{#if $lumenPerSecond > 0}
		<div class="soft-cap-progress">
			<div class="progress-label">
				Progress to next curve: {formatNumber(nextCap)} lumen/sec
			</div>
			<div class="progress-bar">
				<div class="progress-fill" style="width: {progress * 100}%"></div>
			</div>
			<div class="progress-percentage">{Math.round(progress * 100)}%</div>
		</div>
	{/if}

	<div class="efficiency-explanation">
		<div class="efficiency-icon">📊</div>
		<div class="efficiency-text">
			Generation follows a smooth curve - efficiency naturally decreases at higher rates, 
			but upgrades can improve the curve shape.
		</div>
	</div>
</div>

<style>
	.lumen-rate-container {
		@apply bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900;
		@apply border border-purple-600 rounded-lg p-4 space-y-3;
	}

	.rate-header {
		@apply flex justify-between items-center;
	}

	.rate-title {
		@apply text-purple-200 font-semibold;
	}

	.rate-efficiency {
		@apply text-sm font-medium;
	}

	.rate-display {
		@apply space-y-1;
	}

	.rate-amount {
		@apply text-white text-2xl font-bold;
		text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
	}

	.rate-unit {
		@apply text-purple-300 text-lg font-normal;
	}

	.rate-requirement {
		@apply text-yellow-400 text-sm italic;
	}

	.soft-cap-progress {
		@apply space-y-2;
	}

	.progress-label {
		@apply text-purple-300 text-sm;
	}

	.progress-bar {
		@apply w-full bg-purple-800/50 rounded-full h-2 overflow-hidden;
	}

	.progress-fill {
		@apply h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full;
		@apply transition-all duration-300 ease-out;
	}

	.progress-percentage {
		@apply text-purple-200 text-xs text-right;
	}

	.efficiency-explanation {
		@apply flex items-start gap-2 text-xs text-purple-300;
		@apply bg-purple-800/30 rounded p-2;
	}

	.efficiency-icon {
		@apply text-base flex-shrink-0;
	}

	.efficiency-text {
		@apply leading-relaxed;
	}
</style>