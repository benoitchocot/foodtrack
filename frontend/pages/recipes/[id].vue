<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader>
      <template #actions>
        <NuxtLink to="/recipes" class="btn btn-secondary text-sm">
          {{ $t('recipes.backToRecipes') }}
        </NuxtLink>
        <button @click="handleLogout" class="btn btn-secondary text-sm">
          {{ $t('auth.logout') }}
        </button>
      </template>
    </AppHeader>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
        <NuxtLink to="/recipes" class="btn btn-primary mt-4">
          {{ $t('recipes.backToRecipes') }}
        </NuxtLink>
      </div>

      <div v-else-if="adjustedRecipe" class="space-y-6">
        <div class="card">
          <div class="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
            <img 
              v-if="normalizedRecipeImageUrl" 
              :src="normalizedRecipeImageUrl" 
              :alt="adjustedRecipe.title"
              class="w-full h-full object-cover absolute inset-0"
            />
            <Icon v-else name="mdi:silverware-fork-knife" class="text-8xl text-primary-600" />
          </div>
          
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ adjustedRecipe.title }}</h1>
          
          <p v-if="adjustedRecipe.description" class="text-gray-600 text-lg mb-6">{{ adjustedRecipe.description }}</p>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <Icon name="mdi:clock-outline" class="text-2xl text-primary-600 mb-2 mx-auto" />
              <p class="text-sm text-gray-600">{{ $t('recipes.prepTime') }}</p>
              <p class="text-lg font-semibold">{{ adjustedRecipe.prepTime }} {{ $t('recipes.min') }}</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <Icon name="mdi:fire" class="text-2xl text-primary-600 mb-2 mx-auto" />
              <p class="text-sm text-gray-600">{{ $t('recipes.cookTime') }}</p>
              <p class="text-lg font-semibold">{{ adjustedRecipe.cookTime }} {{ $t('recipes.min') }}</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <Icon name="mdi:account-group" class="text-2xl text-primary-600 mb-2 mx-auto" />
              <p class="text-sm text-gray-600">{{ $t('recipes.servings') }}</p>
              <p class="text-lg font-semibold">
                {{ adjustedRecipe.servings }}
                <span v-if="recipe.isAdaptable === false" class="text-xs text-gray-500 ml-1">
                  ({{ $t('recipes.fixedServings') }})
                </span>
              </p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <Icon name="mdi:gauge" class="text-2xl text-primary-600 mb-2 mx-auto" />
              <p class="text-sm text-gray-600">{{ $t('recipes.difficulty') }}</p>
              <p class="text-lg font-semibold">{{ translateDifficulty(adjustedRecipe.difficulty) }}</p>
            </div>
          </div>

          <div v-if="adjustedRecipe.tags && adjustedRecipe.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
            <span
              v-for="tag in adjustedRecipe.tags"
              :key="tag"
              class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
            >
              {{ translateTag(tag) }}
            </span>
          </div>

          <!-- Nutritional Values -->
          <div v-if="hasNutritionalValues" class="mb-6 pt-6 border-t border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('recipes.submit.nutritionalValues') }} ({{ $t('recipes.servings') }}: {{ adjustedRecipe.servings }})</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div v-if="adjustedRecipe.calories" class="text-center p-4 bg-green-50 rounded-lg">
                <Icon name="mdi:fire" class="text-2xl text-green-600 mb-2 mx-auto" />
                <p class="text-xs text-gray-600 mb-1">{{ $t('recipes.submit.calories') }}</p>
                <p class="text-xl font-semibold text-green-700">{{ adjustedRecipe.calories }} <span class="text-sm">kcal</span></p>
              </div>
              <div v-if="adjustedRecipe.carbohydrates" class="text-center p-4 bg-blue-50 rounded-lg">
                <Icon name="mdi:grain" class="text-2xl text-blue-600 mb-2 mx-auto" />
                <p class="text-xs text-gray-600 mb-1">{{ $t('recipes.submit.carbohydrates') }}</p>
                <p class="text-xl font-semibold text-blue-700">{{ formatDecimal(adjustedRecipe.carbohydrates) }} <span class="text-sm">g</span></p>
              </div>
              <div v-if="adjustedRecipe.fats" class="text-center p-4 bg-yellow-50 rounded-lg">
                <Icon name="mdi:oil" class="text-2xl text-yellow-600 mb-2 mx-auto" />
                <p class="text-xs text-gray-600 mb-1">{{ $t('recipes.submit.fats') }}</p>
                <p class="text-xl font-semibold text-yellow-700">{{ formatDecimal(adjustedRecipe.fats) }} <span class="text-sm">g</span></p>
              </div>
              <div v-if="adjustedRecipe.proteins" class="text-center p-4 bg-red-50 rounded-lg">
                <Icon name="mdi:food-drumstick" class="text-2xl text-red-600 mb-2 mx-auto" />
                <p class="text-xs text-gray-600 mb-1">{{ $t('recipes.submit.proteins') }}</p>
                <p class="text-xl font-semibold text-red-700">{{ formatDecimal(adjustedRecipe.proteins) }} <span class="text-sm">g</span></p>
              </div>
              <div v-if="adjustedRecipe.fibers" class="text-center p-4 bg-purple-50 rounded-lg">
                <Icon name="mdi:leaf" class="text-2xl text-purple-600 mb-2 mx-auto" />
                <p class="text-xs text-gray-600 mb-1">{{ $t('recipes.submit.fibers') }}</p>
                <p class="text-xl font-semibold text-purple-700">{{ formatDecimal(adjustedRecipe.fibers) }} <span class="text-sm">g</span></p>
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <NuxtLink
              :to="`/recipes/submit?recipeId=${route.params.id}`"
              class="btn btn-primary"
            >
              <Icon name="mdi:pencil" class="mr-2" />
              {{ $t('recipes.edit.proposeEdit') }}
            </NuxtLink>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="card">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('recipes.ingredients') }}</h2>
            <ul class="space-y-2">
              <li
                v-for="ingredient in adjustedRecipe.ingredients"
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
            <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('recipes.instructions') }}</h2>
            <ol class="space-y-4">
              <li
                v-for="step in adjustedRecipe.steps"
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

        <!-- Reviews Section -->
        <div class="card">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ $t('reviews.title') }}</h2>
          
          <!-- Add Review Form -->
          <div v-if="!userReview" class="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-4">{{ $t('reviews.addReview') }}</h3>
            <form @submit.prevent="handleSubmitReview" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('reviews.rating') }} *
                </label>
                <div class="flex gap-1 items-center">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    @click="newReview.rating = star"
                    @mouseenter="hoveredRating = star"
                    @mouseleave="hoveredRating = 0"
                    class="relative transition-all duration-150 cursor-pointer p-1"
                  >
                    <!-- Filled star (yellow) - shown when selected or hovered -->
                    <Icon
                      v-if="star <= (hoveredRating || newReview.rating)"
                      name="mdi:star"
                      :class="[
                        'text-3xl absolute inset-0 transition-all duration-150',
                        star <= newReview.rating ? 'text-yellow-400' : 'text-yellow-300'
                      ]"
                    />
                    <!-- Outline star (white/gray) - always shown as background -->
                    <Icon
                      name="mdi:star-outline"
                      :class="[
                        'text-3xl relative transition-all duration-150',
                        star <= (hoveredRating || newReview.rating) 
                          ? 'text-yellow-400 opacity-0' 
                          : 'text-gray-300'
                      ]"
                    />
                  </button>
                </div>  
              </div>
              
              <div>
                <label for="comment" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('reviews.comment') }} ({{ $t('reviews.optional') }})
                </label>
                <textarea
                  id="comment"
                  v-model="newReview.comment"
                  rows="3"
                  class="input"
                  :placeholder="$t('reviews.commentPlaceholder')"
                />
              </div>
              
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="submittingReview || newReview.rating === 0"
                  class="btn btn-primary"
                >
                  {{ submittingReview ? $t('reviews.submitting') : $t('reviews.submit') }}
                </button>
              </div>
            </form>
          </div>

          <!-- User's Review -->
          <div v-if="userReview" class="mb-8 p-6 bg-primary-50 rounded-lg">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-lg font-semibold">{{ $t('reviews.yourReview') }}</span>
                  <div class="flex gap-0.5">
                    <Icon
                      v-for="star in 5"
                      :key="star"
                      :name="star <= userReview.rating ? 'mdi:star' : 'mdi:star-outline'"
                      :class="[
                        'text-xl',
                        star <= userReview.rating ? 'text-yellow-400' : 'text-gray-300'
                      ]"
                    />
                  </div>
                </div>
                <p v-if="userReview.comment" class="text-gray-700">{{ userReview.comment }}</p>
                <p v-else class="text-gray-500 italic">{{ $t('reviews.noComment') }}</p>
                <p class="text-sm text-gray-500 mt-2">{{ $t('reviews.postedOn') }} {{ formatDate(userReview.createdAt) }}</p>
              </div>
              <button
                @click="handleDeleteReview"
                :disabled="deletingReview"
                class="btn btn-secondary btn-sm"
              >
                {{ deletingReview ? $t('common.deleting') : $t('common.delete') }}
              </button>
            </div>
          </div>

          <!-- Reviews List -->
          <div v-if="reviews.length > 0" class="space-y-4">
            <div
              v-for="review in reviews"
              :key="review.id"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-primary-700 font-semibold">
                      {{ getUserInitial(review.user) }}
                    </span>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">
                      {{ getUserDisplayName(review.user) }}
                    </p>
                    <p class="text-sm text-gray-500">{{ formatDate(review.createdAt) }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex gap-0.5">
                    <Icon
                      v-for="star in 5"
                      :key="star"
                      :name="star <= review.rating ? 'mdi:star' : 'mdi:star-outline'"
                      :class="[
                        'text-lg',
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      ]"
                    />
                  </div>
                  <button
                    v-if="review.id !== userReview?.id"
                    @click="handleReportReview(review.id)"
                    :disabled="reportingReview === review.id"
                    class="text-red-600 hover:text-red-700 text-sm"
                    :title="$t('reviews.report')"
                  >
                    <Icon name="mdi:flag" />
                  </button>
                </div>
              </div>
              <p v-if="review.comment" class="text-gray-700 mt-2">{{ review.comment }}</p>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            {{ $t('reviews.noReviews') }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { logout } = useAuth()
const api = useApi()
const { translateDifficulty, translateUnit, translateTag } = useTranslations()
const { normalizeImageUrl } = useImageUrl()

const recipe = ref<any>(null)
const userSettings = ref<any>(null)
const reviews = ref<any[]>([])
const userReview = ref<any>(null)
const loading = ref(true)
const error = ref('')
const submittingReview = ref(false)
const deletingReview = ref(false)
const reportingReview = ref<string | null>(null)

const newReview = ref({
  rating: 0,
  comment: '',
})
const hoveredRating = ref(0)

const householdSize = computed(() => userSettings.value?.householdSize || 1)

// Adjust quantities based on household size (only if recipe is adaptable)
const adjustedRecipe = computed(() => {
  if (!recipe.value) return null
  
  // If recipe is not adaptable (e.g., tarts, cakes), use original quantities
  if (recipe.value.isAdaptable === false) {
    return recipe.value
  }
  
  // Calculate ratio: household size / recipe servings
  const ratio = householdSize.value / (recipe.value.servings || 1)
  
  return {
    ...recipe.value,
    servings: householdSize.value,
    ingredients: recipe.value.ingredients.map((ing: any) => ({
      ...ing,
      quantity: Number(ing.quantity) * ratio,
    })),
    // Nutritional values are already per serving, so we need to multiply by ratio
    calories: recipe.value.calories ? Math.round(recipe.value.calories * ratio) : null,
    carbohydrates: recipe.value.carbohydrates ? Number(recipe.value.carbohydrates) * ratio : null,
    fats: recipe.value.fats ? Number(recipe.value.fats) * ratio : null,
    proteins: recipe.value.proteins ? Number(recipe.value.proteins) * ratio : null,
    fibers: recipe.value.fibers ? Number(recipe.value.fibers) * ratio : null,
  }
})

// Normalize image URL to fix localhost issues
const normalizedRecipeImageUrl = computed(() => {
  if (!adjustedRecipe.value?.imageUrl) return null
  return normalizeImageUrl(adjustedRecipe.value.imageUrl)
})

const handleLogout = () => {
  logout()
}

// Format quantity to show reasonable decimals
const formatQuantity = (quantity: number) => {
  if (quantity % 1 === 0) {
    return quantity.toString()
  }
  // Show max 2 decimals
  return quantity.toFixed(2).replace(/\.?0+$/, '')
}

// Format decimal values (for nutritional values)
const formatDecimal = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return ''
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return ''
  // Show max 2 decimals, remove trailing zeros
  return num.toFixed(2).replace(/\.?0+$/, '')
}

