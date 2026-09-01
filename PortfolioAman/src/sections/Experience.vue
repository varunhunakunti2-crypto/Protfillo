<template>
  <section
    id="experience"
    ref="experienceSection"
    class="experience-section relative px-5 lg:px-28 py-24 lg:py-32 overflow-hidden"
    :class="isJa ? 'is-ja' : ''"
  >
    <div class="mx-auto w-full max-w-4xl">
      <!-- Title -->
      <div class="relative mb-16 text-center">
        <span class="experience-bg-text">{{ t('experience.bgText') }}</span>
        <h2 class="experience-title">{{ t('experience.title') }}</h2>
      </div>

      <!-- Timeline Container -->
      <div class="relative mt-24">
        <!-- Vertical Line (Desktop only) -->
        <div class="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-[color:var(--theme-line-soft)] hidden md:block" aria-hidden="true">
          <!-- Active colored line that grows on scroll -->
          <div
            ref="activeLine"
            class="absolute top-0 left-0 w-full bg-[color:var(--theme-cta-bg)] origin-top scale-y-0"
            style="height: 100%; transition: transform 0.1s linear;"
          ></div>
        </div>

        <!-- Timeline Items -->
        <div class="space-y-16">
          <div
            v-for="(job, index) in jobs"
            :key="index"
            class="timeline-item flex flex-col md:flex-row relative items-start md:even:flex-row-reverse"
            ref="timelineItems"
          >
            <!-- Center dot (Desktop only) -->
            <div
              class="timeline-dot absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[color:var(--theme-bg)] border-2 border-[color:var(--theme-line-strong)] z-10 hidden md:block mt-8 transition-colors duration-300"
              :class="{ 'is-active': index === activeJobIndex }"
            ></div>

            <!-- Spacer side to keep alternate structure -->
            <div class="w-full md:w-1/2 hidden md:block"></div>

            <!-- Card Side -->
            <div class="w-full md:w-[45%] timeline-card p-6 md:p-8 rounded-[20px] relative shadow-lg z-20 transition-all duration-300">
              <span class="text-xs font-bold tracking-widest uppercase duration-badge">{{ job.duration }}</span>
              <h3 class="text-xl font-bold mt-2 text-[color:var(--theme-text-strong)]">{{ job.role }}</h3>
              <h4 class="text-sm font-semibold mt-1 text-[color:var(--theme-text-muted)]">{{ job.company }}</h4>
              <p class="text-[0.92rem] text-[color:var(--theme-text-soft)] mt-4 leading-relaxed">{{ job.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, tm, locale } = useI18n();
const isJa = computed(() => locale.value === 'ja');

const jobs = computed(() => {
  const items = tm('experience.jobs');
  return Array.isArray(items) ? items : [];
});

const experienceSection = ref(null);
const activeLine = ref(null);
const timelineItems = ref([]);
const activeJobIndex = ref(-1);

let scrollTimeline = null;
let cardsTimeline = null;

onMounted(async () => {
  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);

  const sectionEl = experienceSection.value;
  const lineEl = activeLine.value;
  const cards = sectionEl?.querySelectorAll('.timeline-card');
  const dots = sectionEl?.querySelectorAll('.timeline-dot');

  if (!sectionEl) return;

  // 1. Line Growth Animation
  if (lineEl) {
    scrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top 40%',
        end: 'bottom 60%',
        scrub: true
      }
    });
    scrollTimeline.to(lineEl, {
      scaleY: 1,
      ease: 'none'
    });
  }

  // 2. Cards Fade In and Dots active highlight
  if (cards && cards.length) {
    cardsTimeline = gsap.timeline();
    cards.forEach((card, idx) => {
      const dot = dots ? dots[idx] : null;
      
      // Animate card slide-in
      const directionX = idx % 2 === 0 ? 40 : -40; // Slide from left/right alternate
      gsap.set(card, { opacity: 0, x: directionX, scale: 0.95 });
      
      gsap.to(card, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
          onEnter: () => {
            activeJobIndex.value = idx;
          }
        }
      });
    });
  }
});

onUnmounted(() => {
  if (scrollTimeline) {
    if (scrollTimeline.scrollTrigger) scrollTimeline.scrollTrigger.kill();
    scrollTimeline.kill();
  }
  if (cardsTimeline) {
    cardsTimeline.kill();
  }
});
</script>

<style scoped>
.experience-bg-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(4rem, 15vw, 10rem);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--theme-text-strong);
  opacity: 0.02;
  pointer-events: none;
  white-space: nowrap;
  user-select: none;
  filter: blur(10px);
  line-height: 1;
}

.experience-title {
  position: relative;
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  color: var(--theme-text-strong);
  z-index: 1;
}

.timeline-card {
  background: var(--timeline-card-bg);
  border: 1px solid var(--timeline-card-border);
  backdrop-filter: blur(12px);
}

.duration-badge {
  color: var(--theme-cta-bg);
}

.timeline-dot.is-active {
  background-color: var(--theme-cta-bg);
  border-color: var(--theme-cta-bg);
  box-shadow: 0 0 12px var(--theme-cta-bg);
}

/* Theme variables */
:global([data-theme="dark"]) {
  --timeline-card-bg: rgba(22, 25, 30, 0.65);
  --timeline-card-border: rgba(255, 255, 255, 0.08);
}

:global([data-theme="light"]) {
  --timeline-card-bg: rgba(255, 255, 255, 0.85);
  --timeline-card-border: rgba(0, 0, 0, 0.06);
}

.experience-section.is-ja .experience-bg-text {
  text-transform: none;
  letter-spacing: 0.04em;
  font-size: clamp(4rem, 16vw, 10rem);
}

@media (max-width: 1024px) {
  .experience-bg-text {
    opacity: 0.6;
    filter: blur(5px) !important;
  }
  :global([data-theme="dark"]) .experience-bg-text {
    opacity: 0.66;
  }
  :global([data-theme="light"]) .experience-bg-text {
    opacity: 0.7;
  }
}
</style>
