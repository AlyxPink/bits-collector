/**
 * Performance Monitoring Utility
 *
 * Tracks operations per second and provides warnings when budgets are exceeded.
 * Only active in development mode to prevent production overhead.
 */

interface PerformanceBudget {
	ticksPerSecond: number;
	storeUpdatesPerSecond: number;
	derivedRecalcsPerSecond: number;
}

interface PerformanceMetrics {
	ticks: number;
	storeUpdates: number;
	derivedRecalcs: number;
	fps: number;
	lastReset: number;
	expectedTPS?: number; // Expected ticks per second based on performance mode
}

class PerformanceMonitor {
	private enabled: boolean;
	private budget: PerformanceBudget = {
		ticksPerSecond: 10, // Game loop ticks
		storeUpdatesPerSecond: 100, // Store update calls
		derivedRecalcsPerSecond: 500, // Derived store recalculations
	};

	// Current second metrics (accumulating)
	private currentMetrics: PerformanceMetrics = {
		ticks: 0,
		storeUpdates: 0,
		derivedRecalcs: 0,
		fps: 0,
		lastReset: Date.now(),
	};

	// Previous second metrics (stable, for display)
	private displayMetrics: PerformanceMetrics = {
		ticks: 0,
		storeUpdates: 0,
		derivedRecalcs: 0,
		fps: 0,
		lastReset: Date.now(),
	};

	private resetInterval: ReturnType<typeof setInterval> | null = null;
	private fpsFrameCount = 0;
	private fpsLastTime = performance.now();

	constructor() {
		// Only enable in development mode
		this.enabled = import.meta.env.DEV;

		if (this.enabled && typeof window !== "undefined") {
			// Reset metrics every second
			this.resetInterval = setInterval(() => {
				this.checkBudgets();
				this.resetMetrics();
			}, 1000);

			// Track FPS
			this.trackFPS();
		}
	}

	/**
	 * Track a game loop tick
	 */
	trackTick(): void {
		if (!this.enabled) return;
		this.currentMetrics.ticks++;
	}

	/**
	 * Track a store update
	 */
	trackStoreUpdate(): void {
		if (!this.enabled) return;
		this.currentMetrics.storeUpdates++;
	}

	/**
	 * Track a derived store recalculation
	 */
	trackDerivedRecalc(): void {
		if (!this.enabled) return;
		this.currentMetrics.derivedRecalcs++;
	}

	/**
	 * Get current performance metrics (stable display from previous second)
	 */
	getMetrics(): Readonly<PerformanceMetrics> {
		return { ...this.displayMetrics };
	}

	/**
	 * Get performance budget
	 */
	getBudget(): Readonly<PerformanceBudget> {
		return { ...this.budget };
	}

	/**
	 * Update performance budget
	 */
	setBudget(budget: Partial<PerformanceBudget>): void {
		this.budget = { ...this.budget, ...budget };
	}

	/**
	 * Get expected TPS based on current performance mode
	 */
	private getExpectedTPS(): number {
		// Get current performance mode from game loop
		const gameLoopState = (window as any).__gameLoopState;
		if (gameLoopState?.currentTickInterval) {
			return Math.round(1000 / gameLoopState.currentTickInterval);
		}
		return 10; // Default to normal mode
	}

	/**
	 * Check if any budgets are exceeded and log warnings
	 */
	private checkBudgets(): void {
		const { ticks, storeUpdates, derivedRecalcs } = this.currentMetrics;
		const { storeUpdatesPerSecond, derivedRecalcsPerSecond } = this.budget;

		// Use dynamic TPS budget based on performance mode
		const expectedTPS = this.getExpectedTPS();

		if (ticks > expectedTPS + 1) { // Allow +1 tolerance for timing jitter
			console.warn(
				`⚠️ Performance: Ticks exceeded budget (${ticks}/${expectedTPS} per second)`
			);
		}

		if (storeUpdates > storeUpdatesPerSecond) {
			console.warn(
				`⚠️ Performance: Store updates exceeded budget (${storeUpdates}/${storeUpdatesPerSecond} per second)`
			);
		}

		if (derivedRecalcs > derivedRecalcsPerSecond) {
			console.warn(
				`⚠️ Performance: Derived recalculations exceeded budget (${derivedRecalcs}/${derivedRecalcsPerSecond} per second)`
			);
		}
	}

	/**
	 * Reset metrics for the next second
	 */
	private resetMetrics(): void {
		const expectedTPS = this.getExpectedTPS();

		// Move current metrics to display (what users see)
		this.displayMetrics = {
			ticks: this.currentMetrics.ticks,
			storeUpdates: this.currentMetrics.storeUpdates,
			derivedRecalcs: this.currentMetrics.derivedRecalcs,
			fps: this.currentMetrics.fps,
			lastReset: Date.now(),
			expectedTPS,
		};

		// Reset current metrics for new second
		this.currentMetrics = {
			ticks: 0,
			storeUpdates: 0,
			derivedRecalcs: 0,
			fps: this.currentMetrics.fps, // Keep FPS
			lastReset: Date.now(),
			expectedTPS,
		};
	}

	/**
	 * Track FPS using requestAnimationFrame
	 */
	private trackFPS(): void {
		const updateFPS = () => {
			this.fpsFrameCount++;
			const currentTime = performance.now();
			const elapsed = currentTime - this.fpsLastTime;

			// Update FPS every 500ms
			if (elapsed >= 500) {
				const fps = Math.round((this.fpsFrameCount / elapsed) * 1000);
				this.currentMetrics.fps = fps;
				this.displayMetrics.fps = fps;
				this.fpsFrameCount = 0;
				this.fpsLastTime = currentTime;
			}

			requestAnimationFrame(updateFPS);
		};

		requestAnimationFrame(updateFPS);
	}

	/**
	 * Clean up monitoring
	 */
	destroy(): void {
		if (this.resetInterval) {
			clearInterval(this.resetInterval);
			this.resetInterval = null;
		}
	}
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
