import type { LumenUpgradeConfig, LumenGeneratorConfig } from "./types";

// Lumen upgrade configurations
export const LUMEN_UPGRADE_CONFIG: Record<string, LumenUpgradeConfig> = {
	collectorsI: {
		baseCost: 100,
		effect: 1.5,
		description: "Increase RGB generator rates by 50%",
	},
	collectorsII: {
		baseCost: 500,
		effect: 2.0,
		description: "Increase RGB generator rates by 100%",
	},
	collectorsIII: {
		baseCost: 1000,
		effect: 2.5,
		description: "Increase RGB generator rates by 150%",
	},
	convertersI: {
		baseCost: 2500,
		effect: 0.8, // 20% cost reduction
		description: "Reduce RGB to White conversion cost by 20%",
	},
	convertersII: {
		baseCost: 5000,
		effect: 0.6, // 40% cost reduction total
		description: "Reduce RGB to White conversion cost by 40%",
	},
};

// Lumen generator configurations (these actually generate Lux and cost Lumen)
export const LUMEN_GENERATOR_CONFIG: Record<string, LumenGeneratorConfig> = {
	begin: {
		name: "Begin",
		description: "Start generating Lux with this basic generator",
		baseRate: 1.0, // 1 Lux per second
		baseCost: 1, // Costs 1 lumen for first upgrade
		costMultiplier: 2.0, // Standard doubling
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