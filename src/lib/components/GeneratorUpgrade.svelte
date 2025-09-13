<script lang="ts">
import {
	upgrades,
	totalSpeedMultiplier,
	type GeneratorUpgrade,
} from "$lib/currency/implementations/UpgradesCurrency";
import { pixels } from "$lib/stores/pixels";
import { audio } from "$lib/stores/audio";
import { upgradeColorToVariant } from "$lib/utils/colors";
import GameCard from "$lib/components/ui/GameCard.svelte";
import GameButton from "$lib/components/ui/GameButton.svelte";
import PureColorBoostIndicator from "$lib/components/PureColorBoostIndicator.svelte";

interface Props {
	upgrade: GeneratorUpgrade;
}

let { upgrade }: Props = $props();
let isPurchasing = $state(false);

let cost = $derived(upgrades.getGeneratorCost(upgrade.id));
let canAfford = $derived($pixels.white >= cost);
let theoreticalRate = $derived(upgrades.getGeneratorRate(upgrade.id));
let effectiveRate = $derived(upgrades.getEffectiveGeneratorRate(upgrade.id));
let nextLevelTheoretical = $derived(
	upgrade.baseRate * (upgrade.level + 1) * $totalSpeedMultiplier,
);
let efficiency = $derived(upgrades.getProductionEfficiency());
let nextLevelEffective = $derived(nextLevelTheoretical * efficiency);
let cardVariant = $derived(upgradeColorToVariant(upgrade.color));

// Efficiency color coding
let efficiencyColor = $derived(
	efficiency >= 0.8
		? "text-green-400"
		: efficiency >= 0.5
			? "text-yellow-400"
			: efficiency >= 0.25
				? "text-orange-400"
				: "text-red-400",
);

function handlePurchase() {
	if (!canAfford || isPurchasing) return;

	isPurchasing = true;
	const success = upgrades.purchaseGenerator(upgrade.id);

	if (success) {
		audio.playPixelSound("green"); // Success sound
	} else {
		audio.playPixelSound("red"); // Failure sound
	}

	setTimeout(() => {
		isPurchasing = false;
	}, 300);
}
</script>

<GameCard variant={cardVariant} animated={isPurchasing}>
  <div class="flex justify-between items-start mb-3">
    <div>
      <h3 class="text-lg font-bold uppercase tracking-wide glow-text">
        {upgrade.name}
      </h3>
      <p class="text-xs opacity-75 mt-1">
        {upgrade.description}
      </p>
    </div>
    
    <div class="text-right space-y-2">
      <div>
        <div class="text-sm opacity-60">Level</div>
        <div class="text-xl font-bold tabular-nums">
          {upgrade.level}
        </div>
      </div>
      
      <!-- Pure Color Boost Indicator -->
      <PureColorBoostIndicator generatorColor={upgrade.color} />
    </div>
  </div>
  
  {#if upgrade.owned}
    <div class="space-y-2 mb-4">
      {#if efficiency < 1}
        <!-- Show efficiency warning -->
        <div class="flex justify-between items-center text-xs p-2 bg-black/30 rounded">
          <span class="opacity-75">Production Efficiency:</span>
          <span class="font-bold {efficiencyColor}">
            {(efficiency * 100).toFixed(0)}%
          </span>
        </div>
      {/if}
      
      <div class="flex justify-between text-sm">
        <span class="opacity-75">Effective Rate:</span>
        <span class="font-bold tabular-nums {efficiencyColor}">
          {effectiveRate.toFixed(2)}/sec
        </span>
      </div>
      
      {#if efficiency < 1}
        <div class="flex justify-between text-xs opacity-60">
          <span>Theoretical:</span>
          <span class="font-bold tabular-nums line-through">
            {theoreticalRate.toFixed(2)}/sec
          </span>
        </div>
      {/if}
      
      <div class="flex justify-between text-sm">
        <span class="opacity-75">Next Level:</span>
        <span class="font-bold tabular-nums text-yellow-400">
          {nextLevelEffective.toFixed(2)}/sec
          {#if efficiency < 1}
            <span class="text-xs opacity-60">({nextLevelTheoretical.toFixed(2)})</span>
          {/if}
        </span>
      </div>
    </div>
  {:else}
    <div class="mb-4 p-2 bg-black/30 rounded">
      <div class="text-sm opacity-75 mb-1">First Purchase:</div>
      <div class="font-bold {efficiencyColor}">
        {(upgrade.baseRate * $totalSpeedMultiplier * efficiency).toFixed(2)} bits/sec
      </div>
      {#if efficiency < 1}
        <div class="text-xs opacity-60">
          Theoretical: {(upgrade.baseRate * $totalSpeedMultiplier).toFixed(2)} bits/sec
        </div>
        <div class="text-xs {efficiencyColor}">
          Efficiency: {(efficiency * 100).toFixed(0)}%
        </div>
      {/if}
    </div>
  {/if}
  
  <GameButton 
    color={cardVariant}
    disabled={!canAfford}
    loading={isPurchasing}
    onclick={handlePurchase}
    class="w-full"
  >
    <div class="flex items-center justify-between">
      <span class="font-bold">
        {upgrade.owned ? 'UPGRADE' : 'PURCHASE'}
      </span>
      <div class="flex items-center gap-2">
        <span class="text-white font-bold tabular-nums">
          {cost}
        </span>
        <div class="w-3 h-3 bg-white rounded-full shadow-lg shadow-white/50"></div>
      </div>
    </div>
  </GameButton>
</GameCard>

