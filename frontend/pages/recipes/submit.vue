<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          {{ isEditMode ? $t('recipes.edit.title') : $t('recipes.submit.title') }}
        </h2>
        <p class="text-gray-600">
          {{ isEditMode ? $t('recipes.edit.subtitle') : $t('recipes.submit.subtitle') }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Basic Information -->
        <div class="card">
          <h3 class="text-xl font-semibold mb-6">{{ $t('recipes.submit.basicInfo') }}</h3>
          
          <div class="space-y-4">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('recipes.title') }} *
              </label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                required
                class="input"
                :placeholder="$t('recipes.title')"
              />
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('recipes.description') }} ({{ $t('recipes.submit.optional') }})
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                class="input"
                :placeholder="$t('recipes.description')"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('recipes.image') }} ({{ $t('recipes.submit.optional') }})
              </label>
              <div class="space-y-4">
                <!-- Toggle between upload and URL -->
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="imageMode = 'upload'"
                    :class="[
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      imageMode === 'upload'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    ]"
                  >
                    {{ $t('recipes.submit.uploadImage') }}
                  </button>
                  <button
                    type="button"
                    @click="imageMode = 'url'"
                    :class="[
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      imageMode === 'url'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    ]"
                  >
                    {{ $t('recipes.submit.imageUrl') }}
                  </button>
                </div>

                <!-- Upload mode -->
                <div v-if="imageMode === 'upload'" class="space-y-2">
                  <input
                    id="image"
                    ref="imageInput"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    @change="handleImageUpload"
                    class="input"
                  />
                  <div v-if="imagePreview" class="mt-2">
                    <img :src="imagePreview" alt="Preview" class="w-32 h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      @click="removeImage"
                      class="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      {{ $t('common.remove') }}
                    </button>
                  </div>
                  <p class="text-xs text-gray-500">
                    {{ $t('recipes.submit.imageHint') }}
                  </p>
                </div>

                <!-- URL mode -->
                <div v-else class="space-y-2">
                  <input
                    id="imageUrl"
                    v-model="formData.imageUrl"
                    type="url"
                    class="input"
                    placeholder="https://example.com/image.jpg"
                  />
                  <div v-if="formData.imageUrl" class="mt-2">
                    <img :src="formData.imageUrl" alt="Preview" class="w-32 h-32 object-cover rounded-lg" onerror="this.style.display='none'" />
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="prepTime" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('recipes.prepTime') }} ({{ $t('recipes.min') }}) *
                </label>
                <input
                  id="prepTime"
                  v-model.number="formData.prepTime"
                  type="number"
                  min="1"
                  required
                  class="input"
                />
              </div>

              <div>
                <label for="cookTime" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('recipes.cookTime') }} ({{ $t('recipes.min') }}) *
                </label>
                <input
                  id="cookTime"
                  v-model.number="formData.cookTime"
                  type="number"
                  min="0"
                  required
                  class="input"
                />
              </div>

              <div>
                <label for="servings" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('recipes.servings') }} *
                </label>
                <input
                  id="servings"
                  v-model.number="formData.servings"
                  type="number"
                  min="1"
                  required
                  class="input"
                />
              </div>
            </div>

            <div>
              <label for="difficulty" class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('recipes.difficulty') }} *
              </label>
              <select id="difficulty" v-model="formData.difficulty" required class="input">
                <option value="EASY">{{ translateDifficulty('EASY') }}</option>
                <option value="MEDIUM">{{ translateDifficulty('MEDIUM') }}</option>
                <option value="HARD">{{ translateDifficulty('HARD') }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('recipes.tags') }} ({{ $t('recipes.submit.optional') }})
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in availableTags"
                  :key="tag.value"
                  type="button"
                  @click="toggleTag(tag.value)"
                  :class="[
                    'px-3 py-1 rounded-full text-sm transition-colors',
                    formData.tags.includes(tag.value)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  ]"
                >
                  {{ tag.label }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('tools.title') }} ({{ $t('recipes.submit.optional') }})
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tool in availableTools"
                  :key="tool.value"
                  type="button"
                  @click="toggleTool(tool.value)"
                  :class="[
                    'px-3 py-1 rounded-full text-sm transition-colors',
                    formData.toolsRequired.includes(tool.value)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  ]"
                >
                  {{ tool.label }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('enums.dietType.title') }} ({{ $t('recipes.submit.optional') }})
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="diet in availableDiets"
                  :key="diet.value"
                  type="button"
                  @click="toggleDiet(diet.value)"
                  :class="[
                    'px-3 py-1 rounded-full text-sm transition-colors',
                    formData.dietTypes.includes(diet.value)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  ]"
                >
                  {{ diet.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Ingredients -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold">{{ $t('recipes.submit.ingredients') }} *</h3>
            <button
              type="button"
              @click="addIngredient"
              class="btn btn-secondary btn-sm"
            >
              <Icon name="mdi:plus" class="mr-1" />
              {{ $t('recipes.submit.addIngredient') }}
            </button>
          </div>

          <div class="space-y-4">
            <div
              v-for="(ingredient, index) in formData.ingredients"
              :key="index"
              class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
            >
              <div class="md:col-span-5">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('recipes.ingredients') }}
                </label>
                <input
                  v-model="ingredient.ingredientName"
                  type="text"
                  required
                  class="input"
                  :placeholder="$t('recipes.ingredients')"
                  list="ingredients-list"
                />
                <datalist id="ingredients-list">
                  <option v-for="ing in ingredients" :key="ing.id" :value="ing.name" />
                </datalist>
              </div>

              <div class="md:col-span-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('common.quantity') }}
                </label>
                <input
                  v-model.number="ingredient.quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="input"
                />
              </div>

              <div class="md:col-span-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('common.unit') }}
                </label>
                <select v-model="ingredient.unit" required class="input">
                  <option v-for="unit in units" :key="unit.value" :value="unit.value">
                    {{ unit.label }}
                  </option>
                </select>
              </div>

              <div class="md:col-span-1">
                <button
                  type="button"
                  @click="removeIngredient(index)"
                  class="btn btn-secondary w-full"
                >
                  <Icon name="mdi:delete" />
                </button>
              </div>
            </div>

            <p v-if="formData.ingredients.length === 0" class="text-gray-500 text-sm">
              {{ $t('recipes.submit.addIngredient') }}
            </p>
          </div>
        </div>

        <!-- Steps -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold">{{ $t('recipes.submit.steps') }} *</h3>
            <button
              type="button"
              @click="addStep"
              class="btn btn-secondary btn-sm"
            >
              <Icon name="mdi:plus" class="mr-1" />
              {{ $t('recipes.submit.addStep') }}
            </button>
          </div>

          <div class="space-y-4">
            <div
              v-for="(step, index) in formData.steps"
              :key="index"
              class="flex gap-4"
            >
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
                {{ step.stepNumber }}
              </div>
              <div class="flex-1">
                <textarea
                  v-model="step.instruction"
                  rows="2"
                  required
                  class="input"
                  :placeholder="$t('recipes.instructions')"
                />
              </div>
              <button
                type="button"
                @click="removeStep(index)"
                class="btn btn-secondary"
              >
                <Icon name="mdi:delete" />
              </button>
            </div>

            <p v-if="formData.steps.length === 0" class="text-gray-500 text-sm">
              {{ $t('recipes.submit.addStep') }}
            </p>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end gap-4">
          <NuxtLink to="/recipes" class="btn btn-secondary">
            {{ $t('common.cancel') }}
          </NuxtLink>
          <button
            type="submit"
            :disabled="loading || !canSubmit"
            class="btn btn-primary"
          >
            {{ loading ? (isEditMode ? $t('recipes.edit.submitting') : $t('recipes.submit.submitting')) : (isEditMode ? $t('recipes.edit.submit') : $t('recipes.submit.submit')) }}
          </button>
        </div>

        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApi()
