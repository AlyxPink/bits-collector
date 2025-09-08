<script lang="ts">
  import { pixels } from '$lib/stores/pixels';
  import PixelButton from './PixelButton.svelte';
  import ConvertButton from './ConvertButton.svelte';
  import WhitePixelDisplay from './WhitePixelDisplay.svelte';
  
  let activeTab = $state<'pixels'>('pixels');
  
  const tabs = [
    { id: 'pixels' as const, label: 'Pixels', icon: '⬛' },
  ];
</script>

<div class="h-full flex">
  <!-- Vertical Menu -->
  <div class="w-20 bg-black/30 border-r border-green-500/20 flex flex-col">
    {#each tabs as tab}
      <button
        onclick={() => activeTab = tab.id}
        class="h-16 flex flex-col items-center justify-center border-b border-green-500/10 transition-all duration-200 hover:bg-green-500/10
               {activeTab === tab.id ? 'bg-green-500/20 border-r-2 border-r-green-400 text-green-400' : 'text-gray-400 hover:text-green-400'}"
      >
        <div class="text-lg mb-1">{tab.icon}</div>
        <div class="text-xs font-bold uppercase tracking-wider leading-none text-center">{tab.label}</div>
      </button>
    {/each}
    
    <!-- Future tab placeholders -->
    <div class="h-16 flex flex-col items-center justify-center border-b border-green-500/10 text-gray-600 opacity-50">
      <div class="text-lg mb-1">❓</div>
      <div class="text-xs font-bold uppercase tracking-wider leading-none text-center">Soon</div>
    </div>
    <div class="h-16 flex flex-col items-center justify-center border-b border-green-500/10 text-gray-600 opacity-50">
      <div class="text-lg mb-1">❓</div>
      <div class="text-xs font-bold uppercase tracking-wider leading-none text-center">Soon</div>
    </div>
  </div>
  
  <!-- Content Area -->
  <div class="flex-1 p-6">
    {#if activeTab === 'pixels'}
      <div class="h-full flex flex-col justify-center items-center gap-8">
        <h2 class="text-2xl font-bold uppercase tracking-wider text-green-400 glow-text mb-4">
          RGB Pixels
        </h2>
        
        <!-- White Pixel Display -->
        <WhitePixelDisplay count={$pixels.white} />
        
        <!-- RGB Pixel Buttons -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <PixelButton color="red" count={$pixels.red} />
          <PixelButton color="green" count={$pixels.green} />
          <PixelButton color="blue" count={$pixels.blue} />
        </div>
        
        <!-- Convert Button -->
        <div class="mt-8">
          <ConvertButton />
        </div>
        
        <!-- Instructions -->
        <div class="text-center mt-8 opacity-60 text-sm space-y-1">
          <p class="text-green-400 uppercase tracking-wider font-bold text-xs">How to Play:</p>
          <p>Click RGB buttons to collect colored pixels</p>
          <p>Convert sets of R+G+B into WHITE pixels</p>
        </div>
      </div>
    {/if}
  </div>
</div>