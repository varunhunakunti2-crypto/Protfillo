<template>
  <div class="flex items-center space-x-12 px-6">
    <span>{{ t('footer.tagline') }}</span>
    <span class="text-indigo-500/60">✦</span>
    <span>Accountability Redefined</span>
    <span class="text-purple-500/60">✦</span>
    <span>Transparent Tracking</span>
    <span class="text-indigo-500/60">✦</span>
    <span>Creative Development</span>
    <span class="text-purple-500/60">✦</span>
    <span>Absolute Privacy</span>
    <span class="text-indigo-500/60">✦</span>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>
