<script lang="ts">
  import {
    upgrades,
    totalSpeedMultiplier,
    ownedGenerators,
  } from "$lib/stores/upgrades";
  import { pixels } from "$lib/stores/pixels";
  import { hasUnlockedUpgrades } from "$lib/stores/upgrades";
  import GeneratorUpgrade from "./GeneratorUpgrade.svelte";
  import PowerupUpgrade from "./PowerupUpgrade.svelte";
  import BreakthroughUpgrade from "./BreakthroughUpgrade.svelte";

  let activeTab = $state<"generators" | "powerups" | "breakthroughs">(
    "generators",
  );

  let generators = $derived(Object.values($upgrades.generators));
  let powerupsArray = $derived(Object.values($upgrades.powerups));
  let breakthroughsArray = $derived(Object.values($upgrades.breakthroughs));
  let efficiency = $derived(upgrades.getProductionEfficiency());
  let hasAnyUpgrades = $derived(
    $ownedGenerators.length > 0 || powerupsArray.some((p) => p.level > 0),
  );

  const tabs = [
    { id: "generators" as const, label: "Generators", icon: "🤖" },
    { id: "powerups" as const, label: "Powerups", icon: "⚡" },
    { id: "breakthroughs" as const, label: "Breakthroughs", icon: "🚀" },
  ];
</script>

<div class="h-full flex">
  <!-- Vertical Menu -->
  <div class="w-32 bg-black/30 border-r border-green-500/20 flex flex-col">
    {#each tabs as tab}
      <button
        onclick={() => (activeTab = tab.id)}
        class="h-16 flex flex-col items-center justify-center border-b border-green-500/10 transition-all duration-200 hover:bg-green-500/10
               {activeTab === tab.id
          ? 'bg-green-500/20 border-r-2 border-r-green-400 text-green-400'
          : 'text-gray-400 hover:text-green-400'}"
      >
        <div class="text-lg mb-1">{tab.icon}</div>
        <div
          class="text-xs font-bold uppercase tracking-wider leading-none text-center"
        >
          {tab.label}
        </div>
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
        {activeTab === "generators"
          ? "Generators"
          : activeTab === "powerups"
            ? "Powerups"
            : "Breakthroughs"}
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
      {:else if activeTab === "powerups"}
        <p class="text-sm opacity-60">
          Expensive but powerful multipliers that boost ALL generator rates
        </p>
      {:else}
        <p class="text-sm opacity-60">
          Break through production soft caps with powerful efficiency upgrades
        </p>
      {/if}
    </div>

    <!-- Content based on active tab -->
    {#if $pixels.white > 0 || $hasUnlockedUpgrades}
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
        {/if}
      </div>
    {:else}
      <div
        class="text-center mt-16 p-8 bg-black/20 rounded-lg border border-green-500/30"
      >
        <div class="text-green-400 mb-4">🔒</div>
        <h3 class="text-xl font-bold text-green-400 mb-3">Upgrades Locked</h3>
        <p class="text-sm opacity-75 leading-relaxed">
          Convert your first set of RGB pixels to white pixels<br />
          to unlock the upgrade shop!
        </p>
      </div>
    {/if}
  </div>
</div>
