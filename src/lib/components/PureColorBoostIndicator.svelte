<script lang="ts">
  import { upgrades } from "$lib/stores/upgrades";
  import { compositeColors } from "$lib/stores/compositeColors";

  interface Props {
    generatorColor: "red" | "green" | "blue" | "random";
  }

  let { generatorColor }: Props = $props();

  // Create reactive dependency to compositeColors to ensure real-time updates
  let pureColorCounts = $derived({
    crimson: $compositeColors.crimson.count,
    emerald: $compositeColors.emerald.count,
    sapphire: $compositeColors.sapphire.count
  });

  let boostDetails = $derived(() => {
    // Access pureColorCounts to establish reactive dependency
    const _ = pureColorCounts;
    return upgrades.getPureColorBoostDetails(generatorColor);
  });

  // Color-specific styling
  let colorClasses = $derived({
    red: "text-red-400 border-red-500/30 bg-red-500/10 shadow-red-500/20",
    green: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-emerald-500/20",
    blue: "text-blue-400 border-blue-500/30 bg-blue-500/10 shadow-blue-500/20",
    random: "text-purple-400 border-purple-500/30 bg-purple-500/10 shadow-purple-500/20",
  }[generatorColor]);

  let boostName = $derived({
    red: "Crimson",
    green: "Emerald", 
    blue: "Sapphire",
    random: "Spectrum"
  }[generatorColor]);

  let boostEmoji = $derived({
    red: "❤️",
    green: "💚",
    blue: "💙", 
    random: "🌈"
  }[generatorColor]);

  // Format multiplier for display
  function formatMultiplier(mult: number): string {
    if (mult === 1) return "1.0x";
    if (mult < 10) return `${mult.toFixed(2)}x`;
    if (mult < 100) return `${mult.toFixed(1)}x`;
    return `${Math.floor(mult)}x`;
  }

  // Get boost strength for visual styling
  let boostStrength = $derived(
    boostDetails().currentMultiplier >= 10 ? "strong" :
    boostDetails().currentMultiplier >= 5 ? "medium" :
    boostDetails().currentMultiplier > 1.5 ? "mild" : "none"
  );

  let glowClass = $derived({
    strong: "animate-pulse shadow-lg",
    medium: "shadow-md",
    mild: "shadow-sm",
    none: ""
  }[boostStrength]);
</script>

{#if boostDetails().currentMultiplier > 1}
  {@const details = boostDetails()}
  <div class="pure-boost-indicator {colorClasses} {glowClass}" 
       title={details.type === "single" ? 
         `${boostName} Boost: ${details.pureCount} pure colors\n${details.nextMilestone ? `Next milestone at ${details.nextMilestone}` : "Max milestones reached"}` :
         `Spectrum Boost: Balanced colors for maximum effect\nRed: ${details.redCount}, Green: ${details.greenCount}, Blue: ${details.blueCount}`
       }>
    <div class="flex items-center gap-2">
      <span class="text-sm">{boostEmoji}</span>
      <div class="flex flex-col">
        <div class="text-xs font-medium">
          {boostName} Boost
        </div>
        <div class="text-sm font-bold">
          {formatMultiplier(details.currentMultiplier)}
        </div>
      </div>
    </div>
    {#if details.type === "single"}
      <!-- Single color boost details -->
      {#if details.nextMilestone && details.nextMultiplier}
        <div class="text-xs opacity-75 mt-1">
          Next: +1 → {formatMultiplier(details.nextMultiplier)}
          {#if details.nextMilestone - details.pureCount <= 5}
            <span class="text-yellow-400">({details.nextMilestone - details.pureCount} to milestone!)</span>
          {/if}
        </div>
      {/if}
      
      {#if details.hasAllPureColors}
        <div class="text-xs text-yellow-300 mt-1 flex items-center gap-1">
          ✨ <span>Synergy Active</span>
        </div>
      {/if}
    {:else}
      <!-- Random generator boost details -->
      <div class="text-xs opacity-75 mt-1">
        Balance: {(details.balanceRatio * 100).toFixed(0)}%
        {#if details.hasBalance}
          <span class="text-green-300">🎯</span>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .pure-boost-indicator {
    border: 1px solid;
    border-radius: 0.5rem;
    padding: 0.5rem;
    text-align: center;
    transition: all 300ms;
    cursor: help;
    backdrop-filter: blur(4px);
  }
  
  .pure-boost-indicator:hover {
    transform: scale(1.05);
  }
</style>