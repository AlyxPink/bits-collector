import { writable, derived, get } from "svelte/store";
import { pixels } from "./pixels";
import { LUMEN_UPGRADE_CONFIG, LUMEN_GENERATION, LUMEN_GENERATOR_CONFIG } from "$lib/config/gameConfig";

export interface LumenState {
	total: number;
	lifetimeLumen: number;
	lastTick: number;
	generators: Record<string, LumenGenerator>;
	prestigeLevel: number; // Number of resets performed
	bestLumen: number; // Highest lumen ever reached in a single run
}

export interface LumenUpgrade {
	id: string;
	name: string;
	description: string;
	type: "multiplier" | "efficiency" | "synergy";
	effect: number;
	baseCost: number;
	costMultiplier: number;
	level: number;
	maxLevel?: number;
}

export interface LumenGenerator {
	id: string;
	name: string;
	description: string;
	baseRate: number; // lumen per second
	baseCost: number; // lumen cost
	costMultiplier: number;
	level: number;
	owned: boolean;
}

// Default lumen upgrades
const DEFAULT_LUMEN_UPGRADES: Record<string, LumenUpgrade> = {
	photonAmplifier: {
		id: "photonAmplifier",
		name: "Photon Amplifier",
		description: "Multiply base lumen generation by 2x",
		type: "multiplier",
		effect: 2,
		baseCost: LUMEN_UPGRADE_CONFIG.collectorsI.baseCost,
		costMultiplier: 5,
		level: 0,
		maxLevel: 10,
	},
	quantumEfficiency: {
		id: "quantumEfficiency",
		name: "Quantum Efficiency",
		description: "Improve lumen generation curve by 20%",
		type: "efficiency",
		effect: 1.2,
		baseCost: LUMEN_UPGRADE_CONFIG.collectorsII.baseCost,
		costMultiplier: 10,
		level: 0,
		maxLevel: 5,
	},
	chromaticResonance: {
		id: "chromaticResonance",
		name: "Chromatic Resonance",
		description: "RGB generators get +50% rate per 100 total lumen",
		type: "synergy",
		effect: 0.5,
		baseCost: LUMEN_UPGRADE_CONFIG.collectorsIII.baseCost,
		costMultiplier: 20,
		level: 0,
		maxLevel: 3,
	},
	whitePixelCatalyst: {
		id: "whitePixelCatalyst",
		name: "White Pixel Catalyst",
		description: "Each 1000 lumen makes conversions 10% cheaper",
		type: "synergy",
		effect: 0.1,
		baseCost: LUMEN_UPGRADE_CONFIG.convertersI.baseCost,
		costMultiplier: 25,
		level: 0,
		maxLevel: 5,
	},
	luminousOverflow: {
		id: "luminousOverflow",
		name: "Luminous Overflow",
		description: "Lumen/sec above 100 boosts RGB generation by 25%",
		type: "synergy",
		effect: 0.25,
		baseCost: LUMEN_UPGRADE_CONFIG.convertersII.baseCost,
		costMultiplier: 50,
		level: 0,
		maxLevel: 2,
	},
};

// Default lumen generators
const DEFAULT_LUMEN_GENERATORS: Record<string, LumenGenerator> = {
	begin: {
		id: "begin",
		name: LUMEN_GENERATOR_CONFIG.begin.name,
		description: LUMEN_GENERATOR_CONFIG.begin.description,
		baseRate: LUMEN_GENERATOR_CONFIG.begin.baseRate,
		baseCost: LUMEN_GENERATOR_CONFIG.begin.baseCost,
		costMultiplier: LUMEN_GENERATOR_CONFIG.begin.costMultiplier,
		level: 0,
		owned: false,
	},
};

// Load saved state from localStorage
function loadLumenState(): LumenState & { upgrades: Record<string, LumenUpgrade> } {
	const now = Date.now();
	const defaultState = {
		total: LUMEN_GENERATION.initialLumen,
		lifetimeLumen: 0,
		lastTick: now,
		generators: { ...DEFAULT_LUMEN_GENERATORS },
		upgrades: { ...DEFAULT_LUMEN_UPGRADES },
		prestigeLevel: 0,
		bestLumen: 0,
	};

	if (typeof window === "undefined") {
		return defaultState;
	}

	const saved = localStorage.getItem("lumenState");
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			const now = Date.now();
			return {
				total: parsed.total ?? LUMEN_GENERATION.initialLumen,
				lifetimeLumen: parsed.lifetimeLumen || 0,
				lastTick: parsed.lastTick || now,
				generators: { ...DEFAULT_LUMEN_GENERATORS, ...parsed.generators },
				upgrades: { ...DEFAULT_LUMEN_UPGRADES, ...parsed.upgrades },
				prestigeLevel: parsed.prestigeLevel || 0,
				bestLumen: parsed.bestLumen || 0,
			};
		} catch {
			return defaultState;
		}
	}

	return defaultState;
}

