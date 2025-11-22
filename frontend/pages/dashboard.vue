<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          {{ $t('common.welcome') }}, {{ user?.name || $t('common.user') }}! 👋
        </h2>
        <p class="text-gray-600">{{ $t('dashboard.subtitle') }}</p>
      </div>

      <!-- Journey Progress Indicator -->
      <div v-if="showJourneyProgress" class="mb-8 card bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ $t('journey.title') }}</h3>
            <p class="text-sm text-gray-600">{{ $t('journey.subtitle') }}</p>
          </div>
          <button
            v-if="currentGuide && !user?.hasSeenTutorial"
            @click="showGuideModal = true"
            class="btn btn-primary btn-sm"
          >
            {{ $t('guide.title') }}
          </button>
        </div>
        
        <div class="space-y-3">
          <div
            v-for="(step, index) in journeySteps"
            :key="step.id"
            class="flex items-center gap-3"
          >
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all',
                step.completed
                  ? 'bg-primary-600 text-white'
                  : index === currentStepIndex
                  ? 'bg-primary-200 text-primary-700 border-2 border-primary-600'
                  : 'bg-gray-200 text-gray-500'
              ]"
            >
              <Icon
                v-if="step.completed"
                name="mdi:check"
                class="text-lg"
              />
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="flex-1">
              <p
                :class="[
                  'font-medium',
                  step.completed ? 'text-gray-900' : index === currentStepIndex ? 'text-primary-700' : 'text-gray-500'
                ]"
              >
                {{ step.title }}
              </p>
              <p class="text-sm text-gray-600">{{ step.description }}</p>
            </div>
            <NuxtLink
              v-if="!step.completed && step.route && index === currentStepIndex"
              :to="step.route"
              class="btn btn-primary btn-sm"
            >
              {{ $t('journey.nextStep') }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <NuxtLink to="/recipes" class="card hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <Icon name="mdi:book-open-variant" class="text-2xl text-primary-600" />
            </div>
            <h3 class="text-xl font-semibold">{{ $t('dashboard.recipes') }}</h3>
          </div>
          <p class="text-gray-600">{{ $t('dashboard.recipesDescription') }}</p>
        </NuxtLink>

        <NuxtLink to="/meal-plans" class="card hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mr-4">
              <Icon name="mdi:calendar-month" class="text-2xl text-secondary-600" />
            </div>
            <h3 class="text-xl font-semibold">{{ $t('dashboard.mealPlans') }}</h3>
          </div>
          <p class="text-gray-600">{{ $t('dashboard.mealPlansDescription') }}</p>
        </NuxtLink>

        <NuxtLink to="/shopping-lists" class="card hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <Icon name="mdi:cart" class="text-2xl text-green-600" />
            </div>
            <h3 class="text-xl font-semibold">{{ $t('dashboard.shoppingLists') }}</h3>
          </div>
          <p class="text-gray-600">{{ $t('dashboard.shoppingListsDescription') }}</p>
        </NuxtLink>

        <NuxtLink to="/history" class="card hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <Icon name="mdi:history" class="text-2xl text-purple-600" />
            </div>
            <h3 class="text-xl font-semibold">{{ $t('history.title') }}</h3>
          </div>
          <p class="text-gray-600">{{ $t('history.subtitle') }}</p>
        </NuxtLink>

        <NuxtLink to="/favorites" class="card hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <Icon name="mdi:heart" class="text-2xl text-red-600" />
            </div>
            <h3 class="text-xl font-semibold">{{ $t('favorites.title') }}</h3>
          </div>
          <p class="text-gray-600">{{ $t('favorites.subtitle') }}</p>
        </NuxtLink>
      </div>

      <div class="mt-12 card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <h3 class="text-2xl font-bold mb-4">{{ $t('dashboard.quickStart') }}</h3>
        <p class="mb-6">{{ $t('dashboard.quickStartDescription') }}</p>
        <NuxtLink to="/meal-plans/generate" class="inline-block bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          {{ $t('dashboard.generateMealPlan') }}
        </NuxtLink>
      </div>

      <div class="mt-6 flex justify-end">
        <NuxtLink to="/settings" class="btn btn-secondary">
          <Icon name="mdi:cog" class="mr-2" />
          {{ $t('settings.title') }}
        </NuxtLink>
      </div>
    </main>

    <!-- User Guide Modal -->
    <UserGuide
      v-if="currentGuide && showGuideModal"
      :guide="currentGuide"
      :current-step-index="currentStepIndex"
      :total-steps="journeySteps.length"
      @dismiss="handleGuideDismiss"
      @skip="handleGuideDismiss"
      @action="handleGuideDismiss"
    />
  </div>
</template>

<script setup lang="ts">
const { user, logout, markTutorialAsSeen } = useAuth()
const { t } = useI18n()
const router = useRouter()
const api = useApi()

const { 
  hasCompletedOnboarding, 
  checkHasCompletedOnboarding,
  checkHasGeneratedMealPlan, 
  checkHasCreatedShoppingList,
  getCurrentStep,
} = useUserJourney()

const showGuideModal = ref(false)
const currentStep = ref<string | null>(null)
const hasMealPlan = ref(false)
const hasShoppingList = ref(false)

// Journey steps configuration
const journeySteps = computed(() => [
  {
    id: 'onboarding',
    title: t('journey.steps.onboarding'),
    description: t('guide.onboarding.description'),
    completed: hasCompletedOnboarding.value,
    route: '/onboarding',
  },
  {
    id: 'generate-meal-plan',
    title: t('journey.steps.generateMealPlan'),
    description: t('guide.generateMealPlan.description'),
    completed: hasMealPlan.value,
    route: '/meal-plans/generate',
  },
  {
    id: 'create-shopping-list',
    title: t('journey.steps.createShoppingList'),
    description: t('guide.createShoppingList.description'),
    completed: hasShoppingList.value,
    route: '/shopping-lists',
  },
])

const currentStepIndex = computed(() => {
  if (!hasCompletedOnboarding.value) return 0
  if (!hasMealPlan.value) return 1
  if (!hasShoppingList.value) return 2
  return -1 // All complete
})

const showJourneyProgress = computed(() => {
  return currentStepIndex.value >= 0
})

// Get current guide based on step
const currentGuide = computed(() => {
  // Don't show guide if tutorial was already seen or all steps are completed
  if (user.value?.hasSeenTutorial || currentStepIndex.value < 0) return null
  
  const step = journeySteps.value[currentStepIndex.value]
  if (!step || step.completed) return null

  const guides: Record<string, any> = {
    'onboarding': {
      id: 'onboarding',
      title: t('guide.onboarding.title'),
      description: t('guide.onboarding.description'),
      icon: 'mdi:account-check',
      actionLabel: t('guide.continue'),
      route: '/onboarding',
      skipable: true,
    },
    'generate-meal-plan': {
      id: 'generate-meal-plan',
      title: t('guide.generateMealPlan.title'),
      description: t('guide.generateMealPlan.description'),
      icon: 'mdi:calendar-plus',
      actionLabel: t('guide.continue'),
      route: '/meal-plans/generate',
      skipable: true,
    },
    'create-shopping-list': {
      id: 'create-shopping-list',
      title: t('guide.createShoppingList.title'),
      description: t('guide.createShoppingList.description'),
      icon: 'mdi:cart-plus',
      actionLabel: t('guide.continue'),
      route: '/shopping-lists',
      skipable: true,
    },
  }

  return guides[step.id] || null
})

// Refresh journey state periodically to detect changes
const refreshJourneyState = async () => {
  // Check onboarding status from database first
  await checkHasCompletedOnboarding()
  currentStep.value = await getCurrentStep()
  hasMealPlan.value = await checkHasGeneratedMealPlan()
  hasShoppingList.value = await checkHasCreatedShoppingList()
}

// Load journey state
onMounted(async () => {
  await refreshJourneyState()
  
  // Show guide automatically for users who haven't seen it yet
  // Only if:
  // 1. Tutorial hasn't been seen
  // 2. There are steps to complete (currentStepIndex >= 0)
  // 3. There's a current guide available (not all steps completed)
  if (!user.value?.hasSeenTutorial && currentStepIndex.value >= 0 && currentGuide.value) {
    // Small delay to let the page render
    setTimeout(() => {
      showGuideModal.value = true
    }, 500)
  }
})

// Watch for completion of all steps to auto-dismiss tutorial
// Watch currentStepIndex and currentGuide to detect when steps are completed
watch([currentStepIndex, currentGuide, () => user.value?.hasSeenTutorial], async (newValues, oldValues) => {
  const [newStepIndex, newGuide, hasSeenTutorial] = newValues
  
  // If tutorial is showing and has been marked as seen, close it
  if (hasSeenTutorial && showGuideModal.value) {
    showGuideModal.value = false
    return
  }
  
  // If all steps are completed, close tutorial and mark as seen
  if (newStepIndex < 0) {
    // All steps completed - hide tutorial and mark as seen
    if (showGuideModal.value) {
      showGuideModal.value = false
    }
    if (!hasSeenTutorial) {
      await markTutorialAsSeen()
    }
    return
  }
  
  // If tutorial is showing but no guide available (step completed), close it
  if (showGuideModal.value && !newGuide) {
    showGuideModal.value = false
    if (!hasSeenTutorial) {
      await markTutorialAsSeen()
    }
  }
}, { immediate: false })

// Also refresh journey state when needed (e.g., when returning to dashboard)
watch(() => router.currentRoute.value.path, async (newPath) => {
  if (newPath === '/dashboard') {
    await refreshJourneyState()
  }
})

const handleLogout = () => {
  logout()
}

const handleGuideDismiss = async () => {
  showGuideModal.value = false
  // Mark tutorial as seen in database
  if (!user.value?.hasSeenTutorial) {
    await markTutorialAsSeen()
  }
}

definePageMeta({
  middleware: ['auth', 'onboarding'],
})
</script>
