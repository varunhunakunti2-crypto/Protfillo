<template>
  <div
    class="kb-viewport flex w-full items-center justify-center overflow-x-hidden bg-transparent"
    :style="{ padding: container.padding }"
  >
    <div
      class="flex flex-col items-center"
      :style="{ width: '100%', maxWidth: container.maxWidth }"
    >
      <div
        class="flex items-center justify-center"
        :style="{
          marginBottom: 'clamp(0.65rem, 2.2vw, 1.15rem)',
          minHeight: 'clamp(1.6rem, 3vw, 1.9rem)',
          fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
        }"
      >
        <div
          :style="{
            opacity: indicatorVisible ? 1 : 0,
            transition: 'opacity 220ms ease-out'
          }"
        >
          <div v-if="indicatorParts && indicatorParts.length > 0" class="flex items-center justify-center" style="gap: 5px;">
            <template v-for="(part, i) in indicatorParts" :key="part + '-' + i">
              <span
                v-if="i > 0"
                style="font-size: 0.72rem; font-weight: 500; color: rgba(255,255,255,0.5); line-height: 1;"
              >
                +
              </span>
              <kbd
                style="
                  font-family: inherit;
                  font-size: clamp(0.72rem, 1.3vw, 0.82rem);
                  font-weight: 600;
                  line-height: 1;
                  color: #1a1a1a;
                  background: #e8e8e8;
                  border: 1px solid #555;
                  border-radius: 6px;
                  padding: 5px 8px;
                  box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 2px 4px rgba(0,0,0,0.4);
                  letter-spacing: 0.01em;
                "
              >
                {{ part }}
              </kbd>
            </template>
          </div>
          <span
            v-else
            style="
              font-size: clamp(0.8rem, 1.5vw, 0.9rem);
              font-weight: 500;
              letter-spacing: 0.01em;
              color: rgba(255,255,255,0.35);
            "
          >
            Press any key...
          </span>
        </div>
      </div>
      
      <div style="perspective: 1800px; width: 100%;">
        <div
          class="relative w-full"
          style="transform: rotateX(7deg); transform-origin: 50% 100%;"
        >
          <!-- shadows -->
          <div
            class="absolute inset-x-[16%] top-[99%] -z-10 h-1 rounded-full blur-[1.5px]"
            style="background: rgba(15,10,6,0.2);"
          />
          <div
            class="absolute -inset-x-2 top-14 bottom-0 -z-10 rounded-[1.5rem] blur-lg"
            style="background: radial-gradient(55% 70% at 50% 82%, rgba(15,10,6,0.06), transparent 72%);"
          />
          
          <div
            class="relative rounded-[var(--kb-case-radius)]"
            :style="{
              padding: caseTier.casePadding,
              background: `linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 6%), linear-gradient(178deg, #24272d 0%, #1c1e23 30%, #15161a 65%, #0f1013 100%)`,
              boxShadow: '0 0.5px 0 rgba(255,255,255,0.15) inset, 0 -2px 4px rgba(0,0,0,0.6) inset, 0.4px 0.4px 0.8px rgba(255,255,255,0.08) inset, 0 8px 24px rgba(0,0,0,0.65), 0 2px 5px rgba(0,0,0,0.4)',
              '--kb-case-radius': caseTier.caseRadius,
              '--kb-bezel-radius': caseTier.bezelRadius
            }"
          >
            <!-- case highlights & dark satin textures -->
            <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-case-radius)]" style="background: linear-gradient(112deg, transparent 30%, rgba(255,255,255,0.03) 44%, rgba(255,255,255,0.06) 49%, rgba(255,255,255,0.02) 54%, transparent 68%);" />
            <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-case-radius)]" style="box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.8), inset 1px 0 0 rgba(255,255,255,0.08), inset -1px 0 0 rgba(0,0,0,0.6);" />
            <div class="pointer-events-none absolute inset-[1px] rounded-[calc(var(--kb-case-radius)_-_0.06rem)] border-t border-l border-white/10" />
            <div class="pointer-events-none absolute inset-[1px] rounded-[calc(var(--kb-case-radius)_-_0.06rem)] border-b border-r border-black/50" />
            
            <div
              class="relative rounded-[var(--kb-bezel-radius)]"
              :style="{
                padding: caseTier.bezelPadding,
                background: 'linear-gradient(155deg, #121316 0%, #0a0b0d 50%, #060608 100%)',
                boxShadow: 'inset 0 2.5px 6px rgba(0,0,0,0.8), inset 0 4px 8px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.03), inset 0 0.5px 0 rgba(255,255,255,0.04), inset 0 0 0 1px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04)'
              }"
            >
              <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-bezel-radius)]" style="background: radial-gradient(140% 60% at 44% 0%, rgba(255,255,255,0.02), transparent 45%); z-index: 0;" />
              
              <div class="relative z-10 flex flex-col" :style="{ gap }">
                <div v-for="(row, i) in rows" :key="i" class="flex" :style="{ gap }">
                  <VintageKeyboardKey
                    v-for="keyConfig in row"
                    :key="keyConfig.id"
                    :config="keyConfig"
                    :rowIndex="i"
                    :tier="tier"
                    :registerTrigger="registerTrigger"
                    @activate="activateKey"
                    @deactivate="deactivateKey"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import VintageKeyboardKey from './VintageKeyboardKey.vue';
