<template>
  <div class="relative card hover:shadow-lg transition-shadow" :class="cardClass">
    <NuxtLink :to="`/recipes/${recipe.id}`" class="block">
      <div class="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
        <img 
          v-if="normalizedImageUrl" 
          :src="normalizedImageUrl" 
          :alt="recipe.title"
          class="w-full h-full object-cover absolute inset-0"
          @error="onImageError"
        />
        <Icon v-else name="mdi:silverware-fork-knife" :class="iconClass" />
      </div>
      <h3 :class="titleClass">{{ recipe.title }}</h3>
      <p v-if="recipe.description" :class="descriptionClass">{{ recipe.description }}</p>
      <div class="flex items-center justify-between text-sm text-gray-500 mb-2">
        <span class="flex items-center">
          <Icon name="mdi:clock-outline" class="mr-1" />
          {{ recipe.prepTime + recipe.cookTime }} {{ $t('recipes.min') }}
        </span>
        <span class="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
          {{ translateDifficulty(recipe.difficulty) }}
        </span>
      </div>
      <!-- Rating display -->
      <div v-if="recipe.averageRating !== null && recipe.averageRating !== undefined" class="flex items-center gap-1 text-sm">
        <div class="flex items-center">
          <Icon name="mdi:star" class="text-yellow-400 mr-1" />
          <span class="font-semibold">{{ recipe.averageRating.toFixed(1) }}</span>
        </div>
        <span class="text-gray-500 text-xs">
          ({{ recipe.reviewCount || 0 }})
        </span>
      </div>
      <div v-else class="text-sm text-gray-400">
        {{ $t('recipes.noRating') }}
      </div>
      <slot />
    </NuxtLink>
    
    <!-- Favorite button -->
    <button
      @click.stop.prevent="handleToggleFavorite"
      class="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all z-10"
      :class="{ 'text-red-500': isFav, 'text-gray-400': !isFav }"
      :title="isFav ? $t('recipes.removeFavorite') : $t('recipes.addFavorite')"
    >
      <Icon :name="isFav ? 'mdi:heart' : 'mdi:heart-outline'" class="text-xl" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  recipe: {
    id: string
    title: string
    description?: string
    imageUrl?: string | null
    prepTime: number
    cookTime: number
    difficulty: string
    averageRating?: number | null
    reviewCount?: number
  }
  size?: 'default' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
})

const { translateDifficulty } = useTranslations()
const { isFavorite, toggleFavorite } = useFavorites()
const { normalizeImageUrl } = useImageUrl()

const isFav = computed(() => isFavorite(props.recipe.id))
const imageError = ref(false)
const normalizedImageUrl = computed(() => normalizeImageUrl(props.recipe.imageUrl))

const onImageError = () => {
  imageError.value = true
}

const cardClass = computed(() => {
  return props.size === 'small' ? '' : ''
})

const iconClass = computed(() => {
  return props.size === 'small' ? 'text-4xl text-primary-600' : 'text-6xl text-primary-600'
})

const titleClass = computed(() => {
  return props.size === 'small' ? 'font-semibold text-sm mb-1 line-clamp-2' : 'text-xl font-semibold mb-2'
})

const descriptionClass = computed(() => {
  return props.size === 'small' ? 'text-gray-600 text-xs mb-2 line-clamp-2' : 'text-gray-600 text-sm mb-4 line-clamp-2'
})

const handleToggleFavorite = async () => {
  try {
    await toggleFavorite(props.recipe.id, props.recipe)
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}
</script>

