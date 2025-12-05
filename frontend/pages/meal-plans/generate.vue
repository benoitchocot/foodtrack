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

          <div>
            <label for="numberOfServings" class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('mealPlans.generate.numberOfServings') }}
            </label>
            <input
              id="numberOfServings"
              v-model.number="numberOfServings"
              type="number"
              min="1"
              max="100"
              required
              class="input"
            />
            <p class="text-sm text-gray-500 mt-1">{{ $t('mealPlans.generate.numberOfServingsHint') }}</p>
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
                @click="handleGenerateShoppingList"
                :disabled="generatingShoppingList || !generatedPlan?.recipes || generatedPlan.recipes.length === 0"
                class="btn btn-primary text-xs sm:text-sm w-full sm:w-auto"
              >
                <Icon name="mdi:cart" class="mr-2 flex-shrink-0" />
                {{ generatingShoppingList ? $t('mealPlans.generating') : $t('mealPlans.generate.generateShoppingList') }}
              </button>
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
              <button
                @click="handleAbandonPlan"
                class="btn btn-danger text-xs sm:text-sm w-full sm:w-auto"
              >
                <Icon name="mdi:delete-outline" class="mr-2 flex-shrink-0" />
                {{ $t('mealPlans.generate.abandonPlan') }}
              </button>
            </div>
          </div>

          <div v-if="generatedPlan.recipes && generatedPlan.recipes.length > 0" class="mb-4">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-900">{{ $t('mealPlans.generate.recipesPreview') }}</h4>
              <div class="flex gap-2">
                <button
                  @click="handleAddRandomRecipe"
                  :disabled="loadingRandomRecipe"
                  class="btn btn-secondary text-xs sm:text-sm"
                >
                  <Icon name="mdi:dice-multiple" class="mr-2" />
                  {{ loadingRandomRecipe ? $t('mealPlans.generate.adding') : $t('mealPlans.generate.addRandom') }}
                </button>
                <button
                  @click="showRecipeModal = true"
                  class="btn btn-secondary text-xs sm:text-sm"
                >
                  <Icon name="mdi:plus-circle" class="mr-2" />
                  {{ $t('mealPlans.generate.selectRecipe') }}
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="mealPlanRecipe in generatedPlan.recipes"
                :key="mealPlanRecipe.id"
                class="relative"
              >
                <div 
                  class="relative card hover:shadow-lg transition-shadow cursor-pointer"
                  @click="handleViewRecipe(mealPlanRecipe.recipe.id)"
                >
                  <div class="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                    <img 
                      v-if="normalizeImageUrl(mealPlanRecipe.recipe.imageUrl)" 
                      :src="normalizeImageUrl(mealPlanRecipe.recipe.imageUrl)" 
                      :alt="mealPlanRecipe.recipe.title"
                      class="w-full h-full object-cover absolute inset-0"
                    />
                    <Icon v-else name="mdi:silverware-fork-knife" class="text-4xl text-primary-600" />
                  </div>
                  <h3 class="font-semibold text-sm mb-1 line-clamp-2">{{ mealPlanRecipe.recipe.title }}</h3>
                  <p v-if="mealPlanRecipe.recipe.description" class="text-gray-600 text-xs mb-2 line-clamp-2">{{ mealPlanRecipe.recipe.description }}</p>
                  <div class="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span class="flex items-center">
                      <Icon name="mdi:clock-outline" class="mr-1" />
                      {{ mealPlanRecipe.recipe.prepTime + mealPlanRecipe.recipe.cookTime }} {{ $t('recipes.min') }}
                    </span>
                    <span class="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                      {{ translateDifficulty(mealPlanRecipe.recipe.difficulty) }}
                    </span>
                  </div>
                  <div v-if="mealPlanRecipe.recipe.averageRating !== null && mealPlanRecipe.recipe.averageRating !== undefined" class="flex items-center gap-1 text-sm">
                    <div class="flex items-center">
                      <Icon name="mdi:star" class="text-yellow-400 mr-1" />
                      <span class="font-semibold">{{ mealPlanRecipe.recipe.averageRating.toFixed(1) }}</span>
                    </div>
                    <span class="text-gray-500 text-xs">
                      ({{ mealPlanRecipe.recipe.reviewCount || 0 }})
                    </span>
                  </div>
                  <div v-else class="text-sm text-gray-400">
                    {{ $t('recipes.noRating') }}
                  </div>
                  
                  <!-- Favorite button -->
                  <button
                    @click.stop.prevent="handleToggleFavorite(mealPlanRecipe.recipe.id, mealPlanRecipe.recipe)"
                    class="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all z-10"
                    :class="{ 'text-red-500': isFavorite(mealPlanRecipe.recipe.id), 'text-gray-400': !isFavorite(mealPlanRecipe.recipe.id) }"
                    :title="isFavorite(mealPlanRecipe.recipe.id) ? $t('recipes.removeFavorite') : $t('recipes.addFavorite')"
                  >
                    <Icon :name="isFavorite(mealPlanRecipe.recipe.id) ? 'mdi:heart' : 'mdi:heart-outline'" class="text-xl" />
                  </button>
                </div>
                <button
                  @click.stop.prevent="handleRemoveRecipe(mealPlanRecipe.id, mealPlanRecipe.recipe.id)"
                  class="absolute top-2 left-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors z-20 shadow-md"
                  :title="$t('mealPlans.generate.removeRecipe')"
                >
                  <Icon name="mdi:close" class="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recipe Detail Modal -->
      <div
        v-if="selectedRecipe"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        @click.self="selectedRecipe = null"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
          <div v-if="selectedRecipeLoading" class="p-12 text-center">
            <p class="text-gray-600">{{ $t('common.loading') }}</p>
          </div>
          <div v-else-if="selectedRecipeData" class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-gray-900">{{ selectedRecipeData.title }}</h3>
              <button
                @click="selectedRecipe = null"
                class="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Icon name="mdi:close" class="text-xl" />
              </button>
            </div>
            
            <div class="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
              <img 
                v-if="normalizedRecipeImageUrl" 
                :src="normalizedRecipeImageUrl" 
                :alt="selectedRecipeData.title"
                class="w-full h-full object-cover absolute inset-0"
              />
              <Icon v-else name="mdi:silverware-fork-knife" class="text-6xl text-primary-600" />
            </div>
            
            <p v-if="selectedRecipeData.description" class="text-gray-600 text-lg mb-6">{{ selectedRecipeData.description }}</p>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <Icon name="mdi:clock-outline" class="text-2xl text-primary-600 mb-2 mx-auto" />
                <p class="text-sm text-gray-600">{{ $t('recipes.prepTime') }}</p>
                <p class="text-lg font-semibold">{{ selectedRecipeData.prepTime }} {{ $t('recipes.min') }}</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <Icon name="mdi:fire" class="text-2xl text-primary-600 mb-2 mx-auto" />
                <p class="text-sm text-gray-600">{{ $t('recipes.cookTime') }}</p>
                <p class="text-lg font-semibold">{{ selectedRecipeData.cookTime }} {{ $t('recipes.min') }}</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <Icon name="mdi:account-group" class="text-2xl text-primary-600 mb-2 mx-auto" />
                <p class="text-sm text-gray-600">{{ $t('recipes.servings') }}</p>
                <p class="text-lg font-semibold">{{ selectedRecipeData.servings }}</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <Icon name="mdi:gauge" class="text-2xl text-primary-600 mb-2 mx-auto" />
                <p class="text-sm text-gray-600">{{ $t('recipes.difficulty') }}</p>
                <p class="text-lg font-semibold">{{ translateDifficulty(selectedRecipeData.difficulty) }}</p>
              </div>
            </div>

            <div v-if="selectedRecipeData.tags && selectedRecipeData.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
              <span
                v-for="tag in selectedRecipeData.tags"
                :key="tag"
                class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                {{ translateTag(tag) }}
              </span>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
              <div class="card">
                <h2 class="text-xl font-bold text-gray-900 mb-4">{{ $t('recipes.ingredients') }}</h2>
                <ul class="space-y-2">
                  <li
                    v-for="ingredient in adjustedSelectedRecipeIngredients"
                    :key="ingredient.id"
                    class="flex items-center justify-between p-2 border-b border-gray-100"
                  >
                    <span class="text-gray-700">{{ ingredient.ingredient.name }}</span>
                    <span class="text-gray-600 font-medium">
                      {{ formatQuantity(ingredient.quantity) }} {{ translateUnit(ingredient.unit) }}
                    </span>
                  </li>
                </ul>
              </div>

              <div class="card">
                <h2 class="text-xl font-bold text-gray-900 mb-4">{{ $t('recipes.instructions') }}</h2>
                <ol class="space-y-4">
                  <li
                    v-for="step in selectedRecipeData.steps"
                    :key="step.id"
                    class="flex gap-3"
                  >
                    <span class="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                      {{ step.stepNumber }}
                    </span>
                    <p class="text-gray-700 flex-1 pt-1">{{ step.instruction }}</p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recipe Selection Modal -->
      <div
        v-if="showRecipeModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showRecipeModal = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div class="p-6 border-b flex items-center justify-between">
            <h3 class="text-2xl font-bold text-gray-900">{{ $t('mealPlans.generate.selectRecipe') }}</h3>
            <button
              @click="showRecipeModal = false"
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icon name="mdi:close" class="text-xl" />
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Search and Filters -->
            <div class="mb-6 space-y-4">
              <div class="relative">
                <input
                  v-model="recipeSearchQuery"
                  type="text"
                  :placeholder="$t('recipes.searchPlaceholder')"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  @input="handleRecipeSearch"
                />
                <Icon
                  name="mdi:magnify"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
              
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in availableTags"
                  :key="tag.value"
                  type="button"
                  @click="toggleRecipeTag(tag.value)"
                  :class="[
                    'px-3 py-1 rounded-full text-sm transition-colors',
                    selectedRecipeTags.includes(tag.value)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  ]"
                >
                  {{ tag.label }}
                </button>
              </div>
            </div>

            <!-- Recipes Grid -->
            <div v-if="modalRecipesLoading" class="text-center py-12">
              <p class="text-gray-600">{{ $t('recipes.loading') }}</p>
            </div>
            <div v-else-if="modalRecipes.length === 0" class="text-center py-12">
              <p class="text-gray-600">{{ $t('recipes.noRecipes') }}</p>
            </div>
            <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="recipe in modalRecipes"
                :key="recipe.id"
                class="relative cursor-pointer"
                @click="handleSelectRecipe(recipe.id)"
              >
                <RecipeCard
                  :recipe="recipe"
                  size="small"
                />
                <div class="absolute inset-0 bg-primary-500 bg-opacity-0 hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                  <Icon name="mdi:plus-circle" class="text-4xl text-primary-600 opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useTranslations } from '~/composables/useTranslations'
