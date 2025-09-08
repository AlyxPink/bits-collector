<script lang="ts">
  interface Props {
    count: number;
  }
  
  let { count }: Props = $props();
</script>

<div class="matrix-border p-6 text-center">
  <div class="text-sm uppercase tracking-widest opacity-75 mb-2">
    Premium Currency
  </div>
  <div class="flex items-center justify-center gap-3">
    <div class="text-5xl animate-pulse">⬜</div>
    <div class="text-6xl font-bold text-white glow-text tabular-nums">
      {count}
    </div>
  </div>
  <div class="text-xs uppercase tracking-wider mt-3 opacity-50">
    White Pixels
  </div>
</div>