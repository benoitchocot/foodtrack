<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('history.title') }}</h2>
        <p class="text-gray-600">{{ $t('history.subtitle') }}</p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">{{ $t('history.loading') }}</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <div v-else class="space-y-8">
        <!-- Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-primary-100 text-sm mb-1">{{ $t('history.stats.totalMealPlans') }}</p>
                <p class="text-3xl font-bold">{{ history?.stats?.totalMealPlans || 0 }}</p>
              </div>
              <Icon name="mdi:calendar-month" class="text-4xl text-primary-200" />
            </div>
          </div>

          <div class="card bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-secondary-100 text-sm mb-1">{{ $t('history.stats.totalRecipeViews') }}</p>
                <p class="text-3xl font-bold">{{ history?.stats?.totalRecipeViews || 0 }}</p>
              </div>
              <Icon name="mdi:eye" class="text-4xl text-secondary-200" />
            </div>
          </div>

          <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm mb-1">{{ $t('history.stats.uniqueRecipes') }}</p>
                <p class="text-3xl font-bold">{{ history?.stats?.uniqueRecipesViewed || 0 }}</p>
              </div>
              <Icon name="mdi:book-open-variant" class="text-4xl text-green-200" />
            </div>
          </div>
        </div>

        <!-- Recent Meal Plans -->
        <div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('history.mealPlans.title') }}</h3>
          <div v-if="history?.mealPlans?.length === 0" class="card text-center py-12">
            <Icon name="mdi:calendar-blank" class="text-6xl text-gray-300 mb-4" />
            <p class="text-gray-600">{{ $t('history.mealPlans.noMealPlans') }}</p>
            <NuxtLink to="/meal-plans/generate" class="btn btn-primary mt-4">
              {{ $t('mealPlans.generate.title') }}
            </NuxtLink>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="plan in history?.mealPlans"
              :key="plan.id"
              class="card hover:shadow-lg transition-shadow"
            >
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-lg font-semibold">{{ plan.title }}</h4>
                <span class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {{ plan.recipes?.length || 0 }} {{ $t('history.mealPlans.recipesCount') }}
                </span>
              </div>
              <p class="text-gray-500 text-xs mb-4">
                {{ $t('common.created') }}: {{ formatDateTime(plan.createdAt) }}
              </p>
              <NuxtLink :to="`/meal-plans/${plan.id}`" class="btn btn-primary w-full text-center">
                {{ $t('history.mealPlans.viewPlan') }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Recent Recipe Views -->
        <div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('history.recentViews.title') }}</h3>
          <div v-if="history?.recentViews?.length === 0" class="card text-center py-12">
            <Icon name="mdi:book-open-variant" class="text-6xl text-gray-300 mb-4" />
            <p class="text-gray-600">{{ $t('history.recentViews.noViews') }}</p>
            <NuxtLink to="/recipes" class="btn btn-primary mt-4">
              {{ $t('recipes.title') }}
            </NuxtLink>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="view in history?.recentViews"
              :key="view.id"
            >
              <RecipeCard :recipe="view" size="small">
                <p class="text-xs text-gray-400 mt-2">
                  {{ $t('history.recentViews.viewedAt') }} {{ formatDateTime(view.viewedAt) }}
                </p>
              </RecipeCard>
            </div>
          </div>
        </div>

        <!-- Favorite Recipes -->
        <div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ $t('favorites.title') }}</h3>
          <p class="text-gray-600 text-sm mb-4">{{ $t('favorites.subtitle') }}</p>
          <div v-if="displayFavoriteRecipes.length === 0" class="card text-center py-12">
            <Icon name="mdi:heart-outline" class="text-6xl text-gray-300 mb-4" />
            <p class="text-gray-600">{{ $t('favorites.noFavorites') }}</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <RecipeCard
              v-for="recipe in displayFavoriteRecipes"
              :key="recipe.id"
              :recipe="recipe"
              size="small"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

const { logout } = useAuth()
const api = useApi()
const { t, locale } = useI18n()
const { translateDifficulty } = useTranslations()
const { loadFavorites, loadFavoriteRecipes, favoriteRecipes } = useFavorites()

const history = ref<any>(null)
const loading = ref(true)
const error = ref('')

// Use reactive favorite recipes from composable
const displayFavoriteRecipes = computed(() => {
  return favoriteRecipes.value.length > 0 ? favoriteRecipes.value : (history.value?.favoriteRecipes || [])
})

const handleLogout = () => {
  logout()
}

const formatDate = (dateString: string) => {
  const dateLocale = locale.value === 'en' ? enUS : fr
  return format(new Date(dateString), 'd MMM yyyy', { locale: dateLocale })
}

const formatDateTime = (dateString: string) => {
  const dateLocale = locale.value === 'en' ? enUS : fr
  return format(new Date(dateString), 'd MMM yyyy, HH:mm', { locale: dateLocale })
}

const refreshHistory = async () => {
  try {
    await Promise.all([
      loadFavorites(),
      loadFavoriteRecipes(),
      (async () => {
        history.value = await api.get('/history')
      })(),
    ])
  } catch (e: any) {
    error.value = e.message || t('history.error')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  await refreshHistory()
})

// Watch for favorite changes - the computed displayFavoriteRecipes will update automatically

definePageMeta({
  middleware: 'auth',
})
</script>

