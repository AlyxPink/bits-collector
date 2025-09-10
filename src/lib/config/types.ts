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

export interface TabUnlockConfig {
	white: number;
	red: number;
	green: number;
	blue: number;
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