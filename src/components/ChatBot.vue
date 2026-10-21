<template>
  <div
    v-if="ready"
    ref="rootRef"
    class="bot-root"
    :class="{ 'is-open': isOpen, 'is-hidden': isHidden }"
  >
    <!-- Nudge bubble, shown once if the visitor never opens the chat -->
    <transition name="bot-teaser">
      <button
        v-if="showTeaser"
        class="bot-teaser"
        type="button"
        @click.stop="openChat"
      >
        {{ t("chatbot.teaser") }}
      </button>
    </transition>

    <!-- Chat panel -->
    <transition name="bot-panel">
      <section
        v-if="isOpen"
        class="bot-panel"
        role="dialog"
        :aria-label="t('chatbot.title')"
        @click.stop
      >
        <header class="bot-header">
          <span class="bot-avatar" aria-hidden="true">
            V
            <span class="bot-online"></span>
          </span>
          <span class="bot-head-text">
            <span class="bot-title">{{ t("chatbot.title") }}</span>
            <span class="bot-status">{{ t("chatbot.status") }}</span>
          </span>
          <button
            class="bot-icon-btn"
            type="button"
            :aria-label="t('chatbot.close')"
            @click="closeChat"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </header>

        <div
          ref="listRef"
          class="bot-messages"
          data-lenis-prevent
          aria-live="polite"
        >
          <div class="bot-msg bot-msg--assistant">
            <p class="bot-bubble bot-bubble--intro">{{ t("chatbot.greeting") }}</p>
            <p class="bot-bubble bot-bubble--intro bot-bubble--soft">
              {{ t("chatbot.greetingSub") }}
            </p>
          </div>

          <div
            v-for="m in messages"
            :key="m.id"
            class="bot-msg"
            :class="m.role === 'user' ? 'bot-msg--user' : 'bot-msg--assistant'"
          >
            <p class="bot-bubble">{{ m.content }}</p>
          </div>

          <div v-if="isTyping" class="bot-msg bot-msg--assistant">
            <p class="bot-bubble bot-typing" :aria-label="t('chatbot.thinking')">
              <span></span><span></span><span></span>
            </p>
          </div>
        </div>

        <div v-if="showSuggestions" class="bot-suggestions">
          <button
            v-for="s in suggestions"
            :key="s"
            class="bot-chip"
            type="button"
            @click="sendPreset(s)"
          >
            {{ s }}
          </button>
        </div>

        <p v-if="errorMessage" class="bot-error" role="alert">{{ errorMessage }}</p>

        <form class="bot-composer" @submit.prevent="sendMessage">
          <textarea
            ref="inputRef"
            v-model="draft"
            class="bot-input"
            rows="1"
            :placeholder="t('chatbot.placeholder')"
            :aria-label="t('chatbot.placeholder')"
            @keydown="onInputKeydown"
            @input="resizeInput"
          ></textarea>
          <button
            class="bot-send"
            type="submit"
            :disabled="!canSend"
            :aria-label="t('chatbot.send')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 12h15M13 6l6 6-6 6"
              />
            </svg>
          </button>
        </form>
      </section>
    </transition>

    <!-- Floating action button -->
    <button
      class="bot-fab"
      type="button"
      :aria-label="isOpen ? t('chatbot.close') : t('chatbot.open')"
      :aria-expanded="isOpen"
      @click.stop="toggle"
    >
      <svg v-if="!isOpen" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          stroke-width="1.9"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.9 8.9 0 0 1-3.8-.8L3 21l1.9-5.2A8.2 8.2 0 0 1 4 11.5 8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          d="M6 6l12 12M18 6L6 18"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const STORAGE_KEY = "protfillo-chat";
const HISTORY_LIMIT = 14;

const ready = ref(false);
const isOpen = ref(false);
const isHidden = ref(false);
const showTeaser = ref(false);
const isTyping = ref(false);
const errorMessage = ref("");
const draft = ref("");
const messages = ref([]);

const rootRef = ref(null);
const listRef = ref(null);
const inputRef = ref(null);

const timers = [];