// Check if recipe has nutritional values
const hasNutritionalValues = computed(() => {
  if (!adjustedRecipe.value) return false
  return !!(
    adjustedRecipe.value.calories ||
    adjustedRecipe.value.carbohydrates ||
    adjustedRecipe.value.fats ||
    adjustedRecipe.value.proteins ||
    adjustedRecipe.value.fibers
  )
})

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Get user display name
const getUserDisplayName = (user: any) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  if (user.firstName) {
    return user.firstName
  }
  // Fallback to email username (part before @)
  return user.email.split('@')[0]
}

// Get user initial for avatar
const getUserInitial = (user: any) => {
  if (user.firstName) {
    return user.firstName[0].toUpperCase()
  }
  if (user.lastName) {
    return user.lastName[0].toUpperCase()
  }
  // Fallback to email first letter
  return user.email[0].toUpperCase()
}

// Load reviews
const loadReviews = async () => {
  try {
    const reviewsData = await api.get<any[]>(`/recipes/${route.params.id}/reviews`)
    reviews.value = reviewsData
    
    // Find user's review
    const { user } = useAuth()
    if (user.value) {
      userReview.value = reviewsData.find((r: any) => r.user.id === user.value?.id) || null
    }
  } catch (e: any) {
    console.error('Failed to load reviews:', e)
  }
}