import { useUserSettings } from '~/composables/useUserSettings'

const api = useApi()
const router = useRouter()
const { t } = useI18n()
const { translateDifficulty, translateUnit, translateTag } = useTranslations()
const { loadFavorites, isFavorite, toggleFavorite } = useFavorites()
const { settings, fetchSettings } = useUserSettings()
const { normalizeImageUrl } = useImageUrl()

const numberOfMeals = ref(5)
const numberOfServings = ref(2) // Will be initialized from user settings
const loading = ref(false)
const error = ref('')
const generatedPlan = ref<any>(null)
const lastGenerationParams = ref<{
  numberOfMeals: number
  numberOfServings?: number
} | null>(null)

// Recipe detail modal state
const selectedRecipe = ref<string | null>(null)
const selectedRecipeData = ref<any>(null)
const selectedRecipeLoading = ref(false)

// Recipe selection modal state
const showRecipeModal = ref(false)
const modalRecipes = ref<any[]>([])
const modalRecipesLoading = ref(false)
const recipeSearchQuery = ref('')
const selectedRecipeTags = ref<string[]>([])
const loadingRandomRecipe = ref(false)
const generatingShoppingList = ref(false)

// Available tags for filtering
const availableTags = [
  { value: 'quick', label: t('tags.quick') },
  { value: 'batch_cooking', label: t('tags.batch_cooking') },
  { value: 'one_pot', label: t('tags.one_pot') },
  { value: 'italian', label: t('tags.italian') },
  { value: 'comfort_food', label: t('tags.comfort_food') },
  { value: 'vegetarian', label: t('tags.vegetarian') },
  { value: 'healthy', label: t('tags.healthy') },
  { value: 'french', label: t('tags.french') },
  { value: 'sunday_roast', label: t('tags.sunday_roast') },
  { value: 'family', label: t('tags.family') },
  { value: 'soup', label: t('tags.soup') },
  { value: 'spicy', label: t('tags.spicy') },
  { value: 'indian', label: t('tags.indian') },
  { value: 'fish', label: t('tags.fish') },
  { value: 'classic', label: t('tags.classic') },
]

