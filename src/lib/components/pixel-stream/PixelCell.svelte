<script lang="ts">
import type { StreamPixel } from "$lib/stores/pixelStream";

interface Props {
	pixel: StreamPixel | null;
	size?: "small" | "normal";
}

let { pixel, size = "normal" }: Props = $props();

function getPixelClasses(pixel: StreamPixel | null): string {
	const sizeClasses = size === "small" ? "w-2 h-2" : "w-2.5 h-2.5";

	if (!pixel) {
		return `${sizeClasses} border border-gray-800/50 bg-gray-950/50 transition-all duration-100`;
	}

	const colorClasses = {
		red: "bg-red-500 border-red-400/50 shadow-red-500/50",
		green: "bg-green-500 border-green-400/50 shadow-green-500/50",
		blue: "bg-blue-500 border-blue-400/50 shadow-blue-500/50",
	};

	return `${sizeClasses} border transition-all duration-100 ${colorClasses[pixel.color]} shadow-sm`;
}

function getPixelStyle(pixel: StreamPixel | null): string {
	if (!pixel) return "";

	const glowIntensity = pixel.opacity * 0.8;
	return `
      opacity: ${pixel.opacity};
      transform: scale(${0.8 + pixel.opacity * 0.2});
    `;
}
</script>

<div 
  class={getPixelClasses(pixel)}
  style={getPixelStyle(pixel)}
></div>