<script lang="ts">
import {
	ownedGenerators,
	upgrades,
	totalSpeedMultiplier
} from "$lib/currency/implementations/UpgradesCurrency";

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

// Calculate total generation rate from owned generators
let totalRate = $derived(
	$ownedGenerators.reduce((sum, gen) => {
		const rate = gen.baseRate * Math.pow(1.2, gen.level - 1); // Standard rate multiplier
		return sum + rate;
	}, 0) * $totalSpeedMultiplier * efficiency
);

// Group generators by color for display
let generatorsByColor = $derived({
	red: $ownedGenerators.filter(g => g.color === "red"),
	green: $ownedGenerators.filter(g => g.color === "green"),
	blue: $ownedGenerators.filter(g => g.color === "blue"),
	random: $ownedGenerators.filter(g => g.color === "random")
});

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
	}, Math.max(100, 1000 / Math.max(1, $totalSpeedMultiplier))); // Flash faster with higher multipliers, min 100ms
}

const colorClasses = {
	red: "bg-red-500 shadow-red-500/50",
	green: "bg-green-500 shadow-green-500/50",
	blue: "bg-blue-500 shadow-blue-500/50",
	purple: "bg-purple-500 shadow-purple-500/50",
};
</script>

{#if $ownedGenerators.length > 0}
  <div class="w-full space-y-3">
    <!-- Activity Indicator -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="relative">
          <div class="w-3 h-3 rounded-full {colorClasses[flashColor]} {isActive ? 'animate-ping' : ''} shadow-lg"></div>
          {#if isActive}
            <div class="absolute inset-0 w-3 h-3 rounded-full {colorClasses[flashColor]} animate-ping"></div>
          {/if}
        </div>
        <span class="text-xs text-green-400 font-bold uppercase tracking-wider">
          Active
        </span>
      </div>
      <div class="text-xs font-mono text-cyan-400 font-bold">
        {totalRate.toFixed(1)}/s
      </div>
    </div>

    <!-- Generator Counts by Color -->
    <div class="grid grid-cols-2 gap-2">
      {#each Object.entries(generatorsByColor) as [color, generators]}
        {#if generators.length > 0}
          <div class="bg-black/30 rounded px-2 py-1 border border-gray-600/30">
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full {color === 'red' ? 'bg-red-500' : color === 'green' ? 'bg-green-500' : color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'}"></div>
              <span class="text-xs font-bold text-white">
                {generators.reduce((sum, g) => sum + g.level, 0)}
              </span>
            </div>
          </div>
        {/if}
      {/each}
    </div>

    <!-- Performance Stats -->
    <div class="space-y-1">
      {#if $totalSpeedMultiplier > 1}
        <div class="flex justify-between items-center text-xs">
          <span class="text-gray-300">Speed:</span>
          <span class="text-yellow-400 font-bold">
            {$totalSpeedMultiplier.toFixed(1)}x
          </span>
        </div>
      {/if}
      <div class="flex justify-between items-center text-xs">
        <span class="text-gray-300">Efficiency:</span>
        <span class="font-bold {efficiencyColor}">
          {(efficiency * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  </div>
{:else}
  <div class="text-center text-gray-400 text-xs py-4">
    No generators active
  </div>
{/if}

