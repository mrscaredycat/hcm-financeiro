import { execSync } from 'child_process'
import { readFileSync } from 'fs'

const getGitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch (e) {
    return 'dev'
  }
}

const getPackageVersion = () => {
  try {
    const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))
    return packageJson.version || '0.0.0'
  } catch (e) {
    return '0.0.0'
  }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light',
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '-mode',
    storageKey: 'nuxt-color-mode'
  },

  runtimeConfig: {
    // Private server-side vars
    apiBaseUrl: process.env.API_BASE_URL,
    tenantId: process.env.TENANT_ID,
    externalApiUser: process.env.EXTERNAL_API_USER,
    externalApiPassword: process.env.EXTERNAL_API_PASSWORD,

    // Public client-side vars
    public: {
      APP_VERSION: getPackageVersion(),
      APP_COMMIT_HASH: getGitHash()
    }
  },

  nitro: {
    preset: process.env.NITRO_PRESET ?? 'node-server',
    watchOptions: {
      usePolling: true,
      interval: 1500,
      ignored: ['**/.git/**', '**/node_modules/**', '**/.output/**']
    }
  },

  watchers: {
    chokidar: {
      usePolling: true,
      interval: 1500,
      ignored: ['**/.git/**', '**/node_modules/**', '**/.output/**']
    }
  },

  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 1500,
        ignored: ['**/.git/**', '**/node_modules/**', '**/.output/**']
      }
    }
  },

  routeRules: {
    '/**': { ssr: false }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
