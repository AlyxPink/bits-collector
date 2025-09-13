<script lang="ts">
import { lumen, type LumenGenerator } from "$lib/stores/lumen";
import { audio } from "$lib/stores/audio";
import GameCard from "$lib/components/ui/GameCard.svelte";
import GameButton from "$lib/components/ui/GameButton.svelte";

interface Props {
  generator: LumenGenerator;
}

let { generator }: Props = $props();
let isPurchasing = $state(false);

let cost = $derived(lumen.getGeneratorCost(generator.id));
let canAfford = $derived($lumen.total >= cost);
let currentRate = $derived(lumen.getGeneratorRate(generator.id));
let nextLevelRate = $derived(generator.baseRate * (generator.level + 1));

// Format lumen numbers to 2 decimal places for satisfying display
function formatLumen(value: number): string {
  return value.toFixed(2);
}

function handlePurchase() {
  if (!canAfford || isPurchasing) return;

  isPurchasing = true;
  const success = lumen.purchaseGenerator(generator.id);

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

<GameCard variant="yellow" animated={isPurchasing}>
  <div class="flex justify-between items-start mb-3">
    <div>
      <h3 class="text-lg font-bold uppercase tracking-wide glow-text text-yellow-400">
        {generator.name}
      </h3>
      <p class="text-xs opacity-75 mt-1">
        {generator.description}
      </p>
    </div>
    
    <div class="text-right space-y-2">
      <div>
        <div class="text-sm opacity-60">Level</div>
        <div class="text-xl font-bold tabular-nums text-yellow-300">
          {generator.level}
        </div>
      </div>
    </div>
  </div>
  
  {#if generator.owned}
    <div class="space-y-2 mb-4">
      <div class="flex justify-between text-sm">
        <span class="opacity-75">Current Rate:</span>
        <span class="font-bold tabular-nums text-yellow-400">
          {formatLumen(currentRate)}/sec
        </span>
      </div>
      
      <div class="flex justify-between text-sm">
        <span class="opacity-75">Next Level:</span>
        <span class="font-bold tabular-nums text-yellow-300">
          {formatLumen(nextLevelRate)}/sec
        </span>
      </div>
    </div>
  {:else}
    <div class="mb-4 p-2 bg-black/30 rounded">
      <div class="text-sm opacity-75 mb-1">First Purchase:</div>
      <div class="font-bold text-yellow-400">
        {formatLumen(generator.baseRate)} lumen/sec
      </div>
    </div>
  {/if}
  
  <GameButton 
    color="yellow"
    disabled={!canAfford}
    loading={isPurchasing}
    onclick={handlePurchase}
    class="w-full"
  >
    <div class="flex items-center justify-between">
      <span class="font-bold">
        {generator.owned ? 'UPGRADE' : 'PURCHASE'}
      </span>
      <div class="flex items-center gap-2">
        <span class="text-yellow-200 font-bold tabular-nums">
          {formatLumen(cost)}
        </span>
        <div class="w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"></div>
      </div>
    </div>
  </GameButton>
</GameCard>