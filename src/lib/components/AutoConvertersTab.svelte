<script lang="ts">
  import { unlockedConverters, activeConverters } from "$lib/stores/autoConverters";
  import AutoConverterUpgrade from "./AutoConverterUpgrade.svelte";

  let convertersList = $derived($unlockedConverters);
  let activeConvertersList = $derived($activeConverters);
</script>

<div class="h-full flex flex-col">
  <div class="mb-6 text-center">
    <h2 class="text-2xl font-bold uppercase tracking-wider text-cyan-400 glow-text mb-2">
      Auto Converters
    </h2>
    {#if activeConvertersList.length > 0}
      <div class="text-sm text-green-400">
        {activeConvertersList.length} active converter{activeConvertersList.length === 1 ? '' : 's'} running
      </div>
    {:else}
      <div class="text-sm text-gray-400">
        No active converters
      </div>
    {/if}
  </div>

  {#if convertersList.length === 0}
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center opacity-60 space-y-4">
        <div class="text-4xl">⚙️</div>
        <div>
          <p class="text-lg mb-2">Auto Converters Locked</p>
          <p class="text-sm">Reach 10 lifetime white pixels to unlock your first auto converter!</p>
        </div>
      </div>
    </div>
  {:else}
    <!-- Converters Grid -->
    <div class="flex-1 overflow-y-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {#each convertersList as converter}
          <AutoConverterUpgrade {converter} />
        {/each}
      </div>
    </div>

    <!-- Information Panel -->
    <div class="mt-6 p-4 bg-black/20 rounded-lg border border-gray-700/50">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <!-- White Converter Info -->
        <div class="bg-white/5 border border-white/20 rounded p-3">
          <p class="text-white font-bold mb-1">⚪ White Converters</p>
          <p class="text-gray-300 mb-2">Automatically convert RGB → White pixels</p>
          <p class="text-gray-400">• Uses same cost scaling as manual conversion</p>
          <p class="text-gray-400">• Respects breakthrough bonuses</p>
        </div>

        <!-- Pure Color Info -->
        <div class="bg-purple-500/5 border border-purple-500/20 rounded p-3">
          <p class="text-purple-400 font-bold mb-1">💎 Pure Forges</p>
          <p class="text-gray-300 mb-2">Auto-convert 3 of same color → Pure color</p>
          <p class="text-gray-400">• Crimson: 3R → Crimson</p>
          <p class="text-gray-400">• Emerald: 3G → Emerald</p>
          <p class="text-gray-400">• Sapphire: 3B → Sapphire</p>
        </div>

        <!-- Mixed Color Info -->
        <div class="bg-green-500/5 border border-green-500/20 rounded p-3">
          <p class="text-green-400 font-bold mb-1">🎨 Mixed Mixers</p>
          <p class="text-gray-300 mb-2">Auto-convert RGB → Mixed colors</p>
          <p class="text-gray-400">• Orange: 2R + 1G</p>
          <p class="text-gray-400">• Purple: 2R + 1B</p>
          <p class="text-gray-400">• Yellow: 1R + 2G</p>
          <p class="text-gray-400">• And more...</p>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-gray-700/50">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <p class="text-yellow-400 font-bold mb-2">💡 Tips:</p>
            <ul class="text-gray-400 space-y-1">
              <li>• Click the toggle switch to enable/disable converters</li>
              <li>• Higher levels = faster conversion rates</li>
              <li>• Converters work even when away from the game</li>
            </ul>
          </div>
          <div>
            <p class="text-cyan-400 font-bold mb-2">⚙️ Strategy:</p>
            <ul class="text-gray-400 space-y-1">
              <li>• Balance white conversion with composite colors</li>
              <li>• Pure colors boost matching RGB generators</li>
              <li>• Mixed colors unlock at 25 lifetime white</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>