const router = useRouter()
const { t } = useI18n()
const { translateDifficulty, translateUnit } = useTranslations()

const loading = ref(false)
const error = ref('')
const ingredients = ref<any[]>([])
const imageInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref<string | null>(null)
const uploadedImageUrl = ref<string | null>(null)
const imageMode = ref<'upload' | 'url'>('url')
const recipeId = ref<string | null>(null)
const isEditMode = computed(() => !!recipeId.value)
const units = ref([
  { value: 'G', label: translateUnit('G') },
  { value: 'KG', label: translateUnit('KG') },
  { value: 'ML', label: translateUnit('ML') },
  { value: 'L', label: translateUnit('L') },
  { value: 'PIECE', label: translateUnit('PIECE') },
  { value: 'BUNCH', label: translateUnit('BUNCH') },
  { value: 'PINCH', label: translateUnit('PINCH') },
  { value: 'TBSP', label: translateUnit('TBSP') },
  { value: 'TSP', label: translateUnit('TSP') },
  { value: 'CUP', label: translateUnit('CUP') },
  { value: 'CLOVE', label: translateUnit('CLOVE') },
  { value: 'SLICE', label: translateUnit('SLICE') },
])

const formData = ref({
  title: '',
  description: '',
  imageUrl: '',
  prepTime: 15,
  cookTime: 30,
  servings: 1,
  difficulty: 'EASY' as 'EASY' | 'MEDIUM' | 'HARD',
  tags: [] as string[],
  toolsRequired: [] as string[],
  dietTypes: [] as string[],
  ingredients: [] as Array<{
    ingredientName: string
    quantity: number
    unit: string
  }>,
  steps: [] as Array<{
    stepNumber: number
    instruction: string
  }>,
})

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

