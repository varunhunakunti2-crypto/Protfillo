<template>
  <IntroLoader v-if="showLoader" @done="showLoader = false" />
  <ScrollIndicator v-if="showScrollIndicator" />
  <Background />
  <div class="noise-overlay" aria-hidden="true"></div>
  <Navbar />
  <div class="page-transition" :class="{ 'is-active': isPageTransitioning }" aria-hidden="true">
    <div class="wipe-panel panel-1"></div>
    <div class="wipe-panel panel-2"></div>
    <div class="wipe-panel panel-3"></div>
    <div class="wipe-panel panel-4"></div>
  </div>
  <RouterView />
</template>

<script setup>
import { computed, provide, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "./components/Navbar.vue";
import Background from "./components/Background.vue";
import ScrollIndicator from "./components/ScrollIndicator.vue";
import IntroLoader from "./components/IntroLoader.vue";

const showLoader = ref(true);
const route = useRoute();
const router = useRouter();
const showScrollIndicator = computed(() =>
  route.name === "home" || route.name === "project-progress"
);
const isPageTransitioning = ref(false);
let transitionTimers = [];

const startPageTransition = (onMidpoint) => {
  if (isPageTransitioning.value) return;
  isPageTransitioning.value = true;
  transitionTimers.forEach((timer) => window.clearTimeout(timer));
  transitionTimers = [];

  transitionTimers.push(
    window.setTimeout(() => {
      // Scroll to top while panels cover the screen
      window.scrollTo({ top: 0, behavior: "instant" });
      if (typeof onMidpoint === "function") onMidpoint();
    }, 580)
  );

  transitionTimers.push(
    window.setTimeout(() => {
      isPageTransitioning.value = false;
    }, 1350)
  );
};

provide("startPageTransition", startPageTransition);

// Automate routing page transition
router.beforeEach((to, from, next) => {
  if (!from.name) {
    next();
    return;
  }
  
  if (isPageTransitioning.value) {
    next();
    return;
  }

  startPageTransition(() => {
    next();
  });
});

// Restore scroll position while the intro tiles still cover the screen.
// intro:reveal fires early in the exit animation, before tiles slide away,
// so the user never sees the hero section flash.
window.addEventListener("intro:reveal", () => {
  const saved = sessionStorage.getItem("scrollY");
  if (saved === null) return;
  sessionStorage.removeItem("scrollY");
  // Briefly lift the overflow lock so scrollTo can take effect.
  const prev = document.body.style.overflow;
  document.body.style.overflow = "";
  window.scrollTo({ top: parseInt(saved, 10), behavior: "instant" });
  document.body.style.overflow = prev;
}, { once: true });
</script>

<style>
html {
  scroll-behavior: smooth;
}

/* Multi-panel wipe transition */
.page-transition {
  position: fixed;
  inset: 0;
  z-index: 98;
  pointer-events: none;
}

.wipe-panel {
  position: fixed;
  inset: 0;
  transform: translateY(100%);
}

.panel-1 { background: #292524; }
.panel-2 { background: #57534e; }
.panel-3 { background: #a39e93; }
.panel-4 { background: #d6cfc4; }

:root[data-theme="dark"] .panel-1 { background: #1a1a1a; }
:root[data-theme="dark"] .panel-2 { background: #404040; }
:root[data-theme="dark"] .panel-3 { background: #6b6b6b; }
:root[data-theme="dark"] .panel-4 { background: #9a9a9a; }

.page-transition.is-active .wipe-panel {
  animation: panelWipe 1.1s ease-in-out forwards;
}

.page-transition.is-active .panel-1 { animation-delay: 0s; }
.page-transition.is-active .panel-2 { animation-delay: 0.08s; }
.page-transition.is-active .panel-3 { animation-delay: 0.16s; }
.page-transition.is-active .panel-4 { animation-delay: 0.24s; }

@keyframes panelWipe {
  0% {
    transform: translateY(100%);
  }
  45% {
    transform: translateY(0%);
  }
  55% {
    transform: translateY(0%);
  }
  100% {
    transform: translateY(-100%);
  }
}

/* Hide native scrollbars so the custom indicator is the only one visible */
html,
body {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar {
  width: 0;
  height: 0;
}

/* Dynamic Noise Overlay */
.noise-overlay {
  position: fixed;
  inset: -100%;
  width: 300%;
  height: 300%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.025;
  pointer-events: none;
  z-index: 99;
  animation: noiseAnimation 0.8s steps(4) infinite;
}

@keyframes noiseAnimation {
  0% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -5%); }
  20% { transform: translate(-10%, 5%); }
  30% { transform: translate(5%, -10%); }
  40% { transform: translate(-5%, 15%); }
  50% { transform: translate(-10%, 5%); }
  60% { transform: translate(15%, -5%); }
  70% { transform: translate(0%, 10%); }
  80% { transform: translate(-15%, 15%); }
  90% { transform: translate(10%, -5%); }
  100% { transform: translate(5%, 5%); }
}
</style>
