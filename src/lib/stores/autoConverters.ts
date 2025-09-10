import { writable, derived, get } from "svelte/store";
import { pixels } from "./pixels";
import { compositeColors } from "./compositeColors";

export interface AutoConverter {
	id: string;
	name: string;
	description: string;
	type: "white" | "pure" | "mixed";
	targetColor?: string; // For pure/mixed converters
	level: number;
	maxLevel: number;
	baseCost: number;
	costMultiplier: number;
	baseRate: number; // conversions per second
	rateMultiplier: number; // rate increase per level
	unlockRequirement: number; // lifetime white pixels needed
	enabled: boolean;
}

export interface AutoConverterState {
	whiteConverter: AutoConverter;
	crimsonForge: AutoConverter;
	emeraldForge: AutoConverter;
	sapphireForge: AutoConverter;
	orangeMixer: AutoConverter;
	purpleMixer: AutoConverter;
	yellowMixer: AutoConverter;
	cyanMixer: AutoConverter;
	magentaMixer: AutoConverter;
	limeMixer: AutoConverter;
}

// Default auto converter configurations (ordered by tab layout: white → mixed → pure)
const DEFAULT_AUTO_CONVERTERS: AutoConverterState = {
	// White converter - Row 1 (matches RGB tab)
	whiteConverter: {
		id: "whiteConverter",
		name: "Auto White Converter",
		description: "Automatically converts RGB pixels to white pixels when possible",
		type: "white",
		level: 0,
		maxLevel: 10,
		baseCost: 5,
		costMultiplier: 2.5,
		baseRate: 0.5,
		rateMultiplier: 1.8,
		unlockRequirement: 10,
		enabled: false,
	},
	// Mixed color converters - Row 2 (matches mixed tab)
	orangeMixer: {
		id: "orangeMixer",
		name: "Orange Auto-Mixer",
		description: "Automatically converts 2 red + 1 green into Orange",
		type: "mixed",
		targetColor: "orange",
		level: 0,
		maxLevel: 6,
		baseCost: 8,
		costMultiplier: 2.8,
		baseRate: 0.4,
		rateMultiplier: 1.7,
		unlockRequirement: 25,
		enabled: false,
	},
	purpleMixer: {
		id: "purpleMixer",
		name: "Purple Auto-Mixer",
		description: "Automatically converts 2 red + 1 blue into Purple",
		type: "mixed",
		targetColor: "purple",
		level: 0,
		maxLevel: 6,
		baseCost: 8,
		costMultiplier: 2.8,
		baseRate: 0.4,
		rateMultiplier: 1.7,
		unlockRequirement: 25,
		enabled: false,
	},
	yellowMixer: {
		id: "yellowMixer",
		name: "Yellow Auto-Mixer",
		description: "Automatically converts 1 red + 2 green into Yellow",
		type: "mixed",
		targetColor: "yellow",
		level: 0,
		maxLevel: 6,
		baseCost: 8,
		costMultiplier: 2.8,
		baseRate: 0.4,
		rateMultiplier: 1.7,
		unlockRequirement: 25,
		enabled: false,
	},
	cyanMixer: {
		id: "cyanMixer",
		name: "Cyan Auto-Mixer",
		description: "Automatically converts 1 green + 2 blue into Cyan",
		type: "mixed",
		targetColor: "cyan",
		level: 0,
		maxLevel: 6,
		baseCost: 8,
		costMultiplier: 2.8,
		baseRate: 0.4,
		rateMultiplier: 1.7,
		unlockRequirement: 25,
		enabled: false,
	},
	magentaMixer: {
		id: "magentaMixer",
		name: "Magenta Auto-Mixer",
		description: "Automatically converts 1 red + 2 blue into Magenta",
		type: "mixed",
		targetColor: "magenta",
		level: 0,
		maxLevel: 6,
		baseCost: 8,
		costMultiplier: 2.8,
		baseRate: 0.4,
		rateMultiplier: 1.7,
		unlockRequirement: 25,
		enabled: false,
	},
	limeMixer: {
		id: "limeMixer",
		name: "Lime Auto-Mixer",
		description: "Automatically converts 2 green + 1 blue into Lime",
		type: "mixed",
		targetColor: "lime",
		level: 0,
		maxLevel: 6,
		baseCost: 8,
		costMultiplier: 2.8,
		baseRate: 0.4,
		rateMultiplier: 1.7,
		unlockRequirement: 25,
		enabled: false,
	},
	// Pure color converters - Row 3 (matches pure tab)
	crimsonForge: {
		id: "crimsonForge",
		name: "Crimson Auto-Forge",
		description: "Automatically converts 3 red pixels into Crimson",
		type: "pure",
		targetColor: "crimson",
		level: 0,
		maxLevel: 8,
		baseCost: 15,
		costMultiplier: 3.0,
		baseRate: 0.3,
		rateMultiplier: 1.6,
		unlockRequirement: 50,
		enabled: false,
	},
	emeraldForge: {
		id: "emeraldForge",
		name: "Emerald Auto-Forge",
		description: "Automatically converts 3 green pixels into Emerald",
		type: "pure",
		targetColor: "emerald",
		level: 0,
		maxLevel: 8,
		baseCost: 15,
		costMultiplier: 3.0,
		baseRate: 0.3,
		rateMultiplier: 1.6,
		unlockRequirement: 50,
		enabled: false,
	},
	sapphireForge: {
		id: "sapphireForge",
		name: "Sapphire Auto-Forge",
		description: "Automatically converts 3 blue pixels into Sapphire",
		type: "pure",
		targetColor: "sapphire",
		level: 0,
		maxLevel: 8,
		baseCost: 15,
		costMultiplier: 3.0,
		baseRate: 0.3,
		rateMultiplier: 1.6,
		unlockRequirement: 50,
		enabled: false,
	},
};

