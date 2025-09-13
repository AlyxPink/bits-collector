/**
 * Multi-Currency Base Implementation
 *
 * Handles stores that manage multiple related currencies with conversion mechanics,
 * like pixels (RGB → White) and complex interdependencies.
 */

import { writable, derived, get, type Writable } from "svelte/store";
import type { ICurrency, CurrencyConfig, CurrencyType } from "./interfaces";

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

	constructor(config: MultiCurrencyConfig<T>) {
		this.config = config;
		this.store = writable<T>(this.loadState());
		this.subscribe = this.store.subscribe;

		// Auto-save on changes if persistence enabled
		if (config.persistence) {
			this.store.subscribe((value) => {
				if (typeof window !== "undefined") {
					localStorage.setItem(config.storageKey, JSON.stringify(value));
				}
			});
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
			const state = get(this.store);
			localStorage.setItem(this.config.storageKey, JSON.stringify(state));
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