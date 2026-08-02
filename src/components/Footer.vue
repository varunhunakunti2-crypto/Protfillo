<template>
  <div
    ref="wrapperRef"
    class="relative min-h-screen w-full footer-reveal-wrapper"
  >
    <!-- The actual footer stays fixed to the viewport underneath everything during curtain reveal -->
    <footer
      class="fixed bottom-0 left-0 flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#0c0c0e] text-[#f4f4f5] cinematic-footer-wrapper"
    >
      <!-- Ambient Light & Grid Background -->
      <div
        class="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0"
      />
      <div class="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

      <!-- Giant background text -->
      <div
        ref="giantTextRef"
        class="footer-giant-bg-text absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none"
      >
        {{ t('footer.name') }}
      </div>

      <!-- 1. Diagonal Sleek Marquee (Top of footer) -->
      <div
        class="absolute top-12 left-0 w-full overflow-hidden border-y border-white/10 bg-black/40 backdrop-blur-md py-4 z-10 -rotate-2 scale-110 shadow-2xl"
      >
        <div
          class="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-neutral-400 uppercase"
        >
          <MarqueeItems />
          <MarqueeItems />
        </div>
      </div>

      <!-- 2. Main Center Content -->
      <div
        class="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto"
      >
        <h2
          ref="headingRef"
          class="text-4xl md:text-7xl font-black footer-text-glow tracking-tighter mb-12 text-center"
        >
          Ready to begin?
        </h2>

        <!-- Interactive Magnetic Pills Layout -->
        <div ref="linksRef" class="flex flex-col items-center gap-6 w-full">
          <!-- Social & Inquiry Links -->
          <div class="flex flex-wrap justify-center gap-4 w-full">
            <a
              v-magnetic
              href="https://github.com/varunhunakunti2-crypto"
              target="_blank"
              rel="noopener noreferrer"
              class="footer-glass-pill px-8 py-4 rounded-full text-[#f4f4f5] font-bold text-sm md:text-base flex items-center gap-3 group"
            >
              <i class="bi bi-github text-lg text-neutral-400 group-hover:text-[#f4f4f5] transition-colors"></i>
              {{ t('footer.github') }}
            </a>

            <a
              v-magnetic
              href="https://www.linkedin.com/in/varun-kumar11/"
              target="_blank"
              rel="noopener noreferrer"
              class="footer-glass-pill px-8 py-4 rounded-full text-[#f4f4f5] font-bold text-sm md:text-base flex items-center gap-3 group"
            >
              <i class="bi bi-linkedin text-lg text-neutral-400 group-hover:text-[#f4f4f5] transition-colors"></i>
              {{ t('footer.linkedin') }}
            </a>

            <a
              v-magnetic
              href="mailto:varunhunakunti2@gmail.com"
              class="footer-glass-pill px-8 py-4 rounded-full text-[#f4f4f5] font-bold text-sm md:text-base flex items-center gap-3 group"
            >
              <i class="bi bi-envelope text-lg text-neutral-400 group-hover:text-[#f4f4f5] transition-colors"></i>
              {{ t('footer.inquiry') }}
            </a>
          </div>

          <!-- Secondary Custom Text/Badge links -->
          <div class="flex flex-wrap justify-center gap-3 md:gap-6 w-full mt-2">
            <div class="footer-glass-pill px-6 py-2.5 rounded-full text-neutral-400 font-medium text-xs md:text-sm">
              {{ t('footer.tagline') }}
            </div>
            <div class="footer-glass-pill px-6 py-2.5 rounded-full text-neutral-400 font-medium text-xs md:text-sm">
              {{ t('footer.location') }} {{ currentTime }}
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Bottom Bar / Credits -->
      <div
        class="relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <!-- Copyright -->
        <div
          class="text-neutral-400 text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1"
        >
          &copy; {{ currentYear }} {{ t('footer.name') }}. {{ t('footer.rights') }}
        </div>

        <!-- "Made with Love" Badge -->
        <div
          class="footer-glass-pill px-6 py-3 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default border-white/10"
        >
          <span class="text-neutral-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">Crafted with</span>
          <span class="animate-footer-heartbeat text-sm md:text-base text-red-500">❤</span>
          <span class="text-neutral-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">by</span>
          <span class="text-[#f4f4f5] font-black text-xs md:text-sm tracking-normal ml-1">Varun S</span>
        </div>

        <!-- Back to top -->
        <button
          v-magnetic
          type="button"
          @click="scrollToTop"
          class="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-neutral-400 hover:text-[#f4f4f5] group order-3 cursor-pointer"
        >
          <svg
            class="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            ></path>
          </svg>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { makeMagnetic } from "@/composables/useMagnetic";
