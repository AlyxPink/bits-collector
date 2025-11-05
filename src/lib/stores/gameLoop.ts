import { writable, get } from "svelte/store";
import { TICK_INTERVAL, PERFORMANCE_MODE } from "$lib/config/gameConfig";
import { performanceMonitor } from "$lib/utils/performanceMonitor";

export type PerformanceModeType = "normal" | "medium" | "high" | "extreme" | "emergency";

export interface GameLoopState {
	lastTick: number;
	isRunning: boolean;
	deltaTime: number; // Current frame delta in seconds
	currentTickInterval: number; // Current adaptive tick interval
	performanceMode: PerformanceModeType; // Current performance mode
	productionRate: number; // Current total production rate (bits/sec)
}

export interface GameSystem {
	tick(deltaTime: number): void;
}

// Calculate expected production rate from saved upgrades (pre-flight check)
function calculateInitialProductionRate(): { rate: number; mode: PerformanceModeType; interval: number } {
	if (typeof window === "undefined") {
		return { rate: 0, mode: "normal", interval: TICK_INTERVAL };
	}

	try {
		// Load saved upgrades to calculate expected production
		const savedUpgrades = localStorage.getItem("upgrades");
		if (!savedUpgrades) {
			return { rate: 0, mode: "normal", interval: TICK_INTERVAL };
		}

		const upgrades = JSON.parse(savedUpgrades);

		// Calculate total theoretical production (simplified version of getTotalTheoreticalProduction)
		let totalProduction = 0;

		// Calculate powerup multiplier
		let powerupMultiplier = 1;
		if (upgrades.powerups) {
			Object.values(upgrades.powerups).forEach((powerup: any) => {
				if (powerup.level > 0) {
					powerupMultiplier *= Math.pow(powerup.multiplier, powerup.level);
				}
			});
		}

		// Sum generator production
		if (upgrades.generators) {
			Object.values(upgrades.generators).forEach((generator: any) => {
				if (generator.owned && generator.level > 0) {
					const baseRate = generator.baseRate * generator.level;
					totalProduction += baseRate * powerupMultiplier;
				}
			});
		}

		// Determine appropriate starting mode
		let mode: PerformanceModeType = "normal";
		let interval = TICK_INTERVAL;

		if (totalProduction >= PERFORMANCE_MODE.productionThresholds.extreme) {
			mode = "extreme";
			interval = PERFORMANCE_MODE.tickIntervals.extreme;
		} else if (totalProduction >= PERFORMANCE_MODE.productionThresholds.high) {
			mode = "high";
			interval = PERFORMANCE_MODE.tickIntervals.high;
		} else if (totalProduction >= PERFORMANCE_MODE.productionThresholds.medium) {
			mode = "medium";
			interval = PERFORMANCE_MODE.tickIntervals.medium;
		}

		console.log(`🚀 Pre-flight check: Expected production ${totalProduction.toFixed(0)} bits/sec → Starting in ${mode} mode (${interval}ms ticks)`);

		return { rate: totalProduction, mode, interval };
	} catch (error) {
		console.error("Error calculating initial production rate:", error);
		return { rate: 0, mode: "normal", interval: TICK_INTERVAL };
	}
}

// Load game loop state from localStorage
function loadGameLoopState(): GameLoopState {
	const initialState = calculateInitialProductionRate();

	if (typeof window === "undefined") {
		return {
			lastTick: Date.now(),
			isRunning: false,
			deltaTime: 0,
			currentTickInterval: TICK_INTERVAL,
			performanceMode: "normal",
			productionRate: 0,
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
				currentTickInterval: initialState.interval,
				performanceMode: initialState.mode,
				productionRate: initialState.rate,
			};
		} catch {
			return {
				lastTick: Date.now(),
				isRunning: false,
				deltaTime: 0,
				currentTickInterval: initialState.interval,
				performanceMode: initialState.mode,
				productionRate: initialState.rate,
			};
		}
	}

	return {
		lastTick: Date.now(),
		isRunning: false,
		deltaTime: 0,
		currentTickInterval: initialState.interval,
		performanceMode: initialState.mode,
		productionRate: initialState.rate,
	};
}

