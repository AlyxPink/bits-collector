<script lang="ts">
// Access build-time variables injected by Vite
const buildTime = __BUILD_TIME__;
const commitSha = __COMMIT_SHA__;
const branch = __BRANCH__;

// Format the build time for display
function formatBuildTime(isoString: string): string {
	try {
		const date = new Date(isoString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			timeZoneName: 'short'
		});
	} catch {
		return 'Unknown';
	}
}

// Get short commit hash (first 7 characters)
const shortCommit = commitSha.slice(0, 7);
const formattedBuildTime = formatBuildTime(buildTime);
</script>

<footer class="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-green-500/20 px-4 py-2 z-50">
	<div class="text-center text-xs text-gray-500">
		version: {shortCommit} • Built: {formattedBuildTime}
	</div>
</footer>