// Prestige Tree-inspired lumen generation formula
function calculateLumenPerSecond(
	whitePixels: number,
	upgrades: Record<string, LumenUpgrade>
): number {
	if (whitePixels < 10) return 0; // Need at least 10 white pixels to start generating lumen

	// Base formula: power curve for satisfying growth
	let base = Math.pow(whitePixels / 10, 0.6);

	// Apply quantum efficiency upgrades to the curve
	let efficiencyMultiplier = 1;
	if (upgrades.quantumEfficiency.level > 0) {
		efficiencyMultiplier *= Math.pow(
			upgrades.quantumEfficiency.effect,
			upgrades.quantumEfficiency.level
		);
	}

	// Apply efficiency to the base before soft caps
	base *= efficiencyMultiplier;

	// Smooth soft caps - no hard plateaus! These create the "bend" in progression
	if (base > 10) {
		base = 10 * Math.pow(base / 10, 0.8);
	}
	if (base > 100) {
		base = 100 * Math.pow(base / 100, 0.65);
	}
	if (base > 1000) {
		base = 1000 * Math.pow(base / 1000, 0.5);
	}

	// Apply photon amplifier multipliers
	let finalMultiplier = 1;
	if (upgrades.photonAmplifier.level > 0) {
		finalMultiplier *= Math.pow(
			upgrades.photonAmplifier.effect,
			upgrades.photonAmplifier.level
		);
	}

	return base * finalMultiplier;
}

// Calculate efficiency percentage for UI display
function calculateLumenEfficiency(
	whitePixels: number,
	upgrades: Record<string, LumenUpgrade>
): number {
	if (whitePixels < 10) return 1;

	// Calculate what generation would be with linear scaling
	const linear = (whitePixels / 10) * 0.6;
	const actual = calculateLumenPerSecond(whitePixels, upgrades);

	return actual / linear;
}

