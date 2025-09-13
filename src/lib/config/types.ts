// Configuration type definitions for centralized game constants

export interface GeneratorConfig {
	baseRate: number;
	baseCost: number;
	costMultiplier: number;
}

export interface PowerupConfig {
	multiplier: number;
	baseCost: number;
	costMultiplier: number;
	maxLevel: number;
}

export interface BreakthroughConfig {
	type: "efficiency" | "multiplier";
	effect: number;
	baseCost: number;
}

export interface AutoConverterConfig {
	baseCost: number;
	costMultiplier: number;
	baseRate: number;
	rateMultiplier: number;
	maxLevel: number;
	unlockRequirement: number;
}

export interface LumenUpgradeConfig {
	baseCost: number;
	effect: number;
	description: string;
}

export interface LumenGeneratorConfig {
	name: string;
	description: string;
	baseRate: number; // lux per second (not lumen per second)
	baseCost: number; // lumen cost
	costMultiplier: number;
	maxLevel?: number; // Optional max level (1 for one-time purchases)
	unlocked?: boolean; // Initial unlock status
	requiresGenerator?: string; // Generator ID that must be owned first
}

export interface TabUnlockConfig {
	white: number;
	red: number;
	green: number;
	blue: number;
	lumen?: number; // Optional lumen cost
}

export interface SoftCapConfig {
	thresholds: number[];
	efficiencyFactors: number[];
	powers: number[];
}

export interface MilestoneConfig {
	thresholds: number[];
	bonusPerMilestone: number;
}

export interface CompositeColorUnlockConfig {
	mixed: {
		baseCost: number;
		costMultiplier: number;
		softCapThreshold: number;
		softCapPower: number;
	};
	pure: {
		baseCost: number;
		costMultiplier: number;
		softCapThreshold: number;
		softCapPower: number;
	};
}