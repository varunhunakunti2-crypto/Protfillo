<template>
  <div id="contact" ref="contactWrapper" class="contact-wrapper relative z-10 w-full bg-[color:var(--theme-bg)] shadow-2xl">
    <section
      ref="contactSection"
      class="w-full"
    >
      <div class="flex flex-col md:flex-row min-h-[85vh] w-full items-stretch">
        <!-- Left Panel: Image ONLY (No text overlay, fills height, crops sides) -->
        <div class="contact-left-panel relative flex w-full md:w-1/2 items-center justify-center bg-[color:var(--theme-bg)] min-h-[40vh] md:min-h-[85vh] overflow-hidden opacity-0">
          <img
            :src="contactLeftBg"
            alt="Varun S character illustration"
            class="w-full h-full object-cover shadow-xl"
          />
        </div>

        <!-- Right Panel: Text Content + Form -->
        <div class="flex w-full md:w-1/2 flex-col justify-center bg-[color:var(--theme-nav-bg)] p-8 md:p-16 lg:p-20 border-t md:border-t-0 md:border-l border-[color:var(--theme-line-soft)]">
          <div class="w-full max-w-md mx-auto space-y-8">
            <!-- Header Text -->
            <div class="contact-right-panel-item text-left space-y-3 opacity-0">
              <h2 class="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {{ t('contact.title') }}
              </h2>
              <p class="text-sm md:text-base text-neutral-400">
                {{ t('contact.subtitle') }}
              </p>
            </div>

            <!-- Success State -->
            <div v-if="formSubmitted" class="flex flex-col items-center text-center justify-center py-6 space-y-4">
              <div ref="lottieContainer" class="w-48 h-48"></div>
              <h3 class="text-xl font-bold text-white">{{ t('contact.successTitle') }}</h3>
              <p v-if="isJa" class="text-neutral-400 text-sm">
                {{ t('contact.successMessageLine1') }}<br class="hidden md:inline" />{{ t('contact.successMessageLine2') }}
              </p>
              <p v-else class="text-neutral-400 text-sm">
                {{ t('contact.successMessage') }}
              </p>
            </div>

            <!-- Form State -->
            <div v-else class="w-full space-y-5">
              <form
                ref="formRef"
                class="space-y-4"
                name="contact"
                method="POST"
                novalidate
                @submit.prevent="handleSubmit"
              >
                <input type="hidden" name="form-name" value="contact" />
                <!-- Honeypot fields for bot detection -->
                <p style="display: none;">
                  <label>Don't fill this out: <input name="bot-field" /></label>
                </p>
                <input type="text" name="website" style="position: absolute; left: -9999px;" tabindex="-1" autocomplete="off" />
                <input type="hidden" name="_gotcha" />

                <!-- Name field -->
                <div class="contact-right-panel-item space-y-1.5 text-left opacity-0">
                  <label class="text-xs font-medium text-neutral-300">{{ t('contact.nameLabel') }}</label>
                  <input
                    v-model.trim="formState.name"
                    class="flex h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    :class="{ 'border-red-500 focus:ring-red-500': errors.name }"
                    type="text"
                    name="name"
                    autocomplete="name"
                    maxlength="60"
                    :placeholder="t('contact.namePlaceholder')"
                    :aria-invalid="Boolean(errors.name)"
                    @blur="handleBlur('name')"
                    @input="handleInput('name')"
                  />
                  <p v-if="errors.name" class="text-xs font-medium text-red-500">{{ errors.name }}</p>
                </div>

                <!-- Email field -->
                <div class="contact-right-panel-item space-y-1.5 text-left opacity-0">
                  <label class="text-xs font-medium text-[color:var(--theme-text-muted)]">{{ t('contact.emailLabel') }}</label>
                  <input
                    ref="emailInputRef"
                    v-model.trim="formState.email"
                    class="flex h-10 w-full rounded-md border border-[color:var(--theme-pill-border)] bg-[color:var(--theme-pill-bg)] px-3 py-2 text-sm text-[color:var(--theme-text-strong)] placeholder-[color:var(--theme-text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    :class="{ 'border-red-500 focus:ring-red-500': errors.email }"
                    type="email"
                    name="email"
                    autocomplete="email"
                    inputmode="email"
                    maxlength="120"
                    :placeholder="t('contact.emailPlaceholder')"
                    :aria-invalid="Boolean(errors.email)"
                    @blur="handleBlur('email')"
                    @input="handleInput('email')"
                    required
                  />
                  <p v-if="errors.email" class="text-xs font-medium text-red-500">{{ errors.email }}</p>
                  <p v-else-if="emailWarning" class="text-xs font-medium text-yellow-500">{{ emailWarning }}</p>
                </div>

                <!-- Message field -->
                <div class="contact-right-panel-item space-y-1.5 text-left opacity-0">
                  <label class="text-xs font-medium text-neutral-300">{{ t('contact.messageLabel') }}</label>
                  <textarea
                    v-model.trim="formState.message"
                    class="flex min-h-[95px] w-full rounded-md border border-[color:var(--theme-pill-border)] bg-[color:var(--theme-pill-bg)] px-3 py-2 text-sm text-[color:var(--theme-text-strong)] placeholder-[color:var(--theme-text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    :class="{ 'border-red-500 focus:ring-red-500': errors.message }"
                    rows="3"
                    name="message"
                    maxlength="2000"
                    :placeholder="t('contact.messagePlaceholder')"
                    :aria-invalid="Boolean(errors.message)"
                    @blur="handleBlur('message')"
                    @input="handleInput('message')"
                  ></textarea>
                  <p v-if="errors.message" class="text-xs font-medium text-red-500">{{ errors.message }}</p>
                </div>

                <!-- Submit button wrapper -->
                <div class="contact-right-panel-item opacity-0">
                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black hover:bg-neutral-200 h-10 px-4 py-2 cursor-pointer"
                  >
                    <svg
                      v-if="isSubmitting"
                      class="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {{ isSubmitting ? t('contact.sendLoading') : t('contact.send') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import contactLeftBg from '@/assets/contact-left-bg.jpg';

