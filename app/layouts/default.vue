<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
    <header class="w-full bg-white dark:bg-gray-800 shadow-sm shrink-0 z-10">
      <UContainer class="flex items-center h-16 m-0 w-full max-w-full px-4">
        <NuxtLink to="/">
          <AppLogo class="flex-initial h-10" />
        </NuxtLink>

        <div class="ml-4 flex items-center gap-2">
          <UBadge color="warning" variant="soft" size="sm" label="Financeiro" />
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200 hidden sm:block">
            Consulta de Saldos
          </span>
        </div>

        <div class="w-full flex justify-end gap-4 items-center">
          <span class="text-xs text-gray-400 hidden md:block">
            v{{ config.public.APP_VERSION || '0.0.0' }}
          </span>
        </div>
      </UContainer>
    </header>

    <main class="flex-1 w-full overflow-y-auto">
      <slot />
    </main>

    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 shrink-0 z-10">
      <UContainer class="text-center text-sm text-gray-500 flex flex-col gap-1">
        <div>
          &copy; {{ new Date().getFullYear() }} HCM Financeiro &mdash; Consulta de Saldos |
          <span class="text-xs text-gray-400">
            v{{ config.public.APP_VERSION || '0.0.0' }} - ({{ config.public.APP_COMMIT_HASH || 'dev' }})
          </span>
        </div>
      </UContainer>
    </footer>

    <UNotifications />
  </div>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig()
</script>
