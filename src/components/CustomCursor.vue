<template>
  <div class="custom-cursor-container" :class="{ 'hidden-on-touch': true }">
    <!-- Outer Ring -->
    <div ref="ring" class="cursor-ring" :class="{ 'is-hovering': isHovering, 'is-viewing': isViewing }">
      <div class="cursor-text" ref="textEl">{{ cursorText }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import gsap from 'gsap';

const { t } = useI18n();

const ring = ref(null);
const textEl = ref(null);
const isHovering = ref(false);
const isViewing = ref(false);
const cursorText = ref('');

let xToRing, yToRing;

const onMouseMove = (e) => {
  const { clientX: x, clientY: y } = e;
  
  if (xToRing && yToRing) {
    // Center the ring (which is 36px wide by default)
    xToRing(x - 18);
    yToRing(y - 18);
  }
};

const onMouseOver = (e) => {
  const target = e.target.closest('[data-cursor], a, button, .ui-switch, input, label');
  if (!target) return;

  const cursorType = target.getAttribute('data-cursor');
  
  if (cursorType === 'view') {
    isViewing.value = true;
    cursorText.value = t('nav.view') || 'View';
    
    // Scale up outer ring for View Project text
    gsap.to(ring.value, {
      width: 80,
      height: 80,
      borderRadius: '50%',
      backgroundColor: 'rgba(139, 92, 246, 0.9)',
      borderColor: 'rgba(139, 92, 246, 0.9)',
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto'
    });
    
    gsap.to(textEl.value, {
      opacity: 1,
      scale: 1,
      duration: 0.2,
      delay: 0.1
    });
  } else {
    isHovering.value = true;
    
    // Scale up standard hover
    gsap.to(ring.value, {
      scale: 1.6,
      borderColor: 'rgba(139, 92, 246, 0.6)',
      backgroundColor: 'rgba(139, 92, 246, 0.05)',
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }
};

const onMouseOut = (e) => {
  const target = e.target.closest('[data-cursor], a, button, .ui-switch, input, label');
  if (!target) return;
  
  // Reset states
  isHovering.value = false;
  isViewing.value = false;
  cursorText.value = '';
  
  gsap.to(ring.value, {
    scale: 1,
    width: 36,
    height: 36,
    backgroundColor: 'transparent',
    borderColor: 'var(--cursor-ring-color, rgba(139, 92, 246, 0.4))',
    duration: 0.3,
    ease: 'power2.out',
    overwrite: 'auto'
  });
  
  gsap.to(textEl.value, {
    opacity: 0,
    scale: 0.8,
    duration: 0.2
  });
};

onMounted(() => {
  // Check if touch device
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) return;

  // Initialize GSAP quickTo setters
  xToRing = gsap.quickTo(ring.value, "x", { duration: 0.25, ease: "power3.out" });
  yToRing = gsap.quickTo(ring.value, "y", { duration: 0.25, ease: "power3.out" });

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mouseover', onMouseOver, { passive: true });
  window.addEventListener('mouseout', onMouseOut, { passive: true });
  
  // Initial center values
  gsap.set(ring.value, { xPercent: 0, yPercent: 0 });
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseover', onMouseOver);
  window.removeEventListener('mouseout', onMouseOut);
});
</script>

<style scoped>
.custom-cursor-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
}

.cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  width: 36px;
  height: 36px;
  border: 1.5px solid var(--cursor-ring-color, rgba(139, 92, 246, 0.45));
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  will-change: transform, width, height, background-color, border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.cursor-text {
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0;
  scale: 0.8;
  pointer-events: none;
  will-change: opacity, transform;
  white-space: nowrap;
}

/* Hide on touch devices */
@media (pointer: coarse) {
  .custom-cursor-container {
    display: none !important;
  }
}

/* Light / Dark variable support */
:global([data-theme="light"]) {
  --cursor-ring-color: rgba(79, 70, 229, 0.4);
}
:global([data-theme="dark"]) {
  --cursor-ring-color: rgba(139, 92, 246, 0.45);
}
</style>
