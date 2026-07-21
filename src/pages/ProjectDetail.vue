<template>
  <main class="project-detail-page">
    <button class="project-back" type="button" @click="goBack">
      <span class="project-back-icon">←</span>
      <span>{{ t("projectDetail.back") }}</span>
    </button>

    <section class="project-detail-wrapper">
      <header class="project-header">
        <span class="project-status">{{ currentProject.status }}</span>
        <h1 class="project-title">{{ currentProject.title }}</h1>
      </header>

      <div class="project-content">
        <!-- Overview / Description -->
        <article v-if="currentProject.sections?.description" class="project-section">
          <h2>{{ currentProject.sections.description.title }}</h2>
          <p v-if="currentProject.sections.description.p1">{{ currentProject.sections.description.p1 }}</p>
          <p v-if="currentProject.sections.description.p2">{{ currentProject.sections.description.p2 }}</p>
        </article>

        <!-- Key Features -->
        <article v-if="featureItems.length" class="project-section">
          <h2>{{ currentProject.sections.features.title }}</h2>
          <ul class="project-list">
            <li v-for="(item, i) in featureItems" :key="i">
              {{ item }}
            </li>
          </ul>
        </article>

        <!-- Tech Stack -->
        <article v-if="currentProject.sections?.techStack" class="project-section">
          <h2>{{ currentProject.sections.techStack.title }}</h2>
          <div class="tech-grid">
            <div v-if="currentProject.sections.techStack.frontend" class="tech-card">
              <span class="tech-label">Frontend</span>
              <span class="tech-value">{{ currentProject.sections.techStack.frontend }}</span>
            </div>
            <div v-if="currentProject.sections.techStack.backend" class="tech-card">
              <span class="tech-label">Backend / Build</span>
              <span class="tech-value">{{ currentProject.sections.techStack.backend }}</span>
            </div>
            <div v-if="currentProject.sections.techStack.database" class="tech-card">
              <span class="tech-label">Database / Package Manager</span>
              <span class="tech-value">{{ currentProject.sections.techStack.database }}</span>
            </div>
            <div v-if="currentProject.sections.techStack.auth" class="tech-card">
              <span class="tech-label">Auth / Code Quality</span>
              <span class="tech-value">{{ currentProject.sections.techStack.auth }}</span>
            </div>
            <div v-if="currentProject.sections.techStack.deployment" class="tech-card">
              <span class="tech-label">Deployment</span>
              <span class="tech-value">{{ currentProject.sections.techStack.deployment }}</span>
            </div>
          </div>
        </article>

        <!-- Main Modules / Skills -->
        <article v-if="moduleItems.length" class="project-section">
          <h2>{{ currentProject.sections.modules.title }}</h2>
          <div class="modules-flex">
            <span v-for="(item, i) in moduleItems" :key="i" class="module-chip">
              {{ item }}
            </span>
          </div>
        </article>

        <!-- Highlights / Possible Libraries -->
        <article v-if="highlightItems.length" class="project-section">
          <h2>{{ currentProject.sections.highlights.title }}</h2>
          <ul class="project-list">
            <li v-for="(item, i) in highlightItems" :key="i">
              {{ item }}
            </li>
          </ul>
        </article>
      </div>
    </section>
  </main>
  <Footer />
</template>

<script setup>
import { computed, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Footer from "@/components/Footer.vue";

const { t, tm } = useI18n();
const route = useRoute();
const router = useRouter();
const startPageTransition = inject("startPageTransition", null);

const activeId = computed(() => String(route.query.id || "1"));

const currentProject = computed(() => {
  const details = tm("projectDetails");
  if (details && details[activeId.value]) {
    return details[activeId.value];
  }
  return details && details["1"] ? details["1"] : {
    status: t("projectDetail.status"),
    title: t("projectDetail.title"),
    sections: {}
  };
});

const featureItems = computed(() => {
  const items = currentProject.value.sections?.features?.items;
  return Array.isArray(items) ? items : [];
});

const moduleItems = computed(() => {
  const items = currentProject.value.sections?.modules?.items;
  return Array.isArray(items) ? items : [];
});

const highlightItems = computed(() => {
  const items = currentProject.value.sections?.highlights?.items;
  return Array.isArray(items) ? items : [];
});

const goBack = () => {
  const navigate = () => {
    router.push({ name: "home", query: { section: "projects-anchor" } });
  };
  if (startPageTransition) {
    startPageTransition(navigate);
  } else {
    navigate();
  }
};
</script>

<style scoped>
.project-detail-page {
  min-height: 100vh;
  padding: clamp(6rem, 10vw, 8rem) clamp(1.25rem, 5vw, 4.5rem) clamp(3rem, 8vw, 6rem);
  color: var(--theme-text-strong);
  position: relative;
}

.project-detail-wrapper {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.project-back {
  position: absolute;
  top: 1.25rem;
  left: clamp(1.5rem, 5vw, 4rem);
  z-index: 101;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--theme-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease;
}

.project-back:hover {
  color: var(--theme-text-strong);
  transform: translateX(-4px);
}

.project-back-icon {
  font-size: 1.1rem;
}

/* Header */
.project-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.project-status {
  display: inline-block;
  width: fit-content;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--theme-cta-text);
  background: var(--theme-cta-bg);
  border-radius: 2rem;
}

.project-title {
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 0;
}

/* Content sections */
.project-content {
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
}

.project-section h2 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.85rem 0;
  color: var(--theme-text-strong);
  letter-spacing: -0.01em;
}

.project-section p {
  margin: 0 0 0.85rem 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--theme-text-muted);
}

.project-section p:last-child {
  margin-bottom: 0;
}

/* Bullet Lists */
.project-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.project-list li {
  position: relative;
  padding-left: 1.5rem;
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--theme-text-muted);
}

.project-list li::before {
  content: "•";
  position: absolute;
  left: 0.3rem;
  top: 0;
  color: var(--theme-cta-bg);
  font-size: 1.2rem;
  line-height: 1.4;
}

/* Tech Grid */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}

.tech-card {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  background: var(--project-card-bg, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--project-card-border, rgba(255, 255, 255, 0.08));
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tech-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--theme-text-soft, #a0aec0);
}

.tech-value {
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--theme-text-strong);
}

/* Modules Flex Chips */
.modules-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.module-chip {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--project-card-bg, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--project-card-border, rgba(255, 255, 255, 0.08));
  color: var(--theme-text-strong);
}

@media (max-width: 768px) {
  .project-detail-page {
    padding-top: 5rem;
  }

  .project-back {
    font-size: 0.8rem;
  }

  .project-section p,
  .project-list li {
    font-size: 1rem;
  }
}
</style>