import { 
  ROWS, 
  getThockEngine, 
  playKeySound, 
  getSoundCategory,
  KEY_PAN,
  CODE_TO_KEY_ID,
  ALL_KEYS_BY_ID,
  MODIFIER_FAMILIES,
  resolveTier,
  CONTAINER_TIERS,
  CASE_TIERS,
  KEY_GAP_TIERS,
  getActiveKeyParts
} from './vintage-keyboard-logic.js';

const rows = ROWS;
const keyTriggersRef = ref({});
const tier = ref(resolveTier());
const container = computed(() => CONTAINER_TIERS[tier.value]);
const caseTier = computed(() => CASE_TIERS[tier.value]);
const gap = computed(() => KEY_GAP_TIERS[tier.value]);

const activeKeyIds = ref([]);
const indicatorParts = ref(null);
const indicatorVisible = ref(true);

let holdTimeout = null;
let fadeTimeout = null;

const registerTrigger = (id, trigger) => {
  keyTriggersRef.value[id] = trigger;
  return () => {
    if (keyTriggersRef.value[id] === trigger) {
      delete keyTriggersRef.value[id];
    }
  };
};

const activateKey = (id) => {
  if (!activeKeyIds.value.includes(id)) {
    activeKeyIds.value.push(id);
  }
};

const deactivateKey = (id) => {
  const index = activeKeyIds.value.indexOf(id);
  if (index !== -1) {
    activeKeyIds.value.splice(index, 1);
  }
};

watch(activeKeyIds, (newVal) => {
  if (holdTimeout !== null) {
    window.clearTimeout(holdTimeout);
    holdTimeout = null;
  }
  if (fadeTimeout !== null) {
    window.clearTimeout(fadeTimeout);
    fadeTimeout = null;
  }

  if (newVal.length > 0) {
    indicatorParts.value = getActiveKeyParts(newVal);
    indicatorVisible.value = true;
    return;
  }

  if (indicatorParts.value !== null) {
    holdTimeout = window.setTimeout(() => {
      indicatorVisible.value = false;
      fadeTimeout = window.setTimeout(() => {
        indicatorParts.value = null;
        indicatorVisible.value = true;
      }, 220);
    }, 550);
  }
}, { deep: true });

onMounted(() => {
  const updateTier = () => {
    tier.value = resolveTier();
  };
  
  const mobileQuery = window.matchMedia("(max-width: 639px)");
  const tabletQuery = window.matchMedia("(max-width: 1023px)");
  
  mobileQuery.addEventListener("change", updateTier);
  tabletQuery.addEventListener("change", updateTier);
  
  getThockEngine();

  const held = new Set();

  const isTypingTarget = (target) => {
    if (!target) return false;
    const tag = target.tagName?.toLowerCase();
    return tag === "input" || tag === "textarea" || target.isContentEditable;
  };

  const releaseKey = (id) => {
    if (!held.has(id)) return;
    held.delete(id);
    keyTriggersRef.value[id]?.release();
    deactivateKey(id);
  };

  const releaseAllHeld = () => {
    held.forEach((id) => {
      keyTriggersRef.value[id]?.release();
      deactivateKey(id);
    });
    held.clear();
  };

  const reconcileModifiers = (event) => {
    if (typeof event.getModifierState !== "function") return;
    for (const { modifier, ids } of MODIFIER_FAMILIES) {
      if (!event.getModifierState(modifier)) {
        for (const id of ids) releaseKey(id);
      }
    }
  };

  const handleKeyDown = (event) => {
    reconcileModifiers(event);

    if (event.code === "AltLeft" || event.code === "AltRight") {
      event.preventDefault();
    }

    if (event.repeat) return;
    if (isTypingTarget(event.target)) return;

    const id = CODE_TO_KEY_ID[event.code];
    if (!id || held.has(id)) return;

    held.add(id);
    keyTriggersRef.value[id]?.press();
    activateKey(id);

    const config = ALL_KEYS_BY_ID[id];
    playKeySound(getSoundCategory(id), !!config?.muted, KEY_PAN[id] ?? 0);
  };

  const handleKeyUp = (event) => {
    reconcileModifiers(event);

    const id = CODE_TO_KEY_ID[event.code];
    if (!id) return;
    releaseKey(id);
  };

  const handleVisibilityChange = () => {
    if (document.hidden) releaseAllHeld();
  };

  const handleFocus = () => releaseAllHeld();

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", releaseAllHeld);
  window.addEventListener("focus", handleFocus);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  onBeforeUnmount(() => {
    mobileQuery.removeEventListener("change", updateTier);
    tabletQuery.removeEventListener("change", updateTier);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("blur", releaseAllHeld);
    window.removeEventListener("focus", handleFocus);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    
    if (holdTimeout !== null) window.clearTimeout(holdTimeout);
    if (fadeTimeout !== null) window.clearTimeout(fadeTimeout);
  });
});
</script>

<style>
.kb-key {
  --tilt: 0deg;
  will-change: transform;
  contain: layout style paint;
  backface-visibility: hidden;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  transform: translateY(0) scale(1) rotate(var(--tilt));
  transition: transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.kb-key[data-pressed="true"] {
  transform: translateY(4.5px) scale(0.975) rotate(calc(var(--tilt) * 0.3));
  transition: transform 15ms linear;
}
.kb-viewport {
  /* Responsive stage: was a hard 100dvh, which pushed the keyboard
     section past the fold on short/mobile viewports. */
  min-height: 55vh;
  min-height: clamp(320px, 58svh, 640px);
}
</style>
