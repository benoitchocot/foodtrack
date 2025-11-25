<template>
  <header ref="headerRef" class="bg-white shadow-sm sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between gap-2 sm:gap-4">
        <NuxtLink to="/dashboard" class="text-xl sm:text-2xl font-bold text-primary-600 truncate flex-shrink-0">
          {{ $t('common.appName') }}
        </NuxtLink>
        <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <!-- Desktop: Language switcher and actions -->
          <div class="hidden sm:flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <slot name="actions">
              <button v-if="showLogout" @click="handleLogout" class="btn btn-secondary text-sm whitespace-nowrap">
                {{ $t('auth.logout') }}
              </button>
            </slot>
          </div>
          
          <!-- Mobile: Burger menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            :aria-label="$t('common.menu')"
          >
            <Icon :name="mobileMenuOpen ? 'mdi:close' : 'mdi:menu'" class="text-2xl text-gray-700" />
          </button>
        </div>
      </div>
      
      <!-- Mobile menu dropdown -->
      <Transition name="slide-down">
        <div v-if="mobileMenuOpen" class="sm:hidden mt-4 pt-4 border-t border-gray-200">
          <div class="flex flex-col gap-2">
            <div class="pb-2 border-b border-gray-200">
              <LanguageSwitcher />
            </div>
            <div class="flex flex-col gap-2 [&_.btn]:w-full [&_.btn]:text-left [&_.btn]:justify-start">
              <slot name="actions">
                <button v-if="showLogout" @click="handleLogout" class="btn btn-secondary text-sm">
                  <Icon name="mdi:logout" class="mr-2" />
                  {{ $t('auth.logout') }}
                </button>
              </slot>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  showLogout?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLogout: true,
})

const { logout } = useAuth()
const mobileMenuOpen = ref(false)
const headerRef = ref<HTMLElement | null>(null)

const handleLogout = () => {
  logout()
  mobileMenuOpen.value = false
}

// Close menu when clicking outside
useClickOutside(headerRef, () => {
  mobileMenuOpen.value = false
})

// Close menu on route change
const route = useRoute()
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
</style>

