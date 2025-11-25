<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader>
      <template #actions>
        <NuxtLink to="/meal-plans" class="btn btn-secondary text-sm">
          <Icon name="mdi:arrow-left" class="mr-2" />
          {{ $t('mealPlans.backToMealPlans') }}
        </NuxtLink>
      </template>
    </AppHeader>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="card">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{{ $t('mealPlans.generate.title') }}</h2>

        <form v-if="!generatedPlan" @submit.prevent="handleGenerate" class="space-y-6">
          <div>
            <label for="numberOfMeals" class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('mealPlans.generate.numberOfMeals') }}
            </label>
            <input
              id="numberOfMeals"
              v-model.number="numberOfMeals"
              type="number"
              min="1"
              max="21"
              required
              class="input"
            />
            <p class="text-sm text-gray-500 mt-1">{{ $t('mealPlans.generate.numberOfMealsHint') }}</p>
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary w-full"
          >
            {{ loading ? $t('mealPlans.generate.generating') : $t('mealPlans.generate.generate') }}
          </button>
        </form>
      </div>

      <!-- Generated Recipes Preview -->
      <div v-if="generatedPlan" class="mt-8 space-y-6">
        <div class="card">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div class="flex-1 min-w-0">
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">✓ {{ $t('mealPlans.generate.generated') }}</h3>
              <p class="text-sm sm:text-base text-gray-600 break-words">{{ generatedPlan.title }}</p>
              <p class="text-xs sm:text-sm text-gray-500 mt-1">{{ generatedPlan.recipes?.length || 0 }} {{ $t('mealPlans.generate.recipesSelected') }}</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                @click="handleNewGeneration"
                class="btn btn-secondary text-xs sm:text-sm w-full sm:w-auto"
              >
                <Icon name="mdi:plus" class="mr-2 flex-shrink-0" />
                {{ $t('mealPlans.generate.newGeneration') }}
              </button>
              <button
                @click="handleRegenerate"
                :disabled="loading"
                class="btn btn-secondary text-xs sm:text-sm w-full sm:w-auto"
              >
                <Icon name="mdi:refresh" class="mr-2 flex-shrink-0" />
                {{ loading ? $t('mealPlans.generate.generating') : $t('mealPlans.generate.regenerate') }}
              </button>
              <NuxtLink :to="`/meal-plans/${generatedPlan.id}`" class="btn btn-primary text-xs sm:text-sm w-full sm:w-auto text-center">
                {{ $t('mealPlans.generate.viewMealPlan') }}
              </NuxtLink>
            </div>
          </div>

          <div v-if="generatedPlan.recipes && generatedPlan.recipes.length > 0">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('mealPlans.generate.recipesPreview') }}</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <RecipeCard
                v-for="mealPlanRecipe in generatedPlan.recipes"
                :key="mealPlanRecipe.id"
                :recipe="mealPlanRecipe.recipe"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useTranslations } from '~/composables/useTranslations'

const api = useApi()
const router = useRouter()
const { t } = useI18n()
const { translateDifficulty } = useTranslations()
const { loadFavorites } = useFavorites()

const numberOfMeals = ref(5)
const loading = ref(false)
const error = ref('')
const generatedPlan = ref<any>(null)
const lastGenerationParams = ref<{
  numberOfMeals: number
} | null>(null)

onMounted(async () => {
  await loadFavorites()
})

const handleGenerate = async () => {
  loading.value = true
  error.value = ''
  generatedPlan.value = null
  
  const params = {
    numberOfMeals: numberOfMeals.value,
  }
  
  // Save parameters for regeneration
  lastGenerationParams.value = params
  
  try {
    const plan = await api.post('/meal-plans/generate', params)
    generatedPlan.value = plan
    
    // Mark meal plan generation step as completed
    const { completeStep } = useUserJourney()
    completeStep('generate-meal-plan')
  } catch (e: any) {
    error.value = e.message || t('mealPlans.generate.failed')
  } finally {
    loading.value = false
  }
}

const handleRegenerate = async () => {
  if (!lastGenerationParams.value) {
    return
  }
  
  loading.value = true
  error.value = ''
  
  // Save the old plan ID to delete it
  const oldPlanId = generatedPlan.value?.id
  
  // Clear the current plan display
  generatedPlan.value = null
  
  try {
    // Delete the old plan if it exists
    if (oldPlanId) {
      try {
        await api.delete(`/meal-plans/${oldPlanId}`)
      } catch (deleteError: any) {
        // If deletion fails, log but continue (plan might already be deleted)
        console.warn('Failed to delete old plan:', deleteError)
      }
    }
    
    // Generate new plan
    const plan = await api.post('/meal-plans/generate', lastGenerationParams.value)
    generatedPlan.value = plan
    
    // Mark meal plan generation step as completed
    const { completeStep } = useUserJourney()
    completeStep('generate-meal-plan')
  } catch (e: any) {
    error.value = e.message || t('mealPlans.generate.failed')
  } finally {
    loading.value = false
  }
}

const handleNewGeneration = () => {
  generatedPlan.value = null
  lastGenerationParams.value = null
  error.value = ''
}

definePageMeta({
  middleware: 'auth',
})
</script>
