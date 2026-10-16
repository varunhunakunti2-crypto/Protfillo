<template>
  <section
    id="services"
    ref="sectionEl"
    class="services"
    :class="[isJa ? 'is-ja' : '', reducedMotion ? 'is-reduced' : '']"
  >
    <div ref="stageEl" class="services-stage">
      <div class="services-vignette" aria-hidden="true"></div>

      <!-- Heading: stays in place and readable above the orbit -->
      <header class="services-heading">
        <span class="services-bg-text" aria-hidden="true">{{ t('services.bgText') }}</span>
        <h2 class="services-title">{{ t('services.title') }}</h2>
        <p class="services-intro">{{ t('services.intro') }}</p>
      </header>

      <!-- 3D Orbit Track: cards glide along a curved perspective arc -->
      <div ref="deckEl" class="services-deck">
        <article
          v-for="(card, index) in cards"
          :key="card.key"
          :ref="setCardRef(index)"
          class="svc-card"
          :class="[`svc-card--${card.layout}`, `svc-card--${card.tone}`]"
        >
          <!-- Background tint layer -->
          <div class="svc-card-bg" aria-hidden="true"></div>

          <!-- Left / Content Area -->
          <div class="svc-card-left">
            <div class="svc-card-header">
              <div class="svc-card-eyebrow">
                <span class="svc-badge-dot"></span>
                <span>{{ t('services.soonBadge') }}</span>
              </div>
              <h3 class="svc-card-title">{{ card.title }}</h3>
            </div>

            <div v-if="card.tags.length || card.metric" class="svc-card-footer">
              <ul class="svc-card-tags">
                <li v-for="tag in card.tags" :key="tag" class="svc-card-tag">{{ tag }}</li>
              </ul>
              <div v-if="card.metric" class="svc-card-metric-pill">
                <span class="metric-val">{{ card.metric.val }}</span>
                <span class="metric-label">{{ card.metric.label }}</span>
              </div>
            </div>
          </div>

          <!-- Right Media Preview (Landscape cards) -->
          <div v-if="card.image" class="svc-card-right">
            <div class="svc-card-img-wrap">
              <img
                :src="card.image"
                :alt="card.imageAlt"
                loading="lazy"
                decoding="async"
                class="svc-card-img"
              />
              <div v-if="card.overlay" class="svc-card-stats-wrap">
                <div class="svc-card-stat-val">{{ card.overlay.val }}</div>
                <div class="svc-card-stat-desc">{{ card.overlay.desc }}</div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Scroll hint -->
      <div ref="hintEl" class="services-hint" aria-hidden="true">
        <span>{{ t('services.hint') }}</span>
        <span class="services-hint-line"></span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import freelanceImg from '@/assets/freelance-hub.webp';
import motionImg from '@/assets/motion-showcase.webp';
import galleryImg from '@/assets/animation-gallery.webp';
import vibeVineImg from '@/assets/vibe-vine.webp';
import i18nImg from '@/assets/i18n-showcase.jpg';
import perfImg from '@/assets/perf-showcase.jpg';

const { t, locale } = useI18n();
const isJa = computed(() => locale.value === 'ja');

const sectionEl = ref(null);
const stageEl = ref(null);
const deckEl = ref(null);
const hintEl = ref(null);

const cardEls = [];
const setCardRef = (index) => (el) => {
  if (el) cardEls[index] = el;
};

/*
 * Wispr Flow inspired card lineup with rich landscape showcase cards.
 * Each card features a dedicated visual preview, tone, tags, and metric overlay.
 */
const cardDefs = [
  {
    key: 'fullstack',
    layout: 'landscape',
    tone: 'orange',
    image: freelanceImg,
  },
  {
    key: 'motion',
    layout: 'landscape',
    tone: 'coral',
    image: motionImg,
  },
  {
    key: 'uiux',
    layout: 'landscape',
    tone: 'mint',
    image: galleryImg,
  },
  {
    key: 'i18n',
    layout: 'landscape',
    tone: 'lilac',
    image: i18nImg,
  },
  {
    key: 'performance',
    layout: 'landscape',
    tone: 'cream',
    image: perfImg,
  },
  {
    key: 'integration',
    layout: 'landscape',
    tone: 'lavender',
    image: vibeVineImg,
  },
];

