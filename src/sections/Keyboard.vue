<template>
  <section id="keyboard" class="relative py-20 bg-black overflow-hidden">
    <div class="container mx-auto px-4 md:px-6 relative z-10">
      <div class="mb-12 text-center" v-if="!hideTitle">
        <h2 class="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4 opacity-0 section-title">
          {{ $t('keyboard.title', 'Interactive Keyboard') }}
        </h2>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 section-desc">
          {{ $t('keyboard.desc', 'A fully functional vintage keyboard built with Vue, Tailwind, and Web Audio API.') }}
        </p>
      </div>
      
      <div class="opacity-0 keyboard-container flex justify-center w-full">
        <VintageKeyboard />
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VintageKeyboard from '@/components/ui/VintageKeyboard.vue';

gsap.registerPlugin(ScrollTrigger);

defineProps({
  hideTitle: {
    type: Boolean,
    default: false
  }
});

onMounted(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#keyboard',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  tl.to('.section-title', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power3.out'
  }, 0)
  .to('.section-desc', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power3.out'
  }, 0.2)
  .to('.keyboard-container', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power3.out'
  }, 0.4);
});
</script>

<style scoped>
.section-title, .section-desc, .keyboard-container {
  transform: translateY(30px);
}
</style>
