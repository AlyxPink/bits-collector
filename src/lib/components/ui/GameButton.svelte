<script lang="ts">
import {
	getColorClasses,
	getShadowStyle,
	type ColorVariant,
} from "$lib/utils/colors";

type ButtonVariant = "primary" | "secondary" | "success" | "warning" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface Props {
	variant?: ButtonVariant;
	size?: ButtonSize;
	color?: ColorVariant;
	disabled?: boolean;
	loading?: boolean;
	onclick?: () => void;
	class?: string;
	children?: any;
}

let {
	variant = "primary",
	size = "md",
	color,
	disabled = false,
	loading = false,
	onclick,
	class: className = "",
	children,
}: Props = $props();

// Determine color based on variant if not explicitly provided
let effectiveColor = $derived((): ColorVariant => {
	if (color) return color;

	switch (variant) {
		case "success":
			return "green";
		case "warning":
			return "yellow";
		case "danger":
			return "red";
		case "secondary":
			return "gray";
		default:
			return "green"; // primary
	}
});

let colorClasses = $derived(getColorClasses(effectiveColor()));
let shadowStyle = $derived(getShadowStyle(effectiveColor()));

let sizeClasses = $derived(() => {
	switch (size) {
		case "sm":
			return "px-3 py-2 text-sm";
		case "lg":
			return "px-8 py-4 text-lg";
		default:
			return "px-6 py-3 text-base";
	}
});

function handleClick() {
	if (!disabled && !loading && onclick) {
		onclick();
	}
}
</script>

<button
  {disabled}
  onclick={handleClick}
  class="pixel-button font-bold uppercase tracking-wider transition-all duration-200
         {colorClasses}
         {sizeClasses()}
         {disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
         {loading ? 'animate-pulse' : ''}
         {className}"
  style="--shadow-color: {getShadowStyle(effectiveColor()).match(/rgba\(([^)]+)\)/)?.[1] || '34, 197, 94'}"
>
  {#if loading}
    <div class="flex items-center justify-center gap-2">
      <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      <span>Loading...</span>
    </div>
  {:else}
    {@render children?.()}
  {/if}
</button>