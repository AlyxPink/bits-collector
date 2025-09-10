<script lang="ts">
  import {
    upgrades,
    totalSpeedMultiplier,
    ownedGenerators,
    TAB_UNLOCK_REQUIREMENTS,
    tabUnlockStatus,
  } from "$lib/stores/upgrades";
  import { pixels } from "$lib/stores/pixels";
  import { lumen } from "$lib/stores/lumen";
  import GeneratorUpgrade from "./GeneratorUpgrade.svelte";
  import PowerupUpgrade from "./PowerupUpgrade.svelte";
  import BreakthroughUpgrade from "./BreakthroughUpgrade.svelte";
  import LuminosityUpgrade from "./LuminosityUpgrade.svelte";
  import AutoConvertersTab from "./AutoConvertersTab.svelte";

  let activeTab = $state<"generators" | "autoConverters" | "powerups" | "breakthroughs" | "luminosity">(
    "generators"
  );

  let generators = $derived(Object.values($upgrades.generators));
  let powerupsArray = $derived(Object.values($upgrades.powerups));
  let breakthroughsArray = $derived(Object.values($upgrades.breakthroughs));
  let luminosityArray = $derived(Object.values($lumen.upgrades));
  let efficiency = $derived(upgrades.getProductionEfficiency());
  let hasAnyUpgrades = $derived(
    $ownedGenerators.length > 0 || powerupsArray.some((p) => p.level > 0)
  );

  // Use TAB_UNLOCK_REQUIREMENTS for consistent tab configuration
  const tabs = $derived(Object.values(TAB_UNLOCK_REQUIREMENTS));
  let unlockStatus = $derived($tabUnlockStatus);

  // Switch to generators tab if current tab becomes locked
  $effect(() => {
    if (!unlockStatus[activeTab]?.unlocked) {
      activeTab = "generators";
    }
  });
</script>

