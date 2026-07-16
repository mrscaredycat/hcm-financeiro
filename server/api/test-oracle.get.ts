/**
 * Endpoint de diagnóstico: GET /api/test-oracle
 *
 * Testa a conexão direta com o banco Oracle do Mega ERP.
 * Executa um SELECT simples (SELECT 1 FROM DUAL) para confirmar
 * que as credenciais e o servidor estão acessíveis.
 *
 * NÃO use em produção — remova ou proteja com auth antes de subir.
 */
export default defineEventHandler(async () => {
  const user = process.env.MEGA_DB_USER
  const password = process.env.MEGA_DB_PASSWORD
  const connectString = process.env.MEGA_DB_CONNECTION_STRING

  // 1. Verifica se as variáveis estão configuradas
  if (!user || !password || !connectString) {
    return {
      ok: false,
      etapa: 'configuração',
      erro: 'Variáveis de ambiente não configuradas.',
      variaveis: {
        MEGA_DB_USER: user ? '✅ definido' : '❌ ausente',
        MEGA_DB_PASSWORD: password ? '✅ definido' : '❌ ausente',
        MEGA_DB_CONNECTION_STRING: connectString ? '✅ definido' : '❌ ausente'
      }
    }
  }

  // 2. Tenta abrir a conexão e executar uma query mínima
  let connection: any = null
  try {
    // getMegaConnection é auto-importado pelo Nuxt a partir de server/utils/oracle.ts
    connection = await getMegaConnection()

    const result = await connection.execute('SELECT 1 AS ping FROM DUAL')
    const pingValue = result?.rows?.[0]?.[0]

    return {
      ok: true,
      mensagem: '✅ Conexão Oracle bem-sucedida!',
      servidor: connectString,
      usuario: user,
      ping: pingValue
    }
  } catch (err: any) {
    const msg = err?.message ?? String(err)

    // Dica específica para o erro de autenticação legada
    const dicaDPY3015 = msg.includes('DPY-3015')
      ? ' Este erro indica que o servidor usa autenticação legada. Será necessário usar oracledb em modo thick (com Oracle Instant Client).'
      : ''

    return {
      ok: false,
      etapa: 'conexão Oracle',
      erro: msg + dicaDPY3015,
      servidor: connectString,
      usuario: user
    }
  } finally {
    if (connection) {
      await connection.close().catch(() => {})
    }
  }
})
