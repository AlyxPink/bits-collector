import type { CompositeColorUnlockConfig } from "./types";

// Pure color unlock system configuration
// Pure colors heavily favor their primary color to create thematic RGB sinks
export const PURE_COLOR_UNLOCK_CONFIG: CompositeColorUnlockConfig = {
	mixed: {
		baseCost: 1000,      // Not used for pure colors
		costMultiplier: 1.8,  // Not used for pure colors
		softCapThreshold: 3,  // Not used for pure colors
		softCapPower: 0.7,   // Not used for pure colors
	},
	pure: {
		baseCost: 5000,      // First pure color costs 5000 RGB total
		costMultiplier: 2.2,  // Each subsequent unlock costs 2.2x more  
		softCapThreshold: 2,  // After 2nd unlock, apply soft cap
		softCapPower: 0.6,   // Reduce scaling power to 0.6 after threshold
	},
};

// Default unlock states - all pure colors start locked
export const DEFAULT_PURE_COLOR_UNLOCKS = {
	crimson: false,  // All pure colors start locked
	emerald: false,
	sapphire: false,
};

// Pure color unlock order (affects which ones appear first in UI)
export const PURE_COLOR_UNLOCK_ORDER = [
	"crimson", "emerald", "sapphire"
] as const;

// Pure color to primary color mapping
const PURE_COLOR_PRIMARY: Record<string, 'red' | 'green' | 'blue'> = {
	crimson: 'red',
	emerald: 'green', 
	sapphire: 'blue'
};

// Formula for calculating pure color unlock cost with weighted primary color distribution
export function calculatePureColorUnlockCost(
	unlockedCount: number,
	colorId?: 'crimson' | 'emerald' | 'sapphire'
): { red: number; green: number; blue: number; total: number } {
	const config = PURE_COLOR_UNLOCK_CONFIG.pure;
	
	// Calculate raw cost with exponential scaling
	let rawCost = config.baseCost * Math.pow(config.costMultiplier, unlockedCount);
	
	// Apply soft cap if we're past threshold
	if (unlockedCount >= config.softCapThreshold) {
		const excessCount = unlockedCount - config.softCapThreshold;
		const softCapMultiplier = Math.pow(config.costMultiplier, excessCount * config.softCapPower);
		const baseThresholdCost = config.baseCost * Math.pow(config.costMultiplier, config.softCapThreshold);
		rawCost = baseThresholdCost * softCapMultiplier;
	}
	
	// Add logarithmic component for smoother scaling
	const logComponent = Math.log10(unlockedCount + 10) * 0.2;
	const finalCost = Math.ceil(rawCost * (1 + logComponent));
	
	// Default to balanced distribution if no specific color provided
	if (!colorId) {
		const redCost = Math.ceil(finalCost * 0.35);
		const greenCost = Math.ceil(finalCost * 0.33); 
		const blueCost = Math.ceil(finalCost * 0.32);
		
		return {
			red: redCost,
			green: greenCost,
			blue: blueCost,
			total: redCost + greenCost + blueCost
		};
	}
	
	// Get primary color for this pure color
	const primaryColor = PURE_COLOR_PRIMARY[colorId];
	
	// Distribute cost heavily toward primary color (75% primary, 15% secondary, 10% tertiary)
	let redCost: number, greenCost: number, blueCost: number;
	
	switch (primaryColor) {
		case 'red': // Crimson - heavy red cost
			redCost = Math.ceil(finalCost * 0.75);    // 75% red
			greenCost = Math.ceil(finalCost * 0.15);  // 15% green
			blueCost = Math.ceil(finalCost * 0.10);   // 10% blue
			break;
		case 'green': // Emerald - heavy green cost
			redCost = Math.ceil(finalCost * 0.10);    // 10% red
			greenCost = Math.ceil(finalCost * 0.75);  // 75% green
			blueCost = Math.ceil(finalCost * 0.15);   // 15% blue
			break;
		case 'blue': // Sapphire - heavy blue cost
			redCost = Math.ceil(finalCost * 0.15);    // 15% red
			greenCost = Math.ceil(finalCost * 0.10);  // 10% green
			blueCost = Math.ceil(finalCost * 0.75);   // 75% blue
			break;
		default:
			// Fallback to even distribution
			redCost = Math.ceil(finalCost * 0.35);
			greenCost = Math.ceil(finalCost * 0.33); 
			blueCost = Math.ceil(finalCost * 0.32);
			break;
	}
	
	return {
		red: redCost,
		green: greenCost,
		blue: blueCost,
		total: redCost + greenCost + blueCost
	};
}