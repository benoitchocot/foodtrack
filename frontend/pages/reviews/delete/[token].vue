<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div v-if="loading" class="card text-center">
        <p class="text-gray-600">{{ $t('reviews.deleting') }}...</p>
      </div>

      <div v-else-if="error" class="card text-center">
        <Icon name="mdi:alert-circle" class="text-6xl text-red-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ $t('reviews.deleteError') }}</h1>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <NuxtLink to="/recipes" class="btn btn-primary">
          {{ $t('recipes.backToRecipes') }}
        </NuxtLink>
      </div>

      <div v-else-if="success" class="card text-center">
        <Icon name="mdi:check-circle" class="text-6xl text-green-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ $t('reviews.deleteSuccess') }}</h1>
        <p v-if="recipe" class="text-gray-600 mb-4">
          {{ $t('reviews.deletedFromRecipe') }}: <strong>{{ recipe.title }}</strong>
        </p>
        <div class="flex gap-4 justify-center">
          <NuxtLink v-if="recipe" :to="`/recipes/${recipe.id}`" class="btn btn-primary">
            {{ $t('reviews.viewRecipe') }}
          </NuxtLink>
          <NuxtLink to="/recipes" class="btn btn-secondary">
            {{ $t('recipes.backToRecipes') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApi()
const router = useRouter()
const { t } = useI18n()

const loading = ref(true)
const error = ref('')
const success = ref(false)
const recipe = ref<any>(null)

onMounted(async () => {
  try {
    const result = await api.delete(`/reviews/delete/${route.params.token}`)
    success.value = true
    recipe.value = result.recipe
    
    // Redirect to recipe after 3 seconds
    if (recipe.value) {
      setTimeout(() => {
        router.push(`/recipes/${recipe.value.id}`)
      }, 3000)
    }
  } catch (e: any) {
    error.value = e.message || t('reviews.deleteError')
  } finally {
    loading.value = false
  }
})
</script>

