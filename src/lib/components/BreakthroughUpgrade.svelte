<script lang="ts">
import { upgrades, type BreakthroughUpgrade } from "$lib/stores/upgrades";
import { pixels } from "$lib/stores/pixels";
import { audio } from "$lib/stores/audio";
import GameCard from "$lib/components/ui/GameCard.svelte";
import GameButton from "$lib/components/ui/GameButton.svelte";

interface Props {
	breakthrough: BreakthroughUpgrade;
}

let { breakthrough }: Props = $props();
let isPurchasing = $state(false);

let cost = $derived(upgrades.getBreakthroughCost(breakthrough.id));
let canAfford = $derived($pixels.white >= cost && !breakthrough.purchased);

function handlePurchase() {
	if (!canAfford || isPurchasing) return;

	isPurchasing = true;
	const success = upgrades.purchaseBreakthrough(breakthrough.id);

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

<GameCard variant="purple" animated={isPurchasing}>
  <div class="flex justify-between items-start mb-3">
    <div>
      <h3 class="text-lg font-bold uppercase tracking-wide glow-text">
        {breakthrough.name}
      </h3>
      <p class="text-xs opacity-75 mt-1">
        {breakthrough.description}
      </p>
    </div>
    
    <div class="text-right">
      {#if breakthrough.purchased}
        <div class="text-sm text-green-400 font-bold">✓ ACTIVE</div>
      {:else}
        <div class="text-sm opacity-60">Available</div>
      {/if}
    </div>
  </div>
  
  {#if breakthrough.purchased}
    <div class="mb-4 p-2 bg-green-500/20 rounded border border-green-500/50">
      <div class="text-sm text-green-400 font-bold mb-1">Breakthrough Active</div>
      <div class="text-xs opacity-75">
        Production efficiency improved by {breakthrough.effect}x threshold
      </div>
    </div>
  {:else}
    <div class="mb-4 p-2 bg-purple-500/20 rounded border border-purple-500/50">
      <div class="text-sm text-purple-400 font-bold mb-1">Effect:</div>
      <div class="text-xs opacity-75">
        Increases soft cap threshold by {breakthrough.effect}x
      </div>
    </div>
  {/if}
  
  <GameButton 
    color="purple"
    disabled={!canAfford}
    loading={isPurchasing}
    onclick={handlePurchase}
    class="w-full"
  >
    <div class="flex items-center justify-between">
      <span class="font-bold">
        {breakthrough.purchased ? 'PURCHASED' : 'BREAKTHROUGH'}
      </span>
      {#if !breakthrough.purchased}
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