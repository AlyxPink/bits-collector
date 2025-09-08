<script lang="ts">
  import { exportSave, importSave, resetGame, getSavePreview } from '$lib/stores/saveManager';
  import { audio } from '$lib/stores/audio';
  
  export let isOpen = false;
  
  let fileInput: HTMLInputElement;
  let message = '';
  let messageType: 'success' | 'error' | '' = '';
  let showResetConfirm = false;
  let previewText = '';
  
  function handleExport() {
    exportSave();
    showMessage('Save exported successfully!', 'success');
  }
  
  function handleImportClick() {
    fileInput.click();
  }
  
  async function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;
    
    try {
      const content = await file.text();
      
      // Show preview
      const preview = getSavePreview(content);
      if (!preview) {
        showMessage('Invalid save file!', 'error');
        return;
      }
      
      previewText = preview;
      
      // Confirm import
      if (confirm(`Import this save?\n\n${preview}\n\nThis will overwrite your current progress!`)) {
        const success = importSave(content);
        if (success) {
          showMessage('Save imported successfully! Reloading...', 'success');
        } else {
          showMessage('Failed to import save!', 'error');
        }
      }
    } catch (error) {
      showMessage('Error reading file!', 'error');
    }
    
    // Reset file input
    target.value = '';
  }
  
  function handleResetClick() {
    showResetConfirm = true;
  }
  
  function confirmReset() {
    resetGame();
    showMessage('Game reset! Reloading...', 'success');
  }
  
  function cancelReset() {
    showResetConfirm = false;
  }
  
  function showMessage(text: string, type: 'success' | 'error') {
    message = text;
    messageType = type;
    setTimeout(() => {
      message = '';
      messageType = '';
    }, 3000);
  }
  
  function closeModal() {
    isOpen = false;
    showResetConfirm = false;
    message = '';
    messageType = '';
  }
  
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }
</script>

{#if isOpen}
  <div 
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && closeModal()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="settings-title"
    tabindex="-1"
  >
    <div class="bg-gray-900 border-2 border-green-500 rounded-lg p-6 max-w-md w-full relative">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 id="settings-title" class="text-2xl font-bold text-green-400 font-mono">SETTINGS</h2>
        <button
          onclick={closeModal}
          class="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
        >
          ×
        </button>
      </div>
      
      <!-- Message -->
      {#if message}
        <div class="mb-4 p-3 rounded border {messageType === 'success' ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-400'}">
          {message}
        </div>
      {/if}
      
      <!-- Content -->
      {#if !showResetConfirm}
        <div class="space-y-4">
          <!-- Sound Toggle -->
          <button
            onclick={() => audio.toggleSound()}
            class="w-full font-mono uppercase tracking-wider border-2 rounded transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 bg-gray-900/50 border-gray-500 text-gray-400 hover:bg-gray-800/50 hover:text-green-400 hover:border-green-500 py-3"
          >
            <span class="text-lg">{$audio.enabled ? '🔊' : '🔇'} Sound: {$audio.enabled ? 'ON' : 'OFF'}</span>
            <span class="block text-xs opacity-75 mt-1">Toggle game sound effects</span>
          </button>
          
          <!-- Export Save -->
          <button
            onclick={handleExport}
            class="w-full font-mono uppercase tracking-wider border-2 rounded transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 bg-blue-900/50 border-blue-500 text-blue-400 hover:bg-blue-800/50 py-3"
          >
            <span class="text-lg">📥 Export Save</span>
            <span class="block text-xs opacity-75 mt-1">Download your game progress</span>
          </button>
          
          <!-- Import Save -->
          <button
            onclick={handleImportClick}
            class="w-full font-mono uppercase tracking-wider border-2 rounded transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 bg-purple-900/50 border-purple-500 text-purple-400 hover:bg-purple-800/50 py-3"
          >
            <span class="text-lg">📤 Import Save</span>
            <span class="block text-xs opacity-75 mt-1">Load a previous save file</span>
          </button>
          <input
            bind:this={fileInput}
            type="file"
            accept=".txt"
            onchange={handleFileSelect}
            class="hidden"
          />
          
          <!-- Reset Game -->
          <button
            onclick={handleResetClick}
            class="w-full font-mono uppercase tracking-wider border-2 rounded transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 bg-red-900/50 border-red-500 text-red-400 hover:bg-red-800/50 py-3"
          >
            <span class="text-lg">🗑️ Reset Game</span>
            <span class="block text-xs opacity-75 mt-1">Clear all progress and start over</span>
          </button>
          
          <!-- Info -->
          <div class="mt-6 p-3 bg-gray-800/50 rounded border border-gray-700 text-xs text-gray-400">
            <p class="mb-1">💡 <strong>Tip:</strong> Save files are encoded for security.</p>
            <p>Your progress is automatically saved locally.</p>
          </div>
        </div>
      {:else}
        <!-- Reset Confirmation -->
        <div class="space-y-4">
          <div class="text-center py-4">
            <p class="text-xl text-red-400 mb-4">⚠️ Are you sure?</p>
            <p class="text-gray-300">This will permanently delete all your progress!</p>
            <p class="text-gray-400 text-sm mt-2">This action cannot be undone.</p>
          </div>
          
          <div class="flex gap-3">
            <button
              onclick={cancelReset}
              class="flex-1 font-mono uppercase tracking-wider border-2 rounded transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 py-3"
            >
              Cancel
            </button>
            <button
              onclick={confirmReset}
              class="flex-1 font-mono uppercase tracking-wider border-2 rounded transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 bg-red-900/50 border-red-500 text-red-400 hover:bg-red-800/50 py-3"
            >
              Reset Everything
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}