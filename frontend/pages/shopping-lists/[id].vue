<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader>
      <template #actions>
        <NuxtLink to="/shopping-lists" class="btn btn-secondary text-sm">
          {{ $t('shoppingLists.backToShoppingLists') }}
        </NuxtLink>
        <button @click="handleLogout" class="btn btn-secondary text-sm">
          {{ $t('auth.logout') }}
        </button>
      </template>
    </AppHeader>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">{{ $t('shoppingLists.loading') }}</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
        <NuxtLink to="/shopping-lists" class="btn btn-primary mt-4">
          {{ $t('shoppingLists.backToShoppingLists') }}
        </NuxtLink>
      </div>

      <div v-else-if="shoppingList" class="space-y-6">
        <div class="card">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ shoppingList.title }}</h1>
          <p v-if="shoppingList.createdAt" class="text-gray-600 mb-4">
            {{ $t('common.created') }} {{ formatDate(shoppingList.createdAt) }}
          </p>
          <div class="flex items-center gap-4">
            <div class="flex items-center text-sm text-gray-500">
              <Icon name="mdi:check-circle" class="mr-1 text-green-600" />
              {{ checkedCount }} / {{ totalItemsCount }} {{ $t('shoppingLists.checked') }}
            </div>
            <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {{ totalItemsCount }} {{ $t('shoppingLists.items') }}
            </span>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-900">{{ $t('shoppingLists.detail.items') }}</h2>
            <button
              @click="showFilters = !showFilters"
              class="btn btn-secondary text-sm"
            >
              <Icon :name="showFilters ? 'mdi:filter-off' : 'mdi:filter'" class="mr-2" />
              {{ showFilters ? $t('shoppingLists.hideFilters') : $t('shoppingLists.showFilters') }}
            </button>
          </div>

          <!-- Category Filters -->
          <div v-if="showFilters" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-sm font-medium text-gray-700 mb-3">{{ $t('shoppingLists.filterByCategory') }}</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="category in availableCategories"
                :key="category.value"
                @click="toggleCategory(category.value)"
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  visibleCategories[category.value]
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                ]"
              >
                {{ category.label }}
                <span class="ml-1 text-xs opacity-75">
                  ({{ getCategoryCount(category.value) }})
                </span>
              </button>
            </div>
            <div class="mt-3 flex gap-2">
              <button
                @click="showAllCategories"
                class="text-sm text-primary-600 hover:text-primary-700"
              >
                {{ $t('shoppingLists.showAll') }}
              </button>
              <span class="text-gray-400">|</span>
              <button
                @click="hideAllCategories"
                class="text-sm text-primary-600 hover:text-primary-700"
              >
                {{ $t('shoppingLists.hideAll') }}
              </button>
            </div>
          </div>

          <!-- Grouped Items by Category -->
          <div v-if="groupedItems && Object.keys(groupedItems).length > 0" class="space-y-6">
            <div
              v-for="category in orderedCategories"
              :key="category.value"
              v-show="visibleCategories[category.value] && groupedItems[category.value]?.length > 0"
              class="border-b border-gray-200 pb-4 last:border-b-0"
            >
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Icon :name="category.icon" class="mr-2 text-primary-600" />
                {{ category.label }}
                <span class="ml-2 text-sm font-normal text-gray-500">
                  ({{ groupedItems[category.value]?.length || 0 }})
                </span>
              </h3>
              <div class="space-y-2">
                <div
                  v-for="item in sortedItems(category.value)"
                  :key="item.id"
                  @click="toggleItem(item.id, !item.checked)"
                  class="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :checked="item.checked"
                    @click.stop
                    @change="toggleItem(item.id, ($event.target as HTMLInputElement).checked)"
                    class="w-5 h-5 text-primary-600 rounded pointer-events-none"
                  />
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <span :class="['font-medium', item.checked ? 'line-through text-gray-400' : 'text-gray-900']">
                        {{ item.ingredient.name }}
                      </span>
                      <span class="text-gray-600">
                        {{ item.quantity }} {{ translateUnit(item.unit) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <p class="text-gray-600">{{ $t('shoppingLists.detail.noItems') }}</p>
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
const { t } = useI18n()
const { translateUnit } = useTranslations()

const shoppingList = ref<any>(null)
const groupedItems = ref<Record<string, any[]>>({})
const loading = ref(true)
const error = ref('')
const showFilters = ref(false)

// Category order (like in a supermarket)
const orderedCategories = computed(() => {
  return [
    { value: 'FRESH', label: t('shoppingLists.categories.FRESH'), icon: 'mdi:fruit-grapes' },
    { value: 'MEAT', label: t('shoppingLists.categories.MEAT'), icon: 'mdi:food-steak' },
    { value: 'FISH', label: t('shoppingLists.categories.FISH'), icon: 'mdi:fish' },
    { value: 'DAIRY', label: t('shoppingLists.categories.DAIRY'), icon: 'mdi:cup' },
    { value: 'BAKERY', label: t('shoppingLists.categories.BAKERY'), icon: 'mdi:bread-slice' },
    { value: 'PANTRY', label: t('shoppingLists.categories.PANTRY'), icon: 'mdi:package-variant' },
    { value: 'FROZEN', label: t('shoppingLists.categories.FROZEN'), icon: 'mdi:snowflake' },
    { value: 'BEVERAGES', label: t('shoppingLists.categories.BEVERAGES'), icon: 'mdi:bottle-wine' },
    { value: 'SPICES', label: t('shoppingLists.categories.SPICES'), icon: 'mdi:shaker-outline' },
    { value: 'OTHER', label: t('shoppingLists.categories.OTHER'), icon: 'mdi:dots-horizontal' },
  ]
})

const availableCategories = computed(() => orderedCategories.value)

// Visibility state for each category (all visible by default)
const visibleCategories = ref<Record<string, boolean>>({})

const getCategoryCount = (category: string) => {
  return groupedItems.value[category]?.length || 0
}

const toggleCategory = (category: string) => {
  visibleCategories.value[category] = !visibleCategories.value[category]
}

const showAllCategories = () => {
  orderedCategories.value.forEach(cat => {
    visibleCategories.value[cat.value] = true
  })
}

const hideAllCategories = () => {
  orderedCategories.value.forEach(cat => {
    visibleCategories.value[cat.value] = false
  })
}

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

const checkedCount = computed(() => {
  let count = 0
  Object.values(groupedItems.value).forEach((items: any[]) => {
    count += items.filter((item: any) => item.checked).length
  })
  return count
})

const totalItemsCount = computed(() => {
  let count = 0
  Object.values(groupedItems.value).forEach((items: any[]) => {
    count += items.length
  })
  return count
})

// Sort items: unchecked first, then checked
const sortedItems = (category: string) => {
  const items = groupedItems.value[category] || []
  return [...items].sort((a, b) => {
    // Unchecked items first (false comes before true)
    if (a.checked !== b.checked) {
      return a.checked ? 1 : -1
    }
    // If both have same checked status, maintain original order
    return 0
  })
}

const toggleItem = async (itemId: string, checked: boolean) => {
  try {
    await api.patch(`/shopping-lists/${route.params.id}/items/${itemId}`, { checked })
    // Update local state in grouped items
    Object.keys(groupedItems.value).forEach(category => {
      const item = groupedItems.value[category]?.find((i: any) => i.id === itemId)
      if (item) {
        item.checked = checked
      }
    })
  } catch (e: any) {
    alert(t('errors.generic') + ': ' + e.message)
  }
}

onMounted(async () => {
  try {
    // Use grouped endpoint to get items organized by category
    const response = await api.get(`/shopping-lists/${route.params.id}/grouped`)
    shoppingList.value = response
    groupedItems.value = response.itemsGrouped || {}
    
    // Initialize all categories as visible
    orderedCategories.value.forEach(cat => {
      visibleCategories.value[cat.value] = true
    })
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
