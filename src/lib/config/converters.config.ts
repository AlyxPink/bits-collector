import type { AutoConverterConfig } from "./types";

// Auto-converter configurations organized by type
export const AUTO_CONVERTER_CONFIG: Record<string, AutoConverterConfig> = {
	// White converter
	whiteConverter: {
		baseCost: 5,
		costMultiplier: 2.5,
		baseRate: 0.2,
		rateMultiplier: 1.5,
		maxLevel: 10,
		unlockRequirement: 10,
	},

	// Mixed color converters
	orangeMixer: {
		baseCost: 8,
		costMultiplier: 2.8,
		baseRate: 0.4,
		rateMultiplier: 1.7,
		maxLevel: 6,
		unlockRequirement: 25,
	},
	purpleMixer: {
		baseCost: 8,
		costMultiplier: 2.8,
		baseRate: 0.4,
		rateMultiplier: 1.7,
		maxLevel: 6,
		unlockRequirement: 25,
	},
	yellowMixer: {
		baseCost: 8,
		costMultiplier: 2.8,
		baseRate: 0.4,
		rateMultiplier: 1.7,
		maxLevel: 6,
		unlockRequirement: 25,
	},
	cyanMixer: {
		baseCost: 8,
		costMultiplier: 2.8,
		baseRate: 0.4,
		rateMultiplier: 1.7,
		maxLevel: 6,
		unlockRequirement: 25,
	},
	magentaMixer: {
		baseCost: 8,
		costMultiplier: 2.8,
		baseRate: 0.4,
		rateMultiplier: 1.7,
		maxLevel: 6,
		unlockRequirement: 25,
	},
	limeMixer: {
		baseCost: 8,
		costMultiplier: 2.8,
		baseRate: 0.4,
		rateMultiplier: 1.7,
		maxLevel: 6,
		unlockRequirement: 25,
	},

	// Pure color forges
	crimsonForge: {
		baseCost: 15,
		costMultiplier: 3.2,
		baseRate: 0.15,
		rateMultiplier: 1.3,
		maxLevel: 3,
		unlockRequirement: 50,
	},
	emeraldForge: {
		baseCost: 15,
		costMultiplier: 3.2,
		baseRate: 0.15,
		rateMultiplier: 1.3,
		maxLevel: 3,
		unlockRequirement: 50,
	},
	sapphireForge: {
		baseCost: 15,
		costMultiplier: 3.2,
		baseRate: 0.15,
		rateMultiplier: 1.3,
		maxLevel: 3,
		unlockRequirement: 50,
	},
};