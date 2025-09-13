import { writable, derived, get } from "svelte/store";
import { pixels } from "./pixels";
import { pixelStream } from "./pixelStream";
import { lumen } from "./lumen";
import { pureColors } from "./pureColors";
import { 
	GENERATOR_CONFIG, 
	POWERUP_CONFIG, 
	BREAKTHROUGH_CONFIG, 
	TAB_UNLOCK_CONFIG,
	PURE_COLOR_MILESTONES,
	PRODUCTION_SCALING,
	PURE_COLOR_BOOST,
	TICK_INTERVAL,
	GAME_CONSTANTS
} from "$lib/config/gameConfig";

export interface GeneratorUpgrade {
	id: string;
	name: string;
	description: string;
	color: "red" | "green" | "blue" | "random";
	baseRate: number; // bits per second
	baseCost: number; // white pixels
	costMultiplier: number;
	level: number;
	owned: boolean;
}

export interface PowerupUpgrade {
	id: string;
	name: string;
	description: string;
	multiplier: number;
	baseCost: number; // white pixels
	costMultiplier: number;
	level: number;
	maxLevel: number;
}

export interface BreakthroughUpgrade {
	id: string;
	name: string;
	description: string;
	type: "efficiency" | "multiplier";
	effect: number;
	baseCost: number;
	purchased: boolean;
}

export interface TabUnlockCost {
	white: number;
	red: number;
	green: number;
	blue: number;
}

export interface TabUnlock {
	id: string;
	name: string;
	icon: string;
	unlockCost: TabUnlockCost;
}

export interface UpgradeState {
	generators: Record<string, GeneratorUpgrade>;
	powerups: Record<string, PowerupUpgrade>;
	breakthroughs: Record<string, BreakthroughUpgrade>;
	lastAutoTick: number;
	bitAccumulator: Record<string, number>;
	unlockedTabs: string[];
}

// Tab unlock requirements configuration
export const TAB_UNLOCK_REQUIREMENTS: Record<string, TabUnlock> = {
	luminance: {
		id: "luminance",
		name: "Luminance",
		icon: "💡",
		unlockCost: TAB_UNLOCK_CONFIG.luminance
	},
	generators: {
		id: "generators",
		name: "Generators",
		icon: "🤖",
		unlockCost: TAB_UNLOCK_CONFIG.generators
	},
	powerups: {
		id: "powerups",
		name: "Powerups",
		icon: "⚡",
		unlockCost: TAB_UNLOCK_CONFIG.powerups
	},
	autoConverters: {
		id: "autoConverters",
		name: "Auto Converters",
		icon: "⚙️",
		unlockCost: TAB_UNLOCK_CONFIG.autoConverters
	},
	breakthroughs: {
		id: "breakthroughs",
		name: "Breakthroughs",
		icon: "🚀",
		unlockCost: TAB_UNLOCK_CONFIG.breakthroughs
	},
};

const DEFAULT_GENERATORS: Record<string, GeneratorUpgrade> = {
	redGenerator: {
		id: "redGenerator",
		name: "Red Bits Generator",
		description: "Generates red bits over time",
		color: "red",
		...GENERATOR_CONFIG.red,
		level: 0,
		owned: false,
	},
	greenGenerator: {
		id: "greenGenerator",
		name: "Green Bits Generator",
		description: "Generates green bits over time",
		color: "green",
		...GENERATOR_CONFIG.green,
		level: 0,
		owned: false,
	},
	blueGenerator: {
		id: "blueGenerator",
		name: "Blue Bits Generator",
		description: "Generates blue bits over time",
		color: "blue",
		...GENERATOR_CONFIG.blue,
		level: 0,
		owned: false,
	},
	randomGenerator: {
		id: "randomGenerator",
		name: "Random Bits Generator",
		description: "Generates random RGB bits over time",
		color: "random",
		...GENERATOR_CONFIG.random,
		level: 0,
		owned: false,
	},
};