// Create the lumen store
function createLumenStore() {
	const initialState = loadLumenState();
	const { subscribe, update, set } = writable(initialState);

	// Auto-save to localStorage
	subscribe((value) => {
		if (typeof window !== "undefined") {
			localStorage.setItem("lumenState", JSON.stringify(value));
		}
	});


	return {
		subscribe,
		update,
		set,

		// Get current lumen per second based on white pixels
		getLumenPerSecond: (): number => {
			const state = get({ subscribe });
			const pixelCount = get(pixels);
			return calculateLumenPerSecond(pixelCount.white, state.upgrades);
		},

		// Get current efficiency percentage
		getEfficiency: (): number => {
			const state = get({ subscribe });
			const pixelCount = get(pixels);
			return calculateLumenEfficiency(pixelCount.white, state.upgrades);
		},

		// Get upgrade cost
		getUpgradeCost: (id: string): number => {
			const state = get({ subscribe });
			const upgrade = state.upgrades[id];
			if (!upgrade) return 0;
			return Math.floor(
				upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level)
			);
		},

		// Purchase upgrade
		purchaseUpgrade: (id: string): boolean => {
			const state = get({ subscribe });
			const upgrade = state.upgrades[id];
			const cost = Math.floor(
				upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level)
			);

			if (
				upgrade &&
				state.total >= cost &&
				(!upgrade.maxLevel || upgrade.level < upgrade.maxLevel)
			) {
				update((state) => ({
					...state,
					total: state.total - cost,
					upgrades: {
						...state.upgrades,
						[id]: {
							...upgrade,
							level: upgrade.level + 1,
						},
					},
				}));
				return true;
			}
			return false;
		},

		// Get generator cost
		getGeneratorCost: (id: string): number => {
			const state = get({ subscribe });
			const generator = state.generators[id];
			if (!generator) return 0;
			if (generator.level === 0) return generator.baseCost; // First purchase
			return Math.floor(
				generator.baseCost * Math.pow(generator.costMultiplier, generator.level)
			);
		},

		// Get generator rate
		getGeneratorRate: (id: string): number => {
			const state = get({ subscribe });
			const generator = state.generators[id];
			if (!generator || generator.level === 0) return 0;
			return generator.baseRate * generator.level;
		},

		// Purchase generator
		purchaseGenerator: (id: string): boolean => {
			const state = get({ subscribe });
			const generator = state.generators[id];
			if (!generator) return false;

			const cost = generator.level === 0 ? 
				generator.baseCost : 
				Math.floor(generator.baseCost * Math.pow(generator.costMultiplier, generator.level));

			if (state.total >= cost) {
				update((state) => ({
					...state,
					total: state.total - cost,
					generators: {
						...state.generators,
						[id]: {
							...generator,
							level: generator.level + 1,
							owned: true,
						},
					},
				}));
				return true;
			}
			return false;
		},

		// Process lumen generation tick
		processLumenTick: (deltaTimeSeconds?: number) => {
			const now = Date.now();
			update((state) => {
				// Use provided deltaTime or calculate from lastTick for backward compatibility
				const deltaTime = deltaTimeSeconds ?? (now - state.lastTick) / 1000;
				const pixelCount = get(pixels);

				// White pixel based lumen generation (existing system)
				const whiteLumenPerSec = calculateLumenPerSecond(
					pixelCount.white,
					state.upgrades
				);

				// Generator based Lux generation (generators now produce Lux, not Lumen)
				let generatorLuxPerSec = 0;
				Object.values(state.generators).forEach(generator => {
					if (generator.owned && generator.level > 0) {
						generatorLuxPerSec += generator.baseRate * generator.level;
					}
				});

				// Only white pixels generate Lumen now
				const lumenGained = whiteLumenPerSec * deltaTime;
				
				// Generators produce Lux
				const luxGained = generatorLuxPerSec * deltaTime;

				const newTotal = state.total + lumenGained;
				
				// Add Lux to the Lux store if generators produced any
				if (luxGained > 0) {
					import("./lux").then(({ lux }) => {
						lux.addLux(luxGained);
					});
				}
				
				return {
					...state,
					total: newTotal,
					lifetimeLumen: state.lifetimeLumen + lumenGained,
					lastTick: now,
					// Update best lumen if we reached a new high
					bestLumen: Math.max(state.bestLumen, newTotal),
				};
			});
		},

		// Get synergy multipliers for other systems
		getRGBGeneratorMultiplier: (): number => {
			const state = get({ subscribe });
			if (state.upgrades.chromaticResonance.level === 0) return 1;

			const multiplierPerHundred = state.upgrades.chromaticResonance.effect;
			const hundredsOfLumen = Math.floor(state.lifetimeLumen / 100);
			const levelsOwned = state.upgrades.chromaticResonance.level;

			return 1 + (multiplierPerHundred * hundredsOfLumen * levelsOwned);
		},

		getConversionCostReduction: (): number => {
			const state = get({ subscribe });
			if (state.upgrades.whitePixelCatalyst.level === 0) return 1;

			const reductionPerThousand = state.upgrades.whitePixelCatalyst.effect;
			const thousandsOfLumen = Math.floor(state.total / 1000);
			const levelsOwned = state.upgrades.whitePixelCatalyst.level;

			const totalReduction = reductionPerThousand * thousandsOfLumen * levelsOwned;
			return Math.max(0.1, 1 - totalReduction); // Minimum 10% of original cost
		},

		getRGBBoostFromOverflow: (): number => {
			const state = get({ subscribe });
			if (state.upgrades.luminousOverflow.level === 0) return 1;

			const pixelCount = get(pixels);
			const lumenPerSec = calculateLumenPerSecond(pixelCount.white, state.upgrades);

			if (lumenPerSec <= 100) return 1;

			const overflow = lumenPerSec - 100;
			const boost = state.upgrades.luminousOverflow.effect;
			const levelsOwned = state.upgrades.luminousOverflow.level;

			return 1 + (overflow * boost * levelsOwned) / 100; // Boost per 100 overflow
		},

		reset: () => {
			const now = Date.now();
			set({
				total: LUMEN_GENERATION.initialLumen,
				lifetimeLumen: 0,
				lastTick: now,
				generators: { ...DEFAULT_LUMEN_GENERATORS },
				upgrades: { ...DEFAULT_LUMEN_UPGRADES },
				prestigeLevel: 0,
				bestLumen: 0,
			});
		},

		// Add lumen from prestige
		addLumen: (amount: number) => {
			if (amount <= 0) return;
			update((state) => ({
				...state,
				total: state.total + amount,
				lifetimeLumen: state.lifetimeLumen + amount,
				lastTick: Date.now(),
			}));
		},

	};
}

export const lumen = createLumenStore();

// Derived stores for convenience
export const lumenPerSecond = derived(
	[lumen, pixels],
	([$lumen, $pixels]) => {
		// Only white pixels generate Lumen now (generators produce Lux)
		return calculateLumenPerSecond($pixels.white, $lumen.upgrades);
	}
);

// Derived store for Lux generation from lumen generators
export const luxPerSecondFromGenerators = derived(
	[lumen],
	([$lumen]) => {
		let luxPerSec = 0;
		Object.values($lumen.generators).forEach(generator => {
			if (generator.owned && generator.level > 0) {
				luxPerSec += generator.baseRate * generator.level;
			}
		});
		return luxPerSec;
	}
);

export const lumenEfficiency = derived(
	[lumen, pixels],
	([$lumen, $pixels]) => {
		return calculateLumenEfficiency($pixels.white, $lumen.upgrades);
	}
);

// Register with the unified game loop
if (typeof window !== "undefined") {
	import("./gameLoop").then(({ gameLoop }) => {
		gameLoop.register({
			tick: (deltaTime: number) => lumen.processLumenTick(deltaTime)
		});
	});
}