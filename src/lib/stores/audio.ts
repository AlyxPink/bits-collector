import { writable } from 'svelte/store';
import { Howl } from 'howler';

interface AudioSettings {
  enabled: boolean;
  volume: number;
}

function loadAudioSettings(): AudioSettings {
  if (typeof window === 'undefined') {
    return { enabled: true, volume: 0.5 };
  }

  const saved = localStorage.getItem('audioSettings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { enabled: true, volume: 0.5 };
    }
  }
  return { enabled: true, volume: 0.5 };
}

function createAudioStore() {
  const { subscribe, update, set } = writable<AudioSettings>(loadAudioSettings());

  let pixelSound: Howl | null = null;
  let convertSound: Howl | null = null;
  let lastPixelClickTime = 0;
  const CLICK_DEBOUNCE_MS = 50; // Prevent rapid click audio stacking

  // Save settings to localStorage
  subscribe((value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('audioSettings', JSON.stringify(value));
    }
  });

  // Initialize Howler sound instances
  if (typeof window !== 'undefined') {
    try {
      pixelSound = new Howl({
        src: ['/sounds/pixel-click.wav'],
        volume: 0.5,
        preload: true,
        pool: 10, // Allow multiple concurrent plays
      });

      convertSound = new Howl({
        src: ['/sounds/convert.wav'],
        volume: 0.7,
        preload: true,
      });
    } catch (error) {
      console.warn('Audio files not found - sounds will be disabled');
    }
  }

  return {
    subscribe,
    toggleSound: () => {
      update(settings => ({
        ...settings,
        enabled: !settings.enabled
      }));
    },
    setVolume: (volume: number) => {
      update(settings => ({
        ...settings,
        volume: Math.max(0, Math.min(1, volume))
      }));
    },
    playPixelSound: (color?: 'red' | 'green' | 'blue') => {
      const settings = loadAudioSettings();
      const now = Date.now();
      
      // Prevent audio stacking from rapid clicks
      if (now - lastPixelClickTime < CLICK_DEBOUNCE_MS) {
        return;
      }
      lastPixelClickTime = now;

      if (settings.enabled && pixelSound) {
        // Dynamic pitch variation (0.9-1.1x for variety)
        const basePitch = 1.0;
        const pitchVariation = 0.1;
        const randomPitch = basePitch + (Math.random() - 0.5) * 2 * pitchVariation;
        
        // Color-based pitch offsets for subtle differentiation
        const colorOffsets = {
          red: 0.05,
          green: 0.0,
          blue: -0.05
        };
        const colorOffset = color ? colorOffsets[color] : 0;
        const finalPitch = Math.max(0.5, Math.min(2.0, randomPitch + colorOffset));

        // Volume variation (0.8-1.0 of base volume)
        const volumeVariation = 0.8 + Math.random() * 0.2;
        const finalVolume = settings.volume * volumeVariation;

        pixelSound.rate(finalPitch);
        pixelSound.volume(finalVolume);
        pixelSound.play();
      }
    },
    playConvertSound: () => {
      const settings = loadAudioSettings();
      if (settings.enabled && convertSound) {
        // Enhanced conversion sound with rising pitch effect
        const soundId = convertSound.play();
        
        if (soundId) {
          // Start at lower pitch and sweep up for dramatic effect
          convertSound.rate(0.8, soundId);
          convertSound.volume(settings.volume * 0.5, soundId);
          
          // Animate pitch and volume over duration
          setTimeout(() => {
            convertSound.rate(1.0, soundId);
            convertSound.volume(settings.volume * 0.8, soundId);
          }, 100);
          
          setTimeout(() => {
            convertSound.rate(1.2, soundId);
            convertSound.volume(settings.volume, soundId);
          }, 200);
        }
      }
    }
  };
}

export const audio = createAudioStore();