// Load saved auto converters from localStorage
function loadAutoConverters(): AutoConverterState {
	if (typeof window === "undefined") {
		return { ...DEFAULT_AUTO_CONVERTERS };
	}

	const saved = localStorage.getItem("autoConverters");
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			// Merge with defaults to handle new converters
			return { ...DEFAULT_AUTO_CONVERTERS, ...parsed };
		} catch {
			return { ...DEFAULT_AUTO_CONVERTERS };
		}
	}
	return { ...DEFAULT_AUTO_CONVERTERS };
}

function createAutoConvertersStore() {
	const { subscribe, update, set } = writable<AutoConverterState>(loadAutoConverters());

	// Auto-save to localStorage
	subscribe((value) => {
		if (typeof window !== "undefined") {
			localStorage.setItem("autoConverters", JSON.stringify(value));
		}
	});

	// Track conversion accumulator for fractional rates
	let conversionAccumulator: { [key: string]: number } = {};

	return {
		subscribe,

		// Get current cost for upgrading a converter
		getUpgradeCost: (converterId: keyof AutoConverterState): number => {
			const converters = get({ subscribe });
			const converter = converters[converterId];
			if (converter.level >= converter.maxLevel) return Infinity;
			return Math.floor(converter.baseCost * Math.pow(converter.costMultiplier, converter.level));
		},

		// Get current conversion rate for a converter
		getConversionRate: (converterId: keyof AutoConverterState): number => {
			const converters = get({ subscribe });
			const converter = converters[converterId];
			if (converter.level === 0) return 0;
			return converter.baseRate * Math.pow(converter.rateMultiplier, converter.level - 1);
		},

		// Check if player can afford to upgrade a converter
		canAffordUpgrade: (converterId: keyof AutoConverterState): boolean => {
			const converters = get({ subscribe });
			const converter = converters[converterId];
			if (converter.level >= converter.maxLevel) return false;
			const cost = Math.floor(converter.baseCost * Math.pow(converter.costMultiplier, converter.level));
			const currentWhite = get(pixels).white;
			return currentWhite >= cost;
		},

		// Purchase/upgrade a converter
		upgradeConverter: (converterId: keyof AutoConverterState): boolean => {
			const converters = get({ subscribe });
			const converter = converters[converterId];
			if (converter.level >= converter.maxLevel) return false;
			
			const cost = Math.floor(converter.baseCost * Math.pow(converter.costMultiplier, converter.level));
			const currentWhite = get(pixels).white;
			
			if (currentWhite >= cost) {
				// Deduct white pixels
				pixels.update((p) => ({
					...p,
					white: p.white - cost,
				}));

				// Upgrade converter
				update((converters) => ({
					...converters,
					[converterId]: {
						...converters[converterId],
						level: converters[converterId].level + 1,
						enabled: true, // Auto-enable when first purchased
					},
				}));

				return true;
			}
			return false;
		},

		// Toggle converter on/off
		toggleConverter: (converterId: keyof AutoConverterState): void => {
			update((converters) => ({
				...converters,
				[converterId]: {
					...converters[converterId],
					enabled: !converters[converterId].enabled,
				},
			}));
		},

		// Check if converter is unlocked
		isUnlocked: (converterId: keyof AutoConverterState): boolean => {
			const converters = get({ subscribe });
			const lifetimeWhite = get(pixels).lifetimeWhite;
			return lifetimeWhite >= converters[converterId].unlockRequirement;
		},

		// Helper method to get store state 
		getState: () => {
			return get({ subscribe });
		},

		// Auto-conversion tick (called from game loop)
		tick: (deltaTimeSeconds: number): void => {
			const converters = get({ subscribe });
			const currentPixels = get(pixels);

			Object.entries(converters).forEach(([converterId, converter]) => {
				if (!converter.enabled || converter.level === 0) return;

				const rate = converter.level === 0 
					? 0 
					: converter.baseRate * Math.pow(converter.rateMultiplier, converter.level - 1);
				if (rate === 0) return;

				// Accumulate fractional conversions
				if (!conversionAccumulator[converterId]) {
					conversionAccumulator[converterId] = 0;
				}
				conversionAccumulator[converterId] += rate * deltaTimeSeconds;

				// Process whole conversions
				let conversionsToProcess = Math.floor(conversionAccumulator[converterId]);
				if (conversionsToProcess === 0) return;

				if (converter.type === "white") {
					// RGB → White conversion
					const cost = pixels.getConversionCost();
					const maxConversions = Math.min(
						conversionsToProcess,
						Math.floor(currentPixels.red / cost.red),
						Math.floor(currentPixels.green / cost.green),
						Math.floor(currentPixels.blue / cost.blue)
					);

					if (maxConversions > 0) {
						// Perform conversions (simplified - doesn't use all breakthrough logic)
						pixels.update((p) => ({
							...p,
							red: p.red - (cost.red * maxConversions),
							green: p.green - (cost.green * maxConversions),
							blue: p.blue - (cost.blue * maxConversions),
							white: p.white + maxConversions,
							lifetimeWhite: p.lifetimeWhite + maxConversions,
						}));

						conversionAccumulator[converterId] -= maxConversions;
					}
				} else if (converter.type === "pure" && converter.targetColor) {
					// Pure color conversion (3 of same color)
					let maxConversions = 0;
					if (converter.targetColor === "crimson") {
						maxConversions = Math.min(conversionsToProcess, Math.floor(currentPixels.red / 3));
						if (maxConversions > 0) {
							pixels.update((p) => ({ ...p, red: p.red - (3 * maxConversions) }));
							compositeColors.mixColor("crimson" as any); // Multiple conversions need loop
						}
					} else if (converter.targetColor === "emerald") {
						maxConversions = Math.min(conversionsToProcess, Math.floor(currentPixels.green / 3));
						if (maxConversions > 0) {
							pixels.update((p) => ({ ...p, green: p.green - (3 * maxConversions) }));
							// Add emerald directly
							for (let i = 0; i < maxConversions; i++) {
								compositeColors.mixColor("emerald" as any);
							}
						}
					} else if (converter.targetColor === "sapphire") {
						maxConversions = Math.min(conversionsToProcess, Math.floor(currentPixels.blue / 3));
						if (maxConversions > 0) {
							pixels.update((p) => ({ ...p, blue: p.blue - (3 * maxConversions) }));
							for (let i = 0; i < maxConversions; i++) {
								compositeColors.mixColor("sapphire" as any);
							}
						}
					}
					
					if (maxConversions > 0) {
						conversionAccumulator[converterId] -= maxConversions;
					}
				} else if (converter.type === "mixed" && converter.targetColor) {
					// Mixed color conversions
					let maxConversions = 0;
					const colors = get(compositeColors);
					const targetColorData = Object.values(colors).find(c => c.id === converter.targetColor);
					
					if (targetColorData) {
						const recipe = targetColorData.recipe;
						maxConversions = Math.min(
							conversionsToProcess,
							Math.floor(currentPixels.red / recipe.red),
							Math.floor(currentPixels.green / recipe.green),
							Math.floor(currentPixels.blue / recipe.blue)
						);

						if (maxConversions > 0) {
							for (let i = 0; i < maxConversions; i++) {
								compositeColors.mixColor(converter.targetColor as any);
							}
							conversionAccumulator[converterId] -= maxConversions;
						}
					}
				}
			});
		},

		// Get all unlocked converters for UI
		getUnlockedConverters: (): AutoConverter[] => {
			const converters = get({ subscribe });
			const lifetimeWhite = get(pixels).lifetimeWhite;
			return Object.values(converters).filter(
				(converter) => lifetimeWhite >= converter.unlockRequirement
			);
		},

		// Reset all converters
		reset: () => {
			set({ ...DEFAULT_AUTO_CONVERTERS });
			conversionAccumulator = {};
		},
	};
}

export const autoConverters = createAutoConvertersStore();

// Derived stores for UI convenience
export const unlockedConverters = derived(
	[autoConverters, pixels],
	([$converters, $pixels]) => {
		return Object.values($converters).filter(
			(converter) => $pixels.lifetimeWhite >= converter.unlockRequirement
		);
	}
);

export const activeConverters = derived(
	autoConverters,
	($converters) => {
		return Object.values($converters).filter(
			(converter) => converter.enabled && converter.level > 0
		);
	}
);

// Check if auto converters tab should be unlocked
export const autoConvertersUnlocked = derived(
	pixels,
	($pixels) => $pixels.lifetimeWhite >= 10
);

// Auto converter tick system - runs every 100ms like generators
if (typeof window !== "undefined") {
	setInterval(() => {
		autoConverters.tick(0.1); // 100ms = 0.1 seconds
	}, 100);
}