import { writable, derived, get } from "svelte/store";
import { pixels } from "./pixels";
import { pixelStream } from "./pixelStream";

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

export interface SoftCapTier {
	threshold: number;
	power: number;
}

export interface BreakthroughUpgrade {
	id: string;
	name: string;
	description: string;
	type: "extender" | "efficiency" | "multiplier";
	effect: number;
	baseCost: number;
	purchased: boolean;
}

export interface TabUnlock {
	id: string;
	name: string;
	icon: string;
	lifetimeWhiteRequired: number;
}

export interface UpgradeState {
	generators: Record<string, GeneratorUpgrade>;
	powerups: Record<string, PowerupUpgrade>;
	breakthroughs: Record<string, BreakthroughUpgrade>;
	lastAutoTick: number;
	bitAccumulator: Record<string, number>;
}

// Tab unlock requirements configuration
export const TAB_UNLOCK_REQUIREMENTS: Record<string, TabUnlock> = {
	generators: {
		id: "generators",
		name: "Generators",
		icon: "🤖",
		lifetimeWhiteRequired: 0, // Always unlocked
	},
	powerups: {
		id: "powerups",
		name: "Powerups",
		icon: "⚡",
		lifetimeWhiteRequired: 50,
	},
	breakthroughs: {
		id: "breakthroughs",
		name: "Breakthroughs",
		icon: "🚀",
		lifetimeWhiteRequired: 100,
	},
};

const DEFAULT_GENERATORS: Record<string, GeneratorUpgrade> = {
	redGenerator: {
		id: "redGenerator",
		name: "Red Bits Generator",
		description: "Generates red bits over time",
		color: "red",
		baseRate: 0.5,
		baseCost: 10,
		costMultiplier: 1.5,
		level: 0,
		owned: false,
	},
	greenGenerator: {
		id: "greenGenerator",
		name: "Green Bits Generator",
		description: "Generates green bits over time",
		color: "green",
		baseRate: 0.5,
		baseCost: 10,
		costMultiplier: 1.5,
		level: 0,
		owned: false,
	},
	blueGenerator: {
		id: "blueGenerator",
		name: "Blue Bits Generator",
		description: "Generates blue bits over time",
		color: "blue",
		baseRate: 0.5,
		baseCost: 10,
		costMultiplier: 1.5,
		level: 0,
		owned: false,
	},
	randomGenerator: {
		id: "randomGenerator",
		name: "Random Bits Generator",
		description: "Generates random RGB bits over time",
		color: "random",
		baseRate: 1.0,
		baseCost: 25,
		costMultiplier: 1.8,
		level: 0,
		owned: false,
	},
};

const DEFAULT_POWERUPS: Record<string, PowerupUpgrade> = {
	speedBoost: {
		id: "speedBoost",
		name: "Speed Boost",
		description: "2x auto-buy rate",
		multiplier: 2,
		baseCost: 50,
		costMultiplier: 3,
		level: 0,
		maxLevel: 5,
	},
	megaSpeed: {
		id: "megaSpeed",
		name: "Mega Speed",
		description: "5x auto-buy rate",
		multiplier: 5,
		baseCost: 200,
		costMultiplier: 4,
		level: 0,
		maxLevel: 3,
	},
	ultraSpeed: {
		id: "ultraSpeed",
		name: "Ultra Speed",
		description: "10x auto-buy rate",
		multiplier: 10,
		baseCost: 1000,
		costMultiplier: 5,
		level: 0,
		maxLevel: 2,
	},
};

const DEFAULT_BREAKTHROUGHS: Record<string, BreakthroughUpgrade> = {
	efficiency1: {
		id: "efficiency1",
		name: "Production Efficiency I",
		description: "Reduces first soft cap penalty (10x threshold)",
		type: "extender",
		effect: 10,
		baseCost: 100,
		purchased: false,
	},
	efficiency2: {
		id: "efficiency2",
		name: "Production Efficiency II",
		description: "Reduces second soft cap penalty (100x threshold)",
		type: "extender",
		effect: 100,
		baseCost: 2500,
		purchased: false,
	},
	efficiency3: {
		id: "efficiency3",
		name: "Production Efficiency III",
		description: "Reduces third soft cap penalty (1000x threshold)",
		type: "extender",
		effect: 1000,
		baseCost: 50000,
		purchased: false,
	},
};

// Soft cap configuration
const SOFT_CAP_TIERS: SoftCapTier[] = [
	{ threshold: 10, power: 0.5 }, // First soft cap at 10 bits/sec → ^0.5 (square root)
	{ threshold: 100, power: 0.33 }, // Second soft cap at 100 bits/sec → ^0.33 (cube root)
	{ threshold: 1000, power: 0.25 }, // Third soft cap at 1000 bits/sec → ^0.25 (fourth root)
];

