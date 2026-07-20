import { getMegaConnection } from '#imports'
import oracledb from 'oracledb'
import { getQuery } from 'h3'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const banNumero = parseInt(query.banNumero as string)
  const ano = parseInt(query.ano as string) || new Date().getFullYear()

  if (isNaN(banNumero)) {
    throw createError({ statusCode: 400, message: 'Parâmetro "banNumero" é obrigatório (código BACEN do banco).' })
  }

  let connection

  try {
    connection = await getMegaConnection()

    // 1. Saldo anterior (acumulado antes do ano selecionado)
    const anteriorRes = await connection.execute(
      `SELECT NVL(SUM(m.MOV_RE_VALORCRE - m.MOV_RE_VALORDEB), 0) AS saldo_anterior
       FROM MEGA.FIN_MOVIMENTO@HCMENG m
       WHERE m.AGN_IN_CODIGO = :banNumero
         AND m.MOV_DT_DATADOCTO < TO_DATE(:anoStr || '-01-01', 'YYYY-MM-DD')`,
      { banNumero, anoStr: String(ano) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    const saldoAnterior = Number((anteriorRes.rows as any[])[0]?.SALDO_ANTERIOR || 0)

    // 2. Movimentos mensais do ano selecionado
    const mensalRes = await connection.execute(
      `SELECT
         EXTRACT(MONTH FROM m.MOV_DT_DATADOCTO) AS mes,
         NVL(SUM(m.MOV_RE_VALORCRE), 0)          AS entradas,
         NVL(SUM(m.MOV_RE_VALORDEB), 0)          AS saidas
       FROM MEGA.FIN_MOVIMENTO@HCMENG m
       WHERE m.AGN_IN_CODIGO = :banNumero
         AND EXTRACT(YEAR FROM m.MOV_DT_DATADOCTO) = :ano
       GROUP BY EXTRACT(MONTH FROM m.MOV_DT_DATADOCTO)
       ORDER BY mes`,
      { banNumero, ano },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    const mensal = (mensalRes.rows || []) as any[]

    // 3. Monta a ficha financeira (Anterior + 12 meses)
    let saldoAtual = saldoAnterior
    const periodos: any[] = []

    periodos.push({
      periodo: 'Anterior',
      entradas: 0,
      saidas: 0,
      saldoMes: 0,
      saldoAtual: saldoAnterior
    })

    for (let m = 1; m <= 12; m++) {
      const row = mensal.find((r: any) => Number(r.MES) === m)
      const entradas = Number(row?.ENTRADAS || 0)
      const saidas = Number(row?.SAIDAS || 0)
      const saldoMes = entradas - saidas
      saldoAtual += saldoMes

      periodos.push({
        periodo: MESES[m - 1],
        entradas,
        saidas,
        saldoMes,
        saldoAtual
      })
    }

    return {
      banNumero,
      ano,
      saldoAnterior,
      periodos
    }
  } catch (error) {
    console.error('[ficha-financeira] Erro:', error)
    throw createError({ statusCode: 500, message: String(error) })
  } finally {
    if (connection) await connection.close()
  }
})
