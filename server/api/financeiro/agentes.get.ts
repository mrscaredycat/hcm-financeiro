import { getMegaConnection } from '#imports'
import oracledb from 'oracledb'

export default defineEventHandler(async () => {
  let connection

  try {
    connection = await getMegaConnection()

    // Busca contas financeiras (bancos e caixas da empresa HCM)
    // TPL_ST_SIGLA IS NULL identifica agentes que são contas financeiras reais
    // (excluindo fornecedores financeiros como Banco Volvo, Bradesco Seguros etc.)
    const result = await connection.execute(
      `SELECT AGN_IN_CODIGO, AGN_ST_NOME, AGN_ST_FANTASIA, TPL_ST_SIGLA
       FROM MEGA.GLO_AGENTES@HCMENG
       WHERE (
         UPPER(AGN_ST_NOME) LIKE '%BANCO%' OR
         UPPER(AGN_ST_NOME) LIKE '%CAIXA%' OR
         UPPER(AGN_ST_NOME) LIKE '%BRADESCO%' OR
         UPPER(AGN_ST_NOME) LIKE '%ITAU%' OR
         UPPER(AGN_ST_NOME) LIKE '%SANTANDER%' OR
         UPPER(AGN_ST_NOME) LIKE '%SICOOB%' OR
         UPPER(AGN_ST_NOME) LIKE '%SICREDI%' OR
         UPPER(AGN_ST_NOME) LIKE '%INTER%'
       )
       AND (TPL_ST_SIGLA IS NULL)
       ORDER BY AGN_IN_CODIGO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    const rows = (result.rows || []) as any[]

    return rows.map((r: any) => ({
      Codigo: r.AGN_IN_CODIGO,
      NomeFantasia: r.AGN_ST_FANTASIA || r.AGN_ST_NOME,
      RazaoSocial: r.AGN_ST_NOME,
      TipoAgente: 'Conta Financeira',
      FJ: 'J',
      UF: '',
      Municipio: ''
    }))
  } catch (error) {
    console.error('[agentes] Erro ao buscar contas financeiras:', error)
    throw createError({
      statusCode: 500,
      message: String(error)
    })
  } finally {
    if (connection) await connection.close()
  }
})
