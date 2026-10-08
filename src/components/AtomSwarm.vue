<template>
  <div class="atom-swarm flex justify-center items-center w-full" role="img" :aria-label="label">
    <div ref="hostEl" class="atom-swarm__host w-full h-[260px] sm:h-[320px] md:h-[350px]"></div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { DotsEffect } from "@/components/react/DotsEffect";

const props = defineProps({
  label: { type: String, default: "Atom particle animation" },
  count: { type: Number, default: 950 },
  spread: { type: Number, default: 1.25 },
  dotSize: { type: Number, default: 1.4 },
  color: { type: String, default: undefined },
});

const hostEl = ref(null);
let root = null;

const renderSwarm = () => {
  if (!hostEl.value) return;
  if (!root) {
    root = createRoot(hostEl.value);
  }
  root.render(
    createElement(DotsEffect, {
      shape: "atom",
      count: props.count,
      spread: props.spread,
      dotSize: props.dotSize,
      label: props.label,
      color: props.color,
      style: { width: "100%", height: "100%" },
    })
  );
};

onMounted(() => {
  renderSwarm();
});

watch(() => [props.count, props.spread, props.dotSize, props.label, props.color], () => {
  renderSwarm();
});

onBeforeUnmount(() => {
  if (!root) return;
  root.unmount();
  root = null;
});
</script>

<style scoped>
.atom-swarm {
  position: relative;
  width: 100%;
}
.atom-swarm__host {
  width: 100%;
}
</style>
