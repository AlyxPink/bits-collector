/**
 * Lumen Currency Implementation
 *
 * Migrated from src/lib/stores/lumen.ts to use the unified currency system.
 * Handles lumen generation, upgrades, generators, and prestige mechanics.
 */

import { derived, get } from "svelte/store";
import { MultiCurrencyBase, createMultiCurrencyDerived, type MultiCurrencyConfig } from "../core/MultiCurrency";
import { LUMEN_UPGRADE_CONFIG, LUMEN_GENERATION, LUMEN_GENERATOR_CONFIG } from "$lib/config/gameConfig";
import type { PixelCounts } from "./PixelsCurrency";
import { pixels } from "./PixelsCurrency";

// ============================================================================
// Lumen Interfaces
// ============================================================================

export interface LumenState {
	total: number;
	lifetimeLumen: number;
	lastTick: number;
	generators: Record<string, LumenGenerator>;
	upgrades: Record<string, LumenUpgrade>;
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

// ============================================================================
// Default Configurations
// ============================================================================

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
		description: "RGB generators boosted by logarithmic lumen scaling",
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
		description: "Lumen/sec above 100 boosts RGB generation by 10%",
		type: "synergy",
		effect: 0.1,
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
	lumenBoost: {
		id: "lumenBoost",
		name: LUMEN_GENERATOR_CONFIG.lumenBoost.name,
		description: LUMEN_GENERATOR_CONFIG.lumenBoost.description,
		baseRate: LUMEN_GENERATOR_CONFIG.lumenBoost.baseRate,
		baseCost: LUMEN_GENERATOR_CONFIG.lumenBoost.baseCost,
		costMultiplier: LUMEN_GENERATOR_CONFIG.lumenBoost.costMultiplier,
		level: 0,
		owned: false,
	},
	selfSynergy: {
		id: "selfSynergy",
		name: LUMEN_GENERATOR_CONFIG.selfSynergy.name,
		description: LUMEN_GENERATOR_CONFIG.selfSynergy.description,
		baseRate: LUMEN_GENERATOR_CONFIG.selfSynergy.baseRate,
		baseCost: LUMEN_GENERATOR_CONFIG.selfSynergy.baseCost,
		costMultiplier: LUMEN_GENERATOR_CONFIG.selfSynergy.costMultiplier,
		level: 0,
		owned: false,
	},
};

// ============================================================================
// Lumen Calculation Functions
// ============================================================================

// Prestige Tree-inspired lumen generation formula
function calculateLumenPerSecond(
	whitePixels: number,
	upgrades: Record<string, LumenUpgrade>
): number {
	if (whitePixels < 10) return 0; // Need at least 10 white pixels to start generating lumen

	// Base formula: power curve for satisfying growth
	let base = Math.pow(whitePixels / 10, 0.6);

	// Apply quantum efficiency upgrades to the curve
	if (upgrades.quantumEfficiency && upgrades.quantumEfficiency.level > 0) {
		const efficiencyBonus = Math.pow(upgrades.quantumEfficiency.effect, upgrades.quantumEfficiency.level);
		base *= efficiencyBonus;
	}

	// Apply photon amplifier multiplier
	if (upgrades.photonAmplifier && upgrades.photonAmplifier.level > 0) {
		const multiplierBonus = Math.pow(upgrades.photonAmplifier.effect, upgrades.photonAmplifier.level);
		base *= multiplierBonus;
	}

	return base;
}

function calculateLumenEfficiency(
	whitePixels: number,
	upgrades: Record<string, LumenUpgrade>
): number {
	if (whitePixels < 10) return 1; // Base efficiency when no generation

	// Calculate what generation would be with linear scaling
	const linear = (whitePixels / 10) * 0.6;
	const actual = calculateLumenPerSecond(whitePixels, upgrades);

	return actual / linear;
}

// ============================================================================
// Lumen Currency Implementation
// ============================================================================

