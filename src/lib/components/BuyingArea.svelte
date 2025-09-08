<script lang="ts">
  import { upgrades, totalSpeedMultiplier, ownedBitsBuyers } from '$lib/stores/upgrades';
  import { pixels } from '$lib/stores/pixels';
  import { hasUnlockedUpgrades } from '$lib/stores/upgrades';
  import BitsBuyerUpgrade from './BitsBuyerUpgrade.svelte';
  import PowerupUpgrade from './PowerupUpgrade.svelte';
  
  let activeTab = $state<'buyers' | 'powerups'>('buyers');
  
  let bitsBuyers = $derived(Object.values($upgrades.bitsBuyers));
  let powerupsArray = $derived(Object.values($upgrades.powerups));
  let hasAnyUpgrades = $derived($ownedBitsBuyers.length > 0 || powerupsArray.some(p => p.level > 0));
  
  const tabs = [
    { id: 'buyers' as const, label: 'Bits Buyers', icon: '🤖' },
    { id: 'powerups' as const, label: 'Powerups', icon: '⚡' },
  ];
</script>

<div class="h-full flex">
  <!-- Vertical Menu -->
  <div class="w-20 bg-black/30 border-r border-green-500/20 flex flex-col">
    {#each tabs as tab}
      <button
        onclick={() => activeTab = tab.id}
        class="h-16 flex flex-col items-center justify-center border-b border-green-500/10 transition-all duration-200 hover:bg-green-500/10
               {activeTab === tab.id ? 'bg-green-500/20 border-r-2 border-r-green-400 text-green-400' : 'text-gray-400 hover:text-green-400'}"
      >
        <div class="text-lg mb-1">{tab.icon}</div>
        <div class="text-xs font-bold uppercase tracking-wider leading-none text-center">{tab.label}</div>
      </button>
    {/each}
    
    <!-- Future tab placeholder -->
    <div class="h-16 flex flex-col items-center justify-center border-b border-green-500/10 text-gray-600 opacity-50">
      <div class="text-lg mb-1">❓</div>
      <div class="text-xs font-bold uppercase tracking-wider leading-none text-center">Soon</div>
    </div>
  </div>
  
  <!-- Content Area -->
  <div class="flex-1 p-6 overflow-y-auto">
    <!-- Header with stats -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold uppercase tracking-wider glow-text text-green-400 mb-3">
        {activeTab === 'buyers' ? 'Bits Buyers' : 'Powerups'}
      </h2>
      
      {#if hasAnyUpgrades}
        <div class="flex flex-wrap gap-4 text-sm opacity-75">
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
        </div>
      {:else if activeTab === 'buyers'}
        <p class="text-sm opacity-60">
          Purchase auto-buyers to automatically collect colored bits over time
        </p>
      {:else}
        <p class="text-sm opacity-60">
          Expensive but powerful multipliers that boost ALL auto-buyer rates
        </p>
      {/if}
    </div>
    
    <!-- Content based on active tab -->
    {#if $pixels.white > 0 || $hasUnlockedUpgrades}
      <div class="space-y-4">
        {#if activeTab === 'buyers'}
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
          
        {:else if activeTab === 'powerups'}
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
    {:else}
      <div class="text-center mt-16 p-8 bg-black/20 rounded-lg border border-green-500/30">
        <div class="text-green-400 mb-4">🔒</div>
        <h3 class="text-xl font-bold text-green-400 mb-3">Upgrades Locked</h3>
        <p class="text-sm opacity-75 leading-relaxed">
          Convert your first set of RGB pixels to white pixels<br>
          to unlock the upgrade shop!
        </p>
      </div>
    {/if}
  </div>
</div>