const tagsByKey = {
  fullstack: [],
  motion: [],
  uiux: [],
  i18n: [],
  performance: [],
  integration: [],
};

const cards = computed(() =>
  cardDefs.map((def) => ({
    ...def,
    imageAlt: t('services.comingSoon'),
    title: t('services.comingSoon'),
    tags: tagsByKey[def.key] || [],
  }))
);

const reducedMotion = ref(false);

let scrollTween = null;
let resizeTimer = null;
let motionQuery = null;
let motionListener = null;

/*
 * Exact 3D Curved Orbit Math adapted from Wispr Flow:
 * - Each card rotates about a 3D pivot in the Z-plane: transformOrigin '50% 50% -orbitPx'
 * - RotateX varies with horizontal position (ROT_IN -> 0 -> ROT_OUT)
 * - Perspective projection and shrinkAt keeps uniform visual pacing across the screen
 * - Dynamic zIndex restacking keeps the centered card cleanly in front
 */
const buildOrbitScene = (gsap, ScrollTrigger) => {
  if (scrollTween) {
    if (scrollTween.scrollTrigger) scrollTween.scrollTrigger.kill();
    scrollTween.kill();
    scrollTween = null;
  }

  const section = sectionEl.value;
  const track = deckEl.value;
  const validCards = cardEls.filter(Boolean);
  if (!section || !track || !validCards.length) return;

  const vw = window.innerWidth;
  const mobile = vw < 768;

  // Dynamic parameters matching Wispr Flow
  const GAP_PCT = mobile ? 18 : 14;
  const GAP_MIN_PX = mobile ? 24 : 36;
  const GAP_MAX_PX = 140;
  const ROT_IN = -46;
  const ROT_OUT = 46;
  const ROT_SPAN_PCT = 210;
  const ROT_EASE = 'power1.inOut';
  const SCROLL_RATIO = mobile ? 0.75 : 0.85;

  const widths = validCards.map((c) => c.offsetWidth || (mobile ? 320 : 640));
  const maxW = Math.max(...widths);
  const sorted = widths.slice().sort((a, b) => a - b);
  const medW = sorted[Math.floor(sorted.length / 2)] || maxW;

  const gapPx = Math.min(GAP_MAX_PX, Math.max(GAP_MIN_PX, (medW * GAP_PCT) / 100));

  const offsets = [0];
  for (let i = 1; i < validCards.length; i++) {
    const pairW = (widths[i - 1] + widths[i]) / 2;
    offsets[i] = offsets[i - 1] + pairW + gapPx;
  }
  const spanPx = offsets[offsets.length - 1];

  const travelHalf = (vw + maxW) / 2 + maxW * 0.12;
  const orbitPx = Math.max(220, (medW * 65) / 100);
  const perspPx = (medW * 260) / 100;

  track.style.perspective = `${perspPx}px`;

  // Position cards initially at the center anchor with 3D transform origin
  validCards.forEach((card) => {
    gsap.set(card, {
      xPercent: -50,
      yPercent: -50,
      transformOrigin: `50% 50% -${orbitPx}px`,
      force3D: true,
    });
  });

  const rotEase = gsap.parseEase(ROT_EASE);
  const RAD = Math.PI / 180;
  const rotHalf = (medW * ROT_SPAN_PCT) / 100;

  const rotAt = (sx) => {
    let p = (sx + rotHalf) / (rotHalf * 2);
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    return ROT_IN + (ROT_OUT - ROT_IN) * rotEase(p);
  };

  const shrinkAt = (sx) => {
    const depth = orbitPx * (1 - Math.cos(rotAt(sx) * RAD));
    return perspPx / (perspPx + depth);
  };

  const stretchAt = (sx) => shrinkAt(sx);

  const STEP = 4;
  const LIMIT = travelHalf * 1.25;

  const integrate = (dir) => {
    const tbl = [0];
    let s = 0;
    let guard = 0;
    while (Math.abs(s) < LIMIT && guard++ < 20000) {
      s += dir * STEP * stretchAt(s);
      tbl.push(s);
    }
    return tbl;
  };

  const sPos = integrate(1);
  const sNeg = integrate(-1);

  const screenAt = (u) => {
    const tbl = u >= 0 ? sPos : sNeg;
    const k = Math.abs(u) / STEP;
    const i0 = Math.floor(k);
    if (i0 >= tbl.length - 1) {
      const last = tbl.length - 1;
      const slope = (tbl[last] - tbl[last - 1]) / STEP;
      return tbl[last] + (Math.abs(u) - last * STEP) * slope;
    }
    return tbl[i0] + (tbl[i0 + 1] - tbl[i0]) * (k - i0);
  };

  const restack = () => {
    const order = validCards.slice().sort((a, b) => Math.abs(a._x) - Math.abs(b._x));
    order.forEach((card, rank) => {
      card.style.zIndex = order.length - rank;
    });
  };

  const render = (head) => {
    for (let j = 0; j < validCards.length; j++) {
      const card = validCards[j];
      // When head = 0: card 0 is at 0 (center), card 1 is at offsets[1] > 0 (top-right orbit)
      // As user scrolls down: head increases, card 0 moves to negative u (exits left),
      // and card 1 moves from positive u into 0 (center focus)
      const u = offsets[j] - head;
      const sx = screenAt(u);
      const rot = rotAt(sx);
      const f = shrinkAt(sx);
      card._x = sx;
      card._f = f;
      card._r = rot;
      gsap.set(card, {
        x: sx / f,
        rotateX: rot,
      });
    }
    restack();
  };

  // Start with the first card centered, and advance through the deck
  const headStart = 0;
  const headEnd = spanPx;
  const proxy = { h: headStart };
  render(headStart);

  // Set section height based on deck length to provide a natural, luxurious scrub duration
  const trackH = window.innerHeight;
  section.style.height = `${Math.round(trackH + (headEnd - headStart) * SCROLL_RATIO)}px`;

  // Hint animation: fades out as soon as user starts scrolling into the cards
  const hint = hintEl.value;
  if (hint) {
    gsap.set(hint, { opacity: 1 });
  }

  scrollTween = gsap.to(proxy, {
    h: headEnd,
    ease: 'none',
    onUpdate: () => {
      render(proxy.h);
      if (hint && proxy.h > 40) {
        gsap.to(hint, { opacity: 0, duration: 0.2, overwrite: 'auto' });
      } else if (hint && proxy.h <= 40) {
        gsap.to(hint, { opacity: 1, duration: 0.2, overwrite: 'auto' });
      }
    },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: mobile ? 1 : 1.3,
      invalidateOnRefresh: true,
    },
  });
};

