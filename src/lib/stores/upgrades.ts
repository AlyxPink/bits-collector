import { writable, derived, get } from 'svelte/store';
import { pixels } from './pixels';

export interface BitsBuyerUpgrade {
  id: string;
  name: string;
  description: string;
  color: 'red' | 'green' | 'blue' | 'random';
  baseRate: number; // bits per second
  baseCost: number; // white pixels
  costMultiplier: number;
  level: number;
  owned: boolean;
}

export interface PowerupUpgrade {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  baseCost: number; // white pixels
  costMultiplier: number;
  level: number;
  maxLevel: number;
}

export interface UpgradeState {
  bitsBuyers: Record<string, BitsBuyerUpgrade>;
  powerups: Record<string, PowerupUpgrade>;
  lastAutoTick: number;
  bitAccumulator: Record<string, number>;
}

const DEFAULT_BITS_BUYERS: Record<string, BitsBuyerUpgrade> = {
  redAutoBuy: {
    id: 'redAutoBuy',
    name: 'Red Bits Auto-buyer',
    description: 'Automatically collects red bits',
    color: 'red',
    baseRate: 0.5,
    baseCost: 10,
    costMultiplier: 1.5,
    level: 0,
    owned: false
  },
  greenAutoBuy: {
    id: 'greenAutoBuy',
    name: 'Green Bits Auto-buyer',
    description: 'Automatically collects green bits',
    color: 'green',
    baseRate: 0.5,
    baseCost: 10,
    costMultiplier: 1.5,
    level: 0,
    owned: false
  },
  blueAutoBuy: {
    id: 'blueAutoBuy',
    name: 'Blue Bits Auto-buyer',
    description: 'Automatically collects blue bits',
    color: 'blue',
    baseRate: 0.5,
    baseCost: 10,
    costMultiplier: 1.5,
    level: 0,
    owned: false
  },
  randomAutoBuy: {
    id: 'randomAutoBuy',
    name: 'Random Bits Auto-buyer',
    description: 'Automatically collects random RGB bits',
    color: 'random',
    baseRate: 1.0,
    baseCost: 25,
    costMultiplier: 1.8,
    level: 0,
    owned: false
  }
};

const DEFAULT_POWERUPS: Record<string, PowerupUpgrade> = {
  speedBoost: {
    id: 'speedBoost',
    name: 'Speed Boost',
    description: '2x auto-buy rate',
    multiplier: 2,
    baseCost: 50,
    costMultiplier: 3,
    level: 0,
    maxLevel: 5
  },
  megaSpeed: {
    id: 'megaSpeed',
    name: 'Mega Speed',
    description: '5x auto-buy rate',
    multiplier: 5,
    baseCost: 200,
    costMultiplier: 4,
    level: 0,
    maxLevel: 3
  },
  ultraSpeed: {
    id: 'ultraSpeed',
    name: 'Ultra Speed',
    description: '10x auto-buy rate',
    multiplier: 10,
    baseCost: 1000,
    costMultiplier: 5,
    level: 0,
    maxLevel: 2
  }
};

function loadUpgrades(): UpgradeState {
  const defaultAccumulator = {
    redAutoBuy: 0,
    greenAutoBuy: 0,
    blueAutoBuy: 0,
    randomAutoBuy: 0
  };

  if (typeof window === 'undefined') {
    return {
      bitsBuyers: { ...DEFAULT_BITS_BUYERS },
      powerups: { ...DEFAULT_POWERUPS },
      lastAutoTick: Date.now(),
      bitAccumulator: { ...defaultAccumulator }
    };
  }

  const saved = localStorage.getItem('upgrades');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Merge with defaults to handle new upgrades
      return {
        bitsBuyers: { ...DEFAULT_BITS_BUYERS, ...parsed.bitsBuyers },
        powerups: { ...DEFAULT_POWERUPS, ...parsed.powerups },
        lastAutoTick: parsed.lastAutoTick || Date.now(),
        bitAccumulator: { ...defaultAccumulator, ...parsed.bitAccumulator }
      };
    } catch {
      return {
        bitsBuyers: { ...DEFAULT_BITS_BUYERS },
        powerups: { ...DEFAULT_POWERUPS },
        lastAutoTick: Date.now(),
        bitAccumulator: { ...defaultAccumulator }
      };
    }
  }

  return {
    bitsBuyers: { ...DEFAULT_BITS_BUYERS },
    powerups: { ...DEFAULT_POWERUPS },
    lastAutoTick: Date.now(),
    bitAccumulator: { ...defaultAccumulator }
  };
}

