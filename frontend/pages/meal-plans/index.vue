<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('mealPlans.title') }}</h2>
          <p class="text-gray-600">{{ $t('mealPlans.subtitle') }}</p>
        </div>
        <NuxtLink to="/meal-plans/generate" class="btn btn-primary">
          <Icon name="mdi:plus" class="mr-2" />
          {{ $t('mealPlans.generate.title') }}
        </NuxtLink>
      </div>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">{{ $t('mealPlans.loading') }}</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="plan in mealPlans"
          :key="plan.id"
          class="card hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold">{{ plan.title }}</h3>
            <span class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {{ plan.recipes?.length || 0 }} {{ $t('mealPlans.recipesCount') }}
            </span>
          </div>
          <p class="text-gray-600 text-sm mb-4">
            {{ $t('mealPlans.created') }} {{ formatDate(plan.createdAt) }}
          </p>
          <div class="flex gap-2">
            <NuxtLink :to="`/meal-plans/${plan.id}`" class="btn btn-primary flex-1 text-center">
              {{ $t('mealPlans.viewPlan') }}
            </NuxtLink>
            <button @click="generateShoppingList(plan.id)" class="btn btn-secondary">
              <Icon name="mdi:cart" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="!loading && mealPlans.length === 0" class="text-center py-12">
        <Icon name="mdi:calendar-blank" class="text-6xl text-gray-300 mb-4" />
        <p class="text-gray-600 mb-4">{{ $t('mealPlans.noMealPlans') }}</p>
        <NuxtLink to="/meal-plans/generate" class="btn btn-primary">
          {{ $t('mealPlans.generateFirst') }}
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const { logout } = useAuth()
const api = useApi()
const router = useRouter()
const { t } = useI18n()

const mealPlans = ref<any[]>([])
const loading = ref(true)
const error = ref('')

const handleLogout = () => {
  logout()
}

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd/MM/yyyy')
}

const generateShoppingList = async (mealPlanId: string) => {
  try {
    const list = await api.post('/shopping-lists/from-meal-plan', { mealPlanId })
    
    // Mark shopping list creation step as completed
    const { completeStep } = useUserJourney()
    completeStep('create-shopping-list')
    
    router.push(`/shopping-lists/${list.id}`)
  } catch (e: any) {
    alert(t('shoppingLists.generateFailed') + ': ' + e.message)
  }
}

onMounted(async () => {
  try {
    mealPlans.value = await api.get('/meal-plans')
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
