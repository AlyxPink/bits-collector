<script lang="ts">
import NavigationBar from "$lib/components/layout/NavigationBar.svelte";
import WidgetsArea from "$lib/components/layout/WidgetsArea.svelte";
import GrindingArea from "$lib/components/layout/GrindingArea.svelte";
import BuyingArea from "$lib/components/layout/BuyingArea.svelte";
import SettingsModal from "$lib/components/settings/SettingsModal.svelte";

let settingsModalOpen = false;

function openSettings() {
	settingsModalOpen = true;
}
</script>

<!-- Navigation Bar -->
<NavigationBar onSettingsClick={openSettings} />

<!-- Settings Modal -->
<SettingsModal bind:isOpen={settingsModalOpen} />

<!-- Main Game Layout - CSS Grid -->
<div class="min-h-screen grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
  <!-- Widgets Area (20% - 1/5, 33% on tablet) -->
  <div class="md:col-span-1 lg:col-span-1 min-h-[33vh] md:min-h-full border-b md:border-b-0 md:border-r lg:border-r border-green-500/20">
    <WidgetsArea />
  </div>
  
  <!-- Grinding Area (40% - 2/5, 33% on tablet) -->
  <div class="md:col-span-1 lg:col-span-2 min-h-[33vh] md:min-h-full border-b md:border-b-0 md:border-r lg:border-r border-green-500/20">
    <GrindingArea />
  </div>
  
  <!-- Buying Area (40% - 2/5, 33% on tablet) -->
  <div class="md:col-span-1 lg:col-span-2 min-h-[34vh] md:min-h-full">
    <BuyingArea />
  </div>
</div>