import MarqueeItems from "./MarqueeItems.vue";

const { t } = useI18n();

// Time-updating logic
const currentTime = ref("");
const currentYear = new Date().getFullYear();
let timeInterval = null;

function updateTime() {
  const now = new Date();
  currentTime.value = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

// Magnetic directive for easy markup attachment
const vMagnetic = {
  mounted(el) {
    const cleanup = makeMagnetic(el, { strength: 0.35, duration: 0.5 });
    el._cleanupMagnetic = cleanup;
  },
  unmounted(el) {
    if (el._cleanupMagnetic) {
      el._cleanupMagnetic();
    }
  },
};

const wrapperRef = ref(null);
const giantTextRef = ref(null);
const headingRef = ref(null);
const linksRef = ref(null);

let scrollTriggers = [];

onMounted(async () => {
  updateTime();
  timeInterval = setInterval(updateTime, 60000);

  // Dynamic GSAP imports for SSR safety
  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);

  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    // Parallax background giant text
    gsap.fromTo(
      giantTextRef.value,
      { y: "15vh", scale: 0.85, opacity: 0 },
      {
        y: "0vh",
        scale: 1,
        opacity: 0.6,
        ease: "none",
        scrollTrigger: {
          trigger: wrapperRef.value,
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
        },
      }
    );

    // Staggered reveal of main content
    gsap.fromTo(
      [headingRef.value, linksRef.value],
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: wrapperRef.value,
          start: "top 75%",
          end: "top 25%",
          scrub: true,
        },
      }
    );
  }, wrapperRef.value);

  scrollTriggers.push(ctx);
});

onBeforeUnmount(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  scrollTriggers.forEach((trigger) => {
    if (trigger.revert) trigger.revert();
    else if (trigger.kill) trigger.kill();
  });
});

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.footer-reveal-wrapper {
  clip-path: polygon(0% 0, 100% 0%, 100% 100%, 0 100%);
}

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  z-index: -1;
  
  --pill-bg-1: rgba(255, 255, 255, 0.03);
  --pill-bg-2: rgba(255, 255, 255, 0.01);
  --pill-shadow: rgba(0, 0, 0, 0.5);
  --pill-highlight: rgba(255, 255, 255, 0.08);
  --pill-inset-shadow: rgba(0, 0, 0, 0.8);
  --pill-border: rgba(255, 255, 255, 0.06);
  
  --pill-bg-1-hover: rgba(255, 255, 255, 0.08);
  --pill-bg-2-hover: rgba(255, 255, 255, 0.02);
  --pill-border-hover: rgba(255, 255, 255, 0.2);
  --pill-shadow-hover: rgba(0, 0, 0, 0.7);
  --pill-highlight-hover: rgba(255, 255, 255, 0.15);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.75; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.3)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.6)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 45s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* Grid Background */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

/* Aurora Glow */
.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%, 
    rgba(99, 102, 241, 0.1) 0%, 
    rgba(168, 85, 247, 0.08) 40%, 
    transparent 70%
  );
}

/* Glass Pill Theming */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow: 
      0 10px 30px -10px var(--pill-shadow), 
      inset 0 1px 1px var(--pill-highlight), 
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow: 
      0 20px 40px -10px var(--pill-shadow-hover), 
      inset 0 1px 1px var(--pill-highlight-hover);
  color: #ffffff;
}

/* Giant Background Text Masking */
.footer-giant-bg-text {
  font-size: 24vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.04);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Metallic Text Glow */
.footer-text-glow {
  background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.4) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px rgba(255, 255, 255, 0.15));
}
</style>