const setup = async () => {
  if (scrollTween) {
    if (scrollTween.scrollTrigger) scrollTween.scrollTrigger.kill();
    scrollTween.kill();
    scrollTween = null;
  }

  if (reducedMotion.value) {
    sectionEl.value?.classList.remove('is-animating');
    return;
  }

  sectionEl.value?.classList.add('is-animating');

  try {
    const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    gsap.registerPlugin(ScrollTrigger);

    await nextTick();
    buildOrbitScene(gsap, ScrollTrigger);

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildOrbitScene(gsap, ScrollTrigger);
        ScrollTrigger.refresh();
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    window.__servicesCleanup = () => {
      window.removeEventListener('resize', handleResize);
    };
  } catch (error) {
    sectionEl.value?.classList.remove('is-animating');
    console.error('[Services] Orbit initialization failed:', error);
  }
};

onMounted(() => {
  if (typeof window.matchMedia === 'function') {
    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.value = motionQuery.matches;
    motionListener = (event) => {
      reducedMotion.value = event.matches;
    };
    motionQuery.addEventListener
      ? motionQuery.addEventListener('change', motionListener)
      : motionQuery.addListener(motionListener);
  }

  setup();
});

watch(reducedMotion, (isReduced) => {
  if (isReduced) {
    sectionEl.value?.classList.remove('is-animating');
  }
  setup();
});

onUnmounted(() => {
  if (motionQuery && motionListener) {
    motionQuery.removeEventListener
      ? motionQuery.removeEventListener('change', motionListener)
      : motionQuery.removeListener(motionListener);
  }
  if (window.__servicesCleanup) {
    window.__servicesCleanup();
    window.__servicesCleanup = null;
  }
  if (scrollTween) {
    if (scrollTween.scrollTrigger) scrollTween.scrollTrigger.kill();
    scrollTween.kill();
    scrollTween = null;
  }
  sectionEl.value?.classList.remove('is-animating');
});
</script>

