import { writable, derived, get } from "svelte/store";

export interface PixelCounts {
	red: number;
	green: number;
	blue: number;
	white: number;
	lifetimeWhite: number;
}

export interface ConversionCost {
	red: number;
	green: number;
	blue: number;
}

// Load saved state from localStorage
function loadPixels(): PixelCounts {
	if (typeof window === "undefined") {
		return { red: 0, green: 0, blue: 0, white: 0, lifetimeWhite: 0 };
	}

	const saved = localStorage.getItem("pixelCounts");
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			// Handle backwards compatibility for existing saves without lifetimeWhite
			return {
				red: parsed.red || 0,
				green: parsed.green || 0,
				blue: parsed.blue || 0,
				white: parsed.white || 0,
				lifetimeWhite: parsed.lifetimeWhite || parsed.white || 0,
			};
		} catch {
			return { red: 0, green: 0, blue: 0, white: 0, lifetimeWhite: 0 };
		}
	}
	return { red: 0, green: 0, blue: 0, white: 0, lifetimeWhite: 0 };
}

// Calculate dynamic conversion cost based on lifetime white pixels
function calculateConversionCost(lifetimeWhite: number, breakthroughs?: any, lumenCostReduction = 1): ConversionCost {
	// Smooth exponential scaling starting from base cost of 1
	let costMultiplier = Math.pow(1 + lifetimeWhite / 10, 0.4);
	
	// Progressive soft caps to slow growth at different scales
	if (lifetimeWhite > 25) {
		costMultiplier *= Math.pow(lifetimeWhite / 25, 0.15);
	}
	if (lifetimeWhite > 100) {
		costMultiplier *= Math.pow(lifetimeWhite / 100, 0.25);
	}
	if (lifetimeWhite > 500) {
		costMultiplier *= Math.pow(lifetimeWhite / 500, 0.35);
	}
	
	// Apply Conversion Catalyst breakthrough (reduces cost multiplier by 25%)
	if (breakthroughs?.conversionCatalyst?.purchased) {
		costMultiplier *= (1 - breakthroughs.conversionCatalyst.effect);
	}
	
	// Apply lumen-based cost reduction synergy (passed as parameter)
	costMultiplier *= lumenCostReduction;
	
	const cost = Math.ceil(costMultiplier);
	return { red: cost, green: cost, blue: cost };
}

// Calculate conversion efficiency (affects white pixels gained)
function calculateConversionEfficiency(totalConversions: number, breakthroughs?: any): number {
	let efficiency = 1.0;
	
	// Efficiency decay with usage - more conversions = lower efficiency
	let decayRate = 0.2;
	
	// Apply Efficiency Stabilizer breakthrough (reduces decay by 50%)
	if (breakthroughs?.efficiencyStabilizer?.purchased) {
		decayRate *= (1 - breakthroughs.efficiencyStabilizer.effect);
	}
	
	efficiency /= Math.pow(1 + totalConversions / 50, decayRate);
	
	// Apply White Pixel Amplifier (chance for bonus white pixels)
	if (breakthroughs?.whiteAmplifier?.purchased) {
		// Add the bonus chance to the base efficiency
		efficiency *= (1 + breakthroughs.whiteAmplifier.effect);
	}
	
	// Minimum 10% efficiency to prevent complete stalling
	return Math.max(efficiency, 0.1);
}

// Create the main pixel store
function createPixelStore() {
	const { subscribe, update, set } = writable<PixelCounts>(loadPixels());

	// Save to localStorage whenever the store changes
	subscribe((value) => {
		if (typeof window !== "undefined") {
			localStorage.setItem("pixelCounts", JSON.stringify(value));
		}
	});

	return {
		subscribe,
		update,
		addPixel: (color: "red" | "green" | "blue") => {
			update((counts) => ({
				...counts,
				[color]: counts[color] + 1,
			}));
		},
		convertToWhite: (totalConversions: number = 0, breakthroughs?: any, lumenCostReduction = 1) => {
			update((counts) => {
				const cost = calculateConversionCost(counts.lifetimeWhite, breakthroughs, lumenCostReduction);
				
				// Check if we have enough RGB pixels for the conversion
				if (counts.red >= cost.red && counts.green >= cost.green && counts.blue >= cost.blue) {
					const efficiency = calculateConversionEfficiency(totalConversions, breakthroughs);
					let whiteGained = Math.floor(1 * efficiency);
					
					// Handle bulk converter breakthrough
					if (breakthroughs?.bulkConverter?.purchased) {
						// Try to convert up to 5 sets at once
						const maxSets = Math.min(
							breakthroughs.bulkConverter.effect,
							Math.floor(counts.red / cost.red),
							Math.floor(counts.green / cost.green), 
							Math.floor(counts.blue / cost.blue)
						);
						whiteGained *= maxSets;
						
						return {
							red: counts.red - (cost.red * maxSets),
							green: counts.green - (cost.green * maxSets),
							blue: counts.blue - (cost.blue * maxSets),
							white: counts.white + whiteGained,
							lifetimeWhite: counts.lifetimeWhite + whiteGained,
						};
					} else {
						// Standard single conversion
						// Sometimes efficiency might result in 0 white pixels
						const actualWhiteGained = Math.max(whiteGained, efficiency > 0 ? 1 : 0);
						
						return {
							red: counts.red - cost.red,
							green: counts.green - cost.green,
							blue: counts.blue - cost.blue,
							white: counts.white + actualWhiteGained,
							lifetimeWhite: counts.lifetimeWhite + actualWhiteGained,
						};
					}
				}
				return counts;
			});
		},
		getConversionCost: (breakthroughs?: any, lumenCostReduction = 1): ConversionCost => {
			const counts = get(pixels);
			return calculateConversionCost(counts.lifetimeWhite, breakthroughs, lumenCostReduction);
		},
		getConversionEfficiency: (totalConversions: number = 0, breakthroughs?: any): number => {
			return calculateConversionEfficiency(totalConversions, breakthroughs);
		},
		canConvertAtCost: (totalConversions: number = 0, breakthroughs?: any, lumenCostReduction = 1): boolean => {
			const counts = get(pixels);
			const cost = calculateConversionCost(counts.lifetimeWhite, breakthroughs, lumenCostReduction);
			const efficiency = calculateConversionEfficiency(totalConversions, breakthroughs);
			
			return counts.red >= cost.red && 
				   counts.green >= cost.green && 
				   counts.blue >= cost.blue &&
				   efficiency > 0;
		},
		reset: () => {
			set({ red: 0, green: 0, blue: 0, white: 0, lifetimeWhite: 0 });
		},
	};
}

export const pixels = createPixelStore();

// We'll need to import gameStats for the efficiency derived store
// This will be imported where needed to avoid circular dependencies

// Derived store for current conversion cost
export const conversionCost = derived(
	pixels,
	($pixels) => calculateConversionCost($pixels.lifetimeWhite)
);

// Derived store to check if conversion is available at current cost
export const canConvert = derived(
	[pixels, conversionCost],
	([$pixels, $cost]) => 
		$pixels.red >= $cost.red && 
		$pixels.green >= $cost.green && 
		$pixels.blue >= $cost.blue
);

// Function to create a derived store for efficiency that takes gameStats as input
export function createConversionEfficiencyStore(gameStatsStore: any) {
	return derived(
		gameStatsStore,
		($gameStats: any) => calculateConversionEfficiency($gameStats.totalConversions)
	);
}
