<script lang="ts">
  import { ownedBitsBuyers, upgrades, totalSpeedMultiplier } from '$lib/stores/upgrades';
  
  let isActive = $state(false);
  let flashColor = $state<'red' | 'green' | 'blue' | 'purple'>('purple');
  
  // Flash indicator when auto-buying happens
  if (typeof window !== 'undefined') {
    setInterval(() => {
      if ($ownedBitsBuyers.length > 0) {
        isActive = true;
        
        // Pick a random color to flash
        const colors: ('red' | 'green' | 'blue' | 'purple')[] = ['red', 'green', 'blue', 'purple'];
        flashColor = colors[Math.floor(Math.random() * colors.length)];
        
        setTimeout(() => {
          isActive = false;
        }, 100);
      }
    }, 1000 / Math.max(1, $totalSpeedMultiplier)); // Flash faster with higher multipliers
  }
  
  const colorClasses = {
    red: 'bg-red-500 shadow-red-500/50',
    green: 'bg-green-500 shadow-green-500/50',
    blue: 'bg-blue-500 shadow-blue-500/50',
    purple: 'bg-purple-500 shadow-purple-500/50'
  };
</script>

{#if $ownedBitsBuyers.length > 0}
  <div class="fixed top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-2 rounded-lg border border-green-500/30">
    <div class="relative">
      <div class="w-3 h-3 rounded-full {colorClasses[flashColor]} {isActive ? 'animate-ping' : ''} shadow-lg"></div>
      {#if isActive}
        <div class="absolute inset-0 w-3 h-3 rounded-full {colorClasses[flashColor]} animate-ping"></div>
      {/if}
    </div>
    <span class="text-xs text-green-400 font-bold uppercase tracking-wider">
      Auto-buying Active
    </span>
    {#if $totalSpeedMultiplier > 1}
      <span class="text-xs text-yellow-400 font-bold">
        ({$totalSpeedMultiplier.toFixed(1)}x)
      </span>
    {/if}
  </div>
{/if}

<style>
  @keyframes ping {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  .animate-ping {
    animation: ping 0.5s cubic-bezier(0, 0, 0.2, 1);
  }
</style>