const suggestions = computed(() => t("chatbot.suggestions"));
const showSuggestions = computed(
  () => messages.value.length === 0 && !isTyping.value && !errorMessage.value
);
const canSend = computed(() => draft.value.trim().length > 0 && !isTyping.value);

let idCounter = 0;
const nextId = () => `m${Date.now().toString(36)}-${(idCounter += 1)}`;

/* ---------------- persistence ---------------- */

const loadHistory = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    messages.value = parsed
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .slice(-HISTORY_LIMIT);
  } catch {
    /* corrupted history is not worth breaking the widget over */
  }
};

const saveHistory = () => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.value.slice(-HISTORY_LIMIT))
    );
  } catch {
    /* private mode / quota - chat still works, it just won't resume */
  }
};

watch(messages, saveHistory, { deep: true });

/* ---------------- open / close ---------------- */

const scrollToBottom = () => {
  nextTick(() => {
    const el = listRef.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
};

const openChat = () => {
  isOpen.value = true;
  isHidden.value = false;
  showTeaser.value = false;
  scrollToBottom();
  nextTick(() => inputRef.value?.focus());
};

const closeChat = () => {
  isOpen.value = false;
};

const toggle = () => (isOpen.value ? closeChat() : openChat());

/* ---------------- messaging ---------------- */

const sendMessage = async () => {
  const content = draft.value.trim();
  if (!content || isTyping.value) return;

  errorMessage.value = "";
  draft.value = "";
  resetInputSize();

  messages.value = [...messages.value, { id: nextId(), role: "user", content }];
  isTyping.value = true;
  scrollToBottom();

  try {
    const history = messages.value
      .slice(-HISTORY_LIMIT)
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, locale: locale.value }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.reply) {
      throw new Error(data.error || `request_failed_${res.status}`);
    }

    messages.value = [
      ...messages.value,
      { id: nextId(), role: "assistant", content: data.reply },
    ];
  } catch {
    errorMessage.value = t("chatbot.error");
  } finally {
    isTyping.value = false;
    scrollToBottom();
    nextTick(() => inputRef.value?.focus());
  }
};

const sendPreset = (text) => {
  draft.value = text;
  sendMessage();
};

const onInputKeydown = (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    sendMessage();
  }
};

const resizeInput = () => {
  const el = inputRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
};

const resetInputSize = () => {
  const el = inputRef.value;
  if (el) el.style.height = "auto";
};

/* ---------------- lifecycle ---------------- */

const onWindowClick = (event) => {
  if (isOpen.value && rootRef.value && !rootRef.value.contains(event.target)) {
    closeChat();
  }
};

const onKeydown = (event) => {
  if (event.key === "Escape" && isOpen.value) closeChat();
};

/* ---------------- hide on scroll ---------------- */

let lastScrollY = 0;

const onScroll = () => {
  // Keep the button visible while the panel is open or near the top of the page.
  if (isOpen.value) return;

  const y = window.scrollY;
  if (y <= 80) {
    isHidden.value = false;
  } else if (y > lastScrollY + 4) {
    isHidden.value = true; // scrolling down -> tuck the icon away
  } else if (y < lastScrollY - 4) {
    isHidden.value = false; // scrolling up -> bring it back
  }
  lastScrollY = y;
};

const setTimer = (fn, delay) => {
  const id = window.setTimeout(fn, delay);
  timers.push(id);
  return id;
};

onMounted(() => {
  loadHistory();

  // Wait for the intro loader to reveal the page, with a safety net in case
  // the loader is skipped (e.g. returning visitor with a cached session).
  const reveal = () => {
    ready.value = true;
    window.clearTimeout(fallbackTimer);
  };
  const fallbackTimer = setTimer(reveal, 3500);
  window.addEventListener("intro:reveal", reveal, { once: true });

  window.addEventListener("click", onWindowClick);
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("scroll", onScroll, { passive: true });
  lastScrollY = window.scrollY;

  // Offer a one-time nudge after a short delay.
  setTimer(() => {
    if (isOpen.value) return;
    showTeaser.value = true;
    setTimer(() => {
      showTeaser.value = false;
    }, 7000);
  }, 11000);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", onWindowClick);
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("scroll", onScroll);
  timers.forEach((id) => window.clearTimeout(id));
});

