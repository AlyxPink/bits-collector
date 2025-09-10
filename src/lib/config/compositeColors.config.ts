import type { CompositeColorUnlockConfig } from "./types";

// Composite color unlock system configuration
// Creates an RGB sink by requiring players to pay RGB pixels to unlock each color
export const COMPOSITE_COLOR_UNLOCK_CONFIG: CompositeColorUnlockConfig = {
	mixed: {
		baseCost: 1000,      // First mixed color costs 1000 RGB total
		costMultiplier: 1.8,  // Each subsequent unlock costs 1.8x more
		softCapThreshold: 3,  // After 3rd unlock, apply soft cap
		softCapPower: 0.7,   // Reduce scaling power to 0.7 after threshold
	},
	pure: {
		baseCost: 5000,      // First pure color costs 5000 RGB total
		costMultiplier: 2.2,  // Each subsequent unlock costs 2.2x more  
		softCapThreshold: 2,  // After 2nd unlock, apply soft cap
		softCapPower: 0.6,   // Reduce scaling power to 0.6 after threshold
	},
};

// Default unlock states - first mixed and pure colors unlocked by default
export const DEFAULT_MIXED_COLOR_UNLOCKS = {
	orange: true,   // Start with orange unlocked
	purple: false,
	yellow: false,
	cyan: false,
	magenta: false,
	lime: false,
};

export const DEFAULT_PURE_COLOR_UNLOCKS = {
	crimson: false,  // All pure colors start locked
	emerald: false,
	sapphire: false,
};

// Color unlock order (affects which ones appear first in UI)
export const MIXED_COLOR_UNLOCK_ORDER = [
	"orange", "yellow", "cyan", "purple", "magenta", "lime"
] as const;

export const PURE_COLOR_UNLOCK_ORDER = [
	"crimson", "emerald", "sapphire"
] as const;

// Formula for calculating unlock cost based on number already unlocked
export function calculateUnlockCost(
	colorType: "mixed" | "pure", 
	unlockedCount: number
): { red: number; green: number; blue: number; total: number } {
	const config = COMPOSITE_COLOR_UNLOCK_CONFIG[colorType];
	
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
	
	// Distribute cost across RGB (roughly equal but with small variations)
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