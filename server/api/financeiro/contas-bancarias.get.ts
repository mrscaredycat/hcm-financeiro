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
         g.AGN_ST_NOME                   AS nome_banco,
         COUNT(*)                        AS total_mov,
         SUM(NVL(m.MOV_RE_VALORDEB, 0))  AS total_entradas,
         SUM(NVL(m.MOV_RE_VALORCRE, 0))  AS total_saidas
       FROM MEGA.GLO_AGENTES@HCMENG g
       JOIN MEGA.FIN_MOVIMENTO@HCMENG m ON m.AGN_IN_CODIGO = g.AGN_IN_CODIGO
       WHERE (
         UPPER(g.AGN_ST_NOME) LIKE '%BANCO%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%CAIXA%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%BRADESCO%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%ITAU%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%ITAÚ%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%SANTANDER%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%BB %' OR
         UPPER(g.AGN_ST_NOME) LIKE '%SICOOB%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%SICREDI%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%FATURAMENTO DIRETO%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%TRANSITÓRIA%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%COFINS%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%CSLL%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%ICMS%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%INSS%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%IPI%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%IRRF%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%ISS%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%PIS%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%FGTS%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%INTER%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%PAYFY%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%BRB%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%CEF%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%CARTÃO%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%RENDE FÁCIL%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%CDB%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%CONTA APLICAÇÃO%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%BTG%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%CONTA GLOBAL%' OR
         UPPER(g.AGN_ST_NOME) LIKE '%ADIANTAMENTOS%'
       )
       GROUP BY g.AGN_IN_CODIGO, g.AGN_ST_NOME
       ORDER BY g.AGN_ST_NOME`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    const rows = (result.rows || []) as any[]

    return rows.map((r: any) => {
      const codigo = Number(r.BAN_NUMERO)
      const nome = r.NOME_BANCO || `Conta ${codigo}`
      return {
        Codigo: codigo,
        NomeBanco: nome,
        NomeFantasia: nome,
        QtdMovimentos: Number(r.TOTAL_MOV || 0),
        TotalEntradas: Number(r.TOTAL_ENTRADAS || 0),
        TotalSaidas: Number(r.TOTAL_SAIDAS || 0)
      }
    })
  } catch (error) {
    console.error('[contas-bancarias] Erro ao buscar bancos:', error)
    throw createError({ statusCode: 500, message: String(error) })
  } finally {
    if (connection) await connection.close()
  }
})
