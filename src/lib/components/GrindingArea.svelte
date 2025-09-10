<script lang="ts">
  import { pixels } from "$lib/stores/pixels";
  import { mixedColorsUnlocked } from "$lib/stores/mixedColors";
  import { pureColorsUnlocked } from "$lib/stores/pureColors";
  import PixelButton from "./PixelButton.svelte";
  import ConvertButton from "./ConvertButton.svelte";
  import WhitePixelDisplay from "./WhitePixelDisplay.svelte";
  import MixedColorsTab from "./MixedColorsTab.svelte";
  import PureColorsTab from "./PureColorsTab.svelte";

  let activeTab = $state<"rgb" | "mixed" | "pure">("rgb");

  // Tab configuration with unlock requirements
  let tabs = $derived([
    {
      id: "rgb" as const,
      label: "RGB",
      iconType: "squares" as const,
      unlocked: true,
    },
    {
      id: "mixed" as const,
      label: "Mixed",
      iconType: "gradient" as const,
      unlocked: $mixedColorsUnlocked,
      requirement: 25,
    },
    {
      id: "pure" as const,
      label: "Pure",
      iconType: "diamond" as const,
      unlocked: $pureColorsUnlocked,
      requirement: 50,
    },
  ]);

  // Switch to RGB tab if current tab becomes locked
  $effect(() => {
    const currentTab = tabs.find((t) => t.id === activeTab);
    if (currentTab && !currentTab.unlocked) {
      activeTab = "rgb";
    }
  });
</script>

<div class="h-full flex">
  <!-- Vertical Menu -->
  <div
    class="w-28 md:w-32 bg-black/30 border-r border-green-500/20 flex flex-col"
  >
    {#each tabs as tab}
      <button
        onclick={() => tab.unlocked && (activeTab = tab.id)}
        disabled={!tab.unlocked}
        class="h-16 flex flex-col items-center justify-center border-b border-green-500/10 transition-all duration-200 p-2
               {tab.unlocked
          ? activeTab === tab.id
            ? 'bg-green-500/20 border-r-2 border-r-green-400 text-green-400'
            : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10 cursor-pointer'
          : 'text-gray-600 opacity-50 cursor-not-allowed'}"
      >
        <div class="mb-1">
          {#if tab.unlocked}
            {#if tab.iconType === "squares"}
              <!-- RGB squares icon -->
              <div class="flex gap-0.5">
                <div class="w-1.5 h-1.5 bg-red-500 rounded-sm"></div>
                <div class="w-1.5 h-1.5 bg-green-500 rounded-sm"></div>
                <div class="w-1.5 h-1.5 bg-blue-500 rounded-sm"></div>
              </div>
            {:else if tab.iconType === "gradient"}
              <!-- Mixed gradient circle -->
              <div
                class="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500"
              ></div>
            {:else if tab.iconType === "diamond"}
              <!-- Pure diamond shape -->
              <div
                class="w-4 h-4 bg-gradient-to-br from-red-600 to-blue-600 transform rotate-45 rounded-sm"
              ></div>
            {/if}
          {:else}
            <!-- Lock icon -->
            <div
              class="w-4 h-4 bg-gray-600 rounded border border-gray-500 flex items-center justify-center"
            >
              <div class="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          {/if}
        </div>
        <div
          class="text-xs font-bold uppercase tracking-wider leading-none text-center mb-1"
        >
          {tab.label}
        </div>

        {#if !tab.unlocked && tab.requirement}
          <div class="text-xs opacity-75 text-center">
            <div class="text-yellow-400">
              {$pixels.lifetimeWhite}/{tab.requirement}
            </div>
          </div>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Content Area -->
  <div class="flex-1 p-6">
    {#if activeTab === "rgb"}
      <div class="h-full flex flex-col justify-center items-center gap-8">
        <h2
          class="text-2xl font-bold uppercase tracking-wider text-green-400 glow-text mb-4"
        >
          RGB Pixels
        </h2>

        <!-- White Pixel Display -->
        <WhitePixelDisplay count={$pixels.white} />

        <!-- RGB Pixel Buttons -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full"
        >
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
          <p class="text-green-400 uppercase tracking-wider font-bold text-xs">
            How to Play:
          </p>
          <p>Click RGB buttons to collect colored pixels</p>
          <p>Convert sets of R+G+B into WHITE pixels</p>
          {#if !$mixedColorsUnlocked}
            <p class="text-yellow-400 mt-2">
              Get 25 lifetime ⚪ to unlock Mixed Colors!
            </p>
          {/if}
        </div>
      </div>
    {:else if activeTab === "mixed"}
      <MixedColorsTab />
    {:else if activeTab === "pure"}
      <PureColorsTab />
    {/if}
  </div>
</div>
