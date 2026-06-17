export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const cod = query.cod || '6253'
  
  const { accessToken } = await $fetch('/api/auth/mega-login')
  
  const epPagar = `/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Agente/${cod}/2026-01-01T00:00:00/2026-12-31T23:59:59`
  const epReceber = `/api/FinanceiroMovimentacao/FaturaReceber/Saldo/Agente/${cod}/2026-01-01T00:00:00/2026-12-31T23:59:59`
  
  try {
    const resPagar = await fetch(`https://rest.megaerp.online${epPagar}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const dataPagar = await resPagar.json()

    const resReceber = await fetch(`https://rest.megaerp.online${epReceber}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const dataReceber = await resReceber.json()

    return {
      agente_pesquisado: cod,
      pagar_encontrou: Array.isArray(dataPagar) ? dataPagar.length : (dataPagar?.items?.length || 0),
      receber_encontrou: Array.isArray(dataReceber) ? dataReceber.length : (dataReceber?.items?.length || 0),
      json_bruto_pagar: dataPagar,
      json_bruto_receber: dataReceber
    }
  } catch (e: any) {
    return { error: e.message }
  }
})
