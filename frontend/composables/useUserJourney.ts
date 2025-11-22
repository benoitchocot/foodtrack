export interface JourneyStep {
  id: string
  title: string
  description: string
  completed: boolean
  route?: string
  action?: () => void
}

export const useUserJourney = () => {
  const api = useApi()
  const router = useRouter()
  
  // Track journey progress in localStorage
  const journeyProgress = useState<Record<string, boolean>>('journeyProgress', () => {
    if (import.meta.client) {
      const stored = localStorage.getItem('userJourneyProgress')
      return stored ? JSON.parse(stored) : {}
    }
    return {}
  })

  // Save progress to localStorage
  const saveProgress = () => {
    if (import.meta.client) {
      localStorage.setItem('userJourneyProgress', JSON.stringify(journeyProgress.value))
    }
  }

  // State to track if onboarding is completed (checked from database)
  const hasCompletedOnboardingState = useState<boolean>('hasCompletedOnboarding', () => false)
  
  // Check if user has completed onboarding
  // This checks both localStorage and the database (settings)
  const hasCompletedOnboarding = computed(() => {
    // First check localStorage (faster)
    if (journeyProgress.value.onboarding === true) {
      return true
    }
    // Also check the state from database check
    return hasCompletedOnboardingState.value
  })

  // Check if user has completed onboarding by verifying settings in database
  const checkHasCompletedOnboarding = async (): Promise<boolean> => {
    try {
      const settings = await api.get('/users/me/settings')
      const completed = settings && 
                        settings.toolsAvailable && 
                        Array.isArray(settings.toolsAvailable) &&
                        settings.toolsAvailable.length > 0
      
      // Update state
      hasCompletedOnboardingState.value = completed
      
      // Sync with localStorage if completed
      if (completed && journeyProgress.value.onboarding !== true) {
        journeyProgress.value.onboarding = true
        saveProgress()
      }
      
      return completed
    } catch (error: any) {
      // If 404, user has no settings yet - not completed
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        hasCompletedOnboardingState.value = false
        return false
      }
      // For other errors, return false
      hasCompletedOnboardingState.value = false
      return false
    }
  }

  // Check if user has generated a meal plan (async function, not computed)
  const checkHasGeneratedMealPlan = async (): Promise<boolean> => {
    try {
      const mealPlans = await api.get('/meal-plans')
      return Array.isArray(mealPlans) && mealPlans.length > 0
    } catch {
      return false
    }
  }

  // Check if user has created a shopping list (async function, not computed)
  const checkHasCreatedShoppingList = async (): Promise<boolean> => {
    try {
      const lists = await api.get('/shopping-lists')
      return Array.isArray(lists) && lists.length > 0
    } catch {
      return false
    }
  }

  // Mark step as completed
  const completeStep = (stepId: string) => {
    journeyProgress.value[stepId] = true
    saveProgress()
  }

  // Reset journey (for testing or new user)
  const resetJourney = () => {
    journeyProgress.value = {}
    saveProgress()
  }

  // Get current step in journey
  const getCurrentStep = async (): Promise<string | null> => {
    // First check if onboarding is completed (verify in database)
    const onboardingCompleted = await checkHasCompletedOnboarding()
    if (!onboardingCompleted) {
      return 'onboarding'
    }
    
    const hasMealPlan = await checkHasGeneratedMealPlan()
    if (!hasMealPlan) {
      return 'generate-meal-plan'
    }
    
    const hasList = await checkHasCreatedShoppingList()
    if (!hasList) {
      return 'create-shopping-list'
    }
    
    return null // Journey complete
  }

  // Check if user is new (no progress)
  const isNewUser = computed(() => {
    return Object.keys(journeyProgress.value).length === 0
  })

  return {
    journeyProgress: readonly(journeyProgress),
    hasCompletedOnboarding,
    checkHasCompletedOnboarding,
    checkHasGeneratedMealPlan,
    checkHasCreatedShoppingList,
    completeStep,
    resetJourney,
    getCurrentStep,
    isNewUser,
  }
}

