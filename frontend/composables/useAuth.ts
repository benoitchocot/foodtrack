interface User {
    id: string
    email: string
    name: string
    hasSeenTutorial?: boolean
}

interface AuthResponse {
    accessToken: string
    user: User
}

export const useAuth = () => {
    const api = useApi()
    const router = useRouter()
    const user = useState<User | null>('user', () => null)
    const isAuthenticated = computed(() => !!user.value)

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', { email, password })
            if (import.meta.client) {
                localStorage.setItem('token', response.accessToken)
            }
            user.value = response.user
            return response
        } catch (error) {
            throw error
        }
    }

    const register = async (name: string, email: string, password: string) => {
        try {
            // Split name into first and last name for the backend
            const [firstName, ...lastNameParts] = name.trim().split(' ')
            const lastName = lastNameParts.join(' ')

            const response = await api.post<AuthResponse>('/auth/register', {
                firstName,
                lastName: lastName || undefined,
                email,
                password
            })
            if (import.meta.client) {
                localStorage.setItem('token', response.accessToken)
            }
            user.value = response.user
            // Redirect to onboarding after registration
            router.push('/onboarding')
            return response
        } catch (error) {
            throw error
        }
    }

    const logout = () => {
        if (import.meta.client) {
            localStorage.removeItem('token')
        }
        user.value = null
        router.push('/login')
    }

    const fetchProfile = async () => {
        try {
            const profile = await api.get<User>('/users/me')
            user.value = profile
            return profile
        } catch (error) {
            logout()
            throw error
        }
    }

    const markTutorialAsSeen = async () => {
        try {
            await api.patch('/users/me/tutorial-seen')
            if (user.value) {
                user.value.hasSeenTutorial = true
            }
        } catch (error) {
            console.error('Failed to mark tutorial as seen:', error)
        }
    }

    // Auto-fetch profile on mount if token exists
    onMounted(() => {
        if (import.meta.client && localStorage.getItem('token')) {
            fetchProfile().catch(() => {
                // Token invalid, logout
                logout()
            })
        }
    })

    return {
        user,
        isAuthenticated,
        login,
        register,
        logout,
        fetchProfile,
        markTutorialAsSeen,
    }
}
