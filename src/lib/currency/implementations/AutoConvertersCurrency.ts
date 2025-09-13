import { writable, derived, get } from "svelte/store";
import { MultiCurrencyBase, type MultiCurrencyConfig } from "../core/MultiCurrency";
import type { ICurrency, CurrencyType } from "../core/interfaces";
import { AUTO_CONVERTER_CONFIG } from "$lib/config/gameConfig";
import { pixels } from "./PixelsCurrency";
import { compositeColors } from "./CompositeColorsCurrency";

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
		...AUTO_CONVERTER_CONFIG.whiteConverter,
		level: 0,
		enabled: false,
	},
	// Mixed color converters - Row 2 (matches mixed tab)
	orangeMixer: {
		id: "orangeMixer",
		name: "Orange Auto-Mixer",
		description: "Automatically converts 2 red + 1 green into Orange",
		type: "mixed",
		targetColor: "orange",
		...AUTO_CONVERTER_CONFIG.orangeMixer,
		level: 0,
		enabled: false,
	},
	purpleMixer: {
		id: "purpleMixer",
		name: "Purple Auto-Mixer",
		description: "Automatically converts 2 red + 1 blue into Purple",
		type: "mixed",
		targetColor: "purple",
		...AUTO_CONVERTER_CONFIG.purpleMixer,
		level: 0,
		enabled: false,
	},
	yellowMixer: {
		id: "yellowMixer",
		name: "Yellow Auto-Mixer",
		description: "Automatically converts 1 red + 2 green into Yellow",
		type: "mixed",
		targetColor: "yellow",
		...AUTO_CONVERTER_CONFIG.yellowMixer,
		level: 0,
		enabled: false,
	},
	cyanMixer: {
		id: "cyanMixer",
		name: "Cyan Auto-Mixer",
		description: "Automatically converts 1 green + 2 blue into Cyan",
		type: "mixed",
		targetColor: "cyan",
		...AUTO_CONVERTER_CONFIG.cyanMixer,
		level: 0,
		enabled: false,
	},
	magentaMixer: {
		id: "magentaMixer",
		name: "Magenta Auto-Mixer",
		description: "Automatically converts 1 red + 2 blue into Magenta",
		type: "mixed",
		targetColor: "magenta",
		...AUTO_CONVERTER_CONFIG.magentaMixer,
		level: 0,
		enabled: false,
	},
	limeMixer: {
		id: "limeMixer",
		name: "Lime Auto-Mixer",
		description: "Automatically converts 2 green + 1 blue into Lime",
		type: "mixed",
		targetColor: "lime",
		...AUTO_CONVERTER_CONFIG.limeMixer,
		level: 0,
		enabled: false,
	},
	// Pure color converters - Row 3 (matches pure tab)
	crimsonForge: {
		id: "crimsonForge",
		name: "Crimson Auto-Forge",
		description: "Automatically converts 3 red pixels into Crimson",
		type: "pure",
		targetColor: "crimson",
		...AUTO_CONVERTER_CONFIG.crimsonForge,
		level: 0,
		enabled: false,
	},
	emeraldForge: {
		id: "emeraldForge",
		name: "Emerald Auto-Forge",
		description: "Automatically converts 3 green pixels into Emerald",
		type: "pure",
		targetColor: "emerald",
		...AUTO_CONVERTER_CONFIG.emeraldForge,
		level: 0,
		enabled: false,
	},
	sapphireForge: {
		id: "sapphireForge",
		name: "Sapphire Auto-Forge",
		description: "Automatically converts 3 blue pixels into Sapphire",
		type: "pure",
		targetColor: "sapphire",
		...AUTO_CONVERTER_CONFIG.sapphireForge,
		level: 0,
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

class AutoConvertersCurrency extends MultiCurrencyBase<AutoConverterState> {
	// Track conversion accumulator for fractional rates
	private conversionAccumulator: { [key: string]: number } = {};

	constructor() {
		const config: MultiCurrencyConfig<AutoConverterState> = {
			id: "autoConverters",
			type: "multi-currency",
			displayName: "Auto Converters",
			storageKey: "autoConverters",
			defaultState: loadAutoConverters(),
			persistence: true,
			resetOnGameReset: true,
		};

		super(config);

		// Auto-save on changes
		this.subscribe((value) => {
			if (typeof window !== "undefined") {
				localStorage.setItem("autoConverters", JSON.stringify(value));
			}
		});
	}

	// ICurrency interface implementation
	getAmount(): number {
		// For auto converters, return total levels across all converters
		const state = get(this.store);
		return Object.values(state).reduce((total, converter) => total + converter.level, 0);
	}

	addAmount(): void {
		// Not applicable for auto converter system
		throw new Error("addAmount not applicable for auto converters currency");
	}

	spendAmount(): boolean {
		// Not applicable for auto converter system
		throw new Error("spendAmount not applicable for auto converters currency");
	}

	canAfford(): boolean {
		// Not applicable for auto converter system
		throw new Error("canAfford not applicable for auto converters currency");
	}

	// Auto Converter-specific methods

	// Get current cost for upgrading a converter
	getUpgradeCost(converterId: keyof AutoConverterState): number {
		const converters = get(this.store);
		const converter = converters[converterId];
		if (converter.level >= converter.maxLevel) return Infinity;
		return Math.floor(converter.baseCost * Math.pow(converter.costMultiplier, converter.level));
	}

	// Get current conversion rate for a converter
	getConversionRate(converterId: keyof AutoConverterState): number {
		const converters = get(this.store);
		const converter = converters[converterId];
		if (converter.level === 0) return 0;
		return converter.baseRate * Math.pow(converter.rateMultiplier, converter.level - 1);
	}

	// Check if player can afford to upgrade a converter
	canAffordUpgrade(converterId: keyof AutoConverterState): boolean {
		const converters = get(this.store);
		const converter = converters[converterId];
		if (converter.level >= converter.maxLevel) return false;
		const cost = Math.floor(converter.baseCost * Math.pow(converter.costMultiplier, converter.level));

		// Import pixels dynamically to avoid circular dependency
		const pixelsStore = pixels;
		const currentWhite = (get(pixelsStore) as any).white;
		return currentWhite >= cost;
	}

	// Check if player can purchase a converter (checks color prerequisites)
	canPurchaseConverter(converterId: keyof AutoConverterState): boolean {
		const converters = get(this.store);
		const converter = converters[converterId];

		// Import compositeColors dynamically to avoid circular dependency
		const compositeColorsStore = compositeColors;
		const colors: any = get(compositeColors);

		// For pure color converters, check if the target color is unlocked
		if (converter.type === "pure" && converter.targetColor) {
			const targetColorData = colors[converter.targetColor as keyof typeof colors];
			if (!targetColorData || !targetColorData.unlocked) {
				return false;
			}
		}

		// Mixed color converters don't require color unlock (they help you get the colors!)
		return true;
	}

	// Purchase/upgrade a converter
	upgradeConverter(converterId: keyof AutoConverterState): boolean {
		const converters = get(this.store);
		const converter = converters[converterId];
		if (converter.level >= converter.maxLevel) return false;

		const cost = Math.floor(converter.baseCost * Math.pow(converter.costMultiplier, converter.level));

		// Import pixels dynamically to avoid circular dependency
		const pixelsStore = pixels;
		const currentWhite = (get(pixelsStore) as any).white;

		if (currentWhite >= cost) {
			// Deduct white pixels
			pixels.update((p: any) => ({
				...p,
				white: p.white - cost,
			}));

			// Upgrade converter
			this.update((converters) => ({
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
	}

	// Toggle converter on/off
	toggleConverter(converterId: keyof AutoConverterState): void {
		this.update((converters) => ({
			...converters,
			[converterId]: {
				...converters[converterId],
				enabled: !converters[converterId].enabled,
			},
		}));
	}

	// Pause all active converters
	pauseAllConverters(): void {
		this.update((converters) => {
			const updatedConverters = { ...converters };
			Object.keys(updatedConverters).forEach(key => {
				const converterId = key as keyof AutoConverterState;
				if (updatedConverters[converterId].level > 0) {
					updatedConverters[converterId] = {
						...updatedConverters[converterId],
						enabled: false,
					};
				}
			});
			return updatedConverters;
		});
	}

	// Resume all purchased converters
	resumeAllConverters(): void {
		this.update((converters) => {
			const updatedConverters = { ...converters };
			Object.keys(updatedConverters).forEach(key => {
				const converterId = key as keyof AutoConverterState;
				if (updatedConverters[converterId].level > 0) {
					updatedConverters[converterId] = {
						...updatedConverters[converterId],
						enabled: true,
					};
				}
			});
			return updatedConverters;
		});
	}

	// Check if converter is unlocked
	isUnlocked(converterId: keyof AutoConverterState): boolean {
		const converters = get(this.store);

		// Import pixels dynamically to avoid circular dependency
		const pixelsStore = pixels;
		const lifetimeWhite = (get(pixelsStore) as any).lifetimeWhite;
		return lifetimeWhite >= converters[converterId].unlockRequirement;
	}

	// Helper method to get store state
	getState() {
		return get(this.store);
	}

	// Auto-conversion tick (called from game loop)
	tick(deltaTimeSeconds: number): void {
		const converters = get(this.store);

		// Import dependencies dynamically to avoid circular dependencies
		const pixelsStore = pixels;
		const compositeColorsStore = compositeColors;
		const currentPixels: any = get(pixelsStore);
		const isFastCatchup = deltaTimeSeconds > 300; // 5 minutes threshold

		Object.entries(converters).forEach(([converterId, converter]) => {
			if (!converter.enabled || converter.level === 0) return;

			const rate = converter.level === 0
				? 0
				: converter.baseRate * Math.pow(converter.rateMultiplier, converter.level - 1);
			if (rate === 0) return;

			// Accumulate fractional conversions
			if (!this.conversionAccumulator[converterId]) {
				this.conversionAccumulator[converterId] = 0;
			}
			this.conversionAccumulator[converterId] += rate * deltaTimeSeconds;

			// Process whole conversions
			let conversionsToProcess = Math.floor(this.conversionAccumulator[converterId]);
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
					pixels.update((p: any) => ({
						...p,
						red: p.red - (cost.red * maxConversions),
						green: p.green - (cost.green * maxConversions),
						blue: p.blue - (cost.blue * maxConversions),
						white: p.white + maxConversions,
						lifetimeWhite: p.lifetimeWhite + maxConversions,
					}));

					this.conversionAccumulator[converterId] -= maxConversions;
				}
			} else if (converter.type === "pure" && converter.targetColor) {
				// Pure color conversion (3 of same color)
				let maxConversions = 0;
				if (converter.targetColor === "crimson") {
					maxConversions = Math.min(conversionsToProcess, Math.floor(currentPixels.red / 3));
					if (maxConversions > 0) {
						pixels.update((p: any) => ({ ...p, red: p.red - (3 * maxConversions) }));
						if (isFastCatchup) {
							// Fast catchup: add composite color count directly
							compositeColors.addColorBulk("crimson", maxConversions);
						} else {
							// Normal mode: individual calls for proper logic
							for (let i = 0; i < maxConversions; i++) {
								compositeColors.mixColor("crimson" as any);
							}
						}
					}
				} else if (converter.targetColor === "emerald") {
					maxConversions = Math.min(conversionsToProcess, Math.floor(currentPixels.green / 3));
					if (maxConversions > 0) {
						pixels.update((p: any) => ({ ...p, green: p.green - (3 * maxConversions) }));
						if (isFastCatchup) {
							compositeColors.addColorBulk("emerald", maxConversions);
						} else {
							for (let i = 0; i < maxConversions; i++) {
								compositeColors.mixColor("emerald" as any);
							}
						}
					}
				} else if (converter.targetColor === "sapphire") {
					maxConversions = Math.min(conversionsToProcess, Math.floor(currentPixels.blue / 3));
					if (maxConversions > 0) {
						pixels.update((p: any) => ({ ...p, blue: p.blue - (3 * maxConversions) }));
						if (isFastCatchup) {
							compositeColors.addColorBulk("sapphire", maxConversions);
						} else {
							for (let i = 0; i < maxConversions; i++) {
								compositeColors.mixColor("sapphire" as any);
							}
						}
					}
				}

				if (maxConversions > 0) {
					this.conversionAccumulator[converterId] -= maxConversions;
				}
			} else if (converter.type === "mixed" && converter.targetColor) {
				// Mixed color conversions
				let maxConversions = 0;
				const colors: any = get(compositeColors);
				const targetColorData = Object.values(colors).find((c: any) => c.id === converter.targetColor);

				if (targetColorData) {
					const recipe = (targetColorData as any).recipe;
					maxConversions = Math.min(
						conversionsToProcess,
						Math.floor(currentPixels.red / recipe.red),
						Math.floor(currentPixels.green / recipe.green),
						Math.floor(currentPixels.blue / recipe.blue)
					);

					if (maxConversions > 0) {
						if (isFastCatchup) {
							// Fast catchup: bulk update RGB pixels and add composite colors directly
							pixels.update((p: any) => ({
								...p,
								red: p.red - (recipe.red * maxConversions),
								green: p.green - (recipe.green * maxConversions),
								blue: p.blue - (recipe.blue * maxConversions),
							}));
							compositeColors.addColorBulk(converter.targetColor! as any, maxConversions);
						} else {
							// Normal mode: individual calls for proper logic
							for (let i = 0; i < maxConversions; i++) {
								compositeColors.mixColor(converter.targetColor as any);
							}
						}
						this.conversionAccumulator[converterId] -= maxConversions;
					}
				}
			}
		});
	}

	// Get all unlocked converters for UI (based on lifetime white pixels only)
	getUnlockedConverters(): AutoConverter[] {
		const converters = get(this.store);

		// Import pixels dynamically to avoid circular dependency
		const pixelsStore = pixels;
		const lifetimeWhite = (get(pixelsStore) as any).lifetimeWhite;
		return Object.values(converters).filter(
			(converter) => lifetimeWhite >= converter.unlockRequirement
		);
	}

	// Reset all converters
	reset(): void {
		this.set({ ...DEFAULT_AUTO_CONVERTERS });
		this.conversionAccumulator = {};
	}

	// Expose update method for external access
	update = this.store.update;
	set = this.store.set;
}

// Create and export the singleton instance
export const autoConverters = new AutoConvertersCurrency();

// Derived stores for UI convenience
export const unlockedConverters = derived(
	[autoConverters],
	([$converters]) => {
		// Import pixels dynamically to avoid circular dependency
		const pixelsStore = pixels;
		const $pixels: any = get(pixelsStore);
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
	[autoConverters],
	() => {
		// Import pixels dynamically to avoid circular dependency
		const pixelsStore = pixels;
		const $pixels: any = get(pixelsStore);
		return $pixels.lifetimeWhite >= 10;
	}
);

// Register with the unified game loop
if (typeof window !== "undefined") {
	import("../../stores/gameLoop").then(({ gameLoop }) => {
		gameLoop.register({
			tick: (deltaTime: number) => autoConverters.tick(deltaTime)
		});
	});
}