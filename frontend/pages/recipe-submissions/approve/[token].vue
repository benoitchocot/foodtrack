<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">{{ $t('approval.loading') }}</p>
      </div>

      <div v-else-if="error" class="card text-center py-12">
        <Icon name="mdi:alert-circle" class="text-6xl text-red-500 mb-4" />
        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ $t('approval.error') }}</h2>
        <p class="text-gray-600">{{ error }}</p>
      </div>

      <div v-else-if="submission">
        <!-- Header -->
        <div class="card mb-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ submission.title }}</h1>
              <p class="text-gray-600">
                {{ $t('approval.submittedBy') }}: {{ submission.user?.email || 'Unknown' }}
              </p>
              <p v-if="submission.submittedAt" class="text-sm text-gray-500 mt-1">
                {{ $t('approval.submittedAt') }}: {{ formatDate(submission.submittedAt) }}
              </p>
            </div>
            <div>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  submission.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : submission.status === 'APPROVED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ $t(`approval.status.${submission.status}`) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Recipe Details -->
        <div class="card mb-6">
          <h2 class="text-xl font-semibold mb-4">{{ $t('approval.recipeDetails') }}</h2>

          <div v-if="submission.description" class="mb-4">
            <h3 class="text-sm font-medium text-gray-700 mb-1">{{ $t('recipes.description') }}</h3>
            <p class="text-gray-600">{{ submission.description }}</p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-500">{{ $t('recipes.prepTime') }}</p>
              <p class="font-semibold">{{ submission.prepTime }} {{ $t('recipes.min') }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('recipes.cookTime') }}</p>
              <p class="font-semibold">{{ submission.cookTime }} {{ $t('recipes.min') }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('recipes.servings') }}</p>
              <p class="font-semibold">{{ submission.servings }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ $t('recipes.difficulty') }}</p>
              <p class="font-semibold">{{ translateDifficulty(submission.difficulty) }}</p>
            </div>
          </div>

          <div v-if="submission.imageUrl" class="mb-4">
            <img :src="submission.imageUrl" :alt="submission.title" class="w-full rounded-lg max-h-96 object-cover" />
          </div>

          <div v-if="submission.tags && submission.tags.length > 0" class="mb-4">
            <p class="text-sm font-medium text-gray-700 mb-2">{{ $t('recipes.tags') }}</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in submission.tags"
                :key="tag"
                class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div v-if="submission.toolsRequired && submission.toolsRequired.length > 0" class="mb-4">
            <p class="text-sm font-medium text-gray-700 mb-2">{{ $t('tools.title') }}</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tool in submission.toolsRequired"
                :key="tool"
                class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {{ tool }}
              </span>
            </div>
          </div>

          <div v-if="submission.dietTypes && submission.dietTypes.length > 0" class="mb-4">
            <p class="text-sm font-medium text-gray-700 mb-2">{{ $t('enums.dietType.title') }}</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="diet in submission.dietTypes"
                :key="diet"
                class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {{ $t(`enums.dietType.${diet}`) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Ingredients -->
        <div class="card mb-6">
          <h2 class="text-xl font-semibold mb-4">{{ $t('recipes.ingredients') }}</h2>
          <ul class="space-y-2">
            <li
              v-for="(ing, index) in submission.ingredients"
              :key="index"
              class="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
            >
              <span class="flex-1">
                <span class="font-medium">{{ ing.ingredientName }}</span>
                <span v-if="ing.optional" class="text-sm text-gray-500 ml-2">({{ $t('common.optional') }})</span>
              </span>
              <span class="text-gray-600">
                {{ ing.quantity }} {{ translateUnit(ing.unit) }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Steps -->
        <div class="card mb-6">
          <h2 class="text-xl font-semibold mb-4">{{ $t('recipes.instructions') }}</h2>
          <ol class="space-y-4">
            <li
              v-for="(step, index) in submission.steps"
              :key="index"
              class="flex gap-4"
            >
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
                {{ step.stepNumber }}
              </div>
              <p class="flex-1 text-gray-700">{{ step.instruction }}</p>
            </li>
          </ol>
        </div>

        <!-- Rejection Reason (if rejected) -->
        <div v-if="submission.status === 'REJECTED' && submission.rejectionReason" class="card mb-6 bg-red-50 border border-red-200">
          <h3 class="text-lg font-semibold text-red-900 mb-2">{{ $t('approval.rejectionReason') }}</h3>
          <p class="text-red-700">{{ submission.rejectionReason }}</p>
        </div>

        <!-- Actions -->
        <div v-if="submission.status === 'PENDING'" class="card">
          <h3 class="text-lg font-semibold mb-4">{{ $t('approval.actions') }}</h3>
          
          <div class="space-y-4">
            <div>
              <label for="rejectionReason" class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('approval.rejectionReason') }} ({{ $t('common.optional') }})
              </label>
              <textarea
                id="rejectionReason"
                v-model="rejectionReason"
                rows="3"
                class="input"
                :placeholder="$t('approval.rejectionReasonPlaceholder')"
              />
            </div>

            <div class="flex gap-4">
              <button
                @click="handleApprove"
                :disabled="actionLoading"
                class="btn btn-primary flex-1"
              >
                <Icon name="mdi:check" class="mr-2" />
                {{ $t('approval.approve') }}
              </button>
              <button
                @click="handleReject"
                :disabled="actionLoading"
                class="btn btn-secondary flex-1"
              >
                <Icon name="mdi:close" class="mr-2" />
                {{ $t('approval.reject') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div v-else-if="submission.status === 'APPROVED'" class="card bg-green-50 border border-green-200">
          <div class="flex items-center gap-3">
            <Icon name="mdi:check-circle" class="text-4xl text-green-600" />
            <div>
              <h3 class="text-lg font-semibold text-green-900">{{ $t('approval.approved') }}</h3>
              <p class="text-green-700">{{ $t('approval.approvedMessage') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const { translateDifficulty, translateUnit } = useTranslations()

const token = computed(() => route.params.token as string)
const submission = ref<any>(null)
const loading = ref(true)
const error = ref('')
const actionLoading = ref(false)
const rejectionReason = ref('')

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

const loadSubmission = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Use direct fetch to avoid auth middleware issues
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase as string
    const response = await fetch(`${apiBase}/recipe-submissions/approve/${token.value}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to load submission' }))
      throw new Error(errorData.message || 'Failed to load submission')
    }
    
    submission.value = await response.json()
  } catch (e: any) {
    error.value = e.message || t('approval.loadError')
  } finally {
    loading.value = false
  }
}

const handleApprove = async () => {
  actionLoading.value = true
  
  try {
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase as string
    const response = await fetch(`${apiBase}/recipe-submissions/approve/${token.value}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to approve' }))
      throw new Error(errorData.message || 'Failed to approve')
    }
    
    await loadSubmission()
    alert(t('approval.approveSuccess'))
  } catch (e: any) {
    alert(t('approval.approveError') + ': ' + e.message)
  } finally {
    actionLoading.value = false
  }
}

const handleReject = async () => {
  if (!confirm(t('approval.rejectConfirm'))) {
    return
  }
  
  actionLoading.value = true
  
  try {
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase as string
    const response = await fetch(`${apiBase}/recipe-submissions/approve/${token.value}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rejectionReason: rejectionReason.value || undefined,
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to reject' }))
      throw new Error(errorData.message || 'Failed to reject')
    }
    
    await loadSubmission()
    alert(t('approval.rejectSuccess'))
  } catch (e: any) {
    alert(t('approval.rejectError') + ': ' + e.message)
  } finally {
    actionLoading.value = false
  }
}

// Watch for token changes and load submission
watch(token, async (newToken) => {
  if (newToken) {
    await loadSubmission()
  }
}, { immediate: true })

onMounted(async () => {
  // Fallback in case watch doesn't trigger
  if (token.value && !submission.value) {
    await loadSubmission()
  }
})

definePageMeta({
  layout: false,
  middleware: [], // No auth required for approval page
})
</script>