watch(locale, () => {
  errorMessage.value = "";
});
</script>

<style scoped>
/* ---------------- layout ---------------- */

.bot-root {
  position: fixed;
  bottom: calc(3rem + var(--safe-bottom, 0px));
  right: calc(1.5rem + var(--safe-right, 0px));
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, sans-serif;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.25s ease;
}

/* Slid out of view while scrolling down; returns on scroll up. */
.bot-root.is-hidden {
  transform: translateY(calc(100% + 4rem));
  opacity: 0;
  pointer-events: none;
}

/* ---------------- floating action button ---------------- */

.bot-fab {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: var(--theme-pill-bg);
  border: 1px solid var(--theme-pill-border);
  color: var(--theme-text-strong);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease,
    border-color 0.25s ease, box-shadow 0.25s ease;
  outline: none;
}

.bot-fab svg {
  width: 1.35rem;
  height: 1.35rem;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.bot-fab:hover {
  transform: scale(1.06);
  background: var(--theme-cta-bg);
  border-color: var(--theme-cta-bg);
  color: var(--theme-cta-text);
  box-shadow: 0 10px 26px -12px var(--theme-line-shadow, rgba(0, 0, 0, 0.4));
}

.bot-fab:active {
  transform: scale(0.95);
}

.bot-root.is-open .bot-fab svg {
  transform: rotate(90deg);
}

/* ---------------- teaser ---------------- */

.bot-teaser {
  max-width: 220px;
  padding: 10px 14px;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.35;
  text-align: left;
  color: var(--theme-text-strong);
  background-color: var(--theme-nav-bg, rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 1px solid var(--theme-line-soft, rgba(0, 0, 0, 0.1));
  border-radius: 14px;
  box-shadow: 0 10px 30px -14px var(--theme-line-shadow, rgba(0, 0, 0, 0.3));
  cursor: pointer;
}

/* ---------------- panel ---------------- */

.bot-panel {
  display: flex;
  flex-direction: column;
  width: min(360px, calc(100vw - 3rem));
  height: min(560px, 74dvh);
  background-color: var(--theme-nav-bg, rgba(255, 255, 255, 0.92));
  backdrop-filter: blur(18px) saturate(125%);
  -webkit-backdrop-filter: blur(18px) saturate(125%);
  border: 1px solid var(--theme-line-soft, rgba(0, 0, 0, 0.1));
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 18px 50px -18px var(--theme-line-shadow, rgba(0, 0, 0, 0.35)),
    0 30px 60px -30px rgba(0, 0, 0, 0.25);
}

.bot-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background-color: var(--theme-pill-bg);
  border-bottom: 1px solid var(--theme-line-soft, rgba(0, 0, 0, 0.08));
}

.bot-avatar {
  position: relative;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
  color: var(--theme-cta-text);
  background: var(--theme-cta-bg);
}

.bot-online {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #4ade80;
  border: 2px solid var(--theme-bg, #fff);
}

.bot-head-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.bot-title {
  font-weight: 700;
  font-size: 14.5px;
  color: var(--theme-text-strong);
}

.bot-status {
  font-size: 11px;
  font-weight: 500;
  color: #4ade80;
}

.bot-icon-btn {
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: transparent;
  color: var(--theme-text-muted);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.bot-icon-btn:hover {
  background: var(--theme-pill-bg);
  color: var(--theme-text-strong);
}

.bot-icon-btn svg {
  width: 16px;
  height: 16px;
}

/* ---------------- messages ---------------- */

.bot-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
}

.bot-messages::-webkit-scrollbar {
  width: 5px;
}

.bot-messages::-webkit-scrollbar-thumb {
  background: var(--theme-line-soft);
  border-radius: 999px;
}

.bot-msg {
  display: flex;
  flex-direction: column;
  animation: bot-rise 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.bot-msg--user {
  align-items: flex-end;
}

.bot-msg--assistant {
  align-items: flex-start;
}

.bot-bubble {
  margin: 0;
  max-width: 84%;
  padding: 9px 13px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  border-radius: 16px;
  color: var(--theme-text-strong);
  background: var(--theme-pill-bg);
  border: 1px solid var(--theme-pill-border);
}

.bot-msg--user .bot-bubble {
  color: var(--theme-cta-text);
  background: var(--theme-cta-bg);
  border-color: var(--theme-cta-bg);
  border-bottom-right-radius: 6px;
}

.bot-msg--assistant .bot-bubble {
  border-bottom-left-radius: 6px;
}

.bot-bubble--intro {
  max-width: 100%;
  background: transparent;
  border: none;
  padding: 0;
  font-weight: 700;
}

.bot-bubble--soft {
  font-weight: 400;
  font-size: 13.5px;
  color: var(--theme-text-muted);
  margin-top: 2px;
}

@keyframes bot-rise {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* typing indicator */
.bot-typing {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 13px 14px;
}

.bot-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--theme-text-muted);
  animation: bot-dot 1.2s infinite ease-in-out;
}

.bot-typing span:nth-child(2) {
  animation-delay: 0.15s;
}

.bot-typing span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes bot-dot {
  0%,
  60%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

/* ---------------- suggestions / error ---------------- */

.bot-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding: 0 14px 10px;
}

.bot-chip {
  font-size: 12.5px;
  font-weight: 600;
  padding: 7px 11px;
  border-radius: 999px;
  border: 1px solid var(--theme-line-soft);
  background: transparent;
  color: var(--theme-text-muted);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.bot-chip:hover {
  background: var(--theme-cta-bg);
  border-color: var(--theme-cta-bg);
  color: var(--theme-cta-text);
}

.bot-error {
  margin: 0 14px 8px;
  padding: 8px 11px;
  font-size: 12.5px;
  line-height: 1.4;
  border-radius: 10px;
  color: #b91c1c;
  background: rgba(185, 28, 28, 0.1);
  border: 1px solid rgba(185, 28, 28, 0.22);
}

:root[data-theme="dark"] .bot-error {
  color: #fca5a5;
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.25);
}

/* ---------------- composer ---------------- */

.bot-composer {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 12px calc(10px + var(--safe-bottom, 0px));
  border-top: 1px solid var(--theme-line-soft, rgba(0, 0, 0, 0.08));
}

.bot-input {
  flex: 1;
  min-width: 0;
  max-height: 96px;
  resize: none;
  padding: 10px 13px;
  font: inherit;
  font-size: 14px;
  line-height: 1.45;
  color: var(--theme-text-strong);
  background: var(--theme-pill-bg);
  border: 1px solid var(--theme-pill-border);
  border-radius: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.bot-input::placeholder {
  color: var(--theme-text-soft);
}

.bot-input:focus {
  border-color: var(--theme-line-strong);
}

.bot-send {
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid var(--theme-cta-bg);
  background: var(--theme-cta-bg);
  color: var(--theme-cta-text);
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.bot-send svg {
  width: 17px;
  height: 17px;
}

.bot-send:hover:not(:disabled) {
  transform: translateX(2px);
}

.bot-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ---------------- transitions ---------------- */

.bot-panel-enter-active,
.bot-panel-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.bot-panel-enter-from,
.bot-panel-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}

.bot-teaser-enter-active,
.bot-teaser-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.bot-teaser-enter-from,
.bot-teaser-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ---------------- responsive ---------------- */

@media (max-width: 480px) {
  .bot-root {
    bottom: calc(1.5rem + var(--safe-bottom, 0px));
    right: calc(1.5rem + var(--safe-right, 0px));
  }

  .bot-panel {
    width: calc(100vw - 2rem);
    height: min(76dvh, 520px);
  }

  .bot-teaser {
    max-width: calc(100vw - 6rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bot-root {
    transition: none;
  }

  .bot-msg,
  .bot-typing span,
  .bot-panel-enter-active,
  .bot-panel-leave-active,
  .bot-teaser-enter-active,
  .bot-teaser-leave-active {
    animation: none !important;
    transition: none !important;
  }
}
</style>
