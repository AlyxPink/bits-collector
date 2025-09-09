<script lang="ts">
import { gameStats } from "$lib/stores/game";
</script>

<header class="text-center mb-8">
  <h1 class="text-6xl font-bold text-green-400 glow-text font-mono mb-2">
    BITS COLLECTOR
  </h1>
  <div class="text-green-500 text-xl tracking-widest uppercase opacity-75">
    ▓▓▓ COLLECT • CONVERT • UPGRADE ▓▓▓
  </div>
  
  <div class="mt-6 flex justify-center gap-8 text-sm opacity-60">
    <div>Total Clicks: <span class="text-green-400 font-bold tabular-nums">{$gameStats.totalClicks}</span></div>
    <div>Conversions: <span class="text-white font-bold tabular-nums">{$gameStats.totalConversions}</span></div>
  </div>
</header>