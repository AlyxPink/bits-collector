<script lang="ts">
  import { compositeColors, type CompositeColor, type CompositeColorState } from "$lib/stores/compositeColors";
  import { pixels } from "$lib/stores/pixels";
  import { audio } from "$lib/stores/audio";
  import { upgrades } from "$lib/stores/upgrades";
  import { formatRecipeComponents, getCompositeColorRecipe } from "$lib/utils/recipes";

  interface Props {
    color: CompositeColor;
  }

  let { color }: Props = $props();

  let isMixing = $state(false);
  let canAfford = $derived(compositeColors.canAfford(color.id as keyof CompositeColorState));
  let canAffordUnlock = $derived(compositeColors.canAffordUnlock(color.id as keyof CompositeColorState));
  let unlockCost = $derived(compositeColors.getUnlockCost(color.id as keyof CompositeColorState));
  
  // Get boost info for pure colors
  let boostInfo = $derived(() => {
    if (color.type !== "pure") return null;
    
    const colorMap = { crimson: "red", emerald: "green", sapphire: "blue" } as const;
    const generatorColor = colorMap[color.id as keyof typeof colorMap];
    if (!generatorColor) return null;
    
    const details = upgrades.getPureColorBoostDetails(generatorColor);
    return details.type === "single" ? details : null;
  });
  
  // Build recipe display string - using utility function
  function getRecipeDisplay() {
    return formatRecipeComponents(color.recipe);
  }

  // Build enhanced tooltip with unlock/boost information
  function getTooltipText() {
    if (!color.unlocked) {
      const cost = unlockCost;
      let tooltip = `🔒 LOCKED - Unlock Cost:`;
      tooltip += `\n  ${cost.red} Red + ${cost.green} Green + ${cost.blue} Blue`;
      tooltip += `\n  Total: ${cost.total} RGB pixels`;
      tooltip += `\n\nAfter unlock: ${getRecipeDisplay()} → ${color.name}`;
      return tooltip;
    }

    let tooltip = `${getRecipeDisplay()} → ${color.name}`;
    
    const info = boostInfo();
    if (info) {
      const generatorName = color.id === "crimson" ? "Red" : 
                           color.id === "emerald" ? "Green" : "Blue";
      
      tooltip += `\n\n🚀 Generator Boost:`;
      if (info.pureCount === 0) {
        tooltip += `\n  First ${color.name} will boost ${generatorName} Generator`;
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
    if (!color.unlocked) {
      // Locked state - darker and different styling
      const canUnlock = canAffordUnlock;
      return `pixel-button border-gray-600 text-gray-400 bg-gray-800/20 hover:bg-gray-700/30 shadow-lg shadow-gray-600/30 ${canUnlock ? 'cursor-pointer transform hover:scale-105' : 'cursor-not-allowed opacity-50'}`;
    }
    
    // Unlocked state - normal styling
    const canMix = canAfford;
    return `pixel-button ${color.borderColor} ${color.textColor} ${color.bgColor} ${color.hoverBgColor} shadow-lg ${color.shadowColor} ${canMix ? 'cursor-pointer transform hover:scale-105' : 'cursor-not-allowed opacity-60'}`;
  }

  function handleClick() {
    if (!color.unlocked) {
      // Try to unlock
      if (canAffordUnlock) {
        const success = compositeColors.unlockColor(color.id as keyof CompositeColorState);
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
        const success = compositeColors.mixColor(color.id as keyof CompositeColorState);
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
  disabled={color.unlocked ? !canAfford : !canAffordUnlock}
  class="{getButtonClasses()} {isMixing ? 'animate-pixel-pop' : ''}"
  title={getTooltipText()}
  tabindex="0"
>
  <div class="flex flex-col items-center gap-2">
    {#if !color.unlocked}
      <!-- Locked state -->
      <div class="text-xl font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
        🔒 {color.name}
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
        {canAffordUnlock ? 'Click to unlock' : 'Need more RGB'}
      </div>
    {:else}
      <!-- Unlocked state - original content -->
      <div class="text-2xl font-bold uppercase tracking-widest glow-text">
        {color.name}
      </div>
      
      <!-- Count -->
      <div class="text-4xl font-bold tabular-nums">
        {color.count}
      </div>
      
      <!-- Recipe hint with CSS circles -->
      <div class="text-xs text-center leading-tight flex items-center gap-1 opacity-75">
        {#if color.recipe.red > 0}
          <span class="flex items-center gap-0.5">
            <span>{color.recipe.red}×</span>
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
          </span>
        {/if}
        {#if color.recipe.red > 0 && (color.recipe.green > 0 || color.recipe.blue > 0)}
          <span class="text-white/60">+</span>
        {/if}
        {#if color.recipe.green > 0}
          <span class="flex items-center gap-0.5">
            <span>{color.recipe.green}×</span>
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          </span>
        {/if}
        {#if color.recipe.green > 0 && color.recipe.blue > 0}
          <span class="text-white/60">+</span>
        {/if}
        {#if color.recipe.blue > 0}
          <span class="flex items-center gap-0.5">
            <span>{color.recipe.blue}×</span>
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          </span>
        {/if}
      </div>
      
      <!-- Action hint -->
      <div class="text-xs opacity-75 uppercase">
        {canAfford ? 'Click to mix' : 'Need more pixels'}
      </div>
      
      <!-- Pure color boost hint -->
      {#if color.type === "pure"}
        <div class="text-xs text-yellow-300 opacity-80 flex items-center gap-1 justify-center">
          🚀 <span>Boosts Generator</span>
        </div>
      {/if}
    {/if}
  </div>
</button>