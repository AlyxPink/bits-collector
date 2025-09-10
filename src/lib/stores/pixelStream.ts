import { writable, get } from "svelte/store";

export interface StreamPixel {
	id: string;
	color: "red" | "green" | "blue";
	createdAt: number;
	x: number;
	y: number;
	opacity: number;
	intensity: number; // Represents how many pixels this one represents
}

export interface PixelStreamState {
	pixels: StreamPixel[];
	nextId: number;
	generationRate: number; // Pixels per second for dynamic sizing
	lastRateUpdate: number;
}

let MATRIX_WIDTH = 30; // Dynamic width, will be updated by component
let MATRIX_HEIGHT = 10; // Dynamic height based on generation rate
const PIXEL_LIFETIME = 3000; // 3 seconds in milliseconds

// Performance thresholds for sampling
const SAMPLING_THRESHOLDS = {
	LOW: 100,    // < 100/sec: show all pixels
	MEDIUM: 1000, // 100-1000/sec: sample 20%
	HIGH: Infinity // > 1000/sec: sample 5%
};

const MATRIX_HEIGHT_THRESHOLDS = {
	SMALL: { rate: 100, height: 8 },
	MEDIUM: { rate: 500, height: 12 },
	LARGE: { rate: 1000, height: 15 },
	MAX: { rate: Infinity, height: 15 }
};

