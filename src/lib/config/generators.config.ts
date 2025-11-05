import type { GeneratorConfig, PowerupConfig, BreakthroughConfig, TabUnlockConfig } from "./types";

// Generator configurations
export const GENERATOR_CONFIG: Record<string, GeneratorConfig> = {
	red: {
		baseRate: 0.5,
		baseCost: 3,
		costMultiplier: 1.25,
	},
	green: {
		baseRate: 0.5,
		baseCost: 3,
		costMultiplier: 1.25,
	},
	blue: {
		baseRate: 0.5,
		baseCost: 3,
		costMultiplier: 1.25,
	},
	random: {
		baseRate: 0.9,
		baseCost: 5,
		costMultiplier: 1.6,
	},
};

// Powerup configurations
// NEW ADDITIVE SYSTEM: Each powerup adds to total multiplier instead of multiplying
// Formula: totalMultiplier = (1 + speedBoostBonus) × (1 + megaSpeedBonus) × (1 + ultraSpeedBonus)
// This prevents exponential growth while keeping progression satisfying
export const POWERUP_CONFIG: Record<string, PowerupConfig> = {
	speedBoost: {
		multiplier: 2, // Adds +100% per level (+1.0x in additive formula)
		baseCost: 50,
		costMultiplier: 4, // Increased from 3 to slow progression
		maxLevel: 5, // 5 levels = +500% = 6x total
	},
	megaSpeed: {
		multiplier: 3, // Adds +200% per level (+2.0x in additive formula)
		baseCost: 500, // Increased from 200
		costMultiplier: 5, // Increased from 4
		maxLevel: 3, // 3 levels = +600% = 7x total
	},
	ultraSpeed: {
		multiplier: 4, // Adds +300% per level (+3.0x in additive formula)
		baseCost: 5000, // Increased from 1000
		costMultiplier: 6, // Increased from 5
		maxLevel: 2, // 2 levels = +600% = 7x total
	},
};

// Breakthrough configurations
export const BREAKTHROUGH_CONFIG: Record<string, BreakthroughConfig> = {
	// Production efficiency breakthroughs
	efficiency1: {
		type: "efficiency",
		effect: 1.15,
		baseCost: 100,
	},
	efficiency2: {
		type: "efficiency",
		effect: 1.25,
		baseCost: 2500,
	},
	efficiency3: {
		type: "efficiency",
		effect: 1.4,
		baseCost: 50000,
	},

	// Conversion-focused breakthroughs
	conversionCatalyst: {
		type: "efficiency",
		effect: 0.25, // Reduces cost multiplier by 25%
		baseCost: 150,
	},
	efficiencyStabilizer: {
		type: "efficiency",
		effect: 0.5, // Reduces decay by 50%
		baseCost: 300,
	},
	bulkConverter: {
		type: "multiplier",
		effect: 5, // Convert up to 5 sets at once
		baseCost: 500,
	},
	whiteAmplifier: {
		type: "multiplier",
		effect: 0.25, // 25% chance for bonus white pixel
		baseCost: 750,
	},
};

// Tab unlock requirements
export const TAB_UNLOCK_CONFIG: Record<string, TabUnlockConfig> = {
	luminance: {
		white: 0,
		red: 0,
		green: 0,
		blue: 0, // Always unlocked - first tab
	},
	generators: {
		white: 0,
		red: 0,
		green: 0,
		blue: 0,
		lumen: 100, // Requires 100 lumen to unlock
	},
	autoConverters: {
		white: 10,
		red: 25,
		green: 25,
		blue: 25,
	},
	powerups: {
		white: 30,
		red: 100,
		green: 100,
		blue: 100,
		lumen: 100, // Initially 100, increases to 100,000 if generators purchased
	},
	breakthroughs: {
		white: 150,
		red: 500,
		green: 500,
		blue: 500,
	},
};
