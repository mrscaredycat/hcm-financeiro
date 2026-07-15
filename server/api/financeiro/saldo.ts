import { getMegaConnection } from '#imports';
import oracledb from 'oracledb';

export default defineEventHandler(async (event) => {
  let connection;

  try {
    connection = await getMegaConnection();

    // Aqui você coloca aquele seu SELECT gigante do PL/SQL
    const query = `
      SELECT 
        NOME_FILIAL, 
        SALDO_ATUAL 
      FROM 
        MGFIN.FIN_SALDOS -- (Exemplo de tabela do Mega)
      WHERE 
        DATA = :dataAtual
    `;

    // Executa a query
    const result = await connection.execute(query, {
      dataAtual: new Date() // Passando parâmetros de forma segura
    }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT // retorna JSON bonitinho
    });

    return result.rows; // Retorna os dados para a sua aplicação

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