class LumenCurrencyImpl extends MultiCurrencyBase<LumenState> {
	// ICurrency implementation
	getAmount(currency: "total" | "lifetime" | "best" = "total"): number {
		const state = this.getState();
		switch (currency) {
			case "total": return state.total;
			case "lifetime": return state.lifetimeLumen;
			case "best": return state.bestLumen;
			default: return state.total;
		}
	}

	addAmount(amount: number, currency: "total" | "lifetime" = "total"): void {
		if (amount <= 0) return;
		this.updateState(state => {
			const newState = { ...state };
			if (currency === "total" || currency === "lifetime") {
				newState.total += amount;
				newState.lifetimeLumen += amount;
				newState.bestLumen = Math.max(newState.bestLumen, newState.total);
			}
			newState.lastTick = Date.now();
			return newState;
		});
	}

	spendAmount(amount: number, currency: "total" = "total"): boolean {
		const state = this.getState();
		if (state.total >= amount) {
			this.updateState(current => ({
				...current,
				total: current.total - amount,
				lastTick: Date.now(),
			}));
			return true;
		}
		return false;
	}

	canAfford(amount: number, currency: "total" = "total"): boolean {
		const state = this.getState();
		return state.total >= amount;
	}

	// ========================================================================
	// Lumen-specific methods
	// ========================================================================

	// Get current lumen per second based on white pixels
	getLumenPerSecond(): number {
		const state = this.getState();
		// Need to import pixels dynamically to avoid circular dependency
		const pixelCount: PixelCounts = get(pixels);
		return calculateLumenPerSecond(pixelCount.white, state.upgrades);
	}

	// Get current efficiency percentage
	getEfficiency(): number {
		const state = this.getState();
		const pixelCount: PixelCounts = get(pixels);
		return calculateLumenEfficiency(pixelCount.white, state.upgrades);
	}

