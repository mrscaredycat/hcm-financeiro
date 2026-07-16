import { getMegaConnection } from '#imports'
import oracledb from 'oracledb'

export default defineEventHandler(async (event) => {
  // Exemplo de como pegar parâmetros da URL (ex: /api/financeiro/consulta-mega?codigo=123)
  // const queryParams = getQuery(event)

  let connection
  try {
    // 1. Abre a conexão com o banco Oracle
    connection = await getMegaConnection()

    // 2. Coloque o seu SELECT aqui!
    const sql = `
      SELECT 
        *
      FROM SUA_TABELA_AQUI
      WHERE ROWNUM <= 10
    `

    // 3. Executa a consulta
    const result = await connection.execute(
      sql,
      [], // Aqui entram os parâmetros da query (bind variables), se houver
      {
        // IMPORTANTE: Isso faz o Oracle retornar JSON { COLUNA: valor } ao invés de um array cru
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
    )

    // 4. Retorna os dados para a sua página Vue
    return {
      success: true,
      data: result.rows
    }
  } catch (error: any) {
    console.error('[Oracle] Erro ao executar o Select:', error)

    // Retorna o erro formatado para o Nuxt
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao consultar o banco de dados Oracle',
      data: error.message
    })
  } finally {
    // 5. CRÍTICO: Sempre libere a conexão devolvendo pro pool, mesmo se der erro!
    if (connection) {
      try {
        await connection.close()
      } catch (err) {
        console.error('[Oracle] Erro ao fechar a conexão:', err)
      }
    }
  }
})
