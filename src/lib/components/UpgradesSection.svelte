<script lang="ts">
  import { upgrades, totalSpeedMultiplier, ownedBitsBuyers } from '$lib/stores/upgrades';
  import { pixels } from '$lib/stores/pixels';
  import BitsBuyerUpgrade from './BitsBuyerUpgrade.svelte';
  import PowerupUpgrade from './PowerupUpgrade.svelte';
  
  let activeTab = $state<'buyers' | 'powerups'>('buyers');
  
  let bitsBuyers = $derived(Object.values($upgrades.bitsBuyers));
  let powerupsArray = $derived(Object.values($upgrades.powerups));
  let hasAnyUpgrades = $derived($ownedBitsBuyers.length > 0 || powerupsArray.some(p => p.level > 0));
</script>

<div class="max-w-6xl mx-auto">
  <!-- Header with current multiplier info -->
  <div class="text-center mb-6">
    <h2 class="text-2xl font-bold uppercase tracking-wider glow-text text-green-400 mb-2">
      UPGRADES
    </h2>
    
    {#if hasAnyUpgrades}
      <div class="flex justify-center items-center gap-4 text-sm opacity-75">
        {#if $ownedBitsBuyers.length > 0}
          <div class="flex items-center gap-2">
            <span>Active Auto-buyers:</span>
            <span class="font-bold text-cyan-400">{$ownedBitsBuyers.length}</span>
          </div>
        {/if}
        
        {#if $totalSpeedMultiplier > 1}
          <div class="flex items-center gap-2">
            <span>Speed Multiplier:</span>
            <span class="font-bold text-yellow-400">{$totalSpeedMultiplier.toFixed(1)}x</span>
          </div>
        {/if}
        
        <div class="flex items-center gap-2">
          <span>White Pixels:</span>
          <span class="font-bold text-white">{$pixels.white}</span>
          <div class="w-3 h-3 bg-white rounded-full shadow-lg shadow-white/50"></div>
        </div>
      </div>
    {:else}
      <p class="text-sm opacity-60">
        Spend white pixels to unlock automation and speed boosts
      </p>
    {/if}
  </div>
  
  <!-- Tab Navigation -->
  <div class="flex justify-center mb-6">
    <div class="flex bg-black/50 rounded-lg p-1 border border-green-500/30">
      <button
        onclick={() => activeTab = 'buyers'}
        class="px-4 py-2 font-bold text-sm uppercase tracking-wider rounded-md transition-all duration-200
               {activeTab === 'buyers' 
                 ? 'text-green-400 bg-green-500/20 border border-green-500/50 shadow-lg shadow-green-500/30' 
                 : 'text-gray-400 hover:text-green-400'}"
      >
        Bits Buyers
      </button>
      <button
        onclick={() => activeTab = 'powerups'}
        class="px-4 py-2 font-bold text-sm uppercase tracking-wider rounded-md transition-all duration-200
               {activeTab === 'powerups' 
                 ? 'text-green-400 bg-green-500/20 border border-green-500/50 shadow-lg shadow-green-500/30' 
                 : 'text-gray-400 hover:text-green-400'}"
      >
        Powerups
      </button>
    </div>
  </div>
  
  <!-- Tab Content -->
  <div class="min-h-[300px]">
    {#if activeTab === 'buyers'}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each bitsBuyers as buyer}
          <BitsBuyerUpgrade upgrade={buyer} />
        {/each}
      </div>
      
      {#if $ownedBitsBuyers.length === 0}
        <div class="text-center mt-8 p-6 bg-black/30 rounded-lg border border-cyan-500/30">
          <div class="text-cyan-400 mb-2">💡</div>
          <h3 class="text-lg font-bold text-cyan-400 mb-2">Auto-buyers</h3>
          <p class="text-sm opacity-75 leading-relaxed">
            Purchase auto-buyers to automatically collect colored bits over time.<br>
            Each level increases the collection rate, and powerups multiply all rates!
          </p>
        </div>
      {/if}
      
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each powerupsArray as powerup}
          <PowerupUpgrade upgrade={powerup} />
        {/each}
      </div>
      
      {#if powerupsArray.every(p => p.level === 0)}
        <div class="text-center mt-8 p-6 bg-black/30 rounded-lg border border-yellow-500/30">
          <div class="text-yellow-400 mb-2">⚡</div>
          <h3 class="text-lg font-bold text-yellow-400 mb-2">Powerups</h3>
          <p class="text-sm opacity-75 leading-relaxed">
            Expensive but powerful multipliers that boost ALL auto-buyer rates.<br>
            Stack multiple powerups for exponential growth!
          </p>
        </div>
      {/if}
    {/if}
  </div>
</div>

