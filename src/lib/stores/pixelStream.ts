import { writable, get } from 'svelte/store';

export interface StreamPixel {
  id: string;
  color: 'red' | 'green' | 'blue';
  createdAt: number;
  x: number;
  y: number;
  opacity: number;
}

export interface PixelStreamState {
  pixels: StreamPixel[];
  nextId: number;
}

let MATRIX_WIDTH = 30; // Dynamic width, will be updated by component
const MATRIX_HEIGHT = 10;
const PIXEL_LIFETIME = 3000; // 3 seconds in milliseconds

function createPixelStreamStore() {
  const { subscribe, update } = writable<PixelStreamState>({
    pixels: [],
    nextId: 0
  });

  return {
    subscribe,

    // Add new pixels to the stream
    addPixels: (colors: ('red' | 'green' | 'blue')[]) => {
      const now = Date.now();
      
      update(state => {
        const newPixels: StreamPixel[] = [];
        
        colors.forEach(color => {
          // Find available position at the bottom row
          let x = Math.floor(Math.random() * MATRIX_WIDTH);
          let attempts = 0;
          
          // Try to find an empty spot, but don't block on it
          while (attempts < 10) {
            const occupied = state.pixels.some(p => 
              p.x === x && p.y === 0 && (now - p.createdAt) < 200
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
            opacity: 1
          });
        });

        return {
          pixels: [...state.pixels, ...newPixels],
          nextId: state.nextId + colors.length
        };
      });
    },

    // Update pixel positions and opacity (called every frame)
    updateStream: () => {
      const now = Date.now();
      
      update(state => {
        const updatedPixels = state.pixels
          .map(pixel => {
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
              opacity
            };
          })
          .filter((pixel): pixel is StreamPixel => pixel !== null);

        return {
          ...state,
          pixels: updatedPixels
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
      const sortedPixels = [...state.pixels].sort((a, b) => b.createdAt - a.createdAt);
      
      sortedPixels.forEach(pixel => {
        if (pixel.y >= 0 && pixel.y < MATRIX_HEIGHT && 
            pixel.x >= 0 && pixel.x < MATRIX_WIDTH) {
          if (!matrix[pixel.y][pixel.x]) {
            matrix[pixel.y][pixel.x] = pixel;
          }
        }
      });

      return matrix;
    },

    // Clear all pixels (for testing or reset)
    clear: () => {
      update(state => ({ ...state, pixels: [] }));
    },

    // Set matrix dimensions for responsive display
    setMatrixDimensions: (width: number) => {
      MATRIX_WIDTH = Math.max(5, width); // Minimum 5 columns, no maximum
    },

    // Get stream statistics
    getStats: () => {
      const state = get({ subscribe });
      const now = Date.now();
      
      const recentPixels = state.pixels.filter(p => (now - p.createdAt) < 1000);
      const colorCounts = {
        red: recentPixels.filter(p => p.color === 'red').length,
        green: recentPixels.filter(p => p.color === 'green').length,
        blue: recentPixels.filter(p => p.color === 'blue').length
      };
      
      return {
        totalPixels: state.pixels.length,
        recentPixelCount: recentPixels.length,
        pixelsPerSecond: recentPixels.length,
        colorDistribution: colorCounts
      };
    }
  };
}

export const pixelStream = createPixelStreamStore();

// Animation loop - update pixel positions every frame
if (typeof window !== 'undefined') {
  function animate() {
    pixelStream.updateStream();
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}