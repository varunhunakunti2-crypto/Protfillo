<template>
  <main class="not-found">
    <div class="not-found-inner">
      <span class="not-found-bg" aria-hidden="true">404</span>
      <p class="not-found-code">404</p>
      <h1 class="not-found-title">{{ t('notFound.title') }}</h1>
      <p class="not-found-message">{{ t('notFound.message') }}</p>
      <button ref="ctaEl" type="button" class="not-found-cta magnetic-nav" @click="goHome">
        <i class="bi bi-arrow-left" aria-hidden="true"></i>
        <span>{{ t('notFound.cta') }}</span>
      </button>
    </div>
  </main>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { makeMagnetic } from '@/composables/useMagnetic.js';

const { t } = useI18n();
const router = useRouter();

const ctaEl = ref(null);
let magneticCleanup = null;
let previousTitle = '';

const goHome = () => {
  router.push({ name: 'home' });
};

onMounted(() => {
  previousTitle = document.title;
  document.title = `${t('notFound.title')} | Varun`;

  if (typeof window.matchMedia === 'function') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
  }

  const cta = ctaEl.value;
  if (cta) magneticCleanup = makeMagnetic(cta, { strength: 0.2 });
});

onUnmounted(() => {
  document.title = previousTitle;
  if (magneticCleanup) {
    magneticCleanup();
    magneticCleanup = null;
  }
});
</script>

<style scoped>
.not-found {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100svh;
  padding: 6rem 1.5rem 4rem;
  overflow: hidden;
  text-align: center;
  background: var(--theme-bg);
}

.not-found-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 40rem;
  animation: not-found-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.not-found-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(9rem, 34vw, 22rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.04em;
  color: var(--theme-text-strong);
  opacity: 0.04;
  filter: blur(8px);
  user-select: none;
  pointer-events: none;
  white-space: nowrap;
}

.not-found-code {
  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: 700;
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  text-transform: uppercase;
  color: var(--theme-text-muted);
}

.not-found-title {
  position: relative;
  margin-top: 1rem;
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0.02em;
  color: var(--theme-text-strong);
}

.not-found-message {
  position: relative;
  margin-top: 1.25rem;
  max-width: 32rem;
  font-size: clamp(1rem, 1.4vw, 1.15rem);
  font-weight: 500;
  line-height: 1.85;
  color: var(--theme-text-muted);
}

.not-found-cta {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 2.5rem;
  padding: 0.85rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  border-radius: 9999px;
  cursor: pointer;
  color: var(--theme-cta-text);
  background: var(--theme-cta-bg);
  border: 1px solid var(--theme-line-soft);
  transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease;
}

.not-found-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px color-mix(in srgb, var(--theme-cta-bg) 45%, transparent);
}

.not-found-cta:active {
  transform: translateY(0) scale(0.98);
}

.not-found-cta .bi {
  transition: transform 0.25s ease;
}

.not-found-cta:hover .bi {
  transform: translateX(-3px);
}

@keyframes not-found-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .not-found-inner {
    animation: none;
  }

  .not-found-cta,
  .not-found-cta .bi {
    transition: none;
  }
}
</style>