const availableTools = computed(() => [
  { value: 'oven', label: t('tools.oven') },
  { value: 'microwave', label: t('tools.microwave') },
  { value: 'blender', label: t('tools.blender') },
  { value: 'casserole', label: t('tools.casserole') },
])

const availableDiets = computed(() => [
  { value: 'VEGETARIAN', label: t('enums.dietType.VEGETARIAN') },
  { value: 'VEGAN', label: t('enums.dietType.VEGAN') },
  { value: 'HALAL', label: t('enums.dietType.HALAL') },
  { value: 'KOSHER', label: t('enums.dietType.KOSHER') },
  { value: 'NO_PORK', label: t('enums.dietType.NO_PORK') },
  { value: 'NO_BEEF', label: t('enums.dietType.NO_BEEF') },
  { value: 'PESCATARIAN', label: t('enums.dietType.PESCATARIAN') },
  { value: 'GLUTEN_FREE', label: t('enums.dietType.GLUTEN_FREE') },
  { value: 'DAIRY_FREE', label: t('enums.dietType.DAIRY_FREE') },
  { value: 'NUT_FREE', label: t('enums.dietType.NUT_FREE') },
])

const canSubmit = computed(() => {
  return (
    formData.value.title &&
    formData.value.prepTime > 0 &&
    formData.value.cookTime >= 0 &&
    formData.value.servings > 0 &&
    formData.value.ingredients.length > 0 &&
    formData.value.steps.length > 0
  )
})

const toggleTag = (tag: string) => {
  const index = formData.value.tags.indexOf(tag)
  if (index > -1) {
    formData.value.tags.splice(index, 1)
  } else {
    formData.value.tags.push(tag)
  }
}

const toggleTool = (tool: string) => {
  const index = formData.value.toolsRequired.indexOf(tool)
  if (index > -1) {
    formData.value.toolsRequired.splice(index, 1)
  } else {
    formData.value.toolsRequired.push(tool)
  }
}

const toggleDiet = (diet: string) => {
  const index = formData.value.dietTypes.indexOf(diet)
  if (index > -1) {
    formData.value.dietTypes.splice(index, 1)
  } else {
    formData.value.dietTypes.push(diet)
  }
}

const addIngredient = () => {
  formData.value.ingredients.push({
    ingredientName: '',
    quantity: 1,
    unit: 'PIECE',
  })
}

const removeIngredient = (index: number) => {
  formData.value.ingredients.splice(index, 1)
}

const addStep = () => {
  formData.value.steps.push({
    stepNumber: formData.value.steps.length + 1,
    instruction: '',
  })
}

