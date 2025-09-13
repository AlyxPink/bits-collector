<script lang="ts">
	import { lumen, lumenPerSecond } from "$lib/currency/implementations/LumenCurrency";
	import { onMount } from "svelte";

	// Format large numbers for display
	function formatNumber(num: number): string {
		if (num < 1000) return num.toFixed(1);
		if (num < 1000000) return (num / 1000).toFixed(1) + "K";
		if (num < 1000000000) return (num / 1000000).toFixed(1) + "M";
		if (num < 1000000000000) return (num / 1000000000).toFixed(1) + "B";
		return (num / 1000000000000).toFixed(1) + "T";
	}

	// Calculate glow intensity based on total lumen
	function getGlowIntensity(total: number): number {
		// Smooth glow that increases with lumen amount
		const intensity = Math.min(1, Math.log10(total + 1) / 6);
		return intensity;
	}

	// Get brightness class based on lumen amount
	function getBrightnessClass(total: number): string {
		if (total < 10) return "brightness-dim";
		if (total < 100) return "brightness-low";
		if (total < 1000) return "brightness-medium";
		if (total < 10000) return "brightness-high";
		return "brightness-extreme";
	}

	let mounted = false;
	onMount(() => {
		mounted = true;
	});

	$: glowIntensity = getGlowIntensity($lumen.total);
	$: brightnessClass = getBrightnessClass($lumen.total);
</script>

<div class="lumen-display {brightnessClass}" style="--glow-intensity: {glowIntensity}">
	<div class="lumen-icon">💡</div>
	<div class="lumen-content">
		<div class="lumen-title">Total Lumen</div>
		<div class="lumen-amount">{formatNumber($lumen.total)}</div>
		<div class="lumen-subtitle">Brightness Level</div>
	</div>
	{#if $lumenPerSecond > 0}
		<div class="lumen-rate">
			+{formatNumber($lumenPerSecond)}/sec
		</div>
	{/if}
</div>

<style>
	.lumen-display {
		@apply relative bg-gradient-to-br from-yellow-900 via-yellow-800 to-orange-900;
		@apply border-2 border-yellow-600 rounded-xl p-6;
		@apply flex items-center gap-4;
		@apply transition-all duration-500 ease-in-out;
		box-shadow: 
			0 0 20px rgba(255, 193, 7, calc(var(--glow-intensity) * 0.3)),
			0 0 40px rgba(255, 193, 7, calc(var(--glow-intensity) * 0.2)),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.brightness-dim {
		@apply opacity-80;
	}

	.brightness-low {
		@apply opacity-90;
		box-shadow: 
			0 0 25px rgba(255, 193, 7, 0.4),
			0 0 50px rgba(255, 193, 7, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.brightness-medium {
		box-shadow: 
			0 0 30px rgba(255, 193, 7, 0.5),
			0 0 60px rgba(255, 193, 7, 0.3),
			0 0 90px rgba(255, 193, 7, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.brightness-high {
		box-shadow: 
			0 0 40px rgba(255, 193, 7, 0.6),
			0 0 80px rgba(255, 193, 7, 0.4),
			0 0 120px rgba(255, 193, 7, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.brightness-extreme {
		@apply animate-pulse;
		box-shadow: 
			0 0 50px rgba(255, 193, 7, 0.8),
			0 0 100px rgba(255, 193, 7, 0.6),
			0 0 150px rgba(255, 193, 7, 0.4),
			0 0 200px rgba(255, 193, 7, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.lumen-icon {
		@apply text-6xl;
		filter: drop-shadow(0 0 10px rgba(255, 193, 7, 0.6));
		animation: float 3s ease-in-out infinite;
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	.lumen-content {
		@apply flex-1;
	}

	.lumen-title {
		@apply text-yellow-200 text-sm font-medium uppercase tracking-wide;
	}

	.lumen-amount {
		@apply text-white text-3xl font-bold;
		text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
	}

	.lumen-subtitle {
		@apply text-yellow-300 text-xs;
	}

	.lumen-rate {
		@apply text-green-300 text-lg font-semibold;
		@apply bg-black/20 px-3 py-1 rounded-lg;
		text-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
	}
</style>