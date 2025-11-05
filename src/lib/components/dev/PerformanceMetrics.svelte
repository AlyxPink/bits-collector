<script lang="ts">
import { performanceMonitor } from "$lib/utils/performanceMonitor";
import { onMount, onDestroy } from "svelte";

let metrics = $state<{
	ticks: number;
	storeUpdates: number;
	derivedRecalcs: number;
	fps: number;
	lastReset: number;
	expectedTPS?: number;
}>({
	ticks: 0,
	storeUpdates: 0,
	derivedRecalcs: 0,
	fps: 0,
	lastReset: Date.now(),
	expectedTPS: 10,
});

let budget = $state({
	ticksPerSecond: 10,
	storeUpdatesPerSecond: 100,
	derivedRecalcsPerSecond: 500,
});

let performanceMode = $state<string>("normal");

let updateInterval: ReturnType<typeof setInterval> | null = null;

onMount(() => {
	// Update metrics display every 100ms
	updateInterval = setInterval(() => {
		metrics = performanceMonitor.getMetrics();
		budget = performanceMonitor.getBudget();

		// Get current performance mode from game loop
		const gameLoopState = (window as any).__gameLoopState;
		if (gameLoopState?.performanceMode) {
			performanceMode = gameLoopState.performanceMode;
		}
	}, 100);
});

onDestroy(() => {
	if (updateInterval) {
		clearInterval(updateInterval);
	}
});

// Color coding for metrics based on budget
function getMetricColor(value: number, budgetValue: number): string {
	const ratio = value / budgetValue;
	if (ratio < 0.5) return "text-green-400";
	if (ratio < 0.8) return "text-yellow-400";
	if (ratio < 1.0) return "text-orange-400";
	return "text-red-400";
}

// Color coding for performance mode
function getModeColor(mode: string): string {
	switch (mode) {
		case "normal": return "text-green-400";
		case "medium": return "text-yellow-400";
		case "high": return "text-orange-400";
		case "extreme": return "text-red-400";
		case "emergency": return "text-red-600 animate-pulse";
		default: return "text-gray-400";
	}
}

function getModeEmoji(mode: string): string {
	switch (mode) {
		case "normal": return "✅";
		case "medium": return "⚡";
		case "high": return "🔥";
		case "extreme": return "🚀";
		case "emergency": return "🚨";
		default: return "❓";
	}
}
</script>

{#if import.meta.env.DEV}
  <div class="fixed bottom-4 right-4 bg-black/90 border border-cyan-500/50 rounded-lg p-3 text-xs font-mono shadow-lg z-50">
    <div class="text-cyan-400 font-bold mb-2 text-center">
      Performance Monitor
    </div>

    <div class="space-y-1">
      <!-- Performance Mode -->
      <div class="flex justify-between gap-4 pb-1 border-b border-gray-700">
        <span class="text-gray-400">Mode:</span>
        <span class="{getModeColor(performanceMode)}">
          {getModeEmoji(performanceMode)} {performanceMode.toUpperCase()}
        </span>
      </div>

      <!-- FPS -->
      <div class="flex justify-between gap-4">
        <span class="text-gray-400">FPS:</span>
        <span class="{metrics.fps >= 55 ? 'text-green-400' : metrics.fps >= 30 ? 'text-yellow-400' : 'text-red-400'}">
          {metrics.fps}
        </span>
      </div>

      <!-- Game Ticks -->
      <div class="flex justify-between gap-4">
        <span class="text-gray-400">Ticks/s:</span>
        <span class="{getMetricColor(metrics.ticks, metrics.expectedTPS || budget.ticksPerSecond)}">
          {metrics.ticks}/{metrics.expectedTPS || budget.ticksPerSecond}
        </span>
      </div>

      <!-- Store Updates -->
      <div class="flex justify-between gap-4">
        <span class="text-gray-400">Updates/s:</span>
        <span class="{getMetricColor(metrics.storeUpdates, budget.storeUpdatesPerSecond)}">
          {metrics.storeUpdates}/{budget.storeUpdatesPerSecond}
        </span>
      </div>

      <!-- Derived Recalculations -->
      <div class="flex justify-between gap-4">
        <span class="text-gray-400">Derived/s:</span>
        <span class="{getMetricColor(metrics.derivedRecalcs, budget.derivedRecalcsPerSecond)}">
          {metrics.derivedRecalcs}/{budget.derivedRecalcsPerSecond}
        </span>
      </div>
    </div>

    <div class="mt-2 pt-2 border-t border-gray-700 text-center text-gray-500 text-[10px]">
      Dev Mode Only
    </div>
  </div>
{/if}