<style scoped>
/* ---------- Main Section / Sticky Stage ---------- */
.services {
  position: relative;
  background: var(--services-canvas-bg, #0b0b0e);
  color: var(--theme-text-strong);
}

.services-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

@supports (height: 100svh) {
  .services-stage {
    height: 100svh;
  }
}

.services-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 75% 65% at 50% 50%,
    rgba(255, 255, 255, 0.05),
    transparent 75%
  );
  z-index: 1;
}

:global([data-theme='light']) .services-vignette {
  background: radial-gradient(
    ellipse 75% 65% at 50% 50%,
    rgba(0, 0, 0, 0.03),
    transparent 75%
  );
}

/* ---------- Heading ---------- */
.services-heading {
  position: absolute;
  top: clamp(1.6rem, 3.8vh, 2.8rem);
  left: 0;
  right: 0;
  margin: 0 auto;
  width: min(92vw, 42rem);
  text-align: center;
  z-index: 10;
  pointer-events: none;
}

.services-bg-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(2.5rem, 5.5vw, 4.5rem);
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1;
  white-space: nowrap;
  color: var(--theme-text-strong);
  opacity: 0.04;
  filter: blur(10px);
  user-select: none;
  pointer-events: none;
}

.services-title {
  position: relative;
  font-size: clamp(2.1rem, 3.8vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--theme-text-strong);
}

.services-intro {
  position: relative;
  margin: 0.5rem auto 0;
  max-width: 36rem;
  font-size: clamp(0.92rem, 1.2vw, 1.05rem);
  font-weight: 500;
  line-height: 1.55;
  color: var(--theme-text-muted);
}

/* ---------- 3D Deck Track ---------- */
.services-deck {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  pointer-events: none;
}

/* ---------- Service Card Component (Wispr Flow Aesthetic) ---------- */
.svc-card {
  position: absolute;
  left: 50%;
  top: 58vh; /* Comfortably below the header */
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform;
  pointer-events: auto;
  margin: 0;

  display: flex;
  overflow: hidden;
  border-radius: clamp(24px, 2.4vw, 36px);
  color: #16151f;
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 30px 65px -15px rgba(0, 0, 0, 0.5),
              0 12px 28px -10px rgba(0, 0, 0, 0.35),
              inset 0 1px 1.5px rgba(255, 255, 255, 0.5);
  transition: box-shadow 0.3s ease;
}

.svc-card:hover {
  box-shadow: 0 36px 75px -15px rgba(0, 0, 0, 0.6),
              0 16px 36px -10px rgba(0, 0, 0, 0.45),
              inset 0 1px 2px rgba(255, 255, 255, 0.7);
}

/* Background Color Layer */
.svc-card-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: var(--card-bg-color, #ea9a3e);
}

/* Color Palettes matching Reference Image 2 */
.svc-card--orange {
  --card-bg-color: rgb(255, 157, 44); /* Golden amber, Dave Gilboa card */
}

.svc-card--coral {
  --card-bg-color: #ff5836; /* Vibrant flare coral, Clay card */
}

.svc-card--mint {
  --card-bg-color: #92e0b5; /* Fresh mint */
}

.svc-card--lilac {
  --card-bg-color: #c7e3f5; /* Soft lilac orchid */
}

.svc-card--cream {
  --card-bg-color: #f5ebe0; /* Lumen luxury cream */
}

.svc-card--lavender {
  --card-bg-color: #c9bff4; /* Pastel lavender */
}

/* Landscape Card (Split Columns) */
.svc-card--landscape {
  width: clamp(560px, 53vw, 800px);
  height: clamp(360px, 30vw, 410px);
  min-height: 360px;
  flex-direction: row;
  padding: clamp(1rem, 1.3vw, 1.35rem);
  gap: clamp(1.2rem, 1.6vw, 1.8rem);
}

/* Square / Highlight Card (Single Column) */
.svc-card--square {
  width: clamp(340px, 28vw, 400px);
  height: clamp(360px, 30vw, 410px);
  min-height: 360px;
  flex-direction: column;
  padding: clamp(1.4rem, 1.8vw, 1.8rem);
  gap: 1.25rem;
}

