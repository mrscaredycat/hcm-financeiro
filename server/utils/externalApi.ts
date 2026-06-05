// --- Tipagem para a resposta da API ---
interface TokenData {
  accessToken: string
  refreshToken?: string
  expirationToken: string // ISO Date String
  expirationRefreshToken?: string // ISO Date String
}

let cachedToken: string | null = null
let cachedRefreshToken: string | null = null
let tokenExpiration: number | null = null
let refreshTokenExpiration: number | null = null

// Variável para controlar o "single flight"
let loginPromise: Promise<string | null> | null = null

export function clearTokenCache() {
  cachedToken = null
  cachedRefreshToken = null
  tokenExpiration = null
  refreshTokenExpiration = null
  loginPromise = null
}

async function login(): Promise<TokenData> {
  const config = useRuntimeConfig()
  console.log('Autenticando na API externa (Login)...')

  const username = process.env.EXTERNAL_API_USER ?? config.externalApiUser
  const password = process.env.EXTERNAL_API_PASSWORD ?? config.externalApiPassword
  const tenantId = process.env.TENANT_ID ?? config.tenantId
  const apiBaseUrl = process.env.API_BASE_URL ?? config.apiBaseUrl

  console.log(`[DEBUG] Tentando login com: Username=${username}, TenantId=${tenantId}`)

  const response = await fetch(`${apiBaseUrl}/api/Auth/SignIn`, {
    method: 'POST',
    headers: {
      'tenantid': tenantId,
      'granttype': 'api',
      'Content-Type': 'application/json',
      'Accept': 'text/plain'
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[ERROR] Falha no login externo: Status=${response.status}, Body=${errorText}`)
    throw new Error(`Falha no login externo: ${response.statusText}`)
  }
  return await response.json()
}

async function refresh(): Promise<TokenData> {
  const config = useRuntimeConfig()
  if (!cachedRefreshToken) throw new Error('Sem refresh token disponível')

  console.log('Renovando token (Refresh)...')

  const apiBaseUrl = process.env.API_BASE_URL ?? config.apiBaseUrl
  const tenantId = process.env.TENANT_ID ?? config.tenantId

  const response = await fetch(`${apiBaseUrl}/api/Auth/RefreshToken?refreshToken=${cachedRefreshToken}`, {
    method: 'POST',
    headers: {
      'tenantid': tenantId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[ERROR] Falha no refresh token: Status=${response.status}, Body=${errorText}`)
    throw new Error(`Falha no refresh token: ${response.statusText}`)
  }
  return await response.json()
}

function updateTokens(data: TokenData) {
  if (!data.accessToken) throw new Error('Token não encontrado na resposta')

  cachedToken = data.accessToken
  if (data.refreshToken) {
    cachedRefreshToken = data.refreshToken
  }

  tokenExpiration = new Date(data.expirationToken).getTime()

  if (data.expirationRefreshToken) {
    refreshTokenExpiration = new Date(data.expirationRefreshToken).getTime()
  } else {
    refreshTokenExpiration = Date.now() + 30 * 24 * 3600 * 1000
  }
}

export async function getValidToken(): Promise<string | null> {
  const now = Date.now()

  if (loginPromise) {
    console.log('Aguardando operação de login/refresh em andamento...')
    return await loginPromise
  }

  if (cachedToken && tokenExpiration && now < tokenExpiration - 60000) {
    console.log('Usando token em cache.')
    return cachedToken
  }

  loginPromise = (async () => {
    try {
      if (cachedRefreshToken && refreshTokenExpiration && now < refreshTokenExpiration) {
        console.log('Token de acesso expirado, tentando refresh...')
        try {
          const data = await refresh()
          updateTokens(data)
          console.log('Token renovado com sucesso via refresh.')
          return cachedToken
        } catch (e) {
          console.warn('Falha ao usar refresh token, prosseguindo para login completo...', e)
          cachedRefreshToken = null
          refreshTokenExpiration = null
        }
      }

      console.log('Nenhum token válido ou refresh token. Fazendo login completo.')
      const data = await login()
      updateTokens(data)
      console.log('Login completo realizado com sucesso.')
      return cachedToken
    } catch (error) {
      console.error('Erro crítico de autenticação externa:', error)
      cachedToken = null
      cachedRefreshToken = null
      tokenExpiration = null
      refreshTokenExpiration = null
      throw error
    } finally {
      loginPromise = null
    }
  })()

  return await loginPromise
}

export async function fetchExternalApi(endpoint: string, options: RequestInit = {}) {
  const config = useRuntimeConfig()

  const token = await getValidToken()

  if (!token) {
    throw new Error('Não foi possível obter um token de autenticação válido.')
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint
  const url = `${process.env.API_BASE_URL ?? config.apiBaseUrl}/${cleanEndpoint}`

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': `application/json`
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  if (response.status === 401) {
    console.warn('Recebido 401 da API externa. Forçando renovação...')
    cachedToken = null
    tokenExpiration = null

    const newToken = await getValidToken()

    if (!newToken) {
      throw new Error('Não foi possível obter um novo token de autenticação após 401.')
    }

    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        Authorization: `Bearer ${newToken}`
      }
    })
  }

  return response
}