const contactWrapper = ref(null);
const contactSection = ref(null);
const lottieContainer = ref(null);
const formRef = ref(null);
const emailInputRef = ref(null);
const { t, locale } = useI18n();
let successLottieAnim = null;
const isJa = computed(() => locale.value === 'ja');

const formState = ref({
  name: '',
  email: '',
  message: '',
});

const touched = ref({
  name: false,
  email: false,
  message: false,
});

const errors = ref({
  name: '',
  email: '',
  message: '',
});
const emailWarning = ref('');

const isSubmitting = ref(false);
const formSubmitted = ref(false);
const formLoadTime = ref(Date.now());
let lastSubmitTime = 0;

let revealTimeline = null;
let mountToken = 0;

const resetForm = () => {
  formState.value = {
    name: '',
    email: '',
    message: '',
  };
  touched.value = {
    name: false,
    email: false,
    message: false,
  };
  errors.value = {
    name: '',
    email: '',
    message: '',
  };
  emailWarning.value = '';
};

const practicalEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;
const trustedEmailDomains = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'mail.com',
  'fastmail.com',
  'yahoo.co.jp',
  'docomo.ne.jp',
  'ezweb.ne.jp',
  'au.com',
  'softbank.ne.jp',
  'i.softbank.jp',
  'ymobile.ne.jp',
  'ymobile.jp',
];
const domainTypoMap = {
  'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com',
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'hotnail.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'yaho.com': 'yahoo.com',
  'yahho.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yahoo.coj.jp': 'yahoo.co.jp',
  'docomo.ne,jp': 'docomo.ne.jp',
  'ezweb.ne,jp': 'ezweb.ne.jp',
  'softbank.ne,jp': 'softbank.ne.jp',
  'ymobile.ne,jp': 'ymobile.ne.jp',
};

const getEmailParts = (email) => {
  const atIndex = email.lastIndexOf('@');
  if (atIndex <= 0 || atIndex >= email.length - 1) {
    return { localPart: '', domain: '' };
  }
  return {
    localPart: email.slice(0, atIndex),
    domain: email.slice(atIndex + 1).toLowerCase(),
  };
};

const levenshteinDistance = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j];
  }

  return prev[b.length];
};

const getSuggestedDomain = (domain) => {
  if (!domain) return '';
  if (trustedEmailDomains.includes(domain)) return '';
  if (domainTypoMap[domain]) return domainTypoMap[domain];

  const domainLabels = domain.split('.').length;
  let bestDomain = '';
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of trustedEmailDomains) {
    const candidateLabels = candidate.split('.').length;
    if (Math.abs(candidateLabels - domainLabels) > 1) continue;

    const distance = levenshteinDistance(domain, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestDomain = candidate;
    }
  }

  if (!bestDomain) return '';

  const maxLength = Math.max(domain.length, bestDomain.length);
  const normalized = bestDistance / maxLength;
  if (bestDistance <= 2 && normalized <= 0.25) return bestDomain;

  return '';
};

const updateEmailWarning = () => {
  const email = formState.value.email;
  if (!email) {
    emailWarning.value = '';
    return;
  }

  const emailEl = emailInputRef.value;
  if (!emailEl || emailEl.validity.valueMissing || emailEl.validity.typeMismatch || !practicalEmailPattern.test(email)) {
    emailWarning.value = '';
    return;
  }

  const { domain } = getEmailParts(email);
  const suggestedDomain = getSuggestedDomain(domain);
  emailWarning.value = suggestedDomain
    ? t('contact.warnings.emailDomainTypo', { domain: suggestedDomain })
    : '';
};

