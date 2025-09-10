import type { SoftCapConfig, MilestoneConfig } from "./types";

// Game mechanics constants - soft caps, thresholds, formulas
export const SOFT_CAPS: SoftCapConfig = {
	thresholds: [10, 100, 1000],
	efficiencyFactors: [0.85, 0.75, 0.6, 0.45], // Applied at each threshold
	powers: [0.85, 0.75, 0.6, 0.45], // Power scaling factors
};

// Pure color milestone system
export const PURE_COLOR_MILESTONES: MilestoneConfig = {
	thresholds: [10, 25, 50, 100, 250, 500, 1000],
	bonusPerMilestone: 0.15, // 15% bonus per milestone reached
};

// Production scaling constants
export const PRODUCTION_SCALING = {
	// Smooth scaling powers for different production ranges
	basePower: 0.85,
	softCapPowers: {
		tier1: 0.75, // Above 10
		tier2: 0.6,  // Above 100
		tier3: 0.45, // Above 1000
	},
	multipliers: {
		tier1: 1.5,
		tier2: 1.2,
		tier3: 1.0,
	}
};

// Pure color boost calculation constants
export const PURE_COLOR_BOOST = {
	baseBoostPower: 0.5,        // Square root scaling
	baseBoostMultiplier: 0.1,   // Base multiplier
	effectiveCountPowers: {
		above100: 0.8,
		above500: 0.6,
	},
	synergyMultiplier: 0.2,     // Log10 synergy bonus
	capThresholds: {
		soft: 5,
		medium: 10,
		hard: 20,
	},
	capPowers: {
		soft: 0.7,
		medium: 0.5,
		hard: 0.3,
	}
};

// Auto-tick interval (milliseconds)
export const TICK_INTERVAL = 100;

// Conversion system constants
export const CONVERSION_CONSTANTS = {
	baseCostMultiplier: 0.25,    // For breakthrough effects
	efficiencyDecayReduction: 0.5, // For stability effects
	bulkConversionMax: 5,        // Max sets to convert at once
	bonusChance: 0.25,          // White pixel amplifier chance
};