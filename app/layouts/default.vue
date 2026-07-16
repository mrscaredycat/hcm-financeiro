<template>
  <div class="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
    <header class="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300">
      <UContainer class="flex items-center justify-between h-16 md:h-20 max-w-7xl mx-auto w-full">
        <!-- Left Side: Logo -->
        <NuxtLink
          to="/"
          class="flex items-center group"
        >
          <AppLogo class="h-8 md:h-12 w-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105" />
        </NuxtLink>

        <!-- Right Side: Actions & User Info -->
        <div class="flex items-center gap-4">
          <UButton
            v-if="isAdmin"
            to="/configurar-usuarios"
            color="orange"
            variant="outline"
            icon="i-lucide-user-cog"
            label="Configurar Usuários"
            size="sm"
            class="hidden sm:flex font-semibold bg-white border-orange-200 hover:bg-orange-50 text-orange-600 shadow-sm mr-2"
          />

          <template v-if="user">
            <div class="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div class="flex items-center gap-3 ml-2">
              <div class="hidden lg:flex flex-col text-right">
                <span class="text-sm font-bold text-slate-800">{{ user.displayName || 'Usuário' }}</span>
                <span class="text-xs text-slate-500">{{ user.email }}</span>
              </div>
              <UAvatar
                :src="user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=7c3aed&color=fff&rounded=true&bold=true`"
                size="md"
                :alt="user.displayName || user.email"
                class="ring-2 ring-white shadow-sm"
              />
            </div>

            <UButton
              color="gray"
              variant="ghost"
              icon="i-lucide-log-out"
              size="sm"
              class="text-slate-600 hover:text-red-600 font-medium ml-1"
              title="Sair"
              @click="sair"
            />
          </template>
        </div>
      </UContainer>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 w-full relative z-10 py-8 lg:py-12">
      <slot />
    </main>

    <!-- Simple, Professional Footer -->
    <footer class="mt-auto border-t border-slate-200/60 bg-white">
      <UContainer class="flex flex-col md:flex-row items-center justify-between py-6 text-sm text-slate-500 max-w-7xl mx-auto">
        <div class="font-medium text-slate-600 text-center md:text-left mb-4 md:mb-0">
          &copy; {{ new Date().getFullYear() }} HCM Engenharia. Todos os direitos reservados.
        </div>
        <div class="flex items-center gap-6 text-xs font-medium">
          <span class="bg-slate-100 px-3 py-1 rounded-md border border-slate-200">v{{ config.public.APP_VERSION || '1.0.0' }}</span>
        </div>
      </UContainer>
    </footer>

    <UNotifications />
  </div>
</template>

<script lang="ts" setup>
import { useFirebaseAuth, useCurrentUser } from 'vuefire'
import { signOut } from 'firebase/auth'

const config = useRuntimeConfig()
const user = useCurrentUser()
const { isAdmin } = useAdmin()
const auth = useFirebaseAuth()
const router = useRouter()

async function sair() {
  if (auth) {
    await signOut(auth)
    router.push('/login')
  }
}
</script>