onMounted(async () => {
  await loadFavorites()
  const userSettings = await fetchSettings()
  // Initialize numberOfServings from user settings
  if (userSettings?.householdSize) {
    numberOfServings.value = userSettings.householdSize
  }
})

const handleGenerate = async () => {
  loading.value = true
  error.value = ''
  generatedPlan.value = null
  
  const params: any = {
    numberOfMeals: numberOfMeals.value,
    numberOfServings: numberOfServings.value,
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

const handleNewGeneration = async () => {
  generatedPlan.value = null
  lastGenerationParams.value = null
  error.value = ''
  // Reset numberOfServings to user settings
  const userSettings = settings.value || await fetchSettings()
  if (userSettings?.householdSize) {
    numberOfServings.value = userSettings.householdSize
  }
}

const handleRemoveRecipe = async (mealPlanRecipeId: string, recipeId: string) => {
  if (!generatedPlan.value) return
  
  if (!confirm(t('mealPlans.generate.confirmRemove'))) {
    return
  }
  
  try {
    await api.delete(`/meal-plans/${generatedPlan.value.id}/recipes/${recipeId}`)
    // Refresh the plan to get updated recipes list
    const updatedPlan = await api.get(`/meal-plans/${generatedPlan.value.id}`)
    generatedPlan.value = updatedPlan
  } catch (e: any) {
    alert(t('mealPlans.generate.removeFailed') + ': ' + e.message)
  }
}

const handleAddRandomRecipe = async () => {
  if (!generatedPlan.value) return
  
  loadingRandomRecipe.value = true
  try {
    // Get user settings for filtering
    const userSettings = settings.value || await fetchSettings()
    
    // Build query params based on user preferences
    const params: any = {
      limit: 50, // Get more recipes to choose from
    }
    
    if (userSettings?.dietPreferences?.length > 0) {
      params.dietTypes = userSettings.dietPreferences
    }
    
    if (userSettings?.difficultyPreference) {
      params.difficulty = userSettings.difficultyPreference
    }
    
    if (userSettings?.maxPrepTime) {
      params.maxPrepTime = userSettings.maxPrepTime
    }
    
    if (userSettings?.toolsAvailable?.length > 0) {
      params.toolsRequired = userSettings.toolsAvailable
    }
    
    // Build query string manually to handle arrays
    const queryParts: string[] = []
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => queryParts.push(`${key}=${encodeURIComponent(v)}`))
      } else if (value !== undefined && value !== null) {
        queryParts.push(`${key}=${encodeURIComponent(value)}`)
      }
    })
    const queryString = queryParts.length > 0 ? '?' + queryParts.join('&') : ''
    
    // Get recipes
    const response = await api.get('/recipes' + queryString)
    // Handle both response formats: { data: [...], meta: {...} } or direct array
    const recipes = (response && 'data' in response && Array.isArray(response.data)) 
      ? response.data 
      : (Array.isArray(response) ? response : [])
    
    if (!recipes || recipes.length === 0) {
      alert(t('mealPlans.generate.noRecipesFound'))
      return
    }
    
    // Filter out recipes already in the plan
    const existingRecipeIds = new Set(
      generatedPlan.value.recipes?.map((r: any) => r.recipe.id) || []
    )
    const availableRecipes = recipes.filter((r: any) => !existingRecipeIds.has(r.id))
    
    if (availableRecipes.length === 0) {
      alert(t('mealPlans.generate.allRecipesAdded'))
      return
    }
    
    // Pick a random recipe
    const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)]
    
    // Add to plan
    await api.post(`/meal-plans/${generatedPlan.value.id}/recipes`, {
      recipeId: randomRecipe.id,
      servings: numberOfServings.value,
    })
    
    // Refresh the plan
    const updatedPlan = await api.get(`/meal-plans/${generatedPlan.value.id}`)
    generatedPlan.value = updatedPlan
  } catch (e: any) {
    alert(t('mealPlans.generate.addFailed') + ': ' + e.message)
  } finally {
    loadingRandomRecipe.value = false
  }
}

