import type { GeneratorConfig, PowerupConfig, BreakthroughConfig, TabUnlockConfig } from "./types";

// Generator configurations
export const GENERATOR_CONFIG: Record<string, GeneratorConfig> = {
	red: {
		baseRate: 0.5,
		baseCost: 10,
		costMultiplier: 1.5,
	},
	green: {
		baseRate: 0.5,
		baseCost: 10,
		costMultiplier: 1.5,
	},
	blue: {
		baseRate: 0.5,
		baseCost: 10,
		costMultiplier: 1.5,
	},
	random: {
		baseRate: 1.0,
		baseCost: 25,
		costMultiplier: 1.8,
	},
};

// Powerup configurations
export const POWERUP_CONFIG: Record<string, PowerupConfig> = {
	speedBoost: {
		multiplier: 2,
		baseCost: 50,
		costMultiplier: 3,
		maxLevel: 5,
	},
	megaSpeed: {
		multiplier: 5,
		baseCost: 200,
		costMultiplier: 4,
		maxLevel: 3,
	},
	ultraSpeed: {
		multiplier: 10,
		baseCost: 1000,
		costMultiplier: 5,
		maxLevel: 2,
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
	generators: {
		white: 0,
		red: 0,
		green: 0,
		blue: 0, // Always unlocked
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
	},
	breakthroughs: {
		white: 150,
		red: 500,
		green: 500,
		blue: 500,
	},
	luminosity: {
		white: 500,
		red: 1000,
		green: 1000,
		blue: 1000,
	},
};