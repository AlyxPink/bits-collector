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
	},
	randomGenerator: {
		balanceBonus: 0.5,              // Bonus for balanced RGB counts
		baseMultiplierPerCount: 0.01,   // Multiplier per average pure color count
		synergyMultiplier: 0.3,         // Log10 synergy bonus for having all colors
	}
};

// Auto-tick interval (milliseconds)
export const TICK_INTERVAL = 100;

// Lux display update interval (milliseconds) - faster for smoother visual feedback
export const LUX_DISPLAY_INTERVAL = 10;

// Conversion system constants
export const CONVERSION_CONSTANTS = {
	baseCostMultiplier: 0.25,    // For breakthrough effects
	efficiencyDecayReduction: 0.5, // For stability effects
	bulkConversionMax: 5,        // Max sets to convert at once
	bonusChance: 0.25,          // White pixel amplifier chance
};

// Performance Mode Configuration
export const PERFORMANCE_MODE = {
	// Production rate thresholds (bits/sec) for adaptive tick rates
	productionThresholds: {
		normal: 100000,      // Below 100K bits/sec - normal 100ms ticks
		medium: 500000,      // 100K-500K bits/sec - 200ms ticks (5 TPS)
		high: 1000000,       // 500K-1M bits/sec - 500ms ticks (2 TPS)
		extreme: 5000000,    // Above 5M bits/sec - 1000ms ticks (1 TPS)
	},

	// Tick intervals (ms) for each performance mode
	tickIntervals: {
		normal: 100,    // 10 TPS
		medium: 200,    // 5 TPS
		high: 500,      // 2 TPS
		extreme: 1000,  // 1 TPS
	},

	// Emergency mode activation
	emergency: {
		fpsThreshold: 15,           // Activate when FPS drops below this
		activationDelay: 2000,      // Wait 2 seconds before activating
		extremeTickInterval: 2000,  // 0.5 TPS in emergency mode
	},

	// localStorage save throttling
	saveThrottle: {
		normalInterval: 0,      // Save immediately in normal mode
		mediumInterval: 500,    // Save every 500ms in medium mode
		highInterval: 1000,     // Save every 1s in high mode
		extremeInterval: 2000,  // Save every 2s in extreme mode
	},

	// UI update throttling
	uiUpdateThrottle: {
		normalInterval: 50,     // Update UI every 50ms (20 FPS) in normal
		mediumInterval: 100,    // Update UI every 100ms (10 FPS) in medium
		highInterval: 200,      // Update UI every 200ms (5 FPS) in high
		extremeInterval: 500,   // Update UI every 500ms (2 FPS) in extreme
	},
};