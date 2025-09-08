<script lang="ts">
  interface Props {
    colorDistribution: {
      red: number;
      green: number;
      blue: number;
    };
  }

  let { colorDistribution }: Props = $props();
</script>

<div class="px-4 py-2 bg-gray-900/50 border-t border-green-500/20">
  <div class="flex justify-center gap-4">
    <div class="flex items-center gap-1 text-xs text-gray-400">
      <div class="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div>
      <span>{colorDistribution.red}</span>
    </div>
    <div class="flex items-center gap-1 text-xs text-gray-400">
      <div class="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
      <span>{colorDistribution.green}</span>
    </div>
    <div class="flex items-center gap-1 text-xs text-gray-400">
      <div class="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
      <span>{colorDistribution.blue}</span>
    </div>
  </div>
</div>