<template>
  <div
    ref="containerRef"
    class="wa-chat-container"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Chat Card -->
    <transition name="wa-fade-slide">
      <div v-if="isOpen" class="wa-chat-card" @click.stop>
        <div class="wa-chat-card-header">
          <div class="wa-chat-card-avatar">
            <svg viewBox="0 0 448 512" class="wa-avatar-icon">
              <path
                fill="currentColor"
                d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
              />
            </svg>
            <span class="wa-online-indicator"></span>
          </div>
          <div class="wa-chat-card-title-area">
            <span class="wa-chat-card-name">Varun S</span>
            <span class="wa-chat-card-status">Online</span>
          </div>
        </div>
        
        <div class="wa-chat-card-body">
          <p class="wa-chat-greeting">👋 Need a website?</p>
          <p class="wa-chat-subtext">Let's discuss your project.</p>
          <button class="wa-chat-cta" @click="openWhatsApp">
            <span>Chat Now</span>
            <svg viewBox="0 0 24 24" class="wa-cta-arrow">
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- Floating Bubble Button -->
    <button
      class="wa-bubble-btn"
      :class="{ 'wa-pulse': shouldPulse }"
      aria-label="Contact on WhatsApp"
      @click="onBubbleClick"
    >
      <svg viewBox="0 0 448 512" class="wa-bubble-icon">
        <path
          fill="currentColor"
          d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isOpen = ref(false);
const shouldPulse = ref(true);
const isMobile = ref(false);
const containerRef = ref(null);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

const onMouseEnter = () => {
  if (!isMobile.value) {
    isOpen.value = true;
    shouldPulse.value = false;
  }
};

const onMouseLeave = () => {
  if (!isMobile.value) {
    isOpen.value = false;
  }
};

const onBubbleClick = (event) => {
  event.stopPropagation();
  shouldPulse.value = false;
  
  if (isMobile.value) {
    isOpen.value = !isOpen.value;
  } else {
    openWhatsApp();
  }
};

const openWhatsApp = () => {
  const url = "https://wa.me/919019816514?text=Hi%2C%20I%20found%20your%20portfolio%20and%20I%27d%20like%20to%20discuss%20a%20project.";
  window.open(url, '_blank', 'noopener,noreferrer');
};

const onClickOutside = (event) => {
  if (isOpen.value && containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  window.addEventListener('click', onClickOutside);
  
  // Stop pulsing after 8 seconds if no interaction
  setTimeout(() => {
    shouldPulse.value = false;
  }, 8000);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile);
  window.removeEventListener('click', onClickOutside);
});
</script>

<style scoped>
.wa-chat-container {
  position: fixed;
  bottom: 3rem;
  right: 1.5rem;
  z-index: 9999;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: auto;
}

/* Bubble Button */
.wa-bubble-btn {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 999px;
  background: var(--theme-pill-bg);
  border: 1px solid var(--theme-pill-border);
  color: var(--theme-text-strong);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
  outline: none;
}

.wa-bubble-btn:hover {
  transform: translateX(-2px) scale(1.04);
  background: #25d366;
  border-color: #25d366;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.3);
}

.wa-bubble-btn:active {
  transform: translateX(-2px) scale(0.95);
}

.wa-bubble-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Pulse / Bounce Animation */
.wa-bubble-btn.wa-pulse {
  animation: wa-bounce-pulse 2.2s infinite ease-in-out;
}

@keyframes wa-bounce-pulse {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* Chat Card */
.wa-chat-card {
  width: 290px;
  background-color: var(--theme-nav-bg, rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 1px solid var(--theme-line-soft, rgba(0, 0, 0, 0.1));
  border-radius: 18px;
  box-shadow: 0 10px 30px -10px var(--theme-line-shadow, rgba(0, 0, 0, 0.15)),
              0 20px 40px -15px rgba(0, 0, 0, 0.08);
  margin-bottom: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Card Header */
.wa-chat-card-header {
  padding: 16px;
  background-color: rgba(37, 211, 102, 0.08);
  border-bottom: 1px solid var(--theme-line-soft, rgba(0, 0, 0, 0.06));
  display: flex;
  align-items: center;
  gap: 12px;
}

.wa-chat-card-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  background-color: #25d366;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wa-avatar-icon {
  width: 24px;
  height: 24px;
}

.wa-online-indicator {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  background-color: #4ade80;
  border: 2px solid white;
  border-radius: 50%;
}

.wa-chat-card-title-area {
  display: flex;
  flex-direction: column;
}

.wa-chat-card-name {
  font-weight: 700;
  font-size: 15px;
  color: var(--theme-text-strong, #0f172a);
}

.wa-chat-card-status {
  font-size: 11px;
  color: #25d366;
  font-weight: 500;
}

/* Card Body */
.wa-chat-card-body {
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wa-chat-greeting {
  font-weight: 700;
  font-size: 16px;
  margin: 0;
  color: var(--theme-text-strong, #0f172a);
}

.wa-chat-subtext {
  font-size: 13.5px;
  margin: 0 0 6px 0;
  color: var(--theme-text-muted, #475569);
  line-height: 1.4;
}

.wa-chat-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  border: none;
  background-color: var(--theme-cta-bg, #0f172a);
  color: var(--theme-cta-text, #ffffff);
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.wa-chat-cta:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

.wa-chat-cta:active {
  transform: translateY(0);
}

.wa-cta-arrow {
  width: 16px;
  height: 16px;
}

/* Fade Slide Transitions */
.wa-fade-slide-enter-active,
.wa-fade-slide-leave-active {
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.wa-fade-slide-enter-from,
.wa-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

/* Mobile responsive fixes */
@media (max-width: 480px) {
  .wa-chat-container {
    bottom: 1.5rem;
    right: 1.5rem;
  }
  
  .wa-chat-card {
    width: calc(100vw - 3rem);
    max-width: 280px;
  }
}
</style>
