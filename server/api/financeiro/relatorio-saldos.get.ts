import { getQuery } from 'h3'
import { getMegaConnection } from '#imports'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const anoStr = (query.ano as string) || new Date().getFullYear().toString()
  const ano = parseInt(anoStr, 10)
  let connection

  try {
    connection = await getMegaConnection()

    // 1. Busca Saldo Anterior para TODOS os agentes
    const anteriorRes = await connection.execute(
      `SELECT
         g.AGN_IN_CODIGO as ban_numero,
         NVL(SUM(m.MOV_RE_VALORDEB - m.MOV_RE_VALORCRE), 0) AS saldo_anterior
       FROM MEGA.GLO_AGENTES@HCMENG g
       JOIN MEGA.FIN_MOVIMENTO@HCMENG m ON m.AGN_IN_CODIGO = g.AGN_IN_CODIGO
       WHERE m.MOV_DT_DATADOCTO < TO_DATE(:anoStr || '-01-01', 'YYYY-MM-DD')
         AND (
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
       GROUP BY g.AGN_IN_CODIGO`,
      { anoStr },
      { outFormat: 4002 /* oracledb.OUT_FORMAT_OBJECT */ }
    )

    // 2. Busca Movimentos Mensais (Entradas e Saídas) para TODOS os agentes
    const mensalRes = await connection.execute(
      `SELECT
         g.AGN_IN_CODIGO as ban_numero,
         g.AGN_ST_NOME as nome_banco,
         EXTRACT(MONTH FROM m.MOV_DT_DATADOCTO) AS mes,
         NVL(SUM(m.MOV_RE_VALORDEB), 0) AS entradas,
         NVL(SUM(m.MOV_RE_VALORCRE), 0) AS saidas
       FROM MEGA.GLO_AGENTES@HCMENG g
       JOIN MEGA.FIN_MOVIMENTO@HCMENG m ON m.AGN_IN_CODIGO = g.AGN_IN_CODIGO
       WHERE EXTRACT(YEAR FROM m.MOV_DT_DATADOCTO) = :ano
         AND (
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
       ORDER BY g.AGN_IN_CODIGO, mes`,
      { ano },
      { outFormat: 4002 /* oracledb.OUT_FORMAT_OBJECT */ }
    )

    const saldosAnteriores = (anteriorRes.rows || []) as any[]
    const saldosMensais = (mensalRes.rows || []) as any[]

    // 3. Estruturar os dados
    const agentesMap: Record<number, any> = {}

    saldosMensais.forEach((row) => {
      const cod = row.BAN_NUMERO
      if (!agentesMap[cod]) {
        agentesMap[cod] = { Codigo: cod, NomeBanco: row.NOME_BANCO, NomeFantasia: row.NOME_BANCO, meses: {}, saldoAnterior: 0 }
      }
      if (row.MES !== null) {
        agentesMap[cod].meses[row.MES] = { entradas: row.ENTRADAS, saidas: row.SAIDAS }
      }
    })

    saldosAnteriores.forEach((row) => {
      const cod = row.BAN_NUMERO
      if (!agentesMap[cod]) {
        agentesMap[cod] = { Codigo: cod, NomeBanco: `Banco ${cod}`, NomeFantasia: `Banco ${cod}`, meses: {}, saldoAnterior: 0 }
      }
      agentesMap[cod].saldoAnterior = row.SALDO_ANTERIOR
    })

    const MESES = [
      'janeiro', 'fevereiro', 'março', 'abril',
      'maio', 'junho', 'julho', 'agosto',
      'setembro', 'outubro', 'novembro', 'dezembro'
    ]

    const result = Object.values(agentesMap).map((ag: any) => {
      const periodos = []
      let saldoAtual = ag.saldoAnterior
      periodos.push({ periodo: 'Anterior', saldoAtual: saldoAtual })

      for (let m = 1; m <= 12; m++) {
        const dadosMes = ag.meses[m] || { entradas: 0, saidas: 0 }
        const saldoMes = dadosMes.entradas - dadosMes.saidas
        saldoAtual += saldoMes
        const ultimoDia = new Date(ano, m, 0).getDate()
        const mesStr = String(m).padStart(2, '0')
        periodos.push({
          periodo: MESES[m - 1],
          dataFechamento: `${ultimoDia}/${mesStr}/${ano}`,
          entradas: dadosMes.entradas,
          saidas: dadosMes.saidas,
          saldoMes,
          saldoAtual
        })
      }
      return { ag: { Codigo: ag.Codigo, NomeBanco: ag.NomeBanco, NomeFantasia: ag.NomeFantasia }, ficha: periodos }
    })

    return result

  } catch (err: any) {
    console.error('Erro no relatorio-saldos:', err)
    return { error: err.message }
  } finally {
    if (connection) {
      try { await connection.close() } catch (e) {}
    }
  }
})