function createGameLoopStore() {
	const store = writable<GameLoopState>(loadGameLoopState());
	const { subscribe, update, set } = store;

	// Save to localStorage when state changes and expose to window for other modules
	subscribe((value) => {
		if (typeof window !== "undefined") {
			localStorage.setItem("gameLoop", JSON.stringify({
				lastTick: value.lastTick,
				// Don't save isRunning or deltaTime
			}));

			// Expose current state to window for performance mode access
			(window as any).__gameLoopState = {
				performanceMode: value.performanceMode,
				currentTickInterval: value.currentTickInterval,
				productionRate: value.productionRate,
			};
		}
	});

	let intervalId: ReturnType<typeof setInterval> | null = null;
	const registeredSystems = new Set<GameSystem>();
	let lowFpsStartTime: number | null = null;

	// Determine performance mode based on production rate and FPS
	const determinePerformanceMode = (productionRate: number, currentFps: number): PerformanceModeType => {
		// Check for emergency mode first (low FPS)
		const fpsMetrics = performanceMonitor.getMetrics();
		if (fpsMetrics.fps > 0 && fpsMetrics.fps < PERFORMANCE_MODE.emergency.fpsThreshold) {
			if (lowFpsStartTime === null) {
				lowFpsStartTime = Date.now();
			} else if (Date.now() - lowFpsStartTime > PERFORMANCE_MODE.emergency.activationDelay) {
				return "emergency";
			}
		} else {
			lowFpsStartTime = null;
		}

		// Determine mode based on production rate
		if (productionRate >= PERFORMANCE_MODE.productionThresholds.extreme) {
			return "extreme";
		} else if (productionRate >= PERFORMANCE_MODE.productionThresholds.high) {
			return "high";
		} else if (productionRate >= PERFORMANCE_MODE.productionThresholds.medium) {
			return "medium";
		}
		return "normal";
	};

	// Get tick interval for current performance mode
	const getTickIntervalForMode = (mode: PerformanceModeType): number => {
		if (mode === "emergency") {
			return PERFORMANCE_MODE.emergency.extremeTickInterval;
		}
		return PERFORMANCE_MODE.tickIntervals[mode] || TICK_INTERVAL;
	};

	// Restart the loop with a new interval
	const restartLoop = (newInterval: number) => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		startLoop(newInterval);
	};

	// Main loop tick function
	const processTick = () => {
		try {
			// Track tick for performance monitoring
			performanceMonitor.trackTick();

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

				// After processing, check if we need to adjust performance mode
				const newMode = determinePerformanceMode(state.productionRate, performanceMonitor.getMetrics().fps);
				const newInterval = getTickIntervalForMode(newMode);

				// If mode changed, restart loop with new interval
				if (newMode !== state.performanceMode || newInterval !== state.currentTickInterval) {
					console.log(`⚡ Performance mode: ${state.performanceMode} → ${newMode} (${state.currentTickInterval}ms → ${newInterval}ms, ${state.productionRate.toFixed(0)} bits/sec)`);
					restartLoop(newInterval);
				}

				return {
					...state,
					lastTick: now,
					deltaTime: deltaTimeSeconds,
					performanceMode: newMode,
					currentTickInterval: newInterval,
				};
			});
		} catch (error) {
			console.error("Critical error in game loop:", error);
		}
	};

	// Start loop with specific interval
	const startLoop = (interval: number) => {
		if (intervalId) return; // Already running
		intervalId = setInterval(processTick, interval);
	};

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

		// Update production rate (called by upgrades system)
		updateProductionRate: (rate: number) => {
			update((state) => ({
				...state,
				productionRate: rate,
			}));
		},

		// Start the unified game loop
		start: () => {
			if (intervalId) return; // Already running

			update((state) => ({ ...state, isRunning: true, lastTick: Date.now() }));
			const currentState = get(store);
			startLoop(currentState.currentTickInterval);
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
			const currentState = get(store);
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