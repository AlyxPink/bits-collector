import { writable, get } from "svelte/store";
import { LUX_DISPLAY_INTERVAL } from "$lib/config/gameConfig";

export interface LuxState {
	total: number;
	displayTotal: number; // For smooth visual updates
	lifetimeLux: number;
	lastUpdate: number;
	lastDisplayTick: number;
	prestigeLevel: number; // Number of resets performed
	bestLux: number; // Highest Lux ever reached in a single run
	totalLumenEarned: number; // Total Lumen earned from prestiges
}

// Format lux numbers for display  
export function formatLux(num: number): string {
	if (num < 1000) return num.toFixed(2);
	if (num < 1000000) return (num / 1000).toFixed(2) + "K";
	if (num < 1000000000) return (num / 1000000).toFixed(2) + "M";
	if (num < 1000000000000) return (num / 1000000000).toFixed(2) + "B";
	if (num < 1e15) return (num / 1e12).toFixed(2) + "T";
	if (num < 1e18) return (num / 1e15).toFixed(2) + "Qa";
	if (num < 1e21) return (num / 1e18).toFixed(2) + "Qi";
	// Use scientific notation for truly absurd numbers
	return num.toExponential(2);
}

// The absurd winning goal - like Prestige Tree's endgame
export const WINNING_GOAL = 1.79e308; // Near JavaScript's max number

// Load saved state from localStorage
function loadLuxState(): LuxState {
	const now = Date.now();
	const defaultState: LuxState = {
		total: 10,
		displayTotal: 10,
		lifetimeLux: 10,
		lastUpdate: now,
		lastDisplayTick: now,
		prestigeLevel: 0,
		bestLux: 10,
		totalLumenEarned: 0,
	};

	if (typeof window === "undefined") {
		return defaultState;
	}

	const saved = localStorage.getItem("luxState");
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			return {
				total: parsed.total ?? 10,
				displayTotal: parsed.total ?? 10, // Sync display with actual on load
				lifetimeLux: parsed.lifetimeLux ?? 10,
				lastUpdate: parsed.lastUpdate ?? now,
				lastDisplayTick: now, // Always start fresh for display updates
				prestigeLevel: parsed.prestigeLevel ?? 0,
				bestLux: parsed.bestLux ?? 10,
				totalLumenEarned: parsed.totalLumenEarned ?? 0,
			};
		} catch {
			return defaultState;
		}
	}

	return defaultState;
}

