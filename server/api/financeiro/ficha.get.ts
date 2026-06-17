import { getQuery } from 'h3'

/**
 * API Route: GET /api/financeiro/ficha
 *
 * Busca a ficha financeira de um agente por filial.
 * Agrupa movimentações de pagar e receber por mês.
 *
 * Queries:
 *   - codAgente: string (required)
 *   - filial: string (required)
 *   - ano: string (optional, default current year)
 */

const MESES_LABEL = [
  'Anterior',
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function parseDateStr(str: string): Date | null {
  if (!str) return null
  // Format: "DD/MM/YYYY"
  if (str.includes('/')) {
    const [d, m, y] = str.split('/')
    return new Date(Number(y), Number(m) - 1, Number(d))
  }
  return new Date(str)
}

async function fetchWithTimeout(endpoint: string, timeoutMs = 30000): Promise<Response | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const resp = await fetchExternalApi(endpoint, { signal: controller.signal })
    clearTimeout(timeoutId)
    return resp
  } catch (e: any) {
    clearTimeout(timeoutId)
    if (e.name === 'AbortError') {
      console.warn(`[Ficha API] Timeout: ${endpoint}`)
      return null
    }
    throw e
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const codAgente = query.codAgente as string
  const filial = query.filial as string
  const ano = (query.ano as string) || new Date().getFullYear().toString()

  if (!codAgente) return { error: 'Parâmetro "codAgente" é obrigatório.' }

  const anoNum = parseInt(ano, 10)
  const dtInicial = `${ano}-01-01T00:00:00`
  const dtFinal = `${ano}-12-31T23:59:59`

  // Estrutura: 0=Anterior, 1=Jan...12=Dez
  const meses = Array.from({ length: 13 }, (_, i) => ({
    mes: i,
    entradas: 0,
    saidas: 0
  }))

  const errors: string[] = []

  // Busca pagar (saídas) filtrado por codAgente
  try {
    const ep = `/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Agente/${codAgente}/${dtInicial}/${dtFinal}?expand=agente&pageSize=1000`
    console.log(`[Ficha API] Pagar: ${ep}`)
    const resp = await fetchWithTimeout(ep)

    if (resp && resp.ok) {
      const data = await resp.json()
      const items: any[] = Array.isArray(data) ? data : (data?.value ?? data?.items ?? [])

      if (items.length > 0) {
        console.log(`\n[DEBUG PAGAR] Primeiro item retornado da Mega:`)
        console.log(JSON.stringify(items[0], null, 2))
      }

      for (const item of items) {
        // NÃO filtramos mais por agente aqui, pois a URL já é /Agente/${codAgente}
        const val = Number(item.ValorParcela ?? item.Valor ?? 0)
        const dt = parseDateStr(item.DataVencimento ?? item.DataEmissao ?? '')
        if (!dt) continue
        const itemAno = dt.getFullYear()
        const itemMes = dt.getMonth() + 1
        if (itemAno < anoNum) {
          meses[0].saidas += val
        } else if (itemAno === anoNum && itemMes >= 1 && itemMes <= 12) {
          meses[itemMes].saidas += val
        }
      }
      console.log(`[Ficha API] Pagar: ${items.length} faturas totais encontradas no período`)
    } else if (!resp) {
      errors.push('Pagar: timeout')
    } else {
      errors.push(`Pagar: ${resp.status}`)
    }
  } catch (e: any) {
    errors.push(`Pagar: ${e.message}`)
    console.error('[Ficha API] Erro pagar:', e.message)
  }

  // Busca receber (entradas) filtrado por codAgente
  try {
    const ep = `/api/FinanceiroMovimentacao/FaturaReceber/Saldo/Agente/${codAgente}/${dtInicial}/${dtFinal}?expand=agente&pageSize=1000`
    console.log(`[Ficha API] Receber: ${ep}`)
    const resp = await fetchWithTimeout(ep)

    if (resp && resp.ok) {
      const data = await resp.json()
      const items: any[] = Array.isArray(data) ? data : (data?.value ?? data?.items ?? [])

      if (items.length > 0) {
        console.log(`\n[DEBUG RECEBER] Primeiro item retornado da Mega:`)
        console.log(JSON.stringify(items[0], null, 2))
      }

      for (const item of items) {
        // NÃO filtramos mais por agente aqui, pois a URL já é /Agente/${codAgente}
        const val = Number(item.ValorParcela ?? item.Valor ?? 0)
        const dt = parseDateStr(item.DataVencimento ?? item.DataEmissao ?? '')
        if (!dt) continue
        const itemAno = dt.getFullYear()
        const itemMes = dt.getMonth() + 1
        if (itemAno < anoNum) {
          meses[0].entradas += val
        } else if (itemAno === anoNum && itemMes >= 1 && itemMes <= 12) {
          meses[itemMes].entradas += val
        }
      }
      console.log(`[Ficha API] Receber: ${items.length} faturas totais encontradas no período`)
    } else if (!resp) {
      errors.push('Receber: timeout')
    } else {
      errors.push(`Receber: ${resp.status}`)
    }
  } catch (e: any) {
    errors.push(`Receber: ${e.message}`)
    console.error('[Ficha API] Erro receber:', e.message)
  }

  // Calcula saldos acumulados
  let saldoAcumulado = 0
  const fichaRows = meses.map((m, idx) => {
    const saldoMes = m.entradas - m.saidas
    saldoAcumulado += saldoMes
    return {
      mes: m.mes,
      periodo: idx === 0 ? 'Anterior' : String(m.mes),
      periodoLabel: MESES_LABEL[idx],
      entradas: m.entradas,
      saidas: m.saidas,
      saldoMes,
      saldoAtual: saldoAcumulado
    }
  })

  if (errors.length > 0) {
    console.warn(`[Ficha API] Erros para agente ${codAgente} filial ${filial}:`, errors)
  }

  return fichaRows
})
