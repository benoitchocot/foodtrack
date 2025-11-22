<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader>
      <template #actions>
        <NuxtLink to="/meal-plans" class="btn btn-secondary text-sm">
          {{ $t('mealPlans.backToMealPlans') }}
        </NuxtLink>
        <button @click="handleLogout" class="btn btn-secondary text-sm">
          {{ $t('auth.logout') }}
        </button>
      </template>
    </AppHeader>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">{{ $t('mealPlans.loading') }}</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
        <NuxtLink to="/meal-plans" class="btn btn-primary mt-4">
          {{ $t('mealPlans.backToMealPlans') }}
        </NuxtLink>
      </div>

      <div v-else-if="mealPlan" class="space-y-6">
        <div class="card">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ mealPlan.title }}</h1>
          <p class="text-gray-600 mb-4">
            {{ $t('mealPlans.created') }} {{ formatDate(mealPlan.createdAt) }}
          </p>
          <div class="flex gap-2">
            <button 
              @click="generateShoppingList" 
              class="btn btn-primary"
              :disabled="generatingList"
            >
              <Icon name="mdi:cart" class="mr-2" />
              {{ generatingList ? $t('mealPlans.generating') : $t('mealPlans.detail.generateShoppingList') }}
            </button>
          </div>
        </div>

        <div class="card">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('mealPlans.detail.recipes') }} ({{ mealPlan.recipes?.length || 0 }})</h2>
          
          <div v-if="mealPlan.recipes && mealPlan.recipes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="mealPlanRecipe in mealPlan.recipes"
              :key="mealPlanRecipe.id"
              class="relative"
            >
              <RecipeCard :recipe="mealPlanRecipe.recipe">
                <div class="mt-2 text-xs text-gray-500">
                  {{ $t('recipes.servings') }}: {{ mealPlanRecipe.servings }}
                </div>
              </RecipeCard>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <p class="text-gray-600">{{ $t('mealPlans.detail.noRecipes') }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { useTranslations } from '~/composables/useTranslations'

const route = useRoute()
const { logout } = useAuth()
const api = useApi()
const router = useRouter()
const { t } = useI18n()
const { translateDifficulty } = useTranslations()
const { loadFavorites } = useFavorites()

const mealPlan = ref<any>(null)
const loading = ref(true)
const error = ref('')
const generatingList = ref(false)

const handleLogout = () => {
  logout()
}

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, yyyy')
}

const generateShoppingList = async () => {
  generatingList.value = true
  try {
    const list = await api.post('/shopping-lists/from-meal-plan', { mealPlanId: mealPlan.value.id })
    
    // Mark shopping list creation step as completed
    const { completeStep } = useUserJourney()
    completeStep('create-shopping-list')
    
    router.push(`/shopping-lists/${list.id}`)
  } catch (e: any) {
    alert(t('shoppingLists.generateFailed') + ': ' + e.message)
  } finally {
    generatingList.value = false
  }
}

onMounted(async () => {
  await loadFavorites()
  
  try {
    mealPlan.value = await api.get(`/meal-plans/${route.params.id}`)
  } catch (e: any) {
    error.value = e.message || t('mealPlans.loadingFailed')
  } finally {
    loading.value = false
  }
})

definePageMeta({
  middleware: 'auth',
})
</script>
