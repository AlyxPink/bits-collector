<script lang="ts">
import { upgrades, type PowerupUpgrade } from "$lib/currency/implementations/UpgradesCurrency";
import { pixels } from "$lib/currency/implementations/PixelsCurrency";
import { audio } from "$lib/stores/audio";
import { type ColorVariant } from "$lib/utils/colors";
import GameCard from "$lib/components/ui/GameCard.svelte";
import GameButton from "$lib/components/ui/GameButton.svelte";

interface Props {
	upgrade: PowerupUpgrade;
}

let { upgrade }: Props = $props();
let isPurchasing = $state(false);

let cost = $derived(upgrades.getPowerupCost(upgrade.id));
let canAfford = $derived(
	$pixels.white >= cost && upgrade.level < upgrade.maxLevel,
);
let isMaxLevel = $derived(upgrade.level >= upgrade.maxLevel);
let currentMultiplier = $derived(
	upgrade.level > 0 ? Math.pow(upgrade.multiplier, upgrade.level) : 1,
);
let nextMultiplier = $derived(Math.pow(upgrade.multiplier, upgrade.level + 1));
let cardVariant = $derived(
	isMaxLevel ? ("green" as ColorVariant) : ("yellow" as ColorVariant),
);

function handlePurchase() {
	if (!canAfford || isPurchasing || isMaxLevel) return;

	isPurchasing = true;
	const success = upgrades.purchasePowerup(upgrade.id);

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
      <h3 class="text-lg font-bold uppercase tracking-wide glow-text text-yellow-400">
        {upgrade.name}
      </h3>
      <p class="text-xs opacity-75 mt-1">
        {upgrade.description}
      </p>
    </div>
    
    <div class="text-right">
      <div class="text-sm opacity-60">Level</div>
      <div class="text-xl font-bold tabular-nums">
        {upgrade.level}/{upgrade.maxLevel}
      </div>
    </div>
  </div>
  
  <div class="space-y-2 mb-4">
    {#if upgrade.level > 0}
      <div class="flex justify-between text-sm">
        <span class="opacity-75">Current Effect:</span>
        <span class="font-bold tabular-nums text-green-400">
          {currentMultiplier}x
        </span>
      </div>
    {/if}
    
    {#if !isMaxLevel}
      <div class="flex justify-between text-sm">
        <span class="opacity-75">Next Level:</span>
        <span class="font-bold tabular-nums text-yellow-400">
          {nextMultiplier}x
        </span>
      </div>
    {:else}
      <div class="text-center text-sm text-yellow-400 font-bold">
        MAX LEVEL REACHED
      </div>
    {/if}
  </div>
  
  <GameButton 
    variant={isMaxLevel ? 'success' : 'warning'}
    disabled={!canAfford || isMaxLevel}
    loading={isPurchasing}
    onclick={handlePurchase}
    class="w-full"
  >
    <div class="flex items-center justify-between">
      <span class="font-bold">
        {isMaxLevel ? 'MAX' : 'UPGRADE'}
      </span>
      {#if !isMaxLevel}
        <div class="flex items-center gap-2">
          <span class="text-white font-bold tabular-nums">
            {cost}
          </span>
          <div class="w-3 h-3 bg-white rounded-full shadow-lg shadow-white/50"></div>
        </div>
      {/if}
    </div>
  </GameButton>
</GameCard>