const DEFAULT_POWERUPS: Record<string, PowerupUpgrade> = {
	speedBoost: {
		id: "speedBoost",
		name: "Speed Boost",
		description: "2x auto-buy rate",
		...POWERUP_CONFIG.speedBoost,
		level: 0,
	},
	megaSpeed: {
		id: "megaSpeed",
		name: "Mega Speed",
		description: "5x auto-buy rate",
		...POWERUP_CONFIG.megaSpeed,
		level: 0,
	},
	ultraSpeed: {
		id: "ultraSpeed",
		name: "Ultra Speed",
		description: "10x auto-buy rate",
		...POWERUP_CONFIG.ultraSpeed,
		level: 0,
	},
};

const DEFAULT_BREAKTHROUGHS: Record<string, BreakthroughUpgrade> = {
	// Production efficiency breakthroughs
	efficiency1: {
		id: "efficiency1",
		name: "Production Smoothing I",
		description: "Improves production curve efficiency by 15%",
		...BREAKTHROUGH_CONFIG.efficiency1,
		purchased: false,
	},
	efficiency2: {
		id: "efficiency2",
		name: "Production Smoothing II",
		description: "Improves production curve efficiency by 25%",
		...BREAKTHROUGH_CONFIG.efficiency2,
		purchased: false,
	},
	efficiency3: {
		id: "efficiency3",
		name: "Production Smoothing III",
		description: "Improves production curve efficiency by 40%",
		...BREAKTHROUGH_CONFIG.efficiency3,
		purchased: false,
	},
	
	// Conversion-focused breakthroughs
	conversionCatalyst: {
		id: "conversionCatalyst",
		name: "Conversion Catalyst",
		description: "Reduces RGB cost multiplier by 25%",
		...BREAKTHROUGH_CONFIG.conversionCatalyst,
		purchased: false,
	},
	efficiencyStabilizer: {
		id: "efficiencyStabilizer",
		name: "Efficiency Stabilizer",
		description: "Reduces conversion efficiency decay by 50%",
		...BREAKTHROUGH_CONFIG.efficiencyStabilizer,
		purchased: false,
	},
	bulkConverter: {
		id: "bulkConverter",
		name: "Bulk Converter",
		description: "Convert up to 5 sets of RGB at once",
		...BREAKTHROUGH_CONFIG.bulkConverter,
		purchased: false,
	},
	whiteAmplifier: {
		id: "whiteAmplifier",
		name: "White Pixel Amplifier",
		description: "25% chance to get bonus white pixel",
		...BREAKTHROUGH_CONFIG.whiteAmplifier,
		purchased: false,
	},
};

// Calculate what the pure color multiplier would be at a specific count
function calculateNextPureColorMultiplier(color: "red" | "green" | "blue", count: number): number {
	if (count === 0) return 1;

	const baseBoost = Math.pow(count, PURE_COLOR_BOOST.baseBoostPower) * PURE_COLOR_BOOST.baseBoostMultiplier;
	const milestones = PURE_COLOR_MILESTONES.thresholds;
	const milestoneBonus = milestones.filter((m) => count >= m).length * PURE_COLOR_MILESTONES.bonusPerMilestone;

	let effectiveCount = count;
	if (count > 100) effectiveCount = 100 + Math.pow(count - 100, PURE_COLOR_BOOST.effectiveCountPowers.above100);
	if (count > 500) effectiveCount = 400 + Math.pow(count - 500, PURE_COLOR_BOOST.effectiveCountPowers.above500);

	const hasAllPure = pureColors.hasAllPureColors();
	const synergyBonus = hasAllPure ? Math.log10(count + 1) * PURE_COLOR_BOOST.synergyMultiplier : 0;

	const rawMultiplier = 1 + baseBoost + milestoneBonus + (effectiveCount * 0.01) + synergyBonus;

	if (rawMultiplier > PURE_COLOR_BOOST.capThresholds.hard) return 18 + Math.pow(rawMultiplier - PURE_COLOR_BOOST.capThresholds.hard, PURE_COLOR_BOOST.capPowers.hard);
	if (rawMultiplier > PURE_COLOR_BOOST.capThresholds.medium) return 9 + Math.pow(rawMultiplier - PURE_COLOR_BOOST.capThresholds.medium, PURE_COLOR_BOOST.capPowers.medium);
	if (rawMultiplier > PURE_COLOR_BOOST.capThresholds.soft) return 5 + Math.pow(rawMultiplier - PURE_COLOR_BOOST.capThresholds.soft, PURE_COLOR_BOOST.capPowers.soft);

	return rawMultiplier;
}

