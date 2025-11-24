<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ $t('recipes.title') }}</h2>
            <p class="text-gray-600">{{ $t('recipes.subtitle') }}</p>
          </div>
          <NuxtLink to="/recipes/submit" class="btn btn-primary">
            <Icon name="mdi:plus" class="mr-2" />
            {{ $t('recipes.submitRecipe') }}
          </NuxtLink>
        </div>

        <!-- Search bar -->
        <div class="relative mb-4">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('recipes.searchPlaceholder')"
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            @input="handleSearch"
          />
          <Icon
            name="mdi:magnify"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            :title="$t('recipes.clearSearch')"
          >
            <Icon name="mdi:close-circle" class="text-xl" />
          </button>
        </div>

        <!-- Filters and Sort -->
        <div class="mb-6 space-y-4">
          <!-- Tags Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('recipes.filterByTags') }}
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tag in availableTags"
                :key="tag.value"
                type="button"
                @click="toggleTag(tag.value)"
                :class="[
                  'px-3 py-1 rounded-full text-sm transition-colors',
                  selectedTags.includes(tag.value)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                ]"
              >
                {{ tag.label }}
              </button>
            </div>
          </div>

          <!-- Sort -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('recipes.sortBy') }}
            </label>
            <select
              v-model="sortBy"
              @change="handleSortChange"
              class="input max-w-xs"
            >
              <option value="createdAt">{{ $t('recipes.sortByCreatedAt') }}</option>
              <option value="rating">{{ $t('recipes.sortByRating') }}</option>
              <option value="title">{{ $t('recipes.sortByTitle') }}</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="initialLoading" class="text-center py-12">
        <p class="text-gray-600">{{ $t('recipes.loading') }}</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RecipeCard
            v-for="recipe in recipes"
            :key="recipe.id"
            :recipe="recipe"
          />
        </div>

        <!-- Infinite scroll trigger -->
        <div
          ref="loadMoreTrigger"
          v-if="hasMore && !loadingMore"
          class="h-10"
        ></div>

        <!-- Loading more indicator -->
        <div v-if="loadingMore" class="text-center py-8">
          <p class="text-gray-600">{{ $t('recipes.loadingMore') }}</p>
        </div>

        <!-- No more recipes indicator -->
        <div v-if="!hasMore && recipes.length > 0" class="text-center py-8">
          <p class="text-gray-500 text-sm">{{ $t('recipes.allRecipesLoaded') }}</p>
        </div>

        <!-- No recipes at all -->
        <div v-if="!initialLoading && recipes.length === 0" class="text-center py-12">
          <p class="text-gray-600">{{ $t('recipes.noRecipes') }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const api = useApi()
const { loadFavorites } = useFavorites()
const { t } = useI18n()

const recipes = ref<any[]>([])
const initialLoading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const limit = ref(20)
const hasMore = computed(() => currentPage.value < totalPages.value)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const searchDebounceTimer = ref<NodeJS.Timeout | null>(null)
const selectedTags = ref<string[]>([])
const sortBy = ref<'createdAt' | 'rating' | 'title'>('createdAt')

// Available tags (same as in submit.vue)
const availableTags = computed(() => [
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
])

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  // Reload recipes when tags change
  currentPage.value = 1
  totalPages.value = 1
  loadRecipes(1, false)
}

const handleSortChange = () => {
  currentPage.value = 1
  totalPages.value = 1
  loadRecipes(1, false)
}

// Load recipes with pagination
const loadRecipes = async (page: number = 1, append: boolean = false) => {
  try {
    if (page === 1) {
      initialLoading.value = true
    } else {
      loadingMore.value = true
    }

    // Build URL with query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.value.toString(),
    })
    
    // Add search parameter if provided
    if (searchQuery.value && searchQuery.value.trim()) {
      params.append('search', searchQuery.value.trim())
    }

    // Add tags filter if provided
    if (selectedTags.value.length > 0) {
      selectedTags.value.forEach(tag => {
        params.append('tags', tag)
      })
    }

    // Add sort parameter
    if (sortBy.value) {
      params.append('sortBy', sortBy.value)
    }
    
    const endpoint = `/recipes?${params.toString()}`
    
    const response = await api.get<{
      data: any[]
      meta?: {
        total: number
        page: number
        limit: number
        totalPages: number
      }
    }>(endpoint)

    // Backend returns: { data: [...], meta: { total, page, limit, totalPages } }
    // Handle both structure types for compatibility
    let recipesData: any[] = []
    let meta: any = null

    if (response && 'data' in response && Array.isArray(response.data)) {
      // Response has structure: { data: [...], meta: {...} }
      recipesData = response.data
      meta = response.meta || null
    } else if (Array.isArray(response)) {
      // Response is directly an array
      recipesData = response
    }

    // Append or replace recipes
    if (append) {
      recipes.value = [...recipes.value, ...recipesData]
    } else {
      recipes.value = recipesData
    }

    // Update pagination metadata
    if (meta) {
      currentPage.value = meta.page || page
      totalPages.value = meta.totalPages || Math.ceil((meta.total || recipesData.length) / limit.value)
      total.value = meta.total || recipesData.length
    } else {
      // If no meta, try to infer from response length
      if (recipesData.length < limit.value) {
        // If we got fewer items than requested, we're done
        totalPages.value = page
      } else {
        // Assume there might be more, set current page
        currentPage.value = page
        totalPages.value = page + 1 // Will be updated when we get an empty response
      }
    }
  } catch (e: any) {
    error.value = e.message || 'Erreur lors du chargement des recettes'
  } finally {
    initialLoading.value = false
    loadingMore.value = false
  }
}

// Load more recipes (next page)
const handleLoadMore = async () => {
  if (loadingMore.value || !hasMore.value) return

  const nextPage = currentPage.value + 1
  await loadRecipes(nextPage, true)
}

// Handle search with debounce
const handleSearch = () => {
  // Clear existing timer
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }

  // Reset pagination and reload from page 1
  currentPage.value = 1
  totalPages.value = 1
  
  // Debounce search: wait 500ms after user stops typing
  searchDebounceTimer.value = setTimeout(async () => {
    await loadRecipes(1, false)
  }, 500)
}

// Clear search
const clearSearch = async () => {
  searchQuery.value = ''
  currentPage.value = 1
  totalPages.value = 1
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }
  await loadRecipes(1, false)
}

// Setup intersection observer for infinite scroll
onMounted(async () => {
  try {
    // Load favorites and first page of recipes in parallel
    await Promise.all([
      loadFavorites(),
      loadRecipes(1, false),
    ])
  } catch (e: any) {
    error.value = e.message || 'Erreur'
  }

  // Setup intersection observer for infinite scroll
  if (import.meta.client) {
    let observer: IntersectionObserver | null = null

    const createObserver = () => {
      if (observer) {
        observer.disconnect()
      }

      if (loadMoreTrigger.value) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && hasMore.value && !loadingMore.value) {
                handleLoadMore()
              }
            })
          },
          {
            rootMargin: '100px', // Start loading 100px before reaching the trigger
          }
        )
        observer.observe(loadMoreTrigger.value)
      }
    }

    // Setup observer when trigger element becomes available
    watchEffect(() => {
      if (loadMoreTrigger.value && hasMore.value) {
        nextTick(() => {
          createObserver()
        })
      }
    })

    onBeforeUnmount(() => {
      if (observer) {
        observer.disconnect()
      }
    })
  }
})

definePageMeta({
  middleware: 'auth',
})
</script>