// Submit review
const handleSubmitReview = async () => {
  if (newReview.value.rating === 0) return
  
  submittingReview.value = true
  try {
    const review = await api.post(`/recipes/${route.params.id}/reviews`, {
      rating: newReview.value.rating,
      comment: newReview.value.comment || undefined,
    })
    
    // Show success notification
    const { show } = useNotification()
    show($t('reviews.submitSuccess'), 'success')
    
    // Reset form and reload reviews
    newReview.value = { rating: 0, comment: '' }
    await loadReviews()
  } catch (e: any) {
    error.value = e.message || $t('reviews.submitError')
  } finally {
    submittingReview.value = false
  }
}

// Delete review
const handleDeleteReview = async () => {
  if (!userReview.value) return
  
  if (!confirm($t('reviews.deleteConfirm'))) return
  
  deletingReview.value = true
  try {
    await api.delete(`/recipes/${route.params.id}/reviews/${userReview.value.id}`)
    
    // Show success notification
    const { show } = useNotification()
    show($t('reviews.deleteSuccess'), 'success')
    
    // Reload reviews
    await loadReviews()
  } catch (e: any) {
    error.value = e.message || $t('reviews.deleteError')
  } finally {
    deletingReview.value = false
  }
}

// Report review
const handleReportReview = async (reviewId: string) => {
  if (!confirm($t('reviews.reportConfirm'))) return
  
  reportingReview.value = reviewId
  try {
    await api.post(`/recipes/${route.params.id}/reviews/${reviewId}/report`, {})
    
    // Show success notification
    const { show } = useNotification()
    show($t('reviews.reportSuccess'), 'success')
  } catch (e: any) {
    error.value = e.message || $t('reviews.reportError')
  } finally {
    reportingReview.value = null
  }
}

onMounted(async () => {
  try {
    // Fetch recipe and user settings in parallel
    const [recipeData, settings] = await Promise.all([
      api.get(`/recipes/${route.params.id}`),
      api.get('/users/me/settings').catch(() => null), // Settings optional
    ])
    
    // Convert Decimal values to numbers for nutritional values
    if (recipeData.carbohydrates) recipeData.carbohydrates = Number(recipeData.carbohydrates)
    if (recipeData.fats) recipeData.fats = Number(recipeData.fats)
    if (recipeData.proteins) recipeData.proteins = Number(recipeData.proteins)
    if (recipeData.fibers) recipeData.fibers = Number(recipeData.fibers)
    
    recipe.value = recipeData
    userSettings.value = settings

    // Record recipe view in history (fire and forget, don't wait for response)
    api.post(`/history/recipes/${route.params.id}/view`, {}).catch(() => {
      // Silently fail if history recording fails
    })
    
    // Load reviews
    await loadReviews()
  } catch (e: any) {
    error.value = e.message || $t('common.error')
  } finally {
    loading.value = false
  }
})

definePageMeta({
  middleware: 'auth',
})
</script>
