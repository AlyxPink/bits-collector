<script lang="ts">
  import { pixels } from '$lib/stores/pixels';
  import { gameStats } from '$lib/stores/game';
  import { audio } from '$lib/stores/audio';
  import { inputController } from '$lib/stores/inputController';
  
  interface Props {
    color: 'red' | 'green' | 'blue';
    count: number;
  }
  
  let { color, count }: Props = $props();
  let isClicking = $state(false);
  let buttonElement: HTMLButtonElement;
  
  const colorClasses = {
    red: 'border-red-500 text-red-400 bg-red-500/10 hover:bg-red-500/20',
    green: 'border-green-500 text-green-400 bg-green-500/10 hover:bg-green-500/20',
    blue: 'border-blue-500 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
  };
  
  const shadowClasses = {
    red: 'shadow-red-500/50',
    green: 'shadow-green-500/50', 
    blue: 'shadow-blue-500/50'
  };
  
  function handleClick(event?: MouseEvent) {
    // Check if this click should be allowed (prevents held mouse button spam)
    if (event && !inputController.isMouseClickAllowed(event.button)) {
      return; // Block held mouse button spam
    }
    
    pixels.addPixel(color);
    gameStats.incrementClicks();
    audio.playPixelSound(color); // Pass color for pitch variation
    
    // Trigger animation
    isClicking = true;
    setTimeout(() => {
      isClicking = false;
    }, 300);
  }
  
  function handleKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    
    // Handle Enter and Space (common button activation keys)
    if (key === 'enter' || key === ' ') {
      // Check if this key press is allowed (not held down)
      if (inputController.isKeyPressAllowed(key)) {
        event.preventDefault();
        handleClick();
      } else {
        // Block held key spam
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }
    
    // Handle color-specific keys (R, G, B)
    if (key === color[0].toLowerCase()) {
      if (inputController.isKeyPressAllowed(key)) {
        event.preventDefault();
        handleClick();
      } else {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }
  
</script>

<button
  bind:this={buttonElement}
  onclick={handleClick}
  onkeydown={handleKeyDown}
  class="pixel-button {colorClasses[color]} {shadowClasses[color]} shadow-lg {isClicking ? 'animate-pixel-pop' : ''}"
  tabindex="0"
>
  <div class="flex flex-col items-center gap-2">
    <div class="text-2xl font-bold uppercase tracking-widest glow-text">
      {color}
    </div>
    <div class="text-4xl font-bold tabular-nums">
      {count}
    </div>
    <div class="text-xs opacity-75 uppercase">
      Click to collect
    </div>
  </div>
</button>