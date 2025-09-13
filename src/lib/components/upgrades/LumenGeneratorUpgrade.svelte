<script lang="ts">
import { lumen, type LumenGenerator } from "$lib/currency/implementations/LumenCurrency";
import { lux } from "$lib/currency/implementations/LuxCurrency";
import { LUMEN_GENERATOR_CONFIG } from "$lib/config/gameConfig";
import { audio } from "$lib/stores/audio";
import GameCard from "$lib/components/ui/GameCard.svelte";
import GameButton from "$lib/components/ui/GameButton.svelte";

interface Props {
  generator: LumenGenerator;
}

let { generator }: Props = $props();
let isPurchasing = $state(false);

let cost = $derived(lumen.getGeneratorCost(generator.id));
let canAfford = $derived($lumen.total >= cost && cost !== Infinity);
let config = $derived(LUMEN_GENERATOR_CONFIG[generator.id]);
let isAtMaxLevel = $derived(Boolean(config?.maxLevel && generator.level >= config.maxLevel));

// Get dynamic boost effects
let currentBoostEffect = $derived(() => {
  if (generator.id === 'lumenBoost') {
    return lumen.getLumenBoostEffect();
  } else if (generator.id === 'selfSynergy') {
    return lumen.getSelfSynergyEffect($lux.amount);
  }
  return null;
});

let boostValue = $derived(currentBoostEffect());

// Check if this is a boost generator (not direct generation)
let isBoostGenerator = $derived(generator.id === 'lumenBoost' || generator.id === 'selfSynergy');

// Format boost effects to match Prestige Tree style
function formatBoostEffect(value: number): string {
  if (value < 10) {
    return value.toFixed(2) + 'x';
  } else if (value < 100) {
    return value.toFixed(1) + 'x';
  } else {
    return value.toFixed(0) + 'x';
  }
}

// Format lumen numbers to 2 decimal places for satisfying display
function formatLumen(value: number): string {
  return value.toFixed(2);
}

function handlePurchase() {
  if (!canAfford || isPurchasing || isAtMaxLevel) return;

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

    <div class="text-right space-y-1">
      {#if !isBoostGenerator}
        <div>
          <div class="text-sm opacity-60">Level</div>
          <div class="text-xl font-bold tabular-nums text-yellow-300">
            {generator.level}
          </div>
        </div>
      {:else}
        <div class="text-sm opacity-60">
          {config?.maxLevel === 1 ? 'One-time' : `Level ${generator.level}`}
        </div>
      {/if}
    </div>
  </div>

  <!-- Show current boost effect for boost generators -->
  {#if boostValue !== null && generator.owned}
    <div class="mb-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
      <div class="text-sm opacity-75 mb-1">Currently:</div>
      <div class="font-bold text-yellow-300 text-lg">
        {formatBoostEffect(boostValue)}
      </div>
    </div>
  {/if}

  <!-- Show rate info for Begin generator -->
  {#if generator.id === 'begin' && generator.owned}
    <div class="space-y-2 mb-4">
      <div class="flex justify-between text-sm">
        <span class="opacity-75">Base Generation:</span>
        <span class="font-bold tabular-nums text-yellow-400">
          1.00 Lux/sec
        </span>
      </div>
    </div>
  {:else if generator.id === 'begin' && !generator.owned}
    <div class="mb-4 p-2 bg-black/30 rounded">
      <div class="text-sm opacity-75 mb-1">First Purchase:</div>
      <div class="font-bold text-yellow-400">
        1.00 Lux/sec
      </div>
    </div>
  {/if}

  <!-- Show boost info for boost generators when not owned -->
  {#if isBoostGenerator && !generator.owned}
    <div class="mb-4 p-2 bg-black/30 rounded">
      <div class="text-sm opacity-75 mb-1">
        {generator.id === 'lumenBoost' ? 'Boosts Lux generation' : 'Lux boost themselves'}
      </div>
      <div class="font-bold text-yellow-400 text-sm">
        Dynamic multiplier effect
      </div>
    </div>
  {/if}

  <GameButton
    color="yellow"
    disabled={!canAfford || isAtMaxLevel}
    loading={isPurchasing}
    onclick={handlePurchase}
    class="w-full"
  >
    <div class="flex items-center justify-between">
      <span class="font-bold">
        {#if isAtMaxLevel}
          MAX LEVEL
        {:else if generator.owned && config?.maxLevel !== 1}
          UPGRADE
        {:else}
          PURCHASE
        {/if}
      </span>
      {#if !isAtMaxLevel}
        <div class="flex items-center gap-2">
          <span class="text-yellow-200 font-bold tabular-nums">
            {formatLumen(cost)}
          </span>
          <div class="w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"></div>
        </div>
      {/if}
    </div>
  </GameButton>
</GameCard>