const handleSelectRecipe = async (recipeId: string) => {
  if (!generatedPlan.value) return
  
  try {
    await api.post(`/meal-plans/${generatedPlan.value.id}/recipes`, {
      recipeId,
      servings: numberOfServings.value,
    })
    
    // Refresh the plan
    const updatedPlan = await api.get(`/meal-plans/${generatedPlan.value.id}`)
    generatedPlan.value = updatedPlan
    
    // Close modal
    showRecipeModal.value = false
  } catch (e: any) {
    alert(t('mealPlans.generate.addFailed') + ': ' + e.message)
  }
}

const handleAbandonPlan = async () => {
  if (!generatedPlan.value) return
  
  if (!confirm(t('mealPlans.generate.confirmAbandon'))) {
    return
  }
  
  try {
    await api.delete(`/meal-plans/${generatedPlan.value.id}`)
    generatedPlan.value = null
    lastGenerationParams.value = null
    router.push('/meal-plans')
  } catch (e: any) {
    alert(t('mealPlans.generate.abandonFailed') + ': ' + e.message)
  }
}

const handleRecipeSearch = async () => {
  await loadModalRecipes()
}

const toggleRecipeTag = (tag: string) => {
  const index = selectedRecipeTags.value.indexOf(tag)
  if (index > -1) {
    selectedRecipeTags.value.splice(index, 1)
  } else {
    selectedRecipeTags.value.push(tag)
  }
  loadModalRecipes()
}