// Create the lux store
function createLuxStore() {
	const initialState = loadLuxState();
	const { subscribe, update, set } = writable(initialState);

	// Auto-save to localStorage
	subscribe((value) => {
		if (typeof window !== "undefined") {
			localStorage.setItem("luxState", JSON.stringify(value));
		}
	});

	// Start display update ticker for smooth visual feedback
	let displayUpdateInterval: ReturnType<typeof setInterval> | null = null;
	if (typeof window !== "undefined") {
		displayUpdateInterval = setInterval(() => {
			updateDisplayValue();
		}, LUX_DISPLAY_INTERVAL);
	}

	// Update display value by interpolating towards actual value
	function updateDisplayValue() {
		update((state) => {
			const now = Date.now();
			const displayDelta = (now - state.lastDisplayTick) / 1000;
			
			// Interpolate display value towards actual value
			const targetDisplayTotal = state.total;
			
			// If display is significantly different from actual, catch up gradually
			let newDisplayTotal = state.displayTotal;
			if (Math.abs(targetDisplayTotal - state.displayTotal) > 0.01) {
				// Lerp towards target with smooth animation
				const lerpSpeed = 3.0; // Adjust to control catch-up speed
				newDisplayTotal = state.displayTotal + (targetDisplayTotal - state.displayTotal) * displayDelta * lerpSpeed;
			} else {
				// Very close to target, just set it directly
				newDisplayTotal = targetDisplayTotal;
			}

			return {
				...state,
				displayTotal: Math.max(0, newDisplayTotal),
				lastDisplayTick: now,
			};
		});
	}

	return {
		subscribe,
		update,
		set,

		// Add lux to the total
		addLux: (amount: number) => {
			if (amount <= 0) return;
			update((state) => {
				const newTotal = state.total + amount;
				return {
					...state,
					total: newTotal,
					lifetimeLux: state.lifetimeLux + amount,
					lastUpdate: Date.now(),
					// Update best Lux if we reached a new high
					bestLux: Math.max(state.bestLux, newTotal),
				};
			});
		},

		// Spend lux (returns false if insufficient funds)
		spendLux: (amount: number): boolean => {
			const state = get({ subscribe });
			if (state.total < amount) return false;
			
			update((state) => ({
				...state,
				total: state.total - amount,
				lastUpdate: Date.now(),
			}));
			return true;
		},

		// Check if player can afford something
		canAfford: (amount: number): boolean => {
			const state = get({ subscribe });
			return state.total >= amount;
		},

		// Get display intensity for styling (0-1 based on lux amount)
		getDisplayIntensity: (): number => {
			const state = get({ subscribe });
			// Logarithmic scaling for smooth visual progression
			return Math.min(1, Math.log10(state.total + 1) / 8);
		},

		// Get prestige level based on lifetime lux
		getPrestigeLevel: (): number => {
			const state = get({ subscribe });
			if (state.lifetimeLux < 1000) return 0;
			return Math.floor(Math.log10(state.lifetimeLux / 1000)) + 1;
		},

		// Prestige/Reset methods
		getCurrentPrestigeLevel: (): number => {
			const state = get({ subscribe });
			// Find which threshold we've reached based on current Lux
			// Thresholds: 10, 40, 90, 160, 250... (formula: 10 * n²)
			// Solving for n: n = sqrt(luxAmount / 10)
			if (state.total < 10) return 0;
			return Math.floor(Math.sqrt(state.total / 10));
		},

		getLumenReward: (): number => {
			const state = get({ subscribe });
			// Calculate prestige level directly: n = sqrt(luxAmount / 10)
			if (state.total < 10) return 0;
			const prestigeLevel = Math.floor(Math.sqrt(state.total / 10));
			return Math.max(0, prestigeLevel);
		},

		getNextThreshold: (): { lux: number; reward: number } => {
			const state = get({ subscribe });
			// Calculate current prestige level directly: n = sqrt(luxAmount / 10)
			let currentLevel = 0;
			if (state.total >= 10) {
				currentLevel = Math.floor(Math.sqrt(state.total / 10));
			}
			const nextLevel = currentLevel + 1;
			const nextThreshold = 10 * Math.pow(nextLevel, 2);
			return { lux: nextThreshold, reward: nextLevel };
		},

		canPrestige: (): boolean => {
			const state = get({ subscribe });
			return state.total >= 10; // Can always reset at 10+ Lux
		},

		performPrestige: (): boolean => {
			const state = get({ subscribe });
			if (state.total < 10) return false; // Check prestige requirement directly

			// Calculate lumen reward directly
			const prestigeLevel = Math.floor(Math.sqrt(state.total / 10));
			const lumenGained = Math.max(0, prestigeLevel);
			if (lumenGained <= 0) return false; // Should not happen, but safety check

			update((current) => ({
				...current,
				total: 0, // Reset Lux to 0
				displayTotal: 0, // Reset display to match
				prestigeLevel: current.prestigeLevel + 1, // Track total resets for statistics
				totalLumenEarned: current.totalLumenEarned + lumenGained,
				lastUpdate: Date.now(),
				// Keep lifetime stats
				lifetimeLux: current.lifetimeLux,
				bestLux: current.bestLux,
			}));

			// Add Lumen to the lumen store
			import("./lumen").then(({ lumen }) => {
				lumen.addLumen(lumenGained);
			});

			return true;
		},

		// Reset the store (for game reset, not prestige)
		reset: () => {
			const now = Date.now();
			set({
				total: 10,
				displayTotal: 10,
				lifetimeLux: 10,
				lastUpdate: now,
				lastDisplayTick: now,
				prestigeLevel: 0,
				bestLux: 10,
				totalLumenEarned: 0,
			});
		},
	};
}

export const lux = createLuxStore();