function createUpgradesStore() {
  const { subscribe, update, set } = writable<UpgradeState>(loadUpgrades());

  // Auto-save to localStorage
  subscribe((value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('upgrades', JSON.stringify(value));
    }
  });

  return {
    subscribe,
    
    getBitsBuyerCost: (id: string): number => {
      const state = get({ subscribe });
      const upgrade = state.bitsBuyers[id];
      if (!upgrade) return 0;
      return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
    },
    
    getPowerupCost: (id: string): number => {
      const state = get({ subscribe });
      const upgrade = state.powerups[id];
      if (!upgrade) return 0;
      return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
    },
    
    
    purchaseBitsBuyer: (id: string): boolean => {
      const state = get({ subscribe });
      const pixelCount = get(pixels);
      const upgrade = state.bitsBuyers[id];
      const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
      
      if (pixelCount.white >= cost) {
        // Deduct cost
        pixels.update(p => ({ ...p, white: p.white - cost }));
        
        // Upgrade
        update(state => ({
          ...state,
          bitsBuyers: {
            ...state.bitsBuyers,
            [id]: {
              ...upgrade,
              level: upgrade.level + 1,
              owned: true
            }
          }
        }));
        return true;
      }
      return false;
    },
    
    purchasePowerup: (id: string): boolean => {
      const state = get({ subscribe });
      const pixelCount = get(pixels);
      const upgrade = state.powerups[id];
      const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
      
      if (pixelCount.white >= cost && upgrade.level < upgrade.maxLevel) {
        // Deduct cost
        pixels.update(p => ({ ...p, white: p.white - cost }));
        
        // Upgrade
        update(state => ({
          ...state,
          powerups: {
            ...state.powerups,
            [id]: {
              ...upgrade,
              level: upgrade.level + 1
            }
          }
        }));
        return true;
      }
      return false;
    },
    
    getEffectiveMultiplier: (): number => {
      const state = get({ subscribe });
      let multiplier = 1;
      
      Object.values(state.powerups).forEach(powerup => {
        if (powerup.level > 0) {
          multiplier *= Math.pow(powerup.multiplier, powerup.level);
        }
      });
      
      return multiplier;
    },
    
    getAutoBuyRate: (id: string): number => {
      const state = get({ subscribe });
      const upgrade = state.bitsBuyers[id];
      if (!upgrade || !upgrade.owned) return 0;
      
      const baseRate = upgrade.baseRate * upgrade.level;
      const multiplier = get({ subscribe }).powerups ? (() => {
        const currentState = get({ subscribe });
        let mult = 1;
        Object.values(currentState.powerups).forEach(powerup => {
          if (powerup.level > 0) {
            mult *= Math.pow(powerup.multiplier, powerup.level);
          }
        });
        return mult;
      })() : 1;
      
      return baseRate * multiplier;
    },
    
    processAutoTick: () => {
      const now = Date.now();
      update(state => {
        const deltaTime = (now - state.lastAutoTick) / 1000; // Convert to seconds
        
        // Process each auto-buyer
        Object.values(state.bitsBuyers).forEach(buyer => {
          if (buyer.owned && buyer.level > 0) {
            const rate = buyer.baseRate * buyer.level;
            const multiplier = Object.values(state.powerups).reduce((mult, powerup) => {
              if (powerup.level > 0) {
                return mult * Math.pow(powerup.multiplier, powerup.level);
              }
              return mult;
            }, 1);
            
            const effectiveRate = rate * multiplier;
            // Add fractional bits to accumulator
            state.bitAccumulator[buyer.id] += effectiveRate * deltaTime;
            
            // Convert whole bits from accumulator
            const bitsToAdd = Math.floor(state.bitAccumulator[buyer.id]);
            if (bitsToAdd > 0) {
              state.bitAccumulator[buyer.id] -= bitsToAdd; // Remove whole bits, keep fractional
              
              if (buyer.color === 'random') {
                // Random color selection
                const colors: ('red' | 'green' | 'blue')[] = ['red', 'green', 'blue'];
                for (let i = 0; i < bitsToAdd; i++) {
                  const randomColor = colors[Math.floor(Math.random() * 3)];
                  pixels.addPixel(randomColor);
                }
              } else {
                // Specific color
                for (let i = 0; i < bitsToAdd; i++) {
                  pixels.addPixel(buyer.color as 'red' | 'green' | 'blue');
                }
              }
            }
          }
        });
        
        return {
          ...state,
          lastAutoTick: now
        };
      });
    }
  };
}

export const upgrades = createUpgradesStore();

// Derived stores for convenience
export const totalSpeedMultiplier = derived(
  upgrades,
  $upgrades => {
    let multiplier = 1;
    Object.values($upgrades.powerups).forEach(powerup => {
      if (powerup.level > 0) {
        multiplier *= Math.pow(powerup.multiplier, powerup.level);
      }
    });
    return multiplier;
  }
);

export const ownedBitsBuyers = derived(
  upgrades,
  $upgrades => Object.values($upgrades.bitsBuyers).filter(buyer => buyer.owned)
);

export const hasUnlockedUpgrades = derived(
  upgrades,
  $upgrades => Object.values($upgrades.bitsBuyers).some(buyer => buyer.owned) ||
    Object.values($upgrades.powerups).some(powerup => powerup.level > 0)
);

// Auto-tick system - runs every 100ms
if (typeof window !== 'undefined') {
  setInterval(() => {
    upgrades.processAutoTick();
  }, 100);
}