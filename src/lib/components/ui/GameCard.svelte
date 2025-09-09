<script lang="ts">
import {
	getColorClasses,
	getShadowStyle,
	getHoverShadowStyle,
	type ColorVariant,
} from "$lib/utils/colors";

interface Props {
	variant: ColorVariant;
	animated?: boolean;
	hoverable?: boolean;
	class?: string;
	children?: any;
}

let {
	variant,
	animated = false,
	hoverable = true,
	class: className = "",
	children,
}: Props = $props();

let colorClasses = $derived(getColorClasses(variant));
let shadowStyle = $derived(getShadowStyle(variant));
let hoverShadowStyle = $derived(getHoverShadowStyle(variant));
</script>

<div 
  role="region"
  class="p-4 border-2 rounded-lg backdrop-blur-sm transition-all duration-200 
         {colorClasses} 
         {animated ? 'animate-pulse' : ''} 
         {hoverable ? 'hover:shadow-lg' : ''}
         {className}"
  style="{shadowStyle}"
  onmouseenter={hoverable ? (e) => { 
    e.currentTarget.style.cssText += `; ${hoverShadowStyle}`;
  } : undefined}
  onmouseleave={hoverable ? (e) => { 
    e.currentTarget.style.cssText = e.currentTarget.style.cssText.replace(/box-shadow:[^;]+;?/, '') + `; ${shadowStyle}`;
  } : undefined}
>
  {@render children?.()}
</div>