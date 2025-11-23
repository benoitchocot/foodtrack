<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ $t('shoppingLists.title') }}</h2>
        <p class="text-gray-600 mb-6">{{ $t('shoppingLists.subtitle') }}</p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">{{ $t('shoppingLists.loading') }}</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="list in shoppingLists"
          :key="list.id"
          :to="`/shopping-lists/${list.id}`"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold">{{ list.title }}</h3>
            <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {{ list.items?.length || 0 }} {{ $t('shoppingLists.items') }}
            </span>
          </div>
          <p v-if="list.createdAt" class="text-gray-600 text-sm mb-4">
            {{ $t('common.created') }} {{ formatDate(list.createdAt) }}
          </p>
          <div class="flex items-center text-sm text-gray-500">
            <Icon name="mdi:check-circle" class="mr-1 text-green-600" />
            {{ getCheckedCount(list) }} / {{ list.items?.length || 0 }} {{ $t('shoppingLists.checked') }}
          </div>
        </NuxtLink>
      </div>

      <div v-if="!loading && shoppingLists.length === 0" class="text-center py-12">
        <Icon name="mdi:cart-outline" class="text-6xl text-gray-300 mb-4" />
        <p class="text-gray-600 mb-4">{{ $t('shoppingLists.noShoppingLists') }}</p>
        <NuxtLink to="/meal-plans" class="btn btn-primary">
          {{ $t('shoppingLists.generateFromMealPlan') }}
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const { logout } = useAuth()
const api = useApi()
const { t } = useI18n()

const shoppingLists = ref<any[]>([])
const loading = ref(true)
const error = ref('')

const handleLogout = () => {
  logout()
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return format(date, 'MMM d, yyyy')
  } catch {
    return ''
  }
}

const getCheckedCount = (list: any) => {
  return list.items?.filter((item: any) => item.checked).length || 0
}

onMounted(async () => {
  try {
    shoppingLists.value = await api.get('/shopping-lists')
  } catch (e: any) {
    error.value = e.message || t('shoppingLists.loadingFailed')
  } finally {
    loading.value = false
  }
})

definePageMeta({
  middleware: 'auth',
})
</script>
