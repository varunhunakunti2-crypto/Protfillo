<template>
  <div class="halo-swarm" role="img" :aria-label="label">
    <div ref="hostEl" class="halo-swarm__host"></div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { DotsEffect } from "@/components/react/DotsEffect";

const props = defineProps({
  label: { type: String, default: "Halo particle animation" },
});

const hostEl = ref(null);
let root = null;

onMounted(() => {
  if (!hostEl.value) return;
  root = createRoot(hostEl.value);
  root.render(createElement(DotsEffect, { label: props.label }));
});

onBeforeUnmount(() => {
  if (!root) return;
  root.unmount();
  root = null;
});
</script>

<style scoped>
/* The parent supplies the explicit height the swarm renders into. */
.halo-swarm,
.halo-swarm__host {
  width: 100%;
  height: 100%;
}
</style>