/* Card Left / Content Body */
.svc-card-left {
  position: relative;
  z-index: 2;
  flex: 1.15 1 0%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  min-width: 0;
  padding: 0.4rem 0.2rem;
}

.svc-card--square .svc-card-left {
  flex: 1 1 100%;
  padding: 0;
}

.svc-card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  text-align: center;
}

.svc-card-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(22, 21, 31, 0.7);
}

.svc-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.svc-card-title {
  font-size: clamp(1.35rem, 1.7vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.22;
  color: #14131d;
}

/* Card Footer / Tags & Badges */
.svc-card-footer {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-top: auto;
  padding-top: 0.75rem;
}

.svc-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.svc-card-tag {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.28rem 0.65rem;
  border-radius: 9999px;
  background: rgba(20, 19, 29, 0.1);
  color: #14131d;
  backdrop-filter: blur(4px);
}

.svc-card-metric-pill {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 12px;
  background: rgba(20, 19, 29, 0.08);
  width: fit-content;
}

.svc-card-metric-pill .metric-val {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #14131d;
}

.svc-card-metric-pill .metric-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(20, 19, 29, 0.7);
}

/* Right Media Preview */
.svc-card-right {
  position: relative;
  z-index: 2;
  flex: 0.95 1 0%;
  height: 100%;
  min-height: 0;
}

.svc-card-img-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: clamp(16px, 1.6vw, 22px);
  overflow: hidden;
  background: rgba(20, 19, 29, 0.15);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.svc-card-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.svc-card:hover .svc-card-img {
  transform: scale(1.04);
}

/* Stat overlay on the preview image (matching Wispr Flow Clay card) */
.svc-card-stats-wrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1.2rem 1.2rem 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.35) 65%, transparent 100%);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.svc-card-stat-val {
  font-size: clamp(1.2rem, 1.5vw, 1.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: #ffffff;
}

.svc-card-stat-desc {
  font-size: 0.74rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.02em;
}

/* ---------- Scroll Hint ---------- */
.services-hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(1.25rem, 3.5vh, 2.5rem);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--theme-text-soft);
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.services-hint-line {
  width: 1px;
  height: 2.2rem;
  background: linear-gradient(to bottom, var(--theme-line-strong), transparent);
}

/* ---------- Responsive Layouts ---------- */
@media (max-width: 1023px) {
  .svc-card--landscape {
    width: clamp(500px, 68vw, 640px);
    height: clamp(360px, 42vw, 410px);
  }

  .svc-card--square {
    width: clamp(320px, 38vw, 380px);
    height: clamp(360px, 42vw, 410px);
  }
}

@media (max-width: 767px) {
  .services-stage {
    perspective: 1400px;
  }

  .svc-card {
    top: 54vh;
    border-radius: 24px;
  }

  .svc-card--landscape {
    width: min(88vw, 360px);
    height: clamp(400px, 66vh, 460px);
    flex-direction: column-reverse;
    padding: 1.1rem;
    gap: 0.85rem;
  }

  .svc-card--square {
    width: min(88vw, 360px);
    height: clamp(400px, 66vh, 460px);
    padding: 1.3rem;
  }

  .svc-card-right {
    height: 180px;
    flex: none;
  }

  .svc-card-title {
    font-size: 1.25rem;
  }
}

/* ---------- Reduced Motion (Accessible Grid) ---------- */
.services.is-reduced {
  height: auto !important;
  padding: 6rem 1.5rem 5rem;
}

.services.is-reduced .services-stage {
  position: static;
  height: auto;
  overflow: visible;
  display: block;
}

.services.is-reduced .services-vignette,
.services.is-reduced .services-hint,
.services.is-reduced .services-bg-text {
  display: none;
}

.services.is-reduced .services-heading {
  position: static;
  margin: 0 auto 3.5rem;
}

.services.is-reduced .services-deck {
  position: static;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  max-width: 78rem;
  margin: 0 auto;
}

.services.is-reduced .svc-card {
  position: static;
  width: auto;
  height: auto;
  min-height: 380px;
  transform: none !important;
  opacity: 1 !important;
}
</style>

