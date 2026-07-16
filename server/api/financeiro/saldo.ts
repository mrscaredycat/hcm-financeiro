import { getMegaConnection } from '#imports';
import oracledb from 'oracledb';

export default defineEventHandler(async (event) => {
  let connection;

  try {
    // Pega o ID do agente (conta bancária) que vier da URL (ex: /api/financeiro/saldo?agenteId=1001)
    const queryParams = getQuery(event);
    const agenteId = queryParams.agenteId;

    connection = await getMegaConnection();

    // Query definitiva que junta Recebimentos (Entradas) e Pagamentos (Saídas)
    // Calcula os saldos totais (histórico completo) e do mês atual, agrupados por agente.
    const sql = `
      WITH entradas AS (
        SELECT 
          AGN_IN_CODIGO,
          SUM(CASE WHEN EXTRACT(MONTH FROM FRE_DT_EMISSAO) = EXTRACT(MONTH FROM SYSDATE) 
                    AND EXTRACT(YEAR FROM FRE_DT_EMISSAO) = EXTRACT(YEAR FROM SYSDATE) 
                   THEN FRE_RE_VALOR ELSE 0 END) AS entradas_mes,
          SUM(FRE_RE_VALOR) AS entradas_total
        FROM FIN_FATURARECEBER
        WHERE FRE_DT_EMISSAO <= SYSDATE
        GROUP BY AGN_IN_CODIGO
      ),
      saidas AS (
        SELECT 
          AGN_IN_CODIGO,
          SUM(CASE WHEN EXTRACT(MONTH FROM FPA_DT_EMISSAO) = EXTRACT(MONTH FROM SYSDATE) 
                    AND EXTRACT(YEAR FROM FPA_DT_EMISSAO) = EXTRACT(YEAR FROM SYSDATE) 
                   THEN FPA_RE_VALOR ELSE 0 END) AS saidas_mes,
          SUM(FPA_RE_VALOR) AS saidas_total
        FROM FIN_FATURAPAGAR
        WHERE FPA_DT_EMISSAO <= SYSDATE
        GROUP BY AGN_IN_CODIGO
      )
      SELECT 
        COALESCE(e.AGN_IN_CODIGO, s.AGN_IN_CODIGO) AS CONTA_AGENTE,
        COALESCE(e.entradas_total, 0) - COALESCE(s.saidas_total, 0) AS SALDO_ATUAL,
        COALESCE(e.entradas_mes, 0) - COALESCE(s.saidas_mes, 0) AS SALDO_MES,
        COALESCE(e.entradas_mes, 0) AS ENTRADAS_MES,
        COALESCE(s.saidas_mes, 0) AS SAIDAS_MES
      FROM entradas e
      FULL OUTER JOIN saidas s ON e.AGN_IN_CODIGO = s.AGN_IN_CODIGO
      WHERE 1=1
        ${agenteId ? 'AND COALESCE(e.AGN_IN_CODIGO, s.AGN_IN_CODIGO) = :agenteId' : ''}
    `;

    // Parâmetros dinâmicos
    const binds: any = {};
    if (agenteId) binds.agenteId = Number(agenteId);

    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT 
    });

    // Retorna a lista de contas/agentes (ou apenas 1 se passar o agenteId na URL)
    return {
      success: true,
      data: result.rows || []
    };

  } catch (error) {
    console.error("Erro na consulta:", error);
    throw createError({
      statusCode: 500,
      message: "Erro ao consultar o ERP"
    });
  } finally {
    // SEMPRE fechar a conexão no final
    if (connection) {
      await connection.close();
    }
  }
});
