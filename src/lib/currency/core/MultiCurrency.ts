/**
 * Multi-Currency Base Implementation
 *
 * Handles stores that manage multiple related currencies with conversion mechanics,
 * like pixels (RGB → White) and complex interdependencies.
 */

import { writable, derived, get, type Writable } from "svelte/store";
import type { ICurrency, CurrencyConfig, CurrencyType } from "./interfaces";
import { PERFORMANCE_MODE } from "$lib/config/gameConfig";

export interface MultiCurrencyConfig<T> extends CurrencyConfig<T> {
	// Optional conversion mechanics
	conversions?: {
		[key: string]: {
			inputs: string[];
			output: string;
			calculateCost?: (state: T, ...args: any[]) => any;
			calculateEfficiency?: (state: T, ...args: any[]) => number;
			convert?: (state: T, ...args: any[]) => T;
		}
	};
}

export abstract class MultiCurrencyBase<T> implements ICurrency {
	protected store: Writable<T>;
	protected config: MultiCurrencyConfig<T>;
	subscribe: (callback: (value: T) => void) => () => void;
	private saveTimeout: ReturnType<typeof setTimeout> | null = null;
	private pendingState: T | null = null;

	// Throttled save state
	private pendingSave: T | null = null;
	private saveTimeoutId: ReturnType<typeof setTimeout> | null = null;
	private lastSaveTime = 0;

	constructor(config: MultiCurrencyConfig<T>) {
		this.config = config;
		this.store = writable<T>(this.loadState());
		this.subscribe = this.store.subscribe;

		// Auto-save on changes if persistence enabled (with throttling)
		if (config.persistence) {
			this.store.subscribe((value) => {
				if (typeof window !== "undefined") {
					this.scheduleSave(value);
				}
			});
		}
	}

	// Throttled save with adaptive intervals based on performance mode
	private scheduleSave(value: T): void {
		this.pendingSave = value;

		// Get current performance mode from game loop if available
		const getCurrentPerformanceMode = (): "normal" | "medium" | "high" | "extreme" | "emergency" => {
			try {
				// Dynamically import to avoid circular dependencies
				const gameLoopModule = (window as any).__gameLoopState;
				if (gameLoopModule?.performanceMode) {
					return gameLoopModule.performanceMode;
				}
			} catch {
				// If game loop not available, fall back to checking production rate
			}
			return "normal";
		};

		const mode = getCurrentPerformanceMode();

		// Map performance mode to save throttle key
		const throttleKey = mode === "emergency" ? "extremeInterval" :
		                     mode === "extreme" ? "extremeInterval" :
		                     mode === "high" ? "highInterval" :
		                     mode === "medium" ? "mediumInterval" :
		                     "normalInterval";

		const throttleInterval = PERFORMANCE_MODE.saveThrottle[throttleKey];

		// If no throttling (normal mode) or enough time has passed, save immediately
		const now = Date.now();
		if (throttleInterval === 0 || (now - this.lastSaveTime) >= throttleInterval) {
			this.executeSave();
			return;
		}

		// Otherwise, schedule a throttled save
		if (this.saveTimeoutId === null) {
			const delay = throttleInterval - (now - this.lastSaveTime);
			this.saveTimeoutId = setTimeout(() => {
				this.executeSave();
			}, Math.max(0, delay));
		}
	}

	private executeSave(): void {
		if (this.pendingSave !== null) {
			localStorage.setItem(this.config.storageKey, JSON.stringify(this.pendingSave));
			this.pendingSave = null;
			this.lastSaveTime = Date.now();
		}
		if (this.saveTimeoutId !== null) {
			clearTimeout(this.saveTimeoutId);
			this.saveTimeoutId = null;
		}
	}

	// Core ICurrency implementation
	get id(): string { return this.config.id; }
	get type(): CurrencyType { return this.config.type; }
	get displayName(): string { return this.config.displayName; }

	// State management
	protected loadState(): T {
		if (typeof window === "undefined" || !this.config.persistence) {
			return this.config.defaultState;
		}

		const saved = localStorage.getItem(this.config.storageKey);
		if (saved) {
			try {
				return JSON.parse(saved);
			} catch {
				return this.config.defaultState;
			}
		}
		return this.config.defaultState;
	}

	save(): void {
		if (typeof window !== "undefined" && this.config.persistence) {
			// Clear any pending debounced save
			if (this.saveTimeout) {
				clearTimeout(this.saveTimeout);
				this.saveTimeout = null;
			}

			// Immediately save current state
			const state = this.pendingState || get(this.store);
			localStorage.setItem(this.config.storageKey, JSON.stringify(state));
			this.pendingState = null;
		}
	}

	load(): T {
		const newState = this.loadState();
		this.store.set(newState);
		return newState;
	}

	reset(): void {
		this.store.set(this.config.defaultState);
	}

	// Utility methods for subclasses
	protected getState(): T {
		return get(this.store);
	}

	protected updateState(updater: (state: T) => T): void {
		this.store.update(updater);
	}

	protected setState(newState: T): void {
		this.store.set(newState);
	}

	// Expose the update method for compatibility with existing code
	update(updater: (state: T) => T): void {
		this.store.update(updater);
	}

	// Abstract methods for subclasses to implement
	abstract getAmount(currency?: string): number;
	abstract addAmount(amount: number, currency?: string): void;
	abstract spendAmount(amount: number, currency?: string): boolean;
	abstract canAfford(amount: number, currency?: string): boolean;
}

// Helper to create derived stores for multi-currencies
export function createMultiCurrencyDerived<T, R>(
	currency: MultiCurrencyBase<T>,
	selector: (state: T) => R
) {
	return derived(currency, selector);
}