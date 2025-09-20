import type { LumenUpgradeConfig, LumenGeneratorConfig } from "./types";

// Lumen upgrade configurations
export const LUMEN_UPGRADE_CONFIG: Record<string, LumenUpgradeConfig> = {
	collectorsI: {
		baseCost: 10,
		effect: 1.5,
		description: "Increase RGB generator rates by 50%",
	},
	collectorsII: {
		baseCost: 50,
		effect: 2.0,
		description: "Increase RGB generator rates by 100%",
	},
	collectorsIII: {
		baseCost: 250,
		effect: 2.5,
		description: "Increase RGB generator rates by 150%",
	},
	convertersI: {
		baseCost: 500,
		effect: 0.8, // 20% cost reduction
		description: "Reduce RGB to White conversion cost by 20%",
	},
	convertersII: {
		baseCost: 1000,
		effect: 0.6, // 40% cost reduction total
		description: "Reduce RGB to White conversion cost by 40%",
	},
};

// Lumen generator configurations (these actually generate Lux and cost Lumen)
export const LUMEN_GENERATOR_CONFIG: Record<string, LumenGeneratorConfig> = {
	begin: {
		name: "Begin",
		description: "Generate 1 Lux every second",
		baseRate: 1.0, // 1 Lux per second
		baseCost: 1, // Costs 1 lumen for first purchase
		costMultiplier: 1, // No cost increase (one-time purchase)
		maxLevel: 1, // Can only be bought once
		unlocked: true, // Always available
	},
	lumenBoost: {
		name: "Lumen Boost",
		description: "Lumens boost Lux generation",
		baseRate: 0, // No direct generation, provides boost effect
		baseCost: 1, // Costs 1 lumen
		costMultiplier: 1, // No cost increase (one-time purchase)
		maxLevel: 1, // Can only be bought once
		unlocked: false, // Must unlock after begin
		requiresGenerator: "begin",
	},
	selfSynergy: {
		name: "Self-Synergy",
		description: "Lux boost their own generation",
		baseRate: 0, // No direct generation, provides boost effect
		baseCost: 5, // Costs 5 lumens for first level
		costMultiplier: 2.5, // Increases by 2.5x each level
		// No maxLevel - can be upgraded infinitely
		unlocked: false, // Must unlock after lumenBoost
		requiresGenerator: "lumenBoost",
	},
};

// Lumen generation constants
export const LUMEN_GENERATION = {
	baseRequirement: 1,      // Minimum white pixels to generate lumen
	scalingFactor: 2.0,      // How much requirement increases per level
	overflowThreshold: 1000, // White pixels needed for overflow bonus
	overflowMultiplier: 1.2, // RGB bonus from overflow
	initialLumen: 0,         // Starting lumen amount
};