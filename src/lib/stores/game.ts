import { writable } from "svelte/store";

export interface GameStats {
	totalClicks: number;
	totalConversions: number;
	startTime: number;
	lastSaveTime: number;
}

function loadGameStats(): GameStats {
	if (typeof window === "undefined") {
		return {
			totalClicks: 0,
			totalConversions: 0,
			startTime: Date.now(),
			lastSaveTime: Date.now(),
		};
	}

	const saved = localStorage.getItem("gameStats");
	if (saved) {
		try {
			return JSON.parse(saved);
		} catch {
			return {
				totalClicks: 0,
				totalConversions: 0,
				startTime: Date.now(),
				lastSaveTime: Date.now(),
			};
		}
	}
	return {
		totalClicks: 0,
		totalConversions: 0,
		startTime: Date.now(),
		lastSaveTime: Date.now(),
	};
}

function createGameStore() {
	const { subscribe, update } = writable<GameStats>(loadGameStats());

	// Auto-save to localStorage
	subscribe((value) => {
		if (typeof window !== "undefined") {
			localStorage.setItem(
				"gameStats",
				JSON.stringify({
					...value,
					lastSaveTime: Date.now(),
				}),
			);
		}
	});

	return {
		subscribe,
		incrementClicks: () => {
			update((stats) => ({
				...stats,
				totalClicks: stats.totalClicks + 1,
			}));
		},
		incrementConversions: () => {
			update((stats) => ({
				...stats,
				totalConversions: stats.totalConversions + 1,
			}));
		},
	};
}

export const gameStats = createGameStore();
