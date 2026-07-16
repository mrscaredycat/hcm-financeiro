import { getMegaConnection } from '#imports'
import oracledb from 'oracledb'

export default defineEventHandler(async (event) => {
  let connection

  try {
    // Lista com os códigos dos bancos
    const bankCodes = [
      1001, 1098, 1099, 2534, 2535, 2548, 2558, 6614, 6657, 6658, 6661, 6663,
      6664, 6665, 6666, 6667, 6886, 6887, 6959, 6960, 6971, 6880, 6881, 6882,
      6883, 6884, 6885, 6247, 6248, 6249, 6253, 6257, 6265, 6266, 6267, 6268,
      6520, 7298, 6890, 7318, 7319, 7320, 7321, 7323, 7403, 7404, 7405, 6576,
      7325, 7066, 6897, 6898, 6899, 6900, 6902, 6903, 6904, 6905, 6906, 6907,
      6908, 6909, 6910, 6911, 6981, 6357, 6272, 6273, 6274, 6275, 6276, 7327,
      7213, 7408, 6606, 7360, 7361, 7409
    ]

    connection = await getMegaConnection()

    // Traz todos os dados dos agentes que estão na sua lista de Contas Financeiras
    const sql = `
      SELECT *
      FROM GLO_AGENTES
      WHERE AGN_IN_CODIGO IN (${bankCodes.join(',')})
    `

    const result = await connection.execute(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    })

    // Mapeia o resultado do Oracle para o formato que a tela index.vue espera
    const contasFinanceiras = (result.rows || []).map((row: any) => {
      // Como não sei o nome exato das colunas de nome e cnpj, pego as variações comuns do Mega
      const nome = row.AGN_ST_NOME || row.NOME || ''
      const fantasia = row.AGN_ST_FANTASIA || row.AGN_ST_NOMEFANTASIA || row.FANTASIA || nome
      const cnpjRaw = row.AGN_ST_CGC || row.AGN_ST_CNPJ || row.CNPJ || ''
      const apenasNumeros = cnpjRaw.replace(/\D/g, '')

      return {
        Codigo: row.AGN_IN_CODIGO || row.CODIGO,
        Nome: nome,
        NomeFantasia: fantasia,
        Cnpj: cnpjRaw,
        TipoAgente: 'ContaFinanceira',
        Tipos: ['ContaFinanceira'],
        FJ: apenasNumeros.length === 14 ? 'J' : (apenasNumeros.length === 11 ? 'F' : 'J'),
        UF: row.AGN_ST_UF || row.UF || '',
        Municipio: row.AGN_ST_MUNICIPIO || row.MUNICIPIO || ''
      }
    })

    // Ordena por código
    const finalResult = contasFinanceiras.sort((a, b) => Number(a.Codigo) - Number(b.Codigo))

    return finalResult
  } catch (error) {
    console.error('Erro ao buscar agentes no banco:', error)
    return []
  } finally {
    if (connection) {
      await connection.close()
    }
  }
})