// Soft cap calculation functions
function applySoftCaps(
	production: number,
	breakthroughs: Record<string, BreakthroughUpgrade>,
): number {
	let result = production;

	// Apply soft caps sequentially
	for (const tier of SOFT_CAP_TIERS) {
		// Check if breakthrough extends this threshold
		let effectiveThreshold = tier.threshold;

		// Apply breakthrough effects (multiply threshold by effect)
		Object.values(breakthroughs).forEach((breakthrough) => {
			if (breakthrough.purchased && breakthrough.type === "extender") {
				effectiveThreshold *= breakthrough.effect;
			}
		});

		if (result > effectiveThreshold) {
			const excess = result - effectiveThreshold;
			result = effectiveThreshold + Math.pow(excess, tier.power);
		}
	}

	return result;
}

function getProductionEfficiency(
	production: number,
	breakthroughs: Record<string, BreakthroughUpgrade>,
): number {
	if (production === 0) return 1;

	const uncappedProduction = production;
	const cappedProduction = applySoftCaps(production, breakthroughs);

	return cappedProduction / uncappedProduction;
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
	const defaultAccumulator = {
		redGenerator: 0,
		greenGenerator: 0,
		blueGenerator: 0,
		randomGenerator: 0,
	};

	if (typeof window === "undefined") {
		return {
			generators: { ...DEFAULT_GENERATORS },
			powerups: { ...DEFAULT_POWERUPS },
			breakthroughs: { ...DEFAULT_BREAKTHROUGHS },
			lastAutoTick: Date.now(),
			bitAccumulator: { ...defaultAccumulator },
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
			};
		} catch {
			return {
				generators: { ...DEFAULT_GENERATORS },
				powerups: { ...DEFAULT_POWERUPS },
				breakthroughs: { ...DEFAULT_BREAKTHROUGHS },
				lastAutoTick: Date.now(),
				bitAccumulator: { ...defaultAccumulator },
			};
		}
	}

	return {
		generators: { ...DEFAULT_GENERATORS },
		powerups: { ...DEFAULT_POWERUPS },
		breakthroughs: { ...DEFAULT_BREAKTHROUGHS },
		lastAutoTick: Date.now(),
		bitAccumulator: { ...defaultAccumulator },
	};
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
			const multiplier = get({ subscribe }).powerups
				? (() => {
						const currentState = get({ subscribe });
						let mult = 1;
						Object.values(currentState.powerups).forEach((powerup) => {
							if (powerup.level > 0) {
								mult *= Math.pow(powerup.multiplier, powerup.level);
							}
						});
						return mult;
					})()
				: 1;

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
			return applySoftCaps(theoretical, state.breakthroughs);
		},

		getProductionEfficiency: (): number => {
			const state = get({ subscribe });
			const theoretical = getTotalTheoreticalProduction(
				state.generators,
				state.powerups,
			);
			return getProductionEfficiency(theoretical, state.breakthroughs);
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

			const theoreticalRate = baseRate * powerupMultiplier;

			// Apply soft caps proportionally
			const totalTheoretical = getTotalTheoreticalProduction(
				state.generators,
				state.powerups,
			);
			const totalEffective = applySoftCaps(
				totalTheoretical,
				state.breakthroughs,
			);

			if (totalTheoretical === 0) return 0;
			const efficiencyRatio = totalEffective / totalTheoretical;

			return theoreticalRate * efficiencyRatio;
		},

		processAutoTick: () => {
			const now = Date.now();
			update((state) => {
				const deltaTime = (now - state.lastAutoTick) / 1000; // Convert to seconds

				// Calculate soft cap adjusted rates
				const totalTheoretical = getTotalTheoreticalProduction(
					state.generators,
					state.powerups,
				);
				const totalEffective = applySoftCaps(
					totalTheoretical,
					state.breakthroughs,
				);
				const efficiencyRatio =
					totalTheoretical > 0 ? totalEffective / totalTheoretical : 1;

				// Process each generator
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

						// Apply soft cap efficiency to this generator's rate
						const effectiveRate = rate * multiplier * efficiencyRatio;
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
export const tabUnlockStatus = derived(pixels, ($pixels) => {
	const status: Record<
		string,
		{ unlocked: boolean; progress: number; required: number }
	> = {};

	Object.values(TAB_UNLOCK_REQUIREMENTS).forEach((tabReq) => {
		const progress = $pixels.lifetimeWhite;
		const required = tabReq.lifetimeWhiteRequired;
		status[tabReq.id] = {
			unlocked: progress >= required,
			progress,
			required,
		};
	});

	return status;
});

export const isTabUnlocked = derived(
	tabUnlockStatus,
	($status) => (tabId: string) => $status[tabId]?.unlocked ?? false,
);

// Generator tick system - runs every 100ms
if (typeof window !== "undefined") {
	setInterval(() => {
		upgrades.processAutoTick();
	}, 100);
}