function createPixelStreamStore() {
	const { subscribe, update } = writable<PixelStreamState>({
		pixels: [],
		nextId: 0,
		generationRate: 0,
		lastRateUpdate: Date.now(),
	});

	return {
		subscribe,

		// Add new pixels to the stream with smart sampling
		addPixels: (colors: ("red" | "green" | "blue")[]) => {
			const now = Date.now();

			update((state) => {
				// Update generation rate
				const deltaTime = now - state.lastRateUpdate;
				if (deltaTime > 1000) {
					// Update rate every second
					const recentPixels = state.pixels.filter(p => now - p.createdAt < 1000);
					const newRate = recentPixels.length;
					state.generationRate = newRate;
					state.lastRateUpdate = now;

					// Update matrix height based on generation rate
					if (newRate < MATRIX_HEIGHT_THRESHOLDS.SMALL.rate) {
						MATRIX_HEIGHT = MATRIX_HEIGHT_THRESHOLDS.SMALL.height;
					} else if (newRate < MATRIX_HEIGHT_THRESHOLDS.MEDIUM.rate) {
						MATRIX_HEIGHT = MATRIX_HEIGHT_THRESHOLDS.MEDIUM.height;
					} else {
						MATRIX_HEIGHT = MATRIX_HEIGHT_THRESHOLDS.LARGE.height;
					}
				}

				// Determine sampling strategy based on current generation rate
				let samplingRate = 1.0;
				let intensityMultiplier = 1;

				if (state.generationRate > SAMPLING_THRESHOLDS.HIGH) {
					samplingRate = 0.05; // Show 5% of pixels
					intensityMultiplier = 20;
				} else if (state.generationRate > SAMPLING_THRESHOLDS.MEDIUM) {
					samplingRate = 0.1; // Show 10% of pixels
					intensityMultiplier = 10;
				} else if (state.generationRate > SAMPLING_THRESHOLDS.LOW) {
					samplingRate = 0.2; // Show 20% of pixels
					intensityMultiplier = 5;
				}

				// Sample pixels to add
				const pixelsToAdd = Math.ceil(colors.length * samplingRate);
				const sampledColors = colors.slice(0, pixelsToAdd);

				const newPixels: StreamPixel[] = [];

				sampledColors.forEach((color) => {
					// Find available position at the bottom row
					let x = Math.floor(Math.random() * MATRIX_WIDTH);
					let attempts = 0;

					// Try to find an empty spot, but don't block on it
					while (attempts < 10) {
						const occupied = state.pixels.some(
							(p) => p.x === x && p.y === 0 && now - p.createdAt < 200,
						);
						if (!occupied) break;
						x = (x + 1) % MATRIX_WIDTH;
						attempts++;
					}

					newPixels.push({
						id: `${state.nextId}-${Date.now()}-${Math.random()}`,
						color,
						createdAt: now,
						x,
						y: 0,
						opacity: 1,
						intensity: intensityMultiplier,
					});
				});

				return {
					...state,
					pixels: [...state.pixels, ...newPixels],
					nextId: state.nextId + sampledColors.length,
				};
			});
		},

		// Update pixel positions and opacity (called every frame)
		updateStream: () => {
			const now = Date.now();

			update((state) => {
				const updatedPixels = state.pixels
					.map((pixel) => {
						const age = now - pixel.createdAt;
						const progress = age / PIXEL_LIFETIME;

						// Remove pixels that are too old
						if (progress >= 1) {
							return null;
						}

						// Calculate new position - pixels flow upward
						const floatY = (age / PIXEL_LIFETIME) * MATRIX_HEIGHT;
						const y = Math.floor(floatY);

						// Calculate opacity fade
						const opacity = Math.max(0, 1 - Math.pow(progress, 0.8));

						return {
							...pixel,
							y: Math.min(y, MATRIX_HEIGHT - 1),
							opacity,
						};
					})
					.filter((pixel): pixel is StreamPixel => pixel !== null);

				return {
					...state,
					pixels: updatedPixels,
				};
			});
		},

		// Get pixels for rendering by position
		getPixelMatrix: (): (StreamPixel | null)[][] => {
			const state = get({ subscribe });
			const matrix: (StreamPixel | null)[][] = Array(MATRIX_HEIGHT)
				.fill(null)
				.map(() => Array(MATRIX_WIDTH).fill(null));

			// Place pixels in matrix, with newer pixels taking priority
			const sortedPixels = [...state.pixels].sort(
				(a, b) => b.createdAt - a.createdAt,
			);

			sortedPixels.forEach((pixel) => {
				if (
					pixel.y >= 0 &&
					pixel.y < MATRIX_HEIGHT &&
					pixel.x >= 0 &&
					pixel.x < MATRIX_WIDTH
				) {
					if (!matrix[pixel.y][pixel.x]) {
						matrix[pixel.y][pixel.x] = pixel;
					}
				}
			});

			return matrix;
		},

		// Clear all pixels (for testing or reset)
		clear: () => {
			update((state) => ({ ...state, pixels: [] }));
		},

		// Set matrix dimensions for responsive display
		setMatrixDimensions: (width: number) => {
			MATRIX_WIDTH = Math.max(5, width); // Minimum 5 columns, no maximum
		},

		// Get current matrix dimensions
		getMatrixDimensions: () => ({
			width: MATRIX_WIDTH,
			height: MATRIX_HEIGHT
		}),

		// Get stream statistics
		getStats: () => {
			const state = get({ subscribe });
			const now = Date.now();

			const recentPixels = state.pixels.filter((p) => now - p.createdAt < 1000);
			const colorCounts = {
				red: recentPixels.filter((p) => p.color === "red").length,
				green: recentPixels.filter((p) => p.color === "green").length,
				blue: recentPixels.filter((p) => p.color === "blue").length,
			};

			// Calculate intensity-weighted counts for display
			const intensityWeightedCount = recentPixels.reduce((sum, p) => sum + p.intensity, 0);

			return {
				totalPixels: state.pixels.length,
				recentPixelCount: recentPixels.length,
				pixelsPerSecond: state.generationRate,
				intensityWeightedRate: intensityWeightedCount,
				colorDistribution: colorCounts,
				sampling: state.generationRate > SAMPLING_THRESHOLDS.LOW,
			};
		},
	};
}

export const pixelStream = createPixelStreamStore();

// Animation loop - update pixel positions every frame
if (typeof window !== "undefined") {
	function animate() {
		pixelStream.updateStream();
		requestAnimationFrame(animate);
	}
	requestAnimationFrame(animate);
}