<div class="h-full flex">
  <!-- Vertical Menu -->
  <div
    class="w-28 md:w-32 bg-black/30 border-r border-green-500/20 flex flex-col"
  >
    {#each tabs as tab}
      {@const isUnlocked = unlockStatus[tab.id]?.unlocked ?? false}
      {@const cost = unlockStatus[tab.id]?.cost}
      {@const canAfford = unlockStatus[tab.id]?.canAfford ?? false}

      <button
        onclick={() => {
          if (isUnlocked) {
            activeTab = tab.id as "generators" | "autoConverters" | "powerups" | "breakthroughs" | "luminosity";
          } else if (canAfford) {
            // Purchase tab unlock with success feedback
            const success = upgrades.purchaseTabUnlock(tab.id);
            if (success) {
              // Visual feedback could be added here (e.g., flash animation)
              activeTab = tab.id as "generators" | "autoConverters" | "powerups" | "breakthroughs" | "luminosity";
            }
          }
        }}
        disabled={!isUnlocked && !canAfford}
        class="h-auto min-h-16 flex flex-col items-center justify-center border-b border-green-500/10 transition-all duration-300 p-1 transform hover:scale-105
               {isUnlocked
          ? activeTab === tab.id
            ? 'bg-green-500/20 border-r-2 border-r-green-400 text-green-400 shadow-lg shadow-green-500/20'
            : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10 cursor-pointer hover:shadow-md hover:shadow-green-500/10'
          : canAfford
          ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 cursor-pointer border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 animate-pulse'
          : 'text-gray-600 opacity-50 cursor-not-allowed'}"
      >
        <div class="text-lg mb-1">{isUnlocked ? tab.icon : canAfford ? "💎" : "🔒"}</div>
        <div
          class="text-xs font-bold uppercase tracking-wider leading-none text-center mb-1"
        >
          {tab.name}
        </div>

        {#if !isUnlocked && cost}
          <div class="text-xs text-center leading-tight">
            {#if canAfford}
              <div class="text-cyan-300 mb-1">Click to unlock!</div>
            {/if}
            <div class="grid grid-cols-2 gap-0.5 text-xs">
              <div class="flex items-center gap-1 {$pixels.white >= cost.white ? 'text-white' : 'text-red-400'}">
                <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                {cost.white}
              </div>
              <div class="flex items-center gap-1 {$pixels.red >= cost.red ? 'text-red-400' : 'text-red-600'}">
                <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {cost.red}
              </div>
              <div class="flex items-center gap-1 {$pixels.green >= cost.green ? 'text-green-400' : 'text-green-600'}">
                <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                {cost.green}
              </div>
              <div class="flex items-center gap-1 {$pixels.blue >= cost.blue ? 'text-blue-400' : 'text-blue-600'}">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                {cost.blue}
              </div>
            </div>
          </div>
        {/if}
      </button>
    {/each}

    <!-- Future tab placeholder -->
    <div
      class="h-16 flex flex-col items-center justify-center border-b border-green-500/10 text-gray-600 opacity-50"
    >
      <div class="text-lg mb-1">❓</div>
      <div
        class="text-xs font-bold uppercase tracking-wider leading-none text-center"
      >
        Soon
      </div>
    </div>
  </div>

  <!-- Content Area -->
  <div class="flex-1 p-6 overflow-y-auto">
    <!-- Header with stats -->
    <div class="mb-6">
      <h2
        class="text-2xl font-bold uppercase tracking-wider glow-text text-green-400 mb-3"
      >
        {TAB_UNLOCK_REQUIREMENTS[activeTab]?.name || "Generators"}
      </h2>

      {#if hasAnyUpgrades}
        <div class="flex flex-wrap gap-4 text-sm opacity-75">
          {#if $ownedGenerators.length > 0}
            <div class="flex items-center gap-2">
              <span>Active Generators:</span>
              <span class="font-bold text-cyan-400"
                >{$ownedGenerators.length}</span
              >
            </div>
          {/if}

          {#if $totalSpeedMultiplier > 1}
            <div class="flex items-center gap-2">
              <span>Speed Multiplier:</span>
              <span class="font-bold text-yellow-400"
                >{$totalSpeedMultiplier.toFixed(1)}x</span
              >
            </div>
          {/if}

          {#if efficiency < 1}
            <div class="flex items-center gap-2">
              <span>Production Efficiency:</span>
              <span
                class="font-bold {efficiency >= 0.8
                  ? 'text-green-400'
                  : efficiency >= 0.5
                    ? 'text-yellow-400'
                    : efficiency >= 0.25
                      ? 'text-orange-400'
                      : 'text-red-400'}"
              >
                {(efficiency * 100).toFixed(0)}%
              </span>
            </div>
          {/if}
        </div>
      {:else if activeTab === "generators"}
        <p class="text-sm opacity-60">
          Purchase generators to automatically collect colored bits over time
        </p>
      {:else if activeTab === "autoConverters"}
        <p class="text-sm opacity-60">
          Automate conversions from RGB to white and composite colors
        </p>
      {:else if activeTab === "powerups"}
        <p class="text-sm opacity-60">
          Expensive but powerful multipliers that boost ALL generator rates
        </p>
      {:else if activeTab === "breakthroughs"}
        <p class="text-sm opacity-60">
          Break through production soft caps with powerful efficiency upgrades
        </p>
      {:else if activeTab === "luminosity"}
        <p class="text-sm opacity-60">
          Harness the power of lumen to boost all systems and unlock synergies
        </p>
      {/if}
    </div>

    <!-- Content based on active tab -->
    {#if ($pixels.white > 0 || hasAnyUpgrades) && unlockStatus[activeTab]?.unlocked}
      <div class="space-y-4">
        {#if activeTab === "generators"}
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {#each generators as buyer}
              <GeneratorUpgrade upgrade={buyer} />
            {/each}
          </div>

          {#if $ownedGenerators.length === 0}
            <div
              class="text-center mt-8 p-6 bg-black/30 rounded-lg border border-cyan-500/30"
            >
              <div class="text-cyan-400 mb-2">💡</div>
              <h3 class="text-lg font-bold text-cyan-400 mb-2">Generators</h3>
              <p class="text-sm opacity-75 leading-relaxed">
                Purchase generators to automatically collect colored bits over
                time.<br />
                Each level increases the collection rate, and powerups multiply all
                rates!
              </p>
            </div>
          {/if}
        {:else if activeTab === "autoConverters"}
          <AutoConvertersTab />
        {:else if activeTab === "powerups"}
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {#each powerupsArray as powerup}
              <PowerupUpgrade upgrade={powerup} />
            {/each}
          </div>

          {#if powerupsArray.every((p) => p.level === 0)}
            <div
              class="text-center mt-8 p-6 bg-black/30 rounded-lg border border-yellow-500/30"
            >
              <div class="text-yellow-400 mb-2">⚡</div>
              <h3 class="text-lg font-bold text-yellow-400 mb-2">Powerups</h3>
              <p class="text-sm opacity-75 leading-relaxed">
                Expensive but powerful multipliers that boost ALL generator
                rates.<br />
                Stack multiple powerups for exponential growth!
              </p>
            </div>
          {/if}
        {:else if activeTab === "breakthroughs"}
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {#each breakthroughsArray as breakthrough}
              <BreakthroughUpgrade {breakthrough} />
            {/each}
          </div>

          {#if breakthroughsArray.every((b) => !b.purchased)}
            <div
              class="text-center mt-8 p-6 bg-black/30 rounded-lg border border-purple-500/30"
            >
              <div class="text-purple-400 mb-2">🚀</div>
              <h3 class="text-lg font-bold text-purple-400 mb-2">
                Breakthroughs
              </h3>
              <p class="text-sm opacity-75 leading-relaxed">
                Break through production soft caps with powerful efficiency
                upgrades.<br />
                Each breakthrough dramatically increases your production ceiling!
              </p>
            </div>
          {/if}
        {:else if activeTab === "luminosity"}
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {#each luminosityArray as upgrade}
              <LuminosityUpgrade {upgrade} />
            {/each}
          </div>

          {#if luminosityArray.every((u) => u.level === 0)}
            <div
              class="text-center mt-8 p-6 bg-black/30 rounded-lg border border-yellow-500/30"
            >
              <div class="text-yellow-400 mb-2">💡</div>
              <h3 class="text-lg font-bold text-yellow-400 mb-2">
                Luminosity Upgrades
              </h3>
              <p class="text-sm opacity-75 leading-relaxed">
                Harness the power of lumen to create powerful synergies!<br />
                Each upgrade improves lumen generation or boosts other systems.
              </p>
            </div>
          {/if}
        {/if}
      </div>
    {:else}
      <div
        class="text-center mt-16 p-8 bg-black/20 rounded-lg border border-green-500/30"
      >
        <div class="text-green-400 mb-4">🔒</div>

        {#if $pixels.white === 0 && !hasAnyUpgrades}
          <!-- Initial state: no upgrades unlocked yet -->
          <h3 class="text-xl font-bold text-green-400 mb-3">Upgrades Locked</h3>
          <p class="text-sm opacity-75 leading-relaxed">
            Convert your first set of RGB pixels to white pixels<br />
            to unlock the upgrade shop!
          </p>
        {:else if !unlockStatus[activeTab]?.unlocked}
          <!-- Tab is locked -->
          {@const cost = unlockStatus[activeTab]?.cost}
          {@const canAfford = unlockStatus[activeTab]?.canAfford ?? false}

          <h3 class="text-xl font-bold text-green-400 mb-3">
            {TAB_UNLOCK_REQUIREMENTS[activeTab]?.name || activeTab} Locked
          </h3>
          <p class="text-sm opacity-75 leading-relaxed mb-4">
            Purchase this tab to unlock access to {TAB_UNLOCK_REQUIREMENTS[activeTab]?.name.toLowerCase()}.
          </p>
          {#if cost}
            <div class="mb-4 p-3 bg-black/20 rounded-lg border border-cyan-500/30">
              <div class="text-sm font-bold text-cyan-400 mb-2">Unlock Cost:</div>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center justify-between">
                  <span>White:</span>
                  <span class="flex items-center gap-1 {$pixels.white >= cost.white ? 'text-white' : 'text-red-400'}">
                    {cost.white}
                    <div class="w-2 h-2 rounded-full bg-white"></div>
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Red:</span>
                  <span class="flex items-center gap-1 {$pixels.red >= cost.red ? 'text-red-400' : 'text-red-600'}">
                    {cost.red}
                    <div class="w-2 h-2 rounded-full bg-red-500"></div>
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Green:</span>
                  <span class="flex items-center gap-1 {$pixels.green >= cost.green ? 'text-green-400' : 'text-green-600'}">
                    {cost.green}
                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Blue:</span>
                  <span class="flex items-center gap-1 {$pixels.blue >= cost.blue ? 'text-blue-400' : 'text-blue-600'}">
                    {cost.blue}
                    <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                  </span>
                </div>
              </div>
              {#if canAfford}
                <button 
                  onclick={() => {
                    const success = upgrades.purchaseTabUnlock(activeTab);
                    if (success) {
                      // Tab unlocking will trigger reactive updates automatically
                    }
                  }}
                  class="w-full mt-3 py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 animate-pulse"
                >
                  💎 Purchase {TAB_UNLOCK_REQUIREMENTS[activeTab]?.name}
                </button>
              {:else}
                <div class="text-center mt-3 text-red-400 text-sm">
                  Insufficient resources
                </div>
              {/if}
            </div>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
</div>
