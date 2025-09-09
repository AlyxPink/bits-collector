<script lang="ts">
  import { compositeColors, type CompositeColor, type CompositeColorState } from "$lib/stores/compositeColors";
  import { pixels } from "$lib/stores/pixels";
  import { audio } from "$lib/stores/audio";

  interface Props {
    color: CompositeColor;
  }

  let { color }: Props = $props();

  let isMixing = $state(false);
  let canAfford = $derived(compositeColors.canAfford(color.id as keyof CompositeColorState));
  
  // Build recipe display string - using colored text approach
  function getRecipeDisplay() {
    const parts = [];
    if (color.recipe.red > 0) parts.push(`${color.recipe.red}R`);
    if (color.recipe.green > 0) parts.push(`${color.recipe.green}G`);
    if (color.recipe.blue > 0) parts.push(`${color.recipe.blue}B`);
    return parts.join(" + ");
  }

  // Build button classes in the style of RGB buttons
  function getButtonClasses() {
    return `pixel-button ${color.borderColor} ${color.textColor} ${color.bgColor} ${color.hoverBgColor} shadow-lg ${color.shadowColor} ${canAfford ? 'cursor-pointer transform hover:scale-105' : 'cursor-not-allowed opacity-60'}`;
  }

  function handleMix() {
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
</script>

<button
  onclick={handleMix}
  disabled={!canAfford}
  class="{getButtonClasses()} {isMixing ? 'animate-pixel-pop' : ''}"
  title="{getRecipeDisplay()} → {color.name}"
  tabindex="0"
>
  <div class="flex flex-col items-center gap-2">
    <!-- Color name with retro glow effect -->
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
  </div>
</button>