// Smooth production scaling - no hard plateaus!
function applySmoothScaling(
	production: number,
	breakthroughs: Record<string, BreakthroughUpgrade>,
): number {
	let scaled = production;

	// Apply smooth logarithmic-like scaling
	// This creates gradual slowdown without hard walls
	scaled = Math.pow(production, PRODUCTION_SCALING.basePower) * 2;

	// Gradual soft caps that "bend" rather than "break"
	if (scaled > 10) {
		scaled = 10 + Math.pow(scaled - 10, PRODUCTION_SCALING.softCapPowers.tier1) * PRODUCTION_SCALING.multipliers.tier1;
	}
	if (scaled > 100) {
		scaled = 100 + Math.pow(scaled - 100, PRODUCTION_SCALING.softCapPowers.tier2) * PRODUCTION_SCALING.multipliers.tier2;
	}
	if (scaled > 1000) {
		scaled = 1000 + Math.pow(scaled - 1000, PRODUCTION_SCALING.softCapPowers.tier3);
	}

	// Apply breakthrough multipliers for smooth efficiency boosts
	let efficiencyMultiplier = 1;
	Object.values(breakthroughs).forEach((breakthrough) => {
		if (breakthrough.purchased && breakthrough.type === "efficiency") {
			efficiencyMultiplier *= breakthrough.effect;
		}
	});

	return scaled * efficiencyMultiplier;
}

function getProductionEfficiency(
	production: number,
	breakthroughs: Record<string, BreakthroughUpgrade>,
): number {
	if (production === 0) return 1;

	const uncappedProduction = production;
	const scaledProduction = applySmoothScaling(production, breakthroughs);

	return scaledProduction / uncappedProduction;
}

function getTotalTheoreticalProduction(
	generators: Record<string, GeneratorUpgrade>,
	powerups: Record<string, PowerupUpgrade>,
): number {
	let total = 0;

	// Calculate total multiplier from powerups
	const totalMultiplier = Object.values(powerups).reduce((mult, powerup) => {
		if (powerup.level > 0) {
			return mult * Math.pow(powerup.multiplier, powerup.level);
		}
		return mult;
	}, 1);

	// Sum all generator production (before soft caps)
	Object.values(generators).forEach((generator) => {
		if (generator.owned && generator.level > 0) {
			const baseRate = generator.baseRate * generator.level;
			total += baseRate * totalMultiplier;
		}
	});

	return total;
}

function loadUpgrades(): UpgradeState {
	const defaultAccumulator = GAME_CONSTANTS.defaultAccumulator;

	if (typeof window === "undefined") {
		return {
			generators: { ...DEFAULT_GENERATORS },
			powerups: { ...DEFAULT_POWERUPS },
			breakthroughs: { ...DEFAULT_BREAKTHROUGHS },
			lastAutoTick: Date.now(),
			bitAccumulator: { ...defaultAccumulator },
			unlockedTabs: GAME_CONSTANTS.initialTabs,
		};
	}

	const saved = localStorage.getItem("upgrades");
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			// Merge with defaults to handle new upgrades
			return {
				generators: {
					...DEFAULT_GENERATORS,
					...(parsed.generators || parsed.bitsBuyers),
				},
				powerups: { ...DEFAULT_POWERUPS, ...parsed.powerups },
				breakthroughs: { ...DEFAULT_BREAKTHROUGHS, ...parsed.breakthroughs },
				lastAutoTick: parsed.lastAutoTick || Date.now(),
				bitAccumulator: { ...defaultAccumulator, ...parsed.bitAccumulator },
				unlockedTabs: parsed.unlockedTabs || ["generators"],
			};
		} catch {
			return {
				generators: { ...DEFAULT_GENERATORS },
				powerups: { ...DEFAULT_POWERUPS },
				breakthroughs: { ...DEFAULT_BREAKTHROUGHS },
				lastAutoTick: Date.now(),
				bitAccumulator: { ...defaultAccumulator },
				unlockedTabs: GAME_CONSTANTS.initialTabs,
			};
		}
	}

	return {
		generators: { ...DEFAULT_GENERATORS },
		powerups: { ...DEFAULT_POWERUPS },
		breakthroughs: { ...DEFAULT_BREAKTHROUGHS },
		lastAutoTick: Date.now(),
		bitAccumulator: { ...defaultAccumulator },
		unlockedTabs: GAME_CONSTANTS.initialTabs,
	};
}