const removeStep = (index: number) => {
  formData.value.steps.splice(index, 1)
  // Renumber steps
  formData.value.steps.forEach((step, i) => {
    step.stepNumber = i + 1
  })
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    error.value = t('recipes.submit.invalidImageType')
    return
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = t('recipes.submit.imageTooLarge')
    return
  }

  // Show preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // Upload to backend
  try {
    error.value = '' // Clear previous errors
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not authenticated')
    }
    
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase as string
    const response = await fetch(`${apiBase}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: uploadFormData,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }))
      throw new Error(errorData.message || 'Upload failed')
    }
    
    const data = await response.json()
    uploadedImageUrl.value = data.url
    formData.value.imageUrl = data.url
  } catch (e: any) {
    error.value = e.message || t('recipes.submit.uploadError')
    imagePreview.value = null
    if (imageInput.value) {
      imageInput.value.value = ''
    }
  }
}

const removeImage = () => {
  imagePreview.value = null
  uploadedImageUrl.value = null
  formData.value.imageUrl = ''
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

// Reset image mode when switching
watch(imageMode, (newMode) => {
  if (newMode === 'url') {
    removeImage()
  } else {
    formData.value.imageUrl = ''
  }
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    // Try to match ingredients with existing ones
    const ingredientsWithIds = await Promise.all(
      formData.value.ingredients.map(async (ing) => {
        const existing = ingredients.value.find(
          (i) => i.name.toLowerCase() === ing.ingredientName.toLowerCase()
        )
        return {
          ingredientId: existing?.id,
          ingredientName: ing.ingredientName,
          quantity: ing.quantity,
          unit: ing.unit,
        }
      })
    )

    // Determine imageUrl based on mode
    let finalImageUrl: string | undefined = undefined
    if (imageMode.value === 'upload' && uploadedImageUrl.value) {
      finalImageUrl = uploadedImageUrl.value
    } else if (imageMode.value === 'url' && formData.value.imageUrl) {
      finalImageUrl = formData.value.imageUrl
    }

    const payload = {
      ...formData.value,
      imageUrl: finalImageUrl,
      ingredients: ingredientsWithIds,
    }

    // Include recipeId if in edit mode
    if (recipeId.value) {
      payload.recipeId = recipeId.value
    }

    await api.post('/recipe-submissions', payload)
    
    // Show success notification and redirect
    const { show } = useNotification()
    show(t('recipes.submit.success'), 'success')
    
    // Redirect to dashboard
    await router.push('/dashboard')
  } catch (e: any) {
    error.value = e.message || t('recipes.submit.error')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    // Load ingredients
    ingredients.value = await api.get('/ingredients')

    // Check if we're in edit mode (recipeId in query params)
    const recipeIdParam = route.query.recipeId as string | undefined
    if (recipeIdParam) {
      recipeId.value = recipeIdParam
      
      // Load recipe data to pre-fill form
      try {
        const recipe = await api.get(`/recipes/${recipeIdParam}`)
        
        // Pre-fill form data
        formData.value.title = recipe.title
        formData.value.description = recipe.description || ''
        formData.value.imageUrl = recipe.imageUrl || ''
        formData.value.prepTime = recipe.prepTime
        formData.value.cookTime = recipe.cookTime
        formData.value.servings = recipe.servings
        formData.value.difficulty = recipe.difficulty
        formData.value.tags = recipe.tags || []
        formData.value.toolsRequired = recipe.toolsRequired || []
        formData.value.dietTypes = recipe.dietTypes || []
        
        // Pre-fill ingredients
        formData.value.ingredients = recipe.ingredients.map((ing: any) => ({
          ingredientName: ing.ingredient.name,
          quantity: Number(ing.quantity),
          unit: ing.unit,
        }))
        
        // Pre-fill steps
        formData.value.steps = recipe.steps
          .sort((a: any, b: any) => a.stepNumber - b.stepNumber)
          .map((step: any) => ({
            stepNumber: step.stepNumber,
            instruction: step.instruction,
          }))
        
        // Set image mode based on whether imageUrl exists
        if (recipe.imageUrl) {
          imageMode.value = 'url'
        }
      } catch (e: any) {
        error.value = e.message || t('recipes.edit.loadError')
      }
    }
  } catch (e: any) {
    console.error('Failed to load ingredients:', e)
  }
})

definePageMeta({
  middleware: 'auth',
})
</script>

