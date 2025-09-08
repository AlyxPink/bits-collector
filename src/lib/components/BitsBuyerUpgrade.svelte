<script lang="ts">
  import { upgrades, totalSpeedMultiplier, type BitsBuyerUpgrade } from '$lib/stores/upgrades';
  import { pixels } from '$lib/stores/pixels';
  import { audio } from '$lib/stores/audio';
  import { upgradeColorToVariant } from '$lib/utils/colors';
  import GameCard from '$lib/components/ui/GameCard.svelte';
  import GameButton from '$lib/components/ui/GameButton.svelte';
  
  interface Props {
    upgrade: BitsBuyerUpgrade;
  }
  
  let { upgrade }: Props = $props();
  let isPurchasing = $state(false);
  
  let cost = $derived(upgrades.getBitsBuyerCost(upgrade.id));
  let canAfford = $derived($pixels.white >= cost);
  let currentRate = $derived(upgrades.getAutoBuyRate(upgrade.id));
  let nextLevelRate = $derived(upgrade.baseRate * (upgrade.level + 1) * $totalSpeedMultiplier);
  let cardVariant = $derived(upgradeColorToVariant(upgrade.color));
  
  function handlePurchase() {
    if (!canAfford || isPurchasing) return;
    
    isPurchasing = true;
    const success = upgrades.purchaseBitsBuyer(upgrade.id);
    
    if (success) {
      audio.playPixelSound('green'); // Success sound
    } else {
      audio.playPixelSound('red'); // Failure sound
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
    
    <div class="text-right">
      <div class="text-sm opacity-60">Level</div>
      <div class="text-xl font-bold tabular-nums">
        {upgrade.level}
      </div>
    </div>
  </div>
  
  {#if upgrade.owned}
    <div class="space-y-2 mb-4">
      <div class="flex justify-between text-sm">
        <span class="opacity-75">Current Rate:</span>
        <span class="font-bold tabular-nums">
          {currentRate.toFixed(2)}/sec
        </span>
      </div>
      
      <div class="flex justify-between text-sm">
        <span class="opacity-75">Next Level:</span>
        <span class="font-bold tabular-nums text-yellow-400">
          {nextLevelRate.toFixed(2)}/sec
        </span>
      </div>
    </div>
  {:else}
    <div class="mb-4 p-2 bg-black/30 rounded">
      <div class="text-sm opacity-75 mb-1">First Purchase:</div>
      <div class="font-bold">
        {(upgrade.baseRate * $totalSpeedMultiplier).toFixed(2)} bits/sec
      </div>
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

