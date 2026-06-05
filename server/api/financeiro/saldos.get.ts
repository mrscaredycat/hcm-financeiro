import { getQuery } from 'h3'

/**
 * API Route: GET /api/financeiro/saldos
 *
 * Queries:
 *   - type: 'pagar' | 'receber'
 *   - filial: number (optional - if omitted, fetches all filials)
 *   - venctoInicial: string (YYYY-MM-DD)
 *   - venctoFinal: string (YYYY-MM-DD)
 *   - expand: string (optional)
 *   - saldoEmAberto: boolean (optional - use SaldoEmAberto endpoint if true)
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const type = query.type as string // 'pagar' | 'receber'
  const filial = query.filial as string | undefined
  const venctoInicial = query.venctoInicial as string
  const venctoFinal = query.venctoFinal as string
  const expand = query.expand as string | undefined
  const saldoEmAberto = query.saldoEmAberto === 'true'

  if (!type || !['pagar', 'receber'].includes(type)) {
    return { error: 'Parâmetro "type" inválido. Use "pagar" ou "receber".' }
  }

  if (!venctoInicial || !venctoFinal) {
    return { error: 'Parâmetros "venctoInicial" e "venctoFinal" são obrigatórios.' }
  }

  try {
    const resource = type === 'pagar' ? 'FaturaPagar' : 'FaturaReceber'
    const saldoType = saldoEmAberto ? 'SaldoEmAberto' : 'Saldo'

    let endpoint: string

    if (filial) {
      endpoint = `/api/FinanceiroMovimentacao/${resource}/Saldo/Filial/${filial}/${venctoInicial}/${venctoFinal}`
    } else {
      endpoint = `/api/FinanceiroMovimentacao/${resource}/${saldoType}/${venctoInicial}/${venctoFinal}`
    }

    if (expand) {
      endpoint += `?expand=${expand}`
    }

    console.log(`[Financeiro API] Buscando: ${endpoint}`)
    const response = await fetchExternalApi(endpoint)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Financeiro API] Erro ${response.status}: ${errorText}`)
      throw new Error(`Erro na API externa: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log(`[Financeiro API] Sucesso! type=${type}, filial=${filial ?? 'todas'}`)
    return data
  } catch (error: any) {
    console.error(`[Financeiro API] Erro crítico:`, error)

    let friendlyMessage = error.message || 'Erro desconhecido'
    const errorString = (String(error) + ' ' + String(error.message || '')).toLowerCase()

    if (error.name === 'AbortError' || errorString.includes('aborted') || errorString.includes('timeout')) {
      friendlyMessage = 'O servidor do MegaERP demorou muito para responder (tempo limite excedido).'
    } else if (errorString.includes('fetch failed') || errorString.includes('networkerror') || errorString.includes('enotfound') || errorString.includes('econnrefused')) {
      friendlyMessage = 'Não foi possível conectar ao servidor do MegaERP. Verifique sua conexão ou se o servidor está disponível.'
    }

    return {
      success: false,
      error: friendlyMessage,
      originalError: error.message
    }
  }
})
