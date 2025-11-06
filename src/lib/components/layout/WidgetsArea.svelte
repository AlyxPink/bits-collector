<script lang="ts">
import GeneratorIndicator from "$lib/components/upgrades/GeneratorIndicator.svelte";
import GameStatsWidget from "$lib/components/stats/GameStatsWidget.svelte";
</script>

<div class="h-full bg-black/10 border-r border-green-500/20 p-4 space-y-6">
  <!-- Widgets Section Header -->
  <div class="text-center">
    <h2 class="text-lg font-bold uppercase tracking-wider text-green-400 glow-text mb-2">
      Widgets
    </h2>
    <div class="w-12 h-px bg-green-500/50 mx-auto"></div>
  </div>
  
  <!-- Generator Indicator Widget -->
  <div class="bg-black/30 rounded-lg p-4 border border-green-500/30">
    <h3 class="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3 text-center">
      Generator Status
    </h3>
    <GeneratorIndicator />
  </div>

  <!-- Game Stats Widget -->
  <div class="bg-black/30 rounded-lg p-4 border border-cyan-500/30">
    <h3 class="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3 text-center">
      Game Stats
    </h3>
    <GameStatsWidget />
  </div>
  
  <!-- Another Future Widget Placeholder -->
  <div class="bg-black/20 rounded-lg p-4 border border-gray-600/30 opacity-50">
    <h3 class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 text-center">
      More Widgets
    </h3>
    <div class="text-center text-xs text-gray-500">
      Coming Soon...
    </div>
  </div>
</div>