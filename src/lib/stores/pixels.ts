import { writable, derived, get } from 'svelte/store';

export interface PixelCounts {
  red: number;
  green: number;
  blue: number;
  white: number;
}

// Load saved state from localStorage
function loadPixels(): PixelCounts {
  if (typeof window === 'undefined') {
    return { red: 0, green: 0, blue: 0, white: 0 };
  }
  
  const saved = localStorage.getItem('pixelCounts');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { red: 0, green: 0, blue: 0, white: 0 };
    }
  }
  return { red: 0, green: 0, blue: 0, white: 0 };
}

// Create the main pixel store
function createPixelStore() {
  const { subscribe, update, set } = writable<PixelCounts>(loadPixels());

  // Save to localStorage whenever the store changes
  subscribe((value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pixelCounts', JSON.stringify(value));
    }
  });

  return {
    subscribe,
    update,
    addPixel: (color: 'red' | 'green' | 'blue') => {
      update(counts => ({
        ...counts,
        [color]: counts[color] + 1
      }));
    },
    convertToWhite: () => {
      update(counts => {
        // Only convert if we have at least 1 of each RGB
        if (counts.red >= 1 && counts.green >= 1 && counts.blue >= 1) {
          return {
            red: counts.red - 1,
            green: counts.green - 1,
            blue: counts.blue - 1,
            white: counts.white + 1
          };
        }
        return counts;
      });
    },
    reset: () => {
      set({ red: 0, green: 0, blue: 0, white: 0 });
    }
  };
}

export const pixels = createPixelStore();

// Derived store to check if conversion is available
export const canConvert = derived(
  pixels,
  $pixels => $pixels.red >= 1 && $pixels.green >= 1 && $pixels.blue >= 1
);