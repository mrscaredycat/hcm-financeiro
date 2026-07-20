import { getMegaConnection } from '#imports'
import oracledb from 'oracledb'

export default defineEventHandler(async (event) => {
  let connection

  try {
    const queryParams = getQuery(event)
    const agenteId = queryParams.agenteId

    connection = await getMegaConnection()

    // Agrupa por ORG_IN_CODIGO (empresa HCM: 5 = HCM2, 10 = HCM ENGENHARIA)
    const sql = `
      WITH entradas AS (
        SELECT
          ORG_IN_CODIGO,
          SUM(CASE WHEN EXTRACT(MONTH FROM FRE_DT_EMISSAO) = EXTRACT(MONTH FROM SYSDATE)
                    AND EXTRACT(YEAR  FROM FRE_DT_EMISSAO) = EXTRACT(YEAR  FROM SYSDATE)
                   THEN FRE_RE_VALOR ELSE 0 END) AS entradas_mes,
          SUM(FRE_RE_VALOR) AS entradas_total
        FROM MEGA.FIN_FATURARECEBER@HCMENG
        WHERE FRE_DT_EMISSAO <= SYSDATE
        GROUP BY ORG_IN_CODIGO
      ),
      saidas AS (
        SELECT
          ORG_IN_CODIGO,
          SUM(CASE WHEN EXTRACT(MONTH FROM FPA_DT_EMISSAO) = EXTRACT(MONTH FROM SYSDATE)
                    AND EXTRACT(YEAR  FROM FPA_DT_EMISSAO) = EXTRACT(YEAR  FROM SYSDATE)
                   THEN FPA_RE_VALOR ELSE 0 END) AS saidas_mes,
          SUM(FPA_RE_VALOR) AS saidas_total
        FROM MEGA.FIN_FATURAPAGAR@HCMENG
        WHERE FPA_DT_EMISSAO <= SYSDATE
        GROUP BY ORG_IN_CODIGO
      )
      SELECT
        COALESCE(e.ORG_IN_CODIGO, s.ORG_IN_CODIGO)           AS CONTA_AGENTE,
        COALESCE(e.entradas_total, 0) - COALESCE(s.saidas_total, 0) AS SALDO_ATUAL,
        COALESCE(e.entradas_mes,   0) - COALESCE(s.saidas_mes,   0) AS SALDO_MES,
        COALESCE(e.entradas_mes,   0)                              AS ENTRADAS_MES,
        COALESCE(s.saidas_mes,     0)                              AS SAIDAS_MES
      FROM entradas e
      FULL OUTER JOIN saidas s ON e.ORG_IN_CODIGO = s.ORG_IN_CODIGO
      WHERE 1=1
        ${agenteId ? 'AND COALESCE(e.ORG_IN_CODIGO, s.ORG_IN_CODIGO) = :agenteId' : ''}
    `

    const binds: any = {}
    if (agenteId) binds.agenteId = Number(agenteId)

    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    })

    return {
      success: true,
      data: result.rows || []
    }
  } catch (error) {
    console.error('Erro na consulta:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao consultar o ERP'
    })
  } finally {
    if (connection) {
      await connection.close()
    }
  }
})
