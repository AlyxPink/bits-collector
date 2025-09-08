import { get } from 'svelte/store';
import { pixels } from './pixels';
import { upgrades } from './upgrades';
import { gameStats } from './game';

export interface SaveData {
  version: number;
  timestamp: number;
  pixels: any;
  upgrades: any;
  gameStats: any;
}

function encodeSave(data: SaveData): string {
  const jsonString = JSON.stringify(data);
  // Convert to base64 (browser only since this is client-side)
  return btoa(jsonString);
}

function decodeSave(encodedData: string): SaveData | null {
  try {
    // Decode from base64 (browser only since this is client-side)
    const jsonString = atob(encodedData);
    
    const data = JSON.parse(jsonString);
    
    // Validate save structure
    if (!data.version || !data.timestamp || !data.pixels || !data.upgrades || !data.gameStats) {
      throw new Error('Invalid save structure');
    }
    
    return data;
  } catch (error) {
    console.error('Failed to decode save:', error);
    return null;
  }
}

export function exportSave(): void {
  const saveData: SaveData = {
    version: 1,
    timestamp: Date.now(),
    pixels: get(pixels),
    upgrades: get(upgrades),
    gameStats: get(gameStats)
  };
  
  const encodedSave = encodeSave(saveData);
  
  // Create download
  const blob = new Blob([encodedSave], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bits-collector-save-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importSave(fileContent: string): boolean {
  try {
    const saveData = decodeSave(fileContent.trim());
    
    if (!saveData) {
      return false;
    }
    
    // Clear existing localStorage
    localStorage.removeItem('pixelCounts');
    localStorage.removeItem('upgrades');
    localStorage.removeItem('gameStats');
    
    // Set new data in localStorage
    localStorage.setItem('pixelCounts', JSON.stringify(saveData.pixels));
    localStorage.setItem('upgrades', JSON.stringify(saveData.upgrades));
    localStorage.setItem('gameStats', JSON.stringify(saveData.gameStats));
    
    // Reload the page to apply changes
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('Failed to import save:', error);
    return false;
  }
}

export function resetGame(): void {
  // Clear all localStorage
  localStorage.removeItem('pixelCounts');
  localStorage.removeItem('upgrades');
  localStorage.removeItem('gameStats');
  
  // Reload the page to reset everything
  window.location.reload();
}

export function getSavePreview(fileContent: string): string | null {
  try {
    const saveData = decodeSave(fileContent.trim());
    
    if (!saveData) {
      return null;
    }
    
    const date = new Date(saveData.timestamp);
    const whitePixels = saveData.pixels?.white || 0;
    const totalClicks = saveData.gameStats?.totalClicks || 0;
    
    return `Save from ${date.toLocaleDateString()} - ${whitePixels} white pixels, ${totalClicks} total clicks`;
  } catch {
    return null;
  }
}