const loadModalRecipes = async () => {
  if (!showRecipeModal.value) return
  
  modalRecipesLoading.value = true
  try {
    const params: any = {
      limit: 50,
    }
    
    if (recipeSearchQuery.value) {
      params.search = recipeSearchQuery.value
    }
    
    if (selectedRecipeTags.value.length > 0) {
      params.tags = selectedRecipeTags.value
    }
    
    // Get user settings for filtering
    const userSettings = settings.value || await fetchSettings()
    
    if (userSettings?.dietPreferences?.length > 0) {
      params.dietTypes = userSettings.dietPreferences
    }
    
    if (userSettings?.difficultyPreference) {
      params.difficulty = userSettings.difficultyPreference
    }
    
    if (userSettings?.maxPrepTime) {
      params.maxPrepTime = userSettings.maxPrepTime
    }
    
    if (userSettings?.toolsAvailable?.length > 0) {
      params.toolsRequired = userSettings.toolsAvailable
    }
    
    // Build query string manually to handle arrays
    const queryParts: string[] = []
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => queryParts.push(`${key}=${encodeURIComponent(v)}`))
      } else if (value !== undefined && value !== null) {
        queryParts.push(`${key}=${encodeURIComponent(value)}`)
      }
    })
    const queryString = queryParts.length > 0 ? '?' + queryParts.join('&') : ''
    
    const response = await api.get('/recipes' + queryString)
    // Handle both response formats: { data: [...], meta: {...} } or direct array
    const recipes = (response && 'data' in response && Array.isArray(response.data)) 
      ? response.data 
      : (Array.isArray(response) ? response : [])
    
    // Filter out recipes already in the plan
    if (generatedPlan.value?.recipes) {
      const existingRecipeIds = new Set(
        generatedPlan.value.recipes.map((r: any) => r.recipe.id)
      )
      modalRecipes.value = recipes.filter((r: any) => !existingRecipeIds.has(r.id))
    } else {
      modalRecipes.value = recipes
    }
  } catch (e: any) {
    console.error('Failed to load recipes:', e)
    modalRecipes.value = []
  } finally {
    modalRecipesLoading.value = false
  }
}

