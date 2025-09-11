import { writable, get } from "svelte/store";
import { TICK_INTERVAL } from "$lib/config/gameConfig";

export interface GameLoopState {
	lastTick: number;
	isRunning: boolean;
	deltaTime: number; // Current frame delta in seconds
}

export interface GameSystem {
	tick(deltaTime: number): void;
}

// Load game loop state from localStorage
function loadGameLoopState(): GameLoopState {
	if (typeof window === "undefined") {
		return {
			lastTick: Date.now(),
			isRunning: false,
			deltaTime: 0,
		};
	}

	const saved = localStorage.getItem("gameLoop");
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			return {
				lastTick: parsed.lastTick || Date.now(),
				isRunning: false, // Always start as not running on load
				deltaTime: 0,
			};
		} catch {
			return {
				lastTick: Date.now(),
				isRunning: false,
				deltaTime: 0,
			};
		}
	}

	return {
		lastTick: Date.now(),
		isRunning: false,
		deltaTime: 0,
	};
}

function createGameLoopStore() {
	const { subscribe, update, set } = writable<GameLoopState>(loadGameLoopState());

	// Save to localStorage when state changes
	subscribe((value) => {
		if (typeof window !== "undefined") {
			localStorage.setItem("gameLoop", JSON.stringify({
				lastTick: value.lastTick,
				// Don't save isRunning or deltaTime
			}));
		}
	});

	let intervalId: number | null = null;
	const registeredSystems = new Set<GameSystem>();

	return {
		subscribe,

		// Register a system to receive tick updates
		register: (system: GameSystem) => {
			registeredSystems.add(system);
		},

		// Unregister a system from receiving tick updates
		unregister: (system: GameSystem) => {
			registeredSystems.delete(system);
		},

		// Start the unified game loop
		start: () => {
			if (intervalId) return; // Already running

			update((state) => ({ ...state, isRunning: true, lastTick: Date.now() }));

			intervalId = setInterval(() => {
				try {
					const now = Date.now();
					
					update((state) => {
						const deltaTimeMs = now - state.lastTick;
						const deltaTimeSeconds = deltaTimeMs / 1000;

						// Process all registered systems
						registeredSystems.forEach((system) => {
							try {
								system.tick(deltaTimeSeconds);
							} catch (error) {
								console.error("Error in game system tick:", error);
								// Continue processing other systems
							}
						});

						return {
							...state,
							lastTick: now,
							deltaTime: deltaTimeSeconds,
						};
					});
				} catch (error) {
					console.error("Critical error in game loop:", error);
					// Consider stopping the loop on critical errors
				}
			}, TICK_INTERVAL);
		},

		// Stop the game loop
		stop: () => {
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
			update((state) => ({ ...state, isRunning: false }));
		},

		// Get current delta time for external use
		getCurrentDelta: () => {
			const currentState = get({ subscribe });
			return currentState.deltaTime;
		},

		// Manual tick for testing
		tick: () => {
			const now = Date.now();
			update((state) => {
				const deltaTimeMs = now - state.lastTick;
				const deltaTimeSeconds = deltaTimeMs / 1000;

				return {
					...state,
					lastTick: now,
					deltaTime: deltaTimeSeconds,
				};
			});
		},

		// Reset timing (useful for testing offline catchup)
		resetTiming: () => {
			update((state) => ({
				...state,
				lastTick: Date.now(),
			}));
		},
	};
}

export const gameLoop = createGameLoopStore();