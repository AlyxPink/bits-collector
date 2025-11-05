<script lang="ts">
  import { audio } from "$lib/stores/audio";
  import { upgrades } from "$lib/currency/implementations/UpgradesCurrency";
  import { pixels } from "$lib/currency/implementations/PixelsCurrency";
  import { compositeColors } from "$lib/currency/implementations/CompositeColorsCurrency";
  import { formatRecipeComponents } from "$lib/utils/recipes";
  import type { MixedColor } from "$lib/currency/implementations/MixedColorsCurrency";
  import type { PureColor } from "$lib/currency/implementations/PureColorsCurrency";

  // Generic color type that works for both mixed and pure colors
  type Color = MixedColor | PureColor;

  // Generic store interface that both stores implement
  interface ColorStore<T> {
    canAfford: (colorId: any) => boolean;
    canAffordUnlock: (colorId: any) => boolean;
    getUnlockCost: (
      colorId: any,
    ) => { red: number; green: number; blue: number; total: number };
    unlockColor: (colorId: any) => boolean;
    mixColor: (colorId: any) => boolean;
  }

  interface Props {
    color: Color;
    store: ColorStore<any>;
  }

  let { color, store }: Props = $props();

  let isMixing = $state(false);

  // Get the current color state from the store (reactive)
  let currentColor = $derived($compositeColors[color.id as keyof typeof $compositeColors] || color);

  // Subscribe to stores for reactivity
  let canAfford = $derived(
    $pixels.red >= currentColor.recipe.red &&
    $pixels.green >= currentColor.recipe.green &&
    $pixels.blue >= currentColor.recipe.blue &&
    currentColor.unlocked
  );

  let canAffordUnlock = $derived((() => {
    if (currentColor.unlocked) return false;
    const allColors = Object.values($compositeColors);
    const unlockedCount = allColors.filter(c => c.unlocked).length;
    const cost = calculateUnlockCost(unlockedCount, currentColor.id);
    return $pixels.red >= cost.red &&
           $pixels.green >= cost.green &&
           $pixels.blue >= cost.blue;
  })());

  let unlockCost = $derived((() => {
    const allColors = Object.values($compositeColors);
    const unlockedCount = allColors.filter(c => c.unlocked).length;
    return calculateUnlockCost(unlockedCount, currentColor.id);
  })());

  // Helper to calculate unlock cost (mirrors the logic from config)
  function calculateUnlockCost(unlockedCount: number, colorId: string) {
    // Import the config calculation functions
    const isPure = currentColor.type === "pure";

    if (isPure) {
      // Pure colors have higher unlock costs
      const colorMap: Record<string, { red: number; green: number; blue: number }> = {
        crimson: { red: 100, green: 0, blue: 0 },
        emerald: { red: 0, green: 100, blue: 0 },
        sapphire: { red: 0, green: 0, blue: 100 }
      };
      const baseCost = colorMap[colorId] || { red: 100, green: 100, blue: 100 };
      const total = baseCost.red + baseCost.green + baseCost.blue;
      return { ...baseCost, total };
    } else {
      // Mixed colors use progressive cost
      const baseCost = 10;
      const costMultiplier = 2;
      const cost = Math.floor(baseCost * Math.pow(costMultiplier, unlockedCount));
      return {
        red: cost,
        green: cost,
        blue: cost,
        total: cost * 3
      };
    }
  }

  // Check if this is a pure color and get boost info
  let boostInfo = $derived(() => {
    // Only pure colors have boost functionality
    if (
      currentColor.id !== "crimson" &&
      currentColor.id !== "emerald" &&
      currentColor.id !== "sapphire"
    ) {
      return null;
    }

    const colorMap = {
      crimson: "red",
      emerald: "green",
      sapphire: "blue",
    } as const;
    const generatorColor = colorMap[currentColor.id as keyof typeof colorMap];
    if (!generatorColor) return null;

    const details = upgrades.getPureColorBoostDetails(generatorColor);
    return details.type === "single" ? details : null;
  });

  // Build recipe display string - using utility function
  function getRecipeDisplay() {
    return formatRecipeComponents(currentColor.recipe);
  }

  // Build enhanced tooltip with unlock/boost information
  function getTooltipText() {
    if (!currentColor.unlocked) {
      const cost = unlockCost;
      let tooltip = `🔒 LOCKED - Unlock Cost:`;
      tooltip += `\n  ${cost.red} Red + ${cost.green} Green + ${cost.blue} Blue`;
      tooltip += `\n  Total: ${cost.total} RGB pixels`;
      tooltip += `\n\nAfter unlock: ${getRecipeDisplay()} → ${currentColor.name}`;
      return tooltip;
    }

    let tooltip = `${getRecipeDisplay()} → ${currentColor.name}`;

    const info = boostInfo();
    if (info) {
      const generatorName =
        currentColor.id === "crimson"
          ? "Red"
          : currentColor.id === "emerald"
            ? "Green"
            : "Blue";

      tooltip += `\n\n🚀 Generator Boost:`;
      if (info.pureCount === 0) {
        tooltip += `\n  First ${currentColor.name} will boost ${generatorName} Generator`;
      } else {
        const currentMult = info.currentMultiplier;
        const nextMult = info.nextMultiplier;
        tooltip += `\n  Current: ${currentMult.toFixed(2)}x rate boost`;
        tooltip += `\n  Next: +1 → ${nextMult.toFixed(2)}x boost`;

        if (info.nextMilestone && info.nextMilestone - info.pureCount <= 5) {
          tooltip += `\n  🎯 ${info.nextMilestone - info.pureCount} more to milestone!`;
        }
      }

      if (info.hasAllPureColors) {
        tooltip += `\n  ✨ Synergy bonus active`;
      }
    }

    return tooltip;
  }

  // Build button classes in the style of RGB buttons
  function getButtonClasses() {
    if (!currentColor.unlocked) {
      // Locked state - darker and different styling
      const canUnlock = canAffordUnlock;
      return `pixel-button border-gray-600 text-gray-400 bg-gray-800/20 hover:bg-gray-700/30 shadow-lg shadow-gray-600/30 ${canUnlock ? "cursor-pointer transform hover:scale-105" : "cursor-not-allowed opacity-50"}`;
    }

    // Unlocked state - normal styling
    const canMix = canAfford;
    return `pixel-button ${currentColor.borderColor} ${currentColor.textColor} ${currentColor.bgColor} ${currentColor.hoverBgColor} shadow-lg ${currentColor.shadowColor} ${canMix ? "cursor-pointer transform hover:scale-105" : "cursor-not-allowed opacity-60"}`;
  }

  function handleClick() {
    if (!currentColor.unlocked) {
      // Try to unlock
      if (canAffordUnlock) {
        const success = store.unlockColor(color.id);
        if (success) {
          audio.playConvertSound(); // Reuse convert sound for unlocking

          // Trigger animation
          isMixing = true;
          setTimeout(() => {
            isMixing = false;
          }, 500);
        }
      }
    } else {
      // Try to mix
      if (canAfford) {
        const success = store.mixColor(color.id);
        if (success) {
          audio.playConvertSound(); // Reuse convert sound for mixing

          // Trigger animation
          isMixing = true;
          setTimeout(() => {
            isMixing = false;
          }, 500);
        }
      }
    }
  }
