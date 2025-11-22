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
        <div class="relative">
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
