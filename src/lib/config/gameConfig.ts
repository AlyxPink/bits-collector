// Master game configuration - single source of truth for all game constants

// Re-export all configuration modules
export * from "./types";
export * from "./mechanics.config";
export * from "./generators.config";
export * from "./converters.config";
export * from "./lumen.config";

// Additional game-wide constants that don't fit in other categories
export const GAME_CONSTANTS = {
	// Default starting values
	startingPixels: {
		white: 0,
		red: 0,
		green: 0,
		blue: 0,
	},

	// Storage keys
	storageKeys: {
		pixels: "pixels",
		upgrades: "upgrades",
		game: "gameStats",
		audio: "audioSettings",
		lumen: "lumen",
		compositeColors: "compositeColors",
		autoConverters: "autoConverters",
	},

	// Default accumulator setup
	defaultAccumulator: {
		redGenerator: 0,
		greenGenerator: 0,
		blueGenerator: 0,
		randomGenerator: 0,
	},

	// Initial unlocked tabs
	initialTabs: ["generators"] as string[],

	// Audio volume defaults
	defaultVolume: 0.3,
} as const;