</script>

<button
  onclick={handleClick}
  disabled={currentColor.unlocked ? !canAfford : !canAffordUnlock}
  class="{getButtonClasses()} {isMixing ? 'animate-pixel-pop' : ''}"
  title={getTooltipText()}
  tabindex="0"
>
  <div class="flex flex-col items-center gap-2">
    {#if !currentColor.unlocked}
      <!-- Locked state -->
      <div
        class="text-xl font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2"
      >
        🔒 {currentColor.name}
      </div>

      <!-- Unlock cost -->
      <div class="text-sm text-center leading-tight">
        <div class="text-gray-300 mb-1">Unlock Cost:</div>
        <div class="flex items-center gap-1 justify-center">
          <span class="flex items-center gap-0.5">
            <span>{unlockCost.red}</span>
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
          </span>
          <span class="text-white/60">+</span>
          <span class="flex items-center gap-0.5">
            <span>{unlockCost.green}</span>
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          </span>
          <span class="text-white/60">+</span>
          <span class="flex items-center gap-0.5">
            <span>{unlockCost.blue}</span>
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          </span>
        </div>
      </div>

      <!-- Action hint -->
      <div class="text-xs opacity-75 uppercase">
        {canAffordUnlock ? "Click to unlock" : "Need more RGB"}
      </div>
    {:else}
      <!-- Unlocked state - original content -->
      <div class="text-2xl font-bold uppercase tracking-widest glow-text">
        {currentColor.name}
      </div>

      <!-- Count -->
      <div class="text-4xl font-bold tabular-nums">
        {currentColor.count}
      </div>

      <!-- Recipe hint with CSS circles -->
      <div
        class="text-xs text-center leading-tight flex items-center gap-1 opacity-75"
      >
        {#if currentColor.recipe.red > 0}
          <span class="flex items-center gap-0.5">
            <span>{currentColor.recipe.red}×</span>
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
          </span>
        {/if}
        {#if currentColor.recipe.red > 0 && (currentColor.recipe.green > 0 || currentColor.recipe.blue > 0)}
          <span class="text-white/60">+</span>
        {/if}
        {#if currentColor.recipe.green > 0}
          <span class="flex items-center gap-0.5">
            <span>{currentColor.recipe.green}×</span>
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          </span>
        {/if}
        {#if currentColor.recipe.green > 0 && currentColor.recipe.blue > 0}
          <span class="text-white/60">+</span>
        {/if}
        {#if currentColor.recipe.blue > 0}
          <span class="flex items-center gap-0.5">
            <span>{currentColor.recipe.blue}×</span>
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          </span>
        {/if}
      </div>

      <!-- Action hint -->
      <div class="text-xs opacity-75 uppercase">
        {canAfford ? "Click to mix" : "Need more pixels"}
      </div>

      <!-- Pure color boost hint -->
      {#if color.id === "crimson" || color.id === "emerald" || color.id === "sapphire"}
        <div
          class="text-xs text-yellow-300 opacity-80 flex items-center gap-1 justify-center"
        >
          🚀 <span>Boosts Generator</span>
        </div>
      {/if}
    {/if}
  </div>
</button>
