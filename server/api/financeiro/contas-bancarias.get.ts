import { getMegaConnection } from '#imports'
import oracledb from 'oracledb'

// A busca agora é dinâmica baseada na GLO_AGENTES
export default defineEventHandler(async () => {
  let connection

  try {
    connection = await getMegaConnection()

    const result = await connection.execute(
      `SELECT
         g.AGN_IN_CODIGO                 AS ban_numero,
         g.AGN_ST_FANTASIA               AS nome_fantasia,
         g.AGN_ST_NOME                   AS nome_banco,
         COUNT(*)                        AS total_mov,
         SUM(NVL(m.MOV_RE_VALORDEB, 0))  AS total_entradas,
         SUM(NVL(m.MOV_RE_VALORCRE, 0))  AS total_saidas
       FROM MEGA.GLO_AGENTES@HCMENG g
       JOIN MEGA.FIN_MOVIMENTO@HCMENG m ON m.AGN_IN_CODIGO = g.AGN_IN_CODIGO
       WHERE g.AGN_IN_CODIGO IN (
         1001, 1098, 1099, 2534, 2535, 2548, 2558, 6247, 6248, 6249, 
         6253, 6614, 6657, 6658, 6661, 6663, 6664, 6665, 6666, 6667, 
         6880, 6881, 6882, 6883, 6884, 6885, 6886, 6887, 6959, 6960, 
         6971
       )
       GROUP BY g.AGN_IN_CODIGO, g.AGN_ST_NOME, g.AGN_ST_FANTASIA
       ORDER BY g.AGN_ST_NOME`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    const rows = (result.rows || []) as any[]

    return rows.map((r: any) => {
      const codigo = Number(r.BAN_NUMERO)
      const nome = r.NOME_BANCO || `Conta ${codigo}`
      const fantasia = r.NOME_FANTASIA || nome
      return {
        Codigo: codigo,
        NomeBanco: nome,
        NomeFantasia: fantasia,
        QtdMovimentos: Number(r.TOTAL_MOV || 0),
        TotalEntradas: Number(r.TOTAL_ENTRADAS || 0),
        TotalSaidas: Number(r.TOTAL_SAIDAS || 0),
        SaldoAtual: Number(r.TOTAL_ENTRADAS || 0) - Number(r.TOTAL_SAIDAS || 0)
      }
    })
  } catch (error) {
    console.error('[contas-bancarias] Erro ao buscar bancos:', error)
    throw createError({ statusCode: 500, message: String(error) })
  } finally {
    if (connection) await connection.close()
  }
})
