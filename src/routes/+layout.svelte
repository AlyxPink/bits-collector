<script lang="ts">
import "../app.css";
import { inputController } from "$lib/stores/inputController";
import { checkAndClearIfNeeded } from "$lib/stores/saveManager";
import { onMount } from "svelte";

let { children } = $props();

onMount(() => {
	// Check for reset flag before any stores initialize
	checkAndClearIfNeeded();
	
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
	document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("keyup", handleKeyUp);
	document.addEventListener("mousedown", handleMouseDown);
	document.addEventListener("mouseup", handleMouseUp);

	// Cleanup on unmount
	return () => {
		document.removeEventListener("keydown", handleKeyDown);
		document.removeEventListener("keyup", handleKeyUp);
		document.removeEventListener("mousedown", handleMouseDown);
		document.removeEventListener("mouseup", handleMouseUp);
	};
});
</script>

<svelte:head>
	<title>Bits Collector - RGB Pixel Incremental Game</title>
	<meta name="description" content="An addictive incremental game where you collect RGB pixels, convert them to white pixels, and purchase auto-buyers to build your pixel empire. Play the ultimate idle clicker game!" />
	<meta name="keywords" content="incremental game, idle game, clicker game, pixel collector, auto-buyer, RGB pixels, browser game" />
	<meta name="author" content="AlyxPink" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Bits Collector - RGB Pixel Incremental Game" />
	<meta property="og:description" content="An addictive incremental game where you collect RGB pixels, convert them to white pixels, and purchase auto-buyers to build your pixel empire." />
	<meta property="og:site_name" content="Bits Collector" />
	
	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Bits Collector - RGB Pixel Incremental Game" />
	<meta name="twitter:description" content="An addictive incremental game where you collect RGB pixels, convert them to white pixels, and purchase auto-buyers to build your pixel empire." />
	
	<!-- Theme and mobile -->
	<meta name="theme-color" content="#10b981" />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="default" />
</svelte:head>

<div class="min-h-screen">
	{@render children?.()}
</div>
