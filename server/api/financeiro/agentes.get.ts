import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  // Não precisa mais de filial!

  // Lista HARDCODED com os códigos dos bancos (Conta Financeira)
  // Adicionei os que identificamos nos testes e os da sua imagem!
  const bankCodes = [
    // Lote 1 (Testes + Primeira Imagem)
    1001, 1098, 1099, 2534, 2535, 2548, 2558, 6614, 6657, 6658, 6661, 6663, 
    6664, 6665, 6666, 6667, 6886, 6887, 6959, 6960, 6971, 6880, 6881, 6882, 
    6883, 6884, 6885, 6247, 6248, 6249, 6253, 6257, 6265, 6266, 6267, 6268, 
    6520, 7298, 6890, 7318, 7319, 7320, 7321,
    // Lote 2 (Segunda Imagem)
    7323, 7403, 7404, 7405, 6576, 7325, 7066, 6897, 6898, 6899, 6900, 6902, 
    6903, 6904, 6905, 6906, 6907, 6908, 6909, 6910, 6911, 6981, 6357, 6272, 
    6273, 6274, 6275, 6276, 7327, 7213, 7408, 6606, 7360, 7361, 7409
  ]

  const contasFinanceiras: any[] = []
  const PREFIXO = '1'

  console.log(`[Agentes API] Buscando ${bankCodes.length} agentes ContaFinanceira via hardcode...`)

  // Faz as requisições em paralelo direto para o globalagente usando 1-CODIGO
  await Promise.all(bankCodes.map(async (cod) => {
    try {
      const id = `${PREFIXO}-${cod}`
      const r = await fetchExternalApi(`/api/globalagente/Agente/${id}?expand=tipos`)
      
      if (r.ok) {
        const d = await r.json()
        const tipos: string[] = (d.tipos || []).map((t: any) => t.tipo || t.Tipo)
        
        // Retorna mesmo que a Mega não tenha retornado o "tipos" perfeitamente,
        // já que confiamos na lista hardcoded.
        const cnpjRaw = (d.cnpj ?? '').replace(/\D/g, '')
        contasFinanceiras.push({
          Codigo: d.codigo,
          Nome: d.nome ?? '',
          NomeFantasia: d.nomeFantasia ?? d.nome ?? '',
          Cnpj: d.cnpj ?? '',
          TipoAgente: 'ContaFinanceira',
          Tipos: tipos.length > 0 ? tipos : ['ContaFinanceira'],
          FJ: cnpjRaw.length === 14 ? 'J' : (cnpjRaw.length === 11 ? 'F' : 'J'),
          UF: '',
          Municipio: '',
          IdOriginal: id
        })
      }
    } catch (e) {
      // Falhas individuais são ignoradas para não quebrar o resto
    }
  }))

  // Ordena por código
  const result = contasFinanceiras.sort((a, b) => Number(a.Codigo) - Number(b.Codigo))
  
  console.log(`[Agentes API] Finalizado. Retornando ${result.length} contas financeiras.`)

  return result
})