const getFieldError = (field) => {
  const value = formState.value[field];

  if (field === 'name' && !value) {
    return t('contact.errors.nameRequired');
  }

  if (field === 'email') {
    const emailEl = emailInputRef.value;
    if (!emailEl) {
      return !value || !practicalEmailPattern.test(value) ? t('contact.errors.emailInvalid') : '';
    }

    if (emailEl.validity.valueMissing || emailEl.validity.typeMismatch) {
      return t('contact.errors.emailInvalid');
    }

    if (!practicalEmailPattern.test(value)) {
      return t('contact.errors.emailInvalid');
    }
  }

  if (field === 'message' && !value) {
    return t('contact.errors.messageRequired');
  }

  return '';
};

const validateField = (field) => {
  errors.value[field] = getFieldError(field);
  if (field === 'email') {
    if (errors.value.email) {
      emailWarning.value = '';
    } else {
      updateEmailWarning();
    }
  }
  return !errors.value[field];
};

const validateForm = () => {
  const fields = ['name', 'email', 'message'];
  let isValid = true;
  for (const field of fields) {
    touched.value[field] = true;
    const fieldValid = validateField(field);
    if (!fieldValid && isValid) {
      const invalidEl = formRef.value?.querySelector(`[name="${field}"]`);
      invalidEl?.focus();
    }
    isValid = isValid && fieldValid;
  }
  return isValid;
};

const handleBlur = (field) => {
  touched.value[field] = true;
  validateField(field);
};

const handleInput = (field) => {
  if (field === 'email') {
    updateEmailWarning();
  }
  if (touched.value[field] || errors.value[field]) {
    validateField(field);
  }
};

const containsSpamPatterns = (text) => {
  const spamPatterns = [
    /\[url=/i,
    /https?:\/\/[^\s]{50,}/i,
    /(.)\1{10,}/,
    /<\s*script/i,
    /<\s*a\s+href/i,
  ];
  return spamPatterns.some((pattern) => pattern.test(text));
};

const handleSubmit = async () => {
  const { name, email, message } = formState.value;
  const now = Date.now();

  if (!validateForm()) return;

  if (isSubmitting.value) return;

  if (now - lastSubmitTime < 10000 && lastSubmitTime > 0) {
    alert('Please wait before submitting again.');
    return;
  }

  if (now - formLoadTime.value < 3000) {
    alert('Please take your time filling out the form.');
    formLoadTime.value = Date.now();
    return;
  }

  if (containsSpamPatterns(name) || containsSpamPatterns(message)) {
    alert('Your message could not be sent. Please remove any suspicious content.');
    return;
  }

  const formEl = formRef.value;
  const websiteField = formEl?.querySelector('input[name="website"]');
  const gotchaField = formEl?.querySelector('input[name="_gotcha"]');
  if (websiteField?.value || gotchaField?.value) {
    resetForm();
    alert('Thank you for your message!');
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: "YOUR_WEB3FORMS_ACCESS_KEY",
        name,
        email,
        message,
        subject: "New Contact Form Submission from Portfolio"
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('Form submission failed:', result);
      throw new Error('Submission failed');
    }

    lastSubmitTime = Date.now();
    resetForm();
    formLoadTime.value = Date.now();

    const [{ default: lottie }, workAnimModule] = await Promise.all([
      import('lottie-web'),
      import('@/assets/lottie/work.json'),
    ]);
    const workAnimData = workAnimModule.default ?? workAnimModule;

    formSubmitted.value = true;

    await nextTick();

    if (lottieContainer.value) {
      successLottieAnim = lottie.loadAnimation({
        container: lottieContainer.value,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: workAnimData,
      });
    }
  } catch (error) {
    console.error('Form error:', error);
    alert('There was an error sending your message. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  const currentMount = ++mountToken;

  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  if (currentMount !== mountToken) return;
  gsap.registerPlugin(ScrollTrigger);

  const wrapperEl = contactWrapper.value;
  const sectionEl = contactSection.value;
  if (!wrapperEl || !sectionEl) return;

  // Stagger reveal entrance timeline with scroll trigger
  revealTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: wrapperEl,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
  });

  // Animate left panel (slide in from left & scale down to normal)
  revealTimeline.fromTo(
    sectionEl.querySelector('.contact-left-panel'),
    { opacity: 0, x: -60, scale: 1.05 },
    { opacity: 1, x: 0, scale: 1, duration: 1.2, ease: 'power4.out' }
  );

  // Stagger animate right panel content items (fade up & slide in)
  revealTimeline.fromTo(
    sectionEl.querySelectorAll('.contact-right-panel-item'),
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15 },
    '-=0.8' // overlap
  );
});

onBeforeUnmount(() => {
  mountToken += 1;
  if (revealTimeline) {
    revealTimeline.scrollTrigger?.kill();
    revealTimeline.kill();
    revealTimeline = null;
  }
  if (successLottieAnim) {
    successLottieAnim.destroy();
    successLottieAnim = null;
  }
});
</script>

<style scoped>
.contact-wrapper {
  overflow-x: hidden;
}
</style>
