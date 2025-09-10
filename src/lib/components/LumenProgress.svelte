<script lang="ts">
	import { lumen } from "$lib/stores/lumen";

	// Milestone thresholds for visual feedback
	const MILESTONES = [
		{ threshold: 100, name: "Dim Glow", icon: "🔆", color: "text-yellow-400" },
		{ threshold: 1000, name: "Steady Light", icon: "💡", color: "text-yellow-300" },
		{ threshold: 10000, name: "Bright Beacon", icon: "🌟", color: "text-yellow-200" },
		{ threshold: 100000, name: "Radiant Source", icon: "✨", color: "text-white" },
		{ threshold: 1000000, name: "Stellar Core", icon: "⭐", color: "text-blue-200" },
		{ threshold: 10000000, name: "Solar Flare", icon: "🌞", color: "text-orange-200" },
		{ threshold: 100000000, name: "Supernova", icon: "💥", color: "text-red-200" },
		{ threshold: 1000000000, name: "Galactic Beacon", icon: "🌌", color: "text-purple-200" },
	];

	// Get current milestone info
	function getCurrentMilestone(total: number) {
		let current = null;
		let next = MILESTONES[0];

		for (let i = 0; i < MILESTONES.length; i++) {
			if (total >= MILESTONES[i].threshold) {
				current = MILESTONES[i];
				next = MILESTONES[i + 1] || null;
			} else {
				break;
			}
		}

		return { current, next };
	}

	// Calculate progress to next milestone
	function getProgress(total: number, current: any, next: any): number {
		if (!next) return 1; // Max brightness achieved
		
		const start = current ? current.threshold : 0;
		const end = next.threshold;
		const progress = Math.min(1, (total - start) / (end - start));
		
		return Math.max(0, progress);
	}

	// Format numbers for display
	function formatNumber(num: number): string {
		if (num < 1000) return num.toString();
		if (num < 1000000) return (num / 1000).toFixed(1) + "K";
		if (num < 1000000000) return (num / 1000000).toFixed(1) + "M";
		if (num < 1000000000000) return (num / 1000000000).toFixed(1) + "B";
		return (num / 1000000000000).toFixed(1) + "T";
	}

	$: milestoneInfo = getCurrentMilestone($lumen.total);
	$: progress = getProgress($lumen.total, milestoneInfo.current, milestoneInfo.next);
	$: progressPercent = Math.round(progress * 100);
</script>

<div class="lumen-progress-container">
	<div class="progress-header">
		<div class="current-milestone">
			{#if milestoneInfo.current}
				<span class="milestone-icon {milestoneInfo.current.color}">
					{milestoneInfo.current.icon}
				</span>
				<span class="milestone-name {milestoneInfo.current.color}">
					{milestoneInfo.current.name}
				</span>
			{:else}
				<span class="milestone-icon text-gray-400">🔅</span>
				<span class="milestone-name text-gray-400">Dark</span>
			{/if}
		</div>
		
		{#if milestoneInfo.next}
			<div class="next-milestone">
				<span class="next-label">Next:</span>
				<span class="next-icon">{milestoneInfo.next.icon}</span>
				<span class="next-name">{milestoneInfo.next.name}</span>
			</div>
		{:else}
			<div class="max-brightness">
				<span class="max-icon">🌌</span>
				<span class="max-text">Maximum Brightness!</span>
			</div>
		{/if}
	</div>

	{#if milestoneInfo.next}
		<div class="progress-section">
			<div class="progress-bar-container">
				<div class="progress-bar">
					<div 
						class="progress-fill" 
						style="width: {progressPercent}%"
						class:glow={progressPercent > 75}
					></div>
				</div>
				<div class="progress-text">{progressPercent}%</div>
			</div>
			
			<div class="progress-info">
				<div class="current-amount">
					{formatNumber($lumen.total)} lumen
				</div>
				<div class="target-amount">
					{formatNumber(milestoneInfo.next.threshold)} needed
				</div>
			</div>
		</div>
	{/if}

	<div class="milestone-grid">
		{#each MILESTONES.slice(0, 6) as milestone, i}
			<div 
				class="milestone-item"
				class:achieved={$lumen.total >= milestone.threshold}
				class:current={milestoneInfo.current?.threshold === milestone.threshold}
			>
				<div class="milestone-icon-small {milestone.color}">
					{milestone.icon}
				</div>
				<div class="milestone-threshold">
					{formatNumber(milestone.threshold)}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.lumen-progress-container {
		@apply bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900;
		@apply border border-indigo-600 rounded-lg p-4 space-y-4;
	}

	.progress-header {
		@apply flex justify-between items-center;
	}

	.current-milestone {
		@apply flex items-center gap-2;
	}

	.milestone-icon {
		@apply text-2xl;
		filter: drop-shadow(0 0 5px currentColor);
	}

	.milestone-name {
		@apply font-bold text-lg;
		text-shadow: 0 0 5px currentColor;
	}

	.next-milestone {
		@apply flex items-center gap-1 text-sm text-gray-300;
	}

	.next-label {
		@apply opacity-75;
	}

	.next-icon {
		@apply text-base;
	}

	.max-brightness {
		@apply flex items-center gap-2 text-purple-200;
	}

	.max-icon {
		@apply text-xl animate-pulse;
	}

	.progress-section {
		@apply space-y-2;
	}

	.progress-bar-container {
		@apply flex items-center gap-3;
	}

	.progress-bar {
		@apply flex-1 bg-gray-700 rounded-full h-3 overflow-hidden;
	}

	.progress-fill {
		@apply h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400;
		@apply transition-all duration-500 ease-out;
	}

	.progress-fill.glow {
		box-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
	}

	.progress-text {
		@apply text-white font-semibold text-sm min-w-10 text-right;
	}

	.progress-info {
		@apply flex justify-between text-sm;
	}

	.current-amount {
		@apply text-yellow-300 font-medium;
	}

	.target-amount {
		@apply text-gray-400;
	}

	.milestone-grid {
		@apply grid grid-cols-6 gap-2;
	}

	.milestone-item {
		@apply flex flex-col items-center gap-1 p-2 rounded;
		@apply bg-gray-800/50 border border-gray-600;
		@apply transition-all duration-300;
	}

	.milestone-item.achieved {
		@apply bg-yellow-900/30 border-yellow-600;
	}

	.milestone-item.current {
		@apply bg-yellow-800/50 border-yellow-400;
		@apply animate-pulse;
	}

	.milestone-icon-small {
		@apply text-lg;
	}

	.milestone-item.achieved .milestone-icon-small {
		filter: drop-shadow(0 0 3px currentColor);
	}

	.milestone-threshold {
		@apply text-xs font-medium;
	}

	.milestone-item.achieved .milestone-threshold {
		@apply text-yellow-200;
	}

	.milestone-item:not(.achieved) .milestone-threshold {
		@apply text-gray-400;
	}
</style>