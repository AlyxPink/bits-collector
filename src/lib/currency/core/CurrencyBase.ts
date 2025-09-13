/**
 * Currency Base Classes
 *
 * Abstract base classes and utilities for the unified currency system.
 * Eliminates localStorage, reset, and subscription boilerplate across all stores.
 */

import { writable, type Writable } from "svelte/store";
import type {
	CurrencyConfig,
	CurrencyStore,
	ICurrency,
	CurrencyType
} from "./interfaces";

// ============================================================================
// Storage Persistence Utility
// ============================================================================

/**
 * Handles localStorage persistence for any currency type
 */
export class StoragePersistence<T> {
	private readonly storageKey: string;
	private readonly defaultState: T;

	constructor(storageKey: string, defaultState: T) {
		this.storageKey = storageKey;
		this.defaultState = defaultState;
	}

	/**
	 * Load state from localStorage with fallback to default
	 */
	load(): T {
		if (typeof window === "undefined") {
			return { ...this.defaultState };
		}

		const saved = localStorage.getItem(this.storageKey);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				// Merge with default state to handle missing properties
				return { ...this.defaultState, ...parsed };
			} catch (error) {
				console.warn(`Failed to parse saved state for ${this.storageKey}:`, error);
				return { ...this.defaultState };
			}
		}

		return { ...this.defaultState };
	}

	/**
	 * Save state to localStorage
	 */
	save(state: T): void {
		if (typeof window === "undefined") {
			return;
		}

		try {
			localStorage.setItem(this.storageKey, JSON.stringify(state));
		} catch (error) {
			console.error(`Failed to save state for ${this.storageKey}:`, error);
		}
	}

	/**
	 * Clear state from localStorage
	 */
	clear(): void {
		if (typeof window === "undefined") {
			return;
		}

		localStorage.removeItem(this.storageKey);
	}
}

// ============================================================================
// Abstract Currency Base Class
// ============================================================================

/**
 * Abstract base class for all currency stores
 * Provides common localStorage, reset, and subscription patterns
 */
export abstract class CurrencyBase<T> implements ICurrency {
	protected readonly config: CurrencyConfig<T>;
	protected readonly persistence: StoragePersistence<T>;
	protected readonly store: Writable<T>;

	// ICurrency implementation
	public readonly id: string;
	public readonly type: CurrencyType;
	public readonly displayName: string;

	constructor(config: CurrencyConfig<T>) {
		this.config = config;
		this.id = config.id;
		this.type = config.type;
		this.displayName = config.displayName;

		// Initialize persistence
		this.persistence = new StoragePersistence(config.storageKey, config.defaultState);

		// Load initial state and create store
		const initialState = this.persistence.load();
		this.store = writable<T>(initialState);

		// Setup auto-save if persistence is enabled
		if (config.persistence !== false) {
			this.setupAutoSave();
		}
	}

	/**
	 * Setup automatic saving to localStorage on state changes
	 */
	private setupAutoSave(): void {
		this.store.subscribe((state) => {
			this.persistence.save(state);
		});
	}

	// ============================================================================
	// Standard Svelte Store Interface
	// ============================================================================

	subscribe = (callback: (value: T) => void) => this.store.subscribe(callback);

	protected set = (value: T) => this.store.set(value);

	protected update = (updater: (value: T) => T) => this.store.update(updater);

	// ============================================================================
	// Currency-Specific Methods (Override as needed)
	// ============================================================================

	/**
	 * Reset currency to default state
	 */
	reset(): void {
		this.set({ ...this.config.defaultState });
	}

	/**
	 * Manually save current state
	 */
	save(): void {
		this.store.subscribe((state) => {
			this.persistence.save(state);
		})();
	}

	/**
	 * Manually load state from storage
	 */
	load(): T {
		const state = this.persistence.load();
		this.set(state);
		return state;
	}

	/**
	 * Get current configuration
	 */
	getConfig(): CurrencyConfig<T> {
		return { ...this.config };
	}

	/**
	 * Get current state (use sparingly - prefer reactive subscriptions)
	 */
	protected getCurrentState(): T {
		let current: T;
		this.store.subscribe((state) => {
			current = state;
		})();
		return current!;
	}
}

// ============================================================================
// Currency Store Factory
// ============================================================================

/**
 * Factory function to create standardized currency stores
 * Wraps CurrencyBase with full CurrencyStore interface
 */
export function createCurrencyStore<T>(
	config: CurrencyConfig<T>,
	implementation: new (config: CurrencyConfig<T>) => CurrencyBase<T>
): CurrencyStore<T> {
	const currencyInstance = new implementation(config);

	return {
		// Svelte store interface
		subscribe: currencyInstance.subscribe,
		set: currencyInstance["set"], // Access protected method
		update: currencyInstance["update"], // Access protected method

		// Currency interface
		reset: () => currencyInstance.reset(),
		save: () => currencyInstance.save(),
		load: () => currencyInstance.load(),
		getConfig: () => currencyInstance.getConfig(),
	};
}

// ============================================================================
// Mixin Classes for Common Behaviors
// ============================================================================

/**
 * Mixin for currencies with simple amount tracking
 */
export abstract class HasAmountMixin<T extends { amount: number }> extends CurrencyBase<T> {
	get amount(): number {
		return this.getCurrentState().amount;
	}

	add(amount: number): void {
		if (amount <= 0) return;
		this.update((state) => ({
			...state,
			amount: state.amount + amount,
		}));
	}

	canAfford(cost: number): boolean {
		return this.amount >= cost;
	}

	spend(amount: number): boolean {
		if (!this.canAfford(amount)) {
			return false;
		}

		this.update((state) => ({
			...state,
			amount: state.amount - amount,
		}));
		return true;
	}
}

/**
 * Mixin for currencies with lifetime tracking
 */
export abstract class HasLifetimeTrackingMixin<
	T extends { lifetimeTotal: number; bestAmount: number; amount: number }
> extends HasAmountMixin<T> {
	get lifetimeTotal(): number {
		return this.getCurrentState().lifetimeTotal;
	}

	get bestAmount(): number {
		return this.getCurrentState().bestAmount;
	}

	add(amount: number): void {
		if (amount <= 0) return;
		this.update((state) => {
			const newAmount = state.amount + amount;
			return {
				...state,
				amount: newAmount,
				lifetimeTotal: state.lifetimeTotal + amount,
				bestAmount: Math.max(state.bestAmount, newAmount),
			};
		});
	}

	addToLifetime(amount: number): void {
		if (amount <= 0) return;
		this.update((state) => ({
			...state,
			lifetimeTotal: state.lifetimeTotal + amount,
		}));
	}
}