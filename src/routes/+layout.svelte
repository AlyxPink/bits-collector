<script lang="ts">
	import '../app.css';
	import { inputController } from '$lib/stores/inputController';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		// Global keyboard event listeners
		const handleKeyDown = (event: KeyboardEvent) => {
			inputController.keyDown(event.key);
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			inputController.keyUp(event.key);
		};

		// Global mouse event listeners
		const handleMouseDown = (event: MouseEvent) => {
			inputController.mouseDown(event.button);
		};

		const handleMouseUp = (event: MouseEvent) => {
			inputController.mouseUp(event.button);
		};

		// Add event listeners
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);
		document.addEventListener('mousedown', handleMouseDown);
		document.addEventListener('mouseup', handleMouseUp);

		// Cleanup on unmount
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
			document.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	});
</script>

<svelte:head>
	<title>Bits Collector</title>
</svelte:head>

<div class="min-h-screen">
	{@render children?.()}
</div>
