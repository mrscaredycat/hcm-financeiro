import 'dotenv/config'
import oracledb from 'oracledb'

async function run() {
  const user = process.env.MEGA_DB_USER
  const password = process.env.MEGA_DB_PASSWORD
  const connectString = process.env.MEGA_DB_CONNECTION_STRING

  const isWindows = process.platform === 'win32'
  if (isWindows) {
    const winLibDir = process.env.ORACLE_LIB_DIR_WIN
    if (winLibDir) {
      oracledb.initOracleClient({ libDir: winLibDir })
    } else {
      oracledb.initOracleClient()
    }
  }

  let connection
  try {
    connection = await oracledb.getConnection({ user, password, connectString })

    // Check FIN_CONTACORRENTE
    const res = await connection.execute(`SELECT AGN_IN_CODIGO, AGN_ST_NOME, AGN_ST_FANTASIA, AGN_ST_APELIDO FROM MEGA.GLO_AGENTES@HCMENG WHERE AGN_IN_CODIGO IN (2558, 6881)`)
    console.log(res.rows)
  } catch (err) {
    console.error(err)
  } finally {
    if (connection) await connection.close()
  }
}

run()
