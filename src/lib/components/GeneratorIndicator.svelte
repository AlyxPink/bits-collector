<script lang="ts">
import {
	ownedGenerators,
	upgrades,
	totalSpeedMultiplier,
} from "$lib/stores/upgrades";

let efficiency = $derived(upgrades.getProductionEfficiency());
let efficiencyColor = $derived(
	efficiency >= 0.8
		? "text-green-400"
		: efficiency >= 0.5
			? "text-yellow-400"
			: efficiency >= 0.25
				? "text-orange-400"
				: "text-red-400",
);

let isActive = $state(false);
let flashColor = $state<"red" | "green" | "blue" | "purple">("purple");

// Flash indicator when generators are active
if (typeof window !== "undefined") {
	setInterval(() => {
		if ($ownedGenerators.length > 0) {
			isActive = true;

			// Pick a random color to flash
			const colors: ("red" | "green" | "blue" | "purple")[] = [
				"red",
				"green",
				"blue",
				"purple",
			];
			flashColor = colors[Math.floor(Math.random() * colors.length)];

			setTimeout(() => {
				isActive = false;
			}, 100);
		}
	}, 1000 / Math.max(1, $totalSpeedMultiplier)); // Flash faster with higher multipliers
}

const colorClasses = {
	red: "bg-red-500 shadow-red-500/50",
	green: "bg-green-500 shadow-green-500/50",
	blue: "bg-blue-500 shadow-blue-500/50",
	purple: "bg-purple-500 shadow-purple-500/50",
};
</script>

{#if $ownedGenerators.length > 0}
  <div class="fixed top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-2 rounded-lg border border-green-500/30">
    <div class="relative">
      <div class="w-3 h-3 rounded-full {colorClasses[flashColor]} {isActive ? 'animate-ping' : ''} shadow-lg"></div>
      {#if isActive}
        <div class="absolute inset-0 w-3 h-3 rounded-full {colorClasses[flashColor]} animate-ping"></div>
      {/if}
    </div>
    <span class="text-xs text-green-400 font-bold uppercase tracking-wider">
      Generators Active
    </span>
    <div class="flex items-center gap-2 text-xs">
      {#if $totalSpeedMultiplier > 1}
        <span class="text-yellow-400 font-bold">
          {$totalSpeedMultiplier.toFixed(1)}x
        </span>
      {/if}
      {#if efficiency < 1}
        <span class="font-bold {efficiencyColor}">
          {(efficiency * 100).toFixed(0)}% eff
        </span>
      {/if}
    </div>
  </div>
{/if}

