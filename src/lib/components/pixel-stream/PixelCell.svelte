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

	// Intensity-based glow effects
	const intensityClass = pixel.intensity > 10 ? "shadow-lg" : pixel.intensity > 5 ? "shadow-md" : "shadow-sm";
	
	const colorClasses = {
		red: `bg-red-500 border-red-400/50 shadow-red-500/${pixel.intensity > 5 ? '80' : '50'}`,
		green: `bg-green-500 border-green-400/50 shadow-green-500/${pixel.intensity > 5 ? '80' : '50'}`,
		blue: `bg-blue-500 border-blue-400/50 shadow-blue-500/${pixel.intensity > 5 ? '80' : '50'}`,
	};

	return `${sizeClasses} border transition-all duration-100 ${colorClasses[pixel.color]} ${intensityClass}`;
}

function getPixelStyle(pixel: StreamPixel | null): string {
	if (!pixel) return "will-change: transform; transform: translateZ(0);";

	// GPU acceleration and intensity-based scaling
	const baseScale = 0.8 + pixel.opacity * 0.2;
	const intensityBoost = Math.min(pixel.intensity / 10, 0.3); // Cap intensity boost
	const finalScale = baseScale + intensityBoost;
	
	// Intensity-based glow
	const glowIntensity = Math.min(pixel.opacity * pixel.intensity * 0.1, 1.0);
	const boxShadowIntensity = pixel.intensity > 5 ? 0.8 : 0.4;
	
	return `
		opacity: ${pixel.opacity};
		transform: scale(${finalScale}) translateZ(0);
		will-change: transform, opacity;
		filter: brightness(${1 + intensityBoost}) saturate(${1 + intensityBoost * 0.5});
		box-shadow: 0 0 ${pixel.intensity}px currentColor;
	`;
}
</script>

<div 
  class={getPixelClasses(pixel)}
  style={getPixelStyle(pixel)}
></div>