	// Upgrade system
	getUpgradeCost(id: string): number {
		const state = this.getState();
		const upgrade = state.upgrades[id];
		if (!upgrade) return 0;
		return Math.floor(
			upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level)
		);
	}

	purchaseUpgrade(id: string): boolean {
		const state = this.getState();
		const upgrade = state.upgrades[id];
		if (!upgrade) return false;

		const cost = this.getUpgradeCost(id);

		if (
			state.total >= cost &&
			(!upgrade.maxLevel || upgrade.level < upgrade.maxLevel)
		) {
			this.updateState(current => ({
				...current,
				total: current.total - cost,
				upgrades: {
					...current.upgrades,
					[id]: {
						...upgrade,
						level: upgrade.level + 1,
					},
				},
			}));
			return true;
		}
		return false;
	}


	// ========================================================================
	// Prestige Tree Boost Effect Calculations
	// ========================================================================

	// Lumen Boost: Prestige Tree formula player.p.points.plus(2).pow(0.5)
	getLumenBoostEffect(): number {
		const state = this.getState();
		const generator = state.generators.lumenBoost;
		if (!generator?.owned) return 1;

		// Formula: sqrt(lumen + 2)
		// At 0 lumen: 1.41x, at 2 lumen: 2x, at 7 lumen: 3x, at 23 lumen: 5x
		return Math.pow(state.total + 2, 0.5);
	}

	// Self-Synergy: Prestige Tree formula player.points.plus(1).log10().pow(0.75).plus(1)
	getSelfSynergyEffect(luxAmount: number = 0): number {
		const state = this.getState();
		const generator = state.generators.selfSynergy;
		if (!generator?.owned) return 1;

		// Formula: 1 + (log10(lux + 1))^0.75
		// At 10 lux: 1.75x, at 100 lux: 2.30x, at 1000 lux: 2.83x
		const baseEffect = 1 + Math.pow(Math.log10(luxAmount + 1), 0.75);

		// Apply level multiplier for multiple purchases
		return Math.pow(baseEffect, generator.level);
	}

	// Calculate total Lux generation per second
	getLuxPerSecond(currentLuxAmount: number = 0): number {
		const state = this.getState();
		let rate = 0;

		// Begin generator: flat 1 Lux/sec when owned
		if (state.generators.begin?.owned) {
			rate = 1;
		}

		// Apply Lumen Boost multiplier
		rate *= this.getLumenBoostEffect();

		// Apply Self-Synergy multiplier
		rate *= this.getSelfSynergyEffect(currentLuxAmount);

		return rate;
	}

	// Check if generator is unlocked
	isGeneratorUnlocked(generatorId: string): boolean {
		const config = LUMEN_GENERATOR_CONFIG[generatorId];
		if (!config) return false;

		// Begin is always unlocked
		if (generatorId === 'begin') return true;

		// Check if required generator is owned
		if (config.requiresGenerator) {
			const state = this.getState();
			const required = state.generators[config.requiresGenerator];
			return required?.owned === true;
		}

		return false;
	}

	// Get only unlocked generators for UI
	getUnlockedGenerators(): LumenGenerator[] {
		const state = this.getState();
		return Object.keys(state.generators)
			.filter(id => this.isGeneratorUnlocked(id))
			.map(id => state.generators[id]);
	}

	// Override generator cost to handle max levels
	getGeneratorCost(id: string): number {
		const state = this.getState();
		const generator = state.generators[id];
		const config = LUMEN_GENERATOR_CONFIG[id];
		if (!generator || !config) return 0;

		// Check if at max level
		if (config.maxLevel && generator.level >= config.maxLevel) {
			return Infinity; // Can't purchase anymore
		}

		if (generator.level === 0) return generator.baseCost; // First purchase
		return Math.floor(
			generator.baseCost * Math.pow(generator.costMultiplier, generator.level)
		);
	}

	// Override purchase generator to handle unlocking and max levels
	purchaseGenerator(id: string): boolean {
		const state = this.getState();
		const generator = state.generators[id];
		const config = LUMEN_GENERATOR_CONFIG[id];
		if (!generator || !config) return false;

		// Check if generator is unlocked
		if (!this.isGeneratorUnlocked(id)) return false;

		// Check if at max level
		if (config.maxLevel && generator.level >= config.maxLevel) return false;

		const cost = this.getGeneratorCost(id);
		if (cost === Infinity) return false;

		if (state.total >= cost) {
			this.updateState(current => ({
				...current,
				total: current.total - cost,
				generators: {
					...current.generators,
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
	}

	// Generation processing
	processGenerationTick(deltaTimeSeconds: number): void {
		this.updateState(state => {
			const now = Date.now();
			const deltaTime = deltaTimeSeconds;

			// Calculate lumen generation from white pixels
			const pixelCount: PixelCounts = get(pixels);
			const lumenPerSec = calculateLumenPerSecond(pixelCount.white, state.upgrades);
			const lumenGained = lumenPerSec * deltaTime;

			// Calculate Lux generation using new Prestige Tree formula
			// Get current lux amount for self-synergy calculation
			let currentLuxAmount = 0;
			try {
				// Import dynamically to get current lux amount
				import("./LuxCurrency").then(({ lux }) => {
					// Use the current lux amount for self-synergy calculations
					const luxPerSec = this.getLuxPerSecond(lux.amount);
					const luxGained = luxPerSec * deltaTime;

					// Add Lux to the Lux store if generators produced any
					if (luxGained > 0) {
						lux.addLux(luxGained);
					}
				});
			} catch (e) {
				// Fallback if lux store not available
				const luxPerSec = this.getLuxPerSecond(0);
				const luxGained = luxPerSec * deltaTime;

				if (luxGained > 0) {
					import("./LuxCurrency").then(({ lux }) => {
						lux.addLux(luxGained);
					});
				}
			}

			const newTotal = state.total + lumenGained;

			return {
				...state,
				total: newTotal,
				lifetimeLumen: state.lifetimeLumen + lumenGained,
				lastTick: now,
				// Update best lumen if we reached a new high
				bestLumen: Math.max(state.bestLumen, newTotal),
			};
		});
	}

	// Synergy multipliers for other systems
	getRGBGeneratorMultiplier(): number {
		const state = this.getState();
		if (state.upgrades.chromaticResonance.level === 0) return 1;

		const multiplierPerLog = state.upgrades.chromaticResonance.effect;
		const levelsOwned = state.upgrades.chromaticResonance.level;

		// Logarithmic scaling to prevent unbounded exponential growth
		// Effect: At 10K lumen: 2x, At 100K lumen: 2.5x, At 1M lumen: 3x
		const bonusFromLumen = Math.log10(state.lifetimeLumen + 10) * multiplierPerLog * levelsOwned;

		return 1 + bonusFromLumen;
	}

	getConversionCostReduction(): number {
		const state = this.getState();
		if (state.upgrades.whitePixelCatalyst.level === 0) return 1;

		const reductionPerThousand = state.upgrades.whitePixelCatalyst.effect;
		const thousandsOfLumen = Math.floor(state.total / 1000);
		const levelsOwned = state.upgrades.whitePixelCatalyst.level;

		const totalReduction = reductionPerThousand * thousandsOfLumen * levelsOwned;
		return Math.max(0.1, 1 - totalReduction); // Minimum 10% of original cost
	}

	getRGBBoostFromOverflow(): number {
		const state = this.getState();
		if (state.upgrades.luminousOverflow.level === 0) return 1;

		const pixelCount: PixelCounts = get(pixels);
		const lumenPerSec = calculateLumenPerSecond(pixelCount.white, state.upgrades);

		if (lumenPerSec <= 100) return 1;

		const overflow = lumenPerSec - 100;
		const boost = state.upgrades.luminousOverflow.effect;
		const levelsOwned = state.upgrades.luminousOverflow.level;

		return 1 + (overflow * boost * levelsOwned) / 100; // Boost per 100 overflow
	}

	// Add lumen from external sources (prestige, etc.)
	addLumen(amount: number): void {
		this.addAmount(amount, "lifetime");
	}
}

// ============================================================================
// Factory Function
// ============================================================================

function createLumenCurrency() {
	const now = Date.now();
	const defaultState: LumenState = {
		total: LUMEN_GENERATION.initialLumen,
		lifetimeLumen: 0,
		lastTick: now,
		generators: { ...DEFAULT_LUMEN_GENERATORS },
		upgrades: { ...DEFAULT_LUMEN_UPGRADES },
		prestigeLevel: 0,
		bestLumen: 0,
	};

	const config: MultiCurrencyConfig<LumenState> = {
		id: "lumen",
		type: "multi-currency",
		displayName: "Lumen",
		storageKey: "lumenState",
		defaultState,
		persistence: true,
		resetOnGameReset: true,
	};

	return new LumenCurrencyImpl(config);
}

// ============================================================================
// Export - Create Instance and Derived Stores
// ============================================================================

export const lumen = createLumenCurrency();

// Derived stores for convenience (matching original API)
export const lumenPerSecond = createMultiCurrencyDerived(
	lumen,
	(state) => {
		// Need to get pixels dynamically to avoid circular dependency
		const pixelCount: PixelCounts = get(pixels);
		// Only white pixels generate Lumen now (generators produce Lux)
		return calculateLumenPerSecond(pixelCount.white, state.upgrades);
	}
);

export const lumenEfficiency = createMultiCurrencyDerived(
	lumen,
	(state) => {
		const pixelCount: PixelCounts = get(pixels);
		return calculateLumenEfficiency(pixelCount.white, state.upgrades);
	}
);

// Export factory for compatibility
export { createLumenCurrency };

// Register with the unified game loop
if (typeof window !== "undefined") {
	setTimeout(async () => {
		const { gameLoop } = await import("../../stores/gameLoop");
		gameLoop.register({
			tick: (deltaTime: number) => lumen.processGenerationTick(deltaTime)
		});
	}, 0);
}