// Helper function to calculate dynamic lumen cost with mutual exclusivity
function getDynamicLumenCost(tabId: string, unlockedTabs: string[]): number {
	const tabConfig = TAB_UNLOCK_REQUIREMENTS[tabId];
	const unlockCost = tabConfig.unlockCost as TabUnlockCost & { lumen?: number };
	const baseLumenCost = unlockCost.lumen ?? 0;
	
	// No lumen cost if not configured
	if (baseLumenCost === 0) return 0;
	
	// Handle mutual exclusivity between generators and powerups
	if (tabId === "generators" && unlockedTabs.includes("powerups")) {
		return 100000; // 100,000 lumen if powerups already purchased
	}
	if (tabId === "powerups" && unlockedTabs.includes("generators")) {
		return 100000; // 100,000 lumen if generators already purchased
	}
	
	return baseLumenCost; // Default cost
}

function createUpgradesStore() {
	const { subscribe, update, set } = writable<UpgradeState>(loadUpgrades());

	// Auto-save to localStorage
	subscribe((value) => {
		if (typeof window !== "undefined") {
			localStorage.setItem("upgrades", JSON.stringify(value));
		}
	});

	return {
		subscribe,

		getGeneratorCost: (id: string): number => {
			const state = get({ subscribe });
			const upgrade = state.generators[id];
			if (!upgrade) return 0;
			return Math.floor(
				upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level),
			);
		},

		getPowerupCost: (id: string): number => {
			const state = get({ subscribe });
			const upgrade = state.powerups[id];
			if (!upgrade) return 0;
			return Math.floor(
				upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level),
			);
		},

		purchaseGenerator: (id: string): boolean => {
			const state = get({ subscribe });
			const pixelCount = get(pixels);
			const upgrade = state.generators[id];
			const cost = Math.floor(
				upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level),
			);

			if (pixelCount.white >= cost) {
				// Deduct cost
				pixels.update((p) => ({ ...p, white: p.white - cost }));

				// Upgrade
				update((state) => ({
					...state,
					generators: {
						...state.generators,
						[id]: {
							...upgrade,
							level: upgrade.level + 1,
							owned: true,
						},
					},
				}));
				return true;
			}
			return false;
		},

		purchasePowerup: (id: string): boolean => {
			const state = get({ subscribe });
			const pixelCount = get(pixels);
			const upgrade = state.powerups[id];
			const cost = Math.floor(
				upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level),
			);

			if (pixelCount.white >= cost && upgrade.level < upgrade.maxLevel) {
				// Deduct cost
				pixels.update((p) => ({ ...p, white: p.white - cost }));

				// Upgrade
				update((state) => ({
					...state,
					powerups: {
						...state.powerups,
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

		getEffectiveMultiplier: (): number => {
			const state = get({ subscribe });
			let multiplier = 1;

			Object.values(state.powerups).forEach((powerup) => {
				if (powerup.level > 0) {
					multiplier *= Math.pow(powerup.multiplier, powerup.level);
				}
			});

			return multiplier;
		},

		getGeneratorRate: (id: string): number => {
			const state = get({ subscribe });
			const upgrade = state.generators[id];
			if (!upgrade || !upgrade.owned) return 0;

			const baseRate = upgrade.baseRate * upgrade.level;
			const multiplier = upgrades.getEffectiveMultiplier();

			return baseRate * multiplier;
		},

		// Breakthrough upgrade functions
		getBreakthroughCost: (id: string): number => {
			const state = get({ subscribe });
			const breakthrough = state.breakthroughs[id];
			return breakthrough ? breakthrough.baseCost : 0;
		},

		purchaseBreakthrough: (id: string): boolean => {
			const state = get({ subscribe });
			const pixelCount = get(pixels);
			const breakthrough = state.breakthroughs[id];

			if (
				breakthrough &&
				!breakthrough.purchased &&
				pixelCount.white >= breakthrough.baseCost
			) {
				// Deduct cost
				pixels.update((p) => ({
					...p,
					white: p.white - breakthrough.baseCost,
				}));

				// Purchase breakthrough
				update((state) => ({
					...state,
					breakthroughs: {
						...state.breakthroughs,
						[id]: {
							...breakthrough,
							purchased: true,
						},
					},
				}));
				return true;
			}
			return false;
		},

		// Tab unlock purchase method
		purchaseTabUnlock: (tabId: string): boolean => {
			const state = get({ subscribe });
			const pixelCount = get(pixels);
			const lumenCount = get(lumen);
			const tabConfig = TAB_UNLOCK_REQUIREMENTS[tabId];

			// Check if tab is already unlocked
			if (state.unlockedTabs.includes(tabId)) {
				return false;
			}

			// Get dynamic lumen cost (handles mutual exclusivity)
			const lumenCost = getDynamicLumenCost(tabId, state.unlockedTabs);

			// Check if player has enough resources
			const hasEnoughPixels = 
				pixelCount.white >= tabConfig.unlockCost.white &&
				pixelCount.red >= tabConfig.unlockCost.red &&
				pixelCount.green >= tabConfig.unlockCost.green &&
				pixelCount.blue >= tabConfig.unlockCost.blue;
				
			const hasEnoughLumen = lumenCost === 0 || lumenCount.total >= lumenCost;

			if (hasEnoughPixels && hasEnoughLumen) {
				// Deduct costs from pixels
				pixels.update((p) => ({
					...p,
					white: p.white - tabConfig.unlockCost.white,
					red: p.red - tabConfig.unlockCost.red,
					green: p.green - tabConfig.unlockCost.green,
					blue: p.blue - tabConfig.unlockCost.blue,
				}));

				// Deduct lumen cost if any
				if (lumenCost > 0) {
					lumen.update((l) => ({
						...l,
						total: l.total - lumenCost,
					}));
				}

				// Add tab to unlocked tabs
				update((state) => ({
					...state,
					unlockedTabs: [...state.unlockedTabs, tabId],
				}));

				return true;
			}
			return false;
		},

		isTabUnlocked: (tabId: string): boolean => {
			const state = get({ subscribe });
			return state.unlockedTabs.includes(tabId);
		},

		getTabUnlockCost: (tabId: string): TabUnlockCost => {
			return TAB_UNLOCK_REQUIREMENTS[tabId]?.unlockCost || { white: 0, red: 0, green: 0, blue: 0 };
		},

		// Soft cap calculation functions
		getTotalProductionRate: (): number => {
			const state = get({ subscribe });
			return getTotalTheoreticalProduction(state.generators, state.powerups);
		},

		getEffectiveProductionRate: (): number => {
			const state = get({ subscribe });
			const theoretical = getTotalTheoreticalProduction(
				state.generators,
				state.powerups,
			);
			return applySmoothScaling(theoretical, state.breakthroughs);
		},

		getProductionEfficiency: (): number => {
			const state = get({ subscribe });
			const theoretical = getTotalTheoreticalProduction(
				state.generators,
				state.powerups,
			);
			return getProductionEfficiency(theoretical, state.breakthroughs);
		},

		// Helper function to get pure color boost for a generator
		getPureColorBoost: (generatorColor: "red" | "green" | "blue" | "random"): number => {
			if (generatorColor === "random") {
				return pureColors.getRandomGeneratorMultiplier();
			} else if (generatorColor === "red" || generatorColor === "green" || generatorColor === "blue") {
				return pureColors.getPureColorMultiplier(generatorColor);
			}
			return 1;
		},

		// Get detailed pure color boost info for UI display
		getPureColorBoostDetails: (generatorColor: "red" | "green" | "blue" | "random") => {
			const currentMultiplier = upgrades.getPureColorBoost(generatorColor);
			
			if (generatorColor === "random") {
				const redCount = pureColors.getPureColorCount("red");
				const greenCount = pureColors.getPureColorCount("green");  
				const blueCount = pureColors.getPureColorCount("blue");
				
				return {
					type: "random" as const,
					currentMultiplier,
					redCount,
					greenCount,
					blueCount,
					hasBalance: Math.min(redCount, greenCount, blueCount) > 0,
					balanceRatio: Math.max(redCount, greenCount, blueCount) > 0 ? 
						Math.min(redCount, greenCount, blueCount) / Math.max(redCount, greenCount, blueCount) : 0,
				};
			} else {
				const pureCount = pureColors.getPureColorCount(generatorColor);
				const nextCount = pureCount + 1;
				
				// Calculate what the next multiplier would be
				const nextMultiplier = pureCount === 0 ? 
					pureColors.getPureColorMultiplier(generatorColor) : 
					calculateNextPureColorMultiplier(generatorColor, nextCount);
				
				// Find next milestone
				const milestones = [10, 25, 50, 100, 250, 500, 1000];
				const nextMilestone = milestones.find(m => m > pureCount);
				
				return {
					type: "single" as const,
					color: generatorColor,
					pureCount,
					currentMultiplier,
					nextMultiplier,
					nextCount,
					nextMilestone,
					milestonesReached: milestones.filter(m => pureCount >= m).length,
					hasAllPureColors: pureColors.hasAllPureColors(),
				};
			}
		},

		getEffectiveGeneratorRate: (id: string): number => {
			const state = get({ subscribe });
			const upgrade = state.generators[id];
			if (!upgrade || !upgrade.owned) return 0;

			// Get base rate for this generator
			const baseRate = upgrade.baseRate * upgrade.level;
			const powerupMultiplier = Object.values(state.powerups).reduce(
				(mult, powerup) => {
					if (powerup.level > 0) {
						return mult * Math.pow(powerup.multiplier, powerup.level);
					}
					return mult;
				},
				1,
			);

			// Apply lumen multipliers
			const lumenBoost = lumen.getRGBGeneratorMultiplier();
			const overflowBoost = lumen.getRGBBoostFromOverflow();
			const totalLumenMultiplier = lumenBoost * overflowBoost;

			// Apply pure color multipliers
			const pureColorMultiplier = upgrades.getPureColorBoost(upgrade.color);

			const theoreticalRate = baseRate * powerupMultiplier * totalLumenMultiplier * pureColorMultiplier;

			// Apply soft caps proportionally
			const totalTheoretical = getTotalTheoreticalProduction(
				state.generators,
				state.powerups,
			);
			const totalEffective = applySmoothScaling(
				totalTheoretical,
				state.breakthroughs,
			);

			if (totalTheoretical === 0) return 0;
			const efficiencyRatio = totalEffective / totalTheoretical;

			return theoreticalRate * efficiencyRatio;
		},

		processAutoTick: (deltaTimeSeconds?: number) => {
			const now = Date.now();
			update((state) => {
				// Use provided deltaTime or calculate from lastAutoTick for backward compatibility
				const deltaTime = deltaTimeSeconds ?? (now - state.lastAutoTick) / 1000;
				const isFastCatchup = deltaTime > 300; // 5 minutes threshold

				// Calculate soft cap adjusted rates
				const totalTheoretical = getTotalTheoreticalProduction(
					state.generators,
					state.powerups,
				);
				const totalEffective = applySmoothScaling(
					totalTheoretical,
					state.breakthroughs,
				);
				const efficiencyRatio =
					totalTheoretical > 0 ? totalEffective / totalTheoretical : 1;

				// Fast catchup mode: bulk calculation for offline progress
				if (isFastCatchup) {
					const bulkPixels = { red: 0, green: 0, blue: 0 };

					Object.values(state.generators).forEach((generator) => {
						if (generator.owned && generator.level > 0) {
							const rate = generator.baseRate * generator.level;
							const multiplier = Object.values(state.powerups).reduce(
								(mult, powerup) => {
									if (powerup.level > 0) {
										return mult * Math.pow(powerup.multiplier, powerup.level);
									}
									return mult;
								},
								1,
							);

							// Apply lumen synergies
							const lumenBoost = lumen.getRGBGeneratorMultiplier();
							const overflowBoost = lumen.getRGBBoostFromOverflow();
							const totalLumenMultiplier = lumenBoost * overflowBoost;

							// Apply pure color multipliers for matching colors
							let pureColorMultiplier = 1;
							if (generator.color === "random") {
								pureColorMultiplier = pureColors.getRandomGeneratorMultiplier();
							} else if (generator.color === "red" || generator.color === "green" || generator.color === "blue") {
								pureColorMultiplier = pureColors.getPureColorMultiplier(generator.color);
							}

							const effectiveRate = rate * multiplier * efficiencyRatio * totalLumenMultiplier * pureColorMultiplier;
							state.bitAccumulator[generator.id] += effectiveRate * deltaTime;

							const bitsToAdd = Math.floor(state.bitAccumulator[generator.id]);
							if (bitsToAdd > 0) {
								state.bitAccumulator[generator.id] -= bitsToAdd;

								// Bulk add pixels without individual loops or stream updates
								if (generator.color === "random") {
									// Distribute random bits evenly across colors (same as original logic)
									const redBits = Math.floor(bitsToAdd / 3) + (Math.random() < (bitsToAdd % 3) / 3 ? 1 : 0);
									const greenBits = Math.floor(bitsToAdd / 3) + (Math.random() < (bitsToAdd % 3) / 3 ? 1 : 0);
									const blueBits = bitsToAdd - redBits - greenBits;
									
									bulkPixels.red += redBits;
									bulkPixels.green += greenBits;
									bulkPixels.blue += blueBits;
								} else {
									const color = generator.color as "red" | "green" | "blue";
									bulkPixels[color] += bitsToAdd;
								}
							}
						}
					});

					// Single bulk update for all pixels - no stream updates during catchup
					if (bulkPixels.red > 0 || bulkPixels.green > 0 || bulkPixels.blue > 0) {
						pixels.addPixelsBulk(bulkPixels);
					}
				} else {
					// Normal mode: keep existing behavior for smooth visual updates
					Object.values(state.generators).forEach((generator) => {
						if (generator.owned && generator.level > 0) {
							const rate = generator.baseRate * generator.level;
							const multiplier = Object.values(state.powerups).reduce(
								(mult, powerup) => {
									if (powerup.level > 0) {
										return mult * Math.pow(powerup.multiplier, powerup.level);
									}
									return mult;
								},
								1,
							);

							// Apply lumen synergies
							const lumenBoost = lumen.getRGBGeneratorMultiplier();
							const overflowBoost = lumen.getRGBBoostFromOverflow();
							const totalLumenMultiplier = lumenBoost * overflowBoost;

							// Apply pure color multipliers for matching colors
							let pureColorMultiplier = 1;
							if (generator.color === "random") {
								pureColorMultiplier = pureColors.getRandomGeneratorMultiplier();
							} else if (generator.color === "red" || generator.color === "green" || generator.color === "blue") {
								pureColorMultiplier = pureColors.getPureColorMultiplier(generator.color);
							}

							// Apply soft cap efficiency, lumen multipliers, and pure color multipliers to this generator's rate
							const effectiveRate = rate * multiplier * efficiencyRatio * totalLumenMultiplier * pureColorMultiplier;
							// Add fractional bits to accumulator
							state.bitAccumulator[generator.id] += effectiveRate * deltaTime;

							// Convert whole bits from accumulator
							const bitsToAdd = Math.floor(state.bitAccumulator[generator.id]);
							if (bitsToAdd > 0) {
								state.bitAccumulator[generator.id] -= bitsToAdd; // Remove whole bits, keep fractional

								// Track pixels for stream visualization
								const streamPixels: ("red" | "green" | "blue")[] = [];

								if (generator.color === "random") {
									// Random color selection
									const colors: ("red" | "green" | "blue")[] = [
										"red",
										"green",
										"blue",
									];
									for (let i = 0; i < bitsToAdd; i++) {
										const randomColor = colors[Math.floor(Math.random() * 3)];
										pixels.addPixel(randomColor);
										streamPixels.push(randomColor);
									}
								} else {
									// Specific color
									const color = generator.color as "red" | "green" | "blue";
									for (let i = 0; i < bitsToAdd; i++) {
										pixels.addPixel(color);
										streamPixels.push(color);
									}
								}

								// Add pixels to stream visualization
								if (streamPixels.length > 0) {
									pixelStream.addPixels(streamPixels);
								}
							}
						}
					});
				}

				return {
					...state,
					lastAutoTick: now,
				};
			});
		},
	};
}

export const upgrades = createUpgradesStore();

// Derived stores for convenience
export const totalSpeedMultiplier = derived(upgrades, ($upgrades) => {
	let multiplier = 1;
	Object.values($upgrades.powerups).forEach((powerup) => {
		if (powerup.level > 0) {
			multiplier *= Math.pow(powerup.multiplier, powerup.level);
		}
	});
	return multiplier;
});

export const ownedGenerators = derived(upgrades, ($upgrades) =>
	Object.values($upgrades.generators).filter((generator) => generator.owned),
);

export const hasUnlockedUpgrades = derived(
	upgrades,
	($upgrades) =>
		Object.values($upgrades.generators).some((generator) => generator.owned) ||
		Object.values($upgrades.powerups).some((powerup) => powerup.level > 0),
);

// Tab unlock status derived stores
export const tabUnlockStatus = derived([pixels, upgrades, lumen], ([$pixels, $upgrades, $lumen]) => {
	const status: Record<
		string,
		{ unlocked: boolean; cost: TabUnlockCost & { lumen?: number }; canAfford: boolean }
	> = {};

	Object.values(TAB_UNLOCK_REQUIREMENTS).forEach((tabReq) => {
		const unlocked = $upgrades.unlockedTabs.includes(tabReq.id);
		const baseCost = tabReq.unlockCost;
		
		// Get dynamic lumen cost including mutual exclusivity
		const lumenCost = getDynamicLumenCost(tabReq.id, $upgrades.unlockedTabs);
		const cost = { ...baseCost, lumen: lumenCost > 0 ? lumenCost : undefined };
		
		const canAfford = !unlocked && (
			$pixels.white >= baseCost.white &&
			$pixels.red >= baseCost.red &&
			$pixels.green >= baseCost.green &&
			$pixels.blue >= baseCost.blue &&
			(lumenCost === 0 || $lumen.total >= lumenCost)
		);
			
		status[tabReq.id] = {
			unlocked,
			cost,
			canAfford,
		};
	});

	return status;
});

export const isTabUnlocked = derived(
	tabUnlockStatus,
	($status) => (tabId: string) => $status[tabId]?.unlocked ?? false,
);

// Register with the unified game loop
if (typeof window !== "undefined") {
	import("./gameLoop").then(({ gameLoop }) => {
		gameLoop.register({
			tick: (deltaTime: number) => upgrades.processAutoTick(deltaTime)
		});
		// Start the game loop if not already started
		gameLoop.start();
	});
}