const handleViewRecipe = async (recipeId: string) => {
  selectedRecipe.value = recipeId
  selectedRecipeLoading.value = true
  selectedRecipeData.value = null
  
  try {
    const recipe = await api.get(`/recipes/${recipeId}`)
    selectedRecipeData.value = recipe
  } catch (e: any) {
    alert(t('common.error') + ': ' + (e.message || 'Erreur lors du chargement de la recette'))
    selectedRecipe.value = null
  } finally {
    selectedRecipeLoading.value = false
  }
}

const normalizedRecipeImageUrl = computed(() => {
  if (!selectedRecipeData.value?.imageUrl) return null
  return normalizeImageUrl(selectedRecipeData.value.imageUrl)
})

const adjustedSelectedRecipeIngredients = computed(() => {
  if (!selectedRecipeData.value?.ingredients) return []
  
  const recipe = selectedRecipeData.value
  const householdSize = settings.value?.householdSize || 2
  
  // If recipe is not adaptable, use original quantities
  if (recipe.isAdaptable === false) {
    return recipe.ingredients
  }
  
  // Calculate ratio: household size / recipe servings
  const ratio = householdSize / (recipe.servings || 1)
  
  return recipe.ingredients.map((ing: any) => ({
    ...ing,
    quantity: Number(ing.quantity) * ratio,
  }))
})

const formatQuantity = (quantity: number) => {
  if (quantity % 1 === 0) {
    return quantity.toString()
  }
  return quantity.toFixed(2).replace(/\.?0+$/, '')
}

const handleToggleFavorite = async (recipeId: string, recipe: any) => {
  try {
    await toggleFavorite(recipeId, recipe)
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}

const handleGenerateShoppingList = async () => {
  if (!generatedPlan.value) return
  
  generatingShoppingList.value = true
  try {
    const list = await api.post<{ id: string }>('/shopping-lists/from-meal-plan', { 
      mealPlanId: generatedPlan.value.id 
    })
    
    // Mark shopping list creation step as completed
    const { completeStep } = useUserJourney()
    completeStep('create-shopping-list')
    
    router.push(`/shopping-lists/${list.id}`)
  } catch (e: any) {
    alert(t('shoppingLists.generateFailed') + ': ' + e.message)
  } finally {
    generatingShoppingList.value = false
  }
}

watch(showRecipeModal, (newVal) => {
  if (newVal) {
    loadModalRecipes()
  } else {
    modalRecipes.value = []
    recipeSearchQuery.value = ''
    selectedRecipeTags.value = []
  }
})

definePageMeta({
  middleware: 'auth',
})
</script>
