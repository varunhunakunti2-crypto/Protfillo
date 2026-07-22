<template>
  <span class="split-text-wrapper" ref="wrapper">
    <span
      v-for="(word, wIdx) in splitWords"
      :key="wIdx"
      class="word-wrap inline-block overflow-hidden mr-[0.22em] last:mr-0 align-bottom"
    >
      <span class="word-inner inline-block translate-y-[110%] opacity-0 will-change-transform">
        {{ word }}
      </span>
    </span>
  </span>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  triggerStart: {
    type: String,
    default: 'top 85%'
  },
  stagger: {
    type: Number,
    default: 0.05
  },
  duration: {
    type: Number,
    default: 0.8
  }
});

const wrapper = ref(null);
let animation = null;

const splitWords = computed(() => {
  if (!props.text) return [];
  return props.text.split(' ').map(w => w + '\u00A0'); // Add non-breaking space to keep spacing natural
});

onMounted(async () => {
  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);

  const innerElements = wrapper.value.querySelectorAll('.word-inner');
  if (!innerElements.length) return;

  animation = gsap.to(innerElements, {
    y: '0%',
    opacity: 1,
    duration: props.duration,
    ease: 'power4.out',
    stagger: props.stagger,
    scrollTrigger: {
      trigger: wrapper.value,
      start: props.triggerStart,
      toggleActions: 'play none none none'
    }
  });
});

onBeforeUnmount(() => {
  if (animation) {
    if (animation.scrollTrigger) animation.scrollTrigger.kill();
    animation.kill();
  }
});
</script>

<style scoped>
.split-text-wrapper {
  display: inline-block;
}
.word-wrap {
  line-height: 1.1;
}
</style>
