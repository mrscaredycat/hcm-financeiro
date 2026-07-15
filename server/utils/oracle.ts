import oracledb from 'oracledb'

/**
 * Inicializa o oracledb em modo thick (Oracle Instant Client).
 *
 * Necessário porque o servidor MEGA usa autenticador de senha legado (NJS-116 / DPY-3015)
 * que o modo thin (Node.js puro) não suporta.
 *
 * O Instant Client é instalado pelo Dockerfile em /opt/oracle/instantclient.
 * O caminho é configurável via variável de ambiente ORACLE_LIB_DIR.
 */
let thickInitialized = false

function ensureThickMode() {
  if (thickInitialized) return
  const libDir = process.env.ORACLE_LIB_DIR ?? '/opt/oracle/instantclient'
  oracledb.initOracleClient({ libDir })
  thickInitialized = true
  console.log(`[Oracle] Modo thick ativado. Instant Client: ${libDir}`)
}

/**
 * Abre uma conexão com o banco Oracle do Mega ERP.
 * Credenciais lidas de MEGA_DB_USER, MEGA_DB_PASSWORD e MEGA_DB_CONNECTION_STRING.
 */
export async function getMegaConnection() {
  const user = process.env.MEGA_DB_USER
  const password = process.env.MEGA_DB_PASSWORD
  const connectString = process.env.MEGA_DB_CONNECTION_STRING

  if (!user || !password || !connectString) {
    throw new Error(
      '[Oracle] Credenciais não configuradas. Verifique MEGA_DB_USER, MEGA_DB_PASSWORD e MEGA_DB_CONNECTION_STRING no .env.'
    )
  }

  ensureThickMode()

  try {
    const connection = await oracledb.getConnection({ user, password, connectString })
    console.log(`[Oracle] ✅ Conectado com sucesso ao banco Oracle! String: ${connectString}`)
    return connection
  } catch (err) {
    console.error('[Oracle] Erro ao conectar no banco do Mega:', err)